# Learn: three layout directions (brief)

This brief prepares decision F1 in [DESIGN.md](../../DESIGN.md#decisions-awaiting-approval). It describes three directions for `/learn` to build as comparable prototypes with `/variant` and `/prototype`. Those skills are user-invoked, so this file is their input. **No direction is adopted** until the founder picks one. Until then, the shipped `/learn` stays as it is.

## Why `/learn`

- It is the first screen after sign-in, onboarding and every lesson completion: the most frequent screen in the product.
- It carries three open audit findings: P1-01 (the curriculum and milestones repeated on Progress), P2-01 (the step stated three times in the continue card) and P2-02 (mascot scope).
- Its structure is the template for Progress (WP-06) and the Lab hub (WP-12). Choosing here settles the layout for all three.

## What every variant must keep

- **Same data and copy.** The demo profile (6 completed lessons, 1 in progress, Portfolio Lab unlocked). Strings come from the existing components (`studovna-page.tsx`, `curriculum-map.tsx`, `milestones`); write no new claims.
- **Same regions, rearranged.** Greeting, continue card (lesson, step, inline question `StudovnaQuestion`, recap „Co už víš“), curriculum map (levels, „Prohloubení“, milestones A–D), portfolio card (Practice Capital, composition), Backtesting link, study-plan context, personalization prompt, footer. A variant may demote, merge or collapse a region. It may not drop one without saying where it went.
- **Foundation tokens only** (`DESIGN.md` Foundations). One filled action per view. Type roles from the table, no arbitrary sizes.
- **Product rules.** Every lesson stays open. Milestones count published content only and never imply completion (`docs/milestones.md`). Practice Capital and XP stay secondary. The guide appears at most once, pending D2.
- **Widths.** Each variant is drawn at 1440 and 390, and must not overflow at 320.

## A · „Pracovní stůl“: one task

*Hypothesis: a returning learner needs one thing, the next step. Everything else is a quiet line under it.*

- **Hierarchy:** the continue card is the only raised surface and the first thing on the screen. The greeting shrinks to one `section-title` line.
- **Layout:** a single centred column (`max-w-standard`). No side rail. Recap folds into the card footer as a disclosure.
- **Below the card:**
  - one line, „Milník A · 1 ze 3 splněno · další krok →“;
  - the curriculum map showing only the current level, with „Celé kurikulum“ to expand;
  - the portfolio as one row („Portfolio Lab · cvičný kapitál … →“).
- **Density:** low. Large spacing and few surfaces.
- **Mobile:** the same order. The CTA is full width.
- **What it tests:** whether removing the rail and most of the map loses anything learners use. Expected `/learn` height at 1440: under 2,500 px (today 4,960).

## B · „Pracoviště“: navigation-led workspace

*Hypothesis: the curriculum is navigation, not content. Keep it on screen as a tree and let the page hold only work.*

- **Hierarchy:** a persistent left rail (about 264px, sticky, at 1024px and up) with the curriculum as a tree (level → module → lesson, with status icons and `aria-current` on the continuation). The main pane holds the work.
- **Main pane:**
  - a compact header row (greeting as one `emphasis` line);
  - the continue card with the recap beside it;
  - a „Další na řadě“ list of the next three lessons as divider-separated rows;
  - a status row for Portfolio Lab and Practice Capital.
- **Density:** high. Rows instead of cards, `control` (48px) heights, `small` text in lists.
- **Mobile:** the rail becomes a „Kurikulum“ sheet opened from a header button. The bottom tabs are unchanged.
- **What it tests:** whether the map works better as persistent wayfinding. **Implication:** it changes the desktop shell navigation (F2). A left rail in the app shell is an IA change beyond Learn.

## C · „Cesta k plánu“: milestone-first

*Hypothesis: making Milestone A the structure of the page raises IPS and crisis-exercise completion, the S1 metric.*

- **Hierarchy:** the hero is Milestone A as a vertical checklist of its requirements (lessons → personal plan (IPS) → crisis exercise), each with written status.
  - The active requirement expands and holds the continue card (lesson, step, CTA).
  - Done requirements collapse to a line with their date.
  - Milestones B–D sit collapsed below.
- **Curriculum:** the full map moves behind „Všechny lekce“ (a disclosure or the existing module routes), below the milestone.
- **Portfolio:** appears inside the requirement it serves (the practice purchase), not as a separate card.
- **Density:** medium. One raised surface (the active requirement).
- **What it tests:** goal-led versus task-led orientation. **Implication:** it overlaps D4. If Learn becomes milestone-first, Progress should become mastery- and history-first.

## D · „Studijní pracoviště“: hybrid of B and A

*Hypothesis: B's persistent curriculum is worth keeping as wayfinding, if it stays compact and out of the way, around A's single task.* Added 2026-11-13 after the founder preferred a B + A hybrid. Prototype: `/dev/learn-variants/d`.

- **Rail (≥ 1024px):** 17rem, sticky under the header, collapsible to a 3.5rem strip (instant, no animation: navigation never animates). Only the current level is open; its finished lessons fold into one row („5 hotových lekcí“); levels 4–6 and V share one „Prohloubení“ disclosure. No lesson codes in the rail. Pointer rows are 36px (`min-h-9`), below the 44px `control-sm` floor: **a decision for F4**. The phone sheet keeps 44px rows.
- **Main pane:** A's editorial column (`max-w-reading`): eyebrow, the lesson title as the `h1`, its summary, a per-step meter. One raised surface holds the active step and question. The step number is stated once (P2-02).
- **Recap fix:** „Co už víš“ is withheld until the answer is correct. Before that, „Potřebuješ nápovědu?“ shows the method hint (the authored `incorrectExplanation`), which never states the result. Root cause, still present in production: `studovnaLesson` (`studovna-model.ts`) takes the last two descriptive blocks of earlier steps, and a worked example's conclusion can be the next question's answer. Fix it there before shipping any variant.
- **Demoted:** the greeting merges into the eyebrow; „Další na řadě“ becomes one „Potom …“ line (the rail already lists what follows); milestone and Portfolio Lab are two quiet rows; the composition bar, Backtesting link and personalization prompt move to their own screens, as in A.
- **Mobile:** the same order; „Kurikulum“ opens the sheet; the CTA is full width.

## C as the future `/progress`

C is not the structure for `/learn`, but its milestone checklist is a good fit for `/progress` (D4, WP-06): Milestone A's requirements as the page skeleton, with done items collapsed to a dated line, the capstone parts linking to IPS, Portfolio Lab and the crisis exercise, and B–D collapsed below. Learn then links to it from the milestone row. That gives Progress a job Learn does not do (goal and mastery), which resolves P1-01.

## How to compare

| Criterion | Measure |
| --- | --- |
| Time to continue | Pixels and taps from page load to the primary action, at 1440 and 390 |
| Orientation | Is the Milestone A next step visible in the first viewport? |
| Length | Page height at 1440 and 390 (WP-06 target for `/learn`: ≤ 3,800 px at 1440) |
| Calm | Number of raised surfaces, number of filled buttons (must be 1) and distinct font sizes rendered |
| Robustness | 0 overflow at 320; 0 axe violations; works at 200 % text |
| Reach | What the choice forces elsewhere (shell nav, Progress purpose, Lab hub) |

Record the pick as F1 in `DESIGN.md`, then implement it through WP-06 and WP-12.
