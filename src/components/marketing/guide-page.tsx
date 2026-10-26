import { headers } from "next/headers";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { ButtonLink } from "@/components/ui/button";
import { BudgetBuilder } from "@/components/lesson/budget-builder";
import { FundCostComparison } from "@/components/lesson/fund-cost-comparison";
import { FigureDataLabel } from "@/components/learning/figure-data-label";
import { AcquisitionBeacon } from "./acquisition-beacon";
import type { Guide } from "@/features/guides/content";
import { prepareGuide } from "@/features/guides/prepare";
import { BRAND_NAME, SITE_URL } from "@/lib/site";

export async function GuidePage({ guide }: { guide: Guide }) {
  const { lesson, facts, notice, target } = prepareGuide(guide);
  const [answer, explanation] = lesson.blocks.map((block) => block.type === "paragraph" ? block.content : "");
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const sources = [...new Map(facts.flatMap((fact) => fact.sources).map((source) => [source.url, source])).values()];
  return <>
    {guide.status === "available" && <AcquisitionBeacon source={`seo:${guide.slug}`} />}
    {guide.status === "available" && <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: answer, articleBody: `${answer} ${explanation}`, inLanguage: "cs", url: `${SITE_URL}/pruvodce/${guide.slug}`, author: { "@type": "Organization", name: BRAND_NAME }, dateModified: notice?.verifiedAt }).replaceAll("<", "\u003c") }} />}
    <LegalPage title={lesson.title} eyebrow="Průvodce investováním" updatedAt={notice?.verifiedAt ?? "Čeká na ověření"}
      intro={<><p>{answer}</p>{guide.status === "planned" && <p role="status">Koncept · čeká na odbornou revizi. Pouze vývojový náhled.</p>}</>}
      sections={[
        { id: "vysvetleni", title: "Co to znamená v praxi", body: <p>{explanation}</p> },
        ...(guide.figure ? [{ id: "vyzkousej", title: "Vyzkoušej si to", body: <><FigureDataLabel data={{ kind: "model" }} />{guide.figure === "budget" ? <BudgetBuilder /> : <FundCostComparison initialYears="30" />}</> }] : []),
        { id: "pokracuj", title: "Procvič si rozhodnutí", body: <div className="space-y-5">{target && <p><Link href={`/learn/${target.moduleSlug}/${target.slug}`}>Lekce: {target.title}</Link></p>}<ButtonLink href="/sign-up">Začít zdarma a vytvořit účet</ButtonLink><p><Link href="/pruvodce">Další otázky začínajícího investora</Link></p></div> },
        { id: "zdroje", title: "Zdroje a ověření", body: <><p>Vzdělávací obsah, ne daňové ani investiční poradenství · stav k {notice?.verifiedAt ?? "neověřeno"}.</p>{notice?.staleFacts.length ? <p role="status">Údaj může být zastaralý: {notice.staleFacts.join(", ")}</p> : null}<ul>{sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ul></> },
      ]} />
  </>;
}
