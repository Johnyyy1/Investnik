import { loadLearner } from "@/features/learning/load-learner";
import { loadPortfolioLabUnlockStatus } from "@/features/progression/repository";
import { perfMeasure, perfSegment } from "@/lib/perf";
import { getCurrentUser } from "@/lib/session";
import { loadMilestones } from "@/features/milestones/repository";
import { StudovnaPage } from "@/components/learning/studovna-page";

export const metadata = { title: "Učení" };
export default function LearnPage() {
  return perfSegment("page:/learn", renderLearnPage);
}

async function renderLearnPage() {
  // The layout has redirected anyone without a session and already awaited the unlock status (request-memoized).
  // The Lab row needs only that status and the receipt-derived capital, so /learn waits on no quotes.
  const user = (await getCurrentUser())!;
  const [summary, milestones, lab] = await Promise.all([loadLearner(), perfMeasure("milestones.load", "db", () => loadMilestones(user.id)), loadPortfolioLabUnlockStatus(user.id)]);
  return <StudovnaPage summary={summary} milestones={milestones} lab={lab} />;
}
