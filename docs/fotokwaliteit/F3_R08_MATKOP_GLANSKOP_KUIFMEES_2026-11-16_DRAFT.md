# Birdspot F3-R08 — Matkop, Glanskop en Kuifmees

**Datum:** 16 november 2026  
**Status:** DRAFT / PARTIALLY TESTED — eerste F3-inhoudsinspectie, **geen** foto-, geluid-, toestel- of release-PASS  
**Basis:** Birdspot 1.27.21 hotspot-/audiofix PR #261, `98825ddc12fa7343858f06584822001c7b4365fc`; aparte writerbranch `qa/birdspot-f3-r08-matkop-glanskop-kuifmees-20261116`.  
**Scope:** uitsluitend de drie bestaande gefotografeerde soorten: `sp031`, `sp032`, `sp033`. Geen andere soorten, productiedata, cache of gidsmedia gewijzigd.

## Wat in deze ronde werkelijk is geïnspecteerd

De tien **daadwerkelijk aanwezige lokale WebP-gidsbeelden** van deze drie soorten zijn afzonderlijk geopend en visueel beoordeeld: Matkop 3, Glanskop 3, Kuifmees 4. De hoofdfoto's en overige kleed-/posebeelden zijn scherp of bruikbaar voor het genoemde doel waar vermeld, maar een lokaal bestand visueel bekijken **vervangt niet** het vergelijken met de exacte oorspronkelijke JPEG/PNG, de individuele rechtencontrole of onafhankelijke determinatie.

Per soort zijn de huidige veldtekst, afbeeldingstoewijzingen, labels en bronnenmetadata in de repository gelezen. De primaire soortbeschrijvingen van Vogelbescherming en het vergelijkingsartikel Matkop/Glanskop zijn geraadpleegd, maar de fysieke ANWB-vogelgids, originele opnamesignalen, individuele bronfoto's van alle tien afbeeldingen, Sovon-actualisering en eBird-seasonmaps zijn **niet** onafhankelijk herbeoordeeld. Vorige F1/F2-bewijzen blijven geldig uitsluitend binnen hun bestaande scope; geen vroegere resultaten overschrijven.

| Soort | Bestaand beeld en zichtbare kenmerken | Audio aanwezig | Gerichte F3-uitkomst |
|---|---|---|---|
| **Matkop — sp031** (*Poecile montanus*) | Hoofdfoto toont zwart ogende kap, witte wang en lichter vleugelveld op tak. Juvenielenbeeld toont lichte snavelhoeken, niet genoeg om zonder originele bron leeftijd en soort zelfstandig te certificeren. Het apart geregistreerde `sp031-flight.webp` toont een vogel boven sneeuw met gespreide vleugel en uitgestoken poten; **behoud onder ‘Overige herkenningsfoto's’**, nooit zonder vliegstatusbron naar ‘In vlucht’ promoveren. | Eén bestaande **zang** `sp031-song.mp3`; **contactroep ontbreekt** | **PARTIALLY TESTED**. Directe visuele vergelijking op oorspronkelijke foto ontbreekt; hoofdbronidentiteit behoeft kritische onafhankelijke bevestiging wegens verwarringsgevaar met Glanskop. |
| **Glanskop — sp032** (*Poecile palustris*) | Hoofdfoto op stam met vrij egale gevouwen vleugel, zwarte kap en kleine keelvlek. Het bestaande juvenielenbeeld toont lichtere snavelhoeken maar is donker en subtiele determinatiekenmerken zijn slecht zichtbaar: **kwaliteitsverbetering wenselijk**, geen eigen foto zomaar herlabelen. Overig beeld `sp032-view.webp` toont de vogel klein en frontaal: te weinig snaveldetail voor zekere Matkop/Glanskop-determinatie. | Eén bestaande **zang** `sp032-song.mp3`; **contactroep ontbreekt** | **PARTIALLY TESTED**. Tweede onafhankelijke audit van soort/juvenielenstatus, bronrechten en grotere foto van bovensnavelbasis open. |
| **Kuifmees — sp033** (*Lophophanes cristatus*) | Hoofdfoto scherp, spitse zwart-witte kuif en wangboog duidelijk. Juvenielenbeeld toont korte onregelmatige kuif en gele snavelhoeken, maar originele leeftijdsaanduiding moet nog naast bron worden bewezen. Overig zijaanzicht `sp033-view.webp` bruikbaar. `sp033-flight.webp` oogt als **opvliegen nabij sneeuw**, niet aangetoonde vrije vlucht: behoud als overig posebeeld, niet relabelen als echte vluchtfoto. | Eén bestaande **zang** `sp033-song.mp3`; **roep ontbreekt** | **PARTIALLY TESTED**. Originele bestanden, leeftijdsrollen en audio-authenticiteit blijven open. |

## Determinatiecontract Matkop versus Glanskop

Vogelbescherming noemt de contactroep als belangrijke veldhulp, met aanvullende visuele kenmerken. **Geen enkel silhouet, kopglans of donker petje op zichzelf is betrouwbaar genoeg**:

- **Matkop:** vaak een lichtere baan langs gevouwen armpennen, doorgaans donker aan de bovensnavelbasis, langdurige nasale contactroep. Variatie in vleugelveren en slijtage.
- **Glanskop:** vaak een lichte vlek aan de basis van de bovensnavel, meestal egalere vleugel, explosieve dalende roep. Licht en invalshoek kunnen een vlek of contrast beïnvloeden.
- **Jonge vogels:** doffe kap en lichte snavelhoeken kunnen bij beide voorkomen. De aanwezige `GUIDE_COMPARISONS` voor volwassen en juveniel mag gebruikers niet dwingen op een enkel visueel kenmerk te besluiten.
- **Kuifmees:** duidelijk zwart-witte puntkuif, zwart gebogen wangstreek/keel en scherpe bibberende roep; mannetje en vrouwtje niet automatisch afzonderlijk labelen zonder sluitend seksedeterminatiebewijs.

Voor de gewone UI zijn de identificatieclaims al voorzichtig en de twee Matkop/Glanskop-tabbladen bestaan. Deze ronde introduceert **geen niet-geverifieerde nieuwe afbeelding of roep** en verandert niet op eigen gezag de vastgestelde gidsnorm.

## Huidige bronverwijzingen (claim versus hergebruikrecht gescheiden)

1. Vogelbescherming Matkop — https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/matkop — verwarring met Glanskop, vleugelveld, roep.
2. Vogelbescherming Glanskop — https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/glanskop — witte snavelbasis, vleugel, geluid.
3. Vogelbescherming Kuifmees — https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kuifmees — kuif, wang, roep.
4. Vogelbescherming vergelijkingsartikel — https://www.vogelbescherming.nl/actueel/bericht/matkop-vs-glanskop-en-vv — kenmerkoverlap en context.
5. Bestaande originele fotoregistratie: `src/features/species/guidePhotos.js`, `assets/species/field-guide-media.json`; eerdere licenties en maker-ID's behouden.
6. Bestaande audioregistratie: `assets/species/field-guide-media.json`, bestaande nummers `sp031-song.mp3`, `sp032-song.mp3`, `sp033-song.mp3`. De bestandsnaam/zangtype is metadata, niet automatisch bewezen roep of onafhankelijke auditieve determinatie.
7. ANWB-vogelgids: bronpassage **niet ingezien**; niet als onafhankelijk gelezen bron meetellen.

## Openstaande foto-/geluidswerkzaamheden

1. Originele tien foto-URLs openen en elke foto **visueel met de origineel-foto vergelijken**: soort, werkelijke houding, echte jonge vogel, rechten, maker, exacte licentie, toegebrachte wijzigingen, werkelijke bronbytes. Controleer extra kritisch Matkop/Glanskop. Het feit dat een afbeelding in de app staat is geen nieuw F3-bewijs.
2. **Matkop contactroep, Glanskop contactroep en Kuifmees roep** als zelfstandige mediakandidaten vinden; luister volledige originele opnamen, check zang/roep, locatie/ondersoort, licentie en commercial/offline-rechten. Alleen daarna oorspronkelijke audio overnemen, omzetten, vergelijken en bronmetadata vastleggen. Niet automatisch uit huidig zangfragment dezelfde roep afleiden.
3. Bij Glanskop een betere detailfoto van kop/snavelbasis zoeken; voer geslacht/leeftijd op geen van beide mezen aan als een visueel onbewijsbaar onderscheid.
4. Test vergelijkingspanelen op 320/360/390 px: beide echte afbeeldingen naast elkaar, toegankelijk ⓘ, correct tabblad volwassenen/juveniel, uitzoom/zoom, terugnavigatie, offline cached media en in beide richtingen. Daarna een onafhankelijke ornithologische tweede review plus fysiek toestel.
5. Sovon Nederland per soort, datum/venster en eBird-seizoensbias later per soort bevestigen; de huidige statistiek niet zonder herlezing als F3-VERIFIED aanduiden.

## F3-telling en gescheiden bewijs

De drie kaarten zijn **inhoudelijk bekeken maar niet volledig afgetekend**. Verwachte telling na deze batch: **24/140 eerste F3-inhoudsinspectie, 116 nog te starten, 0 volledige F3-PASS**. Bewaak de canonieke oude fotostatus en eerdere F1/F2-bronregistraties; nieuw F3-bewijs vervangt die niet. Nieuwe statussen alleen `PARTIALLY TESTED` voor werkelijk bekeken data, `NOT TESTED` voor origineel/licenties/audio/device. Geen publicatieclaim.

**Herstel:** sluit de afzonderlijke F3-R08 PR zonder publicatie; de ongewijzigde vorige fix `98825ddc` en publieke `preview/birdspot-review` `21ce9060` blijven beschikbaar.  
**Volgende batch:** F3-R09, maximaal drie soorten volgens de actuele vaste F3-volgorde; geen sprongen op basis van een willekeurige chatlijst.
