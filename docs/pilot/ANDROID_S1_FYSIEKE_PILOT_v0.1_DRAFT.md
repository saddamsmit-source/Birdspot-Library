# Birdspot — Android S1 veldpilot (offline / echte telefoon)

**Versie:** v0.1 DRAFT · 13 november 2026 · **status:** VOORBEREID / FYSIEK NOT TESTED.

**Bron bij voorbereiding:** PR #168, SHA 12a985f34604e905c2199521736c5e1b1c5767f4; voorgaande Chromium offline-, ZIP- en updateproeven 4/4 jobs PASS. Hercontroleer de daadwerkelijke HEAD van de te testen checkout. Dit document bewijst geen apparaatproef, installatie, release of productie.

## 1. Doel, risico en afbakening

**Doel:** op een eigen fysiek Android-toestel de volledige Birdspot-kernroute lopen: openen → soort kiezen → fictieve waarneming met toestelbeeld opslaan → sluiten → offline heropenen en terugvinden → ZIP exporteren → op een schoon tweede toestel herstellen. Laat een tester de app zonder sturende aanwijzingen bedienen. Gebruik uitsluitend fictieve plaatsen en onschuldige testbeelden; nooit echte beschermde-vogellocaties.

**Waarom:** PR #168 heeft nieuwe offline opslag met decodeerbare PNG-bytes, herstel en serviceworker-upgrades aangetoond in Chromium/Playwright, niet op een telefoon. Android Back, camera-/bestandskiezer, PWA-installatie, geweigerde GPS, daglicht en tweede-toestelherstel blijven NOT TESTED. De huidige APP_VERSION is nog 1.27.6; een nieuwe release zonder unieke cacheversie is niet toegestaan.

**Scope:** geen nieuwe bird-media, backend, accounts, Vercel, GitHub Pages-deploy, productiepush of merge.

## 2. Privacy- en bronbehoud

- Gebruik een **afzonderlijke schone checkout van exact de beoogde review-SHA**; laat de Claude-branch, main en preview ongemoeid. Bij een bestaande lokale Git-repo kan een apart detached worktree worden gemaakt met: git worktree add --detach ../birdspot-android-pilot <EXACT_SHA>. Voer dit alleen uit wanneer de lokale repository en werkboom bekend/veilig zijn.
- De Android-test draait op http://localhost:8765/ — een **andere origin** dan de publieke Birdspot-app. Bewaar bestaande testdata op deze origin vóór wissen of hergebruik. Verwijder nooit echte data van het publieke Birdspot-domein.
- Alleen de eigenaar zet op zijn eigen telefoon ontwikkelaarsopties/USB-debugging aan. De assistent mag geen toestelcontrole of fysieke PASS claimen zonder feitelijke toestelhandelingen en bewijs.
- Ruwe testfoto's, EXIF/GPS, ZIP-archieven, screenshots met toestelgegevens en het JSON-rapport blijven **buiten de openbare GitHub-repository**. Zet enkel geanonimiseerde bevindingen/commit- en lokale bewijs-ID's in een PR.
- Offline betekent: USB losgekoppeld en Wi-Fi/mobiele data uitgeschakeld. Alleen het tijdelijk beëindigen van de HTTP-server terwijl USB verbonden blijft is geen voldoende hardware-offlineproef.

## 3. USB-localhost-instructie (zonder publieke deploy)

1. Controleer de exacte remote HEAD/base, CI en actieve schrijver. Gebruik een afzonderlijke, **niet-ondertussen bijgewerkte** checkout van de vastgepinde kandidaat-SHA.
2. Start in die lokale checkout terminal A:

       python -m http.server 8765 --bind 127.0.0.1

   Windows, indien van toepassing: py -3 -m http.server 8765 --bind 127.0.0.1.
3. Verbind de telefoon via USB met een vertrouwde computer en autoriseer USB-debugging op de telefoon. Controleer in terminal B:

       adb devices
       adb reverse tcp:8765 tcp:8765

   Het toestel moet als authorized/device zichtbaar zijn. Alternatief: Chrome DevTools, chrome://inspect, Port forwarding, devicepoort 8765 → computer localhost:8765.
4. Open **Chrome op Android** op http://localhost:8765/. Controleer installatie van de serviceworker en herlaad totdat de app echt cachegestuurd kan openen. Gebruik geen http://<laptop-IP>:8765; dat hoeft geen secure context voor een PWA te zijn.
5. Voltooi een eerste waarneming met een zelfgemaakte, niet-persoonlijke testfoto. Sluit daarna de app, **trek USB los**, activeer vliegtuigstand en heropen vanuit Chrome of (indien mogelijk) een geïnstalleerde PWA. Voer ook een tweede **nieuwe** waarneming in terwijl offline.
6. Voor ZIP-herstel mag je USB en de lokale server weer aansluiten. Gebruik op een **tweede schoon Android-toestel** een aparte browseropslag. Test twee keer dezelfde ZIP: de tweede import mag geen dubbel record maken. Is geen tweede toestel beschikbaar, markeer AND-08 BLOCKED, niet PASS.
7. Na afloop: verbind zo nodig USB opnieuw, gebruik adb reverse --remove tcp:8765, stop de lokale server en beperk USB-debugging. Bewaar de test-ZIP en het verslag op een privépad buiten de Git-repository; nooit echte privéwaarnemingen verwijderen.

Dit lokale portforwardingpatroon staat in Android-/Chrome-documentatie: https://developer.android.com/develop/ui/views/layout/webapps/access-local-server en https://developer.chrome.com/docs/devtools/remote-debugging/local-server . Het bewijst niets over de werkelijke uitvoering op dit toestel.

## 4. Testmatrix (elk resultaat onafhankelijk vastleggen)

| Test | Handeling | Waarneembare acceptatie | Bewijsgrens |
|---|---|---|---|
| AND-01 | Android Chrome via USB-localhost starten, herladen, serviceworker controle | App opent, SW/cache actief | Fysieke telefoon; geen CI-hergebruik |
| AND-02 | Online fictieve Koolmees met echte telefoon-bestandskiezer en testfoto opslaan, sluiten/heropenen | Eén juiste waarneming plus decodeerbaar beeld | Geen echte personen/GPS in bronfoto |
| AND-03 | USB los, vliegtuigstand, vorige record en gidsfoto openen | Record en beeld zonder internet leesbaar | Externe kaarttegels apart beoordelen |
| AND-04 | In vliegtuigstand een **nieuwe** waarneming met lokaal testbeeld opslaan; sluiten/heropenen | Tweede record plus foto bewaard, eerste record nog aanwezig | Niet verwarren met alleen offline lezen |
| AND-05 | Soortkiezer openen, Android Terug, formulierwaarden behouden, annuleren | Bovenste laag sluit, app blijft bruikbaar, annuleren veroorzaakt geen ongevraagde wijziging | Android hardware-/OS-Back |
| AND-06 | GPS weigeren en handmatige plaats vastleggen | Geen crash, werkbare fout-/fallbackroute zonder verzonnen coördinaten | Privacy en locatie zichtbaar controleren |
| AND-07 | ZIP exporteren, corrupte ZIP weigeren, geldige import annuleren | Back-up bevat fictieve records/media; fout/annulering wijzigt niets | Test in geïsoleerd profiel |
| AND-08 | ZIP op tweede schoon Android-toestel importeren, nogmaals importeren | Exact herstel en geen dubbeltelling | Zonder tweede toestel BLOCKED |
| AND-09 | Daglicht, kleine bediening, zoom, app installeren/heropenen | Leesbaar, bedienbaar, geen afkapping, data blijft | Als installatiemenu niet beschikbaar: BLOCKED |
| AND-10 | **Later**: bestaande 1.27.6 naar unieke volgende cacheversie upgraden | Databehoud na echte SW-upgrade | Nu NOT TESTED; ontbrekende releasekandidaat |

**Bij FAIL/BLOCKED:** test-ID, verwachte en feitelijke uitkomst, commit-SHA, toestel/Android/Chrome-versie, netwerkstatus, reproduceerstappen, lokale bewijs-ID en herstelactie. Beëindig een route bij mogelijk dataverlies of onbedoelde publicatie; bewaar het laatste bewezen checkpoint.

## 5. Privé bewijsrapport, afzonderlijke QA-gate

De helper beheert **alleen het bewijsformulier**; er is geen remote device control en geen automatische fysieke verificatie.

    python tools/pilot/android_field_report.py --preflight
    mkdir -p ~/Birdspot-testbewijs
    python tools/pilot/android_field_report.py --new ~/Birdspot-testbewijs/android-pilot.json
    # Vul zelf status, observaties, exacte SHA en lokale bewijs-ID's in
    python tools/pilot/android_field_report.py --validate ~/Birdspot-testbewijs/android-pilot.json

Vul per test NOT_TESTED, PASS, FAIL of BLOCKED in; een handmatig vermelde PASS vereist een waarneming en lokaal bewijs-ID. Ook wanneer alle vereiste proeven als PASS zijn *gerapporteerd* blijft de tooluitkomst REVIEW_REQUIRED. Alleen een afzonderlijke beoordeling van echte bewijsstukken kan het fysieke toestelgate sluiten.

**S1-eindgate:** AND-01 t/m AND-09 werkelijk uitgevoerd en beoordeeld; AND-10 hoort bij een toekomstige aparte releasegate. Zonder fysieke toestellevidence is de eindstatus NOT TESTED/BLOCKED; geen livebesluit.

## 6. Checkpoint, kosten en kennisdelta

- Laatste bewezen automatische bron bij voorbereiding: PR #168, SHA 12a985f, 4/4 GitHub-jobs PASS. De nieuwe document-/tool-PR krijgt een eigen SHA en CI-status; document-FINAL is niet app-PASS.
- Herstel: sluit de nieuwe concept-PR om terug te keren naar PR #168. Voor toesteldata: uitsluitend privé ZIP via echte herstelproef, geen ongerichte opslagreset.
- Werkelijke CI-minuten, toestel- en beheerkosten: UNKNOWN; bestaande Python, Chrome en optioneel ADB, geen nieuwe betaalde dienst.
- Reuse L-077 / CAP-BIRD-040. Offline starten, bestaand record lezen, **nieuw** record schrijven, fysieke Android-bediening, tweede-toestelrestore en serviceworker-update zijn afzonderlijke bewijslagen.
- Geen wijzigingen aan vogeldata, gidsfoto's of persoonlijke opslag; onafhankelijkheidsgrens blijft dat de helper zijn eigen schema test maar geen fysieke observatie controleert.

**Status:** DRAFT uitvoerprotocol / fysieke toesteltest NOT TESTED / productie NO-GO.