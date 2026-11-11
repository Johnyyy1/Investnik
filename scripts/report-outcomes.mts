// Learning outcomes (#130): the north star, mastery, Big Three knowledge, retention and crisis-drill behaviour.
// Read-only; prints aggregate counts, never anything about one person. Only DATABASE_URL is required.
// `--json` prints the same report as JSON.
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { buildOutcomesReport, formatOutcomesReport } from "../src/features/analytics/report";
import { loadOutcomeFacts } from "../src/features/analytics/repository";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");

const client = postgres(url, { prepare: false });
try {
  const report = buildOutcomesReport(await loadOutcomeFacts(drizzle({ client })), new Date());
  console.log(process.argv.includes("--json") ? JSON.stringify(report, null, 2) : formatOutcomesReport(report));
} finally {
  await client.end();
}
