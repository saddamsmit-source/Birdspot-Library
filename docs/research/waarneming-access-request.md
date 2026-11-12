# Waarneming.nl — toegang aanvragen (05-11-2026)

Status: onderzoek gedeeltelijk bevestigd; koppeling en push uitgesteld op verzoek eigenaar. Geen aanvraag verzonden.

De officiële contactpagina van Observation International bevestigt info@observation.org als contact voor platform-, app- en techniekvragen: https://observation-international.org/nl/contact/ . Dit is de verifieerbare aanvraagroute; een zelfbedieningsregistratie voor API-clients is hier niet vastgesteld.

https://waarneming.nl/api/docs/ was bij controle ontoegankelijk (403). De oudere onderzoeksnotitie in Claude's PR #34 stelt dat alleen goedgekeurde applicaties toegang krijgen. De actuele voorwaarden, verplichte accountregistratie, scopes en ondersteunde OAuth-flow zijn daarom nog te bevestigen door de aanbieder. Een normaal waarnemersaccount niet gelijkstellen aan goedgekeurde app-toegang. Geen PKCE, tarieven of toegang tot bijzondere waarnemingen als bevestigd claimen.

## Conceptbericht — zelf te verzenden
Aan: info@observation.org
Onderwerp: Aanvraag API-toegang voor Birdspot Library / Waarneming.nl

Beste team,

Ik ontwikkel Birdspot Library, een vogelgids en app voor eigen vogelwaarnemingen. De app is nu in ontwikkeling voor persoonlijk gebruik; mogelijk volgt later een openbare web- en mobiele app.

Ik wil gebruikers na hun uitdrukkelijke toestemming hun eigen waarnemingen vanuit Birdspot laten indienen bij hun eigen Waarneming.nl-account, inclusief soort, datum/tijd, aantal, locatie/nauwkeurigheid, notitie en optioneel eigen beeld of geluid.

Kunt u aangeven of dit is toegestaan en hoe ik een applicatie kan aanmelden? Welke accountregistratie, voorwaarden, kosten en goedkeuring zijn vereist? Graag ontvang ik informatie over een testomgeving, clientregistratie, actuele documentatie, ondersteunde OAuth-flow (inclusief eventuele PKCE-ondersteuning), scopes, mediabeperkingen en verzoeklimieten. Ook hoor ik graag hoe dubbele inzendingen voorkomen moeten worden en hoe de gebruiker toegang kan intrekken.

Op langere termijn overweeg ik optionele meldingen van bijzondere waarnemingen in een gekozen gebied. Is hiervoor een afzonderlijk toegestane feed/API beschikbaar, met welke voorwaarden en bescherming van gevoelige locaties? Deze functie bouwen we nu nog niet.

Met vriendelijke groet,
[Naam en eventueel Waarneming.nl-gebruikersnaam]

## Na antwoord
Leg schriftelijke toestemming, toepasselijke voorwaarden, testtoegang en toegestane use-cases vast. Geheimen alleen via geschikte beveiligde configuratie. Eerst testomgeving, daarna pas productiekoppeling na expliciet eigenaarbesluit. Tot die tijd geen publicatieknop die succesvolle verzending suggereert.
