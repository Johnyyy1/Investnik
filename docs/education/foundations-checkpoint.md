# Kontrola 1: ověření investičních základů — #164

## Autorský brief

- Identita: `foundations-checkpoint`, úložný modul `module-investing-foundations`, slug `foundations-checkpoint`, URL `/learn/investing-foundations/foundations-checkpoint`. Rezervované ID se nemění.
- Umístění: L1, modul 1.1, kód 1.1.10, povinná kontrola. Odhad 10 minut včetně oprav a reflexe; zatím bez uživatelského měření délky.
- Výsledek: propojit kupní sílu, složené zhodnocení, diverzifikaci, přepočet měny, kotace, náklady a omezení historických přehledů. Všech 11 úloh musí být správně; opravy jsou povolené. Dokončení není důkazem retence ani připravenosti na skutečné investování.
- Předpoklady: lekce 1.1.1–1.1.9. Registr zatím uvádí dostupné koncové větve grafu; při publikaci doplnit skutečné stabilní ID lekce 1.1.9 z #163. Nevymýšlet ID ani odkaz na neexistující lekci.
- Scénář: výslovně modelové příklady v Kč, jedna USD pozice s daným kurzem. Fiktivní přehled ve stylu SPIVA je počet 72 ze 100 fondů, nikoli historický výzkumný údaj. Lekce neuvádí tvrzení o třetině respondentů ani skutečnou úspěšnost fondů.
- Ověření: tři otázky Big Three proložené osmi úlohami (pozice, index/ETF, dluhopis/sazby, spread, složená změna, váha, vstupní poplatek, interpretace přehledu). Každá má vysvětlení, opravu a odkaz na dostupnou související lekci. Psaná reflexe je dočasná podle kontraktu `writtenReflection`.
- Přenos: vlastní kontrolní pravidlo před rozhodnutím; žádný povinný obchod. Checkpoint nenahrazuje praktický výstup modulu ani investiční plán.
- Fakta a revize: pouze modelové vstupy, žádná nová právní ani empirická tvrzení. Redakční revize čeká; odborné schválení se nevymýšlí.
- Kompatibilita: nový autorský návrh pod rezervovaným ID; `status: planned`, pouze `draftLessons`. Žádná změna veřejných lekcí, kurzorů, dokončení, účtenek ani grantů. Budoucí první dokončení má podle stávající v4 nula cvičného kapitálu. Podmínky Labu zůstávají původních sedm Foundations + 420 XP.

## Náhled a design

V development runtime otevři `/dev/foundations-checkpoint`. Náhled používá existující `LessonDraftPreview`, `GuidedQuestion` a `GuidedBlock`; žádný nový typ kroku, styl ani komponenta. Je bez zápisů a v produkci vrací 404. Veřejná lekce zůstává nedostupná. `npm run test:foundations-checkpoint-browser` ověřuje chybu → textovou zpětnou vazbu → opravu → pokračování, klávesnici a fokus, 320/390/1440 px a 200% text. [Ověřené snímky všech kroků](../design/lesson-steps/issue-164/README.md) jsou přiložené v repozitáři. Suite při 390/1440 px ukládá do `test-results/foundations-checkpoint`; porovnat se sdílenými vzory C/G/M a katalogem `docs/education/lesson-steps.md`.

## Co blokuje publikaci

1. Dokončit #163 a upravit předpoklad i odkaz u interpretace přehledu na skutečnou lekci 1.1.9. Nynější odkaz vede na dostupné fondy (1.1.8).
2. #130 musí dodat samostatné ukládání měření; #124 musí používat stejný český nástroj. `bigThreeQuestions` exportuje stabilní ID, přesné znění, pořadí možností a klíče; snapshot je zamyká. Případnou změnu verzovat jako jiný nástroj, nepřepisovat historické odpovědi.
3. Před zpřístupněním ukládat každou první odpověď Big Three včetně `unknown`, verzi nástroje, fázi vstup/výstup a čas; identitu odvodit ze session, správnost přepočítat na serveru. Opakované doručení nesmí přepsat první odpověď; oprava nesmí změnit původní měření. Samotný kurzor ani booleovské `skill_attempt.correct` nerozlišují nevím od jiné chyby a nejsou náhradou. Přidat retry, ownership, export a mazání účtu do persistence testů.
4. Chybné úlohy napojit na skutečnou frontu opakování. Současný náhled ukazuje zpětnou vazbu/odkaz, ale nic neukládá a nezařazuje do opakování. Nevydávat opravenou otázku za nezávislé měření retence.
5. Dokončit redakční kontrolu. Teprve publikační PR změní manifest na `available`, přesune obsah do `authoredLessons`, doplní mastery item bank a nový kontrakt do `published-lessons-v1.json`, a ověří seed, staré účtenky a odemčení na izolované QA DB. Žádná změna historických kontraktů ani zpětné přepočty odměn.

Tento návrh záměrně nepřidává jednorázové analytické úložiště ani novou frontu opakování vedle #130/#122. Dokud tyto body nejsou splněny, #164 není dokončená publikovaná lekce.
