# Investník UI overhaul plan

This plan turns the findings in [AUDIT.md](AUDIT.md) (stamped at `origin/main` 37c412b, 2026-11-12) into ordered, independently shippable work. It designs nothing new. Each work package names the audit IDs it closes, the files to touch, the exact target, its guardrails and how to verify it.

## Ground rules for every package

- **One package = one issue = one worktree = one PR** ([WORKTREES.md](../../WORKTREES.md)). Read `docs/agents/ui-and-design.md`, `DESIGN.md` and `docs/design-system.md` before starting.
- **Presentation only** unless the package says otherwise. Do not change schema, migrations, reward or financial logic, auth semantics, persistence or server authority (`AGENTS.md` §33). If a UX change needs a domain change, stop and open a follow-up.
- **Prefer deletion, then existing tokens and components** (`RouteState`, `Button`, `text-*` tokens, `--radius-*`), and add something new only when neither fits.
- **Gates per PR:**
  - `npx next typegen && npm run lint && npm run typecheck && npm test && npm run build`.
  - The browser suites that cover the touched routes (listed per package).
  - Re-run the audit sweep: 0 overflow at 1440/1024/768/390/320 and 0 axe violations at 1440/390.
- **Decisions first.** Packages marked ⚑ need a founder or product decision before implementation. Do not guess the answer.

## Decisions needed (⚑)

| # | Question | Blocks | Options |
| --- | --- | --- | --- |
| D1 | Gender-neutral name for milestone A („Připraven/a začít“ breaks the `PRODUCT.md` voice rule, but `docs/agents/product-and-curriculum.md` uses it) | WP-03 | „Připraveno k začátku“ · „Start s plánem“ · keep it (and amend `PRODUCT.md`) |
| D2 | Mascot scope: `ui-and-design.md` §7 says onboarding, completion, milestone and empty states; `DESIGN.md` adds welcome and continuation | WP-09 | Strict §7 · §7 + Learn continuation · status quo (amend §7) |
| D3 | The landing lesson demo: keep a read-only illustration with honest copy, or make it a real local-state choice | WP-05 | (a) interactive · (b) copy-only |
| D4 | What Progress is for once the curriculum map moves out | WP-06 | Milestone-first (recommended) · mastery-first |
| D5 | Single term for the mixed checkpoint | WP-03 | „Smíšená kontrola“ (recommended: Czech, already in milestone copy) · „Checkpoint“ |

## Phases and sequence

```
Phase 0 (foundations, 1–2 d) ─► Phase 1 (shell & states, 2–3 d) ─► Phase 2 (IA & hierarchy, 4–6 d) ─► Phase 3 (polish & motion, 2–3 d)
  WP-01 type & radius tokens        WP-04 shell override removal      WP-06 Learn/Progress split ⚑     WP-10 sheet & dialog motion
  WP-02 global CSS fixes            WP-07 one RouteState              WP-08 Portfolio hierarchy        WP-11 button press + motion tokens
  WP-03 terminology ⚑               WP-05 landing demo ⚑              WP-12 Lab hub priority           WP-13 feedback & completion motion
                                    WP-14 identity naming             WP-15 lesson numbering           WP-09 mascot scope ⚑
                                                                                                       WP-16 P2/P3 sweep
```

WP-01 lands first because almost every later package touches type sizes. WP-04 lands before any shell work. WP-06, WP-12 and WP-15 share the curriculum registry, so serialize them.

## Work packages

### WP-01 · Enforce the type scale and radius tokens (P1-09, P2-12)

- **Change:**
  - Replace off-scale sizes with tokens: `text-[15px]`/`text-sm`/`.875rem`/`.9375rem` → `text-small`; `text-[13px]`/`.8125rem`/`text-xs`/`.75rem`/`.6875rem`/`text-[11px]` → `text-microcopy`; `text-[17px]`/`1.0625rem` → `text-body` or `text-emphasis` by role; `text-[19px]`/`text-[21px]` → `text-card-title`.
  - Chart tick labels may stay at 12 px through a new documented `--text-chart` role.
  - Radii `10px`/`4px`/`2px`/`3px`, `rounded-sm` and `rounded-md` → `--radius-compact`/`control`/`surface`.
  - Extend `src/styles/tokens.test.ts` to fail on arbitrary `text-[…]`, Tailwind default size utilities, `font-size` literals in product CSS modules, and radius literals outside the tokens. Allowlist `marketing/` and chart files.
- **Scope:** about 60 CSS modules and about 190 class sites. Split by route group if the diff gets large (shell + Learn, Lab, Settings + auth).
- **Guardrails:** Never shrink text to fix overflow. Re-check 320 px. KaTeX sizes are exempt.
- **Verify:** The sweep's per-route font-size inventory drops to ≤ 9 sizes on product routes (scale + chart role). `test:design-system-browser`, `test:studovna`, `test:progress-browser`, `test:portfolio-browser`, `test:settings`.

### WP-02 · Global CSS fixes (P2-03, P3-08, M3)

- **Change:**
  - `src/app/globals.css:7-12`: remove `a` (and `[role="button"]` if not needed) from the `user-select: none; -webkit-touch-callout: none` rule.
  - Delete the duplicate reduced-motion rules in `settings.module.css:178`, `backtesting-lab.module.css:238` and `personalization-flow.module.css:115-117`. `tokens.css:146` covers them.
  - Buy sheet: `backdrop:bg-backdrop overscroll-contain`.
- **Verify:** Select text across an inline link in a lesson paragraph. With reduced motion emulated, Settings, Backtesting and Onboarding still show no motion. `test:onboarding-redesign`, `test:backtesting-browser`.

### WP-03 ⚑ · Terminology and voice (P1-10, P2-05, P2-14, P3-02, P3-03)

- **Change (after D1 and D5):**
  - Apply the milestone name and the checkpoint term everywhere. Add both to `docs/terminology.md` and `src/lib/terminology.test.ts`.
  - Change the landing eyebrow to Czech.
  - `instrument-detail.tsx:228`: `{quantity} pozic` → a `formatCount(n, "kus")` helper on `Intl.PluralRules("cs")`. Reuse it in `lab-hub.tsx:22`.
  - Add `generateMetadata` to `lab/missions/[missionId]/page.tsx`.
  - `&nbsp;` in „Lekce 6 ze 10“.
  - Settings group labels in natural case.
- **Guardrails:** Display text only. Stable lesson and milestone IDs, slugs and stored artifact names stay as they are.
- **Verify:** `npm test` (terminology and copy-voice tests), `test:mastery-browser`, `test:milestones-persistence` (read-only assertions on labels), `test:lesson-walkthrough` if checkpoint titles change.

### WP-04 · Remove the shell override layer (P1-03, P3-01)

- **Change:**
  - Delete the structural overrides in `src/components/shell/paper-shell.module.css:1-11, 17-22`.
  - Rewrite `app-shell.tsx:49-73` utilities to the approved look in one place: flat header, text nav with an Action Teal underline, no nav icons except the **visible** `LockKeyhole` next to „Lab“ when locked, round 32 px avatar, borderless summary on mobile.
  - Keep the settings-subsection header hiding (`paper-shell.module.css:23-24`) or move it to a `data-` attribute on the shell.
  - Optional (P3-01): swap the Lab icon after design review.
- **Guardrails:** Header height and the sticky/relative behavior must match today's rendered result. Diff against before/after screenshots at all 5 widths.
- **Verify:**
  - With a learner who has Lab locked, „Lab“ shows the lock and the accessibility tree contains „Portfolio Lab je zamčený“.
  - The avatar computes `border-radius: 50%`.
  - `test:product`, `test:navigation-feedback`, `test:settings`.

### WP-05 ⚑ · Make the landing demo honest (P1-07, P2-13)

- **Change (D3 = a):** In `pen-interactions.tsx`, render answers as a native radio group with local state. „Zkontrolovat odpověď“ reveals the existing feedback. The ghost-cursor timeline runs only while the user hasn't interacted, and stops on the first pointer or key input. Reduced motion shows the unanswered, interactive state, not the answered one.
- **Change (D3 = b):** Replace „Zkus rozhodnutí. Vyber odpověď…“ and the fake button with descriptive copy.
- **Both:** Rewrite the hero lede to state the promise. Move „připravujeme“ into the roadmap card, generated from the curriculum registry instead of the strings in `pen-landing.tsx:18,67`.
- **Guardrails:** Keep „Ukázka bez zápisu“; no persistence and no XP. Respect `ANIMATIONS.md` and update it.
- **Verify:** `test:marketing-browser`, the `test:product` landing axe step, and a manual click test with reduced motion on and off.

### WP-06 ⚑ · Give Learn and Progress one job each (P1-01, P2-10, P2-11)

- **Change (D4 = milestone-first):**
  - **Learn** keeps the continue card and `CurriculumMap` (without the milestone prose) plus a compact „Milník A · 1 z 3 splněno → další krok“ line.
  - **Progress** removes `CurriculumMap`. Its order becomes: hero stats → `MilestoneCard` A (requirements as a checklist with written status and one next action), then B–D collapsed → key ideas („Klíčové myšlenky z lekcí“) → mastery by module with a fixed status column (`grid-template-columns: minmax(0,1fr) auto`) → completed lessons with review links.
  - Build `MilestoneCard` from the existing `MilestoneState`. Do not compute anything new.
- **Guardrails:** Milestones count only published content and never imply completion (`docs/milestones.md`). Keep every review link reachable. Mastery labels stay text plus icon.
- **Target:** `/progress` at 390 ≤ 6,000 px (today 11,389). `/learn` at 1440 ≤ 3,800 px (today 4,960).
- **Verify:** `test:progress-browser`, `test:studovna`, `test:mastery-browser`, `test:milestones-persistence`, `test:progression-browser`.

### WP-07 · One state component for errors and empty states (P1-08)

- **Change:**
  - Extend `RouteState` with optional `bubble`, `meta` and `alert` props.
  - Port `(app)/learn/error.tsx`, `progress/error.tsx`, `settings/error.tsx`, `lab/plan/error.tsx`, `lab/training/error.tsx` and `lab/portfolio/error.tsx` to it. Delete their bespoke CSS and the inline style.
  - Replace „Hledám to. Občas to chvilku trvá.“ on failure states with calm failure copy.
  - Guarantee a gap of at least 16 px in `.actions`.
- **Verify:**
  - Force each boundary in dev (throw in the page) and screenshot it at 1440 and 390.
  - Run axe. `test:not-found-browser`, `test:portfolio-browser` (error path), `test:settings`.

### WP-08 · Portfolio Lab: process first, value as orientation (P1-04, P2-04, P2-08, P2-09)

- **Change:**
  - In `portfolio-overview.tsx` and `performance-summary.tsx`, the value becomes a `section-title`-sized figure in a summary row with cash and P&L.
  - In `process-feedback.tsx`, when there is no IPS, show one top prompt with a `Vytvořit investiční plán` primary `ButtonLink` to `/lab/plan`. IPS-dependent rules (`allocation`, `cash`, budgets) collapse into one „Čeká na plán“ row. HHI, costs and turnover stay.
  - Negative and positive amounts use ink plus the sign and arrow icon, not `danger`/`success` (also on the instrument detail).
  - One number formatter per context (summary: whole Kč; detail: haléře), shared with the Lab hub card.
  - Use the chevron disclosure style for „Jak se to počítá“.
- **Guardrails:** No new metrics, no aggregate score, „Nedostupné“ stays, the same server-provided values. Copy must not pressure a trade (`DESIGN.md` Portfolio process feedback).
- **Verify:** `test:portfolio-browser`, `test:portfolio-browser-closed`, `test:instrument-browser-unavailable`, `test:portfolio-process` (read-only), and 390 screenshots showing the value and the IPS prompt within the first 1,000 px.

### WP-09 ⚑ · Mascot scope (P2-02, P3-05)

- **Change (after D2):** Remove `GuideImage` from the surfaces outside the agreed scope (likely `settings-experience.tsx`, `progress-overview.tsx` hero, `lab-hub.tsx`, `portfolio-overview.tsx`). Keep it in onboarding, completion, milestones, and empty and error states. Replace the sparkle icon on the save note with `Check` or `Save`. Update `DESIGN.md` or `ui-and-design.md` so they agree.
- **Verify:** Screenshots before and after. `test:studovna`, `test:settings`.

### WP-10 · Sheet and dialog motion (M1/O1)

- **Change:**
  - In `tokens.css` `:root`, add `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
  - For the right sheet (`instrument-detail.tsx:253`) and the bottom sheet variant:
    ```css
    dialog.sheet { transition: translate 300ms var(--ease-drawer), opacity 300ms var(--ease-drawer), display 300ms allow-discrete, overlay 300ms allow-discrete; }
    @starting-style { dialog.sheet[open] { translate: 100% 0; opacity: 0; } }   /* bottom sheet: translate: 0 100% */
    dialog.sheet:not([open]) { translate: 100% 0; opacity: 0; transition-duration: 200ms; }
    dialog.sheet::backdrop { transition: opacity 200ms var(--ease-out), display 200ms allow-discrete, overlay 200ms allow-discrete; }
    @starting-style { dialog.sheet[open]::backdrop { opacity: 0; } }
    ```
  - For centred dialogs (`portfolio-lab.module.css:257`, `settings.module.css:93`), use the same pattern with `opacity: 0; scale: 0.97` at 200 ms `var(--ease-out)`. Keep `transform-origin: center` (modal).
  - Reduced motion: under `@media (prefers-reduced-motion: reduce)`, drop `translate`/`scale` and keep opacity 150 ms. The root rule currently zeroes everything, so scope an explicit exception or accept zero (decide during the PR).
  - Interplay with `sheet-swipe.ts`: the swipe writes inline `transform`. The entry uses the individual `translate` property, so they compose. Confirm that a mid-entry swipe still settles from the current offset.
- **Verify:**
  - Slow the animations to 10 % in the DevTools Animations panel. The sheet enters and exits along the same edge, and the backdrop and sheet stay in sync.
  - Escape and the close button both animate out, and focus still returns to the trigger.
  - Real device: a swipe during entry is caught.
  - `test:portfolio-browser`; check `test:navigation-feedback` timing is unaffected.

### WP-11 · Button press feedback and motion token hygiene (M2, M4, M5, M7)

- **Change:**
  - In `button.tsx:12`, change the transition to `transition-[background-color,border-color,color,scale] duration-[160ms] ease-out`.
  - Add `motion-safe:not-disabled:not-aria-disabled:active:scale-[0.96]`.
  - Delete the unused `--ease-exit`. Decide on `--motion-entry` and update `tokens.test.ts`.
  - `navigation-status.module.css:25`: `linear`.
  - `marketing/motion/sections/portfolio.ts:44`: `scale: 0.6, autoAlpha: 0`.
- **Verify:** Press with the mouse and with touch emulation. Disabled buttons don't scale. `test:design-system-browser`, `test:navigation-feedback`.

### WP-12 · Lab hub follows product priority (P1-05)

- **Change:** In `lab-hub.tsx`, add a „Tvůj plán“ row above the cards: IPS status (from the existing learner-artifact read) and crisis exercise status, each with one button. Then the Portfolio card. Backtesting moves to a quieter tile. Replace „Kapitola 01 · lekce N“ with registry display codes (shared with WP-15).
- **Guardrails:** Read existing artifact and training state only. Locked-Lab behavior and copy stay unchanged.
- **Verify:** `test:ips-browser`, `test:training-browser`, `test:product`.

### WP-13 · Feedback and completion moments (O2, O3)

- **Change:**
  - `lesson-answer.tsx:61` feedback container: `@starting-style { opacity: 0; translate: 0 4px }`, transitioning to settled with `opacity 200ms var(--ease-out), translate 200ms var(--ease-out)`. Reduced motion: opacity only.
  - `completion-screen.tsx`: split into three `motion.div` chunks (icon; title and description; reward), `staggerChildren: 0.06`, each `{ opacity: 0, y: 8 } → { opacity: 1, y: 0 }`, 0.3 s `[0.23, 1, 0.32, 1]`. Under `useReducedMotion()`, keep the current single opacity fade.
- **Guardrails:** No confetti or burst, and nothing in Lab trade flows (product rule). The `role="status"` region must exist before its text changes. Keep the element mounted and animate only its content.
- **Verify:** `test:lesson-walkthrough` (answer, retry and completion timing), `test:foundations-browser`, and a 10 %-speed feel check.

### WP-14 · One display identity (P1-02, P3-06)

- **Change:** Add one `displayIdentity(user)` helper used by `app-shell.tsx` (chip, menu), `studovna-page.tsx` and `progress-overview.tsx` (greetings) and `settings-experience.tsx`. Anonymous greetings carry no name („Vítej zpátky.“). The avatar initial uses the same source. Sign-out uses danger styling only for the demo, where it ends the profile.
- **Guardrails:** `generateName` in `src/lib/auth.ts` sets stored names. Changing it affects new anonymous rows only and is an auth-config change, so prefer leaving it and fixing display. Never rewrite stored names.
- **Verify:** Demo, guest and named account each show one consistent name or label in the chip, menu, greeting and settings. `test:product`, `test:settings`, `test:guest-claim`.

### WP-15 · Lesson numbering from the registry (P1-06)

- **Change:**
  - `guided-lesson.tsx:159`: the eyebrow comes from the curriculum registry (`displayCode · display module title`), passed from the lesson page loader.
  - The Lab hub uses the same.
  - Editorial: rename the display title of either lesson `risk-vs-reward` or storage module `returns` so the two strings differ.
- **Guardrails:** Stable lesson IDs, slugs and routes are untouched (`docs/education/published-lesson-compatibility.md`). Display codes are not identities.
- **Verify:** `test:curriculum-compatibility`, `test:lesson-walkthrough`, and a spot check that the codes on Learn, in the player and in Lab match for 5 lessons across modules.

### WP-16 · Remaining P2/P3 sweep

- P2-01: continue card. State the step once and pull the CTA up (`studovna-page.tsx:75-90`).
- P2-06: onboarding submit stays enabled, with validation on submit (`personalization-flow.tsx:96`).
- P2-07: one filled primary on the instrument detail.
- P3-07: Settings section labels.
- P3-04 is **domain** (demo seed with a non-executable quote) and goes in a separate issue, not this sweep.

## Implementation checklist

Tick in the PR that closes each item.

**Decisions**
- [ ] D1 milestone A name
- [ ] D2 mascot scope (and reconcile `DESIGN.md` with `ui-and-design.md` §7)
- [ ] D3 landing demo interactive vs copy-only
- [ ] D4 Progress purpose
- [ ] D5 checkpoint term

**Phase 0: foundations**
- [ ] WP-01 type tokens applied, chart role added, radius tokens applied
- [ ] WP-01 `tokens.test.ts` bans arbitrary sizes, default sizes, `font-size` and radius literals
- [ ] WP-02 links selectable, iOS long-press restored
- [ ] WP-02 duplicate reduced-motion rules deleted, sheet scrim and overscroll fixed
- [ ] WP-03 terminology applied, plural helper, mission metadata, nbsp, natural-case labels

**Phase 1: shell and states**
- [ ] WP-04 override layer deleted; lock icon visible and announced; round avatar
- [ ] WP-07 all 13 boundaries on `RouteState`; failure copy fixed; actions gap ≥ 16 px
- [ ] WP-05 landing demo honest (per D3); hero lede rewritten; availability list registry-driven
- [ ] WP-14 one display identity across chip, menu, greeting and settings

**Phase 2: IA and hierarchy**
- [ ] WP-06 Progress without the curriculum map; MilestoneCard; mastery status column; unique h2
- [ ] WP-08 process-first Portfolio Lab; IPS prompt at top; neutral P&L color; one formatter
- [ ] WP-12 Lab hub „Tvůj plán“ row; Backtesting demoted
- [ ] WP-15 registry display codes in the player and Lab; title collision resolved

**Phase 3: polish and motion**
- [ ] WP-10 sheet and dialog enter/exit along one path; reduced-motion opacity fallback
- [ ] WP-11 button press scale 0.96; motion tokens cleaned; linear loop; no `scale: 0`
- [ ] WP-13 feedback entrance; completion stagger
- [ ] WP-09 mascot scope applied (per D2)
- [ ] WP-16 continue card, onboarding submit, single primary, settings labels

**Exit criteria for the overhaul**
- [ ] Sweep: 0 overflow at 5 widths, 0 axe violations, product routes ≤ 9 rendered font sizes
- [ ] `/progress` at 390 ≤ 6,000 px; `/learn` at 1440 ≤ 3,800 px
- [ ] Every audit P1 closed or explicitly deferred with a linked issue
- [ ] The items listed as Not verified in AUDIT §1 (Safari, Firefox, physical iPhone, VoiceOver on the buy sheet and lesson answer, 200 % text zoom) are each checked once, with the results recorded in this folder
