import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import postgres from "postgres";
import { chromium } from "playwright";
import { db as appDb } from "../src/db";
import { saveLearnerArtifact } from "../src/features/artifacts/repository";
import { exampleIps } from "../src/features/ips/test-fixtures";
import { artifactExamples } from "../src/features/artifacts/test-fixtures";
const base = process.env.GROWTH_TEST_URL ?? "http://localhost:3150";
const url = new URL(process.env.DATABASE_URL!);
assert.equal(new URL(base).hostname, "localhost"); assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.pathname, "/investi_growth_qa"); assert.equal(process.env.GROWTH_QA_DISPOSABLE, "1");
const sql = postgres(url.toString(), { prepare: false });
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
const context = await browser.newContext({ reducedMotion: "reduce" });
const visitor = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage(); const publicPage = await visitor.newPage();
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message)); publicPage.on("pageerror", (error) => errors.push(error.message));
const axe = await readFile("node_modules/axe-core/axe.min.js", "utf8");
const secret = `PRIVATE-OUTPUT-${randomUUID()}`;
let owner: string | undefined;
async function checkLayout(target: typeof page, name: string) {
  await target.addScriptTag({ content: axe });
  for (const width of [1440, 768, 390, 320]) for (const large of [false, true]) {
    await target.setViewportSize({ width, height: 1000 });
    await target.addStyleTag({ content: `html { font-size: ${large ? "200%" : "100%"} !important }` });
    assert.ok(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} overflow ${width}/${large}`);
    const violations = await target.evaluate(async () => {
      const run = (window as unknown as { axe: { run: (doc: Document, options: unknown) => Promise<{ violations: { id: string; nodes: { target: unknown }[] }[] }> } }).axe.run;
      return (await run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }));
    });
    assert.deepEqual(violations, [], `${name} ${width}/${large}`);
  }
  for (const width of [1440, 390]) {
    await target.setViewportSize({ width, height: 1000 });
    await target.addStyleTag({ content: "html { font-size: 100% !important }" });
    await target.screenshot({ path: `/tmp/investi-growth-captures/${name}-${width}.png`, fullPage: true });
  }
}
try {
  await mkdir("/tmp/investi-growth-captures", { recursive: true });
  const response = await context.request.post(`${base}/api/auth/sign-up/email`, { headers: { origin: base }, data: { name: "Sharing QA", email: `sharing-${randomUUID()}@example.com`, password: "local-QA-password-3148" } });
  assert.equal(response.ok(), true, await response.text());
  owner = (await response.json()).user.id;
  assert.ok(owner);
  await sql`insert into learning_profile (user_id, goals, daily_goal_minutes, time_zone, onboarding_step, onboarding_completed_at, personalized_onboarding_completed_at, updated_at) values (${owner}, '{}', 10, 'Europe/Prague', 6, now(), now(), now())`;
  const payload = { ...exampleIps, platform: secret, changeReason: secret, contribution: { amountMinor: "123456789", dayOfMonth: 12 }, drawdownRule: { action: "keep_plan" as const, text: secret } };
  await saveLearnerArtifact(owner, { content: { kind: "financial_checkup", payload: artifactExamples.financial_checkup }, sourceLessonId: null, consent: true, requestId: randomUUID() });
  await saveLearnerArtifact(owner, { content: { kind: "investment_plan", payload }, sourceLessonId: null, consent: true, requestId: randomUUID() });
  await page.goto(`${base}/settings?section=data`);
  await page.getByRole("button", { name: "Náhled sdílení IPS" }).click();
  await page.getByRole("heading", { name: "Přesně tohle bude veřejné" }).waitFor();
  assert.equal((await sql`select count(*)::int as n from artifact_share where user_id = ${owner}`)[0].n, 0, "preview publishes nothing");
  assert.equal(await page.getByRole("button", { name: "Vytvořit veřejný odkaz", exact: true }).isDisabled(), true);
  await checkLayout(page, "sharing-preview");
  const consent = page.getByRole("checkbox", { name: "Chci zveřejnit tento náhled jako odkaz a obrázek." });
  await consent.focus(); await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Vytvořit veřejný odkaz", exact: true }).click();
  const link = page.getByRole("textbox", { name: "Veřejný odkaz na verzi 1" });
  await link.waitFor();
  const href = await link.inputValue();
  const token = href.split("/").at(-1)!;
  assert.match(token, /^[A-Za-z0-9_-]{32}$/);
  const publicResponse = await publicPage.goto(href);
  assert.equal(publicResponse!.status(), 200);
  const html = await publicResponse!.text();
  for (const forbidden of [secret, "123456789", "IE-XETR:VWCE", '"foundation"', '"payload"', '"userId"']) assert.ok(!html.includes(forbidden), forbidden);
  assert.match(publicResponse!.headers()["cache-control"], /no-store/);
  assert.equal(publicResponse!.headers()["referrer-policy"], "no-referrer");
  assert.match((await publicPage.locator('meta[name="robots"]').getAttribute("content"))!, /noindex/);
  assert.equal(await publicPage.getByRole("link", { name: "Vytvoř si vlastní" }).getAttribute("href"), "/sign-up");
  await checkLayout(publicPage, "sharing-public");
  const image = await visitor.request.get(`${href}/obrazek`);
  assert.equal(image.status(), 200, await image.text());
  assert.match(image.headers()["content-type"], /image\/png/); assert.match(image.headers()["cache-control"], /no-store/);
  await writeFile("/tmp/investi-growth-captures/ips-share.png", await image.body());
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Stáhnout obrázek" }).click();
  assert.equal((await download).suggestedFilename(), "investi-muj-plan.png");
  await saveLearnerArtifact(owner, { content: { kind: "investment_plan", payload: { ...payload, checkFrequency: "monthly" } }, sourceLessonId: null, consent: true, requestId: randomUUID() });
  await publicPage.reload();
  await publicPage.getByText("Plán kontroluji čtvrtletně.", { exact: true }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: "Zrušit odkaz na verzi 1" }).click();
  await page.getByRole("status").filter({ hasText: "Odkaz je zrušený." }).waitFor();
  assert.equal((await visitor.request.get(href)).status(), 404);
  assert.equal((await visitor.request.get(`${href}/obrazek`)).status(), 404);
  assert.equal((await visitor.request.get(`${base}/sdileni/${"a".repeat(32)}`)).status(), 404);
  assert.deepEqual(errors, []);
  console.log("PASS: real account/session, private preview, keyboard opt-in, public projection/PNG/download, immutable older revision, revoke page/image 404, no-store/noindex, 1440/768/390/320 + 200% text and axe WCAG A/AA.");
} finally {
  if (owner) await sql`delete from "user" where id = ${owner}`;
  await browser.close(); await sql.end(); await appDb.$client.end();
}
