import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck, CircleDashed, CircleDot, Play, Scale, ShieldCheck, type LucideIcon } from "lucide-react";
import { DemoButton } from "@/components/auth/demo-button";
import { LessonPreview, MobileNavigation } from "./pen-interactions";
import { CrisisDrill, PortfolioLabDemo } from "./portfolio-lab-demo";
import { MotionRoot } from "./motion/motion-root";
import { SplitHeading, magneticProps } from "./motion/reveal";
import { legalLinks } from "@/components/legal/legal-links";
import styles from "./pen-landing.module.css";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * Milestone A path. Statuses mirror the published inventory (lessons/registry.ts, learning/curriculum.ts):
 * change a status only when the lesson or Lab tool behind it is published.
 */
const path: readonly { title: string; detail: string; status: string; state: "next" | "open" | "planned" }[] = [
  { title: "0 · Než začneš investovat", detail: "Rozpočet, drahý dluh, cíle a horizont, finanční check-up. Rezervu, penzijko s DIP a podvody připravujeme.", status: "Doporučený začátek", state: "next" },
  { title: "1 · Jak investice fungují", detail: "Akcie, dluhopisy, ETF a indexy, fondy a jejich náklady, aktivní a indexové investování. Závěrečnou kontrolu připravujeme.", status: "Dostupné", state: "open" },
  { title: "2 · Investování v Česku v praxi", detail: "Náklady fondu i obchodu: TER, rozdíl vůči indexu, spread, minimální poplatek, čtení ceníku brokera, měnová konverze, dopad nákladů za 30 let, srovnání dvou brokerů pro vlastní plán, checklist výběru ETF, sepsání investičního plánu (IPS), pravidelná investice nastavená předem a první nákup nanečisto. Brokera a účet, další náklady, produkty v EU a české daně připravujeme.", status: "Deset lekcí dostupných", state: "open" },
  { title: "Vlastní investiční plán (IPS)", detail: "Cíle, rozložení, pravidelné vklady a pravidlo pro propad zapíšeš v Labu.", status: "Dostupné v Labu", state: "open" },
  { title: "Krizový nácvik", detail: "Modelovou krizí projdeš měsíc po měsíci bez skutečných peněz a ověříš, jestli se držíš svého plánu.", status: "Dostupné v Labu", state: "open" },
];

const outputs = [
  ["Finanční check-up", "Dostupné", true],
  ["Mapa cílů a horizontů", "Dostupné", true],
  ["Investiční plán (IPS)", "Dostupné v Labu", true],
  ["Srovnání nákladů", "Připravujeme", false],
  ["Checklist výběru ETF", "Dostupné", true],
  ["Checklist brokera", "Připravujeme", false],
] as const;

const trust: readonly (readonly [LucideIcon, string, string])[] = [
  [CalendarCheck, "Fakta se zdrojem a datem ověření", "Sazby, limity a lhůty vedeme jako datované údaje se zdrojem, datem ověření a termínem další kontroly."],
  [ShieldCheck, "Daně a regulace s odbornou revizí", "Daňové a regulatorní lekce vyjdou až po schválení daňovým poradcem. Do té doby je označujeme jako připravované."],
  [Scale, "Vzdělávání, ne investiční doporučení", "Nedoporučujeme konkrétní brokery, fondy ani akcie a neřadíme je za provizi. Učíš se porovnávat kritéria a zdroje."],
  [BookOpen, "Odměny za učení, ne za obchody", "XP a cvičný kapitál získáš za lekce. Za obchody, riziko ani výnos nic nedostaneš."],
];

export function PenLanding() {
  return <MotionRoot className={styles.landing}>
    <div className={styles.scrollProgress} data-scroll-progress aria-hidden="true"/>
    <a className={styles.skip} href="#main">Přejít k obsahu</a>
    <header className={styles.siteHeader} data-nav>
      <span className={styles.navBg} data-nav-bg aria-hidden="true"/>
      <div className={styles.container}>
        <Link href="/" className={styles.wordmark} aria-label="Investník · úvodní stránka"><Wordmark /></Link>
        <nav className={styles.topNav} aria-label="Hlavní navigace">
          <a href="#jak-to-funguje">Jak to funguje</a>
          <a href="#portfolio-lab">Portfolio Lab</a>
          <Link href="/sign-in" prefetch={false} {...magneticProps}>Přihlásit se</Link>
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
            <p data-hero-sub>Připrav se na první investici a vydrž u svého plánu. Projdeš rozpočet a rezervu, výběr brokera, náklady a daně a sestavíš vlastní investiční plán, který si vyzkoušíš v modelové krizi. Bez skutečných peněz.</p>
            <div className={styles.heroActions} data-hero-actions>
              <Link className={`${styles.primaryButton} ${styles.shimmerHost}`} href="/onboarding" prefetch={false} data-lift data-press {...magneticProps}>Začít vstupním testem <ArrowRight aria-hidden="true" size={19}/><span className={styles.shimmer} data-shimmer aria-hidden="true"/></Link>
              <a className={styles.textAction} href="#jak-to-funguje">Jak to funguje</a>
            </div>
            <p className={styles.heroNote}>Pár otázek o tvých cílech a znalostech doporučí, kde začít. Lekce o rezervě, výběru brokera a daních připravujeme.</p>
          </div>
          <div className={styles.heroLessonWrap} data-hero-card role="group" aria-label="Ukázka lekce; nezapisuje pokrok ani neuděluje XP">
            <Image className={styles.heroArt} data-hero-art src="/marketing/v14-curiosity-cropped.webp" alt="" aria-hidden="true" width={512} height={519} sizes="(max-width: 500px) 98px, (max-width: 1100px) 194px, 256px" preload />
            <div className={styles.lessonBrowserHeader}><Wordmark className={styles.smallWordmark} /><span>Než začneš investovat / Dluh, nebo investice?</span><span>Lekce 0.1.2 · ≈ 12 min</span><span>Ukázka lekce</span></div>
            <LessonPreview hero />
          </div>
          <p className={styles.microDisclaimer}>Ukázka z lekce · modelový příklad, ne osobní doporučení</p>
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
            <div className={styles.courseCard} data-lift data-lift-card data-course-card>
              <Image className={styles.discoveryGripTop} src="/marketing/v14-discovery-top-grip.webp" alt="" aria-hidden="true" width={136} height={86} />
              <Image className={styles.discoveryGripSide} src="/marketing/v14-discovery-side-grip.webp" alt="" aria-hidden="true" width={97} height={115} />
              <span className={styles.cardOverline}>Co je dostupné dnes a co připravujeme</span>
              <div className={styles.courseHeader}><h3>Cesta k milníku „Připraven/a začít“</h3><span>Úrovně 0–2</span></div>
              <ul>
                {path.map(({ title, detail, status, state }) => <li className={styles.courseRow} key={title} data-course-row={state} data-planned={state === "planned" ? "" : undefined}>
                  <span className={styles.rowIcon} data-row-icon>{state === "next" ? <Play size={18} aria-hidden="true"/> : state === "planned" ? <CircleDashed size={18} aria-hidden="true"/> : <CircleDot size={18} aria-hidden="true"/>}</span>
                  <span className={styles.rowText}>{title}<span>{detail}</span></span>
                  <small data-row-status>{status}</small>
                </li>)}
              </ul>
              <p>Milník „Připraven/a začít“ půjde splnit, až vyjdou praktické lekce úrovně 2 a závěrečný úkol.</p>
            </div>
          </div>
          <div className={styles.threeSteps} data-steps><span className={styles.stepsLine} data-steps-line aria-hidden="true"/>{[["01","Rozhodni se","Modelová situace s dluhem, rezervou nebo poplatkem. Nejdřív zvolíš ty."],["02","Pochop důsledek","Vysvětlení ukáže proč, ne jen co je správně."],["03","Odnes si výstup","Check-up, mapu cílů nebo plán, ke kterému se vrátíš."]].map(([num,title,description])=><div key={num} data-step><span data-step-num>{num}</span><h3>{title}</h3><p>{description}</p></div>)}</div>
          </div>
        </div>
      </section>
      <section className={styles.lessonSection} aria-labelledby="lesson-title">
        <div className={`${styles.container} ${styles.lessonSectionLayout}`}>
          <div className={styles.lessonSectionCopy}><p className={styles.eyebrow} data-reveal="fade">UČENÍ TÍM, ŽE TO ZKUSÍŠ</p><SplitHeading id="lesson-title">Každý modul končí<br/>výstupem.</SplitHeading><p data-reveal data-reveal-delay="0.2">Otázky ověří, že tomu rozumíš. Výstup ti zůstane: uložíš si ho k účtu a vrátíš se k němu, až se budeš rozhodovat doopravdy.</p>
            <ul className={styles.outputList} aria-label="Výstupy modulů" data-reveal data-reveal-delay="0.3">
              {outputs.map(([title, status, available]) => <li key={title} data-available={available ? "" : undefined}><span>{title}</span><small>{status}</small></li>)}
            </ul>
          </div>
          <div className={styles.lessonSectionDemo} data-reveal><LessonPreview compact/></div>
        </div>
      </section>
      <section className={styles.labSection} id="portfolio-lab" aria-labelledby="lab-title">
        <div className={styles.container}>
          <div className={styles.labIntro}><div><p className={styles.eyebrow} data-reveal="fade">PORTFOLIO LAB A KRIZOVÝ NÁCVIK</p><SplitHeading id="lab-title" mode="lines">Proces,<br/>ne výnos.</SplitHeading></div><div className={styles.labExplanation} data-reveal data-reveal-delay="0.25"><p>Svůj plán si vyzkoušíš s cvičným kapitálem, který dostaneš za lekce. Lab ukáže náklady, rozložení a soulad s tvým investičním plánem. A někdy je správným výsledkem prostě vyčkat.</p><small>Hodnotí se postup, ne zisk. Nic se doopravdy nekupuje.</small></div></div>
          <div className={styles.labDemo} data-lab-demo role="group" aria-label="Ukázka Portfolio Labu; nic nekupuje ani neukládá" data-reveal><PortfolioLabDemo/><CrisisDrill/></div>
          <div className={styles.labFooter}><p>Výukový model s fiktivními cenami a tarify. Nejde o investiční doporučení ani odhad budoucího výnosu.</p><Link href="/onboarding" prefetch={false} className={styles.primaryButton} data-lift data-press {...magneticProps}>Začít učením <ArrowRight aria-hidden="true" size={18}/></Link></div>
        </div>
      </section>
      <section className={styles.progressSection} aria-labelledby="progress-title">
        <div className={styles.container}>
          <p className={styles.eyebrow} data-reveal="fade">NA ČEM STAVÍME</p><SplitHeading id="progress-title">Fakta se zdrojem. Žádné tipy.</SplitHeading>
          <div className={styles.progressLayout}>
            <div className={styles.progressImage} aria-hidden="true" data-progress-art><Image src="/marketing/v14-steady-understanding.webp" alt="" width={1174} height={654} sizes="(max-width: 780px) calc(100vw - 48px), (max-width: 1100px) 400px, 570px" /></div>
            <div className={styles.progressCard} data-progress-card>
              <span className={styles.cardOverline}>Jak pracujeme s obsahem</span>
              {trust.map(([Icon, title, detail]) => <div className={styles.progressItem} key={title} data-progress-item><Icon size={20} aria-hidden="true"/><div><span>{title}</span><small>{detail}</small></div></div>)}
              <p className={styles.progressPromise}>Investník je vzdělávací produkt. Není broker a se skutečnými penězi nepracuje.</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.container}><Image className={styles.closingArt} data-closing-art src="/marketing/generated-19.webp" alt="" aria-hidden="true" width={1000} height={747} sizes="(max-width: 500px) 300px, (max-width: 780px) 500px, 360px" /><SplitHeading id="closing-title" mode="chars">Začni tam,<br/>kde právě jsi.</SplitHeading><p data-reveal data-reveal-delay="0.3">Pár otázek ukáže, kde začít.<br/> Úroveň 0 je doporučená, ne povinná.</p><div className={styles.closingActions} data-reveal data-reveal-delay="0.4"><Link href="/onboarding" prefetch={false} className={`${styles.primaryButton} ${styles.shimmerHost}`} data-lift data-press {...magneticProps}>Začít vstupním testem <ArrowRight aria-hidden="true" size={18}/><span className={styles.shimmer} data-shimmer aria-hidden="true"/></Link><DemoButton compact className={styles.demoButtonWrap} buttonClassName={styles.secondaryButton}/></div></div>
      </section>
    </main>
    <footer className={styles.footer} data-footer><div className={styles.container}><Link href="/" className={styles.wordmark} aria-label="Investník · úvodní stránka"><Wordmark /></Link><p>Vzdělávání, ne investiční doporučení.</p><nav aria-label="Patička"><Link href="/pruvodce" prefetch={false}>Průvodce</Link><a href="#jak-to-funguje">Jak to funguje</a><Link href="/sign-in" prefetch={false}>Přihlásit se</Link>{legalLinks.map((link) => <Link key={link.href} href={link.href} prefetch={false}>{link.label}</Link>)}</nav></div></footer>
  </MotionRoot>;
}
