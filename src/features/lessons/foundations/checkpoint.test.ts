import { describe, expect, it } from "vitest";
import { foundationsCheckpointLesson as lesson, bigThreeQuestions } from "./checkpoint";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { authoredLessons, draftLessons, getAuthoredLesson } from "../registry";
import { validateMove, validateStepMove } from "@/features/progress/transition";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { availableLessons, curriculumLessons, lessonLink } from "@/features/learning/catalog";
import { lessonReward } from "@/features/rewards/practice-capital";
import { progressionUnlocks } from "@/features/progression/unlocks";

const steps = getGuidedSteps(lesson);

describe("Foundations checkpoint 1.1.10 (#164)", () => {
  it("reserves identity and placement without publishing ahead of #163/#130 and review", () => {
    expect(curriculumLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "foundations-checkpoint", moduleId: "module-investing-foundations", moduleSlug: "investing-foundations", slug: "foundations-checkpoint", status: "planned" });
    expect(draftLessons).toContain(lesson);
    expect(authoredLessons).not.toContain(lesson);
    expect(availableLessons.some((entry) => entry.id === lesson.id)).toBe(false);
    expect(getAuthoredLesson(lesson.moduleSlug, lesson.slug)).toBeUndefined();
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "1.1.10", required: "required" });
    expect(() => validateMove(lesson.id, 0, 1)).toThrow(/unavailable/);
    expect(lessonReward(lesson.id)).toEqual({ practiceCapitalMinor: 0n, rewardPolicyVersion: 4 });
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).toHaveLength(7);
    expect(progressionUnlocks.PORTFOLIO_LAB.xpRequired).toBe(420);
  });

  it("locks the Big Three prompts, options, IDs, order and answer keys for measurement", () => {
    expect(bigThreeQuestions.map(({ id, prompt, options, correctOptionId }) => ({ id, prompt, options, correctOptionId }))).toMatchSnapshot();
    for (const question of bigThreeQuestions) {
      expect(evaluateQuestion(question, { answer: "unknown" })).toBe(false);
      expect(evaluateQuestion(question, {})).toBeUndefined();
      expect(evaluateQuestion(question, correctAnswers(question))).toBe(true);
    }
    expect(10_000 * 1.02 ** 5).toBeGreaterThan(10_200);
    expect(1.01 / 1.02).toBeLessThan(1);
  });

  it("interleaves three Big Three and eight other tasks, covering each block once", () => {
    expect(steps.flatMap((step) => step.blocks.map((entry) => entry.id)).sort()).toEqual(lesson.blocks.map((entry) => entry.id).sort());
    expect(new Set(lesson.blocks.map((entry) => entry.id)).size).toBe(lesson.blocks.length);
    const questions = steps.flatMap((step) => step.blocks.filter(isQuestion));
    expect(questions).toHaveLength(11);
    expect(questions.filter((question) => question.id.startsWith("big-three-"))).toHaveLength(3);
    expect(questions.map((question) => question.id).slice(0, 6)).toEqual(["big-three-compounding", "position-value", "big-three-inflation", "index-etf", "bond-rates", "big-three-diversification"]);
    for (const [position, step] of steps.entries()) {
      expect(step.blocks.filter(isQuestion).length).toBeLessThanOrEqual(1);
      const question = step.blocks.find(isQuestion);
      if (question) {
        expect(() => validateStepMove(steps, position, position + 1, wrongAnswers(question))).toThrow(/correctly/);
        expect(() => validateStepMove(steps, position, position + 1, correctAnswers(question))).not.toThrow();
      }
    }
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
  });

  it("recomputes every numeric answer from the stated inputs with rounding tolerance", () => {
    const expected = {
      "position-value": 4 * 50 * 21,
      spread: (25010 - 24950) / 100,
      "compounded-value": 200 * (1 - 0.1) * (1 + 0.1),
      "portfolio-weight": 3000 / 12000 * 100,
      "entry-fee": 24000 * (1 - 0.025),
    };
    expect(lesson.blocks.filter((entry) => entry.type === "numericQuestion").map((entry) => entry.id).sort()).toEqual(Object.keys(expected).sort());
    for (const [id, answer] of Object.entries(expected)) {
      const question = block(lesson, id, "numericQuestion");
      expect(question.answer).toBeCloseTo(answer, 9);
      expect(question.tolerance).toBe(question.unit === "Kč" && ["spread", "position-value"].includes(id) ? 0.005 : 0.5);
      expect(evaluateQuestion(question, { answer: String(Math.round(answer * 100) / 100).replace(".", ",") })).toBe(true);
      expect(evaluateQuestion(question, { answer: String(answer + 1) })).toBe(false);
    }
  });

  it("provides specific explanation and a published review destination after every mistake", () => {
    for (const question of lesson.blocks.filter(isQuestion)) {
      expect(question.incorrectExplanation.length).toBeGreaterThan(50);
      expect(question.correctExplanation.length).toBeGreaterThan(50);
      expect("reviewHref" in question).toBe(true);
      if ("reviewHref" in question) expect(availableLessons.some((entry) => lessonLink(entry.id)?.href === question.reviewHref)).toBe(true);
    }
    expect(block(lesson, "report-interpretation", "multipleChoiceQuestion").correctExplanation).toContain("nejsou výsledkem skutečné studie");
    expect(block(lesson, "opening", "paragraph").content).toContain("Modelové příklady");
    expect(block(lesson, "reflection", "writtenReflection").rubric).toHaveLength(2);
  });
});
