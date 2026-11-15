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

  // Eigenaarregel: nooit lege fotovakken, vluchttekorten of tekst-only vergelijkingstabbladen tonen.
  assert.ok(!html.includes('Nog geen passende foto') && !html.includes('Nog geen passende vluchtfoto'),
    `FV-06 verwarrende lege vergelijkingsfoto: ${s.id}`);
  // Onvolledige fotovergelijkingen blijven uitsluitend in de bronaudit beschikbaar.
  for (const panel of comparisons.split('<div class="sd-cmp-panel"').slice(1)) {
    const head = panel.split('<div class="sd-cmp-rows"')[0].split('<div class="sd-cmp-foot"')[0];
    const photos = [...head.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1]);
    assert.equal(photos.length, 2, `FV-06 elke zichtbare vergelijking vereist twee foto’s: ${s.id}`);
    assert.equal(photos.length, new Set(photos).size, `FV-06 dubbel in hetzelfde paar: ${s.id}`);
    const inFlight = panel.startsWith(' data-cmp-panel data-cmp-flight');
    for (const path of photos) {
      assert.ok(media.has(path), `FV-06 ongeregistreerde foto: ${path}`);
      assert.equal(media.get(path), inFlight, `FV-06 verkeerde houding: ${s.id} ${path}`);
    }
  }
}
assert.ok(checked >= 590 && flightSections >= 10);
const verifiedJuvenileComparisonEntries = GUIDE_COMPARISONS.filter(e => e.birds.filter(b => b.plumage === 'juv').length >= 2);
assert.equal(verifiedJuvenileComparisonEntries.length, 30, 'FV-06: expected 30 juvenile comparisons including the F2-26 resting pair');
assert.ok(verifiedJuvenileComparisonEntries.some(entry => entry.label === 'Goudhaantje en Vuurgoudhaan · juvenielen' &&
  entry.birds.some(b => b.id === 'sp063' && b.plumage === 'juv') &&
  entry.birds.some(b => b.id === 'sp064' && b.plumage === 'juv')),
  'FV-06: F2-15 juvenielenpaar ontbreekt in de actuele telling');
assert.ok(verifiedJuvenileComparisonEntries.some(entry => entry.label === 'Putter en Sijs · juvenielen in rust' &&
  entry.birds.some(b => b.id === 'sp037' && b.plumage === 'juv') &&
  entry.birds.some(b => b.id === 'sp038' && b.plumage === 'juv')),
  'FV-06: F2-16 perched juvenile Putter/Sijs pair missing');
assert.ok(verifiedJuvenileComparisonEntries.some(entry => entry.label === 'Appelvink en Vink · juvenielen in rust' &&
  entry.birds.some(b => b.id === 'sp041' && b.plumage === 'juv') &&
  entry.birds.some(b => b.id === 'sp035' && b.plumage === 'juv')),
  'FV-06: F2-17 juveniele Appelvink/Vink vergelijking ontbreekt');
for (const [label, ids] of [
  ['Huismus en Ringmus · juvenielen in rust', ['sp043', 'sp044']],
  ['Merel en Zanglijster · juvenielen in rust', ['sp045', 'sp046']],
]) {
  assert.ok(verifiedJuvenileComparisonEntries.some(entry => entry.label === label &&
    ids.every(id => entry.birds.some(b => b.id === id && b.plumage === 'juv'))),
    'FV-06: F2-18 requires both registered juvenile photos for ' + label);
}
assert.ok(verifiedJuvenileComparisonEntries.some(entry => entry.label === 'Zanglijster en Kramsvogel · juvenielen in rust' &&
  ['sp046','sp047'].every(id => entry.birds.some(b => b.id === id && b.plumage === 'juv'))),
  'FV-06: F2-19 requires two registered juvenile Song Thrush/Fieldfare photos');
for (const [label, ids] of [
  ['Zanglijster en Grote Lijster · juvenielen in rust', ['sp046', 'sp049']],
  ['Roodborst en Roodborsttapuit · juvenielen in rust', ['sp050', 'sp053']],
]) {
  assert.ok(verifiedJuvenileComparisonEntries.some(entry =>
    entry.label === label && ids.every(id => entry.birds.some(b => b.id === id && b.plumage === 'juv'))),
    'FV-06: F2-20 must contain real registered paired juvenile photographs: ' + label);
}
// F2-21: matching, source-registered resting portraits are visible on BOTH species cards.
// The contract checks photo roles/paths, not the biological identity of WebP pixels.
for (const [label, ids, images] of [
  ['Roodborsttapuit en Roodborst · vrouwtje en volwassen vogel in rust',
    ['sp053', 'sp050'], ['sp053-female-review.webp', 'sp050.webp']],
  ['Heggenmus en Huismus · vrouwtje Huismus in rust',
    ['sp054', 'sp043'], ['sp054.webp', 'sp043.webp']],
  ['Winterkoning en Heggenmus · in rust',
    ['sp055', 'sp054'], ['sp055.webp', 'sp054.webp']],
]) {
  const entry = GUIDE_COMPARISONS.find(pair => pair.label === label);
  assert.ok(entry, `F2-21 pair missing: ${label}`);
  assert.deepEqual(entry.birds.map(bird => bird.id), ids, `F2-21 wrong partner/order: ${label}`);
  for (const id of ids) {
    const html = recognitionPanel(byId.get(id));
    const panels = html.split('<div class="sd-cmp-panel"').slice(1);
    assert.ok(panels.some(panel =>
      !panel.startsWith(' data-cmp-panel data-cmp-flight') &&
      images.every(image => panel.includes(image))),
    `F2-21: both resting images must render together on ${id} for ${label}`);
  }
}

// F2-22: exactly three paired, source-registered resting photos of the three Phylloscopus
// species are used in reciprocal comparisons; flight positions stay unclaimed.
for (const [label, ids, paths] of [
  ['Fitis en Tjiftjaf · rustbeeld en zang', ['sp057', 'sp056'], ['sp057.webp', 'sp056.webp']],
  ['Fitis en Fluiter · in rust', ['sp057', 'sp058'], ['sp057.webp', 'sp058.webp']],
  ['Tjiftjaf en Fluiter · in rust', ['sp056', 'sp058'], ['sp056.webp', 'sp058.webp']],
]) {
  const matches = GUIDE_COMPARISONS.filter(pair => pair.label === label);
  assert.equal(matches.length, 1, `F2-22 missing/duplicated comparison ${label}`);
  assert.deepEqual(matches[0].birds.map(bird => bird.id), ids,
    `F2-22 incorrect pair of species for ${label}`);
  assert.equal(Boolean(matches[0].flight), false, `F2-22 may not promote an uncertain flight photo: ${label}`);
  for (const id of ids) {
    const html = recognitionPanel(byId.get(id));
    const panels = html.split('<div class="sd-cmp-panel"').slice(1);
    assert.ok(panels.some(panel => !panel.startsWith(' data-cmp-panel data-cmp-flight') &&
      paths.every(path => panel.includes(path))),
      `F2-22 expected both distinct resting photographs in ${id} for ${label}`);
  }
}
assert.ok(byId.get('sp058').fieldmarks.includes('helderwitte buik'));
assert.equal(byId.get('sp058').plumage.juv, null,
  'F2-22: unverified Wood Warbler juvenile plumage must remain unknown');

// F2-23: adult male/female Blackcap + Garden Warbler, Whitethroat/Braamsluiper.
// Assert registered resting images appear on BOTH species cards; no flight fallback.
for (const [label, ids, images] of [
  ['Zwartkop en Tuinfluiter · kop en zang', ['sp059', 'sp060'], ['sp059.webp', 'sp060.webp']],
  ['Zwartkop en Tuinfluiter · vrouwtje in rust', ['sp059', 'sp060'], ['sp059-adult_f.webp', 'sp060.webp']],
  ['Grasmus en Tuinfluiter · rustbeeld', ['sp061', 'sp060'], ['sp061.webp', 'sp060.webp']],
  ['Grasmus en Braamsluiper · vleugel en zang', ['sp061', 'sp062'], ['sp061-hero-male.webp', 'sp062.webp']],
]) {
  const entries = GUIDE_COMPARISONS.filter(pair => pair.label === label);
  assert.equal(entries.length, 1, `F2-23 missing/duplicated comparison: ${label}`);
  const [entry] = entries;
  assert.deepEqual(entry.birds.map(bird => bird.id), ids, `F2-23 wrong partner order: ${label}`);
  assert.equal(Boolean(entry.flight), false, `F2-23 must not invent flight image: ${label}`);
  assert.equal(entry.rows?.length, 3, `F2-23 requires three grounded fieldmarks: ${label}`);
  for (const id of ids) {
    const html = recognitionPanel(byId.get(id));
    const panels = html.split('<div class="sd-cmp-panel"').slice(1);
    assert.ok(panels.some(panel => !panel.startsWith(' data-cmp-panel data-cmp-flight') &&
      images.every(image => panel.includes(image))),
    `F2-23 two distinct resting photos required from ${id}: ${label}`);
  }
}
const blackcapFemale = GUIDE_COMPARISONS.find(entry =>
  entry.label === 'Zwartkop en Tuinfluiter · vrouwtje in rust');
assert.equal(blackcapFemale.birds[0].plumage, 'adult_f',
  'F2-23 female Blackcap pair must use source-registered female, not juvenile');
assert.equal(byId.get('sp060').plumage.juv, null,
  'F2-23 Garden Warbler juvenile age not independently proven');
assert.ok(byId.get('sp060').fieldmarks.includes('zonder afgetekend petje'),
  'F2-23 Garden Warbler lacks strongly marked cap');

// F2-24: compare only actual resting images in two-way panels, not adult photos passed off as juveniles.
for (const [label, ids, images] of [
  ['Braamsluiper en Tuinfluiter · kop en zang in rust', ['sp062', 'sp060'], ['sp062.webp', 'sp060.webp']],
  ['Witte en Gele Kwikstaart · volwassen in rust', ['sp068', 'sp069'], ['sp068.webp', 'sp069.webp']],
]) {
  const entries = GUIDE_COMPARISONS.filter(e => e.label === label);
  assert.equal(entries.length, 1, `F2-24 missing/duplicated pair: ${label}`);
  assert.deepEqual(entries[0].birds.map(bird => bird.id), ids, `F2-24 wrong partner IDs: ${label}`);
  assert.equal(entries[0].rows?.length, 3, `F2-24 three useful distinction rows required: ${label}`);
  for (const id of ids) {
    const html = recognitionPanel(byId.get(id));
    const panels = html.split('<div class="sd-cmp-panel"').slice(1);
    assert.ok(panels.some(panel =>
      !panel.startsWith(' data-cmp-panel data-cmp-flight') &&
      images.every(image => panel.includes(image))),
      `F2-24 two registered resting photos required from ${id}: ${label}`);
  }
}
const youngWagtails = GUIDE_COMPARISONS.find(e => e.label === 'Witte en Gele Kwikstaart · jonge vogels');
assert.ok(youngWagtails?.birds.every(bird => bird.photoMissing),
  'F2-24 no source-verified White/Yellow Wagtail juveniles pair: do not show adult photos as young');
for (const id of ['sp068', 'sp069']) {
  const html = recognitionPanel(byId.get(id));
  assert.ok(!html.includes('Nog geen passende foto'),
    `Owner UX: avoid missing-image placeholder on Wagtail species ${id}`);
  assert.ok(html.includes('sp068.webp') && html.includes('sp069.webp'),
    `Owner UX: preserve adult paired photos for Wagtails ${id}`);
  assert.ok(!html.includes('Witte en Gele Kwikstaart · jonge vogels'),
    `Owner UX: no empty juvenile comparison tab for ${id}`);
}
assert.equal(byId.get('sp062').plumage.juv, null,
  'F2-24 no independently verified Lesser Whitethroat juvenile detail');
assert.ok((GUIDE_POSES.sp068 || []).some(photo => photo.flight),
  'F2-24 previously verified White Wagtail flight must remain');
assert.ok(!(GUIDE_POSES.sp069 || []).some(photo => photo.flight),
  'F2-24 Yellow Wagtail landing photo cannot enter true-flight role');

// F2-25: correct photographic pairs on BOTH cards, including true flight as a separate tab.
for (const [label, ids, images, flight] of [
  ['Veldleeuwerik en Graspieper · in rust', ['sp070', 'sp072'], ['sp070.webp', 'sp072.webp'], false],
  ['Veldleeuwerik en Graspieper · in vlucht', ['sp070', 'sp072'], ['sp070-flight.webp', 'sp072-flight.webp'], true],
  ['IJsvogel en Bijeneter · keel en snavel', ['sp075', 'sp257'], ['sp075.webp', 'sp257.webp'], false],
]) {
  const pairs = GUIDE_COMPARISONS.filter(entry => entry.label === label);
  assert.equal(pairs.length, 1, `F2-25 absent or duplicated comparison: ${label}`);
  const pair = pairs[0];
  assert.deepEqual(pair.birds.map(b => b.id), ids, `F2-25 unexpected species order: ${label}`);
  assert.equal(Boolean(pair.flight), flight, `F2-25 photo pose mismatch: ${label}`);
  assert.equal(pair.rows?.length, 3, `F2-25 requires 3 evidence-based field mark rows: ${label}`);
  for (const id of ids) {
    const html = recognitionPanel(byId.get(id));
    const panels = html.split('<div class="sd-cmp-panel"').slice(1);
    assert.ok(panels.some(panel =>
      panel.startsWith(' data-cmp-panel' + (flight ? ' data-cmp-flight' : '')) &&
      (flight || !panel.startsWith(' data-cmp-panel data-cmp-flight')) &&
      images.every(path => panel.includes(path))),
      `F2-25 must show two registered ${flight ? 'flight' : 'rest'} images on ${id}: ${label}`);
  }
}
for (const id of ['sp070', 'sp072', 'sp075']) {
  assert.ok((GUIDE_POSES[id] || []).some(photo => photo.flight === true),
    `F2-25 previously registered real flight photo must be preserved for ${id}`);
}
assert.equal(byId.get('sp070').plumage.juv, null,
  'F2-25: do not present unsourced generic Skylark juvenile as individually established');

// F2-26: compare matching age groups, with the older juvenile rather than the coot chick.
for (const [label, images, plumage] of [
  ['Meerkoet en Waterhoen · volwassen', ['sp078.webp', 'sp079.webp'], undefined],
  ['Meerkoet en Waterhoen · jonge vogels', ['sp078-juv-grown.webp', 'sp079-juv.webp'], 'juv'],
]) {
  const pair = GUIDE_COMPARISONS.find(entry => entry.label === label);
  assert.deepEqual(pair.birds.map(bird => [bird.id, bird.plumage]), [
    ['sp078', plumage], ['sp079', plumage],
  ]);
  assert.equal(pair.rows.length, 3);
  for (const id of ['sp078', 'sp079']) {
    const panels = recognitionPanel(byId.get(id)).split('<div class="sd-cmp-panel"').slice(1);
    assert.ok(panels.some(panel => !panel.startsWith(' data-cmp-panel data-cmp-flight') &&
      images.every(image => panel.includes(image))), `F2-26 missing age-matched pair: ${id} ${label}`);
  }
}
for (const id of ['sp078', 'sp079']) {
  const html = recognitionPanel(byId.get(id));
  assert.ok(html.includes('aria-label="In vlucht"'), `F2-26 existing separate flight photo missing: ${id}`);
  assert.ok(!html.includes('data-cmp-panel data-cmp-flight'), `F2-26 must not pair differently aged flight photos: ${id}`);
}
const greatCrestedGrebe = recognitionPanel(byId.get('sp077'));
assert.ok(greatCrestedGrebe.includes('sp077-juv.webp'));
assert.ok(!greatCrestedGrebe.includes('data-cmp-panel') && !greatCrestedGrebe.includes('aria-label="In vlucht"'));

// F2-27: one registered, reciprocal photo pair per season, age or posture.
for (const [label, ids, photos, flight] of [
  ['Kleine en Grote Zilverreiger · buiten broedkleed', ['sp082', 'sp083'],
    ['/assets/species/plumage/sp082-winter.webp', '/assets/species/sp083.webp'], false],
  ['Kleine en Grote Zilverreiger · broedkleed', ['sp082', 'sp083'],
    ['/assets/species/plumage/sp082-breeding.webp', '/assets/species/plumage/sp083-breeding.webp'], false],
  ['Kleine en Grote Zilverreiger · in vlucht', ['sp082', 'sp083'],
    ['/assets/species/sp082.webp', '/assets/species/plumage/sp083-flight.webp'], true],
  ['Blauwe Reiger en Purperreiger · volwassen', ['sp081', 'sp084'],
    ['/assets/species/plumage/sp081-portrait.webp', '/assets/showcase/sp084.webp'], false],
  ['Blauwe Reiger en Purperreiger · jonge vogels', ['sp081', 'sp084'],
    ['/assets/species/plumage/sp081-juv.webp', '/assets/species/plumage/sp084-juv-europa.webp'], false],
  ['Blauwe Reiger en Purperreiger · in vlucht', ['sp081', 'sp084'],
    ['/assets/species/sp081.webp', '/assets/species/plumage/sp084-flight.webp'], true],
]) {
  const entries = GUIDE_COMPARISONS.filter(entry => entry.label === label);
  assert.equal(entries.length, 1, `F2-27 absent or duplicated pair: ${label}`);
  const [entry] = entries;
  assert.deepEqual(entry.birds.map(({id, photo}) => [id, photo]), ids.map((id, i) => [id, photos[i]]));
  assert.equal(Boolean(entry.flight), flight);
  assert.equal(entry.rows.length, 3);
  for (const id of ids) {
    const panels = recognitionPanel(byId.get(id)).split('<div class="sd-cmp-panel"').slice(1);
    const matches = panels.filter(panel =>
      panel.startsWith(' data-cmp-panel data-cmp-flight') === flight &&
      photos.every(photo => panel.includes(`data-guide-image="${photo}"`)));
    assert.equal(matches.length, 1, `F2-27 wrong rendered pair: ${id} ${label}`);
    assert.ok(panels.every(panel => !panel.includes('sp083-juv.webp')),
      `F2-27 nest-stage image must remain outside comparison: ${id}`);
  }
}

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
