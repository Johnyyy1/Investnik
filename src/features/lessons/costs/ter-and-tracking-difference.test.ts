import { describe, expect, it } from "vitest";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { lessonReward } from "@/features/rewards/practice-capital";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("costs", "ter-and-tracking-difference")!;
const steps = getGuidedSteps(lesson);
const czech = (value: number, digits = 2) => value.toFixed(digits).replace(".", ",").replace("-", "−");
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

describe("TER and tracking difference lesson 2.2.1 (#171)", () => {
  it("publishes 2.2.1 in its own storage module with the L2 reward and no Lab unlock change", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "costs-ter-tracking-difference", moduleId: "module-costs", moduleSlug: "costs", slug: "ter-and-tracking-difference" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.2.1", prerequisites: ["foundations-funds"], required: "required" });
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(lessonLink(lesson.id)?.href).toBe("/learn/costs/ter-and-tracking-difference");
  });

  it("grades at most one question per step, none on the final step, and gates every move on the server", () => {
    const ids = lesson.blocks.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [position, step] of steps.entries()) {
      expect(step.blocks.filter(isQuestion).length).toBeLessThanOrEqual(1);
      for (const question of step.blocks.filter(isQuestion)) {
        expect(() => validateMove(lesson.id, position, position + 1, wrongAnswers(question))).toThrow();
        expect(() => validateMove(lesson.id, position, position + 1, correctAnswers(question))).not.toThrow();
      }
    }
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("recomputes the worked example and the practice answer from their inputs", () => {
    const values = block(lesson, "worked", "workedExample").steps.map((step) => step.value);
    expect(values).toContain(`7,85 % − 8,00 % = ${czech(7.85 - 8)} p. b.`);
    expect(values).toContain(`7,80 % − 8,00 % = ${czech(7.8 - 8)} p. b.`);
    const practice = block(lesson, "td-practice", "numericQuestion");
    expect(practice.answer).toBeCloseTo(6.22 - 6.4, 9);
    expect(evaluateQuestion(practice, { answer: "-0,18" })).toBe(true);
    // The sign is the lesson: a fund behind its index has a negative difference.
    expect(evaluateQuestion(practice, { answer: "0,18" })).toBe(false);
  });

  it("derives the three-year comparison from the table it shows", () => {
    const rows = block(lesson, "years-data", "workedExample").steps.map((step) => [...step.value.matchAll(/−(\d,\d+)/g)].map((match) => -Number(match[1].replace(",", "."))));
    const [a, b] = [rows.map((row) => row[0]), rows.map((row) => row[1])];
    expect(a).toEqual([-0.15, -0.1, -0.18]);
    expect(b).toEqual([-0.2, -0.22, -0.19]);
    expect(mean(a)).toBeCloseTo(-0.1433, 4);
    expect(mean(b)).toBeCloseTo(-0.2033, 4);
    const compare = block(lesson, "years-compare", "multipleChoiceQuestion");
    expect(compare.correctOptionId).toBe(mean(a) > mean(b) ? "a" : "b");
    expect(compare.correctExplanation).toContain(`≈ ${czech(mean(a), 3)} p. b.`);
    expect(compare.correctExplanation).toContain(`≈ ${czech(mean(b), 3)} p. b.`);
  });

  it("asks which fund has the higher tracking error with a stable and a swinging difference", () => {
    const te = block(lesson, "te-compare", "multipleChoiceQuestion");
    const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
    expect(te.correctOptionId).toBe(spread([-0.1, -0.1]) < spread([-0.5, 0.3]) ? "y" : "x");
  });

  it("labels model examples, cites sources and leaves tracking difference out of the Lab", () => {
    expect(block(lesson, "opening", "paragraph").content).toMatch(/^Modelový příklad/);
    expect(block(lesson, "worked", "workedExample").title).toMatch(/^Modelový příklad/);
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("Investník nepočítá");
  });
});
