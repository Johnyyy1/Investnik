"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createShare, previewShare } from "@/features/sharing/actions";
import type { PublicPlan } from "@/features/sharing/domain";
import { PlanSummary } from "./plan-summary";

export function ShareControl({ artifactId, onCreated }: { artifactId: string; onCreated: () => void }) {
  const [preview, setPreview] = useState<PublicPlan>();
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>();
  const lock = useRef(false);
  const requestId = useRef<string | null>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  async function showPreview() {
    if (lock.current) return;
    lock.current = true; setPending(true); setError(undefined);
    try {
      const result = await previewShare({ artifactId });
      if (result.ok) { setPreview(result.preview); setConsent(false); requestAnimationFrame(() => previewHeading.current?.focus()); }
      else setError(result.message);
    } catch { setError("Náhled se nepodařilo načíst. Zkus to znovu."); }
    finally { lock.current = false; setPending(false); }
  }
  async function publish() {
    if (lock.current || !consent) return;
    lock.current = true; setPending(true); setError(undefined); setStatus(undefined);
    requestId.current ??= crypto.randomUUID();
    try {
      const result = await createShare({ artifactId, consent: true, requestId: requestId.current });
      if (!result.ok) { setError(result.message); return; }
      onCreated();
      setStatus(result.share.revoked ? "Tento odkaz už je zrušený. Pro nové sdílení potvrď náhled znovu." : "Veřejný odkaz a obrázek najdeš v přehledu Veřejné odkazy níže.");
      requestId.current = null; setConsent(false);
    } catch { setError("Odkaz se nepodařilo vytvořit. Zkus to znovu; stejný požadavek nevytvoří další odkaz."); }
    finally { lock.current = false; setPending(false); }
  }
  return <div className="mt-4 min-w-0 space-y-4">
    <Button variant="secondary" size="compact" disabled={pending} onClick={() => void showPreview()}>Náhled sdílení IPS</Button>
    {preview && <section aria-labelledby={`preview-${artifactId}`} className="min-w-0 space-y-4 rounded-surface bg-surface-muted p-5">
      <h4 id={`preview-${artifactId}`} ref={previewHeading} tabIndex={-1} className="font-semibold">Přesně tohle bude veřejné</h4>
      <PlanSummary plan={preview} />
      <p>Bez jména, částek, příjmů, výdajů, rezervy, instrumentů a tvých textových poznámek. Finanční check-up ani rozpočet nikdy nesdílíme. Odkaz může otevřít kdokoli; stažené kopie obrázku už nelze vzít zpět.</p>
      <label className="flex min-h-12 cursor-pointer items-start gap-3"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={pending} className="mt-1 size-5 shrink-0 accent-primary" /><span>Chci zveřejnit tento náhled jako odkaz a obrázek.</span></label>
      <Button loading={pending} disabled={!consent} onClick={() => void publish()}>Vytvořit veřejný odkaz</Button>
    </section>}
    {error && <p role="alert" className="text-danger-ink">{error}</p>}
    {status && <p role="status">{status}</p>}
  </div>;
}
