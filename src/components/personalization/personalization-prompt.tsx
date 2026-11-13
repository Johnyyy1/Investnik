"use client";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, startTransition } from "react";
import { AppLink as Link } from "@/components/shell/app-link";
import { IconButton } from "@/components/ui/button";

/** One quiet row in „Tvoje cesta“ on /learn. Dismissal is a per-browser preference, never progress. */
export function PersonalizationPrompt({ userId }: { userId: string }) {
  const [dismissed, setDismissed] = useState(false);
  const key = `investi-personalization-prompt:${userId}`;
  useEffect(() => { try { if (localStorage.getItem(key)) startTransition(() => setDismissed(true)); } catch { /* Optional UI preference. */ } }, [key]);
  if (dismissed) return null;
  // The text track keeps its longest word (1fr, not minmax(0,1fr)), so under enlarged text the dismiss button wraps below instead of clipping the link.
  return <li className="flex flex-wrap items-center gap-x-2">
    <Link href="/onboarding?personalize=1" className="group grid min-h-control-lg flex-1 grid-cols-[auto_1fr_auto] items-center gap-x-3 py-3 no-underline">
      <SlidersHorizontal className="size-icon-md text-primary" aria-hidden="true" />
      <span className="grid gap-0.5">
        <span className="text-small font-semibold text-pretty text-foreground underline-offset-4 group-hover:underline">Přizpůsobit učení</span>
        <span className="text-microcopy text-pretty text-secondary">Řekni nám, co tě zajímá, a doporučení přizpůsobíme tvému cíli.</span>
      </span>
      <ArrowRight className="size-icon-sm text-muted group-hover:text-foreground" aria-hidden="true" />
    </Link>
    <IconButton variant="ghost" aria-label="Teď ne" className="size-control-sm shrink-0 text-secondary" onClick={() => { setDismissed(true); try { localStorage.setItem(key, "dismissed"); } catch { /* Dismiss for this visit. */ } }}>
      <X className="size-icon-sm" aria-hidden="true" />
    </IconButton>
  </li>;
}
