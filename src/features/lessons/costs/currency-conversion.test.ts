import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("costs", "currency-conversion")!;
const steps = getGuidedSteps(lesson);
const cs = (value: number, digits = 2) => new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value).replaceAll(" ", " ");
/** Kč lost against the reference rate when the broker adds `markup` to it. */
const conversionCost = (czk: number, markup: number) => czk * (1 - 1 / (1 + markup));

describe("Měnová konverze a měnové riziko · 2.2.3 (#173)", () => {
  it("publishes its stable identity and L2 placement without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "costs-currency-conversion", moduleId: "module-costs", moduleSlug: "costs", slug: "currency-conversion" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.2.3", prerequisites: ["costs-spread-and-fees", "foundations-stocks"], skills: ["currency-risk"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/costs/currency-conversion");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
  });

  it("recomputes every displayed value of Pavel's worked example", () => {
    const [czk, reference, markup] = [10_000, 24.3, 0.005];
    const broker = reference * (1 + markup);
    const text = block(lesson, "worked", "workedExample").steps.map((step) => step.value).join(" ");
    expect(text).toContain(`= ${cs(czk / reference)} EUR`);
    expect(text).toContain(`= ${cs(broker, 4)} Kč/EUR`);
    expect(text).toContain(`= ${cs(czk / broker)} EUR`);
    expect(text).toContain(`= ${cs(czk * reference / broker)} Kč`);
    expect(text).toContain(`= ${cs(conversionCost(czk, markup))} Kč`);
    expect(block(lesson, "worked", "workedExample").conclusion).toContain(`${cs(conversionCost(czk, markup) / czk * 100, 4)} %`);
  });

  it("recomputes the conversion exercise and accepts its stated ±1 Kč rounding", () => {
    const question = block(lesson, "conversion-practice", "numericQuestion");
    const exact = conversionCost(20_000, 0.004);
    expect(question.answer).toBe(20_000 * 0.004);
    expect(Math.abs(question.answer - exact)).toBeLessThanOrEqual(question.tolerance);
    expect(question.correctExplanation).toContain(`${cs(20_000 / 24.5)} EUR`);
    expect(question.correctExplanation).toContain(`${cs(20_000 / (24.5 * 1.004))} EUR`);
    expect(question.correctExplanation).toContain(`≈ ${cs(exact, 1)} Kč`);
    for (const answer of [cs(exact, 0), cs(exact, 2), "80"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    for (const answer of ["0,4", "98", "160"]) expect(evaluateQuestion(question, { answer })).toBe(false);
  });

  it("recomputes the round trip from both conversions", () => {
    const question = block(lesson, "round-trip-practice", "numericQuestion");
    const exact = (1 - (1 / 1.005) * (1 - 0.005)) * 100;
    expect(exact).toBeLessThan(1);
    expect(Math.round(exact)).toBe(question.answer);
    expect(evaluateQuestion(question, { answer: "1" })).toBe(true);
    expect(evaluateQuestion(question, { answer: "0,5" })).toBe(false);
  });

  it("explains the stronger-koruna answer as both −9.1 % and −10 %", () => {
    const question = block(lesson, "strong-koruna", "multipleChoiceQuestion");
    const stronger = (1 / 1.1 - 1) * 100;
    expect(question.options.find((option) => option.id === question.correctOptionId)!.label).toContain("9–10 %");
    expect(question.correctExplanation).toContain(`${cs(-stronger, 1)} %`);
    expect(question.correctExplanation).toContain("přesně 10 %");
  });

  it("covers every block once with one question last per step, and validates all moves server-side", () => {
    expect(steps.flatMap((step) => step.blocks.map((item) => item.id)).sort()).toEqual(lesson.blocks.map((item) => item.id).sort());
    expect(new Set(lesson.blocks.map((item) => item.id)).size).toBe(lesson.blocks.length);
    for (const [position, step] of steps.entries()) {
      expect(step.blocks.filter(isQuestion).length).toBeLessThanOrEqual(1);
      for (const question of step.blocks.filter(isQuestion)) {
        expect(step.blocks.at(-1)).toBe(question);
        expect(() => validateMove(lesson.id, position, position + 1, wrongAnswers(question))).toThrow();
        expect(() => validateMove(lesson.id, position, position + 1, correctAnswers(question))).not.toThrow();
      }
    }
    expect(steps.some((step) => step.kind === "mastery")).toBe(true);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("labels fictional inputs, names no provider and discloses how the Lab attributes FX", () => {
    for (const id of ["opening", "conversion-practice", "round-trip-practice", "currency-risk", "strong-koruna"]) {
      const item = lesson.blocks.find((entry) => entry.id === id)!;
      expect(JSON.stringify(item)).toContain("Modelový příklad");
    }
    expect(block(lesson, "worked", "workedExample").title).toMatch(/^Modelový příklad/);
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("měnu kotace instrumentu");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
