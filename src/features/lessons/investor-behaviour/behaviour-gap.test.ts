import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { factRegistry } from "@/features/facts/registry";
import { resolveFact } from "@/features/facts/resolve";
import { prepareLessonFacts } from "@/features/facts/lesson-facts";
import { BEHAVIOUR_CRISIS_IDS, getMission } from "@/features/missions/registry";
import { stepMissionIds } from "@/features/missions/requirements";
import { validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { block } from "../lesson-test-support";
import { isQuestion, evaluateQuestion } from "../question-evaluation";
import { getGuidedSteps } from "../steps";
import { behaviourGapLesson as lesson } from "./behaviour-gap";

const steps = getGuidedSteps(lesson);
const research = (key: string) => Number(resolveFact(key, lesson.factContext!.asOf!, factRegistry).value.amount);

describe("Mezera chování · B.1.1 (#286)", () => {
  it("registers a new stable identity, prerequisite and B skill without new Lab requirements or capital", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ moduleId: "module-investor-behaviour", moduleSlug: "investor-behaviour", slug: "behaviour-gap" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "B.1.1", prerequisites: ["first-plan-ips"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/investor-behaviour/behaviour-gap");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.skillId === "behaviour-gap").map((item) => item.lessonId)).toEqual([lesson.id, lesson.id]);
  });
  it("starts with experience, requires three historical replays and a saved safeguard, and accepts waiting", () => {
    expect(steps[0].blocks.map((entry) => entry.id)).toEqual(["opening", "replay"]);
    expect(stepMissionIds(steps[0])).toEqual([]);
    const mission = block(lesson, "verification", "labMission");
    expect(getMission(mission.missionId!, lesson.id)).toMatchObject({ check: "behaviour-crises-v1", params: { scenarios: BEHAVIOUR_CRISIS_IDS } });
    expect(steps.find((step) => step.blocks.includes(mission))!.requiredArtifact).toEqual({ kind: "investment_plan", source: "any_lesson" });
    expect(block(lesson, "opening", "paragraph").content).toContain("Čekat podle plánu");
  });
  it("recomputes model differences and the fixed historical-edition question from registered inputs", () => {
    const faded = block(lesson, "faded", "fadedExample");
    expect(faded.blank).toMatchObject({ answer: 3 - 5, tolerance: 0 });
    expect(block(lesson, "worked", "workedExample").steps.at(-1)!.value).toContain(String(-2 - 5).replace("-", "−"));
    const question = block(lesson, "research-calculation", "numericQuestion");
    expect(question.answer).toBeCloseTo(research("morningstar.fund_2025") - research("morningstar.investor_2025"), 10);
    expect(question.answer).toBe(research("morningstar.gap"));
    for (const answer of ["1,2", "1.2"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    for (const answer of ["", "12", "0.012", "1.3"]) expect(evaluateQuestion(question, { answer })).not.toBe(true);
  });
  it("pins research to verified primary sources, preserves the earlier unverified edition and resolves the header date", () => {
    expect(resolveFact("morningstar.gap", "2026-10-21", factRegistry).verificationStatus).toBe("unverified");
    const result = prepareLessonFacts(lesson, factRegistry, { today: "2026-10-28", published: true });
    expect(result.notice?.verifiedAt).toBe("2026-10-28");
    expect(result.facts).toHaveLength(6);
    for (const fact of result.facts) {
      expect(fact.verificationStatus).toBe("primary");
      expect(fact.research).toMatchObject({ period: "1. 1. 2015 – 31. 12. 2024" });
      expect(fact.research?.limitations).toContain("nikoli kauzální");
    }
    expect(JSON.stringify(result.lesson)).not.toContain("{{");
  });
  it("covers blocks once and validates every answer on the server, with no final question", () => {
    expect(steps.flatMap((step) => step.blocks.map((entry) => entry.id)).sort()).toEqual(lesson.blocks.map((entry) => entry.id).sort());
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
  });
});
