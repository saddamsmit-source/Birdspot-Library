# Birdspot K08 — Spechten, gerichte audit van twee soorten
Datum: 12 november 2026 · bronniveau: PR #163 op `54c939d6b351800ba5dc20fb6cdccf539e1a600a` · codebranch: `qa/birdspot-k08-spechten-2-20261112`

**Status: PARTIALLY TESTED / CONCEPT. Geen release of volledige soortvrijgave.**

## Reikwijdte en methode
Deze ronde beperkt zich uitdrukkelijk tot `sp017` Kleine Bonte Specht en `sp018` Zwarte Specht. De inhoud van de 8 lokale beeldbestanden is op de exacte referentie-SHA afzonderlijk zichtbaar geopend. De gidsregistratie is uit `assets/species/credits.json` en `assets/species/field-guide-media.json` gelezen. De kennisprofielen komen uitsluitend uit inhoudelijk geraadpleegde soortbronnen, niet uit alleen een foto- of bestandsnaam. Onzekere eigenschappen blijven ondersteunend of open. De echte Android-PWA, lokale browser en totaalzicht per kaart zijn in deze ronde niet opnieuw bediend.

## Kleine Bonte Specht — sp017
| Lokaal bestand | Rol | Directe beeldobservatie | Bron/rechten | Beoordeling |
|---|---|---|---|---|
| `assets/species/sp017.webp` | Hoofdfoto, mannetje | Vogel goed zichtbaar langs stam met rode kruin en bes. Rugbandering niet volledig leesbaar door hoek/kleuren | Maurizio Carlini; Wikimedia Commons; CC BY-SA 4.0, bron live nagezien | Bruikbaar, maar rugvergelijking vraagt tweede foto |
| `assets/species/plumage/sp017-female.webp` | Volwassen vrouwtje | Witte/lichte kruin zonder rood, zwart-witte rugbandering duidelijk zichtbaar | Charles J. Sharp; Commons; CC BY-SA 4.0, bron live nagezien | Bruikbaar |
| `assets/species/plumage/sp017-flight.webp` | Wegvliegend bij nestholte, vrouwtje | Vogel naast stam in uitvliegbeweging, vlieghouding zichtbaar maar scherpte beperkt | blondinrikard; Commons; CC BY 2.0, bron live nagezien | Behouden als contextbeeld, geen goede vervanging voor onafhankelijke vrije vluchtfoto |

- **Ontbreekt:** overtuigende juvenielenfoto; hoogwaardige vrije vluchtfoto.
- **Geen wijziging:** niet automatisch een bijna-vluchtfoto promoveren naar `In vlucht`; geen geslacht voor onduidelijke juvenielen verzinnen.
- **Herkenningsbronnen:** [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-bonte-specht), [RSPB](https://www.rspb.org.uk/birds-and-wildlife/lesser-spotted-woodpecker) en [Woodland Trust](https://www.woodlandtrust.org.uk/blog/british-woodpecker-id/). Herkenning tegenover Grote Bonte Specht vraagt combinatie van rug, onderstaart en formaat.

## Zwarte Specht — sp018
| Lokaal bestand | Rol | Directe beeldobservatie | Bron/rechten | Beoordeling |
|---|---|---|---|---|
| `assets/species/plumage/sp018-hero-male.webp` | Huidige hoofdfoto, mannetje | Volledig rode kruin zichtbaar, vogel tamelijk klein in een breed landschapsbeeld | Frank Vassen; Commons-vermelding; CC BY 2.0 volgens gidsregister, oorspronkelijke specifieke bronpagina nog niet onafhankelijk heropend | Bruikbaar maar hero-kwaliteit kan beter |
| `assets/showcase/sp018.webp` | Bestaande foto mannetje; alternatief voor hero | Veel groter, scherp zijaanzicht met volledig rode kruin, lichtgekleurde snavel | xulescu_g; Commons; CC BY-SA 2.0, bron live nagezien | **Voorkeurskandidaat nieuwe hoofdfoto**, nog niet omgezet omdat oudere hero- en regressioncontracten expliciet zijn |
| `assets/species/plumage/sp018-female-single.webp` | Vrouwtje | Rode vlek alleen achter op de kruin, veel van de romp zichtbaar van achteren | Andreas Eichler; Commons; CC BY-SA 4.0, bron live nagezien | Bruikbaar, lokale versie slechts 500×661 px |
| `assets/species/plumage/sp018-flight.webp` | In vlucht | Lichaam vrij in de lucht met gespreide vleugel, lange lichte snavel | Janus Mosbacher; Commons; CC BY-SA 4.0, bron live nagezien | Geschikte echte vluchtpositie, geslachtslabel niet nieuw afgeleid |
| `assets/species/plumage/sp018-juv-review.webp` | Juveniel, kopdetail | Lichte snavel, donkere kop, rood kruindeel; **geen volledige vogel** | Philippe Kurlapski; Commons-beschrijving noemt juveniel; licentievermelding CC BY 1.0, brongeschiedenis bevat ouder `cc-by-sa`-sjabloon | Kopdetail bruikbaar, volledige jeugdfoto en rechtenhistorie extra controleren |

- **Ontbreekt:** volwaardig jeugdkleedportret. Een hogere-resolutie-import van het bestaande vrouwtje is een kwaliteitskans, maar is hier niet zonder gecontroleerde binaire source-/licentieverwerking uitgevoerd.
- **Kwaliteitskandidaat:** de reeds aanwezige showcase-foto zou voor de hoofdfoto beter zijn, maar bij omzetting moeten `verified_heroes_2026-11-09.json`, hero-regressies en kaartweergave zorgvuldig worden gewijzigd. Geen historische test stilzwijgend verzwakken.
- **Herkenningsbronnen:** [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-specht), [Naturalis Birds of Europe](https://birds-europe.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/taxon.php?epi=207&id=130777), [Jenni et al. leeftijd/geslacht](https://www.tandfonline.com/doi/full/10.1080/03078698.2025.2573475).

## Betrouwbaarheidsgrens en acceptatie
- Kennisprofielen toegevoegd voor `sp017` en `sp018`, met 3–5 ondersteunende veldkenmerken, expliciete vergelijkingen, herleidbare bronnen en `open`-lijsten. Geen onterecht 'doorslaggevend' kenmerk of onbewezen biometrische herberekening.
- De soorten behouden **NOT TESTED** in de officiële `soortaudit-status.json` tot een volledige foto-per-foto M10-beoordeling, actuele browserassertie, bron-/licentiecontrole en onafhankelijke QA zijn afgerond. De gecontroleerde totaalteller blijft 98/140.
- Nieuwe regressiecontrole borgt de reeds vastgelegde fotoposities. Ze bewijst geen volledige visuele hercontrole.
- Volgende stap voor **dezelfde twee** soorten: volledig M10-per-beeldformulier met werkelijk getoonde rol in `recognitionPanel`, kennisvalidator, browser 390px, offline foto-decode, dubbelingstoets inclusief bijna-identieke opnamen, scherpere originele vrouwtjesfoto van Zwarte Specht en eventueel betere hero na eigenaarreview.
- Auteur van deze ronde en reviewer zijn niet onafhankelijk. Fysiek Android, real-device navigatie/terug en productie blijven NOT TESTED. Geen merge of livegang.
