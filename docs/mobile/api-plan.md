# Investník Mobile: API plan (Milestone 0)

Status 2026-11-14. A proposal. No endpoint in this document exists yet. Findings behind it are in the [architecture audit](architecture-audit.md); delivery order is in the [roadmap](implementation-roadmap.md).

## Principles

1. **One authority.** Each handler calls the same repository function as the matching Server Action. It contains session, input parsing, one call, and output mapping. No grading, reward, streak or accounting logic is written in a handler.
2. **Where a new behaviour is needed, it is added to the feature module**, with tests, and both the action and the handler may call it. The additions are listed under [New domain functions](#new-domain-functions).
3. **Server Actions are not refactored.** They keep working as they do today.
4. **The user comes from the session.** No route or body carries a user ID.
5. **Shaped per screen.** One request per screen where possible.

## Conventions

| Topic | Rule |
| --- | --- |
| Base path | `/api/v1` (decision D1 in the audit, decided). Files under `src/app/api/v1/` |
| Authentication | Better Auth session cookie in the `Cookie` header, read by `getCurrentUser()`. The app obtains it with `authClient.getCookie()` |
| Request body | `application/json` only. Parsed with a Zod schema from `packages/contracts` |
| Success | `200` with the resource as the JSON body. No `{ ok: true }` wrapper |
| Failure | `{ "error": { "code": "<machine_code>", "message": "<Czech text for the learner>" } }` with an HTTP status |
| Money | Integer minor units as strings, as `serializePracticeCapitalMinor` already produces |
| Dates | ISO 8601 UTC timestamps. Learning days are `YYYY-MM-DD` strings in the learner's pinned time zone |
| Caching | `Cache-Control: no-store` on personal data. Lesson content sends an `ETag` equal to its `revision` and honours `If-None-Match` |
| Web freshness | A mutating handler calls the same `revalidatePath` targets as its action |
| Browser origin | A `POST`, `PUT` or `DELETE` with an `Origin` header that is not the site's own is refused with `403 forbidden_origin` |
| Rate limiting | The shared Postgres limiter. `429` with `Retry-After` |
| Logging | `logUnexpectedError(scope, operation, error)` only. Expected refusals are not logged |
| Versioning | A breaking change adds `/api/v2` beside `/api/v1`. Additive fields and new block types are not breaking |
| Client version | The app sends `X-Investnik-Client: <platform>/<app version>`. The server does not act on it at first. Forced updates work through [`GET /api/v1/app-config`](#app-configuration), which the app checks itself |

Error codes used across endpoints:

| Status | Code | Meaning for the app |
| --- | --- | --- |
| 400 | `invalid_request` | The body failed its schema. Do not retry |
| 401 | `unauthenticated` | No valid session. Pause the outbox, ask for sign-in |
| 403 | `forbidden` | Signed in, but not allowed (for example a guest saving an artifact) |
| 403 | `forbidden_origin` | Cross-site browser request |
| 404 | `lesson_unavailable` | Unknown or unpublished lesson. Drop queued operations for it |
| 409 | `cursor_gap` | The walk starts ahead of the server cursor. Body includes the server state |
| 422 | `answer_rejected` | A submitted answer does not grade as correct. Body includes the step index and the server state |
| 422 | `requirement_missing` | A required artifact or mission is missing. Message from `ArtifactRequiredError` or `MissionRequiredError` |
| 429 | `rate_limited` | Retry after the header's delay |
| 500 | `internal` | Retry with backoff |

## Endpoint inventory

Priority: **P0** needed for the first signed-in Learn release. **P1** needed before beta. **P2** useful, not needed for beta. Portfolio Lab has no priority: it is outside v1, separately gated, and starts after milestone 4. Complexity: **S** a thin handler over an existing function. **M** needs a small extraction or a new domain function. **L** new behaviour with its own test matrix.

### Authentication and account

These are Better Auth's own routes under `/api/auth/*`. They are not re-wrapped under `/api/v1`.

| Method and route | Purpose | Auth | Contract outline | Reuses | Priority | Complexity | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/auth/sign-in/email` | Sign in | None | Better Auth | `src/lib/auth.ts` | P0 | S | Needs the `expo()` plugin and a trusted origin |
| `POST /api/auth/sign-up/email` | Register | None | Better Auth | Same | P0 | S | Sends the verification e-mail as on the web |
| `POST /api/auth/sign-in/anonymous` | Start as a guest | None | Header `x-investi-anonymous-kind: guest` | `anonymous` plugin, session hooks | P1 | S | Without the header the server creates a demo. The app must always send it |
| `POST /api/auth/sign-in/social` | Google, later Apple | None | Redirect flow, or `idToken` for native | `createSocialAuthConfig` | P1 | M | Apple is a new provider with new credentials |
| `GET /api/auth/get-session` | Session retrieval | Session | Better Auth | Same | P0 | S | None |
| `POST /api/auth/sign-out` | Sign out | Session | Better Auth | Same | P0 | S | None |
| `POST /api/auth/request-password-reset` | Reset link | None | Better Auth | Same | P1 | S | The link opens the web page. Acceptable for v1 |
| `POST /api/auth/delete-user` | Delete the account | Session, plus password or a session under 10 minutes old | `{ password? }` | `guardAccountDeletion`, `accountDeletionRefusal` | P1 | S | Social-only learners must sign in again first. Apple token revocation unknown |
| `GET /api/account/export` | Download own data | Session | Existing JSON download | `readAccountExportRows` | P2 | S | Exists today. Reads the session from request headers already |

### App configuration

| Method and route | Purpose | Auth | Contract outline | Reuses | Priority | Complexity | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v1/app-config` | Forced update and maintenance switch, checked by the app at start-up from the first tester build onwards | None | `{ minSupportedVersion, latestVersion, maintenance }`, values from environment variables | Nothing; a new handler that reads three variables | P0 | S | Must stay public and cheap: it is called before sign-in. An app below `minSupportedVersion` shows only an update screen. Missing variables mean "no minimum, no maintenance", never a blocked app |

### Learner bootstrap

| Method and route | Purpose | Auth | Contract outline | Reuses | Priority | Complexity | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v1/me` | App start: who is signed in and whether set-up is complete | Session | `{ user: { id, name, kind: "account" \| "guest" }, emailVerified, profile: { exists, timeZone, dailyGoalMinutes, onboardingCompleted }, portfolioLabUnlocked }` | `getCurrentUser`, `getLearningProfile`, `requiresInitialOnboarding`, `loadPortfolioLabUnlockStatus`, `recordEarlyReturn` | P0 | S | `loadPortfolioLabUnlockStatus` may record a demo entitlement on first read. Demos are not offered on mobile, so this path is not reached. Records the early return exactly as the web `(app)` layout does, after the response (decision D12) |
| `POST /api/v1/me/quick-start` | Create the learning profile and pin the time zone for a mobile-first learner | Session | `{ experienceLevel, timeZone }` returns the profile | `quickStart` in `src/features/onboarding/repository.ts:27` | P0 | S | Without it, completions are dated in UTC. `quickStart` keeps an existing time zone and never overwrites a completed onboarding |
| `PUT /api/v1/me/time-zone` | Pin the time zone for an existing profile that has none | Session | `{ timeZone }` | `initializeTimeZone` | P0 | S | Writes only while the column is null, by design |

### Learning reads

| Method and route | Purpose | Auth | Contract outline | Reuses | Priority | Complexity | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v1/learn` | The Learn screen: curriculum map, next lesson, momentum | Session | `{ modules: [{ slug, title, description, lessons: [{ id, slug, title, minutes, state, stepCount, lastPosition }] }], next: { lessonId, position }, percentage, gamification: { totalXp, streak, todayCompleted, dailyTarget, timeZone }, earnedPracticeCapitalMinor, milestones }` | `loadLearner` (needs a user-taking variant), `getModulePath`, `moduleCatalog`, `loadMilestones` | P0 | M | `loadLearner` reads the session itself and includes the personalised recommendation. The map must come from the curriculum registry, not from UI code that PR #501 is changing |
| `GET /api/v1/learn/lessons/{lessonId}` | One lesson as data, for rendering and offline use | Session | `LessonPayloadV1` (see the audit) plus `progress: { status, lastPosition, completedAt }`. `ETag: <revision>` | `getAuthoredLesson`, `prepareLessonFacts`, `getGuidedSteps`, `lessonFactKeys`, `skillItems`, `getLessonProgress` | P0 | M | The lesson page composes this inline today. Extract a `buildLessonPayload` used by the handler; leave the page alone. Lessons with `historical-*` figures also need server-loaded market history, which is deferred |
| `GET /api/v1/learn/lessons/{lessonId}/progress` | Authoritative state of one lesson, for reconciliation | Session | `{ status, lastPosition, completedAt, revision }` | `getLessonProgress` | P1 | S | None |
| `GET /api/v1/progress` | Progress screen: XP, streak, skills, milestones | Session | `{ gamification, practiceCapital, skills: Record<skillId, level>, milestones, recent }` | `loadGamification`, `loadPracticeCapitalSummary`, `loadSkillLevels`, `loadMilestones` | P1 | S | Mastery levels are derived on read. No write path |

Lesson IDs in routes are the stable `lesson.id` values. Module and lesson slugs are returned for display and for links to the web.

### Learning writes

| Method and route | Purpose | Auth | Contract outline | Reuses | Priority | Complexity | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/v1/learn/lessons/{lessonId}/start` | Mark a lesson started | Session | Empty body. Returns lesson state | `markLessonInProgress` | P0 | S | Idempotent already |
| `POST /api/v1/learn/lessons/{lessonId}/sync` | Save position, submit the answers that earned it, and optionally complete | Session | Request `{ revision, moves: [{ fromStep, answers }], complete: boolean }`. Response `{ status, lastPosition, completedAt, contentChanged, reward: CompletionRewardPresentation \| null, gamification }` | `advanceLessonWalk` (new, built on `validateStepMove`), which calls `completeLessonInTransaction` | P0 | L | The one endpoint with new domain behaviour. See below |
| `POST /api/v1/learn/skill-attempts` | Record mastery evidence | Session | `{ requestId, itemId, answers, mode }` returns `{ correct }` | `recordSkillAttempt`, `evaluateQuestion` | P1 | S | The action's body must become a shared function, or the handler repeats six lines. Idempotent on `requestId` |

`sync` covers items 4, 5 and 6 of the brief (saving position, submitting answers, completing) in one request, because offline they happen together and must be applied in order.

Behaviour of `sync`, all inside the feature module:

1. Open one `db.transaction` and take the `user` row lock in it, as `saveLessonProgress` does.
2. If the lesson is completed, ignore the moves.
3. Otherwise, for each move in order: ignore it if `fromStep` is below the server cursor; refuse the request with `cursor_gap` if `fromStep` is above it; otherwise run `validateStepMove(steps, fromStep, fromStep + 1, answers)` and the existing mission and artifact requirement checks, and advance the cursor by one.
4. The cursor never moves backwards through this endpoint.
5. If `complete` is true and the cursor is on the final step, call `completeLessonInTransaction(tx, userId, lessonId)` in the same transaction. Its result is the `reward`. Calling `completeLesson` here would deadlock: it opens its own transaction on another connection and waits for the row lock this transaction holds.
6. Always answer with the full authoritative state, including for a request that changed nothing.

No idempotency key or new table is needed. A repeated request finds its moves already applied and its award already written.

Rate limit proposal: a per-user rule for learning writes, sized well above an honest learner's pace (for example 120 per minute). The number is a proposal to be set in `src/features/rate-limit/policy.ts`.

### Portfolio Lab (outside v1, separately gated)

Outside v1 and separately gated; it starts after milestone 4. Listed so the shape is known.

| Method and route | Purpose | Auth | Contract outline | Reuses | Complexity | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v1/lab/portfolio` | Portfolio state | Session and Lab unlock | The portfolio view: cash, holdings, valuation, provenance flags | `requirePortfolioLabUnlock`, `loadPortfolioView` | M | Depends on live quotes. A failed quote must stay a visible failure, never a zero |
| `GET /api/v1/lab/instruments?query=` | Instrument search | Session and unlock | `{ results }` | `portfolioMarketData.service.searchInstruments`, `enforceMarketDataBudget(..., "search")` | S | Shares the daily market-data budget with the web |
| `POST /api/v1/lab/trades/review` | Cost preview before a trade | Session and unlock | `{ instrumentId, quantity, side }` | `reviewTrade`, `loadTradeDecisionCards` | S | Budget family `instrument-preview` |
| `POST /api/v1/lab/trades` | Submit a simulated buy or sell | Session and unlock | `tradeInputSchema` plus `side`, including `clientIdempotencyKey`. Returns `{ duplicate, portfolio }` | `executeTrade` | M | Never queued offline: the server sets the execution price at submission time. A retry after a timeout reuses the same key |
| `POST /api/v1/lab/portfolio/reset` | Reset the portfolio | Session and unlock | `{ clientIdempotencyKey }` | `resetActivePortfolio` | S | Reset history stays auditable through the existing index |

Trades are online-only by design. An offline trade would execute at a later price than the one the learner saw.

### Explicitly not planned

- Push tokens or server-sent notifications. Daily reminders are local notifications scheduled on the device. Price notifications are forbidden by the product rules.
- Backtesting, comparison, training and IPS endpoints.
- Artifact save endpoints. They arrive with the first native artifact form, not before.
- Any endpoint that returns another learner's data.

## New domain functions

Only these additions to `src/features/` are needed for P0. Each is small, tested, and callable from both an action and a handler.

| Function | Where | Why it is not duplication |
| --- | --- | --- |
| `loadLearnerFor(user)` | `src/features/learning/load-learner.ts` | The body of today's `loadLearner` with the session read lifted out. `loadLearner()` becomes a two-line wrapper |
| `buildLessonPayload(lesson, today)` | `src/features/lessons/` | Collects calls the lesson page already makes. The page may adopt it later; it does not have to |
| `completeLessonInTransaction(tx, userId, lessonId)` | `src/features/progress/repository.ts` | The body of today's `completeLesson`, taking the caller's transaction. `completeLesson` becomes a wrapper that opens the transaction and calls it, so the web path behaves as before |
| `advanceLessonWalk(userId, lessonId, moves, complete)` | `src/features/progress/repository.ts` | Applies `validateStepMove` repeatedly under one lock with a forward-only rule, then calls `completeLessonInTransaction` inside its own transaction when asked to complete. `saveLessonProgress` stays as it is for the web |
| `recordLessonSkillAttempt(userId, input)` | `src/features/mastery/` | The parse, grade and record steps of `recordSkillAttemptAction`, without the session read |

## Contracts package

`packages/contracts/` holds, per endpoint, a request schema and a response schema, plus the lesson payload types, structural types for the gradable blocks, and the pure grading modules typed against those structural types. The handler's tests parse its real output with the response schema. The app parses responses with the same schema. Details, the web's assignability check and the Zod resolution plan are in the [audit](architecture-audit.md#monorepo-assessment).

## Testing each endpoint

- Unit tests beside the handler, in the style of `src/app/api/account/export/route.test.ts`: unauthenticated, invalid body, cross-site origin, success, and each documented error code.
- Contract test: the response parses with the shared schema.
- For `sync`: pure tests for `advanceLessonWalk` (duplicate walk, walk behind the cursor, gap, wrong answer, completed lesson, missing requirement), then disposable-database tests for two concurrent syncs and for sync racing a web completion. Exactly one award row in every case.
- A disposable-database test that a `sync` with `complete: true` finishes within a fixed timeout and writes exactly one award row. It fails if the sync ever waits on its own row lock again.
- `completeLesson` keeps its existing tests unchanged after the extraction.
- For `app-config`: answers without a session, and returns the defaults when the variables are unset.
- The existing persistence, progression and curriculum-compatibility suites must pass unchanged, because the web path is untouched.
