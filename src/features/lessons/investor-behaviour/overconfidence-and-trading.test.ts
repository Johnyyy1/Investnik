import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { getFact } from "@/features/facts/registry";
import { stepArtifactRequirements } from "../output-contract";
import { DECISION_CARDS } from "@/features/portfolio/decision-cards";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("investor-behaviour", "overconfidence-and-trading")!;
const steps = getGuidedSteps(lesson);
const kc = (amount: number) => `${amount.toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;

// Model inputs, as stated in the lesson.
const fee = 60;
const tradesPerYear = 40;

describe("Přehnaná sebedůvěra a obchodování · B.1.2 (#287)", () => {
  it("publishes its stable identity in B.1 without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "behaviour-overconfidence", moduleId: "module-investor-behaviour", moduleSlug: "investor-behaviour", slug: "overconfidence-and-trading" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "B.1.2", required: "required" });
    expect(getLessonPlacement(lesson.id)?.prerequisites).toEqual(expect.arrayContaining(["first-plan-ips", "costs-spread-and-fees"]));
    expect(lessonLink(lesson.id)?.href).toBe("/learn/investor-behaviour/overconfidence-and-trading");
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    // A skill owned by another display module would list it twice on Progress.
    expect(skillItems.filter((item) => item.skillId === "turnover").every((item) => item.lessonId === lesson.id)).toBe(true);
    expect(DECISION_CARDS.turnover.lessonId).toBe(lesson.id);
  });

  it("rewards learning only: the Lab trading exercise is optional and server-unverified", () => {
    // Policy v4: level B lessons earn XP only; nothing is tied to trades placed in the simulation.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
    const mission = block(lesson, "mission", "labMission");
    expect(mission.missionId).toBeUndefined();
    expect(mission.mission.target).toBe("/lab/training");
    expect(block(lesson, "mission-intro", "paragraph").content).toContain("nedostaneš XP ani kapitál");
  });

  it("recomputes every numeric answer and model figure from its inputs", () => {
    const turnover = block(lesson, "turnover-practice", "numericQuestion");
    expect(turnover.answer).toBe(300_000 / 200_000 * 100);
    for (const answer of ["150", "150,0"]) expect(evaluateQuestion(turnover, { answer })).toBe(true);
    // Inverting the ratio, or forgetting the percentage, are the typical slips.
    for (const answer of ["66.7", "1.5", "50"]) expect(evaluateQuestion(turnover, { answer })).toBe(false);

    const costs = block(lesson, "costs-practice", "numericQuestion");
    expect(costs.answer).toBeCloseTo(tradesPerYear * fee / 100_000 * 100, 10);
    expect(costs.correctExplanation).toContain(`${tradesPerYear} × ${fee} Kč = ${kc(tradesPerYear * fee)}`);
    for (const answer of ["2.4", "2,4"]) expect(evaluateQuestion(costs, { answer })).toBe(true);
    for (const answer of ["0.06", "24", "0.24"]) expect(evaluateQuestion(costs, { answer })).toBe(false);

    expect(block(lesson, "prediction", "multipleChoiceQuestion").correctExplanation).toContain(`${tradesPerYear} obchodů × 5 let × ${fee} Kč = ${kc(tradesPerYear * 5 * fee)}`);
    expect(block(lesson, "worked", "workedExample").steps.at(-1)!.value).toBe(`60 000 ÷ 100 000 = ${60_000 / 100_000 * 100} %`);
    // Sample analysis: 24 months, one trade versus two a month.
    const rows = block(lesson, "mission", "labMission").analysis.rows;
    expect(rows.map((row) => [row.status, row.start])).toEqual([[`1 obchod`, `${kc(fee)} na poplatcích`], [`${24 * 2} obchodů`, `${kc(24 * 2 * fee)} na poplatcích`]]);
  });

  it("takes the research figures from verified registry facts", () => {
    const research = block(lesson, "research", "conceptCallout").content;
    expect(research).toContain("{{barber_odean.aktivni}}");
    expect(research).toContain("{{barber_odean.trh}}");
    expect(research).not.toMatch(/\d+,\d+ %/);
    for (const [key, amount] of [["barber_odean.aktivni", 11.4], ["barber_odean.trh", 17.9]] as const) {
      expect(getFact(key, "2026-10-28")).toMatchObject({ value: { amount, unit: "%" }, verificationStatus: "primary" });
    }
  });

  it("saves the pre-trade checklist as a required lesson output", () => {
    const checklist = block(lesson, "checklist", "checklist");
    expect(checklist.items.map((item) => item.id)).toEqual(["ips", "reason", "wrong", "cost", "budget"]);
    const step = steps.find((entry) => entry.blocks.includes(checklist))!;
    expect(stepArtifactRequirements(step)).toContainEqual({ kind: "lesson_output", source: "current_lesson", blockId: "checklist" });
    expect(block(lesson, "safeguard", "explanation").content).toContain("ilustrace");
  });

  it("explains every wrong option", () => {
    for (const id of ["prediction", "research-why", "recall"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
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
    expect(steps.filter((step) => step.kind === "mastery")).toHaveLength(1);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("labels model and simulated content and recommends no product", () => {
    for (const id of ["opening", "worked", "turnover-practice", "costs-practice"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    for (const id of ["mission-intro", "mission"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Simulace");
    expect(block(lesson, "research", "conceptCallout").title).toContain("Výzkum");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
