"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { listShares, revokeShare } from "@/features/sharing/actions";
import type { OwnedShare } from "@/features/sharing/domain";
export function ShareHistory() {
  const heading = useRef<HTMLHeadingElement>(null);
  const [shares, setShares] = useState<OwnedShare[]>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  async function load() {
    try { const result = await listShares(); if (result.ok) { setShares(result.shares); setError(undefined); } else setError(result.message); }
    catch { setError("Sdílení se nepodařilo načíst. Zkus to znovu."); }
  }
  useEffect(() => {
    let active = true;
    void listShares().then((result) => { if (active) { if (result.ok) setShares(result.shares); else setError(result.message); } }, () => { if (active) setError("Sdílení se nepodařilo načíst. Zkus to znovu."); });
    return () => { active = false; };
  }, []);
  async function revoke(token: string) {
    setPending(true); setError(undefined);
    try {
      const result = await revokeShare({ token });
      if (result.ok) { setShares((rows) => rows?.map((row) => row.token === token ? { ...row, revokedAt: new Date().toISOString() } : row)); setMessage("Odkaz je zrušený."); requestAnimationFrame(() => heading.current?.focus()); }
      else setError(result.message);
    } catch { setError("Zrušení se nepodařilo. Zkus to znovu."); }
    finally { setPending(false); }
  }
  return <section className="mt-8 min-w-0 space-y-4" aria-labelledby="shared-history-title"><h2 ref={heading} tabIndex={-1} id="shared-history-title" className="text-title font-semibold">Veřejné odkazy</h2>
    <p>Tady zrušíš i odkaz na starší verzi IPS. Zrušená stránka i obrázek vrací 404; stažené kopie tím nezmizí.</p>
    {shares?.length === 0 && <p>Žádný výstup nesdílíš.</p>}
    {shares === undefined && !error && <p role="status">Načítám odkazy…</p>}
    <ul className="divide-y divide-divider">{shares?.map((share) => <li key={share.token} className="min-w-0 space-y-3 py-4">
      <p>IPS · verze {share.version} · {share.revokedAt ? "zrušený" : "veřejný"}</p>
      {!share.revokedAt && <>
        <label className="block min-w-0 space-y-2"><span>Veřejný odkaz na verzi {share.version}</span><Input readOnly value={`${typeof window === "undefined" ? "" : window.location.origin}/sdileni/${share.token}`} onFocus={(event) => event.currentTarget.select()} /></label>
        <div className="flex flex-wrap items-center gap-4"><Link className="inline-flex min-h-12 items-center text-primary underline" href={`/sdileni/${share.token}`} prefetch={false}>Otevřít veřejnou stránku</Link><a className="inline-flex min-h-12 items-center text-primary underline" href={`/sdileni/${share.token}/obrazek`} download="investi-muj-plan.png">Stáhnout obrázek</a><Button variant="dangerQuiet" size="compact" disabled={pending} onClick={() => void revoke(share.token)}>Zrušit odkaz na verzi {share.version}</Button></div>
      </>}
    </li>)}</ul>
    {error && <div><p role="alert" className="text-danger-ink">{error}</p><Button variant="secondary" size="compact" onClick={() => void load()}>Načíst odkazy znovu</Button></div>}
    {message && <p role="status">{message}</p>}
  </section>;
}
