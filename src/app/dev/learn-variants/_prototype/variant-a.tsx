import { ArrowRight, BookOpen, ChevronDown, Flag, FlaskConical } from "lucide-react";
import { AppLink as Link } from "@/components/shell/app-link";
import { Progress } from "@/components/ui/progress";
import type { LearnPrototypeData } from "./data";
import { NumericQuestion } from "./numeric-question";
import { CurriculumTree, Disclaimer, Recap } from "./parts";

/** A · „Pracovní stůl“: one task. A single column, the continue card is the only raised surface. */
export function VariantA({ data }: { data: LearnPrototypeData }) {
  const { current } = data;
  const milestone = data.milestones[0];
  const lessons = milestone.requirements.find((item) => item.kind === "lessons")!;
  const currentLevel = data.levels.find((level) => level.current)!;
  return <main className="mx-auto grid w-full max-w-standard gap-12 px-4 pt-8 pb-16 min-[375px]:px-5 sm:px-8 lg:gap-16 lg:pt-16">
    <header className="grid gap-2">
      <h1 className="text-section-title text-balance">Vítej zpátky.</h1>
      <p className="text-emphasis text-secondary">Jedna rozdělaná lekce, asi {current.minutesLeft} min do konce.</p>
    </header>

    <section aria-labelledby="a-continue" className="overflow-hidden rounded-surface border border-border-card bg-surface shadow-elevation-1">
      <div className="grid gap-8 p-5 sm:p-10">
        <div className="grid gap-3">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-label uppercase text-primary">Pokračuj</span>
            <span className="text-microcopy text-secondary">{current.displayCode} · {current.moduleTitle} · Lekce&nbsp;{current.lessonIndex} z&nbsp;{current.moduleLessonCount}</span>
          </p>
          <h2 id="a-continue" className="text-page-title text-balance">{current.title}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-secondary">
            <span>Krok {current.stepNumber} ze {current.stepCount} · {current.stepTitle}</span>
            <Progress value={current.stepNumber - 1} total={current.stepCount} label="Postup v lekci" className="h-1.5 max-w-48 min-w-24" />
          </div>
        </div>
        {current.question
          ? <NumericQuestion question={current.question} lessonHref={current.href} />
          : null}
        <Link href={current.href} className="inline-flex min-h-control-sm items-center gap-2 justify-self-start text-small font-semibold text-primary-hover">Otevřít celou lekci<ArrowRight className="size-icon-sm" aria-hidden="true" /></Link>
      </div>
      {current.recap.length > 0 && <details className="group border-t border-divider bg-surface-practice">
        <summary className="flex min-h-control cursor-pointer list-none items-center gap-3 px-5 text-small font-semibold sm:px-10 [&::-webkit-details-marker]:hidden">
          <BookOpen className="size-icon-sm text-primary" aria-hidden="true" />Co už víš<ChevronDown className="ml-auto size-icon-sm text-secondary group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-5 pb-6 sm:px-10"><Recap recap={current.recap} firstStep={current.stepNumber - 1} /></div>
      </details>}
    </section>

    <section aria-label="Milník a Portfolio Lab" className="grid divide-y divide-divider border-y border-divider">
      <Link href="/progress" className="flex min-h-control-lg flex-wrap items-center gap-x-3 gap-y-1 py-3 no-underline">
        <Flag className="size-icon-md text-primary" aria-hidden="true" />
        <span className="font-semibold text-foreground">Milník A · {milestone.title}</span>
        <span className="text-small text-secondary">{lessons.done} z {lessons.total} lekcí · další krok: dokonči lekci {current.displayCode}</span>
        <ArrowRight className="ml-auto size-icon-sm text-secondary" aria-hidden="true" />
      </Link>
      <Link href="/lab/portfolio" className="flex min-h-control-lg flex-wrap items-center gap-x-3 gap-y-1 py-3 no-underline">
        <FlaskConical className="size-icon-md text-primary" aria-hidden="true" />
        <span className="font-semibold text-foreground">Portfolio Lab</span>
        <span className="text-small text-secondary">Cvičný kapitál <span className="tabular-nums text-foreground">{data.practiceCapital}</span></span>
        <ArrowRight className="ml-auto size-icon-sm text-secondary" aria-hidden="true" />
      </Link>
    </section>

    <section aria-labelledby="a-curriculum" className="grid gap-4">
      <div className="grid gap-1">
        <h2 id="a-curriculum" className="text-card-title">Kde jsi v kurikulu</h2>
        <p className="text-small text-secondary">Všechny lekce jsou otevřené. {data.completedCount} z {data.lessonCount} hotovo.</p>
      </div>
      <CurriculumTree levels={[currentLevel]} hrefFor={(lesson) => lesson.href} density="roomy" />
      <details className="group">
        <summary className="flex min-h-control cursor-pointer list-none items-center gap-2 text-small font-semibold text-primary-hover [&::-webkit-details-marker]:hidden">Celé kurikulum · {data.levels.length} úrovní<ChevronDown className="size-icon-sm group-open:rotate-180" aria-hidden="true" /></summary>
        <div className="pt-2"><CurriculumTree levels={data.levels.filter((level) => !level.current)} hrefFor={(lesson) => lesson.href} density="roomy" /></div>
      </details>
    </section>

    <Disclaimer />
  </main>;
}
