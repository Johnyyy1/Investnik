import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, CalendarCheck, CircleDashed, CircleDot, Coins, FileText, HeartPulse, Hourglass, ListChecks, Play, Scale, ShieldCheck, Target, type LucideIcon } from "lucide-react";
import { DemoButton } from "@/components/auth/demo-button";
import { LessonPreview, MobileNavigation } from "./pen-interactions";
import { CrisisDrill, PortfolioLabDemo } from "./portfolio-lab-demo";
import { MotionRoot } from "./motion/motion-root";
import { SplitHeading, magneticProps } from "./motion/reveal";
import { legalLinks } from "@/components/legal/legal-links";
import styles from "./pen-landing.module.css";
import { Wordmark } from "@/components/brand/wordmark";
import { LiquidGlass } from "./liquid-glass";

/**
 * Milestone A path. Statuses mirror the published inventory (lessons/registry.ts, learning/curriculum.ts):
 * change a status only when the lesson or Lab tool behind it is published.
 */
const path: readonly { title: string; detail: string; status: string; state: "next" | "open" | "planned"; lab?: true }[] = [
  { title: "0 · Než začneš investovat", detail: "Rozpočet, drahý dluh, cíle a\u00a0check-up. Rezervu, penzijko s\u00a0DIP a\u00a0podvody připravujeme.", status: "Doporučený začátek", state: "next" },
  { title: "1 · Jak investice fungují", detail: "Akcie, dluhopisy, ETF, indexy a\u00a0náklady fondů. Aktivní, nebo indexové investování?", status: "Dostupné", state: "open" },
  { title: "2 · Investování v\u00a0Česku v\u00a0praxi", detail: "Náklady a\u00a0ceníky brokerů, výběr ETF, investiční plán (IPS) a\u00a0první nákup nanečisto. Brokera a\u00a0účet, produkty v\u00a0EU a\u00a0daně připravujeme.", status: "Dvanáct lekcí dostupných", state: "open" },
  { title: "Vlastní investiční plán (IPS)", detail: "Cíle, rozložení, vklady a\u00a0pravidlo pro propad.", status: "Dostupné v\u00a0Labu", state: "open", lab: true },
  { title: "Krizový nácvik", detail: "Modelová krize měsíc po měsíci, bez skutečných peněz.", status: "Dostupné v\u00a0Labu", state: "open", lab: true },
];

const outputs = [
  ["Finanční check-up", "Dostupné", true],
  ["Mapa cílů a\u00a0horizontů", "Dostupné", true],
  ["Investiční plán (IPS)", "Dostupné v\u00a0Labu", true],
  ["Srovnání nákladů", "Dostupné", true],
  ["Checklist výběru ETF", "Dostupné", true],
  ["Checklist brokera", "Připravujeme", false],
] as const;
/** Same order as `outputs`. */
const outputIcons: readonly LucideIcon[] = [HeartPulse, Target, FileText, Scale, ListChecks, Building2];

const trust: readonly (readonly [LucideIcon, string, string])[] = [
  [CalendarCheck, "Fakta se zdrojem a\u00a0datem ověření", "Sazby, limity a\u00a0lhůty vedeme jako datované údaje se zdrojem, datem ověření a\u00a0termínem další kontroly."],
  [ShieldCheck, "Daně a\u00a0regulace s\u00a0odbornou revizí", "Daňové a\u00a0regulatorní lekce vyjdou až po schválení daňovým poradcem. Do té doby je označujeme jako připravované."],
  [Scale, "Vzdělávání, ne investiční doporučení", "Nedoporučujeme konkrétní brokery, fondy ani akcie a\u00a0neřadíme je za provizi. Učíš se porovnávat kritéria a\u00a0zdroje."],
  [BookOpen, "Odměny za učení, ne za obchody", "XP a\u00a0cvičný kapitál získáš za lekce. Za obchody, riziko ani výnos nic nedostaneš."],
];

export function PenLanding() {
  return <MotionRoot className={styles.landing}>
    <LiquidGlass />
    <div className={styles.scrollProgress} data-scroll-progress aria-hidden="true"/>
    <a className={styles.skip} href="#main">Přejít k&nbsp;obsahu</a>
    <header className={styles.siteHeader} data-nav>
      <div className={`${styles.container} ${styles.navPill} ${styles.glass} ${styles.lens}`} data-glass>
        <Link href="/" className={styles.wordmark} aria-label="Investník · úvodní stránka"><Wordmark /></Link>
        <nav className={styles.topNav} aria-label="Hlavní navigace">
          <a href="#jak-to-funguje">Jak to funguje</a>
          <a href="#portfolio-lab">Portfolio Lab</a>
          <Link href="/sign-in" prefetch={false} className={styles.navSignIn} data-press {...magneticProps}>Přihlásit se</Link>
          <Link href="/onboarding" prefetch={false} className={styles.navStart} data-press>Začít</Link>
        </nav>
        <MobileNavigation />
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.container}>
          <p className={styles.eyebrow}>LEARN INVESTING BY DOING</p>
          <h1 id="hero-title" data-hero-title>Nejdřív plán.<br/><span>Pak investice.</span></h1>
          <div className={styles.heroIntro} data-hero-intro>
            <div className={styles.heroActions} data-hero-actions>
              <Link className={`${styles.primaryButton} ${styles.shimmerHost}`} href="/onboarding" prefetch={false} data-lift data-press {...magneticProps}>Začít vstupním testem <ArrowRight aria-hidden="true" size={18}/><span className={styles.shimmer} data-shimmer aria-hidden="true"/></Link>
              <a className={styles.textAction} href="#jak-to-funguje">Jak to funguje</a>
            </div>
            <p className={styles.heroNote}>Pár otázek o&nbsp;tvých cílech a&nbsp;znalostech doporučí, kde začít. Lekce o&nbsp;rezervě, výběru brokera a&nbsp;daních připravujeme.</p>
          </div>
          <div className={styles.heroLessonWrap} data-hero-card role="group" aria-label="Ukázka lekce; nezapisuje pokrok ani neuděluje XP">
            <Image className={styles.heroArt} data-hero-art src="/marketing/v14-curiosity-cropped.webp" alt="" aria-hidden="true" width={512} height={519} sizes="(max-width: 500px) 98px, (max-width: 1100px) 194px, 256px" preload />
            <div className={styles.lessonBrowserHeader}><Wordmark className={styles.smallWordmark} /><span>Než začneš investovat / Dluh, nebo investice?</span><span>Lekce 0.1.2 · ≈ 12 min</span><span>Ukázka lekce</span></div>
            <LessonPreview hero />
          </div>
          <p className={styles.microDisclaimer}>Ukázka z&nbsp;lekce · modelový příklad, ne osobní doporučení</p>
        </div>
      </section>
      <section className={styles.journey} id="jak-to-funguje" aria-labelledby="journey-title">
        <div className={styles.container}>
          <p className={styles.eyebrow} data-reveal="fade">JAK TO FUNGUJE</p>
          <SplitHeading id="journey-title">Od rozpočtu<br/>k vlastnímu plánu.</SplitHeading>
          <div data-journey-pin>
          <div className={styles.journeyContent}>
            <div className={styles.journeyIllustration} aria-hidden="true" data-journey-art>
              <Image src="/marketing/v14-discovery-edge.webp" alt="" width={685} height={1065} sizes="(max-width: 780px) 250px, (max-width: 1100px) 302px, 397px" />
            </div>
            <div className={styles.courseCard} data-course-card>
              <Image className={styles.discoveryGripTop} src="/marketing/v14-discovery-top-grip.webp" alt="" aria-hidden="true" width={136} height={86} />
              <Image className={styles.discoveryGripSide} src="/marketing/v14-discovery-side-grip.webp" alt="" aria-hidden="true" width={97} height={115} />
              <div className={styles.courseHeader}><div><span className={styles.cardOverline}>Co je dostupné dnes a&nbsp;co připravujeme</span><h3>Cesta k&nbsp;milníku „Připraven/a začít“</h3></div><span>Úrovně 0–2</span></div>
              <ol className={styles.courseSteps}>
                {path.filter(item => !item.lab).map(({ title, detail, status, state }) => <li className={styles.courseRow} key={title} data-course-row={state} data-planned={state === "planned" ? "" : undefined}>
                  <span className={styles.rowIcon} data-row-icon>{state === "next" ? <Play size={14} aria-hidden="true"/> : state === "planned" ? <CircleDashed size={14} aria-hidden="true"/> : <CircleDot size={14} aria-hidden="true"/>}</span>
                  <span className={styles.rowText}><strong>{title}</strong><span>{detail}</span></span>
                  <small data-row-status>{status}</small>
                </li>)}
              </ol>
              <ul className={styles.courseLab} aria-label="V Portfolio Labu">
                {path.filter(item => item.lab).map(({ title, detail, status, state }) => <li key={title} data-course-row={state}>
                  <div><strong>{title}</strong><small data-row-status>{status}</small></div>
                  <span>{detail}</span>
                </li>)}
              </ul>
              <p>Milník se počítá z&nbsp;lekcí, které už vyšly. Daně ani výběr brokera zatím nezahrnuje.</p>
            </div>
          </div>
          <div className={styles.threeSteps} data-steps><span className={styles.stepsLine} data-steps-line aria-hidden="true"/>{[["01","Rozhodni se","Modelová situace s\u00a0dluhem, rezervou nebo poplatkem. Nejdřív zvolíš ty."],["02","Pochop důsledek","Vysvětlení ukáže proč, ne jen co je správně."],["03","Odnes si výstup","Check-up, mapu cílů nebo plán, ke kterému se vrátíš."]].map(([num,title,description])=><div key={num} data-step><span data-step-num>{num}</span><h3>{title}</h3><p>{description}</p></div>)}</div>
          </div>
        </div>
      </section>
      <section className={styles.lessonSection} aria-labelledby="lesson-title">
        <div className={`${styles.container} ${styles.lessonSectionLayout}`}>
          <div className={styles.lessonSectionCopy}><p className={styles.eyebrow} data-reveal="fade">UČENÍ TÍM, ŽE TO ZKUSÍŠ</p><SplitHeading id="lesson-title">Každý modul končí<br/>výstupem.</SplitHeading><p data-reveal data-reveal-delay="0.2">Otázky ověří, že tomu rozumíš. Výstup ti zůstane: uložíš si ho k&nbsp;účtu a&nbsp;vrátíš se k&nbsp;němu, až se budeš rozhodovat doopravdy.</p>
            <ul className={styles.outputList} aria-label="Výstupy modulů" data-reveal data-reveal-delay="0.3">
              {outputs.map(([title, status, available], i) => { const Icon = outputIcons[i]; return <li key={title} data-available={available ? "" : undefined}><Icon size={18} aria-hidden="true"/><span>{title}</span><small>{status}</small></li>; })}
            </ul>
          </div>
          <div className={styles.lessonSectionDemo} data-reveal><LessonPreview compact/></div>
        </div>
      </section>
      <section className={styles.labSection} id="portfolio-lab" aria-labelledby="lab-title">
        <div className={styles.container}>
          <div className={styles.labIntro}>
            <p className={`${styles.eyebrow} ${styles.labBadge}`} data-reveal="fade"><span className={styles.labDot} aria-hidden="true"/>PORTFOLIO LAB A&nbsp;KRIZOVÝ NÁCVIK</p>
            <SplitHeading id="lab-title">Proces, <span>ne&nbsp;výnos.</span></SplitHeading>
            <p className={styles.labLead} data-reveal data-reveal-delay="0.2">Svůj plán si vyzkoušíš s&nbsp;cvičným kapitálem, který dostaneš za lekce. Lab ukáže náklady, rozložení a&nbsp;soulad s&nbsp;tvým investičním plánem.</p>
            <ul className={styles.labPrinciples} aria-label="Co si v Labu vyzkoušíš" data-reveal data-reveal-stagger data-reveal-delay="0.3">
              <li><Coins size={18} aria-hidden="true"/>Cvičný kapitál za lekce</li>
              <li><Scale size={18} aria-hidden="true"/>Náklady a&nbsp;rozložení vůči plánu</li>
              <li><Hourglass size={18} aria-hidden="true"/>Někdy je správně vyčkat</li>
            </ul>
            <small className={styles.labNote}>Hodnotí se postup, ne zisk. Nic se doopravdy nekupuje.</small>
          </div>
          <div className={styles.labDemo} data-lab-demo role="group" aria-label="Ukázka Portfolio Labu; nic nekupuje ani neukládá" data-reveal><PortfolioLabDemo/><CrisisDrill/></div>
          <div className={styles.labFooter}><p>Výukový model s&nbsp;fiktivními cenami a&nbsp;tarify. Nejde o&nbsp;investiční doporučení ani odhad budoucího výnosu.</p><Link href="/onboarding" prefetch={false} className={styles.primaryButton} data-lift data-press {...magneticProps}>Začít učením <ArrowRight aria-hidden="true" size={18}/></Link></div>
        </div>
      </section>
      <section className={styles.progressSection} aria-labelledby="progress-title">
        <div className={styles.container}>
          <p className={styles.eyebrow} data-reveal="fade">NA ČEM STAVÍME</p><SplitHeading id="progress-title">Fakta se zdrojem. Žádné tipy.</SplitHeading>
          <div className={styles.progressLayout}>
            <div className={styles.progressImage} aria-hidden="true" data-progress-art><Image src="/marketing/v14-steady-understanding.webp" alt="" width={1174} height={654} sizes="(max-width: 780px) calc(100vw - 48px), (max-width: 1100px) 400px, 570px" /></div>
            <div className={styles.progressCard} data-progress-card>
              <span className={styles.cardOverline}>Jak pracujeme s&nbsp;obsahem</span>
              {trust.map(([Icon, title, detail]) => <div className={styles.progressItem} key={title} data-progress-item><Icon size={20} aria-hidden="true"/><div><span>{title}</span><small>{detail}</small></div></div>)}
              <p className={styles.progressPromise}>Investník je vzdělávací produkt. Není broker a&nbsp;se skutečnými penězi nepracuje.</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.container}><Image className={styles.closingArt} data-closing-art src="/marketing/generated-19.webp" alt="" aria-hidden="true" width={1000} height={747} sizes="(max-width: 500px) 300px, (max-width: 780px) 500px, 360px" /><div className={`${styles.closingSlab} ${styles.glass}`} data-glass><SplitHeading id="closing-title" mode="chars">Začni tam,<br/>kde právě jsi.</SplitHeading><p data-reveal data-reveal-delay="0.3">Pár otázek ukáže, kde začít.<br/> Úroveň 0 je doporučená, ne povinná.</p><div className={styles.closingActions} data-reveal data-reveal-delay="0.4"><Link href="/onboarding" prefetch={false} className={`${styles.primaryButton} ${styles.shimmerHost}`} data-lift data-press {...magneticProps}>Začít vstupním testem <ArrowRight aria-hidden="true" size={18}/><span className={styles.shimmer} data-shimmer aria-hidden="true"/></Link><DemoButton compact className={styles.demoButtonWrap} buttonClassName={styles.secondaryButton}/></div></div></div>
      </section>
    </main>
    <footer className={styles.footer} data-footer><div className={styles.container}><Link href="/" className={styles.wordmark} aria-label="Investník · úvodní stránka"><Wordmark /></Link><p>Vzdělávání, ne investiční doporučení.</p><nav aria-label="Patička"><Link href="/pruvodce" prefetch={false}>Průvodce</Link><Link href="/pro-instituce" prefetch={false}>Pro instituce</Link><a href="#jak-to-funguje">Jak to funguje</a><Link href="/sign-in" prefetch={false}>Přihlásit se</Link>{legalLinks.map((link) => <Link key={link.href} href={link.href} prefetch={false}>{link.label}</Link>)}</nav></div></footer>
  </MotionRoot>;
}
