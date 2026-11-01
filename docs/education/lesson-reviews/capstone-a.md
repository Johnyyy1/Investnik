# 2.5.4 · Závěrečný projekt A: plán, nákup a krizový nácvik

Issue: [#198](https://github.com/Johnyyy1/Investnik/issues/198). Editorial/content check: 2026-11-01. Owner: curriculum maintainer. No statutory values, tax rules, research figures or market observations are introduced; the fact registry is unchanged. Expert review of the wording is still open.

| Brief | Implementation |
| --- | --- |
| Identity | `first-plan-capstone-a`, storage module `module-first-plan` (slug `first-plan`), `/learn/first-plan/capstone-a`, as reserved by `capstone-a-v1` (#126) |
| Placement | Level 2, module 2.5, code 2.5.4, required; prerequisites `first-plan-automation` (2.5.2) and `first-plan-first-purchase` (2.5.3); skills `investment-policy`, `plan-costs`, `concentration`, `crisis-plan-adherence` (metadata only, no new skill items) |
| Outcome | Bring the saved IPS, the Lab practice portfolio, annual plan costs and a finished crisis drill together and submit the capstone-A self-assessment against the published four-level rubric |
| Inputs | Fictional IPS/portfolio weights, a fictional tariff and TER (Modelový příklad); the learner's own saved IPS, Lab portfolio and latest Krizový nácvik for the automatic checks |
| Assessment | Prediction (process vs return), worked + faded IPS deviation, `documentTap` mastery on the alignment/diversification thresholds, worked + independent annual cost calculation, verified crisis mission, mastery item on the rubric's cap rule, `rubricSelfAssessment` with reflection |
| Transfer | IPS review via `ips-builder`, Portfolio Lab process feedback (`labBridge`), `labMission` `capstone-a-crisis-v1` on `/lab/training`, capstone submission, next step level 3 |
| Rewards | Policy v4 as written: level 2 earns the standard lesson capital and XP. The capstone submission itself awards nothing; process bonuses stay deferred (product-reset) |
| Compatibility | New lesson appended to `module-first-plan` and `published-lessons-v1.json`; no published step, ID, grade, receipt, unlock or timestamp changes |

## Capstone submission

The rubric block's criteria are generated from `capstone-a-v1`, so the saved output and the capstone schema accept the same payload. `capstone-output.ts` binds this lesson/block to the capstone; `saveOwnedArtifact` (behind the `saveArtifact` action) submits the ratings and reflection through the existing `submitCapstone` before saving the output under the same retry ID. Server-side evidence (Lab allocation vs IPS, diversification, latest crisis drill) is frozen in the submission. Continuing requires the submission, never a passing level (NQ-33). A later submission appends a version; the first passing one counts for milestone A.

## Deviations from the brief

- **Prerequisite B.1.10 is not listed.** `behaviour-crisis-drill` is stored after `module-first-plan`, and placements may only require earlier lessons. The step's verified mission requires a finished model drill instead.
- **HHI is context, not a criterion.** The brief says the server compares the number of positions and HHI; the registered `diversified-core-v1` check uses a fund core and the 10 % single-stock cap. The lesson points to HHI in Lab process feedback without a threshold.
- **Verdict display.** The lesson explains the rule and sends the learner to the milestone in Učení/Pokrok, where the capstone requirement shows *zatím ne* or *splněno*. Per-criterion feedback after submission (design U) is a follow-up product screen.
- **Costs are self-assessed.** No artifact stores an all-in annual cost calculation yet (docs/milestones.md); the lesson practises the calculation.
- **Written output (PLATFORM-04/09).** The reflection is the text of the saved `rubricSelfAssessment`, so guests cannot submit; the IPS and the Lab already require an account.

## Validation

Unit tests recompute every deviation and cost, check the documentTap rows against the real `ipsAlignmentCheck`/`diversifiedCoreCheck`, the mastery item against `capstoneOutcome`, the rubric/registry binding and the action's submit-then-save order. Persistence and browser checks are listed in the PR.
