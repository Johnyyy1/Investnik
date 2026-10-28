import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { requireMissions, stepMissionIds } from "@/features/missions/requirements";
import { getMission } from "@/features/missions/registry";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { block } from "../lesson-test-support";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";

const lesson = getAuthoredLesson("first-plan", "first-simulated-purchase")!;
const steps = getGuidedSteps(lesson);

describe("První nákup nanečisto · 2.5.3 (#197)", () => {
  it("publishes the requested identity, placement and one dedicated mastery skill", () => {
    expect(availableLessons.find((item) => item.id === lesson.id)).toMatchObject({ id: "first-plan-first-purchase", moduleId: "module-first-plan", slug: "first-simulated-purchase" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/first-plan/first-simulated-purchase");
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.5.3", required: "required", prerequisites: ["first-plan-ips", "costs-spread-and-fees", "costs-currency-conversion", "foundations-markets"] });
    expect(skillItems.filter((item) => item.skillId === "order-review").map((item) => [item.lessonId, item.blockId])).toEqual([[lesson.id, "recall"]]);
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
  });
  it("recomputes the worked costs and fractional quantity from the stated inputs", () => {
    const price = 100, fx = 25, fee = 25, markup = 0.005, budget = 2500;
    const gross = 0.98 * price * fx;
    const total = gross + gross * markup + fee;
    expect(price * fx * (1 + markup) + fee).toBeGreaterThan(budget);
    expect(total).toBe(2487.25);
    expect(Math.abs(total - budget)).toBeLessThanOrEqual(budget * 0.01);
    const worked = block(lesson, "worked", "workedExample");
    expect(worked.steps[3].value).toContain("12,25 Kč");
    expect(worked.steps.at(-1)?.value).toContain("2 487,25 Kč");
    const question = block(lesson, "faded", "fadedExample");
    const nextGross = 0.96 * price * fx;
    expect(question.blank).toMatchObject({ answer: nextGross + nextGross * markup + fee, tolerance: 0.0049 });
    for (const answer of ["2437", "2437,00"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    for (const answer of ["", "2400", "2412", "2425", "2437,01"]) expect(evaluateQuestion(question, { answer })).toBeFalsy();
    expect(101 * fx).toBe(2525); // The EUR limit example's CZK equivalent, before costs.
    expect(25000 / budget).toBe(10); // Amount-error distractor.
    expect(2500 * 0.8).toBe(2000); // Mission's contribution share and ±1% range.
    expect([2000 * 0.99, 2000 * 1.01]).toEqual([1980, 2020]);
  });
  it("requires the new version of server evidence only at the mission step", async () => {
    const ids = steps.flatMap(stepMissionIds);
    expect(ids).toEqual(["ips-etf-purchase-v2"]);
    expect(getMission(ids[0], lesson.id)).toMatchObject({ check: "ips-etf-purchase-v2", params: { toleranceBps: 100 } });
    await expect(requireMissions(ids, lesson.id, async () => false)).rejects.toThrow();
    await expect(requireMissions(ids, lesson.id, async () => true)).resolves.toBeUndefined();
    expect(block(lesson, "mission", "labMission").mission.afterReturn).toContain("Mise nepřidává kapitál");
  });
  it("teaches identity, amount, side and the price/execution tradeoff with one question last per step", () => {
    expect(block(lesson, "identity", "documentSearchQuestion").target).toEqual({ type: "region", regionId: "b" });
    for (const [id, correct] of [["order-type", "limit"], ["error-class", "class"], ["error-amount", "correct"], ["error-side", "side"]]) expect(block(lesson, id, "multipleChoiceQuestion").correctOptionId).toBe(correct);
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
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });
  it("states the actual Lab limitations and never recommends a product or invents missing data", () => {
    expect(block(lesson, "lab-limits", "conceptCallout").content).toContain("Limitní pokyny, bid/ask spread a skluz zatím nemodeluje");
    expect(block(lesson, "mission", "labMission").mission.steps.join(" ")).toContain("další není potřeba");
    expect(block(lesson, "after", "explanation").content).toContain("příspěvek, ne investiční zisk");
    expect(block(lesson, "sources", "paragraph").content).toContain("smyšlené");
  });
});
