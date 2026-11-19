# Birdspot — Snel waarnemen via + en Merlin Sound ID

## Huidige kandidaat

**v0.2 DRAFT · 19 november 2026.** Op kandidaat `ed810ae8de34bccc26e6f759a3e815323f893a95` opent **Waarneming toevoegen** het formulier. **Geluid herkennen** opent de BirdNET-route met het ingeklapte blok **Controleer met Merlin**.

1. Neem geluid op in Birdspot. Open **Controleer met Merlin**. Op een geschikte browser verschijnt **Deel opname met Merlin**. Birdspot bewaart eerst het bijgewerkte concept, inclusief datum, tijd en plek. Alleen de WAV gaat naar het systeemdeelmenu.
2. Open Merlin handmatig als de deelroute ontbreekt of geannuleerd is. Via **+ → Geluid herkennen** hervat je bij terugkeer hetzelfde lokale concept.
3. Vink aan dat je Merlin hebt gebruikt. Markeer per soort **Merlin gaf deze soort**, **Zelf gecontroleerd** en zo nodig **Ook gezien**. Een Merlin-suggestie krijgt **Mogelijk**, een zelf gecontroleerde soort **Zeker**. Soorten zonder het vinkje **Merlin gaf deze soort** worden als eigen herkenning opgeslagen.
4. Pin de waarneming. De sessie kan de opname bij één gekozen soort als bijlage opslaan. Via **Bewerken** en **+ Geluidsopname** kun je bij een waarneming een eigen geluidsbestand kiezen, bijvoorbeeld een geëxporteerde Merlin-WAV. Afspelen werkt lokaal. De ZIP-back-up bewaart het oorspronkelijke bestand.

De gebruiker voert de soortuitkomst zelf in Birdspot in. Mobiel Chromium doorliep **12/12** scenario’s met een gesimuleerde deelroute. Op Samsung staan het echte deelmenu, terugkeer naar hetzelfde concept, een echte Merlin-WAV en offline heropenen nog open. [Chromium-tests](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/44599118525) · [Kandidaatbewijs](../release/RELEASE_1.27.31.md#kandidaat-na-vier-rondes)

## Historische ontwerpbrief

| Veld | Waarde |
|---|---|
| Document | v0.1 DRAFT — 15 november 2026 |
| Besluit | **EIGENAARSRICHTING VASTGELEGD**: centraal '+'-menu moet rechtstreeks kiezen tussen vogel waarnemen en geluid herkennen via Merlin; na eigen verificatie dezelfde Birdspot-pinroute gebruiken |
| Apprealisatie | **NOT BUILT / NOT TESTED voor de nieuwe +-route**; de oude waarnemingsformuliervelden werken al op broncode-niveau |
| Productbron | `README.md`, deze brief is een uitwerking; bestaande Birdspot-kwaliteitsnorm en locatieregels blijven leidend |
| Afhankelijkheid | Huidige F2-gidswerk / integratie en S1-regressies; geen automatische eigenarenapp-koppeling of betaalfeature |
| Externe leverancier | Cornell Lab of Ornithology, gratis Merlin Bird ID. Gebruik bestaande officiële import-/deelfuncties; geen ingebeelde openbare result-API of commerciële licentie |

## 1. Doel, gebruiker en niet-doelen

**Gebruiker:** vogelaar onderweg met een telefoon. **Probleem:** via de huidige centrale + knop verschijnt meteen het formulier 'Nieuwe waarneming', terwijl een vogelaar soms een vogel **ziet en direct kent**, en soms eerst een **roep/zang hoort** en met de externe gratis Merlin Bird ID wil controleren. De gebruiker wil na herkenning zonder dubbele invoer direct soort, methode, datum/plek, optioneel geluid, en kaartpin kunnen registreren.

**Kernroute 1 (gezien):** centraal + → **Vogel gezien / waarneming toevoegen** → het huidige Birdspot-formulier met `observationMethod=seen`, `identificationSource=self` (of gebruik de huidige keuze Gezien+Gehoord) → soort selecteren → bestaande GPS-/pinpicker en eventuele media → Opslaan → zichtbaar in logboek en op eigen kaart.

**Kernroute 2 (geluid):** centraal + → **Geluid herkennen (Merlin)** → waar mogelijk **Merlin openen/gebruik uitleg** zonder data te verliezen → opname maken, voorbeelden vergelijken en soort **zelf** bevestigen → terug naar Birdspot → **Herkende vogel registreren** opent bestaande addSheet met `observationMethod=heard` (of `both` als gebruiker de vogel ook echt zag), `identificationSource=merlin`, aanvankelijk `merlinVerification=suggested` → gebruiker selecteert de overeenkomende Birdspot-soort of laat onzeker → optioneel Merlin-opname als lokaal bestand bijvoegen **pas als audiobijlage ondersteund en getest is** → bestaande locatiepin kiezen/bevestigen → Opslaan → zichtbare waarneming en privékaartpin met juiste bron/status. **Zonder Merlin herkent of pint de gebruiker gewoon zelf**.

**Non-goals eerste ronde:** geen automatische soortherkennings-API, geen rechtstreeks uitlezen van Merlin's resultatendatabase, geen Merlin-code/naam/licentie in een Birdspot-betaalmodel, geen nieuwe accounts/server, geen automatisch publiceren van GPS, geen nep-'Gezien' op basis van alleen geluid, geen vermenging met de toekomstige betaalde onafhankelijke Sound Plus-route.

## 2. Bestaande code — gecontroleerd op PR #236, peildatum 15-11-2026

| Onderdeel | Feitelijke basis | Verschil met gewenst |
|---|---|---|
| `index.html` | Centrale `#fab` met label 'Waarnemen' | Nog geen keuzemenu achter de knop |
| `src/app.js` | `#fab` klikt rechtstreeks `openAddSheet({ onSaved })` | Kleinschalige chooser vóór dezelfde bestaande callback/routing |
| `src/features/sightings/addSheet.js` | `openAddSheet({onSaved, initial})` ondersteunt `speciesId`, `observationMethod`, `identificationSource`, `lat/lon` en pinpicker | Hergebruik; geen tweede waarnemingsformulier |
| `src/features/sightings/evidence.js` | `seen/heard/both`, `self/merlin`, `merlinVerification=suggested/checked`; gewezen suggestie is niet autom. zeker | Behoud scheiding herkennen en waarnemen, nooit automatisch zekerheid |
| `src/features/sightings/addSheet.js` filepicker | Op gecontroleerde SHA `accept='image/*,video/*'` | **Audio rechtstreeks toevoegen aan waarneming is nog niet bewezen/beschikbaar**; afzonderlijke optionele techbatch nodig |
| Kaart / plek | Huidige pinpicker bewaart `lat/lon` en pin-nauwkeurigheid waar beschikbaar | De gebruikersplek komt uit de gebruiker/Birdspot, **niet** uit Merlin |

De feitelijke codebron is PR #236 (die door een andere schrijver kan wijzigen). De broncodebewijzen hierboven zijn een gedateerde momentopname; hercontroleer HEAD, PR-base en één schrijver voor implementatie.

## 3. Belangrijkste Merlin-grens: gratis app ≠ ingebouwde API

Cornell beschrijft op 23 maart 2026 dat Sound ID vogelsuggesties in de **Merlin-app** toont, offline kan werken op Android/iOS en geïmporteerde mp3/m4a/wav-audio kan herkennen. Merlin kan audiobestanden via de normale deel-/exportfunctie naar een andere compatibele app overbrengen. Ook kan een opname uit een andere app via het apparaat-deelmenu **naar Merlin** worden geopend.

**Officiële bron:** https://support.ebird.org/en/support/solutions/articles/48001185783-sound-id

Cornell adviseert expliciet dat een Merlin-voorspelling **slechts een suggestie** is en de vogelaar zelfstandig controleert. Bron: https://support.ebird.org/en/support/solutions/articles/48001214056-merlin-sound-id-best-practices

**NIET aangetoond:** een door Cornell ondersteunde universele deep-link die Merlin direct met Sound ID start; een officiële API die soortnamen/zekerheden automatisch aan Birdspot teruggeeft; een gegarandeerde automatische terugkeer naar een in de browser draaiende PWA. Gebruik **geen ongedocumenteerde URL-schema's als productiecontract**. Bedieningsflow zonder app, geweigerde share target en iOS/Android verschillen expliciet toetsen. De eerste werkbare oplossing mag via bewuste handmatige appwisseling en soortkeuze terug naar Birdspot verlopen.

## 4. Voorstel voor UI en staten

- **1 tik op '+'** toont twee direct begrijpelijke, grote, toegankelijke keuzes: `Vogel gezien / waarneming toevoegen` en `Geluid herkennen met Merlin`, plus `Annuleren`. Geen onnodige onboarding of derde menu.
- **Gezien** gaat direct via de huidige formulierroute. Indien de extra keuze één tik toevoegt voor de veelgebruikte visuele registratie, toets in S1 of een **lang indrukken / snelle standaardactie** de kernroute sneller kan houden; geen verborgen gedrag als enige toegankelijke manier.
- **Merlin**: eerst kort tonen dat het een andere gratis app is; `Merlin openen` alleen via aantoonbaar ondersteunde systeemroute, anders uitleg `Schakel naar Merlin en kom terug naar Birdspot`; geen foutmelding die een waarneming blokkeert als Merlin niet geïnstalleerd is. Lokale geluidsopname delen **naar** Merlin waar de browser/OS dat ondersteunt, met toestemming.
- **Bij terugkomst**: voortzetten met `Herkende vogel registreren` zonder verloren datum, tijd, soortkeuze, concept of pin. Niet beweren dat Merlin een soort terugstuurt. Bevestig of het een **Gehoord** of **Gezien én gehoord** waarneming was.
- **Onzekere suggestie**: toont `Merlin-suggestie, nog niet zelf bevestigd`; nooit `zeker` of `Gezien` automatisch instellen. Als de soort niet kan worden vastgesteld: annuleren zonder dataverlies, terug naar Birdspot-gids of later hervatbaar concept als daarvoor een apart opslagcontract is getest.
- **Pin toevoegen**: wordt via de bestaande Birdspot-pinpicker gekozen. GPS-toestemming vragen als nodig, weigering met handmatige pin als alternatief. Geen locaties van beschermde soorten openbaar delen; persoonlijke kaart blijft privé.
- **Bron en media**: eventuele originele Merlin-opname alleen importeren met een *expliciete* bestandskeuze, geen stille upload naar Birdspot-server. Import kan pas worden toegevoegd na toetsing van audioformaten, opslaglimieten, IndexedDB, ZIP-herstel, privacy en media-integriteit.

## 5. Kleine uitvoerbare batches (niet automatisch starten)

**A. Keuzemenu en visuele route (S1-kandidaat):** echte '+' chooser met huidige addSheet hergebruikt. Tests op elke startpagina, tab/scherm, terugknop, Escape, focus, 320/360/390px, openen→soort→pin→opslaan→heropenen, offline, snelle visuele route en geen dubbele waarneming. Dit is een mogelijke kleine code-PR ná writer/HEAD-check, zonder nieuwe backend.

**B. Merlin-handoff (platformproef):** op **fysiek Android en iOS** testen of openen/audiodelen naar Merlin werkt zonder verlies van Birdspot-concept/locatie en met veilig terugvalpad. Alleen bewezen apparaten/OS-mogelijkheden claimen; als deep-link niet officieel/werkelijk ondersteund is, gebruik de handmatige Merlin-openroute en toon dat duidelijk. Test zonder Merlin, offline, geweigerde GPS/microfoon, user cancel en crash.

**C. Audio-bijlage + hervatbaarheid (eigen techbatch):** pas na geschikte opslag-/media-audit audioformaat en ZIP-herstel toevoegen, bruikbare lokale import uit Merlin-opname. Onderzoek invoerbestanden `wav/mp3/m4a`, bestandsgrootte, duplicaten, metadata, export en herstel op tweede toestel, zonder nieuwe ongevraagde backend.

**D. Later onafhankelijk Birdspot Sound Plus (S4-kandidaat):** eigen commercieel gelicentieerde herkenning, los van de **gratis** externe Merlin-ondersteuning. Prijs en platformregels pas na eigenaarbesluit en kostenonderzoek. Deze gratis toegang via het toestel wordt niet achter Premium geplaatst.

## 6. Acceptatiecriteria / QA-bewijs

1. `+` laat in maximaal één stap de twee routes kiezen. Geen crash, geen verlies van bestaande snelhandelingen of rotte back-route.
2. **Gezien:** een vogel kan zonder Merlin volledig worden geregistreerd en verschijnt eenmaal in persoonlijke waarnemingen + privékaart, inclusief eigen datum en pin.
3. **Gehoord via Merlin:** op terugkeer zonder automatisch resultaat: kies Birdspot-soort, verifieer handmatig, `heard` met bron `merlin`, eigen pin en juiste zekerheid. Wanneer vogel écht ook gezien: `both`; alleen geluid is **niet** `seen`.
4. Werking op echte Android/iOS, inclusief PWA-installatie, appwisseling, achtergrond/heropenen, offline, niet-geïnstalleerde Merlin, weigering en herstel: allemaal onderscheiden in browser, fysiek, code en CI.
5. Bij incomplete of onzekere Merlin-suggestie geen gefingeerde soort/zekerheid; gebruiker kan terug zonder half opgeslagen waarneming of dubbele locatie/media.
6. Bestaande eigen logs, favoriete soorten, seen/heard/both, kaartpinnen, GPX/GPS waar aanwezig en ZIP blijven intact; appupdate en rollback voorkomen dataverlies.
7. Geen Merlin-resultaat-API, app-afleiding, audioherkenningsbetrouwbaarheid, auto-return of externe bronrechten claimen zonder een echte platform-/providerproef.

**Gates:** code/UX **NOT TESTED**, Android/iOS **NOT TESTED**, externe Merlin automatische terugkoppeling **NOT PROVEN**, opname-als-bijlage **NOT TESTED**. Productrichting eigenaarsbesluit 15-11-2026; start van een codebatch in afzonderlijk geautoriseerde/veilig gecontroleerde featurebranch, hoofdapp-release uitsluitend na expliciete eigenaarvrijgave.

## 7. Bronnen en kennisrelatie

- README: productcontract (aanvullen met korte verwijzing).
- Deze DRAFT: specifieke workflow/acceptatie, geen tweede Handbook of vogelfotonorm.
- `docs/roadmap/BIRDSPOT_EIGEN_FOTOS_BIJDRAGEN_BELONINGEN_MEDIA_PLUS_V0.1_DRAFT.md`: alleen kruisverwijzing, en scheiding **gratis extern Merlin** versus latere **betaalde zelfstandige Sound Plus**.
- Birdspot Roadmap v1.3 / Veldhandboek v0.6: eerdere afspraken over Merlin-bestandsdeling, locatiebeveiliging en offline-behoud blijven geldig; **niet overschrijven**.
- Current F2 foto-audit in de codeketen loopt afzonderlijk, maximaal 3 soorten per batch. Deze documentatietaak wijzigde geen waarnemingsdata, soortfoto's of appsoftware.

**Handoff:** bewaar base/head-SHA en CI-bewijs bij aparte code-PR; lees dan de nieuwste PR #236 (of opvolger), schrijf niet op de bestaande F2- of foto-inboxbranch en hertest de effectieve + handler, addSheet, pinpicker, offline/ZIP op de gecombineerde kandidaat.


## 8. Vervolgidee: Veldluistermodus met meerdere soorten (15-11-2026)

**Naast de bestaande gratis Merlin-handoff** wil de eigenaar later een eigen Birdspot-**Veldluistermodus**: bewust starten, tijdens één sessie meerdere soortsuggesties verzamelen, deze herkennen als `nog niet geregistreerd` of `al gehoord maar nog niet gezien`, en **na eigen controle** meerdere soorten in één handeling als afzonderlijke persoonlijke waarnemingen/kaartpinnen opslaan. Deze functie heeft een **afzonderlijk, juridisch getoetst herkenningsmodel** nodig; de bestaande gidsaudio en de externe Merlin-app sturen niet automatisch soortresultaten naar Birdspot.

**UI-relatie:** de eerder afgesproken **twee keuzes** direct achter de centrale + blijven de snelle hoofdroute. Een toekomstige langdurige Veldluistermodus is een onderliggende optie bij `Geluid` en wordt pas na prototype-/eigenaarreview aan het scherm toegevoegd. Scherm-uit-/achtergrondluisteren is met de huidige PWA **NOT PROVEN** en wordt niet beloofd. Verifieer modellicentie, offline prestatie, microfoonrechten, eigen privacy, batterij en fysieke Android/iOS apart.

**Uitgebreid onderzoeks- en acceptatiedossier:** [Birdspot Veldluistermodus v0.1 DRAFT](BIRDSPOT_VELDLUISTERMODUS_V0.1_DRAFT_2026-11-15.md). Gratis Merlin behouden; betaalde zelfstandige Sound Plus blijft een aparte latere kandidaat.
