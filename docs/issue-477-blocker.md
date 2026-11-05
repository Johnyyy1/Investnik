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
