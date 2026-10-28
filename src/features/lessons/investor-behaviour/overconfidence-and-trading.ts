import type { AuthoredLesson } from "../types";
import { investorBehaviourLessons } from "./manifest";
const lesson = investorBehaviourLessons.find((entry) => entry.id === "behaviour-overconfidence")!;

export const overconfidenceLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "investor-behaviour", slug: lesson.slug, title: lesson.title,
  eyebrow: "Investor v zrcadle", position: 2, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Dva investoři" }, { id: "mission", label: "Lab" }, { id: "turnover", label: "Obrat" }, { id: "costs", label: "Náklady" }, { id: "research", label: "Výzkum" }, { id: "safeguard", label: "Pojistka" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Tomáš a Jana mají každý 100 000 Kč ve stejném globálním akciovém ETF. Jana nakoupila jednou a drží. Tomáš sleduje zprávy, má dobrý pocit z vlastního úsudku a obchoduje 40× ročně; každý obchod ho u jeho brokera stojí 60 Kč. Oba vydrží pět let." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Co o Tomášovi víš jistě ještě předtím, než uvidíš, jak se trh za pět let pohnul?", options: [
      { id: "better", label: "Bude na tom lépe než Jana, protože trh sleduje a reaguje včas.", misconception: "aktivní = pečlivý", explanation: "Snaha a čas strávený sledováním trhu nejsou výsledek. Jistě víš jen to, kolik Tomáš zaplatí; jestli jeho obchody vyjdou, předem nevíš." },
      { id: "fees", label: "Zaplatí na poplatcích 12 000 Kč. Jeho obchody musí trhu přidat aspoň tolik, jen aby skončil jako Jana." },
      { id: "same", label: "Nic podstatného. Poplatek 60 Kč je proti 100 000 Kč zanedbatelný.", misconception: "poplatky jsou malé", explanation: "Jeden poplatek ano. Jenže 40 obchodů ročně po pět let je 200 poplatků a ty se sčítají." },
    ], correctOptionId: "fees", correctExplanation: "40 obchodů × 5 let × 60 Kč = 12 000 Kč. To je jediné číslo, které je jisté předem. Výsledek obchodů jistý není, náklad ano.", incorrectExplanation: "Odliš, co je nejisté (kam se pohne trh) a co je jisté (kolik obchodů Tomáš udělá a kolik každý stojí)." },

    { id: "mission-intro", type: "paragraph", content: "Simulace · Vyzkoušej si obchodování na vlastní kůži. V Krizovém nácviku můžeš každý měsíc nakupovat a prodávat s realistickým poplatkem z ceníku nácviku. Na konci uvidíš počet obchodů, zaplacené poplatky a obrat. Pracuješ s tréninkovými penězi; tvoje cvičné portfolio ani cvičný kapitál se nemění a za obchody nedostaneš XP ani kapitál. Krok je dobrovolný, lekce pokračuje i bez něj." },
    { id: "mission", type: "labMission", mission: {
      title: "Obchoduj, jak chceš, a pak se podívej na účet", goal: "Projdi jeden nácvik a obchoduj podle svého úsudku. Na konci si zapiš počet obchodů, poplatky a obrat.", minutes: 8, target: "/lab/training",
      steps: ["Otevři Krizový nácvik a vyber scénář. Modelový scénář je vymyšlený, historické scénáře jsou označené zdrojem.", "Obchoduj tak často, jak tě to láká. Nikdo tě nehodnotí za počet obchodů ani za výnos.", "Na konci porovnej počet obchodů, poplatky a obrat s tím, co by udělal plán „kup a drž“."],
      afterReturn: "Výsledek nácviku zůstává jen v nácviku. Lekce z něj nic nepřebírá ani nehodnotí.",
    }, analysis: { title: "dva modeloví investoři", summary: "Simulace · Modelový nácvik na 24 měsíců s poplatkem 60 Kč za obchod. Jeden investor nakoupí na začátku a drží, druhý obchoduje dvakrát měsíčně.", rows: [
      { label: "Kup a drž", status: "1 obchod", progress: 0.02, start: "60 Kč na poplatcích", end: "v plánu" },
      { label: "Aktivní obchodování", status: "48 obchodů", progress: 1, start: "2 880 Kč na poplatcích", end: "47 obchodů mimo plán", highlight: true },
    ], generalRule: "Každý obchod má jistý náklad a nejistý přínos. Kdo obchoduje častěji, musí mít častěji pravdu, jen aby vyrovnal poplatky.", selfExplanationPrompt: "Který obchod v nácviku vznikl z pocitu, a ne z pravidla v plánu?" } },

    { id: "turnover", type: "explanation", title: "Obrat portfolia", content: "Obrat (anglicky turnover) říká, jak velkou část portfolia za rok vyměníš. Spočítáš ho jako objem prodejů za rok vydělený průměrnou hodnotou portfolia. Obrat 100 % znamená, že prodeje za rok dosáhly průměrné hodnoty portfolia. Prodeje berou v úvahu proto, že pravidelné nákupy z výplaty patří k plánu; obchodování poznáš podle toho, co prodáváš. Některé zdroje počítají s nákupy nebo s menší z obou částek, proto vždy porovnávej čísla se stejnou definicí." },
    { id: "formula", type: "formula", expression: "Obrat = P ÷ H", latex: "\\text{Obrat} = \\frac{P}{H}", variables: [
      { symbol: "P", description: "Prodeje za rok: součet všech prodejů v Kč" },
      { symbol: "H", description: "Průměrná hodnota portfolia během roku v Kč" },
    ] },
    { id: "worked", type: "workedExample", title: "Modelový příklad · Tomášův první rok", introduction: "Čísla jsou vymyšlená, aby šla snadno spočítat.", steps: [
      { label: "Průměrná hodnota portfolia", value: "100 000 Kč" },
      { label: "Prodeje za rok", value: "60 000 Kč" },
      { label: "Obrat", value: "60 000 ÷ 100 000 = 60 %", emphasis: true },
    ], conclusion: "Tomáš za rok vyměnil víc než polovinu portfolia. Pro investora, jehož plán je nakupovat a držet, je to signál, že rozhoduje častěji, než plán počítá." },

    { id: "turnover-practice", type: "numericQuestion", prompt: "Modelový příklad · Portfolio mělo během roku průměrnou hodnotu 200 000 Kč. Prodeje za rok byly 300 000 Kč. Jaký je obrat?", answer: 150, tolerance: 0.5, unit: "%", correctExplanation: "300 000 ÷ 200 000 = 1,5, tedy 150 %. Za rok bylo prodáno o polovinu víc, než kolik portfolio v průměru stálo.", incorrectExplanation: "Vyděl prodeje za rok průměrnou hodnotou portfolia a výsledek převeď na procenta." },

    { id: "costs", type: "explanation", title: "Náklady rostou s každým obchodem", content: "Každý obchod stojí poplatek brokera a spread mezi nákupní a prodejní cenou, u zahraničních ETF často i měnovou konverzi. Po prodeji se zisk může danit. Jeden obchod vypadá levně; rozhoduje, kolikrát za rok se zopakuje. Roční náklady obchodování vydělené hodnotou portfolia dají procento, o které musíš trh každý rok porazit, jen aby výsledek dorovnal kup a drž." },
    { id: "costs-practice", type: "numericQuestion", prompt: "Modelový příklad · Investor udělá za rok 40 obchodů, každý ho stojí 60 Kč na poplatcích. Portfolio má hodnotu 100 000 Kč. Kolik procent hodnoty portfolia ročně zaplatí na poplatcích?", answer: 2.4, tolerance: 0.01, unit: "%", correctExplanation: "40 × 60 Kč = 2 400 Kč. 2 400 ÷ 100 000 = 2,4 % ročně, a to bez spreadu a měnové konverze. Pro srovnání: celkové roční náklady běžného indexového ETF bývají zlomek procenta.", incorrectExplanation: "Nejdřív spočítej roční poplatky v Kč (počet obchodů × poplatek), pak je vyděl hodnotou portfolia." },

    { id: "research", type: "conceptCallout", title: "Výzkum · obchodování škodí vašemu bohatství", content: "Ekonomové Brad Barber a Terrance Odean prošli účty 66 465 amerických domácností u diskontního brokera v letech 1991–1996. Pětina domácností, které obchodovaly nejvíc, vydělala po nákladech {{barber_odean.aktivni}} ročně, zatímco trh {{barber_odean.trh}}. Před náklady přitom vydělávaly domácnosti s vysokým i nízkým obratem téměř stejně. Jde o Spojené státy, jednotlivé akcie a jeden broker, ne o českého investora do ETF." },
    { id: "research-why", type: "multipleChoiceQuestion", prompt: "Před náklady vydělávaly domácnosti s vysokým i nízkým obratem téměř stejně. Co z toho plyne o rozdílu po nákladech?", options: [
      { id: "costs", label: "Rozdíl vznikl hlavně na nákladech častého obchodování, ne tím, že by aktivní vybírali horší akcie." },
      { id: "picks", label: "Aktivní domácnosti vybíraly horší akcie.", misconception: "aktivní mají horší výběr", explanation: "Kdyby vybíraly horší akcie, byl by rozdíl vidět už před náklady. Ten ale byl malý." },
      { id: "market", label: "Aktivní domácnosti zasáhl horší trh.", misconception: "jiný trh", explanation: "Všechny domácnosti investovaly ve stejném období na stejném trhu. Rozdíl tedy nevysvětlí trh." },
    ], correctOptionId: "costs", correctExplanation: "Když jsou výnosy před náklady skoro stejné a po nákladech výrazně odlišné, rozdíl jde na vrub nákladům. Časté obchodování neprodukovalo lepší výběr, jen víc poplatků.", incorrectExplanation: "Porovnej výnosy před náklady a po nich. Kde se skupiny rozcházejí?" },

    { id: "overconfidence", type: "explanation", title: "Přehnaná sebedůvěra", content: "Přehnaná sebedůvěra (anglicky overconfidence) znamená, že přeceňujeme přesnost vlastních odhadů. Investor si pak plete pocit jistoty s informací, kterou trh ještě nezná. Každý obchod je sázka, že vím víc než ten, kdo stojí na druhé straně. Čím víc obchodů, tím víc takových sázek, víc nákladů a víc příležitostí k chybě. Neznamená to, že každý obchod je chyba; znamená to, že každý obchod mimo plán potřebuje důvod, který obstojí i za rok." },
    { id: "misconceptions", type: "conceptCallout", title: "Časté omyly", content: "„Aktivní znamená pečlivý.“ Pečlivý investor dodržuje plán; počet obchodů o péči nic neříká. „Poplatky jsou malé.“ Jeden ano, ale násobí se počtem obchodů a odečítají se každý rok. „Mám dobrý pocit, tak mám informaci.“ Pocit jistoty není informace, kterou by trh ještě neznal." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Co měří obrat portfolia?", options: [
      { id: "share", label: "Jak velkou část portfolia za rok vyměníš: prodeje za rok vydělené průměrnou hodnotou portfolia." },
      { id: "return", label: "O kolik procent portfolio za rok vzrostlo.", misconception: "obrat = výnos", explanation: "To je výnos. Obrat měří, kolik se obchodovalo, ne kolik se vydělalo." },
      { id: "count", label: "Počet obchodů za rok.", misconception: "obrat = počet obchodů", explanation: "Počet obchodů nebere v úvahu jejich velikost. Obrat porovnává objem obchodů s hodnotou portfolia." },
    ], correctOptionId: "share", correctExplanation: "Obrat dává objem obchodů do poměru s velikostí portfolia. Obrat 150 % znamená, že se za rok prodalo o polovinu víc, než kolik portfolio v průměru stálo.", incorrectExplanation: "Obrat porovnává dvě částky v Kč. Které to jsou?" },

    { id: "safeguard", type: "explanation", title: "Rozpočet obratu a checklist před obchodem", content: "Pojistka má dvě části. Rozpočet obratu je pravidlo v IPS, kolik obchodů mimo plán si za rok dovolíš, například „nejvýše 2 obchody mimo plán ročně“. Číslo je jen ilustrace; zvol si vlastní. Pravidelné nákupy a vyvažování podle plánu se do rozpočtu nepočítají. Checklist před obchodem je pár otázek, které si položíš pokaždé, když tě obchod mimo plán láká. Vyber, které otázky chceš mít ve svém checklistu, a ulož ho." },
    { id: "checklist", type: "checklist", title: "Můj checklist před obchodem", items: [
      { id: "ips", label: "Je tento obchod v mém IPS?" },
      { id: "reason", label: "Jaký je důvod? Umím ho napsat jednou větou?" },
      { id: "wrong", label: "Co by mě přesvědčilo, že se mýlím?" },
      { id: "cost", label: "Kolik to stojí: poplatek, spread, měnová konverze a případná daň?" },
      { id: "budget", label: "Vejde se obchod do mého ročního rozpočtu obratu?" },
    ] },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách napiš svůj rozpočet obratu: kolik obchodů mimo plán si za rok dovolíš, co se do něj nepočítá a co uděláš, když ho vyčerpáš. Pak text porovnej s kritérii.", rubric: [
      { id: "number", text: "Číslo: rozpočet je konkrétní počet obchodů mimo plán za rok." },
      { id: "scope", text: "Rozsah: pravidelné nákupy a vyvažování podle IPS se nepočítají." },
      { id: "check", text: "Kontrola: před každým obchodem mimo plán projdu checklist." },
      { id: "limit", text: "Hranice: vím, co udělám, když rozpočet vyčerpám (počkám do dalšího roku nebo změním plán při ročním přezkumu)." },
    ], sampleAnswer: "Mimo plán si dovolím nejvýše 2 obchody ročně. Měsíční nákup ETF a vyvažování jednou ročně se nepočítají. Před každým obchodem mimo plán projdu checklist a zapíšu si důvod. Když rozpočet vyčerpám, další nápad si poznamenám a vrátím se k němu při ročním přezkumu IPS." },

    { id: "lab-bridge", type: "labBridge", title: "Obrat v Labu", content: "Krizový nácvik i Cvičné portfolio ukazují obrat ve zpětné vazbě k procesu. Lab ho počítá šířeji než tato lekce: všechny nákupy i prodeje vůči konečné, případně dnešní hodnotě portfolia, takže číslo vyjde vyšší. Porovnávej proto jen čísla spočítaná stejně. Když v Cvičném portfoliu uděláš pátý obchod za sedm dní, Lab ti připomene, ať zkontroluješ, jestli ho plán opravdu potřebuje. Hodnotí se, jestli se držíš plánu, ne kolik obchodů uděláš." },
    { id: "summary", type: "lessonSummary", title: "Každý obchod mimo plán potřebuje důvod", content: "Obrat = prodeje za rok ÷ průměrná hodnota portfolia. Náklady obchodů se násobí jejich počtem: 40 obchodů po 60 Kč je 2,4 % ročně ze 100 000 Kč. Ve výzkumu Barbera a Odeana vydělávaly nejaktivnější domácnosti před náklady skoro stejně jako ostatní, po nákladech výrazně méně. Pojistkou je rozpočet obratu v IPS a checklist před každým obchodem mimo plán." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · Barber a Odean, Trading Is Hazardous to Your Wealth: https://faculty.haas.berkeley.edu/odean/Papers%20current%20versions/Individual_Investor_Performance_Final.pdf · SEC, výzva k připomínkám k praktikám digitálního zapojení (Federal Register 2021): https://www.govinfo.gov/content/pkg/FR-2021-09-01/pdf/2021-18901.pdf · Tomáš a Jana jsou smyšlení, stejně jako částky a poplatky v příkladech. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
