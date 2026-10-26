import { notFound } from "next/navigation";
import { guides } from "@/features/guides/content";
import { GuidePage } from "@/components/marketing/guide-page";
export const metadata = { title: "Náhled průvodce", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const slug = (await params).slug;
  const draft = guides.find((item) => item.slug === slug && item.status === "planned");
  if (!draft) notFound();
  return <GuidePage guide={draft} />;
}
