import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, FileText, FlaskConical, HeartPulse, ListChecks, Play, Scale, Target, type LucideIcon } from "lucide-react";
import { DemoButton } from "@/components/auth/demo-button";
import { LessonPreview, MobileNavigation } from "./pen-interactions";
import { CrisisDrill, PortfolioLabDemo } from "./portfolio-lab-demo";
import { MotionRoot } from "./motion/motion-root";
import { SplitHeading } from "./motion/reveal";
import { legalLinks } from "@/components/legal/legal-links";
import styles from "./pen-landing.module.css";
import { Wordmark } from "@/components/brand/wordmark";
import { LiquidGlass } from "./liquid-glass";

/**
 * Milestone A path. Statuses mirror the published inventory (lessons/registry.ts, learning/curriculum.ts):
 * change a status only when the lesson or Lab tool behind it is published.
 */
const path: readonly { title: string; detail: string; status: string; state: "next" | "open" | "lab" }[] = [
  { title: "0 · Než začneš investovat", detail: "Rozpočet, drahý dluh, cíle a\u00a0check-up. Rezervu, penzijko s\u00a0DIP a\u00a0podvody připravujeme.", status: "Začni tady", state: "next" },
  { title: "1 · Jak investice fungují", detail: "Akcie, dluhopisy, ETF, indexy a\u00a0náklady fondů. Aktivní, nebo indexové investování?", status: "Dostupné", state: "open" },
  { title: "2 · Investování v\u00a0Česku v\u00a0praxi", detail: "Náklady a\u00a0ceníky brokerů, výběr ETF, investiční plán (IPS) a\u00a0první nákup nanečisto. Brokera a\u00a0účet, produkty v\u00a0EU a\u00a0daně připravujeme.", status: "Dostupné", state: "open" },
  { title: "Portfolio Lab · plán a\u00a0krize", detail: "Vlastní investiční plán (IPS) a\u00a0modelová krize měsíc po měsíci, bez skutečných peněz.", status: "Dostupné v\u00a0Labu", state: "lab" },
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

const trust: readonly (readonly [string, string])[] = [
  ["Datované údaje", "Sazby, limity a\u00a0lhůty vedeme se zdrojem, datem ověření a\u00a0termínem další kontroly."],
  ["Daně až po odborné revizi", "Daňové a\u00a0regulatorní lekce vyjdou až po schválení daňovým poradcem. Do té doby je označujeme jako připravované."],
  ["Žádná doporučení", "Nedoporučujeme konkrétní brokery, fondy ani akcie a\u00a0neřadíme je za provizi. Investník není broker a\u00a0se skutečnými penězi nepracuje."],
];

export function PenLanding() {
  return <MotionRoot className={styles.landing}>
    <LiquidGlass />
    <a className={styles.skip} href="#main">Přejít k&nbsp;obsahu</a>
    <header className={styles.siteHeader} data-nav>
      <div className={`${styles.navPill} ${styles.glass} ${styles.lens}`} data-glass>
        <Link href="/" className={styles.wordmark} aria-label="Investník · úvodní stránka"><Wordmark /></Link>
        <nav className={styles.topNav} aria-label="Hlavní navigace">
          <a href="#jak-to-funguje">Jak to funguje</a>
          <a href="#portfolio-lab">Portfolio Lab</a>
          <Link href="/sign-in" prefetch={false} className={styles.navSignIn} data-press>Přihlásit se</Link>
          <Link href="/onboarding" prefetch={false} className={styles.navStart} data-press>Začít</Link>
        </nav>
        <MobileNavigation />
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.container}>
          <h1 id="hero-title" data-hero-title>Nejdřív plán.<br/><span>Pak investice.</span></h1>
          <div className={styles.heroIntro} data-hero-intro>
            <div className={styles.heroActions} data-hero-actions>
              <Link className={styles.primaryButton} href="/onboarding" prefetch={false} data-press>Začít vstupním testem <ArrowRight aria-hidden="true" size={18}/></Link>
              <a className={styles.textAction} href="#jak-to-funguje">Jak to funguje</a>
            </div>
            <p className={styles.heroNote}>Pár otázek o&nbsp;tvých cílech a&nbsp;znalostech doporučí, kde začít.</p>
          </div>
          <div className={styles.heroLessonWrap} data-hero-card role="group" aria-label="Ukázka lekce; nezapisuje pokrok ani neuděluje XP">
            <Image className={styles.heroArt} data-hero-art src="/marketing/v14-curiosity-cropped.webp" alt="" aria-hidden="true" width={512} height={519} sizes="(max-width: 500px) 98px, (max-width: 1100px) 194px, 256px" preload />
            <div className={styles.lessonBrowserHeader}><span>Než začneš investovat <span aria-hidden="true">/</span> <strong>Dluh, nebo investice?</strong></span><span>Ukázka lekce 0.1.2 · ≈&nbsp;12&nbsp;min</span></div>
            <LessonPreview />
          </div>
          <p className={styles.microDisclaimer}>Modelový příklad z&nbsp;publikované lekce, ne osobní doporučení.</p>
        </div>
      </section>
      <section className={styles.journey} id="jak-to-funguje" aria-labelledby="journey-title">
        <div className={styles.container}>
          <SplitHeading id="journey-title">Od rozpočtu<br/>k vlastnímu plánu.</SplitHeading>
          <div className={styles.journeyContent}>
            <div className={styles.journeyIllustration} aria-hidden="true" data-reveal="fade">
              <Image src="/marketing/v14-discovery-edge.webp" alt="" width={685} height={1065} sizes="(max-width: 780px) 250px, (max-width: 1100px) 302px, 397px" />
            </div>
            <div className={styles.courseCard} data-course-card data-reveal>
              <Image className={styles.discoveryGripTop} src="/marketing/v14-discovery-top-grip.webp" alt="" aria-hidden="true" width={136} height={86} />
              <Image className={styles.discoveryGripSide} src="/marketing/v14-discovery-side-grip.webp" alt="" aria-hidden="true" width={97} height={115} />
              <h3 className={styles.courseTitle}>Cesta k&nbsp;milníku „Připraven/a začít“</h3>
              <ol className={styles.courseSteps}>
                {path.map(({ title, detail, status, state }) => <li className={styles.courseRow} key={title} data-course-row={state}>
                  <span className={styles.rowIcon}>{state === "next" ? <Play size={12} aria-hidden="true"/> : state === "lab" ? <FlaskConical size={13} aria-hidden="true"/> : null}</span>
                  <span className={styles.rowText}><strong>{title}</strong><span>{detail}</span></span>
                  <small>{status}</small>
                </li>)}
              </ol>
              <p className={styles.courseNote}>Milník se počítá z&nbsp;lekcí, které už vyšly. Daně ani výběr brokera zatím nezahrnuje.</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.lessonSection} aria-labelledby="lesson-title">
        <div className={`${styles.container} ${styles.lessonSectionLayout}`}>
          <div className={styles.lessonSectionCopy}>
            <SplitHeading id="lesson-title">Každý modul končí<br/>výstupem.</SplitHeading>
            <p data-reveal data-reveal-delay="0.2">Lekce začíná rozhodnutím v&nbsp;modelové situaci. Vysvětlení ukáže proč, ne jen co je správně. Na konci modulu si výstup uložíš k&nbsp;účtu a&nbsp;vrátíš se k&nbsp;němu, až se budeš rozhodovat doopravdy.</p>
          </div>
          <ul className={styles.outputList} aria-label="Výstupy modulů" data-reveal data-reveal-delay="0.1">
            {outputs.map(([title, status, available], i) => { const Icon = outputIcons[i]; return <li key={title} data-available={available ? "" : undefined}><Icon size={18} aria-hidden="true"/><span>{title}</span><small>{status}</small></li>; })}
          </ul>
        </div>
      </section>
      <section className={styles.labSection} id="portfolio-lab" aria-labelledby="lab-title">
        <div className={styles.container}>
          <div className={styles.labIntro}>
            <p className={styles.labBadge} data-reveal="fade"><span className={styles.labDot} aria-hidden="true"/>Portfolio Lab a&nbsp;krizový nácvik</p>
            <SplitHeading id="lab-title">Proces, <span>ne&nbsp;výnos.</span></SplitHeading>
            <p className={styles.labLead} data-reveal data-reveal-delay="0.2">Svůj plán si vyzkoušíš s&nbsp;cvičným kapitálem, který dostaneš za lekce. Lab ukáže náklady, rozložení a&nbsp;soulad s&nbsp;plánem. Někdy je nejlepší rozhodnutí počkat.</p>
            <small className={styles.labNote} data-reveal data-reveal-delay="0.3">Hodnotí se postup, ne zisk. Nic se doopravdy nekupuje.</small>
          </div>
          <div className={styles.labDemo} data-lab-demo role="group" aria-label="Ukázka Portfolio Labu; nic nekupuje ani neukládá" data-reveal><PortfolioLabDemo/><CrisisDrill/></div>
          <div className={styles.labFooter}><p>Výukový model s&nbsp;fiktivními cenami a&nbsp;tarify. Nejde o&nbsp;investiční doporučení ani odhad budoucího výnosu.</p><Link href="/onboarding" prefetch={false} className={styles.primaryButton} data-press>Začít vstupním testem <ArrowRight aria-hidden="true" size={18}/></Link></div>
        </div>
      </section>
      <section className={styles.progressSection} aria-labelledby="progress-title">
        <div className={styles.container}>
          <SplitHeading id="progress-title">Fakta se zdrojem. Žádné tipy.</SplitHeading>
          <div className={styles.progressLayout}>
            <div className={styles.progressImage} aria-hidden="true" data-reveal="fade"><Image src="/marketing/v14-steady-understanding.webp" alt="" width={1174} height={654} sizes="(max-width: 780px) calc(100vw - 48px), (max-width: 1100px) 400px, 570px" /></div>
            <dl className={styles.trustList} data-reveal data-reveal-stagger>
              {trust.map(([title, detail]) => <div key={title}><dt>{title}</dt><dd>{detail}</dd></div>)}
            </dl>
          </div>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.container}><Image className={styles.closingArt} data-closing-art src="/marketing/generated-19.webp" alt="" aria-hidden="true" width={1000} height={747} sizes="(max-width: 500px) 300px, (max-width: 780px) 500px, 360px" /><div className={`${styles.closingSlab} ${styles.glass}`} data-glass><SplitHeading id="closing-title" mode="chars">Začni tam,<br/>kde právě jsi.</SplitHeading><p data-reveal data-reveal-delay="0.3">Pár otázek ukáže, kde začít.<br/> Úroveň 0 je doporučená, ne povinná.</p><div className={styles.closingActions} data-reveal data-reveal-delay="0.4"><Link href="/onboarding" prefetch={false} className={styles.primaryButton} data-press>Začít vstupním testem <ArrowRight aria-hidden="true" size={18}/></Link><DemoButton compact className={styles.demoButtonWrap} buttonClassName={styles.secondaryButton}/></div></div></div>
      </section>
    </main>
    <footer className={styles.footer} data-footer><div className={styles.container}><Link href="/" className={styles.wordmark} aria-label="Investník · úvodní stránka"><Wordmark /></Link><p>Vzdělávání, ne investiční doporučení.</p><nav aria-label="Patička"><Link href="/pruvodce" prefetch={false}>Průvodce</Link><Link href="/pro-instituce" prefetch={false}>Pro instituce</Link><a href="#jak-to-funguje">Jak to funguje</a><Link href="/sign-in" prefetch={false}>Přihlásit se</Link>{legalLinks.map((link) => <Link key={link.href} href={link.href} prefetch={false}>{link.label}</Link>)}</nav></div></footer>
  </MotionRoot>;
}
