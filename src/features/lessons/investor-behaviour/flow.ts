import type { StepDefinition } from "../types";

export const investorBehaviourSteps: Readonly<Record<string, readonly StepDefinition[]>> = {
  "behaviour-behaviour-gap": [
    { title: "Nejdřív vlastní zkušenost", blocks: ["opening", "replay"] },
    { title: "Výnos investora a investice", blocks: ["concept", "worked"] },
    { title: "Doplň rozdíl", blocks: ["faded"] },
    { title: "Co říká tvůj výsledek", blocks: ["interpretation"] },
    { title: "Historický výzkum", blocks: ["research", "research-calculation"] },
    { title: "Co výzkum nedokazuje", blocks: ["limits", "mechanism"] },
    { title: "Ověření · co mezera měří", kind: "mastery", blocks: ["recall"] },
    { title: "Ověření · stejný plán", kind: "mastery", blocks: ["recall-limits"] },
    { title: "Pojistka v tvém plánu", blocks: ["safeguard", "builder", "verification"], requiredArtifact: { kind: "investment_plan", source: "any_lesson" } },
    { title: "Vysvětli vlastní rozhodnutí", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["summary", "sources"] },
  ],
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
};
