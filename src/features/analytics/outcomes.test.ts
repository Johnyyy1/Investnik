import { describe, expect, it } from "vitest";
import { exampleIps } from "@/features/ips/test-fixtures";
import { DEFAULT_FEE_PROFILE } from "@/features/portfolio/costs";
import { decimalToPriceUnits, parseQuantity } from "@/features/portfolio/decimal";
import { replayTraining, trainingPlanFromIps, type TrainingAction, type TrainingSetup } from "@/features/training/domain";
import { modelSeries } from "@/features/training/scenarios";
import {
  bigThreeKnowledge, dispositionRatios, drillBehaviour, drillFacts, masteredSkillCounts, masteredSkills, median, northStar, retention, returnGapBps,
  type DrillFacts, type OutcomeAttempt,
} from "./outcomes";
import { buildOutcomesReport, formatOutcomesReport } from "./report";

const series = modelSeries();
const setup: TrainingSetup = {
  dates: series.points.map(({ date }) => date), prices: series.points.map(({ price }) => decimalToPriceUnits(price)),
  initialCapitalMinor: 10_000_000n, feeProfile: DEFAULT_FEE_PROFILE, plan: trainingPlanFromIps(exampleIps, 2),
};
const advances = (count: number): TrainingAction[] => Array.from({ length: count }, () => ({ kind: "advance" }));
const day = (offset: number) => new Date(Date.UTC(2026, 0, 1) + offset * 86_400_000);
const drill = (key: string, startDay: number, overrides: Partial<DrillFacts> = {}): DrillFacts => ({
  key, startedAt: day(startDay), finished: true, sellsOutsidePlan: 0, sellsInDrawdown: 0, turnoverBps: 8_000n, returnGapBps: 0n, allocation: "within-plan", ...overrides,
});
const attempt = (key: string, skillId: string, offsetDays: number, correct: boolean, context: OutcomeAttempt["context"], itemId = `lesson/${skillId}`): OutcomeAttempt =>
  ({ key, skillId, itemId, correct, context, attemptedAt: day(offsetDays) });

describe("drill facts", () => {
  it("counts sells made while the index is at least 20 % below its earlier high, from the replayed drill", () => {
    // The model index falls 100 → 88 (−12 %) by month 2 and → 78 (−22 %) by month 4.
    const state = replayTraining(setup, [{ kind: "buy", amountMinor: 8_000_000n }, ...advances(2), { kind: "sell", quantityUnits: parseQuantity("1") },
      ...advances(2), { kind: "sell", quantityUnits: parseQuantity("1") }, ...advances(20)]);
    const facts = drillFacts("learner", day(0), setup, state);
    expect(facts).toMatchObject({ finished: true, sellsInDrawdown: 1, sellsOutsidePlan: 2 });
    expect(facts.turnoverBps).not.toBeNull();
    expect(facts.returnGapBps).not.toBeNull();
  });

  it("treats MWR − TWR as unavailable when either return is unavailable", () => {
    const available = (basisPoints: string) => ({ status: "available" as const, basisPoints, annualizedBasisPoints: null });
    expect(returnGapBps(available("-150"), available("200"))).toBe(-350n);
    expect(returnGapBps({ status: "unavailable", reason: "no-period" }, available("200"))).toBeNull();
  });
});

describe("north star and drill behaviour", () => {
  const learners = [
    { key: "kept", kind: "account" as const, milestoneAAt: day(30) },
    { key: "retried", kind: "account" as const, milestoneAAt: day(30) },
    { key: "no-drill", kind: "account" as const, milestoneAAt: day(30) },
    { key: "no-milestone", kind: "guest" as const, milestoneAAt: null },
  ];
  const drills = [
    drill("kept", 1), drill("kept", 5, { sellsOutsidePlan: 1 }),
    drill("retried", 1, { sellsOutsidePlan: 2, sellsInDrawdown: 1, turnoverBps: 12_000n, returnGapBps: -300n, allocation: "outside-plan" }), drill("retried", 5),
    drill("no-drill", 1, { finished: false, sellsOutsidePlan: 3 }),
    drill("no-milestone", 1, { turnoverBps: null, returnGapBps: null, allocation: "information" }),
  ];

  it("uses each achiever's first finished drill and keeps learners without one out of the base", () => {
    expect(northStar(learners, drills)).toEqual({ achievers: 3, withDrill: 2, keptPlan: 1, share: 0.5 });
  });

  it("aggregates first finished drills; unavailable values and plans without a band are left out, not zeroed", () => {
    expect(drillBehaviour(drills)).toEqual({
      learners: 3, keptPlan: 2, soldInDrawdown: 1, allocationWithinPlan: { learners: 1, base: 2 }, medianTurnoverBps: 10_000, medianReturnGapBps: -150,
    });
  });

  it("takes the median, averaging the middle pair", () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([0, 1])).toBe(0.5);
    expect(median([-1, -2, 10, -5])).toBe(-1.5);
  });
});

describe("knowledge and retention", () => {
  it("counts skills at Zvládnuté or above with the learner's own mastery derivation", () => {
    const counts = masteredSkillCounts([
      attempt("a", "inflation", 0, true, "checkpoint"),
      attempt("a", "compounding", 0, true, "checkpoint"), attempt("a", "compounding", 9, false, "review"),
      attempt("a", "diversification", 0, true, "lesson"),
    ]);
    expect(counts.get("a")).toBe(1);
    expect(masteredSkills(["a", "b", "c"], counts)).toEqual({ learners: 3, median: 0 });
  });

  it("compares Big Three answers in the entry test with the first checkpoint attempt", () => {
    const rows = bigThreeKnowledge(
      [{ key: "a", itemId: "big-three-inflation", correct: true }, { key: "b", itemId: "big-three-inflation", correct: false }, { key: "a", itemId: "budget-irregular", correct: true }],
      [
        attempt("a", "inflation", 2, false, "lesson", "foundations-checkpoint/big-three-inflation"), attempt("a", "inflation", 1, true, "lesson", "foundations-checkpoint/big-three-inflation"),
        attempt("b", "inflation", 1, false, "lesson", "foundations-checkpoint/big-three-inflation"),
        attempt("c", "inflation", 1, true, "lesson", "foundations-why-invest/envelope-question"),
      ],
    );
    expect(rows.map((row) => row.itemId)).toEqual(["big-three-compounding", "big-three-inflation", "big-three-diversification"]);
    expect(rows[1]).toEqual({ itemId: "big-three-inflation", entry: { answered: 2, correct: 1 }, checkpoint: { answered: 2, correct: 1 } });
    expect(rows[0]).toMatchObject({ entry: { answered: 0, correct: 0 }, checkpoint: { answered: 0, correct: 0 } });
  });

  it("buckets the first mixed retrieval in each window after the first correct answer; lesson re-answers do not count", () => {
    expect(retention([
      attempt("a", "inflation", 0, false, "lesson"), attempt("a", "inflation", 1, true, "lesson"),
      attempt("a", "inflation", 11, true, "checkpoint"), // 10 days: before the first window
      attempt("a", "inflation", 15, true, "review"), attempt("a", "inflation", 20, false, "review"), // 2-week window, second ignored
      attempt("a", "inflation", 57, false, "review"), // exactly 8 weeks after day 1
      attempt("a", "inflation", 300, true, "lesson"),
      attempt("b", "inflation", 0, false, "checkpoint"), attempt("b", "inflation", 40, false, "review"), // never correct: no clock
    ])).toEqual([
      { weeks: 2, checked: 1, correct: 1, share: 1 },
      { weeks: 8, checked: 1, correct: 0, share: 0 },
      { weeks: 26, checked: 0, correct: 0, share: null },
    ]);
  });
});

describe("disposition effect", () => {
  it("counts realized and paper gains and losses on sale days only", () => {
    // Day 1: sold a winner, kept a loser and another winner. Day 2: sold a loser, kept a winner; a flat position counts nowhere.
    expect(dispositionRatios([
      [{ sold: true, gainMinor: 500n }, { sold: false, gainMinor: -200n }, { sold: false, gainMinor: 100n }],
      [{ sold: true, gainMinor: -50n }, { sold: false, gainMinor: 10n }, { sold: false, gainMinor: 0n }],
    ])).toEqual({ pgr: 1 / 3, plr: 1 / 2, difference: 1 / 3 - 1 / 2 });
    expect(dispositionRatios([[{ sold: true, gainMinor: 1n }]])).toEqual({ pgr: 1, plr: null, difference: null });
  });
});

describe("outcomes report", () => {
  it("is JSON-safe and contains no learner key", () => {
    const keys = ["user_secret_1", "user_secret_2"];
    const report = buildOutcomesReport({
      learners: keys.map((key) => ({ key, kind: "account" as const, milestoneAAt: day(10) })),
      attempts: [attempt(keys[0], "inflation", 0, true, "checkpoint", "foundations-checkpoint/big-three-inflation")],
      entry: [{ key: keys[1], itemId: "big-three-inflation", correct: false }],
      drills: [drill(keys[0], 1), drill(keys[1], 1, { sellsOutsidePlan: 1 })],
    }, day(40));
    const json = JSON.stringify(report);
    const text = formatOutcomesReport(report);
    for (const key of keys) {
      expect(json).not.toContain(key);
      expect(text).not.toContain(key);
    }
    expect(report.northStar).toEqual({ achievers: 2, withDrill: 2, keptPlan: 1, share: 0.5 });
    expect(report.masteredSkills.milestoneA).toEqual({ learners: 2, median: 0.5 });
    expect(text).toContain("Zatím neměřeno");
  });
});
