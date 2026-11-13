# Learn direction D: production integration plan (2026-11-13)

> **Status:** implemented on `feat/learn-direction-d` as one PR, with one commit per package (WP-17 to WP-22), awaiting founder review. Deviations from this plan are listed in [§8](#8-as-built-differences).

How the refined D prototype ([LEARN-D-REFINEMENT.md](LEARN-D-REFINEMENT.md)) becomes production `/learn`. This document plans the work and changes no production behaviour. It refines WP-17 to WP-22 in [PLAN.md](PLAN.md#learn-direction-d-approved-2026-11-13) with what the refinement learned. Every package stays one issue, one worktree and one PR, and none merges without the founder.

## 1. Target architecture

```
(app)/layout.tsx  (server, unchanged)
  getCurrentUser → redirect · loadPortfolioLabUnlockStatus (request-memoized) · AppShell · <Suspense AppRouteFallback>
└─ (app)/learn/page.tsx  (server)
     loadLearner() ─┐
     loadMilestones()┼─► learnWorkspaceModel(summary, milestones, lab, factToday())   ← pure, WP-19
     loadPortfolioLabUnlockStatus() (memo hit) ┘
     └─ <LearnWorkspace model> (server component, WP-21)
          ├─ <CollapsibleWorkspace> (client: collapse state only)
          │    └─ <RailTree> (server markup passed as children: links + <details>, no lesson copy)
          ├─ <CurriculumSheet> (client: <dialog>, useSheetSwipeDismiss)
          ├─ <InlineQuestion block lessonId position href> (client: evaluateQuestion/feedbackFor,
          │      saveLessonPositionAction → router.push(href) + refresh)
          └─ <JourneyRows> with the Lab row in its own <Suspense> (portfolio card view, streamed)
```

- **Server and client boundary.** Only three client components cross it, the same three as the prototype.
  - `CollapsibleWorkspace` receives server-rendered children.
  - `CurriculumSheet` receives the same server-rendered tree.
  - `InlineQuestion` receives one serialized question block. The full block is already sent today by `StudovnaQuestion` (multiple choice, including `correctOptionId`), so no new data reaches the client.
- **Lesson copy.** No lesson copy enters client JavaScript. `check:lesson-bundle` rule 1 covers this. `question-evaluation` (with `exercise-evaluation`) becomes part of the `/learn` client chunk; it already ships in the lesson route.
- **Single source of truth.**
  - Progression comes from `getLearnerSummary`.
  - Placement, status and counts come from `curriculumMapModel`.
  - The preview and recap come from `studovnaLesson`.
  - Milestones come from `milestoneStates` and `milestoneANextStep`.
  - Access comes from `loadPortfolioLabUnlockStatus`.
  - Grading comes from `evaluateQuestion`/`feedbackFor` on the client and `transition.ts` on the server.
  - `learnWorkspaceModel` only arranges these. It computes nothing about progress, access or rewards.

## 2. Reuse map

| D piece | Production source | Action |
| --- | --- | --- |
| `learnWorkspaceModel` + tests | `_prototype/workspace-model.ts` | **Move** to `src/components/learning/learn-workspace-model.ts` (WP-19). Drop its local fact resolver once C-2 lands, because `studovnaLesson` will return resolved text |
| Learner-state fixtures | `_prototype/scenarios.ts` | **Keep** as test fixtures (`learn-workspace-model.test.ts`). The `/dev` route goes in WP-22 |
| `RailTree` | `curriculum-map.tsx` (Learn and Progress) | **New** server component in `src/components/learning/learn-rail.tsx`. `CurriculumMap` stays for `/progress` until WP-06 |
| `CollapsibleWorkspace` | none | **Move** (client, about 25 lines) |
| `CurriculumSheet` | `useSheetSwipeDismiss` (`src/components/ui/sheet-swipe.ts`) | **Move**. It already reuses the hook. WP-10 later moves every sheet to one enter and exit path |
| `InlineQuestion` | `StudovnaQuestion` (choice only, grades on change, saves) | **Refactor** `StudovnaQuestion` into D's component. Keep `saveLessonPositionAction(lessonId, position + 1, { answer })`, the `busy` ref, the `pending` state („Ukládám…“, `aria-busy`), the `role="alert"` save error, and `router.push(href); router.refresh()` |
| Step meter | inline progressbar in `studovna-page.tsx` | **Replace** with the segmented meter (`aria-valuetext`) |
| Journey rows | `PortfolioCard`, the progress side card, `PersonalizationPrompt` | **Replace** the cards with rows. Keep `PersonalizationPrompt`'s „Teď ne“ dismissal (localStorage key `investi-personalization-prompt:<id>`) as a ghost icon button on its row |
| Footer | `studovna-page.tsx` footer (wordmark, disclaimer, settings and legal links) | **Keep** production's footer content. The prototype shows only part of it |
| Error boundary | `(app)/learn/error.tsx` (bespoke, P1-08) | WP-07 moves it to `RouteState`. Not blocking |
| `Button`, `ButtonLink`, `IconButton`, `controlClassName` | `src/components/ui` | Reuse as is |

## 3. Data dependencies and states

| Region | Data | States to support |
| --- | --- | --- |
| Rail | `summary.lessons`, `summary.states`, `summary.completed`, `summary.next`, curriculum registry | 0 done („52 lekcí“), some done (folded), level done (check), module empty („Připravujeme“), optional levels |
| Main | `studovnaLesson(summary)`, `summary.state`, `summary.position`, `stepCount`, `recommendation.reasonCode`, last completion's module | new · resume (choice, numeric, other graded kind, ungraded with recap) · next (+ finished module) · milestone (requirements, next, achieved) |
| Potom | registry order after the continuation, outside L4 to L6 and V | absent at the end of the required curriculum and in milestone mode |
| Milestone row | `loadMilestones()` → A | open / achieved / unavailable (keep production copy) |
| Lab row | `loadPortfolioLabUnlockStatus`, `summary.practiceCapital` | locked (n of 7) · unlocked (capital) · loading (Suspense fallback) · unavailable (load threw) · guest („requiresAccount“) |
| Personalization row | `summary.profile.personalizedOnboardingCompletedAt`, localStorage dismissal | shown / dismissed |

**Identity differences.**
- *Demo* identities are always unlocked (`evaluateUnlock(isDemo)`), and their header chip says „Demo“.
- *Guests* (`isGuestIdentity`) are never unlocked and see `requiresAccount`. The locked row must then say that saving an account comes first, not „5 ze 7 lekcí“. No component reads `requiresAccount` today, so this copy has to be written (`better-writing`, PRODUCT.md voice).
- *Accounts* that have not finished initial onboarding never reach `/learn` (layout redirect), so state A in production usually carries an entry-test recommendation (`ENTRY_TEST_PLAN`), not `FOUNDATIONS_START`. The fixtures use no profile. Add a profile fixture to the WP-19 tests.

**Loading.** The shell keeps its single persistent Suspense boundary (`AppRouteFallback`). The Lab row streams in its own boundary, as the portfolio card does today, so quotes never hold the lesson content (perf #401 to #406). D's Lab row needs only the unlock status and the earned capital, both cheap. Drop `loadPortfolioCardView` from `/learn` unless the founder wants composition back. That removes the quote-dependent work from the route.

## 4. Correctness findings

These were found during the refinement. Each is isolated from the visual work and proposed as its own PR. None was changed in production here.

| # | Finding | Evidence | Proposed fix |
| --- | --- | --- | --- |
| C-1 | **Recap leak**: the recap beside an open question can state its answer | `foundations-risk-reward` step 5 → 6 („…dává 96“) | Done on `fix/learn-recap-answer-leak` (f81c5a2), **not yet on `origin/main`**. Ship it first, unchanged (WP-17). This branch is built on it |
| C-2 | **Raw fact tokens on `/learn`**: `studovnaLesson` reads `getAuthoredLesson` directly, while the lesson route resolves the lesson through `prepareLessonFacts` | 17 of 475 saved-step previews in 7 lessons would show text like `{{trh.xetra_hodiny}}` (`foundations-markets`, `foundations-active-vs-index`, `first-plan-automation`, `behaviour-behaviour-gap`, `behaviour-overconfidence`, `behaviour-disposition-effect`, `etfs-replication-and-indexes`). Inferred from code and a catalog probe; not reproduced in production | **WP-17b**: in `studovnaLesson`, run the authored lesson through `prepareLessonFacts(lesson, factRegistry, { today: factToday(), published: true }).lesson` before building steps, the question and the recap. Add a catalog test: no `{{` in any preview. Use the same `factToday()` as the lesson route, so `/learn` and the lesson agree on dates |
| C-3 | **Recommendation leaves Milestone A**: after module 1.1, `recommendLearning` returns `RETURNS_AFTER_FOUNDATIONS` → 3.1.1 „Co je výnos?“, while Milestone A's next lesson is 2.1.6 and the product direction puts Czech practice (L2) before measurement (L3) | Fixture `modul` | Product decision (D8), not a UI fix. If L2 should follow, change the recommendation rules in their own PR with tests. D shows whatever the recommendation says, with its reason |
| C-4 | **Production `StudovnaQuestion` grades on change.** `onChange` sets the answer and the feedback renders immediately, so arrow keys in the radio group reveal each option's explanation in turn | `studovna-question.tsx` | Fixed by D's „Zkontrolovat“ (WP-20). If WP-20 slips, a two-line interim fix: keep the selection in state and render feedback only after a submit |
| C-5 | **Lesson player disables Check until the answer parses** | `guided-lesson.tsx:153` (`disabled: evaluation === undefined`) | Not a Learn change. Record it for a lesson-player accessibility package: validate on submit and keep Check enabled (`better-accessibility`, forms) |
| C-6 | **A multi-question step could never be answered inline** (the server needs every graded block correct) | No such step exists today (257 graded steps, one block each) | D answers inline only when a step has exactly one graded block (in the model). Keep that guard |

## 5. Work packages

Small and independently verifiable, in order. ⚑ marks a founder decision.

| WP | Change | Depends on | Verify |
| --- | --- | --- | --- |
| **WP-17** | Ship `fix/learn-recap-answer-leak` (f81c5a2) as is | — | Its tests, `test:studovna` |
| **WP-17b** | C-2: resolve facts in `studovnaLesson` | WP-17 | New catalog test. `test:studovna`. `test:facts-browser` if counts move |
| **WP-00** | Land the design foundation (tokens, DESIGN.md direction, LEARN-VARIANTS.md), by its owner | — | `tokens.test.ts` and the standard gates |
| **WP-18** | Heading cascade in `@layer base`, with the masked utilities deleted. **Done on this branch** (30db51e): 46 literals plus `blockTitle`, `cardTitle`, `AppHeader`, and `tracking-heading` pinned on the fact-notice `h3` | WP-00 (both touch `tokens.css`) | Done here: 265 headings on 23 routes at 1440 and 390 identical before and after. Still to run on the PR: authenticated routes (Lab, instrument, compare, account security) with a seeded database, plus `test:design-system-browser`, `test:product` and `test:marketing-browser` |
| **WP-19** | Move `learnWorkspaceModel` and its tests to `src/components/learning`. Add a profile fixture (entry test), a guest fixture and a Lab-unavailable fixture. Read `profile`, `practiceCapital` and the unlock status from production loaders | WP-17b | Unit tests (states, rail completeness, catalog no-leak and no-token) |
| **WP-20a** | `RailTree`, `CollapsibleWorkspace`, `CurriculumSheet` in `src/components/learning`, unused by any route yet, with a `/dev/design-system` specimen | WP-18, WP-19, ⚑ D6 | Specimen: keyboard walk, 44 px rows, sheet Escape and focus return, axe |
| **WP-20b** | `InlineQuestion`: D's component plus production saving (pending, error, `busy` ref). Remove `StudovnaQuestion` | WP-19 | Component tests: correct, wrong, empty, save failure keeps the cursor, double submit blocked |
| **WP-21** | `/learn` cutover: `StudovnaPage` renders the D composition from the model. Remove the guide, donut, Backtesting link, the `CurriculumMap` mount and the recap side panel. Keep the footer. Update the 13 browser suites in the same PR (PLAN.md WP-21 list) | WP-20a, WP-20b, WP-14 (or no name in the eyebrow) | Full Browser workflow on the PR head. Overflow at 7 widths. axe at 1440, 1024 and 390. 200 % text. `/learn` at 1440 ≤ 3,800 px |
| **WP-22** | Delete the `/dev/learn-variants` route (or keep D only, per its owner), the unused Studovna CSS and `LEARN-VARIANTS.md` variants A to C | WP-21 | `knip`, the standard gates |
| **D8** ⚑ | C-3 recommendation order, if the founder wants L2 after 1.1 | — | Recommendation unit tests, `test:personalization-browser` |

## 6. Regression risks

| Risk | Guard |
| --- | --- |
| The inline answer saves twice or skips a step | Keep the `busy` ref and server move validation. WP-20b tests. `test:studovna` covers wrong, retry, save error and reload |
| A pre-answer text path leaks a result | The catalog test in WP-19 runs over every saved step. Add any new text path to it |
| Raw `{{…}}` reappears through a new text path | The same catalog test asserts no `{{` in the model output |
| Rail and sheet both in the DOM give duplicate links in tests | The aside is `display: none` below `lg` and the closed `<dialog>` is not rendered. Scope locators to `aside`/`dialog`, or use `getByRole` (it skips hidden elements). The Potom link repeats a rail title, so scope by region |
| A failed portfolio load blocks the page or shows 0 | Lab row in its own Suspense, explicit unavailable copy. Check with a forced loader failure |
| Lab-locked, guest and demo copy confused | WP-19 fixtures for each, plus a browser check with a fresh account |
| Header changes in WP-04 move the leading edge | WP-04 must keep today's rendered box (`max-w-shell`, 20/40/64 px). Re-check D's alignment screenshot at 1440 after WP-04 |
| Heading cascade restyles a heading | WP-18's snapshot. CSS modules stay unlayered and still win |
| `/learn` client JS grows | `question-evaluation` plus `exercise-evaluation` are about 9 KB of source, already shipped on lesson routes. Compare `/learn` First Load JS before and after WP-21 (`next build` output) |
| Parallel curriculum PRs change counts | The tests compare against `availableLessons`, never a fixed number |

## 7. Unresolved decisions

| # | Question | Recommendation |
| --- | --- | --- |
| D6 ⚑ | Rail rows: open the lesson directly, or preview it on `/learn` (`?lesson=`) | Directly, as the plan recommends. The prototype still shows the preview so it can be judged |
| D7 ⚑ | Where the study-plan context goes („Jak si rozvrhnout učení“, the recommended lesson when it differs from the continuation) | Settings → Učení, with the reason line staying on `/learn` |
| D8 ⚑ | C-3: after 1.1, recommend L2 (Milestone A order) or keep 3.1 | Follow Milestone A (L2), since the product direction puts the Czech workflow first |
| D1 ⚑ | Milestone A name without a slash | Unchanged: PLAN.md D1 |
| — | Persist the rail collapse | Not until learners ask. It resets per visit |
| — | DESIGN.md amendments (rail width token, 52 px answer options, layering note) | [LEARN-D-REFINEMENT.md §9](LEARN-D-REFINEMENT.md#9-proposed-designmd-changes-for-approval-not-applied) |

## 8. As-built differences

- **Lab row needs no Suspense.** The row shows only the unlock status (already awaited by the layout, request-memoized) and the receipt-derived capital, so `/learn` no longer loads `loadPortfolioCardView` or any quote. The `loading` and `unavailable` states were removed with it: an unlock-status failure fails the layout first. `loadPortfolioCardView` was deleted.
- **Guest and XP copy.** Guests see „Portfolio Lab otevřeš, až si uložíš účet.“ linking to `/onboarding/save` (the server's existing sentence). A learner with all seven lessons but too little XP sees the Progress page's „Lekce Základů máš hotové. Chybí ještě XP.“
- **D6 and D7.** Rail rows and „Potom“ open the lesson route (no in-page preview). The study plan stays on `/learn` as the „Jak si rozvrhnout učení“ disclosure.
- **Px gutters and card padding.** The workspace gutters copy the shell's px values, and the task surface and answer options use DESIGN.md's px padding. With rem utilities, 200 % text doubled them: the rail drifted off the wordmark edge and the 320 px column overflowed.
- **Optional continuation.** A continuation in levels 4 to 6 or V also opens „Prohloubení“.
- **No component test environment.** The repository has no DOM test runtime, so the inline question's behaviour (empty, wrong, grade on Check only, failed save, persisted cursor, numeric and choice) is covered in `validate-studovna.mjs` against the real server instead of new unit tests.
