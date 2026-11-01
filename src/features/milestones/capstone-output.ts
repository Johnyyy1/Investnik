import type { SaveArtifactInput } from "@/features/artifacts/schemas";

/**
 * Capstone lessons (#198) collect the self-assessment with the existing `rubricSelfAssessment` block. Saving that
 * block's output in its lesson also appends a capstone submission: the ratings and text become the submission's
 * ratings and reflection, unchanged. The block's criteria are generated from the capstone registry, so both
 * contracts accept the same payload.
 */
export const capstoneOutputs = [
  { capstoneId: "capstone-a-v1", lessonId: "first-plan-capstone-a", blockId: "self-assessment" },
] as const;

/** The submission a lesson output stands for, or null for every other output. The capstone schema validates it. */
export function capstoneSubmissionForOutput(input: Pick<SaveArtifactInput, "content" | "sourceLessonId">) {
  if (input.content.kind !== "lesson_output" || input.content.payload.type !== "rubricSelfAssessment") return null;
  const { blockId, ratings, text } = input.content.payload;
  const binding = capstoneOutputs.find((entry) => entry.lessonId === input.sourceLessonId && entry.blockId === blockId);
  return binding ? { capstoneId: binding.capstoneId, selfAssessment: { ratings, reflection: text } } : null;
}
