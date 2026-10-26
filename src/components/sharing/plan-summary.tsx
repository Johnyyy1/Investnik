import { summaryLines, type PublicPlan } from "@/features/sharing/domain";
import { formatDate } from "@/lib/formatters";
export function PlanSummary({ plan }: { plan: PublicPlan }) {
  return <div className="min-w-0 space-y-4 [overflow-wrap:anywhere]">
    <p>Výstup učení · snímek verze {plan.version} ze dne {formatDate(plan.createdAt, { timeZone: "Europe/Prague" })}.</p>
    <ul className="space-y-3">{summaryLines(plan.summary).map((line) => <li key={line}>{line}</li>)}</ul>
    <p className="text-small text-secondary">Ukázka osobního postupu, ne doporučení pro ostatní. Nehodnotí kvalitu plánu ani připravenost investovat.</p>
  </div>;
}
