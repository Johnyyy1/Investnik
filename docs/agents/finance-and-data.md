# Rewards, finance and market data

Required supporting instructions for [AGENTS.md](../../AGENTS.md). Read this file in full when the root reading table applies, before editing. Original section numbers are retained for traceability. Bare source paths and commands are relative to the repository root; Markdown links are relative to this document.

## 9. Practice Capital

Practice Capital is the spendable learning reward for Portfolio Lab. XP measures learning progress, stays visible to the learner, and gates the Portfolio Lab unlock. Issue #35 decided to keep XP visible but secondary: Progress leads with completed lessons and receipt-derived Practice Capital, and shows XP as a quiet learning measure. Do not hide XP or remove it from the unlock condition without a new product decision.

Reward direction

Reward learning, retained understanding, and documented process. Never grant XP or Practice Capital for placing trades, trading frequency, taking more risk, or achieving a return. No return leaderboards, trade confetti, lottery rewards, or prompts to trade because of inactivity. Do not add price-movement notifications. Learning streaks should support learning/review rather than Lab activity.

The target evolution is mastery-linked awards, monthly Practice Capital income in an isolated simulated-time training portfolio (#139), and process milestones such as an IPS or completing a crisis exercise according to plan. Keep the personal portfolio's receipt-derived entitlement intact. Implement these prospectively through a versioned reward/disbursement policy with explicit eligibility, scheduling, idempotency, and migration tests. Distinguish earned entitlement, scheduled disbursements, contributed capital, and available cash; all must remain auditable and contributions must never become returns.

This direction does not retroactively claw back or reschedule earned capital, recalculate receipts, or change the existing lesson-based streak contract. Until a scoped implementation deliberately replaces them, preserve policy v4 and the learning contracts below.

Reward policy

Current policy (reward policy v4, issue #120, 2026-10-21). The code is the source of truth for the amounts and the XP goal: lessonReward in src/features/rewards/practice-capital.ts resolves the curriculum level from the registry; src/features/progression/unlocks.ts defines access. docs/product-reset.md records the decision, alternatives and history.

first completion of a lesson in L0, L1 (including Foundations), or the behavioral strand B
= XP only
= 0 Practice Capital

completing the original seven Foundations lessons and reaching 420 XP
= one-time Portfolio Lab unlock grant
= 500000 CZK minor units
= 5,000 Kč Practice Capital

first completion of a lesson in L2–L6 or V
= 200000 CZK minor units
= 2,000 Kč Practice Capital

The lesson reward follows its registered curriculum level, not its storage module or completion order. Eligible capital earned before the unlock becomes usable once Portfolio Lab opens. A lesson needs a registry placement before it can earn a new receipt; never fall back to storage-module eligibility. The behavioral lesson correlation-not-causation is XP only for new v4 receipts, while its old v3 receipts keep their capital.

Checkpoint 1 and newly published L1 lessons do not expand the frozen seven-lesson Lab prerequisite. Recorded access and grants are preserved.

Review / repeated completion:

0 additional XP or Practice Capital

Stored receipts keep the amount and policy version they were created with (v1: 2,000 Kč per lesson; v2: XP only; v3: XP only in Foundations and 2,000 Kč elsewhere) and are never recalculated or backfilled for v4.

V4 pays the full eligible amount on first completion. Split mastery awards await #122; review-based streak credit awaits the persisted daily-review contract in #123. Until then, the existing first-completion lesson streak remains intact. Process bonuses (IPS, crisis, capstones) require verified outputs, explicit amounts, eligibility and an idempotent receipt policy before activation; v4 introduces none. Monthly disbursements await an isolated training portfolio in #139; the personal portfolio keeps receipt-derived entitlement.

Never award XP, Practice Capital, learning-day credit or streaks for a trade, trading frequency, risk or return. Do not add trade confetti, return leaderboards or price notifications. Apply the reward/process checks in .github/PULL_REQUEST_TEMPLATE.md when reviewing changes.

Practice Capital must never be derived from XP.

Source of truth

Practice Capital is derived from authoritative lesson reward receipts plus recorded progression unlock grants (the Portfolio Lab unlock and the demo access grant).

Do not create a mutable user balance counter unless architecture is deliberately changed later.

Money representation

Use integer minor units for canonical money accounting.

Do not use JavaScript floating-point numbers as the accounting source of truth.

Formatting belongs at presentation boundaries.

## 10. Portfolio Lab accounting invariants

The persistent Portfolio Lab is an educational paper portfolio.

Important definitions

Earned Practice Capital
= sum of legitimate Practice Capital receipts
+ sum of recorded unlock grants

Cash
= contributed capital
+ sell proceeds
- buy costs
- fees

Holdings market value
= Σ quantity × current quote × FX

Portfolio total
= cash + holdings market value

Investment gain/loss
= portfolio total - contributed Practice Capital

Critical invariant

If the learner earns another 2,000 Kč through learning:

Practice Capital: +2,000 Kč
Cash:             +2,000 Kč
Investment P&L:   unchanged

Learning rewards are external contributions, not investment performance.

Never count them as return.

## 11. Portfolio persistence model

The portfolio uses generations.

A reset should:

close the active generation;

create a clean generation;

restore all legitimately earned Practice Capital as available capital;

preserve lesson progress;

preserve reward receipts;

preserve old trades;

preserve old generations for auditability.

Only one active portfolio generation may exist per user.

Do not delete old trade history during reset.

## 12. Trade ledger rules

Trades are append-only.

Do not create or mutate a position table as the source of truth unless a later performance projection explicitly requires one.

Holdings should be derivable from ordered immutable trades.

V1 trading rules

long-only;

no shorting;

no leverage;

no margin;

no negative cash;

fractional quantities allowed;

cannot sell more than held quantity.

Client must never authoritatively submit

execution price;

FX rate;

portfolio value;

cash balance;

cost basis;

P&L;

Practice Capital balance.

The server must determine these values.

## 13. Financial precision

Current persistence conventions may include:

money: bigint minor units;

quantity: fixed-precision numeric;

price: fixed-precision numeric;

FX: fixed-precision numeric.

Use centralized rounding rules.

Do not introduce divergent rounding behavior in UI, domain, repository, or tests.

When changing financial code, explicitly test decimal edge cases such as:

0.1

0.25

1.3333

FX values with multiple decimal places

amounts that round to non-obvious minor-unit values

## 14. Idempotency and concurrency

Financial operations must be safe under retries and concurrent requests.

Preserve:

one first-completion reward per user/lesson;

trade idempotency keys;

reset idempotency;

row locking / serialization strategy;

no overspending from concurrent buys;

no overselling from concurrent sells;

no lost reward when lesson completion and trade happen concurrently.

Do not weaken concurrency tests.

## 15. Market data architecture

Market data is provider-agnostic.

Conceptual boundary:

Investník domain/application
        ↓
MarketDataService
        ↓
MarketDataProvider
        ↓
provider adapter

Domain/UI code must not depend on provider-specific field names.

Normalized concerns

Market data should represent:

stable internal instrument identity;

symbol;

name;

asset type;

exchange / MIC where available;

quote currency;

observation time;

retrieval time;

provenance;

freshness;

adjustment mode;

completeness.

Do not silently substitute

raw prices;

split-adjusted prices;

total-return series.

Those are distinct semantics.

Missing data

Missing quotes or FX must never become zero.

Return an explicit incomplete/unavailable valuation state.

## 16. Deterministic vs live data

Deterministic sample data is used for stable development/demo/testing.

It must be labeled truthfully as:

Sample data;

Educational data;

Deterministic sample data.

Never label deterministic fixtures as:

Live;

Real-time;

Current market price.

When live providers are eventually connected, keep provider-specific behavior behind the existing abstraction.

## 19. Backtesting Lab

Backtesting answers:

How would this idea have behaved?

Portfolio Lab answers:

What do I own?

Do not conflate the two.

Teach costs, benchmarks, rebalancing, look-ahead/survivorship bias, overfitting, multiple attempts, and out-of-sample limitations alongside backtest results. The target includes an intentional overfitting exercise and an attempt counter; these are educational tools, not rewards for optimizing historical return. A favorable historical result is not evidence of a sound real-world strategy.

A future Backtest this portfolio flow should normalize current portfolio holdings into a frozen allocation/specification snapshot.

Do not backtest the user's live transaction history directly unless the product explicitly adds that separate feature.

Backtests should eventually separate:

specification validation;

normalized historical data;

simulation;

metrics;

diagnostics;

presentation.

## 20. Backtest metrics and conventions

Be explicit about conventions.

Current/future metrics include:

Final Value

CAGR

Max Drawdown

Annualized Volatility

Do not fabricate or imply metrics that the current data does not support.

When periodic cash flows are introduced, naive CAGR may not be sufficient.

Do not silently mix:

price return;

total return;

money-weighted return;

time-weighted return.

Explain each metric's meaning, input requirements, period, currency, costs, cash flows, and limitations. A difference between MWR and TWR can support reflection on cash-flow timing; it is not by itself proof of a behavioral mistake.
