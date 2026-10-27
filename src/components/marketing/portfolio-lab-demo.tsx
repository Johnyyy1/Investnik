"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight, CircleAlert, CircleCheck, Info, MapPinned, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPracticeCapitalMinor as money } from "@/features/rewards/presentation";
import { formatDecimal } from "@/lib/formatters";
import {
  checkAmount, CRISIS_CHOICES, CRISIS_DECISION_MONTH, CRISIS_LEVELS, crisisOutcome, DEMO_CAPITAL_MINOR, DEMO_COMPARISON_AMOUNTS_KC,
  DEMO_DEFAULT_AMOUNT_KC, DEMO_INSTRUMENTS, DEMO_LESSON_CAPITAL_MINOR, DEMO_PLAN, DEMO_TARIFFS, DEMO_UNLOCK_CAPITAL_MINOR, demoCost,
  demoProcess, tariff, wholePercent, type CrisisChoice, type DemoInstrumentId, type DemoTariffId,
} from "./portfolio-lab-demo-model";
import { PORTFOLIO_STEP_EVENT, PORTFOLIO_STEP_REQUEST_EVENT, type PortfolioStep, type PortfolioStepDetail, type PortfolioStepRequestDetail } from "./motion/events";
import styles from "./portfolio-lab-demo.module.css";

type Step = PortfolioStep;
const STEPS: readonly { step: Step; label: string }[] = [
  { step: 1, label: "Nákup s náklady" },
  { step: 2, label: "Karta v okamžiku rozhodnutí" },
  { step: 3, label: "Zpětná vazba k procesu" },
];

/** Tabs from 801 px; below that the three steps stack (Pen 14.2, 390 px board). Server render stacks. */
const TABS_QUERY = "(min-width: 801px)";
function useTabsLayout() {
  return useSyncExternalStore(
    (notify) => { const query = window.matchMedia(TABS_QUERY); query.addEventListener("change", notify); return () => query.removeEventListener("change", notify); },
    () => window.matchMedia(TABS_QUERY).matches,
    () => false,
  );
}

const formatKc = (kc: number) => money(BigInt(kc) * 100n);
const planPct = (bps: bigint) => wholePercent(bps);
const bandRange = (targetBps: bigint) => `${planPct(targetBps - DEMO_PLAN.bandBps).replace(" %", "")}–${planPct(targetBps + DEMO_PLAN.bandBps)}`;
const PLAN_LINE = `${planPct(DEMO_PLAN.etfBps)} ETF, ${planPct(DEMO_PLAN.cashBps)} hotovost · pásmo ±${(DEMO_PLAN.bandBps / 100n).toString()} p. b.`;

/**
 * Landing illustration of the Portfolio Lab loop (Pen 14.2): a purchase with real fictional-tariff costs,
 * a decision-time card for an off-plan instrument, and process feedback against an illustrative plan,
 * plus a one-decision crisis drill. Local state only: no portfolio, session, reward or request.
 *
 * On tall desktops the motion layer pins the demo and drives the step from the scroll position
 * (PORTFOLIO_STEP_EVENT). In that mode tabs and step buttons ask it to scroll to the step instead of
 * switching locally, so the scroll position and the visible step never disagree. Until the visitor picks an
 * instrument, the scroll also acts out the off-plan choice on step 2.
 */
export function PortfolioLabDemo() {
  const tabs = useTabsLayout();
  const [step, setStep] = useState<Step>(1);
  const [driven, setDriven] = useState(false);
  const [amountRaw, setAmountRaw] = useState(formatDecimal(DEMO_DEFAULT_AMOUNT_KC));
  const [tariffId, setTariffId] = useState<DemoTariffId>(DEMO_TARIFFS[0].id);
  const [instrument, setInstrument] = useState<DemoInstrumentId>("etf");
  const [waited, setWaited] = useState(false);
  const picked = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const panelRefs = useRef<Record<Step, HTMLElement | null>>({ 1: null, 2: null, 3: null });
  const tabRefs = useRef<Record<Step, HTMLButtonElement | null>>({ 1: null, 2: null, 3: null });
  const amount = checkAmount(amountRaw, tariffId);

  // Layout effect: the listener must exist before the motion layer's layout effect switches driven mode on.
  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const onStep = (event: Event) => {
      const { driven: nextDriven, step: nextStep } = (event as CustomEvent<PortfolioStepDetail>).detail;
      if (nextDriven !== undefined) setDriven(nextDriven);
      if (nextStep === undefined) return;
      setStep(nextStep);
      setWaited(false);
      if (!picked.current) setInstrument(nextStep === 2 ? "stock" : "etf");
    };
    element.addEventListener(PORTFOLIO_STEP_EVENT, onStep);
    return () => element.removeEventListener(PORTFOLIO_STEP_EVENT, onStep);
  }, []);

  function show(next: Step) {
    setWaited(false);
    if (driven) rootRef.current?.dispatchEvent(new CustomEvent<PortfolioStepRequestDetail>(PORTFOLIO_STEP_REQUEST_EVENT, { detail: { step: next } }));
    else if (tabs) setStep(next);
  }
  function goTo(next: Step) {
    show(next);
    // Focus the destination heading once it shows; on mobile this also scrolls it into view.
    requestAnimationFrame(() => panelRefs.current[next]?.querySelector<HTMLElement>("[data-panel-heading]")?.focus({ preventScroll: tabs }));
  }
  function pick(id: DemoInstrumentId) {
    picked.current = true;
    setInstrument(id);
  }
  function onTabKey(event: React.KeyboardEvent, current: Step) {
    const order: Step[] = [1, 2, 3];
    const index = order.indexOf(current);
    const next = event.key === "ArrowRight" ? order[(index + 1) % 3] : event.key === "ArrowLeft" ? order[(index + 2) % 3]
      : event.key === "Home" ? 1 : event.key === "End" ? 3 : null;
    if (!next) return;
    event.preventDefault();
    show(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }

  const panel = (current: Step, children: ReactNode) => {
    const label = STEPS[current - 1].label;
    // With tabs every panel shares one grid cell, so the demo keeps the tallest step's height and never jumps.
    const inactive = tabs && step !== current;
    return <section key={current} ref={(element) => { panelRefs.current[current] = element; }} className={styles.stepBlock}
      data-inactive={inactive ? "" : undefined} inert={inactive} aria-hidden={inactive || undefined}
      id={`${baseId}-panel-${current}`} role={tabs ? "tabpanel" : undefined} aria-labelledby={tabs ? `${baseId}-tab-${current}` : `${baseId}-step-${current}`}
      data-demo-step={current}>
      {!tabs && <div className={styles.stepLabel}><span aria-hidden="true">{current}</span><h3 id={`${baseId}-step-${current}`}><small>Krok {current} ze 3</small>{label}</h3></div>}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><strong>Portfolio Lab</strong><span>Ukázka Portfolio Labu · bez skutečných peněz</span></div>
          <div className={styles.capital}><span>Cvičný kapitál</span><strong>{money(DEMO_CAPITAL_MINOR)}</strong></div>
        </div>
        {children}
      </div>
    </section>;
  };

  return <div ref={rootRef} className={styles.demo} data-portfolio-demo data-driven={driven ? "" : undefined}>
    {tabs && <div className={styles.tabsWrap}>
      <div role="tablist" aria-label="Kroky ukázky Portfolio Labu" className={styles.tablist}>
        {STEPS.map(({ step: tab, label }) => <button key={tab} type="button" role="tab" id={`${baseId}-tab-${tab}`} aria-controls={`${baseId}-panel-${tab}`}
          aria-selected={step === tab} tabIndex={step === tab ? 0 : -1} className={styles.tab} ref={(element) => { tabRefs.current[tab] = element; }}
          onClick={() => show(tab)} onKeyDown={(event) => onTabKey(event, tab)}>
          <span className={styles.tabNumber} aria-hidden="true">{tab}</span>{label}
        </button>)}
      </div>
      {driven && <div className={styles.scrollProgress} aria-hidden="true"><span data-step-progress /></div>}
    </div>}
    <div className={tabs ? styles.panelStack : styles.panelList}>
      {panel(1, <PurchaseStep amountRaw={amountRaw} setAmountRaw={setAmountRaw} tariffId={tariffId} setTariffId={setTariffId}
        instrument={instrument} waited={waited} onWait={() => setWaited(true)} onChange={() => goTo(2)} onBuy={() => goTo(3)} />)}
      {panel(2, <DecisionStep amountRaw={amountRaw} setAmountRaw={setAmountRaw} tariffId={tariffId} instrument={instrument}
        setInstrument={pick} onBack={() => { picked.current = false; setInstrument("etf"); goTo(1); }} onContinue={() => goTo(1)} />)}
      {panel(3, <ProcessStep amountKc={amount.ok ? amount.amountKc : null} tariffId={tariffId} instrument={instrument} onFix={() => goTo(1)} />)}
    </div>
  </div>;
}

function PanelHeading({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return <div className={styles.panelHeading}><p className={styles.panelEyebrow}>{eyebrow}</p><h4 tabIndex={-1} data-panel-heading>{children}</h4></div>;
}

function AmountField({ amountRaw, setAmountRaw, tariffId }: { amountRaw: string; setAmountRaw: (value: string) => void; tariffId: DemoTariffId }) {
  const id = useId();
  const amount = checkAmount(amountRaw, tariffId);
  const remaining = amount.ok ? DEMO_CAPITAL_MINOR - demoCost(amount.amountKc, tariffId).debitMinor : null;
  return <div className={styles.field}>
    <label htmlFor={id}>Částka</label>
    <div className={styles.amountInput} data-invalid={amount.ok ? undefined : ""}>
      <input id={id} inputMode="numeric" autoComplete="off" value={amountRaw} aria-invalid={!amount.ok} aria-describedby={`${id}-hint`}
        onChange={(event) => setAmountRaw(event.target.value)}
        onBlur={() => { if (amount.ok) setAmountRaw(formatDecimal(amount.amountKc)); }} />
      <span aria-hidden="true">Kč</span>
    </div>
    <p id={`${id}-hint`} className={amount.ok ? styles.hint : styles.error} aria-live="polite">
      {amount.ok ? `Po nákupu a nákladech zbude v hotovosti ${money(remaining!)}.` : amount.message}
    </p>
  </div>;
}

function PurchaseStep({ amountRaw, setAmountRaw, tariffId, setTariffId, instrument, waited, onWait, onChange, onBuy }: {
  amountRaw: string; setAmountRaw: (value: string) => void; tariffId: DemoTariffId; setTariffId: (id: DemoTariffId) => void;
  instrument: DemoInstrumentId; waited: boolean; onWait: () => void; onChange: () => void; onBuy: () => void;
}) {
  const amount = checkAmount(amountRaw, tariffId);
  const cost = amount.ok ? demoCost(amount.amountKc, tariffId) : null;
  const profile = tariff(tariffId);
  const chosen = DEMO_INSTRUMENTS[instrument];
  const rate = (bps: number) => `${formatDecimal(bps / 100, { minimumFractionDigits: 2 })} %`;
  return <div className={styles.body}>
    <div className={styles.form}>
      <PanelHeading eyebrow="NÁKUP · CVIČNÝ KAPITÁL">Nový nákup</PanelHeading>
      <p className={styles.muted}>Odemčení Labu přinese {money(DEMO_UNLOCK_CAPITAL_MINOR)}. Každá další lekce od úrovně 2 přidá {money(DEMO_LESSON_CAPITAL_MINOR)}.</p>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Instrument</span>
        <div className={styles.instrument}>
          <div><strong>{chosen.name}</strong><span>{chosen.kind}</span></div>
          <button type="button" className={styles.linkButton} onClick={onChange}>Změnit<span className={styles.visuallyHidden}> instrument</span></button>
        </div>
      </div>
      <AmountField amountRaw={amountRaw} setAmountRaw={setAmountRaw} tariffId={tariffId} />
      <fieldset className={styles.tariffs}>
        <legend>Tarif · fiktivní</legend>
        {DEMO_TARIFFS.map((option) => <label key={option.id} className={styles.choice} data-checked={option.id === tariffId ? "" : undefined}>
          <input type="radio" name="demo-tariff" value={option.id} checked={option.id === tariffId} onChange={() => setTariffId(option.id)} />
          <span><strong>{option.name}</strong><small>Poplatek {rate(option.tradeFee.rateBps)} (min. {money(option.tradeFee.minMinor)}) · konverze {rate(option.fxMarkupBps)}</small></span>
        </label>)}
      </fieldset>
    </div>
    <div className={styles.review}>
      <div className={styles.reviewHead}><h4>Kontrola nákupu</h4><span>{profile.name}</span></div>
      <dl className={styles.costRows} data-cost-rows>
        <div><dt>Částka</dt><dd>{cost ? money(cost.amountMinor) : "—"}</dd></div>
        <div><dt>Poplatek<small>{rate(profile.tradeFee.rateBps)}, min. {money(profile.tradeFee.minMinor)}</small></dt><dd>{cost ? money(cost.feeMinor) : "—"}</dd></div>
        <div><dt>Měnová přirážka<small>{rate(profile.fxMarkupBps)} z částky</small></dt><dd>{cost ? money(cost.fxMarkupMinor) : "—"}</dd></div>
        <div className={styles.costTotal}><dt>Celkem náklady</dt><dd data-cost-total>{cost ? money(cost.totalCostMinor) : "—"}</dd></div>
      </dl>
      <p className={styles.note}><Info size={18} aria-hidden="true" />U malých nákupů rozhoduje minimum poplatku, u velkých konverze.</p>
      <table className={styles.compare}>
        <caption>Celkové náklady podle tarifu</caption>
        <thead><tr><th scope="col">Nákup</th>{DEMO_TARIFFS.map((option) => <th scope="col" key={option.id}>{option.name.replace("Investník ", "")}</th>)}</tr></thead>
        <tbody>{DEMO_COMPARISON_AMOUNTS_KC.map((kc) => {
          const totals = DEMO_TARIFFS.map((option) => demoCost(kc, option.id).totalCostMinor);
          const lowest = totals.reduce((min, value) => (value < min ? value : min));
          return <tr key={kc}><th scope="row">{formatKc(kc)}</th>{totals.map((total, index) => <td key={DEMO_TARIFFS[index].id} data-lowest={total === lowest ? "" : undefined}>
            {money(total)}{total === lowest ? <span> · nižší</span> : null}</td>)}</tr>;
        })}</tbody>
      </table>
      <div className={styles.actions}>
        <Button onClick={onBuy} disabled={!cost} data-demo-buy>Koupit nanečisto <ArrowRight size={18} aria-hidden="true" /></Button>
        <Button variant="secondary" onClick={onWait}>Počkat</Button>
      </div>
      <p className={styles.status} role="status">{waited ? "Nic se nekoupilo. Počkat je v Labu platné rozhodnutí, ne chyba." : ""}</p>
    </div>
  </div>;
}

function DecisionStep({ amountRaw, setAmountRaw, tariffId, instrument, setInstrument, onBack, onContinue }: {
  amountRaw: string; setAmountRaw: (value: string) => void; tariffId: DemoTariffId; instrument: DemoInstrumentId;
  setInstrument: (id: DemoInstrumentId) => void; onBack: () => void; onContinue: () => void;
}) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const results = (Object.keys(DEMO_INSTRUMENTS) as DemoInstrumentId[]).filter((id) => {
    const { name, kind } = DEMO_INSTRUMENTS[id];
    return `${name} ${kind}`.toLocaleLowerCase("cs").includes(query.trim().toLocaleLowerCase("cs"));
  });
  const amount = checkAmount(amountRaw, tariffId);
  const offPlan = !DEMO_INSTRUMENTS[instrument].inPlan;
  return <div className={styles.body}>
    <div className={styles.form}>
      <PanelHeading eyebrow="NÁKUP · CVIČNÝ KAPITÁL">Nový nákup</PanelHeading>
      <div className={styles.field}>
        <div className={styles.search}><Search size={18} aria-hidden="true" /><input id={searchId} aria-label="Hledat instrument" type="search" value={query} placeholder="Hledat, např. firma nebo ETF" onChange={(event) => setQuery(event.target.value)} /></div>
        <p className={styles.hint} aria-live="polite">{results.length === 1 ? "1 výsledek" : results.length === 0 ? "Nic nenalezeno" : `${results.length} výsledky`}</p>
        <div role="radiogroup" aria-label="Výsledky hledání" className={styles.results}>
          {results.map((id) => {
            const { name, kind, inPlan } = DEMO_INSTRUMENTS[id];
            return <label key={id} className={styles.result} data-checked={instrument === id ? "" : undefined}>
              <input type="radio" name="demo-instrument" checked={instrument === id} onChange={() => setInstrument(id)} />
              <span><strong>{name}</strong><small>{kind}</small></span>
              <em data-in-plan={inPlan ? "" : undefined}>{inPlan ? <CircleCheck size={16} aria-hidden="true" /> : <MapPinned size={16} aria-hidden="true" />}{inPlan ? "v plánu" : "mimo plán"}</em>
            </label>;
          })}
        </div>
      </div>
      <AmountField amountRaw={amountRaw} setAmountRaw={setAmountRaw} tariffId={tariffId} />
    </div>
    {offPlan
      ? <aside className={styles.decisionCard} aria-labelledby="demo-card-title" data-decision-card>
        <p className={styles.cardEyebrow}><MapPinned size={16} aria-hidden="true" />MIMO TVŮJ PLÁN</p>
        <h4 id="demo-card-title">Tento nákup není ve tvém plánu</h4>
        <p>Mix v tvém investičním plánu tento instrument neobsahuje. Pokud jde o změnu plánu, zapiš si nejdřív důvod. Nákup tím není zakázaný.</p>
        <dl className={styles.cardRows}>
          <div><dt>Mix v plánu</dt><dd>{planPct(DEMO_PLAN.etfBps)} ETF · {planPct(DEMO_PLAN.cashBps)} hotovost</dd></div>
          <div><dt>Tento nákup</dt><dd>akcie jedné firmy</dd></div>
          <div><dt>Podíl z cvičného kapitálu</dt><dd>{amount.ok ? planPct(demoProcess(amount.amountKc, tariffId, instrument).capitalShareBps) : "—"}</dd></div>
        </dl>
        <p className={styles.small}>Karta jen informuje. Rozhodnutí zůstává na tobě.</p>
        <div className={styles.cardActions}>
          <Button variant="secondary" onClick={onBack}>Zpět k plánu</Button>
          <Button variant="secondary" onClick={onContinue}>Pokračovat stejně</Button>
        </div>
      </aside>
      : <aside className={styles.inPlan} aria-labelledby="demo-in-plan-title">
        <p className={styles.panelEyebrow}><CircleCheck size={16} aria-hidden="true" />V PLÁNU</p>
        <h4 id="demo-in-plan-title">Tento nákup sedí s tvým plánem</h4>
        <p>Karta se ukáže jen ve chvíli, kdy vybereš něco, co tvůj plán neobsahuje. Zkus vybrat „{DEMO_INSTRUMENTS.stock.name}“.</p>
        <Button variant="secondary" onClick={onContinue}>Pokračovat ke kontrole nákupu</Button>
      </aside>}
  </div>;
}

function Status({ kind }: { kind: "in" | "out" | "info" }) {
  return <span className={styles.criterionStatus} data-kind={kind}>
    {kind === "in" ? <CircleCheck size={16} aria-hidden="true" /> : kind === "out" ? <CircleAlert size={16} aria-hidden="true" /> : <Info size={16} aria-hidden="true" />}
    {kind === "in" ? "V plánu" : kind === "out" ? "Mimo plán" : "Informace"}
  </span>;
}

function Criterion({ title, kind, value, detail, how }: { title: string; kind: "in" | "out" | "info"; value: string; detail: string; how: string }) {
  return <li className={styles.criterion} data-criterion={kind}>
    <div className={styles.criterionHead}><h5>{title}</h5><Status kind={kind} /></div>
    <strong>{value}</strong>
    <p>{detail}</p>
    <details><summary>Jak se to počítá</summary><p>{how}</p></details>
  </li>;
}

function ProcessStep({ amountKc, tariffId, instrument, onFix }: { amountKc: number | null; tariffId: DemoTariffId; instrument: DemoInstrumentId; onFix: () => void }) {
  if (amountKc === null) return <div className={styles.body}><div className={styles.form}>
    <PanelHeading eyebrow="JAK SE DRŽÍ TVŮJ PLÁN">Nejdřív zadej platnou částku</PanelHeading>
    <p className={styles.muted}>Zpětná vazba vychází z nákupu v kroku 1. Bez platné částky ji nejde spočítat a nic si nevymýšlíme.</p>
    <div className={styles.actions}><Button variant="secondary" onClick={onFix}>Zpět ke kroku 1</Button></div>
  </div></div>;
  const process = demoProcess(amountKc, tariffId, instrument);
  const { short, inPlan } = DEMO_INSTRUMENTS[instrument];
  const etfWidth = Number(process.etfBps) / 100;
  const holdingWidth = Number(process.holdingBps) / 100;
  return <div className={styles.processBody}>
    <div className={styles.processHead}>
      <PanelHeading eyebrow="JAK SE DRŽÍ TVŮJ PLÁN">Tvůj plán: {PLAN_LINE}</PanelHeading>
      <p className={styles.valueMeta}>Hodnota {money(process.totalMinor)}<span>{money(process.changeMinor)} od začátku (náklady)</span></p>
    </div>
    <p className={styles.muted}>Po nákupu z kroku 1: {formatKc(amountKc)} · {DEMO_INSTRUMENTS[instrument].name}.</p>
    <div className={styles.processGrid}>
      <ul className={styles.criteria} aria-label="Kritéria procesu">
        <Criterion title="Největší pozice" kind={process.holdingInPlan ? "in" : "out"} value={`${short} ${planPct(process.holdingBps)}`}
          detail={inPlan ? `Cíl ${planPct(DEMO_PLAN.etfBps)}, pásmo ${bandRange(DEMO_PLAN.etfBps)}.` : "Tvůj plán tento instrument neobsahuje, jeho cíl je 0 %."}
          how="Hodnota pozice dělená celou hodnotou portfolia včetně hotovosti. V plánu je, když se od cíle neliší víc než o pásmo z plánu." />
        <Criterion title="Hotovost" kind={process.cashInPlan ? "in" : "out"} value={`${planPct(process.cashBps)} proti cíli ${planPct(DEMO_PLAN.cashBps)}`}
          detail={`Pásmo ${bandRange(DEMO_PLAN.cashBps)}.`}
          how="Hotovost dělená celou hodnotou portfolia. Rezerva, kterou plán počítá, není chyba." />
        <Criterion title="Náklady za období" kind="info" value={money(process.cost.totalCostMinor)}
          detail={`1 nákup: poplatek ${money(process.cost.feeMinor)} + měnová přirážka ${money(process.cost.fxMarkupMinor)}.`}
          how="Součet poplatků a měnových přirážek všech obchodů za období podle zvoleného fiktivního tarifu." />
        <Criterion title="Obrat" kind="info" value={`${process.trades} obchod`} detail="Za celé období ukázky."
          how="Kolik obchodů a za kolik peněz proběhlo. Lab ho ukazuje jako informaci, ne jako cíl: víc obchodů znamená víc nákladů." />
      </ul>
      <div className={styles.split}>
        <h5>Rozložení proti plánu</h5>
        <div className={styles.bar} role="img" aria-label={`ETF ${planPct(process.etfBps)}, ${inPlan ? "" : `${short} ${planPct(process.holdingBps)}, `}hotovost ${planPct(process.cashBps)}; cíl ETF ${planPct(DEMO_PLAN.etfBps)}, pásmo ${bandRange(DEMO_PLAN.etfBps)}.`}>
          <span className={styles.barEtf} style={{ width: `${etfWidth}%` }} />
          {!inPlan && <span className={styles.barOther} style={{ width: `${holdingWidth}%` }} />}
          <span className={styles.barBand} style={{ left: `${Number(DEMO_PLAN.etfBps - DEMO_PLAN.bandBps) / 100}%`, width: `${Number(DEMO_PLAN.bandBps * 2n) / 100}%` }} />
          <span className={styles.barTarget} style={{ left: `${Number(DEMO_PLAN.etfBps) / 100}%` }} />
        </div>
        <ul className={styles.legend}>
          <li><i className={styles.legendEtf} />ETF<span>{planPct(process.etfBps)} · cíl {planPct(DEMO_PLAN.etfBps)}</span></li>
          {!inPlan && <li><i className={styles.legendOther} />{short}<span>{planPct(process.holdingBps)} · cíl 0 %</span></li>}
          <li><i className={styles.legendCash} />Hotovost<span>{planPct(process.cashBps)} · cíl {planPct(DEMO_PLAN.cashBps)}</span></li>
          <li><i className={styles.legendTarget} />Cíl<span>světlý pás = pásmo ±{(DEMO_PLAN.bandBps / 100n).toString()} p. b.</span></li>
        </ul>
        <p className={styles.callout}><CircleCheck size={18} aria-hidden="true" />Počkat a dodržet plán je taky správný výsledek.</p>
      </div>
    </div>
  </div>;
}

/** Month-6 decision in the Lab's model crisis. Judged against the plan, never by the return. */
export function CrisisDrill() {
  const [choice, setChoice] = useState<CrisisChoice | null>(null);
  const outcome = choice ? crisisOutcome(choice) : null;
  const before = crisisOutcome("hold").shareBeforeBps;
  const width = 392, height = 150, pad = 8;
  const min = 60, max = 100;
  const points = CRISIS_LEVELS.map((level, month) => [pad + (month * (width - 2 * pad)) / (CRISIS_LEVELS.length - 1), pad + ((max - level) * (height - 2 * pad)) / (max - min)] as const);
  const [lowX, lowY] = points[CRISIS_DECISION_MONTH];
  const explanation: Record<CrisisChoice, string> = {
    sell: `Plán prodej v propadu neobsahoval: podíl v indexu byl ${planPct(before)}, uvnitř pásma ${bandRange(DEMO_PLAN.etfBps)}.`,
    hold: "Podíl zůstal v pásmu, takže plán žádný obchod nevyžadoval.",
    buy: "Dokoupení z hotovosti vrátilo podíl na cíl. Žádný prodej.",
  };
  return <div className={styles.crisis} data-crisis>
    <p className={styles.crisisEyebrow}>KRIZOVÝ NÁCVIK · DOVĚTEK</p>
    <h3 className={styles.crisisTitle}>Trh spadne o 30 %. Co uděláš?</h3>
    <figure className={styles.chart}>
      <figcaption><span>Modelový index po měsících</span><span className={styles.chip}>Modelový scénář</span></figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Modelový index: start 100, v měsíci ${CRISIS_DECISION_MONTH} ${CRISIS_LEVELS[CRISIS_DECISION_MONTH]} (−30 %), v měsíci 12 ${CRISIS_LEVELS[12]}.`}>
        <polyline data-crisis-line points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle data-crisis-low cx={lowX} cy={lowY} r="5" className={styles.lowDot} />
        <circle cx={points.at(-1)![0]} cy={points.at(-1)![1]} r="4" fill="currentColor" />
      </svg>
      <div className={styles.chartLabels} aria-hidden="true"><span>start 100</span><span className={styles.lowLabel}>−30 % · měsíc {CRISIS_DECISION_MONTH}</span><span>měsíc 12</span></div>
    </figure>
    <p className={styles.crisisContext}>Měsíc {CRISIS_DECISION_MONTH}: index je o 30 % níž. Tvůj plán: {planPct(DEMO_PLAN.etfBps)} ETF, pásmo ±{(DEMO_PLAN.bandBps / 100n).toString()} p. b.</p>
    <fieldset className={styles.crisisChoices}>
      <legend className={styles.visuallyHidden}>Co uděláš v měsíci {CRISIS_DECISION_MONTH}?</legend>
      {CRISIS_CHOICES.map(({ id, label, detail }) => <label key={id} className={styles.crisisChoice} data-checked={choice === id ? "" : undefined}>
        <input type="radio" name="demo-crisis" value={id} checked={choice === id} onChange={() => setChoice(id)} />
        <span><strong>{label}</strong><small>{detail}</small></span>
        {choice === id && <em>vybráno</em>}
      </label>)}
    </fieldset>
    <div className={styles.crisisResult} role="status" data-crisis-result>
      {outcome && choice ? <>
        <p data-ok={outcome.sellsOutsidePlan === 0 ? "" : undefined}>{outcome.sellsOutsidePlan === 0 ? <CircleCheck size={18} aria-hidden="true" /> : <CircleAlert size={18} aria-hidden="true" />}Prodeje mimo pravidla: {outcome.sellsOutsidePlan}</p>
        <p data-ok={outcome.inBand ? "" : undefined}>{outcome.inBand ? <CircleCheck size={18} aria-hidden="true" /> : <CircleAlert size={18} aria-hidden="true" />}Podíl v indexu: {planPct(outcome.indexBps)} · {outcome.inBand ? "v pásmu" : "mimo pásmo"}</p>
        <small>{explanation[choice]}</small>
      </> : <small>Vyber jednu možnost a uvidíš, jak se drží tvůj plán.</small>}
    </div>
    <p className={styles.crisisNote}>Hodnotí se, jestli dodržíš plán, ne jestli vyděláš. Zjednodušeno: bez poplatků a pravidelných vkladů.</p>
  </div>;
}
