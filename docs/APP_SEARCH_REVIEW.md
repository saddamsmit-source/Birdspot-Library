# Birdspot · app-breed zoeken

## CAP-BIRD-003 · vind functies en eigen gegevens vanaf Home

De zoekbalk staat onder logo en profiel over de beschikbare breedte, op 38 px hoogte. Hij opent een zoekscherm op volledige schermbreedte en -hoogte. Op mobiel volgt het scherm de zichtbare viewport. Het veld accepteert vrije tekst. Resultaten staan per groep en houden rekening met accenten, meerdere woorden, Nederlandse en wetenschappelijke soortnamen. Meer resultaten zijn uitklapbaar. Sluiten kan met de knop, Escape of browser-Terug. De focus keert terug naar de zoekbalk.

| Groep | Gegevens | Bestemming |
| --- | --- | --- |
| Functies | Bestaande appschermen en snelkoppelingen, inclusief kaartfilters, profiel, back-up, toevoegen, Media Studio, Journal, Inzichten en Film Studio | Scherm, formulier of bijbehorende bediening |
| Vogelsoorten | Nederlandse, Engelse en wetenschappelijke naam, familie, gebied | Soortkaart |
| Kaart en plekken | Eigen opgeslagen plekken, GPS-waarnemingen en coördinaten | Plekkaartje en kaartcentrum |
| Waarnemingen | Soort, datum, plek, notities, gedrag, habitat, weer en beschikbare herkenningsvelden | Detail van de waarneming |
| Media | Eigen bestandsnaam, gekoppelde soort, plek of waarneming, type, datum, favoriet of filmselectie | Foto, video of het gekoppelde plekbestand |

## Samenwerking en QA

Basis is concept-PR #68 op 2aeaedf6cf39e70cae769b70618a302c52b05529. De eerdere herstelbranch had al zoekrouting voor soorten en plekken voorgesteld. De nieuwe ingang hergebruikt de bestaande router, soortkaarten, plekkaarten, Media Studio en formulieren. De profielknop en Alle waarnemingen gebruiken ook de router.

Vastgelegd na de browserproef: app-brede zoekresultaten hebben een stabiele record-ID nodig voor rechtstreeks openen. Namen kunnen dubbel voorkomen. Herstel een ontbrekend of onvolledig record via de bestaande schermen. Laat een asynchroon resultaat na het sluiten van een zoekscherm geen focus of navigatie meer veranderen.

- VERIFIED in Chromium op 320 px: plaatsing en hoogte van de balk, volledig zoekscherm, lege toestand, Escape, browser-Terug, keyboard-Enter, accenten, soortkaart, plekkaartje en kaartfilters, waarnemingsdetail, foto, plekgeluid, back-upsectie en annuleren van nieuwe waarneming.
- VERIFIED: offline herladen en een soort zoeken na installatie van de appcache. Kaartachtergrond blijft afhankelijk van beschikbare kaarttegels.
- De kaartproef gebruikt een Leaflet-testdubbel. Fysieke toesteltest staat open.
- Zoeken gebeurt op het apparaat. Plaatsnamen komen uit opgeslagen plekken en waarnemingen. Mediabeelden en geluidsinhoud worden niet geanalyseerd. Ontbrekende mediaopslag geeft een melding terwijl de andere groepen doorzoekbaar blijven.
