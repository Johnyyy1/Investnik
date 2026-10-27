# 2.2.5 · Kontrola: srovnej dva brokery pro svůj plán

Issue: [#175](https://github.com/Johnyyy1/Investnik/issues/175). Editorial/content and source check: 2026-10-27. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `costs-broker-comparison`, `module-costs`, `/learn/costs/compare-two-brokers` (as proposed in the brief) |
| Placement | L2, module 2.2, code 2.2.5, required; prerequisites `costs-spread-and-fees`, `costs-currency-conversion`, `costs-over-30-years` (#172, #173, #174); skills `plan-costs` (new) plus the module's `tracking-difference`, `trade-costs` and `cost-drag` for the mixed review items |
| Outcome | Build the annual cost of a plan (purchases × (trade fee + conversion) + custody), compare two tariffs for the same plan, explain how amount and frequency change the result |
| Inputs | Fictional investor Eva, 2,500 Kč a month into a EUR ETF (12 purchases), portfolio under 500,000 Kč. Broker A: 0 Kč trade, 0.25% conversion, no custody. Broker B: 0.1% trade, minimum 1.50 EUR (36.45 Kč at the model rate 24.30), no maximum, 0.15% conversion, no custody |
| Assessment | Prediction, annual costs A/B (75 and 482.40 Kč ± 0.5), quarterly B (190.80 Kč ± 0.5), three mixed review items (tracking difference, trade cost with spread, cost drag), choice of the complete justification, and a written reflection with the brief's four-criterion rubric |
| Transfer | Portfolio Lab buy review with its two fictional fee profiles; nothing to confirm |
| Compatibility | New lesson and appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Content decisions

All fees come from the shared `tradeFeeMinor` (`src/features/portfolio/costs.ts`), the same min/max rule used by 2.1.6 and Lab execution. The unit test recomputes every answer, the worked examples and the stated shares through it in exact haléře. „No maximum“ is modelled as a cap no amount in the lesson reaches.

The brief's worked numbers are reproduced: A 75 Kč (0.25%), B 482.40 Kč (1.61%), B once a year 81.45 Kč (0.27%), B quarterly 190.80 Kč. The lesson adds one model fact the test also checks: with these two tariffs the costs per purchase equal each other from 36,450 Kč upward (B's 0.1% replaces its minimum, both total 0.25%), and A is cheaper below that. The text ties this to these tariffs only, so it is not an „always/never“ claim.

## Deviations from the brief

- **Prerequisite `broker-fee-schedule` (#170) is not a hard prerequisite.** That lesson is stored in `module-broker-and-account`, which comes after `module-costs` in storage order, and the registry requires prerequisites to come earlier so the first unfinished lesson always has its prerequisites done. Reordering modules would change existing learners' recommendations. The minimum fee is already taught in 2.2.2.
- **Saving to the profile / IPS (step 6) is not implemented.** There is no artifact kind for a cost comparison and the IPS schema has no annual-cost field; both are schema/domain changes. The lab bridge says the result is not saved yet. Follow-up needed.
- **No own-plan calculator (`broker-cost-comparison` figure).** The lesson guidance forbids new lesson components in a content task; objective 3 (other amount/frequency) is covered by the frequency worked example, the quarterly exercise and the break-even explanation.
- **Justification.** Both the MVP choice of three justifications (graded) and the written reflection with the four-criterion rubric (ungraded, not stored, like other lessons) are included.

## Sources checked

- [FINRA · Fees and commissions](https://www.finra.org/investors/investing/investing-basics/fees-commissions): commissions, minimums and how fees add up.
- `docs/education/curriculum-research.md`, module 2.2.

The tariffs, exchange rate and amounts are invented and visibly labelled „Modelový příklad“. No broker, fund or product is recommended.

## Validation

The generic `test:lesson-walkthrough` includes this lesson automatically: wrong answer → feedback → retry → correct answer, reload/resume, server-persisted completion and a single 2,000 Kč receipt, axe checks and a 320 px / 200 % text overflow check on every step. This lesson is also added to the 1440/390 screenshot list. Focused run: `LESSON_IDS=costs-broker-comparison WALKTHROUGH_TEST_URL=http://localhost:<port> npm run test:lesson-walkthrough` against a fresh production build and an isolated QA database.
