import type { AuthoredLesson } from "../types";
import { MODEL_CRISIS_LEVELS } from "@/features/training/model-crisis";
import { investorBehaviourLessons } from "./manifest";
const lesson = investorBehaviourLessons.find((entry) => entry.id === "behaviour-crisis-drill")!;

/** Fictional inputs of the worked and faded examples; the tests recompute every derived value from these. */
export const crisisDrillExample = {
  /** Jana's IPS: invested target and rebalancing band, in percent and percentage points. */
  worked: { targetPercent: 80, bandPoints: 5, investedPercent: 72 },
  faded: { targetPercent: 70, bandPoints: 5, investedPercent: 63 },
  /** The persona decision happens in the fifth model month. */
  pressureMonth: 5,
} as const;

const level = (month: number) => Number(MODEL_CRISIS_LEVELS[month]);
const fall = (month: number) => `−${100 - level(month)} %`;
const deepestMonth = MODEL_CRISIS_LEVELS.reduce((deepest, value, month) => Number(value) < level(deepest) ? month : deepest, 0);
const { worked, faded, pressureMonth } = crisisDrillExample;

const analysis = {
  title: "modelový investor",
  summary: "Modelový příklad · Jana prošla Modelovou krizi se svým IPS: cíl 80 % v indexu, pásmo ±5 p. b., pravidlo pro propad „držet plán“.",
  rows: [
    { label: "Prodeje mimo pravidla IPS", status: "Žádné", highlight: true },
    { label: "Příspěvky z plánu", status: `${MODEL_CRISIS_LEVELS.length - 1} z ${MODEL_CRISIS_LEVELS.length - 1} měsíců` },
    { label: "Podíl indexu na konci", status: "78 % · v pásmu 75–85 %" },
    { label: "Výsledná hodnota", badge: "Kontext", status: "Nehodnotí se" },
  ],
  generalRule: "Nácvik posuzuje, jestli rozhodnutí odpovídala pravidlům sepsaným předem. Výsledná hodnota je jen kontext: v jiné krizi by stejný postup mohl skončit jinak.",
  selfExplanationPrompt: "Ve kterém měsíci bylo nejtěžší plán nezměnit? Co k tomu vedlo a co říkalo tvoje pravidlo?",
};

export const crisisDrillLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "investor-behaviour", slug: lesson.slug, title: lesson.title,
  eyebrow: "Investor v zrcadle", position: 5, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Příprava" }, { id: "pressure", label: "Tlak" }, { id: "drill", label: "Nácvik" }, { id: "evaluation", label: "Vyhodnocení" }, { id: "revision", label: "Revize IPS" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Svůj investiční plán (IPS) máš sepsaný v klidu. Tahle lekce ho vyzkouší pod tlakem. V odděleném Krizovém nácviku projdeš měsíc po měsíci simulovaný propad o 30 % a pomalé zotavení. Krize je vymyšlená (Simulace · Deterministická ukázková data), ne předpověď ani historie trhu. Tvoje osobní cvičné portfolio ani cvičný kapitál se nezmění." },
    { id: "criteria", type: "conceptCallout", title: "Co se na konci posoudí", content: "Nácvik hodnotí postup, ne výsledek. Posoudí se tři věci podle tvého IPS: jestli prodeje proběhly jen tehdy, kdy to pravidla dovolují; jestli dál přicházely plánované příspěvky; a jestli je podíl investované části v pásmu, které určuje tvůj IPS. Výslednou hodnotu uvidíš jako kontext. Dokončením nácviku lekci splníš i tehdy, když se plánu nedržíš: je to cvičení, ne zkouška." },
    { id: "predict", type: "multipleChoiceQuestion", prompt: "Na konci nácviku máš nižší hodnotu než soused, který v pátém měsíci všechno prodal a pak nakoupil zpátky levněji. Ty nic neprodáš a pokračuješ podle IPS. Jak nácvik posoudí tvůj postup?", options: [
      { id: "plan-kept", label: "Plán je dodržený. Nižší výsledek v jedné vymyšlené krizi na tom nic nemění." },
      { id: "worse", label: "Hůř, protože soused skončil s vyšší hodnotou.", misconception: "výsledek rozhoduje o správnosti", explanation: "Soused trefil dno v jedné vymyšlené řadě. Stejný postup by v jiné krizi mohl skončit prodejem před dalším růstem. Nácvik posuzuje, jestli rozhodnutí odpovídala předem sepsaným pravidlům." },
      { id: "luck", label: "Nijak, protože výsledek je jen náhoda a pravidla nejsou podstatná.", misconception: "proces nelze hodnotit", explanation: "Výsledek v jedné řadě je opravdu z velké části náhoda. Pravidla IPS ale ověřit jdou: kdy smíš prodat, kolik přispíváš a v jakém pásmu držíš alokaci." },
    ], correctOptionId: "plan-kept", correctExplanation: "Hodnotí se soulad s IPS: žádný prodej mimo pravidla, příspěvky dál přicházely. Výnos je kontext, ne známka.", incorrectExplanation: "Zaměř se na to, co nácvik posuzuje: pravidla sepsaná předem, ne trefu dna." },

    { id: "pressure", type: "personaDecision", persona: { name: "Jana", age: 31, need: "Má IPS s cílem 80 % v indexovém fondu, pásmem ±5 p. b. a pravidlem pro propad „držet plán a dál přispívat“.", facts: [
      { label: "Měsíc nácviku", value: `${pressureMonth}. z ${MODEL_CRISIS_LEVELS.length - 1}` },
      { label: "Index od začátku", value: fall(pressureMonth), detail: "Simulace · Deterministická ukázková data" },
      { label: "Potřeba peněz", value: "Žádná v příštích 10 letech", detail: "cíl ani příjem se nezměnil" },
    ] }, note: { title: "Zpráva od kamaráda", content: "„Vytáhni to, dokud to jde. Všude píšou, že to bude ještě horší. Až to dosedne, nakoupíš zpátky levněji.“" },
    prompt: `Simulace · Je ${pressureMonth}. měsíc nácviku a index je ${fall(pressureMonth)} od začátku. Co Jana udělá?`, options: [
      { id: "sell", label: "Prodá polovinu indexu a počká, až se trh uklidní.", consequence: { lead: "Prodej mimo pravidla IPS", content: "Podíl indexu po propadu klesl pod cíl, takže prodej neodpovídá vyvažování. Pravidlo pro propad říká držet plán. Jana jedná podle zprávy, ne podle situace, kterou si předem popsala. Navíc musí rozhodnout ještě jednou: kdy nakoupit zpátky.", rows: [{ label: "Soulad s IPS", value: "Ne · prodej mimo pravidla" }, { label: "Další rozhodnutí", value: "Kdy a za kolik nakoupit zpět" }] } },
      { id: "keep", label: "Nic neprodá, investuje měsíční příspěvek a kamarádovi odepíše, že má plán.", consequence: { lead: "V souladu s IPS", content: "Cíl i potřeba peněz se nezměnily, takže pravidlo pro propad platí. Příspěvek jde podle plánu do indexu. Jestli to bude „vyplatit se“, Jana neví; ví jen, že postupuje podle pravidel, která si sepsala v klidu.", rows: [{ label: "Soulad s IPS", value: "Ano" }, { label: "Příspěvek", value: "Investován podle plánu" }] } },
      { id: "buy-more", label: "Vybere rezervu a nakoupí za ni index, když je „ve slevě“.", consequence: { lead: "Mimo IPS, i když jde o nákup", content: "Rezerva má jiný účel než investice. Nákup nad rámec plánu je stejně jako panický prodej rozhodnutí podle aktuální ceny. IPS může vyvažování nákupem dovolit, ale jen v rámci peněz určených k investování.", rows: [{ label: "Soulad s IPS", value: "Ne · rezerva použita k investici" }, { label: "Riziko", value: "Bez rezervy pro nečekaný výdaj" }] } },
    ], disclaimer: "Modelový příklad. Jana, její plán i zpráva jsou smyšlené. Nejde o doporučení, jak investovat." },

    { id: "drill", type: "labMission", missionId: "crisis-drill-model-v1", mission: {
      title: "Modelová krize s tvým IPS", goal: "Dokonči Modelovou krizi do posledního měsíce a přečti si vyhodnocení podle svého IPS.", minutes: 8, target: "/lab/training",
      steps: [
        "V Labu otevři Krizový nácvik a vyber Modelovou krizi. Nácvik převezme pravidla z tvého posledního uloženého IPS: příspěvek, cílovou alokaci, vyvažování a pravidlo pro propad.",
        `Každý měsíc rozhodni: koupit, prodat, nebo pokračovat beze změny. Budoucí ceny nevidíš. Index za šest měsíců klesne až o ${100 - level(deepestMonth)} % a pak se pomalu zotavuje. Každé rozhodnutí se zaznamená.`,
        "Před rozhodnutím si řekni, co o takové situaci říká tvůj IPS. Čekat podle plánu je platné rozhodnutí.",
        "Po posledním měsíci si přečti vyhodnocení: prodeje mimo pravidla, příspěvky, alokaci vůči pásmu. Pak se vrať sem a klikni na Ověřit misi.",
      ],
      afterReturn: "Server ověří dokončenou Modelovou krizi a zaznamená, jestli nastal prodej mimo pravidla IPS. Misi splníš dokončením, ne výsledkem. Osobní portfolio, cvičný kapitál ani odměny se nemění a za obchody nic nedostaneš.",
    }, analysis },

    { id: "evaluation", type: "explanation", title: "Jak se nácvik vyhodnocuje", content: "Prodej je v souladu s IPS jen tehdy, když vrací alokaci k cíli: u pravidla s pásmem až po překročení horní hranice, u kalendářního vyvažování v určený měsíc a nad cílem. Pokud vyvažuješ příspěvky, prodej v plánu není. Alokaci na konci porovnáš s cílem a pásmem: odchylka je rozdíl podílu indexu a cílového podílu v procentních bodech (p. b.). Odchylka mimo pásmo neznamená selhání, ale podnět: příští příspěvek nebo vyvažování ji mají vrátit." },
    { id: "worked", type: "workedExample", title: "Modelový příklad · Janina alokace na dně", introduction: `Jana nic neprodala. Po propadu v ${deepestMonth}. měsíci má v indexu menší podíl, než chce.`, steps: [
      { label: "Cíl z IPS", value: `${worked.targetPercent} % v indexu` },
      { label: "Pásmo", value: `±${worked.bandPoints} p. b., tedy ${worked.targetPercent - worked.bandPoints}–${worked.targetPercent + worked.bandPoints} %` },
      { label: "Podíl indexu", value: `${worked.investedPercent} %` },
      { label: "Odchylka", value: `|${worked.investedPercent} − ${worked.targetPercent}| = ${Math.abs(worked.investedPercent - worked.targetPercent)} p. b. > ${worked.bandPoints} p. b.`, emphasis: true },
    ], conclusion: "Podíl je pod pásmem. Podle IPS Jana nic neprodává; plánovaný příspěvek nebo vyvažování nákupem vrací alokaci k cíli. Prodej indexu by odchylku ještě zvětšil." },
    { id: "faded", type: "fadedExample", title: "Modelový příklad · doplň odchylku", steps: [
      { label: "Cíl z IPS", value: `${faded.targetPercent} % v indexu` },
      { label: "Pásmo", value: `±${faded.bandPoints} p. b.` },
      { label: "Podíl indexu", value: `${faded.investedPercent} %` },
      { label: "Postup", value: "|podíl − cíl|" },
    ], blank: { label: "Odchylka", input: "number", answer: Math.abs(faded.investedPercent - faded.targetPercent), tolerance: 0, unit: "p. b." }, correctExplanation: `|${faded.investedPercent} − ${faded.targetPercent}| = ${Math.abs(faded.investedPercent - faded.targetPercent)} p. b. To je víc než pásmo ${faded.bandPoints} p. b., takže alokace je mimo pásmo pod cílem. Prodej by ji vzdálil ještě víc.`, incorrectExplanation: "Odečti cílový podíl od skutečného a vezmi absolutní hodnotu. Výsledek je v procentních bodech, ne v procentech hodnoty." },

    { id: "interpretation", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Petr v nácviku jednou prodal mimo pravidla IPS. Index pak ještě klesl, takže skončil s vyšší hodnotou, než kdyby plán dodržel. Co z toho plyne?", options: [
      { id: "broken", label: "Plán nedodržel. Vyšší hodnota v této řadě nedokazuje, že jeho postup byl dobrý." },
      { id: "good", label: "Postup byl správný, protože výsledek je lepší.", misconception: "výsledek dokazuje správnost", explanation: "Prodej mimo pravidla se trefil do jedné vymyšlené řady. Ve zbytku nácviku ani v jiné krizi by to tak dopadnout nemuselo. Hodnotí se pravidla, ne trefa." },
      { id: "diagnosis", label: "Petr má sklon k panice a neměl by investovat.", misconception: "jeden prodej je diagnóza", explanation: "Jedno rozhodnutí v simulaci nic nediagnostikuje. Je to podnět k rozboru: co ho k prodeji vedlo a jestli má pravidlo pro propad upravit." },
    ], correctOptionId: "broken", correctExplanation: "Prodej mimo pravidla je odchylka od plánu bez ohledu na výsledek. Užitečné je zjistit proč a případně IPS upravit.", incorrectExplanation: "Odděl postup od výsledku: co říkala pravidla a co Petr udělal?" },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Tvůj IPS vyvažuje podle pásma: cíl 60 % v indexu, pásmo ±10 p. b. Index rostl a jeho podíl je teď 72 %. Je prodej části indexu v souladu s plánem?", options: [
      { id: "yes-band", label: "Ano. Podíl je nad horní hranicí pásma (70 %), prodej vrací alokaci k cíli." },
      { id: "no-never", label: "Ne. Prodej je vždy porušení plánu.", misconception: "plán zakazuje každý prodej", explanation: "IPS s pásmem prodej dovoluje, když podíl překročí horní hranici. Pak jde o vyvažování podle pravidla, ne o reakci na zprávy." },
      { id: "yes-profit", label: "Ano, protože je dobré vybírat zisky, když trh roste.", misconception: "prodej podle zisku", explanation: "Důvodem prodeje je odchylka od cíle, ne zisk nebo očekávání poklesu. Při podílu 68 % by prodej v plánu nebyl, ať je zisk jakýkoli." },
    ], correctOptionId: "yes-band", correctExplanation: "60 + 10 = 70 %. Podíl 72 % je nad pásmem, takže prodej vrací alokaci k cíli podle pravidla.", incorrectExplanation: "Porovnej podíl s horní hranicí pásma: cíl plus šířka pásma." },

    { id: "revision", type: "explanation", title: "Revize IPS po nácviku", content: "Pokud držet se plánu nebylo těžké, můžeš ho jen potvrdit. Pokud tě něco lákalo plán porušit, nebo k porušení došlo, ptej se proč: je pravidlo pro propad příliš obecné? Je cílový podíl akcií vyšší, než jaký pokles opravdu uneseš? Chybí ti jasný postup pro zprávy od známých? Upravenou verzi ulož jako novou revizi. Původní verze i záznam nácviku zůstanou zachované." },
    { id: "builder", type: "interactiveFigure", figure: "ips-builder", title: "Potvrď nebo uprav svůj IPS", description: "Otevři svůj uložený plán. Když chceš, ulož změnu jako novou verzi; když ne, stačí ho zkontrolovat a pokračovat." },

    { id: "lessons", type: "checklist", title: "Co si z nácviku beru", items: [
      { id: "kept", label: "Plán zůstal dodržený a pravidlo pro propad mi pomohlo nerozhodovat podle zpráv." },
      { id: "tempted", label: "Lákalo mě plán změnit v nejhlubším propadu. Chci si pravidlo pro propad zpřesnit." },
      { id: "broke", label: "V nácviku došlo k porušení plánu. Chci si ověřit, jestli cílová alokace odpovídá poklesu, který unesu." },
      { id: "contributions", label: "Pravidelný příspěvek mi dal v propadu jasný úkol." },
      { id: "voices", label: "Na rady známých odpovím odkazem na svůj plán, ne okamžitou změnou." },
    ] },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách popiš svoje rozhodnutí v nejhlubším propadu nácviku, jestli to odpovídalo tvému IPS a co na plánu změníš (nebo proč nic).", rubric: [
      { id: "moment", text: "Pojmenuji konkrétní měsíc nebo situaci a své rozhodnutí." },
      { id: "ips", text: "Porovnám rozhodnutí s pravidlem v IPS, ne s výsledkem." },
      { id: "change", text: "Uvedu konkrétní úpravu plánu, nebo zdůvodním, proč plán ponechám." },
    ], sampleAnswer: "V šestém měsíci, kdy byl index na −30 %, jsem chtěl prodat, protože všude psali o dalším propadu. Neprodal jsem, protože IPS říká držet plán, dokud se nezmění cíl nebo potřeba peněz. Do pravidla pro propad si doplním, že každou změnu nejdřív týden odložím a sepíšu důvod." },

    { id: "summary", type: "lessonSummary", title: "Plán ověřený pod tlakem", content: "Krizový nácvik zkouší postup, ne odhad trhu. V souladu s IPS jsou prodeje jen podle pravidel vyvažování, plánované příspěvky a alokace v pásmu. Výsledná hodnota je kontext: dodržet plán a skončit hůř může být v pořádku a porušit ho a skončit lépe neznamená dobrý postup. Zkušenost z nácviku přenes do IPS jako konkrétní pravidlo. Simulace neprokazuje, jak zareaguješ se skutečnými penězi." },
    { id: "sources", type: "paragraph", content: "Modelová krize je vymyšlená řada (Simulace · Deterministická ukázková data): pokles o 30 % za šest měsíců, návrat na výchozí úroveň po dalších deseti a pomalý růst, bez dividend a měnového kurzu. Jana a Petr jsou smyšlení. Souvislost mezi kolísáním trhu a načasováním peněz investorů popisuje Morningstar, Mind the Gap. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
