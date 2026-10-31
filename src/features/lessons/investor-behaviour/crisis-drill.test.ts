import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { milestoneRules } from "@/features/milestones/registry";
import { getMission, missions } from "@/features/missions/registry";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { MODEL_CRISIS_LEVELS } from "@/features/training/model-crisis";
import { trainingScenarios } from "@/features/training/scenarios";
import { stepArtifactRequirements } from "../output-contract";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { crisisDrillExample } from "./crisis-drill";

const lesson = getAuthoredLesson("investor-behaviour", "crisis-drill")!;
const steps = getGuidedSteps(lesson);
const levels = MODEL_CRISIS_LEVELS.map(Number);

describe("Krizový nácvik −30 % s vlastním plánem · B.1.10 (#295)", () => {
  it("publishes its stable identity as B.1.10 of milestone A, without expanding the Lab prerequisites or rewards", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "behaviour-crisis-drill", moduleId: "module-investor-behaviour", moduleSlug: "investor-behaviour", slug: "crisis-drill" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/investor-behaviour/crisis-drill");
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "B.1.10", required: "required", prerequisites: ["first-plan-ips"] });
    expect(milestoneRules.find((milestone) => milestone.id === "A")!.lessonCodes).toContain("B.1.10");
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    // Policy v4: level B lessons earn XP only; the drill itself never rewards a trade.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
  });

  it("verifies a finished model crisis in the isolated training Lab, not the personal portfolio", () => {
    const drill = block(lesson, "drill", "labMission");
    expect(drill.mission.target).toBe("/lab/training");
    expect(getMission(drill.missionId!, lesson.id)).toMatchObject({ context: "training", check: "crisis-drill-finished-v1", params: { scenarioId: "model-crisis-v1" } });
    expect(trainingScenarios.find((scenario) => scenario.id === "model-crisis-v1")?.kind).toBe("model");
    expect(missions.filter((mission) => mission.lessonId === lesson.id)).toHaveLength(1);
    expect(drill.mission.afterReturn).toContain("Osobní portfolio, cvičný kapitál ani odměny se nemění");
    expect(drill.mission.afterReturn).toContain("dokončením, ne výsledkem");
  });

  it("derives every number about the model crisis from the scenario levels", () => {
    const deepest = levels.indexOf(Math.min(...levels));
    expect(100 - levels[deepest]).toBe(30);
    expect(deepest).toBe(6);
    const month = crisisDrillExample.pressureMonth;
    const pressure = block(lesson, "pressure", "personaDecision");
    expect(pressure.persona.facts[0].value).toBe(`${month}. z ${levels.length - 1}`);
    expect(pressure.persona.facts[1].value).toBe(`−${100 - levels[month]} %`);
    expect(pressure.prompt).toContain(`index je −${100 - levels[month]} % od začátku`);
    expect(block(lesson, "drill", "labMission").mission.steps[1]).toContain(`klesne až o ${100 - levels[deepest]} %`);
    expect(block(lesson, "worked", "workedExample").introduction).toContain(`v ${deepest}. měsíci`);
    // One contribution arrives with every revealed month of the 24-month replay.
    expect(block(lesson, "drill", "labMission").analysis.rows[1].status).toBe(`${levels.length - 1} z ${levels.length - 1} měsíců`);
  });

  it("recomputes the worked and faded allocation deviations from their stated inputs", () => {
    const { worked, faded } = crisisDrillExample;
    const values = block(lesson, "worked", "workedExample").steps.map((step) => step.value);
    expect(values).toEqual(["80 % v indexu", "±5 p. b., tedy 75–85 %", "72 %", "|72 − 80| = 8 p. b. > 5 p. b."]);
    expect(Math.abs(worked.investedPercent - worked.targetPercent)).toBeGreaterThan(worked.bandPoints);
    const fadedBlock = block(lesson, "faded", "fadedExample");
    expect(fadedBlock.steps.map((step) => step.value).slice(0, 3)).toEqual(["70 % v indexu", "±5 p. b.", "63 %"]);
    const expected = Math.abs(63 - 70);
    expect(expected).toBe(7);
    expect(fadedBlock.blank).toMatchObject({ input: "number", answer: expected, tolerance: 0, unit: "p. b." });
    expect(expected).toBeGreaterThan(faded.bandPoints);
    expect(evaluateQuestion(fadedBlock, { answer: "7" })).toBe(true);
    for (const wrong of ["-7", "7,5", "10", ""]) expect(evaluateQuestion(fadedBlock, { answer: wrong })).not.toBe(true);
  });

  it("checks the band rule of the mastery item against the training Lab's sell rule", () => {
    const recall = block(lesson, "recall", "multipleChoiceQuestion");
    const target = 60, band = 10, share = 72;
    // Training domain: a band-mode sell is within the plan only above target + band.
    expect(share > target + band).toBe(true);
    expect(recall.correctOptionId).toBe("yes-band");
    expect(recall.options.find((option) => option.id === "yes-band")!.label).toContain(`(${target + band} %)`);
    expect(recall.correctExplanation).toContain(`${target} + ${band} = ${target + band} %`);
    expect(68 > target + band).toBe(false);
  });

  it("judges the process: finishing completes the lesson, keeping the plan is not graded by outcome", () => {
    expect(block(lesson, "predict", "multipleChoiceQuestion").correctOptionId).toBe("plan-kept");
    expect(block(lesson, "interpretation", "multipleChoiceQuestion").correctOptionId).toBe("broken");
    expect(block(lesson, "criteria", "conceptCallout").content).toContain("lekci splníš i tehdy, když se plánu nedržíš");
    for (const id of ["predict", "interpretation", "recall"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
  });

  it("offers an IPS revision and a reflection; the reflection checklist is optional", () => {
    const revision = steps.find((step) => step.blocks.some((item) => item.id === "builder"))!;
    // The drill already needs a saved IPS, so this requirement never blocks; a new version is optional.
    expect(stepArtifactRequirements(revision)).toEqual([{ kind: "investment_plan", source: "any_lesson" }]);
    expect(block(lesson, "builder", "interactiveFigure").figure).toBe("ips-builder");
    const checklist = steps.find((step) => step.blocks.some((item) => item.id === "lessons"))!;
    expect(stepArtifactRequirements(checklist)).toEqual([undefined]);
    expect(block(lesson, "reflection", "writtenReflection").rubric).toHaveLength(3);
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

  it("labels the simulation and model examples and recommends no product", () => {
    for (const id of ["opening", "sources"]) expect(JSON.stringify(block(lesson, id, "paragraph"))).toContain("Simulace · Deterministická ukázková data");
    expect(block(lesson, "pressure", "personaDecision").prompt).toContain("Simulace");
    expect(block(lesson, "pressure", "personaDecision").disclaimer).toContain("Modelový příklad");
    for (const id of ["worked", "faded"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "interpretation", "multipleChoiceQuestion").prompt).toContain("Modelový příklad");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    expect(JSON.stringify(lesson)).not.toMatch(/doporučujeme|kup si|nejlepší broker/i);
  });
});
