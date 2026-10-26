import { expect, it } from "vitest";
import { acquisitionSource } from "./acquisition";
import { buildFunnelReport } from "./report";
it("permits only published guide sources and the aggregate share channel", () => {
  expect(acquisitionSource("seo:co-je-etf")).toBe("seo:co-je-etf");
  expect(acquisitionSource("share:investment-plan")).toBe("share:investment-plan");
  for (const input of [null, "seo:jak-funguje-dip", "https://example.com", "share:secret-token"]) expect(acquisitionSource(input)).toBeNull();
});
it("includes anonymous channel counts in the seven and thirty day report", () => {
  const report = buildFunnelReport({ learners: [], progress: [], visits: [], acquisition: [
    { day: "2026-10-26", source: "seo:co-je-etf", views: 3 },
    { day: "2026-10-01", source: "seo:co-je-etf", views: 5 },
    { day: "2026-09-01", source: "seo:co-je-etf", views: 99 },
  ] }, new Date("2026-10-26T12:00:00Z"));
  expect(report.acquisition.map((window) => window.sources[0].views)).toEqual([3, 8]);
});
