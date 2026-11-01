import type { DecisionCardKind } from "@/features/portfolio/decision-cards";

/** B.1.9 (#294): the lesson that saves the learner's set of safeguards and the checklist block that holds it. */
export const SAFEGUARD_SET_LESSON_ID = "behaviour-debiasing-tools";
export const SAFEGUARD_SET_BLOCK_ID = "safeguard-set";

/**
 * The six safeguards of module B.1, one per mistake. The checklist stores only the checked IDs; the Lab turns them
 * back into rules and shows each one on the decision-time cards it belongs to (#141).
 * Item IDs are part of saved outputs: never rename or reuse them.
 */
export const safeguardSet = [
  { id: "plan", mistake: "Mezera chování", trigger: "Propad trhu nebo chuť změnit plán", action: "Držím se IPS a automatické pravidelné investice. Plán měním jen při plánované kontrole.", cards: ["outside-ips"] },
  { id: "checklist", mistake: "Přehnaná sebedůvěra", trigger: "Obchod mimo plán", action: "Projdu checklist před obchodem a ověřím, že se obchod vejde do ročního rozpočtu obratu.", cards: ["turnover", "outside-ips"] },
  { id: "rebalance", mistake: "Dispoziční efekt", trigger: "Prodej", action: "Prodávám podle cílové alokace v IPS (vyvažování), ne podle nákupní ceny.", cards: ["disposition"] },
  { id: "review", mistake: "Krátkozrakost", trigger: "Chuť se podívat na ceny", action: "Výsledek portfolia hodnotím jen v termínu kontroly zapsaném v IPS.", cards: ["turnover"] },
  { id: "watchlist", mistake: "FOMO", trigger: "Tip ze zpráv nebo od známých", action: "Zapíšu si ho na odložený seznam a rozhodnu se nejdřív za 30 dní.", cards: ["outside-ips", "turnover"] },
  { id: "mechanism", mistake: "Příběhy", trigger: "Přesvědčivý příběh nebo graf", action: "Zeptám se: jaký je mechanismus a co by tvrzení vyvrátilo?", cards: ["overfitting", "outside-ips"] },
] as const satisfies readonly { id: string; mistake: string; trigger: string; action: string; cards: readonly DecisionCardKind[] }[];
