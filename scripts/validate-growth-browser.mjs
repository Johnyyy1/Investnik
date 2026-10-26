import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
const base = process.env.GROWTH_TEST_URL ?? "http://localhost:3148";
assert.equal(new URL(base).hostname, "localhost");
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const axe = await readFile("node_modules/axe-core/axe.min.js", "utf8");
const slugs = ["rozpocet-a-mira-uspor", "kolik-stoji-poplatky", "co-je-etf", "sporit-nebo-investovat"];
await mkdir("/tmp/investi-growth-captures", { recursive: true });
try {
  for (const slug of slugs) {
    const response = await page.goto(`${base}/pruvodce/${slug}`);
    assert.equal(response.status(), 200);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://investnik.cz/pruvodce/${slug}`);
    assert.ok(await page.locator('meta[property="og:title"]').getAttribute("content"));
    assert.ok(await page.locator('meta[property="og:image"]').getAttribute("content"));
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(ld["@type"], "Article");
    assert.ok(ld.description && !ld.description.includes("{{"));
    assert.equal((await response.text()).includes(ld.description), true, "answer rendered on server");
    await page.addScriptTag({ content: axe });
    for (const width of [1440, 768, 390, 320]) for (const large of [false, true]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.addStyleTag({ content: `html { font-size: ${large ? "200%" : "100%"} !important }` });
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${slug} ${width} ${large} overflow`);
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id }) => id));
      assert.deepEqual(violations, [], `${slug} ${width} ${large}`);
    }
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target) })));
    assert.deepEqual(violations, [], slug);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.addStyleTag({ content: "html { font-size: 100% !important }" });
      await page.screenshot({ path: `/tmp/investi-growth-captures/${slug}-${width}.png`, fullPage: true });
    }
  }
  await page.goto(`${base}/pruvodce/kolik-stoji-poplatky`);
  const years = page.getByRole("textbox", { name: "Doba investování" });
  assert.equal(await years.inputValue(), "30");
  await years.fill("1,3333");
  await page.getByText("Oprav vstupy; bez platných hodnot výsledek nezobrazujeme.").waitFor();
  await years.fill("30");
  await years.focus(); await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => document.activeElement?.tagName !== "BODY"));
  for (const slug of ["jak-funguje-dip", "musim-danit-etf", "jak-overit-brokera"]) {
    assert.equal((await page.goto(`${base}/pruvodce/${slug}`)).status(), 404);
    assert.equal((await page.goto(`${base}/dev/pruvodce/${slug}`)).status(), process.env.GROWTH_DEV === "1" ? 200 : 404);
  }
  const sitemap = await (await context.request.get(`${base}/sitemap.xml`)).text();
  slugs.forEach((slug) => assert.ok(sitemap.includes(`/pruvodce/${slug}`)));
  assert.ok(!sitemap.includes("jak-funguje-dip"));
  assert.deepEqual(errors, []);
  console.log("PASS: SSR, metadata/OG/Article/sitemap, draft isolation, calculator validation and keyboard, 1440/768/390/320 + 200% text, axe WCAG A/AA.");
} finally { await browser.close(); }
