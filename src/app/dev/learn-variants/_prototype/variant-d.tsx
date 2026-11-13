import { ArrowRight, ChevronRight, Clock3, Flag, FlaskConical } from "lucide-react";
import { AppLink as Link } from "@/components/shell/app-link";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CurriculumSheet } from "./curriculum-sheet";
import type { LearnPrototypeData, PrototypeLesson, PrototypeLevel } from "./data";
import { LessonStatusIcon, statusLabel } from "./parts";
import { CollapsibleWorkspace, FocusedQuestion } from "./variant-d-client";

const base = "/dev/learn-variants/d";
const optionalLevels = new Set(["L4", "L5", "L6", "V"]);
const summaryClass = "flex cursor-pointer list-none items-center gap-2.5 rounded-control px-2 hover:bg-surface-muted [&::-webkit-details-marker]:hidden";

/**
 * The compact rail. Only the current level is open; its finished lessons fold into one row, so the
 * learner sees where they are and what follows rather than all 52 lessons. Advanced levels share one disclosure.
 * `touch` is the sheet on phones: 44px rows instead of the 36px pointer rows.
 */
function CompactTree({ levels, selectedId, touch = false }: { levels: readonly PrototypeLevel[]; selectedId: string; touch?: boolean }) {
  const row = touch ? "min-h-control-sm" : "min-h-9";
  const lessonLink = (lesson: PrototypeLesson) => <li key={lesson.id}>
    <Link href={lesson.current ? base : `${base}?lesson=${lesson.id}`} aria-current={lesson.id === selectedId ? "page" : undefined}
      className={cn("flex items-start gap-2.5 rounded-control px-2 py-2 text-small no-underline hover:bg-surface-muted aria-[current=page]:bg-primary-soft aria-[current=page]:text-foreground", row, lesson.current ? "font-semibold text-foreground" : "text-secondary")}>
      <LessonStatusIcon lesson={lesson} className="mt-[0.1875rem]" />
      <span className="min-w-0 flex-1 text-pretty">{lesson.title}</span>
      <span className="sr-only">, {statusLabel(lesson)}</span>
    </Link>
  </li>;
  const level = (item: PrototypeLevel) => <li key={item.id}>
    <details open={item.current} className="group/level">
      <summary className={cn(summaryClass, row, "py-1.5")}>
        <span className="w-5 shrink-0 font-display text-small font-semibold tabular-nums text-muted">{item.code}</span>
        <span className={cn("min-w-0 flex-1 text-small text-pretty", item.current ? "font-semibold text-foreground" : "text-secondary")}>{item.title}</span>
        <span className="shrink-0 text-microcopy tabular-nums text-muted">{item.total ? `${item.completed}/${item.total}` : "Brzy"}</span>
        <ChevronRight aria-hidden="true" className="size-icon-xs shrink-0 text-muted group-open/level:rotate-90" />
      </summary>
      <div className="grid gap-3 pt-1 pb-3 pl-5">
        {item.modules.map((module) => {
          const done = module.lessons.filter((lesson) => lesson.done && lesson.id !== selectedId);
          const rest = module.lessons.filter((lesson) => !done.includes(lesson));
          return <div key={module.code} className="grid gap-0.5">
            {item.modules.length > 1 && <p className="px-2 pt-1 text-microcopy text-muted">{module.title}</p>}
            {module.lessons.length === 0 && <p className="px-2 text-microcopy text-muted">Připravujeme</p>}
            {done.length > 1
              ? <details className="group/done">
                <summary className={cn(summaryClass, row, "py-2 text-small text-secondary")}>
                  <LessonStatusIcon lesson={{ done: true, active: false, current: false }} />
                  <span className="flex-1">{done.length} {done.length < 5 ? "hotové lekce" : "hotových lekcí"}</span>
                  <ChevronRight aria-hidden="true" className="size-icon-xs text-muted group-open/done:rotate-90" />
                </summary>
                <ul className="grid gap-0.5">{done.map(lessonLink)}</ul>
              </details>
              : <ul className="grid gap-0.5">{done.map(lessonLink)}</ul>}
            <ul className="grid gap-0.5">{rest.map(lessonLink)}</ul>
          </div>;
        })}
      </div>
    </details>
  </li>;
  const optional = levels.filter((item) => optionalLevels.has(item.id));
  return <div className="grid gap-1">
    <ul className="grid gap-0.5">{levels.filter((item) => !optionalLevels.has(item.id)).map(level)}</ul>
    {optional.length > 0 && <details className="group/more mt-2 border-t border-divider pt-2">
      <summary className={cn(summaryClass, row, "py-1.5 text-small text-secondary")}>
        <span className="flex-1">Prohloubení · {optional.length} úrovně</span>
        <ChevronRight aria-hidden="true" className="size-icon-xs text-muted group-open/more:rotate-90" />
      </summary>
      <ul className="grid gap-0.5 pt-1">{optional.map(level)}</ul>
    </details>}
  </div>;
}

/** Lesson progress as one segment per step: a finished step is filled, the open one is tinted. */
function StepMeter({ step, total }: { step: number; total: number }) {
  return <div role="progressbar" aria-label={`Postup v lekci: krok ${step} ze ${total}`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={step - 1} className="flex w-full max-w-56 gap-1">
    {Array.from({ length: total }, (_, index) => <span key={index} className={cn("h-1 flex-1 rounded-pill", index < step - 1 ? "bg-progress" : index === step - 1 ? "bg-primary-tint" : "bg-track")} />)}
  </div>;
}

/** D · „Studijní pracoviště“: B's persistent curriculum, compact and collapsible, around A's single focused task. */
export function VariantD({ data, selectedId }: { data: LearnPrototypeData; selectedId?: string }) {
  const { current } = data;
  const all = data.levels.flatMap((level) => level.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))));
  const selected = all.find((lesson) => lesson.id === selectedId && lesson.id !== current.id);
  const currentLesson = all.find((lesson) => lesson.id === current.id)!;
  const next = data.upcoming[0];
  const milestone = data.milestones[0];
  const lessons = milestone.requirements.find((item) => item.kind === "lessons")!;
  const progress = `${data.completedCount}/${data.lessonCount}`;
  const activeId = selected?.id ?? current.id;

  return <CollapsibleWorkspace progress={progress} rail={<CompactTree levels={data.levels} selectedId={activeId} />}>
    <main className="mx-auto grid w-full grid-cols-[minmax(0,1fr)] max-w-reading min-w-0 content-start gap-12 px-4 pt-6 pb-16 min-[375px]:px-5 sm:px-8 lg:gap-14 lg:pt-14">
      {selected
        ? <section aria-labelledby="d-title" className="grid grid-cols-[minmax(0,1fr)] gap-6">
          <header className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-microcopy text-secondary"><LessonStatusIcon lesson={selected} />{statusLabel(selected)} · {selected.moduleTitle}</p>
              <CurriculumSheet><CompactTree levels={data.levels} selectedId={activeId} touch /></CurriculumSheet>
            </div>
            <h1 id="d-title" className="text-page-title text-balance [overflow-wrap:anywhere]">{selected.title}</h1>
            {selected.summary && <p className="max-w-[60ch] text-emphasis text-pretty text-secondary">{selected.summary}</p>}
            <p className="flex items-center gap-2 text-small text-secondary"><Clock3 className="size-icon-sm" aria-hidden="true" />Asi {selected.estimatedMinutes} min</p>
          </header>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href={selected.href} className="max-sm:w-full">{selected.done ? "Zopakovat lekci" : "Začít lekci"}<ArrowRight className="-mr-0.5 size-icon-sm" aria-hidden="true" /></ButtonLink>
            <Link href={base} className="inline-flex min-h-control-sm items-center text-small font-semibold text-primary-hover">Zpět na rozdělanou lekci: {current.title}</Link>
          </div>
        </section>
        : <section aria-labelledby="d-title" className="grid grid-cols-[minmax(0,1fr)] gap-8">
          <header className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-label uppercase text-primary">Rozdělaná lekce</p>
              <CurriculumSheet><CompactTree levels={data.levels} selectedId={activeId} touch /></CurriculumSheet>
            </div>
            <h1 id="d-title" className="text-page-title text-balance [overflow-wrap:anywhere]">{current.title}</h1>
            {currentLesson.summary && <p className="max-w-[60ch] text-emphasis text-pretty text-secondary">{currentLesson.summary}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
              <StepMeter step={current.stepNumber} total={current.stepCount} />
              <span className="text-microcopy text-secondary">{current.moduleTitle} · asi {current.minutesLeft} min do konce</span>
            </div>
          </header>

          <div className="grid gap-6 rounded-surface border border-border-card bg-surface p-5 shadow-elevation-1 sm:p-8">
            <div className="grid gap-1">
              <p className="text-label uppercase text-muted">Krok {current.stepNumber} ze {current.stepCount}</p>
              <h2 className="text-card-title text-balance">{current.stepTitle}</h2>
            </div>
            {current.question
              ? <FocusedQuestion question={current.question} recap={current.recap} firstStep={current.stepNumber - 1} lessonHref={current.href} />
              : <ButtonLink href={current.href} className="justify-self-start max-sm:w-full">Pokračovat v lekci<ArrowRight className="-mr-0.5 size-icon-sm" aria-hidden="true" /></ButtonLink>}
          </div>

          <p className="flex flex-wrap items-center gap-x-6 gap-y-2 text-small">
            <Link href={current.href} className="inline-flex min-h-control-sm items-center gap-1.5 font-semibold text-primary-hover">Otevřít celou lekci<ArrowRight className="size-icon-sm" aria-hidden="true" /></Link>
            {next && <Link href={`${base}?lesson=${next.id}`} className="inline-flex min-h-control-sm min-w-0 items-center gap-1.5 text-secondary no-underline hover:text-foreground">
              <span className="text-muted">Potom</span><span className="min-w-0 truncate">{next.title}</span><span className="shrink-0 tabular-nums text-muted">· {next.estimatedMinutes} min</span>
            </Link>}
          </p>
        </section>}

      <section aria-label="Milník a Portfolio Lab" className="grid divide-y divide-divider border-y border-divider">
        <Link href="/progress" className="group grid min-h-control-lg grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-3 no-underline">
          <Flag className="size-icon-md text-primary" aria-hidden="true" />
          <span className="grid gap-0.5"><span className="text-small font-semibold text-foreground">Milník A · {milestone.title}</span><span className="text-microcopy text-secondary"><span className="tabular-nums">{lessons.done} z {lessons.total}</span> lekcí · dovednosti a závěrečný projekt zatím otevřené</span></span>
          <ArrowRight className="size-icon-sm text-muted group-hover:text-foreground" aria-hidden="true" />
        </Link>
        <Link href="/lab/portfolio" className="group grid min-h-control-lg grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-3 no-underline">
          <FlaskConical className="size-icon-md text-primary" aria-hidden="true" />
          <span className="grid gap-0.5"><span className="text-small font-semibold text-foreground">Portfolio Lab</span><span className="text-microcopy text-secondary">Cvičný kapitál <span className="tabular-nums text-foreground">{data.practiceCapital}</span></span></span>
          <ArrowRight className="size-icon-sm text-muted group-hover:text-foreground" aria-hidden="true" />
        </Link>
      </section>

      <p className="text-microcopy text-muted">Vzdělávání, ne investiční doporučení.</p>
    </main>
  </CollapsibleWorkspace>;
}
