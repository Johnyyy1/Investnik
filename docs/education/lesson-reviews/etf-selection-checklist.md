# 2.3.6 · Checklist výběru ETF

Issue: [#181](https://github.com/Johnyyy1/Investnik/issues/181). Editorial/content and source check: 2026-11-01. Owner: curriculum maintainer. No statutory values, tax calculations or market observations are introduced.

| Brief | Implementation |
| --- | --- |
| Identity | `etfs-selection-checklist`, new storage module `module-eu-funds-and-etfs` (slug `eu-funds-and-etfs`), `/learn/eu-funds-and-etfs/etf-selection-checklist` (as proposed in the brief) |
| Placement | L2, module 2.3, code 2.3.6, required; prerequisites `costs-ter-tracking-difference` (#171) and `foundations-funds`; new skill `etf-selection` with one mastery item (`recall`) |
| Outcome | Apply eight criteria in decision order, separate core criteria (index, UCITS/domicile, costs) from distinguishing ones, drop the trap fund and justify a choice between two acceptable funds without a „best ETF“ |
| Inputs | Fictional investor Petra, plan „akcie celého světa“. Three fictional ETFs: A (Svět 1, TER 0,22 %, TD −0,18 p. b., 15 mld. EUR, 2019, IE, acc.), B (Svět 2, 0,20 %, −0,15 p. b., 3 mld. EUR, 2011, IE, acc.), C (thematic Tech Leaders 50, 0,49 %, TD unavailable, 80 mil. EUR, 2023, LU, dist.). TER cost computed on 100 000 Kč |
| Assessment | Prediction (first decision = market/index), categorisation core vs distinguishing, document tap (drop C), faded TER difference (220 − 200 = 20 Kč), A-vs-B decision, the „ESG Screened“ trap, one mastery item („why TER is not enough“), written reflection with a four-criterion rubric |
| Transfer | Saved checklist (lesson output, required on its step, exported in Nastavení → Moje data); Lab ETF detail for TER, AUM, inception and holdings |
| Compatibility | New lesson, new storage module placed last in storage order (existing learners' next step does not change) and appended published contract. Existing IDs, saved steps, grading, receipts, unlock requirements and timestamps stay unchanged. Policy v4 applies as written: L2 → 2 000 Kč once |

## Content decisions

- The lesson is composed only of existing step kinds; no new renderer. The issue's PLATFORM-04 three-fund yes/no/unknown grid is delivered in the MVP form the brief allows: a worked yes/no/unknown checklist for fund A, the document tap and choice questions, plus the saved eight-item `checklist` output (#121/#127).
- Funds and indexes are fictional („Svět 1“, „Svět 2“, „Tech Leaders 50“). Real index providers named in the brief (FTSE All-World, MSCI ACWI) are replaced so no existing product is identifiable; the unit test rejects common ETF/index brand names.
- Tracking difference was added to the brief's table so the „TER is not enough“ point has data; the young fund C shows it as *nedostupné*, never as zero.
- The overview table has four columns so it fits the document renderer without horizontal scrolling (axe `scrollable-region-focusable`); domicile, UCITS and currency sit in the document meta line, tracking difference in each row's note.
- The recommendation engine gets a reason code for the module (`ETF_CHECKLIST_AFTER_COSTS`) instead of falling back to the Returns wording.

## Deviations from the brief

- **Prerequisites #176–#179 (2.3.1–2.3.4) are not published yet**, so they are not registered as prerequisites (the registry lists only available lessons). UCITS/domicile, KID, accumulation and replication are explained briefly in the lesson at the depth needed for the checklist; add them as prerequisites when those lessons ship.
- **No new `etf-checklist` interactive figure.** The lesson authoring rules forbid new lesson components in a content task; the per-fund ano/ne/nevím grid needs the PLATFORM-04 exercise type or a design. Follow-up.
- **The existing `etf_checklist` artifact kind is not used.** Its v1 payload is a single instrument with three review booleans; the lesson saves the eight criteria as a `lesson_output` checklist instead. Mapping the checklist to `etf_checklist` (and feeding 2.5.3/IPS) is a schema/domain decision left as follow-up.
- **No Lab-side bridge („vyplň checklist pro ETF v Labu“).** The lab bridge points to what the instrument detail actually shows; adding a link from the instrument detail is a Lab UI change outside this content task.
- **Regulatory statements are qualitative** (UCITS, KID in Czech, domicile). No numbers or dated facts are used, so no fact keys are needed; an editorial review of the UCITS/KID wording is still recommended before 2.3.1 ships.

## Sources checked

- [justETF Academy · The right ETF selection](https://www.justetf.com/en/academy/die-richtige-etf-auswahl.html): selection criteria (index, costs, size, replication, domicile, distribution).
- [Bogleheads wiki](https://www.bogleheads.org/wiki/Main_Page): choosing funds as a European investor.
- `docs/education/curriculum-research.md`, module 2.3.

All funds, indexes and amounts are invented and visibly labelled „Modelový příklad“. No broker, fund or product is recommended.

## Validation

`test:lesson-walkthrough` covers this lesson: wrong answer → feedback → retry → correct answer on every graded step, the required checklist blocks Continue until saved, reload/resume, server-persisted completion and a single 2 000 Kč receipt, axe checks and the 320 px / 200 % text overflow check on every step. The lesson is in the 1440/390 screenshot list. Focused run: `LESSON_IDS=etfs-selection-checklist WALKTHROUGH_TEST_URL=http://localhost:<port> npm run test:lesson-walkthrough` against a fresh production build and an isolated QA database.
