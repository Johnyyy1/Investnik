import { evaCostComparison } from "@/features/artifacts/cost-comparison";
import type { AuthoredLesson } from "../types";
import { costsLessons } from "./manifest";
const lesson = costsLessons.find((entry) => entry.id === "costs-broker-comparison")!;

export const compareTwoBrokersLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "costs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Poplatky a celkové náklady", position: 5, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Plán" }, { id: "tariffs", label: "Dva ceníky" }, { id: "frequency", label: "Frekvence" }, { id: "mix-td", label: "Smíšené opakování" }, { id: "justify", label: "Zdůvodnění" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Eva chce každý měsíc investovat 2 500 Kč do ETF obchodovaného v eurech, tedy 12 nákupů ročně. Portfolio v příštích letech nepřekročí 500 000 Kč. Vybírá mezi dvěma fiktivními brokery. Nehledáme „správného“ brokera: spočítáš, kolik Evu plán u každého stojí za rok, a volbu zdůvodníš." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Nejdřív odhadni: broker A nebere nic za obchod a konverzi účtuje 0,25 %. Broker B bere za obchod 0,1 % s minimem 36,45 Kč a konverzi 0,15 %. U kterého vyjde Evin plán za rok levněji?", options: [
      { id: "a", label: "U brokera A, i když má dražší konverzi." },
      { id: "b", label: "U brokera B, protože má nižší sazbu za obchod i za konverzi.", misconception: "sazba bez minima", explanation: "Sazba 0,1 % platí až nad minimem. Z nákupu za 2 500 Kč vyjde 2,50 Kč, takže Eva zaplatí minimum 36,45 Kč, a to dvanáctkrát za rok." },
      { id: "same", label: "Vyjde to nastejno, liší se jen pár haléřů.", explanation: "Rozdíl je větší. Minimum u brokera B platí Eva při každém nákupu, takže se za rok sečte dvanáctkrát." },
    ], correctOptionId: "a", correctExplanation: "U Evina plánu rozhoduje minimum brokera B, ne jeho sazba. Na dalších krocích to spočítáš v korunách.", incorrectExplanation: "Podívej se, kolik je 0,1 % z 2 500 Kč a jestli to přesáhne minimum 36,45 Kč." },

    { id: "tariffs", type: "explanation", title: "Modelový příklad · dva fiktivní ceníky", content: "Broker A: obchod 0 Kč (spořicí plán), konverze korun na eura 0,25 % z částky, úschova 0 Kč. Broker B: obchod 0,1 % z částky, minimum 1,50 EUR a bez maxima, konverze 0,15 %, úschova 0 Kč. Minimum přepočítáme modelovým kurzem 24,30 Kč za euro: 1,50 × 24,30 = 36,45 Kč. Oba ceníky jsou smyšlené a nejsou nabídkou skutečného brokera." },
    { id: "formula", type: "formula", expression: "roční náklady = k × (poplatek za obchod + konverze) + úschova", latex: String.raw`N = k \cdot (P + K) + U`, variables: [
      { symbol: "N", description: "celkové roční náklady plánu" },
      { symbol: "k", description: "počet nákupů za rok" },
      { symbol: "P", description: "poplatek za jeden obchod: procento z částky, nejméně minimum" },
      { symbol: "K", description: "náklad konverze jednoho nákupu" },
      { symbol: "U", description: "roční úschova (v obou ceníkách 0 Kč)" },
    ] },
    { id: "worked", type: "workedExample", title: "Modelový příklad · jeden nákup za 2 500 Kč", introduction: "Náklady počítáme v Kč na haléře. Nejdřív jeden nákup, celý rok spočítáš v dalším kroku.", steps: [
      { label: "A · poplatek za obchod", value: "0 Kč (spořicí plán)" },
      { label: "A · konverze 0,25 %", value: "2 500 × 0,0025 = 6,25 Kč" },
      { label: "B · poplatek 0,1 %", value: "2 500 × 0,001 = 2,50 Kč, méně než minimum → 36,45 Kč" },
      { label: "B · konverze 0,15 %", value: "2 500 × 0,0015 = 3,75 Kč" },
      { label: "Jeden nákup celkem", value: "A 6,25 Kč, B 36,45 + 3,75 = 40,20 Kč", emphasis: true },
    ], conclusion: "Úschova je u obou brokerů nulová, proto roční náklady tvoří jen nákupy. Teď stačí spočítat, kolikrát za rok Eva nakupuje." },

    { id: "annual", type: "multiNumericQuestion", prompt: "Modelový příklad · Eva nakupuje 12× ročně po 2 500 Kč. Jaké jsou celkové roční náklady plánu u brokera A a u brokera B? Zaokrouhli na haléře.", answers: [
      { id: "a", label: "Broker A", answer: 75, tolerance: 0.5, unit: "Kč" },
      { id: "b", label: "Broker B", answer: 482.4, tolerance: 0.5, unit: "Kč" },
    ], correctExplanation: "A: 12 × 6,25 = 75 Kč, tedy 0,25 % z ročně investovaných 30 000 Kč. B: 12 × (36,45 + 3,75) = 482,40 Kč, tedy 1,61 %. U malých pravidelných nákupů rozhoduje minimum, ne sazba.", incorrectExplanation: "Náklad jednoho nákupu vynásob počtem nákupů za rok: A 12 × 6,25 Kč, B 12 × (36,45 + 3,75) Kč. U B nezapomeň, že 0,1 % z 2 500 Kč je pod minimem." },

    { id: "frequency", type: "explanation", title: "Stejný broker, jiná frekvence", content: "Minimum se platí za každý nákup. Kdyby Eva u brokera B vložila celých 30 000 Kč jednou ročně, vyšlo by 0,1 % z 30 000 Kč na 30 Kč. To je pořád pod minimem, ale zaplatí ho jen jednou. Konverze zůstává 0,15 % z celé částky, ať ji Eva převede najednou, nebo po částech." },
    { id: "frequency-worked", type: "workedExample", title: "Modelový příklad · broker B, 30 000 Kč jednou ročně", steps: [
      { label: "Poplatek za obchod", value: "30 000 × 0,001 = 30 Kč, méně než minimum → 36,45 Kč" },
      { label: "Konverze 0,15 %", value: "30 000 × 0,0015 = 45 Kč" },
      { label: "Roční náklady", value: "36,45 + 45 = 81,45 Kč ≈ 0,27 %", emphasis: true },
    ], conclusion: "Proti 482,40 Kč při dvanácti nákupech je to zhruba šestina. Konverze stojí v obou případech 45 Kč, mění se jen počet zaplacených minim. Jeden nákup ročně ale znamená, že peníze čekají na účtu a investuješ je později. I to patří do rozhodnutí, nejen poplatek." },

    { id: "quarterly", type: "numericQuestion", prompt: "Modelový příklad · U brokera B nakupuješ čtvrtletně po 7 500 Kč, tedy čtyřikrát ročně a celkem opět 30 000 Kč. Jaké jsou roční náklady plánu? Zaokrouhli na haléře.", answer: 190.8, tolerance: 0.5, unit: "Kč", correctExplanation: "0,1 % z 7 500 Kč je 7,50 Kč, pod minimem, takže 36,45 Kč. Konverze 7 500 × 0,0015 = 11,25 Kč. Ročně 4 × (36,45 + 11,25) = 190,80 Kč, tedy 0,64 %.", incorrectExplanation: "Spočítej jeden nákup: poplatek za obchod (pozor na minimum) plus konverzi 0,15 % z 7 500 Kč. Pak výsledek vynásob čtyřmi." },

    { id: "break-even", type: "explanation", title: "Kdy se výsledek změní", content: "Modelový příklad · Na jednom nákupu je konverze u A o 0,10 p. b. dražší než u B. Minimum 36,45 Kč se tím vyrovná až u nákupu za 36 450 Kč (36,45 ÷ 0,001). Od této částky už broker B platí místo minima 0,1 % a oba ceníky vyjdou stejně, na 0,25 % z nákupu. U menších nákupů je v tomto modelu levnější A. Jiné ceníky, jiná částka nebo úschova pořadí změnit mohou, proto počítej se svým plánem." },
    { id: "non-price", type: "conceptCallout", title: "Cena není jediné kritérium", content: "Než si brokera vybereš, ověř i to, co ceník neukazuje: jak je chráněný tvůj majetek a kdo brokera dohlíží, jestli nabízí ETF, která chceš (v EU fondy UCITS), a jestli dává přehledné výpisy pro daňové přiznání. Lekce nedoporučuje konkrétního brokera ani produkt." },

    { id: "mix-td", type: "numericQuestion", prompt: "Smíšené opakování · Modelový příklad · Index za rok vydělal 8,10 %, ETF na tento index 7,95 %. Jaký je rozdíl ve výkonnosti vůči indexu? Uveď v p. b. se znaménkem; zaostání je záporné.", answer: -0.15, tolerance: 0.005, unit: "p. b.", correctExplanation: "7,95 % − 8,10 % = −0,15 p. b. Fond za indexem zaostal o 0,15 procentního bodu.", incorrectExplanation: "Od výnosu fondu odečti výnos indexu: 7,95 − 8,10. Fond vydělal méně než index, proto je výsledek záporný." },
    { id: "mix-trade", type: "numericQuestion", prompt: "Smíšené opakování · Modelový příklad · Kupuješ ETF za 6 000 Kč ve středu kotace. Celý spread je 0,20 % středu. Poplatek za obchod je 0,15 % s minimem 40 Kč, bez maxima. Kolik tě nákup stojí celkem (poplatek + polovina spreadu)?", answer: 46, tolerance: 0.01, unit: "Kč", correctExplanation: "0,15 % z 6 000 Kč je 9 Kč, pod minimem, takže poplatek 40 Kč. Polovina spreadu je 6 000 × 0,10 % = 6 Kč. Celkem 46 Kč.", incorrectExplanation: "Poplatek: 0,15 % z 6 000 Kč porovnej s minimem 40 Kč. Spread: platíš jen polovinu z 0,20 %, tedy 0,10 % z 6 000 Kč." },
    { id: "mix-drag", type: "multipleChoiceQuestion", prompt: "Smíšené opakování · Dva fondy na stejný index se liší celkovými ročními náklady o 1 p. b. Co se děje s rozdílem v konečné hodnotě, když investuješ déle?", options: [
      { id: "grows", label: "Roste rychleji než lineárně, protože náklady se berou z celé rostoucí hodnoty." },
      { id: "flat", label: "Zůstává 1 % konečné hodnoty, ať investuješ jakkoli dlouho.", misconception: "náklady se odečtou jednou", explanation: "Náklady se neberou jednou. Fond je účtuje každý rok znovu z celé hodnoty." },
      { id: "linear", label: "Je přesně 1 % za každý rok, za 30 let tedy 30 %.", misconception: "náklady se jen sčítají", explanation: "Kvůli skládání je rozdíl za 30 let jiný než prostý součet, protože zaplacené koruny chybí i ve všech dalších letech." },
    ], correctOptionId: "grows", correctExplanation: "Stejné procento z rostoucí hodnoty dává každý rok víc korun a ty chybí i v dalších letech. Proto rozdíl roste s časem.", incorrectExplanation: "Rozliš, jestli se náklady berou jednou, nebo každý rok z celé hodnoty včetně výnosů." },

    { id: "justify", type: "multipleChoiceQuestion", prompt: "Eva píše zdůvodnění své volby. Které je nejúplnější?", options: [
      { id: "rate", label: "Broker B je levnější, protože má nižší sazbu za obchod i za konverzi.", misconception: "sazba bez minima", explanation: "Sazba nestačí. U nákupu za 2 500 Kč platí Eva minimum 36,45 Kč, takže B vyjde na 482,40 Kč ročně." },
      { id: "complete", label: "Při plánu 12 × 2 500 Kč vychází A na 75 Kč ročně a B na 482,40 Kč, protože u B platím minimum při každém nákupu. Při větších nebo méně častých nákupech by se rozdíl zmenšil. Ověřím ještě ochranu majetku, nabídku UCITS ETF a daňové výpisy." },
      { id: "always", label: "Broker A je vždycky levnější, protože nebere nic za obchod. Nic dalšího porovnávat nemusím.", misconception: "vždy/nikdy", explanation: "Výsledek platí pro tento plán a tyto ceníky. Při jiné částce, frekvenci nebo úschově se rozdíl mění a cena není jediné kritérium." },
    ], correctOptionId: "complete", correctExplanation: "Zdůvodnění má správná čísla obou variant, říká, co je způsobuje, jak by je změnila jiná frekvence, a myslí i na necenová kritéria.", incorrectExplanation: "Úplné zdůvodnění uvádí náklady obou variant, vliv částky a frekvence a aspoň jedno kritérium mimo cenu." },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách zdůvodni, který z fiktivních brokerů se hodí pro tvůj plán. Uveď roční náklady obou variant, jak je ovlivňuje frekvence nákupů, a jedno kritérium mimo cenu. Neuváděj osobní údaje.", rubric: [
      { id: "costs", text: "Uvádím správně spočítané roční náklady obou variant." },
      { id: "frequency", text: "Vysvětluji, jak výsledek mění částka nebo frekvence nákupů." },
      { id: "non-price", text: "Zmiňuji kritérium mimo cenu: ochranu majetku, nabídku UCITS ETF nebo daňové výpisy." },
      { id: "no-absolutes", text: "Nepíšu „vždy“ ani „nikdy“; závěr vztahuji ke svému plánu." },
    ], sampleAnswer: "Při 12 nákupech po 2 500 Kč by mě broker A stál 75 Kč ročně a broker B 482,40 Kč, protože u B bych každý měsíc platil minimum. Kdybych nakupoval jednou ročně, byl by rozdíl mnohem menší. Než se rozhodnu, ověřím ještě, jak je u brokera chráněný můj majetek a jestli nabízí ETF, které chci." },

    { id: "lab-bridge", type: "labBridge", savedArtifact: { kind: "cost_comparison", payload: evaCostComparison }, title: "Porovnej profily v Labu", content: "Portfolio Lab má dva fiktivní profily poplatků. Při kontrole nákupu uvidíš poplatek za obchod a přirážku konverze podle zvoleného profilu; čísla počítá server. Zkus stejnou částku u obou profilů a porovnej náklady. Obchod potvrdit nemusíš. Ulož si modelové srovnání Evina plánu: 12 × 2 500 Kč, A 75 Kč a B 482,40 Kč ročně. Obsahuje poplatky, konverzi a nulovou úschovu; nezahrnuje TER ani spread. V IPS na něj můžeš odkázat jako na vzdělávací podklad, ne jako na ověřený náklad svého vlastního plánu." },
    { id: "summary", type: "lessonSummary", title: "Srovnávej celý plán, ne sazbu", content: "Roční náklady plánu = počet nákupů × (poplatek za obchod + konverze) + úschova. U malých pravidelných nákupů může minimum převážit nižší sazbu; při větších nebo méně častých nákupech se rozdíl mění. Výsledek platí pro tvůj plán a tyto ceníky, proto ho přepočítej při každé změně. A ověř i to, co ceník neukazuje." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · FINRA, Fees and commissions: https://www.finra.org/investors/investing/investing-basics/fees-commissions · Brokeři A a B, jejich ceníky i kurz 24,30 Kč za euro jsou smyšlené; nejde o srovnání skutečných poskytovatelů. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
