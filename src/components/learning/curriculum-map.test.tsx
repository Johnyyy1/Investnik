import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { availableLessons } from "@/features/learning/catalog";
import { getLearnerSummary, type LearnerState } from "@/features/learning/learner-summary";
import { curriculumMapModel } from "./curriculum-map-model";
import { CurriculumMap } from "./curriculum-map";
import { milestoneStates } from "@/features/milestones/domain";

const date = new Date("2026-10-22T10:00:00Z");
const done = (lessonId: string): LearnerState => ({ lessonId, status: "completed", lastPosition: 0, completedAt: date, updatedAt: date });
const summary = (states: LearnerState[] = []) => ({ ...getLearnerSummary(states), states });
const noEvidence = milestoneStates({ completions: [], attempts: [], submissions: [] });
const moduleOf = (levels: ReturnType<typeof curriculumMapModel>, code: string) => levels.flatMap((level) => level.modules).find((module) => module.code === code)!;

describe("Curriculum map presentation", () => {
  it("places all published lessons exactly once, keeping storage URLs and display order", () => {
    const levels = curriculumMapModel(summary());
    const lessons = levels.flatMap((level) => level.modules.flatMap((module) => module.lessons));
    expect(levels).toHaveLength(9);
    expect(levels.flatMap((level) => level.modules)).toHaveLength(25);
    expect(lessons).toHaveLength(availableLessons.length);
    expect(new Set(lessons.map((lesson) => lesson.id))).toEqual(new Set(availableLessons.map((lesson) => lesson.id)));
    for (const lesson of lessons) expect(lesson.href).toBe(`/learn/${lesson.moduleSlug}/${lesson.slug}`);
    expect(moduleOf(levels, "3.3").lessons.map((lesson) => lesson.moduleSlug)).toEqual(["correlation", "correlation", ...Array(5).fill("diversification")]);
    expect(moduleOf(levels, "6.1").lessons[0].id).toBe("returns-log-returns");
    expect(moduleOf(levels, "6.2").lessons[0].id).toBe("correlation-real-data");
    expect(moduleOf(levels, "B.1").lessons.map((lesson) => lesson.id)).toEqual(["behaviour-behaviour-gap", "behaviour-overconfidence", "behaviour-disposition-effect", "behaviour-loss-aversion", "correlation-not-causation", "behaviour-crisis-drill"]);
  });

  it("expands only the persisted continuation level, even in an optional track", () => {
    const state: LearnerState = { ...done("returns-log-returns"), status: "in_progress", completedAt: null, lastPosition: 2 };
    const levels = curriculumMapModel(summary([state]));
    expect(levels.filter((level) => level.current).map((level) => level.id)).toEqual(["L6"]);
    const html = renderToStaticMarkup(createElement(CurriculumMap, { levels, milestones: noEvidence }));
    expect(html.match(/open=""/g)).toHaveLength(1);
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(html).toMatch(/<details[^>]*open=""[^>]*data-level="L6"/);
    expect(html).toContain("Rozpracováno");
  });

  it("reopens expanded module progress when new published material has not been completed", () => {
    const states = [done("correlation-what-is-correlation"), done("correlation-in-crises")];
    const before = JSON.stringify(states);
    const model = curriculumMapModel(summary(states));
    expect(moduleOf(model, "3.3")).toMatchObject({ completed: 2, total: 7, status: "started" });
    expect(moduleOf(model, "3.3").lessons.slice(0, 2).every((lesson) => lesson.done)).toBe(true);
    expect(JSON.stringify(states)).toBe(before);
    // A subsequent publication is counted without changing historical completion records.
    const full = summary(availableLessons.map((lesson) => done(lesson.id)));
    // Existing registered lessons arriving in a previously smaller snapshot have the same semantics.
    const smaller = { ...full, lessons: full.lessons.filter((lesson) => lesson.id !== "foundations-stocks"), completed: full.completed.filter((lesson) => lesson.id !== "foundations-stocks") };
    expect(moduleOf(curriculumMapModel(smaller), "1.1").status).toBe("done");
    expect(moduleOf(curriculumMapModel({ ...smaller, lessons: full.lessons }), "1.1").status).toBe("started");
  });

  it("labels planned content honestly and never awards milestone completion for current lessons", () => {
    const levels = curriculumMapModel(summary(availableLessons.map((lesson) => done(lesson.id))));
    expect(levels.filter((level) => level.current)).toEqual([]);
    expect(levels.find((level) => level.id === "L4")).toMatchObject({ total: 0, status: "planned", percentage: null });
    // Counts describe published lessons: modules 2.1, 2.2 and 2.5 have published lessons, 2.3 and 2.4 stay planned.
    expect(levels.find((level) => level.id === "L2")!.modules.map((module) => [module.code, module.status])).toEqual([["2.1", "done"], ["2.2", "done"], ["2.3", "planned"], ["2.4", "planned"], ["2.5", "done"]]);
    expect(levels.filter((level) => level.optional).map((level) => level.id)).toEqual(["L4", "L5", "L6", "V"]);
    const html = renderToStaticMarkup(createElement(CurriculumMap, { levels, milestones: noEvidence }));
    expect(html).toContain("Prohloubení");
    expect(html).toContain("Milník C není podmínkou.");
    // Capstones and L2 modules are not published yet, so no milestone can be achieved.
    expect(html.match(/Zatím nejde splnit: část obsahu připravujeme\./g)).toHaveLength(4);
    expect(html).not.toContain("Splněno 2");
    expect(html).toContain("Závěrečný projekt A: plán, nákup a krizový nácvik: připravujeme");
    expect(html).toContain('role="meter"');
    expect(html).not.toContain('aria-valuemax="0"');
    expect(html).not.toContain("NaN");
  });
});
