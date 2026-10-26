# První akviziční kanály — #430

## A: veřejný průvodce

`/pruvodce/[slug]` má strukturovaný katalog v `features/guides/content.ts`. Odpovědi jsou serverem vyřešené tokeny faktů. Čtecí šablona, kalkulačky i akce používají současný designový systém; žádný nový vizuální blok. Kořenový layout kvůli nonce CSP vyžaduje renderování na serveru při požadavku, proto se nezavádí statické HTML bez nonce. Obsah průvodců nepotřebuje databázi.

| URL pod `/pruvodce/` | Stav a důvod | Fakty | Návazná publikovaná lekce |
| --- | --- | --- | --- |
| `rozpocet-a-mira-uspor` | publikováno: obecný princip, bez regulatorního výkladu | `plan.rozpocet@2026-10-26` | `before-investing-budget` |
| `kolik-stoji-poplatky` | publikováno: obecný dopad nákladů a označený model | `plan.naklady_fondu@2026-10-26` | `foundations-funds` |
| `co-je-etf` | publikováno: konstrukce fondu, žádná pravidla pro distribuci v EU ani daňové závěry | `plan.etf@2026-10-26` | `foundations-funds` |
| `sporit-nebo-investovat` | publikováno: cíle a riziko, bez univerzálního horizontu nebo doporučeného produktu | `plan.horizont@2026-10-26` | `before-investing-goals` |
| `jak-funguje-dip` | planned: chybí odborná revize, blokovaný rozsah podmínek | `dip.podminky@2026-10-21` | plánovaná lekce `before-investing-retirement-products` |
| `musim-danit-etf` | planned: chybí odborná revize, nedokončená evidence držby | `dan.limit_100k@2026-10-21`, `dan.casovy_test_cp@2026-10-21` | plánovaná `taxes-filing-obligation` |
| `jak-overit-brokera` | planned: chybí odborná revize postupu | `cnb.jerrs@2026-10-21` | plánovaná `broker-platform-types` |

Rezerva je odložená: související lekce je zatím planned a obsahuje i daňové/regulatorní části. To nebrání budoucí samostatné obecné odpovědi po zajištění publikované návaznosti.

Koncepty mají náhled jen za `next dev` na `/dev/pruvodce/[slug]`, s noindex. Veřejná URL vrací 404 v obou runtimech. Sitemap obsahuje jen publikované stránky. Metadata mají kanonickou adresu, OG a existující obrázek značky; Article JSON-LD odpovídá viditelné odpovědi, nikoli vymyšlenému FAQ.

`prepareGuide` používá existující `prepareLessonFacts` a `checkPublishedFacts`. Evidence odborných revizí zůstává jediná (`contentReviews`, pole `lessonId` obsahuje stabilní `guide-*` ID). Schválení musí zahrnout přesné verze faktů; změna textu potřebuje novou revizi podle redakčního checklistu. Kontrola běží v `check:facts`, prebuild i při renderování. Neznámé a chybné tokeny selžou také v konceptu. U neověřeného konceptu se nevymýšlí datum ověření.

Číselné hodnoty kalkulaček jsou výslovně modelové předpoklady a vstupy uživatele, nikoli publikované právní či tržní údaje. Sdílí se existující výpočty #129, včetně validace a české čárky. Nákladový příklad začíná třicetiletým horizontem. Nenabízí konkrétní fondy ani brokery, affiliate odkazy nebo výnosová doporučení.

## Souhrnné příchody ve funnelu

Beacon posílá jen povolený zdroj `seo:slug` nebo souhrn `share:investment-plan`. Nikdy neposílá sdílecí token, referrer, osobu ani vstupy kalkulačky. Respektuje GPC/DNT také na serveru, existující same-origin ochranu a IP rate limit. Migrace 0023 přidává denní souhrn `analytics_acquisition_day`; ve stejné transakci aktualizuje dosavadní souhrn veřejných návštěv. Žádné cookies ani localStorage, žádné třetí strany.

`analytics:funnel` vypisuje počty podle zdroje za posledních sedm a třicet pražských dnů. Jde o atribuci příchodů, nikoli o přiřazení konkrétní registrace či milníku návštěvníkovi. Zachovává minimalizaci #355: zobrazení nejsou unikátní lidé a nelze z nich tvrdit konverzi konkrétního kanálu. Milník A se nezpřístupňuje ani neuděluje změnou marketingu.

## Ověření A

- `npm run lint`, `npx next typegen`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check:facts`.
- `GROWTH_QA_DISPOSABLE=1 npm run test:growth-acquisition`: vyžaduje lokální `investi_growth_qa`; migruje, zkouší rerun, souběžné přírůstky a společný denominator funnelu.
- `npm run test:guides-browser`: nový produkční runtime na localhost:3148, nebo `GROWTH_TEST_URL`; SSR, metadata, OG, JSON-LD, sitemap, 404 konceptů, kalkulačka, klávesnice, axe WCAG A/AA, 1440/768/390/320 a 200% text. `GROWTH_DEV=1` ověří vývojové náhledy.
- Běžná vývojová DB se nemění. Fyzické telefony a čtečky obrazovky vyžadují samostatné ověření.

Výsledek ověření A dne 26. 10. 2026: všechny statické brány prošly; 212 souborů / 2 223 unit testů. Produkční i vývojový browser suite prošel v celém uvedeném rozlišení a s 200% textem; také přehled faktů (šest šířek, klávesnice a čerstvost). Screenshoty zkontrolované na desktopu a telefonu; kontrast společného tlačítka opraven tak, aby ho čtecí šablona nepřebarvovala. Integrace souběžných příchodů i rerun aditivní migrace prošly na samostatném lokálním PostgreSQL clusteru, port 5549. Běžný Docker ani vývojová databáze nebyly potřeba.
