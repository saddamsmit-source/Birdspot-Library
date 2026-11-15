# Birdspot F3-R01 — herijking 140 soorten, eerste drie duiven

| Eigenschap | Waarde |
|---|---|
| Datum | 15 november 2026 |
| Status | **PARTIALLY TESTED / BLOCKED**; geen F3-FULL PASS, geen nieuwe media gepubliceerd |
| Herijkingsbron | `docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json` (140 oude foto-ID's, historie intact) |
| Appcodebaseline | geïntegreerde PR #242 `c51abf8c59774ffe73e3738c71dc0026c5fb1864` |
| Getroffen soorten | `sp002` Houtduif, `sp003` Holenduif, `sp004` Turkse Tortel |
| Scope | 9 lokaal aanwezige WebP's openen, oude F2-rechtenclaim en rol controleren, actuele deskundige referenties raadplegen, geluid/eBird-status vastleggen, QA-fouten herstellen **zonder oude foto's/bronfiles te overschrijven** |
| Geen stilzwijgende aftekening | Tot bronnen, daadwerkelijke clip, licenties, fysieke/preview-UX en onafhankelijke controle voltooid zijn |

## 1. Nieuwe norm en bronhiërarchie, gerelateerd aan eigenaarbesluit

Deze F3-herijking herbegint de 140 **van voor af aan** volgens de laatst bevestigde productwensen: bestaande gidsfotorollen en vlucht/geslacht/leeftijd, enige goede echte opname per soort plus passende zang/roep waar mogelijk, wetenschappelijke herkenning, volle bronbewijsketen, broncredits en commercieel/offline herpublicatierecht, eBird/Sovon-verspreiding, vergelijkingen (alleen complete twee-fotoparen), mobiele foto's naast elkaar zonder lege ruimte, rustige afspeellijst met optionele verplichte maker-/licentie-info, eigen foto terugzetbaar en feedback privacy, en werkelijke browser/telefoonbediening.

**Noodzakelijke statusonderscheiding:** F2-historie telt **84/140 opgepakt**; oude `soortaudit-status.json` bevat 15 `VERIFIED` eindoordelen op oudere bewijsbasis en 101 `audited:true`. Geen van die historische tellers is **automatisch** een F3-FULL PASS. F3 begint met **0/140 volledig afgetekend**. De eerste 3 zijn opnieuw **geopend en visueel bekeken**, maar blijven BLOCKED door ontbreken van geluidsmedia en overige actuele gates. Niets aan historische F1/F2-data wordt gewist.

**Documentconflict voor presentatie:** in Birdspot Veldhandboek v0.6 hoofdstuk 04 staat de vroegere indicatie `In vlucht vóór mannetje, vrouwtje en juveniel`. De recentere Birdspot-kwaliteitsnorm v1.6 §3.1 legt expliciet `Hoofdfoto → Mannetje → Vrouwtje → Juveniel → In vlucht → Vergelijkingen` vast. Deze controle volgt de recentere canonieke normen en feitelijke gebruikerswensen, waaronder bij meerdere beelden compacte rijen van twee volgens #241. Het oude hoofdstuk blijft historie en verdient bij de **volgende geautoriseerde Veldhandboek-revisie** een verwijzing naar de huidige canon; niet in de FINAL-bron zonder extra QA overschrijven. Foto-/audiolabels mogen niet worden vervalst om rollen te vullen.

**Nog niet geïntegreerde UI:** #241 (foto's per rubriek naast elkaar, compacte audiolijst, info in één uitklapregel) en #244 (afstand Home-veldkenmerken) zijn op andere concept-branches dan #242. Een geldige F3-visuele oplevering moet die wijzigingen op **één nieuwe gecombineerde geteste SHA** meenemen; huidige `c51abf8c` heeft niet automatisch die UX. Geen merge zonder integratie/regressie.

## 2. Fotobeoordeling — 9 echte WebP's gelezen vanaf exact SHA

| Soort | Geopende originele Birdspot-WebP's en blob-SHA-prefix | Wat is vastgesteld | Open voor echte F3-PASS |
|---|---|---|---|
| Houtduif sp002 (*Columba palumbus*) | `assets/species/sp002.webp` `cef01c89`; `plumage/sp002-juv.webp` `e8ab1b91`; `plumage/sp002-flight-wingband.webp` `12533207` | Volwassen beeld duidelijke witte nekvlek, jeugdbeeld zonder opvallende witte nekvlek, daadwerkelijke vrije vlucht met heldere witte vleugelband; onderscheidende beelden; bestaande F2-register vermeldt eigen individuele auteur-/rechtcontrole | Alle externe originelen en pixelherkomst onafhankelijk herbevestigen op deze release, rol juvenile op originele opname, actuele info in de app, credits en juiste 2-op-een-rij-layout |
| Holenduif sp003 (*Columba oenas*) | `assets/species/sp003.webp` `fc0ad259`; `plumage/sp003-juv.webp` `c916463c`; `plumage/sp003-flight-open-sky.webp` `22892781` | Rustbeeld met donkere iris, groene halsglans en korte zwarte vleugelstrepen; juveniel bruiniger/fijnere veren; vrije vlucht zichtbaar. Op flightbeeld oogt de verlichte buitenste ondervleugel relatief licht | **Gerichte hercontrole individuele flight-opname** (oud F2 noemt iNaturalist 757637556, auteur andygpos en CC BY4) tegen de originele soortdeterminatie; verschillen met bronkenmerk `grijze ondervleugel` kunnen foto-/lichtomstandigheden zijn, niet automatisch fout. Andere originele media, credits en vergelijking ook herbevestigen |
| Turkse Tortel sp004 (*Streptopelia decaocto*) | `plumage/sp004-adult-crop.webp` `97d6e4c8`; `plumage/sp004-juv.webp` `75d863d8`; `plumage/sp004-flight.webp` `b96d2a46` | Adulte vogel met donkere halsring en lang gerekte staart; jeugdbeeld zonder halsring, geen verborgen geslacht; vrije vlucht met volledige vleugels en brede lichte staartvlakken | Origineel en bestandsbewerking opnieuw vergelijken, leeftijd niet alleen uit titel, credits en volledige werkelijke app-layout opnieuw controleren |

**Bewijsgrens:** dit is zelfstandige visuele inspectie van de daadwerkelijk in GitHub opgeslagen 9 lokale bestanden, geen computer-vision-vergelijking tegen alle negen originele uploads; alleen de **Holenduif-hoofdfoto** `Columba oenas1.jpg` werd in deze ronde met zichtbare Commons-metadata gecontroleerd: Chris Cant, CC BY 2.0, oorspronkelijk Flickr en Flickr-review. Andere eerder in F2 bevestigde bronrechten blijven **historische claims**, geen nieuwe onafhankelijke F3-rechtenaftekening. Niet vervangen om enkel een nieuw F3-label te krijgen.

### Externe foto- en veldbronnen voor deze duiven

- Vogelbescherming Houtduif: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/houtduif — witte halsvlek voor adulte vogel, witte brede vleugelband, laag gekoer.
- Vogelbescherming Holenduif: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/holenduif — grijze ondervleugel, twee zwarte vleugelstrepen, holenduif-koeren; vooral voor vergelijking met de flightfoto.
- Vogelbescherming Turkse Tortel: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/turkse-tortel — beigegrijs kleed, halsband, drielettergrepig gekoer.
- Geopend Commons origineel van Holenduif-hoofdfoto: https://commons.wikimedia.org/wiki/File:Columba_oenas1.jpg . Auteur Chris Cant, CC BY 2.0, oorspronkelijke Flickrbron. **Individuele WebP-bytegelijkheid niet zelfstandig bewezen**.
- Werkelijk geraadpleegde **ANWB-vogelgidssoortpassages: NOT TESTED**. Geen boek-/winkelvermelding als inhoudelijke bevestiging presenteren.

## 3. Geluid: 0 van 3 aanwezig; drie zoekkandidaten, geen import

Volgens het **feitelijke** `assets/species/field-guide-media.json` hebben alle drie geselecteerde duiven momenteel **0 geluidsbestanden**. Hun beschrijving in de Birdspot-gids is geen speelbare opname.

| Soort | Herleidbare kandidaat | Tegenwoordig bekend uit bron | Waarom niet ingevoerd |
|---|---|---|---|
| Houtduif | https://commons.wikimedia.org/wiki/File:Columba_palumbus_birdsong.ogg | Oona Räisänen (Mysid), publiek domein, 12 seconden, opgenomen zang/koeren in Finland; bron noemt **Ekster op achtergrond** | Rechtenregel lijkt bruikbaar, maar hoorbare tweede vogel maakt het fragment minder ideaal voor een zuivere identificatie-/trainingsreferentie. Eerst onafhankelijke auditie, fragmentkeuze en correcte maker-/PD-toelichting |
| Holenduif | https://commons.wikimedia.org/wiki/File:Columba_oenas_-_Stock_Dove_XC489891.mp3 | De Commons-soortcategorie `Columba oenas` noemt een XC489891-bestand (ca. 67 s), exacte originele pagina kon hier niet worden geopend | **Soort, maker, individuele licentie en gewenste rol NOT TESTED**. Niet herpubliceren zonder broncontrole |
| Turkse Tortel | https://commons.wikimedia.org/wiki/File:Streptopelia_decaocto_-_Eurasian_Collared_Dove_-_XC82758.ogg | Originele samenvatting noemt Xeno-canto XC82758, Jonathon Jongsma, koerende vogel op campus, circa 14 seconden | Originele individuele licentie, audiokwaliteit/andere soorten en werkelijke match niet voldoende onafhankelijk gecontroleerd |

**Verplicht vervolg per soort:** eerst toegestane en echt beluisterde zang/roep/koer voor de soort; originele auteur, soort-ID, type, hergebruik/commercieel/offline, bron-URL, licentie/credits, eventuele uitsnede en afspeelbaarheid; maximaal drie soorten per geluids-/media-batch. Geen ontbrekende naam of rol verzinnen. Als niet rechtmatig of biologisch verantwoord beschikbaar: open issue met reden, niet valselijk `VERIFIED`.

### Verdere licentievergelijking van de kandidaten (niet geïmporteerd)

- **Holenduif XC489891:** een aanvullende <https://eol.org/pages/45509375/media?subcategory=sound> catalogusregistratie noemt **Hannu Varkki**, `song`, en `CC BY-SA 3.0` bij exact XC489891 (Helsinki, 8 juni 2019). Dit is **secundair** metadata-bewijs. De individuele oorspronkelijke Commons-/Xeno-canto-pagina, echte geluidsinhoud, bewerking/credit en sublicentievereisten zijn **niet zelfstandig afgetekend**.
- **Turkse Tortel XC82758:** een direct leesbare tweede Commons-pagina <https://commons.wikimedia.org/wiki/File:JMJ-20110703-070858-000380-USA-IA-DordtPrairie-MODO.ogg> bevestigt auteur **Jonathon Jongsma** en `CC BY-SA 3.0` voor een bronopname die verwijst naar **XC82758**. De bijbehorende oorspronkelijke geluidsidentiteit, geüploade bestanden en echte luistercontrole moeten nog door de volledige media- en creditsroute voordat Birdspot deze als zang mag publiceren. **Geen** download-/distributiehandeling uitgevoerd.
- **Houtduif:** <https://commons.wikimedia.org/wiki/File:Columba_palumbus_birdsong.ogg> beschrijft bij het PD-fragment expliciet **Ekster op de achtergrond**. Die akoestische vermenging is ongeschikt als onvoorwaardelijk 'zuivere Houtduif'-testfixture. Zoek/luister een schoner rechtmatig voorbeeld of markeer achtergrondvogel duidelijk; geen automatische modeltraining op basis van deze bronclaim.

**Door deze aanvullende checks wordt geen enkele F3 audio-gate VERFIED**: bronrechten moeten toepasselijk voor de afgeleide appbestanden en geplande toekomstige commerciële distributie worden bewezen; een titelsnippet van een openbare site is daarvoor onvoldoende.

## 4. Verspreiding en biologie

**Sovon NL-bronnen:** Houtduif https://stats.sovon.nl/stats/soort/6700 ; Holenduif https://stats.sovon.nl/stats/soort/6680 ; Turkse Tortel https://stats.sovon.nl/stats/soort/6840 . Deze soortpagina's zijn door zoek/open-beschrijvingen in deze ronde geraadpleegd; jaartal en bronmethode expliciet tonen bij overgenomen cijfers. Geen kaart/bronmateriaal kopiëren zonder rechten.

**eBird soort-/seizoensreferenties:** Houtduif `cowpig1` https://science.ebird.org/en/status-and-trends/species/cowpig1/range-map ; Holenduif `stodov1` https://science.ebird.org/en/status-and-trends/species/stodov1/range-map ; Turkse Tortel `eucdov` https://science.ebird.org/en/status-and-trends/species/eucdov/abundance-map . **Interpretatie:** deze modellen tonen geschatte aanwezigheid/relatieve abundantie, geen exacte actuele lokale bezetting. Oudere dataversies verschillen per soort. Geen commerciële data-/kaartimport of gevoelige locaties overnemen. eBird-soortcode en bronlinks als **onderzoeksanker**, niet als afgeronde nieuwe verspreidingscontrole.

**Biometrie:** Houtduif `ca.40–45 cm`, Holenduif `28–32 cm`, Turkse Tortel `31–33 cm` staan in `src/data/species.js`; herreken alle drie alleen als de gepinde oorspronkelijke waarden uit minstens twee verschillende uitgevers en de definitie in de kennisbaseline kunnen worden geopend. Geen stilzwijgende normversoepeling of correctie op basis van één website.

## 5. Interface-, feedback- en herstelvoorwaarden

- Galerij per rol: bij twee of meer soort-/kleed-/vluchtfoto's passende beelden **naast elkaar** en niet onder elkaar met loze ruimte. Geen duplicaatbeelden om een lege rol te vullen. **#241 is niet geïntegreerd in #242.**
- Vergelijkingen onder `Lijkt op` tonen twee correct gelabelde werkelijke soortfoto's naast elkaar; anders hele incomplete paneel verborgen, geen placeholder en geen onjuiste leeftijd/houding.
- Geluiden staan als `Zang`, `Roep`, `Alarmroep` etc. rustig onder elkaar, bron-/maker-/licentiegegevens indien verplicht bereikbaar onder één afzonderlijke uitklapregel; geen MP3-bestandsnaam of onnodige tekst onder elk fragment. **#241 apart op huidige baselines**.
- Persoonlijke eigen vogelbeelden hebben afzonderlijke, herstelbare slotvoorkeur (niet officiële gidsfoto vervangen) en vrijwillige foto-feedback met explicit consent; gegevens offline/ZIP herstelbaar; geen inzending of accountdata automatisch gedeeld.
- Mobiel 320/360/390/430 px en desktop 1280 px: de exacte F3-gecombineerde versie openen, door foto's zoomen, geluid afspelen, terug/annuleren, eigen foto aanpassen/herstellen; foto-/gidsrechtengates zijn apart.
- Oude hoofdstuk 07C in Veldhandboek v0.6 is document-FINAL, actuele PR-code moet afzonderlijk worden getoetst. Geen groen app-vinkje op basis van statische screenshots.

## 6. Resultaat en volgende stap

| Soort | Historische F2 | F3-beeldinspectie | Audio | eBird/Sovon | UX/onafhankelijke rechten | F3-besluit |
|---|---|---|---|---|---|---|
| sp002 Houtduif | Opgepakt, oude claim PARTIALLY TESTED | 3/3 lokaal geopend | MISSING, 1 PD-kandidaat met Ekster-achtergrond | Links geraadpleegd, detailaftekening open | NOT TESTED op gecombineerde UI, orig-rechten deels oud | **BLOCKED** |
| sp003 Holenduif | Opgepakt, oude claim PARTIALLY TESTED | 3/3 lokaal geopend; flight opnieuw beoordelen | MISSING, XC-kandidaat rechten niet bevestigd | Links geraadpleegd, detailaftekening open | NOT TESTED op gecombineerde UI, orig-rechten deels oud | **BLOCKED** |
| sp004 Turkse Tortel | Opgepakt, oude claim PARTIALLY TESTED | 3/3 lokaal geopend | MISSING, XC-kandidaat rechten niet bevestigd | Links geraadpleegd, detailaftekening open | NOT TESTED op gecombineerde UI, orig-rechten deels oud | **BLOCKED** |

**Kennisdelta:** WEL werkte: volledige foto-index en bestaande F2-bewijs behouden, 9 werkelijke WebP's direct visueel herzien, officiële veld-/verspreidingsbronnen gevonden. NIET werkte: alle drie geen registergeluid; #241/#244 zitten niet op geïntegreerde release, ANWB soortpassages niet toegankelijk, uitgezochte originele geluidslicenties niet rond. Oorzaak van oudere incomplete status: eerdere F2 focuste op foto's en niet deze samengevoegde media-/UX-standaard. Correctie: nieuw F3-register met expliciet hard gat en eerste rechthebbendenkandidaten, zonder bronvervanging. Preventie: geen voortgangs-PASS bij slechts bezoek of groene CI.

**Volgende kleine batch:** herstel *deze drie* geluiden met originele opname/rechten/zuiverheid, hercontroleer flight/individuele foto, herbouw gecombineerde #241/#244-UX-test op aparte veilige branch, werk F3-statussen bij met exact SHA; **pas daarna** volgende drie F3-soorten `sp005`, `sp248`, `sp253` volgens oorspronkelijke auditvolgorde. Geen ontwikkeling 141–597 voor 140 geslaagd/expliciet door eigenaar beoordeeld.
