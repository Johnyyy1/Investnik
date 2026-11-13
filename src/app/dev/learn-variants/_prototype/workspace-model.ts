import { curriculumMapModel } from "@/components/learning/curriculum-map-model";
import { blockDescription, studovnaLesson, type LearnerSummary } from "@/components/learning/studovna-model";
import { factRegistry } from "@/features/facts/registry";
import { calendarDate, formatFactValue, resolveFact } from "@/features/facts/resolve";
import { isQuestion } from "@/features/lessons/question-evaluation";
import type { LessonBlock } from "@/features/lessons/types";
import type { MilestoneState } from "@/features/milestones/domain";
import { milestoneANextStep } from "@/features/milestones/navigation";
import { reasonLabels } from "@/features/personalization/presentation";
import { formatPracticeCapitalMinor } from "@/features/rewards/presentation";

/**
 * Direction D's view model (the WP-19 spec, kept beside the prototype until it moves to
 * src/components/learning). Presentation only: it reuses curriculumMapModel, studovnaLesson and
 * milestoneANextStep and computes nothing new about progress, access or rewards.
 */
export type WorkspaceSummary = Pick<LearnerSummary, "lessons" | "completed" | "next" | "state" | "stepCount" | "position" | "allComplete" | "states" | "recommendation" | "practiceCapital"> & { personalized: boolean };
/** `unavailable` mirrors /learn's failed portfolio load: say so, never show 0. */
export type WorkspaceLab = { unlocked: boolean; completedPrerequisiteLessons: number; requiredPrerequisiteLessons: number } | "loading" | "unavailable";

export type InlineQuestion = Extract<LessonBlock, { type: "numericQuestion" | "multipleChoiceQuestion" }>;
export type RailStatus = "done" | "started" | "todo";
export type RailLesson = { id: string; title: string; href: string; status: RailStatus; current: boolean; summary: string; minutes: number; moduleTitle: string };
export type RailModule = { code: string; title: string; lessons: RailLesson[]; folded: RailLesson[] };
export type RailLevel = { id: string; code: string; title: string; completed: number; total: number; current: boolean; modules: RailModule[] };

export const railStatusLabels: Record<RailStatus, string> = { done: "Hotovo", started: "Rozpracováno", todo: "Nezačato" };
const optionalLevels = new Set(["L4", "L5", "L6", "V"]);

/** Czech vocalizes „z“ before a numeral spoken with s/z: „ze 7“ (sedmi), „z 9“ (devíti). Covers the counts used here. */
export const outOf = (count: number) => /^(7|17|7\d)$/.test(String(count)) ? "ze " : "z ";
/** Folded rows only exist for two or more lessons, so the singular never occurs. */
export const doneLessons = (count: number) => `${count} ${count < 5 ? "hotové lekce" : "hotových lekcí"}`;

const factToken = /\{\{\s*([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+)\s*\}\}/g;
/** Fact tokens resolve as on the lesson route (prepareLessonFacts: the lesson's asOf, else today). Production /learn
 * shows them raw today (17 of 475 saved-step previews); see LEARN-D-INTEGRATION.md, finding C-2. */
function withFacts<T>(value: T, asOf: string): T {
  if (typeof value === "string") return value.replace(factToken, (_, key: string) => formatFactValue(resolveFact(key, asOf, factRegistry).value)) as T;
  if (Array.isArray(value)) return value.map((item) => withFacts(item, asOf)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withFacts(item, asOf)])) as T;
  return value;
}

/** `today` is the fact calendar date (factToday() in production). */
export function learnWorkspaceModel(summary: WorkspaceSummary, milestones: readonly MilestoneState[], lab: WorkspaceLab, today: string) {
  const map = curriculumMapModel(summary);
  const status = (lesson: { done: boolean; active: boolean }): RailStatus => lesson.done ? "done" : lesson.active ? "started" : "todo";
  const levels: RailLevel[] = map.map((level) => ({
    id: level.id, code: level.code, title: level.title, completed: level.completed, total: level.total, current: level.current,
    modules: level.modules.map((module) => {
      const lessons = module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, href: lesson.href, status: status(lesson), current: lesson.current, summary: lesson.summary, minutes: lesson.estimatedMinutes, moduleTitle: module.title }));
      // Finished lessons fold into one row so the open level shows where the learner is, not 10 checkmarks.
      const finished = lessons.filter((lesson) => lesson.status === "done" && !lesson.current);
      return { code: module.code, title: module.title, folded: finished.length > 1 ? finished : [], lessons: finished.length > 1 ? lessons.filter((lesson) => !finished.includes(lesson)) : lessons };
    }),
  }));
  const ordered = map.filter((level) => !optionalLevels.has(level.id)).flatMap((level) => level.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleCode: module.code, moduleTitle: module.title }))));

  const milestoneA = milestones.find((state) => state.id === "A");
  const lessonsRequirement = milestoneA?.requirements.find((item) => item.kind === "lessons");
  const openRequirements = milestoneA?.requirements.filter((item) => item.kind !== "lessons" && item.status !== "done") ?? [];
  // Same rule as StudovnaPage: finished milestone lessons replace the lesson with the next requirement.
  const milestoneMode = summary.allComplete || lessonsRequirement?.status === "done";

  const preview = studovnaLesson(summary);
  const { lesson, step, recap } = withFacts(preview, calendarDate(preview.lesson.factContext?.asOf ?? today));
  const current = ordered.find((item) => item.id === lesson.id);
  const graded = step.blocks.some(isQuestion);
  const question = step.blocks.find((block): block is InlineQuestion => block.type === "numericQuestion" || block.type === "multipleChoiceQuestion");
  const resuming = summary.state?.status === "in_progress";
  const lastDone = summary.completed.length ? [...summary.states].filter((state) => state.status === "completed").sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))[0] : undefined;
  const lastModule = lastDone && map.flatMap((level) => level.modules).find((module) => module.lessons.some((item) => item.id === lastDone.lessonId));
  const after = current ? ordered.slice(ordered.indexOf(current) + 1).find((item) => !item.done) : undefined;

  return {
    rail: { levels: levels.filter((level) => !optionalLevels.has(level.id)), optional: levels.filter((level) => optionalLevels.has(level.id)), completed: summary.completed.length, total: summary.lessons.length },
    focus: milestoneMode && milestoneA
      ? { kind: "milestone" as const, achieved: milestoneA.status === "achieved", title: milestoneA.title, requirements: milestoneA.requirements, next: milestoneANextStep(milestoneA) }
      : {
        kind: "lesson" as const,
        // new: nothing done yet · resume: a saved cursor · next: the following lesson, not started
        status: resuming ? "resume" as const : summary.completed.length ? "next" as const : "new" as const,
        lesson: { id: lesson.id, title: lesson.title, summary: withFacts(summary.next.summary, today), href: current?.href ?? `/learn/${summary.next.moduleSlug}/${summary.next.slug}`, moduleTitle: current?.moduleTitle, minutes: lesson.estimatedMinutes, minutesLeft: Math.max(1, Math.ceil(lesson.estimatedMinutes * (summary.stepCount - summary.position) / summary.stepCount)) },
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
    lab: lab === "loading" || lab === "unavailable" ? { state: lab } as const
      : lab.unlocked ? { state: "unlocked" as const, capital: formatPracticeCapitalMinor(summary.practiceCapital.earnedPracticeCapitalMinor) }
      : { state: "locked" as const, done: lab.completedPrerequisiteLessons, required: lab.requiredPrerequisiteLessons },
    personalize: !summary.personalized,
  };
}
export type LearnWorkspace = ReturnType<typeof learnWorkspaceModel>;
export type LessonFocus = Extract<LearnWorkspace["focus"], { kind: "lesson" }>;
export type MilestoneFocus = Extract<LearnWorkspace["focus"], { kind: "milestone" }>;
