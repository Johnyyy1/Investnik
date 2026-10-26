"use client";

import { useState } from "react";
import { FinanceSlider } from "@/components/learning/finance-slider";
import { CalculatorResult } from "@/components/learning/calculator-result";
import { MetricResult } from "@/components/learning/metric-result";
import { parseNumericAnswer } from "@/features/finance/numeric-input";
import { tradeCostBreakdown } from "@/features/finance/trade-cost-breakdown";
import { formatPracticeCapitalMinor } from "@/features/rewards/presentation";

const fields = [
  { id: "amount", label: "Objem obchodu ve středu kotace", min: 1, max: 1_000_000, suffix: "Kč" },
  { id: "fee", label: "Sazba poplatku", min: 0, max: 10, suffix: "%" },
  { id: "minimum", label: "Minimální poplatek", min: 0, max: 10_000, suffix: "Kč" },
  { id: "maximum", label: "Maximální poplatek", min: 0, max: 10_000, suffix: "Kč" },
  { id: "spread", label: "Celý spread", min: 0, max: 10, suffix: "%" },
] as const;

export function TradeCostBreakdown() {
  const [draft, setDraft] = useState({ amount: "3000", fee: "0,15", minimum: "60", maximum: "10000", spread: "0,10" });
  const values = fields.map(({ id }) => parseNumericAnswer(draft[id]));
  const errors = fields.map(({ min, max, id }, index) => !Number.isFinite(values[index]) || values[index] < min || values[index] > max
    ? `Zadej číslo od ${min} do ${max}.`
    : id === "fee" && Math.abs(values[index] * 100 - Math.round(values[index] * 100)) > 1e-8 ? "Sazbu zadej nejvýše na dvě desetinná místa."
    : id === "maximum" && values[index] < values[2] ? "Maximum musí být alespoň stejně vysoké jako minimum." : undefined);
  const result = errors.some(Boolean) ? null : tradeCostBreakdown(values[0], values[1], values[2], values[3], values[4]);
  return <section aria-label="Rozpad nákladů obchodu" className="min-w-0 space-y-6">
    <p className="text-body text-secondary">Nejdřív odhadni, jak změna částky ovlivní náklad v procentech. Pak změň vstup a porovnej výsledek.</p>
    <div className="grid min-w-0 gap-6 sm:grid-cols-2">{fields.map((field, index) => <FinanceSlider key={field.id} {...field} step={field.id === "fee" ? 0.01 : "any"} value={draft[field.id]} onValueChange={(value) => setDraft((previous) => ({ ...previous, [field.id]: value }))} error={errors[index]} />)}</div>
    {result ? <CalculatorResult label="Výsledek rozpadu nákladů obchodu">
      <MetricResult label="Poplatek po uplatnění minima a maxima" value={formatPracticeCapitalMinor(result.feeMinor)} />
      <MetricResult label="Polovina spreadu" value={formatPracticeCapitalMinor(result.spreadMinor)} />
      <MetricResult label="Náklad celkem" value={formatPracticeCapitalMinor(result.totalMinor)} />
      <MetricResult label="Náklad z objemu obchodu" value={`${new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.costPercent)} %`} />
    </CalculatorResult> : <p role="status" className="text-body text-secondary">Oprav vstupy; bez platných hodnot výsledek nezobrazujeme.</p>}
    <p className="text-body text-secondary">Fiktivní ceník, jeden nákup nebo prodej v Kč. Objem měříme ve středu kotace; spread je procento z tohoto středu. Poplatek a polovinu spreadu zaokrouhlujeme samostatně na haléře, poloviny nahoru. Spread je už součástí ceny provedení, nepřičítej ho k ní znovu. Bez konverze, daní a skluzu; budoucí cenu ani výnos model neodhaduje.</p>
  </section>;
}
