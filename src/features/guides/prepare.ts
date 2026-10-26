import { availableLessons } from "@/features/learning/catalog";
import { checkPublishedFacts } from "@/features/facts/check-published";
import { contentReviews, type ContentReview } from "@/features/facts/content-reviews";
import { prepareLessonFacts } from "@/features/facts/lesson-facts";
import { factRegistry } from "@/features/facts/registry";
import { factToday } from "@/features/facts/resolve";
import type { FactVersion } from "@/features/facts/types";
import { guides, guideAsLesson, type Guide } from "./content";

export function prepareGuide(guide: Guide, today = factToday(), registry: readonly FactVersion[] = factRegistry, reviews: readonly ContentReview[] = contentReviews) {
  const lesson = guideAsLesson(guide);
  const published = guide.status === "available";
  checkPublishedFacts(registry, [lesson], [guide], today, reviews);
  const prepared = prepareLessonFacts(lesson, registry, { today, published });
  const target = availableLessons.find((item) => item.id === guide.lessonId);
  if (published && !target) throw new Error(`Guide ${guide.id} needs a published destination lesson`);
  return { ...prepared, target };
}
export function checkGuides(today = factToday()) {
  for (const guide of guides) prepareGuide(guide, today);
}
