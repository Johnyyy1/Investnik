import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { learningProfile, lessonProgress, skillAttempt, user } from "@/db/schema";
import type { SkillItem } from "@/features/learning/curriculum";
import { skillItems } from "@/features/learning/curriculum";
import { recordMilestoneAchievements } from "@/features/milestones/achievements";
import { readDiagnostic } from "@/features/personalization/diagnostic";
import { DIAGNOSTIC_V2 } from "@/features/personalization/diagnostic-v2";
import { checkpointContext, skillLevel } from "./domain";

/**
 * Appends one server-evaluated attempt. Under the account row lock, so a concurrent checkpoint answer sees the
 * same state when it decides between checkpoint and review. A retried `requestId` keeps the first row.
 */
export async function recordSkillAttempt(userId: string, input: { requestId: string; item: SkillItem; correct: boolean; mode: "lesson" | "checkpoint"; now?: Date }) {
  const { requestId, item, correct, mode, now = new Date() } = input;
  return db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
    const context = mode === "lesson" ? "lesson" : checkpointContext(skillLevel(
      await tx.select().from(skillAttempt).where(and(eq(skillAttempt.userId, userId), eq(skillAttempt.skillId, item.skillId)))));
    await tx.insert(skillAttempt).values({ userId, requestId, skillId: item.skillId, itemId: item.id, correct, context, attemptedAt: now }).onConflictDoNothing();
    const [stored] = await tx.select().from(skillAttempt).where(and(eq(skillAttempt.userId, userId), eq(skillAttempt.requestId, requestId)));
    // Only a correct checkpoint answer can raise a skill to Zvládnuté.
    if (mode === "checkpoint" && correct) await recordMilestoneAchievements(tx, userId);
    return stored;
  });
}

/** Every skill's derived level, with completed lessons and the V2 entry test's proven lessons counting as Známé. */
export async function loadSkillLevels(userId: string) {
  const [attempts, completed, [profile]] = await Promise.all([
    db.select().from(skillAttempt).where(eq(skillAttempt.userId, userId)).orderBy(asc(skillAttempt.attemptedAt)),
    db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed"))),
    db.select({ diagnosticResult: learningProfile.diagnosticResult }).from(learningProfile).where(eq(learningProfile.userId, userId)),
  ]);
  const done = new Set(completed.map((row) => row.lessonId));
  const diagnostic = readDiagnostic(profile?.diagnosticResult);
  const known = new Set<string>(diagnostic?.version === DIAGNOSTIC_V2 ? diagnostic.knownSkillIds : []);
  const skillIds = [...new Set(skillItems.map((entry) => entry.skillId))];
  return Object.fromEntries(skillIds.map((skillId) => [skillId, skillLevel(
    attempts.filter((attempt) => attempt.skillId === skillId),
    known.has(skillId) || skillItems.some((entry) => entry.skillId === skillId && done.has(entry.lessonId)),
  )]));
}
