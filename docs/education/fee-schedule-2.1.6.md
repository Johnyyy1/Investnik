# 2.1.6 — Jak číst ceník brokera

Implementace [#170](https://github.com/Johnyyy1/Investnik/issues/170). Publikovaná lekce.

- Identita: `broker-fee-schedule`, úložný modul `module-broker-and-account` (slug `broker-and-account`), slug `reading-a-fee-schedule`; URL `/learn/broker-and-account/reading-a-fee-schedule`.
- Umístění: L2, modul 2.1, pořadí 6, povinná, předpoklad `foundations-markets` (spread, 1.1.5), dovednost `fee-schedule`. Plánovaný předpoklad 2.1.5 (#169) ještě neexistuje; 2.1.1 zůstává konceptem. Odhad 12 minut je autorský, ne měřený.
- Modul `broker-and-account` je nově `available` a v úložném pořadí poslední (za `costs`), takže stávajícím učícím se doporučení nepředbíhá. Doporučení: nový důvod `BROKER_FEES_AFTER_MARKETS`.
- Průchod: 11 kroků, předpověď (0,15 % ≠ 3 Kč) → fiktivní ceník Brokera L se šesti položkami (`documentTap`: obchod a konverze při jednorázovém nákupu v eurech) → pravidlo min/max se vzorcem a řešenými příklady (50 000 → 75 Kč, 2 000 → 60 Kč = 3 %, 500 000 → 600 Kč) → malý nákup (3 000 Kč → 60 Kč, 2 %) → velký nákup (800 000 Kč → 600 Kč) → skryté náklady u „0 Kč“ (spořicí plán 120 Kč vs. pokyny 840 Kč ročně) → datum ceníku a omyly → profil poplatků → ověřovací otázka → vlastní vysvětlení → Lab a shrnutí.
- Sdílené pravidlo: `tradeFeeMinor` v `src/features/portfolio/costs.ts` počítá procento s minimem a maximem v celých haléřích s jedním zaokrouhlením. Používá ho Portfolio Lab (`computeTradeCost`), testy lekce i formulář profilu; je připravené pro 2.2.5. Testy pokrývají hodnoty přesně na minimu a maximu.
- Profil poplatků (`fee-profile`, #127): formulář předvyplněný ceníkem lekce, uložení je dobrovolné (krok nevyžaduje artefakt). `fee_profile` dostal aditivní nepovinná pole `maximumOrderFeeMinor`, `custodyBasisPoints`, `custodyFreeUpToMinor`; starší profily zůstávají platné. Uložený profil nemění nákupy v Labu, ten dál používá vlastní fiktivní ceníky (#136).
- Všechna čísla jsou modelová, bez značek a datovaných faktů, proto lekce nemá `factContext`. Informace o nákladech podle MiFID II (ESMA) lekce záměrně nepopisuje: jde o regulatorní tvrzení, které by vyžadovalo odbornou revizi.
- Odměna podle politiky v4: L2 = 60 XP a 2 000 Kč cvičného kapitálu za první dokončení. Odemčení Labu se nemění.

## Ověření

- `reading-a-fee-schedule.test.ts`: identita, umístění, odměna, server odmítá chybnou a přijímá správnou odpověď na každém kroku, přepočet ceníku, příkladů, cvičení a spořicího plánu sdílenou funkcí, převod formuláře na profil.
- Kontrakt v `published-lessons-v1.json`; `test:curriculum-seed`, `test:curriculum-compatibility`, `test:artifacts-persistence`, `test:lesson-walkthrough` (včetně uložení profilu a 320 px při 200% textu), `test:progress-browser`, `test:studovna`, `test:product`, `test:marketing-browser` na jednorázové databázi.
