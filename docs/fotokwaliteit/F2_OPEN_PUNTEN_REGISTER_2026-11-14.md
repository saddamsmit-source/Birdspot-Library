# Birdspot F2 — register open punten en uitgesteld fotoonderzoek

**Eigenaarbesluit 14 november 2026 · Werkdocument (DRAFT, geen foto-PASS)**
**Historische basis:** F2-15 `bccd09599a2b9fd7fb23771b3f6c262542b4c08a`; actuele F2-19 via PR #219 `c1befa8aaba15634f79e3b401942a0e82ffc8ecd` op eigen, herstelbare vervolgbranch. **Reikwijdte:** 48/140 soorten die individueel in F2 zijn opgepakt. Voor de andere 92 soorten geldt **NOT TESTED in F2** tot de afzonderlijke ronde start. Dit register is een index op de bestaande per-batch brondossiers, niet een vervanging van de canonieke 9-punts-audit.

## Hoe vervolgonderzoek te sturen

- **RELEASE-/VEILIGHEIDSGATE (hoog):** bewijs van fotoherkomst, exacte licentie/zichtbare credit, geschikte soort- en kleedrol voor alle **getoonde** foto's; fysiek Android/PWA, offline nieuwe invoer, ZIP export → herstel op tweede toestel, serviceworker-upgrade en rollback. Onzeker bewijs is nooit `VERIFIED`.
- **INHOUDELIJKE KLEINE PUNTEN (gericht):** mogelijke leeftijd-/geslachtslabels, geografische ondersoort, beeldinterpretatie, niet herbevestigde originele foto en extra lezersvriendelijke vergelijking. Bewaar bron-URL, bestand, datum en onzekerheid; corrigeer pas na bewijs.
- **UITGESTELD FOTOONDERZOEK (laag, wanneer relevant):** ontbrekende of niet duidelijk leesbare vluchtfoto's bij **kleine vogels**. Rustfoto's op tak/ondergrond, man/vrouw/juveniel en passende vergelijking gaan vóór. Een bestaande goede vluchtfoto mag blijven; slechte foto niet plaatsen om een tab te vullen.
- **Bronvoorrang:** voor soortkenmerken en het determineren van **elders gevonden foto's** eerst Vogelbescherming Nederland en ANWB-vogelgids wanneer de betreffende soortpassage daadwerkelijk is ingezien; dit vereist géén afbeeldingen van die gidsen. Specifieke ANWB-boekpagina's zijn in dit werk nog **NOT TESTED** en blijven per soort open totdat editie/pagina beschikbaar zijn. Voor biometrie, officiële status, bronherkomst, beeldrechten en ontbrekende bewijsvoering blijven de bestaande eisen ongewijzigd. Regelhouder: [fotokwaliteitsnorm §2.1](../BIRDSPOT_KWALITEITSNORM.md).

## Exacte openstaande meldingen uit de F2-rondes

De tekst in de kolom 'Open uit bronronde' is overgenomen uit de laatste F2-voortgang. Regels met ‘NOT TESTED’ blijven dat, ook wanneer algemene CI-tests groen zijn. Details en exacte foto’s staan in het bijbehorende F2-brondossier en de soortaudit.

| Soort | Batch | Open uit bronronde |
|---|---|---|
| sp002 Houtduif |  | [PR #193–196, afsluitende PR #196](https://github.com/saddamsmit-source/Birdspot-Library/pull/196). Volledige onafhankelijke F2-aftekening open. |
| sp003 Holenduif |  | [PR #195](https://github.com/saddamsmit-source/Birdspot-Library/pull/195). Volledige onafhankelijke F2-aftekening open. |
| sp004 Turkse Tortel |  | [PR #196](https://github.com/saddamsmit-source/Birdspot-Library/pull/196). Volledige onafhankelijke F2-aftekening open. |
| sp005 Buizerd |  | [Brondossier F2-05](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_05.json), [M1](soortaudit/M1.json). Afzonderlijke rustfoto van juveniel blijft open. Staarthoeken blijven een beschreven bronverschil. |
| sp248 Wespendief |  | [Brondossier F2-05](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_05.json), [M2](soortaudit/M2.json). Afzonderlijke foto vrouwtje in rust blijft open. Een groter vluchtbeeld blijft een wens. |
| sp253 Ruigpootbuizerd |  | [Brondossier F2-05](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_05.json), [M2](soortaudit/M2.json). Rustfoto’s voor vrouwtje en juveniel en een gelicentieerde referentieroep staan open. |
| sp006 Sperwer |  | [Brondossier F2-06](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_06.json), [M1](soortaudit/M1.json). Een passende foto van het vrouwtje in vrije vlucht blijft open. |
| sp007 Havik |  | [Brondossier F2-06](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_06.json), [M2](soortaudit/M2.json). Een aparte rustfoto van het vrouwtje blijft open. De algemene vluchtfoto behoudt een neutraal label. |
| sp008 Torenvalk |  | [Brondossier F2-06](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_06.json), [M1](soortaudit/M1.json). Vergelijkingsfoto’s van Boomvalk en Smelleken blijven open. |
| sp009 Slechtvalk |  | [Brondossier F2-07](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_07.json), [M2](soortaudit/M2.json). Een juveniele vluchtfoto blijft open. |
| sp249 Blauwe Kiekendief |  | [Brondossier F2-07](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_07.json), [M9](soortaudit/M9.json). Rustfoto’s van vrouwtje en juveniel blijven open. |
| sp250 Steppekiekendief |  | [Brondossier F2-07](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_07.json), [M9](soortaudit/M9.json). Rustfoto’s van vrouwtje en juveniel blijven open. |
| sp173 Bruine Kiekendief |  | [Brondossier F2-08](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_08.json), [M2](soortaudit/M2.json). Rustfoto van mannetje en juveniel in vrije vlucht staan open. |
| sp251 Grauwe Kiekendief |  | [Brondossier F2-08](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_08.json), [M9](soortaudit/M9.json). Vrije vlucht van vrouwtje en juveniel staat open. |
| sp016 Grote Bonte Specht |  | [Brondossier F2-08](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_08.json), [M2](soortaudit/M2.json). |
| sp017 Kleine Bonte Specht | F2-09 | Passende juvenielenfoto, volledige vrije vlucht en gewicht. |
| sp018 Zwarte Specht | F2-09 | Volledige juvenielenfoto, scherpere vrouwtjesfoto, ruimer gekaderde vluchtfoto en gewicht. Bij het juveniele kopdetail blijft de licentiehistorie open. |
| sp019 Groene Specht | F2-09 | Geen extra foto toegevoegd. De toets op een fysiek toestel staat open. |
| sp020 Middelste Bonte Specht | F2-10 | Bronbevestigde juvenielenfoto, ruimer vluchtbeeld en scherpere hoofdfoto. |
| sp021 Ekster | F2-10 | Bronbevestigde juvenielenfoto, gewicht en geluidsdekking. De fotograaf beschrijft vertrek vanaf de rots. Op de foto is de vogel los met gespreide vleugels. Een frame uit de voorafgaande afzetfase is onbekend. |
| sp022 Zwarte Kraai | F2-10 | Bronbevestigde juvenielenfoto en eigen referentiegeluid. |
| sp025 Kauw | F2-11 | Vrije-vluchtfoto, juvenielenfoto en eigen geluidsopname. |
| sp026 Gaai | F2-11 | Een bronbevestigde juvenielenfoto. |
| sp029 Koolmees | F2-11 | Browsercontrole op deze commit en fysieke toesteltoets. |
| sp030 Pimpelmees | F2-12 | De fysieke toestelproef is uitgesteld op verzoek van de eigenaar. |
| sp031 Matkop | F2-12 | Scherpe foto in vrije vlucht. De aangepaste naamsvermelding staat in [PR #210](https://github.com/saddamsmit-source/Birdspot-Library/pull/210). |
| sp032 Glanskop | F2-12 | Scherpe foto in vrije vlucht. De zichtbare credit bij het vooraanzicht staat in [PR #210](https://github.com/saddamsmit-source/Birdspot-Library/pull/210). |
| sp033 Kuifmees | F2-13 | Scherpe vrije-vluchtfoto. De door Luc Viatour gevraagde credit staat in [PR #212](https://github.com/saddamsmit-source/Birdspot-Library/pull/212). |
| sp034 Staartmees | F2-13 | Scherpe vrije-vluchtfoto. |
| sp065 Boomklever | F2-13 | Bronbevestigde juvenielenfoto. |
| sp066 Boomkruiper | F2-14 | Bronbevestigde vrije-vluchtfoto. |
| sp067 Taigaboomkruiper | F2-14 | Vrije-vluchtfoto, juvenielenfoto en ondersoort van de getoonde vogels. |
| sp063 Goudhaantje | F2-14 | Afzonderlijke mannetjesfoto en scherp Europees vluchtbeeld. Japanse foto blijft voorlopig. |
| sp064 Vuurgoudhaan | F2-15 | Nieuwe directe visuele vergelijking van de app-WebP met de oorspronkelijke bronbestanden **NOT TESTED**. Individuele iNaturalist-annotatie van het juveniel in deze ronde niet herbevestigd. Bronbevestigde vrouwtjesfoto en vrije-vluchtfoto ontbreken; niet kunstmatig ingevuld. |
| sp035 Vink | F2-15 | Nieuwe originele foto-voor-foto / WebP-inhoudscontrole **NOT TESTED**. Geslacht van de vluchtfoto blijft een afzonderlijke broncontrole; oorspronkelijke auteur-/licentievelden zijn niet gewijzigd. Geen nieuwe foto gepubliceerd. |
| sp036 Groenling | F2-15 | Nieuwe originele foto-voor-foto / WebP-inhoudscontrole **NOT TESTED**. Verifieer bij een latere mediaronde de vrije vlucht onafhankelijk; bestaande bron- en licentievelden ongewijzigd. |
| sp037 Putter | F2-16 | Vrouwtjesrol berust in het bestaande dossier mede op ‘femmina’ in de titel: zelfstandige foto-/geslachtscontrole nog open. Origineel-naar-WebP-hercontrole **NOT TESTED**. Een nieuwe vluchtfoto is geen prioriteit zolang de bestaande voldoet. |
| sp038 Sijs | F2-16 | De bestaande vluchtfoto vermeldt lichte bewegingsonscherpte aan de vleugel. **Optioneel fotoonderzoek later**, niet automatisch opnieuw zoeken; eerst in werkelijke viewer beoordelen of de reeds toegelaten foto nog herkenningswaarde heeft. Originele foto-/WebP-audit en onafhankelijke leeftijdscontrole **NOT TESTED**. |
| sp040 Goudvink | F2-16 | Juveniel-annotatie van iNaturalist en originele vrouw-/vluchtmedia niet opnieuw onafhankelijk geopend; bron-naar-WebP-controle **NOT TESTED**. De bestaande vlucht blijft staan totdat beeldinspectie reden tot aanpassen geeft. |

| sp039 Kneu | F2-17 | Vrouwtjes-/juvenielportret ontbreken. Historische 1045×470-vlucht toont twee kleine vogels en is voorwaardelijk (niet definitief), pas na kijkproef besluit over tonen. Commons-bron **Joe Pell, CC BY 2.0** voor hoofdfoto herbevestigd; lokale WebP en andere bronfoto's **NOT TESTED**. |
| sp041 Appelvink | F2-17 | Vrouw-/juvenielportretten zijn geregistreerd maar de individuele originele foto's, de leeftijd/sekse-identiteit en de lokale WebP's niet opnieuw geopend. De 330×275-vlucht is voorwaardelijk; later optioneel onderzoek, geen geforceerde extra foto. |
| sp042 Roodmus | F2-17 | Geen vrouwtjes-, juvenielen- of vluchtfoto; juiste rustfoto voor mannenvergelijking hergebruikt. Originele bestandslicentie, fotocredit en exacte WebP-match **NOT TESTED**. ANWB-soortpassage **NOT TESTED**. |

| sp043 Huismus | F2-18 | Individuele juvenielbron bij meerdere vogels, exacte leeftijdsrol, bron-WEBP-match en licentiedetails **NOT TESTED** in deze ronde. Bestaande vlucht eerder goedgekeurd; geen nieuwe vlucht gezocht. |
| sp044 Ringmus | F2-18 | Man en vrouw gelijk: volwassen hoofdfoto nooit geslacht toekennen zonder bron. Individuele iNaturalist-juvenielannotatie, exact WebP-bestand en voorwaarden licentie **NOT TESTED**. ANWB-inkijk bevestigt alleen het onderscheid zwarte wangvlek; niet dit specifieke beeld. |
| sp045 Merel | F2-18 | Oud landingsbeeld al uit vlucht; tweede voorlopige vrije-vluchtfoto blijft **voorwaardelijk / kwaliteit matig** en is **NIET** opnieuw goedgekeurd. Voor effectieve nieuwe publicatie echte kijkproef: bij onvoldoende herkenbaarheid weglaten, niet forceren. Juveniele Merel versus Zanglijster op originele WebP/bronfoto onafhankelijk nog **NOT TESTED**. |

| sp046 Zanglijster | F2-19 | Originele juvenielenbron **Frank Vassen, CC BY 2.0** opnieuw gelezen; lokaal WebP-to-original, broncredits en vluchtinhoud niet onafhankelijk zichtbaar. Historische vrije-vluchtgoedkeuring blijft, geen nieuwe foto-PASS. |
| sp047 Kramsvogel | F2-19 | Originele juvenielenbron **hedera.baltica, CC BY-SA 2.0** en juvenielstatus opnieuw gelezen; originele pixelvergelijking en overige foto-/licentiegegevens niet onafhankelijk opnieuw gecheckt. Historische vluchtgoedkeuring blijft ongewijzigd. |
| sp048 Koperwiek | F2-19 | **In vlucht: geen foto** — oude opvliegfoto `sp048-flight.webp` blijft als niet-vluchtrol geregistreerd. Geen bronzekere nieuwe vluchtfoto toevoegen. iNaturalist-juvenielwaarneming/bronrechterlijke licentie en lokaal WebP opnieuw **NOT TESTED**; latere fotoverificatie alleen bij duidelijk beeld nodig. |

## Vervolgcontrole en aftekening

1. Bij een volgende F2-ronde: controleer alleen de drie gekozen soorten op oorspronkelijke bestanden/CC-rechten, soort/rol, fotokwaliteit, twee passende vergelijkingbeelden en browserbediening; noteer de individuele status en bronlinks.
2. Werk dit register additief bij: verander een open punt pas in **VERIFIED** na herhaalbare nieuwe bron-/beeld- en uitvoerbewijzen. Laat historische onzekerheid staan met datum en reden; geen stille aftekening op basis van 140 kaart-renders.
3. **Niet gereviewd in F2:** 92 soorten. Volgorde na F2-16 opnieuw afleiden uit de 140-fotolijst en F2-voortgang; geen ongeteste soorten starten vóór een passende batch.
4. Later diepgaand fotoonderzoek: per open beeldtype minimaal soortnaam/wetenschappelijke naam, doelkleed, foto-oorsprong, ondertitel, auteur, licentie, bronbestand/versie, vrijgave voor herpublicatie en indien passend exacte oorspronkelijke pixels. Bij twijfel lege positie laten staan.

## Live-/release-gate — aparte status

**Owner live-autorisatie aanwezig op 14-11-2026**, maar dat maakt een technische gate niet automatisch PASS. Publieke reviewbranch `21ce9060` en `main` `5bf67043` zijn de laatste rechtstreeks gelezen refs. De nieuwste F2-keten zit in open DRAFT-PR’s. **Open voordat deze updates publiek worden gezet:** onafhankelijk mobiel veldgebruik, ZIP-herstel op tweede toestel, update/rollback, fotorechten/credits, review van de gecombineerde release-SHA en controle van de effectieve hosting (GitHub Pages review vs. Vercel gekozen voor later). Zie het release-gatedossier voor het bewijs per stap. Werkelijke publicatie: **NOT DONE**; terugvalbasis behouden.
