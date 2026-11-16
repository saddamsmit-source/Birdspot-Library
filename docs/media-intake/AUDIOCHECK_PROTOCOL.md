# Birdspot audiocontrole zonder menselijk luisteren — protocol v0.1 (16-11-2026)

**Aanleiding:** de eigenaar luistert niet per ronde mee; de Claude-runtime kan geen geluid afspelen. Een opname mag pas als geverifieerde gidsopname in de app als **drie onafhankelijke bewijslijnen** kloppen. Eén lijn alleen (bronlabel, spectrogram of rekenkundige gelijkenis) is nooit genoeg.

| # | Bewijslijn | Wat telt | Uitvoering |
|---|---|---|---|
| 1 | **Bronlabel** | Soort en geluidsoort (zang/roep) in de oorspronkelijke metadata (bij xeno-canto: opnemer, type, vogel gezien), vrije licentie, SHA-1 van het origineel vastgepind | Commons-metadata via `tools/media/audio_check.py` |
| 2 | **Akoestische referentievergelijking** | Spectraal profiel en dominante-frequentieverdeling lijken meer op ≥2 referenties van de eigen soort (andere opnemers, zelfde geluidsoort) dan op die van elke verwarringssoort, marge ≥ 0,05; SNR ≥ 15 dB; beste fragment van 10 s ≥ 25 % actief | GitHub Actions, numpy; geen ML-model (BirdNET niet gebruikt: CC BY-NC-SA) |
| 3 | **Visuele spectrogramcontrole** | Claude vergelijkt het spectrogram met de referenties en met beschrijvingen uit ornithologische bronnen (toonhoogte, elementvorm, ritme, storende geluiden) | Spectrogram-PNG's in `docs/media-intake/<datum>/audiocheck/` |

**Uitkomst per opname:**
- Alle drie kloppen → `VERIFIED (triangulatie, niet door mens beluisterd)`; publicatie toegestaan, met dit label in het register.
- Eén lijn twijfelachtig of niet uitvoerbaar → `NOT TESTED`; **niet publiceren**, open punt registreren, verder zoeken.
- Een lijn spreekt een andere soort of geluidsoort tegen → `FAIL`; niet publiceren.

**Grenzen:** dit is geen menselijke luistercontrole en geen onafhankelijke review. Mengopnamen met meerdere soorten worden alleen gebruikt als het gekozen fragment aantoonbaar één soort bevat; bij twijfel `NOT TESTED`. De drempels zijn proefwaarden en worden in het rondelog gemeten, niet versoepeld om een opname door te laten.

## Eerste toepassing — 16-11-2026 (PR #270)

Vier runs. Elke run maakte een zwakte zichtbaar, en die is telkens met een negatieve test dichtgezet (`tests/test_audio_check.py`):
1. ffmpeg ontbrak op de runner; de versiecontrole in de workflow maskeerde dat. Nu expliciet geïnstalleerd.
2. Bij het zoeken naar referenties kwamen er verwante Zuid-Amerikaanse sijzen en een onbepaalde opname mee. Nu geldt: exacte soortnaam in titel of categorie, en het xeno-canto-type moet passen.
3. Eén gemengde koor-opname diende als referentie voor zowel zang als roep. Nu: minimaal 2 unieke referenties, gemengde opnamen geweigerd.
4. Een verwarringssoort met één referentie liet een kandidaat door. Nu moet elke verwarringssoort ≥ 2 referenties hebben.

**Resultaat:** 0 van 5 kandidaten publiceerbaar, alle **NOT TESTED**. Bronlabel en visuele spectrogramcontrole passen bij de soort, maar de akoestische referentievergelijking kan niet worden uitgevoerd: er zijn te weinig onafhankelijke referenties voor Sijs en Kneu. Er staat dus geen opname in de app. Details: `docs/media-intake/2026-11-16/audio_candidates_r10.json` en `.../audiocheck/`.
