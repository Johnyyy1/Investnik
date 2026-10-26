import type { AuthoredLesson } from "../types";
import { brokerAndAccountLessons } from "./manifest";
const lesson = brokerAndAccountLessons.find((entry) => entry.id === "broker-fee-schedule")!;

/** Every number comes from the fictional tariff in fee-schedule-model.ts; the unit test recomputes each one. */
export const readingAFeeScheduleLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "broker-and-account", slug: lesson.slug, title: lesson.title,
  eyebrow: "Broker a investiční účet", position: 6, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Lucie a 0,15 %" }, { id: "tariff", label: "Ceník" }, { id: "fee-rule", label: "Minimum a maximum" }, { id: "hidden", label: "Skryté náklady" }, { id: "profile", label: "Profil poplatků" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Lucie chce každý měsíc z korunového účtu kupovat ETF obchodované v eurech za 2 000 Kč. Broker v reklamě slibuje „poplatek jen 0,15 % za obchod“. Broker i jeho ceník v této lekci jsou smyšlené; nejde o skutečnou nabídku ani doporučení." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Kolik Lucie zaplatí za jeden nákup za 2 000 Kč? Nejdřív odhadni.", options: [
      { id: "percent", label: "3 Kč, protože 0,15 % z 2 000 Kč jsou 3 Kč.", misconception: "0,15 % je vždy levné", explanation: "Procento je jen část pravidla. Ceník často stanoví i minimální poplatek, který zaplatíš, když procento vyjde méně." },
      { id: "minimum", label: "Z procenta to nepoznám. V ceníku musím najít i minimální poplatek." },
      { id: "free", label: "Nic, malé nákupy bývají zdarma.", explanation: "Malé nákupy zdarma nebývají. Naopak u nich často platí minimální poplatek." },
    ], correctOptionId: "minimum", correctExplanation: "Přesně tak. Reklama ukazuje procento, ale cenu nákupu určuje celé pravidlo z ceníku: procento, minimum a maximum. Pojďme ho najít.", incorrectExplanation: "Samotné procento nestačí. Cenu nákupu určuje celé pravidlo z ceníku, včetně minimálního poplatku." },

    { id: "tariff-intro", type: "explanation", title: "Ceník brokera", content: "Ceník je dokument, ve kterém broker uvádí všechny své poplatky. Najdeš v něm obvykle šest typů: poplatek za obchod, měnovou konverzi, úschovu, poplatek za neaktivitu, výběr peněz a podmínky spořicího plánu. Reklama ukazuje jeden z nich, skutečné náklady určuje celek." },
    { id: "tariff", type: "documentTap", prompt: "Modelový příklad · Lucie jednou koupí ETF obchodované v eurech a zaplatí z korunového účtu. Označ dva řádky ceníku, které zaplatí už při tomto nákupu.", document: { eyebrow: "Modelový příklad · fiktivní dokument", title: "Ceník služeb · Broker L, investiční účet", meta: "Zjednodušená ukázka, žádná skutečná nabídka", columns: [{ id: "item", label: "Položka", mobile: "title" }, { id: "price", label: "Cena", align: "end", mobile: "value" }], rows: [
      { id: "trade", cells: { item: "Obchod s ETF na burze Xetra", price: "0,15 %, min. 60 Kč, max. 600 Kč" }, note: "Poplatek za obchod platíš při každém nákupu i prodeji." },
      { id: "fx", cells: { item: "Měnová konverze", price: "0,5 % k referenčnímu kurzu" }, note: "Koruny se mění na eura, takže konverzi platíš při tomto nákupu." },
      { id: "custody", cells: { item: "Úschova cenných papírů", price: "do 500 000 Kč zdarma, nad 0,1 % ročně" }, note: "Úschova se platí průběžně, 0,1 % ročně z hodnoty nad 500 000 Kč, ne při nákupu. Lucie je pod hranicí." },
      { id: "inactivity", cells: { item: "Neaktivita účtu", price: "0 Kč" }, note: "Tento broker za neaktivitu nic neúčtuje." },
      { id: "withdrawal", cells: { item: "Výběr peněz", price: "v Kč zdarma, v eurech 1 EUR" }, note: "Výběr platíš, až budeš peníze z účtu vybírat." },
      { id: "plan", cells: { item: "Spořicí plán na ETF", price: "0 Kč za nákup + konverze 0,5 %" }, note: "Lucie tentokrát kupuje jednorázovým pokynem, ne přes spořicí plán." },
    ] }, correctRowIds: ["trade", "fx"],
      correctExplanation: "Při jednorázovém nákupu v eurech zaplatí Lucie poplatek za obchod a měnovou konverzi. Úschova, výběr a neaktivita přijdou na řadu jindy, ale do celkových nákladů patří také.",
      incorrectExplanation: "Hledáš, co se platí právě při nákupu: poplatek za obchod a směnu korun na eura. Úschova se platí průběžně, výběr až při výběru a spořicí plán Lucie nepoužívá." },

    { id: "fee-rule", type: "explanation", title: "Jak funguje poplatek s minimem a maximem", content: "Nejdřív spočítej procento z částky nákupu. Když vyjde méně než minimum, zaplatíš minimum. Když vyjde víc než maximum, zaplatíš maximum. Mezi nimi platíš přesně procento. Minimum proto nejvíc bolí u malých nákupů, maximum pomáhá u velkých." },
    { id: "fee-formula", type: "formula", expression: "poplatek = min(max(sazba × částka, minimum), maximum)", latex: String.raw`P = \min\bigl(\max(s \cdot C,\ m),\ M\bigr)`, variables: [
      { symbol: "P", description: "poplatek za obchod v Kč" },
      { symbol: "s", description: "sazba poplatku za obchod, např. 0,15 % = 0,0015" },
      { symbol: "C", description: "částka nákupu v Kč" },
      { symbol: "m, M", description: "minimální a maximální poplatek z ceníku" },
    ] },
    { id: "worked", type: "workedExample", title: "Modelový příklad · tři nákupy podle ceníku Brokera L", introduction: "Sazba 0,15 %, minimum 60 Kč, maximum 600 Kč. Měnovou konverzi zatím neuvažujeme.", steps: [
      { label: "Nákup za 50 000 Kč", value: "0,15 % = 75 Kč, je mezi minimem a maximem → 75 Kč" },
      { label: "Nákup za 2 000 Kč", value: "0,15 % = 3 Kč, méně než minimum → 60 Kč, tedy 3 % z nákupu", emphasis: true },
      { label: "Nákup za 500 000 Kč", value: "0,15 % = 750 Kč, víc než maximum → 600 Kč, tedy 0,12 % z nákupu" },
    ], conclusion: "Stejný ceník stojí Lucii 3 % z malého nákupu a velkého investora jen 0,12 %. Proto vždy počítej se svou částkou." },

    { id: "small-purchase", type: "multiNumericQuestion", prompt: "Modelový příklad · Podle ceníku Brokera L (0,15 %, min. 60 Kč, max. 600 Kč) koupíš ETF za 3 000 Kč. Kolik zaplatíš na poplatku za obchod v Kč a kolik je to procent z nákupu?", answers: [{ id: "fee", label: "Poplatek za obchod", answer: 60, tolerance: 0, unit: "Kč" }, { id: "share", label: "Poplatek v % z nákupu", answer: 2, tolerance: 0.005, unit: "%" }], correctExplanation: "0,15 % z 3 000 Kč je 4,50 Kč, což je méně než minimum. Zaplatíš 60 Kč, tedy 60 ÷ 3 000 = 2 % z nákupu.", incorrectExplanation: "Nejdřív spočítej procento: 3 000 × 0,0015 = 4,50 Kč. To je pod minimem, takže platíš minimum 60 Kč. Procento z nákupu je 60 ÷ 3 000 × 100." },
    { id: "large-purchase", type: "numericQuestion", prompt: "Modelový příklad · Podle stejného ceníku koupíš ETF jednorázově za 800 000 Kč. Kolik zaplatíš na poplatku za obchod?", answer: 600, tolerance: 0, unit: "Kč", correctExplanation: "0,15 % z 800 000 Kč je 1 200 Kč, což je víc než maximum. Zaplatíš 600 Kč.", incorrectExplanation: "Procento vychází 800 000 × 0,0015 = 1 200 Kč. Ceník ale stanoví maximum, které se nepřekročí." },

    { id: "hidden", type: "explanation", title: "Kde se skrývá náklad u „0 Kč“", content: "Broker bez poplatku za obchod nemusí být levný. Náklad se může schovat v měnové konverzi, tedy v přirážce ke kurzu při směně korun na eura nebo dolary. Další náklady jsou rozpětí nákupní a prodejní ceny (spread), poplatek za úschovu nad určitou hodnotu majetku nebo dražší výběr peněz. Spread není poplatek brokera, ale při nákupu a prodeji ho platíš také." },
    { id: "plan-worked", type: "workedExample", title: "Modelový příklad · Lucie kupuje 2 000 Kč měsíčně", introduction: "Ceník Brokera L, ETF v eurech, korunový účet. Spread a úschovu neuvažujeme.", steps: [
      { label: "Spořicí plán za měsíc", value: "0 Kč za nákup + konverze 0,5 % z 2 000 Kč = 10 Kč" },
      { label: "Spořicí plán za rok", value: "12 × 10 Kč = 120 Kč" },
      { label: "Jednotlivé pokyny za měsíc", value: "minimum 60 Kč + konverze 10 Kč = 70 Kč" },
      { label: "Jednotlivé pokyny za rok", value: "12 × 70 Kč = 840 Kč", emphasis: true },
    ], conclusion: "Spořicí plán „za 0 Kč“ není zdarma: platíš konverzi. Pro Lucii je přesto výrazně levnější než jednotlivé pokyny s minimem." },
    { id: "free-check", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Jiný broker inzeruje „obchodování za 0 Kč“. Co v ceníku zkontroluješ, než ho označíš za levný?", options: [
      { id: "nothing", label: "Nic. Bez poplatku za obchod investování nic nestojí.", misconception: "Bez poplatku za obchod = zdarma", explanation: "Poplatek za obchod je jen jedna položka. Náklad může být v konverzi, spreadu nebo úschově." },
      { id: "hidden", label: "Měnovou konverzi, spread a poplatek za úschovu." },
      { id: "app", label: "Jen hodnocení aplikace v obchodě s aplikacemi.", explanation: "Hodnocení aplikace o poplatcích nic neříká. Odpověď najdeš v ceníku." },
    ], correctOptionId: "hidden", correctExplanation: "Správně. „0 Kč za obchod“ je jeden řádek ceníku. Celkové náklady poznáš až z konverze, spreadu, úschovy a výběru pro svůj plán.", incorrectExplanation: "Nulový poplatek za obchod neznamená nulové náklady. Zkontroluj konverzi, spread a úschovu." },

    { id: "version", type: "conceptCallout", title: "Ceník má datum", content: "Broker může ceník změnit. Na každém ceníku hledej datum, od kdy platí, a když si poplatky opisuješ, poznamenej si ho. Před větším nákupem ověř, že čteš aktuální verzi." },
    { id: "misconceptions", type: "conceptCallout", title: "Tři časté omyly", content: "„0,15 % je vždy levné“: u malého nákupu může minimum znamenat několik procent. „Bez poplatku za obchod = zdarma“: náklad může být v konverzi, spreadu nebo úschově. „Ceník platí navždy“: broker ho může změnit, proto sleduj jeho datum." },

    { id: "profile", type: "interactiveFigure", figure: "fee-profile", title: "Profil poplatků", description: "Přepiš hodnoty z ceníku do profilu a podívej se, kolik zaplatíš za malý, střední a velký nákup. Uložení je dobrovolné a nehodnotí se." },

    { id: "mastery-minimum", type: "multipleChoiceQuestion", prompt: "Proč je minimální poplatek problém hlavně u malých pravidelných nákupů?", options: [
      { id: "share", label: "U malé částky tvoří pevné minimum velké procento nákupu a platí se při každém nákupu znovu." },
      { id: "skip", label: "U malých nákupů se minimální poplatek neplatí.", explanation: "Je to naopak: minimum se uplatní právě tehdy, když procento z malé částky vyjde méně." },
      { id: "risk", label: "Minimální poplatek zvyšuje riziko investice.", explanation: "Poplatek riziko nemění. Je to jistý náklad, který snižuje výsledek." },
    ], correctOptionId: "share", correctExplanation: "Přesně. 60 Kč z nákupu za 2 000 Kč jsou 3 %, a to každý měsíc znovu. U pravidelných malých nákupů proto hledej spořicí plán nebo nízké minimum.", incorrectExplanation: "Minimum se uplatní, když procento z částky vyjde méně. U malých nákupů pak tvoří velký podíl z každého nákupu." },

    { id: "reflection", type: "writtenReflection", prompt: "Na co se v ceníku podíváš jako první, když chceš investovat malou částku každý měsíc? Napiš 2–4 věty a vysvětli proč. Neuváděj osobní údaje.", rubric: [{ id: "minimum", text: "Zmiňuji minimální poplatek a jeho podíl na malém nákupu." }, { id: "hidden", text: "Kontroluji i měnovou konverzi, úschovu nebo spread." }, { id: "date", text: "Ověřuji datum platnosti ceníku." }], sampleAnswer: "Nejdřív se podívám na minimální poplatek za obchod, protože u 2 000 Kč může tvořit několik procent z každého nákupu. Pak zkontroluji měnovou konverzi a úschovu, protože „0 Kč za obchod“ neznamená zdarma. Nakonec si poznamenám datum ceníku." },

    { id: "lab-bridge", type: "labBridge", title: "Poplatky v Portfolio Labu", content: "V Portfolio Labu si na detailu instrumentu vybereš jeden ze dvou fiktivních ceníků. Před každým nákupem uvidíš poplatek za obchod s minimem a maximem i přirážku k měnové konverzi. Počítá je stejné pravidlo jako tato lekce. Tvůj uložený profil nákupy v Labu nemění." },
    { id: "summary", type: "lessonSummary", title: "Ceník čti celý a se svou částkou", content: "Poplatek za obchod tvoří procento, minimum a maximum: u malých nákupů rozhoduje minimum, u velkých maximum. Nulový poplatek za obchod neznamená nulové náklady; zkontroluj měnovou konverzi, spread, úschovu a výběr. Ceník má datum a může se změnit. Lekce nedoporučuje konkrétního brokera." },
    { id: "sources", type: "paragraph", content: "Zdroje · FINRA, Fees and Commissions: https://www.finra.org/investors/investing/investing-basics/fees-commissions · Broker L a jeho ceník jsou smyšlené; nejde o srovnání skutečných poskytovatelů. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
