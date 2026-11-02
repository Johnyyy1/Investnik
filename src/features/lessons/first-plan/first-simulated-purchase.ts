import type { AuthoredLesson } from "../types";
import { firstPlanLessons } from "./manifest";

const lesson = firstPlanLessons.find((entry) => entry.id === "first-plan-first-purchase")!;

export const firstSimulatedPurchaseLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "first-plan", slug: lesson.slug, title: lesson.title,
  eyebrow: "První plán a první nákup", position: 3, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Příprava" }, { id: "identity", label: "Instrument" }, { id: "worked", label: "Náklady" }, { id: "orders", label: "Pokyn" }, { id: "mission", label: "Mise" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Jana má v investičním plánu na tento nákup 2 500 Kč a akumulační třídu ETF Fond Svět. Ve vyhledávání vidí dva téměř stejné názvy. Jedním kliknutím může koupit jinou třídu, než chtěla. Burzovně obchodovaný fond (ETF) si proto nejdřív ověří, až pak řeší cenu." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Co Janě před potvrzením nejvíc pomůže ověřit, že kupuje správný instrument?", options: [
      { id: "name", label: "Název fondu je podobný tomu v plánu.", misconception: "název stačí", explanation: "Pod podobným názvem najdeš různé třídy i kotace. Název sám neověří distribuci, měnu ani burzu." },
      { id: "check", label: "Porovnat identifikátor, třídu, měnu a burzu s plánem a dokumenty fondu." },
      { id: "price", label: "Vybrat levnější kus ze dvou výsledků.", misconception: "levnější kus = správný fond", explanation: "Cena jednoho kusu neříká, zda jde o stejnou třídu fondu. Nejdřív ověř identitu." },
    ], correctOptionId: "check", correctExplanation: "Identita a podmínky mají přednost před cenou kusu. Stejný fond může mít různé třídy i kotace.", incorrectExplanation: "Hledej údaje, které odliší třídu a místo obchodování, nejen podobný název." },

    { id: "prepare", type: "explanation", artifactEvidence: "etf_checklist", title: "Od plánu ke kontrolnímu seznamu", content: "Z investičního plánu (investment policy statement, IPS) si vezmi nástroj a rozpočet. Z checklistu výběru ETF ověř název, typ ETF, identifikační kód cenného papíru (ISIN), akumulační či distribuční třídu, měnu kotace a burzu. U brokera je hledej v detailu instrumentu a porovnej s dokumenty emitenta. Ticker je burzovní zkratka; sám nestačí. Měna kotace také neříká, jakým měnám je fond ekonomicky vystaven." },
    { id: "identity", type: "documentSearchQuestion", prompt: "Modelový příklad · Jana chce Fond Svět, akumulační třídu, ISIN XX0000000001, kotaci v EUR na Burze A. Který výsledek odpovídá všem údajům?", document: { title: "Fiktivní výsledky vyhledávání", regions: [
      { id: "a", label: "Výsledek A", content: "Fond Svět · ETF · XX0000000002 · distribuční · EUR · Burza A" },
      { id: "b", label: "Výsledek B", content: "Fond Svět · ETF · XX0000000001 · akumulační · EUR · Burza A" },
      { id: "c", label: "Výsledek C", content: "Fond Svět · ETF · XX0000000001 · akumulační · USD · Burza B" },
    ] }, target: { type: "region", regionId: "b" }, correctExplanation: "Jen B odpovídá celé zamýšlené kotaci. C může být stejná třída, ale má jinou měnu a burzu; A je jiná třída. ISIN je zde smyšlený.", incorrectExplanation: "Porovnej všech pět údajů. Samotná shoda názvu nebo ISINu ještě nepotvrzuje zamýšlenou kotaci." },

    { id: "worked", type: "workedExample", title: "Modelový příklad · celý rozpočet, ne jen cena", introduction: "Fiktivní nákup: rozpočet 2 500 Kč včetně nákladů, cena 100 EUR za kus, referenční kurz 25 Kč/EUR, poplatek 25 Kč, přirážka konverze 0,5 %. Cenu držíme pevnou; bid/ask spread a skluz v tomto výpočtu vynecháváme.", steps: [
      { label: "Jeden kus bez nákladů", value: "100 × 25 = 2 500 Kč" },
      { label: "Jeden kus včetně nákladů", value: "2 500 + 25 + 12,50 = 2 537,50 Kč — přes rozpočet" },
      { label: "Upravené množství", value: "0,98 kusu × 100 × 25 = 2 450 Kč bez nákladů" },
      { label: "Konverze a poplatek", value: "2 450 × 0,5 % = 12,25 Kč; poplatek 25 Kč" },
      { label: "Celkem z hotovosti", value: "2 450 + 12,25 + 25 = 2 487,25 Kč" },
    ], conclusion: "Frakce je zlomek kusu, zde 0,98. Do rozpočtu patří i náklady. V přehledu pokynu vždy zkontroluj množství, cenu, kurz, poplatek a celkový úbytek hotovosti. Před potvrzením můžeš množství opravit." },
    { id: "faded", type: "fadedExample", title: "Modelový příklad · doplň přehled nákupu", introduction: "Stejný fiktivní ceník, ale 0,96 kusu. Doplň celkový úbytek hotovosti v Kč, včetně obou nákladů.", steps: [
      { label: "Hodnota bez nákladů", value: "0,96 × 100 EUR × 25 Kč/EUR = 2 400 Kč" },
      { label: "Přirážka konverze", value: "0,5 % z 2 400 Kč = 12 Kč" },
      { label: "Poplatek", value: "25 Kč" },
    ], blank: { label: "Celkem zaplatíš", input: "number", answer: 2437, tolerance: 0.0049, unit: "Kč" }, correctExplanation: "2 400 + 12 + 25 = 2 437 Kč. V rozpočtu 2 500 Kč zbude 63 Kč; samotná hodnota instrumentu není celá cena nákupu.", incorrectExplanation: "Sečti hodnotu instrumentu, přirážku konverze i poplatek. Žádný z těchto nákladů není v tomto příkladu započtený dvakrát." },

    { id: "orders", type: "explanation", title: "Tržní, nebo limitní pokyn?", content: "Tržní pokyn (market order) upřednostní rychlé provedení za dostupnou cenu, ale nezaručuje cenu z obrazovky. Nákupní limitní pokyn (limit order) určí nejvyšší cenu za kus; může se provést za limit nebo levněji, ale také se nemusí provést vůbec. Limit může omezit cenu zejména u méně likvidního instrumentu. Mimo hlavní hodiny bývá likvidita slabší; vyčkat na hlavní obchodování je také možnost. Limit za kus není celkový rozpočet v Kč včetně nákladů." },
    { id: "order-type", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Kupuješ méně likvidní ETF hodinu po otevření trhu. Za kus nechceš zaplatit víc než 101 EUR (při modelovém kurzu 25 Kč/EUR je to 2 525 Kč před náklady). Jaký pokyn vyjadřuje tento cenový strop?", options: [
      { id: "market", label: "Tržní, protože zobrazená cena platí i při provedení.", misconception: "kotace je záruka", explanation: "Tržní pokyn nemá cenový strop. Zobrazená cena se před provedením může změnit." },
      { id: "limit", label: "Nákupní limitní pokyn na 101 EUR; počítám i s možností neprovedení." },
      { id: "high", label: "Nákupní limitní pokyn na 150 EUR, aby se určitě provedl.", misconception: "vysoký limit chrání cenu", explanation: "Limit 150 EUR dovoluje zaplatit víc než požadovaných 101 EUR. Neznamená, že zaplatíš přesně 150 EUR, ale tvůj strop nechrání." },
    ], correctOptionId: "limit", correctExplanation: "Limit 101 EUR chrání nejvyšší cenu za kus. Nezaručuje provedení a neomezuje poplatky ani měnovou konverzi. Počkat je také v pořádku.", incorrectExplanation: "Potřebuješ omezit cenu za kus, nikoli zaručit provedení." },

    { id: "error-class-context", type: "paragraph", content: "Modelový příklad · Plán: koupit akumulační ETF Fond Svět, ISIN XX0000000001, EUR, Burza A, do 2 500 Kč včetně nákladů. Připravený pokyn: KOUPIT, Fond Svět distribuční, ISIN XX0000000002, EUR, Burza A, celkem 2 487,25 Kč." },
    { id: "error-class", type: "multipleChoiceQuestion", prompt: "Co je v prvním pokynu chybně?", options: [
      { id: "class", label: "Distribuční třída a její ISIN neodpovídají akumulační třídě v plánu." },
      { id: "currency", label: "Je chybně měna EUR.", explanation: "EUR odpovídá plánu. Porovnej třídu a identifikační kód." },
      { id: "none", label: "Nic, název Fond Svět i rozpočet sedí.", explanation: "Podobný název a správná částka neopraví záměnu třídy." },
    ], correctOptionId: "class", correctExplanation: "Před odesláním oprav instrument. Akumulační třída výnosy reinvestuje, distribuční je vyplácí. Záměna mění to, co držíš, i když jméno fondu vypadá stejně.", incorrectExplanation: "Ověř identitu proti plánu, ne jen jméno a celkovou částku." },
    { id: "error-amount-context", type: "paragraph", content: "Modelový příklad · Plán má rozpočet 2 500 Kč včetně nákladů. Druhý pokyn má správné ETF, třídu, měnu i burzu a směr KOUPIT, ale řádek „Celkem zaplatíš“ ukazuje 25 000 Kč." },
    { id: "error-amount", type: "multipleChoiceQuestion", prompt: "Jak Janě pomůže kontrola druhého pokynu?", options: [
      { id: "confirm", label: "Potvrdí ho, pokud má na účtu 25 000 Kč.", explanation: "Dostupná hotovost není souhlas utratit desetkrát víc, než říká plán." },
      { id: "correct", label: "Vrátí se k množství a opraví celkovou částku podle rozpočtu 2 500 Kč." },
      { id: "fx", label: "Rozdíl je běžný důsledek konverze, nemusí nic měnit.", explanation: "Desetinásobná částka není v tomto modelu náklad konverze. Jde o chybu velikosti pokynu." },
    ], correctOptionId: "correct", correctExplanation: "25 000 ÷ 2 500 = 10. Pokyn je desetkrát větší než plán. Oprav množství a znovu zkontroluj celkový úbytek hotovosti.", incorrectExplanation: "Porovnej celkovou částku s plánem. To, že má Jana dost peněz, neznamená, že je má všechny utratit." },
    { id: "error-side-context", type: "paragraph", content: "Modelový příklad · Třetí pokyn má správnou identitu i množství, ale v záhlaví je PRODAT. Jana podle plánu chtěla svůj první nákup. Předpokládej, že ostatní pole odpovídají plánu." },
    { id: "error-side", type: "multipleChoiceQuestion", prompt: "Který údaj musí Jana před odesláním opravit?", options: [
      { id: "name", label: "Zkrátit název fondu.", explanation: "Název zde sedí; důležitý je směr obchodu v záhlaví." },
      { id: "wait", label: "Nic. Server pozná, že jde o první nákup.", explanation: "Server ověřuje pravidla obchodu, ale nemůže za Janu rozhodnout, jaký směr zamýšlela." },
      { id: "side", label: "Směr pokynu: z PRODAT na KOUPIT, pak projít přehled znovu." },
    ], correctOptionId: "side", correctExplanation: "Směr kontroluj stejně pečlivě jako identitu a částku. Pokud nic nevlastní, Lab prodej odmítne; bezpečnostní pravidlo ale nenahrazuje kontrolu záměru.", incorrectExplanation: "Porovnej sloveso v plánu se směrem připraveného pokynu." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Bez nápovědy: co zkontroluješ těsně před odesláním nákupu?", options: [
      { id: "full", label: "Identitu a třídu, měnu a burzu, směr, množství, typ a limit pokynu, cenu, kurz, náklady a celkovou částku proti plánu." },
      { id: "return", label: "Hlavně poslední výnos a zda mám dost hotovosti.", explanation: "Minulý výnos neověří identitu ani náklady. Hotovost je jen jedna podmínka." },
      { id: "name", label: "Stačí název fondu, broker ohlídá zbytek mého plánu.", explanation: "Broker nezná tvůj záměr. Podobný název může skrývat jinou třídu a technicky platný pokyn může porušit tvůj rozpočet." },
    ], correctOptionId: "full", correctExplanation: "Kontrola záměru, identity i celkových nákladů zachytí různé chyby. U limitu navíc počítej s neprovedením, u tržního pokynu se změnou ceny.", incorrectExplanation: "Vybav si chyby třídy, částky a směru i cenový strop. Která odpověď je pokrývá?" },

    { id: "lab-limits", type: "conceptCallout", title: "Simulace · co dnes umí Portfolio Lab", content: "Tato mise používá tvoje osobní cvičné portfolio a jeho existující hotovost. Lab přijímá množství včetně frakcí, cenu, kurz a náklady určuje server. Limitní pokyny, bid/ask spread a skluz zatím nemodeluje. Detail ukazuje název, typ, měnu a burzu; ISIN a distribuční třídu si u skutečného brokera ověř v dokumentech emitenta, v Labu je nevymýšlej. Přehled obsahuje poplatek a přirážku konverze. Cenu server při potvrzení ověří znovu. Deterministická ukázková data nejsou živé kotace. Pro nácvik v nich najdeš smyšlené Modelové ETF Nácvik (CVETF); nejde o skutečný fond a do plánu pro skutečné peníze nepatří." },
    { id: "mission", type: "labMission", missionId: "ips-etf-purchase-v2", mission: {
      title: "První nákup nanečisto", goal: "Ověř cvičný nákup ETF podle svého IPS a rozpočtu.", minutes: 5, target: "/lab/portfolio",
      steps: [
        "V Otevřít IPS ulož úplný plán s konkrétními instrumenty a kladným příspěvkem. Výběr je tvůj; lekce žádný fond nedoporučuje.",
        "Rozpočet pro jedno ETF = měsíční příspěvek × jeho cílová váha. Například 2 500 Kč × 80 % = 2 000 Kč včetně nákladů. Hotovostní část plánu nech stranou.",
        "V Labu vyhledej zvolené ETF, otevři detail a zkontroluj dostupnou identitu. Zvol množství, v přehledu porovnej cenu, kurz, poplatek, konverzi a celkem s rozpočtem. Množství můžeš upravit.",
        "Potvrď až po kontrole a jen z dostupné hotovosti. Server pro misi přijme celkový úbytek v rozmezí ±1 % plánované částky. U modelových 2 000 Kč je to 1 980–2 020 Kč; jde o toleranci cvičení, ne investiční pravidlo.",
        "Vrať se a zvol Ověřit misi. Pokud už odpovídající nákup po uložení IPS máš, další není potřeba. Nemáš kapitál nebo dost hotovosti? Vrať se k učení a pokračuj později; plán nezvětšuj kvůli misi.",
      ], afterReturn: "Server čte vlastníka, poslední uloženou verzi IPS a neměnný záznam nákupu. Samotné otevření Labu ani modelový rozbor nestačí. Mise nepřidává kapitál ani odměnu za obchod; dokončení lekce používá běžnou politiku odměn.",
    }, analysis: { title: "modelová investorka Jana", summary: "Modelový příklad · Jana nejdřív opravila pokyn, pak potvrdila nákup.", rows: [
      { label: "Identita a směr", status: "Akumulační třída, zamýšlená kotace, KOUPIT" },
      { label: "Rozpočet", status: "2 500 Kč včetně nákladů" },
      { label: "Úbytek hotovosti", status: "2 487,25 Kč při 0,98 kusu" },
    ], generalRule: "Kontroluj pokyn podle svého plánu. Výnos ani počet obchodů nepotvrzuje správnost procesu.", selfExplanationPrompt: "Kterou konkrétní chybu by zachytila tvoje poslední kontrola?" } },

    { id: "after", type: "explanation", title: "Po potvrzení: pozice, váha a záznam", content: "V Portfolio Labu najdeš pozici mezi drženými instrumenty, její množství, hodnotu a váhu v portfoliu. V aktivitě ověř provedenou cenu, kurz, náklady a celkovou částku. Výsledek v korunách ovlivňuje cena instrumentu i kurz; nepřipisuj celý pohyb samotnému fondu. Jejich samostatný číselný rozklad zde neslibujeme. Daňová tranše je konkrétní nabytí s datem, množstvím a pořizovacími údaji; uchovej záznam jednotlivého nákupu, ne jen souhrn pozice. Daňová pravidla a přepočet ověř zvlášť, kurz pro obchod není automaticky kurzem pro daně. Nový cvičný kapitál z učení je příspěvek, ne investiční zisk." },
    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách si napiš poslední kontrolu před příštím nákupem a co uděláš, když pokyn nesedí. Tento text se neukládá; vlastní pojistku si můžeš přenést do IPS.", rubric: [
      { id: "identity", text: "Odliším třídu a kotaci; nespoléhám jen na název." },
      { id: "budget", text: "Porovnám celkový úbytek hotovosti včetně nákladů s plánem." },
      { id: "order", text: "Ověřím směr i typ pokynu a uvedu, co znamená cenový limit." },
      { id: "stop", text: "Při nesouladu pokyn opravím nebo vyčkám; neposílám jej automaticky." },
    ], sampleAnswer: "Porovnám identitu a třídu s dokumenty, ověřím KOUPIT, množství a typ pokynu. Celkovou částku včetně konverze a poplatku srovnám s rozpočtem. Pokud něco nesedí, vrátím se a opravím pokyn nebo počkám." },
    { id: "summary", type: "lessonSummary", title: "Plán → kontrola → potvrzení → evidence", content: "Před nákupem ověř identitu a kotaci, směr, množství, typ pokynu, náklady a celkovou částku. Tržní pokyn nezaručí cenu, limitní provedení. Po nákupu zkontroluj pozici, váhu a záznam transakce. Dodržení procesu je cíl nácviku; příznivý výnos není důkaz správného rozhodnutí ani připravenosti investovat skutečné peníze." },
    { id: "sources", type: "paragraph", content: "Zdroje · FINRA, Investing Basics: https://www.finra.org/investors/investing/investing-basics · Investor.gov, Types of Orders: https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders · Ověřeno 27. 10. 2026. Modelový fond, ISINy, burzy, ceny a ceník jsou smyšlené. Vzdělávací obsah, ne investiční ani daňové doporučení." },
  ],
};
