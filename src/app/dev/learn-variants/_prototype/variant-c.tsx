import { ArrowRight, ChevronDown, Circle, CircleCheck, CircleDot, Info } from "lucide-react";
import { GuideImage } from "@/components/guide-image";
import { AppLink as Link } from "@/components/shell/app-link";
import { Progress } from "@/components/ui/progress";
import type { MilestoneRequirement } from "@/features/milestones/domain";
import { cn } from "@/lib/utils";
import type { LearnPrototypeData, PrototypeLesson } from "./data";
import { NumericQuestion } from "./numeric-question";
import { CompositionBar, CurriculumTree, Disclaimer, LessonStatusIcon } from "./parts";

const requirementStatus = (requirement: MilestoneRequirement) => requirement.status === "done" ? "Splněno" : requirement.done > 0 ? "Probíhá" : requirement.status === "unavailable" ? "Zatím nedostupné" : "Nezačato";

function RequirementIcon({ requirement }: { requirement: MilestoneRequirement }) {
  const Icon = requirement.status === "done" ? CircleCheck : requirement.done > 0 ? CircleDot : Circle;
  return <Icon aria-hidden="true" className={cn("size-icon-lg shrink-0", requirement.status === "done" || requirement.done > 0 ? "text-primary" : "text-muted")} />;
}

// The final project's practical parts, linking to the existing Lab tools. Status is not tracked in this prototype.
const projectParts = [
  { title: "Investiční plán (IPS)", body: "Cíl, horizont, rozložení a pravidla, podle kterých budeš jednat.", href: "/lab/plan" },
  { title: "První cvičný nákup", body: "Nákup v Portfolio Labu podle plánu, s náklady před potvrzením.", href: "/lab/portfolio" },
  { title: "Krizový nácvik", body: "Propad trhu v izolovaném scénáři: držíš se plánu?", href: "/lab/training" },
];

/** C · „Cesta k plánu“: the page is Milestone A. Its requirements are the structure; the next lesson lives inside the active one. */
export function VariantC({ data }: { data: LearnPrototypeData }) {
  const { current } = data;
  const [milestone, ...later] = data.milestones;
  const byId = new Map<string, PrototypeLesson>(data.levels.flatMap((level) => level.modules.flatMap((module) => module.lessons)).map((lesson) => [lesson.id, lesson]));
  const nextInScope = milestone.lessons.filter((lesson) => !lesson.done && lesson.id !== current.id).slice(0, 3).flatMap((lesson) => byId.get(lesson.id) ?? []);
  const started = milestone.requirements.filter((item) => item.done > 0 || item.status === "done").length;
  return <main className="mx-auto grid w-full max-w-focused gap-10 px-4 pt-8 pb-16 min-[375px]:px-5 sm:px-8 lg:pt-14">
    <header className="grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="grid gap-3">
        <p className="text-label uppercase text-primary">Tvůj první cíl · Milník A</p>
        <h1 className="text-page-title text-balance">{milestone.title}</h1>
        <p className="max-w-[60ch] text-emphasis text-secondary">Vlastní investiční plán, první cvičný nákup podle něj a plán ověřený v krizovém nácviku.</p>
        <p className="text-small text-secondary">Rozpracované požadavky: <span className="tabular-nums text-foreground">{started} ze {milestone.requirements.length}</span></p>
      </div>
      <GuideImage pose="06-map" alt="" sizes="160px" className="hidden h-auto w-40 sm:block" />
    </header>

    <ol className="grid gap-3" aria-label="Požadavky milníku A">
      {milestone.requirements.map((requirement, index) => {
        const active = requirement.kind === "lessons";
        return <li key={requirement.kind}>
          <details open={active} className={cn("group rounded-surface border", active ? "border-border-card bg-surface shadow-elevation-1" : "border-border bg-background")}>
            <summary className="grid min-h-control-lg cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
              <RequirementIcon requirement={requirement} />
              <span className="grid min-w-0 gap-1">
                <span className="text-microcopy text-secondary">Požadavek {index + 1} · {requirementStatus(requirement)}</span>
                <span className="text-card-title font-display font-semibold text-foreground">{requirement.kind === "capstone" ? "Závěrečný projekt" : requirement.label}</span>
                <span className="flex items-center gap-3 text-small text-secondary"><span className="tabular-nums">{requirement.done} z {requirement.total}</span><Progress value={requirement.done} total={requirement.total} label={`${requirement.label}: postup`} className="h-1.5 max-w-40 min-w-16" /></span>
              </span>
              <ChevronDown aria-hidden="true" className="size-icon-md text-secondary group-open:rotate-180" />
            </summary>
            <div className="grid gap-6 border-t border-divider p-4 sm:p-5">
              {requirement.kind === "lessons" && <>
                <section aria-labelledby="c-continue" className="grid gap-5">
                  <div className="grid gap-2">
                    <p className="text-microcopy text-secondary"><span className="font-semibold text-primary-hover">Teď</span> · {current.displayCode} · {current.moduleTitle}</p>
                    <h2 id="c-continue" className="text-section-title text-balance">{current.title}</h2>
                    <p className="text-small text-secondary">Krok {current.stepNumber} ze {current.stepCount} · {current.stepTitle} · asi {current.minutesLeft} min</p>
                  </div>
                  {current.question && <NumericQuestion question={current.question} lessonHref={current.href} />}
                </section>
                <section aria-labelledby="c-next" className="grid gap-2">
                  <p id="c-next" className="text-label uppercase text-muted">Potom v rámci milníku</p>
                  <ol className="divide-y divide-divider">
                    {nextInScope.map((lesson) => <li key={lesson.id}><Link href={lesson.href} className="flex min-h-control items-center gap-3 py-2 text-small text-foreground no-underline hover:text-primary-hover"><LessonStatusIcon lesson={lesson} /><span className="tabular-nums text-muted">{lesson.displayCode}</span><span className="min-w-0 flex-1">{lesson.title}</span><ArrowRight className="size-icon-sm text-secondary" aria-hidden="true" /></Link></li>)}
                  </ol>
                </section>
              </>}
              {requirement.kind === "skills" && <p className="max-w-[65ch] text-small text-secondary">Každá dovednost z lekcí milníku musí dosáhnout úrovně Zvládnuté. Kde stojí jednotlivé dovednosti, ukazuje Pokrok.</p>}
              {requirement.kind === "capstone" && <ol className="grid gap-3">
                {projectParts.map((part, partIndex) => <li key={part.title} className="grid gap-2 rounded-control bg-surface-sunken p-4">
                  <Link href={part.href} className="flex items-center gap-3 font-semibold text-foreground no-underline hover:text-primary-hover"><span className="text-small tabular-nums text-muted">{partIndex + 1}.</span>{part.title}<ArrowRight className="ml-auto size-icon-sm text-secondary" aria-hidden="true" /></Link>
                  <p className="text-small text-secondary">{part.body}</p>
                  {part.href === "/lab/portfolio" && <div className="grid gap-2 pt-1"><p className="text-microcopy text-secondary">Cvičný kapitál <span className="tabular-nums text-foreground">{data.practiceCapital}</span></p><CompositionBar portfolio={data.portfolio} /></div>}
                </li>)}
              </ol>}
            </div>
          </details>
        </li>;
      })}
    </ol>

    <p className="flex gap-3 rounded-control bg-info-soft p-4 text-small text-info-ink"><Info className="mt-0.5 size-icon-md shrink-0" aria-hidden="true" />Milník počítá jen publikované lekce. Dokončené lekce samy o sobě milník nesplní.</p>

    <section aria-labelledby="c-more" className="grid gap-3">
      <h2 id="c-more" className="text-card-title">Další cesta</h2>
      <ul className="divide-y divide-divider border-y border-divider">
        {later.map((item) => <li key={item.id} className="flex min-h-control flex-wrap items-center gap-x-3 gap-y-1 py-3"><span className="font-semibold">Milník {item.id} · {item.title}</span><span className="text-microcopy text-secondary">{item.requirements[0]?.kind === "milestone" ? `Navazuje na ${item.requirements[0].label.split(" · ")[0].replace("Milník", "milník")}` : ""}</span></li>)}
      </ul>
      <details className="group">
        <summary className="flex min-h-control cursor-pointer list-none items-center gap-2 text-small font-semibold text-primary-hover [&::-webkit-details-marker]:hidden">Všechny lekce · {data.completedCount} z {data.lessonCount} hotovo<ChevronDown className="size-icon-sm group-open:rotate-180" aria-hidden="true" /></summary>
        <div className="pt-2"><CurriculumTree levels={data.levels} hrefFor={(lesson) => lesson.href} /></div>
      </details>
    </section>

    <Disclaimer />
  </main>;
}
