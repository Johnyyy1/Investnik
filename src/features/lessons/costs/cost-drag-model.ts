export const costDragDefaults = { monthly: 2_000, years: 30, gross: 6, cost: 0.2 } as const;

/** Educational model of lesson 2.2.4, not fund accounting: the net annual return is gross − total annual costs,
 * the simplification the lesson states. Contributions arrive at the start of each month and grow at the constant
 * monthly rate (1 + net)^(1/12) − 1. Before tax; the gross return is an assumption, not a forecast.
 */
export function costDragValue(monthly: number, years: number, grossPercent: number, costPercent: number) {
  if (![monthly, years, grossPercent, costPercent].every(Number.isFinite) || monthly < 100 || monthly > 100_000 || !Number.isInteger(years) || years < 1 || years > 40 || grossPercent < -5 || grossPercent > 12 || costPercent < 0 || costPercent > 3) return null;
  const monthlyRate = (1 + (grossPercent - costPercent) / 100) ** (1 / 12) - 1;
  let value = 0;
  for (let month = 0; month < years * 12; month++) value = (value + monthly) * (1 + monthlyRate);
  return value;
}

/** The same plan with and without its costs; `costImpact` is what the costs took by the end. */
export function compareCostDrag(monthly: number, years: number, grossPercent: number, costPercent: number) {
  const withCosts = costDragValue(monthly, years, grossPercent, costPercent);
  const withoutCosts = costDragValue(monthly, years, grossPercent, 0);
  if (withCosts === null || withoutCosts === null) return null;
  return { contributed: monthly * 12 * years, withCosts, withoutCosts, costImpact: withoutCosts - withCosts };
}
