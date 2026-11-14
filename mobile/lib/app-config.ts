import { appConfigSchema, type AppConfig } from "@investnik/contracts";

// Any failure (no endpoint yet, offline, malformed body) means "no minimum, no maintenance": the app is never blocked by it.
export const appConfigFallback: AppConfig = { minSupportedVersion: null, latestVersion: null, maintenance: false };

export function parseAppConfig(body: unknown): AppConfig {
  const parsed = appConfigSchema.safeParse(body);
  return parsed.success ? parsed.data : appConfigFallback;
}
