import { z } from "zod";
import { artifactContentSchema } from "@/features/artifacts/schemas";

export const shareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);
export const previewShareSchema = z.strictObject({ artifactId: z.uuid() });
export const createShareSchema = previewShareSchema.extend({ consent: z.literal(true), requestId: z.uuid() });
export const revokeShareSchema = z.strictObject({ token: shareTokenSchema });
export type PublicPlanSummary = { review: string; rebalancing?: string; crisis?: string };
const reviews = { monthly: "Plán kontroluji měsíčně.", quarterly: "Plán kontroluji čtvrtletně.", annually: "Plán kontroluji ročně." } as const;
const rebalancing = { calendar: "Mix udržuji při plánované kontrole.", band: "Mix upravuji podle předem zvoleného pásma.", contributions: "Mix udržuji pomocí příspěvků." } as const;
const crisis = { keep_plan: "Při poklesu se držím plánu.", review_plan: "Při poklesu znovu projdu plán.", pause_contributions: "Při poklesu mám v plánu pozastavit příspěvky.", other: "Pro pokles mám zapsaný vlastní postup." } as const;

/** Projection v1 is frozen: later projections need a new version, never broader fields here. */
export function publicPlanSummary(content: unknown, projectionVersion = 1): PublicPlanSummary | null {
  if (projectionVersion !== 1) return null;
  const parsed = artifactContentSchema.safeParse(content);
  if (!parsed.success || parsed.data.kind !== "investment_plan") return null;
  const plan = parsed.data.payload;
  // Build from fixed enum dictionaries, never spread a payload or include learner-authored text.
  return "schemaVersion" in plan ? { review: reviews[plan.checkFrequency], rebalancing: rebalancing[plan.rebalancing.mode], crisis: crisis[plan.drawdownRule.action] } : { review: reviews[plan.reviewFrequency] };
}
export function summaryLines(summary: PublicPlanSummary) {
  return [summary.review, summary.rebalancing, summary.crisis].filter((line): line is string => Boolean(line));
}
export type PublicPlan = { version: number; createdAt: string; summary: PublicPlanSummary };
export type OwnedShare = { token: string; artifactId: string; version: number; revokedAt: string | null; createdAt: string };
