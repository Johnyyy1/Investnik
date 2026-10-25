import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import axe from "axe-core";

const baseURL = process.env.FOUNDATIONS_CHECKPOINT_TEST_URL ?? "http://localhost:3166";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname), "Requires local development runtime");
const output = process.env.FOUNDATIONS_CHECKPOINT_SCREENSHOT_DIR ?? "test-results/foundations-checkpoint";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  await page.addInitScript(axe.source);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [], posts = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (request.method() === "POST") posts.push(request.url()); });
  await page.goto(`${baseURL}/dev/foundations-checkpoint`);
  await page.getByRole("heading", { name: "Kontrola 1: ověření investičních základů", exact: true }).waitFor();
  assert.match(await page.locator("header").innerText(), /Není publikovaná, neukládá pokrok/);
  const check = () => page.getByRole("button", { name: "Zkontrolovat odpověď", exact: true }).click();
  const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  // First answer is deliberately unknown/wrong for all 11 questions. Each requires an explicit retry.
  const questions = [
    { choice: "více než 10 200 Kč", wrong: "nevím", review: "risk-vs-reward" },
    { number: "4200", wrong: "200", review: "stocks" },
    { choice: "méně", wrong: "nevím", review: "why-invest" },
    { choice: "Index je ukazatel; koupit mohu podíl v ETF, které ho sleduje.", wrong: "Koupím přímo číslo indexu; fond nepotřebuji.", review: "etfs-and-indexes" },
    { choice: "Cena obvykle klesne.", wrong: "Cena obvykle vzroste.", review: "bonds-and-cash" },
    { choice: "nepravda", wrong: "nevím", review: "your-first-portfolio" },
    { number: "0,60", wrong: "499,60", review: "how-markets-work" },
    { number: "198", wrong: "200", review: "risk-vs-reward" },
    { number: "25", wrong: "4", review: "your-first-portfolio" },
    { number: "23400", wrong: "600", review: "funds" },
    { choice: "V tomto vzorku a období zaostala většina; neurčuje to vítěze příštího desetiletí.", wrong: "Každý aktivní fond vždy zaostane.", review: "funds" },
  ];
  async function answer(question, wrong) {
    if (question.choice) {
      const radio = page.getByRole("radio", { name: wrong ? question.wrong : question.choice, exact: true });
      await radio.focus();
      await page.keyboard.press("Space");
      assert.equal(await radio.isChecked(), true, "Keyboard selects an answer");
    } else await page.getByLabel("Tvoje odpověď", { exact: false }).fill(wrong ? question.wrong : question.number);
    await check();
  }
  for (let step = 0; step < 14; step++) {
    await page.getByText(`Krok ${step + 1} z 14`, { exact: true }).waitFor();
    if (step >= 1 && step <= 11) {
      const question = questions[step - 1];
      await answer(question, true);
      assert.equal(await page.getByRole("button", { name: "Pokračovat", exact: true }).count(), 0, "Wrong/unknown answer blocks continuation");
      const review = page.locator(`a[href="/learn/investing-foundations/${question.review}"]`);
      await review.waitFor();
      assert.ok((await review.innerText()).length > 0, "Review link has a label");
      await page.getByRole("button", { name: "Zkusit znovu", exact: true }).click();
      await answer(question, false);
    }
    if (step === 12) {
      await page.getByRole("textbox").fill("Stejný růst a pokles se nevyruší, protože se mění základ. Před rozhodnutím spočítám složenou změnu a oddělím vklady.");
      await page.getByRole("button", { name: "Odeslat a porovnat", exact: true }).click();
    }
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await noOverflow(), true, `Step ${step + 1} at ${width}px`);
      if (width !== 320) await page.screenshot({ path: `${output}/step-${String(step + 1).padStart(2, "0")}-${width}.png`, fullPage: true, animations: "disabled" });
    }
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector("main"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.filter((entry) => ["serious", "critical"].includes(entry.impact)).map((entry) => entry.id));
    assert.deepEqual(violations, [], `Step ${step + 1}: axe`);
    await page.setViewportSize({ width: 320, height: 1000 });
    const style = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    assert.equal(await noOverflow(), true, `Step ${step + 1} at 200% text`);
    await style.evaluate((node) => node.remove());
    if (step < 13) {
      await page.getByRole("button", { name: "Pokračovat", exact: true }).click();
      await page.locator("section > h2").evaluate((node) => { if (node !== document.activeElement) throw new Error("Step heading must receive focus"); });
    }
  }
  assert.deepEqual(posts, [], "Preview must not write answers, progress or rewards");
  assert.deepEqual(errors, [], "No browser errors");
  await page.goto(`${baseURL}/learn/investing-foundations/foundations-checkpoint`);
  if (new URL(page.url()).pathname === "/sign-in") await page.getByRole("heading", { name: "Vítej zpět", exact: true }).waitFor();
  else await page.getByRole("heading", { name: "Tuhle stránku jsme nenašli", exact: true }).waitFor();
  assert.equal(await page.getByText("Na spořicím účtu máš 10 000 Kč", { exact: false }).count(), 0);
  console.log(`PASS: 14 draft steps, 11 wrong/unknown → review → retry flows, keyboard/focus, no writes, public gate, 320/390/1440px and 200% text. Screenshots: ${output}`);
} finally { await browser.close(); }
