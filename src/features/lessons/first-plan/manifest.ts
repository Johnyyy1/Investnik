export const FIRST_PLAN_MODULE_ID = "module-first-plan";

export const firstPlanLessons = [
  { id: "first-plan-ips", slug: "investment-policy-statement", title: "Investiční plán (IPS)", summary: "Sepiš cíle, alokaci a pravidla pro propad dřív, než je budeš potřebovat, a ulož si plán jako měřítko pro Lab.", estimatedMinutes: 18, status: "available" as const },
  { id: "first-plan-automation", slug: "automation", title: "Automatizace: pravidelná investice jako závazek předem", summary: "Nastav si trvalý příkaz a spořicí plán podle IPS a vyzkoušej 12 měsíců pravidelných příspěvků v krizovém nácviku.", estimatedMinutes: 14, status: "available" as const },
  { id: "first-plan-first-purchase", slug: "first-simulated-purchase", title: "První nákup nanečisto", summary: "Ověř instrument, pokyn a celkové náklady a proveď cvičný nákup podle svého plánu.", estimatedMinutes: 13, status: "available" as const },
  { id: "first-plan-capstone-a", slug: "capstone-a", title: "Závěrečný projekt A: plán, nákup a krizový nácvik", summary: "Spoj IPS, cvičné portfolio, náklady a krizový nácvik a posuď se podle rubriky milníku A.", estimatedMinutes: 25, status: "available" as const },
] as const;
