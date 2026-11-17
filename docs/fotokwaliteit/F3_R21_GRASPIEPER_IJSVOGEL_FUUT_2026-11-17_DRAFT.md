# F3-R21 · Graspieper, IJsvogel en Fuut — voorbereidende onafhankelijke QA

**Datum:** 17 november 2026 · **Status:** DRAFT / PARTIALLY TESTED · **PR:** #288 (ChatGPT QA-spoor) · **Base:** F3-R20 PR #287 @ `8eb25a087bcc9f9976d341e115d71d9993848084` · **Release:** HOLD.

## Scopebesluit — niet de numerieke soort-ID's volgen
De oorspronkelijke F3-cohort bevat 140 records. Na sp070 volgen in de F3-volgorde:
- **sp072 Graspieper** — 3 huidige lokale beelden, 0 opnamen.
- **sp075 IJsvogel** — vóór deze correctie 6 huidige lokale beelden, 0 opnamen.
- **sp077 Fuut** — 2 huidige lokale beelden, 1 opname.

De voormalige overdrachtstekst "sp071–sp073" is niet de F3-cohortvolgorde: sp071 en sp073 zijn wel algemene app-soorten, maar zitten niet in de lopende 140-selectie. Deze QA-spoor vergroot de scope niet.

## Uitgevoerde onafhankelijke foto-preflight — 11 lokale beelden
Alle 3 + 6 + 2 lokale WebP-bestanden uit het toenmalige F3-register zijn rechtstreeks geopend op de exacte basiscode. Dit is **visuele inspectie van lokale bestanden**, geen nieuw bewijs van originele bytes, individu, eigenaarsrechten, soortdeterminatie of fysieke mobiele gebruikerservaring. Eerste observaties:
- **sp072:** hoofdfoto laat een gestreepte pieper zien, juvenielentab toont een jongachtig verenkleed, vluchtbeeld toont een individuele vogel met uitgespreide vleugels in de lucht. Veldkenmerken en juvenielen-ID nog tegen twee werkelijk gelezen onafhankelijke bronnen te controleren. Geen audio.
- **sp075:** mannetjesportretten en een beeld met oranje ondersnavelbasis bij het gelabelde vrouwtje, vluchtbeeld daadwerkelijk luchtgedragen. Een aparte overige portretfoto blijft behouden. **De bestaande juvenielenrol is niet voldoende bewezen** (zie hieronder). Geen audio.
- **sp077:** volwassen fuut en een gestreept jong op water zijn zichtbaar. De ene bestaande roepopname is deze ronde niet onafhankelijk beluisterd of op soort/type getoetst.

**Bewijsstatus F3:** de daadwerkelijke volledige R21-kennis-/bron-/audio-/UI-/bronrechtenaudit is nog niet afgerond. `60/140` inhoudelijk opnieuw bekeken, `80 NOT STARTED`, `0 FULL PASS` blijven daarom onveranderd in het canonieke register.

## Risicovondst — sp075-juv-review.webp
- **Oorspronkelijke bronpagina:** https://commons.wikimedia.org/wiki/File:Common_Kingfisher_2025_08_30_01.jpg . Direct geopend op 17-11-2026. Bestandsomschrijving noemt **"A female common kingfisher"**. De categorieën bevatten **zowel female als juvenile**; de leeftijd is daarmee niet eenduidig bevestigd. Maker: Alexis Lours. Bestandslicentie: CC BY 4.0 (hergebruik onder toepasselijke attributie-/bewerkingsvoorwaarden).
- **Bestaande app:** `GUIDE_POSES.sp075` toonde dit beeld onder het specifieke label **Juveniel** (met `age: juvenile`) en M6 had dat eerder `goedgekeurd` gemarkeerd.
- **Conclusie:** de foto bewijst niet overtuigend dat de vogel een juveniel is. Dit is een **onbewezen leeftijdsclaim, niet het bewijs van het tegendeel**. De foto wordt voor het specifieke juvenielentabblad **niet vrijgegeven** totdat een onafhankelijke deskundige/geschikte bron de leeftijd bevestigt.
- **Minimale omkeerbare correctie:** alleen het getoonde specifieke beeld/rol uit `assets/species/field-guide-media.json` verwijderd en bronmetadata, originele bestandsverwijzing en reden bewaard onder `retired.sp075`. Bestand `/assets/species/plumage/sp075-juv-review.webp` blijft behouden. `src/features/species/guideMedia.js` opnieuw gelijkgemaakt met het canonieke register; historische audit behoudt de asset met `retiredIn: F3-R21-QA`; M6 en F3-live-sloten bijgewerkt. Andere IJsvogelfoto's ongewijzigd.
- **Regressie:** `tests/test_f3_r21_ijsvogel_juvenile_hold.mjs` controleert het echte herkenningspaneel, generatorregistratie, audit en bestandsbehoud. CI-workflow `f3-r21-ijsvogel-qa.yml` controleert ook F3-cohort, soortaudit en idempotente generator. Testresultaat apart rapporteren op exacte nieuwe SHA.

## Vervolg R21 (inhoudelijk nog open)
1. Behandel sp072/sp075/sp077 afzonderlijk tegen werkelijk gelezen Vogelbescherming, ANWB indien toegankelijk, juiste Sovon-ID, passende onafhankelijke biometriebron, en brondifferentiatie. Onbereikbare eBird-/ANWB-bron blijft BLOCKED/NOT TESTED, zonder elders valse PASS.
2. Originele foto-individuen, rollen en attribuering (inclusief onzekere sp075-juveniel) nazoeken; verschil tussen metadata/licentie en biologische determinatie vastleggen. Nieuwe media uitsluitend met gevalideerde rechten en beeldcontrole.
3. Audio Fuut: originele opname én geluidstype beoordelen; geen soort/type VERIFIED uit bronlabel alleen. Graspieper en IJsvogel hebben geen geregistreerde audio.
4. Test vergelijkingstekst/foto's, mobiele zoom/terug, credit, offline, annuleren en daadwerkelijke opslag-/restore-route op een gezamenlijke SHA. Samsung-installatie 1.27.31/PR #281 blijft een afzonderlijke praktijkgate.
5. Geen merge, Pages/Vercel-deploy of livegang zonder expliciet eigenaarbesluit en releasebewijs.

**Bewijsgrens:** foto's voor preflight geopend; bron van de IJsvogelfoto en haar licentie gelezen. Andere externe media-/soortbronnen en fysieke appproeven **NOT TESTED** in deze QA-correctieronde. Fotogegevens zijn géén persoonlijke gebruikersdata; bestaande gebruikerswaarnemingen zijn niet gewijzigd.
