import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { learnPrototypeData } from "../_prototype/data";
import { VariantPicker } from "../_prototype/picker";
import { VariantA } from "../_prototype/variant-a";
import { VariantB } from "../_prototype/variant-b";
import { VariantC } from "../_prototype/variant-c";
import { VariantD } from "../_prototype/variant-d";
import { prototypeVariants } from "../_prototype/variants";
import { isLearnScenario } from "../_prototype/scenario-list";
import { learnScenario } from "../_prototype/scenarios";

export const metadata = { title: "Learn · varianta · Development", robots: { index: false, follow: false } };

/** Development-only prototype host: the real app shell, a deterministic demo learner, no database or session. */
export default async function LearnVariantPage({ params, searchParams }: PageProps<"/dev/learn-variants/[variant]">) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { variant } = await params;
  if (!prototypeVariants.some((item) => item.id === variant)) notFound();
  const { lesson, stav, lab } = await searchParams;
  const selectedId = typeof lesson === "string" ? lesson : undefined;
  if (variant === "d") {
    // Learner states (?stav=) and the Lab row's streaming states (?lab=loading|unavailable) are deterministic fixtures.
    const scenario = isLearnScenario(stav) ? stav : "rozpracovano";
    const { workspace, labLocked } = learnScenario(scenario, lab === "loading" || lab === "unavailable" ? lab : undefined);
    return <>
      <AppShell userName="Ukázka" portfolioLabLocked={labLocked}><VariantD workspace={workspace} scenario={scenario} selectedId={selectedId} /></AppShell>
      <VariantPicker active={variant} scenario={scenario} />
    </>;
  }
  const data = learnPrototypeData();
  return <>
    <AppShell userName={data.learnerName} isDemo>
      {variant === "a" ? <VariantA data={data} /> : variant === "b" ? <VariantB data={data} selectedId={selectedId} /> : <VariantC data={data} />}
    </AppShell>
    <VariantPicker active={variant} />
  </>;
}
