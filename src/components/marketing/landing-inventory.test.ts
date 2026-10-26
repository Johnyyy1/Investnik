import { describe, expect, it } from "vitest";
import { lessonPlacements } from "@/features/learning/curriculum";
import { authoredLessons, draftLessons } from "@/features/lessons/registry";

// The landing page labels these as „připravujeme“. When one is published, update pen-landing.tsx and this list.
const published = new Set(authoredLessons.map((lesson) => lesson.id));
const placed = (prefix: string) => lessonPlacements.filter((placement) => placement.displayModule.startsWith(prefix)).map((placement) => placement.lessonId);

describe("landing page inventory", () => {
  it("publishes only the fee-schedule and TER lessons in level 2", () => {
    expect(placed("2.").filter((id) => published.has(id))).toEqual(["broker-fee-schedule", "costs-ter-tracking-difference"]);
  });

  it("still lists the reserve, pension, scams and foundations checkpoint lessons as drafts", () => {
    const drafts = new Set<string>(draftLessons.map((lesson) => lesson.id));
    for (const id of ["before-investing-emergency-fund", "before-investing-retirement-products", "before-investing-scams", "foundations-checkpoint"]) {
      expect(drafts.has(id)).toBe(true);
      expect(published.has(id)).toBe(false);
    }
  });

  it("has the level 0 lessons it calls available published", () => {
    for (const id of ["before-investing-budget", "before-investing-debt", "before-investing-goals", "before-investing-checkup"]) expect(published.has(id)).toBe(true);
  });
});
