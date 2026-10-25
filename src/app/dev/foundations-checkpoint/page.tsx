import { notFound } from "next/navigation";
import { foundationsCheckpointLesson } from "@/features/lessons/foundations/checkpoint";
import { getGuidedSteps } from "@/features/lessons/steps";
import { LessonDraftPreview } from "@/components/lesson/lesson-draft-preview";

export const metadata = { title: "Kontrola základů · redakční náhled", robots: { index: false, follow: false } };
export default function FoundationsCheckpointPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LessonDraftPreview title={foundationsCheckpointLesson.title} steps={getGuidedSteps(foundationsCheckpointLesson)} />;
}
