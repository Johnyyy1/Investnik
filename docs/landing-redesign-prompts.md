# Investník landing redesign: prompty pro Pen.dev

Prompty pro AI agenta v Pen.dev (doporučený model GPT‑6 Astra, effort high/xhigh). Výstupem jsou **boardy v `investi-design.pen`**, ne kód. Kód se dělá až z vybrané varianty (§7).

## Jak to použít

1. **Reference do Penu.** Na nový board `Investi / Landing 2.0 / References` vlož 5 screenshotů z [`docs/landing-references/`](landing-references/) a pojmenuj je stejně jako soubory. Prompty na ně odkazují jménem.
2. **Kolo 1 – varianty.** Každý směr pusť jako samostatnou session: **§1 Společný brief** + **jeden** blok ze **§3** (A–F). Celkem 17 variant. Když agent dojde s kontextem, pusť zbývající varianty směru v nové session se stejným briefem.
3. **Kolo 2 – srovnávací board (§4).** Vznikne přehled všech variant vedle sebe a scorecard.
4. **Kolo 3 – remix finalistů (§5).**
5. **Kolo 4 – dotažení vítěze (§6):** všechny breakpointy, stavy, komponenty a anotace pro vývoj.
6. **Kolo 5 – implementace (§7):** prompt pro Codex, který vítěze převede do kódu.

Výchozí rozhodnutí (změň v briefu, pokud chceš jinak):
- Průvodce se jmenuje **Investníček**.
- Postava se **nepřekresluje ani negeneruje**. Používají se jen existující pózy z knihovny `V507P` a v návrhu se jen „hýbou“ (anotace pohybu).
- Varianty smí uhnout od schváleného systému, ale jen v rámci landingu. Komponenty a tokeny appky zůstávají.

---

## §1 Společný brief (vložit do každé session v kole 1)

```text
You are a world-class brand and product designer working directly on the Pen canvas of investi-design.pen.
Task: design alternative versions of the Investník marketing landing page that feel alive, premium and
memorable, with the guide character „Investníček“ leading the visitor and lightly gamifying the experience.
Output is design boards on the canvas – no code.

CONTEXT ON THE CANVAS – inspect before designing
- Design system board V7mUpG (tokens, type, buttons, cards), approved product boards QB1gf (desktop Studovna),
  liRhy (mobile), mAWd8 (states), onboarding boards wKThC / Ui4uz / Z9Mlw / XFfjW.
- Guide illustration library V507P: the ONLY source of the character. Poses → meaning:
  01 welcome · 02 thinking · 03 explaining · 04 calm/book · 05 shrug (not ready yet / it depends) · 06 map
  (path, plan) · 07 small joy (reward) · 08 leaning (curious, peeking) · 10 diversification (juggling) ·
  12 compounding (watering a plant) · 14 returns (chart + magnifier) · 15 weights (balance, allocation) ·
  16 bid-ask (market stall) · 17 armchair reading · 18 bookshelf (library, curriculum) · 20 searching box
  (Lab) · 21 hourglass (patience, crisis drill). There are also "grip" hand crops for peeking over edges.
- Board „Investi / Landing 2.0 / References“ with 5 screenshots (see REFERENCES below).
- Use the design variables (get_variables). Do not change existing variables or components; if a variant
  needs new landing-only values, create them with a `landing/` prefix and list them on the variant board.

WHAT IS WRONG WITH THE CURRENT LANDING
It is correct and accessible but feels flat: the guide is a small static decoration that never speaks; the
page reads like a changelog (long paragraphs, many „připravujeme“ statuses); every section has the same
paper + teal + card rhythm; the gamification the app really has (XP, streak, practice capital, achievements,
module path) is invisible to visitors.

WHAT THE PRODUCT IS (must stay true in every variant)
- Investník: learn investing by doing – learn a concept → decide → predict/test → see consequences →
  understand why → continue. Primary line „Learn investing by doing.“
- Education, NOT a broker, NOT real money, NOT investment advice, NOT a trading game.
- XP for lessons is visible but secondary – never the headline promise. Practice capital comes from learning,
  never from trades, risk or returns. Portfolio Lab grades the process, not profit. Show no reward amounts
  (they change with reward policy); say „cvičný kapitál za lekce“ instead of a number.
- Curriculum on the landing: Úroveň 0 „Než začneš investovat“ (rozpočet, drahý dluh, cíle a horizont,
  finanční check-up available; rezerva, penzijko s DIP, podvody připravujeme) · Úroveň 1 „Jak investice
  fungují“ (akcie, dluhopisy, ETF a indexy, fondy a náklady, aktivní vs. indexové) · Úroveň 2 „Investování
  v Česku v praxi“ (11 lessons available: ceník brokera, TER a rozdíl vůči indexu, spread a poplatky, měnová
  konverze, náklady za 30 let, srovnání brokerů, checklist výběru ETF, investiční plán IPS, pravidelná
  investice, první nákup nanečisto, závěrečný projekt; broker a účet, produkty v EU, české daně
  připravujeme) · Lab: vlastní investiční plán (IPS), Portfolio Lab, Krizový nácvik.
- CTAs: primary „Začít vstupním testem“ (onboarding), secondary „Vyzkoušet demo“, nav „Přihlásit se“.

THE GUIDE „Investníček“
- Narrator and game host. Short first-person lines, warm, slightly witty, never preachy. He may speak about
  himself in masculine forms („Jsem rád, že…“); the visitor is always „ty“ without grammatical gender.
- He greets, asks, reacts, celebrates small wins, points to the next step, and honestly shrugs (pose 05)
  where something is not ready yet. He should be the thing visitors remember and describe afterwards.
- ARTWORK RULES (hard): place only instances/copies of the V507P illustrations. Never generate, redraw,
  trace, vectorize, recolor, distort or "improve" the character; never generate any person or character
  image. Allowed: crop, mask, flip horizontally, scale with locked ratio, layer behind/over cards, peek over
  edges with the grip crops, sit him on drawn ground lines, speech/thought bubbles, and props drawn as
  vectors in his style (black ink ~2px, round caps, teal accents). Image generation is allowed ONLY for
  abstract textures (soft gradients, grain, paper) – nothing figurative.
- Every guide appearance gets a small motion annotation (e.g. „crossfade 02→07 on correct answer“, „walks
  along path, scrubbed“, „peeks in from right edge after 600 ms“).

GAMIFICATION (light, honest, satisfying)
- The visitor should feel the loop in under a minute: a tiny real decision → instant explained feedback →
  a reward moment (XP tick, sticker/stamp, path segment lighting up, guide reaction) → clear next step.
- Landing progress is a demo; design a visible but elegant label („Ukázka · nic se neukládá“).
- Reward understanding, never risk, trading or returns. No fake scarcity, countdowns, streak guilt, loot
  boxes, slot-machine effects around money, or confetti over profits.
- Any number in a demo is a model example and labelled „modelový příklad“. No invented user counts,
  testimonials, ratings, press or partner logos, „X lidí už začalo“, or performance claims.

REFERENCES (board „Investi / Landing 2.0 / References“) – learn the principles, do not copy the looks
- 01-luma-split-hero: split hero – big calm headline bottom-left, a tall rounded panel with an atmospheric
  gradient on the right; one word of the headline has a typographic twist; compact dark segmented nav.
- 02-closer-illustrated-horizon: centered serif headline with an italic colored phrase; an illustrated
  landscape rises from the bottom edge and frames the CTA; dotted grid background.
- 03-phantom-ascii-glow: dark, quiet hero; an object rendered from ASCII characters with a soft glow; data
  as texture instead of stock imagery.
- 04-fintrack-sidebar: refined product UI – generous spacing, colored icon tiles, quiet counts, one red
  attention dot. Product UI itself is the marketing.
- 05-museeai-gradient-reveal: editorial layout; big statement sentence where the second half is grey and
  darkens as you scroll; one large organic gradient panel.
Shared lesson: restraint, one big visual idea per screen, lots of air, one twist in the type, one CTA.
Translate that premium calm to Investník: keep its warmth (paper, ink, teal, butter #f1c75b), avoid cold
purple/blue AI-SaaS gradients, and let the hand-drawn guide be the "one big visual idea" wherever possible.

COPY
- Czech, "ty", no grammatical gender for the visitor, never „/a“ or „(a)“ (e.g. „Milník: připraveno
  začít“, not „Připraven/a začít“). Name always „Investník“. Voice: intelligent, approachable, playful,
  direct, optimistic. Headlines ≤ 8 words; body ≤ 2 sentences; statuses grouped, not repeated per row.
- Keep the important lines present but designed, not apologetic: education not advice; no real money;
  sample data in demos.

ACCESSIBILITY (design for it now)
- Text contrast WCAG AA minimum (AAA for body where possible) – note ratios for every colored section.
- One h1; visible focus style shown at least once; touch targets ≥ 44 px; status never by color alone.
- Show the reduced-motion version of the hero (final state, no movement) as a small frame.
- No essential text inside images.

DESIGN QUALITY BAR
- Awwwards-level, distinctive, not a template. Each section has its own idea and rhythm; vary scale, density
  and pacing.
- Banned: purple/blue SaaS gradients, glassmorphism, generic icon bento grids, 3D blobs, stock photos, emoji
  as icons, "Trusted by" rows, dashboards with invented numbers, centered hero with two buttons and nothing
  else.
- Type: Manrope + Inter from the design system. A variant may add ONE landing-only accent face only when its
  direction says so; it must render Czech diacritics (ěščřžýáíéůú) – show a test line.

DELIVERABLES PER VARIANT – one board named „Investi / Landing 2.0 / <ID> <name>“ containing:
1. Desktop 1440 full page: nav → hero → jak to funguje → ukázka lekce (playable moment) → Portfolio Lab +
   krizový nácvik → fakta a důvěra → závěrečné CTA → patička.
2. Mobile 390 full page (real reflow, not a shrunk desktop) and a 320 hero frame.
3. „Guide script“ frame: every line Investníček says, with pose and trigger.
4. „Game loop“ frame: 3–5 small frames of the key interaction states (idle, hover/choose, correct, near
   miss, reward, next step) incl. the demo label.
5. „Motion“ frame: annotated motion signature (what moves, trigger, duration, easing) + reduced-motion frame.
6. „Notes“ frame: concept in 3 sentences, new landing/ variables, contrast ratios, open risks.

PROCESS
1. Before drawing, write a short rationale per variant on its board: concept, hero composition, section
   list, guide script, game loop, motion signature, mobile plan.
2. Design all variants of your direction as complete pages, not just heroes. Make them genuinely different:
   different compositions, mechanics and motion – not color swaps of one layout.
3. Screenshot each board, critique it honestly against the quality bar and hard rules, and improve. Repeat
   at least twice.
4. Finish with a table on a „<direction> summary“ frame: ID, one-line concept, strongest moment, weakest
   point, your score /10.
```

---

## §2 Tip ke spouštění

Když agent vrátí moc „bezpečný“ výsledek, přidej na konec promptu:

```text
This is too safe. Push the strongest idea twice as far: bigger scale, braver crop of the guide, one
unexpected interaction. Keep every hard rule.
```

---

## §3 Směry (vždy jeden blok za brief)

### A · Cesta s průvodcem → `A1`, `A2`, `A3`

```text
DIRECTION A — "Investníček's journey". The whole landing is one continuous path the visitor travels with the
guide. A hand-drawn ink line runs down the page like a trail on a map; on scroll it draws itself and
Investníček moves along it, switching poses at checkpoints (01 → 06 → 18 → 03 → 15 → 21 → 07). Each
checkpoint = one curriculum stage (Úroveň 0 → 1 → 2 → Vlastní plán → Krizový nácvik) with one guide line and
one micro-interaction. A small fixed HUD (level, XP bar, checkpoint dots) fills as you go, styled with the
restraint of reference 04 (quiet, refined, not a game UI). Calm, warm, paper; closest to the current system.

Design three variants:
- A1 "Trail": vertical trail; desktop pins each checkpoint briefly; mobile is a stacked trail with the guide
  at each stop. HUD bottom-left.
- A2 "Board game": the path is a winding board-game track across wide sections; squares light up when you
  answer a tiny question at each stop. Butter accents for squares.
- A3 "Expedition map": the page is an unfolded paper map (pose 06 holds it in the hero); regions = levels;
  "fog" clears as you progress; stamps collect in a passport-style corner HUD.
```

### B · Hratelná landing → `B1`, `B2`, `B3`

```text
DIRECTION B — "Play first". The hero IS a playable mini-level. Investníček asks a real decision from level
0/1 in a speech bubble (debt vs. investing, a fee over 30 years, diversification); the visitor answers 3
micro-decisions, gets explained feedback after each, earns demo XP and finishes with a reward moment +
„takhle funguje každá lekce“ + CTA „Začít vstupním testem“ / „Ulož si postup“. The rest of the page explains
what they just did and shows Lab + crisis drill. Optimised for the first 10 seconds and conversion.

Design three variants:
- B1 "Quiz duel": big type question, 2–3 chunky answer cards, guide reacting beside them (02 while choosing,
  07 on correct, 05 on a near miss with a kind explanation). XP counter with a number-roll annotation.
- B2 "Slider sandbox": the visitor drags sliders (fee %, years, monthly amount) and predicts before the
  reveal; the guide waters the compounding plant (pose 12) while a hand-drawn chart/plant grows. Prediction
  accuracy, not money, earns XP.
- B3 "Card swipe": a stack of scenario cards (left/right = „investovat teď“ / „nejdřív rezerva nebo dluh“),
  each flips to an explanation; 3 in a row unlocks a sticker. Show the keyboard/button alternative.
```

### C · Skicák → `C1`, `C2`, `C3`

```text
DIRECTION C — "Sketchbook". The landing is Investníček's notebook: lined or dotted paper, margin notes, arrows,
circled words, underlines and charts drawn in the same ink as the character. Gamification = rubber stamps,
stickers and checkmarks that get stuck into the notebook as you interact; a sticker-sheet HUD fills up. The
most distinctive, least "SaaS" option. Allowed: ONE landing-only handwritten accent face for marginalia only
(never body text, never meaning-carrying headings); show a Czech diacritics test line.

Design three variants:
- C1 "School notebook": dotted-grid paper, page tabs as navigation (Učení / Lab / Krizový nácvik); the guide
  peeks over the page edge with the grip crops; stickers on correct answers.
- C2 "Field journal": cream journal spreads with taped-in cards and notes; each spread = a section; spread
  turns on scroll; stamps for milestones.
- C3 "Whiteboard explainer": one big drawn canvas where the guide explains with live doodles step by step as
  you scroll – an interactive hand-drawn explainer, minimal chrome, huge clarity.
```

### D · Víc energie → `D1`, `D2`, `D3`

```text
DIRECTION D — "Bold". Same brand, much more energy: color blocking (deep teal #195b53 / #236f66 sections,
butter #f1c75b moments, paper as relief), oversized Manrope display (up to ~180 px), huge tight crops of the
guide breaking out of sections and peeking over edges, punchy annotated motion. "Grown-up Duolingo meets
editorial magazine". Note the contrast ratio of every text/background pair.

Design three variants:
- D1 "Poster stack": every section is a full-viewport poster with one huge sentence, one guide pose and one
  interaction; desktop snaps poster to poster.
- D2 "Arcade-lite": a level-select hero (Úroveň 0–2 as big tiles, honest available/připravujeme states),
  chunky buttons with satisfying press states, the guide as host announcing each level. No arcade-money
  clichés.
- D3 "Editorial": magazine layout with dramatic type, pull quotes from the guide (his lines, never fake
  testimonials), asymmetric grids, big color fields; a „reading meter“ awards chapter badges.
```

### E · Mix A + B (doporučení) → `E1`, `E2`

```text
DIRECTION E — "Journey + play". The hero is a short playable decision with the guide (as in Direction B);
finishing it "starts the journey" – the rest of the page is the guided path with checkpoints and a HUD (as in
Direction A) already carrying the XP earned in the hero. The handoff from the hero game to the journey is the
signature moment – design it as its own annotated sequence of frames.

Design two variants:
- E1 calm: paper/teal, A1-like trail, B1-like quiz in the hero.
- E2 bolder: D-style color blocking and scale on the same structure, butter reward moments.
```

### F · Klidná prémiovka s průvodcem (podle referencí) → `F1`, `F2`, `F3`

```text
DIRECTION F — "Premium calm with a guide". Take the restraint of the references (one big visual idea, lots of
air, one typographic twist, one CTA, quiet nav pill, dotted grid) and make Investníček the big visual idea.
Warm, not cold: paper, ink, teal, butter; no purple/blue AI gradients. Gamification is refined like reference
04 – a quiet product-grade progress panel (levels as colored icon tiles: Úroveň 0 butter, 1 teal, 2 info
blue #38557a; lesson counts; one dot for „nová lekce“), never a loud game UI. Allowed: ONE landing-only
editorial serif for the twist phrase (italic), with a Czech diacritics test line.

Design three variants, each built around a different hero idea:
- F1 "Gradient window" (ref 01): headline bottom-left, e.g. „Nauč se investovat *tím, že to zkusíš*.“ with
  the twist phrase written in the guide's ink line (annotate: draws itself on load). Right: a tall rounded
  panel with a soft warm gradient texture (teal → butter → paper, slow drift) and Investníček in line-art
  standing on it, waving (01). Clicking the panel starts a one-question mini-lesson inside it.
- F2 "Horizon" (ref 02): centered headline with an italic teal phrase; from the bottom edge rises a
  hand-drawn ink landscape (hills, a road, wooden signposts „Úroveň 0 / 1 / 2“) – the curriculum as a place.
  The guide stands at the start of the road; on scroll he walks it and the signposts light up.
- F3 "Read to progress" (refs 05 + 03): editorial hero with one big statement sentence that darkens word by
  word on scroll; a slim progress meter beneath fills and at the end the guide nods and the first XP chimes.
  The Lab section uses "data as texture": a compounding curve or crisis drawdown rendered from small digits
  and characters reacting to the cursor (ref 03), labelled „modelový příklad“.
For every F variant, include the Fintrack-like progress panel somewhere meaningful (hero side, sticky rail or
closing section) and show its idle, „nová lekce“ and completed states.
```

---

## §4 Srovnávací board (kolo 2)

```text
On investi-design.pen, create board „Investi / Landing 2.0 / Compare“. For every variant board
„Investi / Landing 2.0 / <ID> …“ place: desktop first viewport, mobile first viewport, ID, one-line concept.
Arrange by direction in rows. Then add a scorecard table (1–10) per variant: first-5-seconds clarity, guide
personality, gamification feel, distinctiveness, premium restraint (references), mobile quality,
accessibility (contrast, targets, reduced-motion frame present), honesty/compliance (no invented numbers or
amounts, demo labels, availability matches the brief, copy without gendered forms or „/a“). List hard-rule
violations per variant separately in red. Do not edit the variant boards. End with your top 5 and why.
```

---

## §5 Remix finalistů (kolo 3)

```text
Use the brief already on the variant boards (all rules still apply) and the Compare board. I liked:
- <ID>: <co přesně – např. hero hra, HUD, přechod mezi sekcemi, typografický twist>
- <ID>: <…>
- <ID>: <…>
I disliked: <…>.
Create 2–3 finalists as new boards „Investi / Landing 2.0 / FIN1 …“, „FIN2 …“, „FIN3 …“ that combine these
strengths into coherent pages – not collages. Each finalist needs one clear signature moment. Same
deliverables per board as round 1. Screenshot → critique → improve at least three times. End with a
comparison frame and your recommendation.
```

---

## §6 Dotažení vítěze (kolo 4)

```text
Finalise „Investi / Landing 2.0 / <FIN ID>“ into a handoff-ready board „Investi / Landing 2.0 / Final“:
- Full pages at 1440, 1024, 768, 390 and 320, plus a 200% text frame of the hero and one dense section.
- Components for everything new (guide bubble, progress panel/HUD, reward moment, game cards/sliders, demo
  label, section headers) built from existing variables and components, with variants for every state
  (default, hover, focus-visible, pressed, disabled, correct, near miss, completed, reduced motion).
- Landing-only variables (`landing/…`) documented with their values and contrast ratios.
- Motion spec table: element, trigger, property (transform/opacity/stroke only), duration, easing, delay,
  reduced-motion fallback.
- Final guide script and all copy in one text frame for review; mark every place that depends on lesson
  availability.
- A short README frame for developers: what is interactive vs. static, what is demo state, which poses and
  assets are used.
```

---

## §7 Implementace vítěze (Codex / Astra, v repu)

```text
Implement the approved landing design from investi-design.pen board „Investi / Landing 2.0 / Final“ (read it
via the Pen MCP tools) as the new `/` landing of Investník.
First follow AGENTS.md and WORKTREES.md exactly (isolated worktree and branch, read docs/agents/ui-and-design.md,
DESIGN.md, docs/design-system.md, docs/brand.md, docs/terminology.md, src/components/marketing/motion/ANIMATIONS.md).
This is a UI-only task (AGENTS.md §33): no schema, reward, auth, persistence or finance changes.
- Character: only existing files in public/investi-assets/guide and public/marketing via <GuideImage/>; never
  generate or redraw it. Export any new ink props from Pen as SVG.
- Landing demo state lives in memory, is labelled as a demo and never writes progress or calls auth. Show no
  reward amounts; availability claims stay tied to the lesson registry (update landing-inventory.test.ts).
- Motion: GSAP from src/lib/gsap.ts, transform/opacity/stroke only, full reduced-motion final state, no
  content hidden before JS.
- Replace PenLanding in src/app/(marketing)/page.tsx (keep metadata, structured data, LandingViewBeacon);
  update scripts/validate-marketing.mjs, ANIMATIONS.md and DESIGN.md (landing-only tokens / fonts).
- Verify: typecheck, lint, npm test (copy-voice, terminology), npm run build, npm run test:marketing-browser,
  Lighthouse mobile, keyboard-only and reduced-motion passes, 320 px and 200% text without horizontal overflow.
  Compare screenshots with the Pen board at 1440 and 390 and fix differences. Open a PR with before/after
  screenshots.
```
