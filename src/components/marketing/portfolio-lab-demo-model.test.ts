import { describe, expect, it } from "vitest";
import { BROKER_FEE_PROFILES } from "@/features/portfolio/costs";
import { PORTFOLIO_LAB_UNLOCK_CAPITAL_MINOR } from "@/features/progression/unlocks";
import { LESSON_PRACTICE_CAPITAL_MINOR } from "@/features/rewards/practice-capital";
import { modelSeries } from "@/features/training/scenarios";
import {
  checkAmount, CRISIS_LEVELS, crisisOutcome, DEMO_DEFAULT_AMOUNT_KC, DEMO_LESSON_CAPITAL_MINOR,
  DEMO_UNLOCK_CAPITAL_MINOR, demoCost, demoProcess, wholePercent,
} from "./portfolio-lab-demo-model";

const [standard, lowFx] = BROKER_FEE_PROFILES.map((profile) => profile.id);

describe("landing Portfolio Lab demo", () => {
  it("uses the reward policy amounts the product grants", () => {
    expect(DEMO_UNLOCK_CAPITAL_MINOR).toBe(PORTFOLIO_LAB_UNLOCK_CAPITAL_MINOR);
    expect(DEMO_LESSON_CAPITAL_MINOR).toBe(LESSON_PRACTICE_CAPITAL_MINOR);
  });

  it("prices purchases with the real fictional tariffs", () => {
    expect(demoCost(2_000, standard)).toMatchObject({ amountMinor: 200_000n, feeMinor: 1_000n, fxMarkupMinor: 1_000n, totalCostMinor: 2_000n });
    expect(demoCost(2_000, lowFx)).toMatchObject({ feeMinor: 2_500n, fxMarkupMinor: 200n, totalCostMinor: 2_700n });
    expect(demoCost(20_000, standard).totalCostMinor).toBe(12_000n);
    expect(demoCost(20_000, lowFx).totalCostMinor).toBe(6_000n);
    // Half-haléř boundary: 0,50 % of 4 501 Kč is 22,505 Kč → 22,51 Kč (half away from zero).
    expect(demoCost(4_501, standard).fxMarkupMinor).toBe(2_251n);
  });

  it("keeps the default purchase inside the illustrative plan", () => {
    const process = demoProcess(DEMO_DEFAULT_AMOUNT_KC, standard, "etf");
    expect(process.cost.totalCostMinor).toBe(3_250n);
    expect(process.cashMinor).toBe(46_750n);
    expect(process.totalMinor).toBe(496_750n);
    expect(process.changeMinor).toBe(-3_250n);
    expect([wholePercent(process.etfBps), wholePercent(process.cashBps)]).toEqual(["91 %", "9 %"]);
    expect([process.etfInPlan, process.cashInPlan]).toEqual([true, true]);
  });

  it("reports a single stock and an underweight ETF as outside the plan", () => {
    const stock = demoProcess(DEMO_DEFAULT_AMOUNT_KC, standard, "stock");
    expect([stock.etfBps, stock.etfInPlan, stock.holdingInPlan]).toEqual([0n, false, false]);
    const small = demoProcess(2_000, standard, "etf");
    expect(wholePercent(small.etfBps)).toBe("40 %");
    expect([small.etfInPlan, small.cashInPlan]).toEqual([false, false]);
  });

  it("refuses amounts that would leave negative cash", () => {
    expect(checkAmount("4 965", standard)).toEqual({ ok: true, amountKc: 4_965 });
    expect(checkAmount("4 966", standard).ok).toBe(false);
    expect(checkAmount("0", standard).ok).toBe(false);
    expect(checkAmount("12,5", standard).ok).toBe(false);
  });

  it("draws the Lab's model crisis and judges the plan, not the return", () => {
    expect(CRISIS_LEVELS).toEqual(modelSeries().points.slice(0, 13).map(({ price }) => Number(price)));
    expect(crisisOutcome("hold")).toMatchObject({ indexBps: 8_630n, inBand: true, sellsOutsidePlan: 0 });
    expect(crisisOutcome("buy")).toMatchObject({ indexBps: 9_000n, inBand: true, sellsOutsidePlan: 0 });
    expect(crisisOutcome("sell")).toMatchObject({ indexBps: 4_315n, inBand: false, sellsOutsidePlan: 1 });
  });
});
