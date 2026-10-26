import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { readPublicShare } from "@/features/sharing/repository";
import { LegalPage } from "@/components/legal/legal-page";
import { PlanSummary } from "@/components/sharing/plan-summary";
import { ButtonLink } from "@/components/ui/button";
import { AcquisitionBeacon } from "@/components/marketing/acquisition-beacon";
import { BRAND_NAME } from "@/lib/site";
import { formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";
const read = cache(readPublicShare);
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  if (!await read(token)) notFound();
  return { title: "Můj investiční postup", description: "Sdílený výstup učení: pravidla kontroly a údržby plánu, bez částek a instrumentů.", robots: { index: false, follow: false }, openGraph: { title: "Můj investiční postup", description: "Vytvoř si vlastní investiční plán.", type: "website", siteName: BRAND_NAME, url: `/sdileni/${token}`, images: [{ url: `/sdileni/${token}/obrazek`, width: 1200, height: 630, alt: "Sdílený postup investora" }] }, twitter: { card: "summary_large_image", images: [`/sdileni/${token}/obrazek`] } };
}
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const plan = await read((await params).token);
  if (!plan) notFound();
  return <><AcquisitionBeacon source="share:investment-plan" /><LegalPage title="Můj investiční postup" eyebrow="Sdílený výstup učení" updatedAt={formatDate(plan.createdAt, { timeZone: "Europe/Prague" })} intro={<PlanSummary plan={plan} />} sections={[
    { id: "vlastni", title: "Jaký bude tvůj plán?", body: <div className="space-y-4"><p>Procvič si cíle, náklady i rozhodování při poklesu. Tvůj výstup zůstane soukromý, dokud se ho nerozhodneš sdílet.</p><ButtonLink href="/sign-up">Vytvoř si vlastní</ButtonLink></div> },
  ]} /></>;
}
