# Bronaudit gidsfoto's — 9 november 2026

Basis: `46e43370` (#114). Werk op `feat/guide-photo-verification`. Bewijs per foto: `docs/evidence/GUIDE_SOURCE_AUDIT_2026-11-09.json`.

## Methode
- Per foto de bronpagina opgevraagd via de Wikimedia Commons-API (289) of de iNaturalist-API (78): titel, beschrijving, categorieën, maker, licentie, taxon, kwaliteitsgraad en annotaties (geslacht, levensfase).
- Bronbeeld gedownload en met het app-beeld vergeleken (ORB-kenmerken + RANSAC, ook gespiegeld). Twee videostills (sp042, sp053) zijn op de vastgelegde tijdstempel uit de bronvideo gehaald en vergeleken.
- Voor één Commons-bestand zonder machineleesbare metadata (sp018 juveniel) is de wikitekst van de bronpagina gelezen.
- Uitgevoerd in GitHub Actions op de eenmalige branch `chore/source-audit`; de app zelf haalt niets van buiten op.

## Uitkomst (367 foto's op 134 kaarten)
| Controle | Resultaat |
|---|---|
| Bronbeeld = app-beeld (zelfde opname) | 367/367 (365 beeldvergelijking, 2 videostill op tijdstempel); 0 gespiegeld |
| Soort | 367/367; 15 via taxonomische synoniemen (o.a. *Anarhynchus alexandrinus*, *Thinornis dubius*, *Astur gentilis*, *Ardea ibis*, *Schoeniclus schoeniclus*) of beschrijving/locatie (sp045 vrouwtje: Dublin) |
| iNaturalist-kwaliteit | 78/78 research grade |
| Maker en licentie | Overeenkomend; verschillen alleen in schrijfwijze (iNaturalist zonder versienummer = 4.0, 'Publiek domein'/'Public domain', Cyrillisch schrift) |

## Correcties
| Kaart | Wat | Waarom |
|---|---|---|
| Buizerd, Slechtvalk, Middelste Bonte Specht | Geslachtslabels weg; foto's blijven als 'Volwassen' | Bron noemt het geslacht, maar de soortkaart zegt zelf dat man en vrouw op elkaar lijken |
| Bruine Kiekendief | Oude vluchtfoto zonder geslacht; nieuwe hoofdfoto en nieuw mannetje (driekleurig) | Bron noemt 'adult male', maar grijze vleugelvelden en staart ontbreken op het beeld |
| Meerkoet, Grauwe Gans, Bergeend | Foto uit 'Juveniel' naar 'Donsjong(en)'; Juveniel open | Donsjong is geen juveniel kleed |
| Drieteenstrandloper | Leeftijd 'juveniel' weg bij vluchtfoto | Leeftijd staat niet in de bron |
| 19 kaarten | Nieuwe hoofdfoto: mannetje volgens de bron en visueel gecontroleerd | Hoofdfoto en Mannetje waren dezelfde opname |
| Alle kaarten | De hoofdfoto komt niet meer terug in een kleedgalerij; zonder eigen foto verwijst de galerij naar de hoofdfoto | Geen dubbele opname op één kaart |

Bevestigd door de bron (twijfel uit de review opgelost): Havik (man/vrouw), Kleine Bonte Specht (vrouw, ook in vlucht), Zwarte Specht juveniel ('Pic noir juvénile'), IJsvogel vrouw, Wintertaling juveniel, Goudplevier juveniel, Witgat juveniel, Grote Zilverreiger juvenielen op het nest, Wespendief en Ruigpootbuizerd (man).

## Open
- Geen geschikte nieuwe hoofdfoto gevonden: Bergeend, Strandplevier, Wespendief, Ruigpootbuizerd (geen kandidaat met bevestigd mannetje en voldoende kwaliteit).
- Juveniel ontbreekt nu bij Meerkoet, Grauwe Gans en Bergeend.
- Kwaliteit, wel geverifieerd: Krakeend juveniel (in de hand bij ringonderzoek), Goudplevier juveniel (tekst in beeld), Witgat juveniel en Roodborsttapuit in vlucht (onscherp), Grasmus in vlucht (silhouet).
- Gidsteksten tegen bronnen: niet in deze ronde.
