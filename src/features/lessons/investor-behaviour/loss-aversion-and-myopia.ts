import type { AuthoredLesson } from "../types";
import { investorBehaviourLessons } from "./manifest";
import { myopiaSimulation, myopiaViews, type MixView } from "./myopia-model";
const lesson = investorBehaviourLessons.find((entry) => entry.id === "behaviour-loss-aversion")!;

const nbsp = " ";
const number = (value: number, digits = 0) => value.toLocaleString("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace(/\s/g, nbsp);
const kc = (amount: number) => `${number(Math.round(amount / 1_000) * 1_000)}${nbsp}Kč`;
/** Signed percentage with a typographic minus, one decimal: "−22,1 %". */
const percent = (decimal: number) => `${decimal < 0 ? "−" : ""}${number(Math.abs(decimal) * 100, 1)}${nbsp}%`;
const lossDaysShare = (view: MixView) => view.lossDays / view.days;
const lossYearsLabel = (count: number) => count === 1 ? "1 ztrátový rok" : count >= 2 && count <= 4 ? `${count} ztrátové roky` : `${count} ztrátových let`;
const mixLabel = (share: number) => `${share} % akcií, ${100 - share} % dluhopisů`;
const { years, tradingDaysPerYear, startValue } = myopiaSimulation;

/** The same outcome rows in both views: the path does not change, only how often it is looked at. */
const outcomeRows = (view: MixView) => [
  { label: `Hodnota po ${years} letech`, value: `${kc(view.endValue)} z ${kc(startValue)}` },
  { label: "Ztrátové dny", value: `${number(view.lossDays)} z ${number(view.days)} (${percent(lossDaysShare(view))})` },
  { label: "Ztrátové roky", value: `${view.lossYears} z ${view.years}` },
  { label: "Nejhorší rok", value: view.lossYears ? percent(view.worstYear) : "Žádný rok neskončil ztrátou" },
];

const choice = (view: MixView, content: string) => ({
  id: `stocks-${view.stockShare}`, label: mixLabel(view.stockShare),
  consequence: { lead: `Tvoje volba: ${view.stockShare} % akcií`, content, rows: outcomeRows(view) },
});

const disclaimer = `Simulace · Deterministická ukázková data, ne historie ani předpověď. ${years} let po ${tradingDaysPerYear} obchodních dnech; akcie s očekávaným ročním výnosem 7 % a volatilitou 16 %, dluhopisy 2 % a 4 %; poměr se vyvažuje denně; bez poplatků, daní a měny. Jedna simulovaná cesta; jiná by dopadla jinak.`;
const persona = { name: "Tomáš", age: 34, need: `Investuje ${kc(startValue)} na ${years} let a nepotřebuje je dřív. Vybírá poměr akcií a dluhopisů.` };
const eighty = myopiaViews.find((view) => view.stockShare === 80)!;

export const lossAversionLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "investor-behaviour", slug: lesson.slug, title: lesson.title,
  eyebrow: "Investor v zrcadle", position: 4, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Experiment" }, { id: "loss-aversion", label: "Averze ke ztrátě" }, { id: "research", label: "Výzkum" }, { id: "safeguard", label: "Pojistka" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: `Simulace · Tomáš si vybírá poměr akcií a dluhopisů. Nejdřív uvidí, jak by portfolio kolísalo den po dni, potom stejná data rok po roce. Rozhodni za něj v obou pohledech; žádná volba se nehodnotí a správný poměr neexistuje. Zapamatuj si, co zvolíš teď.` },
    { id: "daily", type: "personaDecision",
      persona: { ...persona, facts: myopiaViews.map((view) => ({ label: mixLabel(view.stockShare), value: `${percent(lossDaysShare(view))} dní ve ztrátě`, detail: `Nejhorší den ${percent(view.worstDay)}` })) },
      note: { title: "Denní pohled", content: `Tak vypadá aplikace, kterou otevíráš každý den: ${number(eighty.days)} obchodních dní a u každého zelené nebo červené číslo.` },
      prompt: "Simulace · Denní pohled. Jaký poměr akcií a dluhopisů Tomáš zvolí?",
      options: myopiaViews.map((view) => choice(view, "Zapamatuj si svou volbu. V dalším kroku uvidíš úplně stejnou simulovanou řadu, jen shrnutou po letech.")),
      disclaimer,
    },

    { id: "annual-intro", type: "paragraph", content: `Simulace · Stejné portfolio, stejné dny, stejný výsledek. Tentokrát Tomáš vidí jen ${years} ročních výsledků. Vyber znovu, bez ohledu na předchozí volbu.` },
    { id: "annual", type: "personaDecision",
      persona: { ...persona, facts: myopiaViews.map((view) => ({ label: mixLabel(view.stockShare), value: `${lossYearsLabel(view.lossYears)} z ${view.years}`, detail: view.lossYears ? `Nejhorší rok ${percent(view.worstYear)}` : "Žádný rok neskončil ztrátou" })) },
      note: { title: "Roční pohled", content: "Tak vypadá výpis, který otevřeš jednou ročně při kontrole plánu. Denní výkyvy jsou v něm schované uvnitř roku." },
      prompt: "Simulace · Roční pohled. Jaký poměr akcií a dluhopisů Tomáš zvolí teď?",
      options: myopiaViews.map((view) => choice(view, "Porovnej se svou volbou v denním pohledu. Data se nezměnila; řádky jsou stejné jako minule. Jiná byla jen frekvence pohledu.")),
      disclaimer,
    },

    { id: "loss-aversion", type: "explanation", title: "Averze ke ztrátě", content: "Averze ke ztrátě (anglicky loss aversion) znamená, že ztráta bolí víc, než stejně velký zisk těší. Ztráta 1 000 Kč nás rozladí víc, než nás potěší zisk 1 000 Kč. Popsali ji psychologové Daniel Kahneman a Amos Tversky v teorii vyhlídek. Není to chyba v počítání; tak zkrátka prožíváme zisky a ztráty." },
    { id: "myopia", type: "conceptCallout", title: "Krátkozraká averze ke ztrátě", content: "Krátkozraká averze ke ztrátě (myopic loss aversion) je averze ke ztrátě spojená s častým hodnocením výsledků. Kdo se dívá každý den, vidí kolem poloviny dní červená čísla, a každé z nich bolí víc, než zelené těší. Riziko pak vypadá větší, než odpovídá jeho horizontu, a člověk volí méně akcií. Kdo hodnotí po letech, vidí ztrát méně, protože se dny se ztrátou a se ziskem uvnitř roku z velké části vyruší." },

    { id: "worked", type: "workedExample", title: "Stejná řada, dvě čísla", introduction: `Simulace · Portfolio ${mixLabel(80)} z experimentu.`, steps: [
      { label: "Obchodních dní celkem", value: number(eighty.days) },
      { label: "Dní se ztrátou", value: number(eighty.lossDays) },
      { label: "Podíl ztrátových dní", value: `${number(eighty.lossDays)} ÷ ${number(eighty.days)} = ${percent(lossDaysShare(eighty))}`, emphasis: true },
      { label: "Let se ztrátou", value: `${eighty.lossYears} z ${eighty.years}` },
      { label: "Podíl ztrátových let", value: `${eighty.lossYears} ÷ ${eighty.years} = ${percent(eighty.lossYears / eighty.years)}`, emphasis: true },
    ], conclusion: `Totéž portfolio ukazuje ztrátu skoro v každém druhém dni, ale jen ve ${eighty.lossYears} letech z ${eighty.years}. Hodnota po ${years} letech je v obou pohledech stejná: ${kc(eighty.endValue)}.` },
    { id: "interpretation", type: "multipleChoiceQuestion", prompt: "Proč lidé při denním pohledu obvykle volí méně akcií než při ročním?", options: [
      { id: "more-losses", label: "Vidí mnohem častěji ztrátu, a ztráty je bolí víc, než je těší stejně velké zisky." },
      { id: "riskier", label: "Při denním pohledu jsou akcie opravdu rizikovější.", misconception: "pohled mění riziko", explanation: "Portfolio i jeho výsledek jsou v obou pohledech stejné. Mění se jen to, kolik ztrát člověk uvidí." },
      { id: "more-info", label: "Denní data obsahují víc informací, a proto vedou k lepšímu rozhodnutí.", misconception: "víc dat = lepší rozhodnutí", explanation: "Pro horizont deseti let přidávají denní výkyvy hlavně šum. Ve výzkumu vedla nejčastější zpětná vazba k nejmenšímu podílu akcií a nejmenšímu výnosu." },
    ], correctOptionId: "more-losses", correctExplanation: "Častý pohled ukáže víc ztrát a averze ke ztrátě je zesílí. Riziko pak působí větší, než pro dlouhý horizont je. Právě to se nazývá krátkozraká averze ke ztrátě.", incorrectExplanation: "Data jsou v obou pohledech stejná. Co se změnilo, a jak na to reagují naše pocity?" },

    { id: "probability-context", type: "paragraph", content: "Na skutečné historii akciových indexů platí stejný vzorec jako v simulaci: ztrátových dní bývá výrazně víc než ztrátových let. Přesný podíl záleží na trhu a období, proto ho tu neuvádíme." },
    { id: "probability", type: "multipleChoiceQuestion", prompt: "Kdy je u široce rozloženého akciového indexu pravděpodobnější, že uvidíš ztrátu?", options: [
      { id: "daily", label: "Když se díváš každý den." },
      { id: "yearly", label: "Když se díváš jednou ročně.", misconception: "delší období = víc ztrát", explanation: "Za rok má trh víc času, aby převážil růst. Ztrátové roky se stávají, ale méně často než ztrátové dny." },
      { id: "same", label: "Je to stejné, pravděpodobnost ztráty nezávisí na tom, jak často se díváš.", misconception: "frekvence nehraje roli", explanation: "Na výsledku portfolia frekvence nic nemění, ale na tom, jak často uvidíš ztrátu, ano. Denní změna je mnohem blíž nule, a tak skončí v minusu častěji." },
    ], correctOptionId: "daily", correctExplanation: "Denní změny jsou malé vůči kolísání, takže skoro polovina dní skončí v minusu. Za rok se průměrný růst nasčítá a ztrátových let je méně. Jistota to ale není: i celý rok může skončit ztrátou.", incorrectExplanation: "Vzpomeň si na řádky Ztrátové dny a Ztrátové roky v experimentu." },

    { id: "research", type: "conceptCallout", title: "Výzkum · čím častěji se díváme, tím méně riskujeme", content: "Shlomo Benartzi a Richard Thaler (1995) použili krátkozrakou averzi ke ztrátě k vysvětlení, proč investoři požadují za akcie tak vysokou prémii: kdo hodnotí portfolio zhruba každý rok, vnímá akcie rizikovější, než by je vnímal s delším horizontem. Thaler, Tversky, Kahneman a Schwartz (1997) to ověřili experimentem: účastníci rozdělovali peníze mezi dva simulované fondy a lišili se jen tím, jak často viděli výsledky. Skupina s nejčastější zpětnou vazbou investovala do rizikovějšího fondu nejméně a vydělala nejméně. Šlo o laboratorní experiment se simulovanými výnosy, ne o skutečné portfolio českých investorů." },
    { id: "misconceptions", type: "conceptCallout", title: "Časté omyly", content: "„Dívám se často, takže mám věci pod kontrolou.“ U dlouhodobého plánu častější pohled přidá hlavně emoce a pokušení zasáhnout. „Když se nedívám, riziko zmizí.“ Nezmizí; jen ho posuzuješ ve stejném horizontu, v jakém investuješ. „Ztrátový rok znamená, že plán nefunguje.“ Ztrátové roky k akciím patří; plán počítá s tím, co uděláš, když přijdou." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Co je krátkozraká averze ke ztrátě?", options: [
      { id: "frequent", label: "Sklon brát méně rizika, protože časté hodnocení ukazuje víc ztrát a ztráty bolí víc než zisky těší." },
      { id: "short-horizon", label: "Investování na příliš krátký horizont.", misconception: "krátký horizont", explanation: "Horizont investice může být dlouhý; krátkozraký je pohled. Jde o to, jak často výsledky hodnotíme." },
      { id: "fear", label: "Obecný strach z investování do akcií.", misconception: "obecný strach", explanation: "Nejde o strach z akcií obecně. Stejný člověk volí jinak jen podle toho, jak často výsledky vidí." },
    ], correctOptionId: "frequent", correctExplanation: "Krátkozraká averze ke ztrátě spojuje dvě věci: ztráty bolí víc než zisky těší a časté hodnocení ukazuje ztrát víc. Výsledkem je menší podíl rizika, než odpovídá horizontu.", incorrectExplanation: "Hledej popis, ve kterém hraje roli, jak často člověk výsledky hodnotí." },

    { id: "safeguard", type: "explanation", title: "Frekvence kontroly v IPS", content: "Pojistkou je rozhodnout předem, jak často budeš portfolio kontrolovat, a zapsat to do investičního plánu (IPS). U dlouhodobého plánu obvykle stačí jednou za čtvrtletí nebo jednou ročně; měsíční kontrola je v IPS také možná, pokud ji tak chceš. Mezi kontrolami se na ceny dívat nemusíš. Investník notifikace o cenách nemá. Otevři svůj IPS, zkontroluj nebo uprav frekvenci kontroly a ulož ho." },
    { id: "builder", type: "interactiveFigure", figure: "ips-builder", title: "Nastav frekvenci kontroly v IPS", description: "Otevři existující nástroj, zkontroluj pole „Jak často portfolio zkontroluji“ a ulož IPS jako novou verzi." },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách napiš, jak často budeš své portfolio kontrolovat, co při kontrole uděláš a co uděláš, když tě mezi kontrolami vyleká zpráva o propadu trhu.", rubric: [
      { id: "frequency", text: "Frekvence: konkrétní interval nebo měsíc kontroly, stejný jako v IPS." },
      { id: "content", text: "Obsah kontroly: alokace vůči cíli, příspěvky, náklady; ne denní výnos." },
      { id: "between", text: "Mezi kontrolami: co udělám s nutkáním se podívat nebo prodat." },
    ], sampleAnswer: "Portfolio kontroluji jednou ročně v lednu. Zkontroluji, jestli je alokace blízko cílovému poměru z IPS, jestli běží příspěvky a kolik platím za poplatky. Když mezi tím uslyším o propadu, aplikaci neotevřu kvůli ceně; otevřu IPS a přečtu si pravidlo pro propad." },

    { id: "lab-bridge", type: "labBridge", title: "Období grafu v Labu", content: "Graf v detailu instrumentu v Labu umí ukázat období od jednoho měsíce po celou dostupnou historii (1M až Max). Krátké období ukáže hlavně výkyvy, dlouhé ukáže výsledek v horizontu, v jakém investuješ. Zkus si stejný instrument přepnout mezi 1M a Max a všimni si, jak se změní dojem z rizika, i když se data nezměnila." },
    { id: "summary", type: "lessonSummary", title: "Dívej se tak často, jak investuješ", content: "Ztráta bolí víc, než stejně velký zisk těší. Když se díváme často, uvidíme víc ztrát, riziko působí větší a volíme méně akcií, než odpovídá horizontu. Stejná data viděná po letech ukazují ztrát méně. Pojistkou je frekvence kontroly zapsaná v IPS a žádné notifikace o cenách. Ztrátové roky tím nezmizí, jen je posuzuješ ve správném horizontu." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · Benartzi a Thaler, Myopic Loss Aversion and the Equity Premium Puzzle (Quarterly Journal of Economics, 1995): https://doi.org/10.2307/2118511 · Thaler, Tversky, Kahneman a Schwartz, The Effect of Myopia and Loss Aversion on Risk Taking: An Experimental Test (1997): https://www.casact.org/abstract/effect-myopia-and-loss-aversion-risk-taking-experimental-test · Kahneman a Tversky, Prospect Theory (Econometrica, 1979): https://doi.org/10.2307/1914185 · Experiment v lekci je simulace s vymyšlenými parametry. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
