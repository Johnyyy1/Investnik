import type { AuthoredLesson } from "../types";
import { costsLessons } from "./manifest";
const lesson = costsLessons[0];

export const terAndTrackingDifferenceLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "costs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Poplatky a celkové náklady", position: 1, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Dvě ETF, jeden index" }, { id: "ter", label: "TER" }, { id: "td", label: "Rozdíl vůči indexu" }, { id: "years", label: "Víc let" }, { id: "te", label: "Kolísání rozdílu" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Dvě ETF sledují stejný index světových akcií. ETF A má celkovou nákladovost 0,20 % ročně, ETF B 0,12 % ročně. Tomáš chce pravidelně investovat 3 000 Kč měsíčně a vybírá mezi nimi." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Které ETF stálo své investory za poslední rok méně? Nejdřív odhadni.", options: [
      { id: "lower-ter", label: "ETF B, protože má nižší nákladovost.", explanation: "Nižší nákladovost je dobrý začátek, ale ne celý příběh. Kolik fond skutečně zaostal za indexem, ukáže až porovnání jeho výsledku s indexem.", misconception: "Nižší TER vždy vyhraje" },
      { id: "compare", label: "Z nákladovosti to s jistotou nepoznám. Musím porovnat výsledek fondu s indexem." },
      { id: "higher-ter", label: "ETF A, protože dražší fond bývá kvalitnější.", explanation: "Vyšší náklady kvalitu nezaručují. U fondů na stejný index rozhoduje, o kolik skutečně zaostaly za indexem." },
    ], correctOptionId: "compare", correctExplanation: "Nákladovost je nejlepší jednoduchý odhad, ale skutečný výsledek může být lepší i horší. V lekci se naučíš porovnat fondy podle toho, o kolik zaostaly za indexem.", incorrectExplanation: "Samotná nákladovost skutečné zaostání neukáže. Musíš porovnat výsledek fondu s výsledkem indexu za stejné období." },

    { id: "ter", type: "explanation", title: "Celková nákladovost fondu (TER)", content: "Celková nákladovost fondu (TER, total expense ratio) jsou roční průběžné náklady fondu v procentech jeho majetku: správa, depozitář, licence indexu a další provoz. Neplatíš je fakturou. Fond si je strhává průběžně ze svého majetku a projeví se v ceně podílu. Při 0,20 % a 50 000 Kč ve fondu to dělá zhruba 100 Kč za rok." },
    { id: "ter-scope", type: "conceptCallout", title: "TER není všechno", content: "TER zahrnuje jen náklady fondu. Poplatek brokera za nákup, měnová konverze nebo rozdíl mezi nákupní a prodejní cenou (spread) jsou tvoje náklady mimo fond. V dokumentu s klíčovými informacemi (KID) najdeš i další údaje o nákladech; nemusí se s TER přesně shodovat." },
    { id: "ter-payment", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Máš v ETF s TER 0,20 % ročně 50 000 Kč. Jak tento náklad zaplatíš?", options: [
      { id: "invoice", label: "Broker mi jednou ročně strhne 100 Kč z účtu." },
      { id: "inside", label: "Fond si ho strhává průběžně ze svého majetku, takže se projeví v ceně podílu." },
      { id: "sale", label: "Zaplatím ho až při prodeji." },
    ], correctOptionId: "inside", correctExplanation: "TER se strhává uvnitř fondu průběžně. Na výpisu ho jako samostatnou položku neuvidíš, ale snižuje výnos fondu.", incorrectExplanation: "TER neplatíš fakturou ani při prodeji. Fond si náklady strhává průběžně ze svého majetku, a proto snižují cenu podílu a tvůj výnos." },

    { id: "td", type: "explanation", title: "Rozdíl ve výkonnosti vůči indexu (tracking difference)", content: "Rozdíl ve výkonnosti vůči indexu (tracking difference) je výnos fondu minus výnos indexu za stejné období, ve stejné měně a se stejným zacházením s dividendami. Záporné číslo znamená, že fond zaostal. Udává se v procentních bodech (p. b.). Ukazuje, kolik tě fond skutečně stál, včetně vlivů, které TER nezachytí." },
    { id: "td-formula", type: "formula", expression: "rozdíl vůči indexu = výnos fondu − výnos indexu", latex: String.raw`TD = r_{\text{fond}} - r_{\text{index}}`, variables: [
      { symbol: "TD", description: "rozdíl ve výkonnosti vůči indexu v p. b." },
      { symbol: "r_fond", description: "výnos fondu za období v %" },
      { symbol: "r_index", description: "výnos indexu za stejné období v %" },
    ] },
    { id: "worked", type: "workedExample", title: "Modelový příklad · index za rok +8,00 %", introduction: "Oba fondy sledují stejný index. Výnosy jsou modelová čísla v korunách, včetně reinvestovaných dividend.", steps: [
      { label: "ETF A (TER 0,20 %) za rok", value: "+7,85 %" },
      { label: "Rozdíl ETF A", value: "7,85 % − 8,00 % = −0,15 p. b." },
      { label: "ETF B (TER 0,12 %) za rok", value: "+7,80 %" },
      { label: "Rozdíl ETF B", value: "7,80 % − 8,00 % = −0,20 p. b.", emphasis: true },
    ], conclusion: "ETF B má nižší TER, a přesto za tento rok zaostalo za indexem víc. Jeden rok ale ještě nerozhoduje." },

    { id: "td-practice", type: "numericQuestion", prompt: "Modelový příklad · Index za rok vydělal 6,40 %, ETF na tento index 6,22 %. Jaký je rozdíl ve výkonnosti vůči indexu? Uveď v p. b. se znaménkem; zaostání je záporné.", answer: -0.18, tolerance: 0.005, unit: "p. b.", correctExplanation: "6,22 % − 6,40 % = −0,18 p. b. Fond za indexem zaostal o 0,18 procentního bodu.", incorrectExplanation: "Od výnosu fondu odečti výnos indexu: 6,22 − 6,40. Fond vydělal méně než index, proto je výsledek záporný." },

    { id: "td-reasons", type: "explanation", title: "Co se skrývá za rozdílem", content: "Rozdíl vůči indexu bývá blízko −TER, ale ne přesně. Fond může půjčovat cenné papíry a část příjmu si ponechat, což zaostání zmenší. Z dividend firem v jiných zemích se uvnitř fondu může strhávat srážková daň, která zaostání zvětší nebo zmenší podle toho, s jakou daní počítá index. Svou roli hrají i náklady na obchody a způsob, jak fond index kopíruje (replikace)." },
    { id: "td-better", type: "multipleChoiceQuestion", prompt: "Modelový příklad · ETF má TER 0,20 % a za rok zaostalo za indexem jen o 0,08 p. b. Co to může vysvětlit?", options: [
      { id: "waived", label: "Fond si letos část TER odpustil." },
      { id: "income", label: "Příjmy fondu, například z půjčování cenných papírů, část nákladů vyrovnaly." },
      { id: "error", label: "Výpočet musí být chybný, rozdíl musí být přesně −0,20 p. b." },
    ], correctOptionId: "income", correctExplanation: "TER se strhává dál, ale jiné vlivy, například příjem z půjčování cenných papírů nebo nižší srážková daň, mohou zaostání zmenšit.", incorrectExplanation: "Rozdíl vůči indexu nemusí být přesně −TER. Náklady se strhávají dál, ale příjmy fondu nebo jiné zdanění dividend mohou výsledek posunout oběma směry." },

    { id: "years", type: "explanation", title: "Porovnávej víc let", content: "Rozdíl jednoho roku ovlivní i náhoda: jak dopadly dividendy, obchody nebo daně. Spolehlivější je průměr za 3–5 let, pokud fond existuje tak dlouho. U mladšího fondu je údaj méně spolehlivý a vedle něj zvaž TER." },
    { id: "years-data", type: "workedExample", title: "Modelový příklad · rozdíl vůči indexu po letech", introduction: "Oba fondy sledují stejný index. Čísla jsou v p. b., záporné znamená zaostání.", steps: [
      { label: "Rok 1", value: "A −0,15 · B −0,20" },
      { label: "Rok 2", value: "A −0,10 · B −0,22" },
      { label: "Rok 3", value: "A −0,18 · B −0,19" },
    ], conclusion: "Spočítej průměr každého fondu a porovnej je." },
    { id: "years-compare", type: "multipleChoiceQuestion", prompt: "Které ETF za tři roky sledovalo index lépe?", options: [
      { id: "a", label: "ETF A" },
      { id: "b", label: "ETF B" },
      { id: "same", label: "Obě stejně, rozdíly jsou zanedbatelné." },
    ], correctOptionId: "a", correctExplanation: "Průměr A je (−0,15 − 0,10 − 0,18) ÷ 3 ≈ −0,143 p. b., průměr B (−0,20 − 0,22 − 0,19) ÷ 3 ≈ −0,203 p. b. A zaostávalo méně každý rok i v průměru.", incorrectExplanation: "Sečti rozdíly každého fondu a vyděl třemi. Průměr blíž k nule znamená menší zaostání za indexem." },

    { id: "te", type: "explanation", title: "Kolísání rozdílu výnosů vůči indexu (tracking error)", content: "Kolísání rozdílu výnosů vůči indexu (tracking error) je směrodatná odchylka rozdílů mezi výnosem fondu a indexu. Říká, jak věrně fond index sleduje, ne kolik stojí. Fond může mít malé kolísání a přesto každý rok zaostat o stejný kus. Se směrodatnou odchylkou budeš počítat v lekci 3.2.2; tady stačí pojem." },
    { id: "te-compare", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Fond X zaostává za indexem každý rok přesně o 0,1 p. b. Fond Y je jeden rok o 0,5 p. b. pod indexem a jiný rok o 0,3 p. b. nad ním. Který má vyšší kolísání rozdílu (tracking error)?", options: [
      { id: "x", label: "Fond X, protože zaostává každý rok." },
      { id: "y", label: "Fond Y, protože se jeho rozdíl vůči indexu mění víc." },
      { id: "same", label: "Oba stejné, protože v průměru zaostávají podobně." },
    ], correctOptionId: "y", correctExplanation: "Kolísání měří, jak moc se rozdíl mění. U X je pořád stejný, takže kolísání je téměř nulové. U Y skáče mezi −0,5 a +0,3 p. b.", incorrectExplanation: "Neptáme se, kolik fond zaostává, ale jak moc se jeho rozdíl vůči indexu mění. Stálé zaostání má malé kolísání, rozdíl skákající nahoru a dolů velké." },

    { id: "misconceptions", type: "conceptCallout", title: "Tři časté omyly", content: "„TER je jediný náklad fondu.“ Neplatí: uvnitř fondu působí i obchodní náklady a daně, mimo něj poplatky brokera a konverze. „Nižší TER vždy vyhraje.“ Většinou je to dobré vodítko, ale rozhoduje skutečný rozdíl vůči indexu za víc let. „Tracking error je totéž co tracking difference.“ Rozdíl říká, kolik fond zaostal; kolísání, jak stálý ten rozdíl je." },

    { id: "mastery-td", type: "multipleChoiceQuestion", prompt: "Co je rozdíl ve výkonnosti vůči indexu (tracking difference)?", options: [
      { id: "difference", label: "Výnos fondu minus výnos indexu za stejné období." },
      { id: "volatility", label: "Jak moc kolísá rozdíl mezi fondem a indexem." },
      { id: "ter", label: "Roční nákladovost fondu v procentech majetku." },
    ], correctOptionId: "difference", correctExplanation: "Rozdíl vůči indexu porovnává výsledek fondu s indexem za stejné období. Ukazuje, kolik fond skutečně zaostal nebo předběhl.", incorrectExplanation: "Kolísání rozdílu je tracking error a roční nákladovost je TER. Rozdíl vůči indexu je výnos fondu minus výnos indexu za stejné období." },
    { id: "mastery-ter", type: "multipleChoiceQuestion", prompt: "Dvě ETF sledují stejný index. Je nižší TER zárukou, že tě fond bude stát méně?", options: [
      { id: "yes", label: "Ano, TER zahrnuje všechny náklady fondu." },
      { id: "no", label: "Ne. Je to dobrý odhad, ale skutečné zaostání ukáže rozdíl vůči indexu za víc let." },
      { id: "never", label: "Ne, TER s výsledkem fondu nesouvisí." },
    ], correctOptionId: "no", correctExplanation: "TER výsledek fondu ovlivňuje, ale nezachytí vše: příjmy z půjčování, daně z dividend ani náklady replikace. Proto porovnej rozdíl vůči indexu za víc let.", incorrectExplanation: "TER se do výsledku fondu promítá, takže s ním souvisí. Nezahrnuje ale všechno, co výsledek posouvá. Skutečné zaostání ukáže rozdíl vůči indexu za víc let." },

    { id: "reflection", type: "writtenReflection", prompt: "Proč může ETF zaostat za indexem méně, než je jeho TER? Vysvětli to ve 2–4 větách a dodej, co porovnáš, až budeš vybírat mezi dvěma ETF na stejný index.", rubric: [
      { id: "income", text: "Zmíním příjmy nebo vlivy uvnitř fondu, například půjčování cenných papírů nebo zdanění dividend." },
      { id: "measure", text: "Vysvětlím, že rozdíl vůči indexu měří skutečný výsledek, kdežto TER jen strhávané náklady." },
      { id: "years", text: "Porovnám rozdíl vůči indexu za víc let, ne za jeden rok, a vedle něj TER." },
    ], sampleAnswer: "TER se strhává vždy, ale fond může mít i příjmy, například z půjčování cenných papírů, nebo nižší daň z dividend, než s jakou počítá index. Proto může skutečné zaostání vyjít menší než TER. Při výběru porovnám průměrný rozdíl vůči indexu za 3–5 let a teprve vedle něj TER." },

    { id: "lab-bridge", type: "labBridge", title: "Najdi nákladovost v Labu", content: "Na detailu ETF v Labu najdeš v přehledu fondu údaj Nákladovost, tedy TER. Rozdíl vůči indexu Investník nepočítá: potřeboval by výnosy fondu i indexu ve stejné metodice a ty v Labu nemáme. Při skutečném výběru ho hledej u poskytovatele fondu nebo v nezávislých srovnáních." },
    { id: "summary", type: "lessonSummary", title: "Porovnávej výsledek, nejen cenovku", content: "TER jsou roční náklady fondu strhávané průběžně z jeho majetku. Rozdíl ve výkonnosti vůči indexu ukáže, o kolik fond skutečně zaostal, a může být lepší i horší než −TER. Porovnávej ho za 3–5 let. Kolísání rozdílu (tracking error) měří věrnost sledování, ne cenu." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · ESMA, Pokyny k ETF a dalším otázkám UCITS (ESMA/2014/937), oddíl II – definice: https://www.esma.europa.eu/sites/default/files/library/2015/11/esma-2014-0011-01-00_en_0.pdf · justETF, How to choose the right ETF: https://www.justetf.com/en/academy/make-the-right-etf-selection.html · Vzdělávací obsah, ne investiční doporučení." },
  ],
};
