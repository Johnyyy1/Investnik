import { shiftDate } from "@/features/gamification/domain";
import {
  analyticsDate, buildFunnel, buildLessonDropOff, buildMilestoneAGate, buildWeeklyCohorts, EARLY_RETURN_DAYS, INACTIVE_AFTER_DAYS,
  type LearnerFacts, type LessonProgressFact,
} from "./funnel";
import {
  bigThreeKnowledge, drillBehaviour, DRAWDOWN_SELL_BPS, masteredSkillCounts, masteredSkills, northStar, retention,
  type DrillFacts, type EntryAnswer, type OutcomeAttempt, type OutcomeLearner,
} from "./outcomes";

/** The windows the issue asks for: the last 7 and the last 30 days. */
export const FUNNEL_WINDOWS = [7, 30] as const;

export type FunnelFacts = { learners: readonly LearnerFacts[]; progress: readonly LessonProgressFact[]; visits: readonly { day: string; views: number }[]; acquisition?: readonly { day: string; source: string; views: number }[] };

export function buildFunnelReport(facts: FunnelFacts, now: Date, { weeks = 8 }: { weeks?: number } = {}) {
  return {
    acquisition: FUNNEL_WINDOWS.map((days) => {
      const from = shiftDate(analyticsDate(now), 1 - days);
      const sources = new Map<string, number>();
      for (const row of facts.acquisition ?? []) if (row.day >= from && row.day <= analyticsDate(now)) sources.set(row.source, (sources.get(row.source) ?? 0) + row.views);
      return { days, sources: [...sources].sort(([a], [b]) => a.localeCompare(b)).map(([source, views]) => ({ source, views })) };
    }),
    generatedAt: now.toISOString(),
    funnels: FUNNEL_WINDOWS.map((days) => buildFunnel(facts.learners, facts.visits, days, now)),
    milestoneA: buildMilestoneAGate(facts.learners),
    weeklyCohorts: buildWeeklyCohorts(facts.learners, weeks, now),
    lessonDropOff: buildLessonDropOff(facts.progress, now),
  };
}

export type FunnelReport = ReturnType<typeof buildFunnelReport>;

const percent = new Intl.NumberFormat("cs-CZ", { style: "percent", maximumFractionDigits: 0 });
const share = (value: number | null) => value === null ? "–" : percent.format(value);
const czechDay = (day: string) => { const [year, month, date] = day.split("-"); return `${Number(date)}. ${Number(month)}. ${year}`; };

/** Plain-text table: the first column left-aligned, the rest right-aligned. */
function table(head: readonly string[], rows: readonly (readonly string[])[]) {
  const widths = head.map((cell, column) => Math.max(cell.length, ...rows.map((row) => row[column].length)));
  const line = (row: readonly string[]) => row.map((cell, column) => column === 0 ? cell.padEnd(widths[column]) : cell.padStart(widths[column])).join("  ").trimEnd();
  return [line(head), widths.map((width) => "-".repeat(width)).join("  "), ...rows.map(line)].join("\n");
}

export function formatFunnelReport(report: FunnelReport) {
  const sections = [`Produktový funnel k milníku A · vytvořeno ${report.generatedAt}`, "Jen souhrnné počty. Dny podle pražského kalendáře; smazané účty a hosté v datech nejsou."];
  for (const funnel of report.funnels) {
    const { total, accounts, guests } = funnel.learners;
    sections.push([
      `## Posledních ${funnel.days} dní (${czechDay(funnel.from)} – ${czechDay(funnel.to)}) · začali: ${total} (účty: ${accounts}, hosté: ${guests})`,
      table(["Krok", "Počet", "Z předchozího", "Ze startu"], funnel.steps.map((step) => [step.label, step.count === null ? "nedostupné" : String(step.count), share(step.fromPrevious), share(step.fromStart)])),
      ...funnel.steps.filter((step) => step.note).map((step) => `* ${step.label}: ${step.note}`),
      `Doplňkově, dokud nejsou vedené mise: první cvičný obchod v Labu provedli ${funnel.firstLabTrade}.`,
    ].join("\n"));
  }
  const gate = report.milestoneA;
  sections.push([
    "## Milník A: registrované účty, které ho aspoň jednou splnily (brána S1)",
    `Registrované účty: ${gate.registered} · splnili: ${gate.achieved} · podíl: ${share(gate.share)}`,
    table(["Verze rozsahu", "Splnili", "První splnění"], gate.byScopeVersion.map((scope) => [scope.scopeVersion, String(scope.learners), czechDay(analyticsDate(scope.firstAchievedAt))])),
    "Počítá se první splnění; pozdější rozšíření milníku ho nemaže. Rozsah tvoří jen publikované lekce, takže čísla různých verzí nejsou stejně náročná.",
  ].join("\n"));
  sections.push([
    "## Týdenní kohorty podle týdne založení (pondělí)",
    table(["Týden od", "Noví", "Diagnostika", "1. lekce", "1. výstup", "Milník A", `Návrat ≤ ${EARLY_RETURN_DAYS} d`, "V okně"],
      report.weeklyCohorts.map((cohort) => [czechDay(cohort.week), String(cohort.learners), String(cohort.diagnostic), String(cohort.firstLesson), String(cohort.firstArtifact), String(cohort.milestoneA), String(cohort.returned), String(cohort.returnPending)])),
    "Mise v Labu zatím nemají zdroj dat, proto v kohortách chybí.",
  ].join("\n"));
  sections.push([
    "## Odchody po lekcích (všichni současní učící se)",
    table(["Lekce", "Otevřeli", "Dokončili", "Rozpracováno, opuštěno", "Skončili po lekci"],
      report.lessonDropOff.map((lesson) => [`${lesson.displayCode ?? "mimo kurikulum"} ${lesson.title}`, String(lesson.started), String(lesson.completed), String(lesson.abandoned), String(lesson.stoppedAfter)])),
    `Opuštěno: otevřeno, nedokončeno a ${INACTIVE_AFTER_DAYS} dní beze změny. Skončili po lekci: poslední dokončená lekce a ${INACTIVE_AFTER_DAYS} dní žádná další.`,
  ].join("\n"));
  sections.push("## Příchody podle kanálu (zobrazení, nikoli lidé ani přiřazené registrace)");
  for (const window of report.acquisition) sections.push(`Posledních ${window.days} dní\n` + table(["Zdroj", "Zobrazení"], window.sources.map((row) => [row.source, String(row.views)])));
  return sections.join("\n\n");
}

export type OutcomeFacts = { learners: readonly OutcomeLearner[]; attempts: readonly OutcomeAttempt[]; entry: readonly EntryAnswer[]; drills: readonly DrillFacts[] };

/** Layers the report cannot measure yet, named so a missing number is never read as zero. */
const unavailableOutcomes = [
  "HHI, hotovost nad plánem a soulad s IPS v osobním portfoliu: počítají se každému v Labu z aktuálních cen, report čte jen databázi.",
  "PGR/PLR (prodej ziskových vs. ztrátových pozic): kniha obchodů nemá ceny neprodaných pozic v den prodeje a nácvik má jediný index.",
  "Dotazník reálných kroků 3 a 12 měsíců po milníku A: zatím neexistuje.",
  "A/B testy karet a variant lekcí: zatím neběží žádný experiment.",
];

const bigThreeLabels: Record<string, string> = { "big-three-compounding": "Složené úročení", "big-three-inflation": "Inflace", "big-three-diversification": "Diverzifikace" };

/** All-time learning outcomes (#130): aggregate counts only, JSON-safe. */
export function buildOutcomesReport(facts: OutcomeFacts, now: Date) {
  const counts = masteredSkillCounts(facts.attempts);
  const achievers = facts.learners.filter((learner) => learner.milestoneAAt !== null).map((learner) => learner.key);
  return {
    generatedAt: now.toISOString(),
    northStar: northStar(facts.learners, facts.drills),
    masteredSkills: { milestoneA: masteredSkills(achievers, counts), allLearners: masteredSkills(facts.learners.map((learner) => learner.key), counts) },
    bigThree: bigThreeKnowledge(facts.entry, facts.attempts),
    retention: retention(facts.attempts),
    drill: drillBehaviour(facts.drills),
    unavailable: unavailableOutcomes,
  };
}

export type OutcomesReport = ReturnType<typeof buildOutcomesReport>;

const fraction = (count: number, base: number) => `${count} z ${base} (${share(base ? count / base : null)})`;
const count = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 });
const medianCount = (value: number | null) => value === null ? "–" : count.format(value);
const basisPoints = (value: number | null) => value === null ? "–" : `${percent.format(value / 10_000)}`;

export function formatOutcomesReport(report: OutcomesReport) {
  const star = report.northStar, drill = report.drill;
  return [
    `Výsledky učení · vytvořeno ${report.generatedAt}`,
    "Jen souhrnné počty za celou dobu. Smazané účty a hosté v datech nejsou, demo účty se nepočítají.",
    [
      "## Severka: dodrželi svůj IPS v krizovém nácviku",
      `Splnili milník A: ${star.achievers} · s dokončeným nácvikem: ${star.withDrill} · bez prodeje mimo plán: ${star.keptPlan} (${share(star.share)})`,
      "Počítá se první dokončený nácvik; opakovaný už průběh krize zná. Bez dokončeného nácviku se nepočítá jako neúspěch.",
      `Dovednosti Zvládnuté a výš, medián: milník A ${medianCount(report.masteredSkills.milestoneA.median)} (${report.masteredSkills.milestoneA.learners}) · všichni ${medianCount(report.masteredSkills.allLearners.median)} (${report.masteredSkills.allLearners.learners})`,
    ].join("\n"),
    [
      "## Znalosti: Big Three",
      table(["Otázka", "Vstupní test", "Kontrolní bod Foundations (1. pokus)"], report.bigThree.map((row) => [bigThreeLabels[row.itemId] ?? row.itemId, fraction(row.entry.correct, row.entry.answered), fraction(row.checkpoint.correct, row.checkpoint.answered)])),
      "Skupiny se liší, proto nejde o změřený účinek výuky. Vstupní test je poslední, který učící se vyplnil.",
    ].join("\n"),
    [
      "## Retence: první opakování ve smíšeném kontrolním bodě nebo opakování",
      table(["Od prvního správného", "Ověřeno", "Správně"], report.retention.map((row) => [`po ${row.weeks} týdnech a déle`, String(row.checked), share(row.share)])),
    ].join("\n"),
    [
      "## Chování v krizovém nácviku (první dokončený nácvik)",
      `Učících se: ${drill.learners}`,
      `Bez prodeje mimo plán: ${fraction(drill.keptPlan, drill.learners)}`,
      `Prodali při propadu indexu o ${Number(DRAWDOWN_SELL_BPS) / 100} % a víc: ${fraction(drill.soldInDrawdown, drill.learners)}`,
      `Na konci v pásmu IPS (jen plány s pásmem): ${fraction(drill.allocationWithinPlan.learners, drill.allocationWithinPlan.base)}`,
      `Obrat, medián: ${basisPoints(drill.medianTurnoverBps)} · MWR − TWR, medián: ${basisPoints(drill.medianReturnGapBps)}`,
      "Rozdíl MWR − TWR ukazuje vliv načasování vkladů, sám o sobě nedokazuje chybu v chování.",
    ].join("\n"),
    ["## Zatím neměřeno", ...report.unavailable.map((line) => `* ${line}`)].join("\n"),
  ].join("\n\n");
}
