import { AssertionError } from "node:assert";
import type postgres from "postgres";
import { afterEach, expect, it, vi } from "vitest";
import { seedBehaviourReplays } from "../../../scripts/behaviour-gap-fixtures.mjs";

afterEach(() => vi.unstubAllEnvs());

it.each([
  ["false", "localhost", "investi_missions_qa", true],
  ["false", "127.0.0.1", "investi_browser_qa", true],
  ["false", "[::1]", "investi_browser_qa", true],
  ["true", "127.0.0.1", "investi_ci", true],
  ["false", "127.0.0.1", "investi_ci", false],
  ["1", "127.0.0.1", "investi_ci", false],
  ["true", "127.0.0.1", "investi", false],
  ["true", "db.example.com", "investi_ci", false],
  ["true", "db.example.com", "investi_missions_qa", false],
])("restricts replay fixtures: CI=%s host=%s database=%s", async (ci, host, database, allowed) => {
  vi.stubEnv("CI", ci);
  vi.stubEnv("DATABASE_URL", `postgresql://postgres:postgres@${host}:5432/${database}`);
  const queryReached = new Error("Query reached");
  const sql = vi.fn(() => { throw queryReached; });
  const connection = sql as unknown as postgres.Sql;

  if (allowed) await expect(seedBehaviourReplays(connection, "fixture-test")).rejects.toBe(queryReached);
  else await expect(seedBehaviourReplays(connection, "fixture-test")).rejects.toBeInstanceOf(AssertionError);
  expect(sql).toHaveBeenCalledTimes(allowed ? 1 : 0);
});
