import "server-only";
import { capstoneSubmissionForOutput } from "@/features/milestones/capstone-output";
import { submitCapstone } from "@/features/milestones/repository";
import { saveLearnerArtifact } from "./repository";
import type { SaveArtifactInput } from "./schemas";

/**
 * Saves a validated artifact for its session owner. A capstone self-assessment (#198) is submitted first, under the
 * same retry ID: a saved output, which is what lets the lesson step continue, then always has its capstone
 * submission, a retry returns both stored rows, and a failed submission saves no output.
 */
export async function saveOwnedArtifact(userId: string, input: SaveArtifactInput) {
  const capstone = capstoneSubmissionForOutput(input);
  if (capstone) await submitCapstone(userId, { ...capstone, requestId: input.requestId });
  return saveLearnerArtifact(userId, input);
}
