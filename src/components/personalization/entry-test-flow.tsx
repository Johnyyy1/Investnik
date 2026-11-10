"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { nextEntryTestQuestionAction, submitEntryTestAction } from "@/features/personalization/actions";
// Type only: the item bank and answer key never reach the client bundle.
import type { DiagnosticV2Question } from "@/features/personalization/diagnostic-v2";
import { OnboardingChoice } from "./onboarding-choice";
import { OnboardingGuide, OnboardingHeader } from "./onboarding-frame";
import styles from "./personalization-flow.module.css";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Answer = { itemId: string; optionId: string };
type View = { answers: Answer[]; current: DiagnosticV2Question; selected?: string; progress: number };

/** Adaptive entry test (#124). The server picks every next question from the answers so far; no correctness is shown. */
export function EntryTestFlow({ first, draftKey, version }: { first: DiagnosticV2Question; draftKey: string; version: string }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>({ answers: [], current: first, progress: 0 });
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  /** Shows the question that follows `answers`, or reports that the test is complete. */
  async function load(answers: Answer[], selected?: string) {
    const result = await nextEntryTestQuestionAction(answers);
    if (!result.ok) { setError(result.message); return "error" as const; }
    if (!result.question) return "done" as const;
    moved.current = true; setError(undefined);
    setView({ answers, current: result.question, selected, progress: result.progress });
    return "question" as const;
  }
  useEffect(() => {
    let saved: Answer[] = [];
    try { saved = JSON.parse(sessionStorage.getItem(draftKey) ?? "[]"); } catch { /* Storage can be disabled. */ }
    if (!Array.isArray(saved) || !saved.length) return;
    // The server replays the restored answers; an outdated or edited draft is dropped.
    startTransition(async () => {
      try {
        const restored = await load(saved);
        if (restored === "done") await load(saved.slice(0, -1), saved.at(-1)?.optionId);
        if (restored === "error") { setError(undefined); sessionStorage.removeItem(draftKey); } else setStarted(true);
      } catch { /* Start fresh. */ }
    });
  }, [draftKey]);
  useEffect(() => {
    if (started) { try { sessionStorage.setItem(draftKey, JSON.stringify(view.answers)); } catch { /* The test still works without recovery. */ } }
  }, [draftKey, started, view.answers]);
  useEffect(() => {
    if (moved.current) { heading.current?.focus(); window.scrollTo({ top: 0, behavior: "instant" }); }
  }, [started, view.current.id]);

  function run(task: () => Promise<unknown>) {
    if (pending) return;
    startTransition(async () => {
      try { await task(); } catch { setError("Připojení se nepodařilo. Odpovědi tu zůstaly, zkus to znovu."); }
    });
  }
  function next() {
    if (!view.selected) return;
    const answers = [...view.answers, { itemId: view.current.id, optionId: view.selected }];
    run(async () => {
      if (await load(answers) !== "done") return;
      const result = await submitEntryTestAction({ version, answers });
      if (!result.ok) { setError(result.message); return; }
      try { sessionStorage.removeItem(draftKey); } catch { /* Optional recovery storage. */ }
      router.replace("/onboarding/plan"); router.refresh();
    });
  }
  function back() {
    if (!view.answers.length) { moved.current = true; setStarted(false); return; }
    run(() => load(view.answers.slice(0, -1), view.answers.at(-1)!.optionId));
  }

  return <main className={styles.flow}>
    <OnboardingHeader progress={started ? Math.max(view.progress, 0.04) : 0.02} disabled={pending} back={started ? back : "/onboarding/plan"}
      trailing={<Link className={styles.quiet} href="/learn">{started ? "Přerušit" : "Do Učení"}</Link>} />
    <div className={styles.column}>
      <OnboardingGuide pose={pending ? "21-hourglass" : error ? "05-shrug" : started ? "02-thinking" : "06-map"}>{pending ? "Chvilku, připravuju další krok…" : error ? "Odpovědi tu zůstaly. Zkus to znovu." : started ? "Nejde o známku. Když odpověď nevíš, vyber „Nevím“." : "Najdeme, kde začít. Nic se tu nedá pokazit."}</OnboardingGuide>
      <form onSubmit={(event) => { event.preventDefault(); if (started) next(); else { moved.current = true; setStarted(true); } }} aria-busy={pending} aria-describedby={error ? "entry-test-error" : undefined}>
        <section className={styles.questionCard} key={started ? view.current.id : "intro"}>
          <p role="status" aria-live="polite" className={styles.eyebrow}>{started ? `Vstupní test · ${view.current.topic}` : "Vstupní test · volitelný"}</p>
          <h1 ref={heading} tabIndex={-1} className={cn(styles.questionTitle, started && styles.diagnosticTitle)}>{started ? view.current.prompt : "Ukaž, co už umíš"}</h1>
          {started ? <fieldset disabled={pending} className={styles.choices}>
            <legend className="sr-only">{view.current.prompt}</legend>
            {view.current.options.map((option) => <OnboardingChoice key={option.id} name={view.current.id} value={option.id} checked={view.selected === option.id} disabled={pending} onChange={(selected) => { setError(undefined); setView((current) => ({ ...current, selected })); }}>{option.label}</OnboardingChoice>)}
          </fieldset> : <div className={styles.diagnosticIntro}>
            <p>Nejvýš 30 krátkých otázek, obvykle méně. Test se zastaví, jakmile ví, kde začít.</p>
            <p>Lekce, které prokážeš, v plánu přeskočíš. Nepočítají se jako dokončené, takže za ně nezískáš XP ani cvičný kapitál a kdykoli je můžeš projít.</p>
            <p>„Nevím“ je platná odpověď. Nic se neodečítá a po otázkách neukazujeme, jestli byla odpověď správná.</p>
            <p>Bez časového limitu. Přestat můžeš kdykoli, rozpracované odpovědi zůstanou v této záložce prohlížeče.</p>
          </div>}
          {error && <p id="entry-test-error" role="alert" className={styles.error}>{error}</p>}
        </section>
        <div className={styles.actionRow}>
          {started ? <p className={styles.actionHint}>Odpověď můžeš před pokračováním změnit.</p> : <Link className={styles.textLink} href="/onboarding/plan">Přeskočit, zpět na plán</Link>}
          <button type="submit" className={cn(buttonVariants(), styles.primary)} disabled={pending || (started && !view.selected)}>{pending ? <LoaderCircle className={styles.spinner} size={18} aria-hidden="true" /> : null}<span>{pending ? "Načítám…" : started ? "Pokračovat" : "Začít test"}</span>{!pending && <ArrowRight size={18} aria-hidden="true" />}</button>
        </div>
      </form>
      <p className={styles.disclosure}>Vzdělávání, ne investiční doporučení.</p>
    </div>
  </main>;
}
