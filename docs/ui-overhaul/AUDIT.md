# Investník UI audit (2026-11-12)

A product-design and design-engineering audit of the whole web app at `origin/main` 37c412b. It names what keeps Investník from feeling like one cohesive production product. It changes no code. [PLAN.md](PLAN.md) turns the findings into ordered work.

## 1. Method and limits

**Skills used.** I loaded and followed these four skills: `better-interface` (Jakub Krehel), plus the six domain skills it routes to (`better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`); `emil-design-eng`, `improve-animations` (with its `AUDIT.md` catalog) and `find-animation-opportunities` (Emil Kowalski). Their output formats appear below: the coverage table and verdict, Before/After/Why tables, the animation findings table and the opportunities/rejections tables.

**Project rules respected.** I read `AGENTS.md`, `docs/agents/ui-and-design.md`, `docs/agents/product-and-curriculum.md`, `DESIGN.md`, `docs/design-system.md`, `docs/brand.md`, `docs/terminology.md`, `docs/product-direction.md`, `docs/product-reset.md` and `PRODUCT.md`. Documented decisions are not reported as findings, even where I'd choose differently: the single persistent Suspense boundary in `(app)/layout.tsx`, the read-only landing demos in `marketing/motion/ANIMATIONS.md`, paper/teal tokens, one `Button`, and no trade celebrations. Where two documents contradict each other, the finding says so and asks for a decision.

**Runtime.** I ran `next dev` (Next 16.4.2) in an isolated worktree against a throwaway local PostgreSQL 15 cluster. It used deterministic market and FX data with the fixed sample clock, and all external providers (OAuth, Resend, FMP) were blanked. The data was migrated and seeded (52 published lessons). Signed-in screens used the real demo flow („Vyzkoušet demo“ on `/sign-in`). The demo profile has 6 completed lessons, 1 lesson in progress, Portfolio Lab unlocked and 2 seeded positions.

**Automated sweep (Playwright with system Chrome).** 27 routes × 5 widths (1440, 1024, 768, 390, 320) = 135 page loads. For each load I recorded horizontal overflow, controls under 24 px, `h1`s, rendered font-size inventory and console errors. At 1440 and 390 I also ran axe-core 4.14 with `wcag2a, wcag2aa, wcag21aa, wcag22aa`.

**Manual walk.** Full-page screenshots of Learn, Progress, Lab, Portfolio Lab, Instrument detail, Plan, Backtesting, Training, Mission, Settings, Onboarding, Sign-in, Landing, Pro instituce and Průvodce at desktop and mobile. I also drove the buy sheet, account menu, „Možnosti portfolia“ menu, Escape/focus return, and the first 8 Tab stops on `/learn`. The landing demo was tested with reduced motion on and off.

**Not verified** (no claims are made about these):
- Safari, Firefox and physical devices.
- Screen-reader output beyond the accessibility tree.
- 200 % browser text zoom (only the width reflow was swept).
- Live FMP data states.
- Signed-in states other than the demo profile: a fresh account, Lab locked, zero Practice Capital, guests.
- Every lesson step kind beyond the sampled ones.
- `/dev/*` routes.
- Dark mode and RTL: the product has neither, so these are not applicable.

## 2. Product understanding

| Aspect | What the code and running app show |
| --- | --- |
| Target user | A *beginning independent investor* (situation, not knowledge level) who wants to start without major mistakes. Czech UI, *ty* address, no gendered forms (`PRODUCT.md`). |
| North star | Milestone A „Připraven/a začít“: financial readiness → broker and costs → Czech taxes → a personal **IPS** → a practice purchase → the **B10 crisis exercise**. The Lab judges *process*, not return. |
| IA | Public: `/`, `/pruvodce`, `/pro-instituce`, legal and auth. Onboarding: `/onboarding` → entry test → plan → save. App: **Učení** `/learn` (continue card, curriculum map, milestones), **Lab** `/lab` (hub → Portfolio Lab, IPS `/lab/plan`, crisis exercise `/lab/training`, Backtesting, instrument detail and compare, missions), **Pokrok** `/progress`. Settings sit behind the account menu. Lessons are focused full-screen routes without the shell. |
| Core loops | Lesson: step → answer → feedback → persisted cursor → completion receipt → next. Lab: search → instrument → buy sheet (2 steps, cost review) → holding → process feedback against the IPS. |
| Stack | App Router, React 19.3, Tailwind v4 `@theme` tokens (`src/styles/tokens.css`), CVA `Button`, about 60 CSS modules, `motion` 13.2 (3 components), GSAP 3.15 with ScrollTrigger and Lenis (landing only), Recharts and lightweight-charts, KaTeX, Lucide, Manrope and Inter via `next/font`. |
| Design system | „Studovna“: warm paper, ink, one Action Teal, Manrope headings and Inter UI. Product scale has 7 sizes (13/15/16/18/20/28/36–48 px), radii 6/8/12, two elevations, motion tokens 180/270/400 ms with `--ease-standard`. |

### What is already right

The audit criticizes what remains, so first, what the evidence shows is already solid:

- **0 horizontal overflow** on all 135 route × width loads, including 320 px.
- **0 axe violations** (WCAG 2.2 A/AA tags) on all 54 audited loads.
- **No console errors** on healthy routes. The only errors were the expected 404 resource and the demo-seed edge in P3-04.
- **Modal sheets are done properly.** The buy sheet is a native `<dialog>` opened with `showModal()`. Focus moves to „Zavřít pokyn“ and Escape returns focus to „Koupit AAPL“. Touch swipe-dismiss uses a velocity rule and spring settle (`src/components/ui/sheet-swipe.ts`).
- **Native disclosures, skip links and focus.** There is a skip link, visible focus (3 px ink outline), and the account menu is a `<details>` that handles Escape and returns focus.
- **Restrained motion.** Product motion is mostly 160–180 ms color transitions. Every Motion component reads `useReducedMotion`, and a global reduced-motion rule exists.
- **Honest data states.** Sample data is always labelled. Unavailable means „Nedostupné“, never 0. Destructive reset is hidden in a „Možnosti portfolia“ menu.

The product is accessible and stable. What it lacks is **cohesion**: one information architecture, one naming system, one type scale, one state language and one shell implementation.

## 3. Coverage (better-interface)

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | axe on 27 routes × 2 widths; Tab order on `/learn`; buy-sheet focus trap and return; account menu Escape; reduced-motion on landing; `globals.css`, `app-shell.tsx`, `paper-shell.module.css`, `personalization-flow.tsx` | 4 findings (P1-03, P2-03, P2-06, P2-11) |
| Layout | Overflow sweep at 5 widths; full-page screenshots at 1440 and 390; `studovna-page.tsx`, `progress-overview.tsx`, `lab-hub.tsx`, `portfolio-overview.tsx`, `route-state.tsx` | 6 findings (P1-01, P1-04, P1-05, P2-01, P2-07, P2-10) |
| Writing | Visible copy on every swept route; `auth.ts`, `pen-landing.tsx`, `pen-interactions.tsx`, `guided-lesson.tsx`, `lab-hub.tsx`, `instrument-detail.tsx`, error boundaries; `docs/terminology.md` and the `PRODUCT.md` voice rules | 7 findings (P1-02, P1-06, P1-07, P1-10, P2-05, P2-13, P2-14) |
| Typography | Rendered font-size inventory per route; grep of `text-[…]`, Tailwind default sizes and CSS `font-size` across `src` | 1 systemic finding (P1-09), 2 LOW (P3-02, P3-03) |
| Colors | Token roles in `tokens.css`; `text-danger*` usage in Lab; rendered return and P&L colors; account menu | 1 finding (P2-04) |
| UI polish | Radius and shadow inventory; error and empty states; disclosure affordances; mascot placement; press states | 5 findings (P1-08, P2-02, P2-09, P2-12, P3-01) |
| Motion | Every `motion/react`, GSAP, `@keyframes`, `transition` and reduced-motion site; sheet open and close; lesson feedback; completion screen | Section 6 |

## 4. Severity scale

- **P0:** broken functionality or critical usability. **None found.** Every route returns 200 (or an intentional 404 or redirect). The flows I drove complete, and nothing is clipped at 320 px.
- **P1:** major UX or visual problem. It is systemic, hurts orientation or trust, or contradicts a documented product principle on a core surface.
- **P2:** meaningful polish. It is visible, but has one cause and local impact.
- **P3:** optional refinement.

The better-interface HIGH/MEDIUM/LOW mapping is in each row. None of the `better-interface` escalation triggers fired: no missing names, no invisible focus, no reduced-motion violations, no loss at 320 px, no failing contrast. One exception: P1-03 hides a state from the accessibility tree, and it is escalated for that reason.

## 5. Findings

Each finding lists the affected routes, the components, the evidence, the fix (Before/After/Why) and the expected impact. Ordered by priority, then by reach.

### P1: major

#### P1-01 · Learn and Progress render the same 3–5-screen curriculum and milestone block (Layout, HIGH reach)

- **Routes:** `/learn`, `/progress`.
- **Components:** `src/components/learning/studovna-page.tsx:87` and `src/components/progress/progress-overview.tsx:209-211`. Both mount `<CurriculumMap levels milestones>`, which renders the curriculum levels, the „Prohloubení“ levels 4–6/V and „Milníky tvé cesty“ A–D.
- **Evidence:**
  - Page height is 4,960 px (`/learn`) and 5,429 px (`/progress`) at 1440.
  - At 390 it is 6,515 px and **11,389 px**. Progress on a phone is about 13 screens.
  - Below each page's own header, the screenshots show identical curriculum blocks.
  - The milestone section is a text dump of 30+ lines with underlined link lists. On both pages it sits below four collapsed „Připravujeme“ levels.
- **Why it matters:** Two of the three primary destinations look the same past the first screen. „Pokrok“ does not answer *how am I doing on the path to my plan*. Instead it repeats the map. Milestone A, the north star, is the least visible element on either page.

| Before | After | Why |
| --- | --- | --- |
| Both pages mount the full `CurriculumMap` including milestones | Learn keeps the map (where to go next). Progress drops the map and leads with **Milestone A progress** (requirements met, next requirement, artifacts saved), then mastery by module, then completed lessons | One job per destination. The milestone becomes the hero of Progress instead of the 30th line |
| Milestones rendered as nested prose plus link lists inside the map | One `MilestoneCard` per milestone: a 3-requirement checklist with icon and text status, and one primary link to the next requirement | Scannable, and reusable on Learn as a compact summary |

**Expected impact:** Progress gets shorter by roughly 50–60 %. Pokrok gets a distinct purpose, and the north-star metric becomes visible.

#### P1-02 · Anonymous identity is called „Alex“ in content but „Demo“ or „Host“ in chrome (Writing, HIGH)

- **Routes:** every signed-in route for demo and guest users. These are the main conversion path from the landing page.
- **Components:** `src/lib/auth.ts:139` (`generateName: () => "Alex"`); `src/components/app-shell.tsx:45` (`displayName = isDemo ? "Demo" : isGuest ? "Host" : userName`) versus `app-shell.tsx:76` (menu shows `userName`); `studovna-page.tsx:75`, `progress-overview` hero, `settings-experience.tsx` profile.
- **Evidence:**
  - The `/learn` h1 says „Vítej zpátky, Alex.“ while the header chip says „D Demo“.
  - The account popover shows avatar **D** beside the name **Alex** in the same row.
  - Settings shows „Alex · Anonymní demo“.
- **Why it matters:** A first-time visitor is greeted by someone else's name. Guests (anonymous kind „guest“) get the same „Alex“.

| Before | After | Why |
| --- | --- | --- |
| `generateName: () => "Alex"`; greeting `Vítej zpátky, {name}.` | Greet anonymous identities without a name („Vítej zpátky.“ / „Vítej v ukázce.“). Use one display-name helper for header, menu, greeting and settings | One identity per person; no invented name |

**Expected impact:** Removes a visible inconsistency on the first screen of the demo funnel. Changing an auth plugin option or display logic is in scope only as presentation, so stored user names stay untouched (see PLAN guardrails).

#### P1-03 · The shell is styled twice. The override hides the Lab lock state and mis-targets the avatar (Accessibility + UI, HIGH)

- **Routes:** every `(app)` route at ≥ 1024 px.
- **Components:** `src/components/app-shell.tsx:55-63` renders a bordered pill nav with icons, a `bg-primary-soft` active state and a `LockKeyhole aria-label="Portfolio Lab je zamčený"`. `src/components/shell/paper-shell.module.css:4-11` then undoes it with structural selectors:
  - `.shell nav[aria-label="Hlavní navigace"] a > svg { display: none; }` (line 6) removes **every** svg in a nav link, including the lock icon. The locked Lab state disappears visually and from the accessibility tree on desktop.
  - `.shell > header summary > span:first-child { border-radius: 50%; width: 32px; height: 32px }` (line 10) matches the sr-only „Nabídka účtu“ span, not the avatar. The avatar therefore renders as an 8 px-radius square (see the account menu screenshot), not the intended circle.
- **Why it matters:** One state is lost (locked Lab), one style is mis-applied, and every future shell change has to be made in two places that fight each other. Selectors keyed to an `aria-label` break as soon as the label is translated or renamed.

| Before | After | Why |
| --- | --- | --- |
| Tailwind utilities in `app-shell.tsx` and contradicting unlayered overrides in `paper-shell.module.css` | Delete the override layer. Write the approved paper styling (text nav plus underline, flat header, round avatar) directly as the utilities in `app-shell.tsx`, and keep the lock icon visible next to „Lab“ | Delete before adding. One source of truth. The lock state must have a visible and an accessible cue (WCAG 1.3.1 / 4.1.2: the state is exposed in markup but removed by CSS) |

**Expected impact:** Restores the locked-Lab cue and removes a whole class of override bugs.

#### P1-04 · Portfolio Lab leads with the number the product says not to lead with (Layout, HIGH)

- **Routes:** `/lab/portfolio` (all widths), `/lab` hub card.
- **Components:** `src/components/lab/portfolio/portfolio-overview.tsx`, `process-feedback.tsx`, `performance-summary.tsx`, `lab-hub.tsx`.
- **Evidence:**
  - The largest element on the page is „6 951,59 Kč“, about 60 px.
  - The process card headline („Začni vlastním investičním plánem.“) is about 18 px.
  - Without an IPS, all 6 indicators read „… v IPS neurčen“, and the only plan CTA („Vytvořit nebo aktualizovat plán“) sits at the **bottom** of that card, about y = 1,330 at 1440.
  - At 390, a learner scrolls past about 1,500 px of six „not set“ indicators before seeing value or holdings. The only IPS entry above the fold is a small underlined link above the eyebrow.
- **Rule it breaks:** `AGENTS.md` / `docs/agents/ui-and-design.md` §17 says to prefer „Process feedback as the primary educational summary … portfolio value, holdings and available cash clearly visible for orientation“. `DESIGN.md` says „Portfolio Lab leads with explainable process feedback.“

| Before | After | Why |
| --- | --- | --- |
| 60 px value hero; process headline 18 px | Value as a `section-title`-sized orientation figure in a compact summary row (value · cash · P&L). The process headline uses `card-title` or larger | Visual weight follows the documented hierarchy |
| No IPS: 6 indicators each say „v IPS neurčen“; CTA at the bottom | No IPS: one prompt at the top of the card („Bez plánu nemáme s čím porovnávat“ + `Vytvořit investiční plán` primary button). Indicators that need the IPS collapse into one „Čeká na plán“ row. HHI, costs and turnover stay visible | One clear first action instead of six repetitions; matches the documented empty-state rule („clear first practice action connected to an IPS“) |

**Expected impact:** The first visit to Portfolio Lab gets one obvious next step that serves Milestone A, and about 1,000 px less scrolling on mobile.

#### P1-05 · Lab hub hides the two Milestone A tools as text links and gives Backtesting a hero card (Layout, MEDIUM-HIGH)

- **Route:** `/lab`.
- **Component:** `src/components/lab/lab-hub.tsx`.
- **Evidence:** In the 1440 screenshot, „Můj investiční plán (IPS)“ and „Krizový nácvik“ are 16 px underlined links with one-line descriptions under the hero. Below them, two equal hero cards show *Portfolio* and *Backtesting Lab* („Vrať se v čase…“).
- **Why it matters:** The product direction makes IPS plus the B10 crisis exercise the definition of Milestone A. Backtesting is an optional analytical tool. Visual weight is inverted.

| Before | After | Why |
| --- | --- | --- |
| IPS and crisis exercise as plain links; Backtesting as a full card | A „Tvůj plán“ row: IPS status (not started / saved on date) and crisis exercise status, each with one button. Portfolio card next. Backtesting demoted to a quieter tile or the „Navazuje na lekce“ list | Weight follows product priority |

**Expected impact:** Higher discovery of IPS and the crisis exercise, the gating outputs for the S1 metric („≥ 30 % complete Milestone A“).

#### P1-06 · One lesson, three numbering systems, and a title collision (Writing/IA, HIGH reach)

- **Routes:** `/learn`, `/progress`, every lesson route, `/lab`.
- **Evidence:**
  - Learn and Progress use registry display codes: „1.1.6 Výnos a složené zhodnocení“.
  - The lesson player eyebrow uses the **storage** module and position: `src/components/lesson/guided-lesson.tsx:159` renders „VÝNOS A SLOŽENÉ ZHODNOCENÍ · LEKCE 2“ on `/learn/returns/simple-returns`.
  - The Lab hub hard-codes „Kapitola 01 · lekce N“ for every lesson (`src/components/lab/lab-hub.tsx:52`), which is wrong for any lesson outside storage module 1.
  - The DB title of lesson `investing-foundations/risk-vs-reward` is „Výnos a složené zhodnocení“, the **same string** as storage module `returns`. So „Výnos a složené zhodnocení“ is a lesson on Learn and a module in the lesson header.
- **Why it matters:** Wayfinding breaks at the moment of entry. „Lekce 6 ze 10“ (continue card), „Krok 6 z 7“, „Lekce 2“ (player) and „Kapitola 01 · lekce 7“ (Lab) all describe the same journey.

| Before | After | Why |
| --- | --- | --- |
| Player eyebrow `${moduleTitle} · Lekce ${lesson.position}` | Player eyebrow from the curriculum registry: `{displayCode} · {display module title}`, for example „1.1.6 · Investiční základy“ | Same identity as the map the learner clicked |
| `Kapitola 01 · lekce {n}` literal | The registry display code | Removes a hard-coded falsehood |
| Duplicate title | Editorial rename of one of the two (display title only; stable IDs and slugs unchanged) | One name per thing |

**Expected impact:** Consistent orientation across Learn, the lesson player, Lab and Progress.

#### P1-07 · The landing demo invites a click that does nothing (Writing/UX, HIGH: misleads)

- **Route:** `/` (hero and „Každý modul končí výstupem“ section).
- **Components:** `src/components/marketing/pen-interactions.tsx:63-94`.
- **Evidence:**
  - The aside says „Zkus rozhodnutí. Vyber odpověď a zjisti…“, and the button label says „Vyber odpověď“.
  - The options are plain `<li>`s with `cursor: auto` and no controls. A click on option B changed nothing (verified in the browser).
  - `ANIMATIONS.md:41` documents the demos as read-only illustrations driven by a ghost cursor. That is a legitimate choice, but the copy contradicts it.
  - Under `prefers-reduced-motion`, the first demo renders **already answered** („vybráno, správně“).
- **Why it matters:** „Learn by doing“ is the brand promise, and the first thing a visitor tries does not respond.

| Before | After | Why |
| --- | --- | --- |
| „Zkus rozhodnutí. Vyber odpověď…“ on a non-interactive illustration | Either (a) make the hero demo a real two-option radio group with local state (no persistence, still „Ukázka bez zápisu“), with the ghost cursor only as an idle hint; or (b) change the copy to describe, not instruct („Takhle vypadá rozhodnutí v lekci.“) and drop the fake button | Copy must match affordance. (a) is better for the product promise; (b) is the 10-minute fix |

**Expected impact:** Removes a trust-eroding dead click at the top of the funnel.

#### P1-08 · Error, empty and loading states are six implementations, two of them with wrong copy (UI/Writing, MEDIUM-HIGH)

- **Routes:** every route whose server data fails.
- **Components:** 13 boundaries in total. `RouteState` is used by `app/error.tsx`, `app/not-found.tsx`, `(app)/error.tsx`, `learn/[moduleSlug]/not-found.tsx`, `lab/backtesting/error.tsx`, `lab/compare/*` and `lab/instruments/*`. Bespoke markup is used by:
  - `(app)/learn/error.tsx`
  - `(app)/progress/error.tsx`
  - `(app)/settings/error.tsx`
  - `(app)/lab/plan/error.tsx`
  - `(app)/lab/training/error.tsx`
  - `(app)/lab/portfolio/error.tsx` (inline `style={{ marginTop: 10, fontSize: "1.5625rem" }}`)
- **Evidence (`/lab/portfolio` failure screenshot):**
  - The guide bubble says „Hledám to. Občas to chvilku trvá.“ (*looking for it, it sometimes takes a while*) on a state that has **already failed**. It reads as loading. The same string appears in `progress/error.tsx:15`.
  - The „Načíst znovu“ button and the „Mezitím otevřít Učení“ link have **0 px** between them (button right edge x = 262, link starts x = 262).

| Before | After | Why |
| --- | --- | --- |
| Six bespoke boundaries | All boundaries use `RouteState` (extend it with an optional `guide` bubble and `meta` slot where needed) | One state language, one spacing rule |
| „Hledám to. Občas to chvilku trvá.“ on failure | A bubble that matches the state, e.g. „Tohle se teď nepovedlo načíst. Nic se neztratilo.“ — or no bubble | Errors are calm and plain; never imply progress that isn't happening |
| Actions abut | `RouteState`'s `.actions` gap, at least 16 px | Controls must read as separate targets |

**Expected impact:** Every failure looks and reads the same, and there is one place to fix future state copy.

#### P1-09 · The type scale exists in tokens and is ignored in code (Typography, systemic)

- **Routes:** all. Rendered size inventory: landing 18 distinct sizes; `/learn` 15; `/progress` 14; `/lab/compare` includes 9.075 / 9.98 / 12.7 / 18.15 px.
- **Components:** source-wide.
- **Evidence:**
  - `tokens.css` defines 7 product sizes.
  - Code uses **37 distinct CSS `font-size` values** across modules: 0.875rem ×109, 0.75rem ×72, 1.0625rem ×17, 0.6875rem ×11 and others.
  - It also uses **93 arbitrary Tailwind sizes** (`text-[15px]` ×37, `text-[13px]` ×23, `text-[17px]` ×8, `text-[19px]` ×6, `text-[11px]` ×5, …) and **98 Tailwind default sizes** (`text-sm` ×59, `text-base` ×19, `text-xs` ×10, …).
  - 14 px (`text-sm`, 0.875rem) is not on the product scale but is the most-used size. 11–12 px is below the documented 13 px microcopy floor.
- **Why it matters:** This is the main reason screens feel adjacent rather than unified. Every card picks its own size.

| Before | After | Why |
| --- | --- | --- |
| `text-[15px]`, `text-sm`, `font-size: .875rem` | `text-small` (15 px) | Use the token |
| `text-[13px]`, `.8125rem` | `text-microcopy` | Use the token |
| `text-xs`, `.75rem`, `.6875rem`, `text-[11px]` for readable text | `text-microcopy`. Keep ≤ 12 px only for chart axis ticks, and name that as a chart role | Floor of 13 px for UI text |
| No enforcement | Extend `src/styles/tokens.test.ts`, which already bans raw colors, to fail on arbitrary `text-[…]` in `.tsx`, Tailwind default sizes, and `font-size` literals in product CSS modules, with a marketing and chart allowlist | Prevents regression |

**Expected impact:** A visibly calmer, more consistent product, with the largest cohesion gain per hour.

#### P1-10 · Terminology and voice drift on core concepts (Writing, MEDIUM-HIGH)

- **Routes:** `/learn`, `/progress`, lesson routes, `/`.
- **Evidence:**
  - The mixed checkpoint has three names: „Smíšený checkpoint · 12 otázek“ (Progress rail), „Smíšená kontrola 1.1 · …“ (milestone list) and „Kontrola 1: ověření investičních základů“ (lesson title).
  - The milestone name „Připraven/a začít“ is visible on `/`, `/learn` and `/progress`. `PRODUCT.md` says „Never use slashed or bracketed forms such as ‚/a‘“. `docs/agents/product-and-curriculum.md` names the milestone with exactly that slash. **The documents contradict each other, so a founder decision is needed.**
  - The landing eyebrow is English, „LEARN INVESTING BY DOING“. `docs/terminology.md` says the UI is Czech with English only as a bracketed supplement.

| Before | After | Why |
| --- | --- | --- |
| Checkpoint / kontrola / Kontrola 1 | One term in `docs/terminology.md` (e.g. „Smíšená kontrola“), applied everywhere; add it to `terminology.test.ts` | One concept, one name |
| „Připraven/a začít“ | A gender-neutral milestone name (e.g. „Připraveno k začátku“ or „Start s plánem“), after a decision | Voice rule in `PRODUCT.md` |
| „LEARN INVESTING BY DOING“ | A Czech eyebrow, or none | Czech UI rule |

### P2: meaningful polish

| ID | Domain · sev. | Route(s) · Location | Before | After | Why / impact |
| --- | --- | --- | --- | --- | --- |
| P2-01 | Layout · MED | `/learn` · `studovna-page.tsx:75-90` | The continue card states the current step 3 times (guide bubble „…ověření znalostí · složení dvou změn“, card body „Krok 6 · Ověření znalostí…“, recap footer „Krok 6: Ověření znalostí…“) and leaves about 170 px of dead space above the CTA at 1440 | State the step once in the card. The bubble says something the card doesn't (or goes). The recap shows only „Co už víš“. Pull the CTA up to the content | The dominant learning surface gets denser and calmer |
| P2-02 | UI · MED (decision) | `/learn`, `/progress`, `/lab`, `/lab/portfolio`, `/settings`, auth, onboarding, errors · 16 files import `GuideImage` | The mascot is on almost every screen, including Settings (armchair), Progress (bookshelf) and Lab hub (hourglass) | Keep it only where `docs/agents/ui-and-design.md` §7 allows it (onboarding, completion, milestone, empty and error states). `DESIGN.md` also lists „continuation“; **reconcile the two documents first** | A rare mascot is a meaningful mascot; product screens get calmer |
| P2-03 | A11y/Typography · MED | All · `src/app/globals.css:7-12` | `button, a, [role=button] { user-select: none; -webkit-touch-callout: none }` | Remove it from `a`. Keep `user-select: none` on `button` only if needed | Inline links in lesson and legal prose become unselectable, and iOS long-press (open in new tab, preview) is disabled for every link |
| P2-04 | Colors · MED | `/lab/instruments/*`, `/lab/portfolio`, `/lab/compare` · `instrument-detail.tsx:228` and return analytics | Negative P&L and returns use `text-danger-ink`; positive use `text-success-ink` | Neutral ink with sign and arrow icon (already present), or a dedicated `--color-viz-negative` role | `danger` means error or wrong answer (`DESIGN.md`). Red/green return grading pulls attention to return, against „process, not return“ |
| P2-05 | Writing · MED | `/lab/instruments/*` · `instrument-detail.tsx:228`; `lab-hub.tsx:22` | „Množství **1 pozic**“ (wrong plural and wrong unit); hand-rolled plural `count >= 1 && count <= 4` | „1 ks“ / `Intl.PluralRules("cs")` helper for kus/pozice | A grammatical error on a core screen; one shared helper |
| P2-06 | A11y · MED | `/onboarding` · `personalization-flow.tsx:96` | `disabled={!canContinue}`: a grey „Pokračovat“ with no explanation | Keep it enabled. On submit without a choice, focus the fieldset and show „Vyber jednu možnost.“ | Never disable submit to signal invalid input (better-accessibility) |
| P2-07 | Layout · MED | `/lab/instruments/*` · `instrument-detail.tsx` header and `:228` | Two filled primary buttons: „Koupit AAPL“ (header) and „Koupit další“ (position) | Header keeps the primary. The position section uses `secondary` („Koupit další“, „Prodat“) | One primary per view |
| P2-08 | Writing/Data · LOW-MED | `/lab` vs `/lab/portfolio`; instrument detail | The same value is „6 952 Kč“ (hub) and „6 951,59 Kč“ (portfolio); „114 USD“ and „114,00 USD“ on one page | One formatter per context (summary = whole Kč, detail = haléře), documented | Numbers that differ between screens read as errors in a finance product |
| P2-09 | UI · LOW-MED | `/lab/portfolio` („Jak se to počítá“ ▸ native marker), `/learn` (right chevrons), `/progress` („Další hotové lekce (3) ⌄“) | Three disclosure affordances | One `Disclosure` style: chevron with rotate (already in `curriculum-map.module.css`) | Consistent affordance |
| P2-10 | Layout · LOW-MED | `/progress` skill cards · `progress-overview.tsx:111` | Mastery status wraps under the label in some rows and sits right-aligned in others | Fixed trailing status column (`grid-template-columns: minmax(0,1fr) auto`) | Scannable status column |
| P2-11 | A11y/Writing · LOW | `/progress` · `progress-overview.tsx:165-185` | h1 „Co už umíš, Alex.“ immediately followed by h2 „Co už umíš“ | Rename the h2 for its content („Klíčové myšlenky z lekcí“) | Unique, descriptive headings |
| P2-12 | UI · LOW-MED | CSS modules, source-wide | Radii outside the tokens: `10px` ×9, `4px` ×9, `2px` ×6, `3px` ×3; Tailwind `rounded-sm` ×18, `rounded-md` ×6 | Map to `--radius-compact/control/surface`. Add to the token test | Radius consistency is the second most visible cohesion signal |
| P2-13 | Writing · LOW-MED | `/` · `pen-landing.tsx:18,67` | The hero's only supporting sentence lists what is *not* ready („Lekce o rezervě, výběru brokera a daních připravujeme“). Broker fee-schedule lessons are already published, and the list is hand-maintained | Hero lede states the promise. The availability list moves to the roadmap card and derives from the curriculum registry | Lead with value. Prevents stale claims |
| P2-14 | Writing · LOW | `/lab/missions/[missionId]` · `page.tsx` | No metadata: tab title is „Investník“ | `generateMetadata` → „{mission title} · Investník“ | Tabs, history and screen-reader page announcements |

### P3: optional refinements

| ID | Location | Observation | Suggestion |
| --- | --- | --- | --- |
| P3-01 | `src/components/shell/navigation.ts:6` | The Lab tab icon is `Clock3`, a weak metaphor for „Co se stane, když…“ | `FlaskConical` or `Sprout`-family consistency check with the design owner |
| P3-02 | `/learn` 390 | „Základy investování · Lekce 6 ze 10“ breaks before „10“ | `&nbsp;` between number and noun, as the landing already does |
| P3-03 | `settings-experience.tsx:94` | Literal uppercase strings „PROFIL“, „NASTAVENÍ“, „ÚČET“ | Natural case plus the eyebrow class (`text-transform`) |
| P3-04 | `src/features/portfolio/repository.ts:131-139` | Under deterministic data with a pinned `DETERMINISTIC_MARKET_NOW` whose quote is not executable, the first Lab visit of a demo throws, and `/lab/portfolio` plus the instrument detail show the error state. This is QA/demo only: in FMP mode `demoObservations()` returns `[]` | Skip seed trades when the quote is not executable. This is a domain change, so it goes in a separate issue |
| P3-05 | `/learn` continue card | A sparkle icon next to „Tvoje místo v lekci zůstává uložené.“ | A save or check icon. Sparkle reads as „AI or reward“ |
| P3-06 | Account menu | „Odhlásit se“ in danger red for every account; „Dostupný 24 hodin“ is static | Neutral sign-out for accounts, danger only for demo (where it ends the profile); show remaining time for the demo |
| P3-08 | `instrument-detail.tsx:253` | The buy/sell sheet uses `backdrop:bg-foreground/35`, while other dialogs use `--color-backdrop`. Its `overflow-y-auto` has no `overscroll-behavior: contain`, so scrolling past the sheet's end scrolls the page behind | Use `backdrop:bg-backdrop` and `overscroll-contain` |
| P3-07 | Settings left nav | Sections „Portfolio Lab“ and „Učení“ share labels with primary destinations | „Nastavení Labu“, „Nastavení učení“, or icons plus a group label that makes the context obvious |

## 6. Motion audit (improve-animations + find-animation-opportunities)

**Recon.** Product motion is CSS transitions (18 × `transition-colors`, `--motion-micro` 180 ms, `Button` 160 ms ease-out), three `motion/react` components (completion fade, capital counter fade, badge opacity), all reduced-motion aware via `useLearningDuration`. There is one keyframe loop (navigation bar) and the onboarding step-enter keyframe. Sheets use a touch-only spring swipe (`sheet-swipe.ts`). The landing is GSAP with ScrollTrigger and Lenis inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`. Personality: calm learning product, so motion should stay crisp and rare.

**Frequency map.**
- 100+/day: nav, Tab and keyboard, lesson „Pokračovat“, disclosures.
- Tens/day: answer check, account menu, hover.
- Occasional: buy/sell sheet, reset dialog, settings dialogs.
- Rare: onboarding, lesson completion, milestone, landing.

### 6.1 Findings (corrective)

| # | Severity | Category | Location | Finding | Fix summary |
| --- | --- | --- | --- | --- | --- |
| M1 | MEDIUM | Missed / spatial consistency | `portfolio-overview.tsx`, `instrument-detail.tsx`, `settings/*` dialogs; `globals.css:19` | Sheets dismiss with a spring when swiped, but **open and close instantly** from buttons and Escape. Enter and exit don't share a path | `@starting-style` entry: right sheet `translate: 100% 0`, bottom sheet `translate: 0 100%`, opacity 0 → settled, `300ms cubic-bezier(0.32, 0.72, 0, 1)`. Exit 200 ms same path with `transition-behavior: allow-discrete` on `display` and `overlay`. Backdrop opacity 0 → 1 over 200 ms. Centred desktop dialogs: opacity plus `scale(0.97)` → 1, 200 ms `cubic-bezier(0.23, 1, 0.32, 1)`. Reduced motion: opacity only, 150 ms |
| M2 | LOW | Cohesion / feedback | `src/components/ui/button.tsx:12` vs `pen-landing.module.css:226` | Landing buttons scale to 0.96 on press; the product `Button` has no press feedback. Two motion languages for one button | Add `scale` to the transition list (`transition-[background-color,border-color,color,scale] duration-[160ms] ease-out`) and `motion-safe:not-disabled:not-aria-disabled:active:scale-[0.96]` (0.96 matches the existing landing convention) |
| M3 | LOW | Cohesion / tokens | `tokens.css:146-154`, `settings.module.css:178`, `backtesting-lab.module.css:238`, `personalization-flow.module.css:115-117` | Four copies of the reduced-motion kill switch with different values (`0s`, `.01ms`, `animation:none`) | Delete the three local copies. The root `.investi-theme` rule already covers them |
| M4 | LOW | Tokens | `tokens.css` `:root` | `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` (an ease-in curve) has **zero** consumers. `--motion-entry: 400ms` has none outside a token test | Delete `--ease-exit`. Add `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` for M1 and the opportunities below. Update `tokens.test.ts` |
| M5 | LOW | Easing | `navigation-status.module.css:24-33` | The indeterminate bar loops with `--ease-standard`. Constant motion should be `linear` | `animation: travel 1.1s linear 150ms infinite` |
| M6 | LOW (known) | Accessibility / purpose | `marketing/motion/sections/global.ts` `initNav` | The header `autoAlpha` fade fails axe contrast mid-animation. This is a recorded incident, and a fix is in flight on branch `fix/landing-header-animation-contrast` | Track; no new work |
| M7 | LOW | Physicality | `marketing/motion/sections/portfolio.ts:44` | The crisis low-point marker pops from `scale: 0` | `scale: 0.6, autoAlpha: 0` → `1` |

**Already right (don't touch):**
- No animation on lesson step changes, nav or tabs.
- `Button` hover is color-only.
- The completion screen uses opacity only and `0` under reduced motion.
- `ResponsiveDisclosure` and the curriculum `details` snap open (tens/day).
- Charts don't animate data.
- The landing is fully gated by `gsap.matchMedia`.

### 6.2 Opportunities (find-animation-opportunities)

| # | Location | Today | Purpose | Frequency | Suggested motion |
| --- | --- | --- | --- | --- | --- |
| O1 | Sheets and dialogs (see M1) | Teleport in and out | Spatial consistency | Occasional | As M1 |
| O2 | `src/components/lesson/lesson-answer.tsx:61` (feedback `role="status"`) | Feedback panel appears instantly after „Zkontrolovat odpověď“ | Preventing a jarring change; state indication | A few per lesson | `@starting-style { opacity: 0; translate: 0 4px }` → settled, `transition: opacity 200ms var(--ease-out), translate 200ms var(--ease-out)`. Reduced motion: opacity 150 ms only. The correct/incorrect icon and text already carry the state, so motion is never the only cue |
| O3 | `src/components/learning/completion-screen.tsx:20-28` | One 400 ms opacity fade for the whole block | Delight (rare) | Once per lesson | Stagger three chunks (icon, title and description, reward): each `opacity 0 → 1, y 8 → 0`, 300 ms `ease-out`, 60 ms apart via Motion `staggerChildren: 0.06`. Reduced motion: single opacity fade (current behavior). No confetti; lesson completion is learning, not trading |
| O4 | `src/components/ui/button.tsx` | No press feedback | Feedback | Tens/day | As M2 |

**Rejected candidates:**
- Lesson player step-to-step transition (`guided-lesson.tsx:113`). **Rejected: tens per lesson, often keyboard-driven. Instant plus focus move is correct.**
- Animated portfolio value or count-up on `/lab/portfolio`. **Rejected: functional financial data; animating it also dramatizes return, against product rules.**
- Price chart line draw on the instrument detail. **Rejected: data the user is reading.**
- Sliding active underline in the desktop nav. **Rejected: 100+/day navigation.**
- Height animation for curriculum `details`. **Rejected: frequent, functional, and `::details-content` support is Chromium-only.**

**Verdict.** Motion is already close to right: restrained, reduced-motion aware and off the hot paths. The one meaningful gap is spatial: sheets that swipe away with physics but appear from nowhere (M1/O1). That is the highest-leverage motion change. Everything else is token hygiene and two small feedback moments.

## 7. Route-by-route improvement matrix

Legend: ● needs work in this area · ○ minor · — fine or not applicable. Columns: **IA/Hier.** = information architecture and hierarchy, **Copy**, **Type** = type scale, **State** = empty/error/loading, **Comp.** = component consistency, **Motion**, **A11y**.

| Route | IA/Hier. | Copy | Type | State | Comp. | Motion | A11y | Findings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` (landing) | ○ | ● | ● | — | ○ | ○ | ○ | P1-07, P1-09, P1-10, P2-13, M6, M7 |
| `/sign-in`, `/sign-up`→`/onboarding`, `/forgot-password` | — | — | ○ | — | — | — | — | P1-09 |
| `/onboarding/*` | — | ○ | ○ | — | ○ | — | ● | P2-06, M3 |
| `/learn` | ● | ● | ● | ○ | ○ | — | — | P1-01, P1-02, P1-06, P1-10, P2-01, P2-02, P3-02, P3-05 |
| `/learn/[module]` | ○ | ○ | ○ | — | — | — | — | P1-06 |
| `/learn/[module]/[lesson]` | ● | ○ | ○ | — | — | ○ | — | P1-06, O2, O3 |
| `/learn/checkpoint/[code]` | — | ● | ○ | — | — | — | — | P1-10 |
| `/progress` | ● | ● | ● | ● | ○ | — | ○ | P1-01, P1-02, P1-08, P1-10, P2-09, P2-10, P2-11 |
| `/lab` | ● | ● | ○ | — | ○ | — | — | P1-05, P1-06, P2-02, P2-05, P2-08 |
| `/lab/portfolio` (+ `/mix` redirect) | ● | ○ | ● | ● | ● | ● | — | P1-04, P1-08, P2-04, P2-08, P2-09, M1 |
| `/lab/instruments/[id]` | ○ | ● | ● | — | ● | ● | — | P2-04, P2-05, P2-07, P2-08, M1 |
| `/lab/compare` | — | — | ● | — | — | — | — | P1-09 (chart text 9–12 px) |
| `/lab/plan` (IPS) | ○ | — | ○ | ○ | — | — | — | P1-05 (entry point), P1-08 |
| `/lab/training` | ○ | — | ○ | ○ | — | — | — | P1-05, P1-08 |
| `/lab/backtesting` | ○ | — | ○ | — | — | — | — | P1-05 (demotion), M3 |
| `/lab/missions/[id]` | — | ○ | ○ | — | — | — | — | P2-14 |
| `/settings` | ○ | ○ | ○ | ○ | ○ | ● | — | P1-02, P1-08, P2-02, P3-03, P3-07, M1, M3 |
| App shell (all `(app)`) | ○ | ○ | — | — | ● | — | ● | P1-02, P1-03, P2-03, P3-01, P3-06 |
| `/pruvodce`, `/pro-instituce`, `/privacy`, `/terms` | — | — | ○ | — | — | — | — | P1-09 |
| Not-found / global error | — | — | — | ○ | — | — | — | P1-08 (reference implementation) |

## 8. Verification log

**Passed (run and observed):**
- `node sweep.mjs`: 135 loads, all status 200, intentional 404 or redirect (`/sign-up` → `/onboarding`, `/lab/portfolio/mix` → `/lab/portfolio`), `scrollWidth − innerWidth = 0` everywhere.
- axe-core 4.14 (`wcag2a, wcag2aa, wcag21aa, wcag22aa`) at 1440 and 390 on all 27 routes: 0 violations.
- Buy sheet: `dialog:modal` true. Focus lands on „Zavřít pokyn“; Escape closes and focus returns to „Koupit AAPL“.
- Account menu (`<details>`): opens, Escape closes, focus returns to the summary.
- `/learn` Tab order: skip link → wordmark → account → continue-card links → disclosures (logical).
- Landing demo click test: no state change (P1-07). Reduced-motion run renders the answered state.

**Not verified:** listed in §1.

**Verdict (better-interface):** `Block` for a release labelled „polished“: HIGH-ranked findings P1-01 to P1-10 remain. For day-to-day shipping there is **no P0**, and accessibility and responsiveness are in good shape. Every domain was reviewed; none are marked `Not reviewed`.
