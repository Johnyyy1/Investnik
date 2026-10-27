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
import { compareCostDrag, costDragValue } from "./cost-drag-model";

const lesson = getAuthoredLesson("costs", "costs-over-30-years")!;
const steps = getGuidedSteps(lesson);
const kc = (value: number) => new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Math.round(value)).replaceAll("\u00a0", " ");
/** Independent closed form of the brief: annuity due, monthly rate (1 + r − c)^(1/12) − 1. */
const annuityDue = (monthly: number, months: number, gross: number, cost: number) => {
  const i = (1 + gross - cost) ** (1 / 12) - 1;
  return monthly * (((1 + i) ** months - 1) / i) * (1 + i);
};

describe("Náklady za 30 let · 2.2.4 (#174)", () => {
  it("publishes its stable identity and L2 placement without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "costs-over-30-years", moduleId: "module-costs", moduleSlug: "costs", slug: "costs-over-30-years" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.2.4", prerequisites: ["costs-ter-tracking-difference", "costs-spread-and-fees", "foundations-risk-reward"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/costs/costs-over-30-years");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
  });

  it("reproduces the brief's table with the model the calculator uses", () => {
    const table = { 0.2: 1_888_972, 1.5: 1_499_619, 2.5: 1_262_309 };
    for (const [cost, expected] of Object.entries(table)) {
      const value = costDragValue(2_000, 30, 6, Number(cost))!;
      expect(Math.round(value)).toBe(expected);
      expect(value).toBeCloseTo(annuityDue(2_000, 360, 0.06, Number(cost) / 100), 4);
    }
    const text = block(lesson, "worked", "workedExample").steps.map((step) => step.value).join(" ");
    expect(text).toContain(`= ${kc(2_000 * 12 * 30)} Kč`);
    for (const value of Object.values(table)) expect(text).toContain(`≈ ${kc(value)} Kč`);
    const gap = costDragValue(2_000, 30, 6, 0.2)! - costDragValue(2_000, 30, 6, 2.5)!;
    expect(text).toContain(`= ${kc(gap)} Kč ≈ ${Math.round(gap / costDragValue(2_000, 30, 6, 0.2)! * 100)} %`);
    expect(block(lesson, "worked", "workedExample").conclusion).toContain(`${kc(costDragValue(2_000, 30, 6, 0.2)! - costDragValue(2_000, 30, 6, 1.5)!)} Kč`);
  });

  it("grades the prediction against the recomputed share", () => {
    const share = 1 - costDragValue(2_000, 30, 6, 2.5)! / costDragValue(2_000, 30, 6, 0.2)!;
    expect(share).toBeGreaterThan(0.32);
    expect(share).toBeLessThan(0.34);
    expect(block(lesson, "prediction", "multipleChoiceQuestion").correctOptionId).toBe("third");
  });

  it("backs the first-year and last-year cost claims", () => {
    const afterYear = (years: number) => costDragValue(2_000, years, 6, 1.5)!;
    expect(afterYear(1)).toBeLessThan(25_000);
    expect(afterYear(1) * 0.015).toBeLessThan(1_000);
    expect(afterYear(29)).toBeGreaterThan(1_000_000);
    expect(afterYear(29) * 0.015).toBeGreaterThan(10_000);
    expect(block(lesson, "why", "explanation").content).toContain("necelých 25 000 Kč");
  });

  it("recomputes the calculator exercise in thousands and accepts its rounding", () => {
    const question = block(lesson, "calculator-practice", "numericQuestion");
    const exact = costDragValue(2_000, 30, 6, 1.5)! / 1_000;
    expect(question.answer).toBe(Math.round(exact));
    expect(Math.abs(question.answer - exact)).toBeLessThanOrEqual(question.tolerance);
    expect(question.correctExplanation).toContain(`${kc(exact * 1_000)} Kč`);
    for (const answer of ["1500", "1499,6", "1499"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    for (const answer of ["1889", "1262", "720", "1500000"]) expect(evaluateQuestion(question, { answer })).toBe(false);
  });

  it("refuses invalid calculator inputs instead of returning a value", () => {
    for (const args of [[50, 30, 6, 1], [2_000, 1.5, 6, 1], [2_000, 30, 13, 1], [2_000, 30, 6, -0.1], [2_000, 30, 6, 3.1], [Number.NaN, 30, 6, 1]] as [number, number, number, number][]) {
      expect(compareCostDrag(...args)).toBeNull();
    }
    expect(compareCostDrag(2_000, 30, 6, 0)).toMatchObject({ contributed: 720_000, costImpact: 0 });
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

  it("labels model and simulation content and separates trade costs from the fund's annual costs", () => {
    for (const id of ["opening", "model", "worked", "calculator", "calculator-practice"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    for (const id of ["backtest", "backtest-practice"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Simulace");
    expect(block(lesson, "backtest", "explanation").content).toContain("ne roční nákladovost fondu");
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("historické ceny ETF už mohou skutečné náklady fondu obsahovat");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
