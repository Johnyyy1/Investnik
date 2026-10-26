import { getLessonPlacement } from "@/features/learning/curriculum";
import { getGuidedSteps } from "@/features/lessons/steps";
import type { AuthoredLesson, ChoiceOption, LessonBlock } from "@/features/lessons/types";
import { contentReviews } from "./content-reviews";
import { prepareLessonFacts } from "./lesson-facts";
import { formatFactDate, formatFactValue, resolveFact } from "./resolve";
import type { FactVersion } from "./types";

/**
 * Plain-text review packet for an external expert (#435). Read-only: it renders a draft with the same
 * fact resolution as the lesson page (published: false) and never changes status or review records.
 */
const token = /\{\{\s*([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+)\s*\}\}/g;
const factMark = /⟦(notice:)?([a-z0-9_.]+)⟧/g;

export function factId(fact: FactVersion) {
  return `${fact.key}@${fact.version}`;
}

export function factStatus(fact: FactVersion) {
  const pending = [fact.verificationStatus === "unverified" && "NEOVĚŘENO", fact.publicationBlockedBy && "BLOKOVÁNO"].filter(Boolean);
  return pending.length ? `⚠ ${pending.join(", ")}` : `ověřeno ${formatFactDate(fact.verifiedAt!)}`;
}

const cs = (value: number) => new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 10 }).format(value);
const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");
const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");
const choices = (options: readonly ChoiceOption[], correctId: string) => list(options.map((option) => [
  option.id === correctId ? `✅ **${option.label}** — správná odpověď` : `◻️ ${option.label}`,
  option.misconception && `  - Častá záměna: ${option.misconception}`,
  option.explanation && `  - Vysvětlení při volbě: ${option.explanation}`,
].filter(Boolean).join("\n")));
const feedback = (block: { correctExplanation: string; incorrectExplanation: string }) =>
  `Zpětná vazba při správné odpovědi: ${block.correctExplanation}\n\nZpětná vazba při chybě: ${block.incorrectExplanation}`;
const answer = (value: number, tolerance: number, unit: string) => `${cs(value)} ${unit}${tolerance ? ` (tolerance ± ${cs(tolerance)})` : ""}`.trim();

function renderBlock(block: LessonBlock): string {
  switch (block.type) {
    case "heading": return [`**${block.title}**`, block.body].filter(Boolean).join("\n\n");
    case "paragraph": return block.content;
    case "formula": return [`Vzorec: ${block.expression}`, list(block.variables.map((variable) => `\`${variable.symbol}\` — ${variable.description}`))].join("\n\n");
    case "workedExample": return [`**Řešený příklad: ${block.title}**`, block.introduction, list(block.steps.map((step) => `${step.label}: ${step.emphasis ? `**${step.value}**` : step.value}`)), block.conclusion].filter(Boolean).join("\n\n");
    case "conceptCallout":
    case "explanation":
    case "takeaway":
    case "lessonSummary": return `**${block.title}**\n\n${block.content}`;
    case "checkpoint": return `**${block.label}**\n\n${block.content}`;
    case "labBridge": return [`**Most do Labu: ${block.title}**`, block.content, block.lessonLinks && list(block.lessonLinks.map((link) => link.label))].filter(Boolean).join("\n\n");
    case "interactiveFigure": return [
      `**Interaktivní prvek (\`${block.figure}\`): ${block.title}**`, block.description,
      block.emergencyFundFacts && list(Object.values(block.emergencyFundFacts).map((rate) => `Vstup kalkulačky z registru: ${rate.label} = ${cs(rate.rate * 100)} % (${rate.period}; ověřeno ${formatFactDate(rate.verifiedAt)})`)),
      "_Interaktivní výpočet se v exportu nevykresluje; jeho vstupy a model popisuje dokumentace lekce._",
    ].filter(Boolean).join("\n\n");
    case "multipleChoiceQuestion": return [`**Otázka (výběr jedné možnosti):** ${block.prompt}`, choices(block.options, block.correctOptionId), feedback(block)].join("\n\n");
    case "numericQuestion": return [`**Otázka (číslo):** ${block.prompt}`, `✅ Správná odpověď: **${answer(block.answer, block.tolerance, block.unit)}**`, feedback(block)].join("\n\n");
    case "multiNumericQuestion": return [`**Otázka (více čísel):** ${block.prompt}`, list(block.answers.map((item) => `${item.label}: ✅ **${answer(item.answer, item.tolerance, item.unit)}**`)), feedback(block)].join("\n\n");
    case "fadedExample": return [
      `**Doplň příklad: ${block.title}**`, block.introduction, list(block.steps.map((step) => `${step.label}: ${step.value}`)),
      `Řádek k doplnění: ${block.blank.label}`,
      block.blank.input === "choice" ? choices(block.blank.options, block.blank.correctOptionId) : `✅ Správná odpověď: **${answer(block.blank.answer, block.blank.tolerance, block.blank.unit)}**`,
      block.misconception && `Častá záměna: ${block.misconception}`, feedback(block),
    ].filter(Boolean).join("\n\n");
    case "documentTap": return [
      `**Otázka (označ řádky dokumentu):** ${block.prompt}`,
      `Dokument: ${[block.document.eyebrow, block.document.title, block.document.meta, block.document.period].filter(Boolean).join(" · ")}`,
      list(block.document.rows.map((row) => `${block.correctRowIds.includes(row.id) ? "✅ označit" : "◻️ neoznačovat"}: ${block.document.columns.map((column) => `${column.label}: ${row.cells[column.id] ?? ""}`).join(" · ")}\n  - Vysvětlení řádku: ${row.note}`)),
      feedback(block),
    ].join("\n\n");
    case "findError": return [
      `**Najdi chybu: ${block.title}**`, block.introduction,
      list(block.rows.map((row) => `${row.id === block.errorRowId ? "❌ chybný řádek — " : ""}${row.label}: ${row.value}${row.correction ? `\n  - Oprava: ${row.correction}` : ""}`)),
      "Volba opravy:", choices(block.fixes, block.correctFixId), feedback(block),
    ].filter(Boolean).join("\n\n");
    case "personaDecision": return [
      `**Rozhodnutí za personu (nehodnocené):** ${block.persona.name}, ${block.persona.age} let — ${block.persona.need}`,
      list(block.persona.facts.map((fact) => `${fact.label}: ${fact.value}${fact.detail ? ` (${fact.detail})` : ""}`)),
      block.note && `**${block.note.title}** ${block.note.content}`, block.prompt,
      list(block.options.map((option) => `${option.label} → **${option.consequence.lead}** ${option.consequence.content}${option.consequence.rows.map((row) => `\n  - ${row.label}: ${row.value}`).join("")}`)),
      block.disclaimer,
    ].filter(Boolean).join("\n\n");
    case "labMission": return [
      `**Mise v Labu (nehodnocená): ${block.mission.title}** — ${block.mission.goal} (${block.mission.minutes} min, ${block.mission.target})`,
      list(block.mission.steps), block.mission.afterReturn,
      `**${block.analysis.title}** ${block.analysis.summary}`,
      list(block.analysis.rows.map((row) => [row.label, row.badge, row.status, row.start, row.end].filter(Boolean).join(" · "))),
      block.analysis.generalRule, `Otázka k sebevysvětlení: ${block.analysis.selfExplanationPrompt}`,
    ].join("\n\n");
    case "factNotice": return `**Blok „Zdroje a stav údajů“** zobrazí tyto fakty: ${block.factKeys.map((key) => `⟦notice:${key}⟧`).join(", ")}`;
    case "writtenReflection": return [`**Psaná reflexe (nehodnocená):** ${block.prompt}`, "Kritéria sebehodnocení:", list(block.rubric.map((item) => item.text)), `Vzorová odpověď: ${block.sampleAnswer}`].join("\n\n");
    case "decisionTree": return [`**Rozhodovací postup (nehodnocený): ${block.title}**`, list(block.nodes.map((node) => "outcome" in node
      ? `[${node.id}] Závěr: ${node.outcome}`
      : `[${node.id}]${node.id === block.startId ? " (start)" : ""} ${node.prompt}${node.choices.map((choice) => `\n  - ${choice.label} → [${choice.nextId}]`).join("")}`))].join("\n\n");
    case "categorizeQuestion": return [`**Otázka (třídění):** ${block.prompt}`, list(block.categories.map((category) => `**${category.label}**: ${block.items.filter((item) => item.categoryId === category.id).map((item) => item.label).join("; ")}`)), feedback(block)].join("\n\n");
    case "orderQuestion": return [`**Otázka (seřazení):** ${block.prompt}`, `✅ Správné pořadí:\n\n${block.correctOrder.map((id, index) => `${index + 1}. ${block.items.find((item) => item.id === id)?.label}`).join("\n")}`, feedback(block)].join("\n\n");
    case "documentSearchQuestion": return [
      `**Otázka (najdi v dokumentu):** ${block.prompt}`, `Dokument: ${block.document.title}`,
      list(block.document.regions.map((region) => `${block.target.type === "region" && block.target.regionId === region.id ? "✅ " : ""}${region.label}: ${region.content}`)),
      block.target.type === "numeric" && `✅ Správná odpověď: **${answer(block.target.answer, block.target.tolerance, block.target.unit)}**`, feedback(block),
    ].filter(Boolean).join("\n\n");
    case "findErrorQuestion": return [`**Otázka (najdi chybný krok):** ${block.prompt}`, list(block.steps.map((step) => `${step.id === block.incorrectStepId ? "❌ chybný krok — " : ""}${step.label}`)), feedback(block)].join("\n\n");
    case "checklist": return [`**Kontrolní seznam: ${block.title}**`, list(block.items.map((item) => `☐ ${item.label}`))].join("\n\n");
    case "rubricSelfAssessment": return [`**Sebehodnocení: ${block.title}**`, block.prompt, list(block.criteria.map((criterion) => `${criterion.label}: ${criterion.levels.join(" / ")}`))].join("\n\n");
    default: return block satisfies never;
  }
}

export function reviewPacket(lesson: AuthoredLesson, registry: readonly FactVersion[], today: string) {
  // Mark each token before substitution so the reader sees which registry version produced the value.
  const marked = JSON.parse(JSON.stringify(lesson), (_, value) => typeof value === "string" ? value.replace(token, "$& ⟦$1⟧") : value) as AuthoredLesson;
  const { lesson: prepared, facts: tokenFacts } = prepareLessonFacts(marked, registry, { today, published: false });
  // Tokens resolve for the lesson's date, a factNotice for today; list both versions if they differ.
  const noticeFacts = lesson.blocks.flatMap((block) => block.type === "factNotice" ? block.factKeys.map((key) => resolveFact(key, today, registry)) : []);
  const facts = [...new Map([...tokenFacts, ...noticeFacts].map((fact) => [factId(fact), fact])).values()].sort((a, b) => factId(a).localeCompare(factId(b)));
  const reference = (notice: string | undefined, key: string) => {
    const fact = (notice ? noticeFacts : tokenFacts).find((item) => item.key === key)!;
    return `[\`${factId(fact)}\` · ${factStatus(fact)}]`;
  };
  const steps = getGuidedSteps(prepared).map((step, index) => [
    `### Krok ${index + 1}: ${step.title}${step.kind === "mastery" ? " _(ověření zvládnutí)_" : ""}`,
    ...step.blocks.map(renderBlock),
  ].join("\n\n").replace(factMark, (_, notice: string | undefined, key: string) => reference(notice, key)));
  const placement = getLessonPlacement(lesson.id);
  const reviews = contentReviews.filter((review) => review.lessonId === lesson.id);
  const body = steps.join("\n\n");
  const words = body.split(/\s+/).filter(Boolean).length;
  const markdown = [
    `# ${placement?.displayCode ?? "—"} ${lesson.title}`,
    `> **Koncept k odborné revizi, nikoli publikovaná lekce ani schválení.** Vzdělávací obsah, ne daňové poradenství. Export ${formatFactDate(today)} z repozitáře; lekce zůstává ve stavu \`planned\`.`,
    list([
      `Stabilní ID: \`${lesson.id}\` (modul \`${lesson.moduleSlug}\`, slug \`${lesson.slug}\`)`,
      `Druh obsahu: ${lesson.factContext?.kind ?? "bez faktů"}${lesson.factContext?.asOf ? `; pravidla k ${formatFactDate(lesson.factContext.asOf)}` : "; pravidla platná v den zobrazení"}`,
      `Kroků: ${steps.length} · autorský odhad ${lesson.estimatedMinutes} min · rozsah textu ${words} slov`,
      `Dosavadní záznamy odborné revize: ${reviews.length ? reviews.map((review) => `${review.reviewedAt} ${review.role}: ${review.decision}`).join("; ") : "žádný"}`,
    ]),
    "## Použité fakty",
    "Hodnoty jsou v textu dosazené z registru faktů; za každou stojí `klíč@verze` a stav. ⚠ znamená, že údaj nelze publikovat bez ověření.",
    ["| Klíč@verze | Stav | Hodnota | Platnost | Zdroj | Poznámka redakce |", "| --- | --- | --- | --- | --- | --- |", ...facts.map((fact) => `| \`${factId(fact)}\` | ${factStatus(fact)}${fact.verifiedAt ? "" : ` (kontrola ${formatFactDate(fact.checkedAt)})`} | ${cell(`${fact.label}: ${formatFactValue(fact.value)}`)} | ${formatFactDate(fact.validFrom)} – ${fact.validTo ? formatFactDate(fact.validTo) : "dosud"} | ${fact.sources.map((source) => `[${cell(source.title)}](${source.url})`).join("; ")} | ${cell(fact.notes)} |`)].join("\n"),
    "## Text lekce po krocích",
    "✅ označuje správnou odpověď, ◻️ ostatní možnosti. Zpětná vazba je uvedena tak, jak ji uvidí učící se.",
    body,
  ].join("\n\n");
  return { markdown: `${markdown}\n`, facts, steps: steps.length, words };
}
