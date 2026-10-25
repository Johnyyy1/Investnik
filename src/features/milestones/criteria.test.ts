import { describe, expect, it } from "vitest";
import type { ProcessFeedback } from "@/features/portfolio/process";
import { capstoneOutcome, crisisPlanCheck, diversifiedCoreCheck, ipsAlignmentCheck, selfAssessmentSchema, thesisSavedCheck } from "./criteria";
import { getCapstone } from "./registry";

const allocation = (value: string | null, status: ProcessFeedback["allocation"]["status"] = "within-plan"): ProcessFeedback["allocation"] =>
  ({ value, threshold: null, status, lines: [], ...value === null ? { reason: "no-ips" as const } : {} });
const holding = (assetType: string, portfolioWeightBasisPoints: string | null) => ({ assetType, portfolioWeightBasisPoints });
const capstoneA = getCapstone("capstone-a-v1")!;
const pass = { "ips-alignment": ipsAlignmentCheck(allocation("120")), diversification: diversifiedCoreCheck({ valuationComplete: true, holdings: [holding("etf", "9000")] }), crisis: crisisPlanCheck({ finished: true, sellsOutsidePlan: 0 }) };
const rated = (level: number, overrides: Record<string, number> = {}) => ({
  ratings: capstoneA.criteria.map((criterion) => ({ criterionId: criterion.id, level: overrides[criterion.id] ?? level })),
  reflection: "Plán jsem dodržel/a, i když pokles byl nepříjemný.",
});

describe("automatic capstone checks", () => {
  it("compares the IPS deviation inclusively at the named 5 p. b. threshold", () => {
    expect(ipsAlignmentCheck(allocation("500"))).toEqual({ check: "ips-alignment-v1", status: "pass", value: "500", threshold: "500" });
    expect(ipsAlignmentCheck(allocation("501", "outside-plan")).status).toBe("fail");
    // Absent evidence is unavailable, never a failure or a pass.
    expect(ipsAlignmentCheck(allocation(null, "unavailable"))).toMatchObject({ status: "unavailable", reason: "no-ips" });
    expect(ipsAlignmentCheck("lab-locked")).toMatchObject({ status: "unavailable", reason: "lab-locked" });
  });

  it("needs a fund and caps any single stock at 10 % of the whole portfolio", () => {
    expect(diversifiedCoreCheck({ valuationComplete: true, holdings: [holding("etf", "8000"), holding("equity", "1000")] })).toMatchObject({ status: "pass", value: "1000", threshold: "1000" });
    expect(diversifiedCoreCheck({ valuationComplete: true, holdings: [holding("etf", "8000"), holding("equity", "1001")] }).status).toBe("fail");
    expect(diversifiedCoreCheck({ valuationComplete: true, holdings: [holding("equity", "500"), holding("bond", "500")] })).toMatchObject({ status: "fail", reason: "no-fund" });
    expect(diversifiedCoreCheck({ valuationComplete: true, holdings: [] })).toMatchObject({ status: "fail", reason: "no-fund" });
    // A missing quote never turns into a zero weight.
    expect(diversifiedCoreCheck({ valuationComplete: false, holdings: [holding("etf", null)] })).toMatchObject({ status: "unavailable", reason: "missing-valuation" });
  });

  it("judges the finished crisis drill by sells outside the IPS, not by its return", () => {
    expect(crisisPlanCheck(null)).toMatchObject({ status: "unavailable", reason: "no-drill" });
    expect(crisisPlanCheck({ finished: false, sellsOutsidePlan: 0 })).toMatchObject({ status: "unavailable", reason: "drill-unfinished" });
    expect(crisisPlanCheck({ finished: true, sellsOutsidePlan: 0 }).status).toBe("pass");
    expect(crisisPlanCheck({ finished: true, sellsOutsidePlan: 1 })).toMatchObject({ status: "fail", value: "1", threshold: "0" });
    expect(thesisSavedCheck(true).status).toBe("pass");
    expect(thesisSavedCheck(false).status).toBe("unavailable");
  });
});

describe("capstone rubric outcome", () => {
  it("passes when every criterion reaches Zdatný and every check passes", () => {
    const outcome = capstoneOutcome(capstoneA, pass, rated(3));
    expect(outcome.passed).toBe(true);
    expect(outcome.criteria.map((criterion) => criterion.level)).toEqual([3, 3, 3, 3]);
  });

  it("caps a criterion with a failed check at level 2 whatever the self-assessment", () => {
    const failed = { ...pass, crisis: crisisPlanCheck({ finished: true, sellsOutsidePlan: 2 }) };
    const outcome = capstoneOutcome(capstoneA, failed, rated(4));
    expect(outcome.criteria.find((criterion) => criterion.criterionId === "crisis")?.level).toBe(2);
    expect(outcome.passed).toBe(false);
  });

  it("leaves criteria unrated when evidence is unavailable, missing or from another check", () => {
    expect(capstoneOutcome(capstoneA, { ...pass, crisis: crisisPlanCheck(null) }, rated(4)).passed).toBe(false);
    const withoutCrisis = { "ips-alignment": pass["ips-alignment"], diversification: pass.diversification };
    expect(capstoneOutcome(capstoneA, withoutCrisis, rated(4)).criteria.at(-1)?.level).toBeNull();
    expect(capstoneOutcome(capstoneA, { ...pass, crisis: thesisSavedCheck(true) }, rated(4)).passed).toBe(false);
  });

  it("fails one criterion below Zdatný and stored rows that no longer parse", () => {
    expect(capstoneOutcome(capstoneA, pass, rated(4, { costs: 2 })).passed).toBe(false);
    expect(capstoneOutcome(capstoneA, pass, { ratings: [], reflection: "x" }).passed).toBe(false);
    expect(capstoneOutcome(capstoneA, null, null).passed).toBe(false);
  });

  it("requires exactly one 1–4 rating per criterion and a reflection", () => {
    const schema = selfAssessmentSchema(capstoneA);
    expect(schema.safeParse(rated(3)).success).toBe(true);
    expect(schema.safeParse({ ...rated(3), reflection: "  " }).success).toBe(false);
    expect(schema.safeParse(rated(5)).success).toBe(false);
    const ratings = rated(3).ratings;
    expect(schema.safeParse({ ...rated(3), ratings: [...ratings.slice(1), ratings[1]] }).success).toBe(false);
    expect(schema.safeParse({ ...rated(3), ratings: ratings.slice(1) }).success).toBe(false);
    expect(schema.safeParse({ ...rated(3), ratings: [...ratings.slice(1), { criterionId: "made-up", level: 3 }] }).success).toBe(false);
  });
});
