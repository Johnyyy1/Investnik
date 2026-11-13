"use client";

import { ArrowRight, CircleAlert, CircleCheck, Lightbulb, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";
import type { LearnPrototypeData } from "./data";

/** Desktop rail that collapses to a slim strip. */
export function CollapsibleWorkspace({ rail, progress, children }: { rail: React.ReactNode; progress: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const railId = useId();
  const toggle = () => setOpen((value) => !value);
  // Navigation never animates (DESIGN.md › Motion): the columns swap instantly.
  return <div className={cn("mx-auto w-full max-w-shell lg:grid", open ? "lg:grid-cols-[17rem_minmax(0,1fr)]" : "lg:grid-cols-[3.5rem_minmax(0,1fr)]")}>
    <aside aria-label="Kurikulum" className="hidden border-r border-divider lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:overscroll-contain">
      <div className={cn("sticky top-0 z-10 flex items-center bg-background", open ? "gap-2 py-3 pr-1 pl-4" : "justify-center py-3")}>
        {open && <p className="min-w-0 flex-1 text-small font-semibold text-foreground">Kurikulum <span className="font-normal tabular-nums text-muted">{progress}</span></p>}
        <IconButton variant="ghost" aria-label={open ? "Skrýt kurikulum" : "Zobrazit kurikulum"} aria-expanded={open} aria-controls={railId} onClick={toggle} className="size-control-sm text-secondary">
          {open ? <PanelLeftClose className="size-icon-md" aria-hidden="true" /> : <PanelLeftOpen className="size-icon-md" aria-hidden="true" />}
        </IconButton>
      </div>
      <div id={railId} hidden={!open} className="px-2 pb-8">{rail}</div>
    </aside>
    {children}
  </div>;
}

type Question = NonNullable<LearnPrototypeData["current"]["question"]>;
type RecapItem = LearnPrototypeData["current"]["recap"][number];

/**
 * The active question. The recap is withheld until the answer is correct: the summary of earlier steps
 * can contain the worked result (here „…dává 96“), so showing it beside an open question gives the answer away.
 * Before that, the learner can ask for the method hint, which never states the result.
 */
export function FocusedQuestion({ question, recap, firstStep, lessonHref }: { question: Question; recap: readonly RecapItem[]; firstStep: number; lessonHref: string }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | "empty" | null>(null);
  const [hint, setHint] = useState(false);
  const finish = useRef<HTMLAnchorElement>(null);
  const solved = result === "correct";
  // The submit button is replaced on success; hand focus to its successor so keyboard users keep their place.
  useEffect(() => { if (solved) finish.current?.focus(); }, [solved]);
  function check(event: React.FormEvent) {
    event.preventDefault();
    const number = Number(value.replace(/\s/g, "").replace(",", "."));
    if (!value.trim() || !Number.isFinite(number)) return setResult("empty");
    setResult(Math.abs(number - question.answer) <= question.tolerance ? "correct" : "incorrect");
  }
  return <form onSubmit={check} noValidate className="grid gap-5">
    <label htmlFor={`${id}-answer`} className="max-w-[60ch] text-emphasis text-pretty text-foreground">{question.prompt.replace(/ %/g, "\u00a0%")}</label>
    <div className="flex flex-wrap items-center gap-3">
      <span className="relative flex w-full max-w-44 items-center">
        <input id={`${id}-answer`} value={value} onChange={(event) => { setValue(event.target.value); if (!solved) setResult(null); }} inputMode="decimal" autoComplete="off" placeholder="Výsledek" readOnly={solved} aria-invalid={result === "empty" || result === "incorrect" || undefined} aria-describedby={`${id}-feedback`} className={cn(controlClassName, "min-h-control-lg tabular-nums", question.unit && "pr-10")} />
        {question.unit && <span aria-hidden="true" className="pointer-events-none absolute right-4 text-body text-muted">{question.unit}</span>}
      </span>
      {solved
        ? <ButtonLink ref={finish} href={lessonHref} className="max-sm:w-full">Dokončit lekci<ArrowRight className="-mr-0.5 size-icon-sm" aria-hidden="true" /></ButtonLink>
        : <Button type="submit" className="max-sm:w-full">Zkontrolovat</Button>}
    </div>

    <div id={`${id}-feedback`} role="status" aria-live="polite" className="empty:hidden">
      {result === "correct" && <p className="flex gap-3 rounded-control bg-primary-soft p-4 text-small text-foreground"><CircleCheck className="mt-0.5 size-icon-md shrink-0 text-primary" aria-hidden="true" /><span><strong className="font-semibold">Správně.</strong> {question.correctExplanation}</span></p>}
      {result === "incorrect" && <p className="flex gap-3 rounded-control border border-danger-border bg-danger-soft p-4 text-small text-foreground"><CircleAlert className="mt-0.5 size-icon-md shrink-0 text-danger-ink" aria-hidden="true" /><span><strong className="font-semibold">Ještě ne.</strong> {question.incorrectExplanation} Zkus to znovu.</span></p>}
      {result === "empty" && <p className="text-small text-danger-ink">Napiš výsledek jako číslo, například 104,5.</p>}
    </div>

    {!solved && result !== "incorrect" && <div className="grid gap-2">
      <button type="button" aria-expanded={hint} aria-controls={`${id}-hint`} onClick={() => setHint((value) => !value)} className="-ml-2 inline-flex min-h-control-sm items-center gap-2 justify-self-start rounded-control px-2 text-small font-semibold text-primary-hover transition-[background-color] duration-[var(--motion-micro)] hover:bg-primary-soft">
        <Lightbulb className="size-icon-sm" aria-hidden="true" />{hint ? "Skrýt nápovědu" : "Potřebuješ nápovědu?"}
      </button>
      <p id={`${id}-hint`} hidden={!hint} className="max-w-[60ch] border-l-2 border-primary-tint pl-4 text-small text-secondary">{question.incorrectExplanation}</p>
    </div>}

    {solved && recap.length > 0 && <section aria-labelledby={`${id}-recap`} className="grid gap-3 border-t border-divider pt-5">
      <p id={`${id}-recap`} className="text-label uppercase text-muted">Co už víš z kroků 1–{firstStep}</p>
      {recap.map((item) => <div key={item.title} className="grid max-w-[60ch] gap-1"><p className="text-small font-semibold text-foreground">{item.title}</p><p className="text-small text-secondary">{item.body}</p></div>)}
    </section>}
  </form>;
}
