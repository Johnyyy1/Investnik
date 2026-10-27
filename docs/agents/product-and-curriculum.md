# Product and curriculum

Required supporting instructions for [AGENTS.md](../../AGENTS.md). Read this file in full when the root reading table applies, before editing. Original section numbers are retained for traceability. Bare source paths and commands are relative to the repository root; Markdown links are relative to this document.

## 2. Product north star

The primary product promise is milestone A: "Připraven/a začít". A learner can assess financial readiness, verify and compare brokers, understand total costs and Czech tax obligations, and write an investment policy statement (IPS) tested in a simulated crisis.

The target learner is a beginning independent investor who wants to start or has just started and wants to avoid major mistakes. This describes their situation, not their knowledge level. Prioritize financial readiness, costs, taxes, planning, and behavior. Expand advanced tracks only with demonstrated demand and an explicit founder decision; completing the practical path does not automatically authorize L4–L6 or optional-topic expansion.

The core learning loop is:

LEARN
→ MAKE A DECISION
→ PREDICT
→ TEST / REVEAL
→ SEE CONSEQUENCES
→ UNDERSTAND WHY
→ SET A PERSONAL SAFEGUARD / UPDATE THE PLAN
→ RETRY / CONTINUE

The major product areas are:

Learn
→ Practice Capital
→ Portfolio Lab
→ Scenario Challenges
→ Backtesting Lab

These should feel like one connected product, not separate tools.

Curriculum architecture

The target is seven levels and one continuous behavioral strand:

| Level | Learner-facing name | Focus |
| --- | --- | --- |
| 0 | Než začneš investovat | Budget, expensive debt, reserve, goals, retirement saving, fraud prevention |
| 1 | Jak investice fungují | Existing Foundations plus fund types and active vs passive investing |
| 2 | Investování v Česku v praxi | Broker/account, total costs, EU products and ETF selection, Czech taxes, IPS and a first practice purchase |
| 3 | Portfolio: stavba, údržba, měření | Returns, risk, diversification, allocation, contributions and rebalancing |
| 4 | Analýza akcií | Base rates before stock picking, business analysis, financial statements, ratios and their limitations |
| 5 | Oceňování a investiční teze | Valuation, scenarios, reverse DCF, thesis, pre-mortem and review |
| 6 | Kvantitativní metody | Return mathematics, factors, risk models, backtest bias and uncertainty |
| B | Investor v zrcadle | Behavioral practice woven through lessons and decisions in Lab |

Optional modules on leverage/derivatives, crypto, and critical examination of technical analysis teach risks and limitations. They do not expand the persistent portfolio's trading permissions.

Milestones:

- A — "Připraven/a začít": readiness outcomes from levels 0–2, behavioral core B1–B4 and B9, IPS, a practice purchase, and the B10 crisis exercise. Level 0 is recommended and can be tested out of; its financial check-up is not pass/fail.
- B — "Samostatný pasivní investor": A + level 3 + the full behavioral strand and portfolio-maintenance capstone.
- C — "Samostatný analytik akcií": B + levels 4–5 and a documented analysis/valuation/thesis capstone.
- D — "Kvantitativní investor": B + level 6. C is not a prerequisite for D.

Do not mark milestone A complete before its practical and crisis outcomes exist, even if foundational content ships in an earlier phase.

Curriculum continuity

Preserve every existing lesson and stable internal ID, saved progress, original completion timestamps, reward receipts, and recorded Lab access. Display codes such as 3.1.1 are not persistence identities. The source brief describes an earlier product inventory; verify current published/authored content in code rather than treating historical counts as a live inventory.

The curriculum registry in src/features/learning/curriculum.ts separates level, pedagogical module, order, prerequisites, skill tags, and required/optional status from stable identity. Reuse this registry and preserve existing routes or provide compatibility redirects when moving lessons.

Map Foundations to level 1; ordinary Returns to 3.1; volatility to 3.2; correlation/diversification to 3.3; log returns to 6.1; real-data correlation to 6.2; correlation vs causation to B8. Do not delete advanced lessons to simplify the beginner path.

Completed lessons count in their new location, but do not imply completion of newly added material. An expanded module can become in progress while its old lesson completions remain intact. Any mastery state is separate from lifetime completion and reward eligibility.

Curriculum placement must not accidentally alter rewards or unlock prerequisites. Policy v4 resolves reward eligibility from the registered curriculum level, independently of the storage module. Preserve its eligibility semantics or change them through a deliberate versioned domain migration. Adding new level-1 lessons must not expand the frozen seven-lesson Lab prerequisite, relock existing learners, or repeat their unlock grant.

Strategy phases and gates

| Phase | Target date | Evidence required to advance |
| --- | --- | --- |
| S0 — Foundations and measurement | 2026-11-30 | 3–5 broker/bank interviews establishing what they would pay for and by which metric |
| S1 — Milestone A | 2027-02-28 | 1,000 registrations and ≥30% completing milestone A |
| S2 — Partner pilot | 2027-06-30 | One paid pilot with measured account activation |
| S3 — Scaling and Milestone B | 2027-10-31 | A repeat contract and data on conversion to an account |

These are planning targets and evidence gates, not automatic date-based transitions. S0–S3 are business/delivery phases; A–D are learner milestones. Inspect completed work first and implement only the scoped remaining work. Reuse the curriculum registry, learner artifacts and Portfolio Lab costs.

Issues labeled `later` are frozen: do not start or reopen them without an explicit founder decision. This includes stock analysis, valuation, quant, optional topics and CFA/PFP expansion. Completed dependencies, spare capacity, old roadmap ordering or an approved design do not authorize this work. Preserve existing advanced content, stable IDs, progress, receipts and access. Complete explicitly requested maintenance or fixes without expanding their scope.

Every module ends in a usable learner artifact, such as a financial check-up, goals map, cost comparison, broker/ETF checklist, IPS or crisis-plan revision. Mixed checkpoints support this output; they do not replace it. Reuse versioned learner artifacts and preserve historical completion/reward contracts. Lab assesses explainable process criteria, not investment return; waiting or keeping the plan can be successful.

Product boundaries and partner direction

Provide education and support for the learner's own decision process. Never generate personalized recommendations of specific instruments or instructions to buy/sell them. The consumer version stays neutral: no affiliate rankings of brokers or ETFs, and no commercial relationship determining educational comparisons.

The business direction is a free consumer core and licenses for brokers/banks using the same education engine. S2 targets co-branding, partner-selected paths, a deep-link back to the partner and an aggregate results dashboard ([#358](https://github.com/Johnyyy1/Investnik/issues/358), [#359](https://github.com/Johnyyy1/Investnik/issues/359)). Separate learner outcomes (milestones, mastery, IPS and crisis behavior) from partner outcomes (clicks and partner-supplied account/deposit/investment activation). Share aggregate anonymized results; no personal data without consent. Partner CTAs preserve the instrument-recommendation boundary. Full white-label, SSO/SAML, RBAC, SDK and mobile embed require concrete partner demand; this direction is not authorization to build them now.

Success measures

The target north star is the share of milestone-A learners who follow their own IPS during a simulated crisis, supported by retained skills at "Zvládnuté" or above. Assess knowledge, delayed retention, rubric-based outputs, and behavior in simulation. Time in app, streak length, trade count, and investment return are not success measures.

Do not infer real-money readiness or a causal education effect from simulated returns. Real-world follow-up is voluntary and opt-in. Review schedules, mastery thresholds, and experiment designs in the brief are design proposals to validate, not research-established constants.

Product positioning

Investník is:

educational;

interactive;

beginner-friendly;

data-aware;

grounded in Czech investing practice;

focused on planning, long-term habits, and explainable decisions;

progressively more analytical through optional advanced tracks.

Investník is not:

a real broker;

a real-money trading platform;

a day-trading simulator;

an investment-advice engine;

a crypto-style gamification product;

a generic SaaS dashboard.
