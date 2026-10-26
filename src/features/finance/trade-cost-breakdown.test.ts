import { describe, expect, it } from "vitest";
import { tradeCostBreakdown } from "./trade-cost-breakdown";

describe("fictional spread and commission model", () => {
  it.each([[50_000, 7_500n, 2_500n, 0.2], [2_000, 6_000n, 100n, 3.05], [6_000, 6_000n, 300n, 1.05], [3_000, 6_000n, 150n, 2.05]] as const)("recomputes the lesson example for %s Kč", (amount, feeMinor, spreadMinor, costPercent) => {
    const actual = tradeCostBreakdown(amount, 0.15, 60, 10_000, 0.1);
    expect(actual).toEqual({ feeMinor, spreadMinor, totalMinor: feeMinor + spreadMinor, costPercent });
    expect(Number(actual.feeMinor) / 100).toBe(Math.max(60, amount * 0.0015));
    expect(Number(actual.spreadMinor) / 100).toBe(amount * 0.001 / 2);
  });
  it("applies the maximum, allows free commission and counts only half the spread", () => {
    expect(tradeCostBreakdown(1_000_000, 0.15, 60, 100, 0).feeMinor).toBe(10_000n);
    expect(tradeCostBreakdown(40_000, 0, 0, 0, 0.2)).toMatchObject({ feeMinor: 0n, spreadMinor: 4_000n });
  });
  it.each([[0.1, 1n], [0.25, 1n], [1.3333, 7n]] as const)("rounds decimal notional %s once per cost component, half away from zero", (amount, spreadMinor) => {
    expect(tradeCostBreakdown(amount, 0, 0, 0, 10).spreadMinor).toBe(spreadMinor);
  });
  it.each([[0, 0.15, 60, 100, 0.1], [NaN, 0.15, 60, 100, 0.1], [3_000, 1.3333, 60, 100, 0.1], [3_000, 0.15, 60, 59, 0.1], [3_000, 0.15, 60, 100, -1], [3_000, Infinity, 60, 100, 0.1]])("rejects invalid or unsupported inputs %j", (...values) => {
    expect(() => tradeCostBreakdown(...values)).toThrow(RangeError);
  });
});
