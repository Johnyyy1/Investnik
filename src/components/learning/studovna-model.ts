import type { loadLearner } from "@/features/learning/load-learner";
import { prepareLessonFacts } from "@/features/facts/lesson-facts";
import { factRegistry } from "@/features/facts/registry";
import { factToday } from "@/features/facts/resolve";
import { getAuthoredLesson } from "@/features/lessons/registry";
import { isQuestion } from "@/features/lessons/question-evaluation";
import { getGuidedSteps } from "@/features/lessons/steps";
import type { LessonBlock } from "@/features/lessons/types";

export type LearnerSummary = Awaited<ReturnType<typeof loadLearner>>;

/** Curriculum labels shared by Studovna and Pokrok. */
export const chapterTitle = (chapter: { slug: string; title: string }) => chapter.slug === "returns" ? "Výnosy" : chapter.title;

export function blockDescription(block: LessonBlock): string | undefined {
  if ("content" in block) return block.content;
  if (block.type === "heading") return block.body;
  if (block.type === "interactiveFigure") return block.description;
  if (block.type === "workedExample") return block.conclusion;
  return undefined;
}

/** The preview is always the persisted cursor, never a later exercise. Facts resolve exactly as on the lesson route,
 * so no raw {{token}} reaches /learn and both pages agree on the date. */
export function studovnaLesson(summary: Pick<LearnerSummary, "next" | "position">, today = factToday()) {
  const { lesson } = prepareLessonFacts(getAuthoredLesson(summary.next.moduleSlug, summary.next.slug)!, factRegistry, { today, published: true });
  const steps = getGuidedSteps(lesson);
  const step = steps[summary.position];
  // An earlier step can state the result the open question asks for (a worked example's conclusion).
  const recap = step.blocks.some(isQuestion) ? [] : steps.slice(0, summary.position).flatMap((item) => item.blocks)
    .filter((block) => ["conceptCallout", "paragraph", "heading", "takeaway", "interactiveFigure"].includes(block.type))
    .filter((block) => blockDescription(block)).slice(-2)
    .map((block) => ({ title: "title" in block ? block.title : "Už znáš souvislosti", body: blockDescription(block)! }));
  return { lesson, step, recap };
}
