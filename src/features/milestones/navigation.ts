import { lessonLink } from "@/features/learning/catalog";
import { skillItems, getLessonPlacement } from "@/features/learning/curriculum";
import { checkpointModules } from "@/features/mastery/domain";
import type { MilestoneEvidence, MilestoneState } from "./domain";
import { getCapstone, milestoneRules } from "./registry";

export type MilestoneAction = { href: string; label: string };
export type MilestoneNavigation = Partial<Record<"lessons" | "skills" | "capstone", MilestoneAction[]>>;
export type CapstoneReadiness = { hasIps: boolean; labUnlocked: boolean; crisisFinished: boolean };

/** Navigation only: lifetime mastery counts even after a later unsuccessful review. */
export function milestoneANavigation(state: MilestoneState, evidence: MilestoneEvidence, readiness: CapstoneReadiness): MilestoneNavigation {
  if (state.id !== "A" || state.status === "achieved") return {};
  const open = (kind: string) => state.requirements.some((item) => item.kind === kind && item.status === "open");
  const lesson = state.lessons.find((item) => !item.done);
  const mastered = new Set(evidence.attempts.filter((item) => item.correct && item.context !== "lesson").map((item) => item.skillId));
  const levels = milestoneRules.find((rule) => rule.id === "A")!.levels as readonly string[];
  const scope = new Set(state.lessons.map((item) => item.id));
  const project = !readiness.hasIps ? lessonLink("first-plan-ips")
    : !readiness.labUnlocked ? lessonLink(state.lessons.find((item) => !item.done && item.id.startsWith("foundations-"))?.id ?? "foundations-why-invest")
    : !readiness.crisisFinished ? { href: "/lab/training", label: "Dokončit krizový nácvik" }
    : lessonLink(getCapstone("capstone-a-v1")!.lessonId);
  return {
    lessons: open("lessons") && lesson ? [lessonLink(lesson.id)!] : [],
    skills: open("skills") ? checkpointModules.filter((module) => levels.includes(module.levelId) &&
      skillItems.some((item) => scope.has(item.lessonId) && getLessonPlacement(item.lessonId)?.displayModule === module.code && !mastered.has(item.skillId)))
      .map((module) => ({ href: `/learn/checkpoint/${module.code}`, label: `Smíšená kontrola ${module.code} · ${module.title}` })) : [],
    capstone: open("capstone") && project ? [project] : [],
  };
}

export function milestoneANextStep(state: MilestoneState | undefined) {
  return state?.navigation?.lessons?.[0] ?? state?.navigation?.skills?.[0] ?? state?.navigation?.capstone?.[0];
}
