import type { CurriculumLevelId, MilestoneId } from "@/features/learning/curriculum";
import { MASTERED } from "@/features/mastery/domain";

/**
 * Milestones and capstones (#126). Typed code, no database. A milestone is recognition, not an unlock:
 * its state is derived from lesson completions, skill attempts and capstone submissions (see domain.ts).
 * Versioned definitions are immutable once a submission references them: new criteria need a new capstone ID.
 */

/** 1 Začínající, 2 Rozvíjející se, 3 Zdatný, 4 Příkladný. */
export type RubricLevel = 1 | 2 | 3 | 4;
/** Every criterion must reach Zdatný. Proposal from the research brief, to validate with learners. */
export const PASSING_RUBRIC_LEVEL: RubricLevel = 3;
/** A failed automatic check caps its criterion here, whatever the self-assessment says. */
export const FAILED_CHECK_CAP: RubricLevel = 2;
/** Skills of a milestone's checkpoint modules must have reached Zvládnuté at least once. */
export const MILESTONE_SKILL_LEVEL = MASTERED;

/** Named thresholds of the automatic checks. Illustrative educational limits, not norms or advice. */
export const capstoneThresholds = {
  /** Largest absolute gap between the Lab portfolio and the IPS target, any instrument or cash. */
  ipsMaxDeviationBps: 500,
  /** Largest single stock as a share of the whole portfolio including cash. */
  singleStockMaxBps: 1000,
  /** Sells outside the IPS rules in the learner's latest finished crisis drill. */
  crisisMaxSellsOutsidePlan: 0,
} as const;

export type CapstoneCheck = "ips-alignment-v1" | "diversified-core-v1" | "crisis-plan-kept-v1" | "thesis-saved-v1";
export type RubricCriterion = { id: string; title: string; levels: readonly [string, string, string, string]; check?: CapstoneCheck };
export type CapstoneDefinition = { id: string; milestone: MilestoneId; lessonId: string; title: string; criteria: readonly RubricCriterion[] };

export const capstones: readonly CapstoneDefinition[] = [
  // Lesson IDs are reserved by #198, #231, #269 and #285; registering a capstone does not publish a lesson.
  { id: "capstone-a-v1", milestone: "A", lessonId: "first-plan-capstone-a", title: "Závěrečný projekt A: plán, nákup a krizový nácvik", criteria: [
    { id: "ips-alignment", title: "Soulad portfolia s IPS", check: "ips-alignment-v1", levels: [
      "Portfolio v Labu a IPS spolu zatím nesouvisí.",
      "Portfolio drží nástroje z IPS, ale některá složka se od cíle liší o víc než 5 p. b.",
      "Každý nástroj i hotovost jsou nejvýše 5 p. b. od cíle IPS.",
      "Odchylky jsou v limitu a umíš vysvětlit, kdy a jak je srovnáš.",
    ] },
    { id: "costs", title: "Náklady", levels: [
      "Náklady plánu zatím neznáš.",
      "Znáš poplatky brokera, ale ne celkové roční náklady plánu.",
      "Celkové roční náklady plánu máš spočítané a zdůvodněné.",
      "Navíc víš, jak se náklady změní s velikostí a četností nákupů.",
    ] },
    { id: "diversification", title: "Diverzifikace", check: "diversified-core-v1", levels: [
      "Portfolio stojí na jedné nebo dvou akciích.",
      "Máš fond, ale jednotlivá akcie tvoří víc než 10 % portfolia.",
      "Jádro tvoří fond a žádná jednotlivá akcie nepřesahuje 10 % portfolia.",
      "Navíc umíš vysvětlit, co fond drží a kde se pozice překrývají.",
    ] },
    { id: "crisis", title: "Chování v krizi", check: "crisis-plan-kept-v1", levels: [
      "V krizovém nácviku jsou prodeje mimo pravidla IPS bez vysvětlení.",
      "Nácvik má prodej mimo pravidla IPS, ale umíš pojmenovat proč.",
      "Žádný prodej mimo pravidla IPS; reflexe pojmenuje pocit i pravidlo.",
      "Navíc podle nácviku upravíš pojistku nebo pravidlo v IPS.",
    ] },
  ] },
  { id: "capstone-b-v1", milestone: "B", lessonId: "maintenance-capstone-b", title: "Závěrečný projekt B: moje portfolio na 10 let", criteria: [
    { id: "ips-horizon", title: "Soulad s IPS a horizontem", check: "ips-alignment-v1", levels: [
      "Alokace neodpovídá IPS ani horizontu.",
      "Alokace odpovídá IPS, ale některá složka se liší o víc než 5 p. b.",
      "Každý nástroj i hotovost jsou nejvýše 5 p. b. od cíle IPS a alokace sedí k horizontu.",
      "Navíc umíš obhájit, proč alokace sedí k horizontu i kurzovému riziku.",
    ] },
    { id: "backtest", title: "Interpretace backtestu", levels: [
      "Výsledek backtestu bereš jako předpověď.",
      "Porovnáš výsledek s benchmarkem, ale bez nákladů nebo omezení dat.",
      "Interpretuješ backtest s náklady a benchmarkem a uvedeš jeho omezení.",
      "Navíc rozlišíš cenový a celkový výnos a vysvětlíš vliv zvoleného období.",
    ] },
    { id: "costs-taxes", title: "Náklady a daně", levels: [
      "Náklady ani daně v plánu nejsou.",
      "Náklady znáš, daňové dopady rebalancingu ne.",
      "Plán rebalancingu počítá s náklady i daňovými dopady.",
      "Navíc rebalancing přednostně řešíš příspěvky a umíš to doložit.",
    ] },
    { id: "behaviour", title: "Chování a pojistky", check: "crisis-plan-kept-v1", levels: [
      "V krizovém nácviku jsou prodeje mimo pravidla IPS bez vysvětlení.",
      "Nácvik má prodej mimo pravidla IPS, ale umíš pojmenovat proč.",
      "Žádný prodej mimo pravidla IPS a pojistky máš sepsané.",
      "Navíc pojistky vycházejí z tvých vlastních chyb v nácvicích.",
    ] },
  ] },
  { id: "capstone-c-v1", milestone: "C", lessonId: "thesis-capstone-c", title: "Závěrečný projekt C: jedna firma od byznysu po tezi", criteria: [
    { id: "analysis", title: "Kvalita analýzy", levels: [
      "Analýza popisuje firmu jen obecně.",
      "Analýza pokrývá byznys, ale výkazy jen povrchně.",
      "Analýza propojuje byznys, výkazy a ukazatele včetně jejich omezení.",
      "Navíc srovnává firmu s odvětvím a vysvětluje odchylky.",
    ] },
    { id: "story-numbers", title: "Příběh a čísla", levels: [
      "Příběh a čísla spolu nesouvisejí.",
      "Čísla příběh částečně podporují.",
      "Každý předpoklad příběhu má číslo nebo zdroj.",
      "Navíc ukazuješ, která čísla by příběh vyvrátila.",
    ] },
    { id: "valuation", title: "Ocenění a citlivost", levels: [
      "Ocenění je jedno číslo bez předpokladů.",
      "Ocenění má předpoklady, ale ne rozpětí.",
      "Ocenění je rozpětí s citlivostí a reverzním DCF.",
      "Navíc vysvětluješ, který předpoklad hýbe hodnotou nejvíc.",
    ] },
    { id: "risks-exit", title: "Rizika a kritéria ukončení", check: "thesis-saved-v1", levels: [
      "Rizika ani kritéria ukončení nejsou sepsaná.",
      "Rizika jsou sepsaná, kritéria ukončení chybí.",
      "Uložená teze má rizika, pre-mortem a kritéria ukončení.",
      "Navíc jsou kritéria ukončení měřitelná a datovaná.",
    ] },
    { id: "review", title: "Revize", levels: [
      "Teze nemá plán revize.",
      "Revize je naplánovaná, ale bez kritérií.",
      "Revize po 6 měsících srovnává tezi s výsledkem a indexem.",
      "Navíc revize pojmenuje, co ti ukázala o vlastním úsudku.",
    ] },
  ] },
  { id: "capstone-d-v1", milestone: "D", lessonId: "backtest-capstone-d", title: "Závěrečný projekt D: kritika backtestu", criteria: [
    { id: "bias-critique", title: "Kritika cizího backtestu", levels: [
      "Fiktivní backtest přijímáš bez výhrad.",
      "Najdeš jedno nebo dvě zkreslení.",
      "Projdeš celý checklist zkreslení a každé doložíš.",
      "Navíc odhadneš, jak by výsledek změnila oprava každého zkreslení.",
    ] },
    { id: "honest-design", title: "Návrh poctivého testu", levels: [
      "Test nemá oddělená data ani náklady.",
      "Test má náklady, ale ne out-of-sample období.",
      "Test má náklady, out-of-sample období a počet pokusů.",
      "Navíc má test ekonomické zdůvodnění a předem dané parametry.",
    ] },
    { id: "own-test", title: "Vlastní test a interpretace", levels: [
      "Vlastní test chybí.",
      "Test proběhl, ale interpretace přeceňuje výsledek.",
      "Interpretace uvádí nejistotu, počet pokusů a omezení dat.",
      "Navíc rozlišíš, co test prokázal a co ne.",
    ] },
  ] },
];

export type MilestoneRule = {
  id: MilestoneId;
  /** Milestones that must be achieved first. */
  requires: readonly MilestoneId[];
  /** Required and track lessons of these levels count; recommended (level 0) and optional modules do not. */
  levels: readonly CurriculumLevelId[];
  /** Individual lessons outside `levels`, by display code. An unplaced code keeps the milestone unavailable. */
  lessonCodes?: readonly string[];
  capstoneId: string;
};

export const milestoneRules: readonly MilestoneRule[] = [
  // Behavioural core B1–B4, B9 and the B10 crisis exercise.
  { id: "A", requires: [], levels: ["L1", "L2"], lessonCodes: ["B.1.1", "B.1.2", "B.1.3", "B.1.4", "B.1.9", "B.1.10"], capstoneId: "capstone-a-v1" },
  { id: "B", requires: ["A"], levels: ["B", "L3"], capstoneId: "capstone-b-v1" },
  { id: "C", requires: ["B"], levels: ["L4", "L5"], capstoneId: "capstone-c-v1" },
  // C is not a prerequisite for D.
  { id: "D", requires: ["B"], levels: ["L6"], capstoneId: "capstone-d-v1" },
];

export function getCapstone(id: string) {
  return capstones.find((capstone) => capstone.id === id);
}
