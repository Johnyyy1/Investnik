import { describe, expect, it } from "vitest";
import { computeTradeCost, DEFAULT_FEE_PROFILE, tradeFeeMinor, type BrokerFeeProfile } from "./costs";
import { fxUnitsFromNumber, parseQuantity, priceUnitsFromNumber } from "./decimal";

const profile: BrokerFeeProfile = { id: "test-v1", name: "Test", tradeFee: { rateBps: 100, minMinor: 100n, maxMinor: 1_000n, currency: "CZK" }, fxMarkupBps: 50 };
const cost = (quantity: string, price: number, fx = 1, side: "BUY" | "SELL" = "BUY", tariff = profile) => computeTradeCost({ quantityUnits: parseQuantity(quantity), priceUnits: priceUnitsFromNumber(price), fxUnits: fxUnitsFromNumber(fx), quoteCurrency: fx === 1 ? "CZK" : "USD", side, profile: tariff });

describe("shared lesson and Portfolio Lab trade costs", () => {
  // Lesson 2.1.6 tariff: 0.15 %, min. 60 Kč, max. 600 Kč. 40 000 Kč and 400 000 Kč land exactly on the bounds.
  it.each([[200_000n, 6_000n], [3_999_900n, 6_000n], [4_000_000n, 6_000n], [4_000_100n, 6_000n], [5_000_000n, 7_500n], [39_999_900n, 60_000n], [40_000_000n, 60_000n], [40_000_100n, 60_000n], [50_000_000n, 60_000n]] as const)("clamps a percentage fee for %s minor units to its minimum and maximum", (amount, expected) => {
    expect(tradeFeeMinor({ rateBps: 15, minMinor: 6_000n, maxMinor: 60_000n }, amount)).toBe(expected);
  });

  it("rounds an exact fractional amount once, half away from zero", () => {
    const fee = { rateBps: 15, minMinor: 0n, maxMinor: 1_000_000n };
    expect(tradeFeeMinor(fee, 10_000n)).toBe(15n);
    expect(tradeFeeMinor(fee, 3_333n)).toBe(5n); // 4.9995 → 5
    expect(tradeFeeMinor(fee, 1n, 3n)).toBe(0n);
    expect(tradeFeeMinor(fee, 10_001n, 3n)).toBe(tradeFeeMinor(fee, 3_334n)); // 5.0005 and 5.001 both → 5
  });

  it.each([[99, 100n], [100, 100n], [100.01, 100n], [999.99, 1_000n], [1_000, 1_000n], [1_001, 1_000n]] as const)("clamps commission at minimum, maximum and their boundaries (%s)", (price, expected) => {
    expect(cost("1", price).feeBaseMinor).toBe(expected);
  });

  it.each([["0.1", 307n, 309n], ["0.25", 768n, 772n], ["1.3333", 4_098n, 4_119n]] as const)("uses exact decimal quantities (%s), prices and multi-decimal FX", (quantity, reference, execution) => {
    const result = cost(quantity, 1.3333, 23.054321987654);
    expect(result.referenceGrossAmountBaseMinor).toBe(reference);
    expect(result.grossAmountBaseMinor).toBe(execution);
    expect(result.cashDeltaBaseMinor).toBe(-(result.grossAmountBaseMinor + result.feeBaseMinor));
    expect(result.grossAmountBaseMinor - result.referenceGrossAmountBaseMinor).toBe(result.fxMarkupBaseMinor);
    expect(result.totalCostBaseMinor).toBe(result.feeBaseMinor + result.fxMarkupBaseMinor);
  });

  it("rounds money half away from zero once, without multiplying a rounded unit price", () => {
    const noFee = { ...profile, tradeFee: { ...profile.tradeFee, rateBps: 0, minMinor: 0n }, fxMarkupBps: 0 };
    expect(cost("0.25", 0.1, 1, "BUY", noFee).grossAmountBaseMinor).toBe(3n);
    expect(cost("1.3333", 0.25, 1, "BUY", noFee).grossAmountBaseMinor).toBe(33n);
    const percentage = { ...noFee, tradeFee: { ...noFee.tradeFee, rateBps: 100 } };
    expect(cost("1", 1.495, 1, "BUY", percentage).feeBaseMinor).toBe(1n);
  });

  it("applies adverse FX in each direction and charges neither FX nor an invented spread on CZK trades", () => {
    const buy = cost("1", 100, 25);
    const sell = cost("1", 100, 25, "SELL");
    expect(buy).toMatchObject({ referenceGrossAmountBaseMinor: 250_000n, grossAmountBaseMinor: 251_250n, fxMarkupBaseMinor: 1_250n, feeBaseMinor: 1_000n, cashDeltaBaseMinor: -252_250n });
    expect(sell).toMatchObject({ grossAmountBaseMinor: 248_750n, fxMarkupBaseMinor: 1_250n, cashDeltaBaseMinor: 247_750n });
    expect(cost("1", 100)).toMatchObject({ fxMarkupBps: 0, fxMarkupBaseMinor: 0n });
    expect(DEFAULT_FEE_PROFILE.tradeFee.minMinor).toBeGreaterThan(0n);
  });

  it("rejects invalid profile configuration instead of producing financial values", () => {
    expect(() => cost("1", 100, 25, "BUY", { ...profile, fxMarkupBps: 10_000 })).toThrow(RangeError);
    expect(() => cost("1", 100, 1, "BUY", { ...profile, tradeFee: { ...profile.tradeFee, maxMinor: 0n } })).toThrow(RangeError);
  });
});
