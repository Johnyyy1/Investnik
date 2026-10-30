import { describe, expect, it } from "vitest";
import { exampleIps } from "@/features/ips/test-fixtures";
import { DEFAULT_FEE_PROFILE } from "@/features/portfolio/costs";
import { decimalToPriceUnits } from "@/features/portfolio/decimal";
import { replayTraining, trainingPlanFromIps, type TrainingSetup } from "./domain";
import { compareWithHold, holdTraining } from "./hold-comparison";

const setup: TrainingSetup = {
  dates: ["2020-01-31", "2020-02-29", "2020-03-31"], prices: ["100", "80", "110"].map(decimalToPriceUnits),
  initialCapitalMinor: 10_000_000n, plan: { ...trainingPlanFromIps(exampleIps, 1), contributionMinor: "250025" }, feeProfile: DEFAULT_FEE_PROFILE,
};

describe("hold-and-contribute comparison", () => {
  it("uses the same exact-money ledger, plan weights, fees and contributions, without sales", () => {
    const state = holdTraining(setup, 2);
    expect(state.trades.map((trade) => [trade.month, trade.side, trade.grossMinor])).toEqual([[0, "BUY", 8_000_000n], [1, "BUY", 200_020n]]);
    expect(state.trades[1].quantityUnits).toBe(2_500_250_000n); // 2 000,20 Kč / 80 Kč = 25.0025 units.
    expect(state.contributedMinor).toBe(10_000_000n + 2n * 250_025n);
    expect(state.cashMinor).toBe(state.contributedMinor - 8_000_000n - 200_020n - 8_000n - 1_000n);
    expect(setup.plan.contributionMinor).toBe("250025");
  });

  it("shows a signed MWR minus reference TWR on the same period basis; a gap also exists without a behavioral error", () => {
    const state = holdTraining(setup, 2);
    const result = compareWithHold(setup, state);
    expect(result.holdTwr).toMatchObject({ status: "available", basisPoints: String(Math.round(((83_920 / 100_000) * (111_160.33 / 86_420.25) - 1) * 10_000)) });
    expect(result.annualized).toBe(false);
    expect(result.differenceBasisPoints).not.toBeNull();
    expect(BigInt(result.differenceBasisPoints!)).not.toBe(0n);
    const waiting = replayTraining(setup, [{ kind: "advance" }, { kind: "advance" }]);
    expect(BigInt(compareWithHold(setup, waiting).differenceBasisPoints!)).toBeLessThan(0n);
  });

  it("uses annualized metrics together for a full year and makes zero-period results unavailable", () => {
    const annual = { ...setup, dates: ["2020-01-31", "2020-07-31", "2021-01-31"] };
    expect(compareWithHold(annual, holdTraining(annual, 2)).annualized).toBe(true);
    expect(compareWithHold(setup, replayTraining(setup, []))).toMatchObject({ differenceBasisPoints: null, holdTwr: { status: "unavailable" } });
  });

  it("handles 100 % invested, zero cash targets, zero and tiny contributions without overspending", () => {
    for (const contributionMinor of ["0", "10", "25", "13333"]) {
      for (const targetInvestedBps of [0, 10000]) {
        const base = { ...setup, plan: { ...setup.plan, contributionMinor, targetInvestedBps } };
        expect(holdTraining(base, 2).cashMinor).toBeGreaterThanOrEqual(0n);
      }
    }
  });
});
