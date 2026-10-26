"use server";
import { getCurrentUser } from "@/lib/session";
import { logUnexpectedError } from "@/lib/server-errors";
import { createOwnedShare, listOwnedShares, previewOwnedShare, revokeOwnedShare } from "./repository";
import { createShareSchema, previewShareSchema, revokeShareSchema } from "./domain";
const failure = { ok: false as const, message: "Sdílení se nepodařilo zpracovat. Zkus to znovu." };
async function owner() {
  const user = await getCurrentUser();
  return user && !user.isAnonymous ? user : null;
}
export async function previewShare(input: unknown) {
  try {
    const user = await owner(); const parsed = previewShareSchema.safeParse(input);
    if (!user || !parsed.success) return failure;
    return { ok: true as const, preview: await previewOwnedShare(user.id, parsed.data) };
  } catch (error) { logUnexpectedError("sharing", "preview", error); return failure; }
}
export async function createShare(input: unknown) {
  try {
    const user = await owner(); const parsed = createShareSchema.safeParse(input);
    if (!user || !parsed.success) return failure;
    return { ok: true as const, share: await createOwnedShare(user.id, parsed.data) };
  } catch (error) { logUnexpectedError("sharing", "create", error); return failure; }
}
export async function revokeShare(input: unknown) {
  try {
    const user = await owner(); const parsed = revokeShareSchema.safeParse(input);
    if (!user || !parsed.success) return failure;
    await revokeOwnedShare(user.id, parsed.data);
    return { ok: true as const };
  } catch (error) { logUnexpectedError("sharing", "revoke", error); return failure; }
}
export async function listShares() {
  try {
    const user = await owner(); if (!user) return failure;
    return { ok: true as const, shares: await listOwnedShares(user.id) };
  } catch (error) { logUnexpectedError("sharing", "list", error); return failure; }
}
