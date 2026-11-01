import { describe, expect, it } from "vitest";
import { availableLessons } from "@/features/learning/catalog";
import { getDisplayModulePlacements } from "@/features/learning/curriculum";
import { moduleSkills } from "@/features/mastery/domain";
import { crisisPlanCheck, diversifiedCoreCheck, ipsAlignmentCheck } from "./criteria";
import { milestoneStates, scopeVersion, type MilestoneEvidence } from "./domain";
import { getCapstone, type MilestoneRule } from "./registry";

const day = (n: number) => new Date(Date.UTC(2026, 9, n, 10));
const none: MilestoneEvidence = { completions: [], attempts: [], submissions: [] };
const capstoneA = getCapstone("capstone-a-v1")!;
const autoCriteria = {
  "ips-alignment": ipsAlignmentCheck({ value: "100", threshold: null, status: "information", lines: [] }),
  diversification: diversifiedCoreCheck({ valuationComplete: true, holdings: [{ assetType: "etf", portfolioWeightBasisPoints: "9000" }] }),
  crisis: crisisPlanCheck({ finished: true, sellsOutsidePlan: 0 }),
};
const submission = (submittedAt: Date, level = 3) => ({ capstoneId: capstoneA.id, autoCriteria, submittedAt,
  selfAssessment: { ratings: capstoneA.criteria.map((criterion) => ({ criterionId: criterion.id, level })), reflection: "Držel/a jsem se plánu." } });

// A reachable A: level 1 only, with every L1 draft treated as published.
const rules: MilestoneRule[] = [{ id: "A", requires: [], levels: ["L1"], capstoneId: capstoneA.id }, { id: "B", requires: ["A"], levels: ["L3"], capstoneId: "capstone-b-v1" }];
const foundations = getDisplayModulePlacements("1.1").map((placement) => placement.lessonId);
const published = new Set([...availableLessons.map((lesson) => lesson.id), ...foundations, capstoneA.lessonId]);
const evidence = (overrides: Partial<MilestoneEvidence> = {}): MilestoneEvidence => ({
  completions: foundations.map((lessonId, index) => ({ lessonId, completedAt: day(1 + index % 3) })),
  attempts: moduleSkills("1.1").map((skillId) => ({ skillId, context: "checkpoint" as const, correct: true, attemptedAt: day(5) })),
  submissions: [submission(day(7))],
  ...overrides,
});

describe("derived milestone state", () => {
  it("opens milestone A from published lessons and keeps milestones with an unpublished capstone unavailable", () => {
    const states = milestoneStates(none);
    expect(states.map((state) => [state.id, state.status, state.achievedAt])).toEqual([["A", "open", null], ["B", "unavailable", null], ["C", "unavailable", null], ["D", "unavailable", null]]);
    const a = states[0];
    expect(a.requirements.find((item) => item.kind === "capstone")).toMatchObject({ status: "open", label: capstoneA.title });
    expect(a.requirements.find((item) => item.kind === "lessons")).toMatchObject({ status: "open", total: a.lessons.length });
    expect(states[1].requirements.find((item) => item.kind === "capstone")?.status).toBe("unavailable");
    const done = milestoneStates({ ...none, completions: [{ lessonId: "foundations-why-invest", completedAt: day(1) }] })[0];
    expect(done.requirements.find((item) => item.kind === "lessons")?.done).toBe(1);
    expect(done.lessons.find((lesson) => lesson.id === "foundations-why-invest")).toMatchObject({ displayCode: "1.1.1", done: true });
  });

  it("leaves drafts and modules with only drafts out of the scope", () => {
    const a = milestoneStates(none)[0];
    const ids = a.lessons.map((lesson) => lesson.id);
    // 1.1.10 and 2.1.1 sit beside published lessons; 2.4 holds nothing else.
    for (const draft of ["foundations-checkpoint", "broker-platform-types", "taxes-filing-obligation"]) expect(ids).not.toContain(draft);
    expect(ids).toEqual(expect.arrayContaining(["foundations-why-invest", "broker-fee-schedule", "first-plan-capstone-a", "behaviour-crisis-drill"]));
    expect(new Set(ids).size).toBe(ids.length);
    expect(a.lessons.every((lesson) => availableLessons.some((available) => available.id === lesson.id))).toBe(true);

    const noFoundations = new Set([...availableLessons.map((lesson) => lesson.id)].filter((id) => !foundations.includes(id)));
    const [withoutModule] = milestoneStates(none, rules, new Set([...noFoundations, capstoneA.lessonId, "broker-fee-schedule"]));
    // Level 1 has no published lesson left, so nothing remains in scope for this rule.
    expect(withoutModule.requirements.find((item) => item.kind === "lessons")?.status).toBe("unavailable");
    expect(withoutModule.requirements.some((item) => item.kind === "skills")).toBe(false);
  });

  it("stays unavailable for an empty scope, an unplaced code or an unpublished capstone", () => {
    const empty: MilestoneRule = { id: "A", requires: [], levels: [], capstoneId: capstoneA.id };
    expect(milestoneStates(evidence(), [empty], published)[0]).toMatchObject({ status: "unavailable", achievedAt: null, lessons: [] });
    expect(milestoneStates(evidence(), [{ ...rules[0], lessonCodes: ["9.9.9"] }], published)[0].status).toBe("unavailable");
    expect(milestoneStates(evidence(), [rules[0]], new Set(foundations))[0].status).toBe("unavailable");
  });

  it("does not count a draft listed by code, but counts it once it is published", () => {
    const rule: MilestoneRule = { ...rules[0], lessonCodes: ["2.4.1"] };
    const before = milestoneStates(evidence(), [rule], published)[0];
    expect(before).toMatchObject({ status: "achieved", achievedAt: day(7) });
    expect(before.lessons.map((lesson) => lesson.id)).not.toContain("taxes-filing-obligation");
  });

  it("reopens derived state when a required lesson is published and changes the scope version", () => {
    const rule: MilestoneRule = { ...rules[0], lessonCodes: ["2.4.1"] };
    const before = milestoneStates(evidence(), [rule], published)[0];
    const after = milestoneStates(evidence(), [rule], new Set([...published, "taxes-filing-obligation"]))[0];
    expect(after).toMatchObject({ status: "open", achievedAt: null });
    expect(after.requirements.find((item) => item.kind === "lessons")).toMatchObject({ status: "open", done: before.lessons.length, total: before.lessons.length + 1 });
    expect(after.scopeVersion).not.toBe(before.scopeVersion);
    // Completing the new lesson achieves it again, dated by that completion.
    const completed = evidence();
    completed.completions = [...completed.completions, { lessonId: "taxes-filing-obligation", completedAt: day(20) }];
    expect(milestoneStates(completed, [rule], new Set([...published, "taxes-filing-obligation"]))[0]).toMatchObject({ status: "achieved", achievedAt: day(20) });
  });

  it("fingerprints the scope deterministically, whatever the order", () => {
    expect(scopeVersion(["a", "b"], ["x", "y"], "c")).toBe(scopeVersion(["b", "a"], ["y", "x"], "c"));
    expect(scopeVersion(["a", "b"], ["x", "y"], "c")).toMatch(/^[0-9a-f]{16}$/);
    expect(new Set([scopeVersion(["a"], [], "c"), scopeVersion([], ["a"], "c"), scopeVersion(["a"], [], "d")]).size).toBe(3);
    expect(milestoneStates(none)[0].scopeVersion).toBe(milestoneStates(evidence())[0].scopeVersion);
  });

  it("is achieved when lessons, mastered skills and a passing capstone all exist, dated by the last of them", () => {
    const [a, b] = milestoneStates(evidence(), rules, published);
    expect(a).toMatchObject({ status: "achieved", achievedAt: day(7) });
    expect(a.requirements.map((item) => [item.kind, item.status])).toEqual([["lessons", "done"], ["skills", "done"], ["capstone", "done"]]);
    expect(b.requirements[0]).toMatchObject({ kind: "milestone", status: "done", satisfiedAt: day(7) });
    // Same data, same answer.
    expect(milestoneStates(evidence(), rules, published)).toEqual(milestoneStates(evidence(), rules, published));
  });

  it("stays achieved after a declining review or a later weaker submission", () => {
    const later = evidence();
    const declined = { ...later,
      attempts: [...later.attempts, ...moduleSkills("1.1").map((skillId) => ({ skillId, context: "review" as const, correct: false, attemptedAt: day(9) }))],
      submissions: [...later.submissions, submission(day(10), 1)] };
    expect(milestoneStates(declined, rules, published)[0]).toMatchObject({ status: "achieved", achievedAt: day(7) });
  });

  it("stays open without every requirement and counts only checks that passed", () => {
    expect(milestoneStates(evidence({ submissions: [] }), rules, published)[0]).toMatchObject({ status: "open", achievedAt: null });
    expect(milestoneStates(evidence({ submissions: [submission(day(7), 2)] }), rules, published)[0].status).toBe("open");
    expect(milestoneStates(evidence({ attempts: [] }), rules, published)[0].requirements.find((item) => item.kind === "skills")).toMatchObject({ status: "open", done: 0 });
    const failedCheck = { ...submission(day(7), 4), autoCriteria: { ...autoCriteria, crisis: crisisPlanCheck({ finished: true, sellsOutsidePlan: 1 }) } };
    expect(milestoneStates(evidence({ submissions: [failedCheck] }), rules, published)[0].status).toBe("open");
    // A lesson answer alone is Známé, not Zvládnuté.
    const lessonOnly = evidence({ attempts: moduleSkills("1.1").map((skillId) => ({ skillId, context: "lesson" as const, correct: true, attemptedAt: day(5) })) });
    expect(milestoneStates(lessonOnly, rules, published)[0].status).toBe("open");
  });

  it("takes the first passing submission and the latest completion as the achievement date", () => {
    const states = milestoneStates(evidence({ submissions: [submission(day(4), 2), submission(day(6)), submission(day(8))] }), rules, published);
    expect(states[0].achievedAt).toEqual(day(6));
    const lateLesson = evidence();
    lateLesson.completions = [...lateLesson.completions.slice(1), { lessonId: foundations[0], completedAt: day(12) }];
    expect(milestoneStates(lateLesson, rules, published)[0].achievedAt).toEqual(day(12));
  });
});
