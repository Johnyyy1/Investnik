/**
 * Generic walkthrough of every published lesson (#147): for each question a wrong answer, its feedback and a retry,
 * then the authored answer; continuation survives a reload; completion writes one receipt. Every step is checked for
 * horizontal overflow at 1440/390/320 px and with axe (WCAG 2.1 A/AA, serious and critical findings).
 * `LESSON_IDS=returns-simple-returns,before-investing-budget` walks only those lessons.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import axe from "axe-core";
import postgres from "postgres";
import { chromium, type Locator, type Page } from "playwright";
import { finishOnboarding } from "./onboarding-helper.mjs";
import { prepareLessonFacts } from "../src/features/facts/lesson-facts";
import { factRegistry } from "../src/features/facts/registry";
import { factToday } from "../src/features/facts/resolve";
import { availableLessons } from "../src/features/learning/catalog";
import { correctAnswers, wrongAnswers } from "../src/features/lessons/answer-keys";
import { isQuestion, parseSelection, type QuestionBlock } from "../src/features/lessons/question-evaluation";
import { getAuthoredLesson } from "../src/features/lessons/registry";
import { getGuidedSteps } from "../src/features/lessons/steps";
import { defaultFeeProfileDraft, feeProfileFromDraft } from "../src/features/lessons/broker-and-account/fee-schedule-model";

const baseURL = process.env.WALKTHROUGH_TEST_URL ?? "http://localhost:3187";
const screenshots = process.env.WALKTHROUGH_SCREENSHOT_DIR ?? "test-results/lesson-walkthrough";
const local = (host: string) => ["localhost", "127.0.0.1", "[::1]"].includes(host);
assert.ok(process.env.DATABASE_URL && local(new URL(process.env.DATABASE_URL).hostname) && local(new URL(baseURL).hostname), "Requires local app and QA database");

const requested = process.env.LESSON_IDS?.split(",").map((id) => id.trim()).filter(Boolean);
for (const id of requested ?? []) assert.ok(availableLessons.some((lesson) => lesson.id === id), `Unknown or unpublished lesson: ${id}`);
// The server renders lessons with today's facts; resolve them the same way so titles and labels match.
const lessons = availableLessons.filter((lesson) => !requested || requested.includes(lesson.id)).map((definition) => {
  const { lesson } = prepareLessonFacts(getAuthoredLesson(definition.moduleSlug, definition.slug)!, factRegistry, { today: factToday(), published: true });
  return { id: lesson.id, path: `/learn/${lesson.moduleSlug}/${lesson.slug}`, steps: getGuidedSteps(lesson) };
});

type Control = { radio: string; value: string } | { label: string; fill: string } | { label: string; select: string } | { checkbox: string; checked: boolean };
/** How the player takes an answer from `answer-keys`. A new graded kind in a published lesson needs a driver here. */
function controls(block: QuestionBlock, answers: Record<string, string>): Control[] {
  switch (block.type) {
    case "multipleChoiceQuestion": case "findErrorQuestion": return [{ radio: block.id, value: answers.answer }];
    case "numericQuestion": return [{ label: "Tvoje odpověď", fill: answers.answer }];
    case "multiNumericQuestion": return block.answers.map((field) => ({ label: field.label, fill: answers[field.id] }));
    case "fadedExample": return block.blank.input === "choice" ? [{ radio: block.id, value: answers.answer }] : [{ label: "Tvoje doplnění", fill: answers.answer }];
    case "documentSearchQuestion": return block.target.type === "region" ? [{ radio: block.id, value: answers.answer }] : [{ label: "Hodnota z dokumentu", fill: answers.answer }];
    case "categorizeQuestion": return block.items.map((item) => ({ label: item.label, select: answers[item.id] }));
    case "orderQuestion": return block.items.map((_, index) => ({ label: `${index + 1}. místo`, select: answers[String(index)] }));
    case "documentTap": return block.document.rows.filter((row) => row.selectable !== false).map((row) => ({ checkbox: `Označit řádek: ${block.document.columns.map((column) => row.cells[column.id]).filter(Boolean).join(", ")}`, checked: parseSelection(answers.selected).includes(row.id) }));
    default: throw new Error(`No walkthrough driver for ${block.type} (${block.id})`);
  }
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || "chrome" });
const email = `walkthrough-${randomUUID()}@example.com`;
let userId: string | undefined;
let where = "sign-up";
await mkdir(screenshots, { recursive: true });
const page: Page = await browser.newPage({ viewport: { width: 1440, height: 900 }, timezoneId: "Europe/Prague" });
try {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(axe.source);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`${where}: ${error.message}`));
  const signed = await page.request.post(`${baseURL}/api/auth/sign-up/email`, { headers: { origin: baseURL }, data: { name: "Walkthrough learner", email, password: randomUUID() } });
  assert.ok(signed.ok(), await signed.text());
  [{ id: userId }] = await sql<{ id: string }[]>`select id from "user" where email = ${email}`;
  await page.goto(`${baseURL}/onboarding`);
  await finishOnboarding(page);

  const button = (name: string) => page.getByRole("button", { name, exact: true });
  const idle = () => page.locator('main[data-save-state="idle"]').waitFor();
  async function audit(label: string, width: number) {
    for (const size of [1440, 390, 320]) {
      await page.setViewportSize({ width: size, height: 900 });
      await page.evaluate(async () => { await document.fonts.ready; await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: horizontal overflow at ${size}px`);
    }
    await page.setViewportSize({ width, height: 900 });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector("main")!, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`));
    assert.deepEqual(violations, [], `${label}: axe`);
  }
  async function answer(question: QuestionBlock, answers: Record<string, string>) {
    const card: Locator = page.locator(`section[aria-labelledby^="${question.id}-"]`);
    for (const control of controls(question, answers)) {
      if ("radio" in control) await page.locator(`input[type="radio"][name="${control.radio}"][value="${control.value}"]`).check();
      else if ("fill" in control) await card.getByLabel(control.label, { exact: true }).fill(control.fill);
      // getByRole skips the hidden copy: the document renders a table from 1280 px and row cards below.
      else if ("checkbox" in control) await page.getByRole("checkbox", { name: control.checkbox, exact: true }).setChecked(control.checked);
      else await card.locator("label", { has: page.getByText(control.label, { exact: true }) }).locator("select").selectOption(control.select);
    }
    await button("Zkontrolovat odpověď").click();
  }

  for (const [lessonIndex, lesson] of lessons.entries()) {
    // Each lesson is answered at one width; every step is still audited at all three.
    const width = [1440, 390, 320][lessonIndex % 3];
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${baseURL}${lesson.path}`);
    for (const [index, step] of lesson.steps.entries()) {
      where = `${lesson.id} step ${index + 1} „${step.title}“`;
      await page.getByRole("heading", { level: 2, name: step.title, exact: true }).waitFor();
      await idle();
      await audit(where, width);
      if (lesson.id === "costs-spread-and-fees") {
        for (const size of [1440, 390]) {
          await page.setViewportSize({ width: size, height: 900 });
          await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; });
          await page.screenshot({ path: `${screenshots}/${lesson.id}-${index + 1}-${size}.png`, fullPage: true });
        }
        await page.setViewportSize({ width: 320, height: 900 });
        const enlarged = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${where}: 320px with 200% text`);
        await enlarged.evaluate((element) => element.parentNode?.removeChild(element));
        await page.setViewportSize({ width, height: 900 });
      }
      const question = step.blocks.find(isQuestion);
      if (question) {
        await answer(question, wrongAnswers(question));
        await page.getByRole("heading", { name: "Zkus to ještě jednou", exact: true }).waitFor();
        await button("Zkusit znovu").click();
        // Retry focuses the first answer control a frame later; typing before that lands in the wrong field.
        await page.waitForFunction(() => document.activeElement?.matches("main input, main select"));
        await answer(question, correctAnswers(question, { decimalComma: true }));
        await page.getByRole("heading", { name: "Správně", exact: true }).waitFor();
        await audit(`${where} after feedback`, width);
      }
      for (const block of step.blocks) {
        if (block.type === "rubricSelfAssessment") throw new Error(`No walkthrough driver for a saved rubric (${block.id})`);
        if (block.type === "interactiveFigure" && block.figure === "debt-vs-invest-calculator") {
          const result = page.getByRole("region", { name: "Výsledek porovnání dluhu a investice", exact: true });
          const debt = page.getByLabel("RPSN dluhu", { exact: true });
          const investment = page.getByLabel("Předpokládaný roční výnos investice", { exact: true });
          assert.equal(await result.count(), 1);
          await debt.fill("0,25");
          await investment.fill("0,25");
          assert.match(await result.innerText(), /Rozdíl: nejdřív splatit minus investovat\s+−?0 Kč/);
          await debt.fill("bad");
          assert.equal(await debt.getAttribute("aria-invalid"), "true");
          assert.equal(await result.count(), 0, "invalid draft clears the result");
          await debt.fill("24");
          await investment.fill("-30");
          await page.getByLabel("Doba porovnání", { exact: true }).fill("1,5");
          assert.equal(await result.count(), 0, "fractional years are rejected");
          await page.getByLabel("Doba porovnání", { exact: true }).fill("3");
          const slider = page.getByRole("slider", { name: "RPSN dluhu · posuvník", exact: true });
          await slider.focus();
          await slider.press("ArrowRight");
          assert.equal(await debt.inputValue(), "24.25");
          assert.notEqual(await slider.evaluate((element) => getComputedStyle(element).outlineStyle), "none", "slider has visible keyboard focus");
          await audit("debt calculator after editing", width);
          for (const size of [1440, 390, 320]) {
            await page.setViewportSize({ width: size, height: 900 });
            await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
            await page.screenshot({ path: `${screenshots}/debt-calculator-${size}.png` });
          }
          const largeText = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "debt calculator at 320px and 200% text");
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `${screenshots}/debt-calculator-320-200.png` });
          await largeText.evaluate((element) => element.parentNode?.removeChild(element));
          await page.setViewportSize({ width, height: 900 });
        }
        if (block.type === "interactiveFigure" && block.figure === "trade-cost-breakdown") {
          const calculator = page.getByRole("region", { name: "Rozpad nákladů obchodu", exact: true });
          const result = page.getByRole("region", { name: "Výsledek rozpadu nákladů obchodu", exact: true });
          const amount = calculator.getByLabel("Objem obchodu ve středu kotace", { exact: true });
          await result.waitFor();
          assert.match(await result.innerText(), /61,50\s*Kč/);
          assert.match(await result.innerText(), /2,05 %/);
          for (const raw of ["", "bad", "-1"]) {
            await amount.fill(raw);
            assert.equal(await amount.getAttribute("aria-invalid"), "true");
            assert.equal(await result.count(), 0);
          }
          await amount.fill("6000");
          assert.match(await result.innerText(), /1,05 %/);
          const rate = calculator.getByLabel("Sazba poplatku", { exact: true });
          await rate.fill("1,3333");
          assert.equal(await result.count(), 0, "unsupported fee precision has an explicit error");
          await rate.fill("0,15");
          const maximum = calculator.getByLabel("Maximální poplatek", { exact: true });
          await maximum.fill("59");
          assert.equal(await result.count(), 0, "maximum below minimum is rejected");
          await maximum.fill("10000");
          await amount.focus();
          await page.keyboard.press("Tab");
          const slider = calculator.getByRole("slider", { name: "Objem obchodu ve středu kotace · posuvník", exact: true });
          assert.equal(await slider.evaluate((element) => element === document.activeElement), true);
          await slider.press("ArrowRight");
          assert.notEqual(await slider.evaluate((element) => getComputedStyle(element).outlineStyle), "none");
          await amount.fill("3000");
          await calculator.getByLabel("Celý spread", { exact: true }).fill("0,10");
          assert.match(await result.innerText(), /2,05 %/);
          await audit("trade-cost calculator after editing", width);
        }
        if (block.type === "interactiveFigure" && block.figure === "return-calculator") {
          const calculator = page.getByRole("region", { name: "Kalkulačka výnosu", exact: true });
          const start = calculator.getByLabel("Počáteční cena", { exact: true });
          const end = calculator.getByLabel("Konečná cena", { exact: true });
          await start.fill("80");
          await end.fill("92");
          assert.match(await calculator.innerText(), /12 Kč/);
          assert.match(await calculator.innerText(), /\+15,00 %/);
          await start.fill("0");
          await calculator.getByRole("alert").filter({ hasText: "větší než nula" }).waitFor();
          await start.fill("100");
          await start.focus();
          await page.keyboard.press("Tab");
          assert.equal(await end.evaluate((element) => element === document.activeElement), true, "calculator is keyboard navigable");
          assert.notEqual(await end.locator("..").evaluate((element) => getComputedStyle(element).outlineStyle), "none", "calculator has visible keyboard focus");
          await audit("return calculator after editing", width);
          await page.setViewportSize({ width: 320, height: 900 });
          const largeText = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "return calculator at 320px and 200% text");
          await page.screenshot({ path: `${screenshots}/return-calculator-320-200.png` });
          await largeText.evaluate((element) => element.parentNode?.removeChild(element));
          await page.setViewportSize({ width, height: 900 });
        }
        if (block.type === "interactiveFigure" && block.figure === "financial-checkup") {
          const checkup = page.getByRole("region", { name: "Finanční základ", exact: true });
          await checkup.getByRole("combobox").first().waitFor();
          assert.equal(await button("Pokračovat").isDisabled(), true, "check-up requires a saved output");
          for (const [index, value] of ["ready_for_goal", "none", "defined", "reviewed", "reviewed"].entries()) {
            await checkup.getByRole("combobox").nth(index).selectOption(value);
          }
          await checkup.getByRole("checkbox", { name: /Souhlasím s uložením/ }).check();
          await button("Uložit výstup").click();
          await checkup.getByText(/^Výstup je uložený\. Verze \d+\.$/).waitFor();
          assert.equal(await button("Pokračovat").isEnabled(), true, "saved check-up enables continuation");
          await audit(`${where} after saving`, width);
        }
        if (block.type === "interactiveFigure" && block.figure === "fee-profile") {
          const form = page.getByRole("region", { name: "Profil poplatků", exact: true });
          await form.getByText(/Nákup za 2\s000\sKč: 60\sKč \(3 % z nákupu\)/).waitFor();
          assert.equal(await button("Pokračovat").isEnabled(), true, "the fee profile is optional");
          const maximum = form.getByLabel("Maximální poplatek", { exact: true });
          await maximum.fill("50");
          await form.getByRole("status").filter({ hasText: "nesmí být nižší než minimální" }).waitFor();
          assert.equal(await form.getByRole("button", { name: "Uložit výstup" }).count(), 0, "an invalid profile cannot be saved");
          await maximum.fill("600");
          await form.getByRole("checkbox", { name: /Souhlasím s uložením/ }).check();
          await button("Uložit výstup").click();
          await form.getByText(/^Výstup je uložený\. Verze \d+\.$/).waitFor();
          const savedRows: { payload: unknown; source_lesson_id: string }[] = await sql`select payload, source_lesson_id from learner_artifact where user_id = ${userId!} and kind = 'fee_profile' order by version desc limit 1`;
          assert.deepEqual({ ...savedRows[0] }, { payload: feeProfileFromDraft(defaultFeeProfileDraft()), source_lesson_id: lesson.id }, "the saved profile is the lesson tariff in exact units");
          await audit(`${where} after saving`, width);
          await page.setViewportSize({ width: 320, height: 900 });
          const largeText = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "fee profile at 320px and 200% text");
          await page.screenshot({ path: `${screenshots}/fee-profile-320-200.png` });
          await largeText.evaluate((element) => element.parentNode?.removeChild(element));
          await page.setViewportSize({ width, height: 900 });
        }
        if (block.type === "interactiveFigure" && block.figure === "fund-cost-comparison") {
          const result = page.getByRole("region", { name: "Výsledek porovnání nákladů fondu", exact: true });
          const entry = page.getByLabel("Vstupní poplatek", { exact: true });
          const years = page.getByLabel("Doba investování", { exact: true });
          assert.match(await result.innerText(), /Hodnota po nákladech\s+216\s664 Kč/, "defaults reproduce fund A from the worked example");
          await entry.fill("0");
          await page.getByLabel("Průběžné náklady", { exact: true }).fill("0");
          assert.match(await result.innerText(), /Náklady tě stály\s+0 Kč/);
          await years.fill("1,5");
          assert.equal(await years.getAttribute("aria-invalid"), "true");
          assert.equal(await result.count(), 0, "fractional years clear the result");
          await years.fill("20");
          await page.getByLabel("Způsob investování", { exact: true }).selectOption("regular");
          assert.match(await result.innerText(), /Vloženo celkem\s+480\s000 Kč/);
          const slider = page.getByRole("slider", { name: "Vstupní poplatek · posuvník", exact: true });
          await slider.focus();
          await slider.press("ArrowRight");
          assert.equal(await entry.inputValue(), "0.1");
          assert.notEqual(await slider.evaluate((element) => getComputedStyle(element).outlineStyle), "none", "slider has visible keyboard focus");
          await audit("fund cost calculator after editing", width);
          for (const size of [1440, 390, 320]) {
            await page.setViewportSize({ width: size, height: 900 });
            await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
            await page.screenshot({ path: `${screenshots}/fund-cost-calculator-${size}.png` });
          }
          const largeText = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "fund cost calculator at 320px and 200% text");
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `${screenshots}/fund-cost-calculator-320-200.png` });
          await largeText.evaluate((element) => element.parentNode?.removeChild(element));
          await page.setViewportSize({ width, height: 900 });
        }
        if (block.type === "interactiveFigure" && block.figure === "spiva-chart") {
          const chart = page.getByRole("region", { name: "Podíl aktivních fondů, které zaostaly za indexem", exact: true });
          await chart.getByText(/Historická data · S&P Dow Jones Indices, SPIVA U\.S\. Year-End 2025 · stav k 31\. 12\. 2025/).waitFor();
          const horizon = page.getByRole("button", { name: /^15 let/ });
          await horizon.focus();
          await horizon.press("Enter");
          assert.equal(await horizon.getAttribute("aria-pressed"), "true");
          assert.notEqual(await horizon.evaluate((element) => getComputedStyle(element).outlineStyle), "none", "horizon has visible keyboard focus");
          await chart.getByText("V období 2011–2025 (15 let) mělo nižší výnos než S&P 500 90 % těchto fondů, zhruba 9 z 10.").waitFor();
          await audit("SPIVA chart after selecting a horizon", width);
          for (const size of [1440, 390, 320]) {
            await page.setViewportSize({ width: size, height: 900 });
            await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
            await page.screenshot({ path: `${screenshots}/spiva-chart-${size}.png` });
          }
          const largeText = await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "SPIVA chart at 320px and 200% text");
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `${screenshots}/spiva-chart-320-200.png` });
          await largeText.evaluate((element) => element.parentNode?.removeChild(element));
          await page.setViewportSize({ width, height: 900 });
        }
        if (block.type === "interactiveFigure" && block.figure === "goal-map") {
          await page.getByRole("checkbox", { name: "Zatím nemám konkrétní cíl", exact: true }).check();
          await page.getByRole("checkbox", { name: /Souhlasím s uložením/ }).check();
          await button("Uložit výstup").click();
          await page.getByText(/^Výstup je uložený\. Verze \d+\.$/).waitFor();
        }
      }
      if (index === lesson.steps.length - 1) break;
      await button("Pokračovat").click();
      await idle();
      if (index === 0) {
        // Continuation is persisted: a reload resumes on the second step.
        await page.reload();
        await page.getByRole("heading", { level: 2, name: lesson.steps[1].title, exact: true }).waitFor();
      }
    }
    where = `${lesson.id} completion`;
    await button("Dokončit lekci").click();
    await page.getByRole("heading", { name: "Lekce dokončena", exact: true }).waitFor();
    const progress: { status: string } | undefined = (await sql<{ status: string }[]>`select status from lesson_progress where user_id = ${userId} and lesson_id = ${lesson.id}`)[0];
    assert.equal(progress?.status, "completed", where);
    assert.equal((await sql<{ count: number }[]>`select count(*)::int as count from lesson_award where user_id = ${userId} and lesson_id = ${lesson.id}`)[0].count, 1, `${where}: one receipt`);
    if (["before-investing-debt", "foundations-funds", "foundations-active-vs-index"].includes(lesson.id)) {
      const [receipt]: { xp: number; practice_capital_minor: string }[] = await sql`select xp, practice_capital_minor::text from lesson_award where user_id = ${userId} and lesson_id = ${lesson.id}`;
      assert.deepEqual({ ...receipt }, { xp: 60, practice_capital_minor: "0" }, `${lesson.id} uses the existing XP-only policy`);
    }
    if (["costs-ter-tracking-difference", "costs-spread-and-fees", "broker-fee-schedule"].includes(lesson.id)) {
      const [receipt]: { xp: number; practice_capital_minor: string }[] = await sql`select xp, practice_capital_minor::text from lesson_award where user_id = ${userId} and lesson_id = ${lesson.id}`;
      assert.deepEqual({ ...receipt }, { xp: 60, practice_capital_minor: "200000" }, `${lesson.id} earns the L2 Practice Capital once`);
    }
    console.log(`✓ ${lesson.id} (${lesson.steps.length} steps at ${width}px)`);
  }
  assert.deepEqual(errors, [], "no browser or hydration errors");
  console.log(`Lesson walkthrough: ${lessons.length} published lessons answered wrong then right, resumed, completed with one receipt; no overflow at 1440/390/320 px and no serious axe findings.`);
} catch (error) {
  await page.screenshot({ path: `${screenshots}/failure.png`, fullPage: true }).catch(() => {});
  console.error(`Failed at ${where}`);
  throw error;
} finally {
  if (userId) await sql`delete from "user" where id = ${userId}`;
  await browser.close();
  await sql.end();
}

declare global { interface Window { axe: typeof axe } }
