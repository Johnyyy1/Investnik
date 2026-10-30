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
import { dispositionScenario } from "./disposition-effect";

const lesson = getAuthoredLesson("investor-behaviour", "disposition-effect")!;
const steps = getGuidedSteps(lesson);
const { need, positions } = dispositionScenario;
const winners = positions.filter((position) => position.value > position.cost).map((position) => position.id);
const losers = positions.filter((position) => position.value < position.cost).map((position) => position.id);

describe("Dispoziční efekt · B.1.3 (#288)", () => {
  it("publishes its stable identity in B.1 without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "behaviour-disposition-effect", moduleId: "module-investor-behaviour", moduleSlug: "investor-behaviour", slug: "disposition-effect" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "B.1.3", required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/investor-behaviour/disposition-effect");
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    // A skill owned by another display module would list it twice on Progress.
    expect(skillItems.filter((item) => item.skillId === "disposition-effect").every((item) => item.lessonId === lesson.id)).toBe(true);
    expect(DECISION_CARDS.disposition.lessonId).toBe(lesson.id);
    // Policy v4: level B lessons earn XP only.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
  });

  it("builds a balanced scenario: 3 winners, 3 losers, and a plan sale that restores every target", () => {
    expect([winners, losers]).toEqual([["A", "B", "C"], ["D", "E", "F"]]);
    const total = positions.reduce((sum, position) => sum + position.value, 0);
    expect(total).toBe(100_000);
    expect(positions.reduce((sum, position) => sum + position.target, 0)).toBe(100);
    // Selling `need` from A alone leaves every position exactly on its target weight.
    for (const position of positions) expect((position.value - (position.id === "A" ? need : 0)) / (total - need) * 100).toBe(position.target);
  });

  it("derives every consequence row from the scenario: sale total, PGR, PLR and the largest drift", () => {
    const scenario = block(lesson, "scenario", "personaDecision");
    const rows = Object.fromEntries(scenario.options.map((option) => [option.id, option.consequence.rows.map((row) => row.value)]));
    // Each option raises exactly the needed amount.
    for (const values of Object.values(rows)) expect(values[0].split(" + ").map((part) => Number(part.slice(2).replace(/\D/g, ""))).reduce((a, b) => a + b, 0)).toBe(need);
    expect(rows.winners.slice(1)).toEqual([`3 z 3 = ${3 / 3 * 100} %`, "0 z 3 = 0 %", `A: ${(52_000 - 4_000) / 80_000 * 100} % místo 40 %`]);
    expect(rows.losers.slice(1)).toEqual(["0 z 3 = 0 %", `2 z 3 = ${Math.round(2 / 3 * 100)} %`, `A: ${52_000 / 80_000 * 100} % místo 40 %`]);
    expect(rows.plan.slice(1)).toEqual([`1 z 3 = ${Math.round(1 / 3 * 100)} %`, "0 z 3 = 0 %", "Žádná, všechny pozice jsou na cíli"]);
    expect(scenario.persona.facts).toHaveLength(6);
    expect(scenario.persona.facts[0]).toMatchObject({ label: "A · ETF akcie svět", value: "52 000 Kč", detail: "Zisk 12 000 Kč · koupeno za 40 000 Kč · cíl 40 %" });
  });

  it("recomputes PGR and PLR in the practice question", () => {
    const question = block(lesson, "pgr-practice", "multiNumericQuestion");
    const [pgr, plr] = question.answers;
    expect(pgr.answer).toBe(2 / (2 + 1) * 100);
    expect(plr.answer).toBe(0 / (0 + 3) * 100);
    for (const answer of ["67", "66,7", "66.67"]) expect(evaluateQuestion(question, { pgr: answer, plr: "0" })).toBe(true);
    // Dividing by all six positions, or by the losers, are the typical slips.
    for (const answer of ["33", "100", "0.67"]) expect(evaluateQuestion(question, { pgr: answer, plr: "0" })).toBe(false);
    expect(question.correctExplanation).toContain(`PGR = 2 ÷ (2 + 1) = ${Math.round(pgr.answer)} %`);
  });

  it("takes the research figures from verified registry facts and states their ratio correctly", () => {
    const research = block(lesson, "research", "conceptCallout").content;
    for (const key of ["{{odean.pgr}}", "{{odean.plr}}"]) expect(research).toContain(key);
    expect(research).not.toMatch(/\d+,\d+ %/);
    const pgr = getFact("odean.pgr", "2026-10-29"), plr = getFact("odean.plr", "2026-10-29");
    expect([pgr, plr]).toMatchObject([{ value: { amount: 14.8, unit: "%" }, verificationStatus: "primary" }, { value: { amount: 9.8, unit: "%" }, verificationStatus: "primary" }]);
    const ratio = (pgr.value.amount as number) / (plr.value.amount as number);
    expect(ratio.toFixed(1)).toBe("1.5");
    expect(block(lesson, "research-why", "multipleChoiceQuestion").correctExplanation).toContain("zhruba 1,5");
  });

  it("saves the sell rules as a required lesson output and keeps tax advice out", () => {
    const checklist = block(lesson, "checklist", "checklist");
    const step = steps.find((entry) => entry.blocks.includes(checklist))!;
    expect(stepArtifactRequirements(step)).toContainEqual({ kind: "lesson_output", source: "current_lesson", blockId: "checklist" });
    const tax = block(lesson, "tax", "conceptCallout").content;
    expect(tax).toContain("Vzdělávací obsah, ne daňové poradenství.");
    // The time-test duration is still an unverified fact (#134); the lesson must not state it.
    expect(tax).not.toMatch(/\d/);
  });

  it("explains every wrong option", () => {
    for (const id of ["research-why", "decision", "recall"]) {
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
    for (const id of ["opening", "pgr-practice", "decision"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "scenario", "personaDecision").prompt).toContain("Simulace");
    expect(block(lesson, "research", "conceptCallout").title).toContain("Výzkum");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční ani daňové doporučení.");
  });
});
