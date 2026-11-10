import { z } from "zod";
import { diagnosticSubmissionSchema, readDiagnostic } from "./diagnostic";
import { personalizedPreferencesSchema, primaryGoalValues, profileInterestValues, sessionMinutes, type PersonalizedPreferences } from "./preferences";

// Preferences live apart so client forms can validate them without the diagnostic answer keys.
export * from "./preferences";
export const personalizationSubmissionSchema = z.object({
  preferences: personalizedPreferencesSchema,
  diagnostic: diagnosticSubmissionSchema,
}).strict();
export const skipPersonalizationSchema = z.object({}).strict();
/** The existing columns remain the only source of truth for preferences. */
export function toProfileColumns(input: unknown) {
  const preferences = personalizedPreferencesSchema.parse(input);
  return {
    goals: preferences.primaryGoal ? [preferences.primaryGoal] : [],
    interests: preferences.interests,
    experienceLevel: preferences.selfAssessedExperience,
    dailyGoalMinutes: preferences.preferredSessionMinutes,
  };
}
export type StoredProfile = {
  goals: readonly string[]; interests: readonly string[]; experienceLevel: string | null;
  dailyGoalMinutes: number | null; diagnosticResult?: unknown;
  personalizedOnboardingCompletedAt?: Date | null;
};
/** Legacy multi-goal profiles retain their data. Read the first supported goal deterministically.
 * ADVANCED maps to investing; legacy 15-minute sessions map to the new 15–20 minute bucket.
 * Unknown future diagnostic versions are retained in storage and read as neutral evidence. */
export function readLearnerProfile(profile?: StoredProfile | null) {
  const goal = profile?.goals.find((value) => primaryGoalValues.some((known) => known === value));
  const preferences: PersonalizedPreferences = {
    primaryGoal: (goal as PersonalizedPreferences["primaryGoal"]) ?? null,
    interests: profileInterestValues.filter((value) => profile?.interests.includes(value)),
    selfAssessedExperience: profile?.experienceLevel === "BASIC" ? "BASIC" : ["INVESTOR", "ADVANCED"].includes(profile?.experienceLevel ?? "") ? "INVESTOR" : "BEGINNER",
    preferredSessionMinutes: profile?.dailyGoalMinutes === 15 ? 20 : sessionMinutes.find((value) => value === profile?.dailyGoalMinutes) ?? 10,
  };
  return { ...preferences, diagnostic: readDiagnostic(profile?.diagnosticResult), personalized: Boolean(profile?.personalizedOnboardingCompletedAt) };
}
export type LearnerProfile = ReturnType<typeof readLearnerProfile>;
export function requiresInitialOnboarding(profile: { onboardingCompletedAt: Date | null } | undefined, hasLearningHistory: boolean) {
  return !profile?.onboardingCompletedAt && !hasLearningHistory;
}
