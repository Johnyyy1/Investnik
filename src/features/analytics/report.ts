import { shiftDate } from "@/features/gamification/domain";
import {
  analyticsDate, buildFunnel, buildLessonDropOff, buildMilestoneAGate, buildWeeklyCohorts, EARLY_RETURN_DAYS, INACTIVE_AFTER_DAYS,
  type LearnerFacts, type LessonProgressFact,
} from "./funnel";

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
