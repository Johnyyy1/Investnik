import { describe, expect, it } from "vitest";
import { artifactPayloadSchemas } from "@/features/artifacts/schemas";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { DECISION_CARDS, safeguardsForCard, savedSafeguards, type DecisionCardKind } from "@/features/portfolio/decision-cards";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { stepArtifactRequirements, validOutputForBlock } from "../output-contract";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { SAFEGUARD_SET_BLOCK_ID, SAFEGUARD_SET_LESSON_ID, safeguardSet } from "./safeguard-set";

const lesson = getAuthoredLesson("investor-behaviour", "debiasing-tools")!;
const steps = getGuidedSteps(lesson);
const stepOf = (id: string) => steps.find((step) => step.blocks.some((item) => item.id === id))!;
const output = (checkedItemIds: string[]) => ({ kind: "lesson_output", sourceLessonId: SAFEGUARD_SET_LESSON_ID, payload: { type: "checklist", blockId: SAFEGUARD_SET_BLOCK_ID, checkedItemIds } });

describe("Nástroje proti vlastním chybám · B.1.9 (#294)", () => {
  it("publishes its stable identity in B.1 after its content prerequisites, without expanding the Lab prerequisites", () => {
    expect(lesson.id).toBe(SAFEGUARD_SET_LESSON_ID);
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "behaviour-debiasing-tools", moduleId: "module-investor-behaviour", moduleSlug: "investor-behaviour", slug: "debiasing-tools" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/investor-behaviour/debiasing-tools");
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "B.1.9", required: "required", skills: ["debiasing-safeguards"] });
    expect(getLessonPlacement(lesson.id)?.prerequisites).toEqual(["behaviour-overconfidence", "behaviour-disposition-effect", "behaviour-loss-aversion"]);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    expect(skillItems.filter((item) => item.skillId === "debiasing-safeguards").every((item) => item.lessonId === lesson.id)).toBe(true);
    // Policy v4: level B lessons earn XP only.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
  });

  it("maps six mistakes to six safeguards and asks three matching questions plus one mastery item", () => {
    expect(safeguardSet.map((entry) => entry.mistake)).toEqual(["Mezera chování", "Přehnaná sebedůvěra", "Dispoziční efekt", "Krátkozrakost", "FOMO", "Příběhy"]);
    expect(block(lesson, "map", "workedExample").steps).toEqual(safeguardSet.map((entry) => ({ label: entry.mistake, value: entry.action })));
    // Each matching question names the safeguard of the set as its correct answer.
    for (const [question, id] of [["match-trading", "checklist"], ["match-fomo", "watchlist"], ["match-story", "mechanism"], ["recall", "rebalance"]] as const) {
      const choice = block(lesson, question, "multipleChoiceQuestion");
      expect(choice.correctOptionId).toBe(id);
      expect(safeguardSet.some((entry) => entry.id === id)).toBe(true);
      expect(choice.options.filter((option) => option.id !== choice.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
    expect(block(lesson, "recall", "multipleChoiceQuestion").prompt).toContain("dispozičním efektem");
    expect(stepOf("recall").kind).toBe("mastery");
  });

  it("saves the pre-mortem as a rubric output with three reasons and adjustments", () => {
    const premortem = block(lesson, "premortem-output", "rubricSelfAssessment");
    expect(premortem.prompt).toContain("3 nejpravděpodobnější důvody");
    expect(premortem.prompt).toContain("úpravu plánu");
    expect(premortem.criteria.map((criterion) => criterion.id)).toEqual(["reasons", "adjustments", "control"]);
    expect(stepArtifactRequirements(stepOf("premortem-output"))).toContainEqual({ kind: "lesson_output", blockId: "premortem-output" });
    // The worked pre-mortem shows exactly three reasons, each with an adjustment.
    const example = block(lesson, "premortem-example", "workedExample");
    expect(example.steps).toHaveLength(3);
    expect(example.steps.every((step) => step.label.startsWith("Důvod") && step.value.startsWith("Úprava:"))).toBe(true);
    // A lowest-level submission is still a valid output: continuation needs submission, not a grade.
    expect(validOutputForBlock(premortem, { type: "rubricSelfAssessment", blockId: premortem.id, text: "Prodám v propadu.", ratings: premortem.criteria.map((criterion) => ({ criterionId: criterion.id, level: 1 })) })).toBe(true);
  });

  it("saves the safeguard set as a required checklist and requires a saved IPS for the plan update", () => {
    const set = block(lesson, SAFEGUARD_SET_BLOCK_ID, "checklist");
    expect(set.items.map((item) => item.id)).toEqual(safeguardSet.map((entry) => entry.id));
    expect(stepArtifactRequirements(stepOf(SAFEGUARD_SET_BLOCK_ID))).toContainEqual({ kind: "lesson_output", source: "current_lesson", blockId: SAFEGUARD_SET_BLOCK_ID });
    expect(stepOf("builder").requiredArtifact).toEqual({ kind: "investment_plan", source: "any_lesson" });
    expect(block(lesson, "builder", "interactiveFigure").figure).toBe("ips-builder");
    // Every safeguard fits the safeguards artifact contract the Lab cards display.
    expect(artifactPayloadSchemas.safeguards.safeParse({ rules: safeguardSet.map(({ trigger, action }) => ({ trigger, action })) }).success).toBe(true);
  });

  it("turns the saved set into Lab card rules, only on the cards they belong to", () => {
    const own = [{ trigger: "Pokles trhu", action: "Přečtu si plán." }];
    const rules = savedSafeguards(own, [output(["rebalance", "watchlist", "unknown"])]);
    expect(rules.map((rule) => rule.trigger)).toEqual(["Pokles trhu", "Prodej", "Tip ze zpráv nebo od známých"]);
    expect(safeguardsForCard("disposition", rules).map((rule) => rule.trigger)).toEqual(["Pokles trhu", "Prodej"]);
    expect(safeguardsForCard("turnover", rules).map((rule) => rule.trigger)).toEqual(["Pokles trhu", "Tip ze zpráv nebo od známých"]);
    // Other lessons' outputs and malformed rows are ignored.
    expect(savedSafeguards([], [{ ...output(["plan"]), sourceLessonId: "behaviour-overconfidence" }, { kind: "lesson_output", payload: null }])).toEqual([]);
    // Every safeguard appears on at least one existing card kind.
    const kinds = Object.keys(DECISION_CARDS) as DecisionCardKind[];
    for (const entry of safeguardSet) expect(entry.cards.length && entry.cards.every((kind) => kinds.includes(kind))).toBeTruthy();
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

  it("labels model content, states no research figure and recommends no product", () => {
    for (const id of ["opening", "match-trading-context", "match-fomo-context", "match-story-context", "premortem-example"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    // The pre-mortem research is described qualitatively; no figure from it is stated.
    expect(block(lesson, "premortem", "explanation").content).not.toMatch(/\d+\s?%/);
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    expect(JSON.stringify(lesson.blocks)).not.toMatch(/\b(kup|kupte)\s+(tento|tenhle)\b/i);
  });
});
