# Guided Lab missions (#142)

Missions connect a lesson step to server-verified evidence. They never award XP or Practice Capital themselves. Existing published lessons, saved cursors, lifetime completions, reward receipts and unlocks are unchanged.

## Authoring and rollout

Of the seven lesson codes listed in #142 (2.5.2, 2.5.3, 3.4.5, 3.4.6, 3.5.2, B.1.3, B.1.5), 2.5.2 (#196) and 2.5.3 (#197) are published: 2.5.2 requires `training-contributions-v1` and 2.5.3 uses the personal purchase check v2. The others are not authored lessons in the current registry. The original #142 implementation supplied the engine and working isolated exercise routes; it did not publish placeholder lessons or add new requirements to old published steps. The existing optional `labMission` continues to show sample analysis.

A new lesson opts in by adding `missionId` to its `labMission` block and registering a definition in [the mission registry](../src/features/missions/registry.ts):

```ts
{ id: "allocation-training-v1", lessonId: "foundations-portfolio",
  context: "training", check: "diversification-rules-v1",
  params: { model: "diversification-v1" }, title: "Procvič rozložení portfolia" }
```

The definition's `lessonId` must match the lesson containing the block. Its `missionId` becomes a required output of that step. There is no question-answer encoding or client completion checkbox. Use the existing design K renderer: its model analysis remains explicitly labelled sample data and cannot satisfy the mission. Follow [published-lesson compatibility](education/published-lesson-compatibility.md) before retrofitting a mission into published content; an existing saved cursor cannot be treated as evidence that a newly added mission was passed.

Criteria are versioned by the mission/check ID. Do not repurpose an ID or change its model/thresholds after it has evidence. Add a new version and explicitly plan any lesson migration instead.

## Implemented checks

- `ips-etf-purchase-v1` (personal, reserved for the future first-practice-purchase lesson): the server finds the latest valid saved IPS with explicit instrument identities and a matching ETF BUY executed after that version was saved. Free-text instrument names, sales, investment returns, trade counts and client-supplied trade IDs cannot prove completion. The successful evidence records the IPS revision ID and trade ID. The mission page explicitly says it uses the personal *practice* portfolio. A learner without capital gets a path back to learning; no extra trade is requested once evidence exists.
- `ips-etf-purchase-v2` (personal, lesson `first-plan-first-purchase`): preserves v1 and additionally checks one ETF purchase's full cash debit (fees and FX markup included) against monthly IPS contribution × instrument weight, within ±1%, with centralized minor-unit rounding. It records the target, tolerance and actual debit with plan/trade IDs. Zero contributions cannot pass. Several purchases cannot be combined to satisfy the budget. This is an exercise convention, not investment advice. The authored lesson explains the Lab's current quantity input and unavailable limit/spread/slippage simulation.
- `diversification-rules-v1` (scenario) and `allocation-training-v1` (training): `/lab/missions/{id}` reuses the existing six fictional instruments and four declared diversification rules. The learner submits only allocation percentages and a prediction. The server strictly validates their shape and limits, evaluates the rules and appends the decision and result. A wrong prediction or an unfavorable fictional return does not fail a portfolio that meets the rules. These are exercises in a fixed allocation, not a persistent training account, recurring contributions or new trading rules.

- `training-contributions-v1` (training, lesson 2.5.2 `first-plan-automation`): server-owned like the personal check; the client sends no decision. The server replays every Krizový nácvik session of the learner (#139) from its append-only `training_action` log and counts months in which the IPS contribution arrived and at least one BUY happened in that same month. Twelve such months in one session complete the mission. A lump sum, contributions left as cash, sales, returns and the scenario's outcome do not count. The evidence records the session ID, its frozen IPS version and contribution, and the counted months. Verification reads training data only and writes nothing there or to the portfolio.

- `crisis-drill-finished-v1` (training, lesson B.1.10 `behaviour-crisis-drill`, mission `crisis-drill-model-v1`): server-owned; the client sends no decision. The server replays the learner's Krizový nácvik sessions and takes the latest finished `model-crisis-v1` session whose frozen series equals the deterministic model series. Finishing completes the mission whether or not the IPS was kept; the evidence records the session ID, IPS version, months, sells outside the plan, the end allocation status vs the band and the contribution months, for measuring plan adherence. Verification reads training data only and writes nothing there or to the portfolio.

- `capstone-a-crisis-v1` (training, lesson 2.5.4 `first-plan-capstone-a`, #198): reuses `crisis-drill-finished-v1` unchanged. A model crisis already finished in B.1.10 verifies at once, so the capstone asks for no second drill. The mission only gates the step on a finished drill; Capstone A's `crisis-plan-kept-v1` rubric check still reads the learner's latest drill when the project is submitted.

Other tasks in #142, such as rebalancing by contribution and releasing cash in a crisis, need their own authored scenario, immutable source evidence and deterministic check before registration. Do not map them to the diversification check or pretend their outputs exist.

## Persistence and authority

Migration `0021` adds `mission_attempt`, after main’s training (`0019`) and mastery (`0020`) migrations, with ownership cascade, an idempotency key unique per owner/mission/request, and an index for successful evidence. The original unmerged `0019_thin_avengers` SQL is retained as a test fixture. The new migration also accepts that table if a developer applied the earlier PR checkout locally, preserving its evidence. Attempts are append-only. A retry with the same decision returns the same result; changing a decision under the same request ID is refused. Failed attempts remain auditable. Personal verification records at most one successful evidence row (`request_id = personal`).

The session supplies the owner. Verification, lesson cursor moves, completion, trades and resets serialize on the existing user-row lock. A forward move requires successful stored evidence for every mission on the step, and completion rechecks all mission steps. Direct completion and forged cursor/answer flags cannot substitute for evidence. A historical completed lesson remains read-only on review and never repeats a reward.

Successful evidence is a lifetime record for that mission version: resetting a portfolio or revising the IPS does not force another trade. Trade and IPS IDs refer to the immutable evidence inspected at verification time. Guest-to-account claim transfers isolated attempts with their original evidence and dates; conflicting retry keys are namespaced so neither identity loses a decision. This lifecycle transfer only changes ownership/idempotency metadata. Account deletion cascades attempts; the account JSON export includes them without internal owner/request keys.

Scenario/training verification imports no portfolio execution mutation. Their attempts are isolated by mission ID and owner and cannot create portfolio generations, trades, cash, contributions, rewards or unlocks. They require no Practice Capital. Their capital, instruments and outcomes remain clearly fictional.

## Validation

Run the static gates and the following on a dedicated local `investi_missions_qa` database, never the normal development database:

```sh
MISSIONS_QA_DISPOSABLE=1 MARKET_DATA_PROVIDER=deterministic FX_DATA_PROVIDER=deterministic npm run test:missions-persistence
MISSIONS_QA_DISPOSABLE=1 MARKET_DATA_PROVIDER=deterministic FX_DATA_PROVIDER=deterministic npm run test:missions-browser
```

Export `DATABASE_URL`, a loopback `BETTER_AUTH_URL` with a free port and QA-only `BETTER_AUTH_SECRET` first. The persistence suite migrates twice and seeds the QA curriculum; it covers forged input/cursors, ownership, concurrent retries, lesson completion/review, ETF/IPS evidence, reset preservation, export, cascades and isolation. Its ETF ledger fixture makes the existing sample quote executable only inside the test; this suite does not validate exchange-session rules.

The browser suite starts and stops its own development server, temporarily substitutes a two-step lesson fixture and restores both source files byte-for-byte. It covers keyboard interaction, server verification, sample-analysis bypass refusal, return/reload, persisted cursor/completion, isolation and the no-capital state. It captures 1440/390 px screenshots and checks reflow at 1440/1024/768/390/375/320 px and 200% text. Artifacts are in `test-results/missions/`; physical devices and screen-reader hardware are not covered.
