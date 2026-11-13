import { ChevronDown, Circle, CircleCheck, CircleDot } from "lucide-react";
import { AppLink as Link } from "@/components/shell/app-link";
import { cn } from "@/lib/utils";
import type { LearnPrototypeData, PrototypeLesson, PrototypeLevel } from "./data";

export const statusLabel = (lesson: Pick<PrototypeLesson, "done" | "active" | "current">) => lesson.done ? "Hotovo" : lesson.current || lesson.active ? "Rozpracováno" : "Nezačato";

/** Shape carries the state (check, dot, ring); the label is always available as text. */
export function LessonStatusIcon({ lesson, className }: { lesson: Pick<PrototypeLesson, "done" | "active" | "current">; className?: string }) {
  const Icon = lesson.done ? CircleCheck : lesson.current || lesson.active ? CircleDot : Circle;
  return <Icon aria-hidden="true" className={cn("size-icon-sm shrink-0", lesson.done || lesson.current || lesson.active ? "text-primary" : "text-muted", className)} />;
}

const optionalLevels = new Set(["L4", "L5", "L6", "V"]);

/** The registry-driven curriculum as nested native disclosures. Levels without published lessons say so. */
export function CurriculumTree({ levels, hrefFor, selectedId, density = "compact" }: { levels: readonly PrototypeLevel[]; hrefFor: (lesson: PrototypeLesson) => string; selectedId?: string; density?: "compact" | "roomy" }) {
  const roomy = density === "roomy";
  const renderLevel = (level: PrototypeLevel) => <li key={level.id}>
    <details open={level.current} className="group/level">
      <summary className={cn("flex cursor-pointer list-none items-center gap-3 rounded-control px-2 text-foreground hover:bg-surface-muted [&::-webkit-details-marker]:hidden", roomy ? "min-h-control py-2" : "min-h-control-sm py-1.5")}>
        <span className="w-6 shrink-0 font-display text-small font-semibold tabular-nums text-muted">{level.code}</span>
        <span className={cn("min-w-0 flex-1 font-semibold", roomy ? "text-body" : "text-small")}>{level.title}</span>
        <span className="shrink-0 text-microcopy tabular-nums text-secondary">{level.total ? `${level.completed}/${level.total}` : "Připravujeme"}</span>
        <ChevronDown aria-hidden="true" className="size-icon-sm shrink-0 text-secondary group-open/level:rotate-180" />
      </summary>
      <div className={cn("pb-2", roomy ? "pl-11" : "pl-10")}>
        {level.modules.map((module) => <div key={module.code} className="mt-2">
          <p className="py-1 text-microcopy font-semibold text-secondary">{module.code} · {module.title}</p>
          {module.lessons.length ? <ul>
            {module.lessons.map((lesson) => <li key={lesson.id}>
              <Link href={hrefFor(lesson)} aria-current={lesson.id === selectedId ? "page" : lesson.current ? "step" : undefined} className={cn("flex items-start gap-2.5 rounded-control px-2 no-underline hover:bg-surface-muted aria-[current=page]:bg-primary-soft", roomy ? "min-h-control py-3 text-body" : "min-h-control-sm py-2 text-small", lesson.current ? "font-semibold text-foreground" : "text-secondary")}>
                <LessonStatusIcon lesson={lesson} className="mt-1" />
                <span className="min-w-0 flex-1"><span className="tabular-nums text-muted">{lesson.displayCode}</span> {lesson.title}</span>
                <span className="sr-only">, {statusLabel(lesson)}</span>
              </Link>
            </li>)}
          </ul> : <p className="px-2 py-1 text-microcopy text-muted">Připravujeme</p>}
        </div>)}
      </div>
    </details>
  </li>;
  const optional = levels.filter((level) => optionalLevels.has(level.id));
  return <div className="grid gap-4">
    <ul className="grid gap-0.5">{levels.filter((level) => !optionalLevels.has(level.id)).map(renderLevel)}</ul>
    {optional.length > 0 && <div>
      <p className="px-2 pb-1 text-label uppercase text-muted">Prohloubení</p>
      <ul className="grid gap-0.5">{optional.map(renderLevel)}</ul>
    </div>}
  </div>;
}

/** Sample composition: one stacked bar plus a written legend, never colour alone. */
export function CompositionBar({ portfolio }: { portfolio: LearnPrototypeData["portfolio"] }) {
  return <div className="grid gap-2">
    <div className="flex h-2 overflow-hidden rounded-pill bg-track" role="img" aria-label={`Složení portfolia: ${portfolio.map((item) => `${item.label} ${item.percent} %`).join(", ")}`}>
      {portfolio.map((item) => <span key={item.id} style={{ width: `${item.percent}%`, background: item.color }} />)}
    </div>
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-microcopy text-secondary">
      {portfolio.map((item) => <li key={item.id} className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-pill" style={{ background: item.color }} />{item.label} <span className="tabular-nums text-foreground">{item.percent} %</span></li>)}
    </ul>
    <p className="text-microcopy text-muted">Ukázková tržní data</p>
  </div>;
}

export function Recap({ recap, firstStep }: { recap: LearnPrototypeData["current"]["recap"]; firstStep: number }) {
  return <div className="grid gap-4">
    <p className="text-label uppercase text-primary">Co už víš z kroků 1–{firstStep}</p>
    {recap.map((item) => <div key={item.title} className="grid gap-1"><p className="text-small font-semibold text-foreground">{item.title}</p><p className="text-small text-secondary">{item.body}</p></div>)}
  </div>;
}

export function Disclaimer() {
  return <p className="text-microcopy text-muted">Vzdělávání, ne investiční doporučení.</p>;
}
