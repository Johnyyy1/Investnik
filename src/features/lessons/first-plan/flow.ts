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
  "first-plan-automation": [
    { title: "Až trh spadne", blocks: ["opening", "prediction"] },
    { title: "Závazek předem", blocks: ["commitment", "smart"] },
    { title: "Jak to nastavit", blocks: ["setup", "worked"] },
    { title: "Doplň den nákupu", blocks: ["faded"] },
    { title: "Kolik vložíš", blocks: ["total"] },
    { title: "Mise v Labu", blocks: ["mission-intro", "mission"] },
    { title: "Pravidelnost není časování", blocks: ["timing", "misconceptions"] },
    { title: "Trh klesl o 8 %", blocks: ["dip", "dip-decision"] },
    { title: "Ověření · proč automat", kind: "mastery", blocks: ["recall-why"] },
    { title: "Ověření · pravidelnost a ztráty", kind: "mastery", blocks: ["recall-losses"] },
    { title: "Tvoje pravidlo", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
};
