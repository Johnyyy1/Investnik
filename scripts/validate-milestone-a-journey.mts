/**
 * Honest Milestone A journey on live market data (#477, founder decision of 2026-11-06). One fresh account walks the
 * scope from `milestoneStates` through the app only, in the order Learn presents it: correct answers, an IPS written in
 * the Lab, FMP purchases of a planned ETF, three historical crises on FMP history, the −30 % model drill kept to plan,
 * the mixed checkpoints Learn asks for, and capstone A. The script never writes to the database; it only reads to verify.
 *
 * Licensing: FMP data loads at runtime through the app and is never printed, saved or uploaded by this script. Run it
 * on a disposable database only. Lab orders need a fresh quote, so the U.S. market must be open for the whole run.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chromium, type BrowserContext, type Locator, type Page } from "playwright";
import { finishOnboarding } from "./onboarding-helper.mjs";
import { fillAnswer } from "./lesson-answer-driver.mjs";
import { buildFunnelReport } from "../src/features/analytics/report";
import { loadFunnelFacts } from "../src/features/analytics/repository";
import { prepareLessonFacts } from "../src/features/facts/lesson-facts";
import { factRegistry } from "../src/features/facts/registry";
import { factToday } from "../src/features/facts/resolve";
import { availableLessons } from "../src/features/learning/catalog";
import { correctAnswers } from "../src/features/lessons/answer-keys";
import { isQuestion, type QuestionBlock } from "../src/features/lessons/question-evaluation";
import { getAuthoredLesson } from "../src/features/lessons/registry";
import { getGuidedSteps } from "../src/features/lessons/steps";
import { getMarketSessionSnapshot } from "../src/features/market-data/market-session";
import type { Instrument } from "../src/features/market-data/contracts";
import { isCheckpointModule, mixedCheckpoint } from "../src/features/mastery/domain";
import { capstoneOutcome } from "../src/features/milestones/criteria";
import { milestoneStates } from "../src/features/milestones/domain";
import { capstoneOutputs } from "../src/features/milestones/capstone-output";
import { getCapstone } from "../src/features/milestones/registry";
import { BEHAVIOUR_CRISIS_IDS } from "../src/features/missions/registry";
import { lessonSteps } from "../src/features/progress/transition";
import { PORTFOLIO_LAB_UNLOCK_ID } from "../src/features/progression/unlocks";
import { lessonReward } from "../src/features/rewards/practice-capital";
import { trainingScenarios } from "../src/features/training/scenarios";

const baseURL = process.env.MILESTONE_A_TEST_URL ?? "http://localhost:3197";
const local = (url: string) => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname);
assert.equal(process.env.MILESTONE_A_QA_DISPOSABLE, "1", "Set MILESTONE_A_QA_DISPOSABLE=1: run only against a disposable database.");
assert.ok(process.env.DATABASE_URL && local(process.env.DATABASE_URL) && local(baseURL), "Requires a local app and a local disposable database.");
// The server reads the same settings; the run checks the stored provenance at the end as well.
if (process.env.MARKET_DATA_PROVIDER !== "fmp" || !process.env.FMP_API_KEY?.trim()) throw new Error("The live Milestone A journey needs MARKET_DATA_PROVIDER=fmp and FMP_API_KEY (GitHub secret FMP_API_KEY). Deterministic data cannot pass B.1.1, see docs/issue-477-blocker.md.");
// The Lab executes only on a fresh quote. Its calendar has no ad-hoc closures, so an exchange outage still fails later.
const usMarket = getMarketSessionSnapshot({ assetType: "etf", exchangeMic: "XASE" } as Instrument, new Date());
if (usMarket.state !== "open") throw new Error("The U.S. market is closed now, so Portfolio Lab disables orders by design. Run this journey during regular NYSE hours on a trading day.");

const a = milestoneStates({ completions: [], attempts: [], submissions: [] }).find((state) => state.id === "A")!;
// The server renders lessons with today's facts; resolve them the same way so step titles match.
const lessons = a.lessons.map(({ id }) => {
  const definition = availableLessons.find((lesson) => lesson.id === id)!;
  const { lesson } = prepareLessonFacts(getAuthoredLesson(definition.moduleSlug, definition.slug)!, factRegistry, { today: factToday(), published: true });
  return { id, path: `/learn/${lesson.moduleSlug}/${lesson.slug}`, steps: getGuidedSteps(lesson) };
});
const capstone = getCapstone("capstone-a-v1")!;
const capstoneLesson = capstoneOutputs.find((output) => output.capstoneId === capstone.id)!.lessonId;
// The plan the learner writes: one broad ETF and no cash target. A personal educational choice, not a recommendation.
const PLAN = { symbol: "SPY", exchangeMic: "XASE", contributionCzk: 5000 };

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const funnel = async () => buildFunnelReport(await loadFunnelFacts(drizzle({ client: sql })), new Date()).milestoneA;
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || "chrome" });
const errors: string[] = [];
let where = "sign-up";
// Never print page text: in the Lab it carries FMP prices.
const czk = (text: string) => Number(text.replace(/[\s\u00a0\u202f]/g, "").match(/(\d+(?:,\d+)?)Kč/)![1].replace(",", "."));

try {
  const funnelBefore = await funnel();
  const context: BrowserContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: "Europe/Prague", reducedMotion: "reduce" });
  context.setDefaultTimeout(60_000);
  context.on("page", (opened) => opened.on("pageerror", (error) => errors.push(`${where}: ${error.message}`)));
  const page = await context.newPage();
  const signup = await page.request.post(`${baseURL}/api/auth/sign-up/email`, { headers: { origin: baseURL }, data: { name: "Milestone A learner", email: `milestone-a-${randomUUID()}@example.com`, password: randomUUID() } });
  assert.ok(signup.ok(), `sign-up failed with HTTP ${signup.status()}`);
  const userId: string = (await signup.json()).user.id;
  await page.goto(`${baseURL}/onboarding`);
  await finishOnboarding(page);

  const button = (target: Page | Locator, name: string) => target.getByRole("button", { name, exact: true });
  const idle = () => page.locator('main[data-save-state="idle"]').waitFor();
  const missionStatus = (text: RegExp) => page.getByText(text).waitFor();
  async function lab(path: string) {
    const tab = await context.newPage();
    await tab.goto(`${baseURL}${path}`);
    // Server-rendered inputs exist before React attaches their handlers.
    await tab.waitForLoadState("networkidle");
    return tab;
  }

  /** Writes or confirms the IPS in the Lab builder. The first version picks the ETF; later ones keep the mix. */
  async function savePlan(reason: string) {
    const tab = await lab("/lab/plan");
    await tab.getByRole("heading", { name: "Můj investiční plán", exact: true }).waitFor();
    const goal = tab.getByLabel("Název cíle 1", { exact: true });
    if (!await goal.inputValue()) {
      await goal.fill("Dlouhodobý majetek na stáří");
      await tab.getByLabel("Účel cíle 1", { exact: true }).selectOption("retirement");
      await tab.getByLabel("Horizont cíle 1 v měsících", { exact: true }).fill("300");
      await tab.getByLabel("Pohotovostní rezerva", { exact: true }).selectOption("ready_for_goal");
      await tab.getByLabel("Drahý dluh", { exact: true }).selectOption("none");
      const search = tab.getByRole("combobox", { name: "Přidat konkrétní instrument" });
      await search.fill(PLAN.symbol);
      const option = tab.getByRole("option").filter({ has: tab.getByText(PLAN.symbol, { exact: true }) }).filter({ hasText: PLAN.exchangeMic });
      const none = tab.getByText("Nic jsme nenašli. Zkus jiný název nebo ticker.", { exact: true });
      await option.or(none).first().waitFor();
      if (await none.isVisible()) throw new Error(`${where}: finding #477 — the IPS builder found no ${PLAN.symbol} on ${PLAN.exchangeMic}, so no IPS can name the ETF that 2.5.3 and capstone A require.`);
      await option.click();
      // FMP results are untyped; the server verifies the type from metadata before the line enters the plan.
      const added = tab.getByRole("heading", { name: `${PLAN.symbol} · `, exact: false }).filter({ hasText: "· ETF" });
      const rejected = tab.getByRole("alert");
      await added.or(rejected).first().waitFor();
      if (await rejected.isVisible()) throw new Error(`${where}: finding #477 — the server did not verify ${PLAN.symbol} as an IPS instrument: ${await rejected.innerText()}`);
      await tab.getByLabel("Váha položky 1 v %", { exact: true }).fill("100");
      await tab.getByLabel("Cílová hotovost v %", { exact: true }).fill("0");
      await tab.getByLabel("Zvolené nástroje a proč (jeden na řádek)", { exact: true }).fill("Široký akciový indexový fond s nízkými náklady");
      await tab.getByLabel("Zvolená platforma nebo co ještě ověřím", { exact: true }).fill("Fiktivní broker z lekce o poplatcích");
      await tab.getByLabel("Měsíční částka v Kč", { exact: true }).fill(String(PLAN.contributionCzk));
      await tab.getByLabel("Den v měsíci (1–28)", { exact: true }).fill("15");
      await tab.getByLabel("Způsob rebalancingu", { exact: true }).selectOption("band");
      await tab.getByLabel("Pásmo odchylky v procentních bodech", { exact: true }).fill("5");
      await tab.getByLabel("Akce při propadu", { exact: true }).selectOption("keep_plan");
      await tab.getByLabel("Co při propadu udělám a co si ověřím", { exact: true }).fill("Neprodám. Pokračuji v příspěvcích a nejdřív si přečtu své cíle a horizont.");
      await tab.getByLabel("Jak často portfolio zkontroluji", { exact: true }).selectOption("quarterly");
      await tab.getByLabel("Měsíc přezkumu celého plánu", { exact: true }).selectOption("10");
    }
    await tab.getByLabel("Proč tento plán ukládám nebo měním", { exact: true }).fill(reason);
    await tab.getByRole("checkbox").check();
    await button(tab, "Uložit verzi plánu").click();
    await tab.getByRole("status").filter({ hasText: /Verze \d+\./ }).waitFor();
    await tab.close();
  }

  /** A buy of the planned ETF in Portfolio Lab sized from the Lab's own review, so the whole order costs about `target` Kč. */
  async function buyPlanned(target: (availableCzk: number) => number, toleranceCzk: (targetCzk: number) => number) {
    const tab = await lab("/lab/portfolio");
    await tab.getByRole("combobox").first().fill(PLAN.symbol);
    await tab.getByRole("option").filter({ has: tab.getByText(PLAN.symbol, { exact: true }) }).filter({ hasText: PLAN.exchangeMic }).click();
    await button(tab, `Koupit ${PLAN.symbol}`).first().click();
    const order = tab.getByRole("dialog", { name: `Investovat do ${PLAN.symbol}` });
    await order.getByRole("heading", { name: "Zvol množství", exact: true }).waitFor();
    if (await order.getByText("Pro investování je potřeba čerstvé tržní pozorování.").isVisible()) throw new Error(`${where}: the quote is not fresh enough to execute (market closed or delayed data).`);
    const goal = target(czk(await order.locator("div").filter({ has: tab.getByText("Dostupná hotovost", { exact: true }) }).locator("dd").innerText()));
    let quantity = 0.01;
    for (let attempt = 0; ; attempt++) {
      await order.getByLabel("Množství", { exact: true }).fill(quantity.toFixed(6));
      await button(order, "Zkontrolovat pokyn").click();
      await order.getByRole("heading", { name: "Zkontroluj investici", exact: true }).waitFor();
      const spent = czk(await order.getByTestId("review-cash-delta").innerText());
      if (Math.abs(spent - goal) <= toleranceCzk(goal)) break;
      assert.ok(attempt < 6, `${where}: the order did not converge on its planned amount`);
      // Fees are nearly proportional above the minimum, so one or two corrections suffice.
      quantity = Math.floor(quantity * goal / spent * 1e6) / 1e6;
      await button(order, "Upravit pokyn").click();
    }
    await button(order, `Potvrdit nákup ${PLAN.symbol}`).click();
    await tab.getByRole("status").filter({ hasText: "Nákup dokončen" }).waitFor();
    await tab.close();
  }

  /** Starts a crisis in the training Lab and plays every month. `keepInvesting` invests each month's plan contribution. */
  async function replay(scenarioId: string, { keepInvesting }: { keepInvesting: boolean }) {
    const tab = await lab("/lab/training");
    const start = button(tab, "Začít nácvik");
    const another = tab.getByRole("button", { name: /^Začít (jiný|nový) nácvik$/ });
    await start.or(another).first().waitFor();
    if (await another.count()) await another.click();
    await tab.getByRole("radio", { name: new RegExp(`^${trainingScenarios.find((scenario) => scenario.id === scenarioId)!.title}`) }).check();
    await start.click();
    await tab.getByRole("heading", { name: "(měsíc 0 z 24)", exact: false }).waitFor();
    const invest = tab.getByRole("button", { name: /^Investovat hotovost/ });
    await invest.click();
    await tab.getByRole("status").getByText(/^Nakoupeno za/).waitFor();
    for (let month = 1; month <= 24; month++) {
      await button(tab, month === 24 ? "Dokončit poslední měsíc" : "Pokračovat na další měsíc").click();
      if (month === 24) break;
      await tab.getByRole("heading", { name: `(měsíc ${month} z 24)`, exact: false }).waitFor();
      if (keepInvesting && await invest.isEnabled()) {
        await invest.click();
        await tab.getByRole("status").getByText(/^Nakoupeno za/).waitFor();
      }
    }
    await tab.getByText("Prodeje mimo pravidla plánu", { exact: true }).waitFor();
    await tab.close();
  }

  async function checkPlan() {
    await button(page, "Zkontrolovat uložený plán").click();
    const [{ version }] = await sql<{ version: number }[]>`select max(version)::int as version from learner_artifact where user_id=${userId} and kind='investment_plan'`;
    await page.getByRole("region", { name: "Stav investičního plánu", exact: true }).getByText(new RegExp(`^Plán je uložený: verze ${version} z `)).waitFor();
  }

  for (const lesson of lessons) {
    await page.goto(`${baseURL}${lesson.path}`);
    for (const [index, step] of lesson.steps.entries()) {
      where = `${lesson.id} step ${index + 1} „${step.title}“`;
      await page.getByRole("heading", { level: 2, name: step.title, exact: true }).waitFor();
      await idle();
      const question = step.blocks.find(isQuestion);
      if (question) {
        await fillAnswer(page, question, correctAnswers(question, { decimalComma: true }));
        await button(page, "Zkontrolovat odpověď").click();
        await page.getByRole("heading", { name: "Správně", exact: true }).waitFor();
      }
      for (const block of step.blocks) {
        if (block.type === "interactiveFigure" && block.figure === "ips-builder" && lesson.id !== "behaviour-behaviour-gap") {
          const [plan] = await sql`select 1 from learner_artifact where user_id=${userId} and kind='investment_plan'`;
          if (!plan) await savePlan("Můj první plán: pravidelně investovat do širokého indexu a v propadu neprodávat.");
          await checkPlan();
        }
        if (block.type === "labMission" && block.missionId === "training-contributions-v1") {
          // Twelve months of the plan's contribution invested in the same month.
          const tab = await lab("/lab/training");
          await tab.getByRole("radio", { name: /^Modelová krize/ }).check();
          await button(tab, "Začít nácvik").click();
          for (let month = 1; month <= 12; month++) {
            await button(tab, "Pokračovat na další měsíc").click();
            await tab.getByRole("heading", { name: `(měsíc ${month} z`, exact: false }).waitFor();
            await tab.getByRole("button", { name: /^Investovat hotovost/ }).click();
            await tab.getByRole("status").getByText(/^Nakoupeno za/).waitFor();
          }
          await tab.close();
          await button(page, "Ověřit misi").click();
          await missionStatus(/^Splněno · Mise splněna\. Server ověřil 12 měsíců/);
        }
        if (block.type === "labMission" && block.missionId === "ips-etf-purchase-v2") {
          // The planned share of one monthly contribution, costs included; the mission accepts ±1 %, aim within ±0.5 %.
          await buyPlanned(() => PLAN.contributionCzk, (goal) => goal * 0.005);
          await button(page, "Ověřit misi").click();
          await missionStatus(/Server ověřil cvičný nákup ETF/);
        }
        if (block.type === "labMission" && (block.missionId === "capstone-a-crisis-v1" || block.missionId === "crisis-drill-model-v1")) {
          await button(page, "Ověřit misi").click();
          const done = page.getByText(/^Splněno · Server ověřil dokončenou Modelovou krizi/);
          const missing = page.getByText(/^(Zatím nemáš žádnou Modelovou krizi|Modelovou krizi ještě nemáš dokončenou)/);
          await done.or(missing).first().waitFor();
          if (await missing.count()) {
            // The −30 % model drill kept to plan: invest each contribution, never sell.
            await replay("model-crisis-v1", { keepInvesting: true });
            await button(page, "Ověřit misi").click();
          }
          await missionStatus(/^Splněno · Server ověřil dokončenou Modelovou krizi\. Prodej mimo pravidla IPS: žádný\./);
        }
        if (block.type === "labMission" && block.missionId === "behaviour-crises-v1") {
          await button(page, "Ověřit misi").click();
          await missionStatus(/^Dokončené historické krize: 0 ze 3/);
          for (const scenarioId of BEHAVIOUR_CRISIS_IDS) await replay(scenarioId, { keepInvesting: false });
          await button(page, "Ověřit misi").click();
          await missionStatus(/^Po dokončení všech tří krizí ulož/);
          await savePlan("Po třech historických krizích potvrzuji pravidlo: v propadu neprodávám a příspěvky posílám dál.");
          await checkPlan();
          await button(page, "Ověřit misi").click();
          await missionStatus(/^Splněno · Server ověřil tři dokončené historické krize/);
        }
        if (block.type === "checklist") {
          const output = page.getByRole("region", { name: block.title, exact: true });
          await output.getByRole("checkbox", { name: block.items[0].label, exact: true }).check();
          await output.getByRole("checkbox", { name: /Souhlasím s uložením/ }).check();
          await output.getByRole("button", { name: "Uložit výstup", exact: true }).click();
          await output.getByText(/^Výstup je uložený\. Verze \d+\.$/).waitFor();
        }
        if (block.type === "rubricSelfAssessment") {
          const isCapstone = lesson.id === capstoneLesson;
          // Before submitting, the learner brings the Lab back to the plan: the cash from later lessons goes into the ETF.
          if (isCapstone) await buyPlanned((available) => available * 0.97, (goal) => goal * 0.01);
          const output = page.getByRole("region", { name: block.title, exact: true });
          await output.getByLabel(block.prompt, { exact: true }).fill(isCapstone
            ? "Portfolio drží ETF z IPS bez hotovosti navíc. V modelové krizi jsem nic neprodal a investoval každý příspěvek. Cítil jsem nutkání prodat; pravidlo z IPS jsem dodržel."
            : "V propadu mám chuť prodat. Pojistka: pravidlo pro propad v IPS a trvalý příkaz po výplatě.");
          for (const criterion of block.criteria) await output.locator("label", { has: page.getByText(`Moje úroveň: ${criterion.label}`, { exact: true }) }).locator("select").selectOption("3");
          await output.getByRole("checkbox", { name: /Souhlasím s uložením/ }).check();
          await output.getByRole("button", { name: "Uložit výstup", exact: true }).click();
          await output.getByText(/^Výstup je uložený\. Verze \d+\.$/).waitFor();
          if (isCapstone) {
            const submissions = await sql<{ auto_criteria: unknown; self_assessment: unknown }[]>`select auto_criteria, self_assessment from capstone_submission where user_id=${userId} and capstone_id=${capstone.id}`;
            assert.equal(submissions.length, 1, "one capstone submission");
            const outcome = capstoneOutcome(capstone, submissions[0].auto_criteria, submissions[0].self_assessment);
            // Statuses and reasons only: the stored values are FMP-derived weights.
            assert.ok(outcome.passed, `capstone A passes its rubric: ${JSON.stringify(outcome.criteria.map(({ criterionId, check, level }) => ({ criterionId, level, status: check?.status, reason: check?.reason })))}`);
          }
        }
      }
      if (index === lesson.steps.length - 1) break;
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => element.textContent === "Pokračovat" && !(element as HTMLButtonElement).disabled));
      await button(page, "Pokračovat").click();
      await idle();
    }
    where = `${lesson.id} completion`;
    await button(page, "Dokončit lekci").click();
    await page.getByRole("heading", { name: "Lekce dokončena", exact: true }).waitFor();
    console.log(`✓ ${lesson.id} (${lesson.steps.length} steps)`);
  }

  // Learn sends the learner to each mixed checkpoint the milestone still needs; the list is not hard-coded here.
  const awardsBeforeCheckpoints = [...await sql`select * from lesson_award where user_id=${userId} order by lesson_id`];
  const visited: string[] = [];
  for (;;) {
    await page.goto(`${baseURL}/learn`);
    await page.getByRole("heading", { level: 1, name: /^(Co ti zbývá do milníku A|Milník A splněn)$/ }).waitFor();
    const continueLink = page.getByRole("link", { name: "Pokračovat", exact: true });
    const next = await continueLink.count() ? await continueLink.first().getAttribute("href") : null;
    const code = next?.match(/^\/learn\/checkpoint\/(.+)$/)?.[1];
    if (!code) break;
    assert.ok(isCheckpointModule(code) && !visited.includes(code) && visited.length < 10, `unexpected checkpoint route ${next}`);
    where = `checkpoint ${code}`;
    visited.push(code);
    const items = mixedCheckpoint(code, `${userId}:${new Date().toISOString().slice(0, 10)}`);
    await page.goto(`${baseURL}${next}`);
    for (const [index, item] of items.entries()) {
      const question = lessonSteps(item.lessonId).flatMap((step) => step.blocks).find((entry): entry is QuestionBlock => entry.id === item.blockId && isQuestion(entry))!;
      await page.getByRole("heading", { name: `Z lekce ${availableLessons.find((lesson) => lesson.id === item.lessonId)!.title}` }).waitFor();
      await fillAnswer(page, question, correctAnswers(question, { decimalComma: true }));
      await button(page, "Zkontrolovat odpověď").click();
      await button(page, index === items.length - 1 ? "Dokončit checkpoint" : "Další otázka").click();
    }
    await page.getByText(`Správně ${items.length} z ${items.length}.`).waitFor();
    console.log(`✓ mixed checkpoint ${code} (${items.length} questions)`);
  }
  assert.deepEqual(visited, ["1.1", "2.2", "2.3", "2.5"], "Learn asked for exactly the 1.1, 2.2, 2.3 and 2.5 mixed checkpoints");

  where = "milestone A";
  await page.getByRole("heading", { name: "Milník A splněn", level: 1 }).waitFor();
  await page.goto(`${baseURL}/progress`);
  assert.equal(await page.locator('[data-milestone="A"]').getAttribute("data-status"), "achieved");
  const achievements = await sql<{ milestone_id: string; scope_version: string }[]>`select milestone_id, scope_version from milestone_achievement where user_id=${userId}`;
  assert.deepEqual(achievements.map((row) => ({ ...row })), [{ milestone_id: "A", scope_version: a.scopeVersion }], "exactly one achievement row with the current scope version");

  // Provenance: FMP history and executions, never sample data.
  const [crises] = await sql<{ evidence: { sessions: { scenarioId: string; source: { kind: string; sample: boolean; sourceName: string } }[] } }[]>`select evidence from mission_attempt where user_id=${userId} and mission_id='behaviour-crises-v1' and completed`;
  assert.deepEqual(crises.evidence.sessions.map(({ scenarioId, source }) => [scenarioId, source.kind, source.sample, source.sourceName]).sort(), BEHAVIOUR_CRISIS_IDS.map((id) => [id, "history", false, "Financial Modeling Prep"]).sort());
  const trades = await sql<{ instrument_asset_type: string; market_data_is_deterministic: boolean; side: string }[]>`select t.instrument_asset_type, t.market_data_is_deterministic, t.side from portfolio_trade t join portfolio p on p.id=t.portfolio_id where p.user_id=${userId}`;
  assert.ok(trades.length >= 2 && trades.every((trade) => trade.side === "BUY" && trade.instrument_asset_type === "etf" && !trade.market_data_is_deterministic), "live ETF buys only");

  // No reward beyond one receipt per completed lesson at its policy amount and the one Lab unlock grant.
  const awards = await sql<{ lesson_id: string; practice_capital_minor: string }[]>`select lesson_id, practice_capital_minor::text from lesson_award where user_id=${userId} order by lesson_id`;
  assert.deepEqual(awards.map((row) => row.lesson_id), a.lessons.map((lesson) => lesson.id).sort(), "one receipt per scoped lesson, nothing else");
  for (const award of awards) assert.equal(award.practice_capital_minor, lessonReward(award.lesson_id).practiceCapitalMinor.toString(), `${award.lesson_id} receipt amount`);
  assert.deepEqual([...await sql`select * from lesson_award where user_id=${userId} order by lesson_id`], awardsBeforeCheckpoints, "checkpoints and the milestone add no receipt");
  assert.deepEqual((await sql<{ unlock_id: string; practice_capital_minor: string }[]>`select unlock_id, practice_capital_minor::text from progression_unlock where user_id=${userId}`).map((row) => ({ ...row })), [{ unlock_id: PORTFOLIO_LAB_UNLOCK_ID, practice_capital_minor: "500000" }]);

  const funnelAfter = await funnel();
  assert.equal(funnelAfter.achieved, funnelBefore.achieved + 1, "the #355 funnel counts the new achievement");
  const scopeCount = (gate: typeof funnelBefore) => gate.byScopeVersion.find((entry) => entry.scopeVersion === a.scopeVersion)?.learners ?? 0;
  assert.equal(scopeCount(funnelAfter), scopeCount(funnelBefore) + 1, "under the current scope version");
  assert.deepEqual(errors, [], "no browser or hydration errors");
  console.log(`PASS: a fresh learner reached milestone A through the app on live FMP data: ${lessons.length} lessons, three historical crises, the model drill kept to plan, checkpoints ${visited.join(", ")}, capstone A; one achievement row (scope ${a.scopeVersion}), counted by the funnel, no extra reward.`);
} catch (error) {
  console.error(`Failed at ${where}`);
  throw error;
} finally {
  await browser.close();
  await sql.end();
}
