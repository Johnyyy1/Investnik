# UI, design and accessibility

Required supporting instructions for [AGENTS.md](../../AGENTS.md). Read this file in full when the root reading table applies, before editing. Original section numbers are retained for traceability. Bare source paths and commands are relative to the repository root; Markdown links are relative to this document.

## 4. Information architecture

Primary authenticated navigation:

Learn

Lab

Progress

Settings/account controls live behind the account area.

Active lesson routes intentionally bypass the normal app shell to keep lessons focused.

Do not casually add top-level navigation items.

## 5. Brand and visual system

Brand

Always write the product name as:

Investník

The product was called investi until 2026-10-21. Use investnik without diacritics only in the domain (https://investnik.cz is canonical; www redirects to it), technical identifiers, slugs and filenames; never write Investnik in visible Czech copy. The wordmark is the shared Wordmark component (the í symbol plus the typeset name); a wordmark link names its target in aria-label ("Investník · úvodní stránka", "Investník · Učení"). docs/brand.md records the identity, assets and domain setup.

Existing technical identifiers that start with investi (browser-storage keys, market-data provider and dataset IDs, fee-profile IDs, the anonymous-kind header, CSS hooks, log prefixes, INVESTI_PERF_DEBUG, QA database names, public/investi-assets) are persisted or relied on elsewhere. Keep them; do not rename them for cosmetic consistency.

UI terms follow the glossary in docs/terminology.md.

Primary line:

Learn investing by doing.

Brand personality

Intelligent

Approachable

Playful

Direct

Optimistic

The product should feel roughly:

50% intelligent learning product

35% playful consumer brand

15% serious finance/data product

Core palette

The palette lives in src/styles/tokens.css as semantic roles; DESIGN.md and docs/design-system.md describe them. The anchors:

Paper (background): #F7F2E8

Surface: #FFFCF7

Ink (foreground): #171717

Action Teal (primary): #236F66

Graphic Teal (progress): #2F8F83

Soft Teal (primary-soft): #E6F0E9

Butter (warning): #F1C75B

Error Ink (danger): #A63D28

Use the semantic tokens; do not hard-code colors. There is one primary action style everywhere: the shared Button component (src/components/ui/button.tsx).

Typography

Use Manrope for headings and Inter for UI and reading text, through the font tokens (--font-display, --font-sans). Do not add another UI font.

Marketing can be expressive and large.

Product UI should be quieter, denser, and more functional.

## 6. Visual anti-patterns

Avoid:

generic SaaS card grids;

excessive card soup;

gradient text;

glow-heavy interfaces;

neon trading-terminal visuals;

fake social proof;

fake logos;

random color usage;

excessive pills;

glassmorphism everywhere;

generic AI-generated finance decoration;

candlestick charts used as decoration;

crypto-bro visual language;

3D finance objects used without purpose;

decorative AI orbs;

giant marketing typography inside product screens.

Do not make every section a separate bordered card.

Use hierarchy, spacing, typography, and restrained surfaces first.

## 7. Marketing vs product

Marketing

Marketing may be more expressive, visual, and brand-led.

Product

The authenticated app should be:

calm;

functional;

precise;

readable;

beginner-friendly;

clearly related to the marketing brand, but quieter.

Do not copy marketing clouds, hills, oversized gradients, mascots, tilted cards, or decorative 3D scenes into normal app screens.

Mascot usage, if any, should be rare and purposeful:

onboarding;

lesson completion;

meaningful milestone;

empty state.

Do not place the mascot everywhere.

## 17. Portfolio Lab UX principles

The Portfolio Lab is a rehearsal for maintaining an investment plan. Keep familiar investing interactions and connect each decision to learning, costs, diversification, and the learner's IPS. Choosing to wait or keep the plan can be a successful outcome.

Core flow:

SEARCH
→ SELECT INSTRUMENT
→ CHOOSE AMOUNT / QUANTITY
→ REVIEW
→ BUY
→ SEE HOLDING
→ UNDERSTAND PORTFOLIO IMPACT
→ CHECK AGAINST THE PLAN

Main hierarchy

Prefer:

Process feedback as the primary educational summary: diversification/concentration (including HHI where supported), total costs, turnover, alignment with IPS, and cash drag in the context of the plan;

portfolio value, holdings and available cash clearly visible for orientation;

investment P&L as context, with separately explained MWR and TWR when supported;

Practice Capital as learning context;

one easy-to-find + Invest action when appropriate, without pressure to trade;

holdings;

allocation;

recent activity;

destructive reset actions de-emphasized.

"Skóre procesu" means explainable criteria and feedback first. Do not invent an aggregate 82/100, universal ideal allocation, or unsupported thresholds. Any composite needs a documented model; absence of data means unavailable, not failure. Do not penalize appropriate cash reserves or reward needless rebalancing to increase activity.

Realistic friction is part of the learning target: fictional broker fee profiles, FX spread, recurring simulated contributions, tax-lot maps, and dated educational sale-proceeds checks. Show assumptions and costs before confirmation. Fees, FX and accounting remain authoritative on the server; introducing them is a financial-domain task, not a visual change.

MWR/TWR, process metrics, and tax-lot tools must use sufficient authoritative data and documented conventions. Until implemented, do not display fabricated values or imply current coverage. Historical/crisis exercises use isolated scenario state; they must not mutate the persistent portfolio's trades or valuation clock.

Avoid

always-open buy forms;

inline sell forms that expand into the page;

equal visual weight for every metric;

giant empty sections;

oversized explanatory copy;

permanently promoted Reset Portfolio action.

Empty state

A beginner with capital but no holdings should see a clear first practice action connected to an IPS or guided mission, without implying urgency to invest.

A user with zero Practice Capital should be directed back to learning. No cash or holdings is not a reason to encourage extra trades or paid deposits.

## 22. Accessibility

Accessibility is not optional.

For relevant UI, verify:

keyboard navigation;

visible focus;

correct labels;

semantic tables/lists;

dialogs with accessible titles/descriptions;

focus trapping where modal;

Escape behavior;

focus return to trigger;

touch targets roughly 44–48px where practical;

reduced motion;

no color-only status;

no horizontal overflow;

200% text compatibility.

Do not solve overflow by shrinking essential text.

Fix layout/reflow instead.

## 23. Responsive expectations

Common validation widths:

1440

1024

768

390

375

320

Do not simply collapse desktop tables on mobile.

Use intentionally designed mobile layouts.

For finance/data screens, prefer structured lists/cards over forced horizontal scrolling when possible.
