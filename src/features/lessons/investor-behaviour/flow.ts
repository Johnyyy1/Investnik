import type { StepDefinition } from "../types";

export const investorBehaviourSteps: Readonly<Record<string, readonly StepDefinition[]>> = {
  "behaviour-overconfidence": [
    { title: "Dva investoři, pět let", blocks: ["opening", "prediction"] },
    { title: "Vyzkoušej si to v Labu", blocks: ["mission-intro", "mission"] },
    { title: "Co je obrat", blocks: ["turnover", "formula", "worked"] },
    { title: "Spočítej obrat", blocks: ["turnover-practice"] },
    { title: "Kolik stojí obchody", blocks: ["costs", "costs-practice"] },
    { title: "Výzkum · obchodování škodí", blocks: ["research", "research-why"] },
    { title: "Proč víc obchodů znamená víc chyb", blocks: ["overconfidence", "misconceptions"] },
    { title: "Ověření · obrat", kind: "mastery", blocks: ["recall"] },
    { title: "Tvoje pojistka", blocks: ["safeguard", "checklist"], requiredArtifact: { kind: "lesson_output", source: "current_lesson", blockId: "checklist" } },
    { title: "Rozpočet obratu", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
  "behaviour-disposition-effect": [
    { title: "Marek potřebuje 20 000 Kč", blocks: ["opening", "scenario"] },
    { title: "Co je dispoziční efekt", blocks: ["explain", "formula", "explain-meaning"] },
    { title: "Spočítej PGR a PLR", blocks: ["pgr-practice"] },
    { title: "Výzkum · neradi realizujeme ztráty", blocks: ["research", "research-why"] },
    { title: "Proč na nákupní ceně nezáleží", blocks: ["purchase-price", "misconceptions"] },
    { title: "Výjimka: daně", blocks: ["tax"] },
    { title: "Co prodat podle plánu", blocks: ["decision"] },
    { title: "Ověření · dispoziční efekt", kind: "mastery", blocks: ["recall"] },
    { title: "Tvoje pojistka", blocks: ["safeguard", "checklist"], requiredArtifact: { kind: "lesson_output", source: "current_lesson", blockId: "checklist" } },
    { title: "Tvoje pravidlo pro prodej", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
};
