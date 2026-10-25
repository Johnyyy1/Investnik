/** Versioned research data for lesson 1.1.9, not a live feed. SPIVA U.S. Year-End 2025 (published 2. 3. 2026):
 * Report 1a, All Large-Cap Funds vs. S&P 500, absolute return; Report 2, 20-year survivorship of the same category.
 * The 1-year value backs the fact spiva.2025; review both together (semiannual, #133).
 */
export const spivaUsLargeCap = {
  version: "2025-12-31",
  source: "S&P Dow Jones Indices, SPIVA U.S. Year-End 2025",
  url: "https://www.spglobal.com/spdji/en/spiva/article/spiva-us-year-end-2025/",
  asOf: "2025-12-31",
  fundType: "Aktivní akciové fondy velkých amerických firem",
  benchmark: "S&P 500",
  underperforming: [
    { years: 1, percent: 78.78 },
    { years: 3, percent: 66.84 },
    { years: 5, percent: 88.96 },
    { years: 10, percent: 85.59 },
    { years: 15, percent: 89.93 },
    { years: 20, percent: 92.89 },
  ],
  survivorship: { years: 20, fundsAtStart: 760, survivedPercent: 34.61 },
} as const;
