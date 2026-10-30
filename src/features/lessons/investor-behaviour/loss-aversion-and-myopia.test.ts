import { describe, expect, it } from "vitest";
import { availableLessons, lessonLink } from "@/features/learning/catalog";
import { getLessonPlacement, skillItems } from "@/features/learning/curriculum";
import { stepArtifactRequirements } from "../output-contract";
import { validateCompletion, validateMove } from "@/features/progress/transition";
import { progressionUnlocks } from "@/features/progression/unlocks";
import { lessonReward } from "@/features/rewards/practice-capital";
import { getAuthoredLesson } from "../registry";
import { getGuidedSteps } from "../steps";
import { correctAnswers, wrongAnswers } from "../answer-keys";
import { isQuestion } from "../question-evaluation";
import { block } from "../lesson-test-support";
import { mixView, myopiaSimulation, myopiaViews, simulatedDailyReturns } from "./myopia-model";

const lesson = getAuthoredLesson("investor-behaviour", "loss-aversion-and-myopia")!;
const steps = getGuidedSteps(lesson);

/** Independent recount from the raw simulated series, without the lesson's model helper. */
function recount(stockShare: number) {
  const daily = simulatedDailyReturns();
  const w = stockShare / 100;
  const changes = daily.map(([stock, bond]) => w * stock + (1 - w) * bond);
  const yearly: number[] = [];
  for (let year = 0; year < myopiaSimulation.years; year += 1) {
    const slice = changes.slice(year * myopiaSimulation.tradingDaysPerYear, (year + 1) * myopiaSimulation.tradingDaysPerYear);
    yearly.push(slice.reduce((value, change) => value * (1 + change), 1) - 1);
  }
  return { lossDays: changes.filter((change) => change < 0).length, lossYears: yearly.filter((change) => change < 0).length, end: changes.reduce((value, change) => value * (1 + change), myopiaSimulation.startValue) };
}
const kc = (amount: number) => `${(Math.round(amount / 1_000) * 1_000).toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;

describe("Averze ke ztrátě a krátkozrakost · B.1.4 (#289)", () => {
  it("publishes its stable identity in B.1 after the behaviour gap, without expanding the Lab prerequisites", () => {
    expect(availableLessons.find((entry) => entry.id === lesson.id)).toMatchObject({ id: "behaviour-loss-aversion", moduleId: "module-investor-behaviour", moduleSlug: "investor-behaviour", slug: "loss-aversion-and-myopia" });
    expect(getLessonPlacement(lesson.id)).toMatchObject({ displayCode: "B.1.4", required: "required", prerequisites: ["behaviour-behaviour-gap"] });
    expect(lessonLink(lesson.id)?.href).toBe("/learn/investor-behaviour/loss-aversion-and-myopia");
    expect(progressionUnlocks.PORTFOLIO_LAB.prerequisiteLessonIds).not.toContain(lesson.id);
    expect(skillItems.filter((item) => item.lessonId === lesson.id).map((item) => item.blockId)).toEqual(["recall"]);
    expect(skillItems.filter((item) => item.skillId === "myopic-loss-aversion").every((item) => item.lessonId === lesson.id)).toBe(true);
    // Policy v4: level B lessons earn XP only.
    expect(lessonReward(lesson.id).practiceCapitalMinor).toBe(0n);
  });

  it("is deterministic and counts loss days and years from the stated series", () => {
    expect(simulatedDailyReturns()).toEqual(simulatedDailyReturns());
    expect(simulatedDailyReturns()).toHaveLength(myopiaSimulation.years * myopiaSimulation.tradingDaysPerYear);
    for (const view of myopiaViews) {
      const independent = recount(view.stockShare);
      expect(view.lossDays).toBe(independent.lossDays);
      expect(view.lossYears).toBe(independent.lossYears);
      expect(view.endValue).toBeCloseTo(independent.end, 6);
    }
    expect(mixView(80)).toEqual(myopiaViews[2]);
  });

  it("shows the myopia pattern: close to half the days are losses, far fewer of the years", () => {
    for (const view of myopiaViews) {
      const dayShare = view.lossDays / view.days;
      expect(dayShare).toBeGreaterThan(0.4);
      expect(dayShare).toBeLessThan(0.55);
      expect(view.lossYears / view.years).toBeLessThan(dayShare);
    }
  });

  it("renders both views from the same path and the same outcome rows", () => {
    const daily = block(lesson, "daily", "personaDecision");
    const annual = block(lesson, "annual", "personaDecision");
    expect(daily.options.map((option) => option.id)).toEqual(annual.options.map((option) => option.id));
    expect(daily.options.map((option) => option.consequence.rows)).toEqual(annual.options.map((option) => option.consequence.rows));
    const eighty = recount(80);
    const row = (label: string) => daily.options.find((option) => option.id === "stocks-80")!.consequence.rows.find((entry) => entry.label === label)!.value;
    expect(row("Ztrátové dny")).toBe(`${eighty.lossDays.toLocaleString("cs-CZ").replace(/\s/g, " ")} z 2 520 (${(eighty.lossDays / 2_520 * 100).toFixed(1).replace(".", ",")} %)`);
    expect(row("Ztrátové roky")).toBe(`${eighty.lossYears} z 10`);
    expect(row("Hodnota po 10 letech")).toBe(`${kc(eighty.end)} z 100 000 Kč`);
    expect(daily.persona.facts.map((fact) => fact.value)).toEqual(myopiaViews.map((view) => `${(view.lossDays / view.days * 100).toFixed(1).replace(".", ",")} % dní ve ztrátě`));
    expect(annual.persona.facts[2].value).toBe(`${eighty.lossYears} ztrátové roky z 10`);
  });

  it("recomputes the worked example from the series", () => {
    const worked = block(lesson, "worked", "workedExample");
    const eighty = recount(80);
    const values = worked.steps.map((step) => step.value);
    expect(values[1]).toBe(eighty.lossDays.toLocaleString("cs-CZ").replace(/\s/g, " "));
    expect(values[2]).toContain(`= ${(eighty.lossDays / 2_520 * 100).toFixed(1).replace(".", ",")} %`);
    expect(values[4]).toBe(`${eighty.lossYears} ÷ 10 = ${(eighty.lossYears * 10).toFixed(1).replace(".", ",")} %`);
    expect(worked.conclusion).toContain(kc(eighty.end));
  });

  it("states no historical share of loss days or years without a computed series", () => {
    for (const id of ["probability-context", "research", "loss-aversion", "myopia"]) {
      expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).not.toMatch(/\d+(,\d+)?\s?%/);
    }
    const probability = block(lesson, "probability", "multipleChoiceQuestion");
    expect(JSON.stringify(probability)).not.toMatch(/\d/);
  });

  it("asks for a saved IPS, whose review frequency is the safeguard, and adds no price notifications", () => {
    const step = steps.find((entry) => entry.blocks.some((item) => item.id === "builder"))!;
    expect(stepArtifactRequirements(step)).toContainEqual({ kind: "investment_plan", source: "any_lesson" });
    expect(block(lesson, "builder", "interactiveFigure").figure).toBe("ips-builder");
    expect(block(lesson, "safeguard", "explanation").content).toContain("notifikace o cenách nemá");
  });

  it("explains every wrong option", () => {
    for (const id of ["interpretation", "probability", "recall"]) {
      const question = block(lesson, id, "multipleChoiceQuestion");
      expect(question.options.filter((option) => option.id !== question.correctOptionId).every((option) => option.explanation && option.misconception)).toBe(true);
    }
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
    expect(steps.filter((step) => step.kind === "mastery")).toHaveLength(1);
    expect(steps.at(-1)!.blocks.some(isQuestion)).toBe(false);
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: 0 })).toThrow();
    expect(() => validateCompletion(lesson.id, { status: "in_progress", lastPosition: steps.length - 1 })).not.toThrow();
  });

  it("labels the simulation and recommends no product", () => {
    for (const id of ["opening", "annual-intro", "worked"]) expect(JSON.stringify(lesson.blocks.find((entry) => entry.id === id))).toContain("Simulace");
    for (const id of ["daily", "annual"]) {
      const decision = block(lesson, id, "personaDecision");
      expect(decision.prompt).toContain("Simulace");
      expect(decision.disclaimer).toContain("Deterministická ukázková data");
    }
    expect(block(lesson, "research", "conceptCallout").title).toContain("Výzkum");
    expect(block(lesson, "sources", "paragraph").content).toContain("Vzdělávací obsah, ne investiční doporučení.");
  });
});
