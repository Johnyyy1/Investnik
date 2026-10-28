# 2.5.3 · První nákup nanečisto

Issue: [#197](https://github.com/Johnyyy1/Investnik/issues/197). Author/source check: 2026-10-27. Owner: curriculum maintainer. Human editorial review remains part of PR review; no adviser approval is claimed. No dated statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `first-plan-first-purchase`, `module-first-plan`, `/learn/first-plan/first-simulated-purchase` |
| Placement | Required L2, 2.5.3; saved-plan preparation plus prerequisites `first-plan-ips`, `costs-spread-and-fees`, `costs-currency-conversion`, `foundations-markets`; dedicated skill `order-review` |
| Outcome | Check instrument/class/listing, choose an order type, read full costs, catch three faulty orders, verify a practice ETF purchase against the saved IPS |
| Scenario | Fictional Jana, Fond Svět, ISINs starting XX, Burza A/B, 2,500 Kč budget, 100 EUR/unit, 25 Kč/EUR, 25 Kč fee and 0.5% conversion markup; clearly labelled model data |
| Assessment | Identity document search, faded full-cost calculation, limit choice, three error choices, unaided recall, server-verified mission and temporary written safeguard |
| Transfer | Existing personal Portfolio Lab, instrument detail, buy review and IPS builder; no automatic trade or new capital source |
| Compatibility | New lesson and appended contract only; existing lessons/cursors, v1 mission evidence, receipts, reward/unlock policy, fees, schema and ledger execution remain unchanged |

## Mission criteria and scope

`ips-etf-purchase-v2` belongs to this lesson. V1's reserved lesson identity and existing evidence are untouched. V2 uses the latest valid schema-v2 saved IPS, an explicit instrument line and an ETF BUY after that plan was saved, owned through its portfolio generation. It compares **the complete recorded cash debit, including fees and conversion**, with monthly contribution × that instrument's target weight. Both target and ±1% tolerance use the existing minor-unit half-away-from-zero rounding. One matching purchase suffices; several small trades cannot be added together to pass. This is an explicit exercise convention, not a recommended allocation, budget or tolerance for investing.

The immutable evidence records plan revision, trade, target, tolerance and actual debit. Server verification uses the existing owner lock and accepts no client trade/price/amount/verdict. A verified mission remains complete through retries, plan revisions and portfolio resets, so another trade is unnecessary. No-capital and zero-contribution states direct the learner to learning/planning. Verification grants nothing; first completion keeps the existing L2 lesson receipt, and review cannot repeat it.

## Executable sample data

The pre-existing sample ETF's XETR venue has no supported execution calendar; it cannot be bought in default sample mode. One additive, explicitly fictional fixture, `SAMPLE-XNAS:CVETF` (Modelové ETF Nácvik), provides a rehearsal ETF on the already supported US calendar at the unchanged sample clock. Its price and short history are synthetic. Existing instruments, quotes, FX, clocks and session rules are untouched. Composition analytics remain explicitly unavailable for this fictional fund. The lesson identifies it as fictional and unsuitable for a real-money plan. Both a service unit test and a real browser purchase protect executability; weekend execution remains refused.

## Deliberate limits

- The ETF checklist lesson #181 is not published. This lesson teaches the necessary identity checklist inline instead of inventing a prerequisite ID or linking to an unavailable lesson.
- The existing Lab takes quantities and supplies server-authoritative prices/FX/costs. Limit orders are taught as a broker concept; no limit execution, bid/ask spread or slippage is added. The model calculations explicitly omit the latter two; Lab review shows its actual fee and FX markup.
- Current instrument metadata does not expose ISIN or distribution class. The fictional document teaches those checks, and copy points to issuer documents for a real purchase. The Lab mission verifies only authoritative ETF identity and budget; it does not pretend to verify the fictional class or listing fields.
- The post-purchase explanation distinguishes price/FX effects and individual acquisition records without fabricating a numerical attribution or teaching unverified tax rules.
- The mission spends only existing practice cash. It never tops up a learner to make a purchase possible. Waiting remains a valid action; the lesson can resume later.

## Sources checked

- [FINRA · Investing Basics](https://www.finra.org/investors/investing/investing-basics).
- [Investor.gov · Types of Orders](https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders): a market order has no guaranteed execution price; a buy limit sets a maximum price and does not guarantee execution.
- Local contracts: [Portfolio Lab](../../portfolio-lab.md), [guided missions](../../guided-missions.md), [IPS](../../ips.md).

## Validation design

The lesson unit suite recomputes both model purchases, limits and budget comparisons. Mission unit tests cover exact amount boundaries, fractional/minor-unit amounts, wrong sides/assets/identities/dates, zero contribution, tiny purchases and multiple-trade refusal. `test:missions-persistence` executes actual fractional buys with the existing fee/FX arithmetic, rejects wrong amounts and forged final cursors, verifies concurrent retries and one-time lesson receipts, and preserves evidence after reset. V1 retains its old executable-quote override; the new v2 purchase uses normal market-session validation without an override.

The generic walkthrough exercises every question wrong → feedback → retry → correct, persistence/reload, mission bypass refusal, no-capital guidance and search → detail → quantity correction → cost review → confirmed purchase → holding → server verification. It captures every step at 390/1440 px, checks 320 px and 200% text and runs axe. The UI fixture supplies only an owned plan and existing practice capital; the application itself executes the purchase and writes the ledger. It uses deterministic sample prices, not a live provider. Physical devices and screen-reader hardware remain unverified.

## Screenshots

Each step uses existing approved renderers; the faded example and mission were compared with the F/K references in `docs/design/lesson-steps`. The document question follows the existing document-search renderer from #121. No components or styles changed.

| Step | 390 px | 1440 px |
| --- | --- | --- |
| 1 | [Mobile](first-simulated-purchase/01-390.png) | [Desktop](first-simulated-purchase/01-1440.png) |
| 2 | [Mobile](first-simulated-purchase/02-390.png) | [Desktop](first-simulated-purchase/02-1440.png) |
| 3 | [Mobile](first-simulated-purchase/03-390.png) | [Desktop](first-simulated-purchase/03-1440.png) |
| 4 | [Mobile](first-simulated-purchase/04-390.png) | [Desktop](first-simulated-purchase/04-1440.png) |
| 5 | [Mobile](first-simulated-purchase/05-390.png) | [Desktop](first-simulated-purchase/05-1440.png) |
| 6 | [Mobile](first-simulated-purchase/06-390.png) | [Desktop](first-simulated-purchase/06-1440.png) |
| 7 | [Mobile](first-simulated-purchase/07-390.png) | [Desktop](first-simulated-purchase/07-1440.png) |
| 8 | [Mobile](first-simulated-purchase/08-390.png) | [Desktop](first-simulated-purchase/08-1440.png) |
| 9 | [Mobile](first-simulated-purchase/09-390.png) | [Desktop](first-simulated-purchase/09-1440.png) |
| 10 | [Mobile](first-simulated-purchase/10-390.png) | [Desktop](first-simulated-purchase/10-1440.png) |
| 11 | [Mobile](first-simulated-purchase/11-390.png) | [Desktop](first-simulated-purchase/11-1440.png) |
| 12 | [Mobile](first-simulated-purchase/12-390.png) | [Desktop](first-simulated-purchase/12-1440.png) |
