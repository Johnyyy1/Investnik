import { artifactPayloadSchemas, type LearnerArtifact } from "./schemas";

/** Lossless read projection: the original revision remains the export/deletion/continuation authority. */
export function asEtfChecklist(artifact: LearnerArtifact): LearnerArtifact | null {
  if (artifact.kind === "etf_checklist") return artifact;
  if (artifact.kind !== "lesson_output" || artifact.sourceLessonId !== "etfs-selection-checklist" || artifact.payload.type !== "checklist" || artifact.payload.blockId !== "checklist") return null;
  const payload = artifactPayloadSchemas.etf_checklist.parse({ schemaVersion: 2, type: "selection_checklist", checkedItemIds: artifact.payload.checkedItemIds });
  return { ...artifact, kind: "etf_checklist", payload };
}
