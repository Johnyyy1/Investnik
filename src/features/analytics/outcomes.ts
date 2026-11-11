import { bigThreeQuestions } from "@/features/lessons/foundations/checkpoint";
import type { AttemptContext } from "@/features/mastery/contexts";
import { MASTERED, skillLevel } from "@/features/mastery/domain";
import { roundDivide } from "@/features/portfolio/decimal";
import type { PerformanceMetric } from "@/features/portfolio/performance";
import { evaluateTraining, type TrainingSetup, type TrainingState } from "@/features/training/domain";

/**
 * Learning-outcome measurement (#130). Pure: the repository loads existing append-only records (milestone
 * achievements, skill attempts, entry-test answers, crisis drills), these functions turn them into aggregate
 * counts. No new tracking. The opaque learner key never leaves this module.
 *
 * Every window, threshold and definition here is a design proposal to validate, not a research constant.
 */
const DAY_MS = 24 * 60 * 60 * 1000;
const BPS = 10_000n;
/** "Prodej po −20 %": a sell while the index is at least this far below its earlier high in the drill. */
export const DRAWDOWN_SELL_BPS = 2_000n;
/** Retention checkpoints after a skill was first answered correctly: from 2, 8 and 26 weeks on. */
export const RETENTION_WEEKS = [2, 8, 26] as const;

export type OutcomeLearner = { key: string; kind: "account" | "guest"; milestoneAAt: Date | null };
export type OutcomeAttempt = { key: string; skillId: string; itemId: string; correct: boolean; context: AttemptContext; attemptedAt: Date };
/** One answer from the learner's latest adaptive entry test (V2); earlier tests are overwritten by design (#124). */
export type EntryAnswer = { key: string; itemId: string; correct: boolean };

/** One crisis drill reduced to process facts. Returns are context only, never part of a verdict. */
export type DrillFacts = {
  key: string;
  startedAt: Date;
  finished: boolean;
  sellsOutsidePlan: number;
  sellsInDrawdown: number;
  turnoverBps: bigint | null;
  /** MWR − TWR over the same drill period, both cumulative; null when either is unavailable. */
  returnGapBps: bigint | null;
  allocation: "within-plan" | "outside-plan" | "information";
};

/** MWR − TWR shows the effect of cash-flow timing. It is not by itself proof of a behavioural mistake. */
export function returnGapBps(mwr: PerformanceMetric, twr: PerformanceMetric) {
  return mwr.status === "available" && twr.status === "available" ? BigInt(mwr.basisPoints) - BigInt(twr.basisPoints) : null;
}

/** Process facts of one replayed drill, from the same evaluation the learner sees. */
export function drillFacts(key: string, startedAt: Date, setup: TrainingSetup, state: TrainingState): DrillFacts {
  const evaluation = evaluateTraining(setup, state);
  const drawdownByMonth: bigint[] = [];
  let peak = setup.prices[0];
  for (const price of setup.prices.slice(0, state.month + 1)) {
    if (price > peak) peak = price;
    drawdownByMonth.push(roundDivide((peak - price) * BPS, peak));
  }
  return {
    key, startedAt, finished: state.finished,
    sellsOutsidePlan: evaluation.sellsOutsidePlan,
    sellsInDrawdown: state.trades.filter((trade) => trade.side === "SELL" && drawdownByMonth[trade.month] >= DRAWDOWN_SELL_BPS).length,
    turnoverBps: evaluation.turnoverBps,
    returnGapBps: returnGapBps(evaluation.mwr, evaluation.twr),
    allocation: evaluation.allocation.status,
  };
}

/**
 * The learner's first finished drill. A retry already knows the path of the crisis, so the first run is the
 * honest test of keeping the plan; the milestone capstone separately checks the latest one.
 */
function firstFinishedDrills(drills: readonly DrillFacts[]) {
  const first = new Map<string, DrillFacts>();
  for (const drill of drills) {
    if (!drill.finished) continue;
    const current = first.get(drill.key);
    if (!current || drill.startedAt < current.startedAt) first.set(drill.key, drill);
  }
  return first;
}

const share = (count: number, base: number) => base ? count / base : null;

/** Median; an even count averages the two middle values. */
export function median(values: readonly number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * North star: of the learners who reached milestone A, the share who kept their own IPS in their first finished
 * crisis drill (no sell outside the plan). Learners without a finished drill are reported apart, never as failures.
 */
export function northStar(learners: readonly OutcomeLearner[], drills: readonly DrillFacts[]) {
  const first = firstFinishedDrills(drills);
  const achievers = learners.filter((learner) => learner.milestoneAAt !== null);
  const withDrill = achievers.filter((learner) => first.has(learner.key));
  const keptPlan = withDrill.filter((learner) => first.get(learner.key)!.sellsOutsidePlan === 0).length;
  return { achievers: achievers.length, withDrill: withDrill.length, keptPlan, share: share(keptPlan, withDrill.length) };
}

/** How many skills each learner holds at Zvládnuté or above, from the same derivation the learner sees. */
export function masteredSkillCounts(attempts: readonly OutcomeAttempt[]) {
  const bySkill = new Map<string, Map<string, OutcomeAttempt[]>>();
  for (const attempt of attempts) {
    const skills = bySkill.get(attempt.key) ?? new Map<string, OutcomeAttempt[]>();
    skills.set(attempt.skillId, [...(skills.get(attempt.skillId) ?? []), attempt]);
    bySkill.set(attempt.key, skills);
  }
  return new Map([...bySkill].map(([key, skills]) => [key, [...skills.values()].filter((rows) => skillLevel(rows) >= MASTERED).length]));
}

/** Median count of skills at Zvládnuté or above in a group; learners without attempts count as zero. */
export function masteredSkills(keys: readonly string[], counts: ReadonlyMap<string, number>) {
  return { learners: keys.length, median: median(keys.map((key) => counts.get(key) ?? 0)) };
}

const CHECKPOINT_LESSON = "foundations-checkpoint";

/**
 * Knowledge on the Big Three questions, the same wording in the entry test and the Foundations checkpoint.
 * The entry test is the learner's latest; the checkpoint counts the first attempt per learner. The two groups
 * are different people, so this is a description, not a measured learning effect.
 */
export function bigThreeKnowledge(entry: readonly EntryAnswer[], attempts: readonly OutcomeAttempt[]) {
  return bigThreeQuestions.map(({ id }) => {
    const entryRows = entry.filter((row) => row.itemId === id);
    const first = new Map<string, OutcomeAttempt>();
    for (const attempt of attempts) {
      if (attempt.itemId !== `${CHECKPOINT_LESSON}/${id}`) continue;
      const current = first.get(attempt.key);
      if (!current || attempt.attemptedAt < current.attemptedAt) first.set(attempt.key, attempt);
    }
    const checkpoint = [...first.values()];
    return {
      itemId: id,
      entry: { answered: entryRows.length, correct: entryRows.filter((row) => row.correct).length },
      checkpoint: { answered: checkpoint.length, correct: checkpoint.filter((row) => row.correct).length },
    };
  });
}

/**
 * Delayed retrieval. For every learner and skill, the clock starts at the first correct answer. The first mixed
 * checkpoint or review answer from 2 weeks on falls in the 2-week window, from 8 weeks in the 8-week window and
 * from 26 weeks in the 26-week window. Lesson re-answers are not retrieval: the lesson shows the content again.
 */
export function retention(attempts: readonly OutcomeAttempt[]) {
  const windows = RETENTION_WEEKS.map((weeks) => ({ weeks, checked: 0, correct: 0 }));
  const groups = new Map<string, OutcomeAttempt[]>();
  for (const attempt of attempts) {
    const id = `${attempt.key}\u0000${attempt.skillId}`;
    groups.set(id, [...(groups.get(id) ?? []), attempt]);
  }
  for (const rows of groups.values()) {
    const sorted = [...rows].sort((a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime());
    const start = sorted.find((row) => row.correct);
    if (!start) continue;
    const seen = new Set<number>();
    for (const row of sorted) {
      if (row.context === "lesson") continue;
      const days = (row.attemptedAt.getTime() - start.attemptedAt.getTime()) / DAY_MS;
      const index = RETENTION_WEEKS.findLastIndex((weeks) => days >= weeks * 7);
      if (index < 0 || seen.has(index)) continue;
      seen.add(index);
      windows[index].checked += 1;
      if (row.correct) windows[index].correct += 1;
    }
  }
  return windows.map((window) => ({ ...window, share: share(window.correct, window.checked) }));
}

/** Process behaviour in each learner's first finished crisis drill, aggregated. */
export function drillBehaviour(drills: readonly DrillFacts[]) {
  const first = [...firstFinishedDrills(drills).values()];
  const banded = first.filter((drill) => drill.allocation !== "information");
  const count = (test: (drill: DrillFacts) => boolean) => first.filter(test).length;
  return {
    learners: first.length,
    keptPlan: count((drill) => drill.sellsOutsidePlan === 0),
    soldInDrawdown: count((drill) => drill.sellsInDrawdown > 0),
    allocationWithinPlan: { learners: banded.filter((drill) => drill.allocation === "within-plan").length, base: banded.length },
    medianTurnoverBps: median(first.flatMap((drill) => drill.turnoverBps === null ? [] : [Number(drill.turnoverBps)])),
    medianReturnGapBps: median(first.flatMap((drill) => drill.returnGapBps === null ? [] : [Number(drill.returnGapBps)])),
  };
}

/**
 * Disposition effect (Odean 1998). On every day with a sale, each position held counts once: a realized gain or
 * loss when sold, a paper gain or loss when kept. Positions at exactly zero count in neither. PGR = RG / (RG + PG),
 * PLR = RL / (RL + PL); PGR above PLR means winners were sold more readily than losers.
 */
export function dispositionRatios(saleDays: readonly (readonly { sold: boolean; gainMinor: bigint }[])[]) {
  let realizedGains = 0, paperGains = 0, realizedLosses = 0, paperLosses = 0;
  for (const positions of saleDays) {
    for (const { sold, gainMinor } of positions) {
      if (gainMinor > 0n) { if (sold) realizedGains += 1; else paperGains += 1; }
      if (gainMinor < 0n) { if (sold) realizedLosses += 1; else paperLosses += 1; }
    }
  }
  const pgr = share(realizedGains, realizedGains + paperGains), plr = share(realizedLosses, realizedLosses + paperLosses);
  return { pgr, plr, difference: pgr === null || plr === null ? null : pgr - plr };
}
