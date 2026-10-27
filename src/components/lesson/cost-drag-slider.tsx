"use client";

import { useState } from "react";
import { FinanceSlider } from "@/components/learning/finance-slider";
import { CalculatorResult } from "@/components/learning/calculator-result";
import { MetricResult } from "@/components/learning/metric-result";
import { parseNumericAnswer } from "@/features/finance/numeric-input";
import { compareCostDrag, costDragDefaults } from "@/features/lessons/costs/cost-drag-model";

const fields = [
  { id: "monthly", label: "Měsíční vklad", mode: "number", min: 100, max: 100_000, step: 100, suffix: "Kč", hint: "Na začátku každého měsíce, 100 až 100 000 Kč." },
  { id: "years", label: "Doba investování", mode: "number", min: 1, max: 40, step: 1, suffix: "let", hint: "Celé roky od 1 do 40." },
  { id: "gross", label: "Hrubý výnos před náklady", mode: "percentage", min: -5, max: 12, step: 0.25, suffix: "% ročně", hint: "Tvůj předpoklad, ne předpověď ani historický průměr. Rozsah −5 až 12 %." },
  { id: "cost", label: "Celkové roční náklady", mode: "percentage", min: 0, max: 3, step: 0.05, suffix: "% ročně", hint: "Ročně z hodnoty investice, 0 až 3 %." },
] as const;
const money = (value: number) => `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Math.round(value) || 0)} Kč`;
const initial = Object.fromEntries(Object.entries(costDragDefaults).map(([id, value]) => [id, String(value).replace(".", ",")])) as Record<(typeof fields)[number]["id"], string>;

export function CostDragSlider() {
  const [draft, setDraft] = useState(initial);
  const values = fields.map(({ id }) => parseNumericAnswer(draft[id]));
  const valid = fields.map(({ min, max, id }, index) => Number.isFinite(values[index]) && values[index] >= min && values[index] <= max && (id !== "years" || Number.isInteger(values[index])));
  const result = valid.every(Boolean) ? compareCostDrag(values[0], values[1], values[2], values[3]) : null;
  return <section aria-label="Kalkulačka nákladů v čase" className="min-w-0 space-y-6">
    <p className="text-body text-secondary">Stejný plán s náklady a bez nich při stejném hrubém výnosu. Vstupy zůstávají jen v otevřeném kroku a neukládají se.</p>
    <div className="grid min-w-0 gap-6 sm:grid-cols-2">{fields.map((field, index) => <FinanceSlider key={field.id} label={field.label} mode={field.mode} suffix={field.suffix} value={draft[field.id]} onValueChange={(value) => setDraft((current) => ({ ...current, [field.id]: value }))} min={field.min} max={field.max} step={field.step} hint={field.hint} error={valid[index] ? undefined : field.id === "years" ? "Zadej celý počet let od 1 do 40." : `Zadej číslo od ${field.min} do ${field.max}.`} />)}</div>
    {result ? <CalculatorResult label="Výsledek kalkulačky nákladů v čase">
      <MetricResult label="Vloženo celkem" value={money(result.contributed)} />
      <MetricResult label="Konečná hodnota po nákladech" value={money(result.withCosts)} />
      <MetricResult label="Hodnota bez nákladů" value={money(result.withoutCosts)} />
      <MetricResult label="Náklady tě stály" value={money(result.costImpact)} />
    </CalculatorResult> : <p role="status" className="text-body text-secondary">Oprav vstupy; bez platných hodnot výsledek nezobrazujeme.</p>}
    <p className="text-body text-secondary">Modelový výpočet: čistý roční výnos zjednodušeně počítáme jako hrubý výnos minus celkové náklady, s měsíční sazbou (1 + čistý výnos)^(1/12) − 1. Bez daní a kolísání: skutečný výnos se každý rok liší. Výsledek není předpověď ani doporučení.</p>
  </section>;
}
