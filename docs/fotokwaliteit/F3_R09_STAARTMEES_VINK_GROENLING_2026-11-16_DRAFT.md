# Birdspot F3-R09 — Staartmees, Vink en Groenling · verplichte dubbelgangerscontrole

**Datum:** 16 november 2026  
**Status:** DRAFT / PARTIALLY TESTED. Bron- en lokale beeldinspectie zijn geen onafhankelijke foto-/audio- of fysieke toestel-PASS.  
**Base:** F3-R08 PR #262 `84657b88f49f9e24c16d4b0a7d987fd1c4ea93a9`. **Branch:** `qa/birdspot-f3-r09-lookalikes-20261116`.  
**Eigenaarsbesluit:** soortdubbelgangers krijgen brongedragen **foto's én herkenningstekst**. Normhouder: `docs/BIRDSPOT_KWALITEITSNORM.md` v1.7 §3.4. Uitwerking/voortgang in `SOORTVERWARRING_REGISTER_V0.1_DRAFT.json`.  
**Scope:** precies 3 van de bestaande 140 soorten; geen onbewezen nieuwe media, zonder backend, zonder wijziging aan private waarnemingen, lokale data of `main`.

## Gecontroleerde lokale gidsbeelden (11, werkelijk geopend)

De bestaande WebP-bestanden zijn stuk voor stuk opnieuw geopend en op zichtbaar kleed, beeldkwaliteit en geschiktheid beoordeeld. Bewijsniveau **lokale beelddeterminatie / PARTIALLY TESTED**, niet originele bestanden/rechten-/leeftijds- of ornithologische certificering. Bestands-Git-blob-SHA's staan per R09-soort in het canonieke F3-register; de CI bewaakt bytebehoud.

| Soort / soort-ID | Gidsfoto | Kleed / situatie | Waarneming en open punt |
|---|---|---|---|
| Staartmees `sp034` | `/assets/species/sp034.webp` | volwassen, onbekend geslacht | Kleine snavel en *zeer lange complete staart* goed zichtbaar; donkere zijkruinstreep. Goed herkenningsbeeld voor reguliere vorm. Originele bron nog afzonderlijk te vergelijken |
| Staartmees | `/assets/species/plumage/sp034-juv.webp` | juveniel | Donkerbruine kopzijden, weinig roze en lange staart op tak zichtbaar; oud kleedlabel behouden tot oorspronkelijke foto-/leeftijdsbron opnieuw getoetst is |
| Vink `sp035` | `/assets/species/plumage/sp035-hero-male.webp` | mannetje | Blauwgrijze kruin, rozerode borst, opvallende witte vleugelstrepen; voldoende detail in rust |
| Vink | `/assets/species/sp035.webp` | mannetje | Duidelijk tweede rustbeeld met lichte vleugelstrepen; lijkt niet identiek aan hoofdbeeld, geslacht zichtbaar maar oorspronkelijke broncheck open |
| Vink | `/assets/species/plumage/sp035-adult_f.webp` | vrouwtje | Grijsbruine vogel met lichte vleugelstrepen. Geschikt voor vergelijking met **vrouwtje Huismus**; de oorspronkelijke fotograaf-/kleedcheck blijft open |
| Vink | `/assets/species/plumage/sp035-juv-review.webp` | juveniel | Lichte snavelhoeken en onvolwassen uiterlijk duidelijk. Geen man/vrouw-label aannemen; oorspronkelijke opname en rechten nog onafhankelijk controleren |
| Vink | `/assets/species/plumage/sp035-flight.webp` | in vlucht (oud label) | Los van ondergrond, vleugelveren zichtbaar en poten hangend; voor de strengere definitie echte **vrije** vlucht is originele opnamecontext nog te valideren |
| Groenling `sp036` | `/assets/species/sp036.webp` | mannetje | Geelgroen, stevige kegelvormige snavel, geel langs de handpennen. Bruikbaar voor rustvergelijking met mannetje Sijs |
| Groenling | `/assets/species/plumage/sp036-adult_f.webp` | vrouwtje | Forse bleke snavel, gedempt groen-geel, rustige achtergrond en zijaanzicht. Goed om de *vrouwtje Sijs*-snavel te vergelijken |
| Groenling | `/assets/species/plumage/sp036-juv.webp` | juveniel | Bruine/groene grondkleur en donkere borststreping, zware snavel. Niet als vrouwtje presenteren alleen omdat het kleed dof is |
| Groenling | `/assets/species/plumage/sp036-flight.webp` | in vlucht (oud label) | Gele vleugelpennen en buitenstaart, vogel los van grond met uitgespreide vleugels. Werkelijke bron- en rolcontrole open |

**Bewijsgrens:** de oude fotorechtenstatus in F1/F2 blijft historisch behouden, maar de huidige F3-controle heeft **geen volledige bestandsvergelijking met alle elf oorspronkelijke JPEG/PNG's** of juridische licentiebewijsvernieuwing uitgevoerd. Niets als definitief PHOTO VERIFIED labelen. **ANWB-boekpassages niet ingezien.**

## Belangrijkste dubbelgangers en publieksinformatie

### 1. Vrouwtje Vink ↔ vrouwtje Huismus

Gebruik beide bestaande, soortcorrect geregistreerde vrouwtjesfoto's in rust op gelijke schaal. **Vink:** twee lichte, vaak witte vleugelstrepen, meestal egalere grijsbruine rug en witte buitenste staartpennen. **Huismus:** lichte wenkbrauw en sterker gestreepte bruine rug; mist dezelfde twee lichte vleugelbanden. Bij juvenielen extra onzekerheid; zie `LK-002`.

**Wijziging:** het bestaande vergelijkingspaneel kreeg een expliciete kleednaam en drie kort benoemde punten, met een waarschuwing voor juvenielen.

### 2. Vink ↔ Keep in gemengde wintergroepen

Beide lijken in de winter sterk op elkaar, vooral de vrouwtjes. **Keep:** vaak warm oranje op borst/schouders, oranje vleugelband en grote **witte stuit** bij opvliegen; nasaal contactgeluid kan helpen. **Vink:** doorgaans twee witte vleugelstrepen zonder de opvallend witte stuit van Keep, mannetje blauwgrijze kruin/roze borst. Let op seizoen, licht en verenkleed. Bronnen Vogelbescherming voor beide soorten. **Geen onbewezen foto gebruiken:** `sp181` Keep staat wel in de soortenlijst maar heeft nog geen geverifieerd fotopaar in de huidige gids; de Vink–Keep-fotokaart blijft volgens v1.6 verborgen. De Vink-kaart bevat nu wél de uitleg/waarschuwing; de voltooiing aan beide kanten blijft open (`LK-001`).

### 3. Vrouwtje Groenling ↔ vrouwtje Sijs

**Groenling:** grote, dikke kegelvormige snavel, forser lichaam en geel langs buitenste slagpennen. **Sijs:** kleiner, fijnere snavel, veelal duidelijk gestreepte flanken en contrasterende gele vleugelstreep. *Juveniele Groenling* is zelf ook gestreept; daarom geen 1-teken-determinatie. De bestaande `adult_f`-vergelijking en beide bronfoto's zijn behouden (`LK-003`).

### 4. Mannetje Groenling ↔ mannetje Sijs

Beide hebben geel/groen, maar **volwassen mannetje Sijs** heeft vaak een zwarte kruin en keel en fijne snavel, terwijl **volwassen Groenling** geelgroen is, zonder zwarte kruin en met een zwaardere snavel. **Nieuw**: naast de bestaande vrouwtjes-/vluchtvergelijking een expliciet mannetjes-rustfotopaar met maximaal drie kenmerken, hergebruik van reeds geregistreerde gidsbeelden (`LK-004`). Bij andere leeftijd/geslacht niet blind dezelfde kopkenmerken toepassen.

### 5. Staartmees en witkoppige varianten

Een Staartmees is herkenbaar aan de uiterst lange staart, klein snaveltje en groepsgedrag. *Witkopstaartmees* is een geografische ondersoort; in Nederland zijn echter ook andere **witkoppige Staartmezen** mogelijk. Een witte kop is **geen bewijs** dat het een aparte soort of de noordelijke ondersoort is. Breng dit zonder valse taxonomische splitsing in de herkenningstekst. De bestaande vergelijking met Zwarte Mees (`sp174`) helpt wanneer de staart wel volledig zichtbaar is; andere sterke verwarringssoorten alleen na eigen foto-/bronbewijs toevoegen (`LK-005`, `LV-001`).

## Afzonderlijke geluidstoestand (niet aangevuld)

- **Staartmees:** één `sp034-sound.mp3` *algemeen geluidsvoorbeeld*; het exacte roltype is in de bronmetadata niet vastgelegd. Niet presenteren als bewezen zang of roep.
- **Vink:** `sp035-song.mp3` en `sp035-call.mp3` onder bestaande song/roep-labels. De exacte originele opname/audioanalyse is dit F3-R09-bezoek niet herhaald.
- **Groenling:** **geen** lokaal geregistreerde zang of roep. Zoek als vervolg eerst een passende, commercieel herbruikbare opname; controleer echte soort/geluidsrol, originele audio, licentie en attributie voordat een nieuw bestand wordt geschreven.

De mogelijkheid om een vogel automatisch te herkennen door BirdNET is **geen** bewijs voor de soortcorrectheid van een gidsopname of een specifiek nieuw soortgeluidsbestand.

## Bronnen die werkelijk zijn geraadpleegd (16-11-2026)

- [Vogelbescherming · Staartmees](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/staartmees) — variabele koptekening en noordelijke/witkoppige vormen.
- [Vogelbescherming · Vink](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/vink) en [Keep](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/keep) — rust/winter-, vleugel-/stuitverschillen en geluid.
- [Vogelbescherming · Tuinvogeltelling Vink/Keep](https://www.vogelbescherming.nl/tuinvogeltelling/herkenningstips/?tip=3); [Vink/Huismus](https://www.vogelbescherming.nl/tuinvogeltelling/herkenningstips/?tip=6) — relevante vrouwtjesverschillen.
- [Vogelbescherming · Groenling](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groenling), [Sijs](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/sijs) en [Tuinvogeltelling Sijs/Groenling](https://www.vogelbescherming.nl/tuinvogeltelling/herkenningstips/?tip=7) — snavel/gele vleugel/variabele flankstreping.

**Niet inhoudelijk geraadpleegd deze ronde:** de ANWB-vogelgids zelf, volledige individuele Sovon-trendberekeningen, gedetailleerde eBird-seizoenskaarten, elf externe originele foto-bestanden en drie originele audio-opnamen. Eerdere links/metadata in `guidePhotos.js`, `field-guide-media.json` en `knowledge.json` behouden uitsluitend hun oude bewijsstatus.

## QA- en releasecontract

1. `tests/test_lookalike_r09.mjs`: soorten, bronvelden, maximaal drie kenmerken, juiste kleedspecificatie, echte bronfoto's indien gepaard, verborgen ontbrekende foto, zichtbare veiligheidswaarschuwing, beide richtingen.
2. `tests/test_lookalike_r09_browser.py`: echte Chromium, mobiele breedtes 320/360/390, per paar twee daadwerkelijk gedecodeerde beelden, geen horizontaal lek, zoomen, terug, Keep-onderdrukking, korte vergelijkingsregels. Tests zijn geen biologische of juridische onafhankelijke review.
3. F3-register en `test_f3_140_unified_rebaseline.mjs`: 140 vaste soort-IDs en alle eerdere auditvelden behouden; `27/140` inhoudelijk bekeken, `113` niet gestart, **nul F3FullPass**; drie F3-R09-soorten exact `sp034 sp035 sp036`.
4. **Nog open:** oorspronkelijke foto-/audiorechten per bestand, onafhankelijke soort-, leeftijds- en geluidsdeterminatie, origineelbeeldvergelijking, offline scherm/zoom en echte toestel-/PWA-check. Na originele bronnen opnieuw controleren of een alternatieve betere foto/roep überhaupt nodig is. Geen verzonnen foto, geen uitgezette controles.

**Herstel:** PR/branch afsluiten zonder merge naar publieke versie; exact uitgangspunt PR #262 `84657b88f49f9e24c16d4b0a7d987fd1c4ea93a9`. Updates uit #261 en #262 blijven behouden. Geen nieuwe livego of publicatieopdracht in dit gesprek.


## Addendum · Vink/Groenling-vrouwtjes (16-11-2026)

**Vervolg boven op PR #263, zonder eerdere audithistorie te overschrijven.** Extra dubbelganger `LK-007`: Vink `sp035` ↔ Groenling `sp036`, uitsluitend twee bestaande, werkelijk geopende **volwassen vrouwtjesrustfoto's** uit de oorspronkelijke registerrollen. In de Vink-foto zijn twee witte vleugelstrepen zichtbaar; in de Groenling-foto de gele vleugelrand, een bredere kegelsnavel en grijsgroene kleedtoon. Daarom is een extra 2-fotopaar toegevoegd in `guideComparisons.js`, met drie concrete verschillen en de waarschuwing dat bruine/groene kleurtint niet op zichzelf diagnostisch is.

De canonieke `knowledge.json` en de gegenereerde `speciesKnowledge.js` zijn gezamenlijk bijgewerkt zodat beide soorten ook in de herkenningstekst naar elkaar verwijzen. `SOORTVERWARRING_REGISTER_V0.1_DRAFT.json` bevat de expliciete partner-IDs, risicokleed en individuele open foto-/licentie-/kwaliteitsgates. Tests controleren bronvelden, beide navigatierichtingen en mobiele beeldparen. **Geen nieuwe mediabytes**; onafhankelijke visuele controle tegen de originele fotograafbestanden, rechten, volledige mobile test en ornithologisch tweede oordeel blijven OPEN. Telling onveranderd: 27/140 inhoudelijk bekeken, 0 full-PASS.

Relevante herkende kenmerken: [Vogelbescherming Vink](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/vink), [Vogelbescherming Groenling](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groenling) en [RSPB female/juvenile finches](https://www.rspb.org.uk/birds-and-wildlife/identifying-birds/small-brown-birds-you-might-see-in-your-garden). Dit zijn inhoudsbronnen, geen fotoherpublicatievergunningen.
