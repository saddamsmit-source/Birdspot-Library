# Aviandra — merkbesluit en implementatiebasis (AVI-01A, DRAFT)

**Eigenaarbesluit:** 26 november 2026. **Status:** inhoudelijke ontwerpkeuze geaccepteerd, technische integratie NOT TESTED, merk-/domeinrechten UNKNOWN, **release HOLD**.
**Repository (voorlopig technisch identiek):** `saddamsmit-source/Birdspot-Library`. **Gecontroleerde base:** PR #370, `1cb52274ce39dce19d22b69864063025efe6917d`; parallelle PR #371 heeft een andere actieve writerclaim, geen codewijzigingen daarop.
**Functie van dit document:** één appspecifiek ontwerp- en naamsbesluit bij de bestaande README; geen nieuwe algemene norm of vervanging van Handbook/Kwaliteitsnorm/Veldhandboek.

## 1. Definitieve ontwerpkeuzes van de eigenaar

- **Zichtbare merknaam:** **Aviandra** (niet "Birdspot Library"). Intern blijft "Birdspot" tijdelijk als technisch project-/historisch naamspoor herkenbaar.
- **Goedgekeurd logo:** het aangeleverde grote **A-beeldmerk met groene sierlijke vleugel en kleine gouden ster** op een lichte ivoorkleurige afgeronde tegel. Respecteer de exacte verhoudingen en richting van de eigenaarreferentie; geen vrij ontworpen vervanglogo.
- **Goedgekeurde voorpagina:** de tweede door de eigenaar aangeleverde mobiele screenshot; **dezelfde opstelling**, zonder de Birdspot-bedieningsroutes, gegevens of bewijsetiketten te veranderen.
- **Kleuren:** hergebruik de bestaande Birdspot-tokens, niet het eerder als nieuwe huisstijl voorgestelde alternatieve palet.
- **Slogan:** "Discover birds differently." is een **concept**, nog niet uitdrukkelijk als definitieve slogan goedgekeurd; niet stilzwijgend overal opnemen.

### Visueel referentiebewijs (aangeleverd door eigenaar)

1. Logoafbeelding: chatbijlage `36033.jpg`, feitelijk WEBP, 1269 × 1536 px, SHA-256 `28ec9c92bb8eef4b5f69f9ac343971194574ce8e5dabfbfba66c681af182196f`.
2. Voorpagina: chatbijlage `36036.jpg`, feitelijk WEBP, 753 × 1536 px, SHA-256 `5c5814e37e0277eb71d3e06e0a7027e4c78abeb6eca2ada58f3ebdfe63f126ec`.
3. Eerdere onafhankelijke schermproef: `Aviandra_Concept_V0.1.zip`, SHA-256 `395946fab710c5e372f25dc8ff6066f54dfbb7cb72f879ca8e6a53787efa8970`; uitsluitend **demo**, geen bron van waarnemingen of functies.

**Duurzame bronkopieën in persoonlijke Library:** `/Aviandra_Logo_GOEDGEKEURD_2026-11-26.webp` (22.696 bytes; gelijk aan logo-SHA hierboven) en `/Aviandra_Home_GOEDGEKEURD_2026-11-26.webp` (41.962 bytes; gelijk aan Home-SHA hierboven). Deze goedgekeurde referenties blijven als brondesign bewaard, maar zijn geen runtime-appiconen en nog niet in GitHub opgenomen.

**Assetstatus:** eigenaarreferenties zijn in het gesprek beschikbaar; **nog niet als runtime- of GitHub-binaire assets geïntegreerd**. Voor implementatie eerst de echte bronbestanden onder versiebeheer brengen, correct benoemen met hun werkelijke bestandsformaat en logo getrouw als schaalbaar/vector/maskable asset afwerken. Een mockup of screenshot is niet automatisch een gebruiksgerechtigde vogelgidsfoto.

## 2. Kleuren en typografie — bestaande app is leidend

Bron: `styles/tokens.css` op base `1cb52274`.

| Rol | Token/waarde | Toepassing |
|---|---|---|
| Diep bosgroen | `--brand: #17382C` | bovenkop, navigatie, logo-accent |
| Middengroen | `--brand-mid: #2D6A4F` | secundaire merkaccenten |
| Frisgroen | `--brand-light: #52B788` | primaire waarnemen-tegel en FAB |
| Hemelsblauw | `--accent: #4895EF` | focus/informatie en GPS |
| Warm ivoor | `--bg: #F8F4E8` | achtergrond |
| Gebroken wit | `--surface: #FFFCF4` | kaarten en zoekveld |
| Goud | `--selected-gold: #F2D18C` | kleine ster en spaarzaam accent |
| Ink | `--ink: #172820` | tekst op lichte kaarten |

Letterrichting bestaande bron: `--font-display: P052 / Palatino / Georgia / serif`, `--font-body: Nimbus Sans / system-ui / sans-serif`. Gebruik fallback zonder meegeleverde commerciële fontbestanden. Bestaande donkerethema-tokens en contrastnormen behouden.

## 3. Exacte volgorde en componenten van de goedgekeurde voorpagina

**Van boven naar beneden**, naar het beeld op de 753 × 1536-referentie:

1. **Bosgroene bovenkop:** links compact A-vleugel-beeldmerk + woordmerk `AVIANDRA` in witte ruime kapitalen; rechts ronde knop Profiel. Respecteer safe area en bestaande profielroute.
2. **Zoekveld op een eigen brede regel:** gebroken wit, afgerond en vergrootglas, placeholder "Zoek een vogel, geluid of plek…". Behoud bestaande globale zoeklogica en resultaten.
3. **Drie even brede actiekaarten:** `Ontdekken` (ivoor), `Waarnemen` (heldergroen, centraal), `Mijn collectie` (ivoor); met vaste iconen en minimaal 44 × 44 px tikdoelen. Behoud bestaande routering: soorten, `#homeCoreObserve → #fab`, waarnemingen.
4. **Grote fotokaart/hero** op lichte ondergrond met compacte zijmarges en ronde hoeken. Bestaande `featuredCarousel`: echte licentie-onderbouwde vogelbeelden, categorie/dots, "VANDAAG IN BEELD", grote soortnaam, wetenschappelijke naam en CTA `Bekijk soortkaart`. IJsvogel in de mockup is een **illustratieve soort**, geen vaste of verzonnen actuele selectie. Donkere tekstgradient voor leesbaarheid, credits/attributie blijven toegankelijk.
5. **Drie statistiekkaarten** naast elkaar: `Soorten`, `Waarnemingen`, `Hotspots`. Echte gebruikersgegevens via bestaande telregels, geen mockupgetallen. De huidige `Media`-statistiek mag niet als functie verdwijnen; toegang blijft via Mijn collectie of een bestaande route en vereist gerichte regressie.
6. **Weer & gouden uur** eronder in diepgroene afgeronde kaart met GPS-/weertoestand. Gebruik huidige locatiearchitectuur, live GPS waar beschikbaar en eerlijke status (laatst bekend/handmatig/onbekend), nooit een gefingeerde locatie of "Live GPS in echte app" als runtime tekst.
7. **Onderste vaste navigatie**, in deze volgorde: `Home` · `Soorten` · centrale verhoogde ronde `+` / `Waarnemen` · `Kaart` · `Profiel`. Bestaande router, open-draft/terug-gates en toegankelijkheid intact; geen nieuwe parallelle route.
8. Alle onderliggende Home-inhoud zoals maandgrafiek, recente waarnemingen, vogelstatistieken en hotspots blijft functioneel en terugvindbaar; de screenshot toont maar het **bovenste deel** van de scrollbare voorpagina. Niet verwijderen omdat iets buiten het screenshot valt.

Deze volgorde is een visuele acceptatie-eis. Schaal mee voor 320/360/390/430 px, zoom, safe areas, lichte/donkere modus en beperkte beweging. "Exacte layout" betekent dezelfde hiërarchie, compositie, kaartverhoudingen en knoppen, niet hard-coded voorbeelddata of letterlijke schermpixels op elk toestel.

## 4. Fasering, writerveiligheid en acceptatie

### AVI-01A — dit docs-only werkspoor
- Leg de eigenaarbesluiten vast in deze ene ontwerpbrief en in de app-README.
- Bewaar historische Birdspot-vermeldingen, SHA's, F3-dossiers, herstelpunten en bestaande L-ID's. **Geen globaal zoeken/vervangen in historische bewijsdocumenten.**
- FINAL APP-System-Index v3.14, Handbook v2.18, Projectinstructies v2.14, Birdspot-kwaliteitsnorm v1.10 en Veldhandboek v0.10 blijven canoniek totdat afzonderlijke documentrevisie/activering expliciet is aangetoond.
- **Geen wijziging aan appcode, sw.js, manifest, cache, gebruikersdata of GitHub repo-naam** in AVI-01A.
- De actieve codewriter op PR #371 niet hinderen; dit is een aparte branch vanaf het vrijgegeven #370-checkpoint.

### AVI-01B — naam, logo en metadata in echte app (apart werkspoor)
- Kies een vrijgegeven basischema ná de lopende GPS-/F3-branch. Writerclaim vóór inhoudelijke commits.
- Vervang zichtbare namen waar functioneel: `index.html`, `manifest.webmanifest`, header, splash/boot, appiconen, install prompt/over-tekst en relevante actuele README-/releasenotities. Interne opslagkeys (`birdspot-*`), database-namen, API-koppelingen, URL-routes en ZIP-/CSV-schema's **niet hernoemen** zonder afzonderlijk bewezen migratie.
- Maak 192/512/maskable icon assets en een juiste splash; bewaak donkere/licht thema's en de toegankelijkheid. Verhoog `APP_VERSION` alleen volgens één versiebron, test SW-upgrade op dezelfde origin.
- GitHub repo-slug `Birdspot-Library` pas na apart link-/Pages-/Vercel-/CI-impactonderzoek wijzigen; zichtbaar merk ≠ git-naam.

### AVI-02 — voorpagina precies naar screenshot, zonder regressie
- Pas bestaande Home-componenten en CSS aan; behoud handlers, route-identiteit, bron- en foto-credits, eerlijke BirdNET/Merlin-verificatie, GPS-herstel, privacy, opslag en F3-kwaliteitsnorm.
- Foto uit mockup niet als echte vogelgidsfoto importeren; gebruik reeds geautoriseerde collectie/diashowmedia.
- Test: openen → zoeken/ontdekken → waarnemen → opslaan → heropenen; leeg/fout/offline/annuleren/terug/restore/ZIP; AS-01; GPS; F3; 320–430 px en TalkBack. Visuele vergelijking tegen eigenaarreferentie. Geen release-PASS op alleen CI.

### AVI-03 — review en beveiligde eigenaarpreview
- Na onafhankelijke read-only QA op exacte SHA en een apart eigenaarakkoord maximaal één beveiligde Vercel-preview, afhankelijk van actuele capaciteit (UNKNOWN totdat gecontroleerd). Geen productie/publicatie.
- Fysieke Android/PWA, foto, media, GPS en opname afzonderlijk testen. RELEASE HOLD tot expliciet `zet live`.

## 5. Verificatiegrenzen

- Niet vaststellen dat domein/merken `Aviandra` juridisch beschikbaar zijn; dit is nog **UNKNOWN**. De eigenarenkeuze is een interne product-/ontwerpbeslissing, geen bewijs van merkregistratie.
- De nieuwe naam mag geen dataherstel, cache- of gebruikersmigratie initiëren. Bestaande ID's en gebruikersdata blijven ongewijzigd.
- F3-telling volgt uitsluitend actuele repo; op checkpoint #370: 140/140 eerst bekeken, 12/140 in tweede beoordeling, 0 volledige F3-PASS. Geen automatische promotie bij rebranding.
- De grafische referentie heeft geen functie als vervangende gelicentieerde gidsmedia.

**Eindmarkering: EINDE AVI-01A DRAFT · release HOLD.**
