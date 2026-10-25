import { z } from "zod";
import type { ProcessFeedback } from "@/features/portfolio/process";
import { capstoneThresholds, FAILED_CHECK_CAP, PASSING_RUBRIC_LEVEL, type CapstoneCheck, type CapstoneDefinition } from "./registry";

/**
 * Automatic capstone criteria (#126): pure functions over server-loaded Lab, IPS and training data.
 * Missing evidence is "unavailable", never a failure and never a pass. Weights compare at whole basis points,
 * the rounding Portfolio Lab process feedback already shows.
 */
export type CheckStatus = "pass" | "fail" | "unavailable";
export type CheckResult = { check: CapstoneCheck; status: CheckStatus; value: string | null; threshold: string | null; reason?: string };

const unavailable = (check: CapstoneCheck, reason: string, threshold: string | null = null): CheckResult => ({ check, status: "unavailable", value: null, threshold, reason });
const compare = (check: CapstoneCheck, value: bigint, max: number): CheckResult =>
  ({ check, status: value <= BigInt(max) ? "pass" : "fail", value: value.toString(), threshold: max.toString() });

/** Largest absolute gap between the Lab portfolio and the saved IPS target, cash included. */
export function ipsAlignmentCheck(allocation: ProcessFeedback["allocation"] | "lab-locked"): CheckResult {
  const threshold = capstoneThresholds.ipsMaxDeviationBps;
  if (allocation === "lab-locked") return unavailable("ips-alignment-v1", "lab-locked", threshold.toString());
  if (allocation.status === "unavailable" || allocation.value === null) return unavailable("ips-alignment-v1", allocation.reason ?? "missing-valuation", threshold.toString());
  return compare("ips-alignment-v1", BigInt(allocation.value), threshold);
}

type Holding = { assetType: string; portfolioWeightBasisPoints: string | null };
/** At least one ETF and no single stock above the cap, as a share of the whole portfolio. */
export function diversifiedCoreCheck(portfolio: { valuationComplete: boolean; holdings: readonly Holding[] } | "lab-locked"): CheckResult {
  const threshold = capstoneThresholds.singleStockMaxBps;
  if (portfolio === "lab-locked") return unavailable("diversified-core-v1", "lab-locked", threshold.toString());
  if (!portfolio.valuationComplete || portfolio.holdings.some((holding) => holding.portfolioWeightBasisPoints === null)) return unavailable("diversified-core-v1", "missing-valuation", threshold.toString());
  const largest = portfolio.holdings.filter((holding) => holding.assetType === "equity").reduce((max, holding) => {
    const weight = BigInt(holding.portfolioWeightBasisPoints!);
    return weight > max ? weight : max;
  }, 0n);
  const result = compare("diversified-core-v1", largest, threshold);
  return portfolio.holdings.some((holding) => holding.assetType === "etf") ? result : { ...result, status: "fail", reason: "no-fund" };
}

/** The latest crisis drill must be finished; then every sell has to be within the IPS rules. */
export function crisisPlanCheck(drill: { finished: boolean; sellsOutsidePlan: number } | null): CheckResult {
  const threshold = capstoneThresholds.crisisMaxSellsOutsidePlan;
  if (!drill) return unavailable("crisis-plan-kept-v1", "no-drill", threshold.toString());
  if (!drill.finished) return unavailable("crisis-plan-kept-v1", "drill-unfinished", threshold.toString());
  return compare("crisis-plan-kept-v1", BigInt(drill.sellsOutsidePlan), threshold);
}

/** The artifact schema already requires risks and exit criteria, so a saved thesis evidences them. */
export function thesisSavedCheck(saved: boolean): CheckResult {
  return saved ? { check: "thesis-saved-v1", status: "pass", value: null, threshold: null } : unavailable("thesis-saved-v1", "no-thesis");
}

export function selfAssessmentSchema(capstone: CapstoneDefinition) {
  const ids = capstone.criteria.map((criterion) => criterion.id) as [string, ...string[]];
  return z.strictObject({
    ratings: z.array(z.strictObject({ criterionId: z.enum(ids), level: z.number().int().min(1).max(4) })).length(ids.length)
      .refine((ratings) => new Set(ratings.map((rating) => rating.criterionId)).size === ids.length, "Ohodnoť každé kritérium jednou."),
    reflection: z.string().trim().min(1).max(2000),
  });
}

/**
 * A criterion's level is the learner's self-assessment. A failed check caps it at FAILED_CHECK_CAP; an unavailable
 * check leaves it unrated. The capstone passes when every criterion reaches PASSING_RUBRIC_LEVEL. Stored rows that
 * no longer parse never pass.
 */
export function capstoneOutcome(capstone: CapstoneDefinition, autoCriteria: unknown, selfAssessment: unknown) {
  const self = selfAssessmentSchema(capstone).safeParse(selfAssessment);
  const checks = (autoCriteria ?? {}) as Partial<Record<string, CheckResult>>;
  const criteria = capstone.criteria.map((criterion) => {
    const selfLevel = self.success ? self.data.ratings.find((rating) => rating.criterionId === criterion.id)!.level : null;
    const check = criterion.check ? checks[criterion.id]?.check === criterion.check ? checks[criterion.id]! : null : undefined;
    const level = selfLevel === null || check === null || check?.status === "unavailable" ? null
      : check?.status === "fail" ? Math.min(selfLevel, FAILED_CHECK_CAP) : selfLevel;
    return { criterionId: criterion.id, selfLevel, check, level };
  });
  return { criteria, passed: criteria.every((criterion) => criterion.level !== null && criterion.level >= PASSING_RUBRIC_LEVEL) };
}
