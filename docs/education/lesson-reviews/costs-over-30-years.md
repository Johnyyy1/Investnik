# 2.2.4 · Náklady za 30 let

Issue: [#174](https://github.com/Johnyyy1/Investnik/issues/174). Editorial/content and source check: 2026-10-27. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `costs-over-30-years`, `module-costs`, `/learn/costs/costs-over-30-years` (slug as proposed in the brief) |
| Placement | L2, module 2.2, code 2.2.4, required; prerequisites `costs-ter-tracking-difference`, `costs-spread-and-fees`, `foundations-risk-reward` (#171, #172, #160); skills `cost-drag` (new, with the recall item) and `compounding` |
| Outcome | Compute the future value of a regular investment at different total costs, explain why costs grow with time and portfolio value, read a Backtesting Lab result with and without costs, and separate a fixed-return model from a historical simulation |
| Inputs | Fictional investor Jana, 2,000 Kč at the start of each month for 30 years, assumed gross return 6% a year, total annual costs 0.2 / 1.5 / 2.5% |
| Assessment | Prediction (~33%), calculator exercise (1,500 thousand Kč ± 1), backtest interpretation (monthly vs. no rebalancing), mastery recall and one reflection with three criteria |
| Transfer | Backtesting Lab: „Náklady obchodů“ with and without costs, monthly vs. annual rebalancing, and the „Roční nákladovost fondu“ experiment (#143) |
| Compatibility | New lesson and appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Content decisions

The table follows the brief's acceptance criterion: an annuity due with the monthly rate `(1 + r − c)^(1/12) − 1`. `cost-drag-model.ts` computes it month by month, and the unit test checks it against the closed form and the brief's values (1,888,972 / 1,499,619 / 1,262,309 Kč, gap 626,663 Kč ≈ 33%). The existing 1.1.8 calculator (`fund-cost-model.ts`) contributes at month end and has a fixed 2,000 Kč deposit, so it would not reproduce the table; the new `cost-drag-slider` figure is a separate model rather than a change to 1.1.8's published results.

The brief asks for the calculator answer as 1,500,000 ± 1,000 Kč. The shared numeric parser does not accept thousands separators („1 500 000“ is not a number), so the question asks for thousands of Kč: 1,500 ± 1. That is the same tolerance and avoids rejecting a correct answer typed with spaces.

The backtest question shows no numbers. The lesson does not run a backtest, so quoting a result would fabricate one. The explanation separates trade costs (paid per purchase and sale) from a fund's annual costs, which are already in a real ETF's historical price; the #143 experiment adds only an extra model deduction, as `docs/backtesting.md` states.

The first-year and last-year cost statements („nanejvýš stovky korun“ / „desítky tisíc korun“ at 1.5%) are checked against the model in the unit test. The „expensive fund will make up for it“ misconception points to the active-vs-index lesson in prose; it is not a graded claim. No fund, broker or product is recommended. Metric-glossary links named in the brief (`cumulative-return`, `annualised-return`) are not added: the lab bridge points to Backtesting Lab, where those links would lead elsewhere.

No Lab behaviour, ledger, tariff or reward policy changes; the L2 reward (2,000 Kč once) applies as written and the Portfolio Lab unlock requirements are unchanged.

## Sources checked

- [FINRA · Fees and commissions](https://www.finra.org/investors/investing/investing-basics/fees-commissions): how ongoing fees compound over long horizons.
- [Aswath Damodaran · Investment philosophies](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm): trading costs and taxes as a drag on strategy returns.
- `docs/backtesting.md`: transaction costs and the annual fund-cost experiment in Backtesting Lab.

The return, costs and amounts are invented and visibly labelled „Modelový příklad“; the Backtesting Lab section is labelled „Simulace“. No historical data is shown in the lesson.

## Validation

The generic `test:lesson-walkthrough` includes this lesson automatically: wrong answer → feedback → retry → correct answer, reload/resume, server-persisted completion and a single 2,000 Kč receipt, axe checks and a 320 px / 200 % text overflow check on every step. The calculator block also checks the 0.2% and 1.5% values, invalid years and keyboard slider focus. Focused run: `LESSON_IDS=costs-over-30-years WALKTHROUGH_TEST_URL=http://localhost:<port> npm run test:lesson-walkthrough` against a fresh production build and an isolated QA database.
