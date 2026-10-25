import type { AuthoredLesson, LessonBlock, StepDefinition } from "../types";
import { foundationsLessons } from "./manifest";

const definition = foundationsLessons.find((lesson) => lesson.id === "foundations-checkpoint")!;

/** Fixed Czech measurement wording for #124/#130. IDs and option order are part of the instrument. */
export const bigThreeQuestions = [
  {
    id: "big-three-compounding", type: "multipleChoiceQuestion",
    prompt: "Na spořicím účtu máš 10 000 Kč s úrokem 2 % ročně. Kolik tam budeš mít po 5 letech, když nic nevybereš?",
    options: [{ id: "more", label: "více než 10 200 Kč" }, { id: "exactly", label: "přesně 10 200 Kč" }, { id: "less", label: "méně než 10 200 Kč" }, { id: "unknown", label: "nevím" }],
    correctOptionId: "more",
    correctExplanation: "Úrok se v modelu připisuje každý rok i z dřívějších úroků: 10 000 × 1,02⁵ ≈ 11 041 Kč. To je více než 10 200 Kč. Daně ani poplatky model nezahrnuje.",
    incorrectExplanation: "10 200 Kč odpovídá jen prvnímu roku. Za pět let se úročí i dřívější úroky; částka je vyšší. Pokud nevíš, zopakuj si složené zhodnocení.",
    reviewHref: "/learn/investing-foundations/risk-vs-reward",
  },
  {
    id: "big-three-inflation", type: "multipleChoiceQuestion",
    prompt: "Úrok na účtu je 1 % ročně a inflace 2 % ročně. Kolik si za peníze z účtu koupíš za rok?",
    options: [{ id: "more", label: "víc než dnes" }, { id: "same", label: "stejně" }, { id: "less", label: "méně" }, { id: "unknown", label: "nevím" }],
    correctOptionId: "less",
    correctExplanation: "Ceny v modelu rostou rychleji než zůstatek. Poměr 1,01 / 1,02 je menší než jedna: koupíš si méně, přestože počet korun vzroste.",
    incorrectExplanation: "Odliš počet korun od kupní síly. Zůstatek vzroste o 1 %, ale ceny o 2 %, takže si koupíš méně. Zopakuj si inflaci.",
    reviewHref: "/learn/investing-foundations/why-invest",
  },
  {
    id: "big-three-diversification", type: "multipleChoiceQuestion",
    prompt: "Je pravda, že nákup akcie jedné firmy je obvykle bezpečnější než nákup podílu ve fondu s mnoha akciemi?",
    options: [{ id: "true", label: "pravda" }, { id: "false", label: "nepravda" }, { id: "unknown", label: "nevím" }],
    correctOptionId: "false",
    correctExplanation: "Mnoho různých akcií omezuje dopad potíží jediné firmy. Fond ale může být koncentrovaný a diverzifikace neodstraňuje pokles celého trhu ani nezaručuje zisk.",
    incorrectExplanation: "Jedna firma znamená soustředěné firemní riziko. Fond s mnoha různými akciemi ho obvykle rozkládá; tržní riziko zůstává. Zopakuj si diverzifikaci.",
    reviewHref: "/learn/investing-foundations/your-first-portfolio",
  },
] satisfies LessonBlock[];

/** Draft until #163, measurement capture (#130) and editorial review are ready. No public progress/rewards. */
export const foundationsCheckpointLesson: AuthoredLesson = {
  id: definition.id, slug: definition.slug, moduleSlug: "investing-foundations", title: definition.title,
  eyebrow: "Investiční základy", position: 10, estimatedMinutes: definition.estimatedMinutes,
  sections: [{ id: "opening", label: "Smíšené ověření" }, { id: "summary", label: "Další krok" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelové příklady · Ověříš si principy napříč investičními základy. Každou otázku je potřeba vyřešit správně; po chybě můžeš odpověď opravit. U tří otázek Big Three můžeš zvolit nevím a vrátit se k příslušné lekci. Čísla, kurzy a přehled fondů jsou smyšlené, bez daní a poplatků, pokud zadání neříká jinak. Výsledek není potvrzením připravenosti investovat skutečné peníze." },
    bigThreeQuestions[0],
    { id: "position-value", type: "numericQuestion", prompt: "Modelový příklad · Držíš 4 akcie Firmy A po 50 USD. Kurz je 21 Kč za USD. Jaká je hodnota pozice v Kč bez poplatků?", answer: 4200, tolerance: 0.005, unit: "Kč",
      correctExplanation: "4 × 50 × 21 = 4 200 Kč. Cena jedné akcie není hodnota celé pozice; tu navíc převádíš do korun.", incorrectExplanation: "Vynásob počet akcií cenou v USD a pak kurzem v Kč za USD. Nezaměň cenu kusu za hodnotu pozice.", reviewHref: "/learn/investing-foundations/stocks" },
    bigThreeQuestions[1],
    { id: "index-etf", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Chceš získat podíl ve fondu sledujícím široký akciový index. Které tvrzení rozlišuje index a ETF správně?",
      options: [{ id: "index", label: "Koupím přímo číslo indexu; fond nepotřebuji." }, { id: "fund", label: "Index je ukazatel; koupit mohu podíl v ETF, které ho sleduje." }, { id: "guarantee", label: "ETF musí každý rok vydělat přesně tolik co index bez ohledu na náklady." }], correctOptionId: "fund",
      correctExplanation: "Index je pravidlový ukazatel. ETF je fond; jeho výsledek ovlivňují náklady a odchylka od indexu.", incorrectExplanation: "Samotný ukazatel není podíl ve fondu. ETF index sleduje, ale nezaručuje přesnou shodu ani zisk.", reviewHref: "/learn/investing-foundations/etfs-and-indexes" },
    { id: "bond-rates", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Tržní sazby vzrostly. Co se obvykle stane s tržní cenou již vydaného dluhopisu s pevným kupónem při jinak stejných podmínkách?",
      options: [{ id: "rise", label: "Cena obvykle vzroste." }, { id: "fall", label: "Cena obvykle klesne." }, { id: "fixed", label: "Cena se nemůže změnit, protože kupón je pevný." }], correctOptionId: "fall",
      correctExplanation: "Nové dluhopisy nabízejí vyšší sazby, takže starší nižší kupón je méně atraktivní. Jeho tržní cena obvykle klesá; pevný kupón neznamená pevnou cenu.", incorrectExplanation: "Porovnej starý pevný kupón s novými vyššími sazbami. Starší dluhopis bývá atraktivní až za nižší cenu. Jde o tržní cenu, nikoli změnu kupónu.", reviewHref: "/learn/investing-foundations/bonds-and-cash" },
    bigThreeQuestions[2],
    { id: "spread", type: "numericQuestion", prompt: "Modelový příklad · Nejvyšší nabídka kupujícího (bid) je 249,50 Kč a nejnižší nabídka prodávajícího (ask) 250,10 Kč. Nákup by proběhl na straně ask. Jaký je rozdíl ask − bid (spread)? Uveď Kč na dvě desetinná místa.", answer: 0.6, tolerance: 0.005, unit: "Kč",
      correctExplanation: "250,10 − 249,50 = 0,60 Kč. Při okamžitém nákupu platíš ask; při okamžitém prodeji dostáváš bid. Rozdíl není samostatný poplatek brokera.", incorrectExplanation: "Odečti bid od ask, nikoli obráceně: 250,10 − 249,50. Pro nákup vybíráš nabídku prodávajícího, tedy ask.", reviewHref: "/learn/investing-foundations/how-markets-work" },
    { id: "compounded-value", type: "numericQuestion", prompt: "Modelový příklad · Pozice má hodnotu 200 Kč. Nejdřív klesne o 10 % a pak vzroste o 10 %. Bez vkladů a výběrů: jakou má konečnou hodnotu? Uveď celé Kč.", answer: 198, tolerance: 0.5, unit: "Kč",
      correctExplanation: "200 × 0,90 × 1,10 = 198 Kč. Růst počítáš z menšího základu, proto se stejné procento poklesu a růstu nevyruší.", incorrectExplanation: "Procenta nesčítej. Po poklesu zbývá 180 Kč a dalších 10 % se počítá z této částky, ne z původních 200 Kč.", reviewHref: "/learn/investing-foundations/risk-vs-reward" },
    { id: "portfolio-weight", type: "numericQuestion", prompt: "Modelový příklad · Pozice má hodnotu 3 000 Kč z celého portfolia 12 000 Kč včetně hotovosti. Jaká je její váha v procentech? Uveď celé procento.", answer: 25, tolerance: 0.5, unit: "%",
      correctExplanation: "3 000 / 12 000 × 100 = 25 %. Do jmenovatele patří celé portfolio včetně hotovosti, ne jen akciové pozice.", incorrectExplanation: "Vyděl hodnotu pozice hodnotou celého portfolia a vynásob stem. Část portfolia není další vklad ani výnos.", reviewHref: "/learn/investing-foundations/your-first-portfolio" },
    { id: "entry-fee", type: "numericQuestion", prompt: "Modelový příklad · Posíláš 24 000 Kč do fondu. Vstupní poplatek činí 2,5 % z poslané částky a odečte se před investováním. Kolik Kč se skutečně investuje? Uveď celé Kč.", answer: 23400, tolerance: 0.5, unit: "Kč",
      correctExplanation: "Poplatek je 24 000 × 0,025 = 600 Kč. Investuje se 24 000 − 600 = 23 400 Kč. Průběžné náklady by se posuzovaly zvlášť.", incorrectExplanation: "Nejdřív spočítej 2,5 % z poslaných 24 000 Kč, potom poplatek odečti. Otázka se ptá na investovanou částku, ne samotný poplatek.", reviewHref: "/learn/investing-foundations/funds" },
    { id: "report-interpretation", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Fiktivní přehled ve stylu SPIVA uvádí: 72 ze 100 aktivních fondů ve stejné kategorii za dané desetiletí zaostalo po nákladech za srovnávacím indexem. Co z toho plyne?",
      options: [{ id: "all", label: "Každý aktivní fond vždy zaostane." }, { id: "probability", label: "V tomto vzorku a období zaostala většina; neurčuje to vítěze příštího desetiletí." }, { id: "winner", label: "Stačí vybrat minulého vítěze a budoucí nadvýnos mám jistý." }], correctOptionId: "probability",
      correctExplanation: "Jde o četnost v konkrétním vzorku, kategorii a období po nákladech, nikoli předpověď konkrétního fondu. Skutečný přehled vyžaduje kontrolu metodiky včetně zaniklých fondů. Čísla zde nejsou výsledkem skutečné studie SPIVA.", incorrectExplanation: "Výsledek skupiny v minulosti není záruka pro jednotlivý fond ani budoucí období. V tomto modelu zaostala většina, ne všechny fondy.", reviewHref: "/learn/investing-foundations/funds" },
    { id: "reflection", type: "writtenReflection", prompt: "Vyber princip, u kterého ještě váháš. Ve 2–4 větách ho vysvětli vlastními slovy a napiš, co příště před rozhodnutím zkontroluješ. Neuváděj osobní údaje.", rubric: [{ id: "principle", text: "Vysvětlím princip i jeho omezení." }, { id: "safeguard", text: "Zvolím konkrétní kontrolu před rozhodnutím." }], sampleAnswer: "Stejný procentní pokles a růst se nevyruší, protože se mění základ. Před porovnáním výsledků spočítám násobení změn a oddělím vlastní vklady. Minulý výsledek není záruka budoucího." },
    { id: "summary", type: "lessonSummary", title: "Principy propojuj, nehádej výnos", content: "Spoj kupní sílu, složené zhodnocení, diverzifikaci, měnu a náklady do jednoho rozhodnutí. Chybná odpověď je důvod vrátit se k příslušné lekci a později si princip vybavit znovu. Samotné opravení odpovědí není důkazem dlouhodobého zvládnutí. Laboratoř zůstává cvičením; dokončení této kontroly nemění podmínky jejího odemčení." },
  ],
};

export const foundationsCheckpointSteps: readonly StepDefinition[] = [
  { title: "Ověření napříč základy", blocks: ["opening"] },
  ...["big-three-compounding", "position-value", "big-three-inflation", "index-etf", "bond-rates", "big-three-diversification", "spread", "compounded-value", "portfolio-weight", "entry-fee", "report-interpretation"].map((id, index) => ({ title: `Otázka ${index + 1} z 11`, kind: "mastery" as const, blocks: [id] })),
  { title: "Moje pojistka", blocks: ["reflection"] },
  { title: "Co si odneseš", blocks: ["summary"] },
];
