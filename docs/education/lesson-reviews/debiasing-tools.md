# B.1.9 · Nástroje proti vlastním chybám

Issue: [#294](https://github.com/Johnyyy1/Investnik/issues/294). Editorial/content and source check: 2026-10-31. Owner: curriculum maintainer. No statutory values, tax rules, research figures or market observations are introduced; the fact registry is unchanged.

| Brief | Implementation |
| --- | --- |
| Identity | `behaviour-debiasing-tools`, storage module `module-investor-behaviour` (slug `investor-behaviour`), `/learn/investor-behaviour/debiasing-tools` (as proposed in the brief) |
| Placement | Level B, module B.1, code B.1.9, required; prerequisites `behaviour-overconfidence` (#287), `behaviour-disposition-effect` (#288), `behaviour-loss-aversion` (#289); new skill `debiasing-safeguards` |
| Outcome | Name six safeguards and the mistake each one addresses, run a pre-mortem of one's own plan, save one's own safeguard set |
| Inputs | Fictional Jana and Petr; model amounts only (3 000 Kč monthly, "80 %" rise of a friend's stock, 30-day waiting period, 2 trades a year) |
| Assessment | Map (worked example, 6 rows), three graded matching questions (overconfidence, FOMO, stories), one mastery item ("Která pojistka chrání před dispozičním efektem?"), saved pre-mortem (`rubricSelfAssessment`, three criteria × four levels) |
| Transfer | Saved safeguard set (`checklist`, block `safeguard-set`) shown in Settings → Moje data and on the Lab decision-time cards (#141); IPS update via the existing `ips-builder` step |
| Rewards | Policy v4 applies as written: level B earns XP only (0 Kč) |
| Compatibility | Appended last in the storage module; appended published contract; existing IDs, saved steps, grading, receipts, unlock requirements and timestamps unchanged |

## How the saved set reaches the Lab

The checklist stores only the checked item IDs (`lesson_output`, `sourceLessonId = behaviour-debiasing-tools`, `blockId = safeguard-set`). `safeguard-set.ts` holds the six rules (trigger, action, card kinds). `loadTradeDecisionCards` reads the learner's current `lesson_output` documents and appends the checked rules to any `safeguards` document (#127). Each lesson rule is shown only on the card kinds it belongs to; own `safeguards` rules stay on every card. Item IDs are part of saved outputs and must not be renamed or reused.

## Deviations from the brief

- **No PLATFORM-10 type.** "Sestavení vlastní sady pojistek" uses the existing `checklist` block (#121) with consent and saving (#127) instead of a new builder. The learner chooses from the six authored safeguards; free-text rules are not written here. The existing `safeguards` artifact kind has no editor yet and stays supported on the cards.
- **Pre-mortem uses `rubricSelfAssessment`** (#121), the saved written output with a four-level self-assessment, instead of a new PLATFORM-04 type. Up to 2 000 characters are stored through #127, not through the lesson cursor.
- **IPS update.** The step requires a saved complete IPS (`investment_plan`, any lesson). A plan saved earlier satisfies it; the server cannot tell whether a new version was written. The learner is asked to save one.
- **Research is qualitative.** Klein's premortem and the PHF tool are described without figures; the "prospective hindsight" effect size cited elsewhere would need a verified registry fact.
- **Stories / FOMO.** B.1.5 (#290) is not published yet; FOMO is explained briefly in the map. B.1.8 is the existing `correlation-not-causation` lesson.
- **Backtest card.** The `mechanism` rule also belongs to the overfitting card, but the Backtesting Lab does not load saved safeguards today; on the trade cards it appears with the outside-IPS card.

## Sources checked

- [Gary Klein · Performing a Project Premortem](https://hbr.org/2007/09/performing-a-project-premortem) (HBR, 2007): summary read 2026-10-31. Team assumes the project failed and lists plausible reasons; no figures used.
- [Armbruster, Moran & Shirley · Pre-Mortem Analysis](https://archive.phf.org/resourcestools/Documents/Pre_Mortem_Analysis.pdf) (Public Health Foundation, 2014): read 2026-10-31. Steps: imagine a fiasco, list reasons, revisit the plan for the top two or three concerns, review periodically; attributes the method to Klein. Expert review of the wording is still open.
