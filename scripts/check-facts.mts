import { checkGuides } from "../src/features/guides/prepare";
import { factRegistry } from "../src/features/facts/registry";
import { checkPublishedFacts } from "../src/features/facts/check-published";
import { curriculumLessons } from "../src/features/learning/catalog";
import { authoredLessons } from "../src/features/lessons/registry";
import { factToday } from "../src/features/facts/resolve";

checkPublishedFacts(factRegistry, authoredLessons, curriculumLessons, factToday());
console.log(`Fact references checked in ${curriculumLessons.filter((lesson) => lesson.status === "available").length} published lessons (${new Set(factRegistry.map((fact) => fact.key)).size} fact keys).`);

checkGuides();
console.log("Guide tokens, published destinations and expert reviews checked.");
