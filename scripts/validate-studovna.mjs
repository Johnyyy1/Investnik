import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import postgres from "postgres";
import axe from "axe-core";
import { chromium } from "playwright";
import { finishOnboarding } from "./onboarding-helper.mjs";

const baseURL = process.env.STUDOVNA_TEST_URL ?? "http://localhost:3000";
const local = (value) => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname);
assert.ok(local(baseURL) && local(process.env.DATABASE_URL), "Requires a local runtime and disposable database.");
assert.equal(process.env.MARKET_DATA_PROVIDER, "deterministic");
assert.equal(process.env.FX_DATA_PROVIDER, "deterministic");
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const output = process.env.STUDOVNA_SCREENSHOT_DIR ?? "/tmp/investi-studovna-final";
await mkdir(output, { recursive: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: "Europe/Prague", reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let userId;
const learn = () => page.locator("[data-investi-studovna]:visible");
async function settle() {
  await learn().waitFor();
  await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
}
const rail = () => learn().locator("aside");
async function layouts(state, capture = true) {
  for (const width of [1440, 1024, 768, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 900 }); await settle();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${state}: overflow at ${width}`);
    // The rail tree is in the DOM at every width (aside from 1024px, the sheet below), so counts are width-independent.
    assert.equal(await rail().locator("[data-level]").count(), 9, "all levels including optional tracks");
    assert.equal(await rail().locator('a[href^="/learn/"]').count(), 52, "every published lesson appears once");
    assert.equal(await rail().locator("[data-level][open]").count(), state === "complete" ? 0 : 1, "only the continuation level starts expanded");
    if (state === "complete") {
      // Milestone mode: the requirements replace the lesson, derived and never claimed early (#126, #456).
      assert.match(await learn().getByRole("list", { name: "Požadavky milníku A" }).innerText(), /Lekce\s+\d+\sz\s\d+[\s\S]*Dovednosti na úrovni Zvládnuté\s+\d+\sz\s\d+/);
      assert.equal(await learn().getByRole("link", { name: /^Milník A · / }).count(), 0, "the milestone row is hidden while the milestone is the task");
    } else {
      assert.match(await learn().getByRole("link", { name: /^Milník A · / }).innerText(), /\d+\sz\s\d+ lekcí/);
    }
    await page.addScriptTag({ content: axe.source });
    assert.deepEqual(await page.evaluate(async () => (await window.axe.run(document.querySelector("[data-investi-studovna]"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map((item) => item.id)), [], `${state}: axe at ${width}`);
    assert.equal(await page.locator("h1:visible").count(), 1);
    assert.equal(await page.locator("#main-content").count(), 1);
    assert.equal(await learn().getByRole("button", { name: "Kurikulum", exact: true }).isVisible(), width < 1024, "the sheet trigger replaces the rail below 1024px");
    const account = page.locator("summary").filter({ hasText: "Nabídka účtu" });
    await account.focus();
    if (await account.evaluate((element) => element.parentElement.open)) await account.press("Escape");
    await account.press("Enter");
    await page.getByRole("banner").getByRole("link", { name: "Nastavení", exact: true }).waitFor();
    await account.press("Escape");
    assert.equal(await account.evaluate((element) => element === document.activeElement && !element.parentElement.open), true);
    const nav = page.getByRole("navigation", { name: width < 1024 ? "Mobilní navigace" : "Hlavní navigace" });
    assert.equal(await nav.locator('[aria-current="page"]').getAttribute("href"), "/learn");
    for (const link of await nav.getByRole("link").all()) {
      const box = await link.boundingBox(); assert.ok(box && box.height >= 44);
    }
    if (width === 1440) {
      // 44px rows (control-sm) for every visible rail row and disclosure.
      const heights = await rail().locator("nav a:visible, nav summary:visible").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height));
      assert.ok(heights.length && heights.every((height) => height >= 43.5), `rail rows ≥ 44px: ${Math.min(...heights)}`);
      // The rail skip link lands in the main column (WCAG 2.4.1).
      await rail().getByRole("link", { name: "Přeskočit kurikulum" }).focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "learn-main");
      // Collapse is instant, keeps focus on its toggle and hides the tree.
      const hide = rail().getByRole("button", { name: "Skrýt kurikulum" });
      await hide.click();
      const show = rail().getByRole("button", { name: "Zobrazit kurikulum" });
      assert.equal(await show.getAttribute("aria-expanded"), "false");
      assert.equal(await show.evaluate((element) => element === document.activeElement), true);
      assert.equal(await rail().getByRole("navigation").count(), 0, "a collapsed rail exposes no links");
      await show.click();
      await rail().getByRole("navigation").waitFor();
    }
    if (width === 390) {
      // The same tree in a modal sheet: focus inside, native disclosures, Escape closes, focus returns.
      const trigger = learn().getByRole("button", { name: "Kurikulum", exact: true });
      await trigger.click();
      const sheet = page.getByRole("dialog", { name: "Kurikulum" });
      await sheet.waitFor();
      assert.equal(await sheet.evaluate((element) => element.contains(document.activeElement)), true, "focus moves into the sheet");
      const chapter = sheet.locator('[data-level="L2"]');
      const wasOpen = await chapter.evaluate((element) => element.open);
      await chapter.locator(":scope > summary").focus(); await chapter.locator(":scope > summary").press("Enter");
      assert.equal(await chapter.evaluate((element) => element.open), !wasOpen);
      await chapter.locator(":scope > summary").press("Enter");
      await page.keyboard.press("Escape");
      await sheet.waitFor({ state: "hidden" });
      assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, "focus returns to the trigger");
    }
    if (capture) await page.screenshot({ path: `${output}/${state}-${width}.png`, fullPage: true, animations: "disabled" });
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; }); await settle();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${state}: 200% text overflow`);
  const clipped = await learn().locator("main").locator("h1,h2,h3,a,button,label").evaluateAll((elements) => elements.filter((element) => element.clientWidth && element.scrollWidth > element.clientWidth + 2).map((element) => element.textContent));
  assert.deepEqual(clipped, [], `${state}: enlarged essential text clips`);
  await page.screenshot({ path: `${output}/${state}-320-text-200.png`, fullPage: true, animations: "disabled" });
  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  await page.setViewportSize({ width: 1440, height: 900 });
}
try {
  const email = `studovna-${randomUUID()}@example.com`;
  const response = await context.request.post(`${baseURL}/api/auth/sign-up/email`, { headers: { origin: baseURL }, data: { name: "Klára", email, password: randomUUID() } });
  assert.ok(response.ok(), `signup: ${response.status()}`);
  const session = await (await context.request.get(`${baseURL}/api/auth/get-session`)).json(); userId = session.user.id;
  await page.goto(`${baseURL}/onboarding`); await finishOnboarding(page);
  await page.getByRole("button", { name: "Teď ne", exact: true }).click();
  // Next can retain an earlier route in a hidden tree. Keep a duplicate to exercise locator scoping.
  await learn().evaluate((element) => {
    const retained = element.cloneNode(true);
    retained.hidden = true;
    retained.style.display = "none";
    retained.dataset.retainedLearnFixture = "";
    document.body.append(retained);
  });
  await layouts("new");
  const published = await sql`select l.slug,m.slug as module_slug from lesson l join learning_module m on m.id=l.module_id where l.is_published=true`;
  const expectedPaths = published.map((lesson) => `/learn/${lesson.module_slug}/${lesson.slug}`).sort();
  assert.deepEqual(await rail().locator('a[href^="/learn/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")).sort()), expectedPaths, "display placement preserves original lesson routes");
  await page.locator("[data-retained-learn-fixture]").evaluate((element) => element.remove());
  for (const slug of new Set(published.map((lesson) => lesson.module_slug))) {
    assert.equal((await context.request.get(`${baseURL}/learn/${slug}`)).status(), 200, `legacy module overview ${slug}`);
  }
  // The first step of the first lesson has no question: the preview shows the step and starts the lesson.
  assert.equal(await learn().getByRole("radio").count(), 0, "a step without a question previews no answers");
  assert.equal(await learn().getByRole("link", { name: /^(Začít lekci|Pokračovat od kroku \d+)$/ }).getAttribute("href"), "/learn/investing-foundations/why-invest");
  // Isolated cursor fixture: the authored inflation question at step 2 and the real server transition.
  await sql`insert into lesson_progress(user_id,lesson_id,status,last_position,updated_at) values(${userId},'foundations-why-invest','in_progress',1,now())`;
  const cursor = async () => (await sql`select status,last_position from lesson_progress where user_id=${userId} and lesson_id='foundations-why-invest'`)[0];
  await page.goto(`${baseURL}/learn`); await settle();
  const check = learn().getByRole("button", { name: "Zkontrolovat", exact: true });
  assert.equal(await learn().getByText(/Správně\.|Ještě ne\./).count(), 0, "nothing graded before an attempt");
  await check.click();
  await learn().getByText("Vyber jednu z možností.").waitFor();
  await learn().getByRole("radio", { name: /Nic\. Pořád je to 10 000 Kč/ }).check();
  // Choosing (arrow keys, clicks) never grades: only Zkontrolovat does (finding C-4).
  assert.equal(await learn().getByText(/Správně\.|Ještě ne\./).count(), 0, "a selection alone reveals nothing");
  await check.click();
  await learn().getByRole("status").filter({ hasText: "Ještě ne." }).waitFor();
  assert.equal((await cursor()).last_position, 1, "wrong preview answer does not persist or skip");
  await learn().getByRole("radio", { name: /Koupím si za ně o něco méně/ }).check();
  await check.click();
  await learn().getByRole("status").filter({ hasText: "Správně." }).waitFor();
  assert.equal(await learn().getByRole("button", { name: "Pokračovat v lekci", exact: true }).evaluate((element) => element === document.activeElement), true, "focus moves to the continuation");
  await context.setOffline(true);
  await learn().getByRole("button", { name: "Pokračovat v lekci", exact: true }).click();
  await learn().getByRole("alert").waitFor();
  await context.setOffline(false);
  assert.equal((await cursor()).last_position, 1, "failed save keeps cursor");
  await learn().getByRole("button", { name: "Pokračovat v lekci", exact: true }).click();
  await page.waitForURL("**/learn/investing-foundations/why-invest");
  await page.locator('main[data-save-state="idle"]').waitFor();
  assert.deepEqual({ ...(await cursor()) }, { status: "in_progress", last_position: 2 });
  assert.equal((await sql`select * from lesson_award where user_id=${userId}`).length, 0, "preview never completes or awards capital");
  await page.goto(`${baseURL}/learn`);
  await learn().getByRole("link", { name: /^(Začít lekci|Pokračovat od kroku \d+)$/ }).click();
  await page.waitForURL("**/learn/investing-foundations/why-invest");
  await page.locator('main[data-save-state="idle"]').waitFor();
  // Isolated cursor fixture: actual authored market question and real server transition.
  await sql`insert into lesson_progress(user_id,lesson_id,status,last_position,updated_at) values(${userId},'foundations-markets','in_progress',2,now())`;
  await page.goto(`${baseURL}/learn`); await layouts("resume");
  await learn().getByText("Jak si rozvrhnout učení", { exact: true }).click();
  assert.equal(await learn().getByRole("link", { name: "Doporučená lekce: Spoření vs. investování", exact: true }).getAttribute("href"), "/learn/investing-foundations/why-invest");
  await learn().getByRole("radio", { name: /Ask · 100,20 Kč/ }).check();
  await learn().getByRole("button", { name: "Zkontrolovat", exact: true }).click();
  await learn().getByRole("button", { name: "Pokračovat v lekci", exact: true }).click();
  await page.waitForURL("**/learn/investing-foundations/how-markets-work");
  await page.getByRole("heading", { name: "Spočítej rozdíl", exact: true }).waitFor();
  assert.equal((await sql`select last_position from lesson_progress where user_id=${userId} and lesson_id='foundations-markets'`)[0].last_position, 3);
  // The saved numeric step is answered in place too, through the same grading and server transition.
  await page.goto(`${baseURL}/learn`); await settle();
  assert.equal(await learn().getByRole("radio").count(), 0, "the numeric step previews no later choice");
  assert.equal(await learn().getByRole("link", { name: "Otevřít celou lekci" }).getAttribute("href"), "/learn/investing-foundations/how-markets-work");
  const spread = learn().getByRole("textbox", { name: /Jak velký je spread/ });
  await learn().getByRole("button", { name: "Zkontrolovat", exact: true }).click();
  await learn().getByText("Napiš odpověď jako číslo. Desetinnou část odděl čárkou.").waitFor();
  assert.equal(await spread.getAttribute("aria-invalid"), "true");
  assert.equal(await spread.evaluate((element) => element === document.activeElement), true, "focus returns to the field");
  await spread.fill("0,2"); await learn().getByRole("button", { name: "Zkontrolovat", exact: true }).click();
  await learn().getByRole("status").filter({ hasText: "Ještě ne." }).waitFor();
  assert.equal((await sql`select last_position from lesson_progress where user_id=${userId} and lesson_id='foundations-markets'`)[0].last_position, 3, "a wrong number moves nothing");
  await spread.fill("0,4"); await learn().getByRole("button", { name: "Zkontrolovat", exact: true }).click();
  await learn().getByRole("status").filter({ hasText: "Správně." }).waitFor();
  await learn().getByRole("button", { name: "Pokračovat v lekci", exact: true }).click();
  await page.waitForURL("**/learn/investing-foundations/how-markets-work");
  await page.locator('main[data-save-state="idle"]').waitFor();
  assert.equal((await sql`select last_position from lesson_progress where user_id=${userId} and lesson_id='foundations-markets'`)[0].last_position, 4);
  // A saved lesson in an optional path opens that level without moving its persistence identity.
  await sql`insert into lesson_progress(user_id,lesson_id,status,last_position,updated_at) values(${userId},'returns-log-returns','in_progress',2,now())`;
  await page.goto(`${baseURL}/learn`); await settle();
  const quantLevel = rail().locator('[data-level="L6"]');
  assert.equal(await quantLevel.evaluate((element) => element.open && element.closest("details:not([data-level])").open), true, "optional continuation level and „Prohloubení“ open");
  assert.equal(await quantLevel.locator('[aria-current="step"]').getAttribute("href"), "/learn/returns/log-returns", "quant placement retains Returns route");
  assert.match(await quantLevel.locator('[aria-current="step"]').textContent(), /Rozpracováno, na řadě/);
  assert.match(await learn().locator("main").innerText(), /KROK 3\sZ\s\d+/i);
  // All-complete view is derived from published DB lessons, with no reward fabricated.
  await sql`insert into lesson_progress(user_id,lesson_id,status,last_position,updated_at,completed_at) select ${userId},id,'completed',0,now(),now() from lesson where is_published=true on conflict(user_id,lesson_id) do update set status='completed',completed_at=now()`;
  await page.goto(`${baseURL}/learn`); await page.getByRole("heading", { name: "Co ti zbývá do milníku A", level: 1, exact: true }).waitFor(); await layouts("complete", false);
  await learn().getByRole("link", { name: "Pokračovat", exact: true }).focus();
  await page.keyboard.press("Enter"); await page.waitForURL("**/learn/checkpoint/1.1");
  assert.deepEqual(errors, []);
  console.log(`PASS: rail catalog/routes, choice and numeric inline questions (empty, wrong, grade on check only, save error, persisted continuation), no completion/reward from /learn, optional placement, milestone mode, rail skip link/collapse/44px rows, sheet focus and Escape, account Escape/focus, navigation, axe 2.2 AA, 320–1440px and 200% text. Screenshots: ${output}`);
} finally { await browser.close(); if (userId) await sql`delete from "user" where id=${userId}`; await sql.end(); }
