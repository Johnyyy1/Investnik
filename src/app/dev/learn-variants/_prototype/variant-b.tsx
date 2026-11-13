import { ArrowRight, Clock3, Flag, FlaskConical } from "lucide-react";
import { AppLink as Link } from "@/components/shell/app-link";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CurriculumSheet } from "./curriculum-sheet";
import type { LearnPrototypeData, PrototypeLesson } from "./data";
import { NumericQuestion } from "./numeric-question";
import { CompositionBar, CurriculumTree, Disclaimer, LessonStatusIcon, Recap, statusLabel } from "./parts";

const hrefFor = (lesson: PrototypeLesson) => `/dev/learn-variants/b?lesson=${lesson.id}`;

/** B · „Pracoviště“: the curriculum is navigation. A sticky tree on the left, the work on the right, rows instead of cards. */
export function VariantB({ data, selectedId }: { data: LearnPrototypeData; selectedId?: string }) {
  const { current } = data;
  const all = data.levels.flatMap((level) => level.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))));
  const selected = all.find((lesson) => lesson.id === selectedId && lesson.id !== current.id);
  const milestone = data.milestones[0];
  const lessons = milestone.requirements.find((item) => item.kind === "lessons")!;
  const tree = <CurriculumTree levels={data.levels} hrefFor={hrefFor} selectedId={selected?.id ?? current.id} />;
  return <div className="mx-auto w-full max-w-shell lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
    <aside aria-label="Kurikulum" className="hidden border-r border-divider lg:sticky lg:top-0 lg:block lg:max-h-dvh lg:overflow-y-auto lg:overscroll-contain lg:px-3 lg:py-6">
      <p className="px-2 pb-3 text-small font-semibold text-secondary">Kurikulum · <span className="tabular-nums">{data.completedCount}/{data.lessonCount}</span></p>
      {tree}
    </aside>

    <main className="grid min-w-0 content-start gap-8 px-4 pt-6 pb-16 min-[375px]:px-5 sm:px-8 lg:px-10 lg:pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <h1 className="text-card-title">Učení</h1>
          <p className="text-small text-secondary">Vítej zpátky · <span className="tabular-nums">{data.completedCount} z {data.lessonCount}</span> lekcí hotovo</p>
        </div>
        <CurriculumSheet>{tree}</CurriculumSheet>
      </header>

      {selected
        ? <section aria-labelledby="b-selected" className="grid gap-4 rounded-surface border border-border-card bg-surface p-5 sm:p-6">
          <p className="flex flex-wrap items-center gap-2 text-microcopy text-secondary"><LessonStatusIcon lesson={selected} />{statusLabel(selected)} · {selected.displayCode} · {selected.moduleTitle}</p>
          <h2 id="b-selected" className="text-section-title text-balance">{selected.title}</h2>
          {"summary" in selected && typeof selected.summary === "string" && <p className="max-w-[65ch] text-body text-secondary">{selected.summary}</p>}
          <p className="flex items-center gap-2 text-small text-secondary"><Clock3 className="size-icon-sm" aria-hidden="true" />Asi {selected.estimatedMinutes} min</p>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href={selected.href} size="compact">{selected.done ? "Zopakovat lekci" : "Začít lekci"}<ArrowRight className="size-icon-sm" aria-hidden="true" /></ButtonLink>
            <Link href="/dev/learn-variants/b" className="inline-flex min-h-control-sm items-center text-small font-semibold text-primary-hover">Zpět na rozdělanou lekci</Link>
          </div>
        </section>
        : <section aria-labelledby="b-continue" className="grid overflow-hidden rounded-surface border border-border-card bg-surface xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid content-start gap-5 p-5 sm:p-6">
            <div className="grid gap-2">
              <p className="text-microcopy text-secondary"><span className="font-semibold text-primary-hover">Rozdělaná lekce</span> · {current.displayCode} · {current.moduleTitle}</p>
              <h2 id="b-continue" className="text-section-title text-balance">{current.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-secondary">
                <span>Krok {current.stepNumber}/{current.stepCount} · {current.stepTitle}</span>
                <Progress value={current.stepNumber - 1} total={current.stepCount} label="Postup v lekci" className="h-1.5 max-w-40 min-w-20" />
              </div>
            </div>
            {current.question && <NumericQuestion question={current.question} lessonHref={current.href} size="compact" />}
          </div>
          {current.recap.length > 0 && <div className="border-t border-divider bg-surface-practice p-5 sm:p-6 xl:border-t-0 xl:border-l"><Recap recap={current.recap} firstStep={current.stepNumber - 1} /></div>}
        </section>}

      <section aria-labelledby="b-next" className="grid gap-2">
        <p id="b-next" className="text-label uppercase text-muted">Další na řadě</p>
        <ol className="divide-y divide-divider border-y border-divider">
          {data.upcoming.map((lesson) => <li key={lesson.id}>
            <Link href={hrefFor(lesson)} className="grid min-h-control-lg grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 py-2.5 no-underline hover:bg-surface-muted sm:grid-cols-[auto_4rem_minmax(0,1fr)_auto]">
              <LessonStatusIcon lesson={lesson} />
              <span className="hidden text-small tabular-nums text-muted sm:block">{lesson.displayCode}</span>
              <span className="min-w-0"><span className="block text-small font-semibold text-foreground">{lesson.title}</span><span className="block text-microcopy text-secondary">{lesson.moduleTitle}</span></span>
              <span className="text-microcopy tabular-nums text-secondary">{lesson.estimatedMinutes} min</span>
            </Link>
          </li>)}
        </ol>
      </section>

      <section aria-label="Stav" className="grid gap-px overflow-hidden rounded-surface border border-border bg-divider md:grid-cols-2">
        <Link href="/progress" className="grid content-start gap-2 bg-background p-4 no-underline hover:bg-surface-muted">
          <span className="flex items-center gap-2 text-small font-semibold text-foreground"><Flag className="size-icon-sm text-primary" aria-hidden="true" />Milník A · {milestone.title}</span>
          <Progress value={lessons.done} total={lessons.total} label="Lekce milníku A" className="h-1.5 flex-none" />
          <span className="text-microcopy text-secondary"><span className="tabular-nums">{lessons.done} z {lessons.total}</span> lekcí · dovednosti a závěrečný projekt zatím otevřené</span>
        </Link>
        <Link href="/lab/portfolio" className="grid content-start gap-2 bg-background p-4 no-underline hover:bg-surface-muted">
          <span className="flex items-center gap-2 text-small font-semibold text-foreground"><FlaskConical className="size-icon-sm text-primary" aria-hidden="true" />Portfolio Lab · <span className="tabular-nums">{data.practiceCapital}</span></span>
          <CompositionBar portfolio={data.portfolio} />
        </Link>
      </section>

      <Disclaimer />
    </main>
  </div>;
}
