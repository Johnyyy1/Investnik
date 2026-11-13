import { curriculumMapModel } from "@/components/learning/curriculum-map-model";
import { studovnaLesson } from "@/components/learning/studovna-model";
import { demoSeed } from "@/features/demo/seed";
import { getModuleLessons, moduleCatalog } from "@/features/learning/catalog";
import { getLearnerSummary } from "@/features/learning/learner-summary";
import { milestoneStates } from "@/features/milestones/domain";
import { formatPracticeCapitalMinor } from "@/features/rewards/presentation";

// Fixed clock: every load renders the same learner, the demo profile (6 lessons done, 1 in progress).
const NOW = new Date("2026-11-13T09:00:00Z");

/** One learner for all three prototypes, computed by the production builders without a database or session. */
export function learnPrototypeData() {
  const seed = demoSeed(NOW);
  const summary = getLearnerSummary(seed.progress);
  const levels = curriculumMapModel({ ...summary, states: seed.progress });
  const { lesson, step, recap } = studovnaLesson(summary);
  const block = step.blocks.find((item) => item.type === "numericQuestion");
  const learningModule = moduleCatalog.find((item) => item.slug === lesson.moduleSlug)!;
  const moduleLessons = getModuleLessons(learningModule.slug).filter((item) => item.status === "available");
  const ordered = levels.flatMap((level) => level.modules.flatMap((module) => module.lessons.map((item) => ({ ...item, levelId: level.id, moduleTitle: module.title }))));
  const current = ordered.find((item) => item.current)!;
  // Continuity first: what follows the current lesson, not the first gap in the curriculum.
  const upcoming = ordered.slice(ordered.indexOf(current) + 1).filter((item) => !item.done && !["L4", "L5", "L6", "V"].includes(item.levelId)).slice(0, 3);
  const milestones = milestoneStates({
    completions: seed.progress.flatMap((item) => item.completedAt ? [{ lessonId: item.lessonId, completedAt: item.completedAt }] : []),
    attempts: [],
    submissions: [],
  });
  return {
    learnerName: "Demo",
    completedCount: summary.completed.length,
    lessonCount: summary.lessons.length,
    practiceCapital: formatPracticeCapitalMinor(seed.awards.reduce((sum, award) => sum + award.practiceCapitalMinor, 0n)),
    current: {
      id: current.id,
      title: lesson.title,
      displayCode: current.displayCode,
      href: current.href,
      moduleTitle: current.moduleTitle,
      lessonIndex: moduleLessons.findIndex((item) => item.id === lesson.id) + 1,
      moduleLessonCount: moduleLessons.length,
      stepTitle: step.title,
      stepNumber: summary.position + 1,
      stepCount: summary.stepCount,
      minutesLeft: Math.max(1, Math.ceil(lesson.estimatedMinutes * (summary.stepCount - summary.position) / summary.stepCount)),
      question: block && {
        prompt: block.prompt,
        answer: block.answer,
        tolerance: block.tolerance ?? 0,
        unit: block.unit ?? "",
        correctExplanation: block.correctExplanation,
        incorrectExplanation: block.incorrectExplanation,
      },
      recap,
    },
    upcoming,
    levels,
    milestones,
    // Illustrative composition for the prototypes only, labelled as sample data wherever it renders.
    portfolio: [
      { id: "etf", label: "ETF", percent: 58, color: "var(--color-viz-etf)" },
      { id: "equity", label: "Akcie", percent: 34, color: "var(--color-viz-equity)" },
      { id: "cash", label: "Hotovost", percent: 8, color: "var(--color-viz-cash)" },
    ],
  };
}

export type LearnPrototypeData = ReturnType<typeof learnPrototypeData>;
export type PrototypeLevel = LearnPrototypeData["levels"][number];
export type PrototypeLesson = PrototypeLevel["modules"][number]["lessons"][number];
