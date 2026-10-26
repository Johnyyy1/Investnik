import { computeTradeCost } from "@/features/portfolio/costs";
import { FX_SCALE, PRICE_SCALE, priceUnitsFromNumber, roundDivide } from "@/features/portfolio/decimal";

/** One side of a fictional CZK trade, measured against the quote midpoint, without FX or slippage.
 * The amount is midpoint notional, not an ask-price cash budget. Commission shares the Lab calculation. */
export function tradeCostBreakdown(amount: number, feePercent: number, minimum: number, maximum: number, spreadPercent: number) {
  if (![amount, feePercent, minimum, maximum, spreadPercent].every(Number.isFinite)
    || amount <= 0 || amount > 1_000_000 || feePercent < 0 || feePercent > 10
    || minimum < 0 || maximum < minimum || maximum > 10_000 || spreadPercent < 0 || spreadPercent > 10
    || Math.abs(feePercent * 100 - Math.round(feePercent * 100)) > 1e-8) throw new RangeError("Invalid model trade inputs.");
  const units = (value: number) => value === 0 ? 0n : priceUnitsFromNumber(value);
  const minor = (value: number) => roundDivide(units(value) * 100n, PRICE_SCALE);
  const cost = computeTradeCost({ quantityUnits: units(amount), priceUnits: PRICE_SCALE, fxUnits: FX_SCALE, quoteCurrency: "CZK", side: "BUY",
    profile: { id: "lesson-model", name: "Modelový ceník", tradeFee: { rateBps: Math.round(feePercent * 100), minMinor: minor(minimum), maxMinor: minor(maximum), currency: "CZK" }, fxMarkupBps: 0 } });
  const spreadMinor = roundDivide(units(amount) * units(spreadPercent) * 100n, PRICE_SCALE * PRICE_SCALE * 200n);
  const totalMinor = cost.feeBaseMinor + spreadMinor;
  return { feeMinor: cost.feeBaseMinor, spreadMinor, totalMinor, costPercent: Number(totalMinor) / amount };
}
