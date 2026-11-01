import { describe, expect, it } from "vitest";
import type { ProcessFeedback } from "@/features/portfolio/process";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { displayModules, getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { capstoneOutputs, capstoneSubmissionForOutput } from "@/features/milestones/capstone-output";
import { capstoneOutcome, diversifiedCoreCheck, ipsAlignmentCheck, crisisPlanCheck, selfAssessmentSchema } from "@/features/milestones/criteria";
import { capstoneThresholds, getCapstone, milestoneRules } from "@/features/milestones/registry";
import { getMission, missions } from "@/features/missions/registry";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { stepArtifactRequirements, validOutputForBlock } from "../output-contract";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { CAPSTONE_A_OUTPUT_BLOCK_ID, capstoneAExample } from "./capstone-a";

const lesson = getAuthoredLesson("first-plan", "capstone-a")!;
const steps = getGuidedSteps(lesson);
const capstone = getCapstone("capstone-a-v1")!;
const allocation = (value: string): ProcessFeedback["allocation"] => ({ value, threshold: null, status: "within-plan", lines: [] });
const bps = (percent: number) => String(percent * 100);

describe("Závěrečný projekt A · 2.5.4 (#198)", () => {
  it("publishes the reserved capstone identity as 2.5.4 of milestone A without changing rewards or the Lab prerequisite", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "first-plan-capstone-a", moduleId: "module-first-plan", moduleSlug: "first-plan", slug: "capstone-a", estimatedMinutes: 25 });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/first-plan/capstone-a");
    expect(lesson.title).toBe(capstone.title);
    expect(capstone.lessonId).toBe(lesson.id);
    const placement = getLessonPlacement(lesson.id)!;
    expect(placement).toMatchObject({ displayCode: "2.5.4", required: "required", prerequisites: ["first-plan-automation", "first-plan-first-purchase"] });
    expect(displayModules.find((module) => module.code === placement.displayModule)?.levelId).toBe("L2");
    expect(milestoneRules.find((rule) => rule.id === "A")).toMatchObject({ capstoneId: capstone.id, levels: expect.arrayContaining(["L2"]) });
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    // No new skill items: the module's checkpoint scope, and so milestone A's skill requirement, is unchanged.
    expect(skillItems.filter((item) => item.lessonId === lesson.id)).toEqual([]);
    // Policy v4 as written, by registered level; the lesson does not change it (#120).
    expect(lessonReward(lesson.id)).toEqual(lessonReward("first-plan-first-purchase"));
  });

  it("states the rubric's thresholds from the registry, not as separate literals", () => {
    expect(capstoneThresholds).toMatchObject({ ipsMaxDeviationBps: 500, singleStockMaxBps: 1000, crisisMaxSellsOutsidePlan: 0 });
    const overview = block(lesson, "rubric-overview", "conceptCallout").content;
    expect(overview).toContain("nejvýše 5 p. b.");
    expect(overview).toContain("nad 10 % portfolia");
    expect(overview).toContain("aspoň úrovně 3");
    expect(block(lesson, "alignment", "explanation").content).toContain("nejvýše 5 p. b.");
    expect(block(lesson, "diversification", "explanation").content).toContain("přesáhnout 10 % celého portfolia včetně hotovosti");
  });

  it("recomputes the worked and faded IPS deviations, which the server check judges the same way", () => {
    const { worked, faded } = capstoneAExample;
    for (const pair of [worked, faded]) {
      expect(Object.values(pair.target).reduce((a: number, b: number) => a + b, 0)).toBe(100);
      expect(Object.values(pair.actual).reduce((a: number, b: number) => a + b, 0)).toBe(100);
    }
    expect(block(lesson, "worked", "workedExample").steps.map((step) => step.value)).toEqual([
      "cíl 70 %, v Labu 66 % → 4 p. b.", "cíl 20 %, v Labu 23 % → 3 p. b.", "cíl 10 %, v Labu 11 % → 1 p. b.", "4 p. b. ≤ 5 p. b.",
    ]);
    expect(ipsAlignmentCheck(allocation(bps(Math.max(4, 3, 1)))).status).toBe("pass");
    const fadedBlock = block(lesson, "faded", "fadedExample");
    const expected = Math.max(Math.abs(52 - 60), Math.abs(35 - 30), Math.abs(13 - 10));
    expect(expected).toBe(8);
    expect(fadedBlock.blank).toMatchObject({ input: "number", answer: expected, tolerance: 0, unit: "p. b." });
    expect(ipsAlignmentCheck(allocation(bps(expected))).status).toBe("fail");
    expect(evaluateQuestion(fadedBlock, { answer: "8" })).toBe(true);
    // Summing the gaps or reading one line only are the typical wrong answers.
    for (const wrong of ["16", "5", "3", "-8", ""]) expect(evaluateQuestion(fadedBlock, { answer: wrong })).not.toBe(true);
  });

  it("marks exactly the overview rows the automatic alignment and diversification checks would fail", () => {
    const { overview } = capstoneAExample;
    const rows = Object.entries(overview);
    expect(rows.reduce((sum, [, row]) => sum + row.target, 0)).toBe(100);
    expect(rows.reduce((sum, [, row]) => sum + row.actual, 0)).toBe(100);
    const failing = rows.filter(([, row]) => ipsAlignmentCheck(allocation(bps(Math.abs(row.actual - row.target)))).status === "fail"
      || (row.stock && diversifiedCoreCheck({ valuationComplete: true, holdings: [{ assetType: "etf", portfolioWeightBasisPoints: bps(overview.a.actual) }, { assetType: "equity", portfolioWeightBasisPoints: bps(row.actual) }] }).status === "fail"))
      .map(([id]) => id);
    const tap = block(lesson, "diversification-tap", "documentTap");
    expect(tap.correctRowIds).toEqual(failing);
    expect(failing).toEqual(["c", "d", "e"]);
    expect(tap.document.rows.map((row) => [row.id, row.cells.target, row.cells.actual])).toEqual(rows.map(([id, row]) => [id, `${row.target} %`, `${row.actual} %`]));
    expect(evaluateQuestion(tap, correctAnswers(tap))).toBe(true);
    expect(evaluateQuestion(tap, { selected: "c" })).not.toBe(true);
  });

  it("recomputes the annual plan costs of the worked example and the independent task", () => {
    const { costsWorked, costsPractice } = capstoneAExample;
    const workedFees = 12 * costsWorked.feePerPurchaseKc, workedTer = costsWorked.averageBalanceKc * costsWorked.terPercent / 100;
    expect([workedFees, workedTer, workedFees + workedTer]).toEqual([180, 200, 380]);
    expect(block(lesson, "costs-worked", "workedExample").steps.map((step) => step.value)).toEqual(["12 × 15 Kč = 180 Kč", "100 000 Kč × 0,2 % = 200 Kč", "0 Kč · fond v Kč", "380 Kč"]);
    const perPurchase = costsPractice.monthlyContributionKc * costsPractice.purchaseFeePercent / 100;
    const expected = 12 * perPurchase + costsPractice.averageBalanceKc * costsPractice.terPercent / 100;
    expect([perPurchase, expected]).toEqual([10, 270]);
    const question = block(lesson, "costs-practice", "numericQuestion");
    expect(question).toMatchObject({ answer: expected, tolerance: 0.5, unit: "Kč" });
    expect(question.prompt).toContain("2 000 Kč měsíčně");
    expect(evaluateQuestion(question, { answer: "270" })).toBe(true);
    expect(evaluateQuestion(question, { answer: "270,4" })).toBe(true);
    // TER on the monthly contribution (120 + 5), fees once (10 + 150) or fees only.
    for (const wrong of ["125", "160", "120", ""]) expect(evaluateQuestion(question, { answer: wrong })).not.toBe(true);
  });

  it("verifies a finished model crisis in the isolated training Lab through the B10 check", () => {
    const drill = block(lesson, "drill", "labMission");
    expect(drill.mission.target).toBe("/lab/training");
    expect(getMission(drill.missionId!, lesson.id)).toMatchObject({ context: "training", check: "crisis-drill-finished-v1", params: { scenarioId: "model-crisis-v1" } });
    expect(missions.filter((mission) => mission.lessonId === lesson.id)).toHaveLength(1);
    expect(drill.mission.afterReturn).toContain("Osobní portfolio, cvičný kapitál ani odměny se nemění");
    expect(drill.analysis.rows.at(-1)).toMatchObject({ status: "Nehodnotí se" });
  });

  it("explains the capstone rule the outcome function applies in the mastery item", () => {
    const recall = block(lesson, "rubric-recall", "multipleChoiceQuestion");
    const checks = { "ips-alignment": ipsAlignmentCheck(allocation("300")), diversification: diversifiedCoreCheck({ valuationComplete: true, holdings: [{ assetType: "etf", portfolioWeightBasisPoints: "7000" }, { assetType: "equity", portfolioWeightBasisPoints: "1400" }] }), crisis: crisisPlanCheck({ finished: true, sellsOutsidePlan: 0 }) };
    const outcome = capstoneOutcome(capstone, checks, { ratings: capstone.criteria.map((criterion) => ({ criterionId: criterion.id, level: criterion.id === "diversification" ? 4 : 3 })), reflection: "Plán jsem dodržela." });
    expect(outcome.criteria.find((criterion) => criterion.criterionId === "diversification")!.level).toBe(2);
    expect(outcome.passed).toBe(false);
    expect(recall.prompt).toContain("se 14 % portfolia");
    expect(recall.correctOptionId).toBe("capped");
    expect(recall.options.find((option) => option.id === "capped")!.label).toContain("omezí na úroveň 2");
  });

  it("collects the capstone self-assessment with the registry's criteria and submits that output as capstone-a-v1", () => {
    const rubric = block(lesson, CAPSTONE_A_OUTPUT_BLOCK_ID, "rubricSelfAssessment");
    // Its own heading: the capstone title also ships in client chunks (Learn map, manifest), which check:lesson-bundle forbids for block copy.
    expect(rubric.title).not.toBe(capstone.title);
    expect(rubric.criteria).toEqual(capstone.criteria.map((criterion) => ({ id: criterion.id, label: criterion.title, levels: [...criterion.levels] })));
    expect(capstoneOutputs).toEqual([{ capstoneId: capstone.id, lessonId: lesson.id, blockId: rubric.id }]);
    const submitStep = steps.find((step) => step.blocks.some((item) => item.id === rubric.id))!;
    expect(stepArtifactRequirements(submitStep)).toEqual([undefined, { kind: "lesson_output", blockId: rubric.id }]);
    // Any level submits: continuing needs the submission, never a passing self-rating (NQ-33).
    for (const level of [1, 4]) {
      const payload = { type: "rubricSelfAssessment" as const, blockId: rubric.id, text: "Plán jsem dodržel, příspěvky šly dál.", ratings: rubric.criteria.map((criterion) => ({ criterionId: criterion.id, level })) };
      expect(validOutputForBlock(rubric, payload)).toBe(true);
      const submission = capstoneSubmissionForOutput({ content: { kind: "lesson_output", payload }, sourceLessonId: lesson.id })!;
      expect(submission.capstoneId).toBe(capstone.id);
      expect(selfAssessmentSchema(capstone).safeParse(submission.selfAssessment).success).toBe(true);
    }
    const partial = { type: "rubricSelfAssessment" as const, blockId: rubric.id, text: "x", ratings: [{ criterionId: "costs", level: 3 }] };
    expect(selfAssessmentSchema(capstone).safeParse(capstoneSubmissionForOutput({ content: { kind: "lesson_output", payload: partial }, sourceLessonId: lesson.id })!.selfAssessment).success).toBe(false);
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
    expect(steps.filter((step) => step.kind === "mastery").map((step) => step.blocks.map((item) => item.id))).toEqual([["diversification-tap"], ["rubric-recall"]]);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
    expect(stepArtifactRequirements(steps[1])).toEqual([{ kind: "investment_plan", source: "any_lesson" }]);
  });

  it("judges the process, labels model data and recommends no product", () => {
    expect(block(lesson, "predict", "multipleChoiceQuestion").correctOptionId).toBe("a");
    for (const id of ["predict", "rubric-recall"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
      expect(question.prompt).toContain("Modelový příklad");
    }
    for (const id of ["worked", "faded", "costs-worked", "costs-practice", "diversification-tap"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "sources", "paragraph").content).toContain("Simulace · Deterministická ukázková data");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    expect(block(lesson, "result", "explanation").content).toContain("první splněné se už nikdy neztratí");
    expect(JSON.stringify(lesson)).not.toMatch(/doporučujeme|kup si|nejlepší broker/i);
    expect(lessonLink(block(lesson, "next", "labBridge").lessonLinks![0].lessonId)).not.toBeNull();
  });
});
