import type { AuthoredLesson } from "../types";
import { investorBehaviourLessons } from "./manifest";
const lesson = investorBehaviourLessons.find((entry) => entry.id === "behaviour-disposition-effect")!;

/** Model portfolio for the "raise 20 000 Kč" decision: amounts in Kč, target weights in % of the value after the sale. */
export const dispositionScenario = {
  need: 20_000,
  positions: [
    { id: "A", name: "ETF akcie svět", cost: 40_000, value: 52_000, target: 40 },
    { id: "B", name: "ETF akcie Evropa", cost: 6_000, value: 8_000, target: 10 },
    { id: "C", name: "ETF malé firmy", cost: 7_000, value: 8_000, target: 10 },
    { id: "D", name: "ETF rozvíjející se trhy", cost: 15_000, value: 12_000, target: 15 },
    { id: "E", name: "ETF dluhopisy", cost: 13_000, value: 12_000, target: 15 },
    { id: "F", name: "ETF nemovitostní firmy", cost: 12_000, value: 8_000, target: 10 },
  ],
} as const;

const kc = (amount: number) => `${amount.toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;
const percent = (value: number) => `${Math.round(value)} %`;

/** Consequence of selling `sales` (Kč per position): PGR and PLR by position count (Odean 1998) and the largest drift from target. */
function consequenceRows(sales: Partial<Record<string, number>>) {
  const { positions } = dispositionScenario;
  const realised = (gain: boolean) => {
    const group = positions.filter((position) => (position.value > position.cost) === gain);
    const sold = group.filter((position) => sales[position.id]).length;
    return `${sold} z ${group.length} = ${percent(sold / group.length * 100)}`;
  };
  const total = positions.reduce((sum, position) => sum + position.value - (sales[position.id] ?? 0), 0);
  const drift = positions.map((position) => ({ position, weight: (position.value - (sales[position.id] ?? 0)) / total * 100 }))
    .reduce((worst, entry) => Math.abs(entry.weight - entry.position.target) > Math.abs(worst.weight - worst.position.target) ? entry : worst);
  return [
    { label: "Prodej", value: positions.filter((position) => sales[position.id]).map((position) => `${position.id} ${kc(sales[position.id]!)}`).join(" + ") },
    { label: "PGR · prodané pozice v zisku", value: realised(true) },
    { label: "PLR · prodané pozice ve ztrátě", value: realised(false) },
    { label: "Největší odchylka od cílové váhy", value: drift.weight === drift.position.target ? "Žádná, všechny pozice jsou na cíli" : `${drift.position.id}: ${percent(drift.weight)} místo ${drift.position.target} %` },
  ];
}

export const dispositionEffectLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "investor-behaviour", slug: lesson.slug, title: lesson.title,
  eyebrow: "Investor v zrcadle", position: 3, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Rozhodnutí" }, { id: "explain", label: "PGR a PLR" }, { id: "research", label: "Výzkum" }, { id: "purchase-price", label: "Nákupní cena" }, { id: "decision", label: "Podle plánu" }, { id: "safeguard", label: "Pojistka" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Marek má v portfoliu 100 000 Kč v šesti fondech: tři jsou v zisku, tři ve ztrátě. Potřebuje uvolnit 20 000 Kč na opravu auta. Ve svém investičním plánu (IPS) má cílové váhy jednotlivých fondů. Rozhodni za něj, co prodá. Žádná volba se nehodnotí; podívej se na důsledky a klidně zkus i ostatní." },
    { id: "scenario", type: "personaDecision",
      persona: { name: "Marek", age: 36, need: `Potřebuje ${kc(dispositionScenario.need)}. Hodnota portfolia je ${kc(dispositionScenario.positions.reduce((sum, position) => sum + position.value, 0))}.`, facts: dispositionScenario.positions.map((position) => ({
        label: `${position.id} · ${position.name}`, value: kc(position.value),
        detail: `${position.value > position.cost ? "Zisk" : "Ztráta"} ${kc(Math.abs(position.value - position.cost))} · koupeno za ${kc(position.cost)} · cíl ${position.target} %`,
      })) },
      note: { title: "Proč cílová váha „po prodeji“", content: "Po výběru zbude v portfoliu 80 000 Kč. Cílové váhy z IPS („cíl“ u každého fondu) se vztahují k této nové hodnotě." },
      prompt: "Simulace · Co má Marek prodat, aby získal 20 000 Kč?",
      options: [
        { id: "winners", label: "Zamknout zisk: prodat celé B a C a zbytek z A", consequence: { lead: "Prodáno 3 ze 3 pozic v zisku", content: "Zisk je „v bezpečí“, ztrátové pozice čekají, až se vrátí. Portfolio se ale vzdálilo od plánu: B a C zmizely a A zůstává nad cílem.", rows: consequenceRows({ A: 4_000, B: 8_000, C: 8_000 }) } },
        { id: "losers", label: "Zbavit se ztrát: prodat celé D a F", consequence: { lead: "Prodáno 2 ze 3 pozic ve ztrátě", content: "Opačný extrém: rozhodnutí opět stojí na nákupní ceně. D a F z portfolia zmizely a A je ještě víc nad cílem.", rows: consequenceRows({ D: 12_000, F: 8_000 }) } },
        { id: "plan", label: "Podle plánu: prodat 20 000 Kč z A, která je nad cílovou vahou", consequence: { lead: "Všechny pozice jsou zpět na cíli", content: "Prodej vybrala odchylka od cílové váhy, ne zisk ani ztráta. Že je A v zisku, je vedlejší: pozice, která rostla nejvíc, často jako první přeroste svůj cíl.", rows: consequenceRows({ A: 20_000 }) } },
      ],
      disclaimer: "Fondy, částky i cílové váhy jsou vymyšlené. Daně a poplatky model nepočítá; daňovou stránku probereme zvlášť.",
    },

    { id: "explain", type: "explanation", title: "Dispoziční efekt", content: "Dispoziční efekt (anglicky disposition effect) je sklon prodávat pozice v zisku příliš brzy a ztrátové držet příliš dlouho. Prodej vítěze přináší dobrý pocit, že jsme měli pravdu; prodej poraženého znamená přiznat chybu. Nákupní cena se tak stane kotvou, i když trh ani budoucí výnos fondu o ní nic neví. Ekonom Terrance Odean ho změřil dvěma podíly počítanými podle počtu pozic." },
    { id: "formula", type: "formula", expression: "PGR = RZ ÷ (RZ + NZ); PLR = RL ÷ (RL + NL)", latex: "\\text{PGR} = \\frac{RZ}{RZ + NZ} \\qquad \\text{PLR} = \\frac{RL}{RL + NL}", variables: [
      { symbol: "RZ", description: "Realizované zisky: počet prodaných pozic, které byly v zisku" },
      { symbol: "NZ", description: "Nerealizované zisky: počet pozic v zisku, které zůstaly v portfoliu" },
      { symbol: "RL", description: "Realizované ztráty: počet prodaných pozic, které byly ve ztrátě" },
      { symbol: "NL", description: "Nerealizované ztráty: počet pozic ve ztrátě, které zůstaly v portfoliu" },
    ] },
    { id: "explain-meaning", type: "conceptCallout", title: "Jak číst PGR a PLR", content: "PGR (proportion of gains realized) je podíl zisků, které investor proměnil v prodej; PLR (proportion of losses realized) totéž pro ztráty. Když je PGR dlouhodobě vyšší než PLR, investor prodává vítěze ochotněji než poražené. Jedno rozhodnutí efekt neprokazuje: i prodej podle plánu může prodat vítěze, protože vítěz často přeroste svou cílovou váhu. Vypovídá až vzorec mnoha prodejů a jejich důvody." },

    { id: "pgr-practice", type: "multiNumericQuestion", prompt: "Modelový příklad · Máš 3 pozice v zisku a 3 ve ztrátě. Ze 3 pozic v zisku prodáš 2, ze 3 ztrátových žádnou. Jaké je PGR a PLR? Zaokrouhli na celá procenta.", answers: [
      { id: "pgr", label: "PGR", answer: 2 / 3 * 100, tolerance: 0.5, unit: "%" },
      { id: "plr", label: "PLR", answer: 0, tolerance: 0.5, unit: "%" },
    ], correctExplanation: "PGR = 2 ÷ (2 + 1) = 67 %. PLR = 0 ÷ (0 + 3) = 0 %. PGR je vyšší než PLR: v tomto prodeji se zisky realizovaly a ztráty zůstaly.", incorrectExplanation: "Pro PGR vyděl počet prodaných pozic v zisku všemi pozicemi v zisku (prodanými i ponechanými). PLR spočítej stejně pro ztráty." },

    { id: "research", type: "conceptCallout", title: "Výzkum · investoři neradi realizují ztráty", content: "Terrance Odean prošel obchody 10 000 účtů u amerického diskontního brokera z let 1987–1993. Ve dnech, kdy investor něco prodal, realizoval {{odean.pgr}} svých pozic v zisku, ale jen {{odean.plr}} pozic ve ztrátě. Pozice v zisku tak měla o polovinu větší šanci, že ji investor prodá. Prodeje se nedaly vysvětlit vyvažováním portfolia a prodaní vítězové pak v průměru vydělali víc než ponechaní poražení. Jde o Spojené státy a jednotlivé akcie, ne o českého investora do ETF." },
    { id: "research-why", type: "multipleChoiceQuestion", prompt: "PGR v Odeanově studii bylo {{odean.pgr}}, PLR {{odean.plr}}. Co to znamená?", options: [
      { id: "half", label: "Pozice v zisku se v den prodeje prodávala zhruba o polovinu častěji než pozice ve ztrátě." },
      { id: "twice", label: "Pozice v zisku se prodávala zhruba dvakrát častěji.", misconception: "dvakrát častěji", explanation: "Vyděl PGR číslem PLR: poměr vyjde zhruba 1,5, ne 2. Tvrzení „dvakrát častěji“ se často opakuje, ale tato studie ho nepodporuje." },
      { id: "most", label: "Investoři prodali většinu svých ziskových pozic.", misconception: "PGR jako většina", explanation: "PGR je menší než polovina. Investoři většinu ziskových pozic drželi dál; jen je prodávali ochotněji než ztrátové." },
    ], correctOptionId: "half", correctExplanation: "PGR ÷ PLR vyjde zhruba 1,5. Pozice v zisku měla o polovinu větší šanci na prodej než pozice ve ztrátě. Časté tvrzení „dvakrát častěji“ tato studie nepodporuje.", incorrectExplanation: "Vyděl PGR číslem PLR. Kolikrát je jeden podíl větší než druhý?" },

    { id: "purchase-price", type: "explanation", title: "Na nákupní ceně trhu nezáleží", content: "Nákupní cena říká, kolik pozice stála v minulosti. Na budoucí výnos fondu nemá vliv: fond tvou nákupní cenu nezná a nepotřebuje se na ni „vrátit“. Užitečná otázka zní: Dává podle mého plánu smysl mít tuhle pozici dnes v této velikosti? Prodávej podle odchylky od cílové alokace v IPS, podle potřeby hotovosti a podle změny důvodu, proč pozici držíš. Ne podle toho, jestli je v zisku." },
    { id: "misconceptions", type: "conceptCallout", title: "Časté omyly", content: "„Zisk si musím zamknout.“ Prodej zisk jen převede na hotovost; sám o sobě nic nechrání a portfolio vzdálí od plánu. „Dokud neprodám, ztráta není skutečná.“ Hodnota pozice je dnes nižší, ať prodáš, nebo ne. „Počkám, až se vrátí na nákupní cenu.“ Trh nákupní cenu nezná; čekání je sázka na tuhle pozici, ne pojistka." },
    { id: "tax", type: "conceptCallout", title: "Kdy na datu nákupu záleží: daně", content: "Vzdělávací obsah, ne daňové poradenství. V Česku může být zisk z prodeje cenných papírů za zákonných podmínek osvobozený, mimo jiné podle toho, jak dlouho jednotlivou tranši držíš (takzvaný časový test). Datum a cena nákupu proto můžou rozhodnout, ze které tranše prodat, a prodej podle tranší může mít daňový smysl. Daň je ale důvod vybrat, kterou tranši prodat, ne důvod „zamknout zisk“ nebo držet ztrátu. Konkrétní pravidla probere daňový modul." },

    { id: "decision", type: "multipleChoiceQuestion", prompt: "Modelový příklad · Potřebuješ hotovost. Akciové ETF je nad cílovou vahou z IPS a je v zisku; dluhopisové ETF je pod cílem a ve ztrátě. Podle čeho vybereš, co prodat?", options: [
      { id: "target", label: "Podle odchylky od cílové alokace: prodám nejdřív to, co je nad cílem." },
      { id: "gain", label: "Prodám akciové ETF, protože je v zisku a zisk chci mít v bezpečí.", misconception: "zamknout zisk", explanation: "Ve výsledku prodáš stejný fond, ale z nesprávného důvodu. Kdyby bylo akciové ETF pod cílem, stejné pravidlo by tě vedlo plán rozbít." },
      { id: "wait", label: "Prodám dluhopisové ETF, až se vrátí na nákupní cenu.", misconception: "čekání na nákupní cenu", explanation: "Hotovost potřebuješ teď a dluhopisy jsou pod cílem. Nákupní cena tu nemá žádnou roli; prodej by portfolio od plánu ještě víc vzdálil." },
    ], correctOptionId: "target", correctExplanation: "Odchylka od cílové alokace je pravidlo, které platí stejně v zisku i ve ztrátě. Prodej toho, co je nad cílem, uvolní hotovost a zároveň vrátí portfolio blíž k plánu. Daň může rozhodnout jen o tom, kterou tranši prodat.", incorrectExplanation: "Hledej pravidlo, které by vedlo ke stejnému rozhodnutí, ať je fond v zisku, nebo ve ztrátě." },

    { id: "recall", type: "multipleChoiceQuestion", prompt: "Co je dispoziční efekt?", options: [
      { id: "sell-winners", label: "Sklon prodávat pozice v zisku příliš brzy a ztrátové držet příliš dlouho." },
      { id: "rebalance", label: "Prodej pozice, která přerostla cílovou váhu v plánu.", misconception: "vyvažování = dispoziční efekt", explanation: "To je vyvažování podle plánu. Rozhoduje odchylka od cíle, ne zisk nebo ztráta." },
      { id: "tax-lot", label: "Výběr tranše k prodeji podle daňových pravidel.", misconception: "daňové rozhodnutí", explanation: "Výběr tranše podle daní má věcný důvod. Dispoziční efekt je rozhodování podle toho, jestli je pozice nad nákupní cenou." },
    ], correctOptionId: "sell-winners", correctExplanation: "Dispoziční efekt staví prodej na nákupní ceně: vítězové se prodávají, aby se „zamkl zisk“, poražení se drží, aby se nemusela přiznat ztráta. Odean ho měří porovnáním PGR a PLR.", incorrectExplanation: "Hledej popis, ve kterém o prodeji rozhoduje, jestli je pozice v zisku, nebo ve ztrátě." },

    { id: "safeguard", type: "explanation", title: "Pravidla prodeje sepsaná předem", content: "Pojistka proti dispozičnímu efektu je rozhodnout o prodeji předem a bez ohledu na nákupní cenu. Do IPS si zapiš, kdy prodáváš: při vyvažování podle odchylky od cílové alokace, když potřebuješ hotovost, nebo když přestal platit důvod, proč pozici držíš. Vyber pravidla, která chceš mít ve svém checklistu před prodejem, a ulož ho." },
    { id: "checklist", type: "checklist", title: "Moje pravidla pro prodej", items: [
      { id: "target", label: "Prodávám nejdřív to, co je nejvíc nad cílovou vahou v IPS." },
      { id: "today", label: "U každé pozice se ptám: dává smysl ji dnes držet v této velikosti?" },
      { id: "no-anchor", label: "Při rozhodování se nedívám na nákupní cenu ani na zisk či ztrátu pozice." },
      { id: "tax", label: "Daně řeším až při výběru tranše, ne při rozhodnutí, co prodat." },
      { id: "reason", label: "Důvod prodeje si zapíšu jednou větou." },
    ] },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách napiš své pravidlo pro prodej: kdy prodáváš, podle čeho vybereš, co prodat, a jakou roli hraje nákupní cena. Pak text porovnej s kritérii.", rubric: [
      { id: "when", text: "Kdy: prodej spouští potřeba hotovosti, vyvažování nebo změna důvodu držení." },
      { id: "what", text: "Co: vybírám podle odchylky od cílové alokace v IPS." },
      { id: "anchor", text: "Kotva: nákupní cena ani zisk či ztráta o prodeji nerozhodují." },
      { id: "tax", text: "Daně: datum a cena nákupu můžou rozhodnout jen o tom, kterou tranši prodat." },
    ], sampleAnswer: "Prodávám, když potřebuju hotovost, při ročním vyvažování nebo když přestane platit důvod, proč pozici držím. Prodám nejdřív to, co je nejvíc nad cílovou vahou v IPS. Na nákupní cenu se při tom nedívám. Až když vím, co prodám, zkontroluju, kterou tranši prodat kvůli daním." },

    { id: "lab-bridge", type: "labBridge", title: "Nákupní cena v Labu", content: "Cvičné portfolio ukazuje u každé pozice nákupní cenu a nerealizovaný zisk nebo ztrátu, stejně jako aplikace brokerů. Když prodáváš pozici v zisku a zároveň držíš ztrátové, Lab ti před potvrzením připomene, ať rozhoduješ podle plánu, ne podle nákupní ceny. Prodej tím není zakázaný a jeden prodej chybu neprokazuje. Hodnotí se, jestli se držíš plánu, ne zisk." },
    { id: "summary", type: "lessonSummary", title: "Prodávej podle plánu, ne podle nákupní ceny", content: "Dispoziční efekt je sklon prodávat vítěze a držet poražené. Měří se podíly PGR a PLR: prodané pozice v zisku a ve ztrátě vůči všem pozicím v zisku a ve ztrátě. V Odeanově studii se pozice v zisku prodávala zhruba o polovinu častěji. Nákupní cena budoucí výnos neovlivní; o prodeji rozhoduje odchylka od cílové alokace, potřeba hotovosti a důvod držení. Daně můžou rozhodnout jen o tom, kterou tranši prodat." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · Odean, Are Investors Reluctant to Realize Their Losses? (Journal of Finance, 1998): https://doi.org/10.1111/0022-1082.00072 · Shefrin a Statman, The Disposition to Sell Winners Too Early and Ride Losers Too Long (Journal of Finance, 1985): https://doi.org/10.1111/j.1540-6261.1985.tb05002.x · Portfolio, fondy a částky v příkladech jsou vymyšlené. Vzdělávací obsah, ne investiční ani daňové doporučení." },
  ],
};
