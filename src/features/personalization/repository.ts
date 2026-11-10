import "server-only";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { learningProfile } from "@/db/schema";
import { evaluateDiagnostic, diagnosticSubmissionSchema } from "./diagnostic";
import { DIAGNOSTIC_V2, DIAGNOSTIC_V2_RETAKE_MS, evaluateDiagnosticV2 } from "./diagnostic-v2";
import { defaultPreferences, personalizationSubmissionSchema, personalizedPreferencesSchema, skipPersonalizationSchema, toProfileColumns } from "./profile";

/** One row, one write: duplicate/stale initial submissions cannot replace a completed diagnostic. */
export async function completePersonalization(userId: string, input: unknown) {
  const { preferences, diagnostic } = personalizationSubmissionSchema.parse(input);
  const now = new Date();
  const values = { ...toProfileColumns(preferences), diagnosticResult: evaluateDiagnostic(diagnostic), personalizedOnboardingCompletedAt: now, onboardingStep: 6, updatedAt: now };
  await db.insert(learningProfile).values({ userId, ...values, onboardingCompletedAt: now }).onConflictDoUpdate({
    target: learningProfile.userId,
    set: { ...values, onboardingCompletedAt: sql`coalesce(${learningProfile.onboardingCompletedAt}, now())` },
    setWhere: isNull(learningProfile.personalizedOnboardingCompletedAt),
  });
}
/** Update only preference columns. Diagnostic evidence and completion timestamps remain intact. */
export async function updatePersonalizedPreferences(userId: string, input: unknown) {
  const preferences = personalizedPreferencesSchema.parse(input);
  const now = new Date();
  await db.insert(learningProfile).values({ userId, ...toProfileColumns(preferences), onboardingCompletedAt: now, onboardingStep: 6, updatedAt: now }).onConflictDoUpdate({
    target: learningProfile.userId,
    set: { ...toProfileColumns(preferences), updatedAt: now, onboardingCompletedAt: sql`coalesce(${learningProfile.onboardingCompletedAt}, now())` },
  });
}
/** Explicit retake replaces only the latest diagnostic. No event log or progress resets. */
export async function retakeDiagnostic(userId: string, input: unknown) {
  const result = evaluateDiagnostic(diagnosticSubmissionSchema.parse(input));
  const rows = await db.update(learningProfile).set({ diagnosticResult: result, updatedAt: new Date() })
    .where(and(eq(learningProfile.userId, userId), isNotNull(learningProfile.personalizedOnboardingCompletedAt))).returning({ userId: learningProfile.userId });
  if (!rows.length) throw new Error("Nejprve dokonči přizpůsobení učení.");
}
/** Skipping completes the initial gate, but is not evidence of completed personalization.
 * Existing preferences and diagnostics are never erased by a stale skip request. */
export async function skipPersonalization(userId: string, input: unknown) {
  skipPersonalizationSchema.parse(input);
  const now = new Date();
  await db.insert(learningProfile).values({ userId, ...toProfileColumns(defaultPreferences), onboardingCompletedAt: now, onboardingStep: 6, updatedAt: now }).onConflictDoUpdate({
    target: learningProfile.userId,
    set: { ...toProfileColumns(defaultPreferences), onboardingCompletedAt: now, onboardingStep: 6, updatedAt: now },
    setWhere: isNull(learningProfile.onboardingCompletedAt),
  });
}

export class EntryTestUnavailableError extends Error {
  constructor() { super("Vstupní test teď uložit nejde. Zopakovat ho můžeš 30 dní po posledním pokusu."); }
}
/** Saves a server-evaluated V2 entry test as the latest diagnostic. Writes nothing else: no lesson progress,
 * XP, receipt or unlock. The 30-day retake rule is checked in the same statement, so parallel submits cannot both win. */
export async function saveDiagnosticV2(userId: string, input: unknown) {
  const now = new Date();
  const result = evaluateDiagnosticV2(input, now);
  const lockedSince = new Date(now.getTime() - DIAGNOSTIC_V2_RETAKE_MS).toISOString();
  const rows = await db.update(learningProfile).set({ diagnosticResult: result, updatedAt: now })
    .where(and(eq(learningProfile.userId, userId), isNotNull(learningProfile.onboardingCompletedAt),
      sql`not coalesce(${learningProfile.diagnosticResult}->>'version' = ${DIAGNOSTIC_V2} and (${learningProfile.diagnosticResult}->>'completedAt')::timestamptz > ${lockedSince}::timestamptz, false)`))
    .returning({ userId: learningProfile.userId });
  if (!rows.length) throw new EntryTestUnavailableError();
}
