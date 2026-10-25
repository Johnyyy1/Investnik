"use client";

import { useState } from "react";
import { FigureDataLabel } from "@/components/learning/figure-data-label";
import { formatFactDate } from "@/features/facts/resolve";
import { spivaUsLargeCap as data } from "@/features/lessons/foundations/spiva-data";

const span = (years: number) => `${years} ${years === 1 ? "rok" : years < 5 ? "roky" : "let"}`;
const percent = (value: number) => `${Math.round(value)} %`;
const endYear = Number(data.asOf.slice(0, 4));

export function SpivaChart() {
  const [selected, setSelected] = useState<number>(data.underperforming[0].years);
  const row = data.underperforming.find((item) => item.years === selected)!;
  const period = row.years === 1 ? `V roce ${endYear}` : `V období ${endYear - row.years + 1}–${endYear} (${span(row.years)})`;
  return <section aria-label="Podíl aktivních fondů, které zaostaly za indexem" className="min-w-0 space-y-5">
    <FigureDataLabel data={{ kind: "historical", source: data.source, asOf: formatFactDate(data.asOf) }} />
    <p className="text-body text-secondary">{data.fundType} proti indexu {data.benchmark}. Výnos v USD bez úpravy o riziko; počítají se i fondy, které během období zanikly nebo se sloučily.</p>
    <div role="group" aria-label="Vyber horizont" className="space-y-2">
      {data.underperforming.map((item) => <button key={item.years} type="button" aria-pressed={item.years === selected} onClick={() => setSelected(item.years)}
        className={`grid min-h-11 w-full grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 rounded-control border px-3 py-2 text-left text-small transition-colors ${item.years === selected ? "border-primary bg-surface-muted font-semibold text-primary" : "border-border hover:bg-surface-muted"}`}>
        <span>{span(item.years)}</span>
        <span aria-hidden="true" className="h-3 rounded-full bg-surface-sunken"><span className="block h-full rounded-full bg-primary" style={{ width: `${item.percent}%` }} /></span>
        <span className="text-right tabular-nums">{percent(item.percent)}</span>
      </button>)}
    </div>
    <p aria-live="polite" className="text-body">{period} mělo nižší výnos než {data.benchmark} {percent(row.percent)} těchto fondů, zhruba {Math.round(row.percent / 10)} z 10.</p>
    <p className="text-body text-secondary">Čísla nerostou rovnoměrně, protože každý horizont pokrývá jiné období: jde o výsledek měření, ne o zákon. Z{data.survivorship.fundsAtStart} fondů, které existovaly na začátku {data.survivorship.years}letého období, jich do konce roku {endYear} přežilo jen {percent(data.survivorship.survivedPercent)}. Pro fondy prodávané v Evropě vydává S&P samostatnou zprávu SPIVA Europe. Minulé výsledky nezaručují budoucí.</p>
  </section>;
}
