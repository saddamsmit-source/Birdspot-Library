# Birdspot — Samsung-PWA-proef via Windows + USB (startkaart)

**Datum:** 16-11-2026, herzien 17-11-2026 (QA: echte offlineproef, installatiemenu) · **Status:** DRAFT · **Kandidaat:** branch `fix/birdspot-pwa-integratie-r16-20261116`, SHA `c8a12af1aa6391cb9fe804e900fc48d755c107d0`, APP_VERSION `1.27.31` (PR #281).

## Wat deze proef wel en niet bewijst

- **Wel:** installeren als echte app, startschermicoon, offline koud starten, updateknop en gegevensbehoud **op `http://localhost:8765`**.
- **Niet:** gegevensbehoud of updates op de vaste link `https://saddamsmit-source.github.io/Birdspot-Library/`. Dat is een andere origin met eigen opslag. Die proef volgt pas na jouw "zet live".
- Gebruik alleen fictieve waarnemingen en onschuldige testfoto's.

## Eenmalig voorbereiden (Windows)

1. Installeer **Git for Windows** en **Python 3** (vink "Add to PATH" aan).
2. Installeer **Android Platform Tools** (ADB) en zet de map in PATH.
3. Samsung: *Instellingen → Telefoon-info → Software-informatie →* 7× op **Buildnummer** tikken. Daarna *Instellingen → Ontwikkelaarsopties →* **USB-foutopsporing** aan.
4. Sluit de telefoon via USB aan en tik op de telefoon **Toestaan** bij "USB-foutopsporing toestaan?".

## Starten

Open PowerShell in de map met `Start-BirdspotAndroidPilot.ps1` en voer uit:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-BirdspotAndroidPilot.ps1 -CandidateBranch 'fix/birdspot-pwa-integratie-r16-20261116' -ExpectedSha 'c8a12af1aa6391cb9fe804e900fc48d755c107d0' -ExpectedVersion '1.27.31' -ConnectUsb
```

Het script stopt bij een verkeerde SHA, een gewijzigde checkout, een onverwachte origin, een bezette poort of ≠ 1 toestel. Het luistert alleen op `127.0.0.1` en publiceert niets. Verwacht: `VERIFIED: candidate … / APP_VERSION …`.

## Proef op de Samsung (Chrome)

Noteer vooraf: Android-versie (*Instellingen → Telefoon-info → Software-informatie*) en Chrome-versie (*Chrome → ⋮ → Instellingen → Over Chrome*).

| # | Stap | Verwacht |
|---|---|---|
| 1 | Chrome → `http://localhost:8765/` | Birdspot opent; onder back-up staat "Versie 1.27.31" |
| 2 | Menu ⋮ → noteer **letterlijk** de optie(s): "App installeren", "Installeren" of "Toevoegen aan startscherm" | Zie de beslisregel hieronder; "Toevoegen aan startscherm" is nog **geen** FAIL |
| 3 | Kies die optie en lees de **vervolgdialoog** letterlijk (bijv. "Installeren" of "Toevoegen"); bevestig | Noteer de tekst |
| 4 | Open Birdspot via het **nieuwe startschermicoon** | Zie beslisregel |
| 5 | Sla 1 fictieve waarneming met een testfoto op | Zichtbaar in de lijst |
| 6 | **Echte offlineproef:** 1) USB-kabel **loskoppelen**; 2) **vliegtuigstand aan**; 3) controleer dat **wifi en mobiele data uit** staan; 4) Birdspot **volledig sluiten** (recente apps → wegvegen); 5) opnieuw openen via het **startschermicoon** | App opent; de waarneming en de foto zijn er. Alleen dán offline PASS — zolang de kabel aangesloten is, kan de Windows-server nog bereikbaar zijn |
| 7 | Offline nog 1 waarneming opslaan; in een detailscherm **Android Terug**; een formulier **annuleren** | Terug gaat één scherm terug; annuleren bewaart niets |
| 8 | ZIP-export maken | Bestand in Downloads |
| 9 | Vliegtuigstand uit, kabel terug. Update-proef alleen als de launcher met een nieuwere kandidaat opnieuw is gestart | Melding nieuwe versie → **Bijwerken** → zelfde icoon, gegevens intact |
| 10 | Klaar: Ctrl+C in PowerShell | Server stopt, USB-doorsturing verwijderd |

**Beslisregel installatie (stap 2–4):**
- **Echte installatie:** opent vanaf het icoon zonder adresbalk (eigen venster), staat in de recente-apps-lijst als "Birdspot" en meestal ook in de app-lade, en/of de dialoog zei "Installeren".
- **Snelkoppeling:** opent als Chrome-tabblad mét adresbalk. Noteer de exacte menutekst, dialoogtekst en versies; geen PASS.
- **Onbeslist:** opent zonder adresbalk, maar het menu of de dialoog was onduidelijk. Leg een schermafbeelding vast van het menu en van de geopende app; dan beoordelen we samen.

Noteer per stap: PASS / FAIL / NIET UITGEVOERD, Chrome-versie, Android-versie en de exacte tekst bij een fout. Deel geen echte locaties of privéfoto's.
