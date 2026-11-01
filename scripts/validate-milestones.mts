// Capstone submissions (#126) on a disposable local database: append-only versions, request idempotency under
// concurrency, server-owned and frozen automatic criteria, the locked-Lab guard, guests, export and cascade.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "../src/db";
import { capstoneSubmission, learnerArtifact, portfolio, portfolioTrade, progressionUnlock, user } from "../src/db/schema";
import { PORTFOLIO_LAB_UNLOCK_ID } from "../src/features/progression/unlocks";
import { buildAccountExport, readAccountExportRows, serializeAccountExport } from "../src/features/account/export";
import { deleteLearnerArtifact, hasValidArtifact, saveLearnerArtifact } from "../src/features/artifacts/repository";
import { saveOwnedArtifact } from "../src/features/artifacts/save";
import { loadMilestones, submitCapstone } from "../src/features/milestones/repository";
import { getCapstone } from "../src/features/milestones/registry";

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

  // Milestones stay unavailable while in-scope content is unpublished, even with a passing submission.
  const states = await loadMilestones(owner);
  assert.deepEqual(states.map((state) => [state.id, state.status]), [["A", "unavailable"], ["B", "unavailable"], ["C", "unavailable"], ["D", "unavailable"]]);
  assert.equal((await loadMilestones(undefined)).length, 4);
  console.log("PASS: derived milestone states load and never claim unpublished milestones.");

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
