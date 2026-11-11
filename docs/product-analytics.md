# Product analytics: funnel to milestone A and learning outcomes

Issue #355 adds the minimal measurement the S1 stage gate needs: how many people move from the landing page to their first learning and back again, and where they stop. The learning-outcome report from #130 below builds on it. There is no third-party analytics tool, script, cookie or pixel. Everything stays in our own database, and the report contains aggregate counts only.

## Funnel

| Step | Source | New data? |
| --- | --- | --- |
| Landing-page view | `analytics_landing_view_day`: one counter per Europe/Prague calendar day | yes, no identifier |
| New account or guest | `user.created_at` for saved accounts and guests; demo identities are excluded | no |
| Diagnostic | `learning_profile.personalized_onboarding_completed_at` where a diagnostic result exists | no |
| First completed lesson | earliest `lesson_award.awarded_at` (the append-only completion receipt) | no |
| First lesson output | earliest `learner_artifact.created_at` | no |
| Milestone A | `milestone_achievement`: the first time a learner reached it, kept when new content later reopens it (#456) | yes, one row per learner and milestone |
| First Lab mission | none yet: reported as **unavailable** until guided missions (#142) exist | — |
| Return within 7 days | `analytics_early_return`: the first app visit on calendar days 1–7 after the start | yes, one row per learner |

The first Lab trade (`portfolio_trade.executed_at`) is printed as separate context until missions exist. It is not a stand-in for the mission step.

### Counting rules

- **Cohorts.** The 7-day and 30-day funnels take learners who started on the last 7 or 30 Prague calendar days, today included, and count every step each of them has reached by now. Weekly cohorts group learners by the Monday of their start week.
- **Steps are not strictly ordered.** The diagnostic can be skipped, so each step counts everyone who reached it. "Z předchozího" is the share of learners at the previous available step who also reached this step; "Ze startu" divides by the cohort size. Unavailable steps are never counted as zero and are skipped as a base.
- **Views are not people.** The start step's conversion from landing-page views compares learners with page loads, and the report says so.
- **Returns need a closed window.** A learner still within their seven days may yet return, so the return share is divided only by learners whose window has closed or who have already returned. The report shows how many are still in the window.
- **Lesson drop-off** lists every published lesson in Curriculum 2.0 display order, across all current learners: opened (a `lesson_progress` row), completed, **abandoned** (opened, not completed, unchanged for 7 days) and **stopped after** (this is the learner's latest completed lesson and nothing has been completed for 7 days). Lessons with data but no curriculum placement are listed last.
- **Deleted data stays deleted.** The report reads current rows. Deleted accounts and cleaned-up guests or demos drop out of all historical counts. A claimed guest's learning moves to the account, which counts from the account's creation time.

## Recording

- **Landing views.** `LandingViewBeacon` on the marketing page sends one bodyless `navigator.sendBeacon` to `POST /api/analytics/visit` per page load. No cookie or browser storage is used. Browsers sending Global Privacy Control or Do Not Track are not counted. The route ignores cross-site requests and limits counting to 30 per IP per hour (an HMAC'd rate-limit bucket, `LANDING_VIEW_IP_RULE`). It always returns an empty `204`, and failures are logged without details. Bots that do not run JavaScript are not counted, but bots that do run it can be. Treat views as an approximation.
- **Early returns.** The authenticated app layout calls `recordEarlyReturn` through `after()` for accounts and guests, only on Prague calendar days 1–7 after `user.created_at`. The insert is `on conflict do nothing`, so the first return wins and the table holds at most one row per learner. The row cascades with the user, is part of the account export (`productMeasurement.earlyReturnAt`) and is described in the privacy policy.

- **Milestone A.** Recorded in the transaction that wrote the completing evidence; see [milestones](milestones.md#first-achievement-record). The report adds the S1 gate: registered accounts (no guests or demos), how many reached milestone A at least once, their share, and a split by scope version. Scope versions are opaque fingerprints; a version with fewer lessons is an easier milestone, so compare shares across versions with care.

Migration `0018_product_funnel` only adds the two tables. It changes no existing rows, rewards, progress or Lab state.

## Report

```sh
DATABASE_URL=… npm run analytics:funnel            # text tables
DATABASE_URL=… npm run analytics:funnel -- --json  # the same report as JSON
DATABASE_URL=… npm run analytics:funnel -- --weeks=12
```

The script only reads. User IDs serve as opaque keys inside the computation and never appear in either output format. There is deliberately no in-app dashboard: the product has no admin role, and an authenticated internal page would need its own access design.

## Learning outcomes (#130)

`npm run analytics:outcomes` (add `-- --json` for JSON) prints all-time learning outcomes beside the funnel. It reads only existing append-only records and adds no tracking, table or migration. Like the funnel it excludes demo identities, uses user IDs only as opaque grouping keys and prints aggregate counts only. Windows and thresholds below are design proposals to validate, not research constants.

| Layer | Definition | Source |
| --- | --- | --- |
| North star | Of learners who reached milestone A, the share whose **first finished** crisis drill had no sell outside their IPS. A retry already knows the crisis path, so the first run is the honest test; the capstone separately checks the latest drill. Learners without a finished drill are reported apart, never as failures. | `milestone_achievement`, `training_session` + `training_action` (replayed) |
| Mastery | Median number of skills at Zvládnuté or above, for milestone-A learners and for all learners, with the same derivation the learner sees (`skillLevel`). | `skill_attempt` |
| Knowledge: Big Three | Per question, correct answers in the latest adaptive entry test and in the first Foundations-checkpoint attempt. Different groups of people, so a description, not a measured effect of teaching. | `learning_profile.diagnostic_result` (V2), `skill_attempt` |
| Retention 2/8/26 weeks | For each learner and skill the clock starts at the first correct answer. The first mixed-checkpoint or review answer from 2, 8 and 26 weeks on counts in that window; lesson re-answers are not retrieval. | `skill_attempt` |
| Lab behaviour | In each learner's first finished drill: no sell outside the plan, any sell while the index is ≥ 20 % below its earlier high, ending inside the IPS band (band plans only), median turnover and median MWR − TWR (cumulative, same period). MWR − TWR shows cash-flow timing, not by itself a behavioural mistake. | replayed drills via `evaluateTraining` |

Reported as **not measured yet**, never as zero:

- HHI, cash above plan and IPS alignment in the personal portfolio. `portfolioProcess` already computes them per learner, but from current quotes; the report only reads the database.
- PGR/PLR. `dispositionRatios` defines them (Odean 1998) on sale-day snapshots, but the ledger does not store prices of unsold positions on the day of a sale, and the drill has a single index.
- The opt-in real-world follow-up questionnaire (3 and 12 months after milestone A) and A/B tests of cards or lesson variants. Neither exists yet; both need an approved design and, for the questionnaire, its own consent text and data minimisation before they are built. A/B assignment must never affect rewards.

## Code

- `src/features/analytics/funnel.ts`: pure step, cohort and drop-off rules, plus the Prague calendar helpers.
- `src/features/analytics/report.ts`: report assembly and text formatting.
- `src/features/analytics/repository.ts`: the two writes and the single read of existing records.
- `src/features/analytics/outcomes.ts`: pure learning-outcome metrics (#130); `report.ts` assembles and formats them, `repository.ts` loads them.
- `scripts/report-funnel.mts`, `scripts/report-outcomes.mts`: the CLIs.

## Validation

Unit tests cover calendar edges (midnight, day 7/8, the end of daylight saving time), cohort windows, unavailable steps, conversions, pending returns, weekly cohorts, lesson order and drop-off, the route's same-origin check, rate limit and failure handling, the beacon's privacy signals, and the absence of learner keys in the output.

`FUNNEL_QA_DISPOSABLE=1 npm run test:product-analytics` requires an explicit local database named `investi_funnel_qa`. It checks that the migration is additive and reruns cleanly, that concurrent and repeated early returns produce one row, that nothing is recorded outside days 1–7, that concurrent landing views lose no updates and fall on the Prague day, that demo identities are excluded, that the report prints no identifier, and that account deletion cascades. `test:account-deletion` also covers the export and cascade of the early-return row.
