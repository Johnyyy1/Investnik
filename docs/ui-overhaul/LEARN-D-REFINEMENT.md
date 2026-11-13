# Learn direction D: refinement (2026-11-13)

This document records the refinement of direction **D „Studijní pracoviště“** (decision F1 in [PLAN.md](PLAN.md)) from a first prototype into a production-ready design. The design is still a development-only prototype. Production `/learn` is unchanged. Integration is planned in [LEARN-D-INTEGRATION.md](LEARN-D-INTEGRATION.md).

- **Branch and worktree:** `proto/learn-d-refinement` in `.claude/worktrees/learn-d-refinement`. It is based on `fix/learn-recap-answer-leak` (f81c5a2) plus the `docs/learn-direction-d` plan commit. It carries a byte-identical snapshot of the uncommitted `proto/learn-variant-d` state (commit 865b4fc). The `design-foundation` and `learn-variant-d` worktrees were read, not edited.
- **Preview:** `npm run dev`, then open `/dev/learn-variants/d?stav=rozpracovano`. The route returns 404 outside `next dev`.
- **Commits:** 865b4fc (snapshot), 30db51e (WP-18 heading cascade), 8ed759f (D refinement), plus this documentation commit.

## 1. Method

**Skills loaded and followed:** `better-layout`, `better-typography`, `better-ui`, `better-interface`, `better-accessibility` (Jakub Krehel); `emil-design-eng`, `improve-animations`, `animation-performance` (Emil Kowalski).

**Not used: `review-animations`.** It is installed with `disable-model-invocation`, so the agent cannot load it, and its workflow was not reproduced. The motion review below therefore stands on `emil-design-eng`, `improve-animations` and `animation-performance` only. Run `/review-animations` yourself on `src/app/dev/learn-variants/_prototype/variant-d-client.tsx` if you want that pass.

**Runtime:**
- `next dev` on port 3311 from the worktree.
- `DATABASE_URL` pointed at an unreachable address, so no page could touch a database.
- Deterministic market and FX providers. All outbound providers (Resend, FMP, OAuth) blanked.
- Playwright with system Chrome and axe-core 4.x.
- Browser text size was set through CDP `Page.setFontSizes`, which changes the default font size, not page zoom. Media queries written in rem therefore respond as they do for a reader who enlarges text.

## 2. Before and after

Measured on the returning learner (6 lessons done, open numeric question) in the same browser. Screenshots: [before 1440](learn-d/before-b-1440.png), [after 1440](learn-d/b-returning-1440.png), [before 390](learn-d/before-b-390.png), [after 390](learn-d/b-returning-390.png).

| | Before (865b4fc) | After |
| --- | --- | --- |
| Rail leading edge vs. wordmark at 1440 | Rail at x = 0 to 16, wordmark at 64 | Rail text at 64, the wordmark's edge |
| Rail rows | 36 px pointer rows, 44 px only in the sheet | 44 px (`control-sm`) everywhere, one tree for pointer and touch |
| Rail when scrolling | Sticky 80 px below a header that does not stick (gap above the rail) | Sticks to the top. The header scrolls away, as rendered today |
| Main column | `max-w-reading`, centred in the leftover space | `max-w-focused` on the rail's grid, text capped at 65ch |
| Pre-answer help | „Potřebuješ nápovědu?“ showed the authored `incorrectExplanation`, which states the result in 13 of 227 questions | „Jak odpovědět“ explains the answer format and where the explanation lives. No explanation before an attempt |
| Grading | A local copy (`Number(value.replace(...))`, tolerance check) | Production `evaluateQuestion` + `feedbackFor`, the same functions as the lesson player and the server |
| Question kinds | Numeric only | Numeric and multiple choice: 227 of 257 graded steps. The other 30 show the step and a CTA |
| Learner states | One (the demo) | Six deterministic states through the production builders |
| Fact tokens | `{{trh.xetra_hodiny}}` rendered raw (17 of 475 saved steps) | Resolved as on the lesson route |
| Headings | `<p>` stand-ins where a heading needed label styling | Real `h2`/`h3`, after WP-18 fixed the cascade |
| Lab row | Always „Cvičný kapitál“, even when locked | Locked (with 5 of 7 progress), unlocked, loading and unavailable states |
| Height at 1440 / 390 | 1,070 / 1,341 px | 1,165 / 1,421 px (target ≤ 3,800 at 1440; production today 4,960) |
| Primary action y at 1440 | 511 px | 514 px. Nothing pushed it down |
| Distinct font sizes rendered | 7 | 7 |
| axe (WCAG 2.2 A/AA) | 0 | 0 in all 18 state × width runs |

## 3. Design decisions

### Layout and spacing

- **One leading edge.** The workspace uses the box of the header as rendered: `max-w-shell` with 20, 40 and 64 px gutters, switching at 768 and 1200 px. The rail bleeds 8 px of hover background past that edge (`-ml-4 px-2`). Its text sits exactly under the wordmark, and the scroller keeps the 7 px the focus ring needs. WP-04 keeps today's rendered header, so this alignment survives it.
- **Proportions.** The rail is 17 rem (`--spacing(68)`). The gap is 48 px, or 64 px from `xl`. The main column is `max-w-focused` (56 rem), left-aligned on the grid. At 1440 that leaves an 80 px margin on the right instead of the 224 px a reading-width column would. At 1024 the main column is 624 px wide. Reading text inside it is capped at `max-w-prose` (65ch), so line length does not grow with the column.
- **Vertical rhythm.** 16 px inside the header group. 32 px from the header to the task surface. 20 px from the surface to its secondary links. 48 px between regions on phones and 64 px from `lg`. The rail title row and the eyebrow row are both 44 px high and start at the same y, so the two columns begin on one line.
- **Task surface padding.** 16 px at 320, 20 px from 375, 32 px from 640 (DESIGN.md: 16 phones, 20 to 24 tablets, 28 to 32 desktop cards).
- **Hierarchy.** There is one raised surface: the active step, with the card shadow. Everything else is type and space. „Tvoje cesta“ is a ruled list, not cards. There is one filled button per view: „Zkontrolovat“, then „Pokračovat v lekci“, or „Začít lekci“ / „Pokračovat od kroku N“, or „Pokračovat“ for the milestone.

### Typography

- **Roles only.** The page renders 7 sizes: page-title, card-title, emphasis, body, small, microcopy and label.
- **Lesson title** (`h1`, page-title): `text-balance`, plus `hyphens-auto` with `overflow-wrap: anywhere` as the fallback. At 200 % text on a phone, „zhodnocení“ now breaks as „zhod-nocení“ instead of „zhodnoce/ní“. The document is `lang="cs"`.
- **Labels.** „ROZDĚLANÁ LEKCE“, „KROK 6 ZE 7“ and „TVOJE CESTA“ use the label role (uppercase, 0.083em). „Tvoje cesta“ is now a real `h2` in label style, which needed WP-18.
- **Rail.** Titles in `small` (15 px). Counts and module names in `microcopy` (13 px), with `tabular-nums` on counts. The current lesson is semibold. Others are `secondary`.
- **Czech details.**
  - Counts vocalize the preposition: „ze 7“ but „z 9“ (`outOf`).
  - Non-breaking spaces keep a number with its unit together („20 %“, „100,20 Kč“).
  - „asi 5 min“ and „2 lekce“ never break.

### Rail

- **Folding.** Only the level of the continuation is open. Inside it, two or more finished lessons fold into one row („5 hotových lekcí“), so the open level shows position, not a column of checkmarks. Levels 4 to 6 and V share one „Prohloubení“ disclosure. Levels without published lessons say „Připravujeme“.
- **Indentation.** The lesson status icons line up under the level titles, past the 24 px code column. Module names appear only when a level has more than one module.
- **States.**
  - Done: a check icon.
  - In progress: a dot icon.
  - Not started: a ring.
  - A completed level shows a teal check beside „10/10“.
  - The lesson in the main pane gets `primary-soft`.
  - The continuation is semibold and carries `aria-current="step"`. The previewed lesson carries `aria-current="page"`.
  - Every row has screen-reader text: „Hotovo“, „Rozpracováno“ or „Nezačato“, plus „na řadě“.
- **44 px everywhere** (resolves the 36 vs. 44 conflict in favour of `DESIGN.md`). Measured: the smallest visible rail row and summary is 44.0 px in both the rail and the sheet. Folding keeps the tree short, so no density exception is needed.
- **Collapse.**
  - The toggle swaps the grid track to 2.75 rem instantly. Navigation never animates.
  - The toggle stays mounted, so focus stays on it.
  - It carries `aria-expanded` and `aria-controls`, and the tree is `hidden` while collapsed.
  - No persistence until someone asks for it (plan WP-20).
- **Keyboard.** All rows are native links and `<details>`, so there is no custom key handling. A „Přeskočit kurikulum“ link appears on focus at the top of the rail. The shell's own skip link lands before the rail, so without it a keyboard learner tabbed through about 12 rows to reach the question. `scroll-padding-top` keeps a focused row clear of the rail's sticky title.

### Components

- **Inline question.**
  - Numeric: a labelled input (`inputmode="decimal"`, 16 px text so iOS does not zoom) with its unit shown inside, beside „Zkontrolovat“. Both are 52 px (`control-lg`): one row, one height.
  - Choice: native radios in a `fieldset` with a `legend`. Each option is a full 52 px row with a focus ring around the whole option.
  - Check stays enabled. An empty or malformed answer gets a field error („Napiš odpověď jako číslo. Desetinnou část odděl čárkou.“) wired through `aria-invalid` and `aria-describedby`, and focus returns to the field.
  - Verdicts go into a stable `role="status"` region that is rendered empty first.
  - A correct answer replaces the button with „Pokračovat v lekci“ and moves focus to it.
  - Choices grade only on „Zkontrolovat“. Arrow keys move the selection without revealing anything.
- **Feedback.**
  - Correct: Soft Teal, a check icon, „Správně.“ and the authored `correctExplanation`.
  - Wrong: Error Tint, an error border and icon, „Ještě ne.“, the authored explanation (`feedbackFor`, so a wrong option's own explanation wins), then „Uprav odpověď a zkontroluj ji znovu.“
  - Never colour alone.
- **Help disclosure („Jak odpovědět“).** It covers method and format only: how to type the number and where the earlier steps live. No authored explanation appears before an attempt (see §6). It closes away once the answer is correct.
- **Step meter.**
  - One segment per step: finished steps in `progress`, the open step in `primary-tint`, the rest in `track`.
  - `role="progressbar"`, with `aria-valuetext` reading „Krok 6 ze 7“.
  - Shown only for a lesson in progress. A lesson not yet started shows „3 kroky · asi 5 min“ instead, so nothing implies progress that does not exist.
- **Secondary rows** („Tvoje cesta“):
  - Each row is a whole link, at least 52 px.
  - Icon, title and detail, with an arrow that darkens on hover. The title underlines on hover.
  - The milestone row is hidden while the milestone itself is the main task.
- **„Potom“.** The next unfinished lesson after the continuation, outside the optional levels. It flows inline, so a wrapped title keeps its minutes on the last line (fixed at 320 px).
- **Loading and empty states.** The Lab row shows „Načítám cvičný kapitál…“ in a status region (`?lab=loading`) and „Portfolio se teď nenačetlo. Zkus ho otevřít znovu.“ (`?lab=unavailable`), never 0. Empty modules show „Připravujeme“ with a dashed ring.

## 4. Learner states

Each state is a list of lesson-progress rows, run through `recommendLearning`, `getLearnerSummary`, `milestoneStates` + `milestoneANavigation`, `evaluateUnlock` and `getPracticeCapitalSummary`, exactly as `loadLearner` and `/learn` combine them. Nothing about completion, unlock or milestones is written by hand. The clock is fixed at 2026-11-13. Switch with `?stav=` or the picker (keys 1 to 6). The fixtures model a regular account, not a demo identity: a demo identity always has Portfolio Lab unlocked.

| `?stav=` | State | What it demonstrates | Verified |
| --- | --- | --- | --- |
| `novy` | **A · New learner.** No rows | „Začni tady“, the recommendation reason, lesson 1.1.1 at step 1 with „Začít lekci“. No step meter. The rail shows „52 lekcí“ (not 0/52), every lesson „Nezačato“, the first one highlighted. Lab locked at 0 of 7. „Přizpůsobit učení“ row | No progress indicator implies progress. Every control leads somewhere: the lesson, the rail preview, `/progress`, `/lab/portfolio` or `/onboarding?personalize=1` |
| `rozpracovano` | **B · Returning.** The demo seed: 6 done, `foundations-risk-reward` saved at step 6 of 7 | „Rozdělaná lekce“, meter 5 of 7 filled, the numeric question (+20 % then −20 %) inline, „5 hotových lekcí“ folded. Lab locked at 5 of 7 | No recap, no explanation, no „96“ before an attempt. Wrong → „Ještě ne.“ with the method. „96,0“ → correct |
| `vyber` | B2 · 5 done, `foundations-markets` at step 3 (choice) | The multiple-choice treatment | Arrow keys do not grade. Wrong and right options give their own explanation |
| `vyklad` | B3 · 5 done, `foundations-markets` at step 5 (no question) | The step text with its resolved fact („Xetra … 9:00 do 17:30“), „Pokračovat od kroku 5“, „Co už víš z kroků 1–4“ | Recap only on an ungraded step. No raw `{{…}}` |
| `modul` | **C · Module done.** All of 1.1, nothing in progress | „Modul 1.1 Investiční základy máš hotový. Po Základech je dalším krokem práce s výnosy.“, lesson 3.1.1 (the production recommendation), level 1 closed with a teal check, Lab unlocked (5,000 Kč grant) | Nothing asks to repeat 1.1. See finding C-3 on where the recommendation points |
| `milnik` | C2 · All 28 Milestone A lessons | The main task becomes the next requirement („Smíšená kontrola 1.1 · Investiční základy“) with a written checklist (Lekce 28 z 28 ✓, Dovednosti 0 z 22, Závěrečný projekt 0 z 1) and „Všechny lekce zůstávají otevřené.“ | No lesson prompt. The milestone is not called achieved. XP and capital are not mentioned as rewards |

## 5. Responsive behaviour

| Width | Behaviour |
| --- | --- |
| ≥ 1200 | 64 px gutters. Rail and main column. Gap 48 px (64 from 1280) |
| 1024–1199 | 40 px gutters. Rail and a 624 px main column |
| 768–1023 | No rail. „Kurikulum“ (48 px, secondary) sits in the eyebrow row and opens the bottom sheet. 40 px gutters |
| < 768 | 20 px gutters, matching the header. Full-width CTA. The app's bottom tab bar, with the shell's bottom padding |
| 320 | No overflow. The title wraps in 2 lines, „Potom“ wraps inline, the Lab detail wraps |
| 200 % text | The rail breakpoint is rem-based (64 rem), so at 32 px default text even 1440 uses the sheet. No overflow, nothing clipped. Titles hyphenate |

Measured: 0 px horizontal overflow and 0 console errors for every state at 1440, 1280, 1024, 768, 390, 375 and 320 (42 loads). Text size 32 px (200 %) at 1440, 390 and 320, and 24 and 28 px at 1440: 0 overflow, 0 elements outside the viewport.

## 6. Correctness protection

- **Recap leak (f81c5a2).** It is not in `origin/main` yet. This branch is built on it, and D uses `studovnaLesson()` unchanged, so its rule (no recap on a graded step) applies. The model adds a second structural rule: no step description on a graded step.
- **No pre-answer hint.** The previous „Potřebuješ nápovědu?“ is gone. The help text is generic, written for D, and contains no lesson content.
- **Grading.** `evaluateQuestion` and `feedbackFor` are imported, not copied. In production the server still re-grades in `saveLessonPositionAction` → `transition.ts`, which refuses to move past a step unless every graded block is correct. D answers inline only when the step has exactly one graded block (true for all 257 graded steps today).
- **Nothing persists from the prototype.** It saves nothing. A correct answer links to the lesson. Production keeps `saveLessonPositionAction(lessonId, position + 1, { answer })` (WP-20).
- **Tests** (`src/app/dev/learn-variants/_prototype/workspace-model.test.tsx`, 9 tests):
  - each state's semantics;
  - every published lesson appears in the rail exactly once in every state;
  - for every saved step of every published lesson (475 positions, 257 graded), the text shown before an attempt contains no numeric answer, no correct choice label in step-derived text and no raw fact token;
  - the server-rendered question markup contains no explanation and no verdict before an attempt.

## 7. Accessibility findings

| Finding | Status |
| --- | --- |
| Pre-answer hint revealed results (13 of 227 explanations state the answer) | Fixed: removed |
| Shell skip link lands before the rail. About 12 Tab stops before the question (WCAG 2.4.1) | Fixed in D: „Přeskočit kurikulum“, visible on focus, 44 px. Verified: the next Tab lands in `main` |
| 36 px rail rows below the documented floor | Fixed: 44 px everywhere |
| Multiple choice graded on change (production `StudovnaQuestion`), so arrow keys reveal every explanation | Fixed in D. Production finding C-4 |
| Check disabled until valid (lesson player) | D keeps Check enabled and validates on submit. The player is unchanged (finding C-5) |
| Heading cascade forced `<p>` for label-style headings | Fixed by WP-18. Real headings throughout |
| Sheet focus | Verified: modal `<dialog>`, focus inside on open, Escape closes, focus returns to „Kurikulum“, choosing a lesson closes and navigates |
| Focus visibility | Verified: the first 16 Tab stops at 1440 each show a ≥ 2 px outline fully in view (the shell's 3 px ink ring) |
| axe-core (wcag2a, wcag2aa, wcag21aa, wcag22aa) | 0 violations: 6 states × 1440, 1024, 390 |
| Not verified | VoiceOver and other real screen readers, Safari, Firefox, physical iPhone (swipe, safe area), forced-colours mode |

## 8. Motion

D adds two movements and removes none. Both follow DESIGN.md's tokens, and the root reduced-motion rule makes them instant (verified: computed `transition-duration: 0s`).

| Element | Decision | Values | Why |
| --- | --- | --- | --- |
| Rail collapse, disclosures, chevrons | No animation | Instant | Navigation and frequent toggles. Motion would only slow them |
| Curriculum sheet entry | Animate | `translate` from 100 % to 0, 270 ms (`--motion-surface`), `--ease-drawer`, via `@starting-style` | Spatial continuity: the sheet comes from the edge it is swiped back to. It animates `translate`, not `transform`, so it never fights the swipe hook, which writes `transform` inline (verified: computed `transition-property: translate`). Composite-only property, CSS off the main thread |
| Sheet exit | No animation (Escape, ✕, link). The swipe dismiss keeps its spring | — | Exits are shorter than entries. A closing sheet adds no information. WP-10 owns the shared enter and exit path |
| Answer feedback | Animate | Opacity 0 → 1 and `translate-y` 4 px → 0, 180 ms (`--motion-micro`), `ease-out`, keyed per attempt | Confirms that the input was heard, including a second identical verdict. A few times per visit. The text and icon carry the state if motion is off |
| Option and row hover | Colour only | 180 ms `background-color` and `border-color` | Frequent. No movement |
| Button press | Unchanged | — | WP-11 adds `scale(0.96)` to `Button` everywhere. Not a D concern |

No `will-change` (no observed stutter), no `transition: all`, no blur, no layout properties.

## 9. Proposed DESIGN.md changes (for approval, not applied)

1. **F4, rail rows:** record „44 px (`control-sm`) at every width for navigation trees and rails“ under Controls and states. The plan already decided this.
2. **Rail width:** add `--container-rail: 17rem` (or a `rail` width token) so the rail stops using `--spacing(68)`.
3. **Answer option height:** DESIGN.md says 55 px for answer options (the Studovna module). D uses `control-lg` (52 px), which is on the scale. Propose 52 px for every answer option and retire 55 px in WP-01.
4. **Heading styles:** add one sentence to Typography: „The heading default lives in `@layer base`, so a heading may take a type-role utility (e.g. a label-style `h2`).“
5. **Learn layout:** replace „The continuation surface has a flexible exercise column plus a (392px) recap …“ in Layout with D's composition: header box, 17 rem rail, `focused` main column, 65ch text.
6. **Feedback entrance:** list „answer feedback: 180 ms opacity + 4 px translate“ under Motion as the WP-13 starting point.
7. **Validation:** under Inputs, „Keep Check enabled and validate on submit; never grade on change.“

## 10. Screenshots

All under [`learn-d/`](learn-d/). Desktop shots are full page. Mobile shots use a page-tall viewport, so the fixed tab bar sits at the bottom.

- **States:** `a-new-{1440,390}`, `b-returning-{1440,1024,768,390,320}`, `b2-choice-{1440,390}`, `b3-explanation-{1440,390}`, `c-module-done-{1440,390}`, `c2-milestone-lessons-{1440,390}`.
- **Interactions:** `b-wrong-answer-390`, `b-correct-answer-1440`, `b2-wrong-choice-1440`, `b-help-open-1440`, `b-rail-collapsed-1440`, `b-preview-other-lesson-1440`, `b-sheet-open-390`.
- **Text size and Lab states:** `b-text-200-{1440,390}`, `lab-loading-1440`, `lab-unavailable-1440`.
- **Before:** `before-b-{1440,390}`.

## 11. Open items

- **D6 (rail target).** Rail rows still open the in-page preview (`?lesson=`), so reviewers can judge it. The plan recommends going straight to the lesson. Founder decision.
- **D1.** „Připraven/a začít“ still shows a slash form (PRODUCT.md voice rule).
- **Study-plan context.** The plan context block („Jak si rozvrhnout učení“, the recommended lesson when it differs) has no home in D yet. The reason line covers the „why“. See decision D7 in the integration document.
- **Real-device and real screen-reader checks** (§7) are still open.
