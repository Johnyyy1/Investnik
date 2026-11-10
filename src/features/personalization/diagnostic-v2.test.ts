import { describe, expect, it } from "vitest";
import { availableLessons } from "@/features/learning/catalog";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { bigThreeQuestions } from "@/features/lessons/foundations/checkpoint";
import { stepArtifactRequirements } from "@/features/lessons/output-contract";
import { lessonSteps } from "@/features/progress/transition";
import { DIAGNOSTIC_V2, DIAGNOSTIC_V2_MAX_ITEMS, diagnosticV2Probes, diagnosticV2RetakeAt, evaluateDiagnosticV2, nextDiagnosticV2Question, readDiagnosticV2 } from "./diagnostic-v2";
import { evaluateDiagnostic, readDiagnostic } from "./diagnostic";
import { diagnosticV2Submission, diagnosticWithCorrectCount } from "./test-fixtures";

const at = new Date("2026-11-09T10:00:00.000Z");
const items = diagnosticV2Probes.flatMap((probe) => probe.items);

describe("entry test V2 item bank", () => {
  it("has stable unique IDs, a valid key and a don't-know option on every item, at most 30 items", () => {
    expect(items.length).toBeLessThanOrEqual(DIAGNOSTIC_V2_MAX_ITEMS);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    for (const item of items) {
      expect(new Set(item.options.map((option) => option.id)).size).toBe(item.options.length);
      expect(item.options.some((option) => option.id === item.correctAnswer)).toBe(true);
      expect(item.options.at(-1)?.label.toLowerCase()).toBe("nevím");
      expect(item.correctAnswer).not.toMatch(/^(dont_know|unknown)$/);
    }
  });
  it("probes only published level 0–2 lessons without a learner artifact, in curriculum order", () => {
    const published = new Set<string>(availableLessons.map((lesson) => lesson.id));
    const codes = diagnosticV2Probes.map((probe) => getLessonPlacement(probe.lessonId)!.displayCode);
    for (const probe of diagnosticV2Probes) {
      expect(published.has(probe.lessonId)).toBe(true);
      expect(getLessonPlacement(probe.lessonId)?.displayModule).toMatch(/^[012]\./);
      expect(lessonSteps(probe.lessonId).flatMap(stepArtifactRequirements).filter(Boolean)).toEqual([]);
      expect(probe.lessonId).not.toMatch(/checkpoint/);
      for (const item of probe.items) expect(getLessonPlacement(probe.lessonId)?.skills).toContain(item.skillId);
    }
    expect(codes).toEqual([...codes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
  });
  it("reuses the Big Three measurement wording unchanged", () => {
    for (const question of bigThreeQuestions) {
      expect(items.find((item) => item.id === question.id)).toMatchObject({ prompt: question.prompt, options: question.options, correctAnswer: question.correctOptionId });
    }
  });
});

describe("adaptive replay", () => {
  it("never sends the answer key to the client", () => {
    const { question } = nextDiagnosticV2Question([]);
    expect(Object.keys(question!).sort()).toEqual(["id", "options", "prompt", "topic"]);
    expect(JSON.stringify(question)).not.toContain("correct");
  });
  it("proves every probed lesson for a learner who knows everything", () => {
    const submission = diagnosticV2Submission();
    expect(submission.answers).toHaveLength(items.length);
    const result = evaluateDiagnosticV2(submission, at);
    expect(result.provenLessonIds).toEqual(diagnosticV2Probes.map((probe) => probe.lessonId));
    expect(result.level).toBe("strong_foundations");
    expect(result.knownSkillIds).toContain("compounding");
    expect(result.completedAt).toBe(at.toISOString());
  });
  it("stops each level after two unproven lessons and asks one item per failed lesson", () => {
    const submission = diagnosticV2Submission(() => false);
    expect(submission.answers).toHaveLength(6);
    const result = evaluateDiagnosticV2(submission, at);
    expect(result.provenLessonIds).toEqual([]);
    expect(result.level).toBe("foundations_needed");
    expect(Object.values(result.outcomes).filter((outcome) => outcome === "not_proven")).toHaveLength(6);
  });
  it("treats \"Nevím\" as not proven without any penalty beyond that", () => {
    const answers = [{ itemId: "budget-savings-rate", optionId: "dont_know" }];
    expect(nextDiagnosticV2Question(answers).question?.id).toBe("debt-card-first");
  });
  it("needs both items of a lesson correct to prove it", () => {
    expect(nextDiagnosticV2Question([{ itemId: "budget-savings-rate", optionId: "fifteen" }]).question?.id).toBe("budget-irregular");
    expect(nextDiagnosticV2Question([{ itemId: "budget-savings-rate", optionId: "fifteen" }, { itemId: "budget-irregular", optionId: "due_month" }]).question?.id).toBe("debt-card-first");
  });
  it("ends a level after two unproven lessons, even before lessons the learner knows", () => {
    const knows = new Set(["foundations-markets", "foundations-funds"]);
    const result = evaluateDiagnosticV2(diagnosticV2Submission((id) => knows.has(id)), at);
    expect(result.outcomes["foundations-why-invest"]).toBe("not_proven");
    expect(result.outcomes["foundations-stocks"]).toBe("not_proven");
    // Two Foundations failures end level 1 before the known lessons are reached; level 2 is still probed.
    expect(result.outcomes["foundations-markets"]).toBe("untested");
    expect(result.outcomes["broker-fee-schedule"]).toBe("not_proven");
  });
  it("reports approximate progress that grows and ends at the complete test", () => {
    const { answers } = diagnosticV2Submission();
    const progress = answers.map((_, index) => nextDiagnosticV2Question(answers.slice(0, index)).progress);
    expect(progress[0]).toBe(0);
    expect(progress.every((value, index) => index === 0 || value > progress[index - 1])).toBe(true);
    expect(nextDiagnosticV2Question(answers)).toEqual({ question: null, progress: 1 });
  });
  it.each([
    ["an out-of-order item", (answers: { itemId: string; optionId: string }[]) => [answers[1], answers[0], ...answers.slice(2)]],
    ["an unknown option", (answers: { itemId: string; optionId: string }[]) => [{ ...answers[0], optionId: "correct" }, ...answers.slice(1)]],
    ["an extra answer", (answers: { itemId: string; optionId: string }[]) => [...answers, answers[0]]],
    ["an incomplete test", (answers: { itemId: string; optionId: string }[]) => answers.slice(0, -1)],
  ])("rejects %s", (_, tamper) => {
    const submission = diagnosticV2Submission();
    expect(() => evaluateDiagnosticV2({ ...submission, answers: tamper(submission.answers) }, at)).toThrow();
  });
  it.each([{ provenLessonIds: ["foundations-why-invest"] }, { score: 30 }, { level: "strong_foundations" }, { completedAt: at.toISOString() }, { userId: "victim" }])("rejects client authority %j", (patch) => {
    expect(() => evaluateDiagnosticV2({ ...diagnosticV2Submission(() => false), ...patch }, at)).toThrow();
  });
});

describe("stored V1 and V2 coexist", () => {
  it("recomputes V2 derived fields on read and keeps the server timestamp", () => {
    const stored = { ...evaluateDiagnosticV2(diagnosticV2Submission(() => false), at), provenLessonIds: ["foundations-why-invest"], knownSkillIds: ["compounding"], level: "strong_foundations" };
    expect(readDiagnostic(stored)).toMatchObject({ version: DIAGNOSTIC_V2, provenLessonIds: [], knownSkillIds: [], level: "foundations_needed", completedAt: at.toISOString() });
    expect(readDiagnosticV2({ ...stored, completedAt: "yesterday" })).toBeNull();
    expect(readDiagnosticV2({ ...stored, answers: stored.answers.slice(1) })).toBeNull();
  });
  it("keeps V1 results readable", () => {
    expect(readDiagnostic(evaluateDiagnostic(diagnosticWithCorrectCount(5)))).toMatchObject({ version: "FOUNDATIONS_DIAGNOSTIC_V1", correctCount: 5, level: "strong_foundations" });
  });
  it("allows a retake 30 days after a V2 result and never waits on V1", () => {
    const stored = evaluateDiagnosticV2(diagnosticV2Submission(), at);
    expect(diagnosticV2RetakeAt(stored, at)?.toISOString()).toBe("2026-12-09T10:00:00.000Z");
    expect(diagnosticV2RetakeAt(stored, new Date("2026-12-09T10:00:00.000Z"))).toBeNull();
    expect(diagnosticV2RetakeAt(evaluateDiagnostic(diagnosticWithCorrectCount(5)), at)).toBeNull();
    expect(diagnosticV2RetakeAt(null)).toBeNull();
  });
});
