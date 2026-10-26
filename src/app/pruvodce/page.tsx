import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { guides } from "@/features/guides/content";
export const metadata = { title: "Průvodce začátky investování", description: "Stručné odpovědi, modelové kalkulačky a praktické lekce pro začínajícího investora.", alternates: { canonical: "/pruvodce" } };
export default function Page() {
  return <LegalPage title="Otázky před první investicí" eyebrow="Průvodce" intro={<p>Začni konkrétní otázkou. Přečti si odpověď a vyzkoušej si vlastní rozhodnutí v lekci.</p>} sections={[{ id: "otazky", title: "Co tě zajímá?", body: <ul>{guides.filter((guide) => guide.status === "available").map((guide) => <li key={guide.id}><Link href={`/pruvodce/${guide.slug}`}>{guide.title}</Link></li>)}</ul> }]} />;
}
