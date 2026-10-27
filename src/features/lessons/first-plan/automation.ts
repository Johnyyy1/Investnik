import type { AuthoredLesson } from "../types";
import { firstPlanLessons } from "./manifest";
const lesson = firstPlanLessons.find((entry) => entry.id === "first-plan-automation")!;

export const automationLesson: AuthoredLesson = {
  id: lesson.id, moduleSlug: "first-plan", slug: lesson.slug, title: lesson.title,
  eyebrow: "První plán a první nákup", position: 2, estimatedMinutes: lesson.estimatedMinutes,
  sections: [{ id: "opening", label: "Čekání" }, { id: "commitment", label: "Závazek předem" }, { id: "setup", label: "Nastavení" }, { id: "mission", label: "Lab" }, { id: "timing", label: "Časování" }, { id: "summary", label: "Shrnutí" }],
  blocks: [
    { id: "opening", type: "paragraph", content: "Modelový příklad · Michal má sepsaný investiční plán: 2 500 Kč měsíčně do globálního akciového ETF. První nákup ale odkládá: „Počkám, až trh spadne, a koupím levněji.“ Peníze zatím nechává na běžném účtu a každý měsíc se znovu rozhoduje." },
    { id: "prediction", type: "multipleChoiceQuestion", prompt: "Co Michal s největší pravděpodobností uvidí po roce?", options: [
      { id: "bought-low", label: "Trh spadne, Michal nakoupí na dně a bude na tom lépe než ti, kdo nakupovali pravidelně.", misconception: "dno poznám včas", explanation: "Dno je vidět až zpětně. Když trh spadne o 10 %, Michal neví, jestli nespadne o dalších 10 %, a zase čeká." },
      { id: "still-waiting", label: "Peníze bude mít nejspíš pořád na účtu. Když trh roste, čeká na pokles; když klesá, čeká na další pokles." },
      { id: "no-difference", label: "Nic se nestane. Rok čekání nehraje roli, investovat může kdykoli později.", misconception: "čekání je zdarma", explanation: "Každý měsíc, kdy peníze leží na účtu, nejsou v plánu. A čekání se snadno prodlužuje: pokaždé se najde důvod počkat ještě chvíli." },
    ], correctOptionId: "still-waiting", correctExplanation: "Rozhodnutí „počkám na lepší chvíli“ se musí každý měsíc opakovat a pokaždé se dá znovu odložit. Bez pevného pravidla se z jednoho odkladu snadno stane rok.", incorrectExplanation: "Zamysli se, kolikrát za rok se Michal musí znovu rozhodnout a co ho pokaždé vede k tomu, aby ještě počkal." },

    { id: "commitment", type: "explanation", title: "Rozhodni jednou, ne každý měsíc", content: "Automatizace znamená, že o pravidelné investici rozhodneš jednou, v klidu, a pak se děje sama. Nemusíš každý měsíc znovu přemýšlet, jestli je dobrá chvíle. Odpadne tak odkládání, nálada podle titulků i zapomínání. Výchozí nastavení (default), které nic nevyžaduje, funguje spolehlivěji než předsevzetí, které vyžaduje každý měsíc nové rozhodnutí." },
    { id: "smart", type: "conceptCallout", title: "Výzkum · Save More Tomorrow", content: "Ekonomové Shlomo Benartzi a Richard Thaler nabídli zaměstnancům americké firmy program, ve kterém se předem zavázali posílat část budoucích zvýšení mzdy do spoření na důchod. Průměrná míra úspor účastníků vzrostla z {{smart.mira_pred}} na {{smart.mira_po}} mzdy za 40 měsíců. Jde o jednu firmu a spoření ze mzdy v USA, ne o výnos investic. Studie ukazuje, jak silný je závazek nastavený předem." },

    { id: "setup", type: "explanation", title: "Trvalý příkaz a spořicí plán", content: "V praxi stačí dvě věci. Trvalý příkaz v bance pošle každý měsíc stejnou částku na účet u brokera, ideálně den po výplatě. Spořicí plán u brokera (anglicky savings plan) pak v určený den za připsané peníze nakoupí nástroj z tvého plánu. Ne každý broker spořicí plán nabízí; jinak nakupuješ ručně podle stejného pravidla." },
    { id: "worked", type: "workedExample", title: "Modelový příklad · jak si to nastavil Michal", introduction: "Michal je smyšlená postava. Dny a částka jsou jeho volba, ne doporučení.", steps: [
      { label: "Výplata", value: "15. den v měsíci" },
      { label: "Trvalý příkaz", value: "16. den: 2 500 Kč z běžného účtu na účet u brokera" },
      { label: "Spořicí plán", value: "20. den: nákup ETF z jeho IPS za připsanou částku" },
      { label: "Kontrola · minimální poplatek", value: "Při 2 500 Kč měsíčně porovná minimální poplatek za nákup s částkou; poplatek 40 Kč by byl 1,6 % z každého nákupu" },
      { label: "Kontrola · měnová konverze", value: "Obchoduje-li se ETF v eurech, zjistí, kolik broker strhne za převod korun" },
      { label: "Kontrola · frakční nákupy", value: "Umí broker koupit i část podílu? Jinak 2 500 Kč nemusí stačit na celý kus a zbytek zůstane ležet", emphasis: true },
    ], conclusion: "Michal rozhodl jednou. Každý měsíc se pak všechno stane samo a on jen jednou ročně při přezkumu plánu zkontroluje, jestli poplatky a částka pořád sedí." },

    { id: "faded", type: "fadedExample", title: "Modelový příklad · den nákupu ve spořicím plánu", introduction: "Nákup musí přijít až po tom, co peníze dorazí k brokerovi.", steps: [
      { label: "Výplata", value: "15. den v měsíci" },
      { label: "Trvalý příkaz odejde", value: "16. den" },
      { label: "Peníze jsou u brokera", value: "nejpozději 18. den (převod trvá 1–2 pracovní dny)" },
    ], blank: { label: "Den nákupu ve spořicím plánu", input: "choice", options: [
      { id: "before", label: "14. den", explanation: "14. den ještě nepřišla výplata a peníze u brokera nejsou. Nákup by se neprovedl nebo by čerpal z peněz, které tam mají být na něco jiného." },
      { id: "after", label: "20. den" },
      { id: "dip", label: "Až trh klesne", explanation: "To už není automatizace, ale časování trhu. Rozhodnutí by se zase opakovalo každý měsíc." },
    ], correctOptionId: "after" }, misconception: "nákup před příchodem peněz", correctExplanation: "20. den jsou peníze na účtu u brokera i s rezervou na zpožděný převod. Pořadí výplata → trvalý příkaz → nákup běží každý měsíc samo.", incorrectExplanation: "Projdi řádky shora: kdy přijde výplata, kdy odejde příkaz a kdy jsou peníze u brokera." },

    { id: "total", type: "numericQuestion", prompt: "Modelový příklad · Michal posílá 2 500 Kč měsíčně. Kolik celkem vloží za 3 roky? Počítej jen vklady, bez výnosu a poplatků.", answer: 90000, tolerance: 0, unit: "Kč", correctExplanation: "3 roky = 36 měsíců. 36 × 2 500 Kč = 90 000 Kč. To je jen to, co Michal vloží; kolik budou investice stát za 3 roky, závisí na trhu a nikdo to předem neví.", incorrectExplanation: "Převeď roky na měsíce (3 × 12) a vynásob měsíční částkou. Výnos nepřičítej." },

    { id: "mission-intro", type: "paragraph", content: "Teď si pravidelnost vyzkoušej v simulovaném čase. Krizový nácvik v Labu převezme měsíční příspěvek z tvého uloženého IPS a s každým měsícem ho připíše na tréninkový účet. Nákup v daném měsíci uděláš sám, jako by ho za tebe udělal spořicí plán. Pracuješ s tréninkovými penězi; tvoje cvičné portfolio ani cvičný kapitál se nemění." },
    { id: "mission", type: "labMission", missionId: "training-contributions-v1", mission: {
      title: "Pravidelná investice v simulovaném čase", goal: "Nech v krizovém nácviku uběhnout 12 měsíců a v každém z nich investuj připsaný příspěvek z plánu.", minutes: 8, target: "/lab/training",
      steps: ["Otevři Krizový nácvik a vyber scénář. Modelový scénář je vymyšlený, historické scénáře jsou označené zdrojem.", "V každém měsíci nakup za připsaný příspěvek a pak klikni na Pokračovat na další měsíc.", "Po 12 měsících se vrať sem a ověř misi. Výnos ani pád trhu se nehodnotí."],
      afterReturn: "Server spočítá z uloženého průběhu nácviku, ve kolika měsících přišel příspěvek a proběhl nákup. Lekce na tebe počká na tomto kroku.",
    }, analysis: { title: "modelový investor", summary: "Modelový investor posílá 2 500 Kč měsíčně a nakupuje každý měsíc, i když index během prvního půlroku klesne o 30 %.", rows: [
      { label: "Měsíce 1–6 · index ze 100 na 70", status: "6 × příspěvek a nákup", progress: 0.5, start: "15 000 Kč vloženo", end: "plán dodržen" },
      { label: "Měsíce 7–12 · index ze 70 na 87", status: "6 × příspěvek a nákup", progress: 1, start: "30 000 Kč vloženo", end: "plán dodržen", highlight: true },
    ], generalRule: "Za stejnou částku koupíš při nižší ceně víc podílů. To neznamená jistý zisk ani vyšší výnos než jednorázová investice; znamená to, že plán běží dál bez nového rozhodování.", selfExplanationPrompt: "Který měsíc by tě nejvíc lákal příspěvek vynechat a proč?" } },

    { id: "timing", type: "explanation", title: "Pravidelnost není časování trhu", content: "Pravidelná investice nehledá nejlepší den. Nakupuje stejně v dobrých i špatných měsících, protože nikdo spolehlivě nepozná, kdy je cena nízko. Jejím cílem je, aby peníze z plánu opravdu skončily investované a aby rozhodnutí nezávisela na náladě. Jestli je lepší investovat volné peníze najednou, nebo postupně, je jiná otázka. Pravidelná investice ze mzdy ji neřeší: peníze přicházejí po měsících." },
    { id: "misconceptions", type: "conceptCallout", title: "Časté omyly", content: "„Pravidelnou investicí se vyhnu ztrátám.“ Ne. Když trh spadne, klesne i hodnota toho, co máš nakoupené; pravidelnost chrání plán, ne cenu. „Počkám na lepší chvíli.“ Lepší chvíle je vidět až zpětně, a čekání se snadno protáhne na měsíce. „Automat znamená, že plán nemusím nikdy kontrolovat.“ Jednou ročně zkontroluj částku, poplatky a soulad s IPS." },

    { id: "dip", type: "paragraph", content: "Modelový příklad · Michalův plán říká: „2 500 Kč měsíčně; při propadu nic neprodávám a pokračuji v příspěvcích.“ Trh za poslední měsíc klesl o 8 % a titulky mluví o nejisté době." },
    { id: "dip-decision", type: "multipleChoiceQuestion", prompt: "Co Michalovi říká jeho plán?", options: [
      { id: "continue", label: "Nechat trvalý příkaz i spořicí plán běžet. Příspěvek tento měsíc proběhne jako obvykle." },
      { id: "pause", label: "Pozastavit spořicí plán, dokud se trh neuklidní.", misconception: "počkám na lepší chvíli", explanation: "Plán nic takového neříká. Pozastavení je přesně to rozhodování podle titulků, kterému měla automatizace zabránit, a nikdo neví, kdy se trh „uklidní“." },
      { id: "sell", label: "Prodat, co má, a koupit zpátky, až trh začne růst.", misconception: "časování trhu", explanation: "Plán prodej při propadu výslovně vylučuje. Navíc by Michal musel dvakrát správně odhadnout chvíli: kdy prodat a kdy koupit zpět." },
    ], correctOptionId: "continue", correctExplanation: "Pravidlo bylo napsané v klidu právě pro takový měsíc. Michal nic nerozhoduje, příspěvek proběhne a pravidlo propadu z IPS platí dál.", incorrectExplanation: "Přečti si Michalovo pravidlo ještě jednou. Říká něco o pozastavení nebo prodeji?" },

    { id: "recall-why", type: "multipleChoiceQuestion", prompt: "Petra si dala předsevzetí „každý měsíc ručně investuju 3 000 Kč“, Jan si nastavil trvalý příkaz a spořicí plán na stejnou částku. Proč má Jan větší šanci plán dodržet?", options: [
      { id: "once", label: "Jan rozhodl jednou předem. Petra se musí každý měsíc znovu rozhodnout a pokaždé může odložit." },
      { id: "best-day", label: "Spořicí plán nakupuje v nejlepší den měsíce.", misconception: "automat časuje trh", explanation: "Spořicí plán nakupuje v předem daný den bez ohledu na cenu. Jeho výhoda není v načasování, ale v tom, že se nákup nemusí znovu rozhodovat." },
      { id: "higher-return", label: "Automatická investice má vyšší výnos než ruční.", misconception: "automat = vyšší výnos", explanation: "Výnos závisí na trhu a nákladech, ne na tom, kdo klikne na tlačítko. Automat zvyšuje šanci, že se investice opravdu stane." },
    ], correctOptionId: "once", correctExplanation: "Automatizace mění výchozí stav: investice proběhne, pokud ji Jan vědomě nezastaví. Petra musí každý měsíc vědomě jednat a každé odložení je snadné.", incorrectExplanation: "Zamysli se, kolikrát za rok musí každý z nich udělat nové rozhodnutí." },
    { id: "recall-losses", type: "multipleChoiceQuestion", prompt: "Kamarád říká: „Investuju každý měsíc stejnou částku, takže nemůžu prodělat.“ Co platí?", options: [
      { id: "average-out", label: "Má pravdu. Pravidelnými nákupy se poklesy vždycky vyrovnají.", misconception: "pravidelnost zaručí zisk", explanation: "Pravidelné nákupy neruší pokles. Když trh spadne a dlouho se nevrátí, je i pravidelně budované portfolio ve ztrátě." },
      { id: "protects-plan", label: "Hodnota investic může klesnout i tak. Pravidelnost chrání plán před odkládáním a rozhodováním podle nálady, ne před ztrátou." },
      { id: "only-rising", label: "Pravidelně investovat má smysl, jen když trh roste.", misconception: "pravidelnost jen v dobrých časech", explanation: "Pravidlo má běžet v dobrých i špatných měsících. Kdo ho vypíná při poklesu, vrací se k časování trhu." },
    ], correctOptionId: "protects-plan", correctExplanation: "Pravidelná investice je ochrana proti odkládání, ne proti poklesům trhu. Riziko ztráty řeší horizont a alokace v IPS.", incorrectExplanation: "Odliš, co pravidelnost ovlivňuje (kdy a jestli investuješ) a co ne (kam se pohne cena)." },

    { id: "reflection", type: "writtenReflection", prompt: "Ve 2–4 větách napiš, jak si nastavíš pravidelnou investici podle svého IPS: částku, den, nástroj, co zkontroluješ u brokera a co uděláš s příspěvkem při propadu. Pak text porovnej s kritérii.", rubric: [
      { id: "amount-day", text: "Částka a den: odpovídají příspěvku v IPS a přicházejí až po výplatě." },
      { id: "instrument", text: "Nástroj: nakupuju to, co mám v cílové alokaci IPS, ne to, co zrovna roste." },
      { id: "costs", text: "Kontrola: znám minimální poplatek, cenu měnové konverze a jestli broker umí frakční nákupy." },
      { id: "fall", text: "Propad: příspěvek při poklesu trhu běží dál a vím, co by mě mohlo lákat ho zastavit." },
    ], sampleAnswer: "Den po výplatě, 11., mi odejde trvalý příkaz na 3 000 Kč k brokerovi a 15. spořicí plán koupí globální akciové ETF z mého IPS. Poplatek za nákup je u mě 0 Kč a broker umí frakční nákupy; konverzi z korun platím 0,25 %. Při propadu příspěvek nevypínám; nejvíc by mě lákalo počkat, až se trh uklidní, a proto to mám napsané v plánu." },

    { id: "lab-bridge", type: "labBridge", title: "Příspěvek z plánu v Labu", content: "Krizový nácvik bere měsíční příspěvek z tvého uloženého IPS. Když v nástroji Můj investiční plán změníš částku, nový nácvik už pojede s ní; dřívější nácviky si ponechají tu, se kterou začaly. Hodnotí se, jestli se držíš plánu, ne jak trh dopadl." },
    { id: "summary", type: "lessonSummary", title: "Rozhodni jednou, pak to nech běžet", content: "Pravidelnou investici nastav jednou: trvalý příkaz den po výplatě a spořicí plán, který v určený den nakoupí nástroj z IPS. Předem zkontroluj minimální poplatek, měnovou konverzi a frakční nákupy. Pravidelnost tě nechrání před poklesem trhu, ale před odkládáním a rozhodováním podle titulků. Čekání na lepší chvíli je časování trhu." },
    { id: "sources", type: "paragraph", content: "Zdroje k dalšímu čtení · Benartzi a Thaler, Save More Tomorrow: https://econpapers.repec.org/paper/febnatura/00337.htm · Michal, Petra a Jan jsou smyšlení, stejně jako dny, částky a poplatky v příkladech. Vzdělávací obsah, ne investiční doporučení." },
  ],
};
