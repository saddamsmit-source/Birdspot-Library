# Birdspot S1 · Android-achtige JPEG-mediaroute — QA ronde 8/8

**Datum:** 13 november 2026 · **Status:** AUTOMATED CHROMIUM VERIFIED / PHYSICAL ANDROID NOT TESTED / RELEASE NO-GO.  
**Basis:** PR #172 `8c8a24bcd9816c60498898d8ddcc9d9c162bfe9d`, incl. releasekandidaat v1.27.7 uit PR #171.  
**Geteste code-SHA:** `263ba9ea735a1f5e99bbb2cb71fa22c91cd6dcc3`. GitHub [Actions-run 43393159816](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43393159816): **1/1 job completed/success**, CAM-01..06 allen PASS.

## 1. Aanleiding en gecontroleerde broncode

`src/features/sightings/addSheet.js` kiest uit `image/*,video/*`, valideert het gekozen bestand via `openMediaPreview` (`src/utils/validateMedia.js`) en schrijft via `changePhotos` naar IndexedDB vóór het vastleggen van de waarneming. Een onleesbaar beeld wordt voor opslag afgewezen, met een zichtbare gebruikersmelding. Bij falende opslag hoort het formulier open te blijven.

De vorige S1-offlinepilot gebruikte een synthetische **PNG**. Een Android-achtige **JPEG** met EXIF-oriëntatie, afwijzing van corrupte foto, herstel na fout en offline heropening waren nog niet als één doorlopende UI-route getoetst. Dit nieuwe bewijs is géén claim dat elke Android-camera, HEIC/HEIF, permissiedialoog of native OS-versie werkt.

## 2. Werkelijke tests op exacte commit

Testscript: `tests/test_android_media_preflight.py`, workflow `.github/workflows/android-media-preflight-qa.yml`. Er is één eigen synthetisch 64×48 RGB JPEG gemaakt (EXIF Orientation 6 en TEST_ONLY-omschrijving, géén GPS/privé-inhoud), plus een willekeurige ongeldige JPEG-byte-string. Browseromgeving: headless Chromium, viewport 390×844, mobile/touch-emulatie, echt geïnstalleerde controlling SW, echte offline netwerkmodus en app-UI. Geen directe toevoeging van de testwaarneming aan localStorage.

| Check | Handeling | Logresultaat |
|---|---|---|
| CAM-01 | Echte lokale serviceworker installeren en controle over de app bevestigen | PASS |
| CAM-02 | Offline corrupte JPEG selecteren; gebruikersmelding, formuliervelden en afwezigheid van ongewenste opslag controleren | PASS |
| CAM-03 | Geldige JPEG met EXIF-oriëntatie na fout opnieuw selecteren; preview moet decoderen en invoer blijft bestaan | PASS |
| CAM-04 | Via echte Opslaan-knop één waarneming en originele JPEG/EXIF bytes in IndexedDB opslaan | PASS |
| CAM-05 | App sluiten, browser offline heropenen; record, thumbnail, details en originele JPEG opnieuw vinden | PASS |
| CAM-06 | Geen onverwachte JS-paginafouten | PASS |

### Onafhankelijkheidsgrens

Dit bevestigt **alleen de webapp-/bestandsinput-/opslagroute in mobiel Chromium**. De test gebruikt `set_input_files`, niet de fysieke galerij-/camera-interface. Android Camera2, Samsung Foto's, HEIC/HEIF-ondersteuning, bestandstoestemming, Android hardware-/systeem-Back, echte GPS, daglicht, PWA-installatie en ZIP-herstel op twee telefoons blijven **NOT TESTED**. Het resultaat vervangt niet de AND-01..09-praktijkpilot uit `docs/pilot/ANDROID_S1_FYSIEKE_PILOT_v0.1_DRAFT.md`.

## 3. Directe vervolgstap op een echt Android-toestel

Gebruik de **afzonderlijke lokale localhost-checkout** van de exact bevroren kandidaat en de bestaande USB-`adb reverse`-instructies uit het Android-pilotdocument. Maak een fictieve waarneming met een echte, onschuldige camera-/galerij-JPEG. Controleer een bewust onleesbaar fotobestand, herstel door een tweede geldige foto te kiezen, sluit de app en open volledig offline opnieuw. Test daarnaast de standaard Android-camera-indeling afzonderlijk: als deze HEIC/HEIF levert, registreer feitelijke ondersteuning of melding als een nieuwe toesteltest, zonder aannames vanuit deze JPEG-proef.

Leg de toesteltest-IDs AND-01..09 met observaties/evidence-ID's vast via `tools/pilot/android_field_report.py` **buiten de openbare repo**. Bij ontbrekend apparaat of tweede telefoon: markeer NOT TESTED/BLOCKED. Geen upload van echte foto's, GPS, toestelidentificatie, ZIP of ruwe logs naar GitHub.

## 4. QA, kennis, rollback en kosten

- **Wel bewezen:** na een onleesbare invoer kan de gebruiker dezelfde invoerroute veilig hervatten en echte JPEG-bytes offline behouden. Dit versterkt bestaande fout-/retry-/media- en persistentieregels in het Handbook, zonder nieuwe algemene norm.
- **Niet bewezen:** fysieke foto-/camerarechten, alle camerabestandsformaten, native Android-Back, mobiele productieperformance, eigen gebruikersgegevens of tweede toestel.
- **Geen productcodefix nodig** voor de geteste route; app/SW/soortregistraties/media zijn niet gewijzigd. De tests gebruiken alleen synthetische bestanden.
- **Writer:** ChatGPT eigen QA-branch. **Herstelbasis:** PR #172 `8c8a24bc`; bij bezwaar PR #173 sluiten. `main`, openbare reviewbranch en releasekandidaat v1.27.7 blijven onaangeroerd.
- **Kosten:** eigen GitHub Actions CI; daadwerkelijke minuten/betalingen UNKNOWN, geen betaalde hosting of extra appservices ingeschakeld.
- **Status:** document DRAFT, geautomatiseerde mediacontrole VERIFIED op exacte testcode, fysieke S1-praktijkpilot NOT TESTED, release NO-GO.

**Laatste bewezen volledige app-/release-kandidaat:** PR #171 `83c117447126b705cae1899f71e66d070a6084b9` (13/13 workflows PASS). Nieuwe tests in deze branch bewijzen een specifiek aanvullend pad, geen nieuwe integrale app-release.
