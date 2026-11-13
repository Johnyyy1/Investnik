import Link from "next/link";
import { notFound } from "next/navigation";
import { prototypeVariants } from "./_prototype/variants";

export const metadata = { title: "Learn · varianty · Development", robots: { index: false, follow: false } };

/** Comparison gallery for decision F1. The app forbids framing (frame-ancestors 'none'), so variants open as pages. */
export default function LearnVariantsGallery() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <main className="mx-auto grid w-full max-w-standard gap-8 px-4 py-10 sm:px-8 lg:py-16">
    <header className="grid gap-2">
      <p className="text-label uppercase text-primary">Prototyp · F1</p>
      <h1 className="text-section-title">Učení: struktury stránky</h1>
      <p className="max-w-[65ch] text-body text-secondary">Stejný ukázkový učící se (6 hotových lekcí, 1 rozdělaná), skutečné kurikulum a pravidla milníků, žádná databáze. Odpovídat a rozbalovat jde, nic se neukládá. Uvnitř varianty přepínají šipky ← → a klávesa H skryje lištu. Pro srovnání vedle sebe otevři odkazy v samostatných oknech.</p>
    </header>
    <ul className="divide-y divide-divider border-y border-divider">
      {prototypeVariants.map((variant) => <li key={variant.id} className="grid gap-3 py-5 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6">
        <h2 className="text-card-title"><Link href={`/dev/learn-variants/${variant.id}`} className="text-primary-hover">{variant.label}</Link></h2>
        <dl className="grid gap-2 text-small sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-4">
          <dt className="font-semibold">Struktura</dt><dd className="text-secondary">{variant.position}</dd>
          <dt className="font-semibold">Dává smysl, když</dt><dd className="text-secondary">{variant.rightWhen}</dd>
          <dt className="font-semibold">Cena</dt><dd className="text-secondary">{variant.costs}</dd>
        </dl>
      </li>)}
    </ul>
    <p className="text-microcopy text-muted">Produkční <code>/learn</code> se nemění, dokud nevybereš variantu. Zadání: <code>docs/ui-overhaul/LEARN-VARIANTS.md</code>.</p>
  </main>;
}
