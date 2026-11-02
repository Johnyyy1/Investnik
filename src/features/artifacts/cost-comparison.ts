import { z } from "zod";

/** The fictional Eva example from 2.2.5, in exact CZK minor units. No fund TER or spread is included. */
export const costComparisonSchema = z.strictObject({
  schemaVersion: z.literal(1),
  purchaseMinor: z.literal("250000"), purchasesPerYear: z.literal(12),
  eurCzk: z.literal("24.30"),
  a: z.strictObject({ orderBps: z.literal(0), minimumEurMinor: z.literal("0"), fxBps: z.literal(25), custodyMinor: z.literal("0"), annualMinor: z.literal("7500") }),
  b: z.strictObject({ orderBps: z.literal(10), minimumEurMinor: z.literal("150"), fxBps: z.literal(15), custodyMinor: z.literal("0"), annualMinor: z.literal("48240") }),
});
export const evaCostComparison = costComparisonSchema.parse({ schemaVersion: 1, purchaseMinor: "250000", purchasesPerYear: 12, eurCzk: "24.30",
  a: { orderBps: 0, minimumEurMinor: "0", fxBps: 25, custodyMinor: "0", annualMinor: "7500" },
  b: { orderBps: 10, minimumEurMinor: "150", fxBps: 15, custodyMinor: "0", annualMinor: "48240" },
});
