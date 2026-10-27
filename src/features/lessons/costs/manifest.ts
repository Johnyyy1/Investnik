export const COSTS_MODULE_ID = "module-costs";

export const costsLessons = [
  { id: "costs-ter-tracking-difference", slug: "ter-and-tracking-difference", title: "TER a rozdíl ve výkonnosti vůči indexu", summary: "Porovnej dvě ETF na stejný index podle skutečného výsledku, ne jen podle nákladovosti.", estimatedMinutes: 11, status: "available" as const },
  { id: "costs-spread-and-fees", slug: "spread-and-trading-fees", title: "Spread a transakční poplatek", summary: "Spočítej náklad obchodu v Kč i procentech a porovnej frekvenci nákupů s minimálním poplatkem.", estimatedMinutes: 11, status: "available" as const },
  { id: "costs-currency-conversion", slug: "currency-conversion", title: "Měnová konverze a měnové riziko", summary: "Spočítej náklad převodu korun na eura a zjisti, proč měnové riziko neurčuje měna, ve které se ETF obchoduje.", estimatedMinutes: 12, status: "available" as const },
  { id: "costs-over-30-years", slug: "costs-over-30-years", title: "Náklady za 30 let", summary: "Spočítej, kolik z pravidelné investice vezmou roční náklady za 30 let, a porovnej strategii s náklady a bez nich v Backtesting Labu.", estimatedMinutes: 12, status: "available" as const },
  { id: "costs-broker-comparison", slug: "compare-two-brokers", title: "Kontrola: srovnej dva brokery pro svůj plán", summary: "Sestav roční náklady svého plánu u dvou fiktivních brokerů, zjisti, co rozhoduje, a volbu zdůvodni.", estimatedMinutes: 14, status: "available" as const },
] as const;
