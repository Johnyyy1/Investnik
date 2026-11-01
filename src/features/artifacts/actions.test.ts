import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), save: vi.fn(), list: vi.fn(), remove: vi.fn(), submit: vi.fn() }));
vi.mock("@/lib/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("./repository", () => ({ saveLearnerArtifact: mocks.save, listLearnerArtifacts: mocks.list, deleteLearnerArtifact: mocks.remove }));
vi.mock("@/features/milestones/repository", () => ({ submitCapstone: mocks.submit }));
import { deleteArtifact, listArtifacts, saveArtifact } from "./actions";
import { artifactExamples } from "./test-fixtures";
const id = "2febc313-313b-40ba-af9a-a93534e3cabf";
const input = { content: { kind: "goal_map", payload: artifactExamples.goal_map }, sourceLessonId: "foundations-why-invest", consent: true, requestId: id };
describe("artifact server action boundaries", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "owner", isAnonymous: false }); mocks.list.mockResolvedValue([]); mocks.save.mockResolvedValue({ id, version: 1 }); });
  it.each([null, { id: "guest", isAnonymous: true, anonymousKind: "guest" }])("does not persist, list or delete for %j", async (owner) => {
    mocks.user.mockResolvedValue(owner);
    for (const result of [await saveArtifact(input), await listArtifacts(), await deleteArtifact({ id })]) expect(result).toMatchObject({ ok: false });
    expect(mocks.save).not.toHaveBeenCalled(); expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("derives ownership only from the session and passes validated payloads", async () => {
    expect(await saveArtifact(input)).toMatchObject({ ok: true });
    expect(mocks.save).toHaveBeenCalledWith("owner", input);
    expect(await listArtifacts({ kind: "goal_map" })).toEqual({ ok: true, artifacts: [] });
    expect(mocks.list).toHaveBeenCalledWith("owner", "goal_map");
    expect(await deleteArtifact({ id })).toEqual({ ok: true });
    expect(mocks.remove).toHaveBeenCalledWith("owner", id);
  });
  it("allows an isolated demo identity", async () => {
    mocks.user.mockResolvedValue({ id: "demo", isAnonymous: true, anonymousKind: "demo" });
    expect(await saveArtifact(input)).toMatchObject({ ok: true });
    expect(mocks.save).toHaveBeenCalledWith("demo", input);
  });
  it("rejects spoofed owner keys, invalid kinds, invalid IDs and absent consent", async () => {
    for (const patch of [{ userId: "victim" }, { consent: false }, { content: { kind: "goal_map", payload: { income: 10 } } }]) expect(await saveArtifact({ ...input, ...patch })).toMatchObject({ ok: false });
    expect(await listArtifacts({ userId: "victim" })).toMatchObject({ ok: false });
    expect(await listArtifacts({ kind: "unknown" })).toMatchObject({ ok: false });
    expect(await deleteArtifact({ id: "bad" })).toMatchObject({ ok: false });
    expect(await deleteArtifact({ id, userId: "victim" })).toMatchObject({ ok: false });
    expect(mocks.save).not.toHaveBeenCalled(); expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("submits the Capstone A self-assessment before saving its output, under the same retry ID", async () => {
    const ratings = [{ criterionId: "ips-alignment", level: 3 }, { criterionId: "costs", level: 4 }, { criterionId: "diversification", level: 3 }, { criterionId: "crisis", level: 2 }];
    const capstone = { ...input, sourceLessonId: "first-plan-capstone-a", content: { kind: "lesson_output", payload: { type: "rubricSelfAssessment", blockId: "self-assessment", text: "Plán jsem dodržel.", ratings } } };
    const order: string[] = [];
    mocks.submit.mockImplementation(async () => { order.push("capstone"); });
    mocks.save.mockImplementation(async () => { order.push("output"); return { id, version: 1 }; });
    expect(await saveArtifact(capstone)).toMatchObject({ ok: true });
    expect(mocks.submit).toHaveBeenCalledWith("owner", { capstoneId: "capstone-a-v1", requestId: id, selfAssessment: { ratings, reflection: "Plán jsem dodržel." } });
    expect(order).toEqual(["capstone", "output"]);
    // A failed submission saves no output, so the step cannot continue without one; the learner retries both.
    mocks.submit.mockRejectedValue(new Error("private evidence")); mocks.save.mockClear();
    const failed = await saveArtifact(capstone);
    expect(failed).toMatchObject({ ok: false }); expect(JSON.stringify(failed)).not.toContain("private");
    expect(mocks.save).not.toHaveBeenCalled();
    // Other outputs, other lessons and other blocks never submit a capstone.
    mocks.submit.mockClear();
    for (const other of [input, { ...capstone, sourceLessonId: "behaviour-debiasing-tools" }, { ...capstone, content: { ...capstone.content, payload: { ...capstone.content.payload, blockId: "other" } } }]) await saveArtifact(other);
    expect(mocks.submit).not.toHaveBeenCalled();
  });
  it("returns recoverable errors without private database details", async () => {
    mocks.save.mockRejectedValue(new Error("private payload connection secret")); mocks.list.mockRejectedValue(new Error("private")); mocks.remove.mockRejectedValue(new Error("private"));
    for (const result of [await saveArtifact(input), await listArtifacts(), await deleteArtifact({ id })]) { expect(result).toMatchObject({ ok: false }); expect(JSON.stringify(result)).not.toContain("private"); }
  });
});

describe("artifact failure logging", () => {
  let log: MockInstance<typeof console.error>;
  beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "owner", isAnonymous: false }); log = vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => log.mockRestore());

  it("logs a repository failure once per action and keeps the learner message", async () => {
    for (const mock of [mocks.save, mocks.list, mocks.remove]) mock.mockRejectedValue(new Error("connection terminated"));
    for (const result of [await saveArtifact(input), await listArtifacts(), await deleteArtifact({ id })]) expect(result).toEqual({ ok: false, message: "Výstup se nepodařilo zpracovat. Zkus to znovu." });
    expect(log.mock.calls.map(([entry]) => entry)).toEqual(["[artifacts] save failed", "[artifacts] list failed", "[artifacts] delete failed"]);
  });

  it("does not log refused input or a missing account", async () => {
    await saveArtifact({ ...input, consent: false });
    await deleteArtifact({ id: "bad" });
    mocks.user.mockResolvedValue(null);
    await listArtifacts();
    expect(log).not.toHaveBeenCalled();
  });
});
