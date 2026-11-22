import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE } from '../src/features/species/guideMedia.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = path => readFileSync(new URL(path, import.meta.url));
const f3 = JSON.parse(read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json'));
const registry = JSON.parse(read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json'));
const audioAudit = JSON.parse(read('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json'));
const focus = ['sp167', 'sp170', 'sp173'];
const species = new Map(SPECIES.map(row => [row.id, row]));
const photos = {
  sp167: ['/assets/species/plumage/sp167-adult.webp'],
  sp170: ['/assets/species/sp170.webp'],
  sp173: [
    '/assets/species/plumage/sp173-hero-male.webp',
    '/assets/species/plumage/sp173-female-rest.webp',
    '/assets/species/plumage/sp173-juv.webp',
    '/assets/species/plumage/sp173-male-2.webp',
    '/assets/species/plumage/sp173-adult_f.webp',
    '/assets/species/sp173.webp',
  ],
};
const rows = f3.records.filter(row => row.F3.recheckBatch === 'F3-R41');
assert.deepEqual(rows.map(row => row.id), focus);
assert.equal(f3.records.length, 140);
assert.equal(f3.counts.fortyFirstBatchStarted, 3);
assert.equal(f3.counts.contentInspected, f3.records.filter(row => row.F3.reviewedThisRound).length);
assert.ok(f3.counts.contentInspected >= 123);
assert.equal(f3.counts.nextNotStarted, f3.records.filter(row => row.F3.status === 'NOT STARTED').length);
assert.equal(f3.counts.F3FullPass, 0);

const panels = new Map();
for (const row of rows) {
  const { id, currentAssets, F3 } = row;
  const paths = photos[id];
  assert.equal(F3.status, 'IN CONTENT REVIEW / OPEN POINTS');
  assert.equal(F3.fullPass, false);
  assert.match(F3.independence, /^NOT VERIFIED/);
  assert.match(F3.checks.photoOriginalIdentity, /^VERIFIED/);
  assert.match(F3.checks.photoIndividualRights, /^PARTIALLY TESTED/);
  assert.equal(F3.photoFilesInspected, paths.length);
  assert.deepEqual(currentAssets.imageSlots.map(slot => slot.path), paths);
  assert.equal(guideHeroPhoto(id).image, paths[0]);
  assert.equal(guideHeroPhoto(id).flight, true);
  const blobs = paths.map(path => {
    const bytes = read('..' + path);
    return createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0)).update(bytes).digest('hex');
  });
  assert.deepEqual(blobs, F3.photoBlobSHAs);

  const panel = recognitionPanel(species.get(id));
  panels.set(id, panel);
  const clips = GUIDE_AUDIO[id] || [];
  assert.deepEqual(currentAssets.existingAudioPaths, clips.map(clip => clip.audio));
  assert.equal(currentAssets.existingAudioCount, clips.length);
  const audit = audioAudit.species.find(entry => entry.id === id);
  assert.equal(audit.status, id === 'sp173' ? 'REGISTERED_UNVERIFIED' : 'MISSING');
  assert.equal((panel.match(/<audio /g) || []).length, id === 'sp173' ? 1 : 0);
  assert.equal(F3.reviewedOriginalAudio, 0, 'Original-to-MP3 match does not certify field identification');
}
assert.equal(Object.values(photos).flat().length, 8);
assert.equal(GUIDE_PLUMAGE.sp173.juv.flight, false);
assert.equal(GUIDE_PLUMAGE.sp173.juv.observation, 'https://www.inaturalist.org/observations/134634395');
assert.match(GUIDE_PLUMAGE.sp173.juv.label, /neerstrijkend/i);
const [call] = GUIDE_AUDIO.sp173;
assert.equal(call.label, 'Roep');
assert.equal(call.author, 'Sternanita2');
assert.equal(call.license, 'CC BY-SA 4.0');
assert.match(call.source, /File:Call_circus_aeruginosus\.ogg$/);
assert.equal(createHash('sha256').update(read('..' + call.audio)).digest('hex'),
  'b4c8d670aed698d3aecaf2d7f38683a78555976990ff1b6f71f74709fd1e708b');

function panelFor(id) {
  return panels.get(id) || recognitionPanel(species.get(id));
}

const textPairs = [
  ['LK-085', 'sp167', 'sp165', 'breeding', /gele punt/],
  ['LK-086', 'sp170', 'sp241', undefined, /donkere hals/i],
  ['LK-087', 'sp170', 'sp142', undefined, /trompetgeluid/i],
  ['LK-090', 'sp173', 'sp249', 'juv', /jonge vogels de brede witte stuit/],
];
for (const [pairId, a, b, role, clue] of textPairs) {
  assert.equal(registry.pairs.find(pair => pair.id === pairId).photoState, 'MISSING_VERIFIED_PAIR');
  const pair = GUIDE_COMPARISONS.find(entry =>
    entry.reciprocalText && entry.birds.length === 2 &&
    [a, b].every(id => entry.birds.some(bird => bird.id === id && bird.plumage === role)));
  assert.ok(pair, pairId);
  assert.ok(pair.birds.every(bird => bird.photoMissing && !comparisonPhoto(bird, false) && !comparisonPhoto(bird, true)));
  for (const [own, partner] of [[a, b], [b, a]]) {
    const html = panelFor(own);
    assert.ok(html.includes('data-compare-species="' + partner + '"'), own + ' missing ' + partner);
    assert.match(html, clue);
  }
}

const flightPairs = [
  ['LK-088', 'adult_m', ['/assets/species/plumage/sp173-male-2.webp', '/assets/species/sp249.webp']],
  ['LK-089', 'adult_f', ['/assets/species/plumage/sp173-adult_f.webp', '/assets/species/plumage/sp249-adult_f.webp']],
];
for (const [pairId, role, paths] of flightPairs) {
  assert.equal(registry.pairs.find(pair => pair.id === pairId).photoState, 'REGISTERED_PAIR_PENDING_F3_ORIGINAL');
  const pair = GUIDE_COMPARISONS.find(entry => entry.flight &&
    entry.birds[0].id === 'sp173' && entry.birds.every(bird => bird.plumage === role));
  const media = pair.birds.map(bird => comparisonPhoto(bird, true));
  assert.deepEqual(media.map(photo => photo.image), paths);
  assert.ok(media.every(photo => photo.flight && photo.author && photo.license && photo.source));
}
console.log('F3-R41 PASS: eight source-bound photo blobs, two adult flight pairs, four missing photo pairs, one registered unverified call. Latest reviewed=' + f3.counts.contentInspected);
