# Informatiegids en gedeelde waarnemingen — 2026-11-05

Status: implementatie, QA-resultaten via PR35 Actions; geen productieakkoord.
Basis: 0dbd877, main 5bf67043. Claude PR34 en kaartbestanden ongemoeid.

## Eigenaarbesluit en functiekaart
Vogellijst is informatie. Geen handmatig gezien, favoriet of invoerknoppen in soortdetail. Invoer via bestaande globale Waarnemen-knop of kaart. Favoriet in de lijst blijft een bladwijzer; selectie staat apart onder Bewaarde vogels, boven biologische filters. Bestaande bladwijzers blijven behouden.

Gidsstatus en teller lezen nu dezelfde waarnemingsrecords als kaart en overzicht. Eigen tab toont alle waarnemingen en gekoppelde foto's, plaatsnaam of coördinaten, datum, gezien/gehoord/beide en identificatiebron. Beide telt bij gezien én gehoord. Oud record zonder methode blijft onbekend. Doorklik opent de oorspronkelijke waarneming; na wijzigen/verwijderen ververst de gids. Media zonder gekoppelde waarneming wordt niet als eigen soortfoto gebruikt. Video blijft toegankelijk via het waarnemingsdetail, fotogalerij toont afbeeldingen.

## Learning en hergebruik
Probleem: handmatig gezien, automatisch gezien en echte waarnemingen waren verschillende waarheden. Oorzaak: aparte opslagkey naast de records. Fix: afgeleide gidsstatus, geen tweede schrijfpad. Oude key en onbekende recordvelden niet verwijderd of geconverteerd naar verzonnen waarnemingen. Hergebruik: catalogus/detail is een projectie van de transactierecords; bladwijzers zijn een afzonderlijke voorkeur, geen bewijs van waarneming. Aanvulling op L-039 (vaste versus gebruikersdata), L-040 (afgeleide data), L-073 (referenties/media), L-076 (lifecycle) en L-077 (bewijsniveaus), geen nieuwe parallelle algemene norm.

Tests die voorheen snelle invoer vanuit soortdetail of aparte seen-key eisten zijn gericht aangepast aan dit expliciete nieuwe eigenaarbesluit. Behoud van media, GPS, Merlin, backup/herstel en mobiele overflow-eisen blijft vereist. Integratiecontrole leest echte via formulier opgeslagen waarnemingen terug in gids en kaart. Leafletdekking en fysiek toestel afzonderlijk beoordelen; geen multi-device cloudsync gebouwd.

## Vogelbescherming als bron
Voorkeursbron voor inhoudelijke controle: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids . Leg per gecontroleerd gegeven soortpagina, datum en claim vast; deze voorkeur betekent niet dat alle huidige appteksten al opnieuw geverifieerd zijn.
Colofon https://www.vogelbescherming.nl/colofon op 2026-11-05 gecontroleerd: foto's, illustraties en bewegend beeld mogen niet worden overgenomen. Artikelen alleen met expliciete toestemming; dit omvat geen beelden. Gebruik hun foto’s dus niet zonder afzonderlijke rechten. Bestaande lokale gelicentieerde foto's blijven de afbeeldingsbron. Inhoudelijke betrouwbaarheid is geen hergebruiklicentie.

## Catalogusdelta voor eerstvolgende gecontroleerde release
- CAP-BIRD-009–012: informatielijst/detail en filters behouden; waarnemingen zijn nu bron van status/teller, methode en locaties.
- CAP-BIRD-013: gezien-toggle verwijderd; lijstbladwijzer en aparte bewaarsectie blijven, detailfavoriet verwijderd.
- CAP-BIRD-014: vier soortdetail-invoersnelkoppelingen ingetrokken op eigenaarverzoek; centrale invoer CAP-BIRD-017 en kaart blijven.
- CAP-BIRD-015/020: gekoppelde foto's en originele waarneming openen; herladen na edit/delete.
Deze delta staat in de repository; centrale projectdocumenten en projectinstellingen zijn hiermee niet automatisch gesynchroniseerd.

## QA-bewijs informatiewijziging
3355400: gerichte CI Mobile Editorial, Observation Evidence & Pins (inclusief nieuwe gidsasserties, foto/video en ZIP-herstel), guide photos en bestaande afzonderlijke maptests geslaagd. Browser op 390 px: handmatig Houtduif gehoord ingevoerd via Waarnemen, daarna gids Gezien 0 / Gehoord 1 met dezelfde locatie. Species-data-suite vond achtergebleven tellertekstverwachting ‘soorten gezien’; testtekst volgt expliciet gewijzigd productcontract ‘waargenomen’. Volledige suite opnieuw controleren op definitieve commit. Geen fysiek toestel of onafhankelijke reviewer.
