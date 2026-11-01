// Capstone submissions (#126) and first milestone achievements (#456) on a disposable local database: append-only
// versions, request idempotency under concurrency, server-owned and frozen automatic criteria, the locked-Lab guard,
// guests, export and cascade.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../src/db";
import { capstoneSubmission, learnerArtifact, lessonAward, lessonProgress, milestoneAchievement, portfolio, portfolioTrade, progressionUnlock, skillAttempt, user } from "../src/db/schema";
import { PORTFOLIO_LAB_UNLOCK_ID } from "../src/features/progression/unlocks";
import { buildAccountExport, readAccountExportRows, serializeAccountExport } from "../src/features/account/export";
import { deleteLearnerArtifact, hasValidArtifact, saveLearnerArtifact } from "../src/features/artifacts/repository";
import { saveOwnedArtifact } from "../src/features/artifacts/save";
import { loadMilestones, submitCapstone } from "../src/features/milestones/repository";
import { getCapstone } from "../src/features/milestones/registry";
import { crisisPlanCheck, diversifiedCoreCheck, ipsAlignmentCheck } from "../src/features/milestones/criteria";
import { getSkillItem, moduleSkills } from "../src/features/mastery/domain";
import { recordSkillAttempt } from "../src/features/mastery/repository";
import { skillItems } from "../src/features/learning/curriculum";
import { lessonSteps } from "../src/features/progress/transition";
import { completeLesson } from "../src/features/progress/repository";

assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL!).hostname), "Requires a disposable local DB.");
assert.equal(process.env.MILESTONES_QA_DISPOSABLE, "1");
const prefix = `milestoneqa_${randomUUID().replaceAll("-", "")}`;
const ids: string[] = [];
async function identity(kind: "guest" | "account") {
  const id = `${prefix}_${ids.length}`; ids.push(id);
  await db.insert(user).values({ id, email: `${id}@example.com`, name: "Milestone QA", isAnonymous: kind === "guest", anonymousKind: kind === "guest" ? "guest" : null, createdAt: new Date(), updatedAt: new Date() });
  return id;
}
const rated = (capstoneId: string, level = 3, reflection = "Plán jsem dodržel/a.") =>
  ({ ratings: getCapstone(capstoneId)!.criteria.map((criterion) => ({ criterionId: criterion.id, level })), reflection });
const rows = (userId: string) => db.select().from(capstoneSubmission).where(eq(capstoneSubmission.userId, userId)).orderBy(capstoneSubmission.capstoneId, capstoneSubmission.version);

try {
  const owner = await identity("account");
  const other = await identity("account");

  // Retries of one request race and land once; the first stored version answers all of them.
  const requestId = randomUUID();
  const raced = await Promise.all(Array.from({ length: 6 }, () => submitCapstone(owner, { capstoneId: "capstone-d-v1", requestId, selfAssessment: rated("capstone-d-v1") })));
  assert.equal((await rows(owner)).length, 1);
  assert.deepEqual(new Set(raced.map((stored) => stored.id)).size, 1);
  assert.equal(raced[0].version, 1);
  // The same request ID belongs to each user separately.
  assert.equal((await submitCapstone(other, { capstoneId: "capstone-d-v1", requestId, selfAssessment: rated("capstone-d-v1") })).version, 1);
  console.log("PASS: concurrent retries of one request store one version per user.");

  // Distinct requests append consecutive versions, also when they race on the account lock.
  await Promise.all(Array.from({ length: 4 }, (_, index) => submitCapstone(owner, { capstoneId: "capstone-d-v1", requestId: randomUUID(), selfAssessment: rated("capstone-d-v1", 1 + index) })));
  assert.deepEqual((await rows(owner)).map((row) => row.version), [1, 2, 3, 4, 5]);
  await assert.rejects(() => submitCapstone(owner, { capstoneId: "capstone-d-v1", requestId, selfAssessment: rated("capstone-d-v1", 4) }), /cannot be reused/);
  await assert.rejects(() => submitCapstone(owner, { capstoneId: "capstone-c-v1", requestId, selfAssessment: rated("capstone-c-v1") }), /cannot be reused/);
  await assert.rejects(() => submitCapstone(owner, { capstoneId: "capstone-d-v1", requestId: randomUUID(), selfAssessment: { ratings: [], reflection: "x" } }));
  await assert.rejects(() => submitCapstone(owner, { capstoneId: "capstone-z-v1", requestId: randomUUID(), selfAssessment: rated("capstone-d-v1") }), /Unknown capstone/);
  assert.equal((await rows(owner)).length, 5);
  console.log("PASS: versions append in order; reused requests, invalid ratings and unknown capstones are refused.");

  // Lab-based checks never open a portfolio for a locked Lab; missing evidence is unavailable, not failed.
  const a = await submitCapstone(owner, { capstoneId: "capstone-a-v1", requestId: randomUUID(), selfAssessment: rated("capstone-a-v1", 4) });
  assert.deepEqual(Object.fromEntries(Object.entries(a.autoCriteria as Record<string, { status: string; reason?: string }>).map(([id, check]) => [id, [check.status, check.reason]])),
    { "ips-alignment": ["unavailable", "lab-locked"], diversification: ["unavailable", "lab-locked"], crisis: ["unavailable", "no-drill"] });
  assert.equal(a.outcome.passed, false);
  assert.deepEqual(a.artifactRefs, {});
  assert.equal((await db.select().from(portfolio).where(eq(portfolio.userId, owner))).length, 0);
  console.log("PASS: capstone A evidence is server-owned; a locked Lab stays untouched and unrated.");

  // With the Lab open the server reads the real portfolio view: no IPS is unavailable, no fund fails.
  const unlocked = await identity("account");
  await db.insert(progressionUnlock).values({ userId: unlocked, unlockId: PORTFOLIO_LAB_UNLOCK_ID, practiceCapitalMinor: 500_000n, reason: "learning_requirements", unlockedAt: new Date() });
  const open = await submitCapstone(unlocked, { capstoneId: "capstone-a-v1", requestId: randomUUID(), selfAssessment: rated("capstone-a-v1") });
  const [generation] = await db.select().from(portfolio).where(eq(portfolio.userId, unlocked));
  assert.equal((await db.select().from(portfolioTrade).where(eq(portfolioTrade.portfolioId, generation.id))).length, 0);
  assert.deepEqual(open.artifactRefs, { portfolioId: generation.id, ipsVersion: null });
  assert.deepEqual(Object.fromEntries(Object.entries(open.autoCriteria as Record<string, { status: string; reason?: string }>).map(([id, check]) => [id, [check.status, check.reason]])),
    { "ips-alignment": ["unavailable", "no-ips"], diversification: ["fail", "no-fund"], crisis: ["unavailable", "no-drill"] });
  console.log("PASS: an open Lab supplies portfolio evidence without trades or money changes.");

  // A saved thesis passes its check; the verdict is frozen when the artifact later disappears.
  const thesis = await saveLearnerArtifact(owner, { consent: true, requestId: randomUUID(), sourceLessonId: null, content: { kind: "investment_thesis", payload: {
    company: "Fiktivní a. s.", thesis: "Stabilní poptávka a nízké zadlužení.", assumptions: ["Tržby rostou se sektorem"], evidence: ["Výroční zpráva"], risks: ["Regulace"], exitCriteria: ["Marže pod 10 %"], reviewOn: "2027-04-30" } } });
  const c = await submitCapstone(owner, { capstoneId: "capstone-c-v1", requestId: randomUUID(), selfAssessment: rated("capstone-c-v1") });
  assert.deepEqual(c.artifactRefs, { thesisArtifactId: thesis.id, thesisVersion: 1 });
  assert.equal(c.outcome.passed, true);
  await deleteLearnerArtifact(owner, thesis.id);
  const [frozen] = (await rows(owner)).filter((row) => row.capstoneId === "capstone-c-v1");
  assert.deepEqual(frozen.autoCriteria, c.autoCriteria);
  console.log("PASS: automatic criteria and artifact references are frozen in the submission.");

  // Lesson 2.5.4 (#198): saving its self-assessment output submits capstone A first, under the output's retry ID.
  const learner = await identity("account");
  const output = (level: number, requestId = randomUUID()) => ({ consent: true as const, requestId, sourceLessonId: "first-plan-capstone-a", content: { kind: "lesson_output" as const, payload: {
    type: "rubricSelfAssessment" as const, blockId: "self-assessment", text: "Prodej mimo plán v nácviku nenastal. Do IPS doplním pravidlo pro zprávy od známých.",
    ratings: getCapstone("capstone-a-v1")!.criteria.map((criterion) => ({ criterionId: criterion.id, level })) } } });
  const first = output(3);
  const saved = await Promise.all(Array.from({ length: 4 }, () => saveOwnedArtifact(learner, first)));
  assert.equal(new Set(saved.map((artifact) => artifact.id)).size, 1);
  const submitted = await rows(learner);
  assert.deepEqual(submitted.map((row) => [row.capstoneId, row.version, row.requestId]), [["capstone-a-v1", 1, first.requestId]]);
  assert.deepEqual(submitted[0].selfAssessment, { ratings: first.content.payload.ratings, reflection: first.content.payload.text });
  assert.equal(await hasValidArtifact(db, learner, "lesson_output", "first-plan-capstone-a", "self-assessment"), true);
  // Any level submits; a new save appends a version of both rows.
  await saveOwnedArtifact(learner, output(1));
  assert.deepEqual((await rows(learner)).map((row) => row.version), [1, 2]);
  assert.equal((await db.select().from(learnerArtifact).where(eq(learnerArtifact.userId, learner))).length, 2);
  // A refused submission saves no output, so the step stays blocked.
  const guestLearner = await identity("guest");
  await assert.rejects(() => saveOwnedArtifact(guestLearner, output(3)), /saved account/);
  assert.equal((await db.select().from(learnerArtifact).where(eq(learnerArtifact.userId, guestLearner))).length, 0);
  assert.equal((await rows(guestLearner)).length, 0);
  // The lesson is published, so capstone A's requirement is open; a locked Lab leaves it unpassed.
  const learnerA = (await loadMilestones(learner))[0];
  assert.deepEqual(learnerA.requirements.find((item) => item.kind === "capstone")?.status, "open");
  console.log("PASS: capstone A lesson output submits once per retry ID, appends versions and saves nothing when refused.");

  // A counts published lessons (#456); the others stay unavailable while their capstone lesson is unpublished, even with a passing submission.
  const states = await loadMilestones(owner);
  assert.deepEqual(states.map((state) => [state.id, state.status]), [["A", "open"], ["B", "unavailable"], ["C", "unavailable"], ["D", "unavailable"]]);
  assert.equal((await loadMilestones(undefined)).length, 4);
  console.log("PASS: derived milestone states load and never claim unpublished milestones.");

  // First achievement (#456). Evidence is written directly except the final step each case exercises.
  const reachedA = (await loadMilestones(undefined))[0];
  const skillsA = [...new Set(skillItems.map((item) => item.skillId))];
  const achievements = (userId: string) => db.select().from(milestoneAchievement).where(eq(milestoneAchievement.userId, userId));
  const firstDay = new Date(Date.UTC(2026, 9, 1, 10));
  async function seed(userId: string, { skipLesson, skipSkill }: { skipLesson?: string; skipSkill?: string } = {}) {
    await db.insert(lessonProgress).values(reachedA.lessons.filter((lesson) => lesson.id !== skipLesson).map((lesson) => ({ userId, lessonId: lesson.id, status: "completed" as const, lastPosition: 0, completedAt: firstDay, updatedAt: firstDay })));
    await db.insert(skillAttempt).values(skillsA.filter((skillId) => skillId !== skipSkill).map((skillId) => ({ userId, requestId: randomUUID(), skillId, itemId: skillItems.find((item) => item.skillId === skillId)!.id, correct: true, context: "checkpoint" as const, attemptedAt: firstDay })));
    await db.insert(capstoneSubmission).values({ id: randomUUID(), userId, capstoneId: "capstone-a-v1", version: 1, requestId: randomUUID(), artifactRefs: {}, submittedAt: firstDay, selfAssessment: rated("capstone-a-v1"), autoCriteria: {
      "ips-alignment": ipsAlignmentCheck({ value: "100", threshold: null, status: "information", lines: [] }),
      diversification: diversifiedCoreCheck({ valuationComplete: true, holdings: [{ assetType: "etf", portfolioWeightBasisPoints: "9000" }] }),
      crisis: crisisPlanCheck({ finished: true, sellsOutsidePlan: 0 }) } });
  }

  // The checkpoint answer that completes A records it once, also when it races other answers and page reads.
  const bySkill = await identity("account");
  const lastSkill = moduleSkills("1.1")[0];
  await seed(bySkill, { skipSkill: lastSkill });
  assert.deepEqual((await loadMilestones(bySkill))[0].status, "open");
  assert.equal((await achievements(bySkill)).length, 0, "an open milestone has no record");
  const lastItem = getSkillItem(skillItems.find((item) => item.skillId === lastSkill)!.id)!;
  await recordSkillAttempt(bySkill, { requestId: randomUUID(), item: lastItem, correct: false, mode: "checkpoint" });
  assert.equal((await achievements(bySkill)).length, 0, "a wrong answer records nothing");
  const answeredAt = new Date(Date.UTC(2026, 9, 5, 10));
  await Promise.all([
    ...Array.from({ length: 5 }, () => recordSkillAttempt(bySkill, { requestId: randomUUID(), item: lastItem, correct: true, mode: "checkpoint", now: answeredAt })),
    ...Array.from({ length: 5 }, () => loadMilestones(bySkill)),
  ]);
  const [recorded, ...extraRows] = await achievements(bySkill);
  assert.equal(extraRows.length, 0);
  assert.deepEqual([recorded.milestoneId, recorded.scopeVersion, recorded.achievedAt.getTime()], ["A", reachedA.scopeVersion, answeredAt.getTime()]);
  console.log("PASS: racing checkpoint answers and page reads store one record, dated by the evidence, with the scope version.");

  // A record grants nothing; reopening keeps it. Dropping a completion stands in for a newly published required lesson.
  assert.equal((await db.select().from(lessonAward).where(eq(lessonAward.userId, bySkill))).length, 0);
  assert.equal((await db.select().from(progressionUnlock).where(eq(progressionUnlock.userId, bySkill))).length, 0);
  assert.equal((await db.select().from(portfolio).where(eq(portfolio.userId, bySkill))).length, 0);
  await db.delete(lessonProgress).where(and(eq(lessonProgress.userId, bySkill), eq(lessonProgress.lessonId, reachedA.lessons[0].id)));
  assert.equal((await loadMilestones(bySkill))[0].status, "open");
  assert.deepEqual(await achievements(bySkill), [recorded]);
  // Reaching it again never moves the first record.
  await db.insert(lessonProgress).values({ userId: bySkill, lessonId: reachedA.lessons[0].id, status: "completed", lastPosition: 0, completedAt: new Date(), updatedAt: new Date() });
  assert.equal((await loadMilestones(bySkill))[0].status, "achieved");
  assert.deepEqual(await achievements(bySkill), [recorded]);
  console.log("PASS: a record grants nothing, survives reopening and never moves when the milestone is reached again.");

  // Evidence that predates the table is recorded on the next page read, once.
  const byRead = await identity("account");
  await seed(byRead);
  assert.equal((await achievements(byRead)).length, 0);
  await Promise.all(Array.from({ length: 6 }, () => loadMilestones(byRead)));
  assert.deepEqual((await achievements(byRead)).map((row) => [row.milestoneId, row.achievedAt.getTime()]), [["A", firstDay.getTime()]]);
  console.log("PASS: concurrent page reads backfill one record.");

  // A first lesson completion records in its own transaction; a repeated completion changes nothing.
  const byLesson = await identity("account");
  const lastLesson = "foundations-why-invest";
  await seed(byLesson, { skipLesson: lastLesson });
  await db.insert(lessonProgress).values({ userId: byLesson, lessonId: lastLesson, status: "in_progress", lastPosition: lessonSteps(lastLesson).length - 1, updatedAt: firstDay });
  await Promise.all(Array.from({ length: 3 }, () => completeLesson(byLesson, lastLesson)));
  const [viaLesson] = await achievements(byLesson);
  assert.equal(viaLesson.milestoneId, "A");
  assert.equal(viaLesson.achievedAt.getTime(), (await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, byLesson), eq(lessonProgress.lessonId, lastLesson))))[0].completedAt!.getTime());
  assert.equal((await db.select().from(lessonAward).where(eq(lessonAward.userId, byLesson))).length, 1, "the milestone adds no reward receipt");
  console.log("PASS: the completing lesson records milestone A within its transaction.");

  // A capstone that does not pass records nothing, even with every other requirement met.
  const byCapstone = await identity("account");
  await seed(byCapstone);
  await db.delete(capstoneSubmission).where(eq(capstoneSubmission.userId, byCapstone));
  await submitCapstone(byCapstone, { capstoneId: "capstone-a-v1", requestId: randomUUID(), selfAssessment: rated("capstone-a-v1", 4) });
  assert.equal((await achievements(byCapstone)).length, 0);
  console.log("PASS: a capstone that does not pass records nothing.");

  const achievementExport = JSON.parse(serializeAccountExport(buildAccountExport((await readAccountExportRows(db, bySkill))!)));
  assert.deepEqual(achievementExport.milestoneAchievements, [{ milestoneId: "A", scopeVersion: recorded.scopeVersion, achievedAt: recorded.achievedAt.toISOString() }]);
  await db.delete(user).where(eq(user.id, bySkill));
  assert.equal((await achievements(bySkill)).length, 0);
  assert.equal((await achievements(byRead)).length, 1);
  console.log("PASS: the record is exported and cascades with its account only.");

  const guest = await identity("guest");
  await assert.rejects(() => submitCapstone(guest, { capstoneId: "capstone-d-v1", requestId: randomUUID(), selfAssessment: rated("capstone-d-v1") }), /saved account/);
  assert.equal((await rows(guest)).length, 0);
  console.log("PASS: guests cannot submit capstones.");

  const exported = JSON.parse(serializeAccountExport(buildAccountExport((await readAccountExportRows(db, owner))!)));
  assert.equal(exported.capstoneSubmissions.length, (await rows(owner)).length);
  assert.deepEqual(Object.keys(exported.capstoneSubmissions[0]).sort(), ["artifactRefs", "autoCriteria", "capstoneId", "id", "selfAssessment", "submittedAt", "version"]);
  console.log("PASS: account export lists every version without internal keys.");

  await db.delete(user).where(eq(user.id, owner));
  assert.equal((await rows(owner)).length, 0);
  assert.equal((await rows(other)).length, 1);
  console.log("PASS: deleting an account deletes its submissions only.");
} catch (error) {
  console.error(error); process.exitCode = 1;
} finally {
  await db.delete(user).where(inArray(user.id, ids));
  process.exit(process.exitCode ?? 0);
}
