# Redakční workflow, odborná revize a kalendář údržby — CONTENT-02

Issue: [#133](https://github.com/Johnyyy1/Investnik/issues/133). Navazuje na [registr faktů](facts.md) (#132) a [standard lekce](lesson-standard.md). Nepřidává externí CMS ani automatické plánované úlohy.

## Stavy obsahu lekce

Stav se neukládá zvlášť; odvozuje se z manifestu lekce (`status`) a z [evidence revizí](../../src/features/facts/content-reviews.ts). Díky tomu nemůže redakční stav tiše rozejít s tím, co je skutečně publikováno.

| Stav | Kdy platí | Kdo posouvá dál |
| --- | --- | --- |
| **Koncept** | Manifest `status: "planned"`, žádné schválení. | Autor otevře PR s obsahovým checklistem. |
| **Odborná revize** | Daňová/regulatorní lekce čeká na poradce nebo poslední záznam je `changes-requested`. | Recenzent zapíše výsledek do evidence. |
| **Schváleno** | Poslední záznam je `approved` a pokrývá přesně aktuální verze použitých faktů; manifest je stále `planned`. | Vlastník obsahu přepne `status: "available"`. |
| **Publikováno** | Manifest `status: "available"`. | — |
| **K aktualizaci** | Fakt překročil `nextReviewAt`, platí jiná verze faktu, než jakou recenzent viděl, nebo se změnil text schválené lekce. | Vlastník faktu přidá novou verzi; daňová lekce jde znovu do odborné revize. |

Odbornou revizi daňovým poradcem vyžaduje každá lekce s `factContext.kind: "tax"` nebo `"regulatory"`. Ostatní obsah stačí jednou ročně zrevidovat redakčně; záznam patří do souboru lekce v [lesson-reviews](lesson-reviews/).

### Co hlídá CI

`npm run check:facts` (běží v unit testech CI, v `prebuild` a ve `vercel-build`) odmítne publikovanou daňovou či regulatorní lekci, pokud:

- nemá žádný záznam revize nebo poslední záznam není `approved`;
- schválení neuvádí přesně ty verze faktů (`klíč@verze`), které lekce dnes vykreslí tokeny i blokem `factNotice`;
- záznam má datum v budoucnosti.

Nová verze faktu (například lednová sazba s `validFrom` k 1. 1.) tedy publikovanou daňovou lekci zablokuje, dokud ji poradce znovu neschválí. Je to záměr: schválena byla konkrétní čísla, ne lekce obecně. Změnu samotného textu CI nepozná; u schválené daňové lekce ji hlídá PR checklist a vyžaduje nový záznam.

### Jak zapsat revizi

1. Přidej záznam do `contentReviews` v [content-reviews.ts](../../src/features/facts/content-reviews.ts): `lessonId`, role recenzenta (ne jméno ani kontakt), datum, rozhodnutí a seznam `klíč@verze`. Chybová hláška `check:facts` vypíše aktuální seznam verzí.
2. Do [reviews.md](reviews.md#evidence-odborných-revizí-lekcí) přidej řádek začínající `lessonId · datum` se shrnutím připomínek a odkazem na PR. Test kontroluje, že každý záznam v kódu má řádek v dokumentu.
3. Záznamy se nepřepisují ani nemažou; nová revize je nový záznam.

### Od odpovědi poradce k záznamu

Podklady pro poradce vytvoří `npm run export:review-packet` (složka `review-packet/`, mimo Git) a dotazník [review-batch-1.md](review-batch-1.md). Datum exportu a verze faktů z jeho tabulky „Použité fakty“ jsou to, co poradce posuzoval; ulož si je k odeslané verzi.

Každý záznam vzniká ze skutečné písemné odpovědi a jen pro lekci, ke které poradce dal celkové stanovisko:

| Údaj | Odkud |
| --- | --- |
| `lessonId` | Hlavička exportu („Stabilní ID“) |
| `role` | Odbornost bez jména, např. „Externí daňový poradce“; smlouva a kontakt zůstávají mimo repozitář |
| `reviewedAt` | Datum písemného stanoviska, ne datum commitu; nikdy budoucí ani odhadnuté |
| `decision` | `approved` jen při stanovisku „bez výhrad“ a odpovědích „ano“ u všech tvrzení lekce; jinak `changes-requested` |
| `facts` | `klíč@verze` z tabulky exportu, který poradce dostal |

Řádek v [reviews.md](reviews.md#evidence-odborných-revizí-lekcí): `lessonId · datum · role · rozhodnutí · verze faktů · PR`, za ním ID tvrzení s odpovědí jiné než „ano“ a jejich stručné shrnutí (například „183-07 upravit: …“).

**Odpověď „ne“ nebo „upravit“:**

1. Zapiš záznam `changes-requested` s verzemi faktů, které poradce viděl, a řádek v reviews.md s ID připomínek.
2. V samostatném PR uprav lekci, případně fakty. Nové hodnoty faktu jsou vždy nová verze se zdrojem, nikdy přepis staré.
3. Znovu spusť export a pošli poradci změněné kroky spolu s připomínkami, na které reagují.
4. Nové stanovisko je nový záznam. Starý záznam `changes-requested` zůstává beze změny.

**„Mimo mou odbornost“:** tvrzení zůstává otevřené, záznam `approved` pro lekci nevzniká, dokud se k němu nevyjádří jiný odborník. Jeho stanovisko je samostatný záznam s vlastní rolí.

**Posudek na blokovaný bod** (dotazník, část „Posudky na blokované body“):

1. Přidej novou verzi faktu: hodnota podle posudku, zdroj s účinným zněním, které poradce uvedl, `verificationStatus: "primary"`, `verifiedAt` = datum posudku a v `notes` odkaz na řádek v reviews.md. `publicationBlockedBy` odeber jen tehdy, když posudek pokrývá celý popsaný rozsah.
2. V [matici rešerše](reviews.md#úplná-matice-položek-issue) doplň k bodu výsledek posudku s datem a rolí. Uprav [research-134.test.ts](../../src/features/facts/research-134.test.ts), který odmítnutí publikace blokovaného klíče hlídá.
3. Lekce, která fakt používá, potřebuje schválení s novou verzí faktu. Pokud se změnil jen stav nebo verze faktu a ne text, ověř to na rozdílu dvou exportů a v záznamu to uveď. Jinak lekci pošli k nové revizi.

Zápis schválení lekci nepublikuje. Publikace (manifest `available`, přesun z `draftLessons`, kontrakt a gates) je samostatný krok popsaný v dokumentu lekce.

## Vlastníci

Vlastník je role. Dokud není role přidělena konkrétnímu člověku, odpovídá za ni správce repozitáře. Přidělení se zapisuje sem.

| Role | Kategorie faktů (prefix klíče) | Kontrola |
| --- | --- | --- |
| Redakce — daně a regulace | `dan`, `krypto`, `zam`, `dip`, `dps`, `esma`, `eu`, `gfo`, `vklady` | Externí daňový poradce schvaluje daňové a regulatorní lekce |
| Redakce — makrodata | `makro`, `cnb` | Redakční |
| Redakce — výzkum | `spiva`, `morningstar`, data Damodarana a French library | Redakční |
| Redakce — finanční připravenost | `plan` (rezerva, rozpočet a další lekce úrovně 0) | Redakční |
| Redakce — účetní výkaznictví | `ucto` | Redakční |
| Správce kurikula | Ostatní obsah lekcí, roční redakční revize | Redakční |

Pole `owner` ve [registru faktů](../../src/features/facts/registry.ts) a [research-134.ts](../../src/features/facts/research-134.ts) používá role z této tabulky.

## Roční kalendář údržby

| Kdy | Co zkontrolovat | Vlastník |
| --- | --- | --- |
| **Leden** | Pokyn GFŘ k jednotnému kurzu, sazby a hranice daně, legislativa účinná k 1. 1.; nové verze faktů a opětovná revize daňových lekcí | Redakce — daně a regulace |
| **Únor–březen** | Lhůty daňového přiznání; sezónní zvýraznění modulu 2.4 | Redakce — daně a regulace |
| **Měsíčně** | Inflace ČSÚ, sazba ČNB (po zasedání bankovní rady) | Redakce — makrodata |
| **Pololetně** (leden, červenec) | DIP, penzijní spoření, SPIVA, data Damodarana, French library | Redakce — výzkum; DIP a penzijko Redakce — daně a regulace |
| **Ročně** | Redakční revize každé publikované lekce do 12 měsíců od poslední | Správce kurikula |
| **Ad hoc** | EU Retail Investment Strategy a další legislativa; termíny až po vyhlášení v Úředním věstníku EU | Redakce — daně a regulace |

Kromě kalendáře řídí kontrolu jednotlivých faktů jejich `nextReviewAt`; po jeho překročení se v `/dev/facts` objeví příznak a později upozornění v lekci (viz [údržba faktů](facts.md#revize-a-údržba)).

### Připomínky: rozhodnutí

Kalendář se plní **ručně zakládanými opakovanými GitHub issues** ze šablony [Údržba obsahu](../../.github/ISSUE_TEMPLATE/content-maintenance.md). Vlastník založí issue na začátku každého období; tím má údržba vlastníka, termín a stopu v historii. Naplánovaná automatika (cron, GitHub Actions) se záměrně nezavádí: AGENTS.md ji pro údržbu obsahu nepovoluje bez samostatného rozhodnutí a stávající `nextReviewAt` už zastaralost faktů signalizuje.
