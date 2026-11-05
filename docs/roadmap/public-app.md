# Birdspot — openbare app en vervolgstappen

Status: voorstel / gedeeltelijk voorbereid, 2026-11-05. Eigenaar vraagt gefaseerde uitvoering en preview na iedere wijziging. Kaart blijft bij Claude (PR #34). Basis: main 5bf67043.

## Geleverde wijziging
CAP-BIRD-007: alleen videofilter verlaagd van brightness(.76) naar brightness(.62). Tekst en kaarten blijven op eigen lagen. Geen nieuw Artlist-bestand of credits nodig. Motivatie: achtergrond te dominant volgens eigenaar. Hergebruik: dim het media-element, niet de complete container met bediening. Bronvideo blijft extern; dit maakt video niet offline.

## Geplande functies (nog niet gebouwd)
1. CAP-BIRD-045: eigen waarneming publiceren naar waarneming.nl. Officiële API-documentatie https://waarneming.nl/api/docs/ gaf bij deze controle 403; contract en clienttoegang niet geverifieerd. PR #34 beschrijft benodigde goedkeuring. Communityclient is geen toestemming of officieel contract. Eerst toegang, auth-flow/scopes en testomgeving bevestigen. Daarna soort-ID-mapping, expliciete verzendactie, media, validatie, retry zonder duplicaten, ontvangst-ID/link, ontkoppelen. Geen wachtwoorden of client secrets in frontend. Offline lokaal bewaren, later expliciet verzenden. CSV is geen bewezen importintegratie.
2. Bijzondere externe waarnemingen: apart onderzoek naar toegestane actuele feed en gebruiksrechten. Configureer gebied/afstand, soorten/zeldzaamheid, stille uren, aan/uit. Achtergronddienst, deduplicatie en notificatie-abonnementen nodig. Respecteer vervaagde/afgeschermde locaties. Geen push beloofd zolang bron en bezorging niet end-to-end getest zijn.
3. Profiel wordt Instellingen & hulp: bestaande backup/herstel behouden; feedbackformulier met categorie (informatie/foto/idee/bug), soort of scherm, omschrijving, optionele afbeelding en contact. Duidelijke ontvangstbevestiging en fout/herstelpad. Persoonlijke waarnemingen en GPS niet automatisch meesturen. Backend en bestemming nog te kiezen; geen succesmelding zonder opgeslagen melding.
4. Beheer: beveiligde eigenaarrol met server-side autorisatie; feedbackinbox (nieuw/in behandeling/opgelost), soorteninformatie en foto's bewerken, concept/preview/publiceren, versiehistorie en herstel. Gewone gebruikers kunnen feedback sturen, niet de centrale catalogus overschrijven. Huidige lokale opslag is geen multi-user backend. Privé waarnemingen blijven gescheiden van publieke soortinformatie.
5. Foto's: echte lokale WebP-assets met stabiele soort-ID, credits en licentieregister. Huidige showcase heeft al 50 lokale foto's en credits.json, maar dit dekt nog niet elke vogel in de gids. Begin met tuin-/zangvogels, vervolgens watervogels, roofvogels, overige groepen. Per batch manifest van soorten, ontbrekende beelden, bron/licentie, gecontroleerde identificatie, uitsnede, bestandsgrootte en offlinegedrag. Hergebruik geschikte bestaande assets; behoud persoonlijke foto's. Bronlink voor naamsvermelding is toegestaan; beeld laden blijft lokaal. Geen willekeurige foto's van waarneming.nl overnemen.
6. Distributie: eerst publieke webapp stabiel; daarna aparte App Store-trajectkeuze en actuele platformeisen toetsen. PWA is niet automatisch een App Store-app. Auth, privacy, dataverwijdering, mediaopslag, support en updates vooraf ontwerpen.

## Volgorde en oplevering
Video-preview → fotobatch met soortlijst → profiel/feedback en backendkeuze → eigenaarbeheer → waarneming.nl zodra toegang bevestigd → optionele push → distributie. Iedere fase eigen branch/PR, preview, bewijsstatus en beperkingen. Geen merge/live zonder eigenaarbesluit. Geen wijzigingen aan Claude's kaartbranch.

## Bewijsgrenzen
CSS-diff gecontroleerd; browsercontrole en CI worden in de PR vastgelegd. Document is geen app-PASS. Toesteltest blijft bij eigenaar. Overige genoemde functies zijn gepland, geen gebouwde capabilities.
