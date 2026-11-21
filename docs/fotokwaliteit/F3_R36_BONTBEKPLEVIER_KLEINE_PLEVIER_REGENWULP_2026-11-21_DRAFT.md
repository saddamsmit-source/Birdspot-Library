# Birdspot F3-R36 · Bontbekplevier, Kleine Plevier en Regenwulp

**DRAFT · PARTIALLY TESTED · 21 november 2026 · [PR #334](https://github.com/saddamsmit-source/Birdspot-Library/pull/334).** Basis: R35 [#333](https://github.com/saddamsmit-source/Birdspot-Library/pull/333) op `4d928184fcdc22a10fa541a5700caa2b73c5e6cd`. Nieuwe inhoudscontrole: **108/140 bekeken, 32 te starten, 0 FULL PASS**. Dit is een bron-/registratiereview, geen onafhankelijke foto-, audio-, runtime- of releasetest.

## Identiteit en herkenning

| Soort | Onderbouwde veldherkenning | Bewijsgrens en open punt |
|---|---|---|
| Bontbekplevier `sp146` · *Charadrius hiaticula* | Oranje snavelbasis en poten in broedkleed, donkere borstband en witte vleugelstreep in vlucht. Naast Kleine Plevier eerst oogring, snavel en vleugel bekijken; naast Strandplevier ook borstband en poten. | Seizoens- en leeftijdsvariatie kan de snavel- en pootkleur dempen. Hoofdfoto, winter, juveniel en vrije vlucht zijn geregistreerd maar originele individuele fotoidentiteit en rechten opnieuw controleren. |
| Kleine Plevier `sp147` · *Charadrius dubius* | Gele oogring, vrijwel geheel donkere snavel, vleeskleurige poten; geen opvallende witte vleugelstreep. Met Strandplevier ook de volledige versus onderbroken borstband vergelijken. | De oogring van juvenielen en in weinig licht kan weinig opvallen. Hoofdbeeld, winter, juveniel en vlucht in de manifesten, maar precieze leeftijd/kleed en primaire rechten blijven open. |
| Regenwulp `sp148` · *Numenius phaeopus* | Donkere kruinbanden gescheiden door een lichte middenkruinstreep, kortere gebogen snavel dan Wulp, kenmerkende triller. Lichte Wulp-ondervleugel en jonge Wulp met relatief korte snavel zijn relevant voor verwarring. | **Eén hoofdfoto bestaat daadwerkelijk** in `guidePhotos.js` (eerdere F3-historische rij meldde 0 audited assets). Geen extra kleed-/vluchtbeeld en geen lokale gidsaudio. Aanduidingen voor jeugd/geslacht zijn tekst, niet met een fotopaar bewezen. |

De Bontbekplevier-registratie in `species.js` noemt `zomergast` en `mrt-okt`. **Inhoudelijke discrepantie:** zowel [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bontbekplevier) als [Sovon](https://stats.sovon.nl/stats/soort/4700) melden waarnemingen gedurende het hele jaar, schaars in de winter. De bestaande appfilters zijn **niet stilzwijgend veranderd** omdat 'Beste maanden', seizoensfilter en categorietaxonomie apart moeten worden beoordeeld; noteer gericht vervolg.

[Herkenningsartikel drie plevieren](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-kleine-plevier-vs-bontbekplevier-vs-strandplevier) · [Kleine Plevier](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-plevier) · [Regenwulp](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/regenwulp) · [Wulp](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wulp).

## Individuele fotoherkomst uit de bestaande Birdspot-registratie

**Bewijslaag: bronmetadata, NIET onafhankelijke oorspronkelijke foto-/rechtenaftekening.** Alle fotoverwijzingen in de onderstaande tabel zijn uit `src/features/species/guidePhotos.js` en `assets/species/field-guide-media.json` overgenomen. Een niet-openend brondossier wordt niet tot media-PASS gepromoveerd.

| Soort/rol · lokaal bestand | Originele registratie | Geregistreerde maker · licentie |
|---|---|---|
| sp146 · Hoofd · `sp146.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Common_ringed_plover_(Charadrius_hiaticula)_Oppdal.jpg) | Charles J. Sharp · CC BY-SA 4.0 |
| sp146 · Winter · `sp146-winter.webp` | [iNaturalist](https://www.inaturalist.org/photos/460492953) | Paulo Caseirito · CC0 |
| sp146 · Juveniel · `sp146-juv.webp` | [iNaturalist](https://www.inaturalist.org/photos/733881501) | Stephen M. · CC BY-SA 4.0 |
| sp146 · Vlucht · `sp146-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Charadrius_hiaticula_Lvk.jpg) | Arnstein Rønning · CC BY-SA 4.0 |
| sp147 · Hoofd · `sp147.webp` | [iNaturalist](https://www.inaturalist.org/photos/680750765) | Donsky · CC BY 4.0 |
| sp147 · Winter · `sp147-winter.webp` | [iNaturalist](https://www.inaturalist.org/photos/94775001) | Karim Haddad · CC BY 4.0 |
| sp147 · Juveniel · `sp147-juv.webp` | [iNaturalist](https://www.inaturalist.org/photos/350059610) | Anthony McDonald · CC BY 4.0 |
| sp147 · Vlucht · `sp147-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:The_Little_ringed_plover_in_flight.jpg) | Prasan Shrestha · CC BY-SA 4.0 |
| sp148 · Hoofd · `sp148.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Whimbrel_%28Numenius_phaeopus%29_Dalvikurbyggd.jpg) | Charles J. Sharp · CC BY-SA 4.0 |

Voor sp146/sp147 zijn de rollen grotendeels afkomstig van de oude `small-plovers`-registratie (6 november) en het eerdere vluchtbeeld-oordeel (10 november). Deze oudere status vervangt geen visuele herbeoordeling op R36 of echte oorspronkelijke bronbestandsvergelijking. De Regenwulp-hoofdfoto staat wel in de appmetadata ondanks een lege historische `currentAssets`-rij. Het huidige vergelijkingsscherm bevat in beide richtingen Bontbekplevier–Kleine Plevier (broedkleed/juveniel), plevieren–Strandplevier en Wulp–Regenwulp. Onafhankelijk fotopaarbewijs blijft open.

## Audio · bronregistratie, geen luister-PASS

| Soort | Lokaal bestand en bron | Bestaande maker/licentie | Status |
|---|---|---|---|
| sp146 | `sp146-night-flight-call.mp3` · [XC1178346](https://xeno-canto.org/1178346) | Lionel Triboulin · CC0 | herkomst, transcript/rol, volledige decode en rechten onafhankelijk NOT TESTED |
| sp146 | `sp146-call-song.mp3` · [XC897533](https://xeno-canto.org/897533) | Jochem verweij · CC BY-SA 4.0 | zelfde open |
| sp147 | `sp147-flight-call.mp3` · [XC1143443](https://xeno-canto.org/1143443) | Tanguy Loïs · CC BY-SA 4.0 | zelfde open |
| sp147 | `sp147-flight-song.mp3` · [XC1107841](https://xeno-canto.org/1107841) | Sébastien Provost / Sonothèque ADVL · CC0 | zelfde open |
| sp148 | **geen lokale gidsopname** | — | ontbrekende rol/geluidsbron BLOCKED |

De vier Xeno-canto-bronpagina's konden bij deze ronde niet worden uitgelezen; daarom uitsluitend de eigen geregistreerde rol-/licentiemetadata vergelijken, **geen** primaire audio-licentie of volledige PCM-match claimen. De bestaande audiotests en eigen afspeelroute blijven afzonderlijke technische bewijsstukken.

## Nederlandse context en uitgestelde controles

- [Sovon Bontbekplevier](https://stats.sovon.nl/stats/soort/4700): zeldzame broedvogel; winterse aantallen schaars maar aantoonbaar. Roep- en fotoverificatie noodzakelijk.
- [Sovon Kleine Plevier](https://stats.sovon.nl/stats/soort/4690): broedpopulatie geregistreerd en zoetwaterhabitat belangrijk; categorie zomergast past bij de beschreven jaarcyclus.
- [Sovon Regenwulp](https://stats.sovon.nl/stats/soort/5380): doortrek half april–half mei en half juli–eind augustus, soms elders in het jaar; geen Nederlandse broedvogel. Geen betrouwbare trend uit deze pagina afleiden.
- De ANWB-soortpassages zijn niet ingezien. Geen nieuwe biometrische `ca.`-band zonder twee vergelijkbare onafhankelijke bronnen; bestaande getallen onaangeroerd. Geen Nederlandse eBird-analyse of media-afgeleid migratiepercentage.
- Privacyregel: alle niet bewezen deelbare locaties, ook van beschermde of onzekere soorten, blijven privé. Geen nieuwe deelroute aangebracht.
- Samsung-PWA-installatie, daadwerkelijke Android-gps/camera/microfoon, foto-/geluidsmedia via bestandskiezer, back-up/restore op een tweede toestel en de effectieve ChatGPT/Claude SYNC-CHECK blijven OPEN/NOT TESTED. Projectbijlagen tonen Veldhandboek v0.9 FINAL, terwijl Index v3.13 nog v0.8 noemt; hostactivering UNKNOWN.

## R36-grens en vervolg

Deze batch registreert de drie voorheen NOT STARTED F3-rijen als **IN CONTENT REVIEW / OPEN POINTS**. Bestaande 140 historische auditrecords en overige 137 F3-rijen blijven intact; geen foto of audio wordt verwijderd of stil aangepast. Kernrisico's: F3-mediarechten en oorspronkelijke beeldidentiteit, leeftijd/kleed, geluid, seizoenscategorisering, online/offline mobiele weergave. R36 is uitsluitend REVIEW READY zodra CI de registerconsistentie en broncontracten op dezelfde SHA controleert. Voor volledige F3-PASS blijven ook onafhankelijke vak-/luisterreview en toestelbewijs nodig.

Volgende registerrijen na R36: Rosse Grutto `sp149`, Steenloper `sp150`, Drieteenstrandloper `sp152`.

**EINDMARKERING — F3-R36 · 108/140 · 32 NOT STARTED · 0 FULL PASS · RELEASE HOLD**
