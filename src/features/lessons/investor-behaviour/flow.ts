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
};
