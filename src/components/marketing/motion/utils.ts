import { gsap, ScrollTrigger, SplitText, EASE, DUR, REVEAL_Y } from "@/lib/gsap";

export const $ = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string) => root.querySelector<T>(selector);
export const $$ = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string) => Array.from(root.querySelectorAll<T>(selector));

/** Resolves when web fonts are ready, or after `timeout` ms so a slow font never blocks the intro. */
export function fontsReady(timeout = 1200): Promise<void> {
  const ready = typeof document !== "undefined" && document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  return Promise.race([ready, new Promise<void>(resolve => window.setTimeout(resolve, timeout))]);
}

/**
 * Shared reveal: `[data-reveal]` elements fade up once when they scroll into view.
 * Hidden states are set here in JS, so content stays visible without JS or under reduced motion.
 * Modifiers: data-reveal="fade" (no movement), data-reveal-delay, data-reveal-stagger (animate children).
 * Uses opacity, not autoAlpha: `visibility: hidden` would drop links/buttons out of the tab order until revealed.
 * Tabbing to a not-yet-revealed control scrolls it into view, which fires the reveal.
 */
export function useReveal(root: HTMLElement, { mobile }: { mobile: boolean }) {
  $$(root, "[data-reveal]").forEach(el => {
    const fade = el.dataset.reveal === "fade";
    const delay = Number(el.dataset.revealDelay ?? 0);
    const targets = el.hasAttribute("data-reveal-stagger") ? Array.from(el.children) : [el];
    const y = fade ? 0 : mobile ? 24 : REVEAL_Y;
    gsap.set(targets, { opacity: 0, y });
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(targets, {
        opacity: 1, y: 0, delay, ease: EASE.enter,
        duration: mobile ? DUR.revealShort : DUR.reveal,
        stagger: DUR.card,
        clearProps: "transform",
      }),
    });
  });
}

type SplitMode = "words" | "chars" | "lines";

/**
 * Split heading reveal. `prepare()` hides the element (JS only); `play()` splits, reveals and then reverts
 * the split so the final DOM is the original markup. SplitText keeps the full text on aria-label.
 */
export function splitHeading(el: HTMLElement, mode: SplitMode, opts: { mobile?: boolean; delay?: number } = {}) {
  gsap.set(el, { autoAlpha: 0 });
  return {
    play() {
      const split = SplitText.create(el, {
        type: mode === "chars" ? "words,chars" : mode,
        mask: mode === "lines" ? "lines" : undefined,
        aria: "auto",
        wordsClass: "split-word",
      });
      const targets = split[mode];
      gsap.set(el, { autoAlpha: 1 });
      const tween = gsap.from(targets, {
        ...(mode === "lines" ? { yPercent: 110 } : { y: opts.mobile ? 18 : 28, autoAlpha: 0 }),
        delay: opts.delay ?? 0,
        duration: mode === "chars" ? 0.7 : DUR.reveal,
        ease: mode === "lines" ? EASE.enterLong : EASE.enter,
        stagger: mode === "chars" ? 0.025 : DUR.text,
        onComplete: () => split.revert(),
      });
      return tween;
    },
  };
}

/** Scroll-triggered split heading reveal for every `[data-split]` element. */
export function useSplitHeadings(root: HTMLElement, { mobile }: { mobile: boolean }, inContext: <T>(fn: () => T) => T) {
  $$(root, "[data-split]").forEach(el => {
    const mode = (el.dataset.split as SplitMode) || "words";
    const split = splitHeading(el, mobile && mode === "chars" ? "words" : mode, { mobile });
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => inContext(() => split.play()) });
  });
}

/** Press micro-interaction: squash on press, small overshoot on release. */
export function pressFeedback(el: HTMLElement) {
  const down = () => { if (!(el as HTMLButtonElement).disabled) gsap.to(el, { scale: 0.96, duration: 0.12, ease: "power2.out", overwrite: "auto" }); };
  const up = () => gsap.to(el, { scale: 1, duration: 0.5, ease: EASE.reward, overwrite: "auto" });
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointerleave", up);
  el.addEventListener("pointercancel", up);
  return () => { el.removeEventListener("pointerdown", down); el.removeEventListener("pointerup", up); el.removeEventListener("pointerleave", up); el.removeEventListener("pointercancel", up); };
}
