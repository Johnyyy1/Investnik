import { describe, expect, it } from "vitest";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { lessonReward } from "@/features/rewards/practice-capital";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { defaultFeeProfileDraft, feeProfileFromDraft, lessonTariff, lessonTradeFeeMinor } from "./fee-schedule-model";

const lesson = getAuthoredLesson("broker-and-account", "reading-a-fee-schedule")!;
const steps = getGuidedSteps(lesson);
const kc = (minor: bigint) => Number(minor) / 100;
const share = (feeMinor: bigint, amountMinor: bigint) => Number(feeMinor) / Number(amountMinor) * 100;
const czech = (value: number) => new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 }).format(value).replace(/ /g, " ");

describe("reading a fee schedule lesson 2.1.6 (#170)", () => {
  it("publishes 2.1.6 in the broker module with the L2 reward and no Lab unlock change", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "broker-fee-schedule", moduleId: "module-broker-and-account", moduleSlug: "broker-and-account", slug: "reading-a-fee-schedule" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "2.1.6", prerequisites: ["foundations-markets"], required: "required", skills: ["fee-schedule"] });
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(200_000n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(lessonLink(lesson.id)?.href).toBe("/learn/broker-and-account/reading-a-fee-schedule");
  });

  it("grades at most one question per step, none on the final step, and gates every move on the server", () => {
    const ids = lesson.blocks.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(steps.flatMap((step) => step.blocks.map((item) => item.id)).sort()).toEqual([...ids].sort());
    for (const [position, step] of steps.entries()) {
      expect(step.blocks.filter(isQuestion).length).toBeLessThanOrEqual(1);
      expect(step.requiredArtifact).toBeUndefined(); // The profile is optional; the lesson's tariff is the default.
      for (const question of step.blocks.filter(isQuestion)) {
        expect(() => validateMove(lesson.id, position, position + 1, wrongAnswers(question))).toThrow();
        expect(() => validateMove(lesson.id, position, position + 1, correctAnswers(question))).not.toThrow();
      }
    }
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("shows the tariff the model uses and asks for the two rows paid on a one-off euro purchase", () => {
    const tariff = block(lesson, "tariff", "documentTap");
    const price = (id: string) => tariff.document.rows.find((row) => row.id === id)!.cells.price;
    const { rateBps, minMinor, maxMinor } = lessonTariff.tradeFee;
    expect(price("trade")).toBe(`${czech(rateBps / 100)} %, min. ${kc(minMinor)} Kč, max. ${kc(maxMinor)} Kč`);
    expect(price("fx")).toContain(`${czech(lessonTariff.fxBps / 100)} %`);
    expect(price("custody")).toContain(`${czech(lessonTariff.custodyBps / 100)} % ročně`);
    expect(price("custody")).toContain(`${czech(kc(lessonTariff.custodyFreeUpToMinor))} Kč`);
    expect(tariff.document.rows).toHaveLength(6);
    expect(tariff.correctRowIds).toEqual(["trade", "fx"]);
    expect(evaluateQuestion(tariff, { selected: "trade,custody" })).toBe(false);
  });

  it("recomputes the worked example and both practice answers with the shared fee rule", () => {
    const values = block(lesson, "worked", "workedExample").steps.map((step) => step.value);
    expect(values[0]).toContain(`→ ${kc(lessonTradeFeeMinor(5_000_000n))} Kč`);
    expect(values[1]).toContain(`→ ${kc(lessonTradeFeeMinor(200_000n))} Kč, tedy ${czech(share(lessonTradeFeeMinor(200_000n), 200_000n))} %`);
    expect(values[2]).toContain(`→ ${kc(lessonTradeFeeMinor(50_000_000n))} Kč, tedy ${czech(share(lessonTradeFeeMinor(50_000_000n), 50_000_000n))} %`);

    const small = block(lesson, "small-purchase", "multiNumericQuestion");
    expect(small.prompt).toContain("3 000 Kč");
    expect(small.answers.map((answer) => answer.answer)).toEqual([kc(lessonTradeFeeMinor(300_000n)), share(lessonTradeFeeMinor(300_000n), 300_000n)]);
    expect(evaluateQuestion(small, { fee: "60", share: "2" })).toBe(true);
    // 0.15 % of 3 000 Kč without the minimum is the misconception the step targets.
    expect(evaluateQuestion(small, { fee: "4,5", share: "0,15" })).toBe(false);

    const large = block(lesson, "large-purchase", "numericQuestion");
    expect(large.prompt).toContain("800 000 Kč");
    expect(large.answer).toBe(kc(lessonTradeFeeMinor(80_000_000n)));
    expect(evaluateQuestion(large, { answer: "1200" })).toBe(false);
  });

  it("derives the savings-plan comparison from the tariff", () => {
    const monthly = 200_000n;
    const fx = Number(monthly) * lessonTariff.fxBps / 10_000 / 100;
    const order = kc(lessonTradeFeeMinor(monthly)) + fx;
    const values = block(lesson, "plan-worked", "workedExample").steps.map((step) => step.value);
    expect(values).toEqual([`0 Kč za nákup + konverze 0,5 % z 2 000 Kč = ${fx} Kč`, `12 × ${fx} Kč = ${12 * fx} Kč`, `minimum 60 Kč + konverze ${fx} Kč = ${order} Kč`, `12 × ${order} Kč = ${12 * order} Kč`]);
  });

  it("turns the default form into a valid CZK fee profile matching the lesson tariff and rejects a maximum below the minimum", () => {
    expect(feeProfileFromDraft(defaultFeeProfileDraft())).toEqual({
      label: "Fiktivní ceník z lekce", currency: "CZK", orderFeeMinor: "0", monthlyFeeMinor: "0",
      orderFeeBasisPoints: lessonTariff.tradeFee.rateBps, minimumOrderFeeMinor: String(lessonTariff.tradeFee.minMinor), maximumOrderFeeMinor: String(lessonTariff.tradeFee.maxMinor),
      fxSpreadBasisPoints: lessonTariff.fxBps, custodyBasisPoints: lessonTariff.custodyBps, custodyFreeUpToMinor: String(lessonTariff.custodyFreeUpToMinor),
    });
    expect(() => feeProfileFromDraft({ ...defaultFeeProfileDraft(), maximum: "50" })).toThrow(/nižší než minimální/);
    for (const rate of ["0,155", "101", "-1", ""]) expect(() => feeProfileFromDraft({ ...defaultFeeProfileDraft(), rate })).toThrow(/dvě desetinná místa/);
    expect(() => feeProfileFromDraft({ ...defaultFeeProfileDraft(), label: " " })).toThrow(/Doplň název/);
  });

  it("labels model examples, cites sources and states what the Lab does with the profile", () => {
    expect(block(lesson, "opening", "paragraph").content).toMatch(/^Modelový příklad/);
    expect(block(lesson, "worked", "workedExample").title).toMatch(/^Modelový příklad/);
    expect(block(lesson, "tariff", "documentTap").document.eyebrow).toMatch(/^Modelový příklad/);
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
    expect(block(lesson, "lab-bridge", "labBridge").content).toContain("nákupy v Labu nemění");
  });
});
