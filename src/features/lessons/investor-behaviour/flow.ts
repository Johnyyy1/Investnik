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
};
