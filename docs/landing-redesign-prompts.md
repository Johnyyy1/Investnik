# Investník landing redesign: prompty pro GPT‑6 Astra

## Jak to použít

1. **Kolo 1 – varianty (Astra, effort high/xhigh).** Pro každý směr pusť samostatný úkol v Codexu (ideálně paralelně, každý ve vlastní větvi/worktree). Do každého úkolu vlož **§1 Společný brief** + **jeden** blok ze **§2** (A, B, C, D nebo E). Celkem 14 variant.
2. **Kolo 2 – galerie (Sol 6.1 stačí).** Slij větve do jedné a pusť **§3**. Vznikne `/dev/landing` se screenshoty a hodnoticí tabulkou, kde všechno porovnáš vedle sebe.
3. **Kolo 3 – remix (Astra).** Napiš, co se ti líbí z kterých variant, a pusť **§4** (vznikne 2–3 finalisti).
4. **Kolo 4 – nasazení (Astra nebo Sol).** **§5** přesune vítěze na `/` a dotáhne testy.

Výchozí rozhodnutí, která jsem za tebe udělal (změň v briefu, pokud chceš jinak):
- Průvodce se na webu jmenuje **Investníček** – jméno je v jedné konstantě, jde snadno změnit.
- Postava se **nepřekresluje ani negeneruje**. Pracuje se jen s existujícími 17 pózami a s pohybem v kódu.
- Varianty smí landingově (jen v rámci landingu) uhnout od Pen.dev systému. Tokeny celé appky zůstávají.

---

## §1 Společný brief (vložit do každého úkolu v kole 1)

```text
You are a world-class product designer and creative front-end engineer. You are working in the Investník repo
(Next.js 16, React 19, TypeScript, Tailwind 4 + CSS modules, GSAP 3.15 with ScrollTrigger/SplitText/DrawSVG,
Lenis, motion). Your job: design and BUILD alternative versions of the marketing landing page that feel alive,
playful and memorable, with the guide character „Investníček“ leading the visitor through the product and
lightly gamifying the experience. The current landing (src/components/marketing/pen-landing.tsx) is correct and
accessible but feels flat: the guide is a small static decoration, the page reads like a changelog, every
section has the same paper + teal + card rhythm, and the gamification the app actually has (XP, streak,
practice capital, achievements, module path in src/components/gamification/*) is invisible to visitors.

FIRST follow AGENTS.md and WORKTREES.md exactly: work in your own isolated worktree and branch
(landing/<direction-letter>), never in the shared main checkout. This is a UI-only task (AGENTS.md §33): no
schema, reward, auth, persistence or finance changes; if an idea needs one, list it as a follow-up instead.

READ FIRST (do not skip): AGENTS.md, docs/agents/ui-and-design.md, docs/agents/product-and-curriculum.md,
docs/product-direction.md, PRODUCT.md, DESIGN.md, docs/design-system.md, docs/brand.md, docs/terminology.md,
src/components/marketing/motion/ANIMATIONS.md, src/components/marketing/pen-landing.tsx (+ .module.css),
src/components/marketing/pen-interactions.tsx, portfolio-lab-demo.tsx, src/components/guide-image.tsx,
src/components/gamification/*, src/features/lessons/registry.ts, src/features/learning/curriculum.ts,
src/components/marketing/landing-inventory.test.ts, src/lib/copy-voice.test.ts, and one existing route under
src/app/dev/* to copy its pattern. Also look at every image in public/investi-assets/guide and public/marketing.

WHAT THE PRODUCT IS (keep this true on every variant)
- Investník = learn investing by doing: learn a concept → decide → predict/test → see consequences →
  understand why → continue. Primary line: „Learn investing by doing.“
- It is education, NOT a broker, NOT real money, NOT investment advice, NOT a trading game.
- Learners earn XP for lessons. Practice capital (cvičný kapitál) comes from learning, never from trades or
  returns. In Portfolio Lab the process is graded, not profit. AGENTS.md says reward policy v4 is current and
  PRODUCT.md still describes v3 – take any amount or unlock rule from the code (reward policy source), not
  from either doc, and if unsure show no amount at all. Never invent new amounts.
- AGENTS.md: "XP remains visible but secondary." The landing's gamification is about the feeling of progress,
  understanding and the guide's reactions – XP may appear, but it must never become the headline promise.
- Main CTA: „Začít vstupním testem“ → /onboarding. Secondary: demo (<DemoButton/>), /sign-in.

THE GUIDE: „Investníček“
- Put the name in ONE constant (e.g. GUIDE_NAME in src/components/marketing/variants/shared/guide.ts) so it can
  be renamed. He speaks to the visitor in first person, short lines, warm, slightly witty, never preachy.
  He may use masculine forms about himself („Jsem rád, že…“); the visitor is always „ty“ without gender.
- He is the narrator and game host: greets, asks, reacts to answers, celebrates small wins, points to the
  next step, and shrugs honestly where something is not ready yet (pose 05-shrug is perfect for that).
- ARTWORK RULES (hard): use only the existing files in public/investi-assets/guide/*.webp and
  public/marketing/*.webp via <GuideImage pose=…/> or next/image. Never generate, redraw, trace, vectorize,
  recolor, distort or "improve" the character, and never use image generation for any character or person.
  Allowed: crossfading between poses, flipping horizontally, translate/rotate/scale (keep aspect ratio),
  subtle squash-and-stretch on reaction, bobbing, peeking from behind cards with masks/clip-path (the hand
  "grip" images exist for this), placing him on the page's own ground lines (respect `ground` in guidePoses),
  speech bubbles, thought bubbles and hand-drawn props drawn in code (SVG, ink black ~2px line, teal accents)
  that match the line-art style. Pose → meaning map you can use: 01 welcome, 02 thinking, 03 explaining,
  04 calm/reading, 05 shrug (not ready yet / it depends), 06 map (path/plan), 07 small joy (reward),
  08 leaning (curious/peeking), 10 diversification (juggling), 12 compounding (watering), 14 returns (chart
  + magnifier), 15 weights (balance/allocation), 16 bid-ask (market stall), 17 armchair (reading), 18
  bookshelf (library/curriculum), 20 searching box (Lab), 21 hourglass (patience/crisis drill).

GAMIFICATION ON THE LANDING (light, honest, satisfying)
- Make the visitor FEEL the loop in under a minute: a tiny decision, instant explained feedback, a reward
  moment (XP tick, sticker/badge, path segment lighting up, guide reaction), and a clear next step.
- Visitor progress on the landing is a demo: label it plainly (e.g. „Ukázka · nic se neukládá“), do not write
  to the database, do not call auth, keep state in memory (localStorage only for a dismissible convenience).
- Reward understanding, never risk, trading volume or returns. No fake scarcity, no countdowns, no streak
  guilt, no loot boxes, no slot-machine effects around money, no confetti over profits.
- Use real content: lesson titles, levels and availability come from the registry/curriculum. Only call
  something available if it is published; otherwise it is „připravujeme“. Any number in a demo is a model
  example and labelled so („modelový příklad“). No invented users counts, testimonials, ratings, logos,
  press, returns or "X lidí už začalo".

COPY
- Czech, "ty", no grammatical gender for the visitor, never „/a“ or „(a)“ (fix „Připraven/a začít“ wherever
  you reuse it, e.g. „Milník: připraveno začít“). Product name always „Investník“. Voice: intelligent,
  approachable, playful, direct, optimistic. Shorter than today: headlines ≤ 8 words, body paragraphs ≤ 2
  sentences, statuses grouped instead of repeated. Keep the legally important lines (education not advice,
  no real money, sample data) present but designed, not apologetic.

ACCESSIBILITY & QUALITY (hard)
- Keyboard reachable everything, visible focus, real buttons/links, correct headings (one h1), aria-live for
  feedback, status never by color alone, touch targets ≥ 44px.
- prefers-reduced-motion: page renders in its final, fully usable state with no pinning/scrubbing/parallax;
  the game still works (just without motion). No content hidden by CSS before JS runs.
- No horizontal overflow at 1440, 1024, 768, 390, 375, 320 px and at 200% text.
- Performance: hero LCP image preloaded and sized, no layout shift from the guide or bubbles, animate only
  transform/opacity/SVG stroke, lazy-load below-the-fold demos, no new runtime dependency unless it clearly
  earns it (say why in the README). Import gsap only from src/lib/gsap.ts.
- Fonts: Manrope + Inter via the existing tokens. A variant may propose one extra landing-only display or
  hand-written accent face only if the direction below explicitly allows it; load it with next/font, latin-ext.

DESIGN QUALITY BAR
- Aim for an Awwwards-level, distinctive page, not a template. Every section needs its own idea and rhythm;
  vary scale, density and pacing. The guide must be the memorable thing people describe afterwards.
- Banned defaults: purple/blue SaaS gradients, glassmorphism, generic icon bento grids, 3D blobs, stock
  photos, emoji as icons, "Trusted by" rows, fake dashboards with invented numbers, centered-everything hero
  with two buttons and nothing else.
- Keep the existing warm paper/ink/teal DNA recognizable unless the direction says otherwise; you may push
  contrast, scale, butter (#f1c75b) accents and section color blocking inside the landing scope.

WHERE TO BUILD (do not touch the live landing)
- Do not modify `/`, pen-landing.tsx, its CSS, global tokens, or app code.
- Each variant lives in src/components/marketing/variants/<slug>/ (index.tsx, styles.module.css, motion.ts,
  README.md) and is reachable at /dev/landing/<slug> (src/app/dev/landing/[slug] or one page per slug,
  following the existing /dev route pattern, noindex). Shared helpers go in variants/shared/.
- Each README.md: the concept in 3 sentences, the guide's script (all lines he says), the game loop, what is
  real vs. demo, open risks.

PROCESS (do all of it)
1. Before coding, write a short design rationale per variant: concept, hero composition, section list,
   guide script, game loop, motion signature, mobile plan.
2. Build all variants for your direction fully – complete pages (hero → how it works → lesson demo →
   Portfolio Lab / crisis drill → trust/facts → closing CTA → footer), not just heroes.
3. Run the dev server, screenshot each variant at 1440 and 390 (full page + first viewport), and critique
   them honestly against the quality bar and hard rules. Then improve. Repeat the screenshot → critique →
   fix loop at least twice. Save final screenshots to docs/landing-variants/<slug>/.
4. Run: npm run typecheck, npm run lint, npm test (copy-voice and terminology tests must pass). Fix all.
5. Finish with a table: slug, one-line concept, strongest moment, weakest point, your score /10.

Make the variants genuinely different from each other – different compositions, mechanics and motion – not
color swaps of one layout.
```

---

## §2 Směry (vždy jeden blok za brief)

### A · Cesta s průvodcem (scroll-story) → `a1`, `a2`, `a3`

```text
DIRECTION A — "Investníček's journey". The whole landing is one continuous path the visitor travels with the
guide. A single hand-drawn ink line (DrawSVG) runs down the page like a trail on a map; as you scroll it draws
itself and Investníček moves along it, switching poses at checkpoints (01 welcome → 06 map → 18 bookshelf →
03 explaining → 15 weights → 21 hourglass → 07 small joy). Each checkpoint = one stage of the real curriculum
(Než začneš investovat → Jak investice fungují → Investování v Česku v praxi → Vlastní plán (IPS) → Krizový
nácvik) with one line from him and one micro-interaction. A small fixed HUD (level, XP bar, checkpoint dots)
fills as you go and is explicitly a demo. Calm, warm, paper; closest to the current design system.

Build three variants:
- a1 "Trail": vertical trail, desktop pins each checkpoint briefly; mobile is a simple stacked trail with the
  guide at each stop (no pinning). HUD bottom-left.
- a2 "Board game": the path is a winding board-game track across wide horizontal sections, squares light up,
  a dice-free "move" happens when you answer a tiny question at each stop. Butter accents for squares.
- a3 "Expedition map": the page is an unfolded paper map (pose 06 holds it in the hero); regions = levels,
  "fog" clears over regions as you progress, stamps appear in a passport-style corner HUD.
```

### B · Hratelná landing (hra hned v heru) → `b1`, `b2`, `b3`

```text
DIRECTION B — "Play first". The hero IS a playable mini-level. Investníček asks a real decision from the
level 0/1 lessons in a speech bubble (e.g. debt vs. investing, cost of a fee over 30 years, diversification);
the visitor answers 3 micro-decisions, gets explained feedback after each, earns demo XP, and finishes with a
reward moment + "this is how every lesson works" + CTA „Začít vstupním testem“ / „Ulož si postup“ (→
/onboarding). The rest of the page explains what they just did and shows Lab + crisis drill. Optimised for
conversion and the first 10 seconds. Always label as demo, nothing saved.

Build three variants:
- b1 "Quiz duel": big type question, 2–3 chunky answer cards, guide reacts beside them with pose swaps (02
  thinking while you hover, 07 joy on correct, 05 shrug on a near miss with a kind explanation). XP counter
  ticks with a satisfying number roll.
- b2 "Slider sandbox": instead of multiple choice, the visitor drags sliders (fee %, years, monthly amount)
  and predicts before revealing; the guide waters the compounding plant (pose 12) and the plant/chart grows
  in hand-drawn SVG. Prediction accuracy (not money) earns XP.
- b3 "Card swipe": a stack of scenario cards (swipe/keyboard left-right = "investovat teď" / "nejdřív
  rezerva/dluh" etc.), Tinder-like but calm; each card flips to an explanation; a 3-card streak unlocks a
  sticker. Must be fully operable with keyboard and buttons, swipe is only an enhancement.
```

### C · Skicák (Investníček kreslí stránku) → `c1`, `c2`, `c3`

```text
DIRECTION C — "Sketchbook". Lean fully into the line-art: the landing is Investníček's notebook. Lined or
dotted paper, margin notes, arrows, circled words, underlines that draw themselves, charts and diagrams that
he "sketches" live in SVG (DrawSVG) in the same ink style as the character. Gamification = rubber stamps,
stickers and checkmarks that get stuck into the notebook as you interact (a sticker sheet HUD fills up).
This is the most distinctive, least "SaaS" option. Allowed: ONE additional landing-only handwritten accent
font for marginalia only (never body text, never headings that carry meaning alone), loaded via next/font
with latin-ext, and it must render Czech diacritics well (check ěščřžýáíéůú).

Build three variants:
- c1 "School notebook": dotted-grid paper, page tabs as navigation (Učení / Lab / Krizový nácvik), guide
  peeks over the page edge using the grip images, stickers on correct answers.
- c2 "Field journal": cream journal spreads with taped-in "photos" (cards) and pressed notes; each spread is a
  section; turning a spread on scroll (2D, transform only); stamps for milestones.
- c3 "Whiteboard explainer": a single big drawn canvas where the guide explains with live doodles step by
  step as you scroll, like a hand-drawn explainer video but interactive; minimal chrome, huge clarity.
```

### D · Víc energie (odvážná verze) → `d1`, `d2`, `d3`

```text
DIRECTION D — "Bold". Same brand, much more energy: strong color blocking (deep teal #195b53 / #236f66
sections, butter #f1c75b moments, paper as relief), oversized Manrope display type (clamp up to ~180px),
tight crops of the guide at huge scale breaking out of sections, peeking over edges, punchy motion with
character. Think "grown-up Duolingo meets editorial magazine". Still honest, still accessible: check contrast
of every text/background pair (WCAG AA minimum, AAA for body where possible). You may propose a landing-only
token layer (e.g. --landing-*) but must not change global tokens.

Build three variants:
- d1 "Poster stack": each section is a full-viewport poster with one huge sentence, one guide pose, one
  interaction; scroll snaps poster to poster on desktop only.
- d2 "Arcade-lite": a level-select screen as the hero (levels 0–2 as big tiles, available vs. připravujeme
  honest), chunky buttons with satisfying press states, the guide as host announcing each level. No
  gambling/arcade money clichés.
- d3 "Editorial": magazine layout with dramatic type, pull quotes from the guide (his lines, not fake
  testimonials), asymmetric grids and big color fields; gamification as a progress "reading meter" that
  awards chapter badges.
```

### E · Mix A + B (moje doporučení) → `e1`, `e2`

```text
DIRECTION E — "Journey + play". Combine A and B: the hero is a short playable decision with the guide
(Direction B), and finishing it "starts the journey" – the rest of the page is the guided path with
checkpoints and a HUD (Direction A) that already carries the XP earned in the hero.

Build two variants:
- e1 calm: paper/teal, A's trail aesthetics, B's quiz in hero.
- e2 bolder: D's color blocking and scale applied to the same structure, butter reward moments.
Make the handoff from hero game to journey the signature moment of the page.
```

---

## §3 Galerie a porovnání (kolo 2, Sol 6.1)

```text
In the Investník repo, the branch contains several landing variants under src/components/marketing/variants/*
with routes /dev/landing/<slug> and screenshots in docs/landing-variants/<slug>/. Build /dev/landing (noindex,
following the existing /dev route pattern): a gallery grid with each variant's desktop and mobile first-viewport
screenshot, slug, one-line concept from its README, and links to open it. Add a compare mode: pick two slugs and
show them side by side in iframes at 1440 and 390 widths with synced scrolling.

Then audit every variant and write docs/landing-variants/SCORECARD.md with a table scoring 1–10:
first-5-seconds clarity, guide personality, gamification feel, distinctiveness, mobile quality, accessibility
(keyboard pass, reduced motion, 320px, 200% text), performance (Lighthouse mobile performance + LCP + CLS),
honesty/compliance (no invented numbers, demo labels, availability matches registry, copy-voice rules).
List hard-rule violations separately per variant. Run typecheck, lint and tests; do not fix designs, only
report. Do not touch `/` or app code.
```

---

## §4 Remix finalistů (kolo 3, Astra)

```text
Read the brief in docs/landing-redesign-prompts.md §1 (all rules still apply) and
docs/landing-variants/SCORECARD.md. I liked:
- <slug>: <co přesně – např. hero hra, HUD, přechod mezi sekcemi>
- <slug>: <…>
- <slug>: <…>
I disliked: <…>.
Create 2–3 finalist variants (f1, f2, f3) that combine these strengths into coherent pages – not collages.
Each finalist must have one clear signature moment. Same location conventions, README, screenshot →
critique → fix loop (at least 3 rounds this time), and all checks green. End with a comparison table and your
recommendation.
```

---

## §5 Nasazení vítěze (kolo 4)

```text
Promote landing variant <slug> to `/`. Rules from docs/landing-redesign-prompts.md §1 still apply.
- Replace PenLanding in src/app/(marketing)/page.tsx, keep metadata, structured data and LandingViewBeacon.
- Move the variant from variants/<slug> into src/components/marketing/ with clear names; delete dead code of
  the old landing only after the new one passes everything; keep variants/ and /dev/landing for history unless
  I say otherwise.
- Update landing-inventory.test.ts so availability claims stay tied to the registry, update
  scripts/validate-marketing.mjs and motion/ANIMATIONS.md to the new page, and update DESIGN.md if the landing
  introduced a landing-only token layer or font.
- Verify: typecheck, lint, npm test, npm run test:marketing-browser, Lighthouse mobile, keyboard-only pass,
  reduced-motion pass, 320px and 200% text. Open a PR with before/after screenshots.
```
