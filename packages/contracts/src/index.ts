import { z } from "zod";

// Body of every /api/v1 failure. `code` is a string, not an enum, so a new code is not a breaking change.
export const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

// GET /api/v1/app-config. A null version means the variable is unset: no minimum, nothing newer.
export const appConfigSchema = z.object({
  minSupportedVersion: z.string().nullable(),
  latestVersion: z.string().nullable(),
  maintenance: z.boolean(),
});
export type AppConfig = z.infer<typeof appConfigSchema>;
