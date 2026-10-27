# Learning, scenarios and dated facts

Required supporting instructions for [AGENTS.md](../../AGENTS.md). Read this file in full when the root reading table applies, before editing. Original section numbers are retained for traceability. Bare source paths and commands are relative to the repository root; Markdown links are relative to this document.

## 8. Learn and lesson UX

Before authoring or revising lessons, read [the Lesson 2.0 authoring standard](../education/lesson-standard.md). It defines the learning structure, Czech terminology, dated facts, stable IDs and published-lesson compatibility rules, with copyable lesson/test templates and a review checklist.

Before editing a published lesson, also follow [published lesson compatibility](../education/published-lesson-compatibility.md): preserve identity, saved-step and grading contracts, completed status, and reward receipts.

Lesson UI comes from the approved design, not from the agent. Compose lessons only from the step kinds in [the step-kind catalog](../education/lesson-steps.md) (`fadedExample`, `documentTap`, `findError`, `personaDecision`, `labMission`, `factNotice`, `writtenReflection` and the earlier blocks). Each kind already has a renderer matching the Pen boards exported to docs/design/lesson-steps; preview them at /dev/lesson-steps. When authoring a lesson:

- do not create new lesson components, styles, colors or layouts, and do not restyle the existing renderers;
- copy the data shape from src/features/lessons/specimens/time-test.ts and write new, fictional content;
- take tax/regulatory numbers from the fact registry via `factNotice`, never as literals;
- if the lesson needs a step kind that does not exist, stop and report it in the PR instead of inventing one;
- attach 390 px and 1440 px screenshots of every step to the PR and compare them with the matching PNGs.

Adding or changing a step kind is a separate implementation task: update the design export, types, `evaluateQuestion`/`feedbackFor`/`answer-keys` for graded kinds, the renderer, specimens, tests and the catalog together.

Product screens outside lessons have approved designs too: the Learn level map, entry assessment, module/checkpoint, IPS, crisis exercise, milestone-A project, tax-lot map, decision-time cards, process feedback, backtest attempt counter and skill-based Progress. [docs/design/product-screens.md](../design/product-screens.md) lists them with their PNGs, data sources and open questions (NQ-20 to NQ-47). When implementing one, follow its PNGs and components instead of designing your own, take numbers from the authoritative data rather than the illustrative values in the designs, and state in the PR which open-question recommendations you applied. These designs do not authorize domain changes on their own: reward, persistence and financial work follows [finance and data](finance-and-data.md) and the scope rules in [AGENTS.md](../../AGENTS.md).

The Learn page must answer quickly:

What should I do next?

For a returning learner, Continue learning is the dominant action.

Do not turn Learn into a dashboard with many equal-priority panels.

Lesson loop

Lessons should preserve:

interaction
→ answer
→ feedback
→ persisted continuation
→ completion
→ reward
→ next

Lesson screens should be focused.

Keep:

clear concept hierarchy;

short explanations;

interaction as the central object;

predictable Continue placement;

secondary Previous navigation;

accessible feedback states;

completion state;

mobile usability.

Do not change lesson completion semantics while doing visual work.

Learning design target

Teach in the order of real decisions. Use a worked example, a partially completed example, an independent task, retrieval questions, and a short self-explanation. Tie each new metric to a decision, its assumptions, and when it misleads.

Modules end in a usable learner artifact and mixed checkpoints; levels end in practical projects assessed with an explicit four-level rubric. Prefer tasks using fictional broker tariffs, KIDs, statements, ETF checklists, IPS templates, and Lab missions over calculation-only quizzes.

The target progression is a prerequisite/skill graph with an adaptive entry assessment (including "Nevím"), a test-out route, and spaced mixed review. Preserve the dominant Continue action while recommending eligible next lessons and relevant review.

Target mastery labels are "Zkoušeno → Známé → Zvládnuté → Ovládnuté". The highest state requires delayed mixed retrieval and may decline with evidence; this must never erase lifetime lesson completion, revoke recorded access, or reissue first-completion rewards. Exact thresholds, question counts and scheduling models belong in an explicit implementation specification.

Behavioral learning follows experience in simulation → explanation using the learner's decisions → a learner-chosen safeguard. Use IPS, automation, checklists, turnover budgets, review frequency, and pre-mortems as concrete outputs. Address home bias and familiarity as well as overconfidence, loss aversion, disposition effect, FOMO, anchoring, and mental accounting.

Decision-time cards should explain relevant consequences at the point of action: turnover and costs, selling winners while holding losers, repeated backtest selection, or a tax-lot timing decision. Triggers need explicit rules and data; do not diagnose a bias as fact from a single action.

## 18. Scenario challenges

Scenario challenges are a future/ongoing learning layer.

Core model:

Theory
→ Scenario
→ Decision
→ Prediction
→ Lock
→ Reveal
→ Outcome
→ Explanation
→ Retry

Scenario portfolios must remain separate from the user's persistent personal portfolio.

A challenge must not secretly buy/sell assets in the learner's normal portfolio.

Scoring

Avoid arbitrary composite scores such as 82/100 unless they have an explicit justified model.

Prefer deterministic, explainable rules such as:

Largest position: 22%
Target: ≤25%
Status: Pass

Outcome performance should not determine whether a concept such as diversification was "correct."

Behavioral scenarios should end with a safeguard or plan revision and assess the learner's stated IPS. A crisis exercise tests process under stress, not whether the learner guessed the market recovery. Present criteria and data limitations explicitly.

## 20a. Czech tax, regulatory, and research facts

Treat changing factual values as dated data, not constants embedded in lesson prose. The target fact registry stores value/unit, jurisdiction, effective-from/to dates, source URL, last verification, owner, and next review date. Lessons reference fact keys/tokens; historical scenarios resolve the rule for the scenario's date rather than silently applying today's rule.

Tax lessons visibly state "vzdělávací obsah, ne daňové poradenství; stav k [datum]". Overdue facts need editorial flags and visible freshness warnings when applicable. Plan tax-adviser review before publishing tax lessons; keep unresolved facts explicitly marked as requiring verification.

The supplied direction brief is a product/research input, not an independently verified legal or market-data source. Verify tax limits, holding periods, exemptions, exchange-rate conventions, investor compensation, W-8BEN/treaties, DIP/pension rules, and PRIIPs/UCITS against current primary sources before publication or implementing educational calculations. Do not hard-code the brief's example amounts or present unknown rules as settled.

Keep securities and crypto rules distinct, sale proceeds distinct from gains, trading FX distinct from tax FX, and individual tax lots distinct from aggregate holdings. Educational tax maps are not a personalized tax filing service.

Keep the brief's maintenance cadence: annual January tax/rate checks, filing-season checks, monthly macro inputs, semiannual product/research reviews, and ad hoc legislative updates. These are content-maintenance requirements, not an instruction to create scheduled jobs automatically. Record the sample, period, and limitations behind research claims; do not present findings from other learning domains or paper portfolios as proven effects for Investník.
