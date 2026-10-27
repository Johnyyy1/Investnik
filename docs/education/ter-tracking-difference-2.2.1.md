# 2.2.1 — TER a rozdíl ve výkonnosti vůči indexu

Implementace [#171](https://github.com/Johnyyy1/Investnik/issues/171). Publikovaná lekce.

- Identita: `costs-ter-tracking-difference`, nový úložný modul `module-costs` (slug `costs`), slug `ter-and-tracking-difference`; URL `/learn/costs/ter-and-tracking-difference`.
- Umístění: L2, modul 2.2, pořadí 1, povinná, předpoklad `foundations-funds` (#162), dovednosti `tracking-difference` a `fund-costs`. Odhad 11 minut je autorský, ne měřený.
- Průchod: 12 kroků, předpověď (nižší TER ≠ jistě levnější fond) → TER a jak se platí → rozdíl vůči indexu se vzorcem a řešeným příkladem (+8,00 %: A −0,15, B −0,20 p. b.) → samostatný výpočet (6,22 − 6,40 = −0,18 p. b.) → proč rozdíl není přesně −TER → průměr za 3 roky (−0,143 vs. −0,203 p. b.) → kolísání rozdílu (tracking error) → časté omyly → dvě ověřovací otázky → vlastní vysvětlení → Lab a shrnutí.
- Všechna čísla jsou modelová. Lekce nejmenuje skutečné fondy ani brokery a nepoužívá datovaná fakta, proto nemá `factContext` ani odbornou revizi; srážkové daně popisuje obecně bez sazeb. KID zmiňuje jen obecně (`eu.priips_ucits` je publikačně blokovaný). Termíny podle [slovníku](../terminology.md) a definic ESMA/2014/937.
- Odměna podle politiky v4: L2 = 60 XP a 2 000 Kč cvičného kapitálu za první dokončení. Odemčení Labu se nemění.
- Lab: přehled ETF na detailu instrumentu odkazuje na lekci vedle údaje Nákladovost. Rozdíl vůči indexu Investník nepočítá (chybí výnosy fondu i indexu ve stejné metodice, [agentní pravidla § 20](../agents/finance-and-data.md#20-backtest-metrics-and-conventions)) a lekce to výslovně říká.
- Doporučení: nový důvod `COSTS_AFTER_FUNDS`. Modul je v úložném pořadí poslední, takže stávajícím učícím se doporučení nepředbíhá.

## Ověření

- `ter-and-tracking-difference.test.ts`: identita, umístění, odměna, server odmítá chybnou a přijímá správnou odpověď na každém kroku, přepočet řešeného příkladu, cvičení (včetně znaménka) a průměrů ze zobrazené tabulky.
- Kontrakt v `published-lessons-v1.json`; `test:curriculum-seed`, `test:curriculum-compatibility`, `test:lesson-walkthrough` (chybně → oprava → pokračování, obnovení, jedna účtenka 2 000 Kč, 1440/390/320 px, axe), `test:progress-browser`, `test:studovna`, `test:product`, `test:portfolio-browser` na jednorázové databázi.
