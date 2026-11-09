# Birdspot · kleedfoto's nacontrole · groep 2 (vooronderzoek)

**Datum:** 8 november 2026 · **Status:** PARTIALLY TESTED (repositorymetadata en externe bronpagina's gecontroleerd; geen nieuwe assets geplaatst). **Basis:** PR #111 `a6e432f4a92ca6ea1679631fe98446defe7e21fd`. Voor elke volgende batch eerst `node tools/species/guide_coverage.mjs --open-photo-roles` draaien.

## Controle van drie spechten

| Soort | Bestaande registratie op PR #111 | Werkelijke ontbrekende foto-rol | Onderzoeksstatus |
|---|---|---|---|
| `sp017` Kleine Bonte Specht | Hoofdfoto man; volwassen vrouw op apart kleedbeeld en vrouw in vlucht | Juveniel | NOT TESTED · nog geen zelfstandig geverifieerde, licentiegeschikte juvenielfoto |
| `sp018` Zwarte Specht | Hoofdfoto zonder `sex`-metadata; apart geregistreerd volwassen vrouwtje en ongesekst vluchtbeeld | Mannetje en juveniel in de **gestructureerde galerij** | PARTIALLY TESTED · één sterke juvenile-kandidaat met maker en licentie gevonden; bestaande hoofdfoto nog niet als mannetje geverifieerd |
| `sp019` Groene Specht | Hoofdfoto zonder `sex`-metadata; apart geregistreerd vrouwtje en juveniel | Mannetje in de **gestructureerde galerij** | PARTIALLY TESTED · veldkenmerken dubbel bevestigd, maar mannetjesfoto nog niet geverifieerd |

### Relevante dubbelcheck op de determinatie

- **Kleine Bonte Specht:** Vogelbescherming noemt bij het volwassen mannetje een rood petje, bij het volwassen vrouwtje geen rood. Een jonge vogel mag niet op basis van alleen rood op de kruin automatisch als volwassen mannetje worden geregistreerd. [Soortgids](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-bonte-specht).
- **Zwarte Specht:** Het mannetje heeft een volledig rode kruin, het volwassen vrouwtje alleen rood achter op de kruin. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-specht) en [Natura 2000 Vlaanderen](https://www.natura2000.vlaanderen.be/soort/zwarte-specht) bevestigen onafhankelijk hetzelfde onderscheid. De bestaande bron van de hoofdfoto noemt wel de soort, **niet** het geslacht: [originele Commons-bron](https://commons.wikimedia.org/wiki/File:Dryocopus_martius,_Perersberg,_Brasov,_Romania_0_(cropped).jpg). De eerdere gesprekssamenvatting dat het hoofdbeeld een mannetje is, is daarom nog **niet voldoende registratiebewijs**.
- **Groene Specht:** het mannetje toont rood in de baardstreep, het volwassen vrouwtje een volledig zwarte baardstreep; onvolwassen vogels zijn sterker gevlekt. Onafhankelijke soortreferenties: [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groene-specht), [Naturalis](https://bioportal.naturalis.nl/taxon/Picus_viridis?language=nl). De huidige hoofdfoto [Commons](https://commons.wikimedia.org/wiki/File:Green_woodpecker_Franconville_2022_01_21_2.jpg) heeft geen expliciet geslachtslabel in Birdspot.

## Eerste licentiegeschikte kandidaat voor ontbrekend juveniel

**Zwarte Specht `sp018`, juveniel — kandidaat, nog NIET toegevoegd:**

- [Wikimedia Commons: Zwarte specht - black woodpecker - Dryocopus martius.jpg](https://commons.wikimedia.org/wiki/File:Zwarte_specht_-_black_woodpecker_-_Dryocopus_martius.jpg)
- Fotograaf: **Bouke ten Cate** · **CC BY 4.0** · oorspronkelijke opname: 28 juni 2017 · locatiebeschrijving Noorwegen.
- De auteur omschrijft het beeld expliciet als een **juveniele Zwarte Specht in een nestholte**. Soort, leeftijdsrol en licentie staan op de bronpagina; de combinatie is geschikt voor nadere beeldreview.
- **Nog uit te voeren:** originele opname zelf visueel op relevante kenmerken en bruikbare uitsnede controleren, copyrightinformatie vastleggen, eventuele GPS/EXIF-velden verwijderen, geen herkenbare nestlocatie in bijschrift of gedeelde metadata zetten, geschikte resolutie/WebP maken, bestand offline testen en alle creditvelden vullen. De huidige gepubliceerde app blijft ongewijzigd.

Een tweede kandidaat voor juveniele Zwarte Specht is [Dryocopus martius 03.jpg](https://commons.wikimedia.org/wiki/File:Dryocopus_martius_03.jpg) (Philippe Kurlapski, licentie volgens pagina CC BY 1.0), maar dit is voornamelijk een **kopdetail**; daarom als leeftijdsbijlage eventueel nuttig, niet automatisch als beste gidsbeeld.

## Niet doen zonder bewijs

1. Geen ongesekste hoofdfoto enkel op basis van een rode kruin automatisch naar man/vrouw verplaatsen zonder **exacte foto** visueel te controleren.
2. Geen jonge vogel verwarren met een volwassen man of vrouw; bij onzekerheid algemene rubriek gebruiken of status open laten.
3. Geen fotobron uit andere apps of websites kopiëren zonder geldige hergebruiklicentie.
4. Geen nestlocatie of originele GPS-metadata in gidsassets of toekomstige community delen.
5. Geen productie- of Vercel-preview starten om één foto te bekijken.

**Vervolg na deze preflight:** voltooi de drie soorten in afzonderlijke fotobatches zodra individuele beeldbron, licentie en bestandskwaliteit daadwerkelijk bevestigd zijn. Tot die tijd blijft de stand **25/134 compleet, 109/134 deels open**: dit vooronderzoek verandert geen dekkingsteller.

## Uitgevoerde role-review (9 november 2026)

**Nieuwe opvolgbranch:** `feat/guide-photo-review-02-verified-roles` boven op PR #112. De daadwerkelijke bestaande lokale WebP's voor Zwarte Specht en Groene Specht zijn visueel geopend. Het mannetjeskenmerk wordt onafhankelijk onderbouwd via Vogelbescherming; bij Groene Specht staat bovendien dezelfde Wikimedia-fotopagina onder `Picus viridis (male)`. `sex=male` is toegevoegd aan de bestaande foto-registratie, zonder nieuwe media of nieuwe Vercel-deployment. Bron- en licentievelden blijven behouden.

**Nog open:** juveniel Zwarte Specht, juveniel Kleine Bonte Specht en andere ontbrekende rubrieken. Het eerder genoemde juveniele nestbeeld (Bouke ten Cate, CC BY 4.0) blijft kandidaat: niet lokaal verwerkt, niet door CI op beeldkwaliteit getest, nestlocatie strikt vertrouwelijk behandelen. Zie [gidsfoto-audit](GUIDE_EXISTING_PHOTO_AUDIT.md) voor gecontroleerde kenmerken, bronverwijzingen en bewijsgrenzen.

### Definitieve dekkingscontrole (GitHub Actions, 9 november 2026)

De geautomatiseerde `node tools/species/guide_coverage.mjs --summary` rapporteert op `3c984e47` nog **25/134** soorten met alle drie de rubrieken; dus **109/134** blijven deels open. De Groene Specht werd vóór deze review al meegeteld door het bestaande `adult_m.reuseGuidePhoto`-pad. Deze ronde bevestigt de sekse van dat reeds getoonde beeld, maar voegt geen nieuwe lokale foto toe en wijzigt de teller terecht niet. De controles van de foto- en geluidsassets, mediaregister, viewer en de op deze branch beschikbare browserproeven zijn via GitHub CI geslaagd.
