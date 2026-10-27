"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { IpsSummary } from "@/components/ips/ips-summary";
import { listArtifacts } from "@/features/artifacts/actions";
import type { LearnerArtifact } from "@/features/artifacts/schemas";
import { ipsDate } from "@/features/ips/presentation";

type PlanArtifact = Extract<LearnerArtifact, { kind: "investment_plan" }>;

/** The plan is written in the Lab's own builder; this step only reads the current version. The server rechecks it on Continue. */
export function IpsPlanCheck({ guest = false, onReady }: { guest?: boolean; onReady?: (blockId: string, ready: boolean) => void }) {
  const [plan, setPlan] = useState<PlanArtifact | null>();
  const [error, setError] = useState<string>();
  const load = useCallback(() => {
    void listArtifacts({ kind: "investment_plan" }).then((result) => {
      if (!result.ok) { setError(result.message); return; }
      const current = result.artifacts.find((artifact): artifact is PlanArtifact => artifact.kind === "investment_plan") ?? null;
      setPlan(current); setError(undefined);
      // Only schema v2 has all nine sections; an original plan must be completed as a new version.
      onReady?.("builder", !!current && "schemaVersion" in current.payload);
    }, () => setError("Plán se nepodařilo načíst. Zkus to znovu."));
  }, [onReady]);
  useEffect(() => {
    if (guest) return;
    load();
    // Returning from the builder tab rechecks the saved version.
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [guest, load]);

  if (guest) return <div className="space-y-4"><p>Pro uložení investičního plánu si nejdřív ulož účet. Pak se vrať k tomuto kroku.</p><ButtonLink href="/onboarding/save">Uložit účet</ButtonLink></div>;
  if (plan === undefined && !error) return <p role="status">Načítám tvůj investiční plán…</p>;
  const complete = !!plan && "schemaVersion" in plan.payload;
  return <section aria-label="Stav investičního plánu" className="min-w-0 space-y-4">
    <p role="status">{error ?? (complete ? `Plán je uložený: verze ${plan.version} z ${ipsDate(plan.createdAt)}. Můžeš pokračovat.`
      : plan ? "Máš uložený původní plán bez všech devíti částí. Doplň ho v nástroji a ulož novou verzi."
      : "Zatím nemáš uložený investiční plán.")}</p>
    {complete && <details><summary className="min-h-12 cursor-pointer py-3 font-semibold">Zobrazit uložený plán</summary><IpsSummary plan={plan.payload} /></details>}
    <div className="flex flex-wrap gap-3">
      <ButtonLink href="/lab/plan" target="_blank" rel="noopener noreferrer" variant={complete ? "secondary" : "primary"}>{complete ? "Upravit plán (nová karta)" : "Sepsat plán (nová karta)"}</ButtonLink>
      <Button variant="ghost" onClick={load}>Zkontrolovat uložený plán</Button>
    </div>
  </section>;
}
