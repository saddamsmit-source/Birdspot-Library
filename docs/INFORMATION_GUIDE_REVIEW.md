# Informatiegids en gedeelde waarnemingen — 2026-11-05

Status: implementatie, QA-resultaten via PR35 Actions; geen productieakkoord.
Basis: 0dbd877, main 5bf67043. Claude PR34 en kaartbestanden ongemoeid.

## Eigenaarbesluit en functiekaart
Vogellijst is informatie. Geen handmatig gezien, favoriet of invoerknoppen in soortdetail. Invoer via bestaande globale Waarnemen-knop of kaart. Favoriet in de lijst blijft een bladwijzer; selectie staat apart onder Bewaarde vogels, boven biologische filters. Bestaande bladwijzers blijven behouden.

Gidsstatus en teller lezen nu dezelfde waarnemingsrecords als kaart en overzicht. Eigen tab toont alle waarnemingen en gekoppelde foto's, plaatsnaam of coördinaten, datum, gezien/gehoord/beide en identificatiebron. Beide telt bij gezien én gehoord. Oud record zonder methode blijft onbekend. Doorklik opent de oorspronkelijke waarneming; na wijzigen/verwijderen ververst de gids. Media zonder gekoppelde waarneming wordt niet als eigen soortfoto gebruikt. Video blijft toegankelijk via het waarnemingsdetail, fotogalerij toont afbeeldingen.

## Learning en hergebruik
Probleem: handmatig gezien, automatisch gezien en echte waarnemingen waren verschillende waarheden. Oorzaak: aparte opslagkey naast de records. Fix: afgeleide gidsstatus, geen tweede schrijfpad. Oude key en onbekende recordvelden niet verwijderd of geconverteerd naar verzonnen waarnemingen. Hergebruik: catalogus/detail is een projectie van de transactierecords; bladwijzers zijn een afzonderlijke voorkeur, geen bewijs van waarneming. Aanvulling op bestaande evidence/data-integriteit-learnings, geen nieuwe parallelle algemene norm.

Tests die voorheen snelle invoer vanuit soortdetail of aparte seen-key eisten zijn gericht aangepast aan dit expliciete nieuwe eigenaarbesluit. Behoud van media, GPS, Merlin, backup/herstel en mobiele overflow-eisen blijft vereist. Integratiecontrole leest echte via formulier opgeslagen waarnemingen terug in gids en kaart. Leafletdekking en fysiek toestel afzonderlijk beoordelen; geen multi-device cloudsync gebouwd.

## Vogelbescherming als bron
Voorkeursbron voor inhoudelijke controle: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids . Leg per gecontroleerd gegeven soortpagina, datum en claim vast; deze voorkeur betekent niet dat alle huidige appteksten al opnieuw geverifieerd zijn.
Colofon https://www.vogelbescherming.nl/colofon op 2026-11-05 gecontroleerd: foto's, illustraties en bewegend beeld mogen niet worden overgenomen. Artikelen alleen met expliciete toestemming; dit omvat geen beelden. Gebruik hun foto’s dus niet zonder afzonderlijke rechten. Bestaande lokale gelicentieerde foto's blijven de afbeeldingsbron. Inhoudelijke betrouwbaarheid is geen hergebruiklicentie.
