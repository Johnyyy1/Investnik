import type { FactVersion } from "./types";

const edition = {
  version: "2026-10-28", jurisdiction: "US", validFrom: "2026-10-28", validTo: undefined, period: "2015–2024 · Mind the Gap 2025 (historická edice)",
  legalBasis: "Výzkum Morningstar, nikoli právní pravidlo", verificationStatus: "primary", checkedAt: "2026-10-28", verifiedAt: "2026-10-28",
  owner: "Redakce — výzkum", nextReviewAt: "2027-04-28",
  sources: [{ title: "Morningstar · Mind the Gap 2025, s. 1–5, 18–21", url: "https://marketing.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" }],
  notes: "Ověřeno v originální zprávě. Jde výslovně o edici 2025, ne nejnovější vydání; údaje jsou zaokrouhlené.",
  research: { sample: "25 848 amerických otevřených fondů a ETF existujících na začátku roku 2015; celkem bez fondů fondů a komoditní kategorie, alokační kategorie včetně fondů fondů", period: "1. 1. 2015 – 31. 12. 2024", limitations: "Agregátní popis, nikoli kauzální důkaz chyb investora či účinku vzdělávání. I pravidelné příspěvky a rebalancing mohou vytvořit rozdíl; nelze jej automaticky přenést na jednotlivce v Česku." },
} satisfies Partial<FactVersion>;

export const behaviourGapFacts = [
  { ...edition, key: "morningstar.gap", label: "Morningstar 2025 · rozdíl výnosu fondu a investora", value: { amount: 1.2, unit: "p. b. ročně" } },
  { ...edition, key: "morningstar.investor_2025", label: "Morningstar 2025 · výnos průměrného investovaného dolaru", value: { amount: 7, unit: "% ročně" } },
  { ...edition, key: "morningstar.fund_2025", label: "Morningstar 2025 · souhrnný výnos fondů", value: { amount: 8.2, unit: "% ročně" } },
  { ...edition, key: "morningstar.flows_high_2025", label: "Morningstar 2025 · mezera u nejkolísavějších toků", value: { amount: 1.8, unit: "p. b. ročně" } },
  { ...edition, key: "morningstar.flows_low_2025", label: "Morningstar 2025 · mezera u nejstabilnějších toků", value: { amount: 0.8, unit: "p. b. ročně" } },
  { ...edition, key: "morningstar.allocation_2025", label: "Morningstar 2025 · zachycený podíl výnosu alokačních fondů", value: { amount: 97, unit: "%" } },
] as const satisfies readonly FactVersion[];
