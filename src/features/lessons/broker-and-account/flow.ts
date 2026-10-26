import type { StepDefinition } from "../types";

export const brokerAndAccountSteps: Readonly<Record<string, readonly StepDefinition[]>> = {
  "broker-platform-types": [
    { title: "Tři reklamy, jedno rozhodnutí", blocks: ["opening", "prediction"] },
    { title: "Čtyři typy služeb", blocks: ["types"] },
    { title: "Aplikace není vždy broker", blocks: ["intermediary", "app-check"] },
    { title: "Roztřiď osm nabídek", blocks: ["sorting"] },
    { title: "Kdo rozhoduje o nákupech", blocks: ["decides"] },
    { title: "Broker z jiného státu EU", blocks: ["passport", "passport-facts", "passport-check"] },
    { title: "Co v ceně je a není", blocks: ["costs", "cost-myths"] },
    { title: "Jana nechce nic vybírat", blocks: ["persona"] },
    { title: "Stejné nabídky, jiný plán", blocks: ["plan-compare", "one-off"] },
    { title: "Podle čeho vybírat", blocks: ["criteria", "no-best"] },
    { title: "Vybav si rozdíl", kind: "mastery", blocks: ["recall"] },
    { title: "Vysvětli vlastními slovy", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["sources", "summary"] },
  ],
  "broker-fee-schedule": [
    { title: "Kolik stojí 0,15 %?", blocks: ["opening", "prediction"] },
    { title: "Šest položek ceníku", blocks: ["tariff-intro", "tariff"] },
    { title: "Procento, minimum, maximum", blocks: ["fee-rule", "fee-formula", "worked"] },
    { title: "Malý nákup", blocks: ["small-purchase"] },
    { title: "Velký nákup", blocks: ["large-purchase"] },
    { title: "Kde se skrývá náklad u „0 Kč“", blocks: ["hidden", "plan-worked", "free-check"] },
    { title: "Ceník se mění", blocks: ["version", "misconceptions"] },
    { title: "Tvůj profil poplatků", blocks: ["profile"] },
    { title: "Ověření znalostí · minimální poplatek", kind: "mastery", blocks: ["mastery-minimum"] },
    { title: "Vysvětli to vlastními slovy", blocks: ["reflection"] },
    { title: "Co si odneseš", blocks: ["lab-bridge", "summary", "sources"] },
  ],
};
