import { loadLearner } from "@/features/learning/load-learner";
import { loadPortfolioLabUnlockStatus } from "@/features/progression/repository";
import { loadPortfolioCardView, type PortfolioCardView } from "@/features/portfolio/service";
import { perfMeasure, perfSegment } from "@/lib/perf";
import { getCurrentUser } from "@/lib/session";
import { loadMilestones } from "@/features/milestones/repository";
import { StudovnaPage } from "@/components/learning/studovna-page";

export const metadata = { title: "Učení" };
export default function LearnPage() {
  return perfSegment("page:/learn", renderLearnPage);
}

async function renderLearnPage() {
  const user = await getCurrentUser();
  // The card waits on quotes, so it streams in on its own instead of holding the lesson content.
  // Its own perf segment, because it can finish after the page segment has logged.
  const portfolio = user ? perfSegment("section:/learn portfolio", () => loadPortfolioCard(user.id)) : Promise.resolve(undefined);
  const [summary, milestones] = await Promise.all([loadLearner(), perfMeasure("milestones.load", "db", () => loadMilestones(user?.id))]);
  return <StudovnaPage summary={summary} portfolio={portfolio} milestones={milestones} />;
}

async function loadPortfolioCard(userId: string): Promise<PortfolioCardView | null | undefined> {
  try {
    const unlock = await loadPortfolioLabUnlockStatus(userId);
    return unlock.unlocked ? await perfMeasure("portfolio.loadPortfolioCardView", "compute", () => loadPortfolioCardView(userId)) : null;
  } catch {
    // Unavailable portfolio data is explicit; learning can still continue.
    return undefined;
  }
}
