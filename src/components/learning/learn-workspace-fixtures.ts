import { demoSeed } from "@/features/demo/seed";
import { availableLessons } from "@/features/learning/catalog";
import { getDisplayModulePlacements } from "@/features/learning/curriculum";
import { getLearnerSummary, type LearnerState } from "@/features/learning/learner-summary";
import { getStepDefinitions } from "@/features/lessons/steps";
import { milestoneStates } from "@/features/milestones/domain";
import { milestoneANavigation } from "@/features/milestones/navigation";
import { recommendLearning } from "@/features/personalization/recommendation";
import { evaluateUnlock, PORTFOLIO_LAB_UNLOCK_CAPITAL_MINOR, PORTFOLIO_LAB_UNLOCK_ID } from "@/features/progression/unlocks";
import { LESSON_XP } from "@/features/gamification/domain";
import { getPracticeCapitalSummary, lessonReward } from "@/features/rewards/practice-capital";
import { learnWorkspaceModel } from "./learn-workspace-model";

/** Test fixtures: learner states as progress rows, run through the same pure builders as loadLearner and /learn. */
export const learnScenarios = ["novy", "rozpracovano", "vyber", "vyklad", "modul", "milnik"] as const;
export type LearnScenarioId = (typeof learnScenarios)[number];

// Fixed clock: every load renders the same learner.
const NOW = new Date("2026-11-13T09:00:00Z");
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);
const completed = (lessonIds: readonly string[]): LearnerState[] => lessonIds.map((lessonId, index) => {
  // Oldest first, so the last id is the most recent completion (the summary resumes from its module).
  const at = minutesAgo((lessonIds.length - index) * 60 * 24);
  return { lessonId, status: "completed", lastPosition: getStepDefinitions(lessonId).length - 1, completedAt: at, updatedAt: at };
});
const inProgress = (lessonId: string, lastPosition: number): LearnerState => ({ lessonId, status: "in_progress", lastPosition, completedAt: null, updatedAt: minutesAgo(30) });
const foundationsStart = ["foundations-why-invest", "foundations-stocks", "foundations-etfs-indexes", "foundations-bonds-cash", "returns-what-is-a-return"];
// From the registry, so a lesson published into 1.1 later keeps this state "module done" (no hard-coded inventory).
const moduleOneOne = getDisplayModulePlacements("1.1").map((placement) => placement.lessonId).filter((lessonId) => availableLessons.some((lesson) => lesson.id === lessonId));

function progressFor(id: LearnScenarioId): LearnerState[] {
  switch (id) {
    case "novy": return [];
    case "rozpracovano": return demoSeed(NOW).progress;
    case "vyber": return [...completed(foundationsStart), inProgress("foundations-markets", 2)];
    case "vyklad": return [...completed(foundationsStart), inProgress("foundations-markets", 4)];
    case "modul": return completed(moduleOneOne);
    case "milnik": return completed(milestoneStates({ completions: [], attempts: [], submissions: [] }).find((state) => state.id === "A")!.lessons.map((lesson) => lesson.id));
  }
}

export function learnScenario(id: LearnScenarioId) {
  const states = progressFor(id);
  const completedIds = new Set(states.filter((state) => state.status === "completed").map((state) => state.lessonId));
  // As loadLearner: the recommendation picks the module the summary falls back to.
  const recommendation = recommendLearning({ progress: states });
  const summary = getLearnerSummary(states, availableLessons.find((lesson) => lesson.id === recommendation.nextLessonId)?.moduleSlug);
  // A regular account (not a demo identity, which is always unlocked). Foundations lessons earn 60 XP each.
  const unlock = evaluateUnlock(PORTFOLIO_LAB_UNLOCK_ID, { totalXp: completedIds.size * LESSON_XP, completedLessonIds: completedIds });
  const awards = [...completedIds].map((lessonId) => ({ lessonId, ...lessonReward(lessonId) }));
  const practiceCapital = getPracticeCapitalSummary(awards, unlock.unlocked ? [PORTFOLIO_LAB_UNLOCK_CAPITAL_MINOR] : []);
  const evidence = { completions: states.flatMap((state) => state.completedAt ? [{ lessonId: state.lessonId, completedAt: state.completedAt }] : []), attempts: [], submissions: [] };
  const milestones = milestoneStates(evidence).map((state) => state.id === "A" ? { ...state, navigation: milestoneANavigation(state, evidence, { hasIps: false, labUnlocked: unlock.unlocked, crisisFinished: false }) } : state);
  return {
    labLocked: !unlock.unlocked,
    workspace: learnWorkspaceModel({ ...summary, states: states.map((state) => ({ ...state, userId: "ukazka" })), recommendation, practiceCapital, personalized: id !== "novy" }, milestones, unlock, NOW.toISOString().slice(0, 10)),
  };
}
