import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { getMission } from "@/features/missions/registry";
import { stepMissionIds } from "@/features/missions/requirements";
import { MODEL_CRISIS_LEVELS } from "@/features/training/model-crisis";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("first-plan", "automation")!;
const steps = getGuidedSteps(lesson);

// Michal's model inputs, as stated in the lesson.
const monthly = 2_500;
const minimumFee = 40;

describe("Automatizace · 2.5.2 (#196)", () => {
  it("publishes its stable identity and L2 placement after the IPS lesson without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "first-plan-automation", moduleId: "module-first-plan", moduleSlug: "first-plan", slug: "automation" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.5.2", prerequisites: ["first-plan-ips"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/first-plan/automation");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall-why", "recall-losses"]);
    // A skill owned by another display module would list it twice on Progress.
    expect(skillItems.filter((item) => item.skillId === "automation").every((item) => item.lessonId === lesson.id)).toBe(true);
  });

  it("requires the server-verified training mission on the Lab step and nowhere else", () => {
    const mission = block(lesson, "mission", "labMission");
    expect(mission.mission.target).toBe("/lab/training");
    expect(getMission(mission.missionId!, lesson.id)).toMatchObject({ context: "training", check: "training-contributions-v1", params: { months: 12 } });
    expect(mission.mission.goal).toContain("12 měsíců");
    expect(steps.map((step) => stepMissionIds(step))).toEqual(steps.map((step) => step.blocks.includes(mission) ? ["training-contributions-v1"] : []));
  });

  it("recomputes the deposits over three years, the fee share and the sample mission totals", () => {
    const question = block(lesson, "total", "numericQuestion");
    const months = 3 * 12;
    expect(question.answer).toBe(months * monthly);
    expect(question.correctExplanation).toContain(`${months} × 2 500 Kč = 90 000 Kč`);
    for (const answer of ["90000", "90000,00"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    // One year only, or months without converting years, are the typical slips.
    for (const answer of ["30000", "7500", "90250"]) expect(evaluateQuestion(question, { answer })).toBe(false);
    expect(block(lesson, "worked", "workedExample").steps[3].value).toContain(`${String(minimumFee / monthly * 100).replace(".", ",")} %`);
    // The sample analysis follows the model crisis path the training Lab uses: 100 → 70 → 87 over twelve months.
    const rows = block(lesson, "mission", "labMission").analysis.rows;
    expect(rows.map((row) => row.label)).toEqual([`Měsíce 1–6 · index ze ${MODEL_CRISIS_LEVELS[0]} na ${MODEL_CRISIS_LEVELS[6]}`, `Měsíce 7–12 · index ze ${MODEL_CRISIS_LEVELS[6]} na ${MODEL_CRISIS_LEVELS[12]}`]);
    expect(rows.map((row) => row.start)).toEqual([6, 12].map((months) => `${(months * monthly).toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč vloženo`));
  });

  it("orders salary, transfer and purchase in the faded example", () => {
    const question = block(lesson, "faded", "fadedExample");
    expect(question.blank).toMatchObject({ input: "choice", correctOptionId: "after" });
    expect(evaluateQuestion(question, { answer: "after" })).toBe(true);
    for (const answer of ["before", "dip"]) expect(evaluateQuestion(question, { answer })).toBe(false);
  });

  it("explains every wrong option and keeps the contribution going in a dip", () => {
    for (const id of ["prediction", "dip-decision", "recall-why", "recall-losses"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
    expect(block(lesson, "dip-decision", "multipleChoiceQuestion").correctOptionId).toBe("continue");
    expect(block(lesson, "recall-losses", "multipleChoiceQuestion").correctOptionId).toBe("protects-plan");
    expect(block(lesson, "reflection", "writtenReflection").rubric.map((item) => item.id)).toEqual(["amount-day", "instrument", "costs", "fall"]);
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
    expect(steps.filter((step) => step.kind === "mastery")).toHaveLength(2);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("labels model content, takes research figures from the fact registry and recommends no product", () => {
    for (const id of ["opening", "worked", "faded", "total", "dip"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    const smart = block(lesson, "smart", "conceptCallout").content;
    expect(smart).toContain("{{smart.mira_pred}}");
    expect(smart).toContain("{{smart.mira_po}}");
    expect(smart).not.toMatch(/\d+,\d+ %/);
    expect(block(lesson, "mission-intro", "paragraph").content).toContain("cvičné portfolio ani cvičný kapitál se nemění");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
