# B.1.10 · Krizový nácvik: −30 % s vlastním plánem

Issue: [#295](https://github.com/Johnyyy1/Investnik/issues/295). Editorial/content check: 2026-10-31. Owner: curriculum maintainer. No statutory values, tax rules, research figures or market observations are introduced; the fact registry is unchanged.

| Brief | Implementation |
| --- | --- |
| Identity | `behaviour-crisis-drill`, storage module `module-investor-behaviour` (slug `investor-behaviour`), `/learn/investor-behaviour/crisis-drill` (as proposed in the brief) |
| Placement | Level B, module B.1, code B.1.10 (already listed in milestone A), required; prerequisite `first-plan-ips` (2.5.1, #195); new skill `crisis-plan-adherence` |
| Outcome | Go through a −30 % crisis with the learner's own IPS, compare the decisions with its rules, revise the IPS from the experience |
| Inputs | The existing isolated Krizový nácvik (#139), scenario `model-crisis-v1`: 24 simulated months, −30 % in six months, back to the start after ten more, slow rise. The session freezes the latest saved IPS (contribution, invested target, rebalancing, drawdown rule) |
| Assessment | Prediction question (process vs outcome), persona decision under pressure (friend's message, month 5), verified Lab mission, worked + faded example of the allocation deviation, interpretation question, one mastery item on the band rule, optional IPS revision, optional reflection checklist, written reflection |
| Transfer | `labMission` with `missionId: "crisis-drill-model-v1"` on `/lab/training`; IPS revision via the existing `ips-builder` step |
| Rewards | Policy v4 applies as written: level B earns XP only (0 Kč). The mission awards nothing |
| Compatibility | New lesson appended to the storage module and to `published-lessons-v1.json`; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps unchanged |

## Mission `crisis-drill-model-v1` (check `crisis-drill-finished-v1`)

The server reads only the learner's append-only training log. The mission completes on the latest **finished** session of `model-crisis-v1` whose frozen series equals the deterministic model series exactly. Breaking the IPS does not fail the mission (the brief: not keeping the plan is a learning experience; Capstone A judges it with its rubric). The evidence records session ID, IPS version, months, sells outside the plan, the end allocation status vs the band, and the number of contribution months, so the north-star share "kept the IPS in the drill" can be measured from stored data. Nothing is written to training or to the personal portfolio; Capstone A's existing `crisis-plan-kept-v1` check keeps reading the latest drill.

## Deviations from the brief

- **24 months, not 12–18.** The drill reuses the existing model scenario of #139 instead of a second series; its length and path are already used by Capstone A and the landing illustration.
- **Model scenario only.** The historical crises 2008/2020/2022 are covered by B.1.1; this lesson uses the labelled deterministic model ("Simulace · Deterministická ukázková data") so the drill works without market data.
- **News and "a friend's voice" live in the lesson, not in the Lab.** The Lab shows its existing neutral monthly headline; the pressure is a `personaDecision` in month 5 with a fictional friend's message. Adding pressure messages to the Lab is a separate Lab change.
- **Reflection (PLATFORM-04) as MVP.** Prepared reflections are an optional `checklist` (saved with consent, never blocking); the free text is the existing unsaved `writtenReflection`. A stored, required reflection would need `rubricSelfAssessment`, which guests cannot save; left as a follow-up.
- **IPS revision is optional.** The step requires a saved IPS (always present after the drill) and lets the learner confirm or save a new version; it does not force a new revision.
- **Prerequisite #294 (B.1.9) is not wired yet.** That lesson is in open PR #452 and not on `main`; add `behaviour-debiasing…` (its final ID) as a prerequisite once it merges.

## Sources checked

- [Morningstar · Mind the Gap](https://www.morningstar.com/financial-advisors/volatility-bedevils-fund-investors): cited qualitatively for the link between volatility and investors' timing; no figures quoted (B.1.1 carries the dated research facts).
- University of Brighton research on gamification and behavioural biases (listed in the brief): not cited in learner copy; expert review of the wording is still open.

## Validation

Unit tests recompute the model-crisis numbers, the worked/faded deviations and the band rule; mission tests cover kept/broken plans, unfinished, other-scenario, forged and historical series. `test:lesson-walkthrough` with `LESSON_IDS=behaviour-crisis-drill` drives the real Lab: no drill → unfinished drill → a sell inside the band in month 6 → finished; the mission completes with one sell outside the plan recorded, the personal portfolio has no new trade, and the lesson completes with one XP-only receipt.
