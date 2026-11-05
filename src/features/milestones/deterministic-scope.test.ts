import { expect, it } from "vitest";
import { backtestHistoryPlans } from "@/features/backtesting/catalog";
import { BacktestDataError } from "@/features/backtesting/spec";
import { createMarketDataService } from "@/features/market-data/composition";
import { completedHistoricalReplays } from "@/features/missions/checks";
import { BEHAVIOUR_CRISIS_IDS } from "@/features/missions/registry";
import { lessonSteps } from "@/features/progress/transition";
import { availableScenarios, loadScenarioSeries } from "@/features/training/scenarios";
import { milestoneStates } from "./domain";

// #477 stop-rule reproduction: this documents a blocker, not successful milestone coverage.
it("cannot satisfy milestone A's required historical mission with deterministic sample data", async () => {
  const a = milestoneStates({ completions: [], attempts: [], submissions: [] }).find((state) => state.id === "A")!;
  expect(a.lessons.some((lesson) => lesson.id === "behaviour-behaviour-gap")).toBe(true);
  expect(lessonSteps("behaviour-behaviour-gap").flatMap((step) => step.blocks)).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: "labMission", missionId: "behaviour-crises-v1" }),
  ]));

  const plan = backtestHistoryPlans.deterministic;
  const service = createMarketDataService({ provider: "deterministic", fxProvider: "deterministic" });
  const offered = new Set(availableScenarios(plan).map((scenario) => scenario.id));
  expect(BEHAVIOUR_CRISIS_IDS.filter((id) => !offered.has(id))).toEqual(["history-2008-v1"]);
  await expect(loadScenarioSeries(service, plan, "history-2008-v1")).rejects.toThrow(BacktestDataError);

  const replays = await Promise.all(BEHAVIOUR_CRISIS_IDS.filter((id) => offered.has(id)).map(async (scenarioId) => ({
    session: { scenarioId, series: await loadScenarioSeries(service, plan, scenarioId) },
    // Even fully completed sessions cannot pass the production provenance check.
    state: { finished: true },
  })));
  expect(replays).toHaveLength(2);
  for (const replay of replays) expect(replay.session.series.source).toMatchObject({ kind: "history", sample: true });
  expect(completedHistoricalReplays(replays, BEHAVIOUR_CRISIS_IDS)).toEqual([]);
});
