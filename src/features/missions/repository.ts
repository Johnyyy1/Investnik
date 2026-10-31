import "server-only";
import { isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { learnerArtifact, missionAttempt, portfolio, portfolioTrade, user } from "@/db/schema";
import { readPracticeCapitalEntitlementMinor } from "@/features/rewards/repository";
import { ipsSchema } from "@/features/ips/schema";
import { readTrainingSessions, trainingSetup } from "@/features/training/repository";
import { checkIpsPurchase, checkPlannedIpsPurchase, checkScenario, contributionMonthsWithBuy, completedHistoricalReplays, finishedModelDrill } from "./checks";
import { getMission, isExerciseMission } from "./registry";

type Reader = Pick<typeof db, "select">;
export async function hasCompletedMission(query: Reader, userId: string, missionId: string) {
  const [row] = await query.select({ id: missionAttempt.id }).from(missionAttempt).where(and(eq(missionAttempt.userId, userId), eq(missionAttempt.missionId, missionId), eq(missionAttempt.completed, true))).limit(1);
  return Boolean(row);
}

/** Same owner lock as trades, resets and lesson completion. No portfolio writes or awards. */
export async function verifyMission(userId: string, missionId: string, requestId: string, input?: unknown) {
  const mission = getMission(missionId);
  return db.transaction(async (tx) => {
    const [owner] = await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
    if (!owner) throw new Error("Missing mission owner.");
    if (isExerciseMission(mission)) {
      const result = checkScenario(input);
      const [retry] = await tx.select().from(missionAttempt).where(and(eq(missionAttempt.userId, userId), eq(missionAttempt.missionId, missionId), eq(missionAttempt.requestId, requestId)));
      const evidence = { context: mission.context, check: mission.check, params: mission.params, ...result };
      if (retry) {
        if (!isDeepStrictEqual(retry.evidence, evidence)) throw new Error("Request already belongs to another decision.");
      } else await tx.insert(missionAttempt).values({ id: randomUUID(), userId, missionId, requestId, evidence, completed: result.completed });
      const completed = await hasCompletedMission(tx, userId, missionId);
      return { completed, rules: result.rules, message: !result.completed && completed ? "Tento pokus pravidla nesplňuje. Dřívější ověřené splnění mise zůstává uložené." : result.completed ? "Mise splněna. Server ověřil všechna pravidla scénáře." : "Tento pokus ještě nesplňuje pravidla. Uprav rozložení a zkus to znovu." };
    }
    if (input !== undefined) throw new Error("Personal evidence is server-owned.");
    if (await hasCompletedMission(tx, userId, missionId)) return { completed: true, message: "Mise už je ověřená. Další obchod není potřeba." };
    if (mission.check === "behaviour-crises-v1") {
      const replays = completedHistoricalReplays(await readTrainingSessions(tx, userId), mission.params.scenarios);
      if (replays.length !== mission.params.scenarios.length) return { completed: false, message: `Dokončené historické krize: ${replays.length} ze ${mission.params.scenarios.length}. Potřebuješ období 2008, 2020 a 2022 se skutečnými historickými daty. Ukázková data ani modelová krize je nenahrazují. Pokud data nejsou dostupná, tato mise zůstává rozpracovaná.` };
      const [plan] = await tx.select().from(learnerArtifact).where(and(eq(learnerArtifact.userId, userId), eq(learnerArtifact.kind, "investment_plan"))).orderBy(desc(learnerArtifact.version)).limit(1);
      if (!plan || !ipsSchema.safeParse(plan.payload).success || replays.some(({ session, lastActionAt }) => plan.version <= session.plan.ipsVersion || !lastActionAt || plan.createdAt <= lastActionAt)) return { completed: false, message: "Po dokončení všech tří krizí ulož novou verzi IPS: potvrď nebo uprav pravidlo pro propad a měsíční příspěvek. Nemusíš měnit alokaci ani obchodovat." };
      await tx.insert(missionAttempt).values({ id: randomUUID(), userId, missionId, requestId: "training", completed: true, evidence: { context: mission.context, check: mission.check, params: mission.params, artifactId: plan.id, ipsVersion: plan.version, sessions: replays.map(({ session }) => ({ id: session.id, scenarioId: session.scenarioId, source: session.series.source })) } });
      return { completed: true, message: "Server ověřil tři dokončené historické krize a následně uloženou pojistku v IPS. Výnos ani počet obchodů se nehodnotí." };
    }
    if (mission.check === "crisis-drill-finished-v1") {
      // Reads the isolated training log only. Keeping the plan is recorded, not required: breaking it is a learning experience.
      const sessions = await readTrainingSessions(tx, userId);
      const drill = finishedModelDrill(sessions.map((entry) => ({ ...entry, setup: trainingSetup(entry.session) })), mission.params.scenarioId);
      if (!drill) return { completed: false, message: sessions.some(({ session }) => session.scenarioId === mission.params.scenarioId) ? "Modelovou krizi ještě nemáš dokončenou. Pokračuj v Labu až do posledního měsíce; čekat podle plánu je platné rozhodnutí." : "Zatím nemáš žádnou Modelovou krizi. Spusť ji v Labu podle svého uloženého IPS a projdi všechny měsíce." };
      await tx.insert(missionAttempt).values({ id: randomUUID(), userId, missionId, requestId: "training", completed: true, evidence: { context: mission.context, check: mission.check, params: mission.params, ...drill } });
      return { completed: true, message: drill.planKept ? "Server ověřil dokončenou Modelovou krizi. Prodej mimo pravidla IPS: žádný. Výnos se nehodnotí." : `Server ověřil dokončenou Modelovou krizi. Prodeje mimo pravidla IPS: ${drill.sellsOutsidePlan}. Mise je i tak splněná; v rozboru lekce si projdi, co tě k prodeji vedlo.` };
    }
    if (mission.check === "training-contributions-v1") {
      // Training sessions are isolated: only their append-only action log is read, nothing is written there.
      const sessions = await readTrainingSessions(tx, userId);
      if (!sessions.length) return { completed: false, message: "Zatím nemáš žádný krizový nácvik. Spusť ho v Labu podle svého uloženého plánu." };
      const best = sessions.map(({ session, state }) => ({ session, months: contributionMonthsWithBuy(state) })).reduce((a, b) => b.months > a.months ? b : a);
      if (best.months >= mission.params.months) {
        await tx.insert(missionAttempt).values({ id: randomUUID(), userId, missionId, requestId: "training", completed: true, evidence: { context: mission.context, check: mission.check, params: mission.params, sessionId: best.session.id, ipsVersion: best.session.plan.ipsVersion, contributionMinor: best.session.plan.contributionMinor, months: best.months } });
        return { completed: true, message: `Mise splněna. Server ověřil ${best.months} měsíců s příspěvkem z plánu a nákupem.` };
      }
      if (sessions.every(({ session }) => BigInt(session.plan.contributionMinor) <= 0n)) return { completed: false, message: "Tvůj plán má nulový měsíční příspěvek. Nastav ho v IPS a spusť nový nácvik." };
      return { completed: false, message: `Zatím ${best.months} z ${mission.params.months} měsíců s příspěvkem a nákupem ve stejném měsíci. Pokračuj v nácviku; výnos se nehodnotí.` };
    }
    const earned = await readPracticeCapitalEntitlementMinor(tx, userId);
    if (earned === 0n) return { completed: false, message: "Zatím nemáš cvičný kapitál. Vrať se k učení; další obchod teď není potřeba." };
    const [plan] = await tx.select().from(learnerArtifact).where(and(eq(learnerArtifact.userId, userId), eq(learnerArtifact.kind, "investment_plan"))).orderBy(desc(learnerArtifact.version)).limit(1);
    if (!plan) return { completed: false, message: "Nejdřív ulož IPS s konkrétním ETF. Samotný název fondu v poznámce nestačí." };
    const target = ipsSchema.safeParse(plan.payload);
    if (!target.success || !target.data.allocation.lines.some((line) => "instrumentId" in line)) return { completed: false, message: "Nejdřív ulož IPS s konkrétními instrumenty. Samotná třída aktiv ani název fondu v poznámce nestačí." };
    if (mission.check === "ips-etf-purchase-v2" && BigInt(target.data.contribution.amountMinor) === 0n) return { completed: false, message: "V IPS máš nulový příspěvek. Neobchoduj kvůli misi; vrať se k plánu a učení. Pokračuj, až bude cvičný nákup odpovídat tvému plánu a hotovosti." };
    const trades = await tx.select({ id: portfolioTrade.id, instrumentId: portfolioTrade.instrumentId, instrumentAssetType: portfolioTrade.instrumentAssetType, side: portfolioTrade.side, executedAt: portfolioTrade.executedAt, cashDeltaBaseMinor: portfolioTrade.cashDeltaBaseMinor }).from(portfolioTrade).innerJoin(portfolio, eq(portfolio.id, portfolioTrade.portfolioId)).where(eq(portfolio.userId, userId)).orderBy(portfolioTrade.executedAt, portfolioTrade.id);
    const planned = mission.check === "ips-etf-purchase-v2" ? checkPlannedIpsPurchase(plan.payload, plan.createdAt, trades) : undefined;
    const trade = mission.check === "ips-etf-purchase-v2" ? planned?.trade : checkIpsPurchase(plan.payload, plan.createdAt, trades);
    if (trade) {
      await tx.insert(missionAttempt).values({ id: randomUUID(), userId, missionId, requestId: "personal", completed: true, evidence: { context: mission.context, check: mission.check, params: mission.params, artifactId: plan.id, tradeId: trade.id, ...(planned ? { targetMinor: planned.targetMinor.toString(), toleranceMinor: planned.toleranceMinor.toString(), spentMinor: (-planned.trade.cashDeltaBaseMinor).toString() } : {}) } });
      return { completed: true, message: "Mise splněna. Server ověřil cvičný nákup ETF uvedeného v uloženém IPS." };
    }
    return { completed: false, message: mission.check === "ips-etf-purchase-v2" ? "Zatím chybí nákup ETF po uložení IPS za jeho podíl měsíčního příspěvku. Celkový úbytek hotovosti včetně nákladů musí být v toleranci ±1 %. Ověř částku v přehledu; nenavyšuj riziko ani počet obchodů kvůli misi." : "Zatím chybí cvičný nákup ETF z konkrétního mixu IPS po jeho uložení. Prodej, výnos ani počet dalších obchodů se nehodnotí." };
  });
}
