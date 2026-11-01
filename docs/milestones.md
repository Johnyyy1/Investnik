# Milestones A–D and capstones (#126)

A milestone is recognition, not an unlock. It grants no XP, Practice Capital or access, and it never changes lesson completion, reward receipts or recorded unlocks. Definitions live in [the milestone registry](../src/features/milestones/registry.ts). The pure derivation is in [domain.ts](../src/features/milestones/domain.ts), and the automatic criteria are in [criteria.ts](../src/features/milestones/criteria.ts).

## Derived state

Current state has no flag: every read derives it from `lesson_progress` completions, `skill_attempt` rows and `capstone_submission` rows. A milestone is achieved when all of its requirements hold:

| Milestone | Requires | Lessons in scope | Behavioural lessons | Capstone |
| --- | --- | --- | --- | --- |
| A · Připraven/a začít | — | published required lessons of levels 1–2 | B.1.1–B.1.4, B.1.9, B.1.10 (crisis exercise) | `capstone-a-v1` |
| B · Samostatný pasivní investor | A | published required lessons of level B and level 3 | all published lessons of B.1 | `capstone-b-v1` |
| C · Samostatný analytik akcií | B | published track lessons of levels 4–5 | — | `capstone-c-v1` |
| D · Kvantitativní investor | B (C is not required) | published track lessons of level 6 | — | `capstone-d-v1` |

- **Lessons.** Published required (`required`/`optional-track`) placements of the listed levels plus the listed display codes (founder decision, #456). A draft placement is outside the scope and blocks nothing. A display module with no published lesson leaves the scope, and its skills with it. Tax and regulatory lessons extend milestone A when they are published after expert review. Level 0 is recommended and can be skipped, so it is not a requirement. A lesson counts from its lifetime completion.
- **Skills.** Every skill of the in-scope display modules that has a mixed checkpoint must have reached Zvládnuté (`MILESTONE_SKILL_LEVEL`) at least once, replaying its attempts in order. A later wrong review lowers the mastery state shown in Progress, but it does not reopen the milestone.
- **Capstone.** At least one passing submission of the milestone's capstone. A later weaker submission does not revoke it.
- **Unavailable.** A listed display code is unplaced, the scope has no published lesson, or the capstone lesson is unpublished. Today milestone A is open (drafts 1.1.10, 2.1.1 and 2.4.1 do not count) and B, C and D are unavailable because their capstone lessons #231, #269 and #285 are unpublished.

`achievedAt` is the latest of the requirement satisfaction times: the last in-scope completion, the moment the last skill reached Zvládnuté, the first passing submission, or the prerequisite milestone's own date. Every requirement is monotonic, so an achieved milestone stays achieved. One exception is deliberate: when new required content is published into a milestone's scope, the milestone reopens for learners who have not completed it. This matches how an expanded module becomes in progress again. Old completions, receipts and access stay intact.

## First achievement record

`milestone_achievement` (migration `0025`) keeps one insert-only row per learner and milestone: `scope_version`, a deterministic 16-character SHA-256 fingerprint of the sorted lesson IDs, sorted skill IDs and capstone ID at that moment, and the derived `achieved_at`. The derived state can reopen when content is published; this row stays, so the S1 gate counts anyone who ever reached the milestone. It grants no XP, Practice Capital or access, and nothing in the product reads it to decide state.

`recordMilestoneAchievements` runs in the same transaction as the evidence that can complete a milestone (`completeLesson` on a first completion, `recordSkillAttempt` on a correct checkpoint answer, `submitCapstone`), so a later publication cannot lose it. `on conflict do nothing` keeps the first row under retries. `loadMilestones` also records a learner whose derived state is achieved without a row (the scope shrank at a deploy, or the evidence predates the table). That write takes the same account lock, and a failure is logged without breaking the page. A learner who already meets the requirements but never opens Learn or Progress again stays uncounted. Rows cascade with the account and appear in the account export (`milestoneAchievements`). Guests cannot submit a capstone, so they never have a row and guest claim has nothing to transfer.

## Capstone rubric

Every criterion has four levels: 1 Začínající, 2 Rozvíjející se, 3 Zdatný, 4 Příkladný. The learner rates each criterion once (1–4) and writes a reflection. A criterion with an automatic check takes the self-rating when the check passes. A failed check caps it at level 2 (`FAILED_CHECK_CAP`). An unavailable check leaves it unrated. A submission passes when every criterion reaches level 3 (`PASSING_RUBRIC_LEVEL`). These levels come from the research brief and are proposals to validate with learners, not established constants.

Thresholds are named in `capstoneThresholds`. They are illustrative educational limits, not norms or advice:

- `ipsMaxDeviationBps` = 500 (5 p. b.): largest absolute gap between the Lab portfolio and the saved IPS target over every instrument and cash. This is the Portfolio Lab process-feedback convention, compared after rounding to whole basis points.
- `singleStockMaxBps` = 1000 (10 %): largest single stock as a share of the whole portfolio including cash. At least one ETF holding is also required.
- `crisisMaxSellsOutsidePlan` = 0: sells outside the IPS rules in the learner's latest crisis drill (`/lab/training`), counted by the drill's own evaluation. The return of the drill is never judged.

### `capstone-a-v1` — Závěrečný projekt A (lesson `first-plan-capstone-a`, #198)

| Criterion | Check | Zdatný (3) |
| --- | --- | --- |
| Soulad portfolia s IPS | `ips-alignment-v1`: deviation ≤ `ipsMaxDeviationBps`; unavailable while the Lab is locked, without a structured IPS, with an asset-class-only IPS or with a missing quote | every instrument and cash within 5 p. b. of the IPS |
| Náklady | self-assessment | total annual plan costs calculated and justified |
| Diverzifikace | `diversified-core-v1`: an ETF holding and no single stock above `singleStockMaxBps`; unavailable with a missing quote | a fund core and no stock above 10 % |
| Chování v krizi | `crisis-plan-kept-v1`: finished drill with at most `crisisMaxSellsOutsidePlan` sells outside the plan; unavailable without a finished drill | no sell outside the IPS; the reflection names the feeling and the rule |

Costs have no automatic check yet: no saved artifact records an all-in annual cost calculation.

### `capstone-b-v1` — Závěrečný projekt B (lesson `maintenance-capstone-b`, #231)

| Criterion | Check | Zdatný (3) |
| --- | --- | --- |
| Soulad s IPS a horizontem | `ips-alignment-v1` | every instrument and cash within 5 p. b.; allocation fits the horizon |
| Interpretace backtestu | self-assessment | backtest with costs and benchmark, limitations stated |
| Náklady a daně | self-assessment | rebalancing plan accounts for costs and tax effects |
| Chování a pojistky | `crisis-plan-kept-v1` | no sell outside the IPS; safeguards written down |

Backtesting Lab runs are not persisted, so backtest interpretation is self-assessed.

### `capstone-c-v1` — Závěrečný projekt C (lesson `thesis-capstone-c`, #269)

| Criterion | Check | Zdatný (3) |
| --- | --- | --- |
| Kvalita analýzy | self-assessment | business, statements and ratios linked, limitations included |
| Příběh a čísla | self-assessment | every story assumption has a number or source |
| Ocenění a citlivost | self-assessment | valuation as a range with sensitivity and reverse DCF |
| Rizika a kritéria ukončení | `thesis-saved-v1`: a saved `investment_thesis` artifact, whose schema requires risks and exit criteria | saved thesis with risks, pre-mortem and exit criteria |
| Revize | self-assessment | the 6-month review compares the thesis with the result and the index |

Peer review is out of scope.

### `capstone-d-v1` — Závěrečný projekt D (lesson `backtest-capstone-d`, #285)

| Criterion | Check | Zdatný (3) |
| --- | --- | --- |
| Kritika cizího backtestu | self-assessment | the full bias checklist, each item evidenced |
| Návrh poctivého testu | self-assessment | costs, an out-of-sample period and the number of attempts |
| Vlastní test a interpretace | self-assessment | interpretation states uncertainty, attempts and data limits |

D has no automatic check because Backtesting Lab runs are not persisted.

Criteria and thresholds are immutable once a submission references a capstone ID. New criteria need a new ID such as `capstone-a-v2`.

## Persistence and authority

Migration `0022` adds `capstone_submission`: append-only versions per learner and capstone (`version` unique per user + capstone), `request_id` unique per user, frozen `artifact_refs`, `auto_criteria` and `self_assessment` JSON, and `submitted_at` set by the server. The verdict is recomputed from the stored row on every read, so it is reproducible and later Lab or IPS changes do not rewrite it.

`submitCapstone` accepts only the capstone ID, a request UUID and the self-assessment. The server reads the evidence first, because the Lab valuation may need market data. It never opens a portfolio generation for a learner whose Lab is locked. It then takes the account row lock (shared with artifacts, progression and trades), refuses guests, answers a retried request with the stored version, refuses a reused request ID for different content and appends the next version. Submissions write no trades, money, progress, rewards or unlocks. `artifact_refs` records the inspected portfolio generation and IPS version, crisis session and thesis revision.

Account deletion cascades the rows. The account JSON export lists every version without owner and request keys. Guests cannot submit, so guest claim has nothing to transfer.

The capstone lessons call `submitCapstone` from their own step. #126 shipped the engine, the Learn/Progress display and the registry. Lesson 2.5.4 `first-plan-capstone-a` (#198) collects the self-assessment with the existing `rubricSelfAssessment` block, whose criteria are generated from `capstone-a-v1`. [`capstone-output.ts`](../src/features/milestones/capstone-output.ts) binds that lesson/block to the capstone: `saveOwnedArtifact`, which the `saveArtifact` action uses, submits the ratings and text as the capstone self-assessment first, under the output's retry ID, and only then saves the lesson output. A saved output, which is what lets the step continue, therefore always has a submission, a retry returns both stored rows and a failed submission saves nothing. Every save of the output appends a new capstone version. Guests can save neither.

## Display

Learn and Progress share the curriculum map, which lists each milestone with its scope, its derived status, its requirements as "done / total" or "připravujeme", and a disclosure with the lessons it contains right now. Drafts are not listed and nothing promises them. Status is written out, never conveyed by colour alone.

## Validation

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. On a disposable local database, run `MILESTONES_QA_DISPOSABLE=1 npm run test:milestones-persistence`. It covers versions, concurrent retries, reused request IDs, guest refusal, the locked-Lab guard, frozen criteria, first-achievement recording under concurrency, reopening, export and the cascade.
