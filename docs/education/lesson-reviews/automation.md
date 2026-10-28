# 2.5.2 · Automatizace: pravidelná investice jako závazek předem

Issue: [#196](https://github.com/Johnyyy1/Investnik/issues/196). Editorial/content and source check: 2026-10-27. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced; two research values are added to the fact registry.

| Brief | Implementation |
| --- | --- |
| Identity | `first-plan-automation`, existing storage module `module-first-plan` (slug `first-plan`), `/learn/first-plan/automation` (as proposed in the brief) |
| Placement | L2, module 2.5, code 2.5.2, required; prerequisite `first-plan-ips` (#195); new skill `automation` |
| Outcome | Set up a regular investment from the IPS (amount, day after payday, instrument), know what to check at the broker, and keep contributing in a fall |
| Inputs | Fictional Michal: 2,500 Kč a month, payday on the 15th, standing order on the 16th, savings-plan purchase on the 20th; a 40 Kč minimum fee as an example (1.6 % of each purchase) |
| Assessment | Prediction (waiting for a dip leaves the money idle), faded example (purchase after the money arrives), 2,500 Kč × 36 = 90,000 Kč, decision after an 8 % fall (continue), two mastery items (why automation beats a resolution; regularity does not prevent losses), server-verified Lab mission, written reflection with a four-criterion rubric |
| Transfer | Krizový nácvik (`/lab/training`, #139) takes the monthly contribution from the saved IPS; mission `training-contributions-v1` |
| Compatibility | New lesson appended after 2.5.1 in the existing storage module (no learner's next step changes before 2.5.1 is completed) and appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged |

## Lab mission

The brief asks for a mission verified by the server from append-only data. The isolated training Lab (#139) already adds the IPS contribution every simulated month and stores each action append-only, so the lesson uses it instead of a new simulation. A new versioned check `training-contributions-v1` replays the learner's training sessions and counts months in which the contribution arrived and a purchase happened in the same month; twelve in one session complete the mission. The client sends nothing but the request, so a forged count is refused. Returns, the scenario outcome, sales and a month-0 lump sum do not count. The check writes only its `mission_attempt` evidence: no training action, portfolio row, Practice Capital, XP or unlock.

The training Lab has one invested index and cash, so "nákup podle cílového mixu" is reduced to "a purchase in the contribution month". The learner makes the purchase (as the savings plan would); the Lab does not buy automatically.

## Deviations from the brief

- **12 simulated months, not 24.** The exercise section of the brief asks for 12; the content section mentions 24. A training session lasts 24 months, so a learner can continue.
- **"Srovnání s jednorázovou investicí řeší 3.5.1"** is described without naming the unpublished lesson.
- **DIW source** (financial education and behaviour) is not quoted: the lesson makes no claim about the effect of financial education.
- **Spaced thousands.** The shared numeric parser (`parseNumericAnswer`) does not accept `90 000`; the learner must type `90000`. This applies to every numeric lesson and is left as a follow-up.

## Sources checked

- [Benartzi a Thaler · Save More Tomorrow](https://econpapers.repec.org/paper/febnatura/00337.htm): the abstract states that the average saving rate of participants in the first implementation rose from 3.5 % to 13.6 % over 40 months. Registered as `smart.mira_pred` and `smart.mira_po` (verified 2026-10-27, research limitations recorded) and shown through tokens.

Michal, Petra and Jan and all days, amounts and fees in the examples are invented and labelled „Modelový příklad“. No broker, fund or allocation is recommended.

## Validation

`test:lesson-walkthrough` walks the lesson and drives the mission through the real Krizový nácvik UI: Continue stays disabled without a session and after five counted months (one month without a purchase does not count), and is enabled after twelve. `test:missions-persistence` covers the check against the stored log: no session, 11 of 12, a forged client count, concurrent verification storing one evidence row, and no writes outside `mission_attempt`.
