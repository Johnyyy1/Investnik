import { describe, expect, it } from "vitest";
import { availableLessons } from "@/features/learning/catalog";
import { getGuidedSteps } from "@/features/lessons/steps";
import { getAuthoredLesson } from "@/features/lessons/registry";
import { isQuestion } from "@/features/lessons/question-evaluation";
import { prepareLessonFacts } from "@/features/facts/lesson-facts";
import { factRegistry } from "@/features/facts/registry";
import { studovnaLesson } from "./studovna-model";

const today = "2026-11-13";

describe("Studovna persisted lesson preview", () => {
  it("previews the exact saved step across the entire published catalog", () => {
    for (const next of availableLessons) {
      const { lesson } = prepareLessonFacts(getAuthoredLesson(next.moduleSlug, next.slug)!, factRegistry, { today, published: true });
      getGuidedSteps(lesson).forEach((step, position) => {
        const preview = studovnaLesson({ next, position }, today);
        expect(preview.step).toEqual(step);
        // Facts resolve as on the lesson route: no raw {{token}} in anything /learn can show.
        expect(JSON.stringify(preview), `${next.id} step ${position + 1}`).not.toContain("{{");
      });
    }
  });
  it("withholds the recap while the saved step holds an unanswered question", () => {
    // Demo learner: the worked result of step 5 (+20 % then −20 % gives 96) is step 6's answer.
    const next = availableLessons.find((lesson) => lesson.id === "foundations-risk-reward")!;
    const steps = getGuidedSteps(getAuthoredLesson(next.moduleSlug, next.slug)!);
    const position = steps.findIndex((step) => step.blocks.some((block) => block.type === "numericQuestion" && block.answer === 96));
    expect(position).toBeGreaterThan(0);
    expect(JSON.stringify(studovnaLesson({ next, position }).recap)).not.toMatch(/\b96\b/);
    for (const lesson of availableLessons) {
      getGuidedSteps(getAuthoredLesson(lesson.moduleSlug, lesson.slug)!).forEach((step, index) => {
        const { recap } = studovnaLesson({ next: lesson, position: index });
        if (step.blocks.some(isQuestion)) expect(recap, `${lesson.id} step ${index + 1}`).toEqual([]);
      });
    }
  });
  it("keeps the recap of earlier steps on ungraded steps", () => {
    const next = availableLessons.find((lesson) => lesson.id === "foundations-markets")!;
    const preview = studovnaLesson({ next, position: 4 });
    expect(preview.step.blocks.some(isQuestion)).toBe(false);
    expect(preview.recap.length).toBeGreaterThan(0);
  });
  it("does not show a later question in place of an unfinished concept step", () => {
    const next = availableLessons.find((lesson) => lesson.id === "foundations-markets")!;
    expect(studovnaLesson({ next, position: 1 }).step.blocks.some(isQuestion)).toBe(false);
    expect(studovnaLesson({ next, position: 2 }).step.blocks.find(isQuestion)?.id).toBe("buy-side");
  });
});

