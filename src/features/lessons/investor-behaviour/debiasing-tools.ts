import type { AuthoredLesson } from "../types";
import { investorBehaviourLessons } from "./manifest";
import { SAFEGUARD_SET_BLOCK_ID, SAFEGUARD_SET_LESSON_ID, safeguardSet } from "./safeguard-set";
const lesson = investorBehaviourLessons.find((entry) => entry.id === SAFEGUARD_SET_LESSON_ID)!;

export const debiasingToolsLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "investor-behaviour", slug: lesson.slug, title: lesson.title,
  eyebrow: "Investor v zrcadle", position: 5, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Pojistky" }, { id: "map", label: "Mapa" }, { id: "match-trading", label: "Přiřazení" }, { id: "premortem", label: "Pre-mortem" }, { id: "set-intro", label: "Sada pojistek" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Jana (31 let) investuje každý měsíc 3 000 Kč do široce rozloženého akciového ETF podle svého investičního plánu (IPS). O behaviorálních chybách už ví hodně. Přesto se jí v jednom roce stane, že trh spadne o pětinu, kamarád se chlubí akcií, která vyrostla, a v aplikaci vidí červená čísla každý den. Vědět o chybě nestačí: v okamžiku rozhodnutí je silnější pocit než znalost." },
    { id: "why-safeguards", type: "explanation", title: "Pojistka místo pevné vůle", content: "Pojistka je pravidlo, které si nastavíš v klidu, dřív než přijde pokušení. Při rozhodnutí pak nemusíš spoléhat na vůli; stačí se podívat na pravidlo, které máš zapsané. Dobrá pojistka je konkrétní (kdy platí a co uděláš), zapsaná (v IPS, checklistu nebo seznamu) a viditelná v okamžiku rozhodnutí. Tato lekce shrnuje pojistky z modulu B.1 a ty si z nich sestavíš vlastní sadu." },

    { id: "map", type: "workedExample", title: "Mapa chyba → pojistka", introduction: "Každá chyba z modulu Investor v zrcadle má pojistku, kterou lze zapsat předem.", steps: safeguardSet.map((entry) => ({ label: entry.mistake, value: entry.action })), conclusion: "FOMO (anglicky fear of missing out, strach, že nám něco uteče) je nutkání koupit, co právě roste, protože to mají ostatní. Pojistky se navzájem doplňují: IPS říká, co a jak často děláš; checklist, rozpočet obratu a odložený seznam brzdí obchody mimo plán; otázka na mechanismus brzdí víru v příběh." },

    { id: "match-trading-context", type: "paragraph", content: "Modelový příklad · Petr má letos za sebou už čtyři obchody mimo plán. V diskusi si přečte tip na akcii jedné firmy a chce ji koupit ještě dnes večer." },
    { id: "match-trading", type: "multipleChoiceQuestion", prompt: "Která pojistka Petrovi v tu chvíli pomůže nejvíc?", options: [
      { id: "checklist", label: "Projít checklist před obchodem a ověřit, jestli se obchod vejde do ročního rozpočtu obratu." },
      { id: "watch-more", label: "Sledovat akcii každý den, aby nákup trefil ve správnou chvíli.", misconception: "víc sledování = víc kontroly", explanation: "Častější pohled přidá hlavně emoce a další podněty k obchodu. Petrův problém je počet obchodů mimo plán, ne načasování." },
      { id: "sell-losers", label: "Prodat ztrátové pozice, aby měl na nákup hotovost.", misconception: "jiná chyba", explanation: "Tím by přidal další obchod mimo plán. Prodej se řídí cílovou alokací v IPS, ne potřebou financovat nový nápad." },
    ], correctOptionId: "checklist", correctExplanation: "Proti přehnané sebedůvěře pomáhá zpomalit a spočítat se: checklist donutí napsat důvod a náklady a rozpočet obratu ukáže, kolik obchodů mimo plán si Petr na tento rok sám povolil.", incorrectExplanation: "Petr obchoduje častěji, než jeho plán počítá. Která pojistka hlídá právě obchody mimo plán?" },

    { id: "match-fomo-context", type: "paragraph", content: "Modelový příklad · Janin kamarád se pochlubil, že mu akcie jedné firmy za poslední rok vzrostla o 80 %. Jana ji nemá a má pocit, že jí něco utíká. Žádné pravidlo jejího IPS s takovým nákupem nepočítá." },
    { id: "match-fomo", type: "multipleChoiceQuestion", prompt: "Jaká pojistka chrání Janu před nákupem ze strachu, že jí něco uteče (FOMO)?", options: [
      { id: "watchlist", label: "Zapsat si nápad na odložený seznam a rozhodnout se nejdřív za 30 dní, podle IPS." },
      { id: "small-bet", label: "Koupit jen malou částku, aby to nebolelo, kdyby to nevyšlo.", misconception: "malá sázka je pojistka", explanation: "Malá částka zmenší možnou ztrátu, ale rozhodnutí pořád dělá pocit. Příště může být částka větší. Pojistka mění postup rozhodnutí, ne velikost sázky." },
      { id: "wait-dip", label: "Počkat, až akcie trochu klesne, a pak ji koupit.", misconception: "počkám na lepší cenu", explanation: "Rozhodnutí koupit tím zůstává; jen se odkládá na odhad, kdy cena klesne. Otázka není kdy, ale jestli nákup patří do plánu." },
    ], correctOptionId: "watchlist", correctExplanation: "Odložené rozhodnutí dá pocitu čas vychladnout. Za 30 dní Jana posoudí nápad v klidu a podle IPS; často zjistí, že ho už nepotřebuje. Lhůta 30 dní je modelová, důležité je, že je zapsaná předem.", incorrectExplanation: "Hledej pojistku, která rozhodnutí oddělí od chvíle, kdy je nutkání nejsilnější." },

    { id: "match-story-context", type: "paragraph", content: "Modelový příklad · Článek tvrdí: „Firmy, které ve výročních zprávách nejčastěji zmiňují umělou inteligenci, letos rostly nejrychleji. Fond zaměřený na tyto firmy proto musí porazit trh.“ Graf v článku je nakreslený správně." },
    { id: "match-story", type: "multipleChoiceQuestion", prompt: "Co je v tu chvíli nejlepší pojistka?", options: [
      { id: "mechanism", label: "Zeptat se: jaký je mechanismus, proč by to mělo platit i dál, a co by tvrzení vyvrátilo?" },
      { id: "more-articles", label: "Najít další články se stejným závěrem, aby měl důkaz větší váhu.", misconception: "víc souhlasu = víc důkazu", explanation: "Články se stejným závěrem často opakují tentýž příběh. Hledat jen potvrzení je přesně to, co pojistka má brzdit." },
      { id: "chart-ok", label: "Nic, graf je správný, takže je správný i závěr.", misconception: "správná data = správný závěr", explanation: "Data mohou být přesná a závěr přesto mylný. Souvislost v minulosti ještě není příčina a nezaručuje budoucí výnos." },
    ], correctOptionId: "mechanism", correctExplanation: "Příběh přesvědčuje tím, že dává smysl. Otázka na mechanismus a na to, co by tvrzení vyvrátilo, odliší vysvětlení od náhodné souvislosti, a připomene, že dobře známý příběh už bývá v cenách.", incorrectExplanation: "Data jsou v pořádku. Co z nich ale nevyplývá?" },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Která pojistka chrání před dispozičním efektem, tedy sklonem prodávat pozice v zisku a držet ztrátové?", options: [
      { id: "rebalance", label: "Prodej podle cílové alokace v IPS (vyvažování), ne podle nákupní ceny." },
      { id: "review", label: "Frekvence kontroly portfolia zapsaná v IPS.", misconception: "pojistka proti krátkozrakosti", explanation: "Frekvence kontroly chrání před krátkozrakou averzí ke ztrátě. O tom, co prodat, nerozhoduje." },
      { id: "watchlist", label: "Odložený seznam nápadů na nákup.", misconception: "pojistka proti FOMO", explanation: "Odložený seznam brzdí nákupy ze strachu, že něco uteče. Dispoziční efekt se týká prodejů." },
    ], correctOptionId: "rebalance", correctExplanation: "Když je předem dané, že prodáváš podle odchylky od cílové alokace, nerozhoduje nákupní cena ani to, jestli je pozice v zisku nebo ve ztrátě.", incorrectExplanation: "Hledej pojistku, která určuje, co a kdy prodat." },

    { id: "premortem", type: "explanation", title: "Pre-mortem: plán selhal, proč?", content: "Pre-mortem (doslova „před smrtí“, opak pitvy po neúspěchu) popsal psycholog Gary Klein pro týmy, které začínají projekt. Místo otázky „co by se mohlo pokazit?“ si představíš, že se to už stalo: projekt selhal. Pak sepíšeš, proč. Představa hotového selhání usnadňuje najít konkrétní důvody, které by v optimistickém plánování nikdo nevyslovil. U investičního plánu to funguje stejně: představ si, že jsou to čtyři roky od dneška a tvůj plán nevyšel. Nejde o to uhodnout trh, ale najít slabá místa ve vlastním chování a plánu." },
    { id: "premortem-example", type: "workedExample", title: "Modelový příklad · Janin pre-mortem", introduction: "„Je rok 2030 a můj plán selhal. Proč?“ Jana napíše tři nejpravděpodobnější důvody a ke každému úpravu plánu.", steps: [
      { label: "Důvod 1 · Při propadu trhu jsem prodala a nekoupila zpátky", value: "Úprava: pravidlo pro propad v IPS a trvalý příkaz, který běží dál" },
      { label: "Důvod 2 · Když vzrostly výdaje, přestala jsem posílat příspěvky", value: "Úprava: příspěvek hned po výplatě a rezerva na účtu zvlášť" },
      { label: "Důvod 3 · Kupovala jsem tipy z diskusí a plán se rozpadl", value: "Úprava: odložený seznam a rozpočet obratu 2 obchody ročně", emphasis: true },
    ], conclusion: "Žádný z důvodů není „trh spadl“. Pokles trhu Jana neovlivní; ovlivní, co v něm udělá. Proto každý důvod končí úpravou, kterou si zapíše do IPS nebo do své sady pojistek." },

    { id: "premortem-output", type: "rubricSelfAssessment", title: "Pre-mortem mého plánu", prompt: "Představ si, že jsou to čtyři roky od dneška (třeba rok 2030) a tvůj investiční plán selhal. Napiš 3 nejpravděpodobnější důvody a ke každému úpravu plánu.", criteria: [
      { id: "reasons", label: "Tři důvody selhání", levels: ["Důvody zatím nemám nebo jsou obecné („trh spadl“).", "Mám jeden nebo dva konkrétní důvody.", "Mám tři konkrétní důvody, které se týkají mého chování nebo plánu.", "Mám tři konkrétní důvody a vím, který z nich je nejpravděpodobnější."] },
      { id: "adjustments", label: "Úprava ke každému důvodu", levels: ["Úpravy zatím nemám.", "Mám úpravu jen u některých důvodů.", "Ke každému důvodu mám konkrétní úpravu nebo pojistku.", "Ke každému důvodu mám úpravu a vím, kam ji zapíšu (IPS, checklist, sada pojistek)."] },
      { id: "control", label: "Co můžu ovlivnit", levels: ["Důvody jsou jen o trhu, který neovlivním.", "Část důvodů se týká mého chování, nákladů nebo příspěvků.", "Rozlišuji, co ovlivním (chování, náklady, příspěvky) a co ne (výnos trhu).", "Rozlišuji to a i pro to, co neovlivním, mám zapsané, co udělám."] },
    ] },

    { id: "set-intro", type: "explanation", title: "Tvoje sada pojistek", content: "Vyber pojistky, které chceš opravdu dodržovat, a ulož je. Nemusíš vybrat všechny; lepší jsou dvě, které dodržíš, než šest, na které zapomeneš. Uložená sada je vidět v Nastavení → Moje data a Cvičné portfolio v Labu ti ji připomene na kartě v okamžiku rozhodnutí: u každé situace jen ty pojistky, které k ní patří. Sadu můžeš kdykoli uložit znovu jinak nebo smazat." },
    { id: SAFEGUARD_SET_BLOCK_ID, type: "checklist", title: "Moje sada pojistek", items: safeguardSet.map((entry) => ({ id: entry.id, label: `${entry.mistake} · ${entry.trigger}: ${entry.action}` })) },

    { id: "ips-update", type: "explanation", title: "Zapiš úpravy do IPS", content: "Úpravy z pre-mortem patří do investičního plánu. Otevři svůj IPS a zapiš je do pravidel: třeba pravidlo pro propad, jak často portfolio kontroluješ nebo kdy vyvažuješ. Ulož plán; vznikne nová verze a předchozí zůstane v historii. Pokud v plánu nic měnit nechceš, stačí tvůj dosavadní uložený plán." },
    { id: "builder", type: "interactiveFigure", figure: "ips-builder", title: "Uprav svůj IPS podle pre-mortem", description: "Otevři existující nástroj, doplň úpravy z pre-mortem do pravidel plánu a ulož IPS jako novou verzi." },

    { id: "lab-bridge", type: "labBridge", title: "Pojistky v Labu", content: "Když v Cvičném portfoliu chystáš nákup mimo IPS, prodáváš pozici v zisku a ztrátové držíš, nebo děláš pátý obchod za týden, Lab ti před potvrzením ukáže kartu. Pod nadpisem „Tvoje pojistky“ na ní uvidíš pravidla z tvé sady, která k situaci patří. Karta obchod nezakazuje a jeden obchod chybu neprokazuje. Hodnotí se, jestli se držíš plánu, ne výnos." },
    { id: "summary", type: "lessonSummary", title: "Rozhodni předem, ne v okamžiku pokušení", content: "Behaviorální chyby nezmizí tím, že o nich víš. Pomáhají pojistky nastavené v klidu: IPS a automatická investice proti mezeře chování, checklist a rozpočet obratu proti přehnané sebedůvěře, prodej podle cílové alokace proti dispozičnímu efektu, frekvence kontroly proti krátkozrakosti, odložený seznam proti FOMO a otázka na mechanismus proti příběhům. Pre-mortem odhalí slabá místa tvého plánu dřív, než se projeví." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · Gary Klein, Performing a Project Premortem (Harvard Business Review, 2007): https://hbr.org/2007/09/performing-a-project-premortem · Armbruster, Moran a Shirley, Pre-Mortem Analysis (Public Health Foundation, 2014): https://archive.phf.org/resourcestools/Documents/Pre_Mortem_Analysis.pdf · Jana, Petr i čísla v příkladech jsou smyšlení. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
