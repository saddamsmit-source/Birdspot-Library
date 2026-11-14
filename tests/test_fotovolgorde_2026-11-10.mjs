/**
 * Birdspot Library — vaste fotovolgorde per soortkaart (Opdracht 3, 10-11-2026)
 * "Birdspot Library — eerst alfabetische vogels en definitieve fotovolgorde"
 *
 * Dekking (§6 van de opdracht), uitsluitend op de bestaande foto's — er zijn in deze ronde
 * geen nieuwe fotobatches toegevoegd (§5: "Start nog niet met nieuwe fotobatches"):
 *   FV-01  Fotosecties staan in exact deze volgorde, voor elke soort die een sectie heeft:
 *          Verenkleed (hoofdfoto staat al bovenaan de kaart, buiten dit panel) -> In vlucht ->
 *          Lijkt op. Sinds FQA-03 (ChatGPT-QA 10-11-2026, eigenaarsbesluit) is de vluchtvergelijking een
 *          tabblad "In vlucht" in de ene kaart per gelijkende soort binnen "Lijkt op", geen eigen blok meer.
 *   FV-02  "In vlucht" is altijd een eigen, herkenbare sectie (aria-label="In vlucht"), nooit
 *          samengevoegd met "Overige herkenningsfoto's" of met Verenkleed.
 *   FV-03  Beide vluchtgeslachten zijn zichtbaar wanneer beide bevestigd geregistreerd staan
 *          (bewezen op sp249 Blauwe Kiekendief: Mannetje + Vrouwtje + Juveniel, alle drie in vlucht).
 *   FV-04  Onbekend geslacht/leeftijd wordt nooit automatisch ingevuld: een vluchtfoto zonder
 *          sex/age-registratie krijgt nooit het label "Mannetje"/"Vrouwtje"/"Juveniel" en staat
 *          nooit met data-plumage="adult_m|adult_f|juv" (bewezen op sp008 Torenvalk: een bevestigd
 *          mannetje-in-vlucht naast een neutrale "In vlucht"-kaart zonder geslachtslabel).
 *   FV-05  Hoofdfoto, Verenkleed en In vlucht bevatten samen unieke foto's.
 *   FV-06  In Lijkt op is hergebruik toegestaan en mogen passende juvenielparen terugkomen.
 *   FV-07  Representatieve soorten (opzettelijk gekozen voor man/vrouw-verschil, meerdere
 *          vluchtfoto's, incomplete fotodekking en relevante vergelijkingen): sp173 Bruine
 *          Kiekendief, sp249 Blauwe Kiekendief, sp253 Ruigpootbuizerd, sp059 Zwartkop (geen
 *          vluchtdata — sectie moet dan afwezig zijn, niet leeg getoond), sp008 Torenvalk.
 *
 * Browsergebaseerde dekking (390 px + desktopbreedte, screenshots, zoom/pan, offline-cache,
 * filters/zoeken/sortering/navigatie) staat in tests/test_species_detail.py en
 * tests/test_species_groups_az.py — dit bestand toetst de volledige dataset puur op de
 * HTML-contract-laag (snel, geen browser nodig), zoals ook test_guide_poses.mjs al doet.
 *
 * Starten:  node tests/test_fotovolgorde_2026-11-10.mjs
 */
import assert from 'node:assert/strict';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const media = new Map();
for (const photo of [
  ...Object.values(GUIDE_PHOTOS),
  ...Object.values(GUIDE_PLUMAGE).flatMap(group => Object.values(group)),
  ...Object.values(GUIDE_POSES).flat(),
]) {
  if (photo.image) media.set(photo.image, Boolean(photo.flight) || media.get(photo.image) || false);
}

// ── FV-01 / FV-02 / FV-05 / FV-06 : over de volledige dataset ──────────────
let checked = 0;
let flightSections = 0;
for (const s of SPECIES) {
  const html = recognitionPanel(s);
  checked++;

  const verenkleed = html.indexOf('>Verenkleed<');
  const vlucht = html.indexOf('aria-label="In vlucht"');
  const vluchtvergelijking = html.indexOf('aria-label="Vluchtvergelijking"');
  const lijktOp = html.indexOf('>Lijkt op<');
  const positions = [verenkleed, vlucht, lijktOp].filter(i => i >= 0);
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b),
    `FV-01 fotosecties niet in de juiste volgorde: ${s.id}`);
  // FQA-03: geen losse sectie meer; vluchtvergelijkingen zijn tabbladen in de kaarten binnen "Lijkt op".
  assert.equal(vluchtvergelijking, -1, `FV-01 ${s.id}: losse sectie "Vluchtvergelijking" mag niet meer`);
  const firstFlightPanel = html.indexOf('data-cmp-flight');
  if (firstFlightPanel >= 0) {
    const sec = html.indexOf('<section class="sd-similar"');
    assert.ok(sec >= 0 && sec < firstFlightPanel && firstFlightPanel < html.indexOf('</section>', sec) + 1e9,
      `FV-01 ${s.id}: vluchtvergelijking staat niet binnen "Lijkt op"`);
  }
  if (vlucht >= 0) {
    flightSections++;
    // FV-02: "In vlucht" mag niet samenvallen met Verenkleed of Overige herkenningsfoto's.
    assert.ok(html.indexOf('aria-label="Overige herkenningsfoto') !== vlucht, `FV-02 ${s.id}`);
  }

  const [own, comparisons = ''] = html.split('<section class="sd-similar"');
  const hero = guideHeroPhoto(s.id)?.image;
  const images = [...own.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1]);
  if (hero) images.push(hero);
  assert.equal(images.length, new Set(images).size, `FV-05 dubbele gidsfoto: ${s.id}`);

  for (const panel of comparisons.split('<div class="sd-cmp-panel"').slice(1)) {
    const head = panel.split('<div class="sd-cmp-rows"')[0].split('<div class="sd-cmp-foot"')[0];
    const photos = [...head.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1]);
    assert.ok(photos.length <= 2, `FV-06 te veel foto's: ${s.id}`);
    assert.equal(photos.length, new Set(photos).size, `FV-06 dubbel in hetzelfde paar: ${s.id}`);
    const inFlight = panel.startsWith(' data-cmp-panel data-cmp-flight');
    for (const path of photos) {
      assert.ok(media.has(path), `FV-06 ongeregistreerde foto: ${path}`);
      assert.equal(media.get(path), inFlight, `FV-06 verkeerde houding: ${s.id} ${path}`);
    }
  }
}
assert.ok(checked >= 590 && flightSections >= 10);
assert.equal(GUIDE_COMPARISONS.filter(e => e.birds.filter(b => b.plumage === 'juv').length >= 2).length, 21);
const youngTits = GUIDE_COMPARISONS.find(entry => entry.label === 'Matkop en Glanskop · jonge vogels');
assert.deepEqual(youngTits.birds.map(({id, plumage}) => [id, plumage]), [['sp031', 'juv'], ['sp032', 'juv']]);
for (const id of ['sp031', 'sp032']) {
  const html = recognitionPanel(byId.get(id));
  const panel = html.split('<div class="sd-cmp-panel"').slice(1)
    .find(part => !part.startsWith(' data-cmp-panel data-cmp-flight') &&
      part.includes('sp031-juv.webp') && part.includes('sp032-juv.webp'));
  assert.ok(panel, `FV-06 jong Matkop/Glanskop-paar ontbreekt: ${id}`);
}
assert.equal(GUIDE_POSES.sp009.some(photo => photo.source === GUIDE_PHOTOS.sp009.source), false);
const buzzard = recognitionPanel(byId.get('sp005')).split('<section class="sd-similar"')[1];
assert.ok(buzzard.includes('In vlucht · Juveniel') && buzzard.includes('sp005-juv.webp') && buzzard.includes('sp253-juv.webp'));
assert.ok(buzzard.includes('In vlucht · Volwassen') && buzzard.includes('sp005-adult_m.webp') && buzzard.includes('sp253.webp'));
console.log(`FV-01/02/05/06 OK — ${checked} soorten, gidsfoto's uniek en vergelijkingsfoto's per houding gecontroleerd`);

// ── FV-07: representatieve soorten, exact bewijs per gekozen situatie ──────
function flightTitlesAndImages(html) {
  const section = html.match(/aria-label="In vlucht"[\s\S]*?<\/section>/);
  if (!section) return null;
  return {
    titles: [...section[0].matchAll(/<strong>([^<]*)</g)].map(m => m[1]),
    images: [...section[0].matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1]),
    plumageKeys: [...section[0].matchAll(/data-plumage="([^"]+)"/g)].map(m => m[1]),
  };
}

// sp173 Bruine Kiekendief — incomplete fotodekking: man/juv alleen als vluchtfoto (tekst-only in
// Verenkleed), plus een neutrale (geslachtsloze) oude vluchtfoto die niet verzonnen mag worden.
{
  const flight = flightTitlesAndImages(recognitionPanel(byId.get('sp173')));
  assert.ok(flight, 'sp173 hoort een "In vlucht"-sectie te hebben');
  // Vluchtcontrole 10-11-2026 (eigenaarseis "alleen echte vlucht"): de juveniele foto toont neerstrijken
  // in riet en staat sindsdien onder Verenkleed › Juveniel, niet meer onder "In vlucht".
  // FQA-01 (ChatGPT-QA 10-11-2026): het vrouwtje vliegt vrij (stond als kleedfoto zonder vluchtlabel) en
  // staat nu één keer onder In vlucht, met behoud van het label Vrouwtje.
  assert.deepEqual(flight.titles, ['Mannetje', 'Vrouwtje', 'In vlucht']);
  assert.equal(flight.plumageKeys.filter(k => k === 'adult_m').length, 1);
  {
    const html = recognitionPanel(byId.get('sp173'));
    const veren = html.split('aria-label="In vlucht"')[0];
    assert.ok(!veren.includes('sp173-adult_f.webp'), 'sp173 vrouwtje-vluchtfoto mag niet ook in Verenkleed staan');
    assert.ok(/data-plumage="adult_f"[\s\S]*?data-flight-ref/.test(veren) || veren.includes('sp173-female-rest'), 'sp173 Vrouwtje-kaart toont eigen rustfoto of verwijst naar In vlucht');
  }
  assert.ok(!flight.plumageKeys.includes('juv'), 'sp173 juveniel is geen vluchtfoto meer');
  assert.ok(flight.plumageKeys.includes('neutral'), 'sp173 hoort ook een neutrale (geslachtsloze) vluchtkaart te hebben');
  console.log('FV-07 sp173 OK — Mannetje + Vrouwtje (FQA-01) + neutrale vluchtfoto; juveniel neerstrijkend staat onder Verenkleed');
}

// sp249 Blauwe Kiekendief — man/vrouw-verschil én meerdere vluchtfoto's: alle drie rollen bevestigd
// in vlucht, geen enkele dubbel met Verenkleed.
{
  const html = recognitionPanel(byId.get('sp249'));
  const flight = flightTitlesAndImages(html);
  assert.deepEqual(flight.titles, ['Mannetje', 'Vrouwtje', 'Juveniel']);
  assert.equal(new Set(flight.images).size, flight.images.length, 'sp249 geen dubbele vluchtfoto');
  console.log('FV-07 sp249 OK — Mannetje + Vrouwtje + Juveniel alle drie bevestigd in vlucht (FV-03)');
}

// sp253 Ruigpootbuizerd — relevante soortvergelijking (met sp005 Buizerd) blijft bestaan,
// twee verschillende juveniele vluchtfoto’s staan ook onder Lijkt op.
{
  const html = recognitionPanel(byId.get('sp253'));
  const flight = flightTitlesAndImages(html);
  // FQA-01: ook de juveniel vliegt vrij (stond zonder vluchtlabel onder Juveniel).
  assert.deepEqual(flight.titles, ['Mannetje', 'Vrouwtje', 'Juveniel']);
  assert.ok(html.includes('>Lijkt op<'), 'sp253 vergelijking met Buizerd moet blijven bestaan');
  console.log('FV-07 sp253 OK — Mannetje + Vrouwtje + Juveniel (FQA-01) in vlucht, vergelijking met Buizerd blijft');
}

// sp059 Zwartkop — géén vluchtdata: de sectie moet volledig afwezig zijn, niet leeg getoond.
{
  const html = recognitionPanel(byId.get('sp059'));
  assert.ok(!html.includes('aria-label="In vlucht"'), 'sp059 mag geen (lege) "In vlucht"-sectie tonen');
  console.log('FV-07 sp059 OK — geen vluchtdata, dus geen (lege) "In vlucht"-sectie getoond');
}

// sp008 Torenvalk — FV-04 bewijs: een bevestigd mannetje-in-vlucht naast een neutrale, geslachtsloze
// vluchtfoto ("biddend") die nooit als Mannetje/Vrouwtje gelabeld mag worden.
{
  const html = recognitionPanel(byId.get('sp008'));
  const flight = flightTitlesAndImages(html);
  assert.deepEqual(flight.titles, ['Mannetje', 'In vlucht']);
  assert.ok(!flight.plumageKeys.includes('adult_f'), 'sp008 geen verzonnen vrouwtje in vlucht');
  console.log('FV-07/FV-04 sp008 OK — bevestigd mannetje-in-vlucht naast neutrale vluchtfoto zonder verzonnen geslacht');
}

// FV-08 (fotobaseline batch 1, 10-11-2026): toont de hoofdfoto een kleed (geslacht of gedeeld
// volwassen kleed) en heeft die kleedkaart na het verplaatsen van de vluchtfoto's geen eigen foto
// meer, dan verwijst de kaart naar de hoofdfoto. Vóór de fix: 12 soorten met een lege Mannetje-/
// Volwassen-kaart, o.a. sp090 Slobeend, sp130 Smient, sp132 Tafeleend, sp173, sp253.
{
  const { guideHeroPhoto } = await import('../src/features/species/detailSections.js');
  const role = p => p?.age === 'juvenile' ? 'juv' : p?.sex === 'male' ? 'adult_m' : p?.sex === 'female' ? 'adult_f' : undefined;
  const empty = [];
  for (const s of SPECIES) {
    const hero = guideHeroPhoto(s.id);
    if (!hero) continue;
    const key = role(hero) || (s.plumage?.adult_m && !s.plumage?.adult_f ? 'adult' : undefined);
    if (!key) continue;
    const html = recognitionPanel(s);
    const start = html.indexOf(`data-plumage="${key}"`);
    const flightAt = html.indexOf('aria-label="In vlucht"');
    if (start < 0 || (flightAt >= 0 && start > flightAt)) continue; // geen kleedkaart in Verenkleed
    const ends = [html.indexOf('data-plumage=', start + 1), html.indexOf('<section', start)].filter(i => i > 0);
    const card = html.slice(start, ends.length ? Math.min(...ends) : html.length);
    if (!card.includes('<img') && !card.includes('sd-hero-ref')) empty.push(s.id);
  }
  assert.deepEqual(empty, [], `FV-08 kleedkaart zonder foto én zonder hoofdfotoverwijzing: ${empty.join(', ')}`);
  for (const id of ['sp090', 'sp130', 'sp132', 'sp173', 'sp253']) {
    const html = recognitionPanel(byId.get(id));
    const start = html.indexOf('data-plumage="adult_m"');
    assert.ok(html.slice(start, start + 900).includes('sd-hero-ref'), `FV-08 ${id} Mannetje verwijst niet naar hoofdfoto`);
  }
  console.log('FV-08 OK — lege kleedkaart verwijst naar de hoofdfoto wanneer die dat kleed toont');
}

// FV-09: een gedeelde volwassen kleedgroep hoort vóór de juvenielenkaart.
{
  const html = recognitionPanel(byId.get('sp141'));
  const adult = html.indexOf('data-plumage="adult"');
  const juvenile = html.indexOf('data-plumage="juv"');
  assert.ok(adult >= 0 && juvenile > adult, 'FV-09 Gierzwaluw: Volwassen hoort vóór Juveniel');
  assert.ok(html.slice(adult, juvenile).includes('sd-hero-ref'), 'FV-09 Gierzwaluw: verwijzing naar hoofdfoto ontbreekt');
  console.log('FV-09 OK — gedeelde volwassen kleedgroep vóór Juveniel');
}

console.log('Fotovolgorde (Opdracht 3): alle controles geslaagd (FV-01..FV-09)');
