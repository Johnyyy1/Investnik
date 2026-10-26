import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), preview: vi.fn(), create: vi.fn(), revoke: vi.fn(), list: vi.fn() }));
vi.mock("@/lib/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("./repository", () => ({ previewOwnedShare: mocks.preview, createOwnedShare: mocks.create, revokeOwnedShare: mocks.revoke, listOwnedShares: mocks.list }));
import { createShare, listShares, previewShare, revokeShare } from "./actions";
const artifactId = "49689055-93a2-4567-85ea-67b4992491c3";
const input = { artifactId, requestId: artifactId, consent: true };
const token = "a".repeat(32);
beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "owner", isAnonymous: false }); });
it.each([null, { id: "guest", isAnonymous: true, anonymousKind: "guest" }, { id: "demo", isAnonymous: true, anonymousKind: "demo" }])("rejects publishing and management for %j", async (user) => {
  mocks.user.mockResolvedValue(user);
  for (const result of [await previewShare({ artifactId }), await createShare(input), await revokeShare({ token }), await listShares()]) expect(result.ok).toBe(false);
  for (const fn of [mocks.preview, mocks.create, mocks.revoke, mocks.list]) expect(fn).not.toHaveBeenCalled();
});
it("gets the owner only from the session, validates strict inputs and returns safe failures", async () => {
  await previewShare({ artifactId }); await createShare(input); await revokeShare({ token }); await listShares();
  expect(mocks.preview).toHaveBeenCalledWith("owner", { artifactId });
  expect(mocks.create).toHaveBeenCalledWith("owner", input);
  expect(mocks.revoke).toHaveBeenCalledWith("owner", { token });
  expect(mocks.list).toHaveBeenCalledWith("owner");
  mocks.create.mockClear();
  for (const patch of [{ userId: "victim" }, { consent: false }, { payload: { income: 42 } }]) expect((await createShare({ ...input, ...patch })).ok).toBe(false);
  expect(mocks.create).not.toHaveBeenCalled();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.create.mockRejectedValue(new Error("private-db-secret"));
  const result = await createShare(input);
  expect(result.ok).toBe(false); expect(JSON.stringify(result)).not.toContain("private-db-secret");
  vi.restoreAllMocks();
});
