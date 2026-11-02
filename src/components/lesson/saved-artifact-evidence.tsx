"use client";
import { useEffect, useState } from "react";
import { listArtifacts } from "@/features/artifacts/actions";
import type { ArtifactKind, LearnerArtifact } from "@/features/artifacts/schemas";
import { artifactLabels } from "@/features/artifacts/presentation";

export function SavedArtifactEvidence({ kind, guest }: { kind: ArtifactKind; guest?: boolean }) {
  const [artifacts, setArtifacts] = useState<LearnerArtifact[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (guest) return;
    let active = true;
    void listArtifacts({ kind }).then((result) => { if (active) { if (result.ok) setArtifacts(result.artifacts); else setError(true); } }, () => { if (active) setError(true); });
    return () => { active = false; };
  }, [kind, guest]);
  return <div className="space-y-3 text-sm text-secondary">
    {error && <p role="alert">Uložený podklad se nepodařilo načíst. Zkus obnovit stránku.</p>}
    {artifacts.map((artifact) => <details key={artifact.id}><summary className="min-h-12 cursor-pointer py-3">{artifactLabels[artifact.kind]} · verze {artifact.version}</summary>
      {artifact.kind === "cost_comparison" ? <p>Modelový příklad · 12 × 2 500 Kč ročně. Fiktivní tarif A: 75 Kč; B: 482,40 Kč. Bez TER a spreadu. Podklad pro vlastní sebehodnocení, ne ověření nákladů tvého plánu.</p> : artifact.kind === "etf_checklist" && "checkedItemIds" in artifact.payload ? <p>Vybrané oblasti k ověření: {artifact.payload.checkedItemIds.map((id) => ({ index: "Trh a index", ucits: "UCITS, domicil a KID", distribution: "Akumulace nebo distribuce", costs: "TER a tracking difference", size: "Velikost a stáří", replication: "Replikace", currency: "Měna a zajištění", broker: "Dostupnost a spread" })[id]).join(" · ") || "Zatím žádné"}. Jde o kontrolní seznam, ne o ověření konkrétního fondu.</p> : <p>Uložený checklist je dostupný v Nastavení → Moje data.</p>}
    </details>)}
  </div>;
}
