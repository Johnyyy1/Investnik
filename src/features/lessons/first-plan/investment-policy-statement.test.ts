import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { ipsSchema } from "@/features/ips/schema";
import { exampleIps } from "@/features/ips/test-fixtures";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { stepArtifactRequirements } from "../output-contract";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("first-plan", "investment-policy-statement")!;
const steps = getGuidedSteps(lesson);

// Tereza's model allocation in percent, as stated in the worked example.
const allocation = { equity: 75, bonds: 15 };
const withCash = (cash: number) => ({ ...exampleIps, allocation: { lines: [{ assetClass: "equity" as const, weightBps: allocation.equity * 100 }, { assetClass: "bonds" as const, weightBps: allocation.bonds * 100 }], cashBps: cash * 100 } });

describe("Investiční plán (IPS) · 2.5.1 (#195)", () => {
  it("publishes its stable identity and L2 placement without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "first-plan-ips", moduleId: "module-first-plan", moduleSlug: "first-plan", slug: "investment-policy-statement" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.5.1", prerequisites: ["before-investing-goals", "costs-broker-comparison"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/first-plan/investment-policy-statement");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall-sections", "recall-why"]);
    // A skill owned by another display module would list it twice on Progress.
    expect(skillItems.filter((item) => item.skillId === "investment-policy").every((item) => item.lessonId === lesson.id)).toBe(true);
  });

  it("requires a saved investment plan from any source on the builder step and nowhere else", () => {
    const builder = steps.findIndex((step) => step.blocks.some((item) => item.id === "builder"));
    expect(steps.map((step) => stepArtifactRequirements(step))).toEqual(steps.map((_, index) => [index === builder ? { kind: "investment_plan", source: "any_lesson" } : undefined]));
    expect(block(lesson, "builder", "interactiveFigure").figure).toBe("ips-builder");
  });

  it("recomputes the faded allocation from the worked example and matches the IPS validation", () => {
    const question = block(lesson, "faded", "fadedExample");
    const cash = 100 - allocation.equity - allocation.bonds;
    expect(question.blank).toMatchObject({ input: "number", answer: cash, tolerance: 0, unit: "%" });
    expect(block(lesson, "worked", "workedExample").steps[2].value).toBe(`${allocation.equity} % globální akcie, ${allocation.bonds} % dluhopisy, ${cash} % hotovost`);
    expect(ipsSchema.safeParse(withCash(cash)).success).toBe(true);
    expect(ipsSchema.safeParse(withCash(cash - 5)).success).toBe(false);
    expect(evaluateQuestion(question, { answer: "10" })).toBe(true);
    for (const answer of ["0", "25", "90"]) expect(evaluateQuestion(question, { answer })).toBe(false);
  });

  it("recomputes the equity weight after a 30 % fall and its place against the ±5 p. b. band", () => {
    const question = block(lesson, "fall-practice", "numericQuestion");
    const equity = allocation.equity * 0.7;
    const total = equity + allocation.bonds + (100 - allocation.equity - allocation.bonds);
    const weight = equity / total * 100;
    expect(question.answer).toBe(Math.round(weight * 10) / 10);
    expect(Math.abs(weight - question.answer)).toBeLessThan(question.tolerance);
    expect(weight).toBeLessThan(allocation.equity - 5);
    expect(question.correctExplanation).toContain(`75 × 0,7 = 52,5. Celé portfolio: 52,5 + 15 + 10 = 77,5. Podíl akcií: 52,5 ÷ 77,5 = 67,7 %`);
    for (const answer of ["67,7", "67.7", "67,74"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    // Forgetting that the whole portfolio shrank gives 52,5 %; keeping the target gives 75 %.
    for (const answer of ["52,5", "75", "70", "67,6"]) expect(evaluateQuestion(question, { answer })).toBe(false);
  });

  it("teaches nine sections, concrete rules and the four-criterion self-assessment", () => {
    const worked = block(lesson, "worked", "workedExample");
    expect(worked.steps.map((step) => step.label.split(" · ")[0])).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    expect(block(lesson, "good-rule", "multipleChoiceQuestion").correctOptionId).toBe("specific");
    for (const id of ["prediction", "good-rule", "recall-sections", "recall-why"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
    expect(block(lesson, "reflection", "writtenReflection").rubric.map((item) => item.id)).toEqual(["complete", "specific", "horizon", "costs-taxes"]);
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
    expect(steps.filter((step) => step.kind === "mastery")).toHaveLength(2);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("labels model content and recommends no allocation, fund or broker", () => {
    for (const id of ["opening", "worked", "faded", "fall", "fall-practice"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "builder-intro", "paragraph").content).toContain("nedoporučují konkrétní alokaci, fond ani brokera");
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("neprovede se tím žádný obchod");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
