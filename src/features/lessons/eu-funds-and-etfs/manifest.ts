export const EU_FUNDS_AND_ETFS_MODULE_ID = "module-eu-funds-and-etfs";

export const euFundsAndEtfsLessons = [
  { id: "etfs-selection-checklist", slug: "etf-selection-checklist", title: "Checklist výběru ETF", summary: "Projdi tři podobně pojmenované ETF podle osmi kritérií, vyřaď past a ulož si checklist pro vlastní výběr.", estimatedMinutes: 14, status: "available" as const },
  // Appended after 2.3.6 in storage order so an existing learner's next step does not move.
  { id: "etfs-replication-and-indexes", slug: "replication-and-indexes", title: "Replikace a hlavní globální indexy", summary: "Rozliš fyzickou, výběrovou a syntetickou replikaci a porovnej MSCI World, ACWI, ACWI IMI a FTSE All-World podle trhů a vah.", estimatedMinutes: 12, status: "available" as const },
] as const;
