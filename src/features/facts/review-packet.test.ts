import { describe, expect, it } from "vitest";
import { curriculumLessons } from "@/features/learning/catalog";
import { draftLessons } from "@/features/lessons/registry";
import { getStepDefinitions } from "@/features/lessons/steps";
import { factRegistry, isFactPending } from "./registry";
import { prepareLessonFacts } from "./lesson-facts";
import { resolveFact } from "./resolve";
import { factId, reviewPacket } from "./review-packet";

const today = "2026-10-26";
// Identifiers and renderer settings, not text a reviewer reads.
const structural = new Set(["id", "type", "nextId", "startId", "categoryId", "correctOptionId", "correctFixId", "errorRowId", "incorrectStepId", "regionId", "figure", "missionId", "lessonId", "metric", "align", "mobile", "mobileLabel", "correctRowIds", "correctOrder", "input", "kind", "reviewHref", "latex"]);

function texts(value: unknown, key = ""): string[] {
  if (typeof value === "string") return structural.has(key) || value.includes("{{") ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => texts(item, key));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([field, item]) => texts(item, field));
  return [];
}

describe("expert review packet (#435)", () => {
  it.each(draftLessons.map((lesson) => [lesson.id, lesson] as const))("%s: exports every step, every text and every fact with its version", (_, lesson) => {
    const { markdown, steps } = reviewPacket(lesson, factRegistry, today);
    const definitions = getStepDefinitions(lesson.id);
    expect(steps).toBe(definitions.length);
    definitions.forEach((step, index) => expect(markdown).toContain(`### Krok ${index + 1}: ${step.title}`));
    for (const id of definitions.flatMap((step) => step.blocks)) {
      for (const text of texts(lesson.blocks.find((block) => block.id === id))) expect(markdown).toContain(text);
    }
    const notices = lesson.blocks.flatMap((block) => block.type === "factNotice" ? block.factKeys.map((key) => resolveFact(key, today, factRegistry)) : []);
    for (const fact of [...prepareLessonFacts(lesson, factRegistry, { today, published: false }).facts, ...notices]) {
      expect(markdown).toContain(`| \`${factId(fact)}\` |`);
      if (isFactPending(fact)) expect(markdown).toContain(`[\`${factId(fact)}\` · ⚠`);
    }
    expect(markdown).not.toMatch(/\{\{|\}\}|⟦|⟧/);
  });

  it("covers the five concepts awaiting expert review and leaves them unpublished", () => {
    const awaiting = ["before-investing-emergency-fund", "before-investing-retirement-products", "before-investing-scams", "broker-platform-types", "taxes-filing-obligation"];
    expect(draftLessons.map((lesson) => lesson.id)).toEqual(expect.arrayContaining(awaiting));
    for (const lesson of draftLessons) {
      reviewPacket(lesson, factRegistry, today);
      expect(curriculumLessons.find((entry) => entry.id === lesson.id)?.status).toBe("planned");
    }
  });

  it("marks blocked facts in the tax concept inline", () => {
    const { markdown } = reviewPacket(draftLessons.find((lesson) => lesson.id === "taxes-filing-obligation")!, factRegistry, today);
    expect(markdown).toContain("3 roky [`dan.casovy_test_cp@2026-10-21` · ⚠ NEOVĚŘENO, BLOKOVÁNO]");
    expect(markdown).toMatch(/100\s000\sKč \[`dan.limit_100k@2026-10-21` · ověřeno 22\.\s10\.\s2026\]/);
  });
});
