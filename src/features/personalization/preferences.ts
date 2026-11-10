import { z } from "zod";

// Reuse existing PostgreSQL identifiers; new labels are never persisted.
export const primaryGoalValues = ["CONFIDENCE", "LONG_TERM_ETF", "COMPANIES", "PORTFOLIO", "QUANT"] as const;
export const profileInterestValues = ["STOCKS", "ETFS", "PORTFOLIO", "FUNDAMENTALS", "DATA", "QUANT", "BACKTESTING"] as const;
export const selfAssessmentValues = ["BEGINNER", "BASIC", "INVESTOR"] as const;
export const sessionMinutes = [5, 10, 20, 30] as const;
export const personalizedPreferencesSchema = z.object({
  primaryGoal: z.enum(primaryGoalValues).nullable(),
  interests: z.array(z.enum(profileInterestValues)).max(7).refine((values) => new Set(values).size === values.length, "Duplicitní zájmy nejsou povolené."),
  selfAssessedExperience: z.enum(selfAssessmentValues),
  preferredSessionMinutes: z.union([z.literal(5), z.literal(10), z.literal(20), z.literal(30)]),
}).strict();
export type PersonalizedPreferences = z.infer<typeof personalizedPreferencesSchema>;
export const defaultPreferences: PersonalizedPreferences = {
  primaryGoal: null, interests: [], selfAssessedExperience: "BEGINNER", preferredSessionMinutes: 10,
};
