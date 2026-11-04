# Birdspot — persoonlijke kaartpins, gehoord/gezien en Merlin Sound ID

Status: REVIEW. Losse featurebranch `feat/manual-bird-pins-merlin-sound-observations`, gebaseerd op de gemergede Fase 3 `36087bb8`. Fase 4 Film Studio PR #11 is hiervan gescheiden en is niet gemerged.

## Eigenaarbesluit
- Iedere waarneming is een afzonderlijk record met eigen ID, datum, locatie, optionele coördinaten, foto's/video's en notities.
- Locatie kan via GPS, handmatig door op de kaart te tikken, of offline door coördinaten in te vullen. Alleen een plaatsnaam is ook toegestaan.
- Waarnemingswijze: Gezien / Gehoord / Gezien en gehoord.
- Herkenningsbron: Eigen herkenning / Merlin Sound ID. Merlin-suggesties kunnen apart als nog niet zelf geverifieerd of zelf gecontroleerd worden gemarkeerd.
- Bij een nog niet gecontroleerde Merlin-suggestie is de status 'Zeker' niet toegestaan. Wisselen naar Merlin zet 'Zeker' standaard naar 'Mogelijk', maar gebruikers kunnen ook 'Waarschijnlijk' kiezen.
- Het is géén realtime Merlin-integratie, automatische transcriptie of soortidentificatie. De gebruiker legt vast wat Merlin suggereerde.
- Bestaande waarnemingen krijgen niet stilzwijgend het label 'Gezien': ontbrekende bron-/waarnemingsvelden blijven onbekend.

## Technische implementatie
- Nieuwe velden zijn additief in bestaande sightings-JSON: `observationMethod`, `identificationSource`, `merlinVerification`.
- Geen IndexedDB schemawijziging. Bestaande image/video-media blijft gekoppeld via `photoIds` per sighting. Details ondersteunen ook oudere photoIds zonder sighting-index.
- Map markeert gehoorde observaties met een muzieknoot. Gebruiker kan via de Explorer Map expliciet 'Pin waarneming' starten; normaal tikken op de kaart maakt niets aan.
- Via het formulier is de pinpicker beschikbaar; bij ontbrekende externe Leaflet-laag werken numerieke coördinaten nog.
- Gehoorde waarnemingen markeren de vogelsoort niet automatisch als visueel gezien. Meerdere visuele waarnemingen wisselen de 'Gezien'-status niet meer uit.
- ZIP-back-up herstelt nu ook SVG/WebM/MOV en toont opslagfouten i.p.v. mediafouten stil te verbergen.

## Merlin-betrouwbaarheid
Merlin Sound ID geeft suggesties die onafhankelijk gecontroleerd moeten worden. Birdspot registreert die suggesties als persoonlijke waarneming en claimt geen wetenschappelijke of eBird-verificatie.
Bronnen: https://ebird.freshdesk.com/en/support/solutions/articles/48001214056-merlin-sound-id-best-practices en https://support.ebird.org/en/support/solutions/articles/48001185783.

## Regressies / grenzen
- Testen: gehoorde Merlin-suggestie zonder beeld, twee afzonderlijke handmatige locaties Brabant/Limburg, echte synthetische foto/video, ZIP-export plus teruglezen, legacy record, 'Gezien'-status, kaartweergave.
- Bestaande Signature QA fase 1–3 moet opnieuw PASS blijven.
- Kaarttegels blijven online afhankelijk van extern CDN; handmatige coördinaten blijven bij offline gebruik mogelijk.
- Niet rechtstreeks aan een eBird-account of Merlin Sound ID Sessions gekoppeld.
- Privacy: coördinaten in lokale app; geen nieuwe publicatie of tracking.
- Geen merge of publicatie zonder expliciet Project Owner-akkoord.
