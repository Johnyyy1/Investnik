"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX, Menu } from "lucide-react";
import { LESSON_DEMO_EVENT, type LessonDemoDetail } from "./motion/events";
import styles from "./pen-landing.module.css";

export function MobileNavigation() {
  const details = useRef<HTMLDetailsElement>(null);
  function close(returnFocus = false) {
    if (!details.current) return;
    details.current.open = false;
    if (returnFocus) details.current.querySelector("summary")?.focus();
  }
  return <div className={styles.mobileActions}>
    <Link href="/sign-in" prefetch={false}>Přihlásit se</Link>
    <details ref={details} className={styles.mobileNav} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
    }}>
      <summary aria-label="Navigační menu"><Menu aria-hidden="true" size={22}/></summary>
      <nav aria-label="Mobilní navigace" onClick={() => close()}>
        <a href="#jak-to-funguje">Jak to funguje</a>
        <a href="#portfolio-lab">Portfolio Lab</a>
        <Link href="/sign-in" prefetch={false}>Přihlásit se</Link>
        <Link href="/onboarding" prefetch={false}>Začít vstupním testem</Link>
      </nav>
    </details>
  </div>;
}

const reasoning = "Karta je v příkladu nejdražší dluh. Jejím splacením Jana omezí jisté budoucí náklady a nechá si malý polštář. Zaručený výnos, který by RPSN 24 % překonal, investice nemá.";

/**
 * Read-only illustration of a lesson step: no lesson engine, auth, storage, or mutations, and nothing to click.
 * On the landing the motion layer plays a scripted answer through LESSON_DEMO_EVENT; without motion it stays on
 * the server-rendered answered state.
 */
export function LessonPreview({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  const [answer, setAnswer] = useState<"A" | "B" | null>("B");
  const [revealed, setRevealed] = useState(true);
  const [hold, setHold] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // Layout effect: the listener must exist before the parent motion layer's layout effect dispatches its first reset.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onDemo = (event: Event) => {
      const detail = (event as CustomEvent<LessonDemoDetail>).detail;
      const apply = () => { setAnswer(detail.answer); setRevealed(detail.revealed); setHold(Boolean(detail.hold)); };
      if (detail.defer) apply(); else flushSync(apply);
    };
    el.addEventListener(LESSON_DEMO_EVENT, onDemo);
    return () => el.removeEventListener(LESSON_DEMO_EVENT, onDemo);
  }, []);
  const correct = answer === "B";
  const feedbackTitle = correct
    ? "Přesně. Dluh stojí jistě, výnos jistý není."
    : "Ještě ne. ETF výnos nezaručuje.";
  const feedback = <><h3 className={correct ? undefined : styles.feedbackWrong}>{feedbackTitle}</h3><p>{reasoning}</p></>;
  return <div ref={rootRef} data-lesson-demo={hero ? "hero" : compact ? "compact" : "base"} className={hero ? styles.heroLessonContent : styles.lessonPreview} role="group" aria-label="Ukázka lekce; nezapisuje pokrok ani neuděluje XP">
    <div className={`${styles.lessonCard} ${compact ? styles.lessonCompact : styles.heroLessonMain}`}>
      <p className={styles.lessonDisclosure}>Ukázka lekce · modelový příklad</p>
      <div className={styles.lessonMeta}><span>Dluh, nebo investice?</span><span>≈ 12 min</span></div>
      <p className={styles.lessonTrack}>NEŽ ZAČNEŠ INVESTOVAT · Lekce 0.1.2</p>
      {(!compact || !revealed || hold) && <>
        <h3 className={styles.lessonQuestion}>Jana má 30 000 Kč navíc, žádnou rezervu a kartu s RPSN 24 %. Co dřív?</h3>
        <ul className={styles.answers} aria-label="Ukázkové odpovědi">
          {(["A", "B"] as const).map(key => <li key={key}
            className={`${styles.answer} ${answer === key ? styles.answerSelected : ""} ${answer === key && revealed && key !== "B" ? styles.answerWrong : ""}`}
            data-answer={key} data-selected={answer === key ? "" : undefined}>
            <span>{key}</span><span>{key === "A" ? "Všechno do ETF." : "Splatit kartu, zbytek do rezervy."}</span>
            {answer === key && <span className={styles.visuallyHidden}>{revealed ? (key === "B" ? " · vybráno, správně" : " · vybráno, chybně") : " · vybráno"}</span>}
            {answer === key && revealed && (key === "B"
              ? <CircleCheck size={18} aria-hidden="true"/>
              : <CircleX size={18} aria-hidden="true"/>)}
            <i className={styles.answerGlow} data-answer-glow aria-hidden="true"/>
          </li>)}
        </ul>
      </>}
      {revealed && <div className={`${styles.feedback} ${hero ? styles.heroInlineFeedback : ""}`} role="status" data-feedback>{feedback}</div>}
      <div className={styles.lessonBottom}>
        <span className={styles.sampleReward} data-xp>{revealed && correct ? "Správně" : "Ukázka bez zápisu"}<span className={styles.visuallyHidden}> · pouze ilustrační, nezapisuje pokrok ani XP</span></span>
        {/* Looks like the lesson's submit button so the scripted cursor has a target; it is not a control. */}
        <span className={styles.lessonSubmit} data-submit data-disabled={answer ? undefined : ""} aria-hidden="true">
          {revealed ? "Pokračovat" : answer ? "Zkontrolovat odpověď" : "Vyber odpověď"}<ArrowRight size={18} aria-hidden="true"/>
        </span>
      </div>
    </div>
    {hero && <aside className={styles.heroLessonAside}>
      <p className={styles.demoEyebrow}>NEJDŘÍV ROZHODNUTÍ</p>
      <div className={styles.asideFeedback} role="status" data-aside-feedback>{revealed ? feedback : <><h3>Zkus rozhodnutí.</h3><p>Vyber odpověď a zjisti, proč se drahý dluh vyplatí řešit dřív než investice.</p></>}</div>
      <div className={styles.lessonProgress}><span data-lesson-progress/></div>
      <p className={styles.asideContext}>Úroveň 0 · Než začneš investovat<br/>Ukázka z publikované lekce.</p>
    </aside>}
    {compact && <p className={styles.microDisclaimer}>Ukázka lekce · odpověď a vysvětlení</p>}
    <span className={styles.demoCursor} data-demo-cursor aria-hidden="true"><svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2l15 7.5-6.2 1.9L9 18.5z" fill="#171717" stroke="#fffcf7" strokeWidth="1.5" strokeLinejoin="round"/></svg></span>
  </div>;
}
