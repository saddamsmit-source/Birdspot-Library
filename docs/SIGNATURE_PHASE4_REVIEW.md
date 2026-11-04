# Birdspot Signature Edition — Fase 4: Wildlife Film Studio

**Status:** REVIEW. Geen merge of productiepublicatie zonder nieuw expliciet akkoord.

## Implementatie
- Eigen scherm: donkere cinematic Film Studio, te openen vanuit Home en Media Studio.
- Geselecteerde foto’s en videoclips komen uit de bestaande `birdspot-film-selection` en de eigen IndexedDB-mediastore.
- Storyboard-voorbeeld met volgorde, navigatie, beeld- en clipvoorbeelden.
- Filmvolgorde is persistent en opgenomen in de bestaande ZIP-back-up; ongeldige volgorde wordt geweigerd.
- Eigen titel, 16:9 liggend / 9:16 staand, 3 of 5 seconden per beeld, limiet 20 geselecteerde clips.
- Échte browserexport via canvas, `captureStream` en `MediaRecorder`; kiest ondersteund MP4 of WebM.
- Rustige foto-zoom, titelkaart, kleuren, outro, soortnaam en locatie uit echte waarnemingen.
- Export leidt tot een echt afspeelbaar videobestand met een downloadactie op het eigen apparaat.
- Geen automatische upload, geen gefingeerde waarnemingen, geen wijziging of verwijdering van originele bestanden.
- Optie export annuleren. Na navigatie worden lopende taken gestopt en tijdelijke object-URL’s opgeruimd.

## Duidelijke grenzen
- Deze eerste Film Studio produceert **stille filmbeelden**. Er wordt geen audiotrack of Artlist-muziek aan toegevoegd.
- Een gelimiteerde montage (max 20 clips) verkleint risico op geheugenproblemen op mobiel, maar lost grote bestanden niet volledig op.
- WebM/MP4-beschikbaarheid is afhankelijk van `MediaRecorder` en ondersteuning van de browser. Niet-ondersteunde browsers tonen uitleg en bewaren de selectie.
- Dit is geen native video-editor; geen multicam, AI-editing, serverrender of geavanceerde kleurcorrectie.
- Gedownloade films worden nog niet als apart mediabestand in de Birdspot-bibliotheek opgenomen.
- Artlist-credits niet gebruikt: persoonlijke beelden en een lichtgewicht lokale export hebben prioriteit.
- Oorspronkelijke videosound wordt niet gemixt in de stille film. Bij audiomontage is een aparte, transparante uitbreidingsfase nodig.

## QA & release
- `tests/test_signature_phase4.py` test lege Studio, synthetische foto en echte video-Blob, volgorde opslaan, 16:9/9:16, export, echt bestand downloaden en onaangetaste bronbestanden.
- De bestaande Phase 1–3 regressies moeten eveneens PASS blijven.
- Werkelijke telefoon, grote bestanden, WebM/MP4 op Safari en outdoor-optimalisatie vereisen aparte toestel-QA.
- Geen merge naar `main` zonder expliciet akkoord.
