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
  chart:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  compact: "6px"
  control: "8px"
  surface: "12px"
spacing:
  control-sm: "44px"
  control: "48px"
  control-lg: "52px"
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

### Direction: quiet precision (2026-11-13)

Studovna sets the character. *Quiet precision* is the standard of execution applied to it. It borrows the craft of products such as Linear, Vercel, Raycast and Stripe, not their look. Investník stays warm paper and teal. It does not become a dark terminal, a gradient SaaS page or a trading dashboard. What it takes from those products:

1. **Few values, used exactly.** Every size, height, width, radius, shadow and easing is a named token with one job. A screen that needs a value the scale lacks is a design question, not a reason for `text-[15px]`. The [audit](docs/ui-overhaul/AUDIT.md) traced most of the missing cohesion (P1-09, P2-12) to values chosen per screen.
2. **Hierarchy from type and space before surfaces.** A section earns a border or a card only when space alone cannot group it. Most product screens need one raised surface, the dominant task, and quiet rows for everything else.
3. **One filled action per view.** Teal fill means "this is the next step". Two filled buttons on one screen make neither of them the next step.
4. **State is written down.** Every status carries text or an icon. Colour and motion only reinforce it. Missing data says „Nedostupné“, never 0.
5. **Motion explains and stays rare.** It shows where something came from or confirms an input. It never decorates frequent paths, and it never celebrates trading.

**Why this direction rather than a new look.** The audit found no P0, no axe violations and no overflow. What it found was drift: 37 font sizes, three numbering systems and a shell styled twice. A new palette would add a second system on top of that drift. Tightening the existing one makes every screen feel like the same product, and it keeps the learner-facing identity approved in October. Layout alternatives for the main screens are explored separately ([Learn variants brief](docs/ui-overhaul/LEARN-VARIANTS.md)). None of them is adopted until the founder picks one.

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

**The One Fill Rule.** One element per view gets the filled Action Teal background: the next step. Peers use `secondary`; links stay text. Several tinted surfaces are fine when they encode different states (current lesson, correct answer), never when they compete as equal actions.

**Use a role, not a value.** Components reference semantic tokens only. A token is never borrowed for its current value: a divider colour used as text breaks the day dividers get lighter. If a role is missing, add the role to `tokens.css` (and the contrast test) rather than reusing a neighbour.

**Dark mode** is not part of the system yet. Every pair is validated on paper only. Adding it means a second validated value per role under one switching mechanism, not inverted light values (see Decisions awaiting approval).

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

### Type roles

Each role is one decision: size, line height, weight and tracking together. Product screens use only these roles through `text-*` utilities (or `var(--text-*)` in CSS modules). Heading levels take descending roles within a section.

| Role | Size / line height | Weight · tracking | Use |
| --- | --- | --- | --- |
| `page-title` | 36–48px fluid / 1.08 | Manrope 600 · `tracking-heading` | One per route, the `h1` |
| `section-title` | 28px / 1.2 | Manrope 600 · `tracking-heading` | Major regions (`h2`) |
| `card-title` | 20px / 1.35 | Manrope 600 · `tracking-heading` | Card and panel headings (`h3`) |
| `emphasis` | 18px / 1.5 | Inter 400–600 | Lead sentences, question stems inside cards |
| `body` | 16px / 1.6 | Inter 400 | Reading text, answers, inputs |
| `small` | 15px / 1.55 | Inter 400–600 | Secondary copy, control labels, table cells |
| `microcopy` | 13px / 1.45 | Inter 400–600 | Metadata, timestamps, hints. **Floor for UI text** |
| `label` | 12px / 1.2 | Inter 600 · `tracking-label`, `uppercase` | Section eyebrows only, never sentences |
| `chart` | 12px / 1.2 | Inter 400 | Axis ticks and legends inside a plot only |

Marketing display sizes and the lesson-title sizes above stay route-scoped. `tracking-display` (-0.036em) belongs to display-size Manrope (≥ 40px). Body text keeps 0 tracking. Changing values (prices, balances, counters, table columns) use `tabular-nums`; figures in prose stay proportional. Font smoothing is set once on `.investi-theme`.

**Why 15 and 13 instead of Tailwind's 14 and 12.** Inter at 14px sits between body and caption without being either, and it became the most-used off-scale size (`text-sm` ×59). Two clearly different steps read as hierarchy; three close ones read as noise. **WP-01** migrates the existing off-scale sizes and adds the lint.

**The One Pairing Rule.** Manrope and Inter are the only families. They load once in the root layout and are used through `--font-display` and `--font-sans`; components never name a font file or variable directly.

## Layout

The desktop container caps at (1440px), with (64px) gutters and (72px) top padding. The continuation surface has a flexible exercise column plus a (392px) recap. Below it, curriculum and a (400px) supporting rail are separated by (72px), with (112px) between major regions. These are Studovna composition values, not mandatory widths for every future screen.

At tablet widths (768–1199px), gutters become (40px); recap and supporting rail narrow. At (768–899px), recap and supporting cards reflow beneath their main content. Below (768px), the page becomes a single column with (20px) gutters, a full-width primary action, native chapter and recap disclosures, and a fixed bottom tab bar. Below (360px), gutters become (16px). Desktop shell navigation appears from (1024px).

### Content widths

`PageFrame` picks one of these widths; nothing else sets an arbitrary `max-w-[…]`.

| Token (`max-w-*`) | Value | Use |
| --- | --- | --- |
| `reading` | 48rem (768px) | Single-column reading and forms (IPS, Settings sections) |
| `focused` | 56rem | A focused task with a short side note |
| `standard` | 64rem | Default authenticated page |
| `wide` | 72rem | Lab hub, Portfolio Lab, Progress |
| `data` | 80rem | Instrument detail, comparison: chart-heavy pages |
| `shell` | 90rem (1440px) | Header, lesson chrome, Studovna composition |

Long-form text inside any width is capped at 65ch.

### Spacing rhythm

A 4px base (`--space-*`, and Tailwind's spacing scale, which is the same 4px multiple). Inside one group, 8–12px; between groups, at least twice that (16–24px); between page regions, 48–72px. Group with space first, a tinted surface second and a divider last. Content padding is 16px on phones, 20–24px on tablets and 28–32px inside desktop cards.

### Grid and breakpoints

There is no global 12-column grid. Each composition declares its columns with `minmax(0, 1fr)` tracks (a main column plus a fixed rail of 320–400px) and collapses when the content stops fitting, not at a device width. The shared thresholds are 360px (16px gutters), 768px (single column below, bottom tab bar), 900px (rails reflow under main content) and 1024px (desktop shell navigation).

Text wraps and content stays in flow as it grows. Chapters narrower than (18rem) reflow the title beneath the number and toggle, and place lesson status beneath its text. This supports increased text size without squeezing headings into narrow columns. Validate 1440, 1024, 768, 390, 375, and 320px plus 200% text without horizontal overflow.

## Elevation & Depth

Depth comes mainly from warm tonal surfaces, borders, and spacing. The continuation surface receives the Card shadow; navigation remains flat. The Popover shadow is reserved for raised account controls.

### Shadow Vocabulary

- **Card:** `0 12px 24px #1717170c` — light separation for the dominant learning surface.
- **Popover:** `0 12px 28px #17171724` — stronger elevation for transient controls.

**The Quiet Depth Rule.** Use surfaces and hierarchy first; shadows should clarify layering rather than decorate every section.

## Shapes

Controls and answer options use the Control radius (`--radius-control`, 8px); content containers use the Surface radius (`--radius-surface`, 12px). Badges, tags and small inline markers use Compact (`--radius-compact`, 6px). Borders are thin and warm. Radio indicators, completion markers, avatars and the allocation ring are circular because their function calls for it. Desktop navigation is text and an underline; mobile tabs avoid filled pills.

**Three radii, no others.** 6 / 8 / 12px plus circles. A nested surface with an even inset takes the outer radius = inner radius + padding up to 24px of padding; beyond that, each layer keeps its own token. The literal 2, 3, 4 and 10px radii in older modules move to the ladder in WP-01.

## Icons

Lucide is the only icon family. Icons use `currentColor` and take every state from text colour. Outline is the default; a heavier stroke (2.5) marks only the active mobile tab.

| Token (`size-icon-*`) | Size | Sits beside |
| --- | --- | --- |
| `xs` | 14px | `microcopy`, inline status |
| `sm` | 16px | `small`, buttons, links with arrows |
| `md` | 18px | `body`, list rows, menu items |
| `lg` | 20px | `card-title`, navigation |
| `xl` | 24px | Empty and error states |

Default stroke is 2 (renders about 1.3–1.5px at these sizes, matching Inter 400–600). A decorative icon has `aria-hidden="true"`; a meaningful one has a label or adjacent text. Nudge trailing arrows and play glyphs optically: a button with an icon on one side takes 2px less padding on that side. Prefer `className="size-icon-md"` over the `size={18}` prop in new code so icons scale with the reader's font size.

## Controls and states

| Token (`h-*`, `min-h-*`, `size-*`) | Height | Use |
| --- | --- | --- |
| `control-sm` | 44px | Inline and dense secondary controls; the touch-target floor |
| `control` | 48px | Inputs, selects, compact buttons, icon buttons, menu rows |
| `control-lg` | 52px | The primary learning action (`Button` default) |

Horizontal padding is 16px for compact controls and 22px for the default button. One control row uses one height.

Every interactive element has the same five states:

| State | Treatment |
| --- | --- |
| Rest | Its variant's surface and an outline (`border-strong`) when it is not filled |
| Hover (pointer devices only) | One step darker (`primary-hover`) or `surface-muted`, 160ms. Never movement |
| Pressed | `primary-pressed` (WP-11 adds `scale(0.96)` under `motion-safe`, never on disabled) |
| Focus-visible | 3px Ink outline, 4px offset, on every element; never removed |
| Disabled / pending | `track` fill with `disabled` text, `cursor: not-allowed`; pending also sets `aria-busy` and a 16px spinner. Prefer keeping submit enabled and explaining invalid input |

Selected and current items use `primary-soft` with `primary` text plus an icon or `aria-current`; colour is never the only cue.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--motion-micro` | 180ms | Colour and border feedback |
| `--motion-surface` | 270ms | Panels and sheets |
| `--motion-entry` | 400ms | Rare entrances (onboarding, completion) |
| `--ease-out` / `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Anything entering or responding to input |
| `--ease-drawer` / `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Edge-attached sheets |
| `--ease-standard` | `cubic-bezier(0.2, 0.75, 0.25, 1)` | Existing on-screen movement |

`--ease-out` replaces Tailwind's default curve on purpose, so the `ease-out` utility and the CSS variable are one curve. Frequency decides whether something animates: navigation, tabs, keyboard actions and lesson steps never do; sheets and dialogs do; completion moments may stagger. Constant motion (progress loops) is `linear`. Exits are shorter than entries. Under reduced motion the root rule removes movement. Opacity-only fallbacks are decided per WP-10.

## Components

### Buttons

Confident, quiet, and direct. There is one button component, `Button` (`src/components/ui/button.tsx`), with `primary`, `secondary`, `ghost`, `danger` and `dangerQuiet` variants and `default` (`control-lg`, 52px), `compact` (`control`, 48px) and `icon` (48px square) sizes. The primary action uses the frontmatter button tokens with a minimum height of (52px), Inter (600), and an optional directional icon. Hover and press darken the background over (160ms ease-out); the enclosing learning theme disables transition and animation durations for reduced motion. Pending state shows “Ukládám…”, disables the control, and exposes busy state. Visible focus uses an Ink outline (3px) with (4px) offset.

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
- **Don't** add glow, gradient text, trading-terminal styling, or decorative finance objects.
- **Don't** shrink essential text to solve responsive overflow.
- **Don't** change lesson completion, auth, financial accounting, rewards, persistence, or server authority during visual work.
- **Don't** add an arbitrary size, width, height, radius or easing. Use the role, or propose a new role here first.

## Decisions awaiting approval

The foundation above changes no screen's layout. These choices change what learners see. They wait for a founder decision, in addition to D1–D5 in [PLAN.md](docs/ui-overhaul/PLAN.md).

| # | Question | Options | Recommendation |
| --- | --- | --- | --- |
| F1 | Layout direction for Learn, the template for Progress and Lab | A „Pracovní stůl“ (focused single column) · B „Pracoviště“ (side-rail workspace) · C „Cesta k plánu“ (milestone first). See [the brief](docs/ui-overhaul/LEARN-VARIANTS.md) | Compare live first. Each one sets the IA for WP-06 and WP-12 |
| F2 | Desktop navigation | Top text nav with underline (today) · left rail (needed by variant B) | Keep the top nav unless B wins |
| F3 | Elevation | Keep the single soft drops · crisper layered shadows (hairline ring + short drop) for the one raised surface and popovers | Prototype on the continue card before changing the tokens |
| F4 | Density on data screens | 52px primary everywhere · `control` (48px) as the default on Lab and Settings, `control-lg` only for the learning action | 48px on Lab and Settings |
| F5 | Gains and losses colour (audit P2-04) | Ink plus sign and arrow · a new `viz-negative` / `viz-positive` pair that is not `danger` | Ink plus sign and arrow |
| F6 | Dark mode | Not now · a validated second value per role behind one switch | Not now. Nothing in the product needs it yet, and it doubles contrast validation |
