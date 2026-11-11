import type { AuthoredLesson } from "../types";
import { euFundsAndEtfsLessons } from "./manifest";
const lesson = euFundsAndEtfsLessons.find((entry) => entry.id === "etfs-replication-and-indexes")!;

/** Fictional fund for the replication question: it holds part of the index. */
export const samplingFund = { held: 1_500, inIndex: 4_000 } as const;
/**
 * Look-through model inputs. Shares are rounded illustrations close to the 30. 10. 2026 factsheets
 * (the lesson shows the exact dated values separately), not live data of any fund.
 */
export const worldFund = { amount: 50_000, usaPct: 73, emergingPct: 0 } as const;
export const allWorldFund = { amount: 100_000, usaPct: 63, emergingPct: 10 } as const;
/** Kč in a region: amount × share. */
export const lookThrough = (amount: number, pct: number) => amount * pct / 100;

const kc = (amount: number) => `${amount.toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;

export const replicationAndIndexesLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "eu-funds-and-etfs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Produkty v EU a výběr ETF", position: 4, estimatedMinutes: lesson.estimatedMinutes,
  // Pins the dated index factsheet edition the prose refers to.
  factContext: { asOf: "2026-10-30" },
  sections: [{ id: "opening", label: "Tři fondy" }, { id: "replication", label: "Replikace" }, { id: "indexes", label: "Indexy" }, { id: "weights", label: "Váhy" }, { id: "look-through", label: "Pohled dovnitř" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Tomáš chce podle svého plánu investovat do akcií z celého světa. U brokera najde tři fondy na stejný index. Fond A koupí všechny akcie indexu. Fond B koupí jen jejich část. Fond C drží úplně jiné akcie a výnos indexu mu platí banka. Fondy jsou vymyšlené." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Který fond může index sledovat věrně?", options: [
      { id: "all", label: "Všechny tři. Liší se způsobem a riziky, ne tím, jestli index sledují." },
      { id: "full", label: "Jen fond A, protože drží všechny akcie.", misconception: "jen plná replikace je skutečná", explanation: "U indexu s tisíci akciemi je nákup všech drahý. Fond, který koupí dobře vybraný vzorek, může index sledovat velmi těsně." },
      { id: "not-c", label: "A a B. Fond C je sázka s pákou.", misconception: "syntetické ETF je derivát s pákou", explanation: "Fond C používá smlouvu s bankou, aby dostal výnos indexu jedna ku jedné. Páka v tom není. Přidává ale jiné riziko, které poznáš za chvíli." },
    ], correctOptionId: "all", correctExplanation: "Index může fond kopírovat třemi způsoby. Žádný není automaticky špatný. Každý má jiné náklady a rizika, a ta se vyplatí znát.", incorrectExplanation: "Zkus si představit, jak by šlo výnos indexu získat i bez nákupu všech jeho akcií." },

    { id: "replication", type: "workedExample", title: "Tři způsoby replikace (replication)", introduction: "Replikace říká, jak fond získává výnos indexu. Najdeš ji v dokumentu s klíčovými informacemi (KID) i v přehledu fondu (factsheet).", steps: [
      { label: "Plná fyzická", value: "Fond koupí všechny akcie indexu ve stejných vahách. Je to přehledné. U indexů s tisíci malými firmami ale drahé.", emphasis: true },
      { label: "Výběrová (sampling)", value: "Fond koupí reprezentativní vzorek: největší firmy a takový výběr ostatních, aby se trhy, sektory a velikosti podobaly indexu. Rozdíl vůči indexu může být malý, nebo i menší než u plné replikace, protože fond ušetří na obchodech." },
      { label: "Syntetická", value: "Fond drží jiný koš cenných papírů a se smluvní stranou (protistranou, counterparty) si vymění výnos: protistrana platí výnos indexu. Smlouvě se říká swap.", emphasis: true },
    ], conclusion: "Replikace je jedno z kritérií výběru. Rozhoduje až mezi fondy, které sledují správný index." },
    { id: "swap-risk", type: "conceptCallout", title: "Co hlídá syntetický fond", content: "Když protistrana swapu zkrachuje, fond nedostane slíbený výnos indexu. Pravidla evropských fondů UCITS omezují, kolik majetku fondu smí na jedné protistraně viset. Protistrana navíc obvykle skládá zajištění (kolaterál), které fond v nouzi prodá. Riziko tím klesá, ale nezmizí. Fyzický fond má zase vlastní riziko: může půjčovat akcie (securities lending), proto čti i tuto část KID." },

    { id: "sampling-question", type: "multipleChoiceQuestion", prompt: `Modelový příklad · Index obsahuje ${samplingFund.inIndex.toLocaleString("cs-CZ").replace(/\s/g, " ")} akcií. Fond drží jen ${samplingFund.held.toLocaleString("cs-CZ").replace(/\s/g, " ")} z nich a žádný swap nemá. Jakou replikaci používá?`, options: [
      { id: "sampling", label: "Výběrovou (sampling)." },
      { id: "synthetic", label: "Syntetickou.", misconception: "méně akcií = syntetický fond", explanation: "Syntetický fond získává výnos ze swapu. Tento fond drží akcie z indexu, jen ne všechny." },
      { id: "broken", label: "Žádnou, fond index nesleduje.", misconception: "sampling = horší výsledek", explanation: "Dobře sestavený vzorek může index sledovat těsně. Jestli se to daří, ukáže rozdíl ve výkonnosti vůči indexu (tracking difference) za několik let." },
    ], correctOptionId: "sampling", correctExplanation: "Fond kupuje akcie z indexu, ale jen vybraný vzorek. To je výběrová fyzická replikace. Jak dobře funguje, poznáš z rozdílu ve výkonnosti vůči indexu.", incorrectExplanation: "Fond drží skutečné akcie z indexu a nemá swap. Který způsob z předchozího kroku to popisuje?" },

    { id: "risk-question", type: "multipleChoiceQuestion", prompt: "Jaké dodatečné riziko nese syntetická replikace oproti fyzické?", options: [
      { id: "counterparty", label: "Riziko protistrany: banka ze swapu nemusí výnos indexu zaplatit." },
      { id: "leverage", label: "Páku: fond vydělá i ztratí víc než index.", misconception: "syntetické ETF je derivát s pákou", explanation: "Běžné syntetické ETF má výnos indexu jedna ku jedné. Páka patří k jiným produktům a ty se tak výslovně označují." },
      { id: "currency", label: "Měnové riziko, které fyzický fond nemá.", misconception: "swap přidává měnové riziko", explanation: "Měnové riziko určují firmy v indexu, ne způsob replikace. Fyzický i syntetický fond na stejný index ho mají stejné." },
    ], correctOptionId: "counterparty", correctExplanation: "Syntetický fond závisí na tom, že protistrana swapu zaplatí. Pravidla UCITS a zajištění toto riziko omezují, ale neodstraňují.", incorrectExplanation: "Mysli na smlouvu, na které syntetický fond stojí. Co když druhá strana neplní?" },

    { id: "indexes", type: "workedExample", title: "Historická data · čtyři „globální“ indexy", introduction: "Index určuje, co vlastně kupuješ. Popis vychází z factsheetů MSCI a FTSE Russell k 30. 10. 2026. Vyspělé trhy (developed markets) jsou např. USA, Japonsko nebo Německo. Rozvíjející se trhy (emerging markets) třeba Tchaj-wan, Indie nebo Česko.", steps: [
      { label: "MSCI World", value: "Velké a střední firmy z 23 vyspělých trhů. Žádné rozvíjející se trhy.", emphasis: true },
      { label: "MSCI ACWI", value: "Totéž a navíc velké a střední firmy z 24 rozvíjejících se trhů." },
      { label: "MSCI ACWI IMI", value: "Jako ACWI a navíc malé firmy (small caps). Titulů je proto několikrát víc." },
      { label: "FTSE All-World", value: "Velké a střední firmy z vyspělých i rozvíjejících se trhů. Podobné ACWI, ale jiný poskytovatel a mírně jiné zařazení zemí." },
    ], conclusion: "„World“ v názvu tedy neznamená celý svět. Rozvíjející se trhy obsahuje ACWI, ACWI IMI i FTSE All-World." },

    { id: "index-question", type: "multipleChoiceQuestion", prompt: "Tomášův plán chce i rozvíjející se trhy. Který index mu je nedá?", options: [
      { id: "world", label: "MSCI World" },
      { id: "acwi", label: "MSCI ACWI", misconception: "ACWI = jen vyspělé trhy", explanation: "ACWI (All Country World Index) přidává k vyspělým trhům i rozvíjející se trhy." },
      { id: "ftse", label: "FTSE All-World", misconception: "All-World = jen vyspělé trhy", explanation: "FTSE All-World obsahuje vyspělé i rozvíjející se trhy, podobně jako MSCI ACWI." },
    ], correctOptionId: "world", correctExplanation: "MSCI World pokrývá jen vyspělé trhy. Fond na tento index rozvíjející se trhy nemá, i když má v názvu „World“.", incorrectExplanation: "Vrať se k přehledu indexů. Který obsahuje jen vyspělé trhy?" },

    { id: "weights", type: "explanation", title: "Váha podle tržní hodnoty", content: "Tyto indexy váží firmy podle tržní hodnoty akcií, které se volně obchodují (tržní kapitalizace, market capitalisation). Čím větší firma, tím větší váha. Proto jsou v nich nejvíc americké firmy. K 30. 10. 2026 měly USA v MSCI World váhu {{trh.msci_world_usa}}, v MSCI ACWI {{trh.msci_acwi_usa}} a ve FTSE All-World {{trh.ftse_aw_usa}}. Rozvíjející se trhy tvořily v MSCI ACWI {{trh.msci_acwi_em}} a ve FTSE All-World {{trh.ftse_aw_em}}. Česko mělo ve FTSE All-World váhu {{trh.ftse_aw_cesko}}." },
    { id: "concentration", type: "conceptCallout", title: "Co to znamená pro tvůj plán", content: "Fond na „celý svět“ je zároveň z velké části sázkou na USA a na pár největších firem. Není to chyba indexu, takhle je trh rozdělený. Jen o tom máš vědět, než si k němu přikoupíš další americký fond. Váhy se mění s cenami každý měsíc. Proto u nich vždy hledej datum." },

    { id: "look-through-worked", type: "workedExample", title: "Modelový příklad · kolik je kde", introduction: `Váhy jsou zaokrouhlené a ilustrativní. Fond na MSCI World, vložíš ${kc(worldFund.amount)}.`, steps: [
      { label: "USA", value: `${kc(worldFund.amount)} × ${worldFund.usaPct} % = ${kc(lookThrough(worldFund.amount, worldFund.usaPct))}` },
      { label: "Rozvíjející se trhy", value: `${kc(worldFund.amount)} × ${worldFund.emergingPct} % = ${kc(lookThrough(worldFund.amount, worldFund.emergingPct))}`, emphasis: true },
    ], conclusion: "Váha regionu krát vložená částka dává korunovou expozici. U fondu na MSCI World je ta druhá vždy nula." },

    { id: "look-through-question", type: "multiNumericQuestion", prompt: `Modelový příklad · Fond na FTSE All-World má (zaokrouhleně) USA ${allWorldFund.usaPct} % a rozvíjející se trhy ${allWorldFund.emergingPct} %. Vložíš ${kc(allWorldFund.amount)}. Kolik korun je v USA a kolik v rozvíjejících se trzích?`, answers: [
      { id: "usa", label: "V USA", answer: lookThrough(allWorldFund.amount, allWorldFund.usaPct), tolerance: 0, unit: "Kč" },
      { id: "emerging", label: "V rozvíjejících se trzích", answer: lookThrough(allWorldFund.amount, allWorldFund.emergingPct), tolerance: 0, unit: "Kč" },
    ], correctExplanation: `${kc(allWorldFund.amount)} × ${allWorldFund.usaPct} % = ${kc(lookThrough(allWorldFund.amount, allWorldFund.usaPct))} a ${kc(allWorldFund.amount)} × ${allWorldFund.emergingPct} % = ${kc(lookThrough(allWorldFund.amount, allWorldFund.emergingPct))}. I ve fondu „na celý svět“ jsou skoro dvě třetiny peněz v USA.`, incorrectExplanation: "Vynásob vloženou částku vahou regionu a vyděl stem." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Jaký je rozdíl mezi MSCI World a MSCI ACWI?", options: [
      { id: "emerging", label: "ACWI přidává k vyspělým trhům i rozvíjející se trhy." },
      { id: "small", label: "ACWI přidává malé firmy.", misconception: "ACWI = ACWI IMI", explanation: "Malé firmy přidává až MSCI ACWI IMI. ACWI obsahuje velké a střední firmy, stejně jako World." },
      { id: "replication", label: "ACWI je syntetický, World fyzický.", misconception: "index = způsob replikace", explanation: "Replikace je vlastnost fondu, ne indexu. Na stejný index existují fyzické i syntetické fondy." },
    ], correctOptionId: "emerging", correctExplanation: "Oba indexy obsahují velké a střední firmy. ACWI k vyspělým trhům přidává rozvíjející se trhy. Malé firmy přidává až ACWI IMI.", incorrectExplanation: "Odděl tři otázky: které trhy, jak velké firmy a jak fond index kopíruje." },

    { id: "misconceptions", type: "conceptCallout", title: "Tři časté omyly", content: "„World = celý svět.“ MSCI World obsahuje jen vyspělé trhy. „Syntetické ETF je derivát s pákou.“ Běžné syntetické ETF má výnos indexu jedna ku jedné, přidává riziko protistrany. „Sampling = horší výsledek.“ Jak těsně fond index sleduje, ukáže rozdíl ve výkonnosti vůči indexu za několik let, ne způsob replikace." },
    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách popiš, jaký index odpovídá záměru tvého plánu a proč. Zmiň, co zkontroluješ o replikaci fondu.", rubric: [
      { id: "intent", text: "Záměr: vybírám index podle trhů z plánu, ne podle názvu fondu." },
      { id: "coverage", text: "Pokrytí: vím, jestli index obsahuje rozvíjející se trhy a malé firmy." },
      { id: "weights", text: "Váhy: počítám s velkou váhou USA v indexech vážených tržní hodnotou." },
      { id: "replication", text: "Replikace: vím, kde ji v KID najdu a jaké riziko který způsob přidává." },
    ], sampleAnswer: "Chci akcie celého světa včetně rozvíjejících se trhů, proto hledám fond na MSCI ACWI nebo FTSE All-World, ne na MSCI World. Počítám s tím, že přes 60 % bude v USA. V KID ověřím replikaci: u syntetického fondu protistranu a zajištění, u fyzického půjčování akcií." },

    { id: "lab-bridge", type: "labBridge", title: "Země uvnitř ETF v Labu", content: "V detailu ETF v Labu najdeš u fondů s dostupnými daty rozložení podle zemí a největší pozice s datem zdroje. Porovnej váhu USA s factsheety z lekce. Kde data chybí, znamená to „nevím“, ne nulu. Replikaci a index ověř v KID fondu." },
    { id: "summary", type: "lessonSummary", title: "Nejdřív index, pak replikace", content: "Fond kopíruje index plně fyzicky, výběrem vzorku, nebo synteticky přes swap. Žádný způsob není automaticky špatný; syntetický přidává riziko protistrany, které UCITS a zajištění omezují. MSCI World obsahuje jen vyspělé trhy, ACWI a FTSE All-World i rozvíjející se, ACWI IMI navíc malé firmy. Váhy podle tržní hodnoty znamenají velký podíl USA. Proto u vah vždy hledej datum." },
    { id: "sources", type: "paragraph", content: "Zdroje · MSCI, factsheety indexů World, ACWI a Emerging Markets k 30. 10. 2026: https://www.msci.com/indexes · FTSE Russell, factsheet FTSE All-World k 30. 10. 2026: https://www.lseg.com/en/ftse-russell/indices/ftse-global-equity · justETF Academy, metody replikace: https://www.justetf.com/en/academy/die-richtige-etf-auswahl.html · Fondy a částky v příkladech jsou vymyšlené. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
