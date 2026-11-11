import { describe, expect, it } from "vitest";
import { milestoneStates, type MilestoneEvidence } from "./domain";
import { milestoneANavigation, milestoneANextStep } from "./navigation";
import { moduleSkills } from "@/features/mastery/domain";

const empty: MilestoneEvidence = { completions: [], attempts: [], submissions: [] };
const ready = { hasIps: true, labUnlocked: true, crisisFinished: true };
const initial = milestoneStates(empty)[0];
const allLessons: MilestoneEvidence = { ...empty, completions: initial.lessons.map(({ id }) => ({ lessonId: id, completedAt: new Date() })) };
const state = milestoneStates(allLessons)[0];
const attempts = (code: "1.1" | "2.2" | "2.3" | "2.5") => moduleSkills(code).map((skillId) => ({ skillId, correct: true, context: "checkpoint" as const, attemptedAt: new Date() }));

describe("Milestone A navigation", () => {
  it("links the first unfinished scoped lesson before checkpoints and project", () => {
    const navigation = milestoneANavigation(initial, empty, ready);
    expect(navigation.lessons?.[0].href).toBe("/learn/investing-foundations/why-invest");
    expect(milestoneANextStep({ ...initial, navigation })).toEqual(navigation.lessons?.[0]);
    expect(navigation.skills?.map((item) => item.href)).toEqual(["/learn/checkpoint/1.1", "/learn/checkpoint/2.2", "/learn/checkpoint/2.3", "/learn/checkpoint/2.5"]);
  });
  it("selects only modules with missing lifetime mastery, including after a failed review", () => {
    const evidence = { ...allLessons, attempts: [...attempts("1.1"), { ...attempts("1.1")[0], context: "review" as const, correct: false, attemptedAt: new Date(Date.now() + 1000) }] };
    const navigation = milestoneANavigation(milestoneStates(evidence)[0], evidence, ready);
    expect(navigation.lessons).toEqual([]);
    expect(navigation.skills?.map((item) => item.href)).toEqual(["/learn/checkpoint/2.2", "/learn/checkpoint/2.3", "/learn/checkpoint/2.5"]);
    expect(milestoneANextStep({ ...state, navigation })).toEqual(navigation.skills?.[0]);
  });
  it.each([
    [{ ...ready, hasIps: false }, "/learn/first-plan/investment-policy-statement"],
    [{ ...ready, labUnlocked: false }, "/learn/investing-foundations/why-invest"],
    [{ ...ready, crisisFinished: false }, "/lab/training"],
    [ready, "/learn/first-plan/capstone-a"],
  ])("links the project's first missing prerequisite for %j", (readiness, href) => {
    expect(milestoneANavigation(state, allLessons, readiness).capstone?.[0].href).toBe(href);
  });
  it("selects the project after all skills and lessons, and emits no task for achievement", () => {
    const evidence = { ...allLessons, attempts: [...attempts("1.1"), ...attempts("2.2"), ...attempts("2.3"), ...attempts("2.5")] };
    const mastered = milestoneStates(evidence)[0];
    const navigation = milestoneANavigation(mastered, evidence, ready);
    expect(navigation.skills).toEqual([]);
    expect(milestoneANextStep({ ...mastered, navigation })?.href).toBe("/learn/first-plan/capstone-a");
    expect(milestoneANavigation({ ...mastered, status: "achieved" }, evidence, ready)).toEqual({});
    expect(milestoneANavigation(milestoneStates(empty)[1], empty, ready)).toEqual({});
  });
});
