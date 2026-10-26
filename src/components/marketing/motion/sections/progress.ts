import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";
import { $, $$ } from "../utils";
import type { SectionInit } from "../types";

/** "Fakta se zdrojem. Žádné tipy." – deliberately slow and calm: the illustration fades in and the items ease in one by one. */
export const initProgress: SectionInit = ({ root, inContext }) => {
  const card = $(root, "[data-progress-card]");
  if (!card) return;
  const items = $$(card, "[data-progress-item]");
  const art = $(root, "[data-progress-art]");

  gsap.set(items, { autoAlpha: 0, y: 20 });
  if (art) gsap.set(art, { autoAlpha: 0 }); // fade only: illustrations never move

  ScrollTrigger.create({
    trigger: card, start: "top 78%", once: true,
    onEnter: () => inContext(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
      if (art) tl.to(art, { autoAlpha: 1, duration: 1, ease: "power1.out" }, 0);
      tl.to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.15 }, 0.35);
    }),
  });
};
