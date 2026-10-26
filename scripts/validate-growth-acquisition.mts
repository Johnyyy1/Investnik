import assert from "node:assert/strict";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { recordAcquisitionView, loadFunnelFacts } from "../src/features/analytics/repository";
const url = new URL(process.env.DATABASE_URL!);
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.pathname, "/investi_growth_qa");
assert.equal(process.env.GROWTH_QA_DISPOSABLE, "1");
const client = postgres(url.toString(), { prepare: false, onnotice: () => {} });
const db = drizzle(client);
try {
  await migrate(db, { migrationsFolder: "drizzle" });
  await migrate(db, { migrationsFolder: "drizzle" });
  const at = new Date("1998-10-24T22:30:00Z");
  await client`delete from analytics_acquisition_day where day = '1998-10-25'`;
  await client`delete from analytics_landing_view_day where day = '1998-10-25'`;
  await Promise.all(Array.from({ length: 15 }, () => recordAcquisitionView(db, "seo:co-je-etf", at)));
  const facts = await loadFunnelFacts(db);
  assert.equal(facts.acquisition.find((row) => row.day === "1998-10-25")?.views, 15);
  assert.equal(facts.visits.find((row) => row.day === "1998-10-25")?.views, 15);
  await assert.rejects(recordAcquisitionView(db, "secret-user-id", at));
  console.log("PASS: additive migration rerun; concurrent channel counts and funnel denominator; unknown sources rejected.");
} finally { await client.end(); }
