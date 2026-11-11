import type { FactVersion } from "./types";

// Monthly index factsheets as at 2026-10-30, read in the original PDFs on 2026-11-11 (lesson 2.3.4, #179).
const msciWorld = { title: "MSCI World Index (USD) · factsheet k 30. 10. 2026", url: "https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb" };
const msciAcwi = { title: "MSCI ACWI Index (USD) · factsheet k 30. 10. 2026", url: "https://www.msci.com/documents/10199/a71b65b5-d0ea-4b5c-a709-24b1213bc3c5" };
const msciEm = { title: "MSCI Emerging Markets Index (USD) · factsheet k 30. 10. 2026", url: "https://www.msci.com/documents/10199/c0db0a48-01f2-4ba9-ad01-226fd5678111" };
const ftseAllWorld = { title: "FTSE All-World Index · factsheet k 30. 10. 2026", url: "https://research.ftserussell.com/Analytics/FactSheets/Home/DownloadSingleIssue?issueName=AWORLDS&IsManual=false" };

const edition = {
  version: "2026-10-30", jurisdiction: "Globální akciové indexy", validFrom: "2026-10-30", validTo: undefined, period: "Stav indexu k 30. 10. 2026 (měsíční factsheet)",
  legalBasis: "Údaj poskytovatele indexu, nikoli právní pravidlo ani investiční doporučení", verificationStatus: "primary", checkedAt: "2026-11-11", verifiedAt: "2026-11-11",
  owner: "Redakce — produkty a indexy", nextReviewAt: "2027-05-11",
} satisfies Partial<FactVersion>;

export const indexFactsheetFacts = [
  { ...edition, key: "trh.msci_world_usa", label: "MSCI World · váha USA", value: { amount: 72.77, unit: "%" }, sources: [msciWorld], notes: "Tabulka Country Weights. Index velkých a středních firem z 23 vyspělých trhů, 1 248 titulů. Váhy se mění měsíčně s cenami; jde o snímek k datu factsheetu." },
  { ...edition, key: "trh.msci_acwi_usa", label: "MSCI ACWI · váha USA", value: { amount: 64.63, unit: "%" }, sources: [msciAcwi], notes: "Tabulka Country Weights. Velké a střední firmy z 23 vyspělých a 24 rozvíjejících se trhů, 2 413 titulů. Česko je v seznamu rozvíjejících se trhů." },
  { ...edition, key: "trh.msci_acwi_em", label: "MSCI ACWI · váha rozvíjejících se trhů", value: { amount: 11.19, unit: "%" }, sources: [msciAcwi, msciEm, msciWorld], notes: "Factsheet podíl přímo neuvádí. Odvozeno ze stejného data: tržní hodnota MSCI Emerging Markets 11 288 377,65 mil. USD ÷ MSCI ACWI 100 900 111,81 mil. USD = 11,19 %; MSCI World (89 611 734,16) + EM dává přesně ACWI." },
  { ...edition, key: "trh.ftse_aw_usa", label: "FTSE All-World · váha USA", value: { amount: 62.7, unit: "%" }, sources: [ftseAllWorld], notes: "Tabulka Country/Market Breakdown, 483 titulů z 4 200. Index velkých a středních firem z vyspělých a rozvíjejících se trhů." },
  { ...edition, key: "trh.ftse_aw_em", label: "FTSE All-World · váha rozvíjejících se trhů", value: { amount: 9.59, unit: "%" }, sources: [ftseAllWorld], notes: "Index Characteristics: FTSE Emerging 9 958 510 mil. USD ÷ FTSE All-World 103 838 479 mil. USD = 9,59 %. Odvozený podíl, factsheet ho neuvádí přímo." },
  { ...edition, key: "trh.ftse_aw_cesko", label: "FTSE All-World · váha Česka", value: { amount: 0.01, unit: "%" }, sources: [ftseAllWorld], notes: "Tabulka Country/Market Breakdown: Czech Rep., 5 titulů, 15 068 mil. USD. Zaokrouhleno na setiny procenta." },
] as const satisfies readonly FactVersion[];
