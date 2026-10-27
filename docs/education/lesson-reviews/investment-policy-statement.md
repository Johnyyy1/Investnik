# 2.5.1 · Investiční plán (IPS)

Issue: [#195](https://github.com/Johnyyy1/Investnik/issues/195). Editorial/content and source check: 2026-10-27. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `first-plan-ips`, new storage module `module-first-plan` (slug `first-plan`), `/learn/first-plan/investment-policy-statement` (as proposed in the brief) |
| Placement | L2, module 2.5, code 2.5.1, required; prerequisites `before-investing-goals` (#151) and `costs-broker-comparison` (#175); new skill `investment-policy` |
| Outcome | Write a complete IPS with all nine sections and concrete, verifiable rules, including the −30 % rule and when the plan may change |
| Inputs | Fictional investor Tereza: retirement in 30 years, flat in 12 years, reserve done, no expensive debt, 75 % global equity / 15 % bonds / 10 % cash, 3,000 Kč on the 5th, ±5 p. b. band, annual review in January |
| Assessment | Prediction (decide in advance), faded allocation (cash 10 % so the plan totals 100 %), good-rule choice, equity share after a 30 % fall (67.7 % ± 0.06, below the 70 % band edge), two mastery items (missing maintenance rules; why decide in advance), saved complete IPS, written reflection with the brief's four-criterion rubric |
| Transfer | The existing Lab builder at `/lab/plan`; process feedback in Portfolio Lab and the training exercise already read the latest IPS |
| Compatibility | New lesson, new storage module last in storage order (existing learners' next step does not change) and appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Content decisions

The plan itself is written in the existing IPS builder from #128 (schema v2), not in a second copy of it inside the lesson. The approved product design (`docs/design/product-screens.md`, screen S, NQ-29–30) says the lesson leads into the same Lab tool. The lesson's `ips-builder` figure therefore only reads the learner's current plan, links to the builder in a new tab and rechecks on return. The step uses the existing `requiredArtifact` mechanism (`investment_plan`, any source), so the server checks the plan on Continue and again on completion. `hasValidArtifact` now accepts only a schema-v2 plan as complete: the original v1 shape has no instruments, platform, contribution, change rule or signature. It stays valid history and can be completed as a new version.

The unit test recomputes the faded allocation against `ipsSchema` (the same 100 % rule the builder enforces) and the post-fall equity share from the worked inputs.

## Deviations from the brief

- **Morningstar figures (7.0 % vs 8.2 %) are not quoted.** The fact `morningstar.gap` in the registry is unverified (the source returned 403), and a published lesson may not use unverified facts. The lesson describes the finding qualitatively, labels it as US aggregate data and links the source. Quote the numbers once the fact is verified.
- **Rubric self-assessment is the existing `writtenReflection` checklist (MVP named in the brief), not a saved `rubricSelfAssessment`.** The walkthrough harness has no driver for a saved rubric yet; adding a second required save would add scope without changing what the learner does.
- **No in-lesson copy of the builder.** See above; a second builder would duplicate validation, versioning and consent of #128.
- **Saving the target allocation as a target mix (#144) and IPS adherence in the process score (#140)** already exist in the Lab; the lesson only points to them.

## Sources checked

- [Morningstar · Mind the Gap](https://www.morningstar.com/financial-advisors/volatility-bedevils-fund-investors) (qualitative claim only).
- [Bogleheads · Investment policy statement](https://www.bogleheads.org/wiki/Investment_policy_statement): structure of an IPS.
- [Thaler & Benartzi · Save More Tomorrow](https://econpapers.repec.org/paper/febnatura/00337.htm): precommitment.

Tereza and her plan are invented and visibly labelled „Modelový příklad“. No allocation, fund or broker is recommended.

## Validation

`test:lesson-walkthrough` includes this lesson automatically and now drives the IPS step: Continue stays disabled without a plan and with an original v1 plan, and is enabled after a complete plan is stored and rechecked. `test:artifacts-persistence` checks that a v1 plan does not satisfy the requirement and a v2 plan does.
