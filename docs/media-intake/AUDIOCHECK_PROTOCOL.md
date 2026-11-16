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
