import { completedHistoricalReplays, finishedModelDrill } from "./checks";
import { describe, expect, it } from "vitest";
import { checkIpsPurchase, checkPlannedIpsPurchase, checkScenario, contributionMonthsWithBuy, type ScenarioDecision } from "./checks";
import { exampleIps } from "@/features/ips/test-fixtures";
import { requireMissions } from "./requirements";
import { getMission } from "./registry";
import { DEFAULT_FEE_PROFILE } from "@/features/portfolio/costs";
import { decimalToPriceUnits } from "@/features/portfolio/decimal";
import { replayTraining, trainingPlanFromIps, type TrainingSetup } from "@/features/training/domain";
import { modelSeries } from "@/features/training/scenarios";

export const decision: ScenarioDecision = { allocation: { svet: 80, tech: 0, cip: 0, energie: 0, banka: 0, leky: 0 }, prediction: "fail" };
describe("server mission criteria", () => {
  it("grades explainable diversification rules independently of prediction and returns", () => {
    expect(checkScenario(decision)).toMatchObject({ completed: true, rules: expect.arrayContaining([expect.objectContaining({ id: "cash", percent: 20, pass: true })]) });
    expect(checkScenario({ ...decision, prediction: "pass" }).completed).toBe(true);
    expect(checkScenario({ ...decision, allocation: { ...decision.allocation, svet: 0, tech: 100 } }).completed).toBe(false);
    expect(checkScenario({ ...decision, allocation: { ...decision.allocation, svet: 0 } }).completed).toBe(false);
  });
  it.each([
    { ...decision, completed: true }, { ...decision, allocation: { ...decision.allocation, svet: 101 } },
    { ...decision, allocation: { ...decision.allocation, svet: -10 } }, { ...decision, allocation: { ...decision.allocation, svet: 0.1 } },
    { ...decision, allocation: { ...decision.allocation, tech: 30 } }, { ...decision, allocation: { ...decision.allocation, invented: 0 } },
    { ...decision, allocation: {} }, { ...decision, prediction: undefined },
  ])("rejects forged, incomplete or invalid decisions %#", (input) => expect(() => checkScenario(input)).toThrow());
  it("requires a real ETF BUY after the saved plan with an exact instrument identity", () => {
    const at = new Date("2026-10-23T10:00:00Z");
    const trade = { id: "t", instrumentId: "IE-XETR:VWCE", side: "BUY", instrumentAssetType: "etf", executedAt: at };
    expect(checkIpsPurchase(exampleIps, at, [trade])?.id).toBe("t");
    for (const wrong of [{ ...trade, side: "SELL" }, { ...trade, instrumentAssetType: "equity" }, { ...trade, instrumentId: "US:VWCE" }, { ...trade, executedAt: new Date(at.getTime() - 1) }]) expect(checkIpsPurchase(exampleIps, at, [wrong])).toBeUndefined();
    expect(checkIpsPurchase({ ...exampleIps, allocation: { lines: [{ assetClass: "equity", weightBps: 8000 }], cashBps: 2000 } }, at, [trade])).toBeUndefined();
    expect(checkIpsPurchase({}, at, [trade])).toBeUndefined();
  });
  it("counts only months whose IPS contribution was invested in the same month, from the replayed training log", () => {
    const series = modelSeries();
    const setup: TrainingSetup = {
      dates: series.points.map(({ date }) => date), prices: series.points.map(({ price }) => decimalToPriceUnits(price)),
      initialCapitalMinor: 10_000_000n, feeProfile: DEFAULT_FEE_PROFILE, plan: { ...trainingPlanFromIps(exampleIps, 2), contributionMinor: "250000" },
    };
    const buy = { kind: "buy", amountMinor: 250_000n } as const, advance = { kind: "advance" } as const;
    const regular = Array.from({ length: 12 }, () => [advance, buy]).flat();
    expect(contributionMonthsWithBuy(replayTraining(setup, regular))).toBe(12);
    // A lump sum in month 0 and twelve months of only advancing leaves every contribution as cash.
    expect(contributionMonthsWithBuy(replayTraining(setup, [buy, ...Array.from({ length: 12 }, () => advance)]))).toBe(0);
    // Two buys in one month still count once; selling is not a purchase.
    expect(contributionMonthsWithBuy(replayTraining(setup, [advance, buy, buy, advance, { kind: "sell", quantityUnits: 1_000_000_000n }]))).toBe(1);
    expect(contributionMonthsWithBuy(replayTraining({ ...setup, plan: { ...setup.plan, contributionMinor: "0" } }, regular))).toBe(0);
  });
  it("completes the B10 drill on a finished model crisis and records, but never requires, keeping the plan", () => {
    const series = modelSeries();
    const setup: TrainingSetup = {
      dates: series.points.map(({ date }) => date), prices: series.points.map(({ price }) => decimalToPriceUnits(price)),
      initialCapitalMinor: 10_000_000n, feeProfile: DEFAULT_FEE_PROFILE, plan: trainingPlanFromIps(exampleIps, 3),
    };
    const advance = { kind: "advance" } as const;
    const months = series.points.length - 1;
    const entry = (id: string, actions: Parameters<typeof replayTraining>[1], overrides: Partial<{ scenarioId: string; series: typeof series }> = {}) =>
      ({ session: { id, scenarioId: "model-crisis-v1", series, plan: setup.plan, ...overrides }, state: replayTraining(setup, actions), setup });
    const invest = { kind: "buy", amountMinor: 8_000_000n } as const;
    const kept = entry("kept", [invest, ...Array.from({ length: months }, () => advance)]);
    expect(kept.state.finished).toBe(true);
    expect(finishedModelDrill([kept], "model-crisis-v1")).toEqual({ sessionId: "kept", ipsVersion: 3, months, sellsOutsidePlan: 0, allocationStatus: expect.any(String), contributionMonths: months, planKept: true });
    // Selling the index in the fifth month while it is under the band breaks the plan; the drill is still complete.
    const panic = [invest, ...Array.from({ length: 5 }, () => advance), { kind: "sell", quantityUnits: 1_000_000_000n } as const, ...Array.from({ length: months - 5 }, () => advance)];
    const broken = entry("broken", panic);
    expect(broken.state.trades.at(-1)?.planStatus).toBe("outside-plan");
    expect(finishedModelDrill([kept, broken], "model-crisis-v1")).toMatchObject({ sessionId: "broken", sellsOutsidePlan: 1, planKept: false });
    // Unfinished drills, other scenarios and a series that is not the exact model crisis are not evidence.
    expect(finishedModelDrill([entry("open", [invest, advance])], "model-crisis-v1")).toBeUndefined();
    expect(finishedModelDrill([entry("other", [invest, ...Array.from({ length: months }, () => advance)], { scenarioId: "history-2008-v1" })], "model-crisis-v1")).toBeUndefined();
    const forged = { ...series, points: series.points.map((point, index) => index === 6 ? { ...point, price: "50" } : point) };
    expect(finishedModelDrill([entry("forged", [invest, ...Array.from({ length: months }, () => advance)], { series: forged })], "model-crisis-v1")).toBeUndefined();
    const history = { ...series, source: { kind: "history", sourceName: "x", symbol: "X", instrumentName: "X", sample: false, currency: "USD", retrievedAt: "2026-10-31T00:00:00Z" } } as const;
    expect(finishedModelDrill([entry("history", [invest, ...Array.from({ length: months }, () => advance)], { series: history })], "model-crisis-v1")).toBeUndefined();
    expect(getMission("crisis-drill-model-v1", "behaviour-crisis-drill")).toMatchObject({ context: "training", check: "crisis-drill-finished-v1", params: { scenarioId: "model-crisis-v1" } });
  });
  it("binds requirements to the registered lesson and server evidence", async () => {
    expect(() => getMission("constructor")).toThrow();
    await expect(requireMissions(["allocation-training-v1"], "foundations-portfolio", async () => false)).rejects.toThrow("Nejdřív splň misi");
    await expect(requireMissions(["allocation-training-v1"], "foundations-portfolio", async () => true)).resolves.toBeUndefined();
    await expect(requireMissions(["allocation-training-v1"], "foundations-stocks", async () => true)).rejects.toThrow();
    await expect(requireMissions([], "foundations-stocks", async () => false)).resolves.toBeUndefined();
  });
  it("checks the planned contribution share against the full cash debit, with exact 1% boundaries", () => {
    const at = new Date("2026-10-27T10:00:00Z");
    // 2,500.25 Kč × 80% = 2,000.20 Kč; tolerance rounds to 20.00 Kč.
    const target = 250025n * 8000n / 10000n;
    const trade = { id: "planned", instrumentId: "IE-XETR:VWCE", side: "BUY", instrumentAssetType: "etf", executedAt: at, cashDeltaBaseMinor: -target };
    expect(checkPlannedIpsPurchase(exampleIps, at, [trade])).toMatchObject({ trade, targetMinor: target, toleranceMinor: 2000n });
    for (const delta of [-2000n, 2000n]) expect(checkPlannedIpsPurchase(exampleIps, at, [{ ...trade, cashDeltaBaseMinor: -(target + delta) }])).toBeDefined();
    for (const delta of [-2001n, 2001n, target * 9n]) expect(checkPlannedIpsPurchase(exampleIps, at, [{ ...trade, cashDeltaBaseMinor: -(target + delta) }])).toBeUndefined();
    for (const wrong of [{ ...trade, side: "SELL" }, { ...trade, instrumentAssetType: "equity" }, { ...trade, instrumentId: "US:VWCE" }, { ...trade, executedAt: new Date(at.getTime() - 1) }, { ...trade, cashDeltaBaseMinor: target }]) expect(checkPlannedIpsPurchase(exampleIps, at, [wrong])).toBeUndefined();
    expect(checkPlannedIpsPurchase({ ...exampleIps, contribution: { ...exampleIps.contribution, amountMinor: "0" } }, at, [trade])).toBeUndefined();
    expect(checkPlannedIpsPurchase({}, at, [trade])).toBeUndefined();
  });
  it("does not accept a tiny purchase or add several trades to reach the target", () => {
    const at = new Date();
    const trade = { id: "tiny", instrumentId: "IE-XETR:VWCE", side: "BUY", instrumentAssetType: "etf", executedAt: at, cashDeltaBaseMinor: -100n };
    expect(checkIpsPurchase(exampleIps, at, [trade])).toBeDefined(); // Preserve v1 evidence semantics.
    expect(checkPlannedIpsPurchase(exampleIps, at, [trade])).toBeUndefined();
    expect(checkPlannedIpsPurchase(exampleIps, at, Array.from({ length: 2 }, () => ({ ...trade, cashDeltaBaseMinor: -100010n })))).toBeUndefined();
    const small = { ...exampleIps, contribution: { ...exampleIps.contribution, amountMinor: "25" } };
    expect(checkPlannedIpsPurchase(small, at, [{ ...trade, cashDeltaBaseMinor: -20n }])?.toleranceMinor).toBe(0n);
  });
  it("uses the shared half-away rounding for fractional contribution shares", () => {
    const at = new Date();
    const plan = { ...exampleIps, allocation: { lines: [{ instrumentId: "IE-XETR:VWCE", weightBps: 5000 }], cashBps: 5000 }, contribution: { ...exampleIps.contribution, amountMinor: "101" } };
    const trade = { id: "rounded", instrumentId: "IE-XETR:VWCE", side: "BUY", instrumentAssetType: "etf", executedAt: at, cashDeltaBaseMinor: -51n };
    // 1.01 Kč × 50% = 0.505 Kč → 0.51 Kč; 1% of 51 haléřů → 1 haléř.
    expect(checkPlannedIpsPurchase(plan, at, [trade])).toMatchObject({ targetMinor: 51n, toleranceMinor: 1n });
    expect(checkPlannedIpsPurchase(plan, at, [{ ...trade, cashDeltaBaseMinor: -53n }])).toBeUndefined();
  });
});

describe("historical behaviour replay requirements", () => {
  const replay = (id: string, start: string, sample = false, finished = true) => {
    const [year, month] = start.split("-").map(Number);
    return { session: { scenarioId: id, series: { points: Array.from({ length: 25 }, (_, index) => ({ date: new Date(Date.UTC(year, month + index, 0)).toISOString().slice(0, 10), price: "100" })), source: { kind: "history" as const, sample, sourceName: "Synthetic unit fixture", symbol: "TEST", instrumentName: "Test", currency: "USD" as const, retrievedAt: "2026-10-28T12:00:00Z" } } }, state: { finished } };
  };
  it("requires every full historical window and rejects sample, partial and mislabeled windows", () => {
    const expected = ["history-2008-v1", "history-2020-v1", "history-2022-v1"];
    const first = replay(expected[0], "2007-12");
    const second = replay(expected[1], "2019-12");
    const third = replay(expected[2], "2021-12");
    expect(completedHistoricalReplays([first, second, third], expected)).toHaveLength(3);
    expect(completedHistoricalReplays([first, second, replay(expected[2], "2021-12", true)], expected)).toHaveLength(2);
    expect(completedHistoricalReplays([first, second, replay(expected[2], "2021-12", false, false)], expected)).toHaveLength(2);
    expect(completedHistoricalReplays([replay(expected[0], "2019-12"), second, third], expected)).toHaveLength(2);
    expect(completedHistoricalReplays([first, first, second], expected)).toHaveLength(2);
  });
});
