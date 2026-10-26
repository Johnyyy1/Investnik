import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/marketing/guide-page";
import { guides } from "@/features/guides/content";
import { prepareGuide } from "@/features/guides/prepare";
import { BRAND_NAME } from "@/lib/site";

const find = (slug: string) => guides.find((guide) => guide.slug === slug && guide.status === "available");
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = find((await params).slug);
  if (!guide) notFound();
  const { lesson } = prepareGuide(guide);
  const description = lesson.blocks[0].type === "paragraph" ? lesson.blocks[0].content : "";
  return { title: guide.title, description, alternates: { canonical: `/pruvodce/${guide.slug}` }, openGraph: { type: "article", title: guide.title, description, url: `/pruvodce/${guide.slug}`, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: BRAND_NAME }], siteName: BRAND_NAME, locale: "cs_CZ" } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const guide = find((await params).slug);
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
