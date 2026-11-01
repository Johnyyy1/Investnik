import type { AuthoredLesson } from "../types";
import { capstoneThresholds, getCapstone } from "@/features/milestones/registry";
import { firstPlanLessons } from "./manifest";

const lesson = firstPlanLessons.find((entry) => entry.id === "first-plan-capstone-a")!;
const capstone = getCapstone("capstone-a-v1")!;

/** The rubric block whose saved output is also appended as a `capstone-a-v1` submission (see milestones/capstone-output.ts). */
export const CAPSTONE_A_OUTPUT_BLOCK_ID = "self-assessment";

/** Fictional inputs of every example; the tests recompute each derived value from these. */
export const capstoneAExample = {
  /** Worked alignment: Klára's IPS targets and Lab weights in percent; cash is a line like any other. */
  worked: { target: { fundA: 70, fundB: 20, cash: 10 }, actual: { fundA: 66, fundB: 23, cash: 11 } },
  faded: { target: { fundA: 60, fundB: 30, cash: 10 }, actual: { fundA: 52, fundB: 35, cash: 13 } },
  /** Model portfolio overview of the mastery tap: [IPS target, Lab weight] in percent. */
  overview: { a: { target: 50, actual: 47, stock: false }, b: { target: 20, actual: 18, stock: false }, c: { target: 0, actual: 14, stock: true }, d: { target: 0, actual: 6, stock: true }, e: { target: 30, actual: 15, stock: false } },
  /** Worked cost example: a flat fee per monthly purchase plus TER on the average balance, no currency conversion. */
  costsWorked: { monthlyContributionKc: 3000, feePerPurchaseKc: 15, terPercent: 0.2, averageBalanceKc: 100_000 },
  /** Independent cost task: a percentage purchase fee instead of a flat one. */
  costsPractice: { monthlyContributionKc: 2000, purchaseFeePercent: 0.5, terPercent: 0.25, averageBalanceKc: 60_000 },
} as const;

const { worked, faded, overview, costsWorked, costsPractice } = capstoneAExample;
const ipsBandPoints = capstoneThresholds.ipsMaxDeviationBps / 100;
const stockCapPercent = capstoneThresholds.singleStockMaxBps / 100;
const gap = (target: number, actual: number) => Math.abs(actual - target);
const maxGap = (pair: { target: Record<string, number>; actual: Record<string, number> }) => Math.max(...Object.keys(pair.target).map((key) => gap(pair.target[key], pair.actual[key])));
const kc = (value: number) => `${value.toLocaleString("cs-CZ").replace(/ /g, " ")} Kč`;
const pct = (value: number) => `${String(value).replace(".", ",")} %`;
const workedFees = 12 * costsWorked.feePerPurchaseKc;
const workedTer = (costsWorked.averageBalanceKc * costsWorked.terPercent) / 100;
const practiceFees = 12 * (costsPractice.monthlyContributionKc * costsPractice.purchaseFeePercent) / 100;
const practiceTer = (costsPractice.averageBalanceKc * costsPractice.terPercent) / 100;
const row = (id: keyof typeof overview, name: string, note: string) => ({
  id, note,
  cells: { name, type: overview[id].stock ? "akcie" : id === "e" ? "hotovost" : "ETF", target: `${overview[id].target} %`, actual: `${overview[id].actual} %` },
});

export const capstoneALesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "first-plan", slug: lesson.slug, title: lesson.title,
  eyebrow: "První plán a první nákup", position: 4, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "brief", label: "Zadání" }, { id: "ips", label: "IPS a portfolio" }, { id: "costs", label: "Náklady" }, { id: "crisis", label: "Krizový nácvik" }, { id: "submit", label: "Sebehodnocení" }, { id: "result", label: "Výsledek" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Tohle je závěrečný projekt milníku A „Připraven/a začít“. Nové učivo tu není: dáš dohromady, co už máš. Svůj investiční plán (IPS), cvičné portfolio v Labu, které mu odpovídá, náklady plánu a krizový nácvik s poklesem o 30 %. Na konci posoudíš svou práci podle rubriky, kterou vidíš už teď. Hodnotí se postup, ne výnos: portfolio v mínusu může projekt splnit a portfolio v plusu ho nesplní, pokud neodpovídá plánu." },
    { id: "rubric-overview", type: "conceptCallout", title: "Rubrika předem: čtyři kritéria, čtyři úrovně", content: `Kritéria jsou: soulad portfolia s IPS, náklady, diverzifikace a chování v krizi. Každé má úrovně 1 Začínající, 2 Rozvíjející se, 3 Zdatný a 4 Příkladný. U tří kritérií server přidá automatickou kontrolu ze tvých dat: odchylku portfolia od IPS (nejvýše ${ipsBandPoints} p. b. u každé složky), diverzifikaci (aspoň jeden fond a žádná jednotlivá akcie nad ${stockCapPercent} % portfolia) a prodeje mimo pravidla IPS v posledním krizovém nácviku (žádný). Projekt je splněný, když každé kritérium dosáhne aspoň úrovně 3. Prahy jsou ilustrativní vzdělávací meze, ne norma ani doporučení.` },
    { id: "predict", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Dvě cvičná portfolia odevzdávají projekt. Portfolio A je přesně podle IPS a za poslední měsíce je v mínusu. Portfolio B má vyšší výnos, ale polovinu tvoří jedna akcie, kterou IPS nezmiňuje. Které podle rubriky splňuje soulad s IPS a diverzifikaci?", options: [
      { id: "a", label: "Portfolio A. Rubrika posuzuje soulad s plánem a rozložení, výnos v ní není." },
      { id: "b", label: "Portfolio B, protože vydělalo víc.", misconception: "výnos dokazuje dobrý postup", explanation: "Výnos za pár měsíců rubrika nehodnotí. Portfolio B má jednu akcii mnohem nad limitem diverzifikace a liší se od IPS o desítky procentních bodů." },
      { id: "both", label: "Obě, protože obě mají nějaký plán.", misconception: "stačí mít plán", explanation: "Nestačí plán mít, portfolio mu musí odpovídat. Akcie mimo IPS tvoří polovinu portfolia B, takže odchylka od cíle je mnohem větší než povolených 5 p. b." },
    ], correctOptionId: "a", correctExplanation: "Přesně tak. Portfolio A drží cílovou alokaci z IPS; krátkodobý pokles na tom nic nemění. Výnos uvidíš jako kontext, do hodnocení nevstupuje.", incorrectExplanation: "Podívej se, co rubrika měří: odchylku od IPS a podíl jednotlivé akcie, ne výnos." },

    { id: "ips-check", type: "explanation", title: "Krok 1 · Zkontroluj svůj IPS", content: "Měřítkem celého projektu je tvůj poslední uložený IPS. Otevři ho a zkontroluj, že je úplný a aktuální: cíl a horizont, cílová alokace, příspěvek, pravidlo vyvažování a pravidlo pro propad. Automatické porovnání s Labem potřebuje alokaci po konkrétních nástrojích a hotovosti. Plán jen po třídách aktiv („akcie 70 %“) je platný IPS, ale kontrolu souladu s ním server neprovede a kritérium pak zůstane nehodnocené. Když plán upravíš, ulož ho jako novou verzi; předchozí verze zůstanou zachované." },
    { id: "builder", type: "interactiveFigure", figure: "ips-builder", title: "Tvůj investiční plán", description: "Otevři svůj uložený plán. Když je v pořádku, stačí ho zkontrolovat a pokračovat; když ne, ulož změnu jako novou verzi." },

    { id: "alignment", type: "explanation", title: "Krok 2 · Portfolio proti IPS", content: `Server porovná váhy v tvém cvičném portfoliu s cílovou alokací IPS. U každého nástroje i u hotovosti spočítá rozdíl v procentních bodech (p. b.): |podíl v Labu − cíl z IPS|. Nástroj, který IPS nemá, má cíl 0 %; nástroj z IPS, který nedržíš, má podíl 0 %. Rozhoduje největší z těchto rozdílů: pro úroveň Zdatný smí být nejvýše ${ipsBandPoints} p. b. Stejný údaj ukazuje zpětná vazba procesu v Portfolio Labu. Odchylku srovnáš hlavně příspěvky podle plánu; prodej není jediná cesta.` },
    { id: "worked", type: "workedExample", title: "Modelový příklad · Klářina odchylka", introduction: "Klára má v IPS dva fondy a hotovost. Váhy v Labu se po nákupech a pohybu cen trochu posunuly.", steps: [
      { label: "Fond A", value: `cíl ${worked.target.fundA} %, v Labu ${worked.actual.fundA} % → ${gap(worked.target.fundA, worked.actual.fundA)} p. b.` },
      { label: "Fond B", value: `cíl ${worked.target.fundB} %, v Labu ${worked.actual.fundB} % → ${gap(worked.target.fundB, worked.actual.fundB)} p. b.` },
      { label: "Hotovost", value: `cíl ${worked.target.cash} %, v Labu ${worked.actual.cash} % → ${gap(worked.target.cash, worked.actual.cash)} p. b.` },
      { label: "Největší odchylka", value: `${maxGap(worked)} p. b. ≤ ${ipsBandPoints} p. b.`, emphasis: true },
    ], conclusion: "Každá složka je v limitu, takže automatická kontrola souladu projde. Klára umí říct, že další příspěvek pošle do Fondu A, který je pod cílem. To odpovídá úrovni Příkladný." },
    { id: "faded", type: "fadedExample", title: "Modelový příklad · doplň největší odchylku", steps: [
      { label: "Fond A", value: `cíl ${faded.target.fundA} %, v Labu ${faded.actual.fundA} %` },
      { label: "Fond B", value: `cíl ${faded.target.fundB} %, v Labu ${faded.actual.fundB} %` },
      { label: "Hotovost", value: `cíl ${faded.target.cash} %, v Labu ${faded.actual.cash} %` },
      { label: "Postup", value: "největší |podíl − cíl| ze všech složek" },
    ], blank: { label: "Největší odchylka", input: "number", answer: maxGap(faded), tolerance: 0, unit: "p. b." }, correctExplanation: `Fond A je ${gap(faded.target.fundA, faded.actual.fundA)} p. b. pod cílem, Fond B ${gap(faded.target.fundB, faded.actual.fundB)} p. b. nad ním a hotovost ${gap(faded.target.cash, faded.actual.cash)} p. b. nad ním. Největší odchylka ${maxGap(faded)} p. b. je nad limitem ${ipsBandPoints} p. b., takže kontrola souladu by neprošla. Příspěvky do Fondu A by ji postupně vrátily.`, incorrectExplanation: "Spočítej rozdíl u každé složky zvlášť, včetně hotovosti, a vyber ten největší. Výsledek je v procentních bodech; rozdíly se nesčítají." },

    { id: "diversification", type: "explanation", title: "Diverzifikace v rubrice", content: `Pro úroveň Zdatný musí jádro portfolia tvořit aspoň jeden široce rozložený fond (ETF) a žádná jednotlivá akcie nesmí přesáhnout ${stockCapPercent} % celého portfolia včetně hotovosti. Hranice ${stockCapPercent} % je ilustrativní práh pro tento projekt, ne pravidlo pro každého. Zpětná vazba procesu v Labu ukazuje i největší pozici a index koncentrace HHI; HHI je kontext, žádnou mez pro něj rubrika nestanoví.` },
    { id: "lab-check", type: "labBridge", title: "Zkontroluj to ve svém Labu", content: "V Portfolio Labu otevři přehled a zpětnou vazbu procesu. Najdeš tam odchylku od IPS, největší pozici a koncentraci podle svých skutečných cvičných dat. Pokud některá složka limit překračuje, můžeš ji upravit příspěvkem nebo obchodem podle svého plánu ještě před odevzdáním. Kvůli projektu nemusíš obchodovat: když portfolio plánu odpovídá, nejlepší krok je nechat ho být." },
    { id: "diversification-tap", type: "documentTap", prompt: `Označ všechny řádky, kvůli kterým by neprošla automatická kontrola: složka víc než ${ipsBandPoints} p. b. od cíle IPS, nebo jednotlivá akcie nad ${stockCapPercent} % portfolia.`, document: {
      eyebrow: "Modelový příklad", title: "Přehled cvičného portfolia proti IPS", meta: "Broker Ukázka · cvičné portfolio · váhy včetně hotovosti",
      columns: [
        { id: "name", label: "Pozice", mobile: "title" },
        { id: "type", label: "Typ", mobile: "subtitle" },
        { id: "target", label: "Cíl IPS", align: "end", mobile: "detail", mobileLabel: "cíl" },
        { id: "actual", label: "Podíl", align: "end", mobile: "value" },
      ],
      rows: [
        row("a", "Fond A", `${gap(overview.a.target, overview.a.actual)} p. b. od cíle, fond: v pořádku.`),
        row("b", "Fond B", `${gap(overview.b.target, overview.b.actual)} p. b. od cíle, fond: v pořádku.`),
        row("c", "Akcie C", `Není v IPS, takže je ${gap(overview.c.target, overview.c.actual)} p. b. od cíle, a jako jednotlivá akcie překračuje ${stockCapPercent} %.`),
        row("d", "Akcie D", `Pod ${stockCapPercent} %, ale není v IPS: ${gap(overview.d.target, overview.d.actual)} p. b. od cíle.`),
        row("e", "Hotovost", `${gap(overview.e.target, overview.e.actual)} p. b. pod cílem. Hotovost je složka IPS jako každá jiná.`),
      ],
    }, correctRowIds: ["c", "d", "e"], correctExplanation: `Akcie C neprojde dvakrát: je mimo IPS i nad limitem jednotlivé akcie. Akcie D je pod limitem, ale IPS ji nemá. Hotovost je o ${gap(overview.e.target, overview.e.actual)} p. b. pod cílem. Fondy A a B jsou v limitu.`, incorrectExplanation: "Projdi každý řádek dvěma otázkami: jak daleko je od cíle IPS a je to jednotlivá akcie nad limitem? Nezapomeň na hotovost a na pozice, které v IPS nejsou." },

    { id: "costs", type: "explanation", title: "Krok 3 · Kolik tě plán stojí za rok", content: "Náklady zatím server automaticky nekontroluje, posoudíš je ve vlastním sebehodnocení. Pro úroveň Zdatný máš celkové roční náklady plánu spočítané v Kč a víš, z čeho se skládají: poplatky za nákupy podle ceníku brokera, roční nákladovost fondu (TER) z investované částky a případně přirážka za převod měny. Čísla ber ze svého srovnání brokerů a z dokumentů fondu, ne z hlavy." },
    { id: "costs-worked", type: "workedExample", title: "Modelový příklad · roční náklady Klářina plánu", introduction: `Klára investuje ${kc(costsWorked.monthlyContributionKc)} měsíčně do fondu v korunách, takže měnu nepřevádí. Nabídka A účtuje ${kc(costsWorked.feePerPurchaseKc)} za nákup, fond má TER ${pct(costsWorked.terPercent)} ročně. Průměrný zůstatek za rok odhaduje na ${kc(costsWorked.averageBalanceKc)}.`, steps: [
      { label: "Poplatky za nákupy", value: `12 × ${kc(costsWorked.feePerPurchaseKc)} = ${kc(workedFees)}` },
      { label: "TER fondu", value: `${kc(costsWorked.averageBalanceKc)} × ${pct(costsWorked.terPercent)} = ${kc(workedTer)}` },
      { label: "Převod měny", value: "0 Kč · fond v Kč" },
      { label: "Celkem za rok", value: `${kc(workedFees + workedTer)}`, emphasis: true },
    ], conclusion: "Klára ví, že poplatky za nákup jsou skoro polovina nákladů. S větším měsíčním příspěvkem by jejich podíl klesal, s menším rostl. Tohle zdůvodnění odpovídá úrovni Příkladný." },
    { id: "costs-practice", type: "numericQuestion", prompt: `Modelový příklad · Tomáš investuje ${kc(costsPractice.monthlyContributionKc)} měsíčně do fondu v korunách. Broker účtuje ${pct(costsPractice.purchaseFeePercent)} z každého nákupu, fond má TER ${pct(costsPractice.terPercent)} ročně a průměrný zůstatek za rok bude ${kc(costsPractice.averageBalanceKc)}. Kolik Kč zaplatí za rok celkem?`, answer: practiceFees + practiceTer, tolerance: 0.5, unit: "Kč", correctExplanation: `Poplatek za jeden nákup je ${kc(costsPractice.monthlyContributionKc)} × ${pct(costsPractice.purchaseFeePercent)} = ${kc(practiceFees / 12)}, za rok ${kc(practiceFees)}. TER: ${kc(costsPractice.averageBalanceKc)} × ${pct(costsPractice.terPercent)} = ${kc(practiceTer)}. Celkem ${kc(practiceFees + practiceTer)}.`, incorrectExplanation: "Spočítej zvlášť poplatek za jeden nákup a vynásob ho dvanácti, pak přičti TER z průměrného zůstatku. TER se počítá ze zůstatku, ne z měsíčního příspěvku." },

    { id: "crisis", type: "explanation", title: "Krok 4 · Krizový nácvik", content: "Do rubriky vstupuje tvůj poslední krizový nácvik v Labu, odděleně od osobního portfolia. Pokud máš Modelovou krizi dokončenou z lekce Krizový nácvik, stačí ji tady ověřit. Můžeš ji projít i znovu. Nový nácvik ale dokonči: rubrika čte poslední zahájený nácvik a nedokončený nechá kritérium nehodnocené. Pro úroveň Zdatný nesmí nácvik obsahovat žádný prodej mimo pravidla IPS a tvoje reflexe pojmenuje pocit i pravidlo, které tě při rozhodování vedlo." },
    { id: "drill", type: "labMission", missionId: "capstone-a-crisis-v1", mission: {
      title: "Dokončená Modelová krize s tvým IPS", goal: "Měj dokončenou Modelovou krizi s pravidly ze svého IPS a ověř ji.", minutes: 8, target: "/lab/training",
      steps: [
        "Když už máš Modelovou krizi dokončenou z lekce Krizový nácvik, nic nespouštěj a klikni rovnou na Ověřit misi.",
        "Jinak v Labu otevři Krizový nácvik, vyber Modelovou krizi a projdi všechny měsíce. Každý měsíc rozhodni podle svého IPS: koupit, prodat, nebo nic nedělat.",
        "Po posledním měsíci si přečti vyhodnocení: prodeje mimo pravidla, příspěvky a alokaci vůči pásmu. Pak se vrať sem a klikni na Ověřit misi.",
      ],
      afterReturn: "Server ověří dokončenou Modelovou krizi a zaznamená, jestli nastal prodej mimo pravidla IPS. Misi splníš dokončením, ne výsledkem. Osobní portfolio, cvičný kapitál ani odměny se nemění a za obchody nic nedostaneš.",
    }, analysis: {
      title: "modelový investor",
      summary: "Modelový příklad · Klára prošla Modelovou krizi s IPS: cíl 70 % ve Fondu A, pásmo ±5 p. b., pravidlo pro propad „držet plán a dál přispívat“.",
      rows: [
        { label: "Prodeje mimo pravidla IPS", status: "Žádné", highlight: true },
        { label: "Příspěvky z plánu", status: "Každý měsíc" },
        { label: "Podíl Fondu A na konci", status: "68 % · v pásmu 65–75 %" },
        { label: "Výsledná hodnota", badge: "Kontext", status: "Nehodnotí se" },
      ],
      generalRule: "Kritérium Chování v krizi posuzuje, jestli rozhodnutí odpovídala pravidlům sepsaným předem. Kdo plán v nácviku porušil, splní úroveň Zdatný až dalším dokončeným nácvikem bez prodeje mimo pravidla.",
      selfExplanationPrompt: "Který měsíc nácviku byl pro tebe nejtěžší a co ti v něm řeklo tvé pravidlo?",
    } },

    { id: "rubric-recall", type: "multipleChoiceQuestion", prompt: `Modelový příklad · Petra si u diverzifikace dala úroveň 4. Automatická kontrola ale našla jednotlivou akcii se ${stockCapPercent + 4} % portfolia. Ostatní kritéria má na úrovni 3 a kontroly prošly. Jak projekt dopadne?`, options: [
      { id: "capped", label: "Diverzifikace se omezí na úroveň 2, takže projekt zatím splněný není. Po úpravě portfolia ho může odevzdat znovu." },
      { id: "self", label: "Projekt je splněný, protože rozhoduje sebehodnocení.", misconception: "sebehodnocení přebije data", explanation: "Kde existuje automatická kontrola, neúspěšný výsledek omezí kritérium na úroveň 2 bez ohledu na sebehodnocení. Hodnocení je tvoje, důkaz z dat ale platí." },
      { id: "lost", label: "Projekt propadl a lekci musí začít znovu od začátku.", misconception: "nesplnění maže pokrok", explanation: "Nesplněné kritérium nic nemaže. Pokrok v lekci i dokončené lekce zůstávají; projekt odevzdáš znovu, až portfolio upravíš." },
    ], correctOptionId: "capped", correctExplanation: `Neúspěšná automatická kontrola omezí kritérium na úroveň 2 a pro splnění musí mít všechna kritéria aspoň 3. Stačí srovnat akcii pod ${stockCapPercent} % a odevzdat znovu; dřívější odevzdání ani pokrok se neztratí.`, incorrectExplanation: "Vzpomeň si na pravidla rubriky: co udělá neúspěšná automatická kontrola se sebehodnocením a kolik musí mít každé kritérium?" },

    { id: "submit-intro", type: "explanation", title: "Krok 5 · Reflexe a odevzdání", content: "Napiš 3–5 vět: Odpovídala moje rozhodnutí plánu? Co v IPS změním a proč? Pak u každého kritéria zvol úroveň, která podle tebe odpovídá. Odevzdáním se uloží tvoje reflexe a sebehodnocení a server k nim zaznamená automatické kontroly z tvého Labu, IPS a posledního krizového nácviku v tomto okamžiku. Pozdější změny v Labu už toto odevzdání nepřepíšou. Pokračovat můžeš s jakoukoli zvolenou úrovní; projekt můžeš kdykoli odevzdat znovu." },
    { id: CAPSTONE_A_OUTPUT_BLOCK_ID, type: "rubricSelfAssessment", title: capstone.title, prompt: "Odpovídala moje rozhodnutí plánu? Co v IPS změním a proč? (3–5 vět)", criteria: capstone.criteria.map((criterion) => ({ id: criterion.id, label: criterion.title, levels: [...criterion.levels] })) },

    { id: "result", type: "explanation", title: "Krok 6 · Výsledek", content: "Výsledek uvidíš v Učení a v Pokroku u milníku A. Úroveň kritéria s automatickou kontrolou je tvoje sebehodnocení; neúspěšná kontrola ji omezí na úroveň 2 a chybějící důkaz (zamčený Lab, IPS bez konkrétních nástrojů, nedokončený nácvik) ho nechá nehodnocené. Projekt je splněný, když všechna čtyři kritéria mají aspoň úroveň 3. Pokud ne, oprav, co rubrika ukáže, a vrať se k tomuto kroku: nové odevzdání se uloží jako další verze a první splněné se už nikdy neztratí. Milník A navíc potřebuje dokončené lekce úrovní 1–2 a jádra Investora v zrcadle. Je to uznání, ne odemčení: nic nového se jím nezpřístupní ani nezamkne." },
    { id: "next", type: "labBridge", title: "Další krok: úroveň 3", content: "S hotovým plánem a ověřeným postupem můžeš pokračovat úrovní 3 Portfolio: stavba, údržba a měření. Naučíš se tam měřit výnos a riziko svého portfolia a udržovat ho podle plánu.", lessonLinks: [{ lessonId: "returns-what-is-a-return", label: "Začni lekcí 3.1.1 Co je výnos?" }] },
    { id: "summary", type: "lessonSummary", title: "Připraven/a začít", content: "Projekt spojil tvůj plán, portfolio, náklady a chování pod tlakem. Rubrika posuzuje postup: soulad s IPS, spočítané náklady, rozložené jádro a dodržení pravidel v krizi. Výnos v ní není. Úspěšný projekt je důkaz, že umíš pracovat se svým plánem v simulaci; neprokazuje, jak se zachováš se skutečnými penězi, a není to investiční doporučení." },
    { id: "sources", type: "paragraph", content: "Všechny osoby, fondy, ceníky a portfolia v lekci jsou smyšlené (Modelový příklad). Prahy 5 p. b. a 10 % jsou ilustrativní meze závěrečného projektu, ne norma. Modelová krize je vymyšlená řada (Simulace · Deterministická ukázková data). Automatické kontroly počítá server z tvých cvičných dat v Labu, z uloženého IPS a z posledního krizového nácviku. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
