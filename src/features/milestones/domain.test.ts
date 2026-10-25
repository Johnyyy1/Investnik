import { describe, expect, it } from "vitest";
import { availableLessons } from "@/features/learning/catalog";
import { getDisplayModulePlacements } from "@/features/learning/curriculum";
import { moduleSkills } from "@/features/mastery/domain";
import { crisisPlanCheck, diversifiedCoreCheck, ipsAlignmentCheck } from "./criteria";
import { milestoneStates, type MilestoneEvidence } from "./domain";
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

// A reachable A: level 1 only, with the reserved capstone lesson treated as published.
const rules: MilestoneRule[] = [{ id: "A", requires: [], levels: ["L1"], capstoneId: capstoneA.id }, { id: "B", requires: ["A"], levels: ["L3"], capstoneId: "capstone-b-v1" }];
const published = new Set([...availableLessons.map((lesson) => lesson.id), capstoneA.lessonId]);
const foundations = getDisplayModulePlacements("1.1").map((placement) => placement.lessonId);
const evidence = (overrides: Partial<MilestoneEvidence> = {}): MilestoneEvidence => ({
  completions: foundations.map((lessonId, index) => ({ lessonId, completedAt: day(1 + index % 3) })),
  attempts: moduleSkills("1.1").map((skillId) => ({ skillId, context: "checkpoint" as const, correct: true, attemptedAt: day(5) })),
  submissions: [submission(day(7))],
  ...overrides,
});

describe("derived milestone state", () => {
  it("cannot achieve any milestone while its practical content is unpublished", () => {
    const states = milestoneStates(none);
    expect(states.map((state) => [state.id, state.status, state.achievedAt])).toEqual([["A", "unavailable", null], ["B", "unavailable", null], ["C", "unavailable", null], ["D", "unavailable", null]]);
    const a = states[0];
    expect(a.requirements.find((item) => item.kind === "capstone")).toMatchObject({ status: "unavailable", label: capstoneA.title });
    expect(a.requirements.find((item) => item.kind === "lessons")?.status).toBe("unavailable");
    // Completed lessons still count, even though the milestone cannot be reached yet.
    const done = milestoneStates({ ...none, completions: [{ lessonId: "foundations-why-invest", completedAt: day(1) }] })[0];
    expect(done.requirements.find((item) => item.kind === "lessons")?.done).toBe(1);
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
