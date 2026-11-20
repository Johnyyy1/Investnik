---
name: Investník
description: The one Investník design system (paper and teal) for marketing and product.
colors:
  background: "#f7f2e8"
  foreground: "#171717"
  secondary: "#41443e"
  muted: "#55594f"
  disabled: "#6b6e66"
  surface: "#fffcf7"
  surface-muted: "#efece3"
  surface-sunken: "#f7f5ef"
  surface-practice: "#eff1e9"
  primary: "#236f66"
  primary-hover: "#1c665e"
  primary-pressed: "#195b53"
  progress: "#2f8f83"
  primary-soft: "#e6f0e9"
  border-card: "#cbc9bf"
  border: "#d5d2c8"
  divider: "#e3e0d7"
  border-strong: "#73776d"
  track: "#e4e5dc"
  warning: "#f1c75b"
  warning-soft: "#fbf1d6"
  warning-ink: "#765717"
  danger: "#a63d28"
  danger-soft: "#f6e6e0"
  info-soft: "#e7ebf3"
  info-ink: "#38557a"
  viz-bonds: "#6468d8"
  viz-cash: "#a88a2e"
  viz-other: "#8f9187"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.036em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.036em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.083em"
rounded:
  control: "8px"
  surface: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  mobile-gutter: "20px"
  lg: "24px"
  xl: "32px"
  panel: "40px"
  desktop-gutter: "64px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#fff"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-pressed}"
  button-primary-pending:
    backgroundColor: "{colors.track}"
    textColor: "{colors.disabled}"
  answer-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "16px 20px"
  answer-correct:
    backgroundColor: "{colors.primary-soft}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.surface}"
    padding: "28px"
  navigation-mobile-active:
    textColor: "{colors.primary}"
---

# Design System: Investník

## Overview

**Creative North Star: "Studovna"**

A calm place to return to a learning decision. Warm paper, clear ink, generous separation, and a restrained teal action give the authored exercise priority. The supplied guide adds encouragement at welcome, continuation, and completion; real lesson content and learner state provide the substance.

This is the implemented system from the approved Pen.dev boards `V7mUpG`, `QB1gf`, `liRhy`, and `mAWd8`. The onboarding extension follows `wKThC` (desktop), `Ui4uz` (mobile), `Z9Mlw` (plans), `XFfjW` (components), and `V507P` (guide library). It is the only visual system: the root layout applies `.investi-theme` once, so marketing, auth, onboarding, Learn, focused lessons, Lab, Portfolio Lab, Backtesting, Progress, Settings, legal and error pages share the same tokens, fonts and primary action. The earlier Nunito Sans / Investi Blue theme and its `ql-*` aliases were retired in #47.

Source authority: [tokens.css](src/styles/tokens.css) (every colour, radius, shadow, font and type-scale token), [fonts.ts](src/styles/fonts.ts) (font loading), [Button](src/components/ui/button.tsx) (the one button style), [Studovna CSS](src/components/learning/studovna-page.module.css), [shell CSS](src/components/shell/paper-shell.module.css), [Studovna components](src/components/learning/studovna-page.tsx), [onboarding CSS](src/components/personalization/personalization-flow.module.css), [onboarding flow](src/components/personalization/personalization-flow.tsx) and [saved plan](src/components/personalization/study-plan.tsx). Frontmatter records the tokens and recurring values; the sidecar adds stateful previews and metadata. Its generated tonal ramps are swatch previews, not additions to the runtime palette. The onboarding composition and behavior are recorded in [docs/onboarding.md](docs/onboarding.md); token usage rules are in [docs/design-system.md](docs/design-system.md). Product constraints remain in [PRODUCT.md](PRODUCT.md) and [AGENTS.md](AGENTS.md).

**Key Characteristics:**

- Warm paper with crisp, readable text.
- One dominant learning action and quieter supporting context.
- Manrope headings with Inter controls and explanation.
- Real state, explicit feedback, and intentional mobile reflow.
- Liquid glass as an accent material where there is light behind it (see [Liquid Glass](#liquid-glass)). Paper and teal remain the system; glass never replaces a reading surface.

## Colors

The palette combines warm neutrals with dark teal actions; brighter teal serves progress and data graphics.

### Primary

- **Action Teal (`primary`):** primary actions, active states, links, and correct feedback; hover and pressed tokens provide restrained darkening.
- **Graphic Teal (`progress`):** progress fills and equity segments. Its brighter tone has a separate role from action text.
- **Soft Teal (`primary-soft`):** current lesson rows and correct answer backgrounds.

### Secondary

- **Butter (`warning`):** the system's warm attention accent, paired with its tint and readable ink; it is not a default action color.
- **Information Blue (`info-ink`, `info-soft`):** information states and ETF segments. Bonds, cash, and other categories retain their dedicated visualization tokens.
- **Error Ink (`danger`):** wrong-answer borders and recoverable error text, supported by Error Tint (`danger-soft`) where a tinted error surface is needed.

### Neutral

- **Paper / Paper Surface (`background`, `surface`):** the page and readable content surfaces.
- **Practice Surface / Muted / Sunken:** quiet separation for recap and supporting context.
- **Ink / Secondary / Muted / Disabled (`foreground`, `secondary`, `muted`, `disabled`):** ordered text emphasis; muted metadata remains readable.
- **Card Border / Paper Border / Divider:** increasingly quiet structural separation.
- **Control Outline / Track:** visible interactive boundaries and unfilled progress.

**The Two Teals Rule.** Use Action Teal for readable interaction and Graphic Teal for progress or graphics; preserve their separate semantic roles.

## Typography

**Display Font:** Manrope, with sans-serif fallback.
**Body Font:** Inter, with sans-serif fallback.

Manrope gives headings a friendly, compact shape; Inter keeps decisions, explanations, and data easy to scan. Both are loaded through `next/font` with Latin and Latin Extended support.

### Hierarchy

- **Display:** the frontmatter display style is the desktop greeting; mobile uses (2.5rem), preserving its weight and line height.
- **Headline:** curriculum headings use the headline style; mobile uses (1.75rem).
- **Title:** questions use the title style; mobile uses (1.5rem). Lesson titles use (2.375rem / 1.15) on desktop and (1.5625rem / 1.16) on mobile.
- **Body:** the body style supports explanation and answer choices; supporting text ranges from (0.8125rem) metadata to (0.9375rem) recap copy. Longer preview explanation is bounded to (65ch).
- **Label:** the label style is uppercase for section eyebrows. Ordinary navigation and status labels remain sentence case.
- **Wordmark:** the shared `Wordmark` component (`src/components/brand/wordmark.tsx`): the í symbol on a teal tile plus „Investník“ in Manrope (800), tracking -0.035em, sized in em by the caller's class; ordinary headings remain (600). Running text, titles and aria-labels say „Investník“, and a wordmark link names its target (`Investník · úvodní stránka`, `Investník · Učení`). [docs/brand.md](docs/brand.md) lists the symbol, icons and social image.

**The One Pairing Rule.** Manrope and Inter are the only families. They load once in the root layout and are used through `--font-display` and `--font-sans`; components never name a font file or variable directly.

## Layout

The desktop container caps at (1440px), with (64px) gutters and (72px) top padding. The continuation surface has a flexible exercise column plus a (392px) recap. Below it, curriculum and a (400px) supporting rail are separated by (72px), with (112px) between major regions. These are Studovna composition values, not mandatory widths for every future screen.

At tablet widths (768–1199px), gutters become (40px); recap and supporting rail narrow. At (768–899px), recap and supporting cards reflow beneath their main content. Below (768px), the page becomes a single column with (20px) gutters, a full-width primary action, native chapter and recap disclosures, and a fixed bottom tab bar. Below (360px), gutters become (16px). Desktop shell navigation appears from (1024px).

Text wraps and content stays in flow as it grows. Chapters narrower than (18rem) reflow the title beneath the number and toggle, and place lesson status beneath its text. This supports increased text size without squeezing headings into narrow columns. Validate 1440, 1024, 768, 390, 375, and 320px plus 200% text without horizontal overflow.

## Elevation & Depth

Depth comes mainly from warm tonal surfaces, borders, and spacing. The continuation surface receives the Card shadow; navigation remains flat. The Popover shadow is reserved for raised account controls.

### Shadow Vocabulary

- **Card:** `0 12px 24px #1717170c` — light separation for the dominant learning surface.
- **Popover:** `0 12px 28px #17171724` — stronger elevation for transient controls.

**The Quiet Depth Rule.** Use surfaces and hierarchy first; shadows should clarify layering rather than decorate every section.

Glass adds one more layer above these: chrome that floats over content (navigation, segmented controls, frames, sheets). Its shadows and highlights are part of the material and are defined in [Liquid Glass](#liquid-glass), not added per screen.

## Shapes

Controls and answer options use the Control radius (`--radius-control`, 8px); content containers use the Surface radius (`--radius-surface`, 12px). Borders are thin and warm. Radio indicators, completion markers, and the allocation ring are circular because their function calls for it. Desktop navigation is text and an underline; mobile tabs avoid filled pills.

The landing page already uses the softer Liquid Glass shape scale (pill actions, 14–48px containers); product screens keep 8/12px until that scale is promoted to tokens (see [Liquid Glass › Shapes](#shapes-1)).

## Components

### Buttons

Confident, quiet, and direct. There is one button component, `Button` (`src/components/ui/button.tsx`), with `primary`, `secondary`, `ghost`, `danger` and `dangerQuiet` variants and `default` (52px) and `compact` (48px) sizes. The primary action uses the frontmatter button tokens with a minimum height of (52px), Inter (600), and an optional directional icon. Hover and press darken the background over (160ms ease-out); the enclosing learning theme disables transition and animation durations for reduced motion. Pending state shows “Ukládám…”, disables the control, and exposes busy state. Visible focus uses an Ink outline (3px) with (4px) offset.

### Cards / Containers

The dominant learning card joins exercise and recap into one surface rather than separate equal-weight panels. Recap uses Practice Surface. Curriculum chapters and supporting cards use quieter borders and the Paper Card radius. Supporting cards use (28px) padding; mobile content reflows rather than compressing essential text.

### Inputs / Fields

Answer choices are native labeled radios within a fieldset, presented as full-width options with a minimum height of (55px). Selection is followed by an icon and explanatory feedback: correct uses Soft Teal and Action Teal, incorrect uses Error Ink. Radio keyboard behavior remains native. Focus outlines the whole answer option (3px, offset 3px); pending save disables the fieldset.

### Navigation

Desktop navigation uses quiet Inter text with an Action Teal underline for the current destination. The existing Learn, Lab, and Progress routes remain the information architecture. Mobile tabs use icons, labels, and active teal with minimum height (52px), preserving the safe-area inset. Account controls remain in the header and settings remain in the account area.

### Chapter Disclosure

Learn and Progress share a registry-driven map of levels containing display modules and semantic lesson lists. The level containing the saved continuation starts expanded at every viewport size; other levels start collapsed, and all remain native keyboard-operable disclosures. The Continue learning card remains the dominant action above the Learn map. Display placement and codes do not replace stable lesson identities or existing lesson URLs.

Level summaries show completed and available lesson counts with a written status. Expanded levels add a thin, labeled meter for available lesson completion and module-level status; modules without published lessons say “Připravujeme”. Completed, active, next, and unstarted lesson rows combine text and icons, and only the continuation lesson has `aria-current="step"`. Narrow screens move lesson status below its title and reflow level headings rather than shrinking essential text.

The optional analyst, quantitative, and advanced levels sit under “Prohloubení”. Milestones A–D are goals with their practical requirements and an explicit notice that completion is not yet evaluated; available-lesson percentages never represent mastery or milestone completion. Use semantic Paper, divider, muted-text, primary, primary-soft, and progress tokens to organize the map without adding a card around every level.

### Portfolio Summary

The read-only allocation ring is paired with a textual legend and values from the existing portfolio view. ETF is a distinct category. Locked, empty, unavailable, and incomplete valuation states use explicit copy rather than illustrative balances or made-up segments. Sample market data remains labeled.

### Portfolio process feedback

Portfolio Lab leads with explainable process feedback: position concentration, recorded costs, trading volume, and comparison with the learner's IPS. Portfolio value, cash, holdings and MWR/TWR remain visible as context. Use a semantic list with the value, explicit criterion, written status and an expandable calculation for each indicator. Never replace this with an aggregate score or an invented universal allocation, concentration limit or cash target. Missing data or an unsupported IPS comparison means unavailable, never failure.

Trading must not earn XP, Practice Capital, confetti, celebratory motion, rankings, return leaderboards or lottery rewards. Do not add price-movement notifications or inactivity prompts to trade. A calm execution receipt is confirmation, not a reward. Keeping the plan or waiting can be successful outcomes; process feedback must not pressure a trade.

The 2026-10-22 audit of the Portfolio Lab, instrument order flow and portfolio actions found structured execution receipts, no trade celebrations, no leaderboards and no price notification mechanism. The sparkle icon beside “Co se stalo?” identifies a static explanation, not a trading celebration. These are permanent product constraints. Calculation conventions and current limitations are in [docs/portfolio-process.md](docs/portfolio-process.md).

## Liquid Glass

**Status.** Adopted by the founder on 2026-11-20 for the landing page, which is the reference implementation (branch `proto/liquid-glass-landing`). It is the target direction for the remaining marketing pages and for the product redesign. Product screens adopt it screen by screen under the rules below; until a screen is redesigned, the sections above still describe it.

**The Glass-Where-Light-Is Rule.** Glass only goes where something behind it can be bent: ambient light, a lit dark stage, a slab with its own light, or content scrolling underneath. On flat paper, frosted glass reads as a dirty white card, so use a plain `surface` instead. This rule decided every change on the landing page: the full-glass version (every card frosted) was rejected for flattening hierarchy and reading as card soup.

### Materials

| Material | Where | Recipe (landing values) |
| --- | --- | --- |
| **Frosted** (`.glass`) | Closing slab and the base of the nav pill; a lighter variant for secondary buttons (`white/40%`, `blur(12px)`) | Background `linear-gradient(155deg, white/62%, surface/46% 42%, surface/34%)`; `backdrop-filter: blur(22px) saturate(175%)`; 1px `white/50%` border; inset highlights `0 1px 0 white/90%`, `0 -1px 0 white/28%`, `0 0 28px white/22%`; drop shadow `0 28px 60px -28px ink/30%`. A masked `::before` draws a specular rim (bright top-left and bottom-right). An `::after` adds a pointer-tracked highlight (`--mx`, `--my`, fine pointers only). |
| **Clear lens** (`.lens`) | Floating navigation only | Background `white/42% → white/16%`; `blur(6px) saturate(180%)`. In Chromium, `html[data-refract]` adds the SVG filter `#lg-lens` (low-frequency `feTurbulence` displacement, scale 22), so text scrolling under the bar visibly bends. Other browsers keep the frosted fallback. |
| **Smoked** (dark glass) | Controls and cards on a dark stage | Background `white/8% → white/3%`; 1px `white/12%` border; `blur(20–24px)` with **saturation ≤ 110%** (higher saturation tints it brown over warm light); inset `0 1px 0 white/14%`. |
| **Glass frame** | Around a live demo or preview | A 6–10px glass bezel (`white/62% → white/22%`, `blur(16px)`) around an **opaque** surface card. The content stays crisp; the frame carries the material. |
| **Liquid teal** | Primary marketing action | Pill; `linear-gradient(180deg, primary mixed 90% with white, primary 52%, primary-pressed)`; border primary mixed 55% with white; inset `0 1px 0 white/40%` and `0 -3px 8px black/16%`; coloured shadow `0 12px 26px -12px primary`. Hover `brightness(1.08)`, press `brightness(.94)`. White text stays ≥ 4.5:1 across the gradient. |

### Where glass goes, and where it never goes

**Use it for chrome and framing:**
- the floating navigation pill;
- segmented controls, such as the Lab step tabs as one track with a surface-coloured selected segment;
- badges and short principle chips on a dark stage;
- frames around demos;
- the closing CTA slab with its own light;
- in product: app header, mobile tab bar, sheets, popovers and dialog chrome, toolbars over scrolling content.

**Never put it on reading or data surfaces:**
- lesson text, explanations and answer options;
- tables, numbers and forms;
- the Portfolio Lab panel, which stays opaque. A translucent panel turned grey over the dark stage and let the crossfading step panels show through each other.
- the course-path card, which stays opaque with a timeline.

**Also never:**
- nest glass inside glass. An element with `backdrop-filter` is a backdrop root, so a glass child only sees its parent. The mobile menu inside the nav pill therefore uses a near-opaque surface.
- use more than about six glass elements per viewport.

### Light

Light is what glass bends, so each section gets at most two light sources, all built from palette tokens with `color-mix`:

- **Ambient field (hero).** Four radial colour fields (progress, warning, primary-tint, primary-soft) drift slowly (`transform` only, 29–47s, alternate). They are absolutely positioned behind the hero only (135vh) and masked to fade out before the next section.
- **Dark stage (Lab).** `ink` with one spotlight from above (`progress` 42%) and a low `primary` 26% glow. It is a rounded sheet (`border-radius: clamp(28px, 3vw, 48px)`) inset `clamp(8px, 1.2vw, 20px)` from the viewport edges, never a hard full-bleed cut.
- **Section tint.** The light band (lesson section) gets a `primary-tint` 45% glow behind its demo and a faint `warning` 22% glow in a corner.
- **Slab light.** The closing slab sits on a `progress` and `warning` glow of its own.

Avoid warm (`warning`) light directly behind smoked glass, because it reads as brown.

### Shapes

| Element | Radius |
| --- | --- |
| Actions, nav, chips, segmented tracks | pill (`999px`) |
| Small tiles (outputs, Lab tools) | 14–16px |
| Cards and panels (path card, Lab panel, crisis card) | 20–22px |
| Frames and slabs | 28–40px |
| Dark stage | `clamp(28px, 3vw, 48px)` |

Proposed tokens for the product rollout: `--radius-tile: 14px`, `--radius-card: 20px`, `--radius-frame: 32px`, alongside the existing `pill`. Controls inside forms keep the 8px control radius, because pill inputs read as search fields.

### Navigation

The marketing nav is a sticky floating pill (`min(1180px, 100% - 48px)`, 64px tall, 16px from the top) that **always stays visible**: it no longer hides on scroll. Over a dark stage it switches to a dark variant (`data-on-dark`: smoked glass, paper text, paper focus outline). Anything pinned by the motion layer starts below it (`NAV_CLEARANCE`, 88px, in `motion/sections/global.ts`), and in-page anchors stop 24px lower.

### Composition patterns from the landing

- **Centred statement.** On a dark stage: badge (dot plus eyebrow), Manrope headline whose second clause is muted (`paper` at 58%, no gradient text), a lead of at most 600px, three principle chips and a fine-print note.
- **Timeline list.** Steps of a path: 28px status dots on a 2px `progress` → `primary-tint` spine, a title and a one-line detail, and a status pill (`primary-soft`, or filled teal for the recommended next step). Secondary destinations become small tiles under it.
- **Artifact tiles.** Saved outputs as a two-column grid of icon tiles. Unavailable items get a dashed border and a muted icon, plus the „Připravujeme“ text.
- **Framed demo.** A live preview inside a glass frame, with its disclosure line inside the frame.

### Accessibility

- `prefers-reduced-transparency: reduce` replaces every glass material with an opaque `surface` and removes the ambient field.
- `prefers-reduced-motion` stops the drift and all transitions, as before.
- Measure text contrast against the worst backdrop that can pass beneath the element: dark stage, illustration or scrolling headline. Muted text over a coloured field is the main risk.
- Status still uses text or an icon, not tint alone.
- Large muted headline clauses must stay ≥ 3:1. Body text on glass must stay ≥ 4.5:1.

### Performance

- `backdrop-filter` is the cost, so keep the number of glass elements low and never animate blur values.
- Light fields animate `transform` only.
- Refraction is limited to the nav.
- Test on a mid-range phone before adding glass to a scrolling list.

### Implementation map

- [liquid-glass.tsx](src/components/marketing/liquid-glass.tsx): ambient field, the `#lg-lens` filter, the Chromium `data-refract` flag and the pointer highlight.
- [pen-landing.module.css](src/components/marketing/pen-landing.module.css): materials, nav, light and section patterns in the blocks after "Liquid glass prototype".
- [portfolio-lab-demo.module.css](src/components/marketing/portfolio-lab-demo.module.css): Lab panel, segmented tabs and smoked crisis card.
- [motion/sections/global.ts](src/components/marketing/motion/sections/global.ts): sticky nav, dark-variant trigger and `NAV_CLEARANCE`.

### Rolling out to the product

1. **Promote the material first.** Add `--glass-*` tokens (backgrounds, border, highlight, shadow, blur) and the new radii to `tokens.css`. Add a shared `glass` utility, or a `Button` variant for the liquid action, so screens never copy recipes. Extend `tokens.test.ts` with the contrast pairs above. Then replace the marketing-local copies.
2. **Per screen,** decide which elements float over content: header, tab bar, sheet, toolbar. Only those become glass. Lesson renderers, answer options, data panels, tables and forms stay opaque.
3. **Lesson UI** comes from the approved Pen designs ([learning and facts](docs/agents/learning-and-facts.md)). Restyling step renderers needs an updated design export first.
4. **Light:** product screens get at most a quiet section tint. Ambient fields and dark stages remain marketing devices unless a screen is explicitly designed around them.
5. **Validate** at 1440, 1024, 768, 390, 375 and 320px and at 200% text, with reduced transparency and reduced motion on, in Chromium, WebKit and Firefox, plus axe.

## Do's and Don'ts

### Do:

- **Do** preserve semantic token roles and visible focus.
- **Do** let the authored learning interaction and its next step dominate.
- **Do** pair feedback and data color with explanation, labels, or icons.
- **Do** preserve the supplied guide assets and their [manifest provenance](public/investi-assets/manifest.json).
- **Do** build every button-like action from `Button`, `ButtonLink` or `buttonVariants()`; screen CSS adds layout only.
- **Do** use semantic tokens from `styles/tokens.css`; marketing may keep the illustration-only tints documented in `pen-landing.module.css`.

### Don't:

- **Don't** turn supporting content into an equal-priority dashboard card grid.
- **Don't** replace unavailable data with invented portfolio graphics or zero values.
- **Don't** add glow, gradient text, trading-terminal styling, or decorative finance objects. The soft light fields behind glass are the only exception, and they follow [Liquid Glass › Light](#light).
- **Don't** put glass on reading or data surfaces, nest glass, or use frosted glass on flat paper where nothing sits behind it.
- **Don't** shrink essential text to solve responsive overflow.
- **Don't** change lesson completion, auth, financial accounting, rewards, persistence, or server authority during visual work.
