import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { missions, type MissionDefinition } from "@/features/missions/registry";
import { VerifiedMission } from "@/components/lesson/step-kinds/verified-mission";
import { availableLessons } from "@/features/learning/catalog";
import { ButtonLink } from "@/components/ui/button";

const intro: Record<MissionDefinition["check"], string> = {
  "ips-etf-purchase-v1": "Tato mise výslovně pracuje s tvým osobním cvičným portfoliem. Nejdřív ulož IPS; obchod provedeš běžným postupem v Portfolio Labu.",
  "ips-etf-purchase-v2": "Tato mise výslovně pracuje s tvým osobním cvičným portfoliem. Nejdřív ulož IPS; obchod provedeš běžným postupem v Portfolio Labu.",
  "diversification-rules-v1": "Oddělené cvičení s vymyšlenými instrumenty. Tvoje osobní portfolio, hotovost i cvičný kapitál se nemění. Hodnotí se pravidla rozložení, nikoli výnos ani správnost předpovědi.",
  "behaviour-crises-v1": "Dokonči historické krize 2008, 2020 a 2022 a po rozboru ulož potvrzení nebo úpravu pravidla pro propad a příspěvku v IPS. Server čte oddělený trénink a uložený plán; výnos ani obchody se nehodnotí.",
  "training-contributions-v1": "Mise čte tvůj krizový nácvik s tréninkovými penězi. Tvoje osobní portfolio, hotovost i cvičný kapitál se nemění. Hodnotí se pravidelnost příspěvků a nákupů, nikoli výnos.",
};

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const mission = missions.find((item) => item.id === missionId);
  if (!mission) notFound();
  if (!await getCurrentUser()) redirect("/sign-in");
  const lesson = availableLessons.find((item) => item.id === mission.lessonId);
  return <main className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6 px-5 py-8 md:px-8">
    <h1 className="text-3xl font-semibold">{mission.title}</h1>
    <p className="text-secondary">{intro[mission.check]}</p>
    <VerifiedMission missionId={mission.id} lessonId={mission.lessonId} exercise />
    {mission.context === "personal" ? <ButtonLink href="/lab/portfolio">Otevřít Portfolio Lab</ButtonLink> : (mission.check === "training-contributions-v1" || mission.check === "behaviour-crises-v1") ? <ButtonLink href="/lab/training">Otevřít krizový nácvik</ButtonLink> : null}
    <ButtonLink href={lesson ? `/learn/${lesson.moduleSlug}/${lesson.slug}` : "/learn"} variant="ghost">{lesson ? "Zpět do lekce" : "Zpět k učení"}</ButtonLink>
  </main>;
}
