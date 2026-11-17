# Birdspot — Samsung-PWA-proef via Windows + USB (startkaart)

**Datum:** 16-11-2026 · **Status:** DRAFT · **Kandidaat:** de exacte branch, volledige SHA en APP_VERSION staan in het laatste checkpoint-commentaar van PR #281 (een bestand kan niet naar zijn eigen commit verwijzen).

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

Open PowerShell in een map met een kopie van het script `tools/pilot/Start-BirdspotAndroidPilot.ps1` en voer uit (waarden uit PR #281):

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-BirdspotAndroidPilot.ps1 `
  -CandidateBranch '<branch uit PR #281>' `
  -ExpectedSha '<volledige 40-tekens-SHA uit PR #281>' `
  -ExpectedVersion '<APP_VERSION uit PR #281>' `
  -ConnectUsb
```

Het script stopt bij een verkeerde SHA, een gewijzigde checkout, een onverwachte origin, een bezette poort of ≠ 1 toestel. Het luistert alleen op `127.0.0.1` en publiceert niets. Verwacht: `VERIFIED: candidate … / APP_VERSION …`.

## Proef op de Samsung (Chrome)

| # | Stap | Verwacht |
|---|---|---|
| 1 | Chrome → `http://localhost:8765/` | Birdspot opent; versie onder Instellingen/back-up gelijk aan APP_VERSION |
| 2 | Menu ⋮ → **App installeren** (of de installatiebalk) | Tekst "Installeren"/"App installeren". Zie je alleen **"Toevoegen aan startscherm"** of "Snelkoppeling maken", dan is het geen echte installatie: noteer exact wat er staat en stop |
| 3 | Installeren, dan het **Birdspot-icoon** op het startscherm openen | Opent zonder adresbalk (standalone), groen Birdspot-icoon |
| 4 | Fictieve waarneming + testfoto opslaan | Zichtbaar in de lijst |
| 5 | **Vliegtuigstand aan**, app volledig sluiten (recente apps → wegvegen), opnieuw via icoon | Opent offline; waarneming en foto aanwezig |
| 6 | Nog een waarneming offline opslaan; **Android Terug** in een detailscherm; een formulier **annuleren** | Terug gaat één scherm terug, annuleren bewaart niets |
| 7 | ZIP-export maken | Bestand verschijnt in Downloads |
| 8 | Vliegtuigstand uit. Update-proef: alleen als de launcher met een nieuwere kandidaat opnieuw is gestart | Melding nieuwe versie → **Bijwerken** → zelfde icoon, gegevens intact |
| 9 | Klaar: Ctrl+C in PowerShell | Server stopt, USB-doorsturing verwijderd |

Noteer per stap: PASS / FAIL / NIET UITGEVOERD, Chrome-versie, Android-versie en de exacte tekst bij een fout. Deel geen echte locaties of privéfoto's.
