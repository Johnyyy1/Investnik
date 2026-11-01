import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems, storageModules } from "@/features/learning/curriculum";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { stepArtifactRequirements, validOutputForBlock } from "../output-contract";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { etfChecklistFunds, terComparisonAmount } from "./etf-selection-checklist";

const lesson = getAuthoredLesson("eu-funds-and-etfs", "etf-selection-checklist")!;
const steps = getGuidedSteps(lesson);
const [fundA, fundB, fundC] = etfChecklistFunds;
const cz = (value: number) => value.toLocaleString("cs-CZ").replace(/\s/g, " ");

describe("Checklist výběru ETF · 2.3.6 (#181)", () => {
  it("publishes its stable identity as the first lesson of a new storage module, last in storage order", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "etfs-selection-checklist", moduleId: "module-eu-funds-and-etfs", moduleSlug: "eu-funds-and-etfs", slug: "etf-selection-checklist" });
    expect(storageModules.at(-1)?.id).toBe("module-eu-funds-and-etfs");
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.3.6", required: "required", prerequisites: ["costs-ter-tracking-difference", "foundations-funds"], skills: ["etf-selection"] });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/eu-funds-and-etfs/etf-selection-checklist");
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    expect(skillItems.filter((item) => item.skillId === "etf-selection").every((item) => item.lessonId === lesson.id)).toBe(true);
    // Policy v4: an L2 lesson outside Foundations earns 2 000 Kč once.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
  });

  it("derives the overview from the fund data and makes the thematic fund C the only one to drop", () => {
    const overview = block(lesson, "overview", "documentTap");
    expect(overview.correctRowIds).toEqual(["c"]);
    expect(overview.document.rows.map((row) => [row.id, row.cells.ter, row.cells.size])).toEqual([
      ["a", "0,22 %", `${cz(fundA.aumEurMillions / 1000)} mld. EUR · ${fundA.founded}`],
      ["b", "0,20 %", `${cz(fundB.aumEurMillions / 1000)} mld. EUR · ${fundB.founded}`],
      ["c", "0,49 %", `${fundC.aumEurMillions} mil. EUR · ${fundC.founded}`],
    ]);
    // A missing history is shown as unavailable, never as zero.
    expect(fundC.trackingDifferenceBps).toBeNull();
    expect(overview.document.rows[2].note).toContain("nedostupné");
    expect(overview.document.rows[0].note).toContain("−0,18 p. b. ročně");
    expect(evaluateQuestion(overview, correctAnswers(overview))).toBe(true);
    expect(evaluateQuestion(overview, wrongAnswers(overview))).toBe(false);
  });

  it("recomputes the TER difference from the inputs and accepts it in Czech notation", () => {
    const faded = block(lesson, "faded", "fadedExample");
    const costA = terComparisonAmount * fundA.terBps / 10_000;
    const costB = terComparisonAmount * fundB.terBps / 10_000;
    expect([costA, costB]).toEqual([220, 200]);
    expect(faded.blank).toMatchObject({ input: "number", answer: costA - costB, tolerance: 0, unit: "Kč" });
    expect(faded.steps.at(-1)!.value).toBe(`A: 0,22 % = ${costA} Kč · B: 0,20 % = ${costB} Kč ročně`);
    expect(evaluateQuestion(faded, { answer: "20" })).toBe(true);
    expect(evaluateQuestion(faded, { answer: "20,0" })).toBe(true);
    // 2 % of the amount, and the bare percentage-point difference, are the typical slips.
    for (const answer of ["2000", "0,02", "2"]) expect(evaluateQuestion(faded, { answer })).toBe(false);
    expect(evaluateQuestion(faded, { answer: "" })).toBeFalsy();
    // Every place that restates the difference agrees with the model.
    const stated = `${costA - costB} Kč ročně na ${cz(terComparisonAmount)} Kč`;
    expect(block(lesson, "decision", "multipleChoiceQuestion").options.find((option) => option.id === "ter")!.explanation).toContain(stated);
    expect(block(lesson, "reflection", "writtenReflection").sampleAnswer).toContain(stated);
    expect(fundA.aumEurMillions / fundB.aumEurMillions).toBe(5);
  });

  it("categorises index, UCITS and costs as core criteria", () => {
    const categorize = block(lesson, "categorize", "categorizeQuestion");
    expect(categorize.items.filter((item) => item.categoryId === "core").map((item) => item.id)).toEqual(["index", "ucits", "costs"]);
    expect(evaluateQuestion(categorize, correctAnswers(categorize))).toBe(true);
    expect(evaluateQuestion(categorize, wrongAnswers(categorize))).toBe(false);
  });

  it("saves an eight-criterion checklist as a required lesson output", () => {
    const checklist = block(lesson, "checklist", "checklist");
    expect(checklist.items).toHaveLength(8);
    expect(block(lesson, "criteria", "workedExample").steps).toHaveLength(8);
    const step = steps.find((entry) => entry.blocks.includes(checklist))!;
    expect(stepArtifactRequirements(step)).toContainEqual({ kind: "lesson_output", source: "current_lesson", blockId: "checklist" });
    expect(validOutputForBlock(checklist, { type: "checklist", blockId: "checklist", checkedItemIds: ["index", "broker"] })).toBe(true);
    expect(validOutputForBlock(checklist, { type: "checklist", blockId: "checklist", checkedItemIds: ["unknown"] })).toBe(false);
  });

  it("explains every wrong option", () => {
    for (const id of ["prediction", "decision", "trap-esg", "recall"]) {
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

  it("labels model content, uses fictional funds and recommends no product", () => {
    for (const id of ["opening", "overview-intro", "worked", "faded", "decision", "trap-esg"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "overview", "documentTap").document.eyebrow).toContain("fiktivní");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    const text = JSON.stringify(lesson.blocks);
    for (const brand of ["iShares", "Vanguard", "Xtrackers", "Amundi", "SPDR", "Invesco", "MSCI", "FTSE", "S&P"]) expect(text).not.toContain(brand);
    expect(text).not.toMatch(/nejlepší ETF(?!“)/);
  });
});
