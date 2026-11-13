"use client";

import { ArrowRight, CircleAlert, CircleCheck, CircleHelp, CircleX, ListTree, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/form-controls";
import { useSheetSwipeDismiss } from "@/components/ui/sheet-swipe";
import { evaluateQuestion, feedbackFor } from "@/features/lessons/question-evaluation";
import { cn } from "@/lib/utils";
import type { InlineQuestion as Question } from "./workspace-model";

/**
 * Desktop rail beside the main column. Collapsing swaps the grid track instantly: it is navigation,
 * and navigation never animates (DESIGN.md › Motion). The toggle keeps focus because it stays mounted.
 */
export function CollapsibleWorkspace({ rail, count, children }: { rail: React.ReactNode; count: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const railId = useId();
  // Same box as the rendered app header (max-w-shell; 20/40/64px gutters at 768 and 1200px), so the rail starts on the wordmark's edge.
  return <div className={cn("mx-auto w-full max-w-shell px-5 md:px-10 min-[75rem]:px-16 lg:grid lg:gap-12 xl:gap-16", open ? "lg:grid-cols-[--spacing(68)_minmax(0,1fr)]" : "lg:grid-cols-[--spacing(11)_minmax(0,1fr)]")}>
    {/* The header scrolls away, so the rail sticks to the top. -ml-4 + px-2 lets row hovers bleed 8px past the
        wordmark edge and leaves room for the 7px focus ring inside the scroller. */}
    <aside aria-labelledby={`${railId}-title`} className="hidden lg:sticky lg:top-0 lg:-ml-4 lg:block lg:max-h-dvh lg:scroll-pt-16 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:px-2 lg:pt-10 lg:pb-10">
      {/* The shell's skip link lands before the rail; this one jumps the tree (WCAG 2.4.1). */}
      <a href="#d-main" className="sr-only rounded-control bg-surface px-3 text-small font-semibold shadow-elevation-2 focus:not-sr-only focus:absolute focus:z-20 focus:mt-1 focus:ml-2 focus:inline-flex focus:min-h-control-sm focus:items-center">Přeskočit kurikulum</a>
      <div className={cn("sticky top-0 z-10 flex min-h-control-sm items-center gap-2 bg-background", open ? "pl-2" : "justify-center")}>
        <h2 id={`${railId}-title`} className={cn("flex min-w-0 flex-1 items-baseline gap-2 text-small font-semibold font-sans tracking-normal", !open && "sr-only")}>Kurikulum {count}</h2>
        <IconButton variant="ghost" aria-label={open ? "Skrýt kurikulum" : "Zobrazit kurikulum"} aria-expanded={open} aria-controls={railId} onClick={() => setOpen((value) => !value)} className="size-control-sm shrink-0 text-secondary">
          {open ? <PanelLeftClose className="size-icon-md" aria-hidden="true" /> : <PanelLeftOpen className="size-icon-md" aria-hidden="true" />}
        </IconButton>
      </div>
      <nav id={railId} aria-labelledby={`${railId}-title`} hidden={!open} className="pt-2">{rail}</nav>
    </aside>
    {children}
  </div>;
}

/**
 * Below 1024px (a rem breakpoint, so 200 % text lands here too) the same tree opens as a bottom sheet:
 * native modal <dialog> (focus trap, Escape, focus return) plus the shipped touch swipe-to-dismiss.
 * Entry slides from the edge it is attached to (spatial continuity, 270ms drawer curve). It runs on
 * `translate`, so it never fights the swipe hook, which writes `transform`. Reduced motion: the root rule makes it instant.
 */
export function CurriculumSheet({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useSheetSwipeDismiss(dialog, "y");
  return <>
    <Button variant="secondary" size="compact" className="shrink-0 lg:hidden" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><ListTree className="size-icon-sm" aria-hidden="true" />Kurikulum</Button>
    <dialog ref={dialog} aria-labelledby={`${id}-title`} onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-surface border-0 bg-background p-0 text-foreground shadow-elevation-2 backdrop:bg-backdrop transition-[translate] duration-(--motion-surface) ease-drawer starting:open:translate-y-full">
      <div className="sticky top-0 z-10 flex min-h-control-lg items-center justify-between gap-3 border-b border-divider bg-background pr-2 pl-4">
        <h2 id={`${id}-title`} className="text-card-title">Kurikulum</h2>
        <IconButton aria-label="Zavřít kurikulum" variant="ghost" onClick={() => dialog.current?.close()}><X className="size-icon-lg" aria-hidden="true" /></IconButton>
      </div>
      {/* Choosing a lesson closes the sheet. */}
      <nav aria-labelledby={`${id}-title`} className="px-2 pt-2 pb-[max(--spacing(6),env(safe-area-inset-bottom))]" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) dialog.current?.close(); }}>{children}</nav>
    </dialog>
  </>;
}

type Verdict = { correct: boolean; explanation: string; attempt: number };
/** Keep a number with its unit („20 %“, „100 Kč“) on one line. Display only; grading reads the authored block. */
const keepUnits = (text: string) => text.replace(/(\d) (%|Kč|p\.\s?b\.)/g, "$1\u00a0$2");

/**
 * The saved step's question, answered in place. Grading is the production evaluateQuestion/feedbackFor pair the
 * lesson player and the server use, never a copy. Check stays enabled; an empty or malformed answer gets a field
 * error instead of a verdict. Before an answer nothing beyond the prompt is shown: no recap, no explanation.
 * Prototype: a correct answer links to the lesson. Production saves position + 1 first (saveLessonPositionAction).
 */
export function InlineQuestion({ question, lessonHref, earlierSteps }: { question: Question; lessonHref: string; earlierSteps: number }) {
  const id = useId();
  const [answer, setAnswer] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>();
  const field = useRef<HTMLInputElement>(null);
  const next = useRef<HTMLAnchorElement>(null);
  const solved = verdict?.correct === true;
  // The submit button is replaced on success; hand focus to its successor so keyboard users keep their place.
  useEffect(() => { if (solved) next.current?.focus(); }, [solved]);

  function check(event: React.FormEvent) {
    event.preventDefault();
    const result = evaluateQuestion(question, { answer });
    if (result === undefined) { setInvalid(true); setVerdict(undefined); if (question.type === "numericQuestion") field.current?.focus(); return; }
    setInvalid(false);
    setVerdict({ correct: result, explanation: feedbackFor(question, { answer }, result).explanation, attempt: (verdict?.attempt ?? 0) + 1 });
  }
  function change(value: string) {
    setAnswer(value); setInvalid(false);
    if (!solved) setVerdict(undefined);
  }
  const describedBy = cn(invalid && `${id}-error`, `${id}-feedback`);
  const action = solved
    ? <ButtonLink ref={next} href={lessonHref} className="max-sm:w-full">Pokračovat v lekci<ArrowRight className="-mr-0.5 size-icon-sm" aria-hidden="true" /></ButtonLink>
    : <Button type="submit" className="max-sm:w-full">Zkontrolovat</Button>;

  return <form onSubmit={check} noValidate className="grid gap-5">
    {question.type === "numericQuestion"
      ? <div className="grid gap-3">
        <label htmlFor={`${id}-answer`} className="max-w-prose text-emphasis text-pretty text-foreground">{keepUnits(question.prompt)}</label>
        <div className="flex flex-wrap items-start gap-3">
          <span className="relative flex w-full items-center sm:w-44">
            <input ref={field} id={`${id}-answer`} value={answer} onChange={(event) => change(event.target.value)} inputMode="decimal" autoComplete="off" spellCheck={false}
              readOnly={solved} aria-invalid={invalid || verdict?.correct === false || undefined} aria-describedby={describedBy}
              className={cn(controlClassName, "min-h-control-lg tabular-nums", question.unit && "pr-12")} />
            {question.unit && <span aria-hidden="true" className="pointer-events-none absolute right-4 text-body text-muted">{question.unit}</span>}
          </span>
          {action}
        </div>
      </div>
      : <fieldset aria-describedby={describedBy} className="grid gap-3">
        <legend className="mb-3 max-w-prose text-emphasis text-pretty text-foreground">{keepUnits(question.prompt)}</legend>
        <div className="grid gap-2">
          {question.options.map((option) => {
            const chosen = answer === option.id;
            const marked = chosen && verdict;
            return <label key={option.id} className={cn("flex min-h-control-lg cursor-pointer items-start gap-3 rounded-control border bg-surface px-4 py-3 text-body transition-[background-color,border-color] duration-(--motion-micro) hover:bg-surface-muted has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-foreground",
              marked ? verdict.correct ? "border-primary bg-primary-soft hover:bg-primary-soft" : "border-danger-border bg-danger-soft hover:bg-danger-soft" : chosen ? "border-primary bg-primary-soft hover:bg-primary-soft" : "border-border-strong")}>
              <input type="radio" name={`${id}-answer`} value={option.id} checked={chosen} disabled={solved} onChange={() => change(option.id)} className="mt-1 size-icon-sm shrink-0 accent-primary focus-visible:outline-none" />
              <span className="min-w-0 flex-1 text-pretty">{keepUnits(option.label)}</span>
              {marked && (verdict.correct ? <CircleCheck className="mt-0.5 size-icon-md shrink-0 text-primary" aria-hidden="true" /> : <CircleX className="mt-0.5 size-icon-md shrink-0 text-danger-ink" aria-hidden="true" />)}
            </label>;
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">{action}</div>
      </fieldset>}

    {invalid && <p id={`${id}-error`} className="flex items-start gap-2 text-small text-danger-ink"><CircleAlert className="mt-0.5 size-icon-sm shrink-0" aria-hidden="true" />{question.type === "numericQuestion" ? "Napiš odpověď jako číslo. Desetinnou část odděl čárkou." : "Vyber jednu z možností."}</p>}

    {/* Stable live region, rendered empty first so repeated verdicts are announced. */}
    <div id={`${id}-feedback`} role="status" className="empty:hidden">
      {verdict && <p key={verdict.attempt} className={cn("flex gap-3 rounded-control p-4 text-small text-foreground transition-[opacity,translate] duration-(--motion-micro) ease-out starting:translate-y-1 starting:opacity-0", verdict.correct ? "bg-primary-soft" : "border border-danger-border bg-danger-soft")}>
        {verdict.correct ? <CircleCheck className="mt-0.5 size-icon-md shrink-0 text-primary" aria-hidden="true" /> : <CircleAlert className="mt-0.5 size-icon-md shrink-0 text-danger-ink" aria-hidden="true" />}
        <span className="min-w-0 text-pretty"><strong className="font-semibold">{verdict.correct ? "Správně." : "Ještě ne."}</strong> {keepUnits(verdict.explanation)}{verdict.correct ? "" : " Uprav odpověď a zkontroluj ji znovu."}</span>
      </p>}
    </div>

    {!solved && <details className="group border-t border-divider pt-3">
      <summary className="-ml-2 inline-flex min-h-control-sm cursor-pointer list-none items-center gap-2 rounded-control px-2 text-small font-semibold text-primary-hover hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        <CircleHelp className="size-icon-sm" aria-hidden="true" />Jak odpovědět
      </summary>
      {/* Method and format only. Authored explanations can state the result (13 of 227), so none appear before an attempt. */}
      <div className="grid max-w-prose gap-2 pt-1 pb-1 text-small text-secondary">
        <p>{question.type === "numericQuestion" ? `Napiš jen číslo${question.unit ? ` bez jednotky (${question.unit} je doplněno)` : ""}. Desetinnou část odděl čárkou.` : "Vyber jednu možnost a zkontroluj ji. Vysvětlení uvidíš hned po odpovědi."}</p>
        {earlierSteps > 0 && <p>Výklad z kroků 1–{earlierSteps} najdeš v lekci. Otevři ji a vrať se o krok zpět.</p>}
      </div>
    </details>}
  </form>;
}
