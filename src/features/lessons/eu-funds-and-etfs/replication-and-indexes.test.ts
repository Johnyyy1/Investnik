import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { factRegistry } from "@/features/facts/registry";
import { prepareLessonFacts } from "@/features/facts/lesson-facts";
import { resolveFact } from "@/features/facts/resolve";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { allWorldFund, samplingFund, worldFund } from "./replication-and-indexes";

const lesson = getAuthoredLesson("eu-funds-and-etfs", "replication-and-indexes")!;
const steps = getGuidedSteps(lesson);
const fact = (key: string) => resolveFact(key, lesson.factContext!.asOf!, factRegistry);

describe("Replikace a hlavní globální indexy · 2.3.4 (#179)", () => {
  it("publishes a new stable identity after 2.3.6 in storage order, with existing prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "etfs-replication-and-indexes", moduleId: "module-eu-funds-and-etfs", moduleSlug: "eu-funds-and-etfs", slug: "replication-and-indexes" });
    const order: string[] = availableLessons.map((entry) => entry.id);
    expect(order.indexOf(lesson.id)).toBe(order.indexOf("etfs-selection-checklist") + 1);
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.3.4", required: "required", prerequisites: ["foundations-etfs-indexes", "foundations-funds"], skills: ["index-replication"] });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/eu-funds-and-etfs/replication-and-indexes");
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    // Policy v4: an L2 lesson outside Foundations earns 2 000 Kč once.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
  });

  it("recomputes the look-through worked example and exercise from their inputs", () => {
    const worked = block(lesson, "look-through-worked", "workedExample");
    expect(worked.introduction).toContain("50 000 Kč");
    expect(worked.steps.map((step) => step.value)).toEqual([`50 000 Kč × ${worldFund.usaPct} % = ${(50_000 * 73 / 100).toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`, "50 000 Kč × 0 % = 0 Kč"]);
    expect(worldFund).toEqual({ amount: 50_000, usaPct: 73, emergingPct: 0 });

    const question = block(lesson, "look-through-question", "multiNumericQuestion");
    expect(allWorldFund).toEqual({ amount: 100_000, usaPct: 63, emergingPct: 10 });
    expect(question.prompt).toContain("USA 63 %");
    expect(question.prompt).toContain("rozvíjející se trhy 10 %");
    expect(question.prompt).toContain("100 000 Kč");
    expect(question.answers.map(({ id, answer, tolerance, unit }) => ({ id, answer, tolerance, unit }))).toEqual([
      { id: "usa", answer: 100_000 * 0.63, tolerance: 0, unit: "Kč" },
      { id: "emerging", answer: 100_000 * 0.1, tolerance: 0, unit: "Kč" },
    ]);
    expect(evaluateQuestion(question, { usa: "63000", emerging: "10000" })).toBe(true);
    expect(evaluateQuestion(question, { usa: "63000", emerging: "10000,0" })).toBe(true);
    // Typical slips: the share itself instead of Kč, or the EM share of the USA amount.
    for (const answers of [{ usa: "63", emerging: "10" }, { usa: "63000", emerging: "6300" }, { usa: "63000", emerging: "" }]) expect(evaluateQuestion(question, answers)).toBeFalsy();
    // The model shares stay close to the dated factsheets they illustrate (rounded to whole percent).
    expect(Math.round(Number(fact("trh.ftse_aw_usa").value.amount))).toBe(allWorldFund.usaPct);
    expect(Math.round(Number(fact("trh.ftse_aw_em").value.amount))).toBe(allWorldFund.emergingPct);
    expect(Math.round(Number(fact("trh.msci_world_usa").value.amount))).toBe(worldFund.usaPct);
  });

  it("states the replication question's inputs and grades sampling, counterparty risk and MSCI World", () => {
    expect(samplingFund.held).toBeLessThan(samplingFund.inIndex);
    expect(block(lesson, "sampling-question", "multipleChoiceQuestion").prompt).toContain("1 500 z nich");
    expect(block(lesson, "sampling-question", "multipleChoiceQuestion").prompt).toContain("4 000 akcií");
    expect(block(lesson, "sampling-question", "multipleChoiceQuestion").correctOptionId).toBe("sampling");
    expect(block(lesson, "risk-question", "multipleChoiceQuestion").correctOptionId).toBe("counterparty");
    expect(block(lesson, "index-question", "multipleChoiceQuestion").correctOptionId).toBe("world");
    expect(block(lesson, "recall", "multipleChoiceQuestion").correctOptionId).toBe("emerging");
    for (const id of ["prediction", "sampling-question", "risk-question", "index-question", "recall"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
  });

  it("renders index weights only from verified, dated factsheet facts", () => {
    const { lesson: resolved, facts, notice } = prepareLessonFacts(lesson, factRegistry, { today: "2026-11-11", published: true });
    expect(facts.map((entry) => entry.key).sort()).toEqual(["trh.ftse_aw_cesko", "trh.ftse_aw_em", "trh.ftse_aw_usa", "trh.msci_acwi_em", "trh.msci_acwi_usa", "trh.msci_world_usa"]);
    expect(facts.every((entry) => entry.verificationStatus === "primary" && entry.period.includes("30. 10. 2026") && entry.sources.length > 0)).toBe(true);
    expect(notice?.verifiedAt).toBe("2026-11-11");
    const weights = resolved.blocks.find((entry) => entry.id === "weights");
    expect(weights).toMatchObject({ content: expect.stringContaining("K 30. 10. 2026 měly USA v MSCI World váhu 72,77 %") });
    expect(JSON.stringify(weights)).not.toContain("{{");
    // The derived EM share matches the factsheet market caps it is computed from.
    expect(Number((11_288_377.65 / 100_900_111.81 * 100).toFixed(2))).toBe(fact("trh.msci_acwi_em").value.amount);
    expect(Number((9_958_510 / 103_838_479 * 100).toFixed(2))).toBe(fact("trh.ftse_aw_em").value.amount);
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

  it("labels model and historical content, uses fictional funds and recommends no product", () => {
    for (const id of ["opening", "sampling-question", "look-through-worked", "look-through-question"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "indexes", "workedExample").title).toContain("Historická data");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    const text = JSON.stringify(lesson.blocks);
    for (const brand of ["iShares", "Vanguard", "Xtrackers", "Amundi", "SPDR", "Invesco", "Lyxor"]) expect(text).not.toContain(brand);
    expect(text).not.toMatch(/doporuču|nejlepší/i);
  });
});
