# B.1.2 · Přehnaná sebedůvěra a příliš časté obchodování

Issue: [#287](https://github.com/Johnyyy1/Investnik/issues/287). Editorial/content and source check: 2026-10-28. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced; two research values are added to the fact registry.

| Brief | Implementation |
| --- | --- |
| Identity | `behaviour-overconfidence`, new storage module `module-investor-behaviour` (slug `investor-behaviour`), `/learn/investor-behaviour/overconfidence-and-trading` (as proposed in the brief) |
| Placement | Level B, module B.1, code B.1.2, required; prerequisites `first-plan-ips` and `costs-spread-and-fees` (#172); new skill `turnover` |
| Outcome | Compute turnover (sales ÷ average portfolio value) and the yearly cost of frequent trading, compare with buy and hold, and save a pre-trade checklist with a turnover budget |
| Inputs | Fictional Tomáš and Jana: 100,000 Kč each, 40 trades a year at 60 Kč; a worked year with 60,000 Kč of sales on a 100,000 Kč average value |
| Assessment | Prediction (40 × 5 × 60 Kč = 12,000 Kč is the only certain number), 300,000 ÷ 200,000 = 150 %, 40 × 60 Kč ÷ 100,000 Kč = 2.4 %, interpretation of the research (gross returns similar, so the gap is costs), one mastery item (what turnover measures), a saved checklist, written reflection with a four-criterion rubric |
| Transfer | Optional Krizový nácvik (`/lab/training`, #139) with no mission check; the Portfolio Lab turnover decision card (#141, fifth trade in 7 days) now links to this lesson instead of 1.1.5 |
| Rewards | Policy v4 applies as written: level B earns XP only (0 Kč). Nothing in the lesson or Lab rewards trades |
| Compatibility | New storage module appended last, so no existing learner's next step changes; appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Deviations from the brief

- **No 5-year free-trading simulation (LAB-04).** The training Lab already lets the learner buy and sell every month for 24 months with the fee schedule, and reports trade count, fees and turnover. The lesson links to it as an optional exercise with a labelled sample analysis. A 60-month scenario and a side-by-side buy-and-hold result are a follow-up.
- **Prerequisite #286 (B.1.1) is not on `main` yet.** The placement lists `first-plan-ips` (also B.1.1's prerequisite) and `costs-spread-and-fees`; add `behaviour-behaviour-gap` when #286 merges. Both PRs create `src/features/lessons/investor-behaviour/` with the same module ID, slug, title and description, so the merge conflict is limited to the manifest, flow and lists.
- **Checklist storage.** The checklist is saved as a `lesson_output` (`checklist` block) required on its step; the Lab does not yet offer it when trading outside the plan (#141 shows its own card). Copying it into the `trade_checklist` artifact is a follow-up.
- **Turnover convention.** The lesson uses sales ÷ average value. The Lab reports buys plus sales over the ending (or current) value, which is higher; the lab bridge says so.

## Sources checked

- [Barber a Odean · Trading Is Hazardous to Your Wealth](https://faculty.haas.berkeley.edu/odean/Papers%20current%20versions/Individual_Investor_Performance_Final.pdf): abstract and section IV, read 2026-10-28. 66,465 households at a large discount broker, 1991–1996. The high-turnover quintile (monthly turnover above 8.8 %) earned a net annualised geometric mean return of 11.4 %, the market 17.9 %. Gross returns across turnover quintiles ranged only from 18.5 % to 18.7 %. Registered as `barber_odean.aktivni` and `barber_odean.trh` (primary, limitations recorded) and shown through tokens.
- [SEC · Request for comment on digital engagement practices](https://www.govinfo.gov/content/pkg/FR-2021-09-01/pdf/2021-18901.pdf): listed as further reading only; the lesson quotes no figures from it.

Tomáš and Jana and all amounts and fees in the examples are invented and labelled „Modelový příklad“ or „Simulace“. The turnover budget (2 off-plan trades a year) is marked as an illustration. No broker, fund or allocation is recommended.

## Validation

`test:lesson-walkthrough` (with `LESSON_IDS=behaviour-overconfidence`) answers every question wrong and then right, checks that Continue stays disabled until the checklist is saved, resumes after a reload, and checks one XP-only receipt. It also checks overflow at 1440/390/320 px and 320 px with 200 % text, plus axe. The all-published personalization fixture saves the checklist before completing the lesson.
