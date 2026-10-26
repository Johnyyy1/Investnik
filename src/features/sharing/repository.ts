import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { artifactShare, learnerArtifact, user } from "@/db/schema";
import { createShareSchema, previewShareSchema, publicPlanSummary, revokeShareSchema, shareTokenSchema, type OwnedShare, type PublicPlan } from "./domain";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
async function lockOwner(tx: Transaction, userId: string) {
  const [owner] = await tx.select({ id: user.id, anonymous: user.isAnonymous }).from(user).where(eq(user.id, userId)).for("update");
  if (!owner || owner.anonymous) throw new Error("A saved account is required to publish.");
}
function present(row: typeof learnerArtifact.$inferSelect): PublicPlan {
  const summary = publicPlanSummary({ kind: row.kind, payload: row.payload });
  if (!summary) throw new Error("This output cannot be shared.");
  return { version: row.version, createdAt: row.createdAt.toISOString(), summary };
}
export async function previewOwnedShare(userId: string, input: unknown) {
  const { artifactId } = previewShareSchema.parse(input);
  const [row] = await db.select().from(learnerArtifact).where(and(eq(learnerArtifact.id, artifactId), eq(learnerArtifact.userId, userId)));
  if (!row) throw new Error("Output unavailable.");
  return present(row);
}
export async function createOwnedShare(userId: string, input: unknown) {
  const parsed = createShareSchema.parse(input);
  return db.transaction(async (tx) => {
    await lockOwner(tx, userId);
    const [artifact] = await tx.select().from(learnerArtifact).where(and(eq(learnerArtifact.id, parsed.artifactId), eq(learnerArtifact.userId, userId)));
    if (!artifact) throw new Error("Output unavailable.");
    present(artifact);
    const [retry] = await tx.select().from(artifactShare).where(and(eq(artifactShare.userId, userId), eq(artifactShare.requestId, parsed.requestId)));
    if (retry) {
      if (retry.artifactId !== artifact.id) throw new Error("A request cannot be reused for another output.");
      // A retry never resurrects a revoked share.
      return { token: retry.token, revoked: retry.revokedAt !== null };
    }
    const token = randomBytes(24).toString("base64url");
    await tx.insert(artifactShare).values({ token, userId, artifactId: artifact.id, requestId: parsed.requestId });
    return { token, revoked: false };
  });
}
export async function revokeOwnedShare(userId: string, input: unknown) {
  const { token } = revokeShareSchema.parse(input);
  return db.transaction(async (tx) => {
    await lockOwner(tx, userId);
    await tx.update(artifactShare).set({ revokedAt: new Date() }).where(and(eq(artifactShare.token, token), eq(artifactShare.userId, userId), isNull(artifactShare.revokedAt)));
  });
}
export async function listOwnedShares(userId: string): Promise<OwnedShare[]> {
  const rows = await db.select({ token: artifactShare.token, artifactId: artifactShare.artifactId, version: learnerArtifact.version, revokedAt: artifactShare.revokedAt, createdAt: artifactShare.createdAt }).from(artifactShare)
    .innerJoin(learnerArtifact, and(eq(learnerArtifact.id, artifactShare.artifactId), eq(learnerArtifact.userId, userId)))
    .where(eq(artifactShare.userId, userId)).orderBy(desc(artifactShare.createdAt));
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), revokedAt: row.revokedAt?.toISOString() ?? null }));
}
/** Only this allowlisted response crosses the public boundary; neither owner nor artifact payload escapes. */
export async function readPublicShare(token: string): Promise<PublicPlan | null> {
  if (!shareTokenSchema.safeParse(token).success) return null;
  const [row] = await db.select({ kind: learnerArtifact.kind, payload: learnerArtifact.payload, version: learnerArtifact.version, createdAt: learnerArtifact.createdAt, projectionVersion: artifactShare.projectionVersion }).from(artifactShare)
    .innerJoin(learnerArtifact, and(eq(learnerArtifact.id, artifactShare.artifactId), eq(learnerArtifact.userId, artifactShare.userId)))
    .where(and(eq(artifactShare.token, token), isNull(artifactShare.revokedAt)));
  if (!row) return null;
  const summary = publicPlanSummary({ kind: row.kind, payload: row.payload }, row.projectionVersion);
  return summary ? { version: row.version, createdAt: row.createdAt.toISOString(), summary } : null;
}
