# Investník Mobile: architecture audit (Milestone 0)

Status 2026-11-14. Discovery only: no application code, schema, authentication or deployment change belongs to this milestone. Companion documents: [API plan](api-plan.md) and [implementation roadmap](implementation-roadmap.md). The earlier foundation notes are in [mobile-architecture.md](../mobile-architecture.md).

Audited revision: `origin/main` at `e3fcb48` (merge of PR #502).

## How to read this document

Every claim carries one of three labels.

- **Confirmed**: read in the source at the audited revision, or produced by running code against it.
- **Documented**: stated by official Expo or Better Auth documentation fetched on 2026-11-14, not exercised here.
- **Assumed**: a reasoned expectation that nothing here has tested. Each one is listed again under [Remaining unknowns](#remaining-unknowns).

Nothing in this audit was run on a device, a simulator or a native build. This Mac has no Xcode and no Android SDK.

## Limitations and contradictions with the brief

1. **The PRD is not in the repository.** "Investník Mobile — PRD v1, November 13, 2026" exists outside the repository and was not attached to the discovery session. This audit used the requirements in the Milestone 0 brief, plus PRD points relayed in review (decisions D6 and D14). Any other PRD requirement is unchecked. A copy lands in `docs/mobile/prd.md` in roadmap PR 1.2.
2. **The Expo app already exists.** The brief says not to generate it. PR #502 merged `mobile/` (Expo SDK 58, React Native 0.88.1, Expo Router, EAS profiles, a CI workflow) into `main` on 2026-11-13. Roadmap milestone 1 is therefore mostly done. See [the roadmap](implementation-roadmap.md#milestone-1-expo-foundation-and-monorepo-setup).
3. **"Monorepo" is one repository, not npm workspaces.** The brief decides on a monorepo with `packages/contracts`. The merged foundation deliberately uses two independent npm projects with no `workspaces` field. The reasons hold up (see [Monorepo assessment](#monorepo-assessment)), and the brief also forbids changing workspace configuration in this milestone. The recommendation is to keep it that way.
4. **Route prefix.** The brief asks for `/api/v1`; the first version of [mobile-architecture.md](../mobile-architecture.md) said `/api/mobile/v1`. Decided: `/api/v1` (decision D1). Both documents now say so.
5. **Milestone numbering.** The merged document calls the signed-in Learn read path "M1". The brief's milestones 1 to 5 are used here.
6. **Native rendering of the whole curriculum is not a rendering problem, it is a porting problem.** 37 of 52 published lessons contain at least one bespoke interactive figure, and 13 need a saved artifact or a Lab mission. Only 10 lessons can be rendered from generic blocks alone. See [Learning engine](#learning-engine).
7. **`docs/authentication.md` names Better Auth 1.7.3.** The lockfile installs 1.7.12 (`package-lock.json`). The document is stale on that point.

## Current architecture

**Confirmed.**

| Layer | Where | Notes |
| --- | --- | --- |
| Web UI and backend | `src/` (Next.js 16.4.2 App Router, React 19.3.1, TypeScript 5) | One deployable. Vercel, region `fra1` (`vercel.json`) |
| Domain modules | `src/features/<domain>/` | Pure domain files plus `repository.ts` files marked `server-only` |
| Mutations | 11 Server Action modules, `src/features/*/actions.ts`, 720 lines in total | Thin: session, Zod, repository call, presentation mapping, `revalidatePath` |
| Route handlers | `src/app/api/` | `auth/[...all]`, `account/export`, `portfolio/export`, `ips/export`, `analytics/visit`, `cron/cleanup-anonymous`. No versioned JSON API exists |
| Database | PostgreSQL through Drizzle, `src/db/schema.ts` (541 lines) | User-owned rows cascade on user deletion |
| Authentication | Better Auth 1.7.12, `src/lib/auth.ts` | Cookie sessions, Postgres-backed rate limits |
| Session read | `src/lib/session.ts` | `auth.api.getSession({ headers: await headers() })` |
| Rate limiting | `src/features/rate-limit/` | Fixed windows in the `rate_limit_bucket` table, shared across serverless instances |
| Errors | `src/lib/server-errors.ts` | `logUnexpectedError` logs a normalised error; learners see a fixed Czech message |
| Mobile app | `mobile/` | A start screen that checks `GET /api/auth/ok`. No sign-in, no product screens |

Server Actions return `{ ok: true, ... }` or `{ ok: false, message }`. Route handlers return `{ error: "<code>" }` with an HTTP status and `Cache-Control: no-store`. The two conventions differ, and neither is a documented API contract.

### What is reusable as is

Each mutation the mobile client needs already has a repository function that takes a `userId` and does not touch Next.js request state.

| Function | File | Property that matters for mobile |
| --- | --- | --- |
| `saveLessonProgress` | `src/features/progress/repository.ts:18` | Transaction under a `user` row lock. Re-evaluates the answer on the server |
| `markLessonInProgress` | `src/features/progress/repository.ts:39` | `onConflictDoNothing`, so it is idempotent |
| `completeLesson` | `src/features/progress/repository.ts:44` | Transaction under a `user` row lock. The award insert is `onConflictDoNothing` on the `(user_id, lesson_id)` primary key, so a repeat pays nothing |
| `recordSkillAttempt` | `src/features/mastery/repository.ts:16` | Idempotent on `(user_id, request_id)` |
| `loadGamification` | `src/features/gamification/repository.ts:8` | Derived from `lesson_award` on every read |
| `loadMilestones` | `src/features/milestones/repository.ts` | Used by `/learn` today |
| `executeTrade`, `resetActivePortfolio`, `executeAllocation` | `src/features/portfolio/repository.ts` | Unique indexes on a client idempotency key |
| `readAccountExportRows` | `src/features/account/export.ts` | Already served by a route handler |

### What is coupled to Next.js

**Confirmed.**

- `getCurrentUser()` reads `next/headers`. That works in a route handler, so the same function can authenticate API requests.
- `loadLearner()` (`src/features/learning/load-learner.ts:17`) calls `getCurrentUser()` itself and takes no user argument. A route handler that has already read the session cannot pass it in.
- `requestMemo` (`src/lib/request-memo.ts`) only memoises inside a React Server Component render. In a route handler every call reads again, so a handler that calls `getCurrentUser()` and then `loadLearner()` reads the session twice.
- Actions call `revalidatePath`. An API handler that mutates the same data must do the same, or the web shows stale overviews after a change made on the phone.
- The lesson page (`src/app/(app)/learn/[moduleSlug]/[lessonSlug]/page.tsx`) composes the lesson payload inline: fact resolution, guided steps, market history and the skill item map. There is no function that returns "the lesson as data".
- Onboarding is enforced only by the `(app)` layout (`src/app/(app)/layout.tsx:39`). No action or repository checks it.

Server Actions themselves cannot be called from a native client. Their identifiers change with each web build.

## Learning engine

### Authoring and storage

**Confirmed.** Lessons are typed TypeScript data, not database rows and not MDX.

- Content: one file per lesson under `src/features/lessons/<module>/`, each exporting an `AuthoredLesson` (`src/features/lessons/types.ts:82`).
- Step layout: each module exports `StepDefinition[]` per lesson ID (`src/features/lessons/steps.ts:20`). A step is a title plus the IDs of the blocks it shows.
- Curriculum: `src/features/learning/curriculum.ts` is the registry of storage modules, display modules and skill items. The `lesson` and `learning_module` tables hold only identity and ordering, written by the seed.
- Text is plain strings. A scan of every published step found no HTML, no Markdown and no inline maths markup.
- Dated facts are `{{namespace.key}}` tokens resolved on the server at request time (`src/features/facts/lesson-facts.ts:8`). A lesson's text can therefore change from one day to the next without a code change.

### Measured inventory

**Confirmed** by a throwaway script run against the registry (deleted afterwards, not committed).

| Measure | Value |
| --- | --- |
| Published lessons | 52 (plus 5 unpublished drafts) |
| Guided steps | 475 |
| Blocks shown in steps | 823 |
| Block types in use | 24 |
| Lessons whose steps survive `JSON.parse(JSON.stringify())` unchanged | 52 of 52 |
| All steps as JSON | 467 kB before compression; median lesson 9 kB, largest 18 kB |
| Distinct interactive figures in use | 38 (52 registered) |
| Lessons with at least one figure | 37 |
| Lessons that need a saved artifact or a verified Lab mission | 13 |
| Lessons with neither | 10 |

The 10 lessons that need only generic blocks: `foundations-checkpoint`, `foundations-why-invest`, `returns-comparing`, `returns-log-returns`, `returns-checkpoint`, `volatility-checkpoint`, `costs-ter-tracking-difference`, `costs-currency-conversion`, `costs-broker-comparison`, `etfs-replication-and-indexes`.

### Evaluation, progress and rewards

**Confirmed.**

- Grading is one pure function, `evaluateQuestion` (`src/features/lessons/question-evaluation.ts:32`). It returns `true`, `false` or `undefined` (not answered yet). Its runtime imports are small (`parseNumericAnswer` from `src/features/finance/numeric-input.ts`, `exercise-evaluation.ts`, which adds `answer-contract.ts` and Zod), but it and `exercise-evaluation.ts` are typed against `LessonBlock`. `src/features/lessons/types.ts` imports, through the `@/` alias, `artifacts/schemas.ts` (which pulls in the IPS schema and the learning catalog), `facts/registry.ts`, `learning/metric-glossary.ts` and `figure-catalog.ts`. Moving the files unchanged would drag that graph into the shared folder; see [Monorepo assessment](#monorepo-assessment).
- The web player already grades locally. The lesson page sends each step with its answer key (`correctOptionId`, `answer`, `tolerance`) to the browser, and `GuidedLesson` calls `evaluateQuestion` there (`src/components/lesson/guided-lesson.tsx:149`). Shipping answer keys to a phone exposes nothing the web does not.
- The server never trusts that verdict. `saveLessonProgress` calls `validateMove` (`src/features/progress/transition.ts:19`), which re-evaluates the submitted answers against the authored block before the cursor moves forward.
- Progress is one row per learner and lesson: `status`, `last_position` (a zero-based step index), `completed_at`, `updated_at`. There is no per-answer history.
- The cursor moves at most one step forward per call. It can also move back: the web "Předchozí" button saves a lower position.
- Completion requires the cursor to be on the final step (`validateCompletion`). The final step never holds a graded question (`getGuidedSteps`).
- A first completion writes one `lesson_award` row: 60 XP (a database check constraint), Practice Capital from `lessonReward(lessonId)`, and `learning_date` computed from the server clock in the learner's pinned time zone.
- Streaks are derived from `lesson_award.learning_date` on every read (`getGamification`, `src/features/gamification/domain.ts:24`). Nothing is stored as a counter.
- The time zone is pinned once (`initializeTimeZone` only writes while the column is null). A learner without a `learning_profile` row is treated as `UTC`.
- Resuming: the page clamps the stored cursor to the step count and starts there. A completed lesson opens in review mode at step 0 and saves nothing.
- Published content is bound by [published-lesson-compatibility.md](../education/published-lesson-compatibility.md): step indexes before a saved cursor keep their meaning. The `lesson.content_version` column exists but nothing reads it.

### Compatibility matrix

Classes: **A** directly portable (data in, native primitives out). **B** portable through the conversion adapter (a field needs mapping). **C** needs a custom native component. **D** needs an architectural change or a product decision.

Counts are blocks and lessons in published steps.

| Block type | Blocks | Lessons | Class | Note |
| --- | --- | --- | --- | --- |
| `heading` | 22 | 11 | A | |
| `paragraph` | 68 | 33 | A | |
| `explanation` | 102 | 38 | A | `artifactEvidence` variant reads a saved artifact: B |
| `conceptCallout` | 64 | 35 | A | |
| `takeaway` | 24 | 23 | A | |
| `lessonSummary` | 48 | 48 | A | |
| `checkpoint` | 21 | 21 | A | |
| `workedExample` | 59 | 39 | A | |
| `multipleChoiceQuestion` | 162 | 52 | B | `reviewHref` is a web path; map to a lesson reference |
| `numericQuestion` | 65 | 38 | B | Same `reviewHref` mapping. Czech decimal comma is handled by `parseNumericAnswer` |
| `multiNumericQuestion` | 12 | 11 | A | |
| `fadedExample` | 9 | 9 | A | |
| `categorizeQuestion` | 3 | 3 | A | Tap to assign. No drag needed |
| `orderQuestion` | 1 | 1 | A | Needs an accessible reorder control |
| `documentSearchQuestion` | 1 | 1 | A | |
| `findErrorQuestion` | 0 | 0 | A | Defined, not used in published steps |
| `findError` | 0 | 0 | A | Defined, not used in published steps |
| `decisionTree` | 0 | 0 | A | Defined, not used in published steps |
| `documentTap` | 4 | 4 | C | A fictional document table. The data already carries mobile column roles (`DocumentColumn.mobile`) |
| `personaDecision` | 5 | 4 | A | Ungraded. Every option reveals its consequence |
| `writtenReflection` | 23 | 23 | A | Never scored and never persisted |
| `formula` | 31 | 22 | C | KaTeX renders to HTML. Native needs another renderer. Every block also has a plain-text `expression` |
| `labBridge` | 40 | 39 | B | Links into Lab and other lessons; `savedArtifact` variant saves an artifact |
| `factNotice` | 0 in steps | | B | Reads the fact registry; the web client ships the whole registry for it |
| `checklist` | 5 | 5 | D | Saved as a `lesson_output` artifact. Guests cannot save artifacts |
| `rubricSelfAssessment` | 2 | 2 | D | Always a required artifact |
| `labMission` | 7 | 6 | D | Needs Lab (trade, training, backtest) on the same device, or a hand-off to the web |
| `interactiveFigure` | 45 | 37 | C or D | See below |

Interactive figures by data source (`src/features/lessons/figure-catalog.ts`):

| Source | Figures in use | Class | Note |
| --- | --- | --- | --- |
| `model` | 27 | C | Each has a pure TypeScript model file with no React, server or database import. The React DOM component must be rebuilt natively |
| `research` | 1 (`spiva-chart`) | C | Static published data |
| `provider` | 5 (`historical-*`) | D | The server freezes market history into props. Caching provider data on a device is a licensing question |
| `learner` | 5 (`financial-checkup`, `financial-checkup-result`, `goal-map`, `fee-profile`, `ips-builder`) | D | Forms that save artifacts and gate progress. `ips-builder` appears in 6 lessons |

### Can mobile render the existing curriculum without duplicating content?

**Yes for content, no for figures.**

- Content needs no second copy. `getGuidedSteps(prepareLessonFacts(lesson))` already produces a JSON-safe value. An endpoint can return it, and the app can render it.
- Grading needs no second copy either, provided the evaluator moves into a shared package and is retyped against structural block types (see [Monorepo assessment](#monorepo-assessment)). A hand-written copy in `mobile/` would break the rule against duplicating learning logic.
- Figures are React DOM components (`src/components/lesson/*`, about 3,500 lines) styled with Tailwind. None of that runs natively. Their models are reusable; their views are not. This is the largest single cost of the project.

### Proposed lesson schema

Version 1 mirrors today's `LessonBlock` union one to one. A new shape would force a conversion layer for no gain.

```ts
type LessonPayloadV1 = {
  schemaVersion: 1;
  lesson: { id: string; moduleSlug: string; slug: string; title: string; position: number; estimatedMinutes: number };
  /** Hash of the resolved steps. Changes when content or a dated fact changes. */
  revision: string;
  /** The calendar day the dated facts were resolved for. */
  factsAsOf: string;
  factNotice?: { verifiedAt: string; staleFacts: string[] };
  steps: { title: string; kind?: "lesson" | "mastery"; requiredArtifact?: ArtifactRequirement; blocks: Block[] }[];
  /** Block ID to skill item ID, for mastery evidence. */
  skillItems: Record<string, string>;
};

/** Same discriminants and fields as LessonBlock, with web paths replaced. */
type Block =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "multipleChoiceQuestion"; prompt: string; options: ChoiceOption[]; correctOptionId: string;
      correctExplanation: string; incorrectExplanation: string; review?: LessonRef }
  | { id: string; type: "interactiveFigure"; figure: string; title: string; description: string }
  // ... one member per LessonBlock type
  ;

type LessonRef = { lessonId: string; moduleSlug: string; slug: string };
```

Rules:

- The adapter changes only link fields: `reviewHref`, `labBridge.lessonLinks`, `labMission.mission.target`, `navigation`. It never changes IDs, text, answer keys or step order.
- The client decides whether it can render a lesson: every block `type` and every `figure` ID must be in its own registry. The server does not need to know what each app version supports.
- An unknown block type means "update the app", never a silent skip. Skipping a block could hide a graded question.
- `schemaVersion` rises only for a breaking change. A new optional field or a new block type is not breaking, because of the rule above.

## Authentication

### What exists

**Confirmed** (`src/lib/auth.ts`).

- Sign-in methods: e-mail and password, Google and Facebook when their credentials are set, and anonymous sign-in.
- Anonymous identities are of two kinds. A request with the header `x-investi-anonymous-kind: guest` creates a guest (7-day session, extended while used). Anything else creates a demo (seeded data, a fixed 24-hour session).
- No `session` options are set, so Better Auth's defaults apply. No `trustedOrigins` option is set in code; `BETTER_AUTH_TRUSTED_ORIGINS` is read from the environment (`docs/environment.md`).
- Account linking keeps Better Auth's safe defaults. No trusted-provider override.
- A password reset revokes every session.
- Account deletion is Better Auth's `/api/auth/delete-user`, guarded by `guardAccountDeletion`: anonymous identities are refused, an account with a password must send it, and a social-only account needs a session younger than 10 minutes (`src/features/account/deletion.ts`). Deleting the user row cascades every learner-owned row.
- Rate limits are per IP for auth paths and per account for password guessing, counted in Postgres. The trusted IP header is `x-forwarded-for`.
- Plugins: `anonymous(...)` then `nextCookies()`.

### Official Expo integration

**Documented** ([Better Auth Expo integration](https://www.better-auth.com/docs/integrations/expo), fetched 2026-11-14).

- Server: add `expo()` from `@better-auth/expo` to `plugins`, and add the app scheme to `trustedOrigins`. Development may add `exp://` patterns, gated on `NODE_ENV === "development"`. The documentation warns against `exp://` wildcards in production.
- Client: `createAuthClient` from `better-auth/react` with `expoClient({ scheme, storagePrefix, storage: SecureStore })`.
- The session cookie is stored through `expo-secure-store`. Auth requests send it automatically. For other endpoints the app calls `authClient.getCookie()`, sets it as the `Cookie` header, and uses `credentials: "omit"`.
- Social sign-in opens a browser and returns through a deep link. A relative `callbackURL` becomes a deep link on the app scheme.
- Native ID-token sign-in is supported for Google, Apple and Facebook: `signIn.social({ provider, idToken: { token, nonce } })`.
- Required packages: `expo-secure-store`, `expo-network`. Social sign-in also needs `expo-web-browser`, `expo-linking`, `expo-constants`.
- Metro needs package exports enabled, which is the default from SDK 53.

**Documented** ([Better Auth Apple provider](https://www.better-auth.com/docs/authentication/apple)): native iOS sign-in needs `appBundleIdentifier`, because Apple issues the ID token for the bundle ID. `https://appleid.apple.com` must be a trusted origin. The client secret is a signed JWT that Apple rejects if it expires more than six months ahead, so it must be regenerated on a schedule.

### Recommended integration

1. Keep one auth handler, one set of tables, and cookie sessions. The app sends the stored cookie; `getCurrentUser()` then works unchanged in API route handlers.
2. Add `expo()` to `plugins` **before** `nextCookies()`. Better Auth's Next.js guidance is that `nextCookies()` stays last (**assumed** to still hold for 1.7.12; verify when implementing).
3. Trusted origins: `investnik://` in every environment. `exp://` patterns only in development, through `BETTER_AUTH_TRUSTED_ORIGINS`, never in production.
4. Pin `@better-auth/expo` to the server's `better-auth` version. The lockfile has 1.7.12. If the Expo package needs a newer server, upgrade the server in its own PR first.
5. Launch sign-in methods, in this order of effort: e-mail and password; then Google through the web-redirect flow, which needs no new provider client; then Sign in with Apple.
6. Guest start: send `x-investi-anonymous-kind: guest` with `/sign-in/anonymous`, so a learner can begin without an account exactly as on the web. Demo identities are not offered on mobile.
7. Account deletion: the app calls the existing `/api/auth/delete-user`. A social-only learner is asked to sign in again first, because of the 10-minute rule.

### Risks to existing web authentication

| Risk | Label | Mitigation |
| --- | --- | --- |
| The `expo()` plugin changes how the origin check treats requests that carry an `expo-origin` header | Documented behaviour, effect on this configuration **assumed** | Run `test:auth-browser`, `test:account-recovery`, `test:guest-claim` and `test:demo-session` on the PR that adds the plugin |
| A wrong plugin order stops Server Actions from setting cookies | Assumed | Keep `nextCookies()` last; the auth browser suite covers sign-in through a Server Action path |
| `exp://` wildcard origins reach production | Documented warning | Set them only through the development environment variable |
| Version skew between `@better-auth/expo` and `better-auth` | Confirmed as a constraint in the merged notes | Pin both; upgrade together |
| Sign in with Apple creates a second account for a learner who already registered by e-mail, because Apple can return a private relay address | Assumed | Decide the linking policy before shipping Apple (decision D5). Do not weaken the verified-e-mail linking rule |
| Apple client secret expires | Documented | Calendar-driven rotation, and a runbook entry |
| Carrier-grade NAT puts many phones behind one IP, so per-IP auth limits bite sooner | Assumed | Watch `429` rates after beta; the per-account limits already cover password guessing |

### Store requirements that touch authentication

**Assumed** from Apple's published App Review Guidelines; re-read them before submission.

- An app that offers a third-party sign-in such as Google must also offer an equivalent option that limits data collection, which Sign in with Apple satisfies (guideline 4.8). Shipping iOS with Google but without Apple risks rejection.
- An app that lets people create an account must let them delete it inside the app (guideline 5.1.1(v)). The existing deletion endpoint covers this.
- Apple also expects Sign in with Apple tokens to be revoked when an account is deleted. Whether Better Auth does this is unknown.

## Offline synchronisation design

### What the server already guarantees

**Confirmed.**

| Guarantee | Mechanism |
| --- | --- |
| No repeated reward | `lesson_award` primary key `(user_id, lesson_id)` with `onConflictDoNothing`; a check constraint fixes XP at 60 |
| No repeated mastery evidence | `skill_attempt` primary key `(user_id, request_id)` |
| No simultaneous completions racing | `select ... for update` on the `user` row in `completeLesson`, `saveLessonProgress` and `recordSkillAttempt` |
| A completed lesson is never reopened | `saveLessonProgress` returns early when `status === "completed"` |
| The client cannot claim a correct answer | `validateMove` re-evaluates the answers |
| The client cannot claim a reward amount | Amounts come from `LESSON_XP` and `lessonReward(lessonId)` |
| A device clock cannot shift a learning day | `learning_date` uses the server clock and the pinned profile time zone |

### What does not fit offline use today

**Confirmed.**

1. **One step per request.** A learner who walks eight steps offline must replay eight ordered requests, each with the answer that earned the move. The web's in-memory queue (`src/components/lesson/lesson-save-queue.ts`) does this, but it is lost when the tab closes.
2. **The cursor can move backwards.** `validateStepMove` accepts any `next <= current`. A phone that replays an old move after another device went further would pull the cursor back.
3. **The learning day is the sync day.** A lesson finished offline on Monday and synchronised on Tuesday is recorded for Tuesday. The Monday streak day is lost.
4. **A learner without a profile is in UTC.** A mobile-first account that never passed web onboarding has no `learning_profile` row, so a lesson finished at 00:30 in Prague is recorded for the previous day.

### Model

Two kinds of state, never mixed on screen.

| State | Owner | Shown as |
| --- | --- | --- |
| Verdict on an answer, current step, "lesson finished" | Device, immediately | Normal lesson feedback |
| XP, Practice Capital, streak, completion date, unlocks, mastery level | Server only | Shown only after the server answers. Before that the app says the reward will be credited after synchronisation and shows no number |

**Local grading.** The app runs the shared `evaluateQuestion` on the cached lesson. It works for every graded block type, because all of them are deterministic. It does not work for steps that need a saved artifact or a verified mission; those need a connection.

**Outbox.** A persistent, ordered queue per signed-in user.

| Operation | Payload | Idempotent because |
| --- | --- | --- |
| `lesson.walk` | `lessonId`, `revision`, and the ordered moves `{ fromStep, answers }` that advanced the lesson | It states evidence, not a delta. The server skips what it already has |
| `lesson.complete` | `lessonId` | The award primary key |
| `skill.attempt` | `requestId` (UUID made on the device), `itemId`, `answers`, `mode` | The request ID primary key |

Rules:

- The queue is keyed by user ID. Operations are never replayed under another account. Signing out with unsent operations warns the learner first.
- Operations for one lesson are sent in order. Different lessons are independent.
- A `lesson.walk` and its `lesson.complete` can travel in one request (see the [API plan](api-plan.md#learning-writes)).
- The queue is flushed on app foreground, on regained connectivity, and after each new operation.

**Retry.** Exponential backoff with jitter, from 1 second to a 5-minute ceiling. A `Retry-After` header wins over the computed delay. Network errors and `5xx` retry without limit while the operation is younger than 30 days. The age limit is a proposal (decision D8).

**Recovery after an interrupted sync.** The server's answer to any learning write is the full authoritative state of that lesson. If the app dies after the server committed but before the response arrived, the operation is still in the queue, is sent again, and is a no-op that returns the same state.

### Conflict rules

| Situation | Rule |
| --- | --- |
| Duplicate submission of a walk | Moves at or below the server cursor are ignored. The response carries the current state |
| Duplicate completion | The first one pays. Later ones return `xpAwarded: 0` and the original receipt. The app shows "already completed" without a reward animation |
| Two devices complete the same lesson at once | The `user` row lock serialises them. One receipt |
| A walk arrives that starts ahead of the server cursor (a gap) | Rejected with `cursor_gap` and the server cursor. The app resends from that step if it still holds the answers, otherwise it moves the learner back to that step |
| A walk arrives that is behind the server cursor | Ignored. A synchronised cursor never moves backwards. Going back to re-read is local only |
| The lesson is already completed on the server | The walk is ignored. The app switches to review mode |
| The session expired | `401`. The queue pauses and keeps its contents. After sign-in as the same user it resumes |
| The learner signs in as someone else | The other user's queue stays untouched and unsent |
| A guest's queue, then the guest saves an account | The server moves guest learning to the account (`claimGuestLearning`). The app re-keys the queue to the new user ID only after the server confirms the claim (**assumed** to be workable; needs a test) |
| The answer no longer grades as correct because content changed | `answer_rejected` with the step index. The app refetches the lesson, returns the learner to that step, and drops later operations for that lesson. The learner is told plainly |
| The lesson was unpublished | `lesson_unavailable`. Operations for it are dropped and the learner is told |
| The device clock is wrong or manipulated | Irrelevant in the default design: no client timestamp is used for rewards, completion dates or learning days |
| A permanently rejected operation (`4xx` other than `401`, `409`, `429`) | Moved to a small "failed" list with its reason, shown once, never retried silently |

Changed content does not need a hard version check. The compatibility policy keeps earlier steps stable, and the server re-grades each answer against the current block. The `revision` hash exists so the app knows its cached copy is stale; the server reports `contentChanged: true` when the hash differs.

### Streak attribution

The default (option A) keeps today's rule: the learning day is the day the server accepted the completion. It needs no domain change and cannot be gamed. Its cost is that a lesson finished offline late in the evening counts for the next day.

Option B lets the server accept a claimed completion time inside tight bounds: not in the future, no older than a fixed window (48 hours is a proposal), and not earlier than the learner's previous award. It needs a change to `completeLesson` and new exact tests. It lets a learner who tampers with the clock move a completion by at most the window, which can rescue one missed streak day.

Option B is a change to reward-adjacent behaviour and needs a founder decision (D6) before milestone 4. The PRD prefers option B. The roadmap plans option A and keeps option B as a separate PR (4.5).

### Cached content and dated facts

A cached lesson carries `factsAsOf`. The app refetches when online and the revision differs. A lesson opened offline shows the date its facts were checked. How long a cached tax or regulatory lesson may be shown before the app insists on a refresh is a content-owner decision (D9).

## Monorepo assessment

**Confirmed** in the repository; Expo guidance **documented** ([Expo monorepo guide](https://docs.expo.dev/guides/monorepos/), fetched 2026-11-14).

| Question | Finding |
| --- | --- |
| npm workspaces | Not used. Root `package.json` has no `workspaces`. `mobile/` has its own `package-lock.json` |
| React versions | Web `react@19.3.1`; Expo SDK 58 pins `react@19.3.0` (`mobile/package.json`). Expo documents that duplicate React versions in one app cause runtime errors and duplicate React Native versions are unsupported |
| Metro | SDK 52 and later configure Metro for monorepos automatically, but only when a workspace configuration is detected. Importing from outside the app directory without workspaces is not covered by the guide |
| Root tooling | `tsconfig.json` excludes `mobile`; ESLint, knip and Tailwind ignore it |
| Import aliases | Web uses `@/*` for `src/*`. Shared code must not use it |
| Vercel | Runs `npm ci` at the root. With workspaces it would install the native dependency tree on every web deploy |
| Zod in `mobile/` | Only a transitive dependency (4.6.7 in `mobile/package-lock.json`, the same version as the web lockfile). Not listed in `mobile/package.json` |
| CI | `mobile.yml` runs only for `mobile/**`; `ci.yml` ignores PRs that touch only `mobile/**` |
| Dependabot | Does not watch `mobile/` |
| EAS | Profiles exist (`mobile/eas.json`). No project is linked (`eas init` not run) |

### Recommendation

Keep two npm projects. Do not add workspaces, Turborepo or Nx.

Add one shared, source-only folder when the first endpoint is built: `packages/contracts/`.

- Contents: Zod request and response schemas, the lesson payload types, and the pure grading modules (`question-evaluation.ts`, `exercise-evaluation.ts`, `answer-contract.ts`, and `parseNumericAnswer` from `src/features/finance/numeric-input.ts`), moved there and re-exported from their current paths so no web import changes.
- Gradable block types: `packages/contracts` defines structural types for the gradable blocks, holding only the fields the evaluators read (for example `type`, `options`, `correctOptionId`, `answer`, `tolerance`, `answers`). The evaluators are typed against these, not against `LessonBlock`, so nothing from `src/features/lessons/types.ts` and its imports enters the folder.
- Web compile-time check: a type-only test in the web asserts that each question variant of `LessonBlock` is assignable to its structural type. A field renamed in authored lessons then fails `npm run typecheck` instead of grading silently wrong.
- Dependencies: Zod only. No React, no Node APIs, no `@/` alias, no `server-only`.
- Web consumes it through a `tsconfig.json` path. The lesson bundle check (`npm run check:lesson-bundle`) must still pass.
- Mobile consumes it through Metro `watchFolders`.

Zod resolution. Node resolves an import from the file's own directory upwards, so `packages/contracts/*.ts` finds the root `node_modules/zod`. On a developer machine that folder exists and Metro and `tsc` would both quietly use the web's copy. In CI (`mobile.yml` installs only `mobile/`) and in EAS Build it is absent, so the same import fails there. The plan:

- `zod` becomes a direct dependency of `mobile/`, at the exact version the web pins.
- Metro: `watchFolders` limited to `packages/contracts` and `resolver.nodeModulesPaths = [mobile/node_modules]`. The root `node_modules` is outside every watched folder, so Metro cannot resolve into it, and `zod` imported from `packages/contracts` falls through to the app's copy. `resolver.disableHierarchicalLookup = true` was planned but breaks the export: npm nests packages such as `expo-router/node_modules/@expo/metro-runtime`, which hierarchical lookup is needed to find (PR 2.1).
- `mobile/tsconfig.json`: a `paths` entry mapping `zod` to `mobile/node_modules/zod`, for the same reason in type-checking.
- A CI check fails when `package-lock.json` and `mobile/package-lock.json` pin different `zod` versions.

The Metro wiring is **confirmed** in PR 2.1 (a local export with the app's `zod` removed fails even though the root `node_modules/zod` exists). `npm run check:export` in `mobile.yml`, which has no root `node_modules`, proves it on every run. The fallbacks were not needed: a `file:../packages/contracts` dependency, then npm workspaces limited to `mobile` and `packages/*` with the web left at the root.

Why the grading code belongs in the shared folder: mobile must grade offline, and the rule against duplicating learning logic rules out a copy. This is the justification the brief asks for before creating a package.

Follow-on work when the folder appears: `ci.yml` and `mobile.yml` must both run when `packages/**` changes, knip must know the folder, and the root `tsconfig.json` must include it.

## Security considerations

- **Credentials.** Only the Better Auth session cookie is stored, in SecureStore (Keychain, Android Keystore). Never in AsyncStorage, MMKV or the query cache.
- **Persisted cache.** Lesson content and the learner's own progress may be persisted. Session data, e-mail addresses and portfolio values must not be.
- **Bundle.** Every `EXPO_PUBLIC_*` value is public. The app holds no secrets.
- **Answer keys on the device.** Accepted, as on the web. The server re-grades everything.
- **Cross-site requests.** Server Actions have a built-in origin check; route handlers do not. New `POST` handlers authenticated by cookie must reject a browser `Origin` that is not the site's own, and accept only `application/json`. Requests from the app carry no browser origin.
- **Authorisation.** Every handler takes the user ID from the session, never from the path or body. No endpoint accepts another user's ID.
- **Rate limits.** Learning writes have none today (only auth, exports, analytics and market data do). A public JSON API is easier to script than Server Actions, so the sync endpoint needs a per-user rule in `src/features/rate-limit/policy.ts`.
- **Errors.** Stable machine codes, no database or provider text. `logUnexpectedError` stays the only logging path.
- **Caching headers.** `Cache-Control: no-store` on every personal response. `/api/*` already gets a restrictive static Content Security Policy from `next.config.ts`.
- **Transport.** Release builds already refuse a non-HTTPS backend (`mobile/lib/api-url.ts`). Certificate pinning is not proposed.
- **Analytics.** [product-analytics.md](../product-analytics.md) rules out third-party analytics; measurement stays first-party in our own database (decision D12).
- **Product safeguards.** Unchanged: no price notifications, no trade celebrations, no return leaderboards, server-owned prices, FX and balances.

## Performance architecture

All figures below are targets. Nothing has been measured.

| Metric | Target | What decides it |
| --- | --- | --- |
| iOS cold start to interactive, P75 | under 2.0 s | Work before first render; persisted cache restore; bundle size |
| Android cold start to interactive, P75 | under 2.5 s | Same, on slower storage and CPU |
| Tab transition | under 100 ms | Native tabs and stacks; no data fetch blocking the transition |
| Cached lesson open | under 150 ms | Synchronous storage read; one lesson per storage key |
| Local quiz feedback | under 50 ms | Pure function on in-memory data; no network, no storage write on the feedback path |
| Crash-free sessions | at least 99.5 % | Error boundaries per route; crash reporting from the first beta |

Decisions that follow:

- **Bundle and Hermes.** Hermes bytecode is already the default (`mobile-architecture.md`). The placeholder bundle is about 2.4 MB per platform (from the merged notes, not re-measured). Record the size on every PR from `npm run check:export`. Validate with Zod at the network edge in development and for outbox payloads; decide after measuring whether release builds parse every response.
- **Start-up.** Render the first screen from persisted data. Do not wait for the network or for a session refresh. Fonts must not block first paint.
- **Navigation.** Expo Router with native stack and native tabs. No JavaScript-driven screen transitions.
- **Lesson rendering.** One step on screen at a time, so there is no long list to virtualise. Figures load on demand, per figure.
- **Server state.** TanStack Query with a persister. Persist the curriculum map and lessons under separate keys, so opening one lesson does not deserialise the whole cache. Give the persisted cache a version tied to `schemaVersion`.
- **Storage.** A synchronous key-value store (MMKV class) suits the 150 ms target better than AsyncStorage, because restore does not cross the async bridge. This adds a native dependency, so it is a decision (D7), to be settled by measurement in milestone 3.
- **Outbox.** Writes to the outbox happen after feedback is shown, never before.
- **Animation.** Reanimated on the UI thread for step transitions and press feedback. Honour the system reduce-motion setting.
- **Charts.** Draw figures with a GPU-backed canvas or SVG, chosen once for all figures after a spike on the weakest test device.
- **Memory.** Keep one lesson in memory. Drop figure state when the step changes.
- **Server latency.** The merged notes record a region gap between Vercel functions and the database in production ([performance-baseline.md](../performance-baseline.md)). Sync latency inherits it. It does not affect offline feedback.

### Measurement method

- Release builds only. Development builds and Expo Go numbers are not evidence.
- Devices: one recent iPhone, one older supported iPhone, one mid-range and one low-end Android (2 to 3 GB of memory). Name the exact models in the first report.
- Cold start: iOS with Xcode Instruments (App Launch) and MetricKit in the field; Android with `adb shell am start -W` and Macrobenchmark or Perfetto. Take at least 10 cold starts per device and report the 75th percentile.
- Interaction timings: `performance.now()` marks around tab press to first frame, lesson open to first frame, and answer press to feedback, logged in a release build with a debug flag.
- Frames: Perfetto and Android GPU profiling; Instruments (Animation Hitches) on iOS.
- Field data: crash-free sessions and start-up from a crash reporter, once a vendor is chosen (D10). That vendor would be the project's first third party.
- Record results in this folder with device, OS, build number and date. A target is met only by a recorded measurement.

## Risks ranked by severity

| # | Severity | Risk | Evidence | Response |
| --- | --- | --- | --- | --- |
| 1 | Critical | Native figures: 38 bespoke components gate 37 of 52 lessons | Measured inventory | Port by curriculum order; reuse the model files; split milestone 3 (see roadmap) |
| 2 | Critical | No native runtime has ever run this app | No Xcode or Android SDK on the development Mac | EAS development builds and a physical device before any milestone 2 work is called done |
| 3 | High | 13 lessons need artifacts or Lab missions, which mobile will not have at first | Measured inventory | A defined "continue on the web" state; decide scope (D4) |
| 4 | High | Adding the Expo plugin could change web sign-in | Shared handler and origin check | Its own PR with every auth suite |
| 5 | High | Offline completion loses the streak day | `learningDate(now, timeZone)` | Decide D6; say it honestly in the app until then |
| 6 | High | Mobile-first learners have no profile, so learning days are in UTC | `profile?.timeZone ?? "UTC"` | Profile bootstrap before the first completion from mobile |
| 7 | High | Sign in with Apple is effectively required on iOS once Google is offered, and is not configured | No Apple provider in `auth-providers.ts` | Decide launch methods (D5); Apple developer setup has lead time |
| 8 | High | A sync that holds the `user` row lock and then calls `completeLesson` deadlocks: `completeLesson` opens its own `db.transaction` on another connection and waits for the same row | `src/features/progress/repository.ts:44` | Extract `completeLessonInTransaction(tx, userId, lessonId)`; the sync calls it inside its own transaction (see the [API plan](api-plan.md#new-domain-functions)) |
| 9 | Medium | Shared code across two npm projects is unproven with Metro | Not covered by Expo's guide | Prove with `check:export` in the first contracts PR |
| 10 | Medium | The cursor can regress when devices interleave | `validateStepMove` | Forward-only rule in the new sync function, with tests |
| 11 | Medium | Cached lessons with dated tax facts go stale offline | `prepareLessonFacts` resolves per day | `factsAsOf` shown; refresh policy D9 |
| 12 | Medium | Market history inside lessons cached on devices may breach provider terms | `historical-*` figures; FMP terms in project notes | Ask the provider now (D13); those five figures stay online-only until it answers |
| 13 | Medium | Formula rendering without a WebView | KaTeX outputs HTML | Spike in milestone 3; plain `expression` is the fallback |
| 14 | Medium | PR #501 changes Learn UI while this work starts | 100 files, none under `src/features/progress`, `lessons`, `learning`, `mastery`, `db` or `api` | The API reads `src/features/*` only. No dependency on #501 |
| 15 | Low | Two response conventions on the web | Actions and handlers differ | One envelope for `/api/v1`, defined in the API plan |
| 16 | Low | Extra session read per API request | `requestMemo` is render-only | Pass the user into loaders |

## Decisions, alternatives and what is still open

### Decided

| ID | Decision | Outcome |
| --- | --- | --- |
| D1 | Route prefix | `/api/v1`. [mobile-architecture.md](../mobile-architecture.md) updated to match |
| D12 | Analytics for app learners | First-party only, as [product-analytics.md](../product-analytics.md) requires. Today `recordEarlyReturn` is called only from the web `(app)` layout (`src/app/(app)/layout.tsx:30`), so a learner who returns through the app is not counted. `GET /api/v1/me` records the early return the same way. Attributing returns to a platform from `X-Investnik-Client` is a follow-up |

### Recommended, pending founder confirmation

| ID | Decision | Recommendation | Alternative |
| --- | --- | --- | --- |
| D2 | Repository shape | Two npm projects plus a source-only `packages/contracts` | npm workspaces for `mobile` and `packages/*` only |
| D3 | Lesson schema | Mirror `LessonBlock` one to one, `schemaVersion: 1` | A new, smaller mobile schema with a real conversion layer |
| D4 | Lessons mobile cannot render yet | Show them in the map as "continue on the web", never degrade them | Text fallback for figures (needs content sign-off, weakens the lesson) |
| D5 | Sign-in methods at iOS launch | E-mail and password, Google, Sign in with Apple. No Facebook on mobile | E-mail and password only, which avoids the Apple requirement |
| D6 | Streak day for offline completions | Server receipt time (option A). The PRD prefers option B; the founder decides before milestone 4 | Option B: client completion time, at most 48 hours back and not before the previous award |
| D7 | Local storage engine | Decide by measurement between AsyncStorage and a synchronous store | |
| D8 | Maximum age of an unsent operation | 30 days | |
| D9 | Maximum age of a cached dated-fact lesson | Content owner decides | |
| D10 | Crash and performance reporting vendor | Decide before the first beta; check data-processing terms for the EU. Any vendor is the project's first third party, so the privacy policy and [product-analytics.md](../product-analytics.md) change with it | No crash reporting; rely on store consoles |
| D11 | Bundle identifiers `cz.investnik.app` and the `investnik` scheme | Confirm before the first store build; they are permanent | |
| D13 | Licence to cache provider market history on a device | Ask the provider now. Until it answers, the five `historical-*` figures are online-only | Never cache them |
| D14 | Guest start on mobile (`x-investi-anonymous-kind: guest`) | Yes | Account required before the first lesson |

### Remaining unknowns

Each is assumed above and untested.

1. Whether `@better-auth/expo` at the server's version works with this configuration (anonymous plugin, custom hooks, Postgres rate limiter), and whether the plugin order matters.
2. Whether adding the plugin changes any web auth behaviour.
3. Whether Metro can import `packages/contracts` without workspaces, in local development and in EAS Build, with `zod` resolved from `mobile/node_modules` only.
4. Whether Better Auth revokes Apple tokens on account deletion.
5. How guest sessions behave across app reinstalls, and whether the guest claim flow works from the app.
6. Whether a native formula renderer meets the quality of KaTeX for the 31 formula blocks.
7. Which chart technology holds 60 frames per second on the low-end Android device.
8. Whether provider terms allow caching lesson market history on a device (D13).
9. Everything in the PRD that the brief and the review do not restate, until the copy lands in `docs/mobile/prd.md`.
10. Real cold-start, transition and memory numbers.
