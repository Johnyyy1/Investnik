import { acquisitionSource } from "@/features/analytics/acquisition";
import { getIP } from "better-auth/api";
import { db } from "@/db";
import { recordAcquisitionView, recordLandingView } from "@/features/analytics/repository";
import { rateLimiter } from "@/features/rate-limit";
import { LANDING_VIEW_IP_RULE, NO_TRUSTED_IP_SUBJECT } from "@/features/rate-limit/policy";
import { auth } from "@/lib/auth";
import { logUnexpectedError } from "@/lib/server-errors";

/**
 * First-party landing-page view counter for the product funnel. It reads no cookie and stores no
 * identifier: the IP only keys an HMAC'd rate-limit bucket, and the count is one number per day.
 * The answer is always an empty 204, so a caller learns nothing about whether it was counted.
 */
export const dynamic = "force-dynamic";

const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  // Browsers mark their own beacons; anything sent from another site is not a view of ours.
  const site = request.headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return noContent();
  if (request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") return noContent();
  const raw = new URL(request.url).searchParams.get("source");
  const source = acquisitionSource(raw);
  if (raw !== null && !source) return noContent();
  try {
    const decision = await rateLimiter.consume([{ scope: "analytics:landing-view", subject: getIP(request, auth.options) ?? NO_TRUSTED_IP_SUBJECT, rule: LANDING_VIEW_IP_RULE }]);
    if (decision.allowed) {
      if (source) await recordAcquisitionView(db, source);
      else await recordLandingView(db);
    }
  } catch (error) {
    logUnexpectedError("analytics", "landing view", error);
  }
  return noContent();
}
