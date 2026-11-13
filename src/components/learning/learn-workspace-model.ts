import { curriculumMapModel } from "@/components/learning/curriculum-map-model";
import { blockDescription, studovnaLesson, type LearnerSummary } from "@/components/learning/studovna-model";
import { isQuestion } from "@/features/lessons/question-evaluation";
import type { LessonBlock } from "@/features/lessons/types";
import type { MilestoneState } from "@/features/milestones/domain";
import { milestoneANextStep } from "@/features/milestones/navigation";
import { contextLabels, reasonLabels, scaffoldLabels } from "@/features/personalization/presentation";
import type { evaluateUnlock } from "@/features/progression/unlocks";
import { formatPracticeCapitalMinor } from "@/features/rewards/presentation";

/**
 * The /learn workspace (direction D). Presentation only: it arranges curriculumMapModel, studovnaLesson,
 * milestoneANextStep and the Portfolio Lab unlock status, and computes nothing new about progress, access or rewards.
 */
export type WorkspaceSummary = Pick<LearnerSummary, "lessons" | "completed" | "next" | "state" | "stepCount" | "position" | "allComplete" | "states" | "recommendation" | "practiceCapital"> & { personalized: boolean };
/** loadPortfolioLabUnlockStatus, which the layout has already awaited (request-memoized): no extra query, no quotes. */
export type WorkspaceLab = Pick<ReturnType<typeof evaluateUnlock>, "unlocked" | "requiresAccount" | "completedPrerequisiteLessons" | "requiredPrerequisiteLessons">;

export type InlineQuestion = Extract<LessonBlock, { type: "numericQuestion" | "multipleChoiceQuestion" }>;
export type RailStatus = "done" | "started" | "todo";
export type RailLesson = { id: string; title: string; href: string; status: RailStatus; current: boolean; summary: string; minutes: number; moduleTitle: string };
export type RailModule = { code: string; title: string; lessons: RailLesson[]; folded: RailLesson[] };
export type RailLevel = { id: string; code: string; title: string; completed: number; total: number; current: boolean; optional: boolean; modules: RailModule[] };

export const railStatusLabels: Record<RailStatus, string> = { done: "Hotovo", started: "Rozpracováno", todo: "Nezačato" };

/** Czech vocalizes „z“ before a numeral spoken with s/z: „ze 7“ (sedmi), „z 9“ (devíti). Covers the counts used here. */
export const outOf = (count: number) => /^(7|17|7\d)$/.test(String(count)) ? "ze\u00a0" : "z\u00a0";
/** Folded rows only exist for two or more lessons, so the singular never occurs. */
export const doneLessons = (count: number) => `${count}\u00a0${count < 5 ? "hotové lekce" : "hotových lekcí"}`;

/** `today` is the fact calendar date; studovnaLesson defaults it to factToday(), as the lesson route does. */
export function learnWorkspaceModel(summary: WorkspaceSummary, milestones: readonly MilestoneState[], lab: WorkspaceLab, today?: string) {
  const map = curriculumMapModel(summary);
  const status = (lesson: { done: boolean; active: boolean }): RailStatus => lesson.done ? "done" : lesson.active ? "started" : "todo";
  const levels: RailLevel[] = map.map((level) => ({
    id: level.id, code: level.code, title: level.title, completed: level.completed, total: level.total, current: level.current, optional: level.optional,
    modules: level.modules.map((module) => {
      const lessons = module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, href: lesson.href, status: status(lesson), current: lesson.current, summary: lesson.summary, minutes: lesson.estimatedMinutes, moduleTitle: module.title }));
      // Finished lessons fold into one row so the open level shows where the learner is, not 10 checkmarks.
      const finished = lessons.filter((lesson) => lesson.status === "done" && !lesson.current);
      return { code: module.code, title: module.title, folded: finished.length > 1 ? finished : [], lessons: finished.length > 1 ? lessons.filter((lesson) => !finished.includes(lesson)) : lessons };
    }),
  }));
  const placed = map.flatMap((level) => level.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, optional: level.optional, moduleCode: module.code, moduleTitle: module.title }))));
  const ordered = placed.filter((lesson) => !lesson.optional);

  const milestoneA = milestones.find((state) => state.id === "A");
  const lessonsRequirement = milestoneA?.requirements.find((item) => item.kind === "lessons");
  const openRequirements = milestoneA?.requirements.filter((item) => item.kind !== "lessons" && item.status !== "done") ?? [];
  // Same rule as StudovnaPage: finished milestone lessons replace the lesson with the next requirement.
  const milestoneMode = summary.allComplete || lessonsRequirement?.status === "done";

  const { lesson, step, recap } = studovnaLesson(summary, today);
  const current = placed.find((item) => item.id === lesson.id);
  const gradedBlocks = step.blocks.filter(isQuestion);
  const graded = gradedBlocks.length > 0;
  // Inline only when it is the step's sole graded block: the server moves the cursor only if every one is correct.
  const question = gradedBlocks.length === 1 ? gradedBlocks.find((block): block is InlineQuestion => block.type === "numericQuestion" || block.type === "multipleChoiceQuestion") : undefined;
  const resuming = summary.state?.status === "in_progress";
  const lastDone = summary.completed.length ? [...summary.states].filter((state) => state.status === "completed").sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))[0] : undefined;
  const lastModule = lastDone && map.flatMap((level) => level.modules).find((module) => module.lessons.some((item) => item.id === lastDone.lessonId));
  // „Potom“ follows the required path only; a continuation in an optional level has none.
  const after = current && !current.optional ? ordered.slice(ordered.indexOf(current) + 1).find((item) => !item.done) : undefined;

  const recommended = summary.lessons.find((item) => item.id === summary.recommendation.nextLessonId && item.id !== summary.next.id);

  return {
    rail: { levels: levels.filter((level) => !level.optional), optional: levels.filter((level) => level.optional), completed: summary.completed.length, total: summary.lessons.length },
    focus: milestoneMode && milestoneA
      ? { kind: "milestone" as const, achieved: milestoneA.status === "achieved", title: milestoneA.title, requirements: milestoneA.requirements, next: milestoneANextStep(milestoneA) }
      : {
        kind: "lesson" as const,
        // new: nothing done yet · resume: a saved cursor · next: the following lesson, not started
        status: resuming ? "resume" as const : summary.completed.length ? "next" as const : "new" as const,
        lesson: { id: lesson.id, title: lesson.title, summary: summary.next.summary, href: current?.href ?? `/learn/${summary.next.moduleSlug}/${summary.next.slug}`, moduleTitle: current?.moduleTitle, minutes: lesson.estimatedMinutes, minutesLeft: Math.max(1, Math.ceil(lesson.estimatedMinutes * (summary.stepCount - summary.position) / summary.stepCount)) },
        step: { number: summary.position + 1, count: summary.stepCount, title: step.title, graded,
          // The step's own text only, and never on a graded step: no earlier result can sit beside an open question.
          description: graded ? undefined : step.blocks.map(blockDescription).find(Boolean) },
        question,
        recap: resuming ? recap : [],
        reason: resuming ? undefined : reasonLabels[summary.recommendation.reasonCode],
        finishedModule: !resuming && lastModule?.status === "done" && lastModule.code !== current?.moduleCode ? { code: lastModule.code, title: lastModule.title } : undefined,
      },
    then: milestoneMode || !after ? undefined : { id: after.id, title: after.title, href: after.href, minutes: after.estimatedMinutes },
    milestone: milestoneA && { title: milestoneA.title, achieved: milestoneA.status === "achieved", lessonsDone: lessonsRequirement?.done ?? 0, lessonsTotal: lessonsRequirement?.total ?? 0, open: openRequirements.map((item) => item.kind) },
    // A guest is never unlocked (evaluateUnlock), so saving the account comes before any lesson count.
    lab: lab.requiresAccount ? { state: "guest" as const }
      : lab.unlocked ? { state: "unlocked" as const, capital: formatPracticeCapitalMinor(summary.practiceCapital.earnedPracticeCapitalMinor) }
      : { state: "locked" as const, done: lab.completedPrerequisiteLessons, required: lab.requiredPrerequisiteLessons },
    personalize: !summary.personalized,
    // Study-plan context from the recommendation, kept as a quiet disclosure until decision D7 gives it a home.
    plan: {
      reason: reasonLabels[summary.recommendation.reasonCode],
      context: contextLabels[summary.recommendation.exampleContext],
      scaffold: scaffoldLabels[summary.recommendation.scaffoldLevel],
      split: summary.recommendation.splitLessonAcrossSessions,
      recommended: recommended && { title: recommended.title, href: `/learn/${recommended.moduleSlug}/${recommended.slug}` },
    },
  };
}
export type LearnWorkspace = ReturnType<typeof learnWorkspaceModel>;
export type LessonFocus = Extract<LearnWorkspace["focus"], { kind: "lesson" }>;
export type MilestoneFocus = Extract<LearnWorkspace["focus"], { kind: "milestone" }>;
