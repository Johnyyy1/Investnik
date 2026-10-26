// Writes one Markdown review document per draft lesson for an external expert (#435). Read-only: no status or review changes.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { factRegistry } from "../src/features/facts/registry";
import { factToday, formatFactDate } from "../src/features/facts/resolve";
import { reviewPacket } from "../src/features/facts/review-packet";
import { getLessonPlacement } from "../src/features/learning/curriculum";
import { draftLessons } from "../src/features/lessons/registry";

const out = process.argv[2] ?? "review-packet";
const today = factToday();
mkdirSync(out, { recursive: true });
const rows = draftLessons.map((lesson) => {
  const code = getLessonPlacement(lesson.id)?.displayCode ?? "x";
  const file = `${code}-${lesson.slug}.md`;
  const packet = reviewPacket(lesson, factRegistry, today);
  writeFileSync(join(out, file), packet.markdown);
  const pending = packet.facts.filter((fact) => fact.verificationStatus === "unverified" || fact.publicationBlockedBy).length;
  return `| ${code} | [${lesson.title}](${file}) | ${lesson.factContext?.kind ?? "—"} | ${packet.steps} | ${packet.words} | ${packet.facts.length} (⚠ ${pending}) |`;
});
writeFileSync(join(out, "README.md"), [
  `# Revizní balíček konceptů — export ${formatFactDate(today)}`,
  "Koncepty nepublikovaných lekcí k odborné revizi. Dotazník: docs/education/review-batch-1.md. Nejde o schválení ani publikaci.",
  "| Kód | Lekce | Druh | Kroků | Slov | Faktů (⚠ čeká) |\n| --- | --- | --- | --- | --- | --- |\n" + rows.join("\n"),
].join("\n\n") + "\n");
console.log(`Review packet for ${draftLessons.length} draft lessons written to ${out}/.`);
