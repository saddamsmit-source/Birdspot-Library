# Birdspot F3-R10 — Putter, Sijs en Kneu · dubbelgangers en kennisprofiel

**Datum:** 16 november 2026  
**Status:** DRAFT / PARTIALLY TESTED. Lokale beeldinspectie en Chromium-tests zijn geen onafhankelijke foto-, audio- of toestel-PASS.  
**Base:** F3-R09-addendum PR #265 `dfa056bfeed914e5ba4a5dba896af45445b96748`. **Branch:** `qa/birdspot-f3-r10-putter-sijs-kneu-20261116` · **PR:** #266 (concept).  
**Schrijver:** Claude, writerclaim in PR #266 (bootstrap volgens App Development Handbook v2.17 FINAL §1.7A).  
**Normhouder:** `docs/BIRDSPOT_KWALITEITSNORM.md` v1.7, vooral §3.1–§3.4.  
**Scope:** precies 3 van de bestaande 140 soorten. Geen nieuwe beeld- of geluidsbytes, geen backend, geen wijziging aan privéwaarnemingen, `main` of de reviewbranch.

## Gecontroleerde lokale gidsbeelden (11, werkelijk geopend)

Elke bestaande WebP is geopend en beoordeeld op zichtbaar kleed, houding en bruikbaarheid. Bewijsniveau **lokale beelddeterminatie / PARTIALLY TESTED**; originele bestanden, rechten en leeftijd/geslacht zijn niet onafhankelijk vergeleken. Git-blob-SHA's staan per soort in het F3-register; de CI bewaakt dat de bytes niet veranderen.

| Soort | Bestand | Rol | Waarneming en open punt |
|---|---|---|---|
| Putter `sp037` | `plumage/sp037-adult_m.webp` | hoofdfoto, mannetje | Rood masker tot achter het oog, zwart-witte kop, brede gele vleugelband. Scherp |
| Putter | `plumage/sp037-adult_f.webp` | vrouwtje | Kleiner rood masker; geslacht volgt het fotograaflabel. Rood overlapt tussen de geslachten, dus geen onafhankelijke geslachtsbepaling |
| Putter | `plumage/sp037-juv.webp` | juveniel | Grijsbruin gestreepte kop zonder rood, gele vleugelband aanwezig. Passend juveniel kleed |
| Putter | `plumage/sp037-flight.webp` | in vlucht | Los in de lucht met gespreide vleugels, maar poten hangen: mogelijk landingsfase. **Hercontrole tegen §3.3 (echte vrije vlucht) open**; niet gewijzigd zonder tweede oordeel |
| Putter | `sp037.webp` | extra rustbeeld | Volwassen vogel op tak, zijaanzicht, scherp |
| Sijs `sp038` | `sp038.webp` | hoofdfoto, mannetje | Zwarte kruin en kin, geelgroene borst, gele vleugelstreep. Scherp |
| Sijs | `plumage/sp038-adult_f.webp` | vrouwtje | Fijne snavel, donkere flankstrepen, gele vleugeltekening. Passend |
| Sijs | `plumage/sp038-juv.webp` | juveniel | Sterk gestreept, bruiniger, gele vleugeltekening. Passend |
| Sijs | `plumage/sp038-flight.webp` | in vlucht, mannetje | Vleugels omhoog, poten naar voren: mogelijk landingsfase. **Hercontrole tegen §3.3 open** |
| Kneu `sp039` | `sp039.webp` | hoofdfoto, mannetje | Grijze kop, karmijnrood voorhoofd en borst, warmbruine rug. Scherp en diagnostisch |
| Kneu | `plumage/sp039-flight.webp` | in vlucht | Twee kleine, onscherpe vogels op afstand; sinds 10-11 voorwaardelijk. Volgens §3.3 (kleine vogels) is een zwakke vluchtfoto niet verplicht; vervanging of weglaten blijft open |

**Registercorrectie:** het F3-register had voor de Kneu geen beeldposities, terwijl de app twee foto's toont. Beide posities en blob-SHA's zijn toegevoegd.

**Ontbrekend:** Kneu heeft **geen foto van vrouwtje of juveniel**. Juist die kleden lijken op Frater en barmsijzen. Open punt met hoge prioriteit.

## Dubbelgangers (norm §3.4)

| Paar | Kleed | Fotopaar | Tekst |
|---|---|---|---|
| `LK-008` Putter ↔ Sijs | juveniel; ook mannetjes en vlucht | Bestaande panelen, in beide richtingen getoond | Jonge Putter mist het rode masker: kop, brede gele vleugelband en snavel samen gebruiken |
| `LK-009` Kneu ↔ Frater `sp295` | vrouwtje, juveniel, winter | **Ontbreekt** (geen gecontroleerde foto's van Kneu-vrouwtje en Frater) → paneel verborgen | Frater: gele snavel in de winter, effen okerkleurige keel, zwaardere streping; mannetje met roze stuit. In de zomer is de snavel van Frater grijs |
| `LK-010` Sijs ↔ Europese kanarie `sp300` | vrouwtje, juveniel | **Ontbreekt** (geen foto Europese kanarie) → verborgen | Europese kanarie: korte, dikke grijze snavel en gele stuit, geen gele vleugelband |
| `LK-011` Kneu ↔ Grote/Kleine barmsijs `sp296`/`sp297` | vrouwtje, juveniel | **Ontbreekt** → verborgen | Barmsijzen: rood voorhoofdje en zwarte kin; vrouwtjes en jongen zonder rode borst |
| `LK-012` Kneu ↔ Roodmus `sp042` | volwassen mannetje | Bestaand paneel, in beide richtingen getoond | Roodverdeling en snavel; alleen volwassen mannetjes zijn rood |

Bij elk ontbrekend fotopaar staat de waarschuwing wel in de zichtbare herkenningstekst van de soortkaart.

## Inhoudelijke wijzigingen

1. **Nieuw kennisprofiel Kneu** (`knowledge.json` → gegenereerde `speciesKnowledge.js`): samenvatting, vier veldkenmerken, waarschuwing, twee kritische kenmerken (Frater; barmsijzen), gelijkende soorten Frater, Grote en Kleine barmsijs en Roodmus, geslacht/leeftijd/seizoen, roep en zang, leefgebied, status, voedsel, broeden en trek. Elke bewering heeft een bron; niets is als "doorslaggevend" gemarkeerd.
2. **Sijs:** waarschuwing en gelijkende soorten uitgebreid met Europese kanarie, plus een terugverwijzing naar Putter (die al naar Sijs verwees).
3. **Statuscorrectie Kneu** in `species.js`: niet langer "Standvogel". Vogelbescherming meldt dat Nederlandse broedvogels in Zuidwest-Europa overwinteren. De filtercategorie `standvogel` is **niet** gewijzigd (effect op seizoensfilters eerst beoordelen); open punt.
4. **Dubbelgangersregister:** focus uitgebreid met `sp037–sp039`, vijf nieuwe paren LK-008 t/m LK-012.

## Geluid

Geen van de drie soorten heeft een geregistreerde zang of roep. **BLOCKED in deze sessie:** downloaden van Commons/Xeno-canto is vanuit de Claude-werkomgeving geblokkeerd (proxy 403). Er is daarom niets geïmporteerd of gesimuleerd. Vervolg via een route met netwerktoegang: per opname soort, roltype, originele bron, licentie (geen NC voor commercieel gebruik) en credits controleren volgens `docs/audio/BIRDSPOT_EBIRD_SOVON_AUDIO_BRONPROTOCOL_V0.1_DRAFT.md`.

## Bronnen die werkelijk zijn geraadpleegd (16-11-2026)

Via zoekresultaten van de bronpagina's; volledige pagina's niet integraal gelezen:

- [Vogelbescherming · Kneu](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kneu) en [soortfactsheet Kneu (pdf)](https://www.vogelbescherming.nl/docs/cc8997c1-2bf3-4af2-9c8b-ba46a461611a.pdf)
- [Vogelbescherming · Frater](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/frater), [Vogelvisie · Frater](https://www.vogelvisie.nl/soort/frater.php), [BirdWatch Ireland · Twite](https://birdwatchireland.ie/birds/twite/)
- [Vogelbescherming · Grote barmsijs](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grote-barmsijs), [BirdWatch Ireland · Lesser Redpoll](https://www.birdwatchireland.ie/IrelandsBirds/Sparrowsfinchesbuntings/LesserRedpoll/tabid/1056/Default.aspx)
- [Vogelbescherming · Roodmus](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/roodmus), [Vogelbescherming · Europese kanarie](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/europese-kanarie)
- [RSPB · Linnet](https://www.rspb.org.uk/birds-and-wildlife/linnet), [BirdWatch Ireland · Wings 2016 (Linnet)](https://birdwatchireland.ie/app/uploads/2019/02/Wings-Summer-2016-sml.pdf)

**Niet geraadpleegd:** ANWB-gids, Sovon-trendcijfers, eBird-seizoenskaarten, originele foto- en audiobestanden.

## QA

| Test | Uitkomst | Bewijslaag |
|---|---|---|
| `tests/test_lookalike_r10.mjs` | PASS; mutatie (oude statustekst terug) wordt gevangen | code |
| `tests/test_lookalike_r10_browser.py` | PASS op 320/360/390 px: Putter↔Sijs en Kneu↔Roodmus met twee gedecodeerde foto's naast elkaar, verschillenrijen, zoom en terug; Frater/barmsijs/Europese kanarie alleen als tekst, geen fotopaneel | Chromium, geen fysiek toestel |
| `tests/test_lookalike_r09.mjs` | PASS (12 paren); focuscontrole aangepast zodat R09 de eerste drie focussoorten blijft bewaken | code |
| `tests/test_f3_140_unified_rebaseline.mjs` | PASS; 30/140 inhoudelijk bekeken, 110 niet gestart, 0 F3FullPass; R10 blob-SHA's bewaakt | code |
| `build_knowledge.py --check`, `test_kennisbaseline.mjs`, `test_kennisbaseline_validator.py` | PASS (103 profielen) | code |
| Onafhankelijke review, originele foto-/audiorechten, fysiek toestel, offline/PWA-update | NOT TESTED | — |

## Open punten (vervolg)

1. Foto's vrouwtje en juveniel Kneu zoeken en volledig verifiëren (§3.2).
2. Zang/roep voor Putter, Sijs en Kneu met bron en licentie.
3. Vluchtfoto's Putter en Sijs: onafhankelijk beoordelen of het echte vrije vlucht is; Kneu-vluchtfoto vervangen of weglaten.
4. Filtercategorie Kneu (`standvogel`) brongedragen herzien en effect op seizoensfilters testen.
5. Biometrie Kneu met twee uitgevers (KV-13); Sovon-status en eBird-seizoenspatroon.

**Stand:** 30/140 inhoudelijk bekeken, 0 volledig F3-PASS. Volgende drie volgens de soortenlijst: `sp040` Goudvink, `sp041` Appelvink, `sp042` Roodmus (te verifiëren vóór de start van F3-R11).
