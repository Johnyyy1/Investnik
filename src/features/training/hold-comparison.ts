import { roundDivide } from "@/features/portfolio/decimal";
import { evaluateTraining, maxBuyAmountMinor, replayTraining, type TrainingAction, type TrainingSetup, type TrainingState } from "./domain";

/** Same dates, contributions, fees and initial IPS invested share; invest that share of each new contribution, never sell.
 * Like the learner, the reference cannot trade after the final month's contribution. It stays in cash. */
export function holdTraining(setup: TrainingSetup, month: number): TrainingState {
  const actions: TrainingAction[] = [];
  let state = replayTraining(setup, actions);
  for (let current = 0; current < month; current++) {
    const funds = current === 0 ? setup.initialCapitalMinor : BigInt(setup.plan.contributionMinor);
    const budget = roundDivide(funds * BigInt(setup.plan.targetInvestedBps), 10_000n);
    const maximum = maxBuyAmountMinor(setup, state);
    const amountMinor = budget < maximum ? budget : maximum;
    if (amountMinor > 0n) actions.push({ kind: "buy", amountMinor });
    actions.push({ kind: "advance" });
    state = replayTraining(setup, actions);
  }
  return state;
}

/** Difference of the displayed, rounded returns, in basis points; never an accounting amount or a grade. */
export function compareWithHold(setup: TrainingSetup, state: TrainingState) {
  const holdTwr = evaluateTraining(setup, holdTraining(setup, state.month)).twr;
  const { mwr } = evaluateTraining(setup, state);
  const annualized = holdTwr.status === "available" && holdTwr.annualizedBasisPoints !== null;
  const differenceBasisPoints = holdTwr.status === "available" && mwr.status === "available"
    ? (BigInt(annualized ? mwr.annualizedBasisPoints! : mwr.basisPoints) - BigInt(annualized ? holdTwr.annualizedBasisPoints! : holdTwr.basisPoints)).toString() : null;
  return { holdTwr, differenceBasisPoints, annualized };
}
