import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLearningProfile } from "@/features/onboarding/repository";
import { DIAGNOSTIC_V2, diagnosticV2RetakeAt, nextDiagnosticV2Question } from "@/features/personalization/diagnostic-v2";
import { EntryTestFlow } from "@/components/personalization/entry-test-flow";
import { OnboardingGuide, OnboardingHeader } from "@/components/personalization/onboarding-frame";
import styles from "@/components/personalization/personalization-flow.module.css";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Vstupní test", robots: { index: false, follow: false } };
export default async function EntryTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const profile = await getLearningProfile(user.id);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");
  const retakeAt = diagnosticV2RetakeAt(profile.diagnosticResult);
  if (retakeAt) {
    return <main className={styles.flow}><OnboardingHeader progress={1} back="/onboarding/plan" /><div className={styles.column}>
      <OnboardingGuide pose="04-calm-book">Test máš za sebou. Plán podle něj už platí.</OnboardingGuide>
      <section className={styles.questionCard}>
        <h1 className={styles.questionTitle}>Vstupní test můžeš zopakovat od {retakeAt.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Prague" })}</h1>
        <p className={styles.helper}>Mezitím se uč podle plánu. Přeskočené lekce můžeš kdykoli projít.</p>
        <div className={styles.actionRow}><Link className={cn(buttonVariants(), styles.primary)} href="/onboarding/plan">Zobrazit můj plán</Link></div>
      </section>
    </div></main>;
  }
  // Only the public first question crosses to the client; each next one comes from a server replay.
  return <EntryTestFlow draftKey={`investi-entry-test-v2:${user.id}`} first={nextDiagnosticV2Question([]).question!} version={DIAGNOSTIC_V2} />;
}
