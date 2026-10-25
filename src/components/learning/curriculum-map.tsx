import { AppLink as Link } from "@/components/shell/app-link";
import { ChevronDown, Circle, CircleCheck, CircleDot } from "lucide-react";
import { milestones } from "@/features/learning/curriculum";
import type { MilestoneRequirement, MilestoneState } from "@/features/milestones/domain";
import { formatDate } from "@/lib/formatters";
import { mapStatusLabels, type CurriculumMapModel } from "./curriculum-map-model";
import styles from "./curriculum-map.module.css";

function Level({ level }: { level: CurriculumMapModel[number] }) {
  return <details className={styles.level} open={level.current} data-level={level.id}>
    <summary className={styles.levelHead}>
      <span className={styles.code}>{level.code}</span>
      <span className={styles.name}><h3>{level.title}</h3><span>{level.total ? `${level.completed} / ${level.total} dostupných lekcí · ${mapStatusLabels[level.status]}` : mapStatusLabels[level.status]}{level.current && " · Právě tady pokračuješ"}</span></span>
      <ChevronDown size={20} className={styles.chevron} aria-hidden="true" />
    </summary>
    <div className={styles.levelBody}>
      {level.milestone && <p className={styles.goal}>Cíl: milník {level.milestone} · {milestones[level.milestone]}</p>}
      {level.total > 0 && <div className={styles.progress}><div className={styles.meter} role="meter" aria-label={`Dokončené dostupné lekce: ${level.title}`} aria-valuemin={0} aria-valuemax={level.total} aria-valuenow={level.completed}><span style={{ width: `${level.percentage}%` }} /></div><span>{level.percentage} % dostupných lekcí</span></div>}
      {level.modules.map((module) => <section className={styles.module} key={module.code} aria-labelledby={`module-${module.code}`} data-display-module={module.code}>
        <div className={styles.moduleHead}><h4 id={`module-${module.code}`}>{module.code} · {module.title}</h4><span>{mapStatusLabels[module.status]}{module.total > 0 && ` · ${module.completed} / ${module.total}`}</span></div>
        {module.lessons.length > 0 && <ol className={styles.lessons} aria-label={`Lekce modulu ${module.title}`}>{module.lessons.map((lesson) => {
          const Marker = lesson.done ? CircleCheck : lesson.active || lesson.current ? CircleDot : Circle;
          return <li key={lesson.id}><Link className={styles.lesson} data-status={lesson.done ? "done" : lesson.active ? "active" : "todo"} href={lesson.href} aria-current={lesson.current ? "step" : undefined}>
            <Marker size={18} aria-hidden="true" /><span><small>{lesson.displayCode}</small>{lesson.title}</span><span className={styles.lessonState}>{lesson.done ? "Hotovo" : lesson.active ? "Rozpracováno" : lesson.current ? "Následuje" : "Nezačato"}<small>{lesson.active && lesson.step ? `krok ${lesson.step.position}\u00a0z\u00a0${lesson.step.count} · ` : ""}≈ {lesson.estimatedMinutes} min</small></span>
          </Link></li>;
        })}</ol>}
      </section>)}
    </div>
  </details>;
}

const scope: Record<MilestoneState["id"], string> = {
  A: "Úrovně 1–2, behaviorální jádro, investiční plán, cvičný nákup a krizový nácvik. Úroveň 0 je doporučená, ne povinná.",
  B: "Milník A, úroveň 3, celá behaviorální linie a údržba portfolia.",
  C: "Volitelná analytická dráha: milník B, úrovně 4–5 a vlastní analýza s investiční tezí.",
  D: "Volitelná kvantitativní dráha: milník B a úroveň 6. Milník C není podmínkou.",
};
const requirementState = (item: MilestoneRequirement) => item.status === "unavailable" ? "připravujeme"
  : item.kind === "lessons" || item.kind === "skills" ? `${item.done} z ${item.total}` : item.status === "done" ? "splněno" : "zatím ne";

function Milestone({ state, timeZone }: { state: MilestoneState; timeZone: string }) {
  const done = state.requirements.filter((item) => item.status === "done").length;
  return <div data-milestone={state.id} data-status={state.status}><dt>{state.id} · {state.title}</dt><dd>{scope[state.id]}
    <span className={styles.milestoneStatus}>{state.achievedAt ? <>Splněno <time dateTime={state.achievedAt.toISOString()}>{formatDate(state.achievedAt, { timeZone })}</time></>
      : state.status === "unavailable" ? "Zatím nejde splnit: část obsahu připravujeme." : `Splněno ${done} z ${state.requirements.length} požadavků.`}</span>
    <ul className={styles.requirements} aria-label={`Požadavky milníku ${state.id}`}>{state.requirements.map((item) => {
      const Marker = item.status === "done" ? CircleCheck : Circle;
      return <li key={`${item.kind}-${item.label}`} data-status={item.status}><Marker size={16} aria-hidden="true" />{item.label}: {requirementState(item)}</li>;
    })}</ul>
  </dd></div>;
}

/** Shared Learn/Progress view; native disclosures work before hydration and preserve keyboard behavior. */
export function CurriculumMap({ levels, milestones: states, timeZone = "Europe/Prague" }: { levels: CurriculumMapModel; milestones: readonly MilestoneState[]; timeZone?: string }) {
  return <div className={styles.map} data-testid="journey-modules">
    {levels.filter((level) => !level.optional).map((level) => <Level key={level.id} level={level} />)}
    <section className={styles.deepening} aria-labelledby="deepening-title"><h3 id="deepening-title">Prohloubení</h3><p>Volitelné dráhy pro analýzu akcií a kvantitativní metody. Pro pasivní investování je nepotřebuješ. Kvantitativní dráha nevyžaduje analytickou.</p>
      {levels.filter((level) => level.optional).map((level) => <Level key={level.id} level={level} />)}
    </section>
    <section className={styles.milestones} aria-labelledby="map-milestones-title"><h3 id="map-milestones-title">Milníky tvé cesty</h3><p>Milník je uznání, nic neodemyká. Počítá se z dokončených lekcí, dovedností na úrovni Zvládnuté a závěrečného projektu hodnoceného rubrikou. Procenta výše měří jen dostupné lekce.</p>
      <dl>{states.map((state) => <Milestone key={state.id} state={state} timeZone={timeZone} />)}</dl>
    </section>
  </div>;
}
