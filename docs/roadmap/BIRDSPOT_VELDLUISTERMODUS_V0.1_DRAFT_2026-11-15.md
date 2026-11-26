# Aviandra — Veldluistermodus en meerdere akoestische waarnemingen

**Opnameproef 1.27.13.** De beschermde kandidaat voegt een geluidsniveau-tijdbalk, live suggesties en één lokaal heropenbaar sessieconcept toe. De drie pilotsoorten Merel, Fitis en Tjiftjaf werden in Chromium met het echte model op drie bestaande referentieclips voorgesteld. Andere soorten en herkenning in het veld zijn nog niet gevalideerd. De proef gebruikt lokale inferentie. Een suggestie wordt afzonderlijk aangevinkt en blijft na pinnen als modelherkomst traceerbaar. De opname en het concept blijven op dit toestel totdat de gebruiker ze pint of verwijdert. Achtergrondopname en fysieke Android-/iOS-proeven vallen buiten het bewezen resultaat.

**Model en kosten.** De app gebruikt uitsluitend [BirdNET Live V3.0 op broncommit `02bd015`](https://github.com/birdnet-team/birdnet-live-app/tree/02bd0150b66fbf07f6c91d99802975822dd4d9fc), met de [Apache 2.0-modellicentie](https://github.com/birdnet-team/birdnet-live-app/blob/02bd0150b66fbf07f6c91d99802975822dd4d9fc/MODEL_LICENSE) en [Acceptable Use](https://github.com/birdnet-team/birdnet-live-app/blob/02bd0150b66fbf07f6c91d99802975822dd4d9fc/ACCEPTABLE_USE.md). De SHA-256 van het 67.469.056-byte akoestische model wordt vóór laden gecontroleerd. Modelindeling is mono op 32 kHz per drie seconden. Het indexbestand koppelt 547 modelklassen op exacte wetenschappelijke naam aan Aviandra. Voor berekening wordt [ONNX Runtime Web 1.31.1](https://github.com/microsoft/onnxruntime/tree/v1.31.1) via een versiegebonden CDN-pad geladen. Geen betaalde herkenningsdienst in deze proef. Eerste download is ongeveer 82 MB; werkelijke distributielimieten, kosten voor eventuele eigen hosting en mobiele CPU-/accubelasting zijn `UNKNOWN`. Houd bij uitval of ongeschikte prestaties de opname, tijdbalk en handmatige selectie beschikbaar. De eerdere geteste kandidaat en zijn URL blijven het codeherstelpunt.

**Opvolgend eigenaarbesluit.** De centrale knop **Geluid herkennen** opent direct één geluidsessie, zonder leverancierstekst en zonder extra route voor één vogel. De eerste appkandidaat neemt voorgrondgeluid op, laat het tijdelijk terugluisteren en kan één of meerdere zelf herkende soorten gezamenlijk privé pinnen. De oudere schermindeling hieronder is historische context. Automatische suggesties, validatie door een herkenner en hun bron-/bewijsvelden zijn vervolgstappen. Zie de actuele [productroute in de README](../../README.md#waarnemen-en-vogelgeluid-opnemen).

| Veld | Status / waarde |
|---|---|
| Versie | v0.1 DRAFT · 15 november 2026 |
| Besluit van eigenaar | **Gewenste productrichting**: vogelgeluiden in de gids kunnen vergelijken, één doorlopende luistersessie die meerdere mogelijke soorten toont, onderscheid 'nog niet geregistreerd' / 'nog niet gezien', en bevestigde soorten gezamenlijk kunnen registreren/pinnen |
| Uitvoering | **NIET GEBOUWD / NOT TESTED**: dit document geeft geen opdracht om nu een herkenningsmodel, server, extra licentie, betaalmodule of native rewrite te starten |
| Architectuurrichting | Eerst een goedkope, herstelbare praktijkproef binnen bestaande offline-first Aviandra PWA op voorgrondscherm; latere achtergronddetectie of native alternatief alleen na device- en kostenbewijs |
| Canonieke producteis | Aviandra `README.md` en eigenaarsbesluiten; dit is een functionele ontwerp-/researchbrief, niet een tweede vogelfoto- of Handbooknorm |
| Afhankelijkheden | Bestaande `+`- / Merlin-brief; huidige waarnemingsdata `seen/heard/both`, lokale kaart, opslag/herstel, F2-fotocontrole; eerst actuele geïntegreerde test-SHA en writerstatus hercontroleren |

## 1. Gebruikssituatie, non-goals en gebruiksgemak

**Gebruiker:** vogelaar met telefoon in tuin, park, bos of andere vogelplek. **Probleem:** één opname bevat meerdere soorten; telkens Merlin of Aviandra opnieuw openen, soort kiezen en een pin maken voelt omslachtig. Sommige soorten zijn mogelijk voor de gebruiker nieuw; sommige zijn alleen gehoord en niet daadwerkelijk gezien. De gebruiker wil zelf kunnen beoordelen welke resultaten kloppen en die vervolgens efficiënt als eigen waarnemingen bewaren.

**Gewenste kernroute:** `Waarnemen +` → naast `Vogel gezien` en `Geluid herkennen met Merlin` een **later op relevant moment vindbare** optie `Veldluistermodus` (of deze binnen het geluidspad als tweede vervolgstap aanbieden; exacte IA vóór bouw door eigenaar laten beoordelen) → toestemming voor microfoon en (optioneel) locatie → `Start luisteren` → live **soortsuggesties** worden verzameld → `Stop` → lijst met unieke mogelijke soorten, tijdstempels en bewijsfragmenten → `Nog niet geregistreerd` / `Nog niet gezien` duidelijk gescheiden → de gebruiker hoort/vergelijk/verifieert iedere soort → selecteert één/meerdere → één gezamenlijke opslaghandeling maakt **één privéwaarneming per soort**, naar gelang `Gehoord` of `Gezien en gehoord`, met juiste locatie/tijd → resultaat en eventuele fouten tonen in eigen kaart en logboek.

**Non-goals eerste proef:** automatische openbare vogelkaart of community-publicatie; vogelsoort automatisch definitief bevestigen; 'Gezien' afleiden uit een microfoon; aantal individuele vogels of broedparen afleiden uit aantal geluiddetecties; exacte GPS van beschermde soorten delen; permanent 'altijd luisteren' met scherm uit beloven; massaal websitescrapen; eigen betaalde Sound Plus nu maken.

**Gewone visuele route en gratis externe Merlin blijven bestaan** en snel bruikbaar; nieuwe Veldluistermodus is een extra route die geen betaalmuur introduceert voor de reeds bestaande functies.

## 2. Twee verschillende audio-lagen

### A. Gids- en vergelijkingsgeluiden

Voor weergave op de soortkaart en het terugluisteren van zang, roep, alarmroep of vluchtroep mogen alleen opnamen worden gebruikt met per bestand vastgelegde: exacte soort / opnamevariant / maker / oorspronkelijke URL / licentie / verplichte credits / bronperiode / bewerking / commerciële en offline distributierechten. Een geluidfragment mag meerdere soorten bevatten. De uitkomst van een eigen inspectie en (eventuele) onafhankelijke determinatie blijft vastgelegd.

**Feitelijk peilpunt in repo** (PR #236 `71e35a5f5c2e9cb6a56d51af3b6bb0e4102a1039`): `assets/species/field-guide-media.json` bevat voor **59 soorten 120 geregistreerde audio-items**. In dit register werden 2 Public domain, 3 CC BY 3.0, 16 CC BY-SA 3.0, 71 CC BY-SA 4.0, 13 CC BY 4.0, 14 CC0 en 1 CC0 1.0 geteld. De **registratie is geen nieuwe onafhankelijke originele bron-/rechten-PASS**. Voor hergebruik opnieuw individuele bronpagina, audio-identiteit en mediarechten controleren. Schaal geen 59 soorten automatisch op tot volledige 140/597-dekking.

**Mogelijke bronnen:** Xeno-canto (licentie per record; niet automatisch commercieel), Wikimedia Commons (vrije audio met actuele bestandenlicenties en credits); Macaulay Library uitsluitend na passende externe licentietoestemming. Bekijk import-/API-/downloadvoorwaarden afzonderlijk, in het bijzonder bij NC, ND of BY-SA. Een kosteloze consultatie is **geen** toestemming voor bundelen, herpubliceren, commercieel aanbieden of modeltraining. Geen beschermde-soort-lokmiddelen of kwetsbare nest-/locatiegegevens opnemen in gedeelde metadata.

### B. Automatische audioherkenning

**Een gidscollectie is geen herkenningsalgoritme.** De microfoon levert een opname/spectrogram, een daarvoor getraind herkenningsmodel voorspelt één/meerdere **kandidaten** op basis van akoestische kenmerken; locatie/seizoen kunnen voorzichtig helpen maar mogen ontbrekend bewijs niet verhullen. Meerdere vogelsoorten tegelijk, andere geluiden en korte fragmenten leiden tot onzekerheid. Laat gebruiker altijd terugluisteren en zelfstandig kiezen. Het systeem gebruikt geen '100% zekerheid' of zelf verzonnen trefpercentages.

Onderzochte candidate **BirdNET Live** (actuele officiële repo `birdnet-team/birdnet-live-app`): Flutter-/native-app met offline on-device BirdNET+ herkenning, live- en sessiemodi en aparte `MODEL_LICENSE` die **Apache-2.0 voor de daar meegeleverde modelgewichten** vermeldt; appcode MIT. Dit is **GEEN PWA-implementatiebewijs**, geen recht op andere BirdNET-varianten of alle trainingsdata, en geen automatisch bewezen commercieel sublicentie-/distributierecht voor Aviandra. **BirdNET-Analyzer** hanteert MIT voor code en **CC BY-NC-SA 4.0 voor de daarin opgenomen modellen**; deze modellen mogen niet zonder passende toestemming voor een commerciële Aviandra-uitbreiding worden overgenomen. Leg bij proef de exacte modelversie, hash, verspreiding, licentie, dependency-licenties en kosten vast. Beoordeel lokale inference (ONNX/WebAssembly/WebGPU, mobiel CPU/geheugen) vóór enige modelimport.

Officiële bronnen (verificatiestart, 15-11-2026):
- BirdNET Live repo/documentatie: https://github.com/birdnet-team/birdnet-live-app
- BirdNET Live specifieke modellicentie: https://github.com/birdnet-team/birdnet-live-app/blob/main/MODEL_LICENSE
- BirdNET-Analyzer README/modelrechten: https://github.com/birdnet-team/BirdNET-Analyzer
- Cornell Merlin Sound ID en gebruikersverificatie: https://support.ebird.org/en/support/solutions/articles/48001185783-sound-id
- Wikimedia Commons audio en hergebruik: https://commons.wikimedia.org/wiki/Commons:Audio/en en https://commons.wikimedia.org/wiki/Commons:First_steps/Reuse

## 3. Luistersessie: detecties, status en bundelopslag

**Sessiegegevens** (ontwerp, geen schema-implementatie): sessie-ID, lokaal begin/einde, toestel/onderzoekmodelversie, optionele gebruikerlocatie, audio-toestemming, status actief/gestopt/onderbroken, **eventueel** fragmentverwijzingen, herkende Aviandra-soort-ID's, suggestie-tijdstempel, herhalingen en reviewstatus. Oude onbekende velden/ZIP-versies blijven compatibel.

**Detectieregister** per soort-ID en sessie: één soortregel kan verschillende detectiemomenten hebben. Toon eerste/laatste keer gehoord en aantal detectiemomenten, **niet automatisch het aantal aanwezige individuele vogels**. Dedupliceer herhaalde herkenningen van dezelfde vogelsoort tot één kandidaatrij; ondersteun handmatig splitsen wanneer het werkelijk verschillende waarnemingen zijn. Omgekeerd mogen meerdere soorten in één geluidsfragment ieder hun eigen kandidaatrij hebben. Beschikbare voorbeelden vergelijken met licentiebewuste gidsopnamen.

**Persoonlijke nieuw-statussen:** 1) `Nog nooit geregistreerd`; 2) `Wel gehoord, nog nooit gezien`; 3) `Al gezien`; 4) `Al eerder gehoord`. Deze komen uit het bestaande lokale logboek met onderscheid `seen`, `heard`, `both`. Een soort **alleen op basis van geluid** telt nooit automatisch als visueel geziene 'lifer'. Uitzoeken hoe oudere waarnemingen zonder methodedata worden behandeld: markeer die als **onbekend**, niet als 'nooit gezien'.

**Review → gezamenlijke opslag:** gebruiker kan kandidaat per soort `Bevestigd gehoord`, `Ook daadwerkelijk gezien`, `Onzeker`, `Niet deze soort` of `Overslaan` markeren; `Selecteer alle bevestigde` en `Registreer geselecteerde` maken **afzonderlijke** waarnemingsrecords via de bestaande opslaglogica. Bij alleen geluid kies `heard`; bij visueel + auditief `both`; handmatig geziene soorten blijven normale `seen`. Een modeldetectie zonder gebruikersbevestiging blijft sessiesuggestie, geen waarneming, pin of publieke record.

**Eén plek versus meerdere plekken:** voor een stationaire sessie kan een **door gebruiker bevestigde gedeelde privélocatie** als standaard voor de geselecteerde soorten dienen. Bij verplaatsen moeten tijden en eventuele GPS-posities per detectie/stop worden gerespecteerd; niet alle soorten op één willekeurige nieuwe pin plaatsen. Zonder GPS mag gebruiker een handmatige plek selecteren of zonder pin bewaren als bestaande kernroute dat ondersteunt. Exacte locatie wordt nooit automatisch met derden gedeeld. Beschermde soorten en onzeker beschermingsgebied: alleen persoonlijk logboek, geen openbare GPS of herleidbare media.

**Fout/herstel:** ontbrekende microfoon, weigering, model niet gedownload, PWA update, offline zonder model, verdwenen tab, lege sessie, zwak/niet herkend fragment, geheugen/IDB vol, gedeeltelijke batchsave, dubbele retry en vertrek van locatie moeten een duidelijke herstelactie opleveren. Bij gedeeltelijke opslag toon welke soorten daadwerkelijk zijn bewaard; behoud de overige bevestigde kandidaten zonder duplicaten. Geen belofte van een alles-of-niets-transactie zonder echte storage-integratietest. Gebruik sessie- en kandidaat-ID's voor idempotentie.

## 4. Offline-/achtergrondbeperkingen van een mobiele PWA

**Wel plausibel voor eerste proef:** op een actieve, zichtbare HTTPS-/localhost-PWA microfoontoegang vragen met `getUserMedia`, korte geluidssegmenten lokaal verwerken, optioneel een op het toestel beschikbare lokale AI-modeldownload, per sessie resultaten opslaan en later zonder netwerk aan eigen soorten koppelen. Toegang, modeldekking, batterijkosten en offline persistente bestanden moeten op werkelijke toestellen worden gemeten.

**Niet gegarandeerd:** de smartphone **met scherm uit wegleggen en minuten/uren zonder onderbreking luisteren**. Browsers mogen een verborgen/gelockte PWA pauzeren; `Screen Wake Lock` werkt voor **zichtbare** documenten om het scherm wakker te houden, niet als achtergrondaudio-service. Onderzoek Android en iOS apart, in geïnstalleerde PWA én browser, scherm-aan, scherm-uit, andere app, batterijbesparing, netwerkuitval, appvernieuwing. Als echte betrouwbare scherm-uit-monitoring noodzakelijk is, dan pas een apart onderbouwde native/background-service-architectuur overwegen; **geen automatische native rewrite**.

Technische bronnen: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia ; https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API ; https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState .

**Privacy:** microfoon alleen na expliciet `Start luisteren`; doorlopende herkenning zichtbaar en eenvoudig stopbaar. Standaard alleen noodzakelijke korte fragmenten of detectiemetadata lokaal, geen continue volledige omgeving-/mensspraakopname bewaren of naar servers uploaden. Duidelijke bewaartermijn en `Alles uit sessie verwijderen`, geen heimelijke uploads/tracking. Scherm-aan-hulp mag gebruiker toestaan uitzetten, met waarschuwing dat de sessie kan onderbreken.

## 5. Duidelijke kleine bouw-/testfasen

| Fase | Kleine output | Onafhankelijke test/ownerreview | Status |
|---|---|---|---|
| A — bestaande kern behouden | Centrale `+`-chooser uit eerdere brief: direct waarnemen of externe gratis Merlin; dit deel eerst zonder regressie testen | `open → keuze → seen/heard → pin → opslaan → sluiten → offline/heropenen`, annuleren/terug, 320/360/390px | APART PLAN / NOT TESTED |
| B — veldsessie zonder herkenningsmodel | Start/stop-sessie, privélocatie, kandidaatselectie via **fictieve of handmatig ingevoerde** testsoorten; filter 'nog niet geregistreerd/alleen gehoord'; batchregistratie via bestaande store | 0/1/veel soorten, dupes, 2 stops, beschermde locaties, oude data, fout+retry, ZIP restore, tweede toestel | FUTURE / NOT TESTED |
| C — alleen modelcapability-onderzoek | Maximaal 3 vogelsoorten per media-/modelproef; toestemming modelgewichten, offline inference en apparaatbelasting benchmarken; geluidsfragmenten met individuele bronrechten of eigen tests | Reële telefoon, juiste/wrong/overlappende geluiden, vogels/niet-vogels, performance, batterij, permissions, commerciële licentie en kosten | RESEARCH / BLOCKED tot bron/licentie |
| D — end-to-end luistersessie | On-device detecties in B, gebruiker verifieert, multi-select privépinnen en correcte seen/heard-staten | Fysieke Android en iOS, offline, wake lock/scherm-uit, stoppen, crash/restore, GPS-uitval, media/ZIP, bron-/privacytest | FUTURE / NOT TESTED |
| E — schaal/Plus | Alleen op evidence besluiten over langere sessies, meer regio's, modelpakketten, kwaliteit en evt. latere betaalde extra's | Store/hosting/CPU/storage/batterij en toestemming, prijs-/waardeproef; eigenaar beslist | FUTURE / NO GO tot gate |

**Geen bewezen efficiëntie/kwaliteit** zonder meting; geen AI/model/hostingbudget aannemen. Voor kostenregister: provider, licentie, model-downloadgrootte, offline opslag, CPU, batterij, dataset-/creditslast, gratis/normaal/piek, gemeten verbruik, waarschuwing/stoplimiet en fallback. Voorlopig **UNKNOWN**.

## 6. Te hergebruiken bestaande app-onderdelen en overdracht

- `src/features/sightings/evidence.js` voor `seen/heard/both`, `self/merlin` bron en onbekende oude methoden.
- `src/features/sightings/addSheet.js` en `pinPicker.js` voor bestaande individuele bewaarde waarneming en persoonlijke pin (niet zomaar nieuwe opslagcode schrijven).
- `assets/species/field-guide-media.json` voor gids-audioreferenties met afzonderlijke licentie- en broncontrole.
- `docs/roadmap/BIRDSPOT_PLUS_MERLIN_SNELWAARNEMEN_V0.1_DRAFT.md` voor bestaande gratis +/Merlin route. **Niet hetzelfde als automatische Aviandra Veldluistermodus**.
- `docs/roadmap/BIRDSPOT_EIGEN_FOTOS_BIJDRAGEN_BELONINGEN_MEDIA_PLUS_V0.1_DRAFT.md` voor later zelfstandig betaalde Sound Plus als open kandidaat. **Geen gratis Merlin onder paywall**.
- App README bewaart kort productverzoek, fase en vindplaats. Handbook en Index blijven eigen autoriteit/vindplaats; geen dubbele generieke leer-ID voor Birdspotwens.

**GitHub-bewijsgrens:** de huidige F2-/foto-inboxcode stond bij read-only controle op PR #236 `71e35a5f5c2e9cb6a56d51af3b6bb0e4102a1039`; die kan verder bewegen. Deze documentatieronde gebruikt als base alleen docs-PR #237 `eed01343166f5543b5e63b5a8beb90efcb686c01` en raakt F2-code, `main`, bestaande preview, binaries en persoonlijke data niet. Eerst remote HEAD/branch/base/CI/writer opnieuw controleren vóór concrete bouw. Na eigenaarfeedback designbrief en microbatches kiezen; preview alleen van de exacte geteste kandidaat-SHA, niet een oudere website.

**QA-status:** productrichting geregistreerd; externe documentatie onderzocht; geen functionerend Aviandra-herkenningsmodel of background-service gebouwd; onafhankelijke licentie-review, mobiele inferentietests, privacy-/data-/releasegates **NOT TESTED**.
