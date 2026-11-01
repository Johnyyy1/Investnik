import "server-only";
import { and, eq } from "drizzle-orm";
import type { db } from "@/db";
import { capstoneSubmission, lessonProgress, milestoneAchievement, skillAttempt } from "@/db/schema";
import { milestoneStates, type MilestoneEvidence } from "./domain";

type Reader = Pick<typeof db, "select">;

export async function loadMilestoneEvidence(database: Reader, userId: string, submissions?: MilestoneEvidence["submissions"]): Promise<MilestoneEvidence> {
  const [completed, attempts, submitted] = await Promise.all([
    database.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed"))),
    database.select().from(skillAttempt).where(eq(skillAttempt.userId, userId)),
    submissions ?? database.select().from(capstoneSubmission).where(eq(capstoneSubmission.userId, userId)),
  ]);
  return { completions: completed.map((row) => ({ lessonId: row.lessonId, completedAt: row.completedAt ?? row.updatedAt })), attempts, submissions: submitted };
}

/**
 * Records every milestone the learner has reached by now (#456). Call inside the transaction that wrote new evidence,
 * under the account row lock, so a later publication that reopens the milestone cannot lose the moment. The first row
 * per learner and milestone wins and is never changed. It writes nothing else: no XP, Practice Capital or access.
 */
export async function recordMilestoneAchievements(tx: Reader & Pick<typeof db, "insert">, userId: string) {
  // Every milestone needs a capstone, so most learners stop at this one read.
  const submissions = await tx.select().from(capstoneSubmission).where(eq(capstoneSubmission.userId, userId));
  if (!submissions.length) return;
  const achieved = milestoneStates(await loadMilestoneEvidence(tx, userId, submissions)).flatMap((state) => state.achievedAt ? [{ userId, milestoneId: state.id, scopeVersion: state.scopeVersion, achievedAt: state.achievedAt }] : []);
  if (achieved.length) await tx.insert(milestoneAchievement).values(achieved).onConflictDoNothing();
}
