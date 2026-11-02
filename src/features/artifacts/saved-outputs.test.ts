import { describe, expect, it } from "vitest";
import { evaCostComparison, costComparisonSchema } from "./cost-comparison";
import { asEtfChecklist } from "./etf-checklist";
import { ipsSchema } from "@/features/ips/schema";
import { exampleIps } from "@/features/ips/test-fixtures";
import { draftFromPlan, planFromDraft } from "@/features/ips/presentation";
import type { LearnerArtifact } from "./schemas";

const id = "2febc313-313b-40ba-af9a-a93534e3cabf";
describe("saved module outputs", () => {
  it("stores the exact inputs and results of both fictional tariffs and rejects altered results", () => {
    const model = evaCostComparison;
    const amount = BigInt(model.purchaseMinor);
    const count = BigInt(model.purchasesPerYear);
    expect(BigInt(model.a.annualMinor)).toBe(amount * 25n / 10000n * count);
    expect(BigInt(model.b.annualMinor)).toBe((3645n + amount * 15n / 10000n) * count);
    expect(costComparisonSchema.safeParse({ ...model, b: { ...model.b, annualMinor: "48241" } }).success).toBe(false);
    expect(costComparisonSchema.safeParse({ ...model, broker: "Real broker" }).success).toBe(false);
  });
  it("projects old ETF checklist revisions losslessly without inferring fund facts", () => {
    const original: LearnerArtifact = { id, kind: "lesson_output", version: 7, sourceLessonId: "etfs-selection-checklist", createdAt: "2026-11-01T12:00:00Z", payload: { type: "checklist", blockId: "checklist", checkedItemIds: ["index", "ucits"] } };
    expect(asEtfChecklist(original)).toEqual({ ...original, kind: "etf_checklist", payload: { schemaVersion: 2, type: "selection_checklist", checkedItemIds: ["index", "ucits"] } });
    expect(original.kind).toBe("lesson_output");
    expect(asEtfChecklist({ ...original, sourceLessonId: "other" })).toBeNull();
    expect(asEtfChecklist({ ...original, payload: { ...original.payload, blockId: "other" } })).toBeNull();
  });
  it("preserves optional immutable references through IPS editing and accepts older plans", () => {
    expect(ipsSchema.parse(exampleIps)).toEqual(exampleIps);
    const plan = { ...exampleIps, costComparisonId: id, etfChecklistId: id };
    expect(planFromDraft({ ...draftFromPlan(plan), reason: plan.changeReason }, plan.signedAt)).toEqual(plan);
    expect(ipsSchema.safeParse({ ...plan, costComparisonId: "invalid" }).success).toBe(false);
  });
});
