import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { learnPrototypeData } from "../_prototype/data";
import { VariantPicker } from "../_prototype/picker";
import { VariantA } from "../_prototype/variant-a";
import { VariantB } from "../_prototype/variant-b";
import { VariantC } from "../_prototype/variant-c";
import { VariantD } from "../_prototype/variant-d";
import { prototypeVariants } from "../_prototype/variants";

export const metadata = { title: "Learn · varianta · Development", robots: { index: false, follow: false } };

/** Development-only prototype host: the real app shell, a deterministic demo learner, no database or session. */
export default async function LearnVariantPage({ params, searchParams }: PageProps<"/dev/learn-variants/[variant]">) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { variant } = await params;
  if (!prototypeVariants.some((item) => item.id === variant)) notFound();
  const { lesson } = await searchParams;
  const data = learnPrototypeData();
  return <>
    <AppShell userName={data.learnerName} isDemo>
      {variant === "a" ? <VariantA data={data} /> : variant === "b" ? <VariantB data={data} selectedId={typeof lesson === "string" ? lesson : undefined} /> : variant === "c" ? <VariantC data={data} /> : <VariantD data={data} selectedId={typeof lesson === "string" ? lesson : undefined} />}
    </AppShell>
    <VariantPicker active={variant} />
  </>;
}
