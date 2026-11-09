/**
 * Birdspot — bronaudit gidsfoto's 9-11-2026 (stap 1).
 *  V-01  De hoofdfoto komt niet nog eens voor in een kleedgalerij (Mannetje, Vrouwtje, Juveniel, Volwassen …).
 *  V-02  Soorten waarbij man en vrouw volgens de soortkaart op elkaar lijken, tonen geen foto met geslachtslabel.
 *  V-03  Donsjongen staan niet in de rol Juveniel, maar als eigen foto met label Donsjong(en).
 *  V-04  Bruine Kiekendief: de oude vluchtfoto heeft geen geslacht meer; Mannetje en vergelijking gebruiken een
 *        bevestigd volwassen mannetje.
 *  V-05  Nieuwe hoofdfoto's: bevestigd mannetje volgens de bron, SHA-1, maker, licentie en bron aanwezig,
 *        bestand bestaat als WebP zonder EXIF/XMP, en verschilt van de foto in de galerij Mannetje.
 *  V-06  Drieteenstrandloper: geen ongedocumenteerde leeftijd meer.
 * Starten: node tests/test_guide_photo_verification.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
import { guideHeroPhoto, guidePlumageGroups, recognitionPanel } from '../src/features/species/detailSections.js';

const root = new URL('../', import.meta.url);
const byId = new Map(SPECIES.map(s => [s.id, s]));
const verified = JSON.parse(readFileSync(new URL('tools/species/verified_heroes_2026-11-09.json', root)));
const pictured = new Set([...Object.keys(GUIDE_PHOTOS), ...Object.keys(GUIDE_POSES), ...Object.keys(GUIDE_PLUMAGE)]);

// V-01
let checked = 0;
for (const id of pictured) {
  const s = byId.get(id); if (!s) continue;
  const hero = guideHeroPhoto(id)?.image;
  for (const g of guidePlumageGroups(s)) {
    assert.ok(!g.photos.some(p => p.image === hero), `Hoofdfoto herhaald in galerij ${g.key}: ${id}`);
  }
  checked++;
}
assert.ok(checked >= 130, `te weinig kaarten gecontroleerd: ${checked}`);
console.log(`V-01 OK — ${checked} kaarten zonder herhaalde hoofdfoto`);

// V-02
for (const id of ['sp005', 'sp009', 'sp020']) {
  assert.equal(byId.get(id).guideReview?.similarSexes, true, `${id} hoort 'man en vrouw lijken op elkaar' te hebben`);
  const all = [GUIDE_PHOTOS[id], ...(GUIDE_POSES[id] || []), ...Object.values(GUIDE_PLUMAGE[id] || {})].filter(p => p?.image);
  assert.deepEqual(all.filter(p => p.sex).map(p => p.image), [], `Geslachtslabel bij ${id}`);
  const html = recognitionPanel(byId.get(id));
  assert.ok(!/data-plumage="adult_[mf]"/.test(html), `Galerij Mannetje/Vrouwtje bij ${id}`);
}
console.log('V-02 OK — geen geslachtslabels bij Buizerd, Slechtvalk en Middelste Bonte Specht');

// V-03
for (const [id, label] of [['sp078', 'Donsjong'], ['sp086', 'Donsjong'], ['sp128', 'Donsjongen']]) {
  assert.equal(GUIDE_PLUMAGE[id]?.juv, undefined, `Donsjong nog in rol Juveniel: ${id}`);
  const chick = (GUIDE_POSES[id] || []).find(p => p.age === 'chick');
  assert.equal(chick?.label, label, `Donsjong ontbreekt: ${id}`);
  const juv = guidePlumageGroups(byId.get(id)).find(g => g.key === 'juv');
  assert.ok(!juv || juv.photos.length === 0, `Juveniel-galerij bij ${id} bevat nog een foto`);
}
console.log('V-03 OK — donsjongen apart gelabeld');

// V-04
assert.equal(GUIDE_PHOTOS.sp173.sex, undefined);
assert.equal(GUIDE_PLUMAGE.sp173.adult_m.sex, 'male');
assert.notEqual(GUIDE_PLUMAGE.sp173.adult_m.image, GUIDE_PHOTOS.sp173.image);
assert.ok(!GUIDE_PLUMAGE.sp173.adult_m.reuseGuidePhoto);
const harrier = recognitionPanel(byId.get('sp249'));
assert.ok(!harrier.includes('data-guide-image="/assets/species/sp173.webp"') ||
  !/Bruine Kiekendief<\/strong>\s*<span[^>]*>Mannetje/.test(harrier), 'Vergelijking toont nog de oude vluchtfoto als mannetje');
console.log('V-04 OK — Bruine Kiekendief mannetje bevestigd');

// V-05
let heroes = 0;
for (const v of verified) {
  const all = [...(GUIDE_POSES[v.species] || []), ...Object.values(GUIDE_PLUMAGE[v.species] || {})];
  const e = all.find(p => p.image === v.target);
  assert.ok(e, `Geïmporteerde foto niet geregistreerd: ${v.target}`);
  assert.equal(e.sex, 'male'); assert.equal(e.source, v.source); assert.equal(e.author, v.author); assert.equal(e.license, v.license);
  assert.match(e.sha1, /^[0-9a-f]{40}$/); assert.match(e.verification, /mannetje/i);
  assert.equal(e.latin, byId.get(v.species).nameSci, `Wetenschappelijke naam ${v.species}`);
  const file = new URL(v.target.slice(1), root);
  assert.ok(existsSync(file), `Bestand ontbreekt: ${v.target}`);
  const bytes = readFileSync(file);
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  assert.ok(!bytes.includes('EXIF') && !bytes.includes('XMP '), `Metadata in ${v.target}`);
  if (v.role === 'hero') {
    assert.equal(GUIDE_HEROES[v.species], v.target, `Hoofdfoto niet ingesteld: ${v.species}`);
    const male = guidePlumageGroups(byId.get(v.species)).find(g => g.key === 'adult_m');
    assert.ok(male?.photos.length, `Galerij Mannetje leeg na nieuwe hoofdfoto: ${v.species}`);
    assert.ok(male.photos.every(p => p.image !== v.target));
    heroes++;
  }
}
console.log(`V-05 OK — ${heroes} nieuwe hoofdfoto's, ${verified.length} imports met bron, SHA-1 en zonder EXIF`);

// V-06
const sanderling = (GUIDE_POSES.sp152 || []).find(p => p.image.endsWith('sp152-flight.webp'));
assert.equal(sanderling.age, undefined); assert.ok(!/jonge|juveniel/i.test(sanderling.label + sanderling.alt));
console.log('V-06 OK — geen ongedocumenteerde leeftijd');
console.log('Bronaudit stap 1: alle controles geslaagd');
