import type { AuthoredLesson } from "../types";
import { costsLessons } from "./manifest";
const lesson = costsLessons.find((entry) => entry.id === "costs-currency-conversion")!;

export const currencyConversionLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "costs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Poplatky a celkové náklady", position: 3, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Pavlův nákup" }, { id: "conversion", label: "Náklad konverze" }, { id: "currency-risk", label: "Měnové riziko" }, { id: "reduce", label: "Jak ušetřit" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Pavel posílá brokerovi 10 000 Kč měsíčně. Broker koruny převede na eura a koupí celosvětový akciový burzovně obchodovaný fond (ETF), který se na burze obchoduje v EUR. Pavel se ptá: „Mám teď měnové riziko vůči euru?“" },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Na kterých měnách bude hlavně záviset hodnota Pavlova ETF v korunách?", options: [
      { id: "eur", label: "Jen na kurzu EUR/CZK, protože ETF se obchoduje v eurech.", misconception: "měna obchodování = měnové riziko", explanation: "Euro je jen měna, ve které burza ETF kotuje. Cena v eurech se přepočítává z cen akcií v jejich vlastních měnách." },
      { id: "inside", label: "Na měnách akcií uvnitř fondu, hlavně na americkém dolaru." },
      { id: "none", label: "Na žádné, Pavel přece platí korunami.", misconception: "nákup v Kč odstraní měnové riziko", explanation: "Koruny se při nákupu převedou. Hodnota fondu pak dál závisí na tom, v jakých měnách jsou jeho akcie." },
    ], correctOptionId: "inside", correctExplanation: "Celosvětový akciový fond drží z velké části akcie amerických firem. Jejich cena v USD a kurz dolaru se promítnou do ceny v EUR i do hodnoty v Kč.", incorrectExplanation: "Odděl dvě věci: v jaké měně se ETF obchoduje a v jakých měnách jsou aktiva uvnitř fondu." },

    { id: "conversion", type: "explanation", title: "Konverze je skrytá v kurzu", content: "Referenční kurz je střed trhu, například kurz, který zveřejňuje ČNB. Broker nebo banka obvykle měnu neprodá přesně za něj, ale přičte přirážku. Na výpisu proto často nevidíš žádný poplatek, náklad je schovaný v horším kurzu. Spočítáš ho jako rozdíl mezi tím, co dostaneš za referenční kurz, a tím, co dostaneš za kurz brokera." },
    { id: "worked", type: "workedExample", title: "Modelový příklad · Pavlových 10 000 Kč", introduction: "Fiktivní referenční kurz 24,30 Kč/EUR, broker přičítá 0,5 %. Eura zaokrouhlujeme na centy, koruny na haléře.", steps: [
      { label: "Za referenční kurz", value: "10 000 ÷ 24,30 = 411,52 EUR" },
      { label: "Kurz brokera", value: "24,30 × 1,005 = 24,4215 Kč/EUR" },
      { label: "Pavel dostane", value: "10 000 ÷ 24,4215 = 409,48 EUR" },
      { label: "Hodnota v Kč za referenční kurz", value: "10 000 × 24,30 ÷ 24,4215 = 9 950,25 Kč" },
      { label: "Náklad konverze", value: "10 000 − 9 950,25 = 49,75 Kč ≈ 0,5 %", emphasis: true },
    ], conclusion: "Žádná položka „poplatek“ na výpisu není, a přesto Pavel za převod zaplatil skoro 50 Kč. Přesně je to 0,4975 %, protože přirážka se počítá z kurzu, ne z korun." },
    { id: "conversion-practice", type: "numericQuestion", prompt: "Modelový příklad · Posíláš 20 000 Kč. Referenční kurz je 24,50 Kč/EUR, broker přičítá 0,4 %. Kolik Kč tě konverze stojí? Zaokrouhli na celé Kč.", answer: 80, tolerance: 1, unit: "Kč", correctExplanation: "Kurz brokera je 24,50 × 1,004 = 24,598. Dostaneš 20 000 ÷ 24,598 = 813,07 EUR místo 816,33 EUR. Rozdíl 3,25 EUR × 24,50 ≈ 79,7 Kč, tedy zhruba 0,4 % z 20 000 Kč = 80 Kč.", incorrectExplanation: "Přirážka 0,4 % se týká kurzu. Náklad v korunách je přibližně 0,4 % z posílané částky, ne 0,4 % z kurzu." },

    { id: "round-trip", type: "conceptCallout", title: "Konverze se platí dvakrát", content: "Když ETF prodáš a eura chceš zpět v korunách, broker je převede znovu, teď za kurz pod referenčním. Přirážka se tedy platí při nákupu i při prodeji. Stejně tak u každé dividendy, kterou si necháš převést do korun." },
    { id: "round-trip-practice", type: "numericQuestion", prompt: "Modelový příklad · Broker účtuje přirážku 0,5 % při převodu Kč → EUR i při převodu EUR → Kč. Cena ETF ani referenční kurz se nezmění. Přibližně kolik procent částky stojí cesta tam a zpět? Zaokrouhli na celá procenta.", answer: 1, tolerance: 0.01, unit: "%", correctExplanation: "0,5 % + 0,5 % ≈ 1 %. Přesně je to o chlup méně, protože druhá přirážka se počítá z už menší částky.", incorrectExplanation: "Sečti přirážku při nákupu a při prodeji. Každá z nich ubere zhruba 0,5 % částky." },

    { id: "currency-risk", type: "explanation", title: "Měna fondu není měnové riziko", content: "Modelový příklad · Celosvětový akciový index tvoří z velké části americké firmy, dále japonské, britské, evropské a další. Fond obchodovaný v EUR má cenu v eurech jen proto, že ji burza přepočítá z cen akcií v jejich měnách. Když dolar vůči koruně oslabí, hodnota tvého podílu v Kč klesne, ať se ETF obchoduje v EUR, v USD, nebo by ho broker ukazoval v Kč. Stejný fond kotovaný na jiné burze v USD má proto stejné měnové riziko. Měna obchodování ovlivní hlavně to, kolikrát a za jakou přirážku platíš konverzi." },
    { id: "risk-practice", type: "multipleChoiceQuestion", prompt: "ETF na americké akcie se obchoduje v EUR. Na čem hlavně závisí jeho hodnota v Kč?", options: [
      { id: "eur", label: "Na ceně ETF v eurech a kurzu EUR/CZK, nic dalšího.", misconception: "měna obchodování = měnové riziko", explanation: "Cena v eurech sama vzniká přepočtem z dolarových cen. Kurz EUR/USD se v ní už promítá." },
      { id: "usd", label: "Na ceně akcií v USD a kurzu USD/CZK." },
      { id: "stocks", label: "Jen na cenách akcií, měna u akciového fondu nehraje roli.", explanation: "Ceny akcií v USD se musí do korun přepočítat. Pohyb kurzu změní hodnotu, i když ceny akcií stojí." },
    ], correctOptionId: "usd", correctExplanation: "Fond drží akcie v dolarech. Jejich hodnota v Kč je cena v USD krát kurz USD/CZK. Euro je jen mezikrok kotace.", incorrectExplanation: "Podívej se dovnitř fondu: v jaké měně mají ceny akcie, které drží?" },

    { id: "strong-koruna", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Koruna vůči dolaru posílí o 10 %. Ceny amerických akcií v USD se nezmění. Co se přibližně stane s hodnotou ETF na americké akcie v Kč?", options: [
      { id: "down", label: "Klesne zhruba o 9–10 %." },
      { id: "up", label: "Vzroste zhruba o 10 %, silná koruna je dobrá zpráva.", misconception: "silná koruna zvyšuje hodnotu zahraničních investic", explanation: "Silná koruna znamená, že za každý dolar dostaneš méně korun. Dolarová aktiva mají v Kč menší hodnotu." },
      { id: "same", label: "Nezmění se, protože ceny akcií stojí.", explanation: "V dolarech se nezměnila. V korunách ale hodnotu přepočítáváš novým kurzem." },
    ], correctOptionId: "down", correctExplanation: "Když koruna posílí o 10 %, 1 USD má hodnotu 1 ÷ 1,1 původních korun: hodnota klesne o 1 − 1 ÷ 1,1 ≈ 9,1 %. Když místo toho o 10 % klesne kurz USD/CZK, pokles je přesně 10 %. Proto „zhruba 9–10 %“.", incorrectExplanation: "Hodnota v Kč = cena v USD × kurz USD/CZK. Cena stojí. Co se stane s kurzem, když koruna posílí?" },

    { id: "hedging", type: "conceptCallout", title: "Kdy měnové riziko řešit", content: "Pro dlouhodobého akciového investora je kurz jedním z několika zdrojů kolísání vedle cen akcií. Některé fondy nabízejí měnově zajištěné třídy (hedged). Zajištění kurzové výkyvy tlumí, ale má vlastní náklad a mění výsledek. Neplatí, že je zajištění vždy lepší nebo vždy horší. Jak o něm rozhodovat, probereme v pozdější lekci o portfoliu." },
    { id: "reduce", type: "explanation", title: "Jak snížit náklad konverze", content: "Porovnej přirážku brokera s kurzem banky nebo jiné služby, vždy proti stejnému referenčnímu kurzu. Vyhni se zbytečným převodům tam a zpět: pokud v eurech pravidelně nakupuješ a dividendy i prodeje necháváš v eurech, může dávat smysl měnový účet v EUR, ale zkontroluj jeho poplatky v ceníku. Při čistě procentní přirážce velikost převodu náklad v procentech nemění. Méně časté větší převody pomohou, jen když ceník účtuje pevný poplatek nebo minimum. Lekce nedoporučuje konkrétního brokera ani banku." },
    { id: "misconceptions", type: "conceptCallout", title: "Tři časté omyly", content: "„ETF v Kč nemá měnové riziko.“ Neplatí: rozhodují měny aktiv uvnitř fondu, ne měna, ve které vidíš cenu. „ETF v EUR má jen riziko EUR.“ Neplatí: celosvětový fond nese hlavně riziko USD a dalších měn. „Konverze je zdarma, když nevidím poplatek.“ Neplatí: náklad bývá v přirážce ke kurzu." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Je měnové riziko akciového ETF dané měnou, ve které se obchoduje na burze?", options: [
      { id: "yes", label: "Ano, ETF obchodované v EUR nese jen riziko EUR.", explanation: "Měna obchodování určuje kotaci a konverzi. Riziko určují měny aktiv uvnitř fondu." },
      { id: "no", label: "Ne, rozhodují měny aktiv uvnitř fondu, pokud je fond nezajišťuje." },
      { id: "czk", label: "Ne, přes českého brokera koupené ETF měnové riziko nemá.", explanation: "Broker koruny převede. Hodnota fondu v Kč dál závisí na kurzech měn jeho aktiv." },
    ], correctOptionId: "no", correctExplanation: "Měnové riziko plyne z měn podkladových aktiv. Měnově zajištěná třída ho tlumí za cenu nákladu zajištění.", incorrectExplanation: "Rozliš měnu kotace na burze a měny, ve kterých jsou akcie uvnitř fondu." },
    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách vysvětli, proč má ETF na americké akcie obchodované v EUR riziko USD. Přidej, jak před nákupem zkontroluješ náklad konverze.", rubric: [
      { id: "inside", text: "Vysvětlím, že hodnota závisí na cenách akcií v USD a kurzu USD/CZK, euro je jen měna kotace." },
      { id: "cost", text: "Porovnám kurz brokera s referenčním kurzem a spočítám náklad v Kč." },
      { id: "both-ways", text: "Zmíním, že konverze se platí při nákupu i při prodeji." },
    ], sampleAnswer: "Fond drží akcie amerických firem, jejichž ceny jsou v dolarech. Cena v eurech je jen přepočet, takže když dolar vůči koruně oslabí, hodnota v Kč klesne. Před nákupem porovnám kurz brokera s kurzem ČNB a spočítám, kolik korun mě převod stojí. Počítám s tím, že při prodeji zaplatím konverzi znovu." },

    { id: "lab-bridge", type: "labBridge", title: "Najdi kurz a konverzi v Labu", content: "Při kontrole nákupu zahraničního instrumentu v Portfolio Labu uvidíš referenční kurz a přirážku konverze podle zvoleného fiktivního profilu; čísla počítá server. V přehledu portfolia Lab rozkládá výsledek na vliv cen a vliv kurzu. Pozor: kurz v Labu znamená měnu kotace instrumentu. U ETF obchodovaného v EUR je pohyb dolaru uvnitř fondu schovaný v jeho ceně v eurech, ne v řádku kurzu. Při nácviku stačí náklady zkontrolovat, obchod nemusíš potvrdit." },
    { id: "summary", type: "lessonSummary", title: "Konverze stojí, měna fondu neklame", content: "Náklad konverze je rozdíl proti referenčnímu kurzu a platí se při nákupu i prodeji, tam a zpět zhruba dvakrát přirážka. Měnové riziko neurčuje měna, ve které se ETF obchoduje, ale měny aktiv uvnitř fondu. Silnější koruna snižuje hodnotu zahraničních aktiv v Kč. Zbytečným převodům se vyhneš, když víš, v jaké měně nakupuješ, prodáváš a dostáváš dividendy." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · ČNB, Kurzy devizového trhu: https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/ · justETF, How to choose the right ETF: https://www.justetf.com/en/academy/die-richtige-etf-auswahl.html · Kurzy, přirážky a částky jsou fiktivní, ne nabídka brokera ani banky. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
