import type { StepDefinition } from "../types";

export const costsSteps: Readonly<Record<string, readonly StepDefinition[]>> = {
  "costs-ter-tracking-difference": [
    { title: "Které ETF je levnější?", blocks: ["opening", "prediction"] },
    { title: "Co je TER", blocks: ["ter", "ter-scope", "ter-payment"] },
    { title: "Kolik fond skutečně zaostal", blocks: ["td", "td-formula", "worked"] },
    { title: "Spočítej rozdíl", blocks: ["td-practice"] },
    { title: "Proč rozdíl není jen −TER", blocks: ["td-reasons", "td-better"] },
    { title: "Jeden rok je šum", blocks: ["years", "years-data", "years-compare"] },
    { title: "Rozdíl, nebo kolísání?", blocks: ["te", "te-compare"] },
    { title: "Na co si dát pozor", blocks: ["misconceptions"] },
    { title: "Ověření znalostí · rozdíl vůči indexu", kind: "mastery", blocks: ["mastery-td"] },
    { title: "Ověření znalostí · nižší TER", kind: "mastery", blocks: ["mastery-ter"] },
    { title: "Vysvětli to vlastními slovy", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
};
