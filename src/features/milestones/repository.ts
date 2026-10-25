import "server-only";
import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { capstoneSubmission, lessonProgress, skillAttempt, user } from "@/db/schema";
import { listLearnerArtifacts } from "@/features/artifacts/repository";
import { isGuestIdentity } from "@/features/guest/identity";
import { loadPortfolioView } from "@/features/portfolio/service";
import { loadPortfolioLabUnlockStatus } from "@/features/progression/repository";
import { evaluateTraining } from "@/features/training/domain";
import { loadLatestTraining } from "@/features/training/repository";
import { capstoneOutcome, crisisPlanCheck, diversifiedCoreCheck, ipsAlignmentCheck, selfAssessmentSchema, thesisSavedCheck, type CheckResult } from "./criteria";
import { milestoneStates } from "./domain";
import { getCapstone, type CapstoneCheck, type CapstoneDefinition } from "./registry";

/** Only the data a capstone's checks need, read on the server; nothing here writes trades, money or progress. */
async function gatherEvidence(userId: string, capstone: CapstoneDefinition) {
  const checks = new Set(capstone.criteria.flatMap((criterion) => criterion.check ? [criterion.check] : []));
  // Never open a portfolio generation for a learner whose Lab is still locked.
  const lab = checks.has("ips-alignment-v1") || checks.has("diversified-core-v1")
    ? (await loadPortfolioLabUnlockStatus(userId)).unlocked ? await loadPortfolioView(userId) : "lab-locked" as const : undefined;
  const training = checks.has("crisis-plan-kept-v1") ? await loadLatestTraining(userId) : undefined;
  const thesis = checks.has("thesis-saved-v1") ? (await listLearnerArtifacts(userId, "investment_thesis")).at(0) : undefined;
  const run: Record<CapstoneCheck, () => CheckResult> = {
    "ips-alignment-v1": () => ipsAlignmentCheck(lab === "lab-locked" ? lab : lab!.process.allocation),
    "diversified-core-v1": () => diversifiedCoreCheck(lab!),
    "crisis-plan-kept-v1": () => crisisPlanCheck(training ? { finished: training.state.finished, sellsOutsidePlan: evaluateTraining(training.setup, training.state).sellsOutsidePlan } : null),
    "thesis-saved-v1": () => thesisSavedCheck(Boolean(thesis)),
  };
  return {
    autoCriteria: Object.fromEntries(capstone.criteria.flatMap((criterion) => criterion.check ? [[criterion.id, run[criterion.check]()]] : [])),
    // Identities of the inspected evidence, so a verdict can be traced back to immutable rows.
    artifactRefs: {
      ...lab && lab !== "lab-locked" ? { portfolioId: lab.portfolioId, ipsVersion: lab.process.ipsVersion } : {},
      ...training ? { trainingSessionId: training.session.id } : {},
      ...thesis ? { thesisArtifactId: thesis.id, thesisVersion: thesis.version } : {},
    },
  };
}

type SubmissionRow = typeof capstoneSubmission.$inferSelect;
function present({ id, capstoneId, version, artifactRefs, autoCriteria, selfAssessment, submittedAt }: SubmissionRow) {
  return { id, capstoneId, version, artifactRefs, autoCriteria, selfAssessment, submittedAt, outcome: capstoneOutcome(getCapstone(capstoneId)!, autoCriteria, selfAssessment) };
}

/**
 * Appends a new version. The client supplies only the self-assessment; the server computes the automatic criteria
 * before taking the account lock (they may read market data) and freezes them in the row. A retried request returns
 * its stored version; reusing a request ID for a different submission is refused.
 */
export async function submitCapstone(userId: string, input: { capstoneId: string; requestId: string; selfAssessment: unknown }) {
  const capstone = getCapstone(input.capstoneId);
  if (!capstone) throw new Error("Unknown capstone.");
  const requestId = z.uuid().parse(input.requestId);
  const selfAssessment = selfAssessmentSchema(capstone).parse(input.selfAssessment);
  const evidence = await gatherEvidence(userId, capstone);
  return db.transaction(async (tx) => {
    // Same lock as artifacts, progression and trades.
    const [owner] = await tx.select({ id: user.id, isAnonymous: user.isAnonymous, anonymousKind: user.anonymousKind }).from(user).where(eq(user.id, userId)).for("update");
    if (!owner || isGuestIdentity(owner)) throw new Error("A saved account or isolated demo is required.");
    const [retry] = await tx.select().from(capstoneSubmission).where(and(eq(capstoneSubmission.userId, userId), eq(capstoneSubmission.requestId, requestId)));
    if (retry) {
      if (retry.capstoneId !== capstone.id || !isDeepStrictEqual(retry.selfAssessment, selfAssessment)) throw new Error("A capstone request cannot be reused for a different submission.");
      return present(retry);
    }
    const [previous] = await tx.select({ version: capstoneSubmission.version }).from(capstoneSubmission)
      .where(and(eq(capstoneSubmission.userId, userId), eq(capstoneSubmission.capstoneId, capstone.id))).orderBy(desc(capstoneSubmission.version)).limit(1);
    const [created] = await tx.insert(capstoneSubmission).values({ id: randomUUID(), userId, capstoneId: capstone.id, version: (previous?.version ?? 0) + 1, requestId, selfAssessment, ...evidence }).returning();
    return present(created);
  });
}

/** Derived milestone states. The three reads run in parallel with the page's other loads. */
export async function loadMilestones(userId: string | undefined) {
  if (!userId) return milestoneStates({ completions: [], attempts: [], submissions: [] });
  const [completed, attempts, submissions] = await Promise.all([
    db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed"))),
    db.select().from(skillAttempt).where(eq(skillAttempt.userId, userId)),
    db.select().from(capstoneSubmission).where(eq(capstoneSubmission.userId, userId)),
  ]);
  return milestoneStates({
    completions: completed.map((row) => ({ lessonId: row.lessonId, completedAt: row.completedAt ?? row.updatedAt })),
    attempts,
    submissions,
  });
}
