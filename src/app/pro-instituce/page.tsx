import type { Metadata } from "next";
import { DemoButton } from "@/components/auth/demo-button";
import { LegalPage, legalOperator, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Pro instituce: pilot pro brokery a banky",
  description: "Pilotní nabídka Investníku pro brokery a banky: vaši začínající investoři projdou diagnostikou, praktickými moduly a cvičením v Labu a vy uvidíte změřenou aktivaci.",
  alternates: { canonical: "/pro-instituce" },
};

// Partner mode (#358) and the results dashboard (#359) are not built yet: keep their statuses „připravujeme“ until they ship.
const sections: readonly LegalSection[] = [
  { id: "problem", title: "Proč noví investoři nezačnou", body: <>
    <p>Začínající investor obvykle neví, jak začít: jestli má na investování připravené finance, jak vybrat brokera a&nbsp;fond, co ho bude stát a&nbsp;co udělá, až trh spadne. Bezplatné články a&nbsp;webináře mu dají informace, ale k&nbsp;prvnímu rozhodnutí ho často nedovedou.</p>
    <p>Investník učí tím, že si člověk rozhodnutí vyzkouší: v&nbsp;modelové situaci nejdřív zvolí sám, pak uvidí důsledek a&nbsp;odnese si vlastní výstup, například finanční check-up nebo investiční plán (IPS).</p>
  </> },
  { id: "pilot", title: "Jak pilot probíhá", body: <ol>
    <li><strong>Skupina vašich začínajících investorů</strong> dostane pozvánku do Investníku.</li>
    <li><strong>Diagnostika</strong>: pár otázek o&nbsp;cílech a&nbsp;znalostech doporučí, kde začít. Co už umí, mohou přeskočit.</li>
    <li><strong>Moduly</strong>: finanční připravenost, cíle a&nbsp;horizont, jak investice fungují, náklady fondu a&nbsp;brokera, checklist výběru ETF a&nbsp;vlastní investiční plán.</li>
    <li><strong>Mise v&nbsp;Labu</strong>: první nákup nanečisto podle vlastního plánu a&nbsp;krizový nácvik s&nbsp;cvičným kapitálem, bez skutečných peněz.</li>
    <li><strong>Deep-link zpět k&nbsp;vám</strong>: po dosažení milníku vede výzva, kterou určíte vy, do vašeho produktu.</li>
    <li><strong>Změřená aktivace</strong>: na konci pilotu vidíte výsledky učení i&nbsp;obchodní výsledek skupiny.</li>
  </ol> },
  { id: "partner", title: "Co partner dostane", body: <>
    <dl>
      <div><dt>Dashboard výsledků</dt><dd>Odděluje výsledky učení (dokončený milník „Připraven/a začít“, investiční plán, dodržení plánu v&nbsp;krizovém nácviku) od vašich obchodních výsledků (prokliky a&nbsp;vámi dodaná data o&nbsp;otevření účtu, prvním vkladu a&nbsp;první či pravidelné investici). Data jsou souhrnná a&nbsp;anonymizovaná, s&nbsp;exportem do CSV. Připravujeme pro první pilot.</dd></div>
      <div><dt>Co-branding</dt><dd>Vaše logo a&nbsp;barva vedle značky Investník. Připravujeme pro první pilot.</dd></div>
      <div><dt>Nastavitelný obsah</dt><dd>Vyberete, které moduly skupina projde, typicky cestu k&nbsp;milníku „Připraven/a začít“. Připravujeme pro první pilot.</dd></div>
    </dl>
    <p>Moduly, diagnostiku a&nbsp;mise v&nbsp;Labu si můžete vyzkoušet už dnes ve veřejné verzi. Plný white-label, jednotné přihlášení (SSO) nebo vložení do mobilní aplikace řešíme až podle potřeb konkrétního partnera.</p>
  </> },
  { id: "duveryhodnost", title: "Na čem stojí důvěryhodnost", body: <ul>
    <li><strong>Fakta se zdrojem</strong>: sazby, limity a&nbsp;lhůty vedeme v&nbsp;registru jako datované údaje se zdrojem, datem ověření a&nbsp;termínem další kontroly.</li>
    <li><strong>Odborná revize</strong>: daňové a&nbsp;regulatorní lekce vyjdou až po schválení daňovým poradcem. Do té doby je označujeme jako připravované.</li>
    <li><strong>Vzdělávání, ne doporučení</strong>: Investník nedoporučuje konkrétní nástroje ani nepíše pokyny k&nbsp;nákupu či prodeji. Doporučení, posouzení vhodnosti a&nbsp;produkt zůstávají na vaší straně. Výzva zpět do vašeho produktu tuto hranici nemění.</li>
    <li><strong>Proces, ne obchodování</strong>: Lab hodnotí náklady, rozložení a&nbsp;soulad s&nbsp;vlastním plánem. Za obchody, riziko ani výnos se nic nezíská a&nbsp;nejsou žádné žebříčky podle výnosu.</li>
    <li><strong>Osobní údaje</strong>: partnerovi předáváme jen souhrnná anonymizovaná data. Údaje o&nbsp;konkrétním člověku jen s&nbsp;jeho souhlasem.</li>
  </ul> },
  { id: "zacit", title: "Jak se domluvit", body: <>
    <p>Začneme krátkým rozhovorem: jakou skupinu klientů chcete oslovit a&nbsp;podle jaké metriky aktivace pilot posoudíte. Podle toho domluvíme cestu, délku a&nbsp;cenu pilotu.</p>
    <p>Napište nám na {legalOperator.partnerEmail}.</p>
    <DemoButton compact className="mt-6" buttonClassName="" />
  </> },
];

export default function PartnersPage() {
  return <LegalPage title="Investník pro brokery a banky" eyebrow="Pro instituce" updatedAt="5. listopadu 2026" sections={sections}
    intro={<p>Pilot pro skupinu vašich začínajících investorů: projdou diagnostikou, praktickými moduly a&nbsp;cvičením v&nbsp;Labu a&nbsp;vrátí se k&nbsp;vám připravení. Vy uvidíte, kolik z&nbsp;nich si plán sestavilo, dodrželo ho v&nbsp;modelové krizi a&nbsp;otevřelo účet.</p>} />;
}
