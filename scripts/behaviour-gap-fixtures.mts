import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type postgres from "postgres";
import { trainingPlanFromIps } from "../src/features/training/domain";
import { modelSeries, trainingScenarios } from "../src/features/training/scenarios";
import { BEHAVIOUR_CRISIS_IDS } from "../src/features/missions/registry";
import { ipsSchema } from "../src/features/ips/schema";

/** Synthetic persistence fixtures, never production history. The explicit source name also labels any test UI capture. */
export async function seedBehaviourReplays(sql: postgres.Sql, userId: string, { scenarioIds = [...BEHAVIOUR_CRISIS_IDS] as string[], sample = false, months = 24 } = {}) {
  const url = new URL(process.env.DATABASE_URL!);
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && /_qa$/.test(url.pathname));
  const [plan] = await sql`select * from learner_artifact where user_id=${userId} and kind='investment_plan' order by version desc limit 1`;
  assert.ok(plan);
  for (const scenarioId of scenarioIds) {
    const scenario = trainingScenarios.find((entry) => entry.id === scenarioId)!;
    const [year, month] = scenario.startMonth!.split("-").map(Number);
    const series = { points: modelSeries().points.map((point, index) => ({ ...point, date: new Date(Date.UTC(year, month + index, 0)).toISOString().slice(0, 10) })),
      source: { kind: "history", sample, sourceName: "Syntetická testovací fixture · není historie trhu", symbol: "TEST", instrumentName: "Testovací index", currency: "USD", retrievedAt: "2026-10-28T12:00:00.000Z" } };
    const id = randomUUID();
    await sql`insert into training_session(id,user_id,scenario_id,started_at,ips_artifact_id,plan,series,fee_profile_id,initial_capital_minor,request_id) values(${id},${userId},${scenarioId},now(),${plan.id},${JSON.stringify(trainingPlanFromIps(ipsSchema.parse(plan.payload), plan.version))}::jsonb,${JSON.stringify(series)}::jsonb,'investi-standard-v1',10000000,${randomUUID()})`;
    for (let index = 0; index < months; index++) await sql`insert into training_action(session_id,sequence,month,kind,client_idempotency_key,created_at) values(${id},${index},${index},'advance',${randomUUID()},clock_timestamp())`;
  }
}
