import type { AuthoredLesson } from "@/features/lessons/types";

export type Guide = {
  id: string; slug: string; title: string; answer: string; explanation: string;
  lessonId: string; status: "available" | "planned";
  kind?: "tax" | "regulatory";
  figure?: "budget" | "fund-costs";
};
export const guides: readonly Guide[] = [
  { id: "guide-budget", slug: "rozpocet-a-mira-uspor", title: "Jak spočítat rozpočet a míru úspor?", answer: "{{plan.rozpocet}}", explanation: "Zkus si modelový rozpočet a pak si postup procvič v lekci. Vlastní údaje z kalkulačky nikam neposíláme.", lessonId: "before-investing-budget", status: "available", figure: "budget" },
  { id: "guide-costs", slug: "kolik-stoji-poplatky", title: "Kolik mě dlouhodobě stojí investiční poplatky?", answer: "{{plan.naklady_fondu}}", explanation: "Změň modelové náklady a dobu investování. Výsledek ukazuje dopad předpokladů, nikoli předpověď. V lekci rozlišíš náklady fondu od poplatků brokera.", lessonId: "foundations-funds", status: "available", figure: "fund-costs" },
  { id: "guide-etf", slug: "co-je-etf", title: "Co je ETF a jak funguje?", answer: "{{plan.etf}}", explanation: "V lekci si na ukázkách vyzkoušíš rozlišit způsob obchodování, správu a náklady fondu. Nevybíráme konkrétní fond za tebe.", lessonId: "foundations-funds", status: "available" },
  { id: "guide-horizon", slug: "sporit-nebo-investovat", title: "Mám spořit, nebo investovat?", answer: "{{plan.horizont}}", explanation: "Zkus si situaci: peníze na bydlení budeš potřebovat v pevném termínu, peníze na vzdálený cíl mohou počkat. Co by pro každý cíl znamenal propad těsně před výběrem? V lekci sestavíš vlastní mapu cílů.", lessonId: "before-investing-goals", status: "available" },
  { id: "guide-dip", slug: "jak-funguje-dip", title: "Jak funguje DIP?", answer: "Podmínky daňové podpory DIP: {{dip.podminky}}.", explanation: "Koncept čeká na odbornou revizi aktuálních podmínek a výjimek. Nejde o zveřejněný návod ani doporučení produktu.", lessonId: "before-investing-retirement-products", status: "planned", kind: "tax" },
  { id: "guide-tax", slug: "musim-danit-etf", title: "Musím danit ETF?", answer: "Záleží na druhu příjmu a splnění podmínek osvobození. Hodnotový test cenných papírů: {{dan.limit_100k}}.", explanation: "Koncept musí rozlišit prodejní příjmy, zisk a distribuce. Časový test a evidence tranší vyžadují samostatnou revizi: {{dan.casovy_test_cp}}.", lessonId: "taxes-filing-obligation", status: "planned", kind: "tax" },
  { id: "guide-broker", slug: "jak-overit-brokera", title: "Jak ověřit brokera?", answer: "{{cnb.jerrs}}", explanation: "Koncept učí ověřit právní subjekt, rozsah oprávnění, domovský dohled a shodu kontaktů v registru. Nepřidává žebříček ani jména brokerů; čeká na odbornou revizi postupu.", lessonId: "broker-platform-types", status: "planned", kind: "regulatory" },
];

/** Reuse the lesson token resolver and expert gate; guide IDs share the review log's stable identity field. */
export function guideAsLesson(guide: Guide): AuthoredLesson {
  return { id: guide.id, slug: guide.slug, moduleSlug: "pruvodce", title: guide.title, eyebrow: "Průvodce", position: 1, estimatedMinutes: 1, sections: [],
    ...(guide.kind ? { factContext: { kind: guide.kind } } : {}),
    blocks: [{ id: "answer", type: "paragraph", content: guide.answer }, { id: "explanation", type: "paragraph", content: guide.explanation }] };
}
