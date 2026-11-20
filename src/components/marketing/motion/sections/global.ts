import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";
import { $, $$, hoverLift, magnetic, pressFeedback, sheen } from "../utils";
import type { SectionInit } from "../types";

/** Thin scroll-progress bar at the top of the viewport (scrubbed, transform only). */
export const initScrollProgress: SectionInit = ({ root }) => {
  const bar = $(root, "[data-scroll-progress]");
  if (!bar) return;
  gsap.set(bar, { scaleX: 0, transformOrigin: "0% 50%" });
  gsap.to(bar, {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });
};

/** Hover lift, magnetic pull, button sheen and press feedback. Hover effects run on fine pointers only. */
export const initInteractions: SectionInit = ({ root, c }) => {
  const cleanups: Array<() => void> = [];
  // GSAP owns transform on these elements, so the CSS transform transition would fight it.
  $$(root, "[data-lift], [data-magnetic], [data-press]").forEach(el => { el.style.transitionProperty = "background-color, border-color, color"; });
  $$(root, "[data-press]").forEach(el => cleanups.push(pressFeedback(el)));
  if (c.fine) {
    $$(root, "[data-lift]").forEach(el => cleanups.push(hoverLift(el)));
    $$(root, "[data-shimmer]").forEach(el => cleanups.push(sheen(el)));
    if (c.desktop) $$(root, "[data-magnetic]").forEach(el => cleanups.push(magnetic(el)));
  }
  return () => cleanups.forEach(fn => fn());
};

/** Site header: slides down on load, then stays in view as a floating glass bar. Pins sit below it (NAV_CLEARANCE). */
export const initNav: SectionInit = ({ root }) => {
  const header = $(root, "[data-nav]");
  if (!header) return;
  // Sticky is applied from JS so the no-JS / reduced-motion header stays in normal flow.
  gsap.set(header, { position: "sticky", top: 0 });
  // Keep navigation fully opaque so sign-in stays readable throughout the intro.
  gsap.from(header, { y: -24, duration: 0.9, delay: 0.1, ease: EASE.enter });
  // Over the dark Lab stage the clear glass would leave dark text on dark; switch the bar to its dark variant.
  const lab = $(root, "#portfolio-lab");
  const dark = lab && ScrollTrigger.create({
    trigger: lab, start: `top ${NAV_CLEARANCE / 2}`, end: `bottom ${NAV_CLEARANCE / 2}`,
    refreshPriority: -1, // after the Lab pin has added its spacer
    onToggle: self => header.toggleAttribute("data-on-dark", self.isActive),
  });
  return () => { dark?.kill(); header.removeAttribute("data-on-dark"); gsap.set(header, { clearProps: "position,top,transform" }); };
};

/** Height the sticky nav covers (16 px gutter + 64 px pill), plus a small gap: pinned blocks start below it. */
export const NAV_CLEARANCE = 88;

/** Footer: a single calm fade-up. */
export const initFooter: SectionInit = ({ root }) => {
  const footer = $(root, "[data-footer]");
  if (!footer) return;
  gsap.set(footer, { opacity: 0, y: 24 }); // opacity only: footer links stay in the tab order
  ScrollTrigger.create({ trigger: footer, start: "top 98%", once: true, onEnter: () => gsap.to(footer, { opacity: 1, y: 0, duration: 0.9, ease: EASE.enter }) });
};
