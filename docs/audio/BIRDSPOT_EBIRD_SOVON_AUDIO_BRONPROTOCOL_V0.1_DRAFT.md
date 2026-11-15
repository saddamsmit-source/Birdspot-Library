# Birdspot — eBird/Sovon en zang/roep in de eerste 140-soortencontrole

| Kenmerk | Status |
|---|---|
| Versie | 0.1 DRAFT · eigenaarbesluit 15-11-2026 |
| Productbesluit | **VERPLICHT als controledomein bij de 140 gefotografeerde soorten**, ook met terugwerkende kracht voor reeds behandelde F2-soorten; laat 141–597 wachten tot deze groep integraal is behandeld |
| Uitvoering | Audit- en pilotkader. 59/140 hebben bestaande geluidsregistratie, 81/140 missen een registratie. Dit is geen onafhankelijke audio-/licentie-/biologische PASS |
| Gezagsverhouding | README is app-productcontract. **Eén bestaande normhouder**: `docs/BIRDSPOT_KWALITEITSNORM.md`. Deze SOP beschrijft onderzoek, bronregistratie en QA-bewijs, **zonder** de vogelfotoregels te wijzigen. |
| Audio-tracker | `docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json` — unieke 140 soort-ID's, geregistreerde audioclips, F2-voortgang, bronchecks en open punten |
| Startbaseline | App/soortdata in concept-PR #239, base SHA `300120909cfd70f0a5701f885306acff91cd0134` |

## 1. Bronverdeling: niet hetzelfde doel of dezelfde rechten

| Bron | Eerste toepassing | Wat bewijst deze bron **niet** |
|---|---|---|
| **Vogelbescherming Nederland** | Nederlandse herkenningskenmerken, habitat, lied/roep/gedrag voor een soort | Niet de identiteit of herpublicatierechten van een externe individuele opname |
| **ANWB-vogelgids** (werkelijk ingeziene soortpassage) | Eerste onafhankelijke veldgidsvergelijking van herkenning, zang en roep waar behandeld | Verkoop-/productpagina is geen geluidsbewijs; geen rechten op media |
| **Sovon** | Voorkomen, broed-/winterstatus en trends in Nederland, met passende datum en geografische granulariteit | Geen toestemming om kaarten, foto's, live records of tekst klakkeloos commercieel te herpubliceren |
| **eBird** | Aanvullende controle van **waar en wanneer** soorten waargenomen worden, met seizoensvariatie en onderzoeks-/meldingsbias; taxonomie en zeldzame meldingen waar relevant | Een waarnemingspunt is geen exacte populatiedichtheid of bewijs van afwezigheid op lege plekken; geen toestemming om eBird-data of -kaarten commercieel over te nemen |
| **eBird Explore Species / Macaulay Library** | **Beluisteren/vergelijking** van originele zang/roep en geluidsvarianten; ondersteunend aan onafhankelijke taxonomische beoordeling | **Geen algemene audio-download-/distributielicentie** voor Birdspot. Cornell vermeldt dat Macaulay-media niet vrij te downloaden zijn tenzij ze van jezelf zijn; licentieverzoek verplicht voor hergebruik |
| **Xeno-canto / Wikimedia Commons** | Kandidaten voor distributie in de Birdspot-gids, **alleen na individuele rechtencontrole** per opname | Een archiefpagina of CC-vermelding van een andere opname bewijst niet automatisch rechten/soort van het gebruikte fragment |

**Bestaande eerste herkenningsprioriteit blijft** Vogelbescherming + inhoudelijk daadwerkelijk geraadpleegde ANWB-soortpagina. **Sovon is leidend voor NL-monitoring**; eBird vult aan met waarnemingspatronen/seasonality en geluidsvoorbeelden. Gebruik verschillende uitgevers en verantwoord eventuele tegenspraak. eBird-gegevens zijn door waarneeminspanning, detecteerbaarheid en seizoen beïnvloed; verwar meldfrequentie niet met officiële populatie of absolute dichtheid. Een soort die slechts gehoord is wordt niet automatisch als `Gezien` opgeslagen.

## 2. Rechten — belangrijk vanwege latere betaalde Birdspot-pakketten

- **Cornell eBird API / originele datasets:** de [API Terms of Use](https://www.birds.cornell.edu/home/ebird-api-terms-of-use/) en [Data Access Terms of Use](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/) verbieden commercieel gebruik of afgeleide data-exploitatie zonder voorafgaande schriftelijke toestemming. API-toegang vraagt normaal een persoonlijke sleutel. **Geen automatische API-/kaart-/datasetimport of brede eBird-kopie** in (toekomstig commercieel) Birdspot op basis van deze DRAFT.
- **Macaulay Library:** [Media aanvragen en gebruiken](https://support.ebird.org/en/support/solutions/articles/48001064551). Voor sound/audio moet per opname de toepasselijke toestemming/licentie expliciet beschikbaar zijn; **raadplegen en beluisteren als onderzoekers is niet hetzelfde als distribueren**.
- **eBird privacy:** [Sensitive Species](https://support.ebird.org/en/support/solutions/articles/48000803210-sensitive-species-in-ebird) maskeert verspreidingsdetails van beschermde/vulnerabele soorten; Birdspot kopieert zulke exacte coördinaten niet en combineert ze niet alsnog tot een herleidbare plek.
- **eBird Status and Trends:** [relatieve abundantie](https://science.ebird.org/en/status-and-trends/faq) is een modelmatige maat, gecorrigeerd voor waarnemingsinspanning en detectie. Geen ruwe 'waar het vaakst is gezien' op eBird als harde natuurclaim presenteren. Publicatie/embedding van visuals of datasetderived content vergt afzonderlijke licentie-/vermeldingscheck.
- **Individuele Birdspot-gidsaudio:** maker, originele opnamepagina, bronopnametype, feitelijke soort, correcte `zang`/`roep`/`alarmroep`/`vluchtroep`, bestandsidentiteit, toegelaten aanpassingen, licentie en credits vastleggen; niet alleen het bestaande register overnemen. In audio herkenbare mensen/locatiegegevens kunnen apart privacybescherming vragen.

## 3. Per vogel: één vaste gecombineerde foto-/geluids-/verspreidingscontrole

De bestaande F2-fotoreview mag **niet opnieuw worden begonnen**; audio- en bronstatus komen in eigen kolommen in het audio-register. Bij elke **nieuwe** F2-batch (maximaal drie soorten) controleer je per soort:

1. **Soort / taxonomie:** Birdspot-ID en wetenschappelijke naam, eventuele eBird-taxoncode pas invullen na daadwerkelijk gecontroleerde eBird-pagina; leg synoniemen gescheiden vast. Geen vermoedelijke eBird-URL als bewezen bron gebruiken.
2. **Verspreiding:** waar en wanneer in Nederland (Sovon en Vogelbescherming), aanvullende regionale/seizoenswaarnemingen (eBird), datum/plaats en de beperkingen van meldingsinspanning. Houd eBird als **onderzoeksreferentie** totdat commercieel gebruik schriftelijk is toegestaan.
3. **Geluidsbehoefte:** welke zang, roep en eventueel vlucht-/alarmroep diagnostisch relevant zijn; soms is één roep voldoende. Dwing nooit kunstmatige man/vrouw-/jeugdlabels af. Geen verplichte 'zang'-rol voor soorten waarvan dat geen bruikbare veldgidsrol is.
4. **Bestaande opname:** hoor het werkelijke lokale geluid, controleer titel/bron/soort/roepsoort en vergelijking met onafhankelijke deskundige voorbeelden (o.a. eBird/Macaulay *als referentie*, Vogelbescherming/ANWB). Controleer origineel, licentie, credits en wijzigingen; local MP3 != herkomstbewijs.
5. **Ontbrekende opname:** zoek eerst een rechtsgeldige opname (Commons, Xeno-canto met juiste individuele licentie en bron). Bij geen bruikbaar origineel: status `MISSING` of `PARTIALLY TESTED`, bron/zoekdatum en blokkade noteren. **Nooit een verkeerde soort of onbevoegd Macaulay-bestand invullen.**
6. **Technische route:** originele bron → lokale import zonder verlies → generator/mediaregister → soortdetail-audioplayer → echte afspeelbare clip → offline precache/serviceworker en terugkeer/andere tab → ZIP/back-up alleen voor *gebruikersdata* voor zover dat bij de route hoort.
7. **QA en besluit:** bewijsstukken (datum/source URL/original ID, gecontroleerde preview en gebruikte blob/hash, licentie), status per opname/soort, open punten/uitzondering. **REGISTERED_UNVERIFIED ≠ VERIFIED**. Ontbreken geluidsrechten of relevante opname, dan alleen goed onderbouwde uitzondering/uitstel, eigenaar bepaalt of dit blokkerend is voor de volledige 140-audit.

**Vervolgvolgorde:**
- **A. 84 bestaande F2-soorten:** gerichte sound/verspreidingsreview toevoegen zonder hun fotocontroles weg te gooien. 40 met opgenomen clips, 44 zonder geregistreerde audio.
- **B. 56 nog niet F2-behandelde soorten:** nieuwe foto-/audio-/verspreidingscriteria binnen dezelfde batch (max. 3), met afzonderlijke bewijsstatussen.
- **C. Cross-check alle 140:** individuele soort & rol/geluid + bronnen/rechten en kleine browser-/toestelproef; geen verzonnen volledige PASS. Eerst daarna uitbreiding naar andere soorten in de lijst 141–597.
- **D. Veldluisterpilot:** initieel Merel `sp045`, Tjiftjaf `sp056` en Fitis `sp057`: gids-zang/roep controleren als testset, geschikte legaal verkregen fragmenten indien mogelijk voor on-device herkenningsproef; drie soorten, plus omgevingsgeluid/negatieve gevallen. **Gidsclips mogen NIET automatisch trainings- of testrechten van ML verkrijgen**. Suggestie → zelf beluisteren/bevestigen → `Gehoord` (of `Gezien én gehoord` bij werkelijk zien) → persoonlijke pin → offline-herstel.
- **E. Achtergrondluistermodus:** apart afhankelijkheidsonderzoek, scherm-uit/lock, batterij en privacy op echt Android/iOS. De huidige PWA biedt hiervoor geen gegarandeerde achtergrondwerking.

## 4. Exacte nulmeting en testscheiding

Op de gecontroleerde GitHub-baseline `300120909cfd70f0a5701f885306acff91cd0134`: 
- Gidsfoto-cohort: **140** soorten (canonieke `soortaudit-status.json`).
- Audio-registry: **59/140** soorten met **120** ingeschreven clips, **81/140** zonder; **0/140** onafhankelijk op de huidige audioschema-gate VERIFIED.
- F2-fotoreview: **84/140** individueel opgepakt; daarvan **40 met ingeschreven audio** en **44 zonder**. Dit zijn inventory-waarden, geen beluisterde rechtenbeoordeling.
- Bestaande `tests/test_guide_photos.py` bevat Chromium-decodering van alle geluiden en offline-cachecontract. Hiermee is **technische weergave** te testen, maar niet juist gezongen soort/individuele maker/geluidsrechten.
- Nieuwe `tests/test_audio_140_contract.mjs` bewaakt cohort, individuele lokale bestandsaanwezigheid, bronvelden, generator-/UI-audiopanel en expliciete status; om een soort naar VERIFIED te promoveren eist dit testcontract per-clip verificatie en bronbewijs.
- Voor pilot worden bestaande, duidelijk verschillende klassen song/call bij Merel, Tjiftjaf en Fitis **gecontroleerd op geregistreerde metadata en lokaal bestand**, nog niet op akoestische classificatie. Een 3-soorten ML-modeltest is een **aparte toekomstige test**, geen deel van de huidige PR.

## 5. Wanneer later Veldluistermodus naar de app kan

**Gate 0**: bron-/rechten-/taxonomie-check van pilotsoorten.  
**Gate 1**: geschikt lokaal herkenningsmodel met exact gecontroleerde weights/licentie en on-device prestaties; geen BirdNET-variant veralgemeniseren.  
**Gate 2**: audio input, segmentatie, meerdere soorten, foute/overlappende/achtergrondgeluiden, onzekerheid vs gebruikersbevestiging, batterij en performance.  
**Gate 3**: bestaande Birdspot-waarnemingslogica hergebruiken: `heard/both/seen`, gelijk locatie waar gebruiker kiest, bulkbewaren met anti-dubbeling, terug/annuleren, offline opnieuw openen, ZIP-export/herstel, privacy en GPS, 320/390px + echte Android.  
**Gate 4**: afgeschermde preview van de exact geteste release-SHA; eigenaarproef en expliciet releasebesluit. Geen eigenarenapp-, betaal- of communityconnectie om deze pilot te maken.

## 6. Bronnen, rollen en open kwesties

- Vogelbescherming Nederland en ANWB-gids (alleen echte soortpassages) zijn de eerste determinatiebronnen volgens `docs/BIRDSPOT_KWALITEITSNORM.md`. Dit protocol voegt **geen concurrerende bronhiërarchie** toe.
- Sovon blijft voor NL voorkomen leidend; eBird aanvullend voor waarnemingen, seizoen en geluidsreferenties; nooit locatie/privacybeperkingen omzeilen.
- Bron per clip en soort wordt in het audio-register vastgelegd; geen hardcoded/source-free labels. Kennisdelta en later goedgekeurde normwijziging komen in de bestaande norm/README, niet een tweede algemeen Handbook.
- Bruine Klauwier `sp490` en Kleine Vliegenvanger `sp285` staan in de 597-soortenlijst **buiten** het cohort van 140 en komen later. Hun Birdspot-rijen bestaan, maar zij hebben op dit checkpoint nog geen ingeschreven gidsaudio.
- **Kennis-/testgrens:** alle model-, eBird-datagebruiksrechten, echte beluistering, individuele soortidentiteit, originele bronbestanden, echte Android, achtergrondluisteren en integrale release staan nog open; werkelijke kosten **UNKNOWN**.

**Status: PRODUCTRICHTING EN SOP DRAFT.** Geen bron-/licentievrijgave of app-aanpassing door dit document; historische F2-foto-oordelen blijven onaangetast.
