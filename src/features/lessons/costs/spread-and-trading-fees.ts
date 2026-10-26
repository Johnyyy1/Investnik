import type { AuthoredLesson } from "../types";
import { costsLessons } from "./manifest";
const lesson = costsLessons.find((entry) => entry.id === "costs-spread-and-fees")!;

export const spreadAndTradingFeesLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "costs", slug: lesson.slug, title: lesson.title,
  eyebrow: "Poplatky a celkové náklady", position: 2, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Dva nákupy" }, { id: "spread", label: "Spread" }, { id: "worked", label: "Celkový náklad" }, { id: "frequency", label: "Frekvence" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Petra nakupuje burzovně obchodovaný fond (ETF) jednorázově za 50 000 Kč, Ondřej chce posílat 2 000 Kč měsíčně. Stejný fiktivní broker, stejné ETF, ceník 0,15 % z objemu, nejméně 60 Kč za obchod. K ceně patří i spread. Kdo zaplatí větší podíl své částky?" },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Co očekáváš u malého nákupu, když broker účtuje minimálně 60 Kč?", options: [
      { id: "same", label: "Oba zaplatí vždy 0,15 %.", misconception: "sazba bez minima", explanation: "Sazba platí jen do uplatnění minima. U malého obchodu může být minimum vyšší než vypočtené procento." },
      { id: "small", label: "Ondřejův menší nákup může mít vyšší náklad v procentech." },
      { id: "large", label: "Petra zaplatí vyšší podíl, protože nakupuje víc.", explanation: "Větší částka může mít vyšší poplatek v korunách, ale minimum tvoří větší podíl malé částky." },
    ], correctOptionId: "small", correctExplanation: "Pevné minimum se dělí menší částkou. Náklad v korunách a podíl v procentech proto porovnávej zvlášť.", incorrectExplanation: "Porovnej minimum s procentní sazbou a pak náklad vyděl objemem nákupu." },

    { id: "spread", type: "explanation", title: "Polovina spreadu proti středu kotace", content: "Modelový příklad · Nákupní nabídka (bid) je 99,95 Kč, prodejní nabídka (ask) 100,05 Kč za kus. Střed kotace je 100,00 Kč a celé rozpětí (spread) 0,10 Kč, tedy 0,10 % středu. Při okamžitém nákupu za ask zaplatíš oproti středu o 0,05 Kč za kus víc: polovinu spreadu. U prodeje za bid dostaneš proti středu o polovinu spreadu méně." },
    { id: "model-scope", type: "conceptCallout", title: "Co v lekci znamená objem", content: "Všechny částky obchodu počítáme ve středu kotace, bez poplatku. Polovina spreadu × tento objem je náklad vůči středu. Pokud máš rozpočet včetně ceny ask a poplatku, vyjde množství trochu jinak. Spread je už v ceně provedení, není to další položka stržená brokerem. Předpokládáme neměnnou kotaci, provedení celého množství a žádnou konverzi, daň ani skluz." },
    { id: "spread-practice", type: "numericQuestion", prompt: "Modelový příklad · Objem nákupu ve středu kotace je 40 000 Kč. Celý spread je 0,20 % středu. Kolik Kč stojí polovina spreadu? Zaokrouhli na celé Kč.", answer: 40, tolerance: 0.49, unit: "Kč", correctExplanation: "Polovina z 0,20 % je 0,10 %. Náklad je 40 000 × 0,001 = 40 Kč.", incorrectExplanation: "Nejdřív rozpůl spread, potom procenta převeď na desetinné číslo a vynásob objemem. Celý spread by odpovídal oběma stranám při stejné kotaci." },

    { id: "worked", type: "workedExample", title: "Modelový příklad · Petra a Ondřej", introduction: "Fiktivní ceník: 0,15 % z objemu, minimum 60 Kč, bez maxima. Celý spread 0,10 % středu. Každou složku zaokrouhlujeme na haléře, poloviny nahoru; procento celku na dvě desetinná místa.", steps: [
      { label: "Petra · objem 50 000 Kč", value: "Poplatek max(50 000 × 0,0015; 60) = 75 Kč" },
      { label: "Petra · polovina spreadu", value: "50 000 × 0,0005 = 25 Kč" },
      { label: "Petra · celkem", value: "75 + 25 = 100 Kč = 0,20 %", emphasis: true },
      { label: "Ondřej · objem 2 000 Kč", value: "Poplatek max(2 000 × 0,0015; 60) = 60 Kč" },
      { label: "Ondřej · polovina spreadu", value: "2 000 × 0,0005 = 1 Kč" },
      { label: "Ondřej · celkem", value: "60 + 1 = 61 Kč = 3,05 %", emphasis: true },
    ], conclusion: "Minimum zvedá Ondřejův podíl nákladů. To není horší výnos trhu, ale známý náklad při vstupu." },
    { id: "faded", type: "fadedExample", title: "Modelový příklad · doplň menší nákup", introduction: "Objem 4 000 Kč ve středu kotace, sazba 0,15 %, minimum 60 Kč, bez maxima. Celý spread 0,10 %.", steps: [
      { label: "Procentní poplatek", value: "4 000 × 0,0015 = 6 Kč" },
      { label: "Poplatek po minimu", value: "max(6; 60) = 60 Kč" },
      { label: "Polovina spreadu", value: "4 000 × 0,0005 = 2 Kč" },
    ], blank: { label: "Celkový náklad v Kč (na celé Kč)", input: "number", answer: 62, tolerance: 0.49, unit: "Kč" }, correctExplanation: "60 + 2 = 62 Kč, tedy 1,55 % objemu. Minimum převážilo nad procentním poplatkem.", incorrectExplanation: "Sečti poplatek po uplatnění minima a náklad poloviny spreadu, nikoli samotnou sazbu.", misconception: "zapomenuté minimum nebo celý spread" },
    { id: "total-practice", type: "multiNumericQuestion", prompt: "Modelový příklad · Nový nákup: objem ve středu kotace 3 000 Kč, sazba 0,15 %, minimum 60 Kč, bez maxima. Celý spread je 0,10 %. Spočítej celkový náklad v Kč a jako procento objemu. Oba výsledky zaokrouhli na dvě desetinná místa.", answers: [
      { id: "czk", label: "Celkový náklad", answer: 61.5, tolerance: 0.0049, unit: "Kč" },
      { id: "percent", label: "Podíl z objemu", answer: 2.05, tolerance: 0.0049, unit: "%" },
    ], correctExplanation: "3 000 × 0,0015 = 4,50 Kč, takže platí minimum 60 Kč. Polovina spreadu stojí 3 000 × 0,0005 = 1,50 Kč. Celkem 61,50 Kč; 61,50 ÷ 3 000 × 100 = 2,05 %.", incorrectExplanation: "Porovnej procentní poplatek s minimem. Přidej polovinu spreadu a teprve součet vyděl objemem a vynásob 100." },

    { id: "frequency", type: "workedExample", title: "Modelový příklad · čtvrtletní nákup", introduction: "Ondřej může stejných 2 000 Kč měsíčně seskupit do nákupu 6 000 Kč jednou za čtvrtletí. Ceník a spread zůstávají stejné, cenu pro srovnání držíme stálou.", steps: [
      { label: "Poplatek", value: "max(6 000 × 0,0015; 60) = 60 Kč" },
      { label: "Polovina spreadu", value: "6 000 × 0,0005 = 3 Kč" },
      { label: "Celkem", value: "63 Kč = 1,05 %", emphasis: true },
      { label: "Tři měsíční nákupy", value: "3 × 61 = 183 Kč oproti 63 Kč čtvrtletně" },
    ], conclusion: "Náklad klesá, ale první a druhý měsíční vklad čekají déle v hotovosti. Cena může během čekání růst i klesat. Úspora nákladů sama nezaručuje vyšší výnos. Další možnost je porovnat fiktivní plán bez minima a jeho ostatní podmínky." },
    { id: "frequency-decision", type: "multipleChoiceQuestion", prompt: "Jak může Ondřej snížit náklad v procentech u pravidelných 2 000 Kč s minimem 60 Kč?", options: [
      { id: "split", label: "Rozdělit 2 000 Kč do čtyř menších nákupů.", explanation: "Každý nákup znovu spustí minimum. Rozdělení zde náklady zvyšuje." },
      { id: "batch", label: "Porovnat méně časté větší nákupy s plánem bez minima a zvážit čekání i další náklady." },
      { id: "limit", label: "Vždy zadat limitní pokyn; ten zaručeně odstraní spread i poplatek.", misconception: "limit zaručuje bezplatné provedení", explanation: "Limit omezuje přijatelnou cenu. Nezaručuje provedení ani odpuštění poplatku." },
    ], correctOptionId: "batch", correctExplanation: "Větší částka rozloží minimum do menšího procenta. Plán bez minima může pomoci také, ale porovnej všechny náklady. Čekání ponechá peníze déle mimo trh.", incorrectExplanation: "Zaměř se na minimum účtované za každý obchod. Limitní pokyn určuje cenu, ne zrušení ceníku." },
    { id: "explorer", type: "interactiveFigure", figure: "trade-cost-breakdown", title: "Vyzkoušej rozpad nákladů", description: "Modelový příklad · Změň částku, sazbu, minimum, maximum a celý spread. Výsledek slouží k průzkumu, ne k hodnocení ani k pokynu v Labu." },
    { id: "sale", type: "conceptCallout", title: "Prodej má druhou polovinu příběhu", content: "Při prodeji za bid vzniká vůči tehdejšímu středu znovu náklad poloviny spreadu a případný poplatek za prodej podle ceníku. Pokud by nákup i prodej proběhly při stejné kotaci, dohromady zaplatíš celý spread a dva poplatky. V čase se kotace i spread mění. Limitní pokyn může zlepšit cenu, ale nemusí se vůbec provést." },
    { id: "recall", type: "multipleChoiceQuestion", prompt: "Proč má v našem ceníku malý nákup vyšší náklad v procentech?", options: [
      { id: "minimum", label: "Pevné minimum tvoří větší podíl malé částky." },
      { id: "spread", label: "Spread v procentech je u každého menšího nákupu automaticky vyšší.", explanation: "V tomto modelu držíme spread v procentech stejný. Rozdíl vytváří minimální poplatek." },
      { id: "once", label: "Velký nákup platí spread jen při prodeji.", explanation: "Nákup za ask i prodej za bid mají náklad proti středu bez ohledu na velikost obchodu." },
    ], correctOptionId: "minimum", correctExplanation: "Stejných 60 Kč dělených menším objemem znamená vyšší procento. Sazba spreadu přitom může zůstat stejná.", incorrectExplanation: "Rozliš pevné minimum v Kč a sazbu v %. Které z nich po vydělení menším objemem naroste?" },
    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách vysvětli, jak před pravidelným nákupem porovnáš náklady a frekvenci. Přidej vlastní kontrolní pravidlo, bez předpovědi směru trhu.", rubric: [
      { id: "cost", text: "Porovnám poplatek po minimu a maximu s polovinou spreadu v Kč i v %." },
      { id: "tradeoff", text: "Zmíním čekání v hotovosti a nejistou budoucí cenu." },
      { id: "rule", text: "Stanovím kontrolu ceníku a celkového nákladu před potvrzením, včetně prodeje." },
    ], sampleAnswer: "Před nákupem spočítám poplatek po minimu a přidám polovinu spreadu vůči středu. Srovnám měsíční a méně častý nákup i plán bez minima, ale neslibuji si lepší výnos z čekání. Před potvrzením vždy zkontroluji ceník, konverzi a celkové procento nákladů; stejnou kontrolu udělám při prodeji." },
    { id: "lab-bridge", type: "labBridge", title: "Kontrola před potvrzením", content: "V Portfolio Labu kontrola pokynu ukazuje poplatek za obchod a přirážku měnové konverze podle zvoleného fiktivního profilu; čísla počítá server. Bid/ask spread ani skluz zatím nemodeluje, protože nemá potřebnou kotaci. Chybějící spread neznamená nulový skutečný náklad. Při nácviku stačí náklady zkontrolovat, obchod nemusíš potvrdit." },
    { id: "summary", type: "lessonSummary", title: "Srovnávej celý náklad", content: "Náklad jedné strany vůči středu kotace = poplatek po minimu a maximu + polovina spreadu. Počítej Kč i procento objemu. Větší méně častý nákup může rozložit minimum, ale vyžaduje čekání. Prodej má své náklady a limitní pokyn nezaručuje provedení. Do plánu si dej kontrolu ceníku a celkových nákladů před potvrzením." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · FINRA, Fees and Commissions: https://www.finra.org/investors/investing/investing-basics/fees-commissions · Investor.gov, Types of Orders: https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders · Investor.gov, Exchange-Traded Funds: https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2 · Částky a ceník jsou fiktivní, ne nabídka brokera. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
