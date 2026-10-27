<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Investník

Project: Investník

Investník is an interactive investing-education product built around the principle:

Learn investing by doing.

The product prepares people to start investing and maintain a plan: financial readiness, practical Czech investing workflows, costs, taxes, and behavior come before advanced analysis. Concepts and quantitative tools serve decisions. Investník remains educational, without pretending to be a real broker or giving investment advice.

This file defines how coding agents should work in this repository.

Before starting any implementation, ensure this task runs in an isolated Git worktree. If the current session is not isolated, create and switch to a dedicated worktree when supported. Never modify the shared main checkout. Read [WORKTREES.md](WORKTREES.md) in full before any implementation or PR preparation. One issue = one isolated checkout, one branch, one PR. Never edit a checkout concurrently with another agent, switch its branch, or remove another agent’s worktree. Markdown instructions do not create worktrees. If the client cannot create or enter an isolated checkout, preserve the current directory and all uncommitted changes and request a worktree-mode restart before editing. An already isolated cloud checkout is acceptable.

The product direction adopted on 2026-10-21 is recorded in [docs/product-direction.md](docs/product-direction.md). Read it before changing curriculum, learning progression, Lab behavior, rewards, or product priorities. It defines the target direction; inspect code and [docs/product-reset.md](docs/product-reset.md) for current implementation and compatibility contracts. The strategy 2026–27 and S0–S3 gates in that document and [roadmap #362](https://github.com/Johnyyy1/Investnik/issues/362) supersede the old C2 Phase 1–6 implementation order. Older descriptions of a metrics-first course or portfolio-value-first hierarchy do not override this direction.

## Required instruction loading

Codex discovers this root file. `CLAUDE.md` keeps its `@AGENTS.md` import so Claude Code reads the same rules. The supporting files below are mandatory instructions, not optional background. Ordinary Markdown links do **not** load their contents: explicitly open and read every applicable file in full before planning edits, and read additional files if the scope expands. Follow all applicable topics together; this root file keeps global safety and development rules immediately visible.

| When the task touches… | Read before editing |
| --- | --- |
| Any implementation, Git/worktree operation or PR preparation | [WORKTREES.md](WORKTREES.md), including isolation, environment fallback, cleanup and PR preflight |
| Product scope/priorities, curriculum, progression, learning, rewards, Lab or partner behavior | [Product and curriculum](docs/agents/product-and-curriculum.md), [product direction](docs/product-direction.md) and [current compatibility contracts](docs/product-reset.md) |
| Any UI, UX, visible copy, branding, navigation, Lab presentation or responsive/accessibility behavior | [UI and design](docs/agents/ui-and-design.md), [brand](docs/brand.md), [terminology](docs/terminology.md), [DESIGN.md](DESIGN.md) and [design system](docs/design-system.md) |
| Lessons, assessment, mastery, reviews, behavioral/scenario learning, tax/regulatory/research facts, or approved product screens | [Learning and facts](docs/agents/learning-and-facts.md); lesson work also requires the [authoring standard](docs/education/lesson-standard.md) and [step-kind catalog](docs/education/lesson-steps.md), plus [published compatibility](docs/education/published-lesson-compatibility.md) when changing published content |
| XP, Practice Capital, unlocks, rewards, portfolio/trades/resets, accounting, market data, valuations, metrics or backtests | [Finance and data](docs/agents/finance-and-data.md), plus the product and learning/UI topics wherever their behavior is affected |
| These instruction files or their loading/references | All four `docs/agents/` files, `CLAUDE.md` and `WORKTREES.md`; verify requirement preservation, relative links and byte size |

Directory-specific discovery is not a substitute for this table: these rules span source, scripts, tests and documentation. Do not assume that entering a source directory loads `docs/agents/`. Keep root `AGENTS.md` below 16 KiB where practical and always below Codex's default 32 KiB budget; do not increase the configured limit to compensate for growth.

## Critical product and data safeguards

- Investník is educational. Never give personalized instrument recommendations, promise returns, or build a real broker/day-trading product. Keep consumer comparisons neutral and share no personal partner data without consent.
- Preserve stable lesson IDs/routes, saved progress, original completion timestamps, historical receipt amounts/versions and recorded access. Mastery and curriculum placement must not erase completion, repeat rewards or relock existing learners. Preserve legacy `investi` technical identifiers.
- Policy v4 prices new rewards by registered curriculum level; Lab retains the original seven Foundations lessons and 420 XP prerequisite. XP remains visible but secondary. Never reward trading, risk or return, add trade confetti/return leaderboards, or add price notifications.
- Learning capital is an external contribution, never investment return. Use exact minor-unit accounting and centralized rounding; keep trades append-only, reset history auditable and financial retries/concurrent mutations safe. The server owns execution prices, FX and balances. Never replace missing quotes/FX with zero or label sample data as live.
- Scenario/crisis state stays separate from the persistent portfolio. Use documented process criteria and authoritative inputs; do not fabricate metrics, composite scores or readiness claims.
- `later` issues and advanced expansion require an explicit founder decision. Approved designs and completed dependencies do not authorize domain changes or expanded product scope.

## 1. Start every task by inspecting the repository

Before editing anything, always run:

git status
git diff
git diff --stat
git log -6 --oneline
git branch --show-current

Then inspect the relevant code, tests, migrations, and bundled framework guidance.

Never assume the working tree is disposable

If there are existing uncommitted changes:

preserve them;

inspect them before editing;

continue from the current state unless the user explicitly asks to reset;

never run git reset --hard, destructive checkout commands, or discard another agent's work.

Do not switch branches unless explicitly requested.

## 3. Tech stack

Current stack:

Next.js App Router

TypeScript

React

Tailwind CSS v4

shadcn / Radix primitives where appropriate

PostgreSQL

Drizzle ORM

Better Auth

Zod

Vitest

Playwright / browser validation

Recharts

Motion (motion/react)

KaTeX

Lucide

Manrope + Inter (next/font)

Local PostgreSQL has historically used Docker and host port 5433.

Do not change core stack choices without an explicit architectural reason.

## 21. Demo users

Demo users use isolated Better Auth anonymous identities.

Preserve:

isolation;

deterministic seed behavior;

idempotence;

cleanup lifecycle;

cascade deletion for user-owned records.

Do not overwrite a demo user's mutations on every visit.

Shared instruments or shared market-data caches should not cascade with user deletion.

## 24. Testing expectations

Before committing meaningful changes, run the relevant subset and then the full gates.

Typical static gates:

npm run lint
npm run typecheck
npm test
npm run build

Run database/integration/concurrency validation whenever financial or persistence behavior is touched.

Run browser suites against a clean runtime.

Important regression areas

product shell

Learn

Foundations

Returns

learning loop

onboarding

Practice Capital

persistence

Portfolio Lab

Backtesting

demo

design system

marketing

Do not weaken tests just to get green output.

If an assertion is wrong because the product contract changed deliberately, update the assertion to the approved semantics.

When implementing the new direction, cover stable-ID remapping, old route compatibility, prerequisites and new-content module status, preserved completions/receipts/unlocks, mastery vs completion, review scheduling, dated facts, process rubric rules, and scenario isolation as relevant. Reward/disbursement or fee/FX changes require exact-arithmetic, retry and concurrency coverage. Documentation-only tasks need diff, link and consistency checks; application, database and browser gates apply when their behavior changes.

## 25. Clean runtime rule

Next.js dev/prod artifacts can become inconsistent after builds.

If a long-running dev server was active before next build, do not assume it is still a valid acceptance runtime.

Use a fresh isolated server/port for final browser validation when needed.

Do not kill unrelated user processes unless necessary.

## 26. Dev-only routes

Development-only diagnostic routes may intentionally return 404 in production.

Validate them under the correct runtime.

Do not treat an intentional production 404 as a product regression.

Do not expose dev diagnostics in production navigation.

## 27. Git discipline

Before commit:

git status
git diff
git diff --stat

Review every changed file.

Do not include unrelated user files.

Do not commit editor files, local notes, or unrelated Obsidian content.

Never force-push unless explicitly instructed.

After push:

git status
git log -1 --oneline

Confirm local branch matches remote.

## 28. Commit discipline

Each implementation phase should ideally:

have a narrow scope;

preserve previous phase behavior;

include tests;

include migration safety where applicable;

end with one clean commit;

be independently understandable.

Suggested commit style:

feat: ...
fix: ...
refactor: ...
test: ...

Do not bundle unrelated refactors into feature work.

## 29. Migration discipline

Migrations should be additive whenever possible.

Never rewrite old migrations after they are in use.

For data migrations:

use authoritative source data;

make backfills idempotent;

test rerun behavior;

test partially migrated states where relevant;

do not reset the user's normal development DB as part of validation.

Use expand → backfill → cutover → contract for risky schema transitions.

## 30. Security and authority boundaries

For authenticated mutations:

verify session;

verify ownership;

validate inputs;

resolve authoritative server-side values;

use transactions where needed;

prevent duplicate mutation;

return structured errors.

Never trust client-supplied financial state.

Never expose provider secrets or server-only adapters to client bundles.

## 31. Error handling

Normalize errors at domain/application boundaries.

Do not leak:

raw database errors;

provider internals;

stack traces;

secret values.

UI errors should be concise, actionable, and recoverable.

Do not silently convert failures into zero values.

## 32. Performance

Do not prematurely optimize accounting by introducing mutable projections.

Correctness and auditability come first.

If a projection/cache is added later:

it must be rebuildable from authoritative data;

it must not become an undocumented second source of truth.

Avoid unnecessary client-side bundles for server-only logic.

## 33. When doing a UI-only task

If the task is explicitly presentation/interaction only:

Do not modify:

schema;

migrations;

financial domain logic;

reward semantics;

auth;

persistence contracts;

provider contracts;

concurrency;

server authority.

If a desired UX requires a domain change, stop and report it as a follow-up rather than quietly expanding scope.

## 34. When doing a domain/financial task

Before changing financial logic:

identify the current invariant;

add/update pure domain tests first;

add integration/concurrency coverage;

preserve auditability;

validate exact arithmetic;

run the full regression matrix.

Financial correctness takes precedence over UI convenience.

## 35. When continuing another agent's run

If the previous agent hit a quota/rate limit:

preserve the current working tree;

inspect status/diff/log first;

treat existing implementation as approved unless tests reveal a real bug;

finish validation;

avoid restarting the feature from scratch;

do not redesign already reviewed work;

commit and push only after final gates pass.

## 36. Definition of done

A task is not complete until:

requested scope is implemented;

unrelated behavior is preserved;

lint passes;

typecheck passes;

unit tests pass;

relevant DB/integration/concurrency tests pass;

relevant browser tests pass;

responsive/accessibility checks pass where applicable;

diff is audited;

commit is created if requested;

push succeeds if requested;

working tree is clean except explicitly preserved unrelated files.

## 37. Final agent report

At the end of a substantial task, report:

what changed;

what intentionally did not change;

architecture/invariants preserved;

validation performed;

test/build results;

migration/database results if applicable;

browser/accessibility results if applicable;

commit hash if committed;

pushed branch if pushed;

final working-tree status.

Do not claim success for checks that were not actually run.

## 38. Highest-priority invariant

When in doubt, prefer:

Correct, explainable, auditable educational finance behavior over flashy UX or implementation shortcuts.

And for product design:

Prepare the learner to make and maintain an investment plan. Keep the workflow familiar, teach at the moment of decision, and judge the process rather than the return.
