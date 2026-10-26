"use client";

import { useState } from "react";
import { Input } from "@/components/ui/form-controls";
import { FinanceInput } from "@/components/learning/finance-input";
import { ArtifactSaveControl } from "./artifact-save-control";
import { tradeFeeMinor } from "@/features/portfolio/costs";
import { formatPracticeCapitalMinor } from "@/features/rewards/presentation";
import { defaultFeeProfileDraft, feeProfileFromDraft, FEE_SCHEDULE_LESSON_ID, type FeeProfileDraft } from "@/features/lessons/broker-and-account/fee-schedule-model";

const fields = [
  { id: "rate", label: "Poplatek za obchod", suffix: "%", hint: "Procento z částky nákupu." },
  { id: "minimum", label: "Minimální poplatek", suffix: "Kč", hint: "Zaplatíš ho, i když procento vyjde méně." },
  { id: "maximum", label: "Maximální poplatek", suffix: "Kč", hint: "Strop poplatku u velkých nákupů." },
  { id: "fx", label: "Přirážka ke směně měny", suffix: "%", hint: "Z částky, kterou broker směňuje." },
  { id: "custody", label: "Úschova ročně", suffix: "%", hint: "Z hodnoty majetku nad hranicí zdarma." },
  { id: "custodyFreeUpTo", label: "Úschova zdarma do", suffix: "Kč", hint: "Hodnota majetku, do které úschovu neplatíš." },
] as const;
const previewAmounts = [200_000n, 5_000_000n, 50_000_000n];

/** Optional output: continuing never requires a saved profile; the lesson's fictional tariff is the default. */
export function FeeProfileForm({ guest = false }: { guest?: boolean }) {
  const [draft, setDraft] = useState<FeeProfileDraft>(defaultFeeProfileDraft);
  let payload;
  let validation;
  try { payload = feeProfileFromDraft(draft); }
  catch (reason) { validation = reason instanceof Error ? reason.message : "Zkontroluj hodnoty."; }
  const fee = payload && { rateBps: payload.orderFeeBasisPoints, minMinor: BigInt(payload.minimumOrderFeeMinor), maxMinor: BigInt(payload.maximumOrderFeeMinor ?? payload.minimumOrderFeeMinor) };
  return <section aria-label="Profil poplatků" className="min-w-0 space-y-6">
    <p className="text-body text-secondary">Formulář je předvyplněný fiktivním ceníkem z lekce. Můžeš ho nechat, nebo přepsat hodnotami z ceníku, který právě čteš. Uložení je dobrovolné; pokračovat můžeš i bez něj.</p>
    <label className="block space-y-2"><span className="text-small font-bold">Název profilu</span><Input value={draft.label} maxLength={160} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} /></label>
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      {fields.map((field) => <FinanceInput key={field.id} label={field.label} mode={field.suffix === "%" ? "percentage" : "currency"} suffix={field.suffix} hint={field.hint} value={draft[field.id]} onValueChange={(value) => setDraft((current) => ({ ...current, [field.id]: value }))} />)}
    </div>
    {fee ? <div aria-live="polite" className="space-y-2">
      <h4 className="font-semibold">Poplatek za obchod podle profilu</h4>
      <ul className="space-y-2">{previewAmounts.map((amount) => {
        const value = tradeFeeMinor(fee, amount);
        return <li key={amount} className="border-t border-divider pt-2 tabular-nums">Nákup za {formatPracticeCapitalMinor(amount)}: {formatPracticeCapitalMinor(value)} ({new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 }).format(Number(value) / Number(amount) * 100)} % z nákupu)</li>;
      })}</ul>
      <p className="text-small text-secondary">Modelový výpočet bez směny měny, spreadu a úschovy.</p>
    </div> : <p role="status" className="text-small text-secondary">{validation}</p>}
    {payload && <ArtifactSaveControl key={JSON.stringify(payload)} guest={guest} content={{ kind: "fee_profile", payload }} sourceLessonId={FEE_SCHEDULE_LESSON_ID} />}
    <p className="text-small text-secondary">Profil se uloží mezi tvé výstupy. Portfolio Lab počítá s vlastními fiktivními ceníky; tvůj profil nákupy v Labu nemění. Všechny verze profilu lze smazat v <a className="underline underline-offset-4" href="/settings" target="_blank" rel="noopener noreferrer">Nastavení → Moje data (nová karta)</a>.</p>
  </section>;
}
