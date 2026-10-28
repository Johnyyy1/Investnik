/** An owned IPS and existing-capital fixture for whole-catalog UI tests; never used by the application. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";
import { exampleIps } from "../src/features/ips/test-fixtures";

export async function prepareFirstPurchase(sql: Sql, userId: string) {
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL!).hostname));
  const plan = { ...exampleIps, allocation: { lines: [{ instrumentId: "SAMPLE-XNAS:CVETF", weightBps: 10000 }], cashBps: 0 }, contribution: { ...exampleIps.contribution, amountMinor: "60000" } };
  const [{ version }] = await sql`select coalesce(max(version), 0) + 1 as version from learner_artifact where user_id=${userId} and kind='investment_plan'`;
  await sql`insert into learner_artifact(id,user_id,kind,version,payload,source_lesson_id,request_id) values(${randomUUID()},${userId},'investment_plan',${version},${sql.json(plan)},null,${randomUUID()})`;
  await sql`insert into progression_unlock(user_id,unlock_id,practice_capital_minor,reason,unlocked_at) values(${userId},'PORTFOLIO_LAB',500000,'test_fixture',now()) on conflict do nothing`;
}
