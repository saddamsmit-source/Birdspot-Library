# Birdspot — Windows + Android localhost-startkaart (S1 praktijkpilot)

**13 november 2026 · v0.2 DRAFT · toestelresultaten NOT TESTED · geen release of publicatie.**

## Doel en releasebron

Deze startkaart maakt de fysieke Android-proef uit `docs/pilot/ANDROID_S1_FYSIEKE_PILOT_v0.1_DRAFT.md` eenvoudiger. Alleen **Birdspot 1.27.8-kandidaat uit PR #183**, exacte commit `d03e371612baa95f3ba3a5a558905f8d5786b2f5`, mag getest worden. Het PowerShell-script in `tools/pilot/Start-BirdspotAndroidPilot.ps1` kloont de **publieke** bron via HTTPS, controleert branch/commit en maakt een **schone afzonderlijke snapshot zonder `.git`** in de lokale Windows-appdatamap. Het start uitsluitend een localhost-server en, indien uitdrukkelijk gekozen, ADB reverse forwarding.

**Afzonderlijke bronverschillen:** PR #172/173 voegen browser-QA toe maar géén andere appcode. Deze startkaart gaat daarom doelbewust uit van de releasekandidaat uit PR #183, niet van een verschuivende laatste PR of een reeds gepubliceerde GitHub Pages-versie. Dit voorkomt verwarring tussen de twee testbronnen.

## Eenmalige voorbereiding

- Windows PowerShell 5.1+ op een persoonlijke, vertrouwde computer.
- Git en Python 3 beschikbaar op PATH; de voorbereiding installeert niets automatisch.
- Optioneel Android Platform Tools (`adb`) op PATH voor de USB-verbinding. Activeer ontwikkelaarsopties/USB-debugging **zelf**, alleen op een toestel dat je vertrouwt en uitsluitend gedurende de test.
- Bewaar echte waarnemingen, toestelbeelden en eventuele ZIP's uitsluitend privé; geen brongegevens/screenshots uploaden naar deze publieke GitHub-repository.
- Is je computer zakelijk beheerd en verbiedt beleid USB-debugging of het uitvoeren van scripts: niet omzeilen; gebruik de toegestane bedrijfsprocedure of een privécomputer.

## Starten

Open PowerShell in een lokale checkout waarin het startscript staat:

    # Veilig: alleen lokale controles en versiecontract; geen netwerk of toestel:
    powershell -NoProfile -File .\tools\pilot\Start-BirdspotAndroidPilot.ps1 -SelfCheck

    # Download en controleer bron-SHA, maak schone lokaal geserveerde snapshot:
    powershell -NoProfile -File .\tools\pilot\Start-BirdspotAndroidPilot.ps1 -PrepareOnly

    # Start een afgeschermde webserver én verbind één al geautoriseerd USB-toestel:
    powershell -NoProfile -File .\tools\pilot\Start-BirdspotAndroidPilot.ps1 -ConnectUsb

Het startscript voert geen `git push`, installatie van dependencies, device-opslagreset of publicatie uit. Wanneer `adb` ontbreekt, kan het script ook zonder `-ConnectUsb` worden gestart en kan USB port forwarding vanuit een **andere** terminal worden ingesteld via `adb reverse tcp:8765 tcp:8765`. Na de proef gebruik je Ctrl+C om de server te stoppen.

Als PowerShell-scriptuitvoering is geblokkeerd: controleer het bestand en de lokale beveiligingsinstellingen. Omzeil geen organisatiebeleid. Gebruik eventueel de **handmatige route** uit het Android-pilotprotocol.

## Op de Android-telefoon — minimale ronde

1. Open Chrome op `http://localhost:8765/`, wanneer USB-forwarding actief is. Bevestig dat Birdspot **1.27.8** toont en dat app/gids daadwerkelijk werken.
2. Voeg een **fictieve** Koolmees-waarneming toe met een onschuldige JPEG uit de echte telefoonbestandskiezer, controleer de foto en sla op. Sluit en open opnieuw, zoek de waarneming terug.
3. Trek de USB-kabel los, zet Wi-Fi én mobiele data uit. Open Birdspot offline en voeg een **tweede nieuwe** fictieve waarneming toe. Sluit en heropen. Controleer beide foto's.
4. Test Android Terug in soortkiezer en invoerscherm, annuleren, geweigerde GPS en handmatig plaatslabel; bestaande data moet intact blijven.
5. Exporteer een ZIP op de telefoon. Herstel die op een **ander schoon** Android-toestel en importeer hem opnieuw; geen duplicaat. Gebruik voor deze tweede toestelroute een veilige afzonderlijke localhost-verbinding. Als dit niet kan: AND-08 BLOCKED, geen PASS.
6. Leg alle resultaten privé vast met `tools/pilot/android_field_report.py` (evidence-ID's, soort/fout, Android-/Chrome-versie, netwerkstatus, checkout-SHA). Verifieer met `--validate` buiten de repo. Deel **alleen een geanonimiseerde** samenvatting voor onafhankelijke QA, niet de ruwe camerafoto/GPS/ZIP.

De technische ADB-reverse aanpak is bevestigd door <https://developer.android.com/develop/ui/views/layout/webapps/access-local-server> en <https://developer.chrome.com/docs/devtools/remote-debugging/local-server>. `localhost` is hier de relevante origin voor de PWA. Gebruik geen laptop-IP als vervanger zonder aparte secure-context-test.

## Foutsignalen, beperking en herstel

| Signaal | Risico | Maatregel | Laatst bewezen checkpoint |
|---|---|---|---|
| Git SHA verschilt bij clone | Onbedoeld andere release testen | Script stopt; geen branch overschrijven of force-push | PR #183 `83c11744` |
| USB niet geautoriseerd of meerdere toestellen | Verkeerd toestel/privacystoring | Script weigert automatische forwarding; eigenaar controleert ADB | PR #169 Android-testkaart |
| Offline laadt gids/foto niet | Serviceworker/cache/asset of opslagfout | Foto, netwerkstatus, exacte SHA en stappen privé vastleggen; STOP bij dataverlies | PR #183, 13/13 CI |
| ZIP-import mislukt op tweede telefoon | Dataherstel niet bewezen | Bewaar bron-ZIP en testdata, geen handmatige localStorage-reset; AND-08 FAIL/BLOCKED | PR #172, browserprofiel 8/8 PASS |
| PWA-installatie/camerakiezer ontbreekt | Fysiek toestelgedrag onbekend | Noteer precieze toestel/OS/Chrome-versie; geen gesimuleerde PASS | PR #173, JPEG 6/6 browser PASS |

**Kosten en beheer:** bestaande Python/Git/ADB-tools; feitelijke minuten, netwerkverbruik en eventuele GitHub-kosten UNKNOWN; geen betaalde upgrade of hosting geactiveerd. Het script creëert lokale, geïsoleerde snapshots en verwijdert alleen zijn tijdelijke ZIP; bestaande testdata/checkout worden nooit automatisch gewist.

**Kennisdelta:** geen nieuwe algemene regel; hergebruik §1.7A, §3.6, §4 QA, CAP-BIRD-040 en de bestaande Android-veldtestprocedure. De launcher zelf is alleen een hulpmiddel. **CI-selfcheck != fysieke Android-PASS.**

**Releasebesluit:** kandidaat klaar voor fysieke S1-proef, **geen merge, openbare preview of livegang**.
## Vervolg ronde live-opdracht / testverantwoording

De eigenaar heeft op 13 november 2026 expliciet 'Zet live en ga verder' opgedragen. Deze startkaart richt zich op exact Birdspot **1.27.8** kandidaat PR #183 (`d03e371612baa95f3ba3a5a558905f8d5786b2f5`, 28/28 GitHub-workflows success). Dit is een testbare lokaal geëxporteerde bron en **geen live/Android-bewijs**. De originele broncode op kandidaat-HEAD wordt niet gewijzigd. Bij nieuwe HEAD eerst de pin herbeoordelen en het Windows-startpakket opnieuw testen; STOP bij een onbekende of verschoven commit. Bewaar foto's, ZIP's, locatiebewijzen en technische schermafbeeldingen privé buiten deze openbare GitHub-repo. Fysiek AND-01..09 en tweede-toestel-restore blijven open.
