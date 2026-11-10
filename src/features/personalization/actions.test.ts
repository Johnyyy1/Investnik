import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { z } from "zod";
const mocks = vi.hoisted(() => ({ user: vi.fn(), complete: vi.fn(), update: vi.fn(), retake: vi.fn(), skip: vi.fn(), saveV2: vi.fn(), revalidate: vi.fn(), Unavailable: class extends Error {} }));
vi.mock("@/lib/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("./repository", () => ({ completePersonalization: mocks.complete, updatePersonalizedPreferences: mocks.update, retakeDiagnostic: mocks.retake, skipPersonalization: mocks.skip, saveDiagnosticV2: mocks.saveV2, EntryTestUnavailableError: mocks.Unavailable }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { completePersonalizationAction, updatePersonalizedPreferencesAction, retakeDiagnosticAction, skipPersonalizationAction, submitEntryTestAction, nextEntryTestQuestionAction } from "./actions";
const actions = [[completePersonalizationAction, mocks.complete], [updatePersonalizedPreferencesAction, mocks.update], [retakeDiagnosticAction, mocks.retake], [skipPersonalizationAction, mocks.skip], [submitEntryTestAction, mocks.saveV2]] as const;
describe("personalization authority", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "owner" }); });
  it.each(actions)("requires an authenticated session", async (action, operation) => {
    mocks.user.mockResolvedValue(null);
    expect(await action({ userId: "victim" })).toMatchObject({ ok: false, signIn: true });
    expect(operation).not.toHaveBeenCalled();
  });
  it.each(actions)("derives owner from session and revalidates after saving", async (action, operation) => {
    expect(await action({})).toEqual({ ok: true });
    expect(operation).toHaveBeenCalledWith("owner", {});
    expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
  });
  it("normalizes a failed session lookup without writing", async () => {
    mocks.user.mockRejectedValue(new Error("private session database information"));
    const result = await completePersonalizationAction({});
    expect(result).toMatchObject({ ok: false });
    expect(JSON.stringify(result)).not.toContain("private");
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it.each(actions)("normalizes storage/validation failures", async (action, operation) => {
    operation.mockRejectedValue(new Error("private database information"));
    const result = await action({});
    expect(result).toMatchObject({ ok: false });
    expect(JSON.stringify(result)).not.toContain("private");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});

describe("personalization failure logging", () => {
  let log: MockInstance<typeof console.error>;
  beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "owner" }); log = vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => log.mockRestore());

  it("logs an unexpected failure once with the operation and keeps the learner message", async () => {
    mocks.retake.mockRejectedValue(new Error("deadlock detected"));
    expect(await retakeDiagnosticAction({})).toEqual({ ok: false, message: "Přizpůsobení se nepodařilo uložit. Zkontroluj odpovědi a zkus to znovu." });
    expect(log.mock.calls).toEqual([["[personalization] retake diagnostic failed", { error: { name: "Error", message: "deadlock detected" } }]]);
  });

  it("does not log answers that fail validation", async () => {
    mocks.complete.mockImplementation(async (_owner: string, input: unknown) => { z.object({ goal: z.string() }).parse(input); });
    expect(await completePersonalizationAction({})).toMatchObject({ ok: false });
    expect(log).not.toHaveBeenCalled();
  });
});

describe("entry test actions", () => {
  let log: MockInstance<typeof console.error>;
  beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "owner" }); log = vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => log.mockRestore());

  it("returns the 30-day lock message without logging it as a failure", async () => {
    mocks.saveV2.mockRejectedValue(new mocks.Unavailable("Zopakovat ho můžeš 30 dní po posledním pokusu."));
    expect(await submitEntryTestAction({})).toEqual({ ok: false, message: "Zopakovat ho můžeš 30 dní po posledním pokusu." });
    expect(log).not.toHaveBeenCalled();
  });
  it("serves the next public question only to a signed-in learner and rejects a tampered sequence", async () => {
    expect(await nextEntryTestQuestionAction([])).toMatchObject({ ok: true, progress: 0, question: { id: "budget-savings-rate" } });
    expect(await nextEntryTestQuestionAction([{ itemId: "big-three-inflation", optionId: "less" }])).toMatchObject({ ok: false });
    mocks.user.mockResolvedValue(null);
    expect(await nextEntryTestQuestionAction([])).toMatchObject({ ok: false });
    expect(log).not.toHaveBeenCalled();
  });
});
