# Issue #477: deterministic Milestone A walkthrough is blocked

Investigated against main `5b7f9d9` on 2026-11-05. This is a blocker report, not completion of [#477](https://github.com/Johnyyy1/Investnik/issues/477).

The issue explicitly requires stopping and reporting any step that cannot be completed honestly. The required deterministic-provider run cannot complete B.1.1, before its final milestone assertion:

1. `milestoneStates` includes published lesson `behaviour-behaviour-gap` in A's scope.
2. That lesson requires mission `behaviour-crises-v1`. The mission requires completed historical windows for 2008, 2020 and 2022, followed by an IPS confirmation/revision.
3. `availableScenarios(backtestHistoryPlans.deterministic)` excludes 2008 because the provider's date range does not cover it. `loadScenarioSeries` refuses that scenario.
4. The available 2020 and 2022 series carry `sample: true`. `completedHistoricalReplays` explicitly rejects sample series, even when every month is complete. Thus zero of the three required historical replays can qualify.

Reproduce without credentials, database writes or a browser:

```sh
npx vitest run src/features/milestones/deterministic-scope.test.ts
```

This test uses the real scope, authored lesson steps, deterministic market service, scenario loader and mission provenance check. Its passing result confirms the blocker; it does **not** prove that a learner achieved A. Existing tests also cover the individual scenario and provenance rules in `src/features/training/scenarios.test.ts` and `src/features/missions/checks.test.ts`.

The current whole-catalog walkthrough bypasses this dependency with `seedBehaviourReplays`. Reusing that seed, relabeling invented prices as historical, omitting B.1.1 from A, or accepting sample evidence would violate the issue's rules. This is distinct from the later model-crisis exercise B10, which does support deterministic data.

## Work left after resolving the blocker

A supported way to replay authoritative historical fixtures reproducibly through the application is needed, or the founder must explicitly revise the requested provider/product contract. No such change is made here. This finding is limited to the deterministic configuration; it does not establish that the live-provider journey is impossible.

The fresh-account browser suite, CI command, successful `submitCapstone` transaction test, achievement scope/idempotency checks, funnel assertion and no-extra-reward assertion remain outstanding. Preserve the issue's no-SQL-seeding rule when continuing. Production criteria, rewards, persistence, providers and lesson content are unchanged.

## Live provider run (2026-11-06)

Following the founder decision of 2026-11-06, `npm run test:milestone-a-live` walks the journey on live FMP data, and `.github/workflows/milestone-a-live.yml` runs it on a schedule and on demand. It still cannot reach Milestone A. This is a product finding, not a test failure:

- **Passes on FMP:** B.1.1. FMP returns complete SPY windows for 2008, 2020 and 2022 (`sample: false`, source „Financial Modeling Prep“), and the server verified `behaviour-crises-v1` through the app. The deterministic blocker above does not apply to the live provider.
- **Blocked on FMP:** 2.5.1 → 2.5.3 → capstone A. FMP search results carry `assetType: null` (`src/features/market-data/fmp/provider.ts`, `normalizeSearchResult`). `searchIpsInstrumentsAction` (`src/features/ips/actions.ts`) keeps only results typed as equity, ETF or bond. The IPS builder therefore offers no concrete instrument, so no IPS can name an ETF. The `ips-etf-purchase-v2` mission in 2.5.3 and the IPS-alignment check of capstone A both need one. The Lab's own search keeps untyped results („Typ se ověřuje“), and the bought trade is typed from metadata (`etf` for SPY). Only the IPS search is affected, in production too.
- **Not observed yet:** live Lab purchases, the capstone checks with FMP valuations, and the rest of the run after 2.5.1. Lab orders need a fresh quote, so they are possible only during regular NYSE hours. The workflow is therefore scheduled at 15:30 UTC on weekdays, not at night.

No criteria, labels, providers or production code were changed to get past this. Fixing the IPS search (for example by resolving the instrument metadata of an untyped result) needs a separate decision.
