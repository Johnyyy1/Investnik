import type { AuthoredLesson } from "../types";
import { firstPlanLessons } from "./manifest";
const lesson = firstPlanLessons.find((entry) => entry.id === "first-plan-ips")!;

export const investmentPolicyStatementLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "first-plan", slug: lesson.slug, title: lesson.title,
  eyebrow: "První plán a první nákup", position: 1, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Kdy rozhodnout" }, { id: "worked", label: "Šablona" }, { id: "rules", label: "Pravidla" }, { id: "fall", label: "Propad" }, { id: "builder", label: "Tvůj plán" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Tereza investuje 3 000 Kč měsíčně do akciového ETF. Jednoho rána čte titulky „Trhy v panice“ a její portfolio je o 30 % níž než před půl rokem. Kamarád radí prodat, dokud je čas. Co by Tereze v tu chvíli pomohlo nejvíc?" },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Kdy je nejlepší rozhodnout, co Tereza při takovém propadu udělá?", options: [
      { id: "during", label: "Až propad nastane. Teprve tehdy vidí, co se na trhu děje.", misconception: "rozhodnu se v krizi", explanation: "Během propadu na rozhodnutí působí strach, titulky a rady okolí. Právě tehdy lidé nejčastěji prodávají se ztrátou, kterou by jinak přečkali." },
      { id: "before", label: "Předem, v klidu. Pravidlo si zapíše a při propadu ho jen vykoná." },
      { id: "after", label: "Až se trh vzpamatuje. Pak bude jasné, jestli se prodej vyplatil.", misconception: "rozhodnutí zpětně", explanation: "Zpětně se rozhodnout nedá. Než bude jasné, kudy trh šel, Tereza už buď prodala, nebo ne." },
    ], correctOptionId: "before", correctExplanation: "Pravidlo napsané v klidu vychází z cílů a horizontu, ne z titulků. Při propadu pak Tereza neřeší, co si myslí o trhu, ale jen to, co si předem slíbila.", incorrectExplanation: "Zamysli se, ve které chvíli rozhoduješ nejklidněji a s nejmenším tlakem okolí." },

    { id: "what", type: "explanation", title: "Investiční plán (IPS)", content: "Investiční plán (anglicky Investment Policy Statement, IPS) je krátký dokument, ve kterém předem rozhodneš, proč investuješ, do čeho, kolik a jak často, a co uděláš, když trh výrazně spadne. Nepotřebuješ k němu odborné znalosti; stačí jedna stránka. Nejde o předpověď trhu ani o nákupní seznam, ale o pravidla, podle kterých se budeš rozhodovat." },
    { id: "why", type: "conceptCallout", title: "Proč psát pravidla předem", content: "Studie Morningstar „Mind the Gap“ každý rok porovnávají výnos fondů s výnosem, který skutečně dostali jejich investoři. Investoři v průměru dostávají méně než samotné fondy, hlavně proto, že nakupují po růstu a prodávají po poklesu. Jde o americká agregátní data, ne o předpověď tvého výsledku. Plán sepsaný předem je pojistka proti vlastním reakcím: v krizi nerozhoduješ znovu, jen dodržuješ to, co máš předem napsané." },

    { id: "worked", type: "workedExample", title: "Modelový příklad · Terezin plán v devíti částech", introduction: "Tereza je smyšlená postava. Čísla jsou její volba, ne doporučení.", steps: [
      { label: "1 · Cíle a horizont", value: "Důchod za 30 let (nezbytný cíl); byt za 12 let (důležitý cíl)" },
      { label: "2 · Finanční základ", value: "Rezerva na 6 měsíců výdajů je hotová, drahý dluh nemá" },
      { label: "3 · Cílová alokace", value: "75 % globální akcie, 15 % dluhopisy, 10 % hotovost" },
      { label: "4 · Nástroje a platforma", value: "Jedno globální akciové ETF a jedno dluhopisové ETF podle svého checklistu; broker vybraný podle ročních nákladů svého plánu" },
      { label: "5 · Pravidelný příspěvek", value: "3 000 Kč měsíčně, vždy 5. den v měsíci" },
      { label: "6 · Rebalancing", value: "Při odchylce akcií o více než 5 p. b. od 75 %; nejdřív novými příspěvky" },
      { label: "7 · Pravidlo propadu", value: "Při poklesu o 30 % nic neprodám, pokračuji v příspěvcích a rebalancuji podle pravidla 6" },
      { label: "8 · Kdy plán změním", value: "Jen při změně cílů nebo životní situace, ne kvůli zprávám z trhu; přezkum jednou ročně v lednu" },
      { label: "9 · Podpis a datum", value: "Tereza, 5. 1. — plán platí, dokud ho vědomě nezmění", emphasis: true },
    ], conclusion: "Každá část odpovídá na jednu otázku, kterou by si Tereza jinak kladla v nejhorší možné chvíli. Části 1–5 popisují, co dělá v běžném měsíci. Části 6–8 jsou pravidla pro chvíle, kdy se něco změní." },

    { id: "faded", type: "fadedExample", title: "Modelový příklad · alokace musí dát 100 %", introduction: "Hotovost je v plánu také položkou alokace. Nemusíš ji investovat, ale musíš ji započítat.", steps: [
      { label: "Globální akcie", value: "75 %" },
      { label: "Dluhopisy", value: "15 %" },
      { label: "Kontrola", value: "Součet všech položek včetně hotovosti = 100 %" },
    ], blank: { label: "Hotovost", input: "number", answer: 10, tolerance: 0, unit: "%" }, misconception: "hotovost se nepočítá", correctExplanation: "100 − 75 − 15 = 10 %. Nástroj na plán v Labu uloží alokaci, jen když všechny váhy včetně hotovosti dají přesně 100 %.", incorrectExplanation: "Od 100 % odečti akcie a dluhopisy. Zbytek je hotovost." },

    { id: "rules", type: "explanation", title: "Dobré pravidlo se dá ověřit", content: "Pravidlo v plánu musí jít jednoznačně splnit, nebo porušit. „Budu rozumný“ nebo „prodám, když to bude vypadat špatně“ neříká, co přesně uděláš, takže v krizi nepomůže. Dobré pravidlo říká, kdy (spouštěč) a co uděláš (akce): „Prodám jen kvůli rebalancingu nebo když budu potřebovat peníze na cíl z plánu.“" },
    { id: "good-rule", type: "multipleChoiceQuestion", prompt: "Které pravidlo by Tereza mohla v krizi jednoznačně dodržet?", options: [
      { id: "vague", label: "Když to bude vypadat opravdu špatně, raději prodám.", misconception: "nejasný spouštěč", explanation: "Co znamená „vypadat špatně“? Při každém propadu to tak vypadá. Pravidlo nemá konkrétní spouštěč, takže rozhodnutí odkládá na chvíli největšího stresu." },
      { id: "specific", label: "Prodám jen při rebalancingu podle pásma ±5 p. b. nebo když budu potřebovat peníze na cíl z plánu." },
      { id: "sensible", label: "Budu se chovat rozumně a pozorně sledovat zprávy.", misconception: "dobrý úmysl místo pravidla", explanation: "Je to dobrý úmysl, ne pravidlo. Neříká, co udělat, a sledování zpráv v krizi spíš zvyšuje tlak jednat." },
    ], correctOptionId: "specific", correctExplanation: "Pravidlo má konkrétní spouštěč (odchylka nad 5 p. b. nebo potřeba peněz na cíl) i akci. Zpětně jde ověřit, jestli ho Tereza dodržela.", incorrectExplanation: "Hledej pravidlo, u kterého jde jednoznačně říct, jestli ho Tereza dodržela." },

    { id: "fall", type: "explanation", title: "Modelový příklad · co pravidlo propadu udělá s alokací", content: "Terezino pásmo pro rebalancing je ±5 p. b. kolem cílových 75 % akcií, tedy 70–80 %. Pokud akcie spadnou a dluhopisy s hotovostí se nezmění, podíl akcií v portfoliu klesne. Pravidlo 7 pak neznamená „nic nedělat“: Tereza dál posílá příspěvky do akcií, a když podíl akcií klesne pod spodní hranici pásma, dokoupí je, aby se vrátila k cíli." },
    { id: "fall-practice", type: "numericQuestion", prompt: "Modelový příklad · Tereza má 75 % akcie, 15 % dluhopisy a 10 % hotovost. Akcie spadnou o 30 %, dluhopisy a hotovost se nezmění. Jaký bude podíl akcií v portfoliu po propadu? Zaokrouhli na jedno desetinné místo.", answer: 67.7, tolerance: 0.06, unit: "%", correctExplanation: "Akcie: 75 × 0,7 = 52,5. Celé portfolio: 52,5 + 15 + 10 = 77,5. Podíl akcií: 52,5 ÷ 77,5 = 67,7 %. To je pod hranicí 70 %, takže podle pravidla 6 Tereza akcie dokupuje z příspěvků, dluhopisů a hotovosti. Neprodává je.", incorrectExplanation: "Hodnota akcií klesla na 75 × 0,7 = 52,5, ale zmenšilo se i celé portfolio. Podíl akcií spočítej z nového celku: 52,5 ÷ (52,5 + 15 + 10)." },

    { id: "change", type: "explanation", title: "Kdy plán změnit", content: "Plán měníš, když se změní tvoje cíle, horizont nebo životní situace: narození dítěte, nová práce, blížící se nákup bytu. Zprávy z trhu, propad ani růst nejsou důvodem. Plán si projdi jednou ročně v pevném měsíci. Každá změna je nová verze s datem a zdůvodněním. Starou verzi si necháš, aby bylo později vidět, kdy a proč se plán změnil." },
    { id: "misconceptions", type: "conceptCallout", title: "Časté omyly", content: "„IPS je jen pro profesionály.“ Jedna stránka s pravidly pomůže hlavně začátečníkovi. „Plán mi bere svobodu.“ Chrání tě před rozhodnutím ze strachu nebo z nadšení; změnit ho můžeš, jen ne v panice. „Plán se musí měnit podle trhu.“ Plán je postavený na tvých cílech; trh mění jen to, kdy pravidla použiješ." },

    { id: "recall-sections", type: "multipleChoiceQuestion", prompt: "Kamarád ti ukáže svůj plán: cíl a horizont, rezerva hotová, 80 % akcie a 20 % dluhopisy, konkrétní ETF a broker, 2 000 Kč měsíčně vždy 10. den. Co v plánu chybí nejvíc?", options: [
      { id: "rules", label: "Pravidla pro údržbu a krizi: rebalancing, co udělá při propadu a kdy plán změní." },
      { id: "target", label: "Cílový výnos na příští rok, aby věděl, jestli se daří.", misconception: "plán = předpověď", explanation: "Výnos na příští rok nikdo spolehlivě neodhadne a plán na něm nestojí. Chybí mu pravidla, co dělat, když se trh pohne." },
      { id: "picks", label: "Seznam akcií, které teď rostou nejrychleji.", misconception: "plán = nákupní seznam", explanation: "Plán neřeší, co je zrovna populární. Nástroje už v plánu má; chybí mu pravidla údržby a pro propad." },
    ], correctOptionId: "rules", correctExplanation: "Plán popisuje běžný měsíc, ale ne chvíle, kdy se něco změní. Bez rebalancingu, pravidla pro propad a pravidla pro změnu plánu by kamarád v krizi rozhodoval znovu a pod tlakem.", incorrectExplanation: "Projdi devět částí plánu a hledej, které v kamarádově plánu chybí." },
    { id: "recall-why", type: "multipleChoiceQuestion", prompt: "Proč patří pravidlo pro propad o 30 % do plánu už předem?", options: [
      { id: "predict", label: "Protože předem víš, kdy propad přijde.", misconception: "plán = předpověď", explanation: "Kdy propad přijde, neví nikdo. Pravidlo funguje právě proto, že datum znát nepotřebuje." },
      { id: "calm", label: "Protože v klidu rozhoduješ podle cílů. Při propadu tlačí strach a zprávy k prodeji ve ztrátě." },
      { id: "guarantee", label: "Protože pravidlo zaručí, že portfolio ztrátu rychle dožene.", misconception: "pravidlo zaručí výnos", explanation: "Žádné pravidlo nezaručí výnos ani rychlost zotavení. Chrání tě jen před rozhodnutím ze strachu." },
    ], correctOptionId: "calm", correctExplanation: "Pravidlo z klidného období vychází z tvých cílů a horizontu. Při propadu ho jen vykonáš místo rozhodování pod tlakem.", incorrectExplanation: "Pravidlo propadu neříká nic o budoucnosti trhu. Zamysli se, v jakém stavu se rozhoduješ předem a v jakém během propadu." },

    { id: "builder-intro", type: "paragraph", content: "Teď sepiš svůj vlastní plán ve stejných devíti částech. Nástroj Můj investiční plán v Labu se otevře v nové kartě a předvyplní cíle a finanční základ, pokud máš uloženou mapu cílů a check-up. Čísla jsou tvoje rozhodnutí; nástroj ani lekce nedoporučují konkrétní alokaci, fond ani brokera. Po uložení se vrať sem a plán zkontroluj." },
    { id: "builder", type: "interactiveFigure", figure: "ips-builder", title: "Můj investiční plán", description: "Pokračovat můžeš, až bude uložená úplná verze plánu. Ověřuje to server." },

    { id: "reflection", type: "writtenReflection", prompt: "Přečti si svůj uložený plán a ve 2–4 větách napiš, co uděláš, až tvoje portfolio spadne o 30 %, a proč. Pak plán porovnej s kritérii.", rubric: [
      { id: "complete", text: "Úplnost: plán má všech devět částí včetně pravidla pro propad a pro změnu plánu." },
      { id: "specific", text: "Konkrétnost: každé pravidlo má spouštěč a akci a jde zpětně ověřit, jestli bylo dodrženo." },
      { id: "horizon", text: "Soulad s horizontem: peníze na blízké cíle nejsou v akciích, které můžou v té době být v propadu." },
      { id: "costs-taxes", text: "Náklady a daně: počítám s ročními náklady plánu a vím, že prodej může mít daňové důsledky (časový test), které si ověřím." },
    ], sampleAnswer: "Až portfolio spadne o 30 %, nic neprodám a dál budu posílat 3 000 Kč měsíčně. Když podíl akcií klesne pod 70 %, dokoupím je podle pravidla rebalancingu. Plán změním jen tehdy, když se změní moje cíle, ne kvůli titulkům." },

    { id: "lab-bridge", type: "labBridge", title: "Plán jako měřítko v Labu", content: "Portfolio Lab porovnává tvoje cvičné portfolio s uloženým plánem a ve zpětné vazbě procesu ukáže odchylku od cílové alokace. Alokaci z plánu můžeš v nástroji Můj investiční plán uložit jako cílový mix; neprovede se tím žádný obchod. Plán bude měřítkem i v krizovém nácviku: hodnotí se, jestli se ho držíš, ne jak trh dopadl." },
    { id: "summary", type: "lessonSummary", title: "Rozhodni předem, v krizi jen vykonej", content: "Investiční plán (IPS) má devět částí: cíle a horizont, finanční základ, alokaci, nástroje a platformu, pravidelný příspěvek, rebalancing, pravidlo propadu, pravidlo pro změnu plánu a podpis s datem. Dobré pravidlo má spouštěč a akci a dá se ověřit. Plán měníš kvůli svým cílům a životu, ne kvůli zprávám z trhu, a každou změnu ukládáš jako novou verzi." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · Morningstar, Mind the Gap: https://www.morningstar.com/financial-advisors/volatility-bedevils-fund-investors · Bogleheads, Investment policy statement: https://www.bogleheads.org/wiki/Investment_policy_statement · Thaler a Benartzi, Save More Tomorrow: https://econpapers.repec.org/paper/febnatura/00337.htm · Tereza a její plán jsou smyšlené. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
