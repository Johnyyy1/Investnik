# Várka 1 odborné revize: dotazník pro daňového poradce

Issue: [#435](https://github.com/Johnyyy1/Investnik/issues/435). Navazuje na [redakční workflow](editorial-workflow.md) (#133) a [rešerši 27 bodů](reviews.md) (#134). **Prázdný formulář: neobsahuje žádné stanovisko ani schválení.** Odpovědi zapisuje správce repozitáře podle [postupu zápisu](editorial-workflow.md#jak-zapsat-revizi); jméno a kontakt recenzenta do repozitáře nepatří.

## Co poradce dostane

1. Tento dotazník.
2. Export konceptů: `npm run export:review-packet` vytvoří složku `review-packet/` (není v Gitu) s jedním Markdown dokumentem na každou lekci v `draftLessons` a přehledem `README.md`. Každý dokument obsahuje celý text všech kroků, otázky, možnosti, správné odpovědi a zpětnou vazbu. Fakty jsou dosazené z registru a u každého je uvedeno `klíč@verze`, hodnota, platnost, zdroj, datum ověření a poznámka redakce. ⚠ označuje neověřený nebo blokovaný údaj. Export nemění stav lekcí; všechny zůstávají `planned` a v produkci nedostupné.

Poradce nemusí spouštět aplikaci ani číst kód. Lekce 1.1.10 (kontrola základů) je v exportu také, ale nemá daňový ani regulatorní obsah a do této várky nepatří.

Odeslání balíčku je rozhodnutí správce repozitáře. Před odesláním znovu spusť export a zkontroluj, že verze faktů odpovídají seznamům níže. Pokud ne, aktualizuj tento dokument.

## Jak odpovídat

U každého tvrzení zaškrtni jednu možnost a případně doplň komentář:

- **ano**: tvrzení je pro modelovou situaci popsanou v lekci věcně správné;
- **ne**: tvrzení je nesprávné; do komentáře uveď správný stav a ustanovení;
- **upravit**: tvrzení je v jádru správné, ale potřebuje doplnit podmínku, výjimku nebo přesnější formulaci;
- **mimo mou odbornost**: tvrzení je třeba svěřit jinému odborníkovi (typicky regulatorní otázky v 0.1.6 a 2.1.1).

Prosíme o ustanovení a období, ze kterého odpověď vychází. U blokovaných bodů prosíme také o hraniční příklad. Celkové stanovisko k lekci se vztahuje k exportu a verzím faktů uvedeným u lekce. Jiná verze faktu nebo změněný text vyžaduje nové stanovisko.

## Odhad rozsahu

Stav exportu z 26. 10. 2026. Po změně obsahu přepočítá počty `npm run export:review-packet` (tabulka v `review-packet/README.md`). Normostrana = 1 800 znaků včetně mezer, počítáno z celého dokumentu včetně tabulky faktů.

| Lekce | Issue | Kroků | Slov textu lekce | Normostran | Otázek níže | Odhad revize |
| --- | --- | --- | --- | --- | --- | --- |
| 0.1.3 Rezerva: kolik a kde | [#150](https://github.com/Johnyyy1/Investnik/issues/150) | 12 | 1 547 | 7,0 | 6 | 2 h |
| 0.1.5 Penzijko a DIP | [#152](https://github.com/Johnyyy1/Investnik/issues/152) | 12 | 1 698 | 7,3 | 10 | 2,5 h |
| 0.1.6 Podvody a finfluenceři | [#153](https://github.com/Johnyyy1/Investnik/issues/153) | 15 | 1 778 | 7,6 | 7 | 2,25 h |
| 2.1.1 Typy investičních platforem | [#165](https://github.com/Johnyyy1/Investnik/issues/165) | 13 | 2 132 | 8,2 | 6 | 2,5 h |
| 2.4.1 Kdy podat daňové přiznání | [#183](https://github.com/Johnyyy1/Investnik/issues/183) | 14 | 1 838 | 9,6 | 13 | 3 h |
| **Lekce celkem** | | **66** | **8 993** | **39,7** | **42** | **12–13 h** |
| Posudky na 6 blokovaných bodů | | | | dotazník níže | 24 | 4,5–9 h |

Předpoklady odhadu, nikoli změřené hodnoty: čtení s kontrolou 15 min na normostranu, 3 min na uzavřenou otázku a 45–90 min na posudek blokovaného bodu včetně hraničního příkladu. Skutečný čas várky 1 zapiš do [#435](https://github.com/Johnyyy1/Investnik/issues/435) a podle něj uprav odhad pro dalších zhruba 17 lekcí S1.

## Stanoviska k lekcím

### 0.1.3 Rezerva: kolik a kde

Export `0.1.3-emergency-fund.md`, lekce `before-investing-emergency-fund`. Daňový obsah je v kroku 8; ostatní tvrzení jsou vzdělávací rámec. Fakty: `dan.urok_srazka@2026-10-21`, `makro.inflace@2026-10-21`, `makro.repo@2026-10-21`, `vklady.limit@2026-10-22` (všechny ověřené).

**150-01** · krok 8 · `dan.urok_srazka`  
Úroky z českého nepodnikatelského bankovního účtu běžného českého daňového rezidenta, fyzické osoby, se zdaňují srážkou 15 %; banka sráží daň z úroku, nikoli z celého zůstatku.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**150-02** · krok 8  
Srážku 15 % nelze automaticky přenést na podnikatelský účet, úrok u zahraničního brokera ani výnos fondu peněžního trhu.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**150-03** · kroky 6–9  
Výukový model počítá čistý úrok jako úrok × (1 − 15 %) při stálém zůstatku, stálé sazbě a jednom ročním připsání úroku, bez poplatků. Je toto zjednodušení pro modelový příklad přijatelné?  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**150-04** · krok 5 · `vklady.limit`  
Základní limit pojištění vkladů je 100 000 EUR na vkladatele u jedné instituce; účty u téže instituce se sčítají a limit není na každý účet zvlášť.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**150-05** · krok 5  
Fond peněžního trhu není pojištěným bankovním vkladem. Investiční účet má jiná pravidla ochrany majetku, která nehradí běžný pokles ceny investic.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**150-06** · krok 2 (nepovinné, redakční)  
Lekce uvádí „tři až šest měsíčních **výdajů**“ jako pravidlo palce. Ministerstvo financí uvádí tři až šest měsíčních **příjmů** ([reviews.md, bod 26](reviews.md#úplná-matice-položek-issue)); lekce výpočet z výdajů MF nepřipisuje. Je formulace bez výhrad?  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

Celkové stanovisko k 0.1.3 (export a verze faktů výše): ☐ bez výhrad ☐ s výhradami uvedenými výše ☐ nelze posoudit — Datum stanoviska: ______ — Odbornost (bez jména): ______

### 0.1.5 Penzijko a DIP: kolik ti přidá stát

Export `0.1.5-pension-and-dip.md`, lekce `before-investing-retirement-products`. Fakty: `dps.statni_prispevek@2026-10-21`, `zam.prispevek@2026-10-21` (ověřené); `dps.odpocet@2026-10-21`, `dip.podminky@2026-10-21` (⚠ blokované, viz [bod 19](#19-dip-penzijko-a-odpočty-2026)). Sazba 20 % a hranice 1 700 Kč jsou v lekci a jejím výpočtovém modelu, nikoli v registru.

**152-01** · krok 2 · `dps.statni_prispevek`  
Státní příspěvek k DPS náleží od vlastního příspěvku účastníka 500 Kč měsíčně a činí 20 % z měsíčního příspěvku, nejvýše 340 Kč při příspěvku alespoň 1 700 Kč. Příklady: 800 Kč → 160 Kč, 1 200 Kč → 240 Kč, 2 500 Kč → 340 Kč.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-02** · krok 2  
Příspěvek se posuzuje za každý měsíc zvlášť a příjemci starobního důchodu na něj nemají nárok. Je tato formulace přesná i po změně zákonem č. 128/2026 Sb. (`dps.zmeny_2026`)?  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-03** · kroky 4–5  
U DPS lze od základu daně odečíst jen část příspěvků nad hranicí pro maximální státní příspěvek, tj. (měsíční příspěvek − 1 700 Kč) za každý měsíc. Vklad 2 500 Kč měsíčně celý rok → odpočet 9 600 Kč; 3 000 Kč → 15 600 Kč.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-04** · kroky 4 a 6 · `dps.odpocet` ⚠  
Roční limit odpočtu 48 000 Kč je společný pro DPS, DIP, soukromé životní pojištění a pojištění dlouhodobé péče. Příklad: DIP 48 000 Kč ročně + DPS 3 000 Kč měsíčně → celkový odpočet 48 000 Kč.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-05** · krok 4  
Úspora na dani = odpočet × sazba daně; lekce používá modelovou sazbu 15 % a upozorňuje, že bez dostatečného základu daně odpočet nic neušetří.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-06** · krok 6 · `dip.podminky` ⚠  
K DIP stát nepřispívá. Podmínkou daňové podpory je současně trvání alespoň 120 měsíců a dosažení věku 60 let. Příklad: DIP založený ve 25 letech → výběr bez ztráty výhod nejdříve v 60 letech.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-07** · krok 8  
Předčasný výběr z DIP může vést k dodanění uplatněných odpočtů. Lekce neuvádí, za kolik let zpětně. Stačí tato formulace?  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-08** · krok 7 · `zam.prispevek`  
Příspěvek zaměstnavatele na DPS, DIP a další produkty spoření na stáří je za zákonných podmínek osvobozen od daně z příjmů zaměstnance do 50 000 Kč ročně souhrnně. Lekce záměrně netvrdí nic o pojistném (viz bod 19).  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-09** · kroky 8 a 12  
„Výhody platí za vázanost peněz do důchodového věku“: je tato zkratka přesná pro DPS i DIP, nebo je nutné u DPS uvést jiný věk či podmínky výplaty?  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**152-10** · krok 9  
Evin příklad: 1 700 Kč měsíčně do DPS → státní příspěvek 340 Kč měsíčně, 4 080 Kč ročně, odpočet 0 Kč.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

Celkové stanovisko k 0.1.5 (export a verze faktů výše): ☐ bez výhrad ☐ s výhradami uvedenými výše ☐ nelze posoudit — Datum stanoviska: ______ — Odbornost (bez jména): ______

### 0.1.6 Podvody, slibované výnosy a finfluenceři

Export `0.1.6-scams-and-finfluencers.md`, lekce `before-investing-scams`. Regulatorní obsah; pokud jde o otázky mimo daně, označ „mimo mou odbornost“. Fakt: `cnb.jerrs@2026-10-21` (ověřený). Mimo dotazník: přesný postup vyhledávání v JERRS ověří člověk za CAPTCHA ([podrobnosti](lesson-reviews/scams-and-finfluencers.md#zbývající-publikační-brány)).

**153-01** · krok 3  
Oprávnění se ověřuje v seznamech ČNB (JERRS): přesná právní entita, platnost a rozsah činností proti nabízené službě. Upozornění ČNB pro veřejnost se kontroluje zvlášť a chybějící varování není schválení.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**153-02** · krok 3  
Nejasný nebo chybějící záznam v registru není automatickým právním důkazem podvodu, ale důvodem neposílat peníze a ověřovat dál u regulátora.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**153-03** · krok 6  
Evropský pas umožňuje oprávněné investiční firmě z jiného členského státu působit přes hranice za příslušných podmínek a s notifikací. Banka, obchodník s cennými papíry a investiční zprostředkovatel mohou mít různá oprávnění.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**153-04** · kroky 7 a 8  
Notifikace pro ČR nepotvrzuje libovolnou službu ani český kompenzační režim. Pravidla nakládání s majetkem klientů a kompenzační režim neřeší pokles ceny investice.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**153-05** · krok 9  
Provize za registraci přes partnerský odkaz (affiliate) je střet zájmů, nikoli automatický důkaz podvodu. Lekce neuvádí žádnou zákonnou povinnost finfluencera ke zveřejnění. Je nutné ji doplnit?  
☐ ano (doplnit) ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**153-06** · krok 11  
Postup po platbě nebo vzdáleném přístupu: banka přes oficiální linku z jiného bezpečného zařízení, přerušení přístupu, změna hesel, uchování důkazů, trestní oznámení Policii ČR, oznámení ČNB. Oznámení regulátorovi nenahrazuje banku ani policii; vrácení peněz není zaručené.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**153-07** · krok 12  
„Recovery scam“: neznámý zachránce slibuje vrácení peněz za další poplatek; lekce radí nic neplatit a pokračovat s bankou a policií.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

Celkové stanovisko k 0.1.6 (export a verze faktů výše): ☐ bez výhrad ☐ s výhradami uvedenými výše ☐ nelze posoudit — Datum stanoviska: ______ — Odbornost (bez jména): ______

### 2.1.1 Typy investičních platforem

Export `2.1.1-platform-types.md`, lekce `broker-platform-types`. Regulatorní obsah je v krocích 3 a 6. Fakt: `cnb.jerrs@2026-10-21` (ověřený). Modelové poplatky jsou vymyšlené vstupy, ne tržní údaje.

**165-01** · krok 3  
Obchodník s cennými papíry má povolení provádět pokyny a obvykle vede majetek klientů. Investiční zprostředkovatel smí pokyny jen přijímat a předávat a majetek klientů nevede (zákon č. 256/2004 Sb.).  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**165-02** · krok 6  
Obchodník s povolením v jiném státě EU může na základě notifikace nabízet služby v ČR; hlavní dohled má regulátor domovského státu; ČNB jej eviduje ve svých seznamech jako zahraniční osobu.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**165-03** · krok 6  
Je nutné rozlišit pobočku od přeshraničního poskytování bez pobočky, například kvůli dohledu hostitelského státu nad pravidly jednání u pobočky?  
☐ ano (doplnit) ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**165-04** · krok 6  
Ochranu majetku a případný kompenzační systém určuje právo domovského státu; český režim se automaticky nepřenáší.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**165-05** · krok 2  
DIP není samostatný typ poskytovatele, ale režim smlouvy, který může nabízet broker, banka, správce i penzijní společnost.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**165-06** · kroky 2 a 5  
Robo-poradce je zařazen pod správu portfolia (rozhoduje algoritmus nebo správce podle dotazníku). Je zařazení přesné, nebo je třeba zmínit i režim investičního poradenství?  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

Celkové stanovisko k 2.1.1 (export a verze faktů výše): ☐ bez výhrad ☐ s výhradami uvedenými výše ☐ nelze posoudit — Datum stanoviska: ______ — Odbornost (bez jména): ______

### 2.4.1 Kdy musí investor podat daňové přiznání

Export `2.4.1-when-to-file.md`, lekce `taxes-filing-obligation`, pravidla k 24. 10. 2026. Fakty: `dan.dividendy_cz@2026-10-21`, `dan.limit_100k@2026-10-21`, `dan.oznameni_5m@2026-10-21` (ověřené); `dan.hranice_priznani@2026-10-24`, `dan.casovy_test_cp@2026-10-21`, `dan.lhuty_priznani@2026-10-22` (⚠ blokované, viz body [03](#03-časový-test-a-hraniční-den), [05](#05-hranice-pro-podání-přiznání-za-2026) a [21](#21-lhůty-přiznání-za-2026)). Všechny osoby jsou čeští daňoví rezidenti, investice mimo obchodní majetek.

**183-01** · krok 2 · `dan.hranice_priznani` ⚠  
Za rok 2026: obecně povinnost při ročních příjmech nad 50 000 Kč; u zaměstnance za zákonných podmínek, pokud jiné příjmy podle § 7–10 přesáhnou 20 000 Kč; daňová ztráta zakládá povinnost i pod obecnou hranicí.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-02** · krok 2  
Zaměstnanecká výjimka vyžaduje příjmy jen od jednoho nebo postupně od více zaměstnavatelů a podepsané prohlášení u všech. Souběžné zaměstnání ani chybějící prohlášení zjednodušený postup lekce neřeší.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-03** · krok 3  
Osvobozené příjmy a příjmy zdaněné českou srážkou podle zvláštní sazby se do hranic pro podání nezapočítávají.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-04** · krok 3 · `dan.limit_100k`, `dan.casovy_test_cp` ⚠  
U běžných cenných papírů se nejdřív posuzuje roční úhrn hrubých prodejních příjmů proti 100 000 Kč, potom osvobození podle držby přesahující 3 roky.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-05** · krok 3 · `dan.dividendy_cz`  
České dividendy běžného rezidenta podléhají srážce 15 % u zdroje a kvůli nim samotným se přiznání nepodává. Zahraniční dividendy jsou příjmem podle § 8 a zahraniční srážka není českou konečnou srážkou.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-06** · krok 4  
Jana (jeden zaměstnavatel, prohlášení): ETF koupené v roce 2021 prodané v roce 2026 za 80 000 Kč je osvobozené; hrubé zahraniční dividendy 4 000 Kč jsou pod zaměstnaneckou hranicí. Přiznání kvůli těmto příjmům podávat nemusí.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-07** · krok 4  
Konzervativní postup lekce: u neosvobozeného prodeje se s hranicí porovnává hrubý příjem z prodeje, nikoli rozdíl po nákupní ceně (viz [bod 05](#05-hranice-pro-podání-přiznání-za-2026)).  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-08** · krok 6  
Adam (zaměstnanec s prohlášením) s hrubými zahraničními dividendami 25 000 Kč musí podat přiznání; zahraniční srážka tuto povinnost neruší.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-09** · krok 7  
Bára (zaměstnankyně s prohlášením) s českými dividendami 30 000 Kč s konečnou srážkou kvůli nim přiznání podávat nemusí.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-10** · kroky 8–9  
Cyril (student bez jiných příjmů) koupil ETF 15. 6. 2025 za 120 000 Kč a prodal 15. 6. 2026 za 150 000 Kč, jediný prodej roku. Prodej není osvobozený (úhrn přesahuje 100 000 Kč, držba nepřesáhla 3 roky), hrubý příjem 150 000 Kč přesahuje obecnou hranici, takže podává.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-11** · krok 10  
Daňová ztráta (v modelu z podnikání) je samostatný důvod k podání. Ztrátový prodej cenného papíru ani nerealizovaný pokles portfolia automaticky daňovou ztrátou nejsou.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-12** · krok 11 · `dan.lhuty_priznani` ⚠  
Příjmy roku 2026 se řeší v přiznání podávaném v roce 2027. Konkrétní termíny lekce záměrně neuvádí, dokud nejsou ověřené (viz [bod 21](#21-lhůty-přiznání-za-2026)).  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

**183-13** · krok 11 · `dan.oznameni_5m`  
Osvobozený příjem nad 5 000 000 Kč může vyžadovat samostatné oznámení. Posuzuje se jednotlivý příjem a zákonné výjimky, nikoli automaticky roční součet.  
☐ ano ☐ ne ☐ upravit ☐ mimo mou odbornost — Komentář:

Celkové stanovisko k 2.4.1 (export a verze faktů výše): ☐ bez výhrad ☐ s výhradami uvedenými výše ☐ nelze posoudit — Datum stanoviska: ______ — Odbornost (bez jména): ______

## Posudky na blokované body

Body z [matice rešerše](reviews.md#úplná-matice-položek-issue), seřazené podle počtu lekcí S1, které odblokují. Počet vychází z faktů a témat uvedených v issues lekcí k 26. 10. 2026; nejde o úplnou analýzu závislostí. U každého bodu prosíme o účinné znění pro rok 2026, výjimky a alespoň jeden hraniční příklad. Odpověď „ano“ znamená potvrzení pro modelovou fyzickou osobu, českého daňového rezidenta, s cennými papíry mimo obchodní majetek.

| Bod | Téma | Lekce S1 | Funkce Labu ([#390](https://github.com/Johnyyy1/Investnik/issues/390)) |
| --- | --- | --- | --- |
| [03](#03-časový-test-a-hraniční-den) | Časový test a hraniční den | 7 | Datum osvobození tranše, karta < 30 dní před osvobozením (#141), odhad § 10 |
| [04](#04-párování-tranší) | Párování tranší | 3 | Párování prodejů jako daňové pravidlo |
| [05](#05-hranice-pro-podání-přiznání-za-2026) | Hranice pro podání přiznání 2026 | 3 | — |
| [07](#07-jednotný-kurz-za-2026) | Jednotný kurz 2026 | 3 | Volba daňového přepočtu oddělená od obchodní konverze |
| [19](#19-dip-penzijko-a-odpočty-2026) | DIP, penzijko a odpočty 2026 | 2 | — |
| [21](#21-lhůty-přiznání-za-2026) | Lhůty přiznání za 2026 | 1 | — |

### 03 Časový test a hraniční den

Odblokuje `dan.casovy_test_cp` a `dan.datum_casoveho_testu`, případně i písmena v `dan.odkazy_cp` (bod 01). Lekce: 2.3.3 ([#178](https://github.com/Johnyyy1/Investnik/issues/178)), 2.4.1 ([#183](https://github.com/Johnyyy1/Investnik/issues/183)), 2.4.2 ([#184](https://github.com/Johnyyy1/Investnik/issues/184)), 2.4.3 ([#185](https://github.com/Johnyyy1/Investnik/issues/185)), 2.4.4 ([#186](https://github.com/Johnyyy1/Investnik/issues/186)), 2.4.8 ([#190](https://github.com/Johnyyy1/Investnik/issues/190)), 2.4.9 ([#191](https://github.com/Johnyyy1/Investnik/issues/191)). Lab: datumový predikát osvobození tranše a karta při prodeji méně než 30 dní před osvobozením; odhad § 10 závisí na klasifikaci podle časového testu.

Potřebujeme slyšet: přesné ustanovení a písmeno pro rok 2026, rozhodný okamžik nabytí a převodu zahraničních zaknihovaných cenných papírů u brokera a výpočet dne výročí.

**03-a** Prodej cenného papíru nabytého a převedeného fyzickou osobou mimo obchodní majetek je v roce 2026 osvobozen, pokud doba mezi nabytím a převodem přesáhne 3 roky. Ustanovení: ______  
☐ ano ☐ ne ☐ upravit — Komentář:

**03-b** Rozhodným okamžikem nabytí a převodu u zahraničních zaknihovaných cenných papírů vedených brokerem je:  
☐ den obchodu (pokynu) ☐ den vypořádání ☐ jiný — Komentář:

**03-c** Hraniční příklad: nákup 15. 6. 2023 (den obchodu i vypořádání). První den, kdy je prodej osvobozen:  
☐ 15. 6. 2026 ☐ 16. 6. 2026 ☐ jiný: ______ — Komentář:

**03-d** Roční výpis brokera s daty obchodů je dostatečným dokladem data nabytí pro časový test.  
☐ ano ☐ ne ☐ upravit — Komentář:

### 04 Párování tranší

Odblokuje `dan.parovani_transi`. Lekce: 2.4.2 ([#184](https://github.com/Johnyyy1/Investnik/issues/184)), 2.4.4 ([#186](https://github.com/Johnyyy1/Investnik/issues/186)), 2.4.9 ([#191](https://github.com/Johnyyy1/Investnik/issues/191)). Lab: párování prodejů jako daňové pravidlo; dnešní FIFO v daňové mapě je jen předpoklad simulace. Výsledek použije specifikace evidence pro #390 (částečné a frakční prodeje).

Potřebujeme slyšet: jakou metodou neúčtující fyzická osoba přiřazuje prodané kusy k tranším, zda musí být metoda konzistentní a co ji prokazuje.

**04-a** Při prodeji části držby téhož cenného papíru nakoupeného v několika tranších se prodané kusy přiřazují:  
☐ povinně FIFO ☐ identifikací konkrétní tranše, je-li doložitelná ☐ váženým průměrem ☐ jinak: ______ — Komentář:

**04-b** Zvolenou metodu je nutné používat konzistentně (napříč roky, u všech brokerů nebo pro daný cenný papír).  
☐ ano ☐ ne ☐ upravit — Komentář:

**04-c** Jeden prodej může zahrnout osvobozené tranše (splněný časový test) i zdanitelné tranše; posuzují se odděleně.  
☐ ano ☐ ne ☐ upravit — Komentář:

**04-d** Evidence, která párování prokáže (např. výpis brokera s identifikací tranše, vlastní evidence nákupů): ______  
Komentář:

### 05 Hranice pro podání přiznání za 2026

Odblokuje `dan.hranice_priznani@2026-10-24`. Lekce: 2.3.3 ([#178](https://github.com/Johnyyy1/Investnik/issues/178)), 2.4.1 ([#183](https://github.com/Johnyyy1/Investnik/issues/183)), 2.4.5 ([#187](https://github.com/Johnyyy1/Investnik/issues/187)). Lab: žádná přímá funkce.

Potřebujeme slyšet: účinné znění § 38g pro rok 2026 a zda se u zdanitelného prodeje podle § 10 porovnává s hranicí hrubý příjem, nebo rozdíl po výdajích.

**05-a** Pro rok 2026 platí obecná hranice 50 000 Kč a pro zaměstnance splňujícího podmínky hranice 20 000 Kč jiných příjmů podle § 7–10.  
☐ ano ☐ ne ☐ upravit — Komentář:

**05-b** U zdanitelného prodeje cenného papíru se pro tyto hranice posuzuje:  
☐ hrubý příjem z prodeje ☐ rozdíl po odečtení výdajů ☐ jinak — Komentář:

**05-c** Hraniční příklad: zaměstnanec s prohlášením, jediný zdanitelný prodej za 30 000 Kč, nákup za 28 000 Kč, žádné jiné příjmy. Musí podat přiznání?  
☐ ano ☐ ne — Komentář:

**05-d** Příjem přesně ve výši hranice (20 000 Kč) povinnost nezakládá; rozhoduje přesažení hranice.  
☐ ano ☐ ne ☐ upravit — Komentář:

### 07 Jednotný kurz za 2026

Odblokuje verzi `dan.jednotny_kurz` pro rok 2026 (verze za 2025 zůstává historická). Lekce: 2.4.5 ([#187](https://github.com/Johnyyy1/Investnik/issues/187)), 2.4.6 ([#188](https://github.com/Johnyyy1/Investnik/issues/188)), 2.4.9 ([#191](https://github.com/Johnyyy1/Investnik/issues/191)). Lab: volba daňového přepočtu (denní kurz ČNB nebo jednotný kurz), oddělená od obchodní konverze; testy kurzů s více desetinnými místy.

Potřebujeme slyšet: znění § 38 od 1. 1. 2026 pro neúčtující fyzickou osobu a pravidla volby a konzistence přepočtu.

**07-a** Neúčtující fyzická osoba může pro příjmy roku 2026 v cizí měně použít jednotný kurz. Ustanovení: ______  
☐ ano ☐ ne ☐ upravit — Komentář:

**07-b** Hodnoty jednotného kurzu za 2026 nelze uvádět před vydáním příslušného pokynu GFŘ; lekce je do té doby neuvádí.  
☐ ano ☐ ne ☐ upravit — Komentář:

**07-c** Zvolený způsob přepočtu (denní kurz ČNB nebo jednotný kurz) musí být jednotný pro všechny příjmy a výdaje daného roku; nákup z dřívějšího roku se přepočítá podle pravidel roku nákupu.  
☐ ano ☐ ne ☐ upravit — Komentář:

**07-d** Daňový přepočet je samostatný od kurzu, za který broker skutečně směnil měnu.  
☐ ano ☐ ne ☐ upravit — Komentář:

### 19 DIP, penzijko a odpočty 2026

Odblokuje `dps.odpocet`, `dip.podminky` a `zam.pojistne`. Lekce: 0.1.5 ([#152](https://github.com/Johnyyy1/Investnik/issues/152)), 2.4.8 ([#190](https://github.com/Johnyyy1/Investnik/issues/190)); také veřejný průvodce `guide-dip` ([#430](https://github.com/Johnyyy1/Investnik/issues/430)). Lab: žádná přímá funkce.

Potřebujeme slyšet: úplná pravidla odpočtu a DIP pro rok 2026 včetně výjimek a dodanění a vztah příspěvku zaměstnavatele k pojistnému.

**19-a** Pro rok 2026 platí společný roční limit odpočtu 48 000 Kč pro DPS, DIP, soukromé životní pojištění a pojištění dlouhodobé péče.  
☐ ano ☐ ne ☐ upravit — Komentář:

**19-b** U DPS se odečítají příspěvky snížené o 1 700 Kč za každý měsíc, na který byly zaplaceny.  
☐ ano ☐ ne ☐ upravit — Komentář:

**19-c** DIP: daňová podpora vyžaduje současně alespoň 120 měsíců trvání a věk 60 let, i pro smlouvy uzavřené před rokem 2026. Výjimky: ______  
☐ ano ☐ ne ☐ upravit — Komentář:

**19-d** Při předčasném výběru z DIP se dodaňují odpočty uplatněné za období: ______ ; lekce má rozsah uvádět:  
☐ ano ☐ ne — Komentář:

**19-e** Příspěvek zaměstnavatele osvobozený od daně do 50 000 Kč ročně je v roce 2026 také vyloučen z vyměřovacího základu sociálního a zdravotního pojistného.  
☐ ano ☐ ne ☐ upravit — Komentář:

**19-f** Zákon č. 128/2026 Sb. ani návrh změn s účinností 2027 nemění pravidla použitá v 0.1.5 pro běžného účastníka mladšího 60 let.  
☐ ano ☐ ne ☐ upravit — Komentář:

### 21 Lhůty přiznání za 2026

Odblokuje verzi `dan.lhuty_priznani` pro zdaňovací období 2026 (verze za 2025 zůstává historická). Lekce: 2.4.1 ([#183](https://github.com/Johnyyy1/Investnik/issues/183)). Lab: žádná přímá funkce.

Potřebujeme slyšet: konkrétní termíny za rok 2026 (podání v roce 2027) včetně posunu na pracovní den a podmínky prodloužených lhůt.

**21-a** Pro přiznání za rok 2026 platí stejná pravidla běhu lhůt jako za rok 2025 (listinně, elektronicky, s poradcem nebo při povinném auditu).  
☐ ano ☐ ne ☐ upravit — Komentář:

**21-b** Konkrétní termíny za rok 2026: listinně ______, elektronicky ______, s poradcem / auditem ______; podmínky: ______  
Komentář:

## Další blokované body mimo várku 1

Pro nacenění dalších várek. Výsledky a důvody blokace jsou v [matici rešerše](reviews.md#úplná-matice-položek-issue).

| Bod | Téma | Lekce S1 |
| --- | --- | --- |
| 01 | Písmena § 4 odst. 1 | Všechny daňové lekce (dnes je necitují) |
| 12, 13 | Zápočet AT/NL/FR; USA uvnitř irského fondu | 2.3.1 (#176), 2.3.3 (#178), 2.4.5 (#187) |
| 14 | Řádky tiskopisu a § 16a | 2.4.5 (#187) |
| 17 | Zahraniční kompenzační schémata | 2.1.2 (#166) |
| 18 | PRIIPs KID a UCITS (regulatorní) | 2.3.1 (#176), 2.3.2 (#177) |
| 22 | Uchování dokladů | 2.4.9 (#191) |
