/** Versioned checks are immutable once used: new criteria need a new mission ID. */
export type MissionDefinition = { id: string; lessonId: string; title: string } & (
  | { context: "personal"; check: "ips-etf-purchase-v1"; params: { minimumPurchases: 1 } }
  | { context: "personal"; check: "ips-etf-purchase-v2"; params: { minimumPurchases: 1; toleranceBps: 100 } }
  | { context: "scenario" | "training"; check: "diversification-rules-v1"; params: { model: "diversification-v1" } }
);

export const missions: readonly MissionDefinition[] = [
  // Keep the original reserved identity and evidence; 2.5.3 opts into the stricter v2 check.
  { id: "ips-etf-purchase-v1", lessonId: "first-practice-purchase", title: "Cvičný nákup ETF podle IPS", context: "personal", check: "ips-etf-purchase-v1", params: { minimumPurchases: 1 } },
  { id: "ips-etf-purchase-v2", lessonId: "first-plan-first-purchase", title: "První nákup nanečisto podle IPS", context: "personal", check: "ips-etf-purchase-v2", params: { minimumPurchases: 1, toleranceBps: 100 } },
  { id: "diversification-rules-v1", lessonId: "diversification-scenario", title: "Rozlož scénářové portfolio", context: "scenario", check: "diversification-rules-v1", params: { model: "diversification-v1" } },
  { id: "allocation-training-v1", lessonId: "foundations-portfolio", title: "Procvič rozložení portfolia", context: "training", check: "diversification-rules-v1", params: { model: "diversification-v1" } },
];

export function getMission(id: string, lessonId?: string) {
  const mission = missions.find((item) => item.id === id && (lessonId === undefined || item.lessonId === lessonId));
  if (!mission) throw new Error("Unknown mission or lesson.");
  return mission;
}
