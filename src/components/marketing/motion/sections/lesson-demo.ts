import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";
import { $ } from "../utils";
import { LESSON_DEMO_EVENT, type LessonDemoDetail } from "../events";
import type { SectionContext } from "../types";

const send = (root: HTMLElement, detail: LessonDemoDetail) => root.dispatchEvent(new CustomEvent<LessonDemoDetail>(LESSON_DEMO_EVENT, { detail }));

/** Expands an element from 0 to its natural height (auto) with a soft fade. */
function expand(el: HTMLElement, y = 10) {
  return gsap.fromTo(el, { height: 0, autoAlpha: 0, y, overflow: "hidden" }, { height: "auto", autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.enter, clearProps: "height,overflow,transform" });
}

/** Moves the fake cursor to the centre of `target` (position is measured when the tween starts). */
function moveTo(host: HTMLElement, target: () => HTMLElement | null, dx = 0, dy = 0) {
  const point = () => {
    const t = target();
    if (!t) return { x: 0, y: 0 };
    const h = host.getBoundingClientRect();
    const r = t.getBoundingClientRect();
    return { x: r.left - h.left + r.width / 2 + dx, y: r.top - h.top + r.height / 2 + dy };
  };
  return { x: () => point().x, y: () => point().y };
}

const press = (tl: gsap.core.Timeline, cursor: HTMLElement, at: string | number) =>
  tl.to(cursor, { scale: 0.82, duration: 0.1, ease: "power2.out" }, at).to(cursor, { scale: 1, duration: 0.25, ease: EASE.enter });

/**
 * Hero lesson card: a ghost cursor picks answer B, checks it, the feedback panel expands, the "Správně" label pops
 * in and the lesson progress fills. It ends on the same state the page server-renders.
 * Resets the preview to "unanswered" first (the card is still hidden by the hero intro at that point).
 */
export function prepareHeroDemo({ root }: Pick<SectionContext, "root">) {
  const card = $(root, '[data-lesson-demo="hero"]');
  if (!card) return null;
  send(card, { answer: null, revealed: false, defer: true });
  gsap.set($(card, "[data-lesson-progress]"), { scaleX: 0.75, transformOrigin: "0% 50%" });
  return card;
}

export function armHeroDemo(ctx: SectionContext, card: HTMLElement) {
  const { inContext } = ctx;
  const cursor = $(card, "[data-demo-cursor]")!;
  const progress = $(card, "[data-lesson-progress]")!;
  // The preview is read-only, so the script always runs to its end state; nothing the visitor does can interrupt it.
  const finish = () => {
    gsap.set(cursor, { autoAlpha: 0 });
    gsap.set(progress, { scaleX: 1 });
  };

  const play = () => inContext(() => {
    const feedback = () => $(card, "[data-aside-feedback]")!;
    const xp = () => $(card, "[data-xp]")!;
    const answerB = () => $(card, '[data-answer="B"]');
    const submit = () => $(card, "[data-submit]");
    const start = answerB()!.getBoundingClientRect();
    const host = card.getBoundingClientRect();
    gsap.set(cursor, { x: start.left - host.left + start.width * 0.8, y: start.top - host.top + start.height + 90, autoAlpha: 0, scale: 1 });
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(cursor, { autoAlpha: 1, duration: 0.3 })
      .to(cursor, { ...moveTo(card, answerB, -60, 4), duration: 1, ease: EASE.scrub }, "<")
      .add(() => send(card, { answer: "B", revealed: false }), "+=0.18");
    press(tl, cursor, "<");
    tl.to(cursor, { ...moveTo(card, submit, -20, 2), duration: 0.9, ease: EASE.scrub }, "+=0.35")
      .add(() => {
        send(card, { answer: "B", revealed: true });
        gsap.set(feedback(), { height: 0, autoAlpha: 0 });
      });
    press(tl, cursor, "<");
    tl.add(() => expand(feedback(), 12), "+=0.1")
      .fromTo(xp(), { scale: 0.5, autoAlpha: 0, transformOrigin: "0% 50%" }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: EASE.reward, clearProps: "transform" }, "<0.25")
      .to(progress, { scaleX: 1, duration: 1.2, ease: EASE.scrub }, "<0.1")
      .to(cursor, { autoAlpha: 0, y: "+=40", x: "+=40", duration: 0.6 }, "<0.3");
  });

  ScrollTrigger.create({ trigger: card, start: "top 80%", once: true, onEnter: play });
}
