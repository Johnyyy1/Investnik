import type { StepDefinition } from "../types";

export const euFundsAndEtfsSteps: Readonly<Record<string, readonly StepDefinition[]>> = {
  "etfs-selection-checklist": [
    { title: "Tři fondy, jeden plán", blocks: ["opening", "prediction"] },
    { title: "Osm kritérií", blocks: ["criteria"] },
    { title: "Zásadní, nebo rozlišující?", blocks: ["categorize"] },
    { title: "Vyřaď první fond", blocks: ["overview-intro", "overview"] },
    { title: "Checklist pro fond A", blocks: ["worked"] },
    { title: "Spočítej rozdíl TER", blocks: ["faded"] },
    { title: "A, nebo B?", blocks: ["decision"] },
    { title: "Pasti v názvu", blocks: ["traps", "trap-esg"] },
    { title: "Ověření · proč nestačí TER", kind: "mastery", blocks: ["recall"] },
    { title: "Tvůj checklist", blocks: ["checklist-intro", "checklist"], requiredArtifact: { kind: "lesson_output", source: "current_lesson", blockId: "checklist" } },
    { title: "Zdůvodni volbu", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
};
