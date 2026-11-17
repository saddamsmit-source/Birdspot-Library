# Birdspot F3-R12 — Huismus, Ringmus, Merel

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r12-media-huismus-ringmus-merel-20261116` · **PR:** #272 (concept) · **Base:** PR #271 @ `7af086b7`
**Normen:** Handbook v2.17 FINAL, Projectinstructies v2.13 FINAL, Index v3.12 FINAL, Veldhandboek v0.7 FINAL, kwaliteitsnorm v1.7. Werkwijze volgens eigenaarsinstructie 16-11 16:06 (zelfstandige ontwikkeling en eigen QA).

## 1. Daadwerkelijk gecontroleerd

| Onderdeel | Methode | Uitkomst |
|---|---|---|
| **Alle 14 getoonde foto's tegen het bronbeeld** | Nieuwe `origcheck`-modus (GitHub Actions): Commons-miniatuur 800 px of iNaturalist-origineel, Pearson-correlatie (r ≥ 0,90, ook in uitsnede), zij-aan-zij visueel | 13 dezelfde opname (r 0,90–1,00); Ringmus-juveniel (diepe iNaturalist-uitsnede, r 0,53) visueel dezelfde scène (hek, braam, houding) |
| **Rechten** | Actuele Commons-auteur en -licentie tegen het register | Gelijk; Merel-vluchtfoto: auteursnotatie gelijkgetrokken ("Bengt Nyman from Vaxholm, Sweden"); "CC0 1.0" vs "CC0" alleen notatie |
| **Rollen en vlucht** | Visuele beoordeling per foto | Huismus 5/5 juist. Ringmus: vluchtfoto bleek een **luchtgevecht met poten naar voren** → uit de vluchtrol (Overige, bestand en historie bewaard). Merel: alles juist, vrije-vluchtfoto blijft voorwaardelijk |
| **Nieuwe Ringmus-vluchtfoto** | Discover → 1600 px-voorvertoning → import met geregistreerde uitsnede | Mildeep, CC BY-SA 4.0, bron-SHA-1 `d50be2c4`; vrij in de lucht, geen poten of ondergrond; r = 1,00 tegen de voorvertoning |
| **Audio** | Audiocheck-protocol (bronlabel + referentievergelijking + spectrogram) | Merel-zang **bevestigd** (marge 0,35 tegen Zanglijster/Spreeuw); Merel-alarmroep **NOT TESTED** (niet onderscheidend; behouden, niet als geverifieerd gemarkeerd); Huismus-roep (Joseph Sardin, CC0) **gepubliceerd** na triangulatie (marge 0,13 tegen Ringmus); Huismus-zang en Ringmus-geluid **niet gepubliceerd** (te weinig Ringmus-referenties) |

Geen enkele audio-uitkomst geldt als menselijke luistercontrole; register-label: "niet door mens beluisterd".

## 2. Gebreken gevonden en hersteld in deze ronde

1. **Audiocheck toetste tegen alle soorten in de run:** een Merel-zang viel af op een ontbrekende Ringmus-referentie. Nu tellen alleen de verwarringssoorten uit het kennisprofiel, elk met ≥ 2 referenties. Test toegevoegd.
2. **Licentie-URL `http://` uit Commons:** het register eist https. De intake normaliseert nu creativecommons.org-URL's. Gevonden door `test_guide_poses`; test toegevoegd.
3. **Import kon geen uitsnede:** de geregistreerde uitsnede staat nu in `modifications`. Negatieve tests voor ongeldige uitsneden.
4. **Audio-import was alleen mogelijk na menselijk luisteren.** Nu ook na een consistente audiocheck, maar alleen als het rapport hetzelfde bestand (SHA-1), dezelfde soort en geluidsoort én een visuele beoordeling bevat. Zes negatieve tests.

## 3. Nog open

- Huismus: zang; Ringmus: zang en roep (referenties op Commons onvoldoende).
- Merel: vervanging van de voorwaardelijke vrije-vluchtfoto; alarmroep onbevestigd.
- Sovon, eBird, ANWB, biometrie met twee uitgevers; tweede onafhankelijke review; fysiek toestel en preview (**BLOCKED**).

## 4. Tests

Lokaal: alle `tests/*.mjs` behalve `test_photo_feedback.mjs` (lokaal geen `sharp`); Python intake/audio/origcheck/M20/M22/soortdata/detail/kennis; Chromium R10/R11/R12-lookalike, kennisbaseline, soortaudit, idb-showcase. CI: zie PR #272.

## 5. Volgende veilige stap

F3-R13: Zanglijster (`sp046`), Kramsvogel (`sp047`), Koperwiek (`sp048`) vanaf de head van deze branch, met origcheck en audiocheck.
