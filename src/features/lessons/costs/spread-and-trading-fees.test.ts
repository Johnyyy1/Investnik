import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { tradeCostBreakdown } from "@/features/finance/trade-cost-breakdown";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("costs", "spread-and-trading-fees")!;
const steps = getGuidedSteps(lesson);
const model = (amount: number) => tradeCostBreakdown(amount, 0.15, 60, 10_000, 0.1);
const cs = (value: number, digits = 0) => new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value).replaceAll("\u00a0", " ");

describe("Spread a transakční poplatek · 2.2.2 (#172)", () => {
  it("publishes its stable identity and L2 placement without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "costs-spread-and-fees", moduleId: "module-costs", moduleSlug: "costs", slug: "spread-and-trading-fees" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.2.2", prerequisites: ["foundations-markets"], skills: ["bid-ask-spread", "trade-costs"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/costs/spread-and-trading-fees");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
  });

  it("recomputes the midpoint, half-spread and numeric exercise from their stated inputs", () => {
    const [bid, ask] = [99.95, 100.05];
    const midpoint = (bid + ask) / 2;
    expect(midpoint).toBe(100);
    expect((ask - bid) / midpoint * 100).toBeCloseTo(0.1);
    expect(ask - midpoint).toBeCloseTo(0.05);
    const question = block(lesson, "spread-practice", "numericQuestion");
    expect(question.answer).toBe(40_000 * (0.2 / 100) / 2);
    expect(evaluateQuestion(question, { answer: cs(question.answer) })).toBe(true);
    expect(evaluateQuestion(question, { answer: "80" })).toBe(false);
    expect(evaluateQuestion(question, { answer: "40,5" })).toBe(false);
  });

  it("recomputes Petra, Ondřej and the quarterly worked examples, including every displayed cost", () => {
    for (const [amount, blockId] of [[50_000, "worked"], [2_000, "worked"], [6_000, "frequency"]] as const) {
      const fee = Math.max(amount * 0.0015, 60);
      const spread = amount * 0.001 / 2;
      const total = fee + spread;
      const result = model(amount);
      expect(result).toEqual({ feeMinor: BigInt(fee * 100), spreadMinor: BigInt(spread * 100), totalMinor: BigInt(total * 100), costPercent: total / amount * 100 });
      const text = block(lesson, blockId, "workedExample").steps.map((step) => step.value).join(" ");
      expect(text).toContain(`${cs(amount)} × 0,0015; 60) = ${cs(fee)} Kč`);
      expect(text).toContain(`${cs(amount)} × 0,0005 = ${cs(spread)} Kč`);
      expect(text).toContain(`${cs(total)} Kč = ${cs(total / amount * 100, 2)} %`);
    }
    const quarterly = block(lesson, "frequency", "workedExample");
    expect(quarterly.steps.at(-1)!.value).toContain(`3 × ${cs(Number(model(2_000).totalMinor) / 100)} = ${cs(Number(model(2_000).totalMinor) * 3 / 100)} Kč oproti ${cs(Number(model(6_000).totalMinor) / 100)} Kč`);
  });

  it("recomputes the faded and independent answers, accepting Czech decimals and rejecting rounding errors", () => {
    const faded = block(lesson, "faded", "fadedExample");
    if (faded.blank.input !== "number") throw new Error("Expected a numeric blank");
    expect(faded.blank.answer).toBe(Math.max(4_000 * 0.0015, 60) + 4_000 * 0.001 / 2);
    const question = block(lesson, "total-practice", "multiNumericQuestion");
    const fee = Math.max(3_000 * 0.0015, 60);
    const total = fee + 3_000 * 0.001 / 2;
    expect(question.answers[0].answer).toBe(total);
    expect(question.answers[1].answer).toBeCloseTo(total / 3_000 * 100, 10);
    expect(model(3_000).totalMinor).toBe(BigInt(total * 100));
    expect(evaluateQuestion(question, { czk: cs(total, 2), percent: cs(total / 3_000 * 100, 2) })).toBe(true);
    expect(evaluateQuestion(question, { czk: "", percent: "" })).toBeUndefined();
    for (const answers of [{ czk: "6", percent: "0,2" }, { czk: "61,51", percent: "2,05" }, { czk: "61,50", percent: "2,06" }]) expect(evaluateQuestion(question, answers)).toBe(false);
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

  it("labels fictional inputs and discloses the Lab's missing bid/ask coverage", () => {
    expect(block(lesson, "opening", "paragraph").content).toMatch(/^Modelový příklad/);
    expect(block(lesson, "explorer", "interactiveFigure").figure).toBe("trade-cost-breakdown");
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("zatím nemodeluje");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
