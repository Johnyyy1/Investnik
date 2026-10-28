import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { prepareFirstPurchase } from "./first-purchase-fixtures";
const url = new URL(process.env.DATABASE_URL ?? "");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
assert.equal(url.pathname, "/investi_6a3a_qa");
assert.equal(process.env.PERSONALIZATION_QA_DISPOSABLE, "1");
assert.equal(process.env.MARKET_DATA_PROVIDER, "deterministic");
assert.equal(process.env.FX_DATA_PROVIDER, "deterministic");
const sql = postgres(url.toString(), { prepare: false });
const id = process.env.PERSONALIZATION_QA_USER_ID;
const [owner] = await sql`select email from "user" where id = ${id!}`;
assert.ok(owner?.email.startsWith("personalization-browser-"));
const { foundationsLessons } = await import("../src/features/lessons/foundations/manifest");
const { returnsLessons } = await import("../src/features/lessons/returns/manifest");
const { availableLessons } = await import("../src/features/learning/catalog");
const { lessonSteps } = await import("../src/features/progress/transition");
const { completeLesson } = await import("../src/features/progress/repository");
const { saveLearnerArtifact } = await import("../src/features/artifacts/repository");
const { CHECKUP_LESSON_ID } = await import("../src/features/lessons/before-investing/checkup-model");
const { GOALS_LESSON_ID } = await import("../src/features/lessons/before-investing/goals-model");
const { exampleIps } = await import("../src/features/ips/test-fixtures");
const { executeTrade } = await import("../src/features/portfolio/repository");
const mode = process.env.PERSONALIZATION_QA_LESSONS ?? "foundations";
assert.ok(["foundations", "first-return", "all-published"].includes(mode));
// all-published completes every published lesson, the same catalog that decides when Learn shows the curriculum as complete.
const lessons = mode === "all-published" ? availableLessons : (mode === "foundations" ? foundationsLessons : returnsLessons).filter((lesson) => lesson.status === "available");
for (const lesson of mode === "first-return" ? lessons.slice(0, 1) : lessons) {
  // The synthetic learner explicitly skips goal-setting; real completion still checks the stored output.
  if (lesson.id === GOALS_LESSON_ID) await saveLearnerArtifact(id!, {
    content: { kind: "goal_map", payload: { goals: [], noSpecificGoal: true } },
    sourceLessonId: lesson.id, consent: true, requestId: randomUUID(),
  });
  // The all-complete fixture needs a saved, all-ready check-up so it does not recommend remedial review.
  if (lesson.id === CHECKUP_LESSON_ID) await saveLearnerArtifact(id!, {
    content: { kind: "financial_checkup", payload: { budget: "reviewed", expensiveDebt: "none", reserve: "ready_for_goal", goals: "defined", retirement: "reviewed", nextStep: "continue_learning" } },
    sourceLessonId: lesson.id, consent: true, requestId: randomUUID(),
  });
  // Lesson 2.5.1 completes only with a saved complete IPS, written in the Lab builder outside the lesson.
  if (lesson.id === "first-plan-ips") await saveLearnerArtifact(id!, {
    content: { kind: "investment_plan", payload: exampleIps }, sourceLessonId: null, consent: true, requestId: randomUUID(),
  });
  // Lesson 2.5.2 completes only with verified training evidence; validate-missions covers how a real session earns it.
  if (lesson.id === "first-plan-automation") await sql`insert into mission_attempt (id, user_id, mission_id, request_id, evidence, completed) values (${randomUUID()}, ${id!}, 'training-contributions-v1', 'training', ${sql.json({ fixture: true })}, true)`;
  await sql`insert into lesson_progress (user_id, lesson_id, status, last_position, updated_at) values (${id!}, ${lesson.id}, 'in_progress', ${lessonSteps(lesson.id).length - 1}, now()) on conflict (user_id, lesson_id) do update set last_position = excluded.last_position`;
  if (lesson.id === "first-plan-first-purchase") {
    await prepareFirstPurchase(sql, id!);
    await executeTrade(id!, { instrumentId: "SAMPLE-XNAS:CVETF", quantity: "1.03", side: "BUY", clientIdempotencyKey: randomUUID() });
    const { verifyMission } = await import("../src/features/missions/repository");
    assert.equal((await verifyMission(id!, "ips-etf-purchase-v2", randomUUID())).completed, true);
  }
  await completeLesson(id!, lesson.id);
}
if (mode === "foundations") await executeTrade(id!, { instrumentId: "US-XNAS:AAPL", quantity: "0.1", side: "BUY", clientIdempotencyKey: "00000000-0000-4000-8000-000000000001" });
await sql.end();
process.exit(0);
