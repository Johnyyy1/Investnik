# B.1.3 · Dispoziční efekt: prodávat vítěze, držet poražené

Issue: [#288](https://github.com/Johnyyy1/Investnik/issues/288). Editorial/content and source check: 2026-10-29. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced; two research values are added to the fact registry.

| Brief | Implementation |
| --- | --- |
| Identity | `behaviour-disposition-effect`, storage module `module-investor-behaviour` (slug `investor-behaviour`), `/learn/investor-behaviour/disposition-effect` (as proposed in the brief) |
| Placement | Level B, module B.1, code B.1.3, required; prerequisite `first-plan-ips`; new skill `disposition-effect` |
| Outcome | Define the disposition effect, compute PGR and PLR, explain why the purchase price does not matter for a sale (except for taxes), save sell rules |
| Inputs | Fictional Marek: six funds worth 100,000 Kč (three in gain, three at a loss) with target weights from his IPS, 20,000 Kč to raise |
| Assessment | Ungraded scenario with three sale plans, PGR 2 ÷ 3 = 67 % and PLR 0 ÷ 3 = 0 %, interpretation of Odean's PGR/PLR, sell-by-target decision, one mastery item (what the disposition effect is), a saved sell-rules checklist, written reflection with a four-criterion rubric |
| Transfer | The Portfolio Lab `disposition` decision card (#141, selling a winner while holding a loser) now links to this lesson instead of 3.2.4 |
| Rewards | Policy v4 applies as written: level B earns XP only (0 Kč). Nothing in the lesson rewards a sale |
| Compatibility | Appended to the last storage module, so no existing learner's next step changes; appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Deviations from the brief

- **"Roughly twice as often" is not what Odean found.** Table I (entire year) reports PGR 0.148 and PLR 0.098; the paper states the ratio is "a little over 1.5". The lesson says "about half as often again" and uses the wrong claim as a distractor with an explanation.
- **No LAB-07 scenario in the Lab.** The scenario is a `personaDecision` step inside the lesson: three sale plans, each revealing which positions were sold, PGR, PLR and the largest drift from the IPS target. The rows are computed on the server from the scenario data in `disposition-effect.ts` (unit-tested), so nothing touches the persistent portfolio. Free selection of positions and a server-recorded personal PGR/PLR need the scenario engine (#142) and are a follow-up.
- **Prerequisite #286 (B.1.1) is not on `main` yet.** Add `behaviour-behaviour-gap` to the placement when it lands (marked with a `shortcut:` comment).
- **"Hide the purchase price" in the Lab** is a proposal for #140/#141 and is not implemented. The lesson offers it as a personal rule ("I don't look at the purchase price") in the checklist instead of describing a Lab feature.
- **Taxes.** The time test (`dan.casovy_test_cp`) is still blocked in the fact registry (#134), so the lesson mentions it without a duration and shows the notice "Vzdělávací obsah, ne daňové poradenství."
- **Mixed checkpoint.** B.1 now has skills from two published lessons, so the mastery domain offers a B.1 mixed checkpoint (turnover and disposition effect).

## Sources checked

- [Odean · Are Investors Reluctant to Realize Their Losses?](https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/areinvestorsreluctant.pdf) (Journal of Finance 1998, [doi](https://doi.org/10.1111/0022-1082.00072)): abstract, Table I and section III, read 2026-10-29. 10,000 accounts at a large US discount broker, 1987–1993. Entire year PGR 0.148, PLR 0.098 (December reverses: 0.108 and 0.128). Sales were not explained by rebalancing, and the winners sold went on to outperform the losers kept. Registered as `odean.pgr` and `odean.plr` (primary, limitations recorded) and shown through tokens.
- [Shefrin and Statman · The Disposition to Sell Winners Too Early and Ride Losers Too Long](https://doi.org/10.1111/j.1540-6261.1985.tb05002.x): listed as further reading; the lesson quotes no figures from it.

Marek, the funds and all amounts are invented and labelled „Modelový příklad“ or „Simulace“. No broker, fund or allocation is recommended.

## Validation

`test:lesson-walkthrough` (with `LESSON_IDS=behaviour-disposition-effect`) answers every question wrong and then right, checks that Continue stays disabled until the checklist is saved, resumes after a reload, and checks one XP-only receipt. It also checks overflow at 1440/390/320 px and 320 px with 200 % text, plus axe. The all-published personalization fixture saves the checklist before completing the lesson.
