"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { learnScenarios } from "./scenario-list";
import { prototypeVariants } from "./variants";

// Deliberately outside the design system (no tokens, system font) so it never reads as part of the page being judged.
const bar: React.CSSProperties = { alignItems: "center", gap: 10, padding: "6px 6px 6px 14px", borderRadius: 999, background: "rgb(20 20 20 / 0.94)", boxShadow: "0 8px 24px rgb(0 0 0 / 0.25)", color: "rgb(255 255 255 / 0.6)", font: "13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
// Fixed and last in the DOM, so the shell's skip link stays the first stop; phones keep it above the tab bar.
const placement = ".lv-picker{position:fixed;z-index:60;right:16px;bottom:16px}@media (max-width:1023px){.lv-picker{bottom:calc(96px + env(safe-area-inset-bottom))}.lv-picker-hint{display:none}}";
const select: React.CSSProperties = { all: "unset", boxSizing: "border-box", padding: "8px 32px 8px 14px", borderRadius: 999, background: "rgb(255 255 255 / 0.1)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.14)", color: "rgb(255 255 255)", fontWeight: 500, cursor: "pointer" };

/** The picker spec, adapted: each variant is its own route, so the path (not `__variant`) is the source of truth.
 * ←/→ step through variants (↑/↓ keep scrolling the page); 1–6 pick a learner state on D; H hides the control for screenshots. */
export function VariantPicker({ active, scenario }: { active: string; scenario?: string }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "h" || event.key === "H") return setHidden((value) => !value);
      const state = scenario && learnScenarios[Number(event.key) - 1];
      if (state) { event.preventDefault(); return router.push(`/dev/learn-variants/d?stav=${state.id}`, { scroll: false }); }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const index = prototypeVariants.findIndex((variant) => variant.id === active);
      const next = prototypeVariants[(index + (event.key === "ArrowRight" ? 1 : -1) + prototypeVariants.length) % prototypeVariants.length];
      event.preventDefault();
      router.push(`/dev/learn-variants/${next.id}`, { scroll: false });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, scenario, router]);
  return <nav aria-label="Varianty prototypu" className="lv-picker" style={{ ...bar, display: hidden ? "none" : "flex" }} data-variant-picker>
    <style>{placement}</style>
    <Link href="/dev/learn-variants" style={{ color: "rgb(255 255 255 / 0.85)" }}>Learn · varianty</Link>
    <span aria-hidden="true">/</span>
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select aria-label="Varianta" value={active} style={select} onChange={(event) => router.push(`/dev/learn-variants/${event.target.value}`, { scroll: false })}>
        <optgroup label="Struktura">
          {prototypeVariants.map((variant) => <option key={variant.id} value={variant.id} style={{ color: "#141414" }}>{variant.label}</option>)}
        </optgroup>
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 12, pointerEvents: "none" }}><path d="m4 6 4 4 4-4" /></svg>
    </span>
    {scenario && <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select aria-label="Stav učícího se" value={scenario} style={select} onChange={(event) => router.push(`/dev/learn-variants/d?stav=${event.target.value}`, { scroll: false })}>
        {learnScenarios.map((item) => <option key={item.id} value={item.id} title={item.note} style={{ color: "#141414" }}>{item.label}</option>)}
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 12, pointerEvents: "none" }}><path d="m4 6 4 4 4-4" /></svg>
    </span>}
    <span className="lv-picker-hint">{scenario ? "← → · 1–6 · H skryje" : "← → · H skryje"}</span>
  </nav>;
}
