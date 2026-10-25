import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { curriculumLevels, milestones } from "@/features/learning/curriculum";
import { capstones, capstoneThresholds, milestoneRules } from "./registry";

describe("milestone and capstone registry", () => {
  it("defines one versioned capstone per milestone with a complete four-level rubric", () => {
    expect(milestoneRules.map((rule) => rule.id)).toEqual(Object.keys(milestones));
    expect(new Set(capstones.map((capstone) => capstone.id)).size).toBe(capstones.length);
    for (const rule of milestoneRules) {
      const capstone = capstones.find((candidate) => candidate.id === rule.capstoneId);
      expect(capstone?.milestone).toBe(rule.id);
      expect(capstone?.id).toMatch(/-v\d+$/);
      expect(new Set(capstone!.criteria.map((criterion) => criterion.id)).size).toBe(capstone!.criteria.length);
      for (const criterion of capstone!.criteria) expect(criterion.levels.every((text) => text.trim().length > 0)).toBe(true);
    }
  });

  it("references existing levels and earlier milestones only", () => {
    const levelIds = curriculumLevels.map((level) => level.id as string);
    milestoneRules.forEach((rule, index) => {
      expect(rule.levels.every((level) => levelIds.includes(level))).toBe(true);
      expect(rule.requires.every((id) => milestoneRules.slice(0, index).some((earlier) => earlier.id === id))).toBe(true);
    });
    // C is not a prerequisite for D; level 0 is recommended, so no milestone requires it.
    expect(milestoneRules.find((rule) => rule.id === "D")?.requires).toEqual(["B"]);
    expect(milestoneRules.some((rule) => (rule.levels as readonly string[]).includes("L0"))).toBe(false);
  });

  it("documents every capstone, criterion and threshold", () => {
    const docs = readFileSync("docs/milestones.md", "utf8");
    for (const capstone of capstones) {
      expect(docs).toContain(capstone.id);
      for (const criterion of capstone.criteria) expect(docs).toContain(criterion.title);
    }
    for (const name of Object.keys(capstoneThresholds)) expect(docs).toContain(name);
  });
});
