import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";
import { $, $$ } from "../utils";
import type { SectionInit } from "../types";

/**
 * Portfolio Lab demo: when the panel scrolls in, the cost rows of the purchase review settle in one by one and
 * the total lands last; the crisis drill draws its model index and marks the −30 % month. Only transform,
 * opacity and stroke are animated, the React state is never touched, and any input ends it at once.
 */
export const initPortfolio: SectionInit = ({ root, c, inContext }) => {
  const demo = $(root, "[data-portfolio-demo]");
  const crisis = $(root, "[data-crisis]");
  if (!demo || !crisis) return;
  const rows = $$(demo, "[data-demo-step='1'] [data-cost-rows] > div");
  const total = $(demo, "[data-demo-step='1'] [data-cost-total]");
  const line = $(crisis, "[data-crisis-line]");
  const low = $(crisis, "[data-crisis-low]");

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

  return finish;
};
