import { availableLessons } from "@/features/learning/catalog";
import { displayModules, lessonPlacements, milestones, type MilestoneId } from "@/features/learning/curriculum";
import { checkpointModules, moduleSkills, skillLevel, type SkillAttempt } from "@/features/mastery/domain";
import { capstoneOutcome } from "./criteria";
import { getCapstone, MILESTONE_SKILL_LEVEL, milestoneRules, type MilestoneRule } from "./registry";

/**
 * Milestone state (#126), derived on every read from append-only data and never stored. Each requirement is
 * monotonic, so an achieved milestone stays achieved: lesson completions are lifetime, a skill counts once it has
 * reached Zvládnuté, and a capstone counts from its first passing submission. Publishing new required content
 * into a milestone's scope reopens it for learners who have not completed that content.
 */
export type MilestoneEvidence = {
  completions: readonly { lessonId: string; completedAt: Date }[];
  attempts: readonly (SkillAttempt & { skillId: string })[];
  submissions: readonly { capstoneId: string; autoCriteria: unknown; selfAssessment: unknown; submittedAt: Date }[];
};
export type RequirementStatus = "done" | "open" | "unavailable";
export type MilestoneRequirement = { kind: "milestone" | "lessons" | "skills" | "capstone"; label: string; status: RequirementStatus; done: number; total: number; satisfiedAt: Date | null };
export type MilestoneState = { id: MilestoneId; title: string; status: "achieved" | "open" | "unavailable"; achievedAt: Date | null; requirements: MilestoneRequirement[] };

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
  const modules = displayModules.filter((module) => (rule.levels as readonly string[]).includes(module.levelId) && (module.required === "required" || module.required === "optional-track"));
  const placements = lessonPlacements.filter((placement) => modules.some((module) => module.code === placement.displayModule) && (placement.required === "required" || placement.required === "optional-track"));
  const extra = (rule.lessonCodes ?? []).map((code) => lessonPlacements.find((placement) => placement.displayCode === code));
  const lessons = [...placements, ...extra.flatMap((placement) => placement ? [placement] : [])];
  // A module without placed lessons, an unplaced code or an editorial draft means the content is not there yet.
  const missing = modules.some((module) => !placements.some((placement) => placement.displayModule === module.code))
    || extra.includes(undefined) || lessons.some((placement) => !published.has(placement.lessonId));
  const skills = [...new Set(checkpointModules.filter((module) => modules.some((inScope) => inScope.code === module.code)).flatMap((module) => moduleSkills(module.code)))];
  return { lessonIds: [...new Set(lessons.map((placement) => placement.lessonId))], skills, missing };
}

/** `rules` and `published` default to the registry and catalog; tests pass their own to reach states unpublished content blocks. */
export function milestoneStates(evidence: MilestoneEvidence, rules: readonly MilestoneRule[] = milestoneRules, published: ReadonlySet<string> = new Set(availableLessons.map((lesson) => lesson.id))): MilestoneState[] {
  const completedAt = new Map(evidence.completions.map((row) => [row.lessonId, row.completedAt]));
  const states: MilestoneState[] = [];
  for (const rule of rules) {
    const { lessonIds, skills, missing } = scope(rule, published);
    const capstone = getCapstone(rule.capstoneId)!;
    const firstPass = evidence.submissions.filter((row) => row.capstoneId === capstone.id && capstoneOutcome(capstone, row.autoCriteria, row.selfAssessment).passed)
      .reduce<Date | null>((first, row) => !first || row.submittedAt < first ? row.submittedAt : first, null);
    const requirements = [
      ...rule.requires.map((id) => {
        const earlier = states.find((state) => state.id === id)!;
        return requirement("milestone", `Milník ${id} · ${milestones[id]}`, [earlier.achievedAt], earlier.status === "unavailable");
      }),
      requirement("lessons", "Lekce", lessonIds.map((id) => completedAt.get(id) ?? null), missing),
      ...skills.length ? [requirement("skills", "Dovednosti na úrovni Zvládnuté", skills.map((skillId) => reachedAt(evidence.attempts.filter((attempt) => attempt.skillId === skillId))))] : [],
      requirement("capstone", capstone.title, [firstPass], !published.has(capstone.lessonId)),
    ];
    const achievedAt = requirements.every((item) => item.status === "done") ? latest(requirements.map((item) => item.satisfiedAt)) : null;
    states.push({ id: rule.id, title: milestones[rule.id], achievedAt, requirements,
      status: achievedAt ? "achieved" : requirements.some((item) => item.status === "unavailable") ? "unavailable" : "open" });
  }
  return states;
}
