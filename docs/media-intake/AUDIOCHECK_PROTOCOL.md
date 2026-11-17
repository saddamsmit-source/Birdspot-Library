# Birdspot audiocontrole zonder menselijk luisteren — protocol v0.2 (16-11-2026)

> **Geldende regel (v0.2, vervangt v0.1 na onafhankelijke QA van 16-11-2026):** een automatische audiocheck levert **nooit** een soortverificatie op. Het hoogst haalbare resultaat is **PARTIALLY TESTED** als akoestische aanwijzing. Een opname wordt pas als bevestigd (VERIFIED) geregistreerd na een onafhankelijke menselijke of onafhankelijk gevalideerde controle; die route bestaat op dit moment niet.

**Aanleiding:** de eigenaar luistert niet per ronde mee, en de Claude-runtime kan geen geluid afspelen. Er zijn drie bewijslijnen; samen geven ze hooguit een aanwijzing, geen determinatie.

| # | Bewijslijn | Wat telt | Uitvoering |
|---|---|---|---|
| 1 | **Bronlabel** | Soort en geluidsoort (zang of roep) in de oorspronkelijke metadata (bij xeno-canto: opnemer, type, vogel gezien), vrije licentie, SHA-1 van het origineel vastgepind | Commons-metadata via `tools/media/audio_check.py` |
| 2 | **Akoestische referentievergelijking** | Kandidaat lijkt meer op ≥ 2 onafhankelijke opnemers van de eigen soort (zelfde geluidsoort; opnemer van de kandidaat telt niet) dan op elke verwarringssoort uit het kennisprofiel (elk ≥ 2 opnemers); marge ≥ 0,05; SNR ≥ 15 dB; beste fragment van 10 s ≥ 25 % actief; **referentievalidatie (leave-one-out) = 100 %**; het geanalyseerde fragment is het gepubliceerde fragment | GitHub Actions, numpy; geen ML-model (BirdNET niet gebruikt: CC BY-NC-SA) |
| 3 | **Visuele spectrogramcontrole** | Claude vergelijkt het spectrogram met de referenties en met ornithologische beschrijvingen; dit is geen onafhankelijk oordeel | Spectrogram-PNG's in `docs/media-intake/<datum>/audiocheck*/` |

**Uitkomst per opname (geldend):**
- Alle drie de lijnen kloppen → hooguit `PARTIALLY TESTED (akoestische aanwijzing)`. Dat is geen soortverificatie. De import weigert een `VERIFIED`-label op basis van een audiocheck (`tools/media/commons_intake.py`, `audiocheck_ok`).
- Eén lijn twijfelachtig of niet uitvoerbaar, of de referentievalidatie is < 100 % → `NOT TESTED`. De opname wordt niet gepubliceerd; een reeds gepubliceerde opname blijft staan als "alleen bronlabel".
- Een lijn spreekt een andere soort of geluidsoort tegen → `FAIL`; niet publiceren.
- In de app staat bij elke opname zonder VERIFIED-status zichtbaar: "Soort en geluidstype van deze opnamen zijn nog niet onafhankelijk bevestigd."

**Huidige stand (16-11-2026):** de referentievalidatie haalt voor de geteste soortparen 0,60 en 0,80. De akoestische lijn is daarom voorlopig niet bruikbaar. De Huismus-roep, Merel-zang en Merel-alarmroep staan op `NOT TESTED` (alleen bronlabel).

**Grenzen:** dit is geen menselijke luistercontrole en geen onafhankelijke review. Mengopnamen met meerdere soorten worden alleen gebruikt als het gekozen fragment aantoonbaar één soort bevat; bij twijfel `NOT TESTED`. De drempels zijn proefwaarden en worden in het rondelog gemeten, niet versoepeld om een opname door te laten.


## Historie — oorspronkelijke tekst v0.1 (vervangen, niet meer geldig)

De onderstaande uitkomstregel gold van 16-11-2026 16:20 tot de herziening in PR #273/#275. Hij staat hier alleen als audittrail en geldt **niet** meer.

> **Uitkomst per opname:**
> - Alle drie kloppen → `VERIFIED (triangulatie, niet door mens beluisterd)`; publicatie toegestaan, met dit label in het register.
> - Eén lijn twijfelachtig of niet uitvoerbaar → `NOT TESTED`; **niet publiceren**, open punt registreren, verder zoeken.
> - Een lijn spreekt een andere soort of geluidsoort tegen → `FAIL`; niet publiceren.

## Eerste toepassing — 16-11-2026 (PR #270)

Vier runs. Elke run maakte een zwakte zichtbaar, en die is telkens met een negatieve test dichtgezet (`tests/test_audio_check.py`):
1. ffmpeg ontbrak op de runner; de versiecontrole in de workflow maskeerde dat. Nu expliciet geïnstalleerd.
2. Bij het zoeken naar referenties kwamen er verwante Zuid-Amerikaanse sijzen en een onbepaalde opname mee. Nu geldt: exacte soortnaam in titel of categorie, en het xeno-canto-type moet passen.
3. Eén gemengde koor-opname diende als referentie voor zowel zang als roep. Nu: minimaal 2 unieke referenties, gemengde opnamen geweigerd.
4. Een verwarringssoort met één referentie liet een kandidaat door. Nu moet elke verwarringssoort ≥ 2 referenties hebben.

**Resultaat:** 0 van 5 kandidaten publiceerbaar, alle **NOT TESTED**. Bronlabel en visuele spectrogramcontrole passen bij de soort, maar de akoestische referentievergelijking kan niet worden uitgevoerd: er zijn te weinig onafhankelijke referenties voor Sijs en Kneu. Er staat dus geen opname in de app. Details: `docs/media-intake/2026-11-16/audio_candidates_r10.json` en `.../audiocheck/`.

## Herziening na onafhankelijke review — 16-11-2026 17:19 (PR #273)

- **Bewijsplafond:** een consistente audiocheck geldt hooguit als *akoestische aanwijzing* (PARTIALLY TESTED), nooit als soortverificatie. Een audiocheck door dezelfde agent is geen onafhankelijk oordeel. De import weigert een `VERIFIED`-label op basis van een audiocheck.
- **Versterkt:** één referentie per opnemer, de opnemer van de kandidaat telt niet, exacte soort en geluidstype, verwarringssoorten uit het kennisprofiel met elk ≥ 2 onafhankelijke opnemers, en het geanalyseerde fragment moet gelijk zijn aan het gepubliceerde fragment.
- **Nieuw: referentievalidatie (leave-one-out).** Elke referentie moet het meest lijken op de andere referenties van haar eigen soort. Alleen bij 100 % mag een kandidaat consistent heten.
- **Uitkomst op de drie gepubliceerde opnamen:**
  - Merel/Zanglijster/Spreeuw-zang: validatie 0,60.
  - Huismus/Ringmus-roep: validatie 0,80.
  - Merel-alarmroep: te weinig onafhankelijke Zanglijster-referenties.
  - **Conclusie: de spectrale profielmaat is voor deze soortparen geen betrouwbare detector.** De akoestische lijn is daarmee voorlopig NOT TESTED. Alle opnamen staan op "alleen bronlabel" en dat is zichtbaar in de soortkaart.
- **Volgende methode (open):** een validatie-eerst-aanpak met een vrij licentieerbare, gevalideerde classifier, of een onafhankelijke menselijke/AI-review. Tot die er is, publiceert de audiocheck niets en verhoogt hij geen status.
