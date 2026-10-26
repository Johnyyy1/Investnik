export const BROKER_AND_ACCOUNT_MODULE_ID = "module-broker-and-account";

export const brokerAndAccountLessons = [
  { id: "broker-platform-types", slug: "platform-types", title: "Typy investičních platforem", summary: "Rozliš brokera, správu portfolia, fondovou nabídku a penzijní společnost podle toho, kdo rozhoduje, co vlastníš a co platíš.", estimatedMinutes: 11, status: "planned" as const },
  { id: "broker-fee-schedule", slug: "reading-a-fee-schedule", title: "Jak číst ceník brokera", summary: "Najdi v ceníku poplatek za obchod s minimem a maximem, měnovou konverzi a úschovu a spočítej, kolik zaplatíš za svůj nákup.", estimatedMinutes: 12, status: "available" as const },
] as const;
