"use client";

import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";
import type { LearnPrototypeData } from "./data";

type Question = NonNullable<LearnPrototypeData["current"]["question"]>;

/** Local state only: the prototype answers in place and saves nothing. */
export function NumericQuestion({ question, lessonHref, size = "default" }: { question: Question; lessonHref: string; size?: "default" | "compact" }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | "empty" | null>(null);
  function check(event: React.FormEvent) {
    event.preventDefault();
    const number = Number(value.replace(/\s/g, "").replace(",", "."));
    if (!value.trim() || !Number.isFinite(number)) return setResult("empty");
    setResult(Math.abs(number - question.answer) <= question.tolerance ? "correct" : "incorrect");
  }
  const solved = result === "correct";
  return <form onSubmit={check} noValidate className="grid gap-4">
    <label htmlFor={`${id}-answer`} className={cn("font-semibold text-pretty", size === "compact" ? "text-body" : "text-emphasis")}>{question.prompt}</label>
    <div className="flex flex-wrap items-center gap-3">
      <input id={`${id}-answer`} value={value} onChange={(event) => { setValue(event.target.value); if (result !== "correct") setResult(null); }} inputMode="decimal" autoComplete="off" readOnly={solved} aria-invalid={result === "empty" || undefined} aria-describedby={`${id}-feedback`} className={cn(controlClassName, "w-36 tabular-nums")} />
      {solved
        ? <ButtonLink href={lessonHref} size={size === "compact" ? "compact" : "default"}>Dokončit lekci<ArrowRight className="size-icon-sm" aria-hidden="true" /></ButtonLink>
        : <Button type="submit" size={size === "compact" ? "compact" : "default"}>Zkontrolovat</Button>}
    </div>
    <div id={`${id}-feedback`} role="status" aria-live="polite">
      {result === "correct" && <p className="flex gap-3 rounded-control bg-primary-soft p-4 text-small text-foreground"><CircleCheck className="mt-0.5 size-icon-md shrink-0 text-primary" aria-hidden="true" /><span><strong className="font-semibold">Správně.</strong> {question.correctExplanation}</span></p>}
      {result === "incorrect" && <p className="flex gap-3 rounded-control border border-danger-border bg-danger-soft p-4 text-small text-foreground"><CircleAlert className="mt-0.5 size-icon-md shrink-0 text-danger-ink" aria-hidden="true" /><span><strong className="font-semibold">Ještě ne.</strong> {question.incorrectExplanation} Zkus to znovu.</span></p>}
      {result === "empty" && <p className="text-small text-danger-ink">Napiš výsledek jako číslo, například 104,5.</p>}
    </div>
  </form>;
}
