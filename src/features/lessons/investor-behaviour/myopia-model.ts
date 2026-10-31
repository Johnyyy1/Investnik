/**
 * Simulated series for lesson B.1.4 (myopic loss aversion). Not market data: one deterministic
 * path of invented daily returns, the same idea as the simulated funds in Thaler, Tversky,
 * Kahneman & Schwartz (1997). The lesson shows the *same* path twice: as daily changes and as
 * yearly results, so only the frequency of looking differs.
 *
 * Assumptions (stated in the lesson): 10 years × 252 trading days; stocks 7 % expected yearly
 * return and 16 % yearly volatility, bonds 2 % and 4 %; normally distributed simple daily returns,
 * independent; the mix is rebalanced daily; no costs, taxes or currency. Seed 1 is the first seed,
 * not one picked for a pleasant result.
 */
export const myopiaSimulation = {
  seed: 1,
  years: 10,
  tradingDaysPerYear: 252,
  stocks: { expectedReturn: 0.07, volatility: 0.16 },
  bonds: { expectedReturn: 0.02, volatility: 0.04 },
  startValue: 100_000,
  stockShares: [20, 50, 80],
} as const;

/** Mulberry32: a small, deterministic 32-bit generator. Uniform in [0, 1). */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Daily simple returns of the two simulated asset classes, as decimals: [stocks, bonds] per day. */
export function simulatedDailyReturns(simulation = myopiaSimulation): (readonly [number, number])[] {
  const random = mulberry32(simulation.seed);
  // Box–Muller: one standard normal draw from two uniforms.
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const days = simulation.years * simulation.tradingDaysPerYear;
  const draw = ({ expectedReturn, volatility }: { expectedReturn: number; volatility: number }) =>
    expectedReturn / simulation.tradingDaysPerYear + volatility / Math.sqrt(simulation.tradingDaysPerYear) * normal();
  return Array.from({ length: days }, () => {
    const stock = draw(simulation.stocks);
    return [stock, draw(simulation.bonds)] as const;
  });
}

export type MixView = {
  stockShare: number;
  days: number;
  lossDays: number;
  worstDay: number;
  years: number;
  lossYears: number;
  worstYear: number;
  endValue: number;
};

/** What a learner sees for one stock/bond mix: daily and yearly losses of the same simulated path. */
export function mixView(stockShare: number, daily = simulatedDailyReturns(), simulation = myopiaSimulation): MixView {
  const weight = stockShare / 100;
  let value: number = simulation.startValue;
  let yearStart = value;
  let lossDays = 0;
  let worstDay = 0;
  const yearly: number[] = [];
  daily.forEach(([stock, bond], index) => {
    const change = weight * stock + (1 - weight) * bond;
    if (change < 0) lossDays += 1;
    worstDay = Math.min(worstDay, change);
    value *= 1 + change;
    if ((index + 1) % simulation.tradingDaysPerYear === 0) {
      yearly.push(value / yearStart - 1);
      yearStart = value;
    }
  });
  return { stockShare, days: daily.length, lossDays, worstDay, years: yearly.length, lossYears: yearly.filter((change) => change < 0).length, worstYear: Math.min(0, ...yearly), endValue: value };
}

export const myopiaViews = myopiaSimulation.stockShares.map((share) => mixView(share));
