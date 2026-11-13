# Investník UI overhaul plan

This plan turns the findings in [AUDIT.md](AUDIT.md) (stamped at `origin/main` 37c412b, 2026-11-12) into ordered, independently shippable work. It designs nothing new. Each work package names the audit IDs it closes, the files to touch, the exact target, its guardrails and how to verify it.

**Status (2026-11-13).** The founder approved direction **D „Studijní pracoviště“** for `/learn` (decision F1). [Learn: direction D](#learn-direction-d-approved-2026-11-13) below replaces the Learn half of WP-06 with WP-17 to WP-22. Direction **C „Cesta k plánu“** is not used for `/learn`. It remains the candidate structure for `/progress` (WP-06, D4). Nothing here authorizes a merge or a deploy. Every PR stays in review until the founder merges it.

**Refinement (2026-11-13, branch `proto/learn-d-refinement`).** D was refined to production quality as a development-only prototype, with six deterministic learner states. See [LEARN-D-REFINEMENT.md](LEARN-D-REFINEMENT.md) for the design record and [LEARN-D-INTEGRATION.md](LEARN-D-INTEGRATION.md) for the production plan. It added WP-17b and decisions D7 and D8, and implemented WP-18 on that branch. Production `/learn` is unchanged.

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
| D4 | What Progress is for once the curriculum map moves out | WP-06 | Milestone-first, built on direction C (recommended) · mastery-first |
| D5 | Single term for the mixed checkpoint | WP-03 | „Smíšená kontrola“ (recommended: Czech, already in milestone copy) · „Checkpoint“ |
| D6 | Where the rail sends a learner: straight to the lesson route, or to an in-page lesson preview (`/learn?lesson=…`, as in the prototype) | WP-20 | Straight to the lesson (recommended: every lesson is open, and the lesson route already has its own intro) · in-page preview |
| D7 | Where the study-plan context goes on D („Jak si rozvrhnout učení“, the recommended lesson when it differs from the continuation) | WP-21 | Settings → Učení, with the reason line staying on `/learn` (recommended) · a disclosure under the task |
| D8 | After module 1.1 `recommendLearning` sends learners to 3.1.1 (Returns, outside Milestone A), while Milestone A continues with 2.1.6 ([finding C-3](LEARN-D-INTEGRATION.md#4-correctness-findings)) | Recommendation rules (own PR) | Follow Milestone A order (recommended) · keep Returns after Foundations |

**Decided.**
- **F1 (2026-11-13): `/learn` follows direction D.** The brief and the prototype are `docs/ui-overhaul/LEARN-VARIANTS.md` and `/dev/learn-variants/d`. Both are uncommitted in the `design-foundation` and `learn-variant-d` worktrees and land with WP-00.
- **F4, rail rows only:** 44 px (`min-h-control-sm`) at every width. The prototype's 36 px pointer rows are dropped (see [Resolved conflicts](#resolved-conflicts)). Implemented and measured in the refinement: the smallest rail and sheet row is 44.0 px. F4 for Lab and Settings stays open.
- **D2 is narrowed by F1:** D removes the guide illustration from `/learn`. D2 still decides the other screens.

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

The Learn track (WP-17 to WP-22) runs inside Phase 2:

```
WP-17 recap leak ── ships alone, first
WP-00 design foundation ─► WP-18 heading cascade ─► WP-19 Learn model ─► WP-20 rail + question ─► WP-21 /learn cutover ─► WP-22 cleanup
                       └─► WP-01 type & radius ──────────────────────────────────────────────────┘        └─► WP-06 Progress (C)
```

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

### WP-06 ⚑ · Progress gets its own job: direction C (P1-01, P2-10, P2-11)

The Learn half of this package is now direction D (WP-17 to WP-22). Once WP-21 lands, `/learn` no longer renders `CurriculumMap`, so P1-01 is half closed. This package closes the rest on `/progress`.

- **Change (D4 = milestone-first, using direction C's checklist):**
  - **Progress** removes `CurriculumMap`. Its order becomes: hero stats → `MilestoneCard` A (requirements as a checklist with written status and one next action; done items collapse to a dated line; capstone parts link to IPS, Portfolio Lab and the crisis exercise), then B–D collapsed → key ideas („Klíčové myšlenky z lekcí“) → mastery by module with a fixed status column (`grid-template-columns: minmax(0,1fr) auto`) → completed lessons with review links.
  - Build `MilestoneCard` from the existing `MilestoneState`. Do not compute anything new. The milestone row on `/learn` (WP-21) links here.
  - `CurriculumMap` then has no consumer. Delete it and `curriculum-map.module.css`, keeping `curriculum-map-model.ts`, which feeds the rail.
- **Depends on:** WP-21 (Learn no longer needs the map) and D4.
- **Guardrails:** Milestones count only published content and never imply completion (`docs/milestones.md`). Keep every review link reachable. Mastery labels stay text plus icon.
- **Target:** `/progress` at 390 ≤ 6,000 px (today 11,389).
- **Verify:** `test:progress-browser`, `test:mastery-browser`, `test:milestones-persistence`, `test:progression-browser`, and `test:milestone-a-live` (live FMP; run when credentials are available).

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

## Learn: direction D (approved 2026-11-13)

D keeps B's curriculum as a compact rail and puts A's single task in the main pane. The prototype is presentation over a fixed demo learner: it grades in the browser and saves nothing. Production keeps every existing data source, action and server check, and changes only what the learner sees.

### How D maps onto production

| D region | Production source (unchanged) | Notes |
| --- | --- | --- |
| Rail: levels, modules, lessons, status | `curriculumMapModel()` over `loadLearner()` (`src/components/learning/curriculum-map-model.ts`) | Registry-driven, 52 published lessons. Only the continuation level is open. Its finished lessons fold into one row, and levels 4–6 and V share one „Prohloubení“ disclosure. No lesson codes in the rail |
| Eyebrow, lesson `h1`, summary, step meter | `studovnaLesson(summary)`, `summary.position`, `summary.stepCount`, `lesson.estimatedMinutes` | The step number is stated once (P2-01) |
| Inline question | `StudovnaQuestion` + `saveLessonPositionAction` | Generalize it from multiple choice to `numericQuestion`. The server already re-grades both through `evaluateQuestion` with the same `answers.answer` key. A correct answer saves `position + 1` and opens the lesson, as today. No completion, receipt or reward on `/learn` |
| Recap „Co už víš“ | `studovnaLesson().recap` | Empty on any step with a graded question (WP-17). On other steps it renders as today |
| „Potom …“ line | The next unfinished lesson after the continuation in registry order, outside L4–L6 and V | Compute it in the WP-19 model, not in the component |
| Milestone row | `loadMilestones()` → `MilestoneState` A, `milestoneANextStep()` | Counts published content only. Never implies completion. Links to `/progress` |
| Portfolio Lab row | `loadPortfolioLabUnlockStatus` + `loadPortfolioCardView`, streamed in its own `Suspense` | Three written states: locked („Jak odemknout Portfolio Lab“), unavailable (no number, never 0) and unlocked (practice capital, `tabular-nums`). It must not block the lesson content (perf issues #401–#406) |
| Complete states | `summary.allComplete`, Milestone A `lessons` requirement and `status` | The main pane shows the next Milestone A requirement (the same copy as today's complete card) instead of a lesson |
| Shell | `AppShell`, unchanged top navigation (F2 stays „top nav“) | The rail lives inside the `/learn` page, not in the shell. Lessons stay full-screen without it |

**Regions that leave `/learn`, and where each one goes.** None is dropped without a home.
- **Guide illustration:** removed from `/learn` (F1 narrows D2).
- **Portfolio composition donut:** already on `/lab/portfolio`.
- **Backtesting link:** the Lab hub (WP-12).
- **Separate Progress card:** the milestone row.
- **Greeting:** merges into the eyebrow, with no invented name (WP-14).
- **Personalization prompt:** has no other home in production. It stays on `/learn` as one quiet row under the Lab row, shown only while `personalizedOnboardingCompletedAt` is empty. It moves only when Settings gains an entry for it.

### Resolved conflicts

| Conflict | Resolution | Why |
| --- | --- | --- |
| **Rail row height.** The prototype uses 36 px pointer rows (`min-h-9`); `DESIGN.md` sets 44 px (`control-sm`) as the floor | 44 px (`min-h-control-sm`) for every rail row and disclosure summary at every width. Rows use `min-height`, so two-line titles grow | 36 px clears WCAG 2.5.8 (24 px) but breaks the documented floor. Folding (one open level, finished lessons in one row) already keeps the rail short. Keeping 36 px would be a second row height on one screen and would need its own entry in `DESIGN.md`. Nothing justifies that exception |
| **Heading styles beat utilities.** `.investi-theme :where(h1, h2, h3, h4)` (`src/styles/tokens.css:138`) is unlayered. Tailwind v4 utilities live in `@layer utilities`, and an unlayered rule wins over any layered one whatever its specificity. So `text-label`, `font-sans` or `tracking-label` on a heading are silently ignored, and the prototype fell back to `<p>` for real headings (the rail title, the module names and the recap title) | WP-18 moves the rule into `@layer base`. In the same PR it deletes the 35 `font-bold` and 15 arbitrary `tracking-[…]` utilities on `h1`–`h4` that render as no-ops today, so the rendered result stays the same. D then uses real heading elements | Fix the cascade once instead of avoiding headings. CSS modules are unlayered and still win, as they do today |
| **Recap leak.** `studovnaLesson` takes the last two descriptive blocks of earlier steps. In `foundations-risk-reward` step 5 says „…dává 96“, which is step 6's answer, and `/learn` showed it beside the open question | WP-17: no recap while the saved step holds a graded question | A structural rule: content scanning cannot guarantee that no answer leaks |
| **Pre-answer hint leak.** The prototype's „Potřebuješ nápovědu?“ shows the authored `incorrectExplanation` before any attempt. 13 of 227 graded questions state the answer there, e.g. `returns-compounding` step 4: „Faktor je 0,96“ | Drop the pre-answer hint. `incorrectExplanation` appears only after an incorrect attempt, as in the lesson player. A hint returns only with an authored `hint` field, which is content work under the lesson standard and outside this track | The prototype's claim that the hint „never states the result“ is false for 6 % of questions |
| **Post-correct recap.** The prototype reveals the recap after a correct answer | Delete it. In production a correct answer saves and navigates, so that state is never visible | Nothing to build |
| **Duplicate sheet.** `CurriculumSheet` is a second bespoke `<dialog>` with a fixed id (`b-sheet-title`) | Reuse the shipped edge-attached sheet (`src/components/ui/sheet-swipe.ts`, PR #499) and `useId` | One sheet implementation, swipe-to-dismiss included |
| **Rail edge versus header edge.** The workspace uses `max-w-shell` (90rem) while the header container is `max-w-6xl` (72rem) | Resolved in the refinement. The header *as rendered* uses `max-w-shell` with 20/40/64 px gutters (`paper-shell.module.css` overrides `max-w-6xl`), and WP-04 keeps that box. D uses the same box, and rail text starts on the wordmark's edge. The rendered header also scrolls away (`position: relative`), so the rail sticks to `top: 0`, not under the header | One leading edge from the wordmark down |
| **Truncated „Potom“ title** (`truncate`) | Let it wrap (`text-pretty`) | The full title must stay readable without the rail |

### Work packages

#### WP-17 · Withhold the Learn recap while a question is open (shipped as its own PR first)

- **Change:** `studovnaLesson()` returns `recap: []` when the saved step contains any graded block (`isQuestion`). The page falls back to its existing lesson context („Co tě čeká v lekci“).
- **Status:** implemented on branch `fix/learn-recap-answer-leak` (commit f81c5a2), not yet pushed.
- **Guardrails:** Grading, completion, progression and persisted lesson state are unchanged.
- **Verify:** The regression tests in `studovna-model.test.ts` failed before the fix. `test:studovna`. A catalog probe of all 227 graded steps finds no correct option label or numeric answer in the recap or in the step preview text.

#### WP-17b · Resolve fact tokens in the Learn preview

- **Change:** `studovnaLesson()` runs the authored lesson through `prepareLessonFacts(…, factRegistry, { today: factToday(), published: true })` before it builds the step, question and recap. Today 17 of 475 saved-step previews (7 lessons) would print raw `{{…}}` tokens on `/learn` ([finding C-2](LEARN-D-INTEGRATION.md#4-correctness-findings)).
- **Depends on:** WP-17.
- **Verify:** A catalog unit test (no `{{` in any preview), `test:studovna`.

#### WP-00 · Land the design foundation (prerequisite)

- **Change:** Commit the uncommitted `design-foundation` worktree as its own PR, by its owner: the token additions (`control-sm/control/control-lg`, `max-w-reading…shell`, `size-icon-*`, type roles including `label` and `chart`), `DESIGN.md` „Quiet precision“, the decisions table with F1 recorded as D and F4 for rail rows, and `docs/ui-overhaul/LEARN-VARIANTS.md`. D uses all of these tokens.
- **Guardrails:** Nobody else edits that worktree or `learn-variant-d`. The `/dev/learn-variants` prototype route may land as a development-only reference (it returns 404 outside `next dev`) or stay local. Its owner decides.
- **Verify:** The standard gates and `tokens.test.ts`.

#### WP-18 · Heading cascade: utilities can style headings

- **Change:**
  - Wrap the `.investi-theme :where(h1, h2, h3, h4)` rule in `@layer base`.
  - Delete the heading utilities that are no-ops today: `font-bold` (35 headings), arbitrary `tracking-[…]` (15) and `tracking-normal` (1). `font-semibold` and `font-display` match the base rule and can stay.
  - Add a `tokens.test.ts` assertion that `tokens.css` declares no unlayered element selectors.
- **Depends on:** WP-00 (both edit `tokens.css`).
- **Guardrails:** No visual change. Any heading that changes is a bug in this PR.
- **Verify:** A computed-style snapshot (`font-family`, `font-weight`, `letter-spacing`, `font-size`, `line-height`) of every `h1`–`h4` on the 27 audit routes at 1440 and 390, before and after, must be identical. Run `test:design-system-browser`, `test:product` and `test:marketing-browser`.
- **Status:** implemented on `proto/learn-d-refinement` (30db51e) as its own commit, ready to cherry-pick into a WP-18 branch after WP-00.
  - 46 masked utilities were removed, plus `blockTitle`, `cardTitle` and `AppHeader`.
  - The fact-notice `h3` pins `tracking-heading`, because its shared `eyebrow` class would otherwise start applying.
  - `tokens.test.ts` now fails on any unlayered heading selector.
  - The snapshot was identical for 265 headings on the 23 routes that render without a database.
  - Still to run on the PR: the authenticated routes with a seeded database, and the three browser suites above.

#### WP-19 · Learn workspace model (no UI change)

- **Change:** A pure server function, `learnWorkspaceModel(summary, milestones)`. It builds the rail (open level, folded-done counts, the „Prohloubení“ group, status per lesson), the continuation (lesson, step, meter, minutes left, question kind), „Potom“, the milestone row and the complete states from the builders listed above. It reuses `curriculumMapModel`, `studovnaLesson` and `milestoneANextStep`, and computes nothing new about progress.
- **Verify:** Unit tests for a new learner (position 0), in progress (the demo profile), a saved step with a question, a saved step without one, Milestone A lessons done, Milestone A achieved, all complete, and a learner with Lab locked. The rail contains every published lesson exactly once.
- **Head start:** the refinement wrote this model and its tests: `src/app/dev/learn-variants/_prototype/workspace-model.ts` (signature `learnWorkspaceModel(summary, milestones, lab, today)`) and `workspace-model.test.tsx`. It includes the catalog no-leak and no-token tests. WP-19 moves them and adds the entry-test, guest and Lab-unavailable fixtures ([integration plan §5](LEARN-D-INTEGRATION.md#5-work-packages)).

#### WP-20 · Rail, sheet and inline question components

- **Change:**
  - `LearnRail`: a sticky desktop `aside` from 1024 px (`lg`, a rem breakpoint, so 200 % text switches to the sheet), 17rem wide, collapsible to 3.5rem. The swap is instant, because navigation never animates. Rows are `min-h-control-sm`. Status is an icon plus sr-only text, and the continuation link carries `aria-current="step"`. Below 1024 px the same tree opens in the shipped sheet from a „Kurikulum“ button.
  - Generalize `StudovnaQuestion` to `multipleChoiceQuestion` and `numericQuestion`. For numeric input, reuse `parseNumericAnswer` from `src/features/finance/numeric-input`, a labelled input with `inputmode="decimal"`, validation on submit and a stable `role="status"` region. Other question kinds show the step and the CTA to the lesson.
  - Real headings throughout (needs WP-18).
  - The step meter keeps `role="progressbar"` and adds `aria-valuetext="Krok N z M"`.
  - **From the refinement:**
    - Split into WP-20a (rail and sheet) and WP-20b (question).
    - Grade with `evaluateQuestion`/`feedbackFor` rather than a copy.
    - Grade choices only on „Zkontrolovat“, never on change (finding C-4).
    - Add a „Přeskočit kurikulum“ skip link at the top of the rail.
    - Collapse to 2.75rem (one 44 px toggle).
    - Answer inline only when the step has exactly one graded block.
    - Reference implementation: `variant-d.tsx` and `variant-d-client.tsx` in `_prototype/`.
  - No collapse persistence until someone asks for it.
- **Depends on:** WP-18, WP-19 and D6.
- **Guardrails:** Client components import no lesson content. Only the serialized question block crosses the boundary (`check:lesson-bundle`). The server stays the grader.
- **Verify:** Component tests for the question (correct, incorrect, empty input, save failure keeps the cursor). Keyboard: Tab reaches the rail toggle, then rail rows, then the main CTA. Escape closes the sheet and focus returns to „Kurikulum“.

#### WP-21 · `/learn` cutover

- **Change:** `StudovnaPage` renders the D composition from the WP-19 model: rail, then one raised surface (the active step) in `max-w-reading`, then the „Potom“ line, then quiet milestone, Lab and personalization rows. Remove the guide illustration, the donut, the Backtesting link and the `CurriculumMap` mount from `/learn` (`/progress` keeps the map until WP-06).
- **Depends on:** WP-20, plus WP-14 for the greeting identity (or the eyebrow carries no name until WP-14 lands).
- **Guardrails:** Every lesson stays open. Practice Capital and XP stay secondary. One filled action per view. Old lesson routes and saved cursors are untouched.
- **Browser suites to update to the approved semantics** (one PR, so they stay green together):
  - `scripts/onboarding-helper.mjs`, which many suites share.
  - `validate-studovna.mjs`. Its counts change: the rail shows one open level and folded rows, not 52 visible links.
  - `validate-product-shell.mjs`, `validate-progress.mjs`, `validate-milestone-a-journey.mts`, `validate-lesson-walkthrough.mts`.
  - `validate-personalization-browser.mjs`, `validate-personalization-compatibility.mjs`, `validate-goals.mjs`, `validate-budget.mjs`, `validate-returns-flow.mjs`, `validate-volatility.mjs`, `validate-correlation-diversification.mjs`.
  - Scope every Learn locator to `:visible`, because the previous route stays mounted hidden.
- **Target:** `/learn` at 1440 ≤ 3,800 px (today 4,960). At 390, the CTA is in the first viewport.

#### WP-22 · Cleanup

- **Change:** Delete what the cutover left unused in `studovna-page.tsx` and `studovna-page.module.css` (guide wrap, donut, side column) and the prototype-only components. Update `LEARN-VARIANTS.md` to mark D as shipped. Record the result in this folder.
- **Verify:** `npm run knip` reports nothing new. The standard gates.

### Regression risks

| Risk | Where | Guard |
| --- | --- | --- |
| Browser suites tied to the old Learn DOM | 13 scripts (WP-21 list) | Update them in the cutover PR. Run the full Browser workflow (`workflow_dispatch`) on the PR head, not only the subset |
| Duplicate links: the desktop rail and the sheet tree both in the DOM | `/learn` | The closed `<dialog>` and the `hidden` aside are out of the accessibility tree. Tests count links within the visible container only |
| A pending or failed portfolio blocks or zeroes the page | Lab row | Keep the separate `Suspense`. „Nedostupné“ copy, never 0. Check with a forced loader failure |
| Lab-locked learners see a capital figure or a broken link | Lab row | Locked state from `loadPortfolioLabUnlockStatus`. A browser check with a fresh account |
| Answer leaks through new text paths | Recap, step preview, hint | WP-17's catalog test. No pre-answer hint. Re-run the catalog probe whenever a text path is added |
| The inline question double-saves or skips a step | `StudovnaQuestion` | Keep the `busy` ref and the server move validation. `test:studovna` covers wrong answers, retry, save errors and reload |
| The heading change restyles headings app-wide | Every route | WP-18's computed-style snapshot must be identical |
| Focus hidden under the sticky header or in the sticky rail (WCAG 2.4.11) | `/learn` ≥ 1024 | The rail's sticky offset follows the real header height. Keyboard walk at 1024 and 1440 |
| Header growth at 125–175 % text pushes the rail under the header | `/learn` ≥ 1024 | Check at 150 % and 175 % text, not only 200 % |
| Milestone copy implies completion | Milestone row | Status from `MilestoneState` only; `test:milestones-persistence` |
| Lesson text enters client JS | Rail, question | `check:lesson-bundle` |
| A logical conflict with parallel PRs on the curriculum registry | WP-12, WP-15, lesson PRs | Serialize with WP-12 and WP-15. Rebase before the cutover and re-run the suites |

### Verification gates (every Learn PR)

1. **Static:**
   ```bash
   npx next typegen && npm run lint && npm run knip && npm run typecheck && npm test && npm run build && npm run check:lesson-bundle
   ```
2. **Browser:** `test:studovna` plus the suites the package touches, against a fresh `next start` on a disposable migrated and seeded database. For WP-21, the whole Browser workflow on the PR head.
3. **Widths:** 1440, 1280, 1024, 768, 390, 375 and 320, with 0 horizontal overflow. Screenshots of every state from WP-19.
4. **Mobile:** 390 and 320 in Chrome, plus one physical iPhone in Safari. The sheet opens, scrolls with `overscroll-behavior: contain`, swipes closed and respects the safe area. The CTA is full width and above the tab bar.
5. **Text zoom:** 200 % text (browser font size 32 px, not page zoom) at 1440 and 390, plus 150 % at 1440. No clipping, and the rail swaps to the sheet at 200 %.
6. **Accessibility:**
   - axe-core with `wcag2a, wcag2aa, wcag21aa, wcag22aa` at 1440, 1024 and 390: 0 violations.
   - Keyboard walk: skip link, rail, CTA, question, sheet, with Escape and focus return.
   - VoiceOver spot check of the question feedback and the rail status.
   - Reduced motion emulated.
7. **Motion:** D adds no motion. The rail collapse, disclosures and chevrons stay instant. Sheet entry follows WP-10, and the feedback entrance follows WP-13, when those land. If a reviewer adds motion, check it at 10 % speed in the Animations panel.
8. **Handover:** The PR stays open for founder review, with screenshots and results in its body. No automatic merge or deploy.

## Implementation checklist

Tick in the PR that closes each item.

**Decisions**
- [ ] D1 milestone A name
- [ ] D2 mascot scope (and reconcile `DESIGN.md` with `ui-and-design.md` §7)
- [ ] D3 landing demo interactive vs copy-only
- [ ] D4 Progress purpose
- [ ] D5 checkpoint term
- [ ] D6 rail target (lesson route or in-page preview) — the integration PR applies the recommendation (lesson route); confirm
- [ ] D7 study-plan context home — the integration PR keeps it as a disclosure under the task until decided
- [ ] D8 recommendation order after module 1.1
- [x] F1 `/learn` layout direction: D „Studijní pracoviště“ (2026-11-13)

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
- [x] WP-17 Learn recap withheld on question steps (f81c5a2, in the D integration PR)
- [x] WP-17b Learn preview resolves fact tokens (finding C-2)
- [ ] WP-00 design foundation landed; F1 and F4 (rail rows) recorded in `DESIGN.md`
- [x] WP-18 heading rule in `@layer base`; heading no-op utilities removed; computed styles unchanged (30db51e, in the D integration PR)
- [x] WP-19 Learn workspace model with state tests
- [x] WP-20 rail (44 px rows), sheet reuse, numeric and choice inline question, no pre-answer hint
- [x] WP-21 `/learn` cutover; browser suites updated; `/learn` at 1440 ≤ 3,800 px
- [x] WP-22 dead Studovna code and prototype removed
- [ ] WP-06 Progress on direction C without the curriculum map; MilestoneCard; mastery status column; unique h2
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
