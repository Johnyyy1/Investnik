# Milestones A–D and capstones (#126)

A milestone is recognition, not an unlock. It grants no XP, Practice Capital or access, and it never changes lesson completion, reward receipts or recorded unlocks. Definitions live in [the milestone registry](../src/features/milestones/registry.ts). The pure derivation is in [domain.ts](../src/features/milestones/domain.ts), and the automatic criteria are in [criteria.ts](../src/features/milestones/criteria.ts).

## Derived state

There is no milestone flag or table. Every read derives the state from `lesson_progress` completions, `skill_attempt` rows and `capstone_submission` rows. A milestone is achieved when all of its requirements hold:

| Milestone | Requires | Lessons in scope | Behavioural lessons | Capstone |
| --- | --- | --- | --- | --- |
| A · Připraven/a začít | — | required lessons of levels 1–2 | B.1.1–B.1.4, B.1.9, B.1.10 (crisis exercise) | `capstone-a-v1` |
| B · Samostatný pasivní investor | A | required lessons of level B and level 3 | all of B.1 | `capstone-b-v1` |
| C · Samostatný analytik akcií | B | track lessons of levels 4–5 | — | `capstone-c-v1` |
| D · Kvantitativní investor | B (C is not required) | track lessons of level 6 | — | `capstone-d-v1` |

- **Lessons.** Required (`required`/`optional-track`) placements of the listed levels plus the listed display codes. Level 0 is recommended and can be skipped, so it is not a requirement. A lesson counts from its lifetime completion.
- **Skills.** Every skill of the in-scope display modules that has a mixed checkpoint must have reached Zvládnuté (`MILESTONE_SKILL_LEVEL`) at least once, replaying its attempts in order. A later wrong review lowers the mastery state shown in Progress, but it does not reopen the milestone.
- **Capstone.** At least one passing submission of the milestone's capstone. A later weaker submission does not revoke it.
- **Unavailable.** If a display module in scope has no placed lesson, a listed code is unplaced, an in-scope lesson is an editorial draft or the capstone lesson is unpublished, the requirement is *unavailable* and so is the milestone. Today every milestone is unavailable: the capstone lessons (#198, #231, #269, #285) and modules 2.2, 2.3 and 2.5 are not published. Milestone A therefore cannot be marked complete before its practical and crisis outcomes exist.

`achievedAt` is the latest of the requirement satisfaction times: the last in-scope completion, the moment the last skill reached Zvládnuté, the first passing submission, or the prerequisite milestone's own date. Every requirement is monotonic, so an achieved milestone stays achieved. One exception is deliberate: when new required content is published into a milestone's scope, the milestone reopens for learners who have not completed it. This matches how an expanded module becomes in progress again. Old completions stay intact.

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

The capstone lessons will call `submitCapstone` from their own step. This issue ships the engine, the Learn/Progress display and the registry; it publishes no capstone lesson.

## Display

Learn and Progress share the curriculum map, which lists each milestone with its scope, its derived status and its requirements as "done / total" or "připravujeme". Status is written out, never conveyed by colour alone.

## Validation

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. On a disposable local database, run `MILESTONES_QA_DISPOSABLE=1 npm run test:milestones-persistence`. It covers versions, concurrent retries, reused request IDs, guest refusal, the locked-Lab guard, frozen criteria, export and the cascade.
