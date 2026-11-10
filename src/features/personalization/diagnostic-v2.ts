import { z } from "zod";
import { displayModules, getLessonPlacement, type SkillId } from "@/features/learning/curriculum";
import { bigThreeQuestions } from "@/features/lessons/foundations/checkpoint";
import type { DiagnosticLevel } from "./diagnostic";

/**
 * Adaptive entry test (#124). Stored in the same versioned `diagnostic_result` column as V1; the latest
 * diagnostic wins, V1 stays readable. Item and option IDs are stable persistence identifiers.
 *
 * A proven lesson only shapes the study plan. It is never a completion: no XP, receipt, mastery above Známé
 * or Lab unlock comes from this test.
 */
export const DIAGNOSTIC_V2 = "DIAGNOSTIC_V2" as const;
/** Design proposals (#124, NQ-23): two correct answers prove a lesson, retake after 30 days. Measure, then tune. */
export const DIAGNOSTIC_V2_MAX_ITEMS = 30;
export const DIAGNOSTIC_V2_RETAKE_MS = 30 * 24 * 60 * 60 * 1000;
const FAILURES_TO_STOP_LEVEL = 2;

type Option = { readonly id: string; readonly label: string };
type Item = { readonly id: string; readonly skillId: SkillId; readonly prompt: string; readonly options: readonly Option[]; readonly correctAnswer: string };
const dontKnow = { id: "dont_know", label: "Nevím" } as const;
const item = (id: string, skillId: SkillId, prompt: string, options: readonly Option[], correctAnswer: string): Item =>
  ({ id, skillId, prompt, options: [...options, dontKnow], correctAnswer });
// The Big Three wording is a fixed instrument shared with the Foundations checkpoint (#130), including its own "nevím".
const bigThree = (id: (typeof bigThreeQuestions)[number]["id"], skillId: SkillId): Item => {
  const question = bigThreeQuestions.find((entry) => entry.id === id)!;
  return { id, skillId, prompt: question.prompt, options: question.options, correctAnswer: question.correctOptionId };
};

/**
 * One probe per lesson that can be tested out of, in curriculum order. Only published
 * lessons without a required learner artifact or checkpoint role are listed: the check-up, goals map, IPS and
 * checkpoints are outputs the learner still makes.
 */
export const diagnosticV2Probes: readonly { lessonId: string; items: readonly [Item, Item] }[] = [
  { lessonId: "before-investing-budget", items: [
    item("budget-savings-rate", "savings-rate", "Čistý měsíční příjem je 40 000 Kč a každý měsíc odložíš 6 000 Kč. Jaká je tvoje míra úspor?", [{ id: "fifteen", label: "15 %" }, { id: "six", label: "6 %" }, { id: "eighty_five", label: "85 %" }], "fifteen"),
    item("budget-irregular", "monthly-budget", "Pojištění auta platíš jednou ročně, 6 000 Kč. Jak s ním počítat v měsíčním rozpočtu?", [{ id: "monthly_share", label: "Každý měsíc si na něj odložit 500 Kč" }, { id: "due_month", label: "Započítat ho jen v měsíci, kdy ho platíš" }, { id: "ignore", label: "Nepočítat ho, je to mimořádný výdaj" }], "monthly_share"),
  ] },
  { lessonId: "before-investing-debt", items: [
    item("debt-card-first", "debt-priorities", "Kreditní karta má úrok 20 % ročně. Volných 10 000 Kč můžeš poslat na splátku karty, nebo investovat s nejistým očekávaným výnosem kolem 6 % ročně. Co dává větší smysl nejdřív?", [{ id: "repay", label: "Splatit kartu: ušetřený úrok je jistý a vyšší" }, { id: "invest", label: "Investovat: výnos se časem složí" }, { id: "same", label: "Je to jedno, obojí zlepší finance stejně" }], "repay"),
    item("debt-order", "debt-priorities", "Máš spotřebitelský úvěr s úrokem 15 % ročně a hypotéku s úrokem 5 % ročně. Kterou splátku navíc zaplatíš jako první, když chceš na úrocích ušetřit co nejvíc?", [{ id: "consumer", label: "Spotřebitelský úvěr" }, { id: "mortgage", label: "Hypotéku, protože je větší" }, { id: "split", label: "Obě stejným dílem" }], "consumer"),
  ] },
  { lessonId: "foundations-why-invest", items: [
    bigThree("big-three-inflation", "inflation"),
    item("why-short-horizon", "saving-vs-investing", "Peníze budeš potřebovat za šest měsíců na zaplacení kurzu. Kam spíš patří?", [{ id: "savings", label: "Na spořicí účet" }, { id: "equity_etf", label: "Do akciového ETF" }, { id: "single_stock", label: "Do akcie jedné firmy" }], "savings"),
  ] },
  { lessonId: "foundations-stocks", items: [
    item("stocks-position-value", "position-value", "Máš 8 akcií, jedna teď stojí 250 Kč. Jaká je hodnota tvé pozice?", [{ id: "two_thousand", label: "2 000 Kč" }, { id: "two_fifty_eight", label: "258 Kč" }, { id: "thirty_one", label: "31,25 Kč" }], "two_thousand"),
    item("stocks-ownership", "stock-ownership", "Co znamená, že vlastníš akcii firmy?", [{ id: "share", label: "Vlastníš malý podíl na firmě" }, { id: "loan", label: "Půjčuješ firmě peníze, které ti vrátí s úrokem" }, { id: "dividend", label: "Firma ti zaručuje pravidelnou dividendu" }], "share"),
  ] },
  { lessonId: "foundations-etfs-indexes", items: [
    item("etf-vs-index", "index-vs-fund", "Jaký je rozdíl mezi indexem a ETF?", [{ id: "rules_vs_fund", label: "Index je seznam s pravidly a vahami, ETF je fond, do kterého můžeš investovat" }, { id: "same", label: "Jsou to dva názvy pro totéž" }, { id: "reversed", label: "ETF je seznam akcií, index je fond" }], "rules_vs_fund"),
    item("index-weight", "index-vs-fund", "Index vážený tržní hodnotou má jen dvě firmy: A má hodnotu 300 mld. Kč, B 100 mld. Kč. Jakou váhu má v indexu firma A?", [{ id: "seventy_five", label: "75 %" }, { id: "fifty", label: "50 %" }, { id: "three_hundred", label: "300 %" }], "seventy_five"),
  ] },
  { lessonId: "foundations-bonds-cash", items: [
    item("bond-lending", "bonds-and-cash", "Co obvykle znamená koupit dluhopis?", [{ id: "lend", label: "Půjčuješ peníze vydavateli, který slíbil platit úroky a vrátit jistinu" }, { id: "own", label: "Kupuješ podíl na firmě" }, { id: "deposit", label: "Ukládáš peníze na bankovní účet" }], "lend"),
    item("bond-rates", "bonds-and-cash", "Úrokové sazby na trhu vzrostou. Co se obvykle stane s cenou už vydaného dluhopisu s pevným úrokem?", [{ id: "falls", label: "Klesne" }, { id: "rises", label: "Vzroste" }, { id: "unchanged", label: "Nezmění se" }], "falls"),
  ] },
  { lessonId: "foundations-markets", items: [
    item("markets-buy-price", "bid-ask-spread", "Nákupní nabídka (bid) je 99,80 Kč a prodejní nabídka (ask) 100,20 Kč. Chceš ihned koupit. Za kolik nakoupíš?", [{ id: "ask", label: "Ask · 100,20 Kč" }, { id: "bid", label: "Bid · 99,80 Kč" }, { id: "mid", label: "Průměr · 100 Kč" }], "ask"),
    item("markets-spread", "bid-ask-spread", "Bid je 49,90 Kč a ask 50,10 Kč. Jak velké je rozpětí nákupní a prodejní ceny (spread)?", [{ id: "twenty_hal", label: "0,20 Kč" }, { id: "fifty", label: "50 Kč" }, { id: "hundred", label: "100 Kč" }], "twenty_hal"),
  ] },
  { lessonId: "foundations-risk-reward", items: [
    bigThree("big-three-compounding", "compounding"),
    item("risk-simple-return", "simple-return", "Akcie stála při nákupu 200 Kč, teď stojí 180 Kč. Jaký je výnos?", [{ id: "minus_ten", label: "−10 %" }, { id: "minus_twenty", label: "−20 %" }, { id: "plus_ten", label: "+10 %" }], "minus_ten"),
  ] },
  { lessonId: "foundations-portfolio", items: [
    bigThree("big-three-diversification", "diversification"),
    item("portfolio-weight", "portfolio-weights", "Portfolio má hodnotu 20 000 Kč, z toho 5 000 Kč tvoří dluhopisový fond. Jakou váhu fond v portfoliu má?", [{ id: "twenty_five", label: "25 %" }, { id: "five", label: "5 %" }, { id: "seventy_five", label: "75 %" }], "twenty_five"),
  ] },
  { lessonId: "foundations-funds", items: [
    item("funds-etf-trading", "fund-types", "Čím se ETF obvykle liší od běžného podílového fondu?", [{ id: "exchange", label: "Obchoduje se na burze během dne za tržní cenu" }, { id: "free", label: "Nemá žádné náklady" }, { id: "safe", label: "Nemůže ztratit hodnotu" }], "exchange"),
    item("funds-ter-amount", "fund-costs", "Fond má celkovou nákladovost (TER) 0,2 % ročně. Kolik tě to zhruba stojí za rok, když v něm máš 50 000 Kč?", [{ id: "hundred", label: "Asi 100 Kč" }, { id: "ten", label: "Asi 10 Kč" }, { id: "thousand", label: "Asi 1 000 Kč" }], "hundred"),
  ] },
  { lessonId: "foundations-active-vs-index", items: [
    item("active-arithmetic", "active-vs-passive", "Proč průměrný aktivně řízený fond po nákladech obvykle zaostává za indexem stejného trhu?", [{ id: "costs", label: "Před náklady jsou aktivní investoři dohromady trh, náklady pak jejich výsledek snižují" }, { id: "bad_picks", label: "Správci záměrně kupují horší akcie" }, { id: "index_safe", label: "Index nenese žádné riziko" }], "costs"),
    item("active-index-risk", "active-vs-passive", "Chrání indexový fond před poklesem trhu, který sleduje?", [{ id: "no", label: "Ne, klesne zhruba spolu s tím trhem" }, { id: "always_up", label: "Ano, index dlouhodobě vždy roste" }, { id: "manager_sells", label: "Ano, správce při poklesu včas prodá" }], "no"),
  ] },
  { lessonId: "broker-fee-schedule", items: [
    item("fee-minimum", "fee-schedule", "Modelový ceník: poplatek 0,1 % z objemu obchodu, nejméně 40 Kč. Kolik zaplatíš za nákup za 10 000 Kč?", [{ id: "forty", label: "40 Kč" }, { id: "ten", label: "10 Kč" }, { id: "fifty", label: "50 Kč" }], "forty"),
    item("fee-threshold", "fee-schedule", "Stejný ceník: 0,1 % z objemu, nejméně 40 Kč. Od jakého objemu nákupu platíš víc než minimum?", [{ id: "forty_thousand", label: "Nad 40 000 Kč" }, { id: "four_thousand", label: "Nad 4 000 Kč" }, { id: "four_hundred_thousand", label: "Nad 400 000 Kč" }], "forty_thousand"),
  ] },
  { lessonId: "costs-ter-tracking-difference", items: [
    item("td-calculation", "tracking-difference", "Fond má TER 0,2 %. Za stejný rok vynesl index 8,0 % a fond 7,7 %. Jaký je rozdíl ve výkonnosti vůči indexu (tracking difference), počítaný jako výnos fondu minus výnos indexu?", [{ id: "minus_point_three", label: "−0,3 procentního bodu" }, { id: "minus_point_two", label: "−0,2 procentního bodu, stejně jako TER" }, { id: "plus_point_three", label: "+0,3 procentního bodu" }], "minus_point_three"),
    item("td-vs-ter", "tracking-difference", "Proč se při výběru indexového fondu díváš i na rozdíl ve výkonnosti vůči indexu, ne jen na TER?", [{ id: "actual", label: "Ukazuje, o kolik fond za období skutečně zaostal za indexem, včetně nákladů mimo TER" }, { id: "daily", label: "TER se mění každý den, rozdíl ve výkonnosti ne" }, { id: "always_lower", label: "Rozdíl ve výkonnosti je vždy menší než TER" }], "actual"),
  ] },
  { lessonId: "costs-spread-and-fees", items: [
    item("trade-min-fee-share", "trade-costs", "Broker účtuje 1 % z objemu, nejméně 50 Kč. Každý měsíc nakoupíš za 1 000 Kč. Kolik procent nákupu tě stojí poplatek?", [{ id: "five", label: "5 %" }, { id: "one", label: "1 %" }, { id: "half", label: "0,5 %" }], "five"),
    item("trade-frequency", "trade-costs", "Za rok chceš investovat stejnou částku a broker má minimální poplatek za obchod. Jak snížíš podíl poplatků na investované částce?", [{ id: "fewer", label: "Nakupovat méně často ve větších částkách" }, { id: "more", label: "Nakupovat častěji v menších částkách" }, { id: "irrelevant", label: "Na počtu nákupů nezáleží" }], "fewer"),
  ] },
  { lessonId: "costs-currency-conversion", items: [
    item("fx-markup", "currency-risk", "Broker při převodu korun na eura přičítá ke kurzu 0,5 %. Kolik tě zhruba stojí převod 20 000 Kč?", [{ id: "hundred", label: "Asi 100 Kč" }, { id: "ten", label: "Asi 10 Kč" }, { id: "thousand", label: "Asi 1 000 Kč" }], "hundred"),
    item("fx-underlying", "currency-risk", "ETF na americké akcie se obchoduje v eurech. Ceny akcií v dolarech se nezmění, ale koruna vůči dolaru posílí. Co se stane s hodnotou ETF v korunách?", [{ id: "falls", label: "Klesne" }, { id: "rises", label: "Vzroste" }, { id: "eur_only", label: "Nezmění se, rozhoduje jen kurz eura" }], "falls"),
  ] },
];

const levelOf = (lessonId: string) => displayModules.find((entry) => entry.code === getLessonPlacement(lessonId)?.displayModule)?.levelId;
const answerSchema = z.strictObject({ itemId: z.string().max(100), optionId: z.string().max(100) });
type Answer = z.infer<typeof answerSchema>;
export type ProbeOutcome = "proven" | "not_proven" | "untested";

/**
 * Deterministic replay: the next item depends only on earlier answers, so the server re-derives the whole
 * sequence and never trusts a client order or score. The first wrong or "Nevím" answer ends a lesson's probe;
 * two unproven lessons end the rest of that level. Prerequisites are left to the study plan ("outer fringe").
 */
function replay(answers: readonly Answer[]) {
  const outcomes: Record<string, ProbeOutcome> = {};
  const failures = new Map<string | undefined, number>();
  let cursor = 0;
  for (const [index, probe] of diagnosticV2Probes.entries()) {
    const level = levelOf(probe.lessonId);
    if ((failures.get(level) ?? 0) >= FAILURES_TO_STOP_LEVEL) {
      outcomes[probe.lessonId] = "untested";
      continue;
    }
    let proven = true;
    for (const [itemIndex, entry] of probe.items.entries()) {
      const answer = answers[cursor];
      // Upper bound of what is left, for an approximate progress bar.
      if (!answer) return { valid: true, outcomes, next: entry, asked: cursor, remaining: probe.items.length - itemIndex + 2 * (diagnosticV2Probes.length - index - 1) } as const;
      if (answer.itemId !== entry.id || !entry.options.some((option) => option.id === answer.optionId)) return { valid: false } as const;
      cursor++;
      if (answer.optionId !== entry.correctAnswer) { proven = false; break; }
    }
    outcomes[probe.lessonId] = proven ? "proven" : "not_proven";
    if (!proven) failures.set(level, (failures.get(level) ?? 0) + 1);
  }
  return cursor === answers.length ? { valid: true, outcomes, next: null, asked: cursor, remaining: 0 } as const : { valid: false } as const;
}

const answersSchema = z.array(answerSchema).max(DIAGNOSTIC_V2_MAX_ITEMS);
export const diagnosticV2SubmissionSchema = z.strictObject({ version: z.literal(DIAGNOSTIC_V2), answers: answersSchema })
  .refine((value) => { const result = replay(value.answers); return result.valid && result.next === null; }, "Odpovědi neodpovídají průchodu testem.");
export type DiagnosticV2Result = z.infer<typeof diagnosticV2SubmissionSchema> & {
  completedAt: string;
  outcomes: Record<string, ProbeOutcome>;
  provenLessonIds: string[];
  /** Skills of proven lessons: at most Známé in mastery. */
  knownSkillIds: SkillId[];
  level: DiagnosticLevel;
};

export type DiagnosticV2Question = { id: string; prompt: string; options: readonly Option[]; topic: string };
/** Public part only: never the answer key. `null` once the test is complete; throws on an invalid sequence. */
export function nextDiagnosticV2Question(input: unknown): { question: DiagnosticV2Question | null; progress: number } {
  const result = replay(answersSchema.parse(input));
  if (!result.valid) throw new z.ZodError([{ code: "custom", path: ["answers"], message: "Odpovědi neodpovídají průchodu testem.", input }]);
  const next = result.next && { id: result.next.id, prompt: result.next.prompt, options: result.next.options, topic: displayModules.find((entry) => entry.code === getLessonPlacement(probeOf(result.next.id))?.displayModule)?.title ?? "" };
  return { question: next, progress: result.asked / (result.asked + result.remaining) };
}
const probeOf = (itemId: string) => diagnosticV2Probes.find((probe) => probe.items.some((entry) => entry.id === itemId))!.lessonId;

/** Called again by the server repository and on every read. Never accepts a client score or outcome. */
export function evaluateDiagnosticV2(input: unknown, completedAt: Date): DiagnosticV2Result {
  const submission = diagnosticV2SubmissionSchema.parse(input);
  const replayed = replay(submission.answers);
  const outcomes = replayed.valid ? replayed.outcomes : {};
  const provenLessonIds = diagnosticV2Probes.map((probe) => probe.lessonId).filter((id) => outcomes[id] === "proven");
  const knownSkillIds = [...new Set(diagnosticV2Probes.filter((probe) => outcomes[probe.lessonId] === "proven").flatMap((probe) => probe.items.map((entry) => entry.skillId)))];
  const foundations = provenLessonIds.filter((id) => levelOf(id) === "L1").length;
  // Same buckets as V1 (under ~1/3, over ~3/4 proven), over the nine Foundations probes.
  const level: DiagnosticLevel = foundations < 3 ? "foundations_needed" : foundations >= 7 ? "strong_foundations" : "partial_foundations";
  return { ...submission, completedAt: completedAt.toISOString(), outcomes, provenLessonIds, knownSkillIds, level };
}

/** Stored derived fields are a convenience, not authority; recompute from versioned answers. */
export function readDiagnosticV2(input: unknown): DiagnosticV2Result | null {
  const value = (input ?? {}) as Partial<DiagnosticV2Result>;
  const completedAt = z.iso.datetime().safeParse(value.completedAt);
  const parsed = diagnosticV2SubmissionSchema.safeParse({ version: value.version, answers: value.answers });
  return parsed.success && completedAt.success ? evaluateDiagnosticV2(parsed.data, new Date(completedAt.data)) : null;
}

/** When a stored V2 result allows the next attempt, or null when an attempt is allowed at `now`. */
export function diagnosticV2RetakeAt(stored: unknown, now = new Date()) {
  const result = readDiagnosticV2(stored);
  const retakeAt = result && new Date(new Date(result.completedAt).getTime() + DIAGNOSTIC_V2_RETAKE_MS);
  return retakeAt && retakeAt > now ? retakeAt : null;
}
