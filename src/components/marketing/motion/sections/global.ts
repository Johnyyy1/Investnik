import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";
import { $, $$, pressFeedback } from "../utils";
import type { SectionInit } from "../types";

/** Press feedback. Hover states live in CSS, so GSAP never overwrites the liquid button's layered shadow. */
export const initInteractions: SectionInit = ({ root }) => {
  const cleanups = $$(root, "[data-press]").map(pressFeedback);
  return () => cleanups.forEach(fn => fn());
};

/** Site header (sticky in CSS, dark variant from liquid-glass.tsx): slides down on load. Pins sit below it (NAV_CLEARANCE). */
export const initNav: SectionInit = ({ root }) => {
  const header = $(root, "[data-nav]");
  if (!header) return;
  // Keep navigation fully opaque so sign-in stays readable throughout the intro.
  gsap.from(header, { y: -24, duration: 0.9, delay: 0.1, ease: EASE.enter });
  return () => { gsap.set(header, { clearProps: "transform" }); };
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
