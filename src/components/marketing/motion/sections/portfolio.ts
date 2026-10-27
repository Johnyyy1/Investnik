import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";
import { $, $$ } from "../utils";
import { scrollToY } from "../smooth-scroll";
import {
  PORTFOLIO_STEP_EVENT, PORTFOLIO_STEP_REQUEST_EVENT,
  type PortfolioStep, type PortfolioStepDetail, type PortfolioStepRequestDetail,
} from "../events";
import type { SectionInit } from "../types";

/**
 * Wide enough for the side-by-side layout and tall enough for the tallest step without clipping (measured:
 * ≈ 770 px at 1440, 795 px at 1280, 840 px at 1200, plus the 16 px top offset). In em so a larger default
 * font size needs a taller window.
 */
export const PORTFOLIO_PIN_QUERY = "(min-width: 87.5em) and (min-height: 49.5em), (min-width: 80em) and (min-height: 51em), (min-width: 75em) and (min-height: 54em)";
const PIN_TOP = 16;
/** Scroll distance per step while pinned. */
const STEP_SCROLL = 720;
const STEPS = 3;

/**
 * Portfolio Lab demo.
 *
 * Pinned (tall desktops): the demo and the crisis drill hold in place while the scroll walks through the
 * three steps (purchase → off-plan card → process feedback); a thin bar under the tabs shows the progress.
 * After step 3 the page scrolls on. Tabs and step buttons scroll to their step, so position and state agree.
 *
 * Everywhere with motion: the step-1 cost rows settle in one by one and the crisis drill draws its model
 * index. Only transform, opacity and stroke are animated; any input ends the entrance at once.
 */
export const initPortfolio: SectionInit = ({ root, c, inContext }) => {
  const demo = $(root, "[data-portfolio-demo]");
  const crisis = $(root, "[data-crisis]");
  const pinTarget = $(root, "[data-lab-demo]");
  if (!demo || !crisis || !pinTarget) return;
  const rows = $$(demo, "[data-demo-step='1'] [data-cost-rows] > div");
  const total = $(demo, "[data-demo-step='1'] [data-cost-total]");
  const line = $(crisis, "[data-crisis-line]");
  const low = $(crisis, "[data-crisis-low]");

  // --- Entrance -------------------------------------------------------------------------------------------
  gsap.set(rows, { autoAlpha: 0, y: 8 });
  if (line) gsap.set(line, { drawSVG: "0%" });
  if (low) gsap.set(low, { scale: 0, transformOrigin: "50% 50%" });

  let tl: gsap.core.Timeline | undefined;
  const finish = () => {
    tl?.kill();
    gsap.set(rows, { autoAlpha: 1, y: 0 });
    if (total) gsap.set(total, { clearProps: "transform" });
    if (line) gsap.set(line, { drawSVG: "100%" });
    if (low) gsap.set(low, { scale: 1 });
    for (const el of [demo, crisis]) { el.removeEventListener("pointerdown", finish); el.removeEventListener("keydown", finish); }
  };
  for (const el of [demo, crisis]) { el.addEventListener("pointerdown", finish); el.addEventListener("keydown", finish); }

  ScrollTrigger.create({
    trigger: demo, start: c.mobile ? "top 75%" : "top 65%", once: true,
    onEnter: () => inContext(() => {
      tl = gsap.timeline({ onComplete: finish });
      tl.to(rows, { autoAlpha: 1, y: 0, duration: 0.45, ease: EASE.enter, stagger: 0.12 }, 0.1);
      if (total) tl.fromTo(total, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: EASE.enter, transformOrigin: "100% 50%" }, ">-0.1");
      if (line) tl.to(line, { drawSVG: "100%", duration: c.mobile ? 1 : 1.4, ease: EASE.enterLong }, 0.2);
      if (low) tl.to(low, { scale: 1, duration: 0.4, ease: EASE.enter }, c.mobile ? 0.7 : 0.9);
    }),
  });

  // --- Scroll-driven steps --------------------------------------------------------------------------------
  const send = (detail: PortfolioStepDetail) => demo.dispatchEvent(new CustomEvent<PortfolioStepDetail>(PORTFOLIO_STEP_EVENT, { detail }));
  const mm = gsap.matchMedia();
  mm.add(PORTFOLIO_PIN_QUERY, () => {
    let current: PortfolioStep = 1;
    send({ driven: true, step: current });
    const stepAt = (progress: number) => Math.min(STEPS, Math.floor(progress * STEPS) + 1) as PortfolioStep;
    const bar = () => $(demo, "[data-step-progress]"); // rendered by React once driven mode is on
    const trigger = ScrollTrigger.create({
      trigger: pinTarget, start: `top top+=${PIN_TOP}`, end: `+=${STEP_SCROLL * STEPS}`,
      pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onToggle: self => { root.toggleAttribute("data-lab-pinned", self.isActive); },
      onUpdate: self => {
        const progressBar = bar();
        if (progressBar) gsap.set(progressBar, { scaleX: self.progress });
        const next = stepAt(self.progress);
        if (next !== current) { current = next; send({ step: next }); }
      },
    });
    // Land a little inside the step's range so rounding never shows the neighbour.
    const onRequest = (event: Event) => {
      const { step } = (event as CustomEvent<PortfolioStepRequestDetail>).detail;
      scrollToY(trigger.start + (trigger.end - trigger.start) * ((step - 1) / STEPS + 0.04));
    };
    demo.addEventListener(PORTFOLIO_STEP_REQUEST_EVENT, onRequest);
    return () => {
      demo.removeEventListener(PORTFOLIO_STEP_REQUEST_EVENT, onRequest);
      root.removeAttribute("data-lab-pinned");
      send({ driven: false });
    };
  });

  return () => { mm.revert(); finish(); };
};
