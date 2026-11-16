# Birdspot F3-R15 — Roodborsttapuit, Heggenmus, Winterkoning

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r15-media-roodborsttapuit-heggenmus-winterkoning-20261116` · **PR:** #278 · **Base:** PR #277 @ `af7d100f`

## Bronnen (werkelijk gelezen op 16-11-2026)

| Bron | Roodborsttapuit | Heggenmus | Winterkoning |
|---|---|---|---|
| Vogelbescherming | soortpagina | soortpagina | soortpagina (gebruikt *Nannus troglodytes*) |
| ANWB-vogelgids | NOT TESTED (geen toegankelijke editie) | idem | idem |
| Sovon | 18.000–22.000 paren; sterke toename sinds 1990 | 175.000–225.000 paren; lichte significante afname sinds 1990 | 410.000–630.000 paren; toename sinds 1990, afname laatste 12 jaar |
| eBird | BLOCKED (botcontrole op soortpagina en printlijst; geparkeerd, niet omzeild) | idem | idem |
| Wikimedia Commons | origcheck 4 foto's | origcheck 1 foto + import juveniel | origcheck 2 foto's |
| Aanvullend | Blasco-Zumeta & Heinze; VBN Paapje, Roodborst | Blasco-Zumeta & Heinze; RSPB; VBN Huismus, Ringmus | Blasco-Zumeta & Heinze; VBN Boomkruiper |

## Uitkomst per soort

| Soort | Foto's tegen bronbeeld | Rollen | Gecorrigeerd | Open |
|---|---|---|---|---|
| Roodborsttapuit `sp053` | 4/4 zelfde opname (r ≥ 0,999), rechten gelijk aan Commons | 2 mannetjes, vrouwtje, juveniel juist | — | Vrije vlucht (enige kandidaat zat op prikkeldraad); status "Standvogel" uit de canonieke lijst botst met VBN "wegtrekkend" en Sovon (max. 200–1000 overwinteraars) → als bronverschil vastgelegd, lijst niet stil gewijzigd |
| Heggenmus `sp054` | 1/1 (r = 1,00) | Volwassen juist | Lengte 13–14 → **ca. 13–15 cm** (VBN 13–14,5 + BZH 13–15); **juvenielenfoto toegevoegd** (caroline legg, CC BY 2.0, SHA-1-gepind); familie "Heggenmussen"; nieuwe vergelijking met Ringmus; misleidende ondertitel "Vrouwtje Huismus in rust" onder de Heggenmus hersteld | Vrije vlucht (geen Commons-kandidaat); VBN "stabiel" tegen Sovon "afname" vastgelegd |
| Winterkoning `sp055` | Hoofdfoto r = 1,00; juveniel uitsnede r = 0,848 → visueel dezelfde opname | Volwassen en juveniel (gele mondhoek) juist | Boomkruiper-vergelijking kreeg 3 brongedragen regels | Vrije vlucht (zoekopdracht leverde alleen ongerelateerde bestanden); Boomkruiper-foto's in eigen ronde |

**Biometrie (norm §1.1):** lengte van alle drie met twee uitgevers bevestigd. Spanwijdte en gewicht hebben geen tweede uitgever en blijven open.

**Dubbelgangers:** LK-023 nu aan beide kanten bronbeeld-gecontroleerd. Nieuw: LK-025 Roodborsttapuit–Paapje (alleen tekst; Paapje heeft geen foto, paneel verborgen), LK-026 Heggenmus–Huismus-vrouwtje, LK-027 Heggenmus–Ringmus, LK-028 Winterkoning–Heggenmus, LK-029 Winterkoning–Boomkruiper. In Chromium beide richtingen getest op 320/360/390 px.

**Geluid:** geen opnamen; BLOCKED volgens audioprotocol v0.2.

**Correctie tijdens de ronde:** een vermeende SHA-1-afwijking bij de Winterkoning-juveniel bleek een leesfout: in kleedfoto's is `sha1` de hash van het lokale bestand (81 van 83 items) en die klopt. Niets gewijzigd.

**Tests (lokaal):** 20/20 `tests/*.mjs` (excl. `test_photo_feedback.mjs`, lokaal geen `sharp`), Python-dataset, Chromium R13/R14/R15-lookalikes, kennisbaseline, audiostatus, soortaudit, mobiele eigenaarreview; generatoren idempotent; 2 mutatietests (oude ondertitel, oude maat) falen correct. CI: zie PR #278. Toestel en preview: NOT TESTED.

**Volgende veilige stap:** F3-R16 — Tjiftjaf (`sp056`), Fitis (`sp057`), Fluiter (`sp058`).
