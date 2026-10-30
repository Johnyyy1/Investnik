# B.1.1 · Mezera chování

Issue: [#286](https://github.com/Johnyyy1/Investnik/issues/286). Content/source check: 2026-10-28. Owner: curriculum maintainer; research facts: Redakce — výzkum. This is an editorial implementation review, not a tax-adviser approval. The lesson introduces no tax or regulatory rule.

| Brief | Implementation |
| --- | --- |
| Identity | `behaviour-behaviour-gap`, storage module `module-investor-behaviour`, `/learn/investor-behaviour/behaviour-gap` |
| Placement | Required B.1.1; prerequisite `first-plan-ips`; dedicated `behaviour-gap` skill with two retrieval items |
| Outcome | Interpret a comparable MWR/TWR difference, inspect decisions against the IPS, and save a concrete safeguard |
| Experience | Existing isolated training Lab: historical 2008, 2020 and 2022 windows, 24 simulated months each; buy, sell or wait; predictions are self-prompts before revealing the next month |
| Assessment | Faded signed difference, interpretation, calculation from fixed-edition research tokens, two retrieval questions, saved IPS and reflection rubric |
| Transfer | Required mission `behaviour-crises-v1`: three completed historical windows plus a complete IPS saved after their last action. Confirmation without changing allocation or contribution is valid |
| Compatibility | New storage module appended, new published contract appended. Existing identities, routes, cursors, completion times, receipts and Lab prerequisites stay intact. Current v4 B reward is 60 XP and zero capital |

## Conventions and changes from the issue brief

- **25 minutes**, including approximately 15 minutes in the Lab. Three required 24-month replays plus interpretation and an IPS confirmation exceed the brief's 15-minute estimate.
- **Contributions follow the saved IPS.** The lesson's fictional example uses 2,500 Kč. It does not overwrite a learner's contribution or create a bank standing order. The reference also uses that same contribution.
- **Same period and return basis.** The result adds the TWR of a hold-and-contribute reference and signed `learner MWR − reference TWR` in percentage points. Both are annualized after a year; shorter periods use cumulative returns. The reference invests the IPS invested share of initial capital and each contribution, never sells, uses the same frozen series and fee profile, and caps purchases to available cash including fees. The final contribution stays in cash, as in the learner's session. Differences subtract the displayed rounded basis-point values. Existing learner TWR is still shown separately.
- **No automatic behavioral diagnosis.** A negative difference can reflect contribution timing, cash exposure, fees and decisions; the interpretation answer in the brief is corrected accordingly. Plan adherence and waiting are valid regardless of return. NQ-31/32 remain process-first evaluation and reveal on request.
- **Neutral scenario headlines describe only the newly revealed monthly price direction.** They are original text, explicitly not quotations or recreated news archives, and reveal no future observations.
- **Real historical coverage is required.** Missing, partial, sample or model series cannot satisfy the mission. The default deterministic provider has no 2008 window and cannot complete it. The UI explains this and retains progress; FMP historical availability remains the existing provider boundary. No fixtures are passed off as market history in production.
- **No new lesson renderer.** Reuses `labMission`, `ips-builder`, existing questions, `writtenReflection` and summary. The lesson keeps the IPS in the existing versioned builder. Its short reflection is temporary, while the actual safeguard is persisted in the IPS.

## Research evidence

The article linked by the brief returned 403. The original [Morningstar · Mind the Gap 2025 report](https://marketing.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf) was accessible and checked on 2026-10-28 (pages 1–5, 18–21). The lesson explicitly studies the 2025 edition and its 2015–2024 sample, rather than claiming these are the latest estimates. All six figures are dated registry references. The earlier unverified `morningstar.gap` version remains available through 2026-10-27.

The report itself cautions that regular contributions and rebalancing can produce a gap. The US aggregate does not establish an individual's behavioral mistake, a causal effect of rebalancing or an effect of this product. Lab price returns without dividends or FX are not the study's fund total returns.

## Implementation and validation

The mission reads server-owned replay logs and the latest IPS under the existing user lock, storing one immutable evidence row. It accepts waiting through an entire scenario and never writes trades, training actions, awards or balances. Lesson completion separately issues its one normal XP-only receipt. No schema migration, portfolio accounting change or reward-policy change is needed.

Adding the research registry crossed the existing 340 KB initial lesson-JS budget by 0.3 KB. The dated-fact components now use the existing lazy component loader. The measured production result is **324.5 KB gzip**, and no authored lesson prose occurs in client JS. Their renderer test preloads the lazy component before synchronous markup inspection.

Automated coverage includes exact-money reference arithmetic, common return periods and missing-period handling, no future price leakage, full-window/sample/partial rejection, owner isolation, forged input/final-cursor rejection, concurrent verification and XP-only completion, preserved portfolio/reward data, curriculum seeding/compatibility, and lesson browser traversal. Browser persistence fixtures are explicitly synthetic QA data; they do not validate live FMP prices. Live provider calls, other browser engines and physical-device/screen-reader testing remain outside this review.

Screenshots for every step at 390 and 1440 px are in [behaviour-gap-evidence](behaviour-gap-evidence/README.md), with the Lab comparison and the shared K/F/G/M layouts checked against `docs/design/lesson-steps`. The walkthrough checks 320/375/390/768/1024/1440 px, 200% text, wrong answer → feedback → retry, saved resume, server-gated continuation, completion and one receipt, plus serious/critical axe findings. Existing Learn/Progress suites cover 320–1440 px, keyboard/focus and reduced motion.
