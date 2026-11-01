# Investník landing: experimentální prompty pro Pen.dev

Prompty pro AI agenta v Pen.dev (doporučený model GPT‑6 Astra, effort high/xhigh). Cíl je **zkoušet úplně nové věci**: nový vizuální svět, nová postava, nová typografie. Současný design systém, barvy ani ilustrace se **nepoužívají**. Z dnešního Investníku zůstává jen to, co produkt je, jeho poctivost a česká pravidla textu.

## Jak to použít

1. **Reference do Penu.** Na nový board `Lab / References` vlož 5 screenshotů z [`docs/landing-references/`](landing-references/) se stejnými názvy.
2. **Kolo 0 – casting Investníčka (§2).** Agent navrhne ~12 úplně různých podob postavy. Nejlepší si označíš, ale směry v kole 1 si stejně můžou vymyslet vlastní.
3. **Kolo 1 – světy (§3).** Každý směr pusť jako samostatnou session: **§1 Brief** + **jeden** blok ze §3. Je jich 10, každý má 2 varianty, takže celkem 20 landingů.
4. **Kolo 2 – srovnání (§4)**, **kolo 3 – remix (§5)**, **kolo 4 – finalizace (§6)**, **kolo 5 – kód (§7)**.

Když je výsledek moc opatrný, přidej na konec:

```text
Too safe – this still looks like a normal SaaS/edtech landing. Throw away the layout and push the core idea
twice as far: bigger, stranger, more specific to this world. Keep the hard rules.
```

---

## §1 Společný brief (vložit do každé session)

```text
You are an experimental art director and product designer working on a fresh Pen canvas. Task: invent
radically new landing pages for Investník, a Czech investing-education product, where a guide character
„Investníček“ leads the visitor and lightly gamifies the experience. Output is design boards – no code.

START FROM ZERO
- Ignore the existing Investník design system, colors (paper/teal), components, illustrations, guide poses
  and current landing. Do not open or reuse those boards or assets. Nothing old is sacred except the rules
  below. Each variant may have its own palette, typography, wordmark treatment, grid, imagery and mascot.
- The name stays „Investník“ (with the accent). The wordmark may be reinvented per variant.

WHAT THE PRODUCT IS (stays true in every world)
- Learn investing by doing: learn a concept → make a decision → predict/test → see the consequence →
  understand why → continue. For people preparing for their first investment and wanting to stick to a plan.
- Education – NOT a broker, NOT real money, NOT investment advice, NOT a trading game.
- Curriculum: Úroveň 0 „Než začneš investovat“ (rozpočet, drahý dluh, cíle a horizont, finanční check-up;
  rezerva, penzijko s DIP a podvody připravujeme) · Úroveň 1 „Jak investice fungují“ (akcie, dluhopisy,
  ETF a indexy, fondy a náklady, aktivní vs. indexové) · Úroveň 2 „Investování v Česku v praxi“ (ceník
  brokera, TER, spread a poplatky, měnová konverze, náklady za 30 let, srovnání brokerů, checklist ETF,
  investiční plán, pravidelná investice, první nákup nanečisto, závěrečný projekt; broker a účet, produkty v
  EU a daně připravujeme) · Lab: vlastní investiční plán, Portfolio Lab s cvičným kapitálem, Krizový nácvik
  (modelová krize měsíc po měsíci).
- CTAs: primary „Začít vstupním testem“, secondary „Vyzkoušet demo“, nav „Přihlásit se“.

INVESTNÍČEK
- Invent him for your world (unless the prompt hands you a chosen design). He can be a person, creature,
  object, light, sprite, glyph or even just a voice – but he must have a recognizable silhouette or
  signature, a personality, and work tiny (24 px avatar) and huge (hero).
- Deliver a character sheet: neutral, waving/greeting, thinking, explaining/pointing, small joy, shrug
  („tohle ještě chystáme“ / „záleží na situaci“), patient waiting. Keep him on-model across poses.
- Image generation is allowed for him and for the world. Never base him on a real person, an existing
  brand mascot or a known character.
- He speaks in short first-person Czech lines, warm and a bit witty, never preachy. He may use masculine
  forms about himself; the visitor is always „ty“ without grammatical gender.

GAMIFICATION (light, honest, satisfying)
- The visitor feels the loop within a minute: a tiny real decision → instant explained feedback → a reward
  moment native to the world (not generic confetti) → clear next step.
- Landing progress is a demo – design an elegant label („Ukázka · nic se neukládá“).
- Reward understanding. Never reward trading, risk or returns; no fake scarcity, countdowns, streak guilt,
  loot boxes, slot-machine money effects, leaderboards of returns. XP may exist but is never the headline.
- Numbers in demos are model examples labelled „modelový příklad“. No invented users counts, testimonials,
  ratings, press or partner logos, performance claims or reward amounts.

REFERENCES (board „Lab / References“) – the energy the founder likes in SaaS landings
- 01-luma: split hero, calm headline bottom-left, tall rounded atmospheric gradient panel, one word with a
  typographic twist (pixel/variable glyphs), compact dark segmented nav.
- 02-closer: centered serif headline with an italic colored phrase; a painted landscape rising from the
  bottom frames the CTA; dotted grid.
- 03-phantom: dark quiet hero, an object rendered from ASCII characters with a glow; data as texture.
- 04-fintrack: refined product UI – generous spacing, colored icon tiles, quiet counts, a single red dot.
- 05-museeai: editorial statement whose grey half darkens on scroll; a large organic gradient panel.
Take the principles (restraint, one big visual idea per screen, air, one twist in the type, one CTA,
product-grade UI) and combine them with a playful guide and gamification. Do not copy them.

COPY
- Czech, „ty“, no gendered forms for the visitor, never „/a“ or „(a)“. Voice: intelligent, approachable,
  playful, direct, optimistic. Headlines ≤ 8 words; body ≤ 2 sentences. Write new headlines – do not reuse
  „Nejdřív plán. Pak investice.“
- The honest lines stay, designed with confidence: education not advice; no real money; demo data.

ACCESSIBILITY (still non-negotiable, however wild)
- Text contrast WCAG AA (note ratios), one h1, visible focus state, touch targets ≥ 44 px, meaning never by
  color alone, no essential text baked into images, a reduced-motion frame of the hero. Czech diacritics
  must render in every chosen font (show a test line: „Příliš žluťoučký kůň úpěl ďábelské ódy“).

QUALITY BAR
- Awwwards-level and unmistakably its own world. If someone could swap the logo for any other startup, it
  failed. Every section has its own idea; vary scale, density and pacing.
- Avoid clichés: purple AI gradients for no reason, glassmorphism, icon bento grids, stock photos, stock 3D
  coins and rockets, bull/bear clichés, green candlesticks, Lambo/"to the moon", emoji as icons.

DELIVERABLES PER VARIANT – board „Lab / <ID> <name>“
1. Mood frame: palette, type pairing, texture, 3 keywords, wordmark.
2. Character sheet of that world's Investníček (poses above) + 24 px avatar.
3. Desktop 1440 full page: nav → hero → jak to funguje → hratelná ukázka lekce → Portfolio Lab a krizový
   nácvik → poctivost a fakta → závěrečné CTA → patička.
4. Mobile 390 full page (real reflow) + 320 hero.
5. Game loop frames: idle, choosing, correct, near miss, reward, next step – with the demo label.
6. Motion frame: annotated signature motions + reduced-motion hero.
7. Notes: concept in 3 sentences, guide script (all lines + pose + trigger), contrast ratios, risks,
   what it would cost to build (illustration/3D/animation effort: low/medium/high).

PROCESS
1. Write a rationale first: world, hero idea, mascot, game loop, motion signature, mobile plan.
2. Design both variants of your direction as complete pages; make them clearly different from each other.
3. Screenshot → critique honestly against the quality bar and rules → improve. At least two rounds.
4. Summary frame: ID, one-line concept, strongest moment, weakest point, score /10.
```

---

## §2 Kolo 0 – casting Investníčka

```text
Use the brief rules about Investníček and the product (ignore the page deliverables). Create board
„Lab / Investníček casting“ with 12 radically different character concepts, each in a column: name of the
concept, 3 poses (greeting, thinking, small joy), 24 px avatar, one sample speech bubble in Czech, and a
one-line personality. Cover a wide range, for example: a soft glowing orb/light being · a 3D clay figure ·
a 16-bit pixel sprite · an ASCII/text creature · a geometric minimal icon-mascot · a painted
storybook character · a sticker/riso zine character · a living coin or seed (avoid stock-coin clichés) ·
a little gardener · an expedition guide · a pure typographic/voice character (no body) · one wildcard.
Then rate each for memorability, scalability (24 px → hero), animation potential and fit with "calm premium
+ playful". Recommend top 3.
```

---

## §3 Světy (vždy jeden blok za brief)

```text
G1 — "Aurora" (refs 01, 05). Soft living gradients on near-white, huge calm type with one glitch/pixel twist
word. Investníček is a small glowing light being. The big gradient panel IS the game board: your answers
shift its colors and shapes (correct = it blooms, near miss = it clouds and Investníček explains). Progress
panel styled like product UI (ref 04).
- G1a: split hero (headline left, tall gradient window right that you play inside).
- G1b: full-bleed gradient that reacts to cursor; questions float in it like cards.
```

```text
G2 — "Krajina" (ref 02). An illustrated painterly world where each level is a place: Úroveň 0 a village,
1 a forest, 2 a mountain town in Czechia, Krizový nácvik a storm on the ridge. Editorial serif headline with
an italic phrase. Investníček is a small storybook traveller. Scrolling travels through the landscape; badges
are hand-stamped postcards from each place.
- G2a: horizon hero like ref 02, then a vertical journey through places.
- G2b: horizontal panorama journey on desktop (vertical on mobile), the world as one long painting.
```

```text
G3 — "Terminál" (ref 03). Dark, quiet, precise. Investníček is made of ASCII characters and glows softly; he
reassembles into poses from scattered glyphs. Data as texture: compounding curves, fee drag and drawdowns
rendered from digits. Gamification as quests in a calm command-style interface (no hacker clichés, no green
matrix rain); achievements are glyph sigils.
- G3a: centered hero like ref 03, the ASCII guide above the headline.
- G3b: the whole page as one long console session you answer into.
```

```text
G4 — "Hlína" (claymation 3D). Tactile clay diorama world: a tiny desk with a budget sheet, a jar for the
reserve, a basket of ETFs, a stormy crisis box. Investníček is a clay figure with fingerprints and charm.
Rewards are little clay objects you collect on a shelf. Warm studio lighting, macro photography feel.
- G4a: isometric diorama hero you can "click into".
- G4b: stop-motion storyboard – each section is one scene frame.
```

```text
G5 — "Výprava" (premium pixel RPG). Crisp modern pixel art framed by elegant contemporary typography (not
retro cheesy). Investníček is a 32 px sprite with great animation. A quest log, an inventory of knowledge
items (Rozpočet, Rezerva, ETF…), a world map of levels, a boss = Krizový nácvik (you beat it by sticking to
your plan, not by profit).
- G5a: full RPG overworld map hero.
- G5b: mostly clean SaaS page where pixel moments break through (pixel twist word like ref 01, sprite
  walking across sections).
```

```text
G6 — "Produkt jako hrdina" (ref 04). Ultra-refined Swiss/product aesthetic: the hero is a beautifully crafted
app UI (lesson card, progress panel with colored icon tiles, a „nová lekce“ dot). Investníček is a minimal
geometric icon-mascot that lives inside the UI (avatar, empty states, toasts) and occasionally steps out of
it at full size. Gamification is refined product state, not game UI.
- G6a: light, airy, Apple-like product hero with floating UI in depth.
- G6b: split layout – UI on one side, a huge character moment on the other.
```

```text
G7 — "Zin" (riso / collage). Bold risograph colors, halftones, torn paper, cut-out type, stickers. Investníček
is a sticker mascot that gets slapped onto the page. Gamification = a sticker album you fill; each correct
decision gives a sticker that sticks with a satisfying annotated motion.
- G7a: poster-like hero, huge cut-out headline.
- G7b: a printed zine you flip through, spreads as sections.
```

```text
G8 — "Hlas" (kinetic typography, no illustration). Investníček has no body: he is a voice and a typographic
personality – his words appear as big animated type, a blinking caret, punctuation that reacts. The page is a
conversation with him. Gamification through typography: words you get right lock into place and change
weight. Extremely minimal, very bold.
- G8a: black-on-white, one variable font doing everything.
- G8b: color-blocked chat-like dialogue spanning the screen.
```

```text
G9 — "Zahrada" (growth / compounding as nature). A night or dawn garden where your plan grows: each finished
decision plants or grows something; compounding visualized as a growing plant system; the crisis drill is a
storm the garden survives if you keep to the plan. Investníček is a small gardener. Generative-feeling
illustration, calm and beautiful.
- G9a: dark luminous garden.
- G9b: daylight botanical-plate style with scientific annotations.
```

```text
G10 — "Divočina" (wildcard). Ignore the other directions and propose the boldest concept you believe could
win – something no investing or edtech site has done. Two variants of that idea.
```

---

## §4 Kolo 2 – srovnání

```text
Create board „Lab / Compare“. For every board „Lab / <ID> …“ place the desktop first viewport, mobile first
viewport, its Investníček and a one-line concept, arranged by direction. Add a scorecard (1–10): first-5-
seconds clarity, originality ("could this be any startup?"), guide personality, gamification feel, premium
restraint vs. the references, mobile, accessibility (contrast, targets, reduced-motion frame), honesty (no
invented numbers/testimonials/amounts, demo labels, no rewards for trading), build cost. List rule violations
per variant in red. Do not edit variant boards. End with your top 5 and why.
```

## §5 Kolo 3 – remix finalistů

```text
Using the brief on the variant boards and „Lab / Compare“: I liked
- <ID>: <co přesně>
- <ID>: <co přesně>
- Investníček: <ID nebo koncept z castingu>
I disliked: <…>.
Create 2–3 finalists „Lab / FIN1 …“ etc. that fuse these into coherent worlds – not collages – each with one
signature moment and the chosen Investníček. Same deliverables as round 1, three screenshot → critique →
improve rounds, then a comparison and your recommendation.
```

## §6 Kolo 4 – finalizace vítěze

```text
Turn „Lab / <FIN ID>“ into „Lab / Final“, ready for development:
- Full pages at 1440, 1024, 768, 390, 320 + a 200% text frame.
- A new mini design system for the landing: color and type variables, spacing, radii, components (guide
  bubble, progress panel, reward moment, game controls, demo label, nav, buttons) with all states
  (default, hover, focus-visible, pressed, disabled, correct, near miss, completed, reduced motion).
- Final character sheet with every pose used, exported as transparent PNG/WebP @2x and @3x (or SVG/Lottie/
  Rive notes if animated), consistent and on-model.
- Motion spec table: element, trigger, property, duration, easing, delay, reduced-motion fallback.
- All copy and the full guide script in one review frame; mark lines that depend on lesson availability.
- Developer README: interactive vs. static, demo state, asset list, fonts and licenses.
```

## §7 Kolo 5 – implementace (Codex / Astra v repu)

```text
Implement the landing from investi-design.pen board „Lab / Final“ (read it via the Pen MCP tools) as the new
`/` landing of Investník.
First follow AGENTS.md and WORKTREES.md exactly (isolated worktree/branch; read docs/agents/ui-and-design.md,
DESIGN.md, docs/brand.md, docs/terminology.md, src/components/marketing/motion/ANIMATIONS.md). UI-only task
(AGENTS.md §33): no schema, reward, auth, persistence or finance changes.
- This is a deliberate new visual direction for the landing, approved by the founder. Keep it scoped to the
  marketing route: landing-only tokens and fonts under a dedicated namespace; do not change the app's design
  system. Record the decision and the new landing system in DESIGN.md and docs/brand.md.
- Export the new character and world assets from Pen into public/landing/ (optimized WebP/AVIF/SVG, sized
  for their slots, with a manifest of origins). Do not use public/investi-assets on the landing.
- Demo state stays in memory, labelled as a demo, never writes progress or calls auth. Show no reward amounts;
  availability claims stay tied to the lesson registry (update landing-inventory.test.ts).
- Motion: GSAP from src/lib/gsap.ts, transform/opacity/stroke where possible, a full reduced-motion final
  state, nothing hidden before JS. Heavy media (3D, video, Rive) lazy-loaded with a static poster.
- Replace PenLanding in src/app/(marketing)/page.tsx (keep metadata, structured data, LandingViewBeacon);
  update scripts/validate-marketing.mjs and ANIMATIONS.md.
- Verify: typecheck, lint, npm test (copy-voice, terminology), build, npm run test:marketing-browser,
  Lighthouse mobile (LCP < 2.5 s, CLS < 0.1), keyboard-only and reduced-motion passes, 320 px and 200% text
  without overflow. Compare with the Pen board at 1440 and 390 and fix differences. Open a PR with
  screenshots.
```
