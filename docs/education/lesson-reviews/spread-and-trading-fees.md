# 2.2.2 · Spread a transakční poplatek

Issue: [#172](https://github.com/Johnyyy1/Investnik/issues/172). Editorial/content and source check: 2026-10-26. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `costs-spread-and-fees`, `module-costs`, `/learn/costs/spread-and-trading-fees` |
| Placement | L2, module 2.2, code 2.2.2, required; prerequisite `foundations-markets`; skills `bid-ask-spread`, `trade-costs` |
| Outcome | Compute commission plus half-spread in Kč and percent; compare small monthly and larger quarterly purchases while explaining the waiting trade-off |
| Inputs | Fictional Czech investors Petra and Ondřej, fictional ETF and tariff 0.15%, minimum 60 Kč; midpoint notional in Kč; full spread 0.10%; no FX, tax, slippage or price change |
| Assessment | Prediction, 40,000 Kč spread calculation, faded 4,000 Kč example, independent 3,000 Kč two-field calculation, frequency decision, retrieval and one reflection with three criteria |
| Transfer | Inspect existing server-authoritative commission and FX markup in Portfolio Lab before confirming; no trade is required |
| Compatibility | New lesson and appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Content decisions

All notional amounts are measured at the quote midpoint. An ask-price cash budget would buy a slightly different quantity; the lesson states this explicitly. Spread cost is the difference from midpoint already embedded in execution price, never a second debit to add to that price. At an unchanged quote a buy and sell together cross the full spread; each side may also have commission. A limit order restricts price and can remain unfilled; it does not waive commission.

The lesson recomputes Petra's 75 + 25 = 100 Kč (0.20%), Ondřej's 60 + 1 = 61 Kč (3.05%), and the quarterly 60 + 3 = 63 Kč (1.05%). The independent exercise is 60 + 1.50 = 61.50 Kč (2.05%). Each cost component rounds once to minor units, half away from zero; the exercise states its precision. Percentage cost uses the rounded total divided by midpoint notional. Waiting can save commission but leaves contributions in cash longer; no direction of future price or guaranteed return advantage is claimed.

Issue #170's tariff-reading lesson is not registered on main at implementation time, so it cannot be an active prerequisite. This lesson includes a tariff primer and uses the available `foundations-markets` prerequisite. Add the stable prerequisite when #170 is published. Future lessons 2.2.4/2.5.3 are not registered either; their prerequisite edges belong to their own publication. No placeholder or dead route is added.

`trade-cost-breakdown` is the figure explicitly requested by #172, within the existing `interactiveFigure` kind. It uses the shared FinanceSlider, CalculatorResult, MetricResult and model-data label, without changing the lesson player or introducing another step kind, style system or dependency. It is lazy-loaded and registered in the figure catalog. Commission calls the same `computeTradeCost` as Portfolio Lab; the additional hypothetical half-spread uses centralized `roundDivide`. The model never mutates a portfolio, executes a trade or stores a balance.

The explorer supports 1–1,000,000 Kč notional, 0–10% fee/spread and 0–10,000 Kč minimum/maximum, with maximum at least minimum. Fee rates use whole basis points (two decimal places in percent), matching Lab's tariff contract. Empty, non-finite, negative, out-of-bounds or unsupported-rate drafts clear the result and explain the correction. Its default 10,000 Kč cap is a fictional explorer setting; no cap applies to the lesson's small worked examples.

Lab already implements commission and FX markup (#136). Its providers lack bid/ask observations, so the lesson truthfully describes spread as unavailable there; this PR does not fabricate it, change execution, alter immutable tariffs or add a ledger migration. Policy v4 remains 60 XP and 2,000 Kč Practice Capital once for this L2 lesson. Original Foundations/420 XP unlock requirements and all historical receipts remain intact.

## Sources checked

- [FINRA · Fees and Commissions](https://www.finra.org/investors/investing/investing-basics/fees-commissions): transaction costs on buying and selling, and checking the entire tariff rather than only advertised commission.
- [Investor.gov · Types of Orders](https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders): buy-side ask, sell-side bid and the price restriction of a limit order.
- [Investor.gov · Updated Investor Bulletin: ETFs](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24): bid/ask spread as a trading cost, distinct from fund operating expenses.

These are general educational mechanics. The tariff, quotes and arithmetic examples are invented and visibly labeled; they do not require dated legal fact tokens or tax-adviser approval. The source pages' US regulatory/tax details are not taught as Czech rules.

## Validation and visual evidence

The generic `test:lesson-walkthrough` includes this lesson automatically. A focused run uses `LESSON_IDS=costs-spread-and-fees WALKTHROUGH_TEST_URL=http://localhost:3172 npm run test:lesson-walkthrough` against a fresh production build and isolated local QA database. It exercises wrong answer → feedback → retry → correct answer, reload/resume, server-persisted completion and a single policy-v4 receipt; edits the calculator, tests invalid drafts and keyboard focus; audits every step at 1440/390/320 px and 320 px with 200% text, and runs axe checks.

The walkthrough captures every step at 390 and 1440 px in `WALKTHROUGH_SCREENSHOT_DIR`. Review these against the shared choice, faded-example and reflection PNGs in `docs/design/lesson-steps`, and the existing calculator primitives. Physical devices and assistive-technology hardware remain outside automated Chromium coverage.
