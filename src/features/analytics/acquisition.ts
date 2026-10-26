import { guides } from "@/features/guides/content";
export function acquisitionSource(value: string | null) {
  if (value === "share:investment-plan") return value;
  return guides.some((guide) => guide.status === "available" && value === `seo:${guide.slug}`) ? value : null;
}
