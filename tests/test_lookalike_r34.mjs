import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const bytes = path => readFileSync(new URL(path, import.meta.url));
const load = path => JSON.parse(bytes(path));
const register = load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const audioLedger = load('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const conflicts = load('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const catalog = new Map(SPECIES.map(bird => [bird.id, bird]));
const render = id => recognitionPanel(catalog.get(id));
const rows = register.records.filter(row => row.F3.recheckBatch === 'F3-R34');
assert.deepEqual(rows.map(row => row.id), ['sp130', 'sp132', 'sp141']);
assert.deepEqual(rows.map(row => row.historic.oldAssetCount), [4, 4, 3]);
assert.deepEqual(rows.map(row => row.currentAssets.imageSlots.length), [4, 4, 3]);
assert.deepEqual(rows.map(row => row.currentAssets.existingAudioCount), [0, 2, 0]);
assert.equal(register.counts.thirtyFourthBatchStarted, 3);
assert.ok(register.counts.contentInspected >= 102);
assert.ok(register.counts.nextNotStarted <= 38);

for (const { id, currentAssets, F3 } of rows) {
  const html = render(id);
  const gallery = html.split('<section class="sd-similar"')[0];
  const paths = [guideHeroPhoto(id).image,
    ...Array.from(gallery.matchAll(/data-guide-image="([^"]+)"/g), item => item[1])];
  assert.equal(paths.length, new Set(paths).size, id + ' repeats an own guide image');
  assert.deepEqual(paths, currentAssets.imageSlots.map(slot => slot.path));
  assert.equal(F3.photoFilesInspected, paths.length);
  assert.deepEqual(paths.map(path => {
    const b = bytes('..' + path);
    return createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
  }), F3.photoBlobSHAs);
  assert.equal(F3.fullPass, false);
  assert.equal(F3.reviewedOriginalAudio, 0);
  assert.deepEqual(F3.audioSourceMatches, []);
  assert.deepEqual((GUIDE_AUDIO[id] ?? []).map(a => a.audio), currentAssets.existingAudioPaths);
}
const pochard = rows.find(row => row.id === 'sp132');
assert.match(pochard.F3.checks.audioLicenseAndAttribution, /^BLOCKED/);
assert.equal(audioLedger.species.find(row => row.id === 'sp132').status, 'REGISTERED_UNVERIFIED');
assert.deepEqual(pochard.F3.localAudioDecodes.map(clip => clip.duration), [9.696, 14.928]);
for (const clip of pochard.F3.localAudioDecodes) {
  assert.equal(createHash('sha256').update(bytes('..' + clip.path)).digest('hex'), clip.sha256);
}
assert.match(render('sp132'), /nog niet onafhankelijk bevestigd/);
assert.doesNotMatch(render('sp132'), /Status: Bevestigd/);

const swift = guideHeroPhoto('sp141');
assert.equal(swift.image, '/assets/species/plumage/sp141-adult.webp');
assert.equal(swift.flight, true);
assert.equal(swift.sex, undefined);
assert.equal(swift.age, undefined);
assert.equal(GUIDE_PLUMAGE.sp141.adult_m, undefined);
assert.equal(GUIDE_PLUMAGE.sp141.juv.age, 'juvenile');
assert.deepEqual(GUIDE_POSES.sp141.map(photo => photo.image), [
  '/assets/species/plumage/sp141-flight.webp',
  '/assets/species/plumage/sp141-adult.webp',
]);
assert.match(render('sp141'), /data-plumage="adult"/);
assert.doesNotMatch(render('sp141'), /data-plumage="adult_m"/);
assert.match(render('sp141'), /opvang na redding/);

const entries = (a, b) => GUIDE_COMPARISONS.filter(pair => pair.birds.length === 2 &&
  [a, b].every(id => pair.birds.some(bird => bird.id === id)));
const visualPairs = [
  ['sp130', 'sp132', false, ['plumage/sp130-adult-f.webp', 'plumage/sp132-adult_f.webp']],
  ['sp141', 'sp114', true, ['plumage/sp141-flight.webp', 'plumage/sp114-flight.webp']],
  ['sp141', 'sp115', true, ['plumage/sp141-flight.webp', 'plumage/sp115-flight.webp']],
];
for (const [a, b, airborne, photos] of visualPairs) {
  const group = entries(a, b);
  assert.equal(group.length, 1);
  const pair = group[0];
  assert.deepEqual(pair.birds.map(bird => comparisonPhoto(bird, airborne)?.image),
    photos.map(path => '/assets/species/' + path));
  assert.equal(pair.rows.length, 2);
  for (const [own, other] of [[a, b], [b, a]]) {
    assert.ok(render(own).includes('data-compare-species="' + other + '"'));
  }
}
assert.match(entries('sp141', 'sp114')[0].tip, /Jonge Boerenzwaluwen/);
assert.match(entries('sp141', 'sp115')[0].tip, /wegdraait/);
const pochardPair = entries('sp092', 'sp132');
assert.deepEqual(pochardPair.map(pair => pair.birds[0].plumage), ['adult_m', 'adult_f', 'adult_m']);
assert.deepEqual(pochardPair.map(pair => Boolean(pair.flight)), [false, false, true]);

for (const [a, b, key] of [['sp132', 'sp093', 'LK-070'], ['sp141', 'sp381', 'LK-073']]) {
  const [pair] = entries(a, b);
  assert.ok(pair.reciprocalText && pair.birds.every(bird => bird.photoMissing));
  assert.ok(pair.birds.every(bird => comparisonPhoto(bird, false) === null));
  assert.equal(conflicts.pairs.find(row => row.id === key).photoState, 'MISSING_VERIFIED_PAIR');
  for (const [own, other] of [[a, b], [b, a]]) {
    assert.ok(render(own).includes('data-compare-species="' + other + '"'));
  }
}

console.log('F3-R34: 11 own images, one new rest pair, source-bound swift flight pairs and reciprocal fallbacks; two local Tafeleend clips, source review open.');
