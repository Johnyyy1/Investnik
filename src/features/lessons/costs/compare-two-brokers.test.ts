import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { tradeFeeMinor } from "@/features/portfolio/costs";
import { roundDivide } from "@/features/portfolio/decimal";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";

const lesson = getAuthoredLesson("costs", "compare-two-brokers")!;
const steps = getGuidedSteps(lesson);

// The brief's tariffs in haléře. B's minimum is 1,50 EUR at the model rate 24,30 Kč/EUR; "no maximum" is a cap no amount here reaches.
const minimumB = roundDivide(150n * 2_430n, 100n);
const brokerA = { tradeFee: { rateBps: 0, minMinor: 0n, maxMinor: 0n }, fxBps: 25 };
const brokerB = { tradeFee: { rateBps: 10, minMinor: minimumB, maxMinor: 10n ** 15n }, fxBps: 15 };
type Broker = typeof brokerA;
const purchaseCost = (broker: Broker, amountMinor: bigint) => tradeFeeMinor(broker.tradeFee, amountMinor) + roundDivide(amountMinor * BigInt(broker.fxBps), 10_000n);
const annualCost = (broker: Broker, purchases: number, amountMinor: bigint) => BigInt(purchases) * purchaseCost(broker, amountMinor);
const kc = (minor: bigint) => Number(minor) / 100;
const cs = (value: number, digits = 2) => new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value).replaceAll(" ", " ");
const share = (costMinor: bigint, investedMinor: bigint) => cs(Number(costMinor) / Number(investedMinor) * 100);

describe("Kontrola: srovnej dva brokery · 2.2.5 (#175)", () => {
  it("publishes its stable identity and L2 placement without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "costs-broker-comparison", moduleId: "module-costs", moduleSlug: "costs", slug: "compare-two-brokers" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.2.5", prerequisites: ["costs-spread-and-fees", "costs-currency-conversion", "costs-over-30-years"], required: "required" });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/costs/compare-two-brokers");
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["annual", "mix-td", "mix-trade", "mix-drag"]);
  });

  it("states the tariffs and the per-purchase worked example the shared fee rule produces", () => {
    expect(kc(minimumB)).toBe(36.45);
    expect(block(lesson, "tariffs", "explanation").content).toContain(`1,50 × 24,30 = ${cs(kc(minimumB))} Kč`);
    const amount = 250_000n;
    const text = block(lesson, "worked", "workedExample").steps.map((step) => step.value).join(" | ");
    expect(tradeFeeMinor(brokerA.tradeFee, amount)).toBe(0n);
    expect(text).toContain(`= ${cs(kc(purchaseCost(brokerA, amount)))} Kč`);
    expect(text).toContain(`= ${cs(kc(roundDivide(amount * 10n, 10_000n)))} Kč, méně než minimum → ${cs(kc(tradeFeeMinor(brokerB.tradeFee, amount)))} Kč`);
    expect(text).toContain(`= ${cs(kc(roundDivide(amount * 15n, 10_000n)))} Kč`);
    expect(text).toContain(`A ${cs(kc(purchaseCost(brokerA, amount)))} Kč, B 36,45 + 3,75 = ${cs(kc(purchaseCost(brokerB, amount)))} Kč`);
  });

  it("grades the annual costs of the default plan and rejects the rate-without-minimum mistake", () => {
    const question = block(lesson, "annual", "multiNumericQuestion");
    const [a, b] = [annualCost(brokerA, 12, 250_000n), annualCost(brokerB, 12, 250_000n)];
    expect(question.prompt).toContain("12× ročně po 2 500 Kč");
    expect(question.answers.map((answer) => answer.answer)).toEqual([kc(a), kc(b)]);
    expect(question.correctExplanation).toContain(`= ${cs(kc(a), 0)} Kč, tedy ${share(a, 3_000_000n)} %`);
    expect(question.correctExplanation).toContain(`= ${cs(kc(b))} Kč, tedy ${share(b, 3_000_000n)} %`);
    expect(evaluateQuestion(question, { a: "75", b: "482,40" })).toBe(true);
    expect(evaluateQuestion(question, { a: "75,4", b: "482" })).toBe(true);
    // 12 × (0,1 % + 0,15 %) of 2 500 Kč, ignoring B's minimum, also comes to 75 Kč.
    expect(kc(12n * (roundDivide(250_000n * 10n, 10_000n) + roundDivide(250_000n * 15n, 10_000n)))).toBe(75);
    expect(evaluateQuestion(question, { a: "75", b: "75" })).toBe(false);
    expect(evaluateQuestion(question, { a: "6,25", b: "40,2" })).toBe(false);
  });

  it("recomputes the frequency example and the quarterly exercise", () => {
    const yearly = annualCost(brokerB, 1, 3_000_000n);
    expect(block(lesson, "frequency-worked", "workedExample").steps.at(-1)!.value).toBe(`36,45 + 45 = ${cs(kc(yearly))} Kč ≈ ${share(yearly, 3_000_000n)} %`);
    expect(block(lesson, "frequency", "explanation").content).toContain(`na ${kc(roundDivide(3_000_000n * 10n, 10_000n))} Kč`);
    const ratio = Number(annualCost(brokerB, 12, 250_000n)) / Number(yearly);
    expect(ratio).toBeGreaterThan(5.5);
    expect(ratio).toBeLessThan(6.5);

    const question = block(lesson, "quarterly", "numericQuestion");
    const quarterly = annualCost(brokerB, 4, 750_000n);
    expect(question.answer).toBe(kc(quarterly));
    expect(question.correctExplanation).toContain(`= ${cs(kc(quarterly))} Kč, tedy ${share(quarterly, 3_000_000n)} %`);
    for (const answer of ["190,80", "190,8", "191"]) expect(evaluateQuestion(question, { answer })).toBe(true);
    // Without the minimum: 4 × (7,50 + 11,25) = 75 Kč.
    for (const answer of ["75", "47,7", "482,4"]) expect(evaluateQuestion(question, { answer })).toBe(false);
  });

  it("backs the break-even claim: below 36 450 Kč a purchase A is cheaper, from there both cost 0,25 %", () => {
    const breakEven = 3_645_000n;
    expect(block(lesson, "break-even", "explanation").content).toContain("36 450 Kč");
    expect(tradeFeeMinor(brokerB.tradeFee, breakEven)).toBe(minimumB);
    for (const amount of [100_000n, 250_000n, 750_000n, 3_000_000n, breakEven - 1_000n]) expect(purchaseCost(brokerA, amount)).toBeLessThan(purchaseCost(brokerB, amount));
    for (const amount of [breakEven, 5_000_000n, 50_000_000n]) expect(purchaseCost(brokerA, amount)).toBe(purchaseCost(brokerB, amount));
  });

  it("recomputes the mixed review answers from their stated inputs", () => {
    const td = block(lesson, "mix-td", "numericQuestion");
    expect(td.answer).toBeCloseTo(7.95 - 8.1, 10);
    expect(evaluateQuestion(td, { answer: "-0,15" })).toBe(true);
    expect(evaluateQuestion(td, { answer: "0,15" })).toBe(false);

    const trade = block(lesson, "mix-trade", "numericQuestion");
    const fee = tradeFeeMinor({ rateBps: 15, minMinor: 4_000n, maxMinor: 10n ** 15n }, 600_000n);
    const halfSpread = roundDivide(600_000n * 20n, 2n * 10_000n);
    expect(trade.answer).toBe(kc(fee + halfSpread));
    for (const answer of ["15", "52", "40"]) expect(evaluateQuestion(trade, { answer })).toBe(false);
    expect(block(lesson, "mix-drag", "multipleChoiceQuestion").correctOptionId).toBe("grows");
  });

  it("offers one complete justification and keeps its numbers in step with the model", () => {
    const question = block(lesson, "justify", "multipleChoiceQuestion");
    const complete = question.options.find((option) => option.id === question.correctOptionId)!.label;
    expect(complete).toContain(`A na ${cs(kc(annualCost(brokerA, 12, 250_000n)), 0)} Kč ročně a B na ${cs(kc(annualCost(brokerB, 12, 250_000n)))} Kč`);
    expect(complete).not.toMatch(/vždy|nikdy/);
    expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    expect(block(lesson, "reflection", "writtenReflection").rubric).toHaveLength(4);
  });

  it("covers every block once with one question last per step, and validates all moves server-side", () => {
    expect(steps.flatMap((step) => step.blocks.map((item) => item.id)).sort()).toEqual(lesson.blocks.map((item) => item.id).sort());
    expect(new Set(lesson.blocks.map((item) => item.id)).size).toBe(lesson.blocks.length);
    for (const [position, step] of steps.entries()) {
      expect(step.blocks.filter(isQuestion).length).toBeLessThanOrEqual(1);
      for (const question of step.blocks.filter(isQuestion)) {
        expect(step.blocks.at(-1)).toBe(question);
        expect(() => validateMove(lesson.id, position, position + 1, wrongAnswers(question))).toThrow();
        expect(() => validateMove(lesson.id, position, position + 1, correctAnswers(question))).not.toThrow();
      }
    }
    expect(steps.filter((step) => step.kind === "mastery")).toHaveLength(3);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("labels model content, names no real broker and states what the Lab does and does not save", () => {
    for (const id of ["opening", "tariffs", "worked", "annual", "frequency-worked", "quarterly", "break-even", "mix-td", "mix-trade"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Modelový příklad");
    expect(block(lesson, "non-price", "conceptCallout").content).toContain("nedoporučuje konkrétního brokera");
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("neukládá do profilu ani do IPS");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
