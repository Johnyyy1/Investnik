/**
 * Development-only learner states for direction D. Each is a list of lesson-progress rows, run through the
 * same pure builders as loadLearner and /learn (recommendation, summary, milestones, unlock rule, capital).
 * No database, no session, nothing saved. Completion and milestone status are derived, never written by hand.
 */
export const learnScenarios = [
  { id: "novy", label: "A · Nový učící se", note: "Nic hotového, nic rozpracovaného" },
  { id: "rozpracovano", label: "B · Rozpracovaná lekce", note: "Ukázkový profil: 6 hotových lekcí, otevřená číselná otázka" },
  { id: "vyber", label: "B2 · Otázka s výběrem", note: "5 hotových lekcí, otevřená otázka s možnostmi" },
  { id: "vyklad", label: "B3 · Výklad bez otázky", note: "5 hotových lekcí, uložený krok bez otázky (s rekapitulací)" },
  { id: "modul", label: "C · Hotový modul", note: "Modul 1.1 hotový, nic rozpracovaného" },
  { id: "milnik", label: "C2 · Lekce milníku A hotové", note: "Všech 28 lekcí milníku A, dovednosti a projekt otevřené" },
] as const;
export type LearnScenarioId = (typeof learnScenarios)[number]["id"];
export const isLearnScenario = (value: unknown): value is LearnScenarioId => learnScenarios.some((item) => item.id === value);
