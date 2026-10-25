import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SpivaChart } from "@/components/lesson/spiva-chart";
import { factRegistry, getFact } from "@/features/facts/registry";
import { prepareLessonFacts } from "@/features/facts/lesson-facts";
import { getLessonPlacement } from "@/features/learning/curriculum";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { lessonReward } from "@/features/rewards/practice-capital";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { evaluateQuestion, isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { spivaUsLargeCap } from "./spiva-data";

const lesson = getAuthoredLesson("investing-foundations", "active-vs-index")!;
const steps = getGuidedSteps(lesson);

describe("active vs. index lesson 1.1.9 (#163)", () => {
  it("publishes after 1.1.8 without changing the Lab unlock or the L1 reward", () => {
    expect(lesson).toMatchObject({ id: "foundations-active-vs-index", slug: "active-vs-index", position: 9 });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "1.1.9", prerequisites: ["foundations-funds"], required: "required" });
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(progressionUnlocks.PORTFOLIO_LAB.xpRequired).toBe(420);
  });

  it("grades at most one question per step, none on the final step, and gates every move on the server", () => {
    const ids = lesson.blocks.map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [position, step] of steps.entries()) {
      expect(step.blocks.filter(isQuestion).length).toBeLessThanOrEqual(1);
      for (const question of step.blocks.filter(isQuestion)) {
        expect(() => validateMove(lesson.id, position, position + 1, wrongAnswers(question))).toThrow();
        expect(() => validateMove(lesson.id, position, position + 1, correctAnswers(question))).not.toThrow();
      }
    }
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("recomputes the worked example and the practice answer from their inputs", () => {
    const values = block(lesson, "worked", "workedExample").steps.map((step) => step.value);
    const czech = (value: number) => String(Math.round(value * 10) / 10).replace(".", ",");
    expect(values).toContain(`8 % − 1,5 % = ${czech(8 - 1.5)} %`);
    expect(values).toContain(`8 % − 0,2 % = ${czech(8 - 0.2)} %`);
    expect(values).toContain(`7,8 % − 6,5 % = ${czech(7.8 - 6.5)} p. b. ročně`);
    const practice = block(lesson, "arithmetic-practice", "numericQuestion");
    expect(practice.answer).toBeCloseTo(7 - 1.6, 9);
    expect(evaluateQuestion(practice, { answer: "5,4" })).toBe(true);
    expect(evaluateQuestion(practice, { answer: "7" })).toBe(false);
    expect(evaluateQuestion(practice, { answer: "8,6" })).toBe(false);
  });

  it("takes the SPIVA headline from the dated fact registry, matching the versioned chart data", () => {
    const fact = getFact("spiva.2025");
    expect(fact).toMatchObject({ verificationStatus: "primary", value: { amount: 79, unit: "%" } });
    expect(fact.research).toBeDefined();
    expect(Math.round(spivaUsLargeCap.underperforming[0].percent)).toBe(fact.value.amount);
    expect(spivaUsLargeCap.underperforming.map((row) => row.years)).toEqual([1, 3, 5, 10, 15, 20]);
    // Acceptance: the data was under 12 months old when the fact was verified.
    expect(fact.verifiedAt! < `${Number(spivaUsLargeCap.asOf.slice(0, 4)) + 1}${spivaUsLargeCap.asOf.slice(4)}`).toBe(true);
    const { lesson: resolved, notice } = prepareLessonFacts(lesson, factRegistry, { today: "2026-10-25", published: true });
    expect(JSON.stringify(resolved)).not.toContain("{{");
    expect(block(resolved, "spiva-reading", "multipleChoiceQuestion").prompt).toContain("zaostalo v roce 2025 za indexem S&P 500 79 % aktivních");
    expect(notice?.verifiedAt).toBe(fact.verifiedAt);
  });

  it("labels the chart's source, date and fund type and lets every horizon be selected", () => {
    const html = renderToStaticMarkup(createElement(SpivaChart));
    expect(html).toContain("Historická data · S&amp;P Dow Jones Indices, SPIVA U.S. Year-End 2025 · stav k 31. 12. 2025");
    expect(html).toContain("Aktivní akciové fondy velkých amerických firem proti indexu S&amp;P 500");
    expect(html.match(/aria-pressed="(true|false)"/g)).toHaveLength(6);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain("V roce 2025 mělo nižší výnos než S&amp;P 500 79 % těchto fondů, zhruba 8 z 10.");
    expect(html).toContain("přežilo jen 35 %");
  });
});
