import { createHash } from "node:crypto";
import { availableLessons } from "@/features/learning/catalog";
import { displayModules, lessonPlacements, milestones, skillItems, storageModules, type MilestoneId } from "@/features/learning/curriculum";
import { checkpointModules, moduleSkills, skillLevel, type SkillAttempt } from "@/features/mastery/domain";
import { capstoneOutcome } from "./criteria";
import { getCapstone, MILESTONE_SKILL_LEVEL, milestoneRules, type MilestoneRule } from "./registry";

/**
 * Milestone state (#126), derived on every read from append-only data and never stored. Each requirement is
 * monotonic, so an achieved milestone stays achieved: lesson completions are lifetime, a skill counts once it has
 * reached Zvládnuté, and a capstone counts from its first passing submission. The scope holds published lessons only
 * (#456): drafts neither count nor block. Publishing new required content into a milestone's scope reopens it for
 * learners who have not completed that content; `milestone_achievement` keeps that they reached it once (achievements.ts).
 */
export type MilestoneEvidence = {
  completions: readonly { lessonId: string; completedAt: Date }[];
  attempts: readonly (SkillAttempt & { skillId: string })[];
  submissions: readonly { capstoneId: string; autoCriteria: unknown; selfAssessment: unknown; submittedAt: Date }[];
};
export type RequirementStatus = "done" | "open" | "unavailable";
export type MilestoneRequirement = { kind: "milestone" | "lessons" | "skills" | "capstone"; label: string; status: RequirementStatus; done: number; total: number; satisfiedAt: Date | null };
export type MilestoneLesson = { id: string; displayCode: string; title: string; done: boolean };
export type MilestoneState = { id: MilestoneId; title: string; status: "achieved" | "open" | "unavailable"; achievedAt: Date | null; scopeVersion: string; lessons: MilestoneLesson[]; requirements: MilestoneRequirement[] };

const moduleOrder = new Map<string, number>(displayModules.map((module) => [module.code, module.order]));
const lessonTitles = new Map<string, string>(storageModules.flatMap((module) => module.lessons.map((lesson) => [lesson.id, lesson.title] as const)));

const latest = (dates: readonly (Date | null)[]) => dates.some((date) => date === null) ? null
  : dates.reduce<Date | null>((max, date) => !max || date!.getTime() > max.getTime() ? date : max, null);

function requirement(kind: MilestoneRequirement["kind"], label: string, times: readonly (Date | null)[], unavailable = false): MilestoneRequirement {
  const done = times.filter((time) => time !== null).length;
  return { kind, label, done, total: times.length, status: unavailable ? "unavailable" : done === times.length ? "done" : "open", satisfiedAt: unavailable ? null : latest(times) };
}

/** First time the skill's derived level reached the threshold, replaying attempts in order. */
function reachedAt(attempts: readonly SkillAttempt[]) {
  const ordered = [...attempts].sort((a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime());
  return ordered.find((_, index) => skillLevel(ordered.slice(0, index + 1)) >= MILESTONE_SKILL_LEVEL)?.attemptedAt ?? null;
}

function scope(rule: MilestoneRule, published: ReadonlySet<string>) {
  const levelModules = displayModules.filter((module) => (rule.levels as readonly string[]).includes(module.levelId) && (module.required === "required" || module.required === "optional-track"));
  const placements = lessonPlacements.filter((placement) => published.has(placement.lessonId) && levelModules.some((module) => module.code === placement.displayModule) && (placement.required === "required" || placement.required === "optional-track"));
  // A module with no published lesson leaves the scope, and its skills with it.
  const modules = levelModules.filter((module) => placements.some((placement) => placement.displayModule === module.code));
  const extra = (rule.lessonCodes ?? []).map((code) => lessonPlacements.find((placement) => placement.displayCode === code));
  const lessons = [...new Map([...placements, ...extra.flatMap((placement) => placement && published.has(placement.lessonId) ? [placement] : [])].map((placement) => [placement.lessonId, placement])).values()]
    .sort((a, b) => moduleOrder.get(a.displayModule)! - moduleOrder.get(b.displayModule)! || a.order - b.order);
  // Only an unplaced code or a scope without any published lesson means the milestone cannot be earned yet.
  const missing = extra.includes(undefined) || lessons.length === 0;
  const skills = [...new Set(checkpointModules.filter((module) => modules.some((inScope) => inScope.code === module.code)).flatMap((module) => moduleSkills(module.code)))]
    .filter((skillId) => skillItems.some((item) => item.skillId === skillId && published.has(item.lessonId)));
  return { lessons, skills, missing };
}

/** Deterministic fingerprint of what a milestone contains right now; the order of the lists does not matter. */
export function scopeVersion(lessonIds: readonly string[], skills: readonly string[], capstoneId: string) {
  return createHash("sha256").update(JSON.stringify({ lessons: [...lessonIds].sort(), skills: [...skills].sort(), capstone: capstoneId })).digest("hex").slice(0, 16);
}

/** `rules` and `published` default to the registry and catalog; tests pass their own to reach states the current catalog cannot. */
export function milestoneStates(evidence: MilestoneEvidence, rules: readonly MilestoneRule[] = milestoneRules, published: ReadonlySet<string> = new Set(availableLessons.map((lesson) => lesson.id))): MilestoneState[] {
  const completedAt = new Map(evidence.completions.map((row) => [row.lessonId, row.completedAt]));
  const states: MilestoneState[] = [];
  for (const rule of rules) {
    const { lessons, skills, missing } = scope(rule, published);
    const capstone = getCapstone(rule.capstoneId)!;
    const firstPass = evidence.submissions.filter((row) => row.capstoneId === capstone.id && capstoneOutcome(capstone, row.autoCriteria, row.selfAssessment).passed)
      .reduce<Date | null>((first, row) => !first || row.submittedAt < first ? row.submittedAt : first, null);
    const requirements = [
      ...rule.requires.map((id) => {
        const earlier = states.find((state) => state.id === id)!;
        return requirement("milestone", `Milník ${id} · ${milestones[id]}`, [earlier.achievedAt], earlier.status === "unavailable");
      }),
      requirement("lessons", "Lekce", lessons.map((lesson) => completedAt.get(lesson.lessonId) ?? null), missing),
      ...skills.length ? [requirement("skills", "Dovednosti na úrovni Zvládnuté", skills.map((skillId) => reachedAt(evidence.attempts.filter((attempt) => attempt.skillId === skillId))))] : [],
      requirement("capstone", capstone.title, [firstPass], !published.has(capstone.lessonId)),
    ];
    const achievedAt = requirements.every((item) => item.status === "done") ? latest(requirements.map((item) => item.satisfiedAt)) : null;
    states.push({ id: rule.id, title: milestones[rule.id], achievedAt, requirements,
      scopeVersion: scopeVersion(lessons.map((lesson) => lesson.lessonId), skills, capstone.id),
      lessons: lessons.map((lesson) => ({ id: lesson.lessonId, displayCode: lesson.displayCode, title: lessonTitles.get(lesson.lessonId) ?? lesson.lessonId, done: completedAt.has(lesson.lessonId) })),
      status: achievedAt ? "achieved" : requirements.some((item) => item.status === "unavailable") ? "unavailable" : "open" });
  }
  return states;
}
