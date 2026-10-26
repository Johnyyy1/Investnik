import { describe, expect, it } from "vitest";
import { artifactExamples } from "@/features/artifacts/test-fixtures";
import { exampleIps } from "@/features/ips/test-fixtures";
import { createShareSchema, publicPlanSummary, shareTokenSchema } from "./domain";

describe("public projection v1", () => {
  it("whitelists enum descriptions and never publishes text, money, foundation, goals or instruments", () => {
    const secret = "PRIVATE-DO-NOT-PUBLISH";
    const content = { kind: "investment_plan", payload: { ...exampleIps,
      platform: secret, instruments: [secret], changeReason: secret,
      contribution: { amountMinor: "123456789", dayOfMonth: 12 },
      goals: exampleIps.goals.map((goal) => ({ ...goal, label: secret })),
      drawdownRule: { action: "keep_plan", text: secret },
    } };
    const summary = publicPlanSummary(content);
    expect(summary).toEqual({ review: "Plán kontroluji čtvrtletně.", rebalancing: "Mix upravuji podle předem zvoleného pásma.", crisis: "Při poklesu se držím plánu." });
    for (const forbidden of [secret, "123456789", "foundation", "goals", "amountMinor", "instrument", "reserve", "income", "expenses"]) expect(JSON.stringify(summary)).not.toContain(forbidden);
  });
  it("keeps legacy IPS safe and rejects every other artifact, unknown versions and corrupt data", () => {
    expect(publicPlanSummary({ kind: "investment_plan", payload: artifactExamples.investment_plan })).toEqual({ review: "Plán kontroluji ročně." });
    for (const [kind, payload] of Object.entries(artifactExamples)) if (kind !== "investment_plan") expect(publicPlanSummary({ kind, payload })).toBeNull();
    expect(publicPlanSummary({ kind: "investment_plan", payload: exampleIps }, 2)).toBeNull();
    expect(publicPlanSummary({ kind: "investment_plan", payload: { ...exampleIps, income: "secret" } })).toBeNull();
  });
  it("requires consent, UUIDs and an opaque token without accepting owner or payload fields", () => {
    const request = { artifactId: crypto.randomUUID(), requestId: crypto.randomUUID(), consent: true };
    expect(createShareSchema.safeParse(request).success).toBe(true);
    for (const patch of [{ consent: false }, { userId: "victim" }, { payload: {} }, { artifactId: "bad" }]) expect(createShareSchema.safeParse({ ...request, ...patch }).success).toBe(false);
    expect(shareTokenSchema.safeParse("a".repeat(32)).success).toBe(true);
    for (const bad of ["../secret", "a".repeat(31), "a".repeat(33)]) expect(shareTokenSchema.safeParse(bad).success).toBe(false);
  });
});
