import { z } from "zod";
import { evaluateScenario, lessonInstrumentIds } from "@/features/lessons/diversification/model";
import { ipsSchema } from "@/features/ips/schema";
import type { TrainingSeries } from "@/features/training/scenarios";
import { modelSeries, trainingScenarios } from "@/features/training/scenarios";
import { evaluateTraining, type TrainingSetup, type TrainingState } from "@/features/training/domain";
import { roundDivide } from "@/features/portfolio/decimal";

const percent = z.number().int().min(0).max(100).multipleOf(10);
export const scenarioDecisionSchema = z.strictObject({
  allocation: z.strictObject(Object.fromEntries(lessonInstrumentIds.map((id) => [id, percent])) as Record<(typeof lessonInstrumentIds)[number], typeof percent>)
    .refine((allocation) => Object.values(allocation).reduce((sum, value) => sum + value, 0) <= 100),
  prediction: z.enum(["pass", "fail"]),
});
export type ScenarioDecision = z.infer<typeof scenarioDecisionSchema>;

/** No prices, return target or client verdict enters the process criteria. */
export function checkScenario(input: unknown) {
  const decision = scenarioDecisionSchema.parse(input);
  const result = evaluateScenario(decision.allocation);
  return { decision, completed: result.passed, rules: result.rules.map(({ id, label, percent, maxPercent, pass }) => ({ id, label, percent, maxPercent, pass })) };
}

/** Months in which the IPS contribution arrived and the learner bought in that same month. Returns are not read. */
export function contributionMonthsWithBuy(state: Pick<TrainingState, "contributions" | "trades">) {
  const bought = new Set(state.trades.filter((trade) => trade.side === "BUY").map((trade) => trade.month));
  return state.contributions.filter((contribution) => contribution.amountMinor > 0n && bought.has(contribution.month)).length;
}

export type PurchaseEvidence = { id: string; instrumentId: string; instrumentAssetType: string; side: string; executedAt: Date };
export function checkIpsPurchase(payload: unknown, planCreatedAt: Date, trades: readonly PurchaseEvidence[]) {
  const parsed = ipsSchema.safeParse(payload);
  if (!parsed.success) return undefined;
  // Free-text instrument names are not identities. Only explicit instrument lines can prove a match.
  const planned = new Set(parsed.data.allocation.lines.flatMap((line) => "instrumentId" in line ? [line.instrumentId] : []));
  return trades.find((trade) => trade.side === "BUY" && trade.instrumentAssetType === "etf" && planned.has(trade.instrumentId) && trade.executedAt >= planCreatedAt);
}

/** V2: one planned ETF share of the monthly budget, including all recorded costs, within 1%. */
export function checkPlannedIpsPurchase(payload: unknown, planCreatedAt: Date, trades: readonly (PurchaseEvidence & { cashDeltaBaseMinor: bigint })[]) {
  const parsed = ipsSchema.safeParse(payload);
  if (!parsed.success) return undefined;
  for (const trade of trades) {
    if (!checkIpsPurchase(parsed.data, planCreatedAt, [trade])) continue;
    const line = parsed.data.allocation.lines.find((line) => "instrumentId" in line && line.instrumentId === trade.instrumentId)!;
    const targetMinor = roundDivide(BigInt(parsed.data.contribution.amountMinor) * BigInt(line.weightBps), 10000n);
    const toleranceMinor = roundDivide(targetMinor, 100n);
    const difference = -trade.cashDeltaBaseMinor - targetMinor;
    if (targetMinor > 0n && trade.cashDeltaBaseMinor < 0n && difference >= -toleranceMinor && difference <= toleranceMinor) return { trade, targetMinor, toleranceMinor };
  }
  return undefined;
}

/** Only complete, non-sample historical windows count. Waiting is valid; trades and returns are never criteria. */
export function completedHistoricalReplays<T extends { session: { scenarioId: string; series: TrainingSeries }; state: Pick<TrainingState, "finished"> }>(sessions: readonly T[], scenarioIds: readonly string[]) {
  return scenarioIds.flatMap((id) => {
    const scenario = trainingScenarios.find((entry) => entry.id === id);
    const match = sessions.findLast(({ session, state }) => state.finished && session.scenarioId === id
      && session.series.source.kind === "history" && !session.series.source.sample
      && session.series.points.length === 25
      && session.series.points[0].date.slice(0, 7) === scenario?.startMonth
      && session.series.points.at(-1)!.date.slice(0, 7) === scenario?.endMonth);
    return match ? [match] : [];
  });
}

/**
 * B10 crisis drill: the latest finished session of the deterministic model crisis, frozen with the exact
 * model series. Finishing completes the drill whatever the learner did; keeping the IPS is recorded as
 * evidence (sells outside the plan, allocation vs band, months with a contribution), never as a pass/fail.
 */
export function finishedModelDrill<T extends { session: { id: string; scenarioId: string; series: TrainingSeries; plan: { ipsVersion: number } }; state: TrainingState; setup: TrainingSetup }>(sessions: readonly T[], scenarioId: string) {
  const expected = modelSeries();
  const match = sessions.findLast(({ session, state }) => state.finished && session.scenarioId === scenarioId
    && session.series.source.kind === "model"
    && session.series.points.length === expected.points.length
    && session.series.points.every((point, index) => point.date === expected.points[index].date && point.price === expected.points[index].price));
  if (!match) return undefined;
  const evaluation = evaluateTraining(match.setup, match.state);
  return {
    sessionId: match.session.id, ipsVersion: match.session.plan.ipsVersion, months: match.state.lastMonth,
    sellsOutsidePlan: evaluation.sellsOutsidePlan, allocationStatus: evaluation.allocation.status,
    contributionMonths: match.state.contributions.length, planKept: evaluation.sellsOutsidePlan === 0,
  };
}
