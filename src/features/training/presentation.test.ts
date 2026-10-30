import { describe, expect, it } from "vitest";
import { exampleIps } from "@/features/ips/test-fixtures";
import { DEFAULT_FEE_PROFILE } from "@/features/portfolio/costs";
import { decimalToPriceUnits } from "@/features/portfolio/decimal";
import { replayTraining, trainingPlanFromIps, type TrainingSetup } from "./domain";
import { presentTraining } from "./presentation";
import { modelSeries } from "./scenarios";

const series = modelSeries();
const setup: TrainingSetup = { dates: series.points.map((point) => point.date), prices: series.points.map((point) => decimalToPriceUnits(point.price)), initialCapitalMinor: 10_000_000n, plan: trainingPlanFromIps(exampleIps, 1), feeProfile: DEFAULT_FEE_PROFILE };
const session = { id: "test", scenarioId: "model-crisis-v1", plan: setup.plan, series };

describe("training presentation", () => {
  it("never reveals future prices or lets them affect the current headline and portfolio", () => {
    const state = replayTraining(setup, [{ kind: "advance" }]);
    const visible = presentTraining(session, setup, state);
    const changedFuture = { ...setup, prices: setup.prices.map((price, index) => index > state.month ? 1000n * price : price) };
    expect(presentTraining(session, changedFuture, state)).toEqual(visible);
    expect(visible.points).toHaveLength(2);
    expect(visible.evaluation).toBeNull();
    expect(visible.headline).toContain("klesá");
  });
  it("shows only start context before the first decision, and the reference only after completion", () => {
    expect(presentTraining(session, setup, replayTraining(setup, [])).headline).toContain("Další vývoj zatím neznáš");
    const state = replayTraining(setup, Array.from({ length: 24 }, () => ({ kind: "advance" as const })));
    const view = presentTraining(session, setup, state);
    expect(view.headline).toContain("roste");
    expect(view.evaluation?.comparison.holdTwr.status).toBe("available");
    expect(view.evaluation?.comparison.differenceBasisPoints).not.toBeNull();
  });
});
