# 2.2.3 · Měnová konverze a měnové riziko

Issue: [#173](https://github.com/Johnyyy1/Investnik/issues/173). Editorial/content and source check: 2026-10-27. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `costs-currency-conversion`, `module-costs`, `/learn/costs/currency-conversion` |
| Placement | L2, module 2.2, code 2.2.3, required; prerequisites `costs-spread-and-fees`, `foundations-stocks`; skill `currency-risk` |
| Outcome | Compute conversion cost against a reference rate, explain that it is paid on purchase and sale, separate trading currency from currency risk, and say when holding EUR avoids repeated conversions |
| Inputs | Fictional investor Pavel, fictional reference rates 24.30 and 24.50 Kč/EUR and markups 0.5% and 0.4%; no real broker, bank, rate or fund |
| Assessment | Prediction, 20,000 Kč conversion cost (80 Kč ± 1 Kč), round trip (1% ± 0.01), currency-of-assets question, stronger-koruna question, mastery recall and one reflection with three criteria |
| Transfer | Inspect the reference rate and conversion markup in the Lab's purchase review; read the Lab's FX line as quote-currency translation only |
| Compatibility | New lesson and appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Content decisions

The markup is modelled on the rate (broker rate = reference × (1 + markup)), as in the Lab's purchase review. The Kč cost is therefore `amount × (1 − 1 / (1 + markup))`: 49.75 Kč (0.4975%) for Pavel and 79.68 Kč for the exercise. The exercise asks for whole Kč and accepts ±1 Kč, so both the exact value and the 0.4% shortcut (80 Kč) pass. The round trip is about 1% and slightly below it, because the second markup applies to a smaller amount.

The stronger-koruna question is a single multiple choice with the option „klesne zhruba o 9–10 %“, as the issue's acceptance criteria require. The explanation separates a 10% stronger koruna (1/1.1 − 1 ≈ −9.1%) from a 10% lower USD/CZK rate (−10%).

The issue suggests converting „less often, larger amounts“. With a purely percentage markup this does not change the percentage cost, so the lesson says it helps only when the tariff has a fixed fee or minimum, and emphasises avoiding needless round trips (for example an EUR account when buying, selling and receiving dividends in EUR, after checking its fees). No broker, bank or product is recommended.

The world-index composition is described qualitatively („z velké části americké firmy“) instead of a dated percentage, so no fact token is needed. Hedging is introduced only as a trade-off with its own cost; the decision belongs to planned lesson 3.4.6, which is not linked because it is not published.

Lab already shows the reference rate and conversion markup at purchase review (#136) and splits the portfolio result into price and FX effects (`src/features/portfolio/attribution.ts`). That FX effect uses the instrument's quote currency, so for an EUR-quoted world ETF the USD movement sits inside the EUR price. The lab bridge states this limitation instead of implying a look-through currency analysis. No Lab behaviour, ledger, tariff or reward policy changes; the L2 reward (2,000 Kč once) applies as written and the Portfolio Lab unlock requirements are unchanged.

## Sources checked

- [ČNB · Kurzy devizového trhu](https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/): the published reference rate the lesson uses as the comparison point.
- [justETF · How to choose the right ETF](https://www.justetf.com/en/academy/die-richtige-etf-auswahl.html): fund currency vs. currency risk of the underlying holdings, and currency-hedged share classes.

The rates, markups and amounts are invented and visibly labelled „Modelový příklad“. No historical data or simulation is shown.

## Validation

The generic `test:lesson-walkthrough` includes this lesson automatically: wrong answer → feedback → retry → correct answer, reload/resume, server-persisted completion and a single 2,000 Kč receipt, axe checks and screenshots at 1440/390 px plus a 320 px / 200 % text overflow check on every step. Focused run: `LESSON_IDS=costs-currency-conversion WALKTHROUGH_TEST_URL=http://localhost:<port> npm run test:lesson-walkthrough` against a fresh production build and an isolated QA database.
