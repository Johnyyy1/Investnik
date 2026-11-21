# Landing page motion (GSAP)

The landing page (`src/components/marketing/pen-landing.tsx`) has a GSAP motion layer. It only adds motion. Copy, layout and colours are unchanged, and every illustrative label and disclaimer stays visible.

## Dependencies (exact)

- `gsap@3.15.0`: core, `ScrollTrigger`, `SplitText`, `DrawSVGPlugin`
- `@gsap/react@2.1.2`: `useGSAP`
- `lenis@1.3.26`: smooth scroll synced to ScrollTrigger

## Architecture

| File | Role |
| --- | --- |
| `src/lib/gsap.ts` | Registers the plugins once (client only). Shared `EASE`, `DUR`, `REVEAL_Y` and media queries `MQ`. Always import gsap from here. |
| `motion/motion-root.tsx` | `"use client"` wrapper around the page. One `useGSAP({ scope })` → `gsap.matchMedia()` runs every section initialiser in `SECTIONS` order and reverts everything on unmount or route change. Calls `ScrollTrigger.refresh()` after fonts and on `load`. |
| `motion/reveal.tsx` | Markup-only helper: `<SplitHeading>`. It renders plain HTML with `data-*` hooks, so SSR and no-JS output is the final state. |
| `motion/utils.ts` | `useReveal`, `splitHeading` / `useSplitHeadings`, `pressFeedback`, `fontsReady`. |
| `motion/smooth-scroll.ts` | Lenis on the GSAP ticker. In-page `#anchors` go through `lenis.scrollTo` and then move focus to the target. `#main` (the skip link) stays native. Deep links re-land after pin refreshes. |
| `motion/events.ts` | DOM events that let the motion layer drive the React previews (`LessonPreview`, the Portfolio Lab demo step). React still renders everything, and the demos never touch real state. |
| `motion/sections/*.ts` | Choreography for each section (below). |

### Rules the code follows

- **Reduced motion / no JS:** all hidden states are set from JS inside the `(prefers-reduced-motion: no-preference)` branch. Nothing is hidden by CSS. Under reduced motion there is no smooth scroll, pinning, parallax or demo, and the page renders in its final state.
- **Keyboard:** anything containing links or buttons is hidden with `opacity` (not `autoAlpha`), so it stays in the tab order. Tabbing to it scrolls it into view, which triggers its reveal.
- **Desktop ≥ 1024px vs mobile:** the Lab pin and the hero lesson demo are desktop only. Mobile gets shorter reveals (y 24px, 0.6s).
- **Hover** is CSS only, inside `(hover: hover) and (pointer: fine)`. GSAP adds press feedback (`data-press`) and never writes `box-shadow`, so the liquid buttons keep their layered highlights.
- CSS owns hover, active and focus colours (`pen-landing.module.css`, `portfolio-lab-demo.module.css`). Press on non-GSAP controls uses the individual `scale` property (0.96), so it never fights a GSAP transform, and sits behind `prefers-reduced-motion: no-preference`. Icons that appear (answer check, crisis result, menu ↔ close) use opacity, scale 0.25 → 1 and blur 4px → 0.
- Only `transform`, `opacity` and SVG stroke (`drawSVG`) are animated. Exception: the lesson feedback `height: auto` expand (inside a card, after layout).
- SplitText uses `aria: "auto"`, and every split is reverted once its reveal finishes.

## Section choreography

| # | Section | Trigger | What happens | Where to tweak |
| --- | --- | --- | --- | --- |
| – | Press | pointer | Squash and `back.out` release (`data-press`). Hover states are CSS. | `utils.ts › pressFeedback` |
| 1 | Nav | load + scroll | Slides down on load. It is sticky in CSS, so it stays in view without JS or motion; pinned sections start below it (`NAV_CLEARANCE`). Over the Lab it switches to the dark variant from a scroll listener in `liquid-glass.tsx`, also under reduced motion. | `initNav`, `liquid-glass.tsx` |
| 2 | Hero | load (after fonts, max 1.2s wait) | H1 masked line reveal; the second line lands 0.2s later with a slight skew. Then subtitle (0.75s), CTAs pop (0.95s), lesson card (1.05s), illustration (1.35s). The illustration only fades in and never moves (no float, no parallax). Then a scrubbed title scale/fade on scroll-out (desktop). | `sections/hero.ts` (timeline positions are the trailing numbers) |
| 3 | Hero lesson card | card top hits 80% of viewport (desktop) | A ghost cursor picks B and clicks check. The feedback expands, the "Správně" label pops (`back.out(1.4)`) and the progress fills. The lesson preview is a read-only illustration (no clickable answers or submit), so the demo always runs to its end state. | `sections/lesson-demo.ts › armHeroDemo` |
| 4 | Jak to funguje | shared reveals | Heading word reveal; the path card rises in once and the illustration fades in place. No pin, no scrub, no pulse. | `data-reveal` in `pen-landing.tsx` |
| 5 | Výstupy modulů | shared reveals | Heading word reveal; copy and the outputs list rise in. | `data-reveal` in `pen-landing.tsx` |
| 6 | Portfolio Lab | demo top hits 65% (75% on mobile); pin at `top top+=NAV_CLEARANCE` | Heading line reveal. The step-1 cost rows settle in one by one and the total lands last; the crisis drill draws the model index (`model-crisis-v1`, months 0–12) and marks the −30 % month. On desktops tall enough for the tallest step (`PORTFOLIO_PIN_QUERY`, em tiers from 1200 px wide) the demo and crisis drill pin for 3 × 720 px: scroll walks purchase → off-plan card → process feedback (`PORTFOLIO_STEP_EVENT`), a thin butter bar under the tabs shows progress, then the page scrolls on. Tabs and step buttons scroll to their step (`PORTFOLIO_STEP_REQUEST_EVENT`). Until the visitor picks an instrument, step 2 acts out the off-plan choice. Reduced motion, mobile and short windows keep plain tabs / stacked steps. | `sections/portfolio.ts` (`STEP_SCROLL`) |
| 7 | Trust | shared reveals | The illustration fades in place and the three items rise in with a stagger. | `data-reveal`, `data-reveal-stagger` in `pen-landing.tsx` |
| 8 | Final CTA | scroll | Heading char reveal (0.025s stagger; words on mobile), illustration fades in place (no movement), copy and actions reveal. | `sections/closing.ts` |
| 9 | Footer | footer enters viewport | Single fade-up | `initFooter` |

## Retuning

- **Global feel:** edit `EASE`, `DUR` and `REVEAL_Y` in `src/lib/gsap.ts`.
- **Add a reveal to new markup:** add `data-reveal` (`="fade"` for no movement, `data-reveal-delay="0.2"`, `data-reveal-stagger` for children). For headings, use `<SplitHeading mode="words|lines|chars">`.
- **Add a section:** write a `SectionInit` in `motion/sections/` and add it to `SECTIONS` in `motion-root.tsx`. Return a cleanup for any listeners. Tweens and ScrollTriggers created synchronously, or through `ctx.inContext(...)`, are reverted automatically.
- **Debugging:** add `markers: true` to a ScrollTrigger locally, and never commit it.

## Verified

- `npm run lint`, `typecheck`, `test` (743 passing) and `build` all pass.
- 375 / 768 / 1280 / 1920px: no hidden content under reduced motion or with JS disabled, no horizontal overflow, no console or hydration errors (dev and production).
- Nav anchors and footer anchors land at top = 0 and move focus to the target. The skip link focuses `#main`. `/#portfolio-lab` deep link re-lands after the pin.
- Navigating away and back: the pin spacer and the `lenis` classes are removed, then recreated once.
- Lighthouse mobile (production, median of 3, baseline `361e7ea` → now): Performance 89 → 88, CLS 0 → 0, TBT ~5 → ~30ms, LCP +~170ms (the H1 line reveal).
