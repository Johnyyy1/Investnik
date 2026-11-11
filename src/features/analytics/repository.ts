import "server-only";
import { acquisitionSource } from "./acquisition";
import { asc, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  analyticsAcquisitionDay, analyticsEarlyReturn, analyticsLandingViewDay, learnerArtifact, learningProfile, lessonAward, lessonProgress, milestoneAchievement, portfolio, portfolioTrade,
  skillAttempt, trainingAction, trainingSession, user,
} from "@/db/schema";
import { diagnosticV2Probes, readDiagnosticV2 } from "@/features/personalization/diagnostic-v2";
import { actionFromRow, replayTraining, trainingSetup } from "@/features/training/domain";
import { analyticsDate, isEarlyReturnDay, type LearnerFacts, type LessonProgressFact } from "./funnel";
import { drillFacts, type EntryAnswer, type OutcomeAttempt, type OutcomeLearner } from "./outcomes";

type Database = Pick<PostgresJsDatabase<Record<string, unknown>>, "execute">;

/** One more landing-page view on today's Prague calendar day. */
export async function recordLandingView(database: Database, now = new Date()) {
  await database.execute(sql`
    insert into ${analyticsLandingViewDay} (day, views) values (${analyticsDate(now)}, 1)
    on conflict (day) do update set views = ${analyticsLandingViewDay.views} + 1`);
}

/** Each channel view is included in the existing public-entry denominator in the same transaction. */
export async function recordAcquisitionView(database: Pick<PostgresJsDatabase<Record<string, unknown>>, "transaction">, source: string, now = new Date()) {
  if (!acquisitionSource(source)) throw new Error("Unknown acquisition source");
  await database.transaction(async (tx) => {
    await recordLandingView(tx, now);
    await tx.execute(sql`insert into ${analyticsAcquisitionDay} (day, source, views) values (${analyticsDate(now)}, ${source}, 1)
      on conflict (day, source) do update set views = ${analyticsAcquisitionDay.views} + 1`);
  });
}

/**
 * Records the learner's first return on calendar days 1–7 after they started. Outside that window it
 * writes nothing, so the table never grows past one row per learner. Demo identities are not learners.
 */
export async function recordEarlyReturn(database: Database, learner: { id: string; createdAt: Date }, now = new Date()) {
  if (!isEarlyReturnDay(learner.createdAt, now)) return;
  await database.execute(sql`
    insert into ${analyticsEarlyReturn} (user_id, returned_at) values (${learner.id}, ${now.toISOString()}::timestamptz)
    on conflict (user_id) do nothing`);
}

/** Saved accounts and guests; anonymous rows without a kind predate guests and are demos. */
const isLearner = sql`(not ${user.isAnonymous} or ${user.anonymousKind} = 'guest')`;

const toDate = (value: Date | string | null) => value === null ? null : new Date(value);

/**
 * Everything the funnel report needs, read from existing records. User IDs serve only as opaque keys to
 * group rows per learner; no name, e-mail or answer content is selected.
 */
export async function loadFunnelFacts(database: Database) {
  const [learners, progress, visits, acquisition] = await Promise.all([
    database.execute<{ key: string; guest: boolean; started_at: string; diagnostic_at: string | null; first_lesson_at: string | null; first_artifact_at: string | null; first_lab_trade_at: string | null; returned_at: string | null; milestone_a_at: string | null; milestone_a_scope: string | null }>(sql`
      select ${user.id} as key, ${user.isAnonymous} as guest, ${user.createdAt} as started_at,
        case when ${learningProfile.diagnosticResult} is not null then ${learningProfile.personalizedOnboardingCompletedAt} end as diagnostic_at,
        (select min(${lessonAward.awardedAt}) from ${lessonAward} where ${lessonAward.userId} = ${user.id}) as first_lesson_at,
        (select min(${learnerArtifact.createdAt}) from ${learnerArtifact} where ${learnerArtifact.userId} = ${user.id}) as first_artifact_at,
        (select min(${portfolioTrade.executedAt}) from ${portfolioTrade} join ${portfolio} on ${portfolio.id} = ${portfolioTrade.portfolioId}
          where ${portfolio.userId} = ${user.id}) as first_lab_trade_at,
        ${analyticsEarlyReturn.returnedAt} as returned_at,
        ${milestoneAchievement.achievedAt} as milestone_a_at, ${milestoneAchievement.scopeVersion} as milestone_a_scope
      from ${user}
      left join ${learningProfile} on ${learningProfile.userId} = ${user.id}
      left join ${analyticsEarlyReturn} on ${analyticsEarlyReturn.userId} = ${user.id}
      left join ${milestoneAchievement} on ${milestoneAchievement.userId} = ${user.id} and ${milestoneAchievement.milestoneId} = 'A'
      where ${isLearner}`),
    database.execute<{ key: string; lesson_id: string; completed_at: string | null; updated_at: string }>(sql`
      select ${lessonProgress.userId} as key, ${lessonProgress.lessonId} as lesson_id, ${lessonProgress.completedAt} as completed_at, ${lessonProgress.updatedAt} as updated_at
      from ${lessonProgress} join ${user} on ${user.id} = ${lessonProgress.userId}
      where ${isLearner}`),
    database.execute<{ day: string; views: number }>(sql`select ${analyticsLandingViewDay.day}::text as day, ${analyticsLandingViewDay.views} as views from ${analyticsLandingViewDay}`),
    database.execute<{ day: string; source: string; views: number }>(sql`select day::text, source, views from ${analyticsAcquisitionDay}`),
  ]);
  return {
    learners: [...learners].map((row): LearnerFacts => ({
      key: row.key,
      kind: row.guest ? "guest" : "account",
      startedAt: new Date(row.started_at),
      diagnosticAt: toDate(row.diagnostic_at),
      firstLessonAt: toDate(row.first_lesson_at),
      firstArtifactAt: toDate(row.first_artifact_at),
      firstLabTradeAt: toDate(row.first_lab_trade_at),
      returnedAt: toDate(row.returned_at),
      milestoneAAt: toDate(row.milestone_a_at),
      milestoneAScopeVersion: row.milestone_a_scope,
    })),
    progress: [...progress].map((row): LessonProgressFact => ({ key: row.key, lessonId: row.lesson_id, completedAt: toDate(row.completed_at), updatedAt: new Date(row.updated_at) })),
    acquisition: [...acquisition].map((row) => ({ day: row.day, source: row.source, views: Number(row.views) })),
    visits: [...visits].map((row) => ({ day: row.day, views: Number(row.views) })),
  };
}

const correctAnswers = new Map(diagnosticV2Probes.flatMap((probe) => probe.items.map((item) => [item.id, item.correctAnswer] as const)));

/**
 * Everything the learning-outcome report (#130) needs, read from existing append-only records: milestone A
 * achievements, skill attempts, the latest entry-test answers and replayed crisis drills. Learners only (no demos);
 * user IDs serve as opaque keys and no name, e-mail or free-text answer is selected.
 */
export async function loadOutcomeFacts(database: Pick<PostgresJsDatabase<Record<string, unknown>>, "select">) {
  // shortcut: reads every learner's rows into memory; fine at S1 scale (~1 000 learners), stream or aggregate in SQL beyond that.
  const [learners, attempts, profiles, sessions, actions] = await Promise.all([
    database.select({ key: user.id, guest: user.isAnonymous, milestoneAAt: milestoneAchievement.achievedAt }).from(user)
      .leftJoin(milestoneAchievement, sql`${milestoneAchievement.userId} = ${user.id} and ${milestoneAchievement.milestoneId} = 'A'`).where(isLearner),
    database.select({ key: skillAttempt.userId, skillId: skillAttempt.skillId, itemId: skillAttempt.itemId, correct: skillAttempt.correct, context: skillAttempt.context, attemptedAt: skillAttempt.attemptedAt })
      .from(skillAttempt).innerJoin(user, eq(user.id, skillAttempt.userId)).where(isLearner),
    database.select({ key: learningProfile.userId, diagnosticResult: learningProfile.diagnosticResult })
      .from(learningProfile).innerJoin(user, eq(user.id, learningProfile.userId)).where(isLearner),
    database.select({ session: trainingSession }).from(trainingSession).innerJoin(user, eq(user.id, trainingSession.userId)).where(isLearner),
    database.select({ sessionId: trainingAction.sessionId, kind: trainingAction.kind, amountMinor: trainingAction.amountMinor, quantity: trainingAction.quantity })
      .from(trainingAction).innerJoin(trainingSession, eq(trainingSession.id, trainingAction.sessionId)).innerJoin(user, eq(user.id, trainingSession.userId))
      .where(isLearner).orderBy(asc(trainingAction.sessionId), asc(trainingAction.sequence)),
  ]);
  const actionsBySession = Map.groupBy(actions, (row) => row.sessionId);
  return {
    learners: learners.map((row): OutcomeLearner => ({ key: row.key, kind: row.guest ? "guest" : "account", milestoneAAt: row.milestoneAAt })),
    attempts: attempts satisfies OutcomeAttempt[],
    entry: profiles.flatMap(({ key, diagnosticResult }): EntryAnswer[] =>
      (readDiagnosticV2(diagnosticResult)?.answers ?? []).map((answer) => ({ key, itemId: answer.itemId, correct: correctAnswers.get(answer.itemId) === answer.optionId }))),
    drills: sessions.map(({ session }) => {
      const setup = trainingSetup(session);
      return drillFacts(session.userId, session.startedAt, setup, replayTraining(setup, (actionsBySession.get(session.id) ?? []).map(actionFromRow)));
    }),
  };
}
