import { describe, expect, it } from "vitest";
import { guides } from "./content";
import { checkGuides, prepareGuide } from "./prepare";
import { factRegistry } from "@/features/facts/registry";
import sitemap from "@/app/sitemap";

const today = "2026-10-26";
describe("public guide publication", () => {
  it("publishes four guides with resolved answers and live lesson destinations", () => {
    expect(() => checkGuides(today)).not.toThrow();
    const published = guides.filter((guide) => guide.status === "available");
    expect(published).toHaveLength(4);
    for (const guide of published) {
      const result = prepareGuide(guide, today);
      expect(JSON.stringify(result.lesson)).not.toContain("{{");
      expect(result.target).toBeDefined();
      expect(result.notice?.verifiedAt).toBe(today);
      expect(result.facts.length).toBeGreaterThan(0);
      expect(sitemap().some((row) => row.url.endsWith(`/pruvodce/${guide.slug}`))).toBe(true);
    }
  });
  it("blocks publishing every tax/regulatory draft without review", () => {
    for (const guide of guides.filter((item) => item.status === "planned")) {
      expect(() => prepareGuide(guide, today)).not.toThrow();
      expect(() => prepareGuide({ ...guide, status: "available" }, today)).toThrow(/blocked|Unverified|expert review/);
      expect(sitemap().some((row) => row.url.endsWith(`/pruvodce/${guide.slug}`))).toBe(false);
    }
  });
  it("rejects missing, malformed, expired and unverified references, including drafts", () => {
    const guide = guides[0];
    expect(() => prepareGuide({ ...guide, answer: "{{absent.fact}}" }, today)).toThrow();
    expect(() => prepareGuide({ ...guide, answer: "{{plan.rozpocet}" }, today)).toThrow();
    const registry = factRegistry.map((fact) => fact.key === "plan.rozpocet" ? { ...fact, validTo: "2026-10-26" } : fact);
    expect(() => prepareGuide(guide, "2026-10-27", registry)).toThrow();
    expect(() => prepareGuide(guide, today, factRegistry.map((fact) => fact.key === "plan.rozpocet" ? { ...fact, verificationStatus: "unverified", verifiedAt: null } : fact))).toThrow();
  });
  it("requires exact reviewed fact versions and a published lesson", () => {
    const guide = { ...guides[0], kind: "regulatory" as const };
    const approval = { lessonId: guide.id, role: "Expert", reviewedAt: today, decision: "approved" as const, facts: ["plan.rozpocet@2026-10-26"] };
    expect(() => prepareGuide(guide, today, factRegistry, [approval])).not.toThrow();
    expect(() => prepareGuide(guide, today, factRegistry, [{ ...approval, facts: [] }])).toThrow(/versions/);
    expect(() => prepareGuide({ ...guides[0], lessonId: "planned" }, today)).toThrow(/published destination/);
  });
});
