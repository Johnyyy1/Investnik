import type { StepDefinition } from "../types";

export const firstPlanSteps: Readonly<Record<string, readonly StepDefinition[]>> = {
  "first-plan-ips": [
    { title: "Kdy se rozhodnout?", blocks: ["opening", "prediction"] },
    { title: "Co je investiční plán", blocks: ["what", "why"] },
    { title: "Plán v devíti částech", blocks: ["worked"] },
    { title: "Doplň alokaci", blocks: ["faded"] },
    { title: "Dobré pravidlo", blocks: ["rules", "good-rule"] },
    { title: "Pravidlo pro propad", blocks: ["fall", "fall-practice"] },
    { title: "Kdy plán změnit", blocks: ["change", "misconceptions"] },
    { title: "Ověření · co v plánu chybí", kind: "mastery", blocks: ["recall-sections"] },
    { title: "Ověření · proč předem", kind: "mastery", blocks: ["recall-why"] },
    { title: "Sepiš svůj plán", blocks: ["builder-intro", "builder"], requiredArtifact: { kind: "investment_plan", source: "any_lesson" } },
    { title: "Zhodnoť svůj plán", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
};
