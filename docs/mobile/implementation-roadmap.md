# Investník Mobile: implementation roadmap (Milestone 0)

Status 2026-11-14. A plan, not a commitment to dates. It follows the [architecture audit](architecture-audit.md) and the [API plan](api-plan.md).

Rules for every milestone:

- One issue, one worktree, one branch, one PR ([WORKTREES.md](../../WORKTREES.md)).
- Backend PRs and app PRs are separate. A backend PR is safe to merge with no app using it.
- Portfolio Lab is a separately gated P1 feature. Nothing below depends on it.
- A performance target counts as met only when a measurement on a release build is recorded.

## Why milestone 3 is split

The brief defines five milestones. This roadmap keeps five, and splits the third into 3a and 3b.

The audit found that only 10 of 52 published lessons can be shown with generic blocks. 37 need at least one of 38 bespoke interactive figures. A "Native Learn MVP" that renders 10 scattered lessons is not a usable product, and building the engine together with a dozen figures is too large for one reviewable milestone. So 3a delivers the engine and the lessons it can already show, and 3b delivers the figures for the first curriculum path. Nothing outside the brief's scope is added; the same work is cut in two.

## Milestone 1: Expo foundation and monorepo setup

**Mostly complete.** PR #502 merged the Expo SDK 58 app, EAS profiles and `mobile.yml` on 2026-11-13.

### Scope

Finish what #502 could not: prove the app on real native runtimes, and settle the open naming decisions.

### Dependencies

- An Expo account and EAS project (`eas init`).
- Apple Developer and Google Play Console accounts.
- Founder confirmation of the bundle identifier and URL scheme (decision D11).
- A Mac with Xcode, or EAS cloud builds plus a physical iPhone and Android phone.

### Tasks

1. Confirm `cz.investnik.app` and the `investnik` scheme. Record the decision in `docs/mobile-architecture.md`.
2. Run `eas init`; commit the project ID and owner in `mobile/app.json`.
3. Produce an EAS `development` build for iOS and Android. Install both on physical devices.
4. Confirm on each device that the start screen reaches `GET /api/auth/ok` on a local backend and on production.
5. Choose the route prefix (decision D1) and make `docs/mobile-architecture.md` agree with `docs/mobile/api-plan.md`.
6. Record the placeholder app's cold-start time on each device as the baseline, using the method in the audit.

### Acceptance criteria

- A development build installs and starts on one physical iPhone and one physical Android phone.
- The backend check succeeds on both.
- The baseline measurements are written down with device model, OS version and build number.
- `mobile.yml` is green.

### Testing

`npm run lint`, `typecheck`, `test`, `doctor` and `check:export` in `mobile/`. Manual device smoke test.

### Out of scope

Sign-in, any API endpoint, any product screen, store submission, workspaces.

### PR boundaries

- PR 1.1: EAS project link and identifier confirmation (`mobile/app.json`, documentation).
- PR 1.2: baseline measurements and the prefix decision (documentation only).

## Milestone 2: Shared API contracts and authentication

### Scope

A learner can sign in on the phone with the same account as on the web, and the app can read its own session and learning map through a versioned, contract-checked API.

### Dependencies

- Milestone 1 device builds (the auth flow cannot be verified without a native runtime).
- Decision D5 (sign-in methods at launch) and, if Apple is included, Apple Developer configuration.
- Decision D2 confirmed (shared folder without workspaces).

### Tasks

1. **Contracts spike.** Create `packages/contracts/` with one schema. Wire the web through a `tsconfig.json` path and the app through Metro. Prove it with `npm run check:export`. If it fails, take the next fallback listed in the audit.
2. Move the pure grading modules into `packages/contracts/` and re-export them from their current paths. No web import changes.
3. Update tooling: `ci.yml` and `mobile.yml` path filters for `packages/**`, knip, root `tsconfig.json`.
4. **Server auth.** Add the `expo()` plugin before `nextCookies()` and the `investnik://` trusted origin. Pin `@better-auth/expo` to the server's `better-auth` version.
5. Add `GET /api/v1/me`, `POST /api/v1/me/quick-start` and `PUT /api/v1/me/time-zone` with the shared error envelope, origin check and tests.
6. Extract `loadLearnerFor(user)` and add `GET /api/v1/learn`.
7. **App auth.** Add `expo-secure-store`, `expo-network`, `expo-web-browser` and the Better Auth client. Build sign-in, sign-up and sign-out screens for e-mail and password.
8. Add the API client: cookie header from `authClient.getCookie()`, `credentials: "omit"`, response parsing with the shared schemas, the client version header.
9. Add TanStack Query and show the signed-in learner's name and next lesson on a plain screen, to prove the whole path.
10. Add Google sign-in through the redirect flow. Add Sign in with Apple if D5 includes it, in its own PR.
11. Add the guest start (`x-investi-anonymous-kind: guest`) if the product wants account-free starts on mobile.

### Acceptance criteria

- An account created on the web signs in on both physical devices, and the reverse.
- Killing and reopening the app keeps the learner signed in. The session is in SecureStore and nowhere else.
- Signing out removes it.
- `GET /api/v1/learn` on the phone shows the same next lesson as `/learn` on the web for the same account.
- A mobile-first account gets a learning profile with the device's time zone before it can complete anything.
- Every existing web auth suite passes unchanged on the PR that adds the plugin.
- Web bundle size for the lesson route is within its budget.

### Testing

- Web: `npx next typegen`, `lint`, `knip`, `typecheck`, `test`, `build`, `check:lesson-bundle`.
- Auth: `test:auth-browser`, `test:account-recovery`, `test:guest-claim`, `test:demo-session`, `test:account-deletion`, `test:rate-limit`, on a disposable database.
- New handler unit tests and contract tests as described in the API plan.
- Manual on devices: sign-in, sign-up, wrong password, rate-limit message, sign-out, session survival, Google round trip.

### Out of scope

Lessons, progress writes, offline behaviour, account deletion UI, Lab.

### PR boundaries

- PR 2.1: `packages/contracts` wiring and tooling. No behaviour change.
- PR 2.2: grading modules moved and re-exported. No behaviour change.
- PR 2.3: server `expo()` plugin and trusted origin. Auth suites attached.
- PR 2.4: `/api/v1/me*` endpoints.
- PR 2.5: `loadLearnerFor` and `GET /api/v1/learn`.
- PR 2.6: app auth client and screens.
- PR 2.7: app API client, TanStack Query, proof screen.
- PR 2.8: Google sign-in. PR 2.9: Sign in with Apple, if decided.

## Milestone 3a: Native Learn engine

### Scope

The Learn map and a native lesson player for every block type except interactive figures, formulas with full typesetting, and artifact or mission steps. Online only. Progress is saved to the server as the learner goes.

### Dependencies

- Milestone 2.
- A mobile design pass for the Learn map and the lesson player. This must not wait for or depend on PR #501; the API reads `src/features/*`, which #501 does not touch.
- Decision D4 (how unsupported lessons appear).

### Tasks

1. Backend: `buildLessonPayload`, `GET /api/v1/learn/lessons/{lessonId}` with `ETag`, and `POST .../start`.
2. Backend: `advanceLessonWalk` and `POST .../sync`, with the pure and disposable-database tests from the API plan. Add the learning-write rate limit.
3. App: native tokens generated from `DESIGN.md`, fonts decided and measured.
4. App: Learn map screen from `GET /api/v1/learn`, with lesson states and the "continue on the web" state for lessons the app cannot render.
5. App: block registry and renderer for the class A and B blocks in the audit's matrix.
6. App: question components for multiple choice, numeric, multi-numeric, faded example, categorise, order, document search, and persona decision. Local grading through the shared evaluator.
7. App: `documentTap` as a custom component.
8. App: formula block. Spike a native renderer; fall back to the plain `expression` text if quality is not acceptable.
9. App: lesson player (step navigation, check, retry, continue, review mode) and the completion screen showing the server's reward.
10. App: renderability check. A lesson is offered only if every block type and figure ID is registered.
11. Accessibility: VoiceOver and TalkBack labels and roles, Dynamic Type, reduce motion.

### Acceptance criteria

- The 10 figure-free, requirement-free lessons listed in the audit can be completed end to end on both platforms.
- Progress, XP and streak after a mobile completion match what the web shows for the same account.
- Completing the same lesson on web and phone yields one award row.
- A lesson with an unsupported block is never opened in a degraded form.
- No WebView is used.
- A completed lesson opens in review mode and saves nothing.
- Lesson IDs, completion records, receipts and saved positions for existing learners are unchanged (the curriculum-compatibility suite passes).

### Testing

- Backend: unit and contract tests; `test:persistence`, `test:progression-persistence`, `test:curriculum-compatibility` with `CURRICULUM_QA_DISPOSABLE=1`, on a disposable database; a new concurrency case for `sync`.
- App: unit tests for the renderer registry and the player state machine. A test that walks every renderable lesson with `correctAnswers` from `src/features/lessons/answer-keys.ts`, mirroring `scripts/validate-lesson-walkthrough.mts`.
- Manual on devices, both platforms, including screen readers and the largest text size.
- First timing measurements for lesson open and quiz feedback.

### Out of scope

Interactive figures, offline use, artifacts, Lab missions, mixed checkpoints, notifications, Lab.

### PR boundaries

- PR 3a.1: lesson payload endpoint. PR 3a.2: `advanceLessonWalk` and `sync`.
- PR 3a.3: tokens and fonts. PR 3a.4: Learn map.
- PR 3a.5: static blocks. PR 3a.6: question blocks and local grading.
- PR 3a.7: `documentTap` and formula. PR 3a.8: player and completion screen.

## Milestone 3b: Figures for the first path

### Scope

Native versions of the interactive figures needed for one coherent path, so a new learner can study on the phone alone. The proposed path is Foundations (display module 1.1), because its seven original lessons are the Portfolio Lab prerequisite.

### Dependencies

- Milestone 3a.
- A chart technology decision from a spike on the low-end Android device.
- Founder confirmation of which path comes first.

### Tasks

1. Spike two figures with different interaction styles on the weakest device. Choose the drawing technology.
2. Move the pure figure model files that the path needs into the shared folder, or import them through it, without changing them.
3. Build a figure registry keyed by `LessonFigureId`.
4. Port the figures used by the eight Foundations lessons that the audit found blocked only by figures (`foundations-stocks`, `foundations-etfs-indexes`, `foundations-bonds-cash`, `foundations-markets`, `foundations-risk-reward`, `foundations-portfolio`, `foundations-funds`, `foundations-active-vs-index`), one PR each or in small groups. List the exact figure IDs per lesson in the spike PR.
5. Each figure reuses the web's model tests as its source of truth and adds a test that its native inputs produce the same model output.
6. Order the remaining figures by curriculum position for later work.

### Acceptance criteria

- Every published Foundations lesson without an artifact or mission requirement can be completed on the phone.
- Each ported figure produces the same numbers as the web for the same inputs.
- Figures hold a smooth frame rate on the low-end Android test device, shown by a recorded trace.
- Every figure has an accessible text alternative (the block's `title` and `description` at minimum).

### Testing

Model parity tests, manual interaction tests on four devices, frame traces.

### Out of scope

Provider-backed `historical-*` figures, learner-artifact figures (`ips-builder`, `goal-map`, `financial-checkup`, `fee-profile`), figures outside the chosen path.

### PR boundaries

One PR for the spike decision and registry, then one PR per figure or per closely related pair.

## Milestone 4: Offline progress and synchronisation

### Scope

Lessons already loaded work without a connection. Answers get immediate local feedback. Progress is queued and reconciled with the server, which stays the only authority for XP, streaks, completion and rewards.

### Dependencies

- Milestone 3a (3b is not required).
- Decision D6 (streak day for offline completions), D7 (storage engine), D8 (operation age limit), D9 (cached fact age).

### Tasks

1. Persist the query cache: the Learn map and each lesson under its own key, versioned by `schemaVersion`. Exclude session and personal identifiers.
2. Prefetch the next lessons on Wi-Fi so "previously loaded" covers what the learner is likely to open.
3. Build the outbox: persistent, per user, ordered per lesson, with the three operation types from the audit.
4. Send `sync` with the accumulated walk; retry with exponential backoff and jitter; honour `Retry-After`.
5. Implement each conflict rule from the audit: duplicate, gap, behind, completed elsewhere, expired session, other user, rejected answer, unavailable lesson, permanent rejection.
6. Flush on foreground, on connectivity change, and after each operation.
7. UI states: offline banner, "reward will be credited after synchronisation", sync failure with a reason, stale-facts notice with `factsAsOf`.
8. Sign-out with unsent operations warns the learner.
9. Add `GET .../progress` and `POST /api/v1/learn/skill-attempts`; queue skill attempts.
10. If D6 chooses bounded client time: change `completeLesson` to accept a validated time, with exact tests, in its own PR.

### Acceptance criteria

- In flight mode, a previously opened lesson opens, grades answers, and can be finished.
- After reconnecting, the server holds exactly one award for it, and the app shows the server's XP and streak.
- Killing the app during a sync, then reopening, ends in the same state with no duplicate.
- Two devices finishing the same lesson offline, then both reconnecting, produce one award; the second device shows "already completed".
- A device that is behind never moves the server cursor backwards.
- An expired session keeps the queue intact, and it drains after sign-in as the same user.
- Changing the device clock does not change XP, Practice Capital or the recorded learning day (under D6 option A).
- No reward number is displayed before the server confirms it.

### Testing

- Pure tests for the outbox state machine and every conflict rule.
- Disposable-database tests: concurrent `sync` from two clients; `sync` racing `completeLessonAction`; replay of an identical request 10 times.
- Fault injection in the app: dropped response after commit, `401`, `409`, `422`, `429`, `500`, timeouts.
- Manual: flight-mode walkthrough on both platforms; two physical devices on one account.

### Out of scope

Offline artifacts, offline Lab, offline sign-in, background sync while the app is closed, conflict merging beyond the stated rules.

### PR boundaries

- PR 4.1: persisted cache and prefetch.
- PR 4.2: outbox core and retry.
- PR 4.3: conflict handling and UI states.
- PR 4.4: skill attempts and the progress endpoint.
- PR 4.5: bounded client time, only if D6 chooses it.

## Milestone 5: Progress, notifications, performance and beta readiness

### Scope

A Progress screen, daily learning reminders, the account features the stores require, measured performance against the targets, and an internal beta.

### Dependencies

- Milestones 2, 3a and 4. Milestone 3b decides how much content the beta has.
- Decision D10 (crash and performance reporting vendor).
- Store listings, privacy policy text for mobile, and data-safety declarations.

### Tasks

1. `GET /api/v1/progress` and a native Progress screen: XP, streak, daily goal, skills, milestones.
2. Local notifications for a daily reminder at a time the learner chooses. Permission is asked in context, not at first launch. No server component.
3. Settings: account e-mail, sign out, link to privacy and terms.
4. Account deletion in the app through `/api/auth/delete-user`, including re-authentication for social-only accounts.
5. Crash and performance reporting, with consent where required.
6. Measure every target in the audit on the four test devices. Fix what misses, or record the gap with a reason.
7. Accessibility audit on both platforms.
8. Store metadata, screenshots, review notes, a review account.
9. TestFlight and Play internal testing release.

### Acceptance criteria

- Each performance target is either met with a recorded measurement or listed as a known gap with numbers.
- Crash-free sessions are tracked and at or above 99.5 % across the beta period.
- Account deletion works in the app for password and social-only accounts.
- Reminders never mention prices, returns or portfolio values.
- The beta build is installable by invited testers on both platforms.

### Testing

Release-build measurements, `test:account-deletion`, manual store-review checklist, screen-reader pass, upgrade test from the previous beta build with a non-empty outbox.

### Out of scope

Public store release, Portfolio Lab, server-sent push notifications, tablets, dark appearance, languages other than Czech.

### PR boundaries

- PR 5.1: progress endpoint. PR 5.2: Progress screen.
- PR 5.3: reminders. PR 5.4: settings and account deletion.
- PR 5.5: reporting. PR 5.6: performance fixes, one per finding.

## Portfolio Lab (P1, separately gated)

Starts only after a founder decision, and only after milestone 4. It needs its own discovery for native charts, live-quote failure states, market-hours handling and the finance test matrix in [finance-and-data.md](../agents/finance-and-data.md). The endpoint shapes are sketched in the [API plan](api-plan.md#portfolio-lab-separately-gated-p2). Trades stay online-only.

Until then, lessons that need a Lab mission or a saved plan stay "continue on the web".

## The recommended first implementation PR

**PR 2.1: `packages/contracts` wiring**, right after the milestone 1 device builds.

It is small, changes no behaviour, and settles the largest unproven assumption that every later backend and app PR depends on: that two separate npm projects can share typed code. `npm run check:export` and the web's `check:lesson-bundle` give a clear pass or fail in CI, with no native toolchain needed.

If the device builds for milestone 1 are delayed, PR 2.1 can go first. It does not need a device.
