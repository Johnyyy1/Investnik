# Kontrola 1: ověření investičních základů — #164

## Autorský brief

- Identita: `foundations-checkpoint`, úložný modul `module-investing-foundations`, slug `foundations-checkpoint`, URL `/learn/investing-foundations/foundations-checkpoint`. Rezervované ID se nemění.
- Umístění: L1, modul 1.1, kód 1.1.10, povinná kontrola. Odhad 10 minut včetně oprav a reflexe; zatím bez uživatelského měření délky.
- Výsledek: propojit kupní sílu, složené zhodnocení, diverzifikaci, přepočet měny, kotace, náklady a omezení historických přehledů. Všech 11 úloh musí být správně; opravy jsou povolené. Dokončení není důkazem retence ani připravenosti na skutečné investování.
- Předpoklady: lekce 1.1.1–1.1.9. Registr uvádí koncové větve grafu včetně publikované `foundations-active-vs-index` (1.1.9).
- Scénář: výslovně modelové příklady v Kč, jedna USD pozice s daným kurzem. Fiktivní přehled ve stylu SPIVA je počet 72 ze 100 fondů, nikoli historický výzkumný údaj. Lekce neuvádí tvrzení o třetině respondentů ani skutečnou úspěšnost fondů.
- Ověření: tři otázky Big Three proložené osmi úlohami (pozice, index/ETF, dluhopis/sazby, spread, složená změna, váha, vstupní poplatek, interpretace přehledu). Každá má vysvětlení, opravu a odkaz na dostupnou související lekci. Psaná reflexe je dočasná podle kontraktu `writtenReflection`.
- Přenos: vlastní kontrolní pravidlo před rozhodnutím; žádný povinný obchod. Checkpoint nenahrazuje praktický výstup modulu ani investiční plán.
- Fakta a revize: pouze modelové vstupy, žádná nová právní ani empirická tvrzení. Obsahová kontrola v publikační změně je uvedená níže; externí odborné schválení se nevymýšlí.
- Kompatibilita: publikovaná lekce pod rezervovaným ID; `status: available`, `authoredLessons`. Žádná změna veřejných lekcí, kurzorů, dokončení, účtenek ani grantů. První dokončení má podle stávající v4 nula cvičného kapitálu. Podmínky Labu zůstávají původních sedm Foundations + 420 XP.

## Náhled a design

V development runtime otevři `/dev/foundations-checkpoint`. Náhled používá existující `LessonDraftPreview`, `GuidedQuestion` a `GuidedBlock`; žádný nový typ kroku, styl ani komponenta. Je bez zápisů a v produkci vrací 404. Veřejná lekce používá standardní ukládání pokroku a dokončení. `npm run test:foundations-checkpoint-browser` ověřuje chybu → textovou zpětnou vazbu → opravu → pokračování, klávesnici a fokus, 320/390/1440 px a 200% text. [Ověřené snímky všech kroků](../design/lesson-steps/issue-164/README.md) jsou přiložené v repozitáři. Suite při 390/1440 px ukládá do `test-results/foundations-checkpoint`; porovnat se sdílenými vzory C/G/M a katalogem `docs/education/lesson-steps.md`.

## Publikace — rozhodnutí foundera 1. 11. 2026

Podle [rozhodnutí v #164](https://github.com/Johnyyy1/Investnik/issues/164#issuecomment-6562921144) lekci publikujeme bez měření prvních odpovědí. #130 zůstává v S2; není podmínkou publikace. Znění Big Three, ID možností, pořadí a klíče odpovědí zůstávají zamčené původním snapshotem pro pozdější měření. Kurzory ani běžné pokusy dovedností nejsou měřením prvních odpovědí včetně „nevím“.

Lekce je `available` v `authoredLessons`, s novým historickým kontraktem. Předpoklad i odkaz na interpretaci přehledu používají publikovanou `foundations-active-vs-index` (1.1.9). Big Three a interpretace přehledu mají položky v existující bance dovedností pro opakování; ostatní úlohy jsou běžná procvičování s vysvětlením a odkazem na lekci. Nezavádíme samostatnou frontu ani analytické úložiště.

Obsahová kontrola v publikační změně: všechny příklady jsou označené jako modelové, přehled fondů není prezentován jako výzkumný výsledek, neobsahuje nová právní fakta ani individualizovaná doporučení. Nejde o externí odborné schválení. Výjimka z běžné délky: 14 krátkých kroků pro 11 prokládaných úloh, reflexi a shrnutí.

Publikace nemění původních sedm předpokladů Labu ani 420 XP. První dokončení přidá 60 XP a nula cvičného kapitálu podle v4; opakování nic nepřidává. Historické kontrakty, dokončení, účtenky a granty se nepřepočítávají.
