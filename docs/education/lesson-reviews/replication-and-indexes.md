# 2.3.4 · Replikace a hlavní globální indexy

Issue: [#179](https://github.com/Johnyyy1/Investnik/issues/179). Editorial/content and source check: 2026-11-11. Owner: curriculum maintainer (content), Redakce — produkty a indexy (index facts). No statutory values or tax calculations are introduced; the UCITS counterparty rule is described qualitatively, without a number.

| Brief | Implementation |
| --- | --- |
| Identity | `etfs-replication-and-indexes`, storage module `module-eu-funds-and-etfs`, `/learn/eu-funds-and-etfs/replication-and-indexes` (as proposed in the brief) |
| Placement | L2, module 2.3, code 2.3.4, required; prerequisites `foundations-etfs-indexes`, `foundations-funds`; new skill `index-replication` with one mastery item (`recall`) |
| Outcome | Tell full physical, sampling and synthetic replication apart with their risks; compare MSCI World, ACWI, ACWI IMI and FTSE All-World by markets and company size; explain market-cap weighting and what it means for US concentration |
| Inputs | Fictional investor Tomáš and three fictional funds on one index. Index facts from the MSCI World, ACWI and Emerging Markets factsheets and the FTSE All-World factsheet, all as at 30. 10. 2026. Look-through model: 50 000 Kč in a World fund (USA 73 %, EM 0 %) and 100 000 Kč in an All-World fund (USA 63 %, EM 10 %), rounded illustrations labelled „Modelový příklad“ |
| Assessment | Prediction (all three can track the index), sampling (1 500 of 4 000), counterparty risk of a swap, index without emerging markets (MSCI World), look-through multi-numeric (63 000 / 10 000 Kč), one mastery item (World vs ACWI), written reflection with a four-criterion rubric |
| Transfer | Lab ETF detail: country breakdown and top holdings with the source date, where data exist; replication and index in the fund's KID |
| Compatibility | New lesson appended after 2.3.6 in storage order (no existing learner's next step moves) and appended published contract. Existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged. Policy v4 applies as written: L2 → 2 000 Kč once |

## Dated facts

Six new keys in `src/features/facts/index-factsheets.ts`, version `2026-10-30`, status `primary`, verified 2026-11-11 in the original PDFs, next review 2027-05-11 (semiannual product review). The lesson pins them with `factContext.asOf: "2026-10-30"` and states „k 30. 10. 2026“ in the text.

| Key | Value | Source |
| --- | --- | --- |
| `trh.msci_world_usa` | 72,77 % | MSCI World factsheet, Country Weights |
| `trh.msci_acwi_usa` | 64,63 % | MSCI ACWI factsheet, Country Weights |
| `trh.msci_acwi_em` | 11,19 % | Derived: MSCI EM market cap 11 288 377,65 ÷ MSCI ACWI 100 900 111,81 mil. USD (World + EM = ACWI exactly) |
| `trh.ftse_aw_usa` | 62,70 % | FTSE All-World factsheet, Country/Market Breakdown |
| `trh.ftse_aw_em` | 9,59 % | Derived: FTSE Emerging 9 958 510 ÷ FTSE All-World 103 838 479 mil. USD |
| `trh.ftse_aw_cesko` | 0,01 % | FTSE All-World factsheet, Czech Rep. (5 constituents) |

The two derived shares are recomputed from the factsheet market caps in the unit test. The structural description (23 developed / 24 emerging markets, large and mid cap, IMI adds small caps, Czech Republic listed as an emerging market) comes from the same MSCI factsheets.

## Content decisions

- **Real index names, fictional funds.** Unlike 2.3.6, the brief asks to compare the actual indexes, so MSCI World, ACWI, ACWI IMI and FTSE All-World keep their names as dated, sourced observations (the standard's exception for traceable data). Funds stay fictional; no fund provider or product is named, and the unit test rejects common ETF brand names.
- **Exercise 3 stays a choice question**, not a `documentTap`, because document-tap content must be a fictional document and this table describes real indexes.
- **Look-through numbers are rounded model inputs**, not facts: the test checks they round the dated factsheet values (73 %, 63 %, 10 %).
- **UCITS counterparty limit** is described without its percentage; a number would need a regulatory fact and expert review. Securities lending is mentioned as the physical-fund counterpart risk.
- **Prerequisite #177** (reading a KID and factsheet) is not published yet, so the placement uses `foundations-etfs-indexes` and `foundations-funds`. When #177 ships, adding it as a prerequisite is a registry-only change.
- **Mixed checkpoint 2.3.** Module 2.3 now has skills from two published lessons, so the existing mastery rules create its mixed checkpoint and Milestone A's skill requirement includes it. This follows the published-content rule (#456). Recorded `milestone_achievement` rows stay as they are.
- **Numeric input** follows the platform's parser: `63000` or `63000,0`; a space as thousands separator is not parsed today (unchanged).

## Sources checked

- MSCI World, ACWI and Emerging Markets index factsheets, data as at 30. 10. 2026 (URLs in the fact registry).
- FTSE Russell, FTSE All-World Index factsheet, data as at 30. 10. 2026.
- justETF Academy, choosing an ETF and replication methods: https://www.justetf.com/en/academy/die-richtige-etf-auswahl.html

No fund, broker or index is recommended. Vzdělávací obsah, ne investiční doporučení.

## Validation

The generic `test:lesson-walkthrough` includes this lesson automatically (wrong answer → feedback → retry, reload/resume, completion with a single 2 000 Kč receipt, axe and 320 px / 200 % text overflow on every step); it is also in the 1440/390 screenshot list. Focused run: `LESSON_IDS=etfs-replication-and-indexes WALKTHROUGH_TEST_URL=http://localhost:<port> npm run test:lesson-walkthrough` against a fresh production build and an isolated QA database.
