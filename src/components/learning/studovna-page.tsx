import { ArrowRight, ChevronRight, Circle, CircleCheck, CircleDashed, CircleDot, Clock3, Flag, FlaskConical, LockKeyhole } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { legalLinks } from "@/components/legal/legal-links";
import { PersonalizationPrompt } from "@/components/personalization/personalization-prompt";
import { AppLink as Link } from "@/components/shell/app-link";
import { ButtonLink } from "@/components/ui/button";
import type { MilestoneState } from "@/features/milestones/domain";
import { cn } from "@/lib/utils";
import { CollapsibleWorkspace, CurriculumSheet, InlineQuestion, learnMainId } from "./learn-workspace-client";
import { doneLessons, learnWorkspaceModel, outOf, railStatusLabels, type LearnWorkspace, type LessonFocus, type MilestoneFocus, type RailLesson, type RailLevel, type WorkspaceLab } from "./learn-workspace-model";
import type { LearnerSummary } from "./studovna-model";

const summaryRow = "flex min-h-control-sm cursor-pointer list-none items-center gap-2 rounded-control px-2 py-2 text-small hover:bg-surface-muted [&::-webkit-details-marker]:hidden";
const chevron = "size-icon-xs shrink-0 text-muted";
const disclosure = "-ml-2 inline-flex min-h-control-sm cursor-pointer list-none items-center gap-2 rounded-control px-2 text-small font-semibold text-primary-hover hover:bg-surface-muted [&::-webkit-details-marker]:hidden";
// DESIGN.md card padding in px (16 phones, 20 from 375, 32 from 640): rem padding doubled at 200 % text and squeezed the answer column at 320px.
const surface = "@container grid gap-6 rounded-surface border border-border-card bg-surface p-[16px] shadow-elevation-1 min-[375px]:p-[20px] min-[640px]:p-[32px]";
// The CTA arrow is decorative. It gives way when enlarged text leaves „Pokračovat“ no room in the surface
// (a container query, so it follows the reader's text size; at 100 % text even 320px keeps it).
const ctaArrow = "-mr-0.5 size-icon-sm @max-[14rem]:hidden";

function StatusIcon({ status, className }: { status: RailLesson["status"]; className?: string }) {
  const Icon = status === "done" ? CircleCheck : status === "started" ? CircleDot : Circle;
  return <Icon aria-hidden="true" className={cn("size-icon-sm shrink-0", status === "todo" ? "text-muted" : "text-primary", className)} />;
}

/**
 * The curriculum as compact wayfinding. Only the continuation's level is open, finished lessons fold into one row,
 * optional levels share one disclosure, and every row is at least 44px (control-sm). Rows open the lesson itself (D6).
 */
function RailTree({ rail }: { rail: LearnWorkspace["rail"] }) {
  const lessonRow = (lesson: RailLesson) => <li key={lesson.id}>
    <Link href={lesson.href} aria-current={lesson.current ? "step" : undefined}
      className={cn("flex min-h-control-sm items-start gap-2.5 rounded-control px-2 py-2.5 text-small no-underline hover:bg-surface-muted", lesson.current ? "bg-primary-soft font-semibold text-foreground" : "text-secondary hover:text-foreground")}>
      <StatusIcon status={lesson.status} className="mt-1" />
      <span className="min-w-0 flex-1 text-pretty">{lesson.title}</span>
      <span className="sr-only">, {railStatusLabels[lesson.status]}{lesson.current ? ", na řadě" : ""}</span>
    </Link>
  </li>;
  const level = (item: RailLevel) => <li key={item.id}>
    <details open={item.current} data-level={item.id} className="group/level">
      <summary className={summaryRow}>
        <span aria-hidden="true" className="w-6 shrink-0 font-display font-semibold tabular-nums text-muted">{item.code}</span>
        <span className={cn("min-w-0 flex-1 text-pretty", item.current ? "font-semibold text-foreground" : "text-secondary")}>{item.title}</span>
        <span className={cn("flex shrink-0 items-center gap-1 text-microcopy tabular-nums", item.total && item.completed === item.total ? "text-primary" : "text-muted")}>
          {item.total > 0 && item.completed === item.total && <CircleCheck aria-hidden="true" className="size-icon-xs" />}
          {item.total ? <><span aria-hidden="true">{item.completed}/{item.total}</span><span className="sr-only">, hotovo {item.completed} {outOf(item.total)}{item.total}</span></> : "Připravujeme"}
        </span>
        <ChevronRight aria-hidden="true" className={cn(chevron, "group-open/level:rotate-90")} />
      </summary>
      {/* pl-8: lesson icons line up under the level title, past the 24px code column. */}
      <div className="grid gap-2 pt-0.5 pb-3 pl-8">
        {item.modules.map((module) => <div key={module.code} className="grid gap-0.5">
          {item.modules.length > 1 && <h3 className="px-2 pt-2 pb-0.5 font-sans text-microcopy font-semibold tracking-normal text-muted">{module.title}</h3>}
          {module.lessons.length + module.folded.length === 0 && <p className="flex min-h-control-sm items-center gap-2.5 px-2 text-small text-muted"><CircleDashed aria-hidden="true" className="size-icon-sm shrink-0" />Připravujeme</p>}
          {module.folded.length > 0 && <details className="group/done">
            <summary className={cn(summaryRow, "gap-2.5 text-secondary")}>
              <StatusIcon status="done" />
              <span className="min-w-0 flex-1">{doneLessons(module.folded.length)}</span>
              <ChevronRight aria-hidden="true" className={cn(chevron, "group-open/done:rotate-90")} />
            </summary>
            <ul className="grid gap-0.5">{module.folded.map(lessonRow)}</ul>
          </details>}
          {module.lessons.length > 0 && <ul className="grid gap-0.5">{module.lessons.map(lessonRow)}</ul>}
        </div>)}
      </div>
    </details>
  </li>;
  const optionalTotal = rail.optional.reduce((sum, item) => sum + item.total, 0);
  return <div className="grid gap-3">
    <ul className="grid gap-0.5">{rail.levels.map(level)}</ul>
    {rail.optional.length > 0 && <details open={rail.optional.some((item) => item.current)} className="group/more border-t border-divider pt-3">
      <summary className={cn(summaryRow, "text-secondary")}>
        <span className="min-w-0 flex-1">Prohloubení</span>
        <span className="shrink-0 text-microcopy tabular-nums text-muted">{optionalTotal ? `${optionalTotal} lekce` : "Připravujeme"}</span>
        <ChevronRight aria-hidden="true" className={cn(chevron, "group-open/more:rotate-90")} />
      </summary>
      <ul className="grid gap-0.5 pt-1">{rail.optional.map(level)}</ul>
    </details>}
  </div>;
}

/** One segment per step. Finished steps are filled; the open one is tinted. Text carries the value. */
function StepMeter({ step, total }: { step: number; total: number }) {
  return <div role="progressbar" aria-label="Postup v lekci" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step - 1} aria-valuetext={`Krok ${step} ${outOf(total)}${total}`} className="flex w-full max-w-56 gap-1">
    {Array.from({ length: total }, (_, index) => <span key={index} className={cn("h-1 flex-1 rounded-pill", index < step - 1 ? "bg-progress" : index === step - 1 ? "bg-primary-tint" : "bg-track")} />)}
  </div>;
}

const eyebrows = { new: "Začni tady", resume: "Rozdělaná lekce", next: "Další lekce" } as const;

function LessonFocusView({ focus, sheet }: { focus: LessonFocus; sheet: React.ReactNode }) {
  const { lesson, step, question } = focus;
  const resuming = focus.status === "resume";
  return <section aria-labelledby="learn-title" className="grid gap-8">
    <header className="grid gap-4">
      <div className="flex min-h-control-sm flex-wrap items-center justify-between gap-3">
        <p className="text-label uppercase text-primary">{eyebrows[focus.status]}</p>
        {sheet}
      </div>
      {(focus.finishedModule || focus.reason) && <p className="flex max-w-prose items-start gap-2 text-small text-pretty text-secondary">
        {focus.finishedModule && <CircleCheck aria-hidden="true" className="mt-0.5 size-icon-sm shrink-0 text-primary" />}
        <span>{focus.finishedModule && <>Modul {focus.finishedModule.code} {focus.finishedModule.title} máš hotový. </>}{focus.reason}</span>
      </p>}
      <h1 id="learn-title" className="text-page-title text-balance hyphens-auto [overflow-wrap:anywhere]">{lesson.title}</h1>
      {lesson.summary && <p className="max-w-prose text-emphasis text-pretty text-secondary">{lesson.summary}</p>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {resuming && <StepMeter step={step.number} total={step.count} />}
        <p className="flex items-center gap-1.5 text-microcopy text-secondary">
          {!resuming && <Clock3 aria-hidden="true" className="size-icon-xs shrink-0" />}
          {lesson.moduleTitle}{" · "}{resuming ? `zbývá asi ${lesson.minutesLeft}\u00a0min` : `${step.count} kroky · asi ${lesson.minutes}\u00a0min`}
        </p>
      </div>
    </header>

    <section aria-labelledby="learn-step" className={surface}>
      <div className="grid gap-1.5">
        <p className="text-label uppercase text-muted tabular-nums">Krok {step.number} {outOf(step.count)}{step.count}</p>
        <h2 id="learn-step" className="text-card-title text-balance hyphens-auto">{step.title}</h2>
      </div>
      {question
        ? <InlineQuestion key={`${lesson.id}-${step.number}`} question={question} lessonId={lesson.id} position={step.number - 1} href={lesson.href} earlierSteps={step.number - 1} />
        : <>
          {step.description && <p className="max-w-prose text-body text-pretty text-secondary">{step.description}</p>}
          {step.graded && <p className="text-small text-secondary">Úlohu v tomto kroku vyřešíš přímo v lekci.</p>}
          <ButtonLink href={lesson.href} className="justify-self-start max-sm:w-full">{resuming ? `Pokračovat od kroku ${step.number}` : "Začít lekci"}<ArrowRight className={ctaArrow} aria-hidden="true" /></ButtonLink>
          {focus.recap.length > 0 && <details className="group border-t border-divider pt-3">
            <summary className={disclosure}><ChevronRight aria-hidden="true" className="size-icon-sm group-open:rotate-90" />Co už víš z kroků 1–{step.number - 1}</summary>
            <div className="grid max-w-prose gap-3 pt-2">
              {focus.recap.map((item) => <div key={item.title} className="grid gap-0.5"><h3 className="font-sans text-small font-semibold tracking-normal">{item.title}</h3><p className="text-small text-pretty text-secondary">{item.body}</p></div>)}
            </div>
          </details>}
        </>}
    </section>
  </section>;
}

const requirementCopy = { milestone: "", lessons: "Lekce", skills: "Dovednosti na úrovni Zvládnuté", capstone: "" } as const;

function MilestoneFocusView({ focus, sheet }: { focus: MilestoneFocus; sheet: React.ReactNode }) {
  return <section aria-labelledby="learn-title" className="grid gap-8">
    <header className="grid gap-4">
      <div className="flex min-h-control-sm flex-wrap items-center justify-between gap-3">
        <p className="text-label uppercase text-primary">Milník A</p>
        {sheet}
      </div>
      <h1 id="learn-title" className="text-page-title text-balance">{focus.achieved ? "Milník A splněn" : "Co ti zbývá do milníku A"}</h1>
      <p className="max-w-prose text-emphasis text-pretty text-secondary">Lekce v rozsahu milníku máš hotové. Dovednosti a závěrečný projekt mají vlastní požadavky.</p>
    </header>
    <section aria-labelledby="learn-step" className={surface}>
      <div className="grid gap-1.5">
        <p className="text-label uppercase text-muted">{focus.achieved ? "Hotovo" : "Další požadavek"}</p>
        <h2 id="learn-step" className="text-card-title text-balance hyphens-auto">{focus.achieved ? "Plán máš ověřený v nácviku." : focus.next?.label}</h2>
        <p className="max-w-prose text-body text-pretty text-secondary">{focus.achieved ? "K lekcím i svému plánu se můžeš kdykoli vrátit. Milník nepřidává XP ani cvičný kapitál." : "Pokračuj dalším požadavkem. Splnění lekcí samo o sobě milník nedokončuje."}</p>
      </div>
      <ul aria-label="Požadavky milníku A" className="grid gap-1 border-y border-divider py-3">
        {focus.requirements.map((item) => <li key={item.kind + item.label} className="flex min-h-control-sm flex-wrap items-center gap-x-2.5 text-small">
          {item.status === "done" ? <CircleCheck aria-hidden="true" className="size-icon-sm shrink-0 text-primary" /> : <Circle aria-hidden="true" className="size-icon-sm shrink-0 text-muted" />}
          {/* No min-w-0: the label keeps its longest word, so under enlarged text the count wraps below it. */}
          <span className="flex-1 text-pretty">{requirementCopy[item.kind] || item.label}</span>
          <span className="shrink-0 tabular-nums text-secondary">{item.done} {outOf(item.total)}{item.total}</span>
          <span className="sr-only">, {item.status === "done" ? "splněno" : item.status === "open" ? "otevřené" : "zatím nedostupné"}</span>
        </li>)}
      </ul>
      {/* Same fallback as before D: the Lab hub when no requirement is reachable from Learn. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ButtonLink href={focus.next?.href ?? "/lab"} className="max-sm:w-full">Pokračovat<ArrowRight className={ctaArrow} aria-hidden="true" /></ButtonLink>
        <p className="text-small text-secondary">Všechny lekce zůstávají otevřené.</p>
      </div>
    </section>
  </section>;
}

function JourneyRow({ href, icon: Icon, title, detail }: { href: string; icon: typeof Flag; title: string; detail: React.ReactNode }) {
  return <li>
    <Link href={href} className="group grid min-h-control-lg grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-3 no-underline">
      <Icon className="size-icon-md text-primary" aria-hidden="true" />
      <span className="grid gap-0.5">
        <span className="text-small font-semibold text-pretty text-foreground underline-offset-4 group-hover:underline">{title}</span>
        <span className="text-microcopy text-pretty text-secondary">{detail}</span>
      </span>
      <ArrowRight className="size-icon-sm text-muted group-hover:text-foreground" aria-hidden="true" />
    </Link>
  </li>;
}

const openCopy = { skills: "dovednosti", capstone: "závěrečný projekt", milestone: "předchozí milník" } as const;

/** /learn, direction D „Studijní pracoviště“: a compact, collapsible curriculum rail around one focused task. */
export function StudovnaPage({ summary, milestones, lab }: { summary: LearnerSummary; milestones: readonly MilestoneState[]; lab: WorkspaceLab }) {
  const workspace = learnWorkspaceModel({ ...summary, personalized: Boolean(summary.profile?.personalizedOnboardingCompletedAt) }, milestones, lab);
  const { rail, focus, then, milestone, plan } = workspace;
  const sheet = <CurriculumSheet><RailTree rail={rail} /></CurriculumSheet>;
  const open = milestone?.open.map((kind) => openCopy[kind as keyof typeof openCopy]).filter(Boolean) ?? [];
  const labRow = workspace.lab;

  return <CollapsibleWorkspace count={<span className="font-normal tabular-nums text-muted">{rail.completed ? <><span aria-hidden="true">{rail.completed}/{rail.total}</span><span className="sr-only">hotovo {rail.completed} {outOf(rail.total)}{rail.total}</span></> : `${rail.total} lekcí`}</span>} rail={<RailTree rail={rail} />}>
    <main id={learnMainId} tabIndex={-1} className="grid w-full max-w-focused min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-12 pt-6 pb-16 lg:gap-16 lg:pt-10">
      {focus.kind === "lesson" ? <div className="grid gap-5">
        <LessonFocusView focus={focus} sheet={sheet} />
        {(focus.question || then) && <p className="flex flex-wrap items-center gap-x-6 gap-y-1 text-small">
          {focus.question && <Link href={focus.lesson.href} className="inline-flex min-h-control-sm items-center gap-1.5 font-semibold text-primary-hover">Otevřít celou lekci<ArrowRight className="size-icon-sm" aria-hidden="true" /></Link>}
          {/* Inline flow, so a wrapped title keeps its minutes on its last line. The space stays outside the no-wrap span,
              so the line can still break before „·“ under enlarged text. */}
          {then && <Link href={then.href} className="group block min-h-control-sm min-w-0 py-2.5 text-pretty text-secondary no-underline">
            <span className="text-muted">Potom </span><span className="text-foreground underline-offset-4 group-hover:underline">{then.title}</span>{" "}<span className="whitespace-nowrap tabular-nums text-muted">· {then.minutes}{"\u00a0"}min</span>
          </Link>}
        </p>}
        {/* Study-plan context stays one quiet disclosure until decision D7 gives it a home elsewhere. */}
        <details className="group">
          <summary className={disclosure}><ChevronRight aria-hidden="true" className="size-icon-sm group-open:rotate-90" />Jak si rozvrhnout učení</summary>
          <div className="grid max-w-prose gap-2 pt-2 text-small text-pretty text-secondary">
            {focus.status === "resume" && <p>{plan.reason}</p>}
            {plan.recommended && <Link href={plan.recommended.href} className="inline-flex min-h-control-sm items-center gap-1.5 font-semibold text-primary-hover">Doporučená lekce: {plan.recommended.title}<ArrowRight className="size-icon-sm shrink-0" aria-hidden="true" /></Link>}
            <p>{plan.context}</p>
            <p>{plan.scaffold}</p>
            {plan.split && <p>Lekci si můžeš rozdělit do více sezení. Uložený postup tě dovede zpět.</p>}
          </div>
        </details>
      </div>
        : <MilestoneFocusView focus={focus} sheet={sheet} />}

      <section aria-labelledby="learn-journey" className="grid gap-2">
        <h2 id="learn-journey" className="font-sans text-label tracking-label text-muted uppercase">Tvoje cesta</h2>
        <ul className="divide-y divide-divider border-y border-divider">
          {milestone && focus.kind !== "milestone" && <JourneyRow href="/progress" icon={Flag} title={`Milník A · ${milestone.title}`}
            detail={milestone.achieved ? "Splněno" : <><span className="tabular-nums">{milestone.lessonsDone} {outOf(milestone.lessonsTotal)}{milestone.lessonsTotal}</span> lekcí{open.length ? ` · ${open.join(" a ")} zatím otevřené` : ""}</>} />}
          {labRow.state === "unlocked" && <JourneyRow href="/lab/portfolio" icon={FlaskConical} title="Portfolio Lab" detail={<>Cvičný kapitál <span className="tabular-nums text-foreground">{labRow.capital}</span></>} />}
          {labRow.state === "locked" && <JourneyRow href="/lab/portfolio" icon={LockKeyhole} title="Portfolio Lab je zatím zamčený"
            detail={labRow.done < labRow.required ? <>Odemkneš ho dokončením Základů investování: hotovo <span className="tabular-nums">{labRow.done} {outOf(labRow.required)}{labRow.required}</span> lekcí.</> : "Lekce Základů máš hotové. Chybí ještě XP."} />}
          {labRow.state === "guest" && <JourneyRow href="/onboarding/save" icon={LockKeyhole} title="Portfolio Lab" detail="Portfolio Lab otevřeš, až si uložíš účet." />}
          {workspace.personalize && summary.user && <PersonalizationPrompt userId={summary.user.id} />}
        </ul>
      </section>

      <footer className="grid gap-3 text-microcopy text-muted">
        <Link href="/learn" aria-label="Investník · Učení" className="inline-flex min-h-control-sm items-center justify-self-start text-foreground"><Wordmark /></Link>
        <p>Vzdělávání, ne investiční doporučení.</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">{[{ href: "/", label: "Jak to funguje" }, { href: "/settings", label: "Nastavení" }, ...legalLinks].map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-control-sm items-center text-secondary">{link.label}</Link>)}</p>
      </footer>
    </main>
  </CollapsibleWorkspace>;
}
