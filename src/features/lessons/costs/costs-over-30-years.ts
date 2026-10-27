import type { AuthoredLesson } from "../types";
import { costsLessons } from "./manifest";
const lesson = costsLessons.find((entry) => entry.id === "costs-over-30-years")!;

export const costsOver30YearsLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "costs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Poplatky a celkové náklady", position: 4, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Malý rozdíl" }, { id: "model", label: "Modelový výpočet" }, { id: "why", label: "Proč tolik" }, { id: "backtest", label: "Historický experiment" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Jana chce 30 let posílat 2 000 Kč měsíčně do akciového fondu. Vybírá mezi třemi cestami: levný indexový fond s celkovými ročními náklady 0,2 %, dražší fond s 1,5 % a fond s 2,5 % včetně poplatků za správu. Na první pohled je to rozdíl jednoho nebo dvou procent. Je podstatný?" },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Nejdřív odhadni: o kolik zhruba bude Janina konečná hodnota po 30 letech při nákladech 2,5 % nižší než při 0,2 %? Hrubý výnos je v obou případech stejný.", options: [
      { id: "five", label: "Zhruba o 5 %.", misconception: "náklady se jen sčítají", explanation: "Rozdíl 2,3 % ročně se neodečte jednou. Ubírá každý rok z celé hodnoty, i z výnosů minulých let." },
      { id: "fifteen", label: "Zhruba o 15 %.", explanation: "Je to víc. Náklady se skládají stejně jako výnos, takže za 30 let narostou nad tuhle hranici." },
      { id: "third", label: "Zhruba o třetinu." },
    ], correctOptionId: "third", correctExplanation: "V modelovém výpočtu vyjde 626 663 Kč z 1 888 972 Kč, tedy zhruba 33 %. Rozdíl 2,3 % ročně se za 30 let složí do třetiny konečné hodnoty.", incorrectExplanation: "Náklady neubírají jen z vkladů, ale každý rok z celé hodnoty. Na dalším kroku uvidíš, kolik to dělá v korunách." },

    { id: "model", type: "explanation", title: "Modelový výpočet, ne předpověď", content: "Modelový příklad · Předpokládáme hrubý výnos 6 % ročně, každý rok stejný. Celkové roční náklady zjednodušeně odečteme od výnosu: při 1,5 % roste investice o 4,5 % ročně. Jana vkládá 2 000 Kč na začátku každého měsíce, 360 měsíců. Výnos 6 % je předpoklad, ne předpověď ani historický průměr. Bez daní a kolísání." },
    { id: "formula", type: "formula", expression: "H = P × (1 + i) × ((1 + i)^n − 1) ÷ i", latex: "H = P(1+i)\\frac{(1+i)^{n}-1}{i}", variables: [
      { symbol: "H", description: "konečná hodnota" },
      { symbol: "P", description: "měsíční vklad na začátku měsíce (2 000 Kč)" },
      { symbol: "n", description: "počet měsíců (360)" },
      { symbol: "r", description: "předpokládaný hrubý roční výnos (6 %)" },
      { symbol: "c", description: "celkové roční náklady" },
      { symbol: "i", description: "měsíční sazba po nákladech: (1 + r − c)^(1/12) − 1" },
    ] },
    { id: "worked", type: "workedExample", title: "Modelový příklad · Janových 30 let", introduction: "2 000 Kč měsíčně, 30 let, hrubý výnos 6 % ročně. Konečné hodnoty zaokrouhlujeme na celé Kč.", steps: [
      { label: "Vloženo celkem", value: "2 000 × 12 × 30 = 720 000 Kč" },
      { label: "Náklady 0,2 % ročně", value: "≈ 1 888 972 Kč" },
      { label: "Náklady 1,5 % ročně", value: "≈ 1 499 619 Kč" },
      { label: "Náklady 2,5 % ročně", value: "≈ 1 262 309 Kč" },
      { label: "Rozdíl 0,2 % proti 2,5 %", value: "1 888 972 − 1 262 309 = 626 663 Kč ≈ 33 %", emphasis: true },
    ], conclusion: "Vklady jsou ve všech třech případech stejné, 720 000 Kč. Rozdíl přes 600 000 Kč vzniká jen z nákladů. Už mezi 0,2 % a 1,5 % je to 389 353 Kč." },

    { id: "why", type: "explanation", title: "Proč náklady rostou s časem", content: "Náklady se počítají z celé hodnoty investice, každý rok znovu. V prvním roce bere 1,5 % z necelých 25 000 Kč, tedy nanejvýš stovky korun. V posledním roce z více než milionu, tedy desítky tisíc korun. A každá koruna zaplacená na nákladech už dál nevydělává: ujídá i z výnosů předchozích let. Proto rozdíl roste s časem i s hodnotou portfolia rychleji než lineárně." },

    { id: "calculator", type: "interactiveFigure", figure: "cost-drag-slider", title: "Modelový příklad · náklady za 30 let", description: "Změň náklady, dobu, vklad a předpokládaný výnos a sleduj, kolik náklady vezmou. Kalkulačka se nehodnotí; odpověď zapíšeš pod ní." },
    { id: "calculator-practice", type: "numericQuestion", prompt: "Modelový příklad · V kalkulačce nastav 2 000 Kč měsíčně, 30 let, výnos 6 % a náklady 1,5 %. Jaká je konečná hodnota po nákladech? Zapiš ji v tisících Kč, zaokrouhleno na celé tisíce (např. 950 znamená 950 000 Kč).", answer: 1500, tolerance: 1, unit: "tis. Kč", correctExplanation: "Kalkulačka ukáže 1 499 619 Kč, po zaokrouhlení 1 500 tisíc Kč. Proti 0,2 % je to o 389 353 Kč méně, i když Jana vložila stejných 720 000 Kč.", incorrectExplanation: "Zkontroluj, že máš náklady 1,5 % a výnos 6 %. Konečnou hodnotu po nákladech vyděl tisícem: 1 234 567 Kč je 1 235 tisíc." },

    { id: "backtest", type: "explanation", title: "Simulace · stejná strategie s náklady a bez nich", content: "Simulace · Backtesting Lab ukazuje, jak by se strategie chovala na historických cenách. V kroku „Náklady obchodů“ zapneš sazbu z každého obchodu (výchozí 0,1 %) a případně pevný poplatek. Výsledek pak porovnáš s náklady a bez nich na stejných cenách. Pozor na rozdíl: tyto náklady platí každý nákup a prodej, ne roční nákladovost fondu. Ta je u skutečného ETF už schovaná v jeho historické ceně. Experiment „Roční nákladovost fondu“ přidá jen dodatečný modelový roční odpočet. Historický výsledek neříká, jak to dopadne příště." },
    { id: "backtest-practice", type: "multipleChoiceQuestion", prompt: "Simulace · V Backtesting Labu spustíš stejný mix s náklady 0,1 % z každého obchodu: jednou s měsíčním rebalancováním, jednou bez rebalancování. Proč je rozdíl proti výsledku bez nákladů větší u měsíčního rebalancování?", options: [
      { id: "trades", label: "Každé rebalancování je obchod a každý obchod platí 0,1 %. Měsíčně se obchoduje mnohem častěji." },
      { id: "ter", label: "Měsíční rebalancování zvyšuje roční nákladovost fondu (TER).", misconception: "náklady obchodů = TER", explanation: "TER fond účtuje z hodnoty bez ohledu na to, jak často obchoduješ. Backtesting Lab tu počítá náklady obchodů." },
      { id: "free", label: "Bez rebalancování se neplatí žádné náklady, proto rozdíl vůbec nevznikne.", explanation: "I bez rebalancování se platí nákup na začátku. Rozdíl je jen menší, protože obchodů je méně." },
    ], correctOptionId: "trades", correctExplanation: "Náklady obchodů rostou s počtem a objemem obchodů. Měsíční rebalancování obchoduje zhruba dvanáctkrát častěji než roční, bez rebalancování se platí jen nákup na začátku.", incorrectExplanation: "Zeptej se, co se v Backtesting Labu zpoplatňuje: hodnota fondu, nebo každý obchod?" },

    { id: "certainty", type: "explanation", title: "Náklady jsou jistota, výnos ne", content: "Budoucí výnos nikdo nezná. Náklady ale zaplatíš skoro jistě, v dobrých i ve špatných letech. Proto je jejich snížení jedním z mála zlepšení, které výsledek posune předvídatelně. Před nákupem sečti všechny roční náklady: průběžné náklady fondu, poplatky za vedení účtu nebo správu a odhad nákladů obchodů. Lekce nedoporučuje konkrétní fond, brokera ani produkt." },
    { id: "misconceptions", type: "conceptCallout", title: "Dva časté omyly", content: "„Rozdíl 1 % ročně je za 30 let rozdíl 30 %.“ Neplatí: kvůli skládání je to víc a roste s dobou. „Drahý fond to vynahradí vyšším výnosem.“ Na to není záruka: vyšší náklady jsou jisté, vyšší výnos ne. Viz lekce o aktivní správě a indexu." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Proč se roční náklady za 30 let sčítají víc než lineárně?", options: [
      { id: "growing", label: "Počítají se z celé rostoucí hodnoty a zaplacené koruny už dál nevydělávají." },
      { id: "rising", label: "Fondy náklady s věkem investice zvyšují.", explanation: "Sazba v modelu zůstává stejná. Roste hodnota, ze které se počítá." },
      { id: "deposits", label: "Náklady se počítají jen z vkladů a ty přibývají.", misconception: "náklady jen z vložených peněz", explanation: "Roční náklady se berou z celé hodnoty včetně výnosů, ne jen z vložených korun." },
    ], correctOptionId: "growing", correctExplanation: "Stejné procento z rostoucí hodnoty dává každý rok víc korun a ty korunám chybí i v dalších letech. Proto rozdíl roste s časem i s hodnotou portfolia.", incorrectExplanation: "Rozliš, z čeho se náklady počítají, a co se stane s korunou, která na nákladech odešla." },
    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách vysvětli, proč je modelový výpočet s pevným výnosem 6 % jen ilustrace. Přidej, co z něj přesto platí pro tvůj plán.", rubric: [
      { id: "assumption", text: "Řeknu, že pevný výnos je předpoklad a skutečný výnos každý rok kolísá." },
      { id: "costs", text: "Vysvětlím, že náklady se platí skoro jistě, takže jejich dopad je spolehlivější než výnos." },
      { id: "plan", text: "Zmíním, že porovnám celkové roční náklady, než si fond vyberu." },
    ], sampleAnswer: "Výnos 6 % každý rok je zjednodušení. Skutečný trh kolísá a průměr může být vyšší i nižší. Náklady ale zaplatím v každém roce, takže rozdíl mezi levným a drahým fondem je mnohem jistější než samotný výnos. Než si fond vyberu, sečtu jeho průběžné náklady a poplatky brokera." },

    { id: "lab-bridge", type: "labBridge", title: "Vyzkoušej náklady v Backtesting Labu", content: "V Backtesting Labu nastav historickou strategii, v kroku „Náklady obchodů“ zapni sazbu 0,1 % a porovnej výsledek s náklady a bez nich. Pak změň rebalancování z ročního na měsíční a sleduj, jak roste počet obchodů a zaplacené náklady. Experiment „Roční nákladovost fondu“ přidá modelový roční odpočet; historické ceny ETF už mohou skutečné náklady fondu obsahovat. Simulace se neukládá a nemění tvé portfolio ani cvičný kapitál." },
    { id: "summary", type: "lessonSummary", title: "Malé procento, velký rozdíl", content: "Roční náklady se počítají z celé hodnoty investice, každý rok znovu. Za 30 let proto rozdíl mezi 0,2 % a 2,5 % v modelovém výpočtu vezme zhruba třetinu konečné hodnoty. Výnos je předpoklad, náklady skoro jistota. Backtesting Lab ukáže náklady obchodů na historických cenách; roční nákladovost fondu je v ceně ETF už obsažená." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · FINRA, Fees and commissions: https://www.finra.org/investors/investing/investing-basics/fees-commissions · Aswath Damodaran, Investment philosophies (trading costs and taxes): https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm · Výnos, náklady a částky jsou modelové, ne nabídka fondu ani brokera. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
