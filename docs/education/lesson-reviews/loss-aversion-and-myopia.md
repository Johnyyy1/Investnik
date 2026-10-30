# B.1.4 · Averze ke ztrátě a krátkozrakost

Issue: [#289](https://github.com/Johnyyy1/Investnik/issues/289). Editorial/content and source check: 2026-10-30. Owner: curriculum maintainer. No statutory values, tax rules, research figures or market observations are introduced; the fact registry is unchanged.

| Brief | Implementation |
| --- | --- |
| Identity | `behaviour-loss-aversion`, storage module `module-investor-behaviour` (slug `investor-behaviour`), `/learn/investor-behaviour/loss-aversion-and-myopia` (as proposed in the brief) |
| Placement | Level B, module B.1, code B.1.4, required; prerequisite `behaviour-behaviour-gap` (#286); new skill `myopic-loss-aversion` |
| Outcome | Explain loss aversion and myopic loss aversion, explain why frequent checking raises perceived risk, set a review frequency in the IPS |
| Inputs | Fictional Tomáš chooses a stock/bond mix for 100,000 Kč over 10 years. One deterministic simulated path (`myopia-model.ts`), shown as daily changes and then as yearly results |
| Assessment | Two ungraded choices (daily view, yearly view) with identical outcome rows, a worked example (loss days vs loss years of the 80/20 mix), interpretation question, probability question, one mastery item, a saved IPS (any version with all sections), written reflection with a three-criterion rubric |
| Transfer | IPS field „Jak často portfolio zkontroluji“ via the existing `ips-builder` step; `labBridge` to the existing 1M–Max period selector of the instrument chart |
| Rewards | Policy v4 applies as written: level B earns XP only (0 Kč) |
| Compatibility | Appended last in the storage module; appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps unchanged |

## Deviations from the brief

- **No `myopia-experiment` figure and no PLATFORM-04 type.** The brief allows an MVP with existing types until the experiment type exists. The experiment is two `personaDecision` steps over the same series; rows are computed on the server from the model and unit-tested. The learner's two choices are not stored or compared, so "measure the difference" is left to the learner and the follow-up step type. Adding the type later needs no change of lesson ID.
- **Simulation instead of a historical series.** The lesson states no historical share of negative days or years. The only numbers are counted from the stated simulated series (seed 1, 10 × 252 days, stocks 7 %/16 %, bonds 2 %/4 %, daily rebalanced, no costs), labelled „Simulace · Deterministická ukázková data“. The probability question about a real index is worded without a figure, as the brief allows. A test checks the counts against an independent recount and that the historical-claim blocks contain no percentages.
- **"Roughly twice" is not stated.** Loss aversion is described qualitatively (losses hurt more than equal gains please). A coefficient would need a verified research fact in the registry.
- **Safeguard = saved IPS.** The review frequency is a required IPS field (`checkFrequency`: monthly/quarterly/annually), so the step requires a saved complete IPS (`investment_plan`, any lesson) and asks the learner to check or change the field. A plan saved earlier (e.g. in 2.5.1) satisfies the step; the server cannot tell whether the learner looked at the field. Monthly stays allowed; the lesson recommends, it does not force.
- **Default chart period (#140)** is a product decision and is not changed.

## Sources checked

- [Thaler, Tversky, Kahneman & Schwartz · The Effect of Myopia and Loss Aversion on Risk Taking: An Experimental Test](https://www.casact.org/abstract/effect-myopia-and-loss-aversion-risk-taking-experimental-test) (QJE 1997): abstract read 2026-10-30. Less frequent evaluation → more risk accepted; most frequent feedback → least risk and least money earned.
- [Benartzi & Thaler · Myopic Loss Aversion and the Equity Premium Puzzle](https://doi.org/10.2307/2118511) (QJE 1995) and [Kahneman & Tversky · Prospect Theory](https://doi.org/10.2307/1914185) (Econometrica 1979): cited for the concepts only; the lesson quotes no figures from them. Expert review of the wording is still open.

## Validation

`test:lesson-walkthrough` with `LESSON_IDS=behaviour-loss-aversion` (no saved plan: Continue stays disabled until a complete IPS is stored) and with `first-plan-ips,behaviour-disposition-effect,behaviour-loss-aversion` (plan saved earlier: the step shows it and Continue is enabled). Both answer every question wrong then right, resume, complete with one XP-only receipt, and check 1440/390/320 px and axe.
