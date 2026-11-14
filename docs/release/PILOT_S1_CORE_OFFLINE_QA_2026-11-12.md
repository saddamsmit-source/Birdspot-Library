# Birdspot S1 · geïntegreerde offline kernroute — QA-checkpoint

**Datum:** 12 november 2026 · **DRAFT / review only** · **App:** Birdspot Library · **Repository:** `saddamsmit-source/Birdspot-Library`.

## Scope en exacte bron
- **Reviewbasis:** PR #167, `fb71e4ad4cb14c08052fde47c4505031743dd63c` — bevat eerdere spechtenaudit/foto-QA, maar geen nieuwe gidsmedia.
- **Testimplementatie:** PR #168 op `qa/birdspot-pilot-core-offline-20261112`; het eerste bewezen testcheckpoint is `fb18135b4a6f1d7af8b48e58a533bf46d88234b7`.
- **Niet gewijzigd:** `main` `5bf67043e830e977749f0ee593cf9f41f0e2822b`, bestaande GitHub Pages-reviewbranch `21ce9060f789103cfbba98fa78f6b53f4b9cea5b`, foto-/soortdata en gebruikersgegevens.
- **Werkwijze:** alleen fictieve gegevens, localhost en GitHub Actions; geen Vercel, GitHub Pages-deployment, merge of livegang.

## Werkelijk uitgevoerd en bewijs op eerste checkpoint

GitHub Actions [run 43314401416](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43314401416), **commit `fb18135b4a6f1d7af8b48e58a533bf46d88234b7`**, alle **vier** jobs completed/success:

| Controle | Feitelijk resultaat | Bewijsgrens |
|---|---|---|
| PILOT-01 | Werkelijke actieve serviceworker; precached app-shell op localhost | Chromium, niet fysieke telefoon |
| PILOT-02 | App eerst gesloten, dan netwerk echt offline; nieuw fictief record via FAB, soortpicker, formulier en Opslaan, met gedecodeerde PNG via file-input; één record in localStorage, exact dezelfde fotobytes in IndexedDB | Geen echte camera/GPS |
| PILOT-03 | Nieuwe offline browserpagina; dezelfde waarneming, foto-thumbnail en details via Waarnemingen-UI teruggezien | Zelfde browserprofiel, géén tweede toestel |
| PILOT-04 | Geen onverwachte JS-paginafouten | Geen volledige handmatige UX- of performance-audit |
| BR-01..07 | ZIP met foto/plek/onbekend veld; corrupt bestand geweigerd; annuleren zonder mutatie; echte import herstelt foto+metadata; tweede import maakt geen duplicaat; veiligheidsrollback werkt | Los geïsoleerd synthetisch profiel, geen historische externe imports |
| Navigatie | Browser Back/Forward, geneste terugactie, kaart/soortschermen, malformed record zonder overschrijven | Door de test geëmuleerde kaartklasse; niet echte GPS/kaarttegels |
| RU-01..07 (1.14.0→1.27.6) | Echte serviceworker-upgrade; alle vooraf bestaande gebruiker-sleutels/IDB-foto behouden; offline opnieuw gidsfoto gedecodeerd; geen paginafouten | Testprofiel en oude exact vastgezette SHA |
| RU-01..07 (1.27.5→1.27.6) | Idem met handmatig toepassen update; na twee herladingen huidige versie zichtbaar | Geen test 1.27.6→nieuwe cacheversie |

**Browser:** Chromium/Playwright 390×844, mobiele touch-emulatie. **S1-pilot:** technisch **PARTIALLY TESTED**; de genoemde geautomatiseerde routes VERIFIED op die SHA.

## Open gates voor volledige fysieke pilot en release

1. **REAL DEVICE REQUIRED:** Android PWA/installatie (en iOS indien doelplatform), camera/bestandskiezer, foto en geluid, terugnavigatie, daglichtcontrast, echte GPS en kaarttegels.
2. **Herstel op tweede toestel:** maak een ZIP van echte representatieve fictieve data en herstel deze op een schoon ander apparaat. Test oude import, onbekende velden en beschadigd bestand op een toestel.
3. **Foutpaden:** bij nieuwe/gewijzigde waarneming opslagquota/foutinjectie, annuleren, ontbrekende toestemming; controleer media/plek-rollback. Codepad is eerder elders onderzocht, maar niet opnieuw in dit pilotworkflow getest.
4. **Serviceworker:** vóór een latere nieuwe review-/productierelease een **nieuw** `APP_VERSION` en echt release-SHA vastleggen. De huidige bron- en appcode gebruiken nog `1.27.6`, net als de bestaande review; een wijziging met dezelfde cacheversie is géén bewezen update van 1.27.6 naar nieuw werk.
5. **Integratie:** PR-stapel is niet gemerged; controleer daarvóór overlap, vereiste CI, licenties, persoonsgegevens, rollback en doorlopende feitelijke schrijver.
6. **Kosten/operatie:** bestaande GitHub CI gebruikt; werkelijke minuten/kosten en hostingdrempels UNKNOWN. Twee identieke workflows werden bij eerste PR-aanmaak gestart (push én pull_request). Wijzig de workflow naar één PR-trigger voordat verder wordt opgeschaald.

## Learnings, bronbehoud en herstel

- **Wel:** bestaande release- en backuptests hergebruikt; nieuwe offline-creatie getoetst via echte UI en fotobytes. ZIP-validatie en SW-upgrade als aparte bewijsfamilies gerapporteerd.
- **Niet bewezen:** onafhankelijke fysieke ervaring, echte camerarechten, live hosting, publiceerbaarheid van gidsmedia, second-device restore.
- **Fout/oorzaak:** dubbele CI door twee workflowtriggers; geen appdefect vastgesteld. Maatregel: PR-trigger aanhouden; expliciet job/commitbewijs blijven bewaren.
- **Herstel:** PR #168 sluiten herstelt de reviewpositie PR #167 `fb71e4ad`. Code-rollback is geen herstel van echte gebruikersdata, daarom vóór release ZIP-herstelproef op doeltoestel uitvoeren.
- **Bronbehoud:** nul mutaties aan gidsmedia, bronregisters, localStorage van gebruikers of productietakken. Documentstatus DRAFT ≠ app-release-PASS.
- **Kennisdelta:** versterking van bestaande regels §1.6, §1.7A, §4.4 en CAP-BIRD-040; geen nieuwe algemene learning-ID nodig. Hercontroleer documentactivering: APP-System-Index v3.10 verwijst naar Projectinstructies v2.12, maar in deze sessie is alleen v2.11 daadwerkelijk beschikbaar.

**Releaseadvies:** NO-GO voor productie. Houd PR #168 als technische QA-kandidaat; eerst CI op laatste exacte head, daarna echte toestelpilot en afzonderlijke releasebeslissing.
