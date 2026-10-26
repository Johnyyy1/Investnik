import type { MetadataRoute } from "next";
import { guides } from "@/features/guides/content";
import { SITE_URL } from "@/lib/site";

/** Public pages only; everything else needs a session or is a one-off auth step. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/pruvodce`, changeFrequency: "monthly", priority: 0.7 },
    ...guides.filter((guide) => guide.status === "available").map((guide) => ({ url: `${SITE_URL}/pruvodce/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
