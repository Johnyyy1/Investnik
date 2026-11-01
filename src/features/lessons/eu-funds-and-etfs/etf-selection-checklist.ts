import type { AuthoredLesson } from "../types";
import { euFundsAndEtfsLessons } from "./manifest";
const lesson = euFundsAndEtfsLessons.find((entry) => entry.id === "etfs-selection-checklist")!;

/**
 * Three fictional ETFs from one factsheet comparison. No fund, index or provider exists under these names.
 * TER and tracking difference in basis points per year (tracking difference = fund return minus index return,
 * 5-year average 2021–2025; `null` = not available because the fund is younger). AUM in millions of EUR.
 */
export const etfChecklistFunds = [
  { id: "a", name: "A · Svět", index: "Svět 1 · celý svět", terBps: 22, trackingDifferenceBps: -18, aumEurMillions: 15_000, founded: 2019, replication: "fyzická, výběrem vzorku", domicile: "Irsko", ucits: true, distribution: "akumulační", currency: "USD" },
  { id: "b", name: "B · Svět", index: "Svět 2 · celý svět", terBps: 20, trackingDifferenceBps: -15, aumEurMillions: 3_000, founded: 2011, replication: "fyzická, výběrem vzorku", domicile: "Irsko", ucits: true, distribution: "akumulační", currency: "USD" },
  { id: "c", name: "C · Global Tech", index: "Tech Leaders 50", terBps: 49, trackingDifferenceBps: null, aumEurMillions: 80, founded: 2023, replication: "fyzická, úplná", domicile: "Lucembursko", ucits: true, distribution: "distribuční", currency: "USD" },
] as const;
/** Amount for the TER comparison, in Kč. */
export const terComparisonAmount = 100_000;

type Fund = (typeof etfChecklistFunds)[number];
const [fundA, fundB, fundC] = etfChecklistFunds;
const pct = (bps: number) => `${(bps / 100).toFixed(2).replace(".", ",")} %`;
const pp = (bps: number) => `${bps < 0 ? "−" : "+"}${(Math.abs(bps) / 100).toFixed(2).replace(".", ",")} p. b.`;
const aum = (millions: number) => millions >= 1_000 ? `${(millions / 1_000).toLocaleString("cs-CZ")} mld. EUR` : `${millions} mil. EUR`;
const kc = (amount: number) => `${amount.toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;
const td = (fund: Fund) => fund.trackingDifferenceBps === null ? "nedostupné, fond je mladší než 5 let" : `${pp(fund.trackingDifferenceBps)} ročně`;
/** Annual TER cost of the amount, in Kč: amount × TER. */
export const terCost = (fund: Fund) => terComparisonAmount * fund.terBps / 10_000;

export const etfSelectionChecklistLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "eu-funds-and-etfs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Produkty v EU a výběr ETF", position: 6, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Tři fondy" }, { id: "criteria", label: "Osm kritérií" }, { id: "overview", label: "Přehled" }, { id: "worked", label: "Checklist fondu A" }, { id: "compare", label: "A, nebo B" }, { id: "traps", label: "Pasti" }, { id: "checklist", label: "Tvůj checklist" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Petra má v investičním plánu (IPS) jasný cíl: pravidelně investovat do akcií celého světa. U brokera hledá ETF a najde tři fondy, které mají v názvu „Svět“ nebo „Global“. Na první pohled vypadají podobně. Fondy, indexy i čísla v lekci jsou vymyšlené; žádný z nich neexistuje." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Co by měla Petra rozhodnout jako první?", options: [
      { id: "market", label: "Jaký trh, tedy jaký index, chce fondem pokrýt." },
      { id: "ter", label: "Který fond má nejnižší nákladovost (TER).", misconception: "nejnižší TER vyhrává", explanation: "Náklady jsou důležité, ale porovnávají se až mezi fondy na stejný nebo podobný trh. Nejlevnější fond na jiný trh Petřin plán nesplní." },
      { id: "size", label: "Který fond je největší.", misconception: "největší = nejlepší", explanation: "Velikost fondu pomáhá rozlišit podobné fondy. O tom, jestli fond vůbec odpovídá plánu, ale nerozhoduje." },
    ], correctOptionId: "market", correctExplanation: "Nejdřív trh: plán říká „akcie celého světa“, takže fond musí sledovat index celého světa. Teprve mezi takovými fondy má smysl porovnávat náklady, velikost a další údaje.", incorrectExplanation: "Hledej rozhodnutí, bez kterého ostatní srovnání nedává smysl." },

    { id: "criteria", type: "workedExample", title: "Osm kritérií v pořadí, v jakém se rozhoduje", introduction: "Pořadí šetří čas: fond, který neprojde prvními kroky, dál nezkoumáš.", steps: [
      { label: "1 · Trh a index", value: "Pokrývá fond trh z mého plánu? Čti název indexu a jeho pravidla, ne jen název fondu.", emphasis: true },
      { label: "2 · UCITS a domicil", value: "Je fond evropský UCITS a kde sídlí (domicil)? Má dokument s klíčovými informacemi (KID) v češtině?", emphasis: true },
      { label: "3 · Akumulace, nebo distribuce", value: "Odpovídá třída fondu tomu, co chci s dividendami dělat?" },
      { label: "4 · Náklady", value: "Nákladovost (TER) a rozdíl ve výkonnosti vůči indexu (tracking difference) za více let.", emphasis: true },
      { label: "5 · Velikost a stáří", value: "Majetek fondu (AUM) a rok založení. Velmi malý nebo mladý fond má kratší historii a vyšší riziko zrušení." },
      { label: "6 · Replikace", value: "Fyzická (nakupuje akcie z indexu, celé nebo výběrem vzorku), nebo syntetická přes swap?" },
      { label: "7 · Měna a zajištění", value: "V jaké měně je fond veden a je měnově zajištěný? Měnové riziko určují hlavně firmy uvnitř fondu." },
      { label: "8 · Dostupnost u brokera a spread", value: "Nabízí ho můj broker, na jaké burze a jaký je rozdíl mezi nákupní a prodejní cenou (spread)?" },
    ], conclusion: "Kroky 1, 2 a 4 rozhodují, jestli fond vůbec zvažuješ. Ostatní pomáhají vybrat mezi fondy, které prošly." },

    { id: "categorize", type: "categorizeQuestion", prompt: "Zařaď kritéria: které rozhodují, jestli fond vůbec zvažuješ, a které rozlišují mezi fondy, jež prošly?", categories: [{ id: "core", label: "Zásadní: fond vůbec zvažuji?" }, { id: "secondary", label: "Rozlišuje mezi podobnými fondy" }], items: [
      { id: "index", label: "Trh a index", categoryId: "core" },
      { id: "ucits", label: "UCITS a domicil", categoryId: "core" },
      { id: "costs", label: "Náklady: TER a tracking difference", categoryId: "core" },
      { id: "size", label: "Velikost a stáří fondu", categoryId: "secondary" },
      { id: "replication", label: "Fyzická, nebo syntetická replikace", categoryId: "secondary" },
      { id: "broker", label: "Dostupnost u brokera a spread", categoryId: "secondary" },
    ], correctExplanation: "Trh, UCITS a domicil a náklady určují, jestli fond do plánu patří a kolik tě bude stát dlouhodobě. Velikost, replikace a dostupnost u brokera rozhodují mezi fondy, které tímhle sítem prošly.", incorrectExplanation: "Zásadní je to, co může fond vyřadit, i kdyby byl ve všem ostatním výborný: jiný trh, chybějící UCITS nebo vysoké náklady." },

    { id: "overview-intro", type: "paragraph", content: "Modelový příklad · Petra si z přehledů fondů (factsheetů) vypsala hlavní údaje. Indexy Svět 1 a Svět 2 zahrnují velké a střední firmy z vyspělých i rozvíjejících se trhů. Index Tech Leaders 50 obsahuje 50 největších technologických firem." },
    { id: "overview", type: "documentTap", prompt: "Petřin plán chce akcie celého světa. Označ fond, který vyřadí jako první.", document: { eyebrow: "Modelový příklad · fiktivní fondy", title: "Tři ETF „Svět“ u Petřina brokera", meta: "Všechny tři UCITS, v USD, bez měnového zajištění · A a B sídlí v Irsku, C v Lucembursku", columns: [
      { id: "fund", label: "Fond", mobile: "title" },
      { id: "index", label: "Index", mobile: "subtitle" },
      { id: "ter", label: "TER", align: "end", mobile: "value", mobileLabel: "TER" },
      { id: "size", label: "AUM · založen", align: "end", mobile: "detail" },
    ], rows: etfChecklistFunds.map((fund) => ({
      id: fund.id,
      cells: { fund: fund.name, index: fund.index, ter: pct(fund.terBps), size: `${aum(fund.aumEurMillions)} · ${fund.founded}` },
      note: fund.id === "c"
        ? `Tematický index, ne celý svět. Fond je navíc dražší, malý a mladý; tracking difference: ${td(fund)}.`
        : `Celý svět, takže postupuje dál. Tracking difference ${td(fund)}.`,
    })) }, correctRowIds: ["c"],
      correctExplanation: `Fond C sleduje tematický index technologických firem, ne celý svět. Neprojde už prvním krokem. Další varovné signály jen potvrzují: TER ${pct(fundC.terBps)}, majetek ${aum(fundC.aumEurMillions)} a založení v roce ${fundC.founded}. Slovo „Global“ v názvu nestačí.`,
      incorrectExplanation: "Začni prvním kritériem: který index pokrývá celý svět a který jen část trhu?" },

    { id: "worked", type: "workedExample", title: "Modelový příklad · checklist pro Fond A", introduction: "U každého kritéria stačí ano / ne / nevím. „Nevím“ není chyba, je to úkol k ověření.", steps: [
      { label: "1 · Trh a index", value: "Ano: celý svět, vyspělé i rozvíjející se trhy." },
      { label: "2 · UCITS a domicil", value: `Ano: ${fundA.ucits ? "UCITS" : "není UCITS"}, domicil ${fundA.domicile}. KID v češtině ověřit u brokera.` },
      { label: "3 · Akumulace, nebo distribuce", value: `Ano: ${fundA.distribution}, Petra dividendy nepotřebuje vyplácet.` },
      { label: "4 · Náklady", value: `Ano: TER ${pct(fundA.terBps)}, tracking difference ${td(fundA)}.` },
      { label: "5 · Velikost a stáří", value: `Ano: ${aum(fundA.aumEurMillions)}, založen ${fundA.founded}.` },
      { label: "6 · Replikace", value: `Ano: ${fundA.replication}.` },
      { label: "7 · Měna a zajištění", value: `Ano: měna fondu ${fundA.currency}, bez zajištění; měnové riziko je dané firmami po celém světě.` },
      { label: "8 · Dostupnost u brokera a spread", value: "Nevím: zjistit u brokera burzu, měnu obchodování a spread.", emphasis: true },
    ], conclusion: "Fond A plánu odpovídá. Jediné „nevím“ patří k brokerovi, ne k fondu. Stejný postup teď použiješ na fond B." },

    { id: "faded", type: "fadedExample", title: "Modelový příklad · A, nebo B?", introduction: `Oba fondy prošly zásadními kritérii. Petra porovnává rozdíly. Náklady počítá na ${kc(terComparisonAmount)} ve fondu za rok.`, steps: [
      { label: "Index", value: "A: Index Svět 1 · B: Index Svět 2, oba celý svět" },
      { label: "Velikost a stáří", value: `A: ${aum(fundA.aumEurMillions)}, od ${fundA.founded} · B: ${aum(fundB.aumEurMillions)}, od ${fundB.founded}` },
      { label: "Tracking difference", value: `A: ${pp(fundA.trackingDifferenceBps)} · B: ${pp(fundB.trackingDifferenceBps)} ročně` },
      { label: "TER", value: `A: ${pct(fundA.terBps)} = ${kc(terCost(fundA))} · B: ${pct(fundB.terBps)} = ${kc(terCost(fundB))} ročně` },
    ], blank: { label: "O kolik je B na TER levnější za rok?", input: "number", answer: terCost(fundA) - terCost(fundB), tolerance: 0, unit: "Kč" },
      misconception: "Rozdíl TER je 0,02 procentního bodu z celé částky ve fondu, ne 2 %.",
      correctExplanation: `${kc(terCost(fundA))} − ${kc(terCost(fundB))} = ${kc(terCost(fundA) - terCost(fundB))} ročně. Rozdíl ${pct(fundA.terBps - fundB.terBps)} je na této částce menší než jeden poplatek za nákup nebo spread u nevhodného brokera.`,
      incorrectExplanation: `Spočítej náklad každého fondu: ${kc(terComparisonAmount)} × TER. Pak je odečti.` },

    { id: "decision", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Co by mělo rozhodnout mezi fondy A a B?", options: [
      { id: "broker", label: "Dostupnost u Petřina brokera, spread a případně to, který index jí víc vyhovuje." },
      { id: "ter", label: "Fond B, protože má nižší TER.", misconception: "nejnižší TER vyhrává automaticky", explanation: "Rozdíl dělá 20 Kč ročně na 100 000 Kč. Vyšší spread nebo nákup na méně vhodné burze ho snadno převáží. TER je zásadní kritérium, ale malý rozdíl sám nerozhoduje." },
      { id: "size", label: "Fond A, protože je pětkrát větší.", misconception: "větší je vždy lepší", explanation: `Oba fondy jsou velké a mají historii. Velikost varuje u malých fondů (jako C s ${aum(fundC.aumEurMillions)}); mezi ${aum(fundB.aumEurMillions)} a ${aum(fundA.aumEurMillions)} už o kvalitě nerozhoduje.` },
    ], correctOptionId: "broker", correctExplanation: "A i B plánu odpovídají a jejich náklady se liší jen nepatrně. Rozhodnou praktické věci: který fond broker nabízí, za jaký spread a v jaké měně. Rozumná volba může být kterýkoli z nich; žádný není „nejlepší ETF“.", incorrectExplanation: "Zvaž, jestli jediný rozdíl opravdu převáží všechny ostatní, když jsou si fondy tak blízko." },

    { id: "traps", type: "conceptCallout", title: "Tři časté omyly", content: "„Nejnižší TER vyhrává automaticky.“ Rozhoduje celkový náklad: tracking difference, spread a poplatky brokera, a hlavně správný index. „Podobný název = stejný index.“ Slova Svět, Global nebo World v názvu fondu nic nezaručují; čti název a pravidla indexu. „Víc ETF = lepší diverzifikace.“ Dva fondy na celý svět vlastní z velké části stejné firmy; více fondů může diverzifikaci jen zkomplikovat, ne zlepšit." },
    { id: "trap-esg", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Broker nabízí fond „Svět ESG Screened“ s nižším TER než fondy A a B. Co zkontroluješ jako první?", options: [
      { id: "index-rules", label: "Index a jeho pravidla: které firmy vylučuje a jaký trh nakonec pokrývá." },
      { id: "cheaper", label: "Nic, nižší TER rozhoduje.", misconception: "nejnižší TER vyhrává automaticky", explanation: "Fond s vyloučenými firmami sleduje jiný index než A a B. Nejdřív musíš vědět, co přesně kupuješ; náklady porovnáš až potom." },
      { id: "name", label: "Stačí, že má v názvu „Svět“, takže je to totéž co A a B.", misconception: "podobný název = stejný index", explanation: "„Screened“ znamená, že index některé firmy nebo odvětví vylučuje podle pravidel. Pokrytí, váhy i výsledky se proto můžou od indexu celého světa lišit." },
    ], correctOptionId: "index-rules", correctExplanation: "Fond s vylučovacím filtrem sleduje vlastní index. Přečti jeho pravidla v KID nebo v popisu indexu: co vylučuje, kolik firem zbývá a jak se tím mění rozložení. Teprve když odpovídá plánu, porovnáš náklady.", incorrectExplanation: "Vrať se k prvnímu kritériu. Co se mění, když index některé firmy vylučuje?" },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Proč při výběru ETF nestačí porovnat TER?", options: [
      { id: "index-and-total", label: "Fond s nejnižším TER může sledovat jiný trh a celkový náklad tvoří i tracking difference a spread." },
      { id: "irrelevant", label: "TER je nepodstatné, rozhoduje jen velikost fondu.", misconception: "náklady nehrají roli", explanation: "Náklady patří mezi zásadní kritéria: platíš je každý rok z celé částky. Jen nestačí samotné." },
      { id: "tracking", label: "TER se nedá ověřit, proto se dívám jen na výnos fondu za poslední rok.", misconception: "výnos za rok místo nákladů", explanation: "TER najdeš v KID i v přehledu fondu. Výnos za jeden rok hlavně odráží, jak se dařilo trhu, ne kvalitu fondu." },
    ], correctOptionId: "index-and-total", correctExplanation: "TER je jen část nákladů a nic neříká o tom, jaký trh fond pokrývá. Proto nejdřív index a UCITS, potom TER spolu s tracking difference a nakonec dostupnost a spread u brokera.", incorrectExplanation: "Vzpomeň si na fond C a na fond „ESG Screened“. Co by ti samotné TER u nich neprozradilo?" },

    { id: "checklist-intro", type: "explanation", title: "Ulož si checklist", content: "Checklist použiješ u každého fondu, který budeš zvažovat, i při sepisování nebo revizi investičního plánu. Zaškrtni body, které chceš u výběru ETF opravdu ověřovat, a ulož ho. V Nastavení → Moje data si ho můžeš stáhnout spolu s ostatními daty." },
    { id: "checklist", type: "checklist", title: "Můj checklist výběru ETF", items: [
      { id: "index", label: "Index pokrývá trh z mého plánu; znám jeho název a pravidla." },
      { id: "ucits", label: "Fond je UCITS, znám domicil a mám KID v češtině." },
      { id: "distribution", label: "Akumulační, nebo distribuční třída odpovídá mému plánu." },
      { id: "costs", label: "Porovnávám TER i tracking difference za více let." },
      { id: "size", label: "Fond není velmi malý ani úplně nový." },
      { id: "replication", label: "Vím, jestli replikace je fyzická, nebo syntetická." },
      { id: "currency", label: "Znám měnu fondu a jestli je měnově zajištěný." },
      { id: "broker", label: "U svého brokera ověřuji dostupnost fondu, burzu a spread." },
    ] },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách zdůvodni, který z fondů A a B je pro tebe vhodnější a proč, nebo co ještě potřebuješ zjistit. Pak text porovnej s kritérii.", rubric: [
      { id: "plan", text: "Plán: fond vybírám podle trhu z IPS, ne podle názvu." },
      { id: "core", text: "Zásadní kritéria: zmiňuji index, UCITS a náklady včetně tracking difference." },
      { id: "practical", text: "Praktické rozhodnutí: uvádím dostupnost u brokera a spread, nebo co ověřím." },
      { id: "no-best", text: "Bez „nejlepšího ETF“: připouštím, že rozumné jsou oba fondy." },
    ], sampleAnswer: "Oba fondy pokrývají celý svět, jsou UCITS a jejich náklady se liší jen o 20 Kč ročně na 100 000 Kč. Rozhodne, který z nich můj broker nabízí na burze v eurech s menším spreadem. Když nabízí oba, zvolím větší fond A, ale B je stejně rozumná volba." },

    { id: "lab-bridge", type: "labBridge", title: "Checklist u skutečného ETF v Labu", content: "V detailu ETF v Labu najdeš u fondů se dostupnými daty nákladovost (TER), velikost (AUM), rok založení a složení portfolia s datem zdroje. Projdi podle nich body 1, 4 a 5 svého checklistu. Domicil, UCITS, třídu a měnové zajištění ověř v KID a přehledu fondu, spread u svého brokera. Chybějící údaj znamená „nevím“, ne „v pořádku“." },
    { id: "summary", type: "lessonSummary", title: "Nejdřív trh, pak náklady, nakonec broker", content: "Výběr ETF má pořadí: trh a index, UCITS a domicil, akumulace nebo distribuce, náklady (TER a tracking difference), velikost a stáří, replikace, měna a zajištění, dostupnost u brokera a spread. Zásadní jsou trh, UCITS a náklady. Podobný název neznamená stejný index a nejnižší TER nevyhrává automaticky. Mezi dvěma fondy, které projdou, často rozhodne broker; „nejlepší ETF“ neexistuje." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · justETF Academy, Jak vybrat správné ETF: https://www.justetf.com/en/academy/die-richtige-etf-auswahl.html · Bogleheads wiki, investování pro evropské investory: https://www.bogleheads.org/wiki/Main_Page · Fondy, indexy a čísla v příkladech jsou vymyšlené. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
