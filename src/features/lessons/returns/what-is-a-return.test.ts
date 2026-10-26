import { describe, expect, it } from "vitest";
import { simpleReturn } from "@/features/finance/returns";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { metricLessonLink } from "@/features/learning/metric-glossary";
import { validateMove } from "@/features/progress/transition";
import { block } from "../lesson-test-support";
import originalLessons from "../published-lessons-v1.json";
import { isQuestion } from "../question-evaluation";
import { getGuidedSteps } from "../steps";
import { whatIsAReturnLesson as lesson } from "./what-is-a-return";

describe("Co je výnos? (3.1.1)", () => {
  it("preserves the published identity, nine steps and question positions", () => {
    const original = originalLessons.find((item) => item.id === lesson.id)!;
    expect(lesson).toMatchObject({ id: "returns-what-is-a-return", moduleSlug: original.moduleSlug, slug: original.slug });
    const steps = getGuidedSteps(lesson);
    expect(steps).toHaveLength(9);
    expect(steps.map((step) => step.blocks.map((item) => item.id))).toEqual(original.steps.map((step) => step.blocks));
    expect(steps.map((step) => step.blocks.filter(isQuestion).map((item) => item.id))).toEqual(original.steps.map((step) => step.grading.map((item) => item.id)));
    expect(steps.every((step) => step.blocks.filter(isQuestion).length <= 1)).toBe(true);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
  });

  it("keeps display placement, prerequisite and the Lab glossary route", () => {
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "3.1.1", prerequisites: ["foundations-risk-reward"] });
    expect(metricLessonLink("simple-return")).toEqual({ href: "/learn/returns/what-is-a-return", label: `Lekce: ${lesson.title}` });
  });

  it("recomputes the numeric answer and accepts only the stated rounding tolerance", () => {
    const question = block(lesson, "numeric", "numericQuestion");
    const answer = simpleReturn(80, 92) * 100;
    expect(question.answer).toBeCloseTo(answer, 12);
    expect(question.tolerance).toBe(0.05);
    expect(() => validateMove(lesson.id, 6, 7, { answer: answer.toFixed(1).replace(".", ",") })).not.toThrow();
    expect(() => validateMove(lesson.id, 6, 7, { answer: String(answer + question.tolerance + 0.001) })).toThrow();
    expect(() => validateMove(lesson.id, 6, 7, { answer: "12" })).toThrow();
  });

  it.each([
    { step: 4, correct: simpleReturn(80, 88) > simpleReturn(300, 318) ? "a" : "b", wrong: "b" },
    { step: 7, correct: "b", wrong: "a" },
  ])("requires a correct answer before leaving step $step", ({ step, correct, wrong }) => {
    expect(() => validateMove(lesson.id, step, step + 1, { answer: wrong })).toThrow();
    expect(() => validateMove(lesson.id, step, step + 1, { answer: correct })).not.toThrow();
  });

  it("recomputes the worked examples from their starting and ending prices", () => {
    const percent = (start: number, end: number) => `+${Math.round(simpleReturn(start, end) * 100)} %`;
    expect(block(lesson, "example-100", "workedExample").steps.map((step) => step.value)).toEqual([
      "100 Kč", "110 Kč", `+${110 - 100} Kč`, percent(100, 110),
    ]);
    expect(block(lesson, "compare-assets", "workedExample").steps.map((step) => step.value)).toEqual([
      `100 Kč → 110 Kč = +${110 - 100} Kč = ${percent(100, 110)}`,
      `500 Kč → 510 Kč = +${510 - 500} Kč = ${percent(500, 510)}`,
    ]);
  });

  it("labels model examples in Kč and explains the scope of the return", () => {
    for (const example of lesson.blocks.filter((item) => item.type === "workedExample" || item.type === "interactiveFigure")) {
      expect(example.title).toMatch(/^Modelový příklad · /);
    }
    for (const id of ["prediction", "numeric"]) {
      const question = lesson.blocks.find((item) => item.id === id)!;
      expect("prompt" in question && question.prompt).toMatch(/^Modelový příklad: .*Kč/);
    }
    expect(block(lesson, "takeaway", "takeaway").content).toContain("před náklady, daněmi a inflací");
    expect(block(lesson, "takeaway", "takeaway").content).toContain("3.1.5");
  });
});
