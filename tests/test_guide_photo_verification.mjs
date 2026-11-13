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
const media = JSON.parse(readFileSync(new URL('assets/species/field-guide-media.json', root)));
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
}
// Meerkoet en Bergeend hebben inmiddels een bevestigde, volgroeide juveniele foto; Grauwe Gans nog niet
// (alle gevonden kandidaten waren donskuikens) — de galerij blijft daar leeg tot er een goede foto is.
for (const id of ['sp078', 'sp128']) {
  const juv = guidePlumageGroups(byId.get(id)).find(g => g.key === 'juv');
  assert.ok(juv?.photos.length === 1, `Juveniele foto ontbreekt bij ${id}`);
  assert.equal(juv.photos[0].age, 'juvenile', `Verkeerde leeftijd in Juveniel-galerij: ${id}`);
}
assert.ok(!guidePlumageGroups(byId.get('sp086')).find(g => g.key === 'juv')?.photos.length,
  'Juveniel-galerij bij sp086 hoort nog leeg te zijn (geen kandidaat gevonden)');
console.log('V-03 OK — donsjongen apart gelabeld; Meerkoet en Bergeend hebben nu ook een juveniele foto');

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
  const active = all.find(p => p.image === v.target);
  const archived = media.retired[v.species]?.find(p => p.image === v.target);
  const e = active || archived;
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
    // sp018 is a documented 12-11 owner-scope quality change: the existing, source-verified
    // male showcase image is now the hero. Preserve the 09-11 import's historical 'hero'
    // role and source evidence, but show its original binary only as a second male portrait.
    const blackWoodpeckerUpgrade = v.species === 'sp018';
    const currentHero = blackWoodpeckerUpgrade
      ? GUIDE_PHOTOS.sp018
      : (archived ? all.find(p => p.image === archived.replacedBy) : active);
    assert.ok(currentHero, `Actuele hoofdfoto ontbreekt: ${v.species}`);
    assert.equal(GUIDE_HEROES[v.species], currentHero.image, `Hoofdfoto niet ingesteld: ${v.species}`);
    assert.equal(guideHeroPhoto(v.species).image, currentHero.image);
    assert.equal(currentHero.sex, 'male');
    assert.equal(currentHero.latin, byId.get(v.species).nameSci);
    if (blackWoodpeckerUpgrade) {
      assert.equal(v.target, '/assets/species/plumage/sp018-hero-male.webp');
      assert.equal(currentHero.image, '/assets/showcase/sp018.webp');
      assert.equal(currentHero.author, 'xulescu_g');
      assert.equal(currentHero.license, 'CC BY-SA 2.0');
      assert.ok(currentHero.source.includes('Dryocopus_martius'));
      assert.ok(active && !archived, 'Original imported male portrait must stay in the active registry');
      assert.notEqual(currentHero.source, active.source, 'Two different source photographs required');
    } else if (archived) {
      assert.ok(!active && archived.retiredReason, `Vervangen hoofdfoto staat nog actief: ${v.target}`);
      assert.ok(currentHero.source && currentHero.author && currentHero.license);
      assert.match(currentHero.sha1, /^[0-9a-f]{40}$/);
    }
    const male = guidePlumageGroups(byId.get(v.species)).find(g => g.key === 'adult_m');
    assert.ok(male?.photos.length, `Galerij Mannetje leeg na nieuwe hoofdfoto: ${v.species}`);
    assert.ok(male.photos.every(p => p.image !== currentHero.image), 'Hoofdfoto mag niet in de kleedgalerij worden herhaald');
    if (blackWoodpeckerUpgrade) {
      assert.ok(male.photos.some(p => p.image === v.target), 'Imported original must remain visible once under Mannetje');
    }
    heroes++;
  }
}
console.log(`V-05 OK — ${heroes} nieuwe hoofdfoto's, ${verified.length} imports met bron, SHA-1 en zonder EXIF`);

// V-06
const sanderling = (GUIDE_POSES.sp152 || []).find(p => p.image.endsWith('sp152-flight.webp'));
assert.equal(sanderling.age, undefined); assert.ok(!/jonge|juveniel/i.test(sanderling.label + sanderling.alt));
console.log('V-06 OK — geen ongedocumenteerde leeftijd');
console.log('Bronaudit stap 1: alle controles geslaagd');
