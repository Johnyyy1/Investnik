/** The directions from docs/ui-overhaul/LEARN-VARIANTS.md, on one axis: page structure. */
export const prototypeVariants = [
  { id: "a", label: "A · Pracovní stůl", position: "Jeden sloupec, jeden úkol", rightWhen: "Učící se se vrací hlavně dokončit rozdělanou lekci", costs: "Mapa kurikula a Lab jsou o úroveň hlouběji; nejméně přehledu najednou" },
  { id: "b", label: "B · Pracoviště", position: "Strom kurikula vlevo, práce vpravo", rightWhen: "Učící se si vybírá lekce sám a skáče mezi moduly", costs: "Nejvíc hustoty; na desktopu mění navigaci aplikace (F2), na mobilu je strom za tlačítkem" },
  { id: "c", label: "C · Cesta k plánu", position: "Milník A jako kostra stránky", rightWhen: "Hlavní cíl je dotáhnout plán, nákup a krizový nácvik (metrika S1)", costs: "Kurikulum mimo milník je až dole; překrývá se s rolí Pokroku (D4)" },
  { id: "d", label: "D · Studijní pracoviště", position: "Kompaktní skládací kurikulum vlevo, jeden úkol uprostřed", rightWhen: "Učící se hlavně pokračuje, ale chce mít kurikulum po ruce", costs: "Lišta v obsahu stránky (ne v navigaci aplikace); na mobilu je kurikulum za tlačítkem" },
] as const;
