import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { availableLessons } from "@/features/learning/catalog";
import { getLearnerSummary } from "@/features/learning/learner-summary";
import { getAuthoredLesson } from "@/features/lessons/registry";
import { getGuidedSteps } from "@/features/lessons/steps";
import { isQuestion, type QuestionBlock } from "@/features/lessons/question-evaluation";
import { recommendLearning } from "@/features/personalization/recommendation";
import { learnScenarios } from "./scenario-list";
import { learnScenario } from "./scenarios";
import { InlineQuestion } from "./variant-d-client";
import { learnWorkspaceModel, outOf, type LessonFocus } from "./workspace-model";

const lessonFocus = (id: (typeof learnScenarios)[number]["id"]) => {
  const { focus } = learnScenario(id).workspace;
  if (focus.kind !== "lesson") throw new Error(`${id} has no lesson focus`);
  return focus;
};

describe("D learner states (fixtures through the production builders)", () => {
  it("new learner: a clear start, no progress shown as started, Lab locked at 0 of 7", () => {
    const { workspace } = learnScenario("novy");
    const focus = lessonFocus("novy");
    expect(focus.status).toBe("new");
    expect(focus.lesson.id).toBe("foundations-why-invest");
    expect(focus.step.number).toBe(1);
    expect(focus.recap).toEqual([]);
    const rows = workspace.rail.levels.flatMap((level) => level.modules.flatMap((module) => [...module.folded, ...module.lessons]));
    expect(rows.every((lesson) => lesson.status === "todo")).toBe(true);
    expect(rows.find((lesson) => lesson.current)?.status).toBe("todo");
    expect(workspace.rail.completed).toBe(0);
    expect(workspace.lab).toEqual({ state: "locked", done: 0, required: 7 });
    expect(workspace.personalize).toBe(true);
    expect(workspace.then?.id).toBe("foundations-stocks");
  });

  it("returning learner: resumes the saved question with no recap beside it", () => {
    const { workspace } = learnScenario("rozpracovano");
    const focus = lessonFocus("rozpracovano");
    expect(focus.status).toBe("resume");
    expect(focus.lesson.id).toBe("foundations-risk-reward");
    expect(focus.question?.type).toBe("numericQuestion");
    expect(focus.recap).toEqual([]);
    expect(focus.step.description).toBeUndefined();
    expect(workspace.rail.completed).toBe(6);
    // Five of the seven Foundations prerequisites: a regular account is still locked (demo identities are not).
    expect(workspace.lab).toEqual({ state: "locked", done: 5, required: 7 });
  });

  it("returning learner on an explanation step keeps the recap of earlier steps", () => {
    const focus = lessonFocus("vyklad");
    expect(focus.step.graded).toBe(false);
    expect(focus.recap.length).toBeGreaterThan(0);
    expect(focus.question).toBeUndefined();
  });

  it("finished module: acknowledges it, recommends the next lesson with its reason and never offers the module again", () => {
    const { workspace } = learnScenario("modul");
    const focus = lessonFocus("modul");
    expect(focus.status).toBe("next");
    expect(focus.finishedModule).toEqual({ code: "1.1", title: "Investiční základy" });
    expect(focus.reason).toBeTruthy();
    // Production recommendation today (RETURNS_AFTER_FOUNDATIONS). See finding C-3 in LEARN-D-INTEGRATION.md.
    expect(focus.lesson.id).toBe("returns-what-is-a-return");
    const moduleOne = workspace.rail.levels.find((level) => level.id === "L1")!.modules[0];
    expect(moduleOne.lessons).toEqual([]);
    expect(moduleOne.folded).toHaveLength(10);
    expect(workspace.lab.state).toBe("unlocked");
  });

  it("finished milestone lessons: the next requirement replaces the lesson, nothing asks to repeat finished lessons", () => {
    const { workspace } = learnScenario("milnik");
    expect(workspace.focus.kind).toBe("milestone");
    if (workspace.focus.kind !== "milestone") return;
    expect(workspace.focus.requirements.find((item) => item.kind === "lessons")?.status).toBe("done");
    expect(workspace.focus.next?.href).toMatch(/^\/learn\/checkpoint\//);
    expect(workspace.focus.achieved).toBe(false);
    expect(workspace.then).toBeUndefined();
  });

  it("lists every published lesson exactly once in the rail, in every state", () => {
    for (const { id } of learnScenarios) {
      const { rail } = learnScenario(id).workspace;
      const ids = [...rail.levels, ...rail.optional].flatMap((level) => level.modules.flatMap((module) => [...module.folded, ...module.lessons].map((lesson) => lesson.id)));
      expect(ids.toSorted(), id).toEqual(availableLessons.map((lesson) => lesson.id).toSorted());
      expect(ids.filter((lessonId) => ids.indexOf(lessonId) !== ids.lastIndexOf(lessonId)), id).toEqual([]);
    }
  });

  it("uses Czech vocalization for counts", () => {
    expect(outOf(7)).toBe("ze ");
    expect(outOf(9)).toBe("z ");
    expect(outOf(28)).toBe("z ");
  });
});

/** Text shown before an answer: never the result of the open question, never a raw fact token. */
function visibleBeforeAnswer(focus: LessonFocus) {
  return [focus.lesson.title, focus.lesson.summary, focus.step.title, focus.step.description ?? "", ...focus.recap.flatMap((item) => [item.title, item.body])].join("\n");
}
const answerPatterns = (block: QuestionBlock) => {
  if (block.type === "numericQuestion") {
    const value = String(block.answer).replace(".", ",");
    return [new RegExp(`(^|[^\\d,])${value.replace(/[,]/g, "[,.]")}(?![\\d])`)];
  }
  if (block.type === "multipleChoiceQuestion") return [block.options.find((option) => option.id === block.correctOptionId)!.label];
  return [];
};

describe("D never shows an open question's answer before it is attempted", () => {
  it("covers every saved step of every published lesson", () => {
    let graded = 0;
    for (const next of availableLessons) {
      const lesson = getAuthoredLesson(next.moduleSlug, next.slug)!;
      getGuidedSteps(lesson).forEach((step, position) => {
        const states = [{ lessonId: next.id, status: "in_progress" as const, lastPosition: position, completedAt: null, updatedAt: new Date("2026-11-13T09:00:00Z") }];
        const summary = getLearnerSummary(states);
        const { workspace } = { workspace: learnWorkspaceModel({ ...summary, states: states.map((state) => ({ ...state, userId: "test" })), recommendation: recommendLearning({ progress: states }), practiceCapital: { earnedPracticeCapitalMinor: 0n }, personalized: true }, [], "unavailable", "2026-11-13") };
        if (workspace.focus.kind !== "lesson") throw new Error("expected a lesson");
        const shown = visibleBeforeAnswer(workspace.focus);
        const where = `${next.id} step ${position + 1}`;
        expect(JSON.stringify(workspace), where).not.toContain("{{");
        if (!step.blocks.some(isQuestion)) return;
        graded++;
        expect(workspace.focus.recap, where).toEqual([]);
        expect(workspace.focus.step.description, where).toBeUndefined();
        // Numeric results are checked against everything shown. A choice label is often a domain term the lesson summary
        // names on purpose („MSCI World“ among other indexes), so it is checked against the step-derived paths only.
        const stepText = [workspace.focus.step.description ?? "", ...workspace.focus.recap.flatMap((item) => [item.title, item.body])].join("\n");
        for (const block of step.blocks.filter(isQuestion)) for (const pattern of answerPatterns(block)) expect(block.type === "numericQuestion" ? shown : stepText, where).not.toMatch(pattern);
      });
    }
    expect(graded).toBeGreaterThan(200);
  });

  it("renders only the prompt and controls before an attempt: no explanation, no recap", () => {
    for (const id of ["rozpracovano", "vyber"] as const) {
      const question = lessonFocus(id).question!;
      const html = renderToStaticMarkup(createElement(InlineQuestion, { question, lessonHref: "/learn/x", earlierSteps: 5 }));
      expect(html, id).toContain("Zkontrolovat");
      expect(html, id).not.toContain(question.correctExplanation);
      expect(html, id).not.toContain(question.incorrectExplanation);
      expect(html, id).not.toMatch(/Správně|Ještě ne/);
      if (question.type === "numericQuestion") expect(html).not.toMatch(new RegExp(`value="${question.answer}"`));
    }
  });
});
