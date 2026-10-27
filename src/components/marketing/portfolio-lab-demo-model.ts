import { BROKER_FEE_PROFILES, computeTradeCost, type BrokerFeeProfile } from "@/features/portfolio/costs";
import { fxUnitsFromNumber, priceUnitsFromNumber, roundDivide } from "@/features/portfolio/decimal";
import { MODEL_CRISIS_LEVELS } from "@/features/training/model-crisis";

/**
 * Landing illustration of the Portfolio Lab loop. Nothing here reads or writes a portfolio: every value is
 * derived from a fixed fictional setup, but costs use the real fictional tariffs and `computeTradeCost`,
 * so the numbers match what the Lab review shows for the same amount.
 *
 * Capital mirrors reward policy v4 (unlock grant 5 000 Kč, +2 000 Kč per lesson from level 2); a unit test
 * pins these to the authoritative constants.
 */
export const DEMO_UNLOCK_CAPITAL_MINOR = 500_000n;
export const DEMO_LESSON_CAPITAL_MINOR = 200_000n;
export const DEMO_CAPITAL_MINOR = DEMO_UNLOCK_CAPITAL_MINOR;
export const DEMO_DEFAULT_AMOUNT_KC = 4_500;
export const DEMO_COMPARISON_AMOUNTS_KC = [2_000, 20_000] as const;

/** The visitor's illustrative plan: 90 % ETF, 10 % cash, rebalancing band ±5 percentage points. */
export const DEMO_PLAN = { etfBps: 9_000n, cashBps: 1_000n, bandBps: 500n } as const;

export type DemoInstrumentId = "etf" | "stock";
export const DEMO_INSTRUMENTS: Record<DemoInstrumentId, { name: string; kind: string; inPlan: boolean; short: string }> = {
  etf: { name: "Světový akciový ETF (ukázka)", kind: "ETF · cena v USD", inPlan: true, short: "ETF" },
  stock: { name: "Fiktivní firma a.s.", kind: "Akcie jedné firmy · cena v USD", inPlan: false, short: "Fiktivní firma" },
};

export type DemoTariffId = (typeof BROKER_FEE_PROFILES)[number]["id"];
export const DEMO_TARIFFS = BROKER_FEE_PROFILES;

// One unit costs exactly 1 Kč at the reference rate (0,04 USD × 25 Kč/USD), so a koruna amount is an exact
// 8 dp quantity and the reference notional equals the typed amount. Both instruments are quoted in USD.
const PRICE_UNITS = priceUnitsFromNumber(0.04);
const FX_UNITS = fxUnitsFromNumber(25);

export function tariff(id: DemoTariffId): BrokerFeeProfile {
  return DEMO_TARIFFS.find((profile) => profile.id === id) ?? DEMO_TARIFFS[0];
}

export function demoCost(amountKc: number, tariffId: DemoTariffId) {
  const cost = computeTradeCost({
    quantityUnits: BigInt(amountKc) * 100_000_000n, priceUnits: PRICE_UNITS, fxUnits: FX_UNITS,
    quoteCurrency: "USD", side: "BUY", profile: tariff(tariffId),
  });
  return {
    amountMinor: cost.referenceGrossAmountBaseMinor,
    feeMinor: cost.feeBaseMinor,
    fxMarkupMinor: cost.fxMarkupBaseMinor,
    totalCostMinor: cost.totalCostBaseMinor,
    debitMinor: -cost.cashDeltaBaseMinor,
  };
}
export type DemoCost = ReturnType<typeof demoCost>;

export type AmountCheck = { ok: true; amountKc: number } | { ok: false; message: string };
/** Whole koruny only; the purchase plus its costs must fit in the demo capital (no negative cash). */
export function checkAmount(raw: string, tariffId: DemoTariffId): AmountCheck {
  const digits = raw.replace(/\s/g, "");
  if (!/^\d{1,7}$/.test(digits)) return { ok: false, message: "Zadej částku v celých korunách." };
  const amountKc = Number(digits);
  if (amountKc < 1) return { ok: false, message: "Zadej částku aspoň 1 Kč." };
  if (demoCost(amountKc, tariffId).debitMinor > DEMO_CAPITAL_MINOR) return { ok: false, message: "Na nákup i s náklady cvičný kapitál nestačí." };
  return { ok: true, amountKc };
}

const share = (part: bigint, whole: bigint) => (whole > 0n ? roundDivide(part * 10_000n, whole) : 0n);
const inBand = (part: bigint, whole: bigint, targetBps: bigint) => {
  // Unrounded comparison: |part / whole − target| ≤ band.
  const deviation = part * 10_000n - targetBps * whole;
  return (deviation < 0n ? -deviation : deviation) <= DEMO_PLAN.bandBps * whole;
};

/** Process feedback after the reviewed purchase, with the Lab conventions: weights include cash, the
 * holding is valued at the reference rate (costs are not market movement), no composite score. */
export function demoProcess(amountKc: number, tariffId: DemoTariffId, instrument: DemoInstrumentId) {
  const cost = demoCost(amountKc, tariffId);
  const cashMinor = DEMO_CAPITAL_MINOR - cost.debitMinor;
  const holdingMinor = cost.amountMinor;
  const totalMinor = cashMinor + holdingMinor;
  const etfMinor = instrument === "etf" ? holdingMinor : 0n;
  return {
    cost, cashMinor, holdingMinor, totalMinor,
    changeMinor: totalMinor - DEMO_CAPITAL_MINOR,
    holdingBps: share(holdingMinor, totalMinor),
    etfBps: share(etfMinor, totalMinor),
    cashBps: share(cashMinor, totalMinor),
    etfInPlan: inBand(etfMinor, totalMinor, DEMO_PLAN.etfBps),
    cashInPlan: inBand(cashMinor, totalMinor, DEMO_PLAN.cashBps),
    holdingInPlan: instrument === "etf" ? inBand(holdingMinor, totalMinor, DEMO_PLAN.etfBps) : false,
    capitalShareBps: share(cost.amountMinor, DEMO_CAPITAL_MINOR),
    trades: 1,
  };
}
export type DemoProcess = ReturnType<typeof demoProcess>;

/** First year of the Lab's model crisis (`model-crisis-v1`): index levels for months 0–12. */
export const CRISIS_LEVELS = MODEL_CRISIS_LEVELS.slice(0, 13).map(Number);
export const CRISIS_DECISION_MONTH = 6;

export type CrisisChoice = "sell" | "hold" | "buy";
export const CRISIS_CHOICES: readonly { id: CrisisChoice; label: string; detail: string }[] = [
  { id: "sell", label: "Prodat", detail: "Prodat polovinu ETF" },
  { id: "hold", label: "Držet", detail: "Nic neměnit" },
  { id: "buy", label: "Dokoupit podle plánu", detail: "Z hotovosti dorovnat na cíl 90 %" },
];

/**
 * Month-6 decision in the simplified crisis (no fees): 90 index units bought at 100, 10 cash.
 * A sell is within the plan only when the index share is above target + band (the training rule
 * for band plans); buying with cash is never a sell.
 */
export function crisisOutcome(choice: CrisisChoice) {
  const level = BigInt(CRISIS_LEVELS[CRISIS_DECISION_MONTH]);
  // Hundredths of a start-value point keep the arithmetic exact.
  let index = 90n * level;
  let cash = 1_000n;
  const total = index + cash;
  const shareBefore = share(index, total);
  let sellsOutsidePlan = 0;
  if (choice === "sell") {
    if (index * 10_000n <= (DEMO_PLAN.etfBps + DEMO_PLAN.bandBps) * total) sellsOutsidePlan = 1;
    const sold = index / 2n;
    index -= sold; cash += sold;
  } else if (choice === "buy") {
    const target = (total * DEMO_PLAN.etfBps) / 10_000n;
    const buy = target > index ? (target - index < cash ? target - index : cash) : 0n;
    index += buy; cash -= buy;
  }
  return { shareBeforeBps: shareBefore, indexBps: share(index, index + cash), inBand: inBand(index, index + cash, DEMO_PLAN.etfBps), sellsOutsidePlan };
}

/** Whole percent, half away from zero, from basis points. */
export function wholePercent(bps: bigint) {
  return `${roundDivide(bps, 100n).toString()} %`;
}
