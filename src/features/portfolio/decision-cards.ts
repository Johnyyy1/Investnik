import { OVERFITTING_NOTICE_AT } from "@/features/backtesting/attempts";
import { ipsSchema } from "@/features/ips/schema";
import { SAFEGUARD_SET_BLOCK_ID, SAFEGUARD_SET_LESSON_ID, safeguardSet } from "@/features/lessons/investor-behaviour/safeguard-set";
import type { TradeSide } from "./domain";

/** Decision-time cards: deterministic rules over a planned action. A card informs and never blocks it. */
export type DecisionCardKind = "outside-ips" | "disposition" | "turnover" | "overfitting";

/** Copy and the lesson each card links to; `lessonLink` hides the link until that lesson is published. */
export const DECISION_CARDS: Record<DecisionCardKind, { title: string; body: string; lessonId: string }> = {
  "outside-ips": {
    title: "Tento nákup není ve tvém plánu",
    body: "Mix v tvém investičním plánu tento instrument neobsahuje. Pokud jde o změnu plánu, zapiš si nejdřív důvod. Nákup tím není zakázaný.",
    lessonId: "before-investing-goals",
  },
  disposition: {
    title: "Prodáváš pozici v zisku a ztrátové držíš",
    body: "Častý vzorec je prodávat vítěze a čekat, až se ztrátové pozice vrátí. Rozhoduj podle plánu a dnešního pohledu na každou pozici, ne podle nákupní ceny. Jeden prodej sám chybu neprokazuje.",
    lessonId: "behaviour-disposition-effect",
  },
  turnover: {
    title: "Pět a více obchodů za posledních 7 dní",
    body: "Každý obchod stojí poplatek a konverzi a časté změny vzdalují portfolio od plánu. Zkontroluj, jestli tenhle obchod plán opravdu potřebuje.",
    lessonId: "behaviour-overconfidence",
  },
  overfitting: {
    title: "Pět a více různých pokusů pro jeden cíl",
    body: "Výběr nejlepšího minulého výsledku může zachytit náhodu. Před dalším pokusem si zapiš pravidlo a ověř ho na datech, která nesloužila k jeho ladění. Počet pokusů sám neprokazuje chybu.",
    lessonId: "correlation-not-causation",
  },
};

export const TURNOVER_CARD_TRADES = 5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface TradeCardInput {
  side: TradeSide;
  instrumentId: string;
  now: Date;
  /** Executed trades of the active generation. */
  trades: readonly { executedAt: Date }[];
  /** Unrealized gain per holding; null while its valuation is unavailable. */
  holdings: readonly { instrumentId: string; gainLossMinor: bigint | null }[];
  /** Latest saved investment plan payload, if any. */
  ips: unknown;
}

/** Applicable cards in display priority. A missing valuation or plan yields no card, never a failure. */
export function tradeDecisionCards(input: TradeCardInput): DecisionCardKind[] {
  const cards: DecisionCardKind[] = [];
  const plan = ipsSchema.safeParse(input.ips);
  // Asset-class plans cannot be matched to one instrument without guessing its class.
  const planned = plan.success && plan.data.allocation.lines.every((line) => "instrumentId" in line)
    ? plan.data.allocation.lines.map((line) => "instrumentId" in line ? line.instrumentId : "") : null;
  if (input.side === "BUY" && planned && !planned.includes(input.instrumentId)) cards.push("outside-ips");
  const sold = input.holdings.find(({ instrumentId }) => instrumentId === input.instrumentId);
  if (input.side === "SELL" && sold?.gainLossMinor != null && sold.gainLossMinor > 0n
    && input.holdings.some(({ instrumentId, gainLossMinor }) => instrumentId !== input.instrumentId && gainLossMinor != null && gainLossMinor < 0n)) cards.push("disposition");
  const now = input.now.getTime();
  const recent = input.trades.filter(({ executedAt }) => executedAt.getTime() > now - WEEK_MS && executedAt.getTime() <= now).length;
  if (recent + 1 >= TURNOVER_CARD_TRADES) cards.push("turnover");
  return cards;
}

export function backtestDecisionCards(attemptsForGoal: number): DecisionCardKind[] {
  return attemptsForGoal >= OVERFITTING_NOTICE_AT ? ["overfitting"] : [];
}

/** A learner-written rule from the saved safeguards output (#127). `cards` limits a lesson rule to the cards it belongs to. */
export interface Safeguard { trigger: string; action: string; cards?: DecisionCardKind[] }

/**
 * Rules for the cards: the learner's own safeguards document, then the B.1.9 set they checked and saved.
 * Unknown IDs (a malformed or legacy row) are skipped rather than failing the trade review.
 */
export function savedSafeguards(rules: readonly { trigger: string; action: string }[], lessonOutputs: readonly unknown[]): Safeguard[] {
  const set = lessonOutputs.find((output): output is { sourceLessonId: string; payload: { type: "checklist"; blockId: string; checkedItemIds: string[] } } => {
    const candidate = output as { kind?: string; sourceLessonId?: string; payload?: { type?: string; blockId?: string; checkedItemIds?: unknown } };
    return candidate.kind === "lesson_output" && candidate.sourceLessonId === SAFEGUARD_SET_LESSON_ID && candidate.payload?.type === "checklist"
      && candidate.payload.blockId === SAFEGUARD_SET_BLOCK_ID && Array.isArray(candidate.payload.checkedItemIds);
  });
  const checked = set ? safeguardSet.filter(({ id }) => set.payload.checkedItemIds.includes(id)) : [];
  return [...rules.map(({ trigger, action }) => ({ trigger, action })), ...checked.map(({ trigger, action, cards }) => ({ trigger, action, cards: [...cards] }))];
}

/** The rules shown on one card: every own rule, and lesson rules that belong to this kind. */
export function safeguardsForCard(kind: DecisionCardKind, safeguards: readonly Safeguard[]): Safeguard[] {
  return safeguards.filter((rule) => !rule.cards || rule.cards.includes(kind));
}

export interface DecisionCardPreferences { disabled: DecisionCardKind[]; shownAt: Partial<Record<DecisionCardKind, number>> }
export const DECISION_CARD_PREFERENCES_KEY = "investi:decision-cards:v1";
export const DECISION_CARD_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const kinds = Object.keys(DECISION_CARDS) as DecisionCardKind[];

export function readDecisionCardPreferences(value: string | null): DecisionCardPreferences {
  try {
    const parsed = JSON.parse(value ?? "{}") as Partial<DecisionCardPreferences>;
    const shownAt = Object.fromEntries(Object.entries(parsed.shownAt ?? {}).filter(([kind, at]) => kinds.includes(kind as DecisionCardKind) && Number.isFinite(at)));
    return { disabled: (parsed.disabled ?? []).filter((kind) => kinds.includes(kind)), shownAt };
  } catch {
    return { disabled: [], shownAt: {} };
  }
}

/** At most one card per action: the first candidate the learner has not turned off or seen within the cooldown. */
export function pickDecisionCard(candidates: readonly DecisionCardKind[], preferences: DecisionCardPreferences, now: number): DecisionCardKind | null {
  return candidates.find((kind) => !preferences.disabled.includes(kind) && now - (preferences.shownAt[kind] ?? -Infinity) >= DECISION_CARD_COOLDOWN_MS) ?? null;
}
