/** F3-R32 register, exact media roles and reciprocal comparisons. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE } from '../src/features/species/guideMedia.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const tracker = load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const conflicts = load('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const media = load('../assets/species/field-guide-media.json');
const birds = new Map(SPECIES.map(bird => [bird.id, bird]));
const render = id => recognitionPanel(birds.get(id));
const ids = ['sp116', 'sp117', 'sp118'];
const reviewed = tracker.records.filter(row => row.F3.recheckBatch === 'F3-R32');

assert.deepEqual(reviewed.map(row => row.id), ids);
assert.equal(tracker.counts.thirtySecondBatchStarted, 3);
assert.ok(tracker.counts.contentInspected >= 96);
assert.ok(tracker.counts.nextNotStarted <= 44);
assert.deepEqual(reviewed.map(row => row.historic.oldAssetCount), [0, 4, 4]);
assert.deepEqual(reviewed.map(row => row.currentAssets.imageSlots.length), [2, 4, 4]);
assert.equal(reviewed[0].historic.audited, false);

for (const { id, currentAssets, F3 } of reviewed) {
  const html = render(id);
  const gallery = html.split('<section class="sd-similar"')[0];
  const paths = [guideHeroPhoto(id).image,
    ...Array.from(gallery.matchAll(/data-guide-image="([^"]+)"/g), item => item[1])];
  assert.equal(paths.length, new Set(paths).size, id + ' repeats an own guide photo');
  assert.deepEqual(paths, currentAssets.imageSlots.map(slot => slot.path));
  assert.equal(F3.photoFilesInspected, paths.length);
  assert.deepEqual(paths.map(path => {
    const bytes = readFileSync(new URL('..' + path, import.meta.url));
    return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  }), F3.photoBlobSHAs);
  assert.doesNotMatch(html, /<audio\b|sd-audio-credits/);
  assert.equal(GUIDE_AUDIO[id]?.length ?? 0, 0);
  assert.equal(currentAssets.existingAudioCount, 0);
  assert.equal(F3.fullPass, false);
}

assert.equal(guideHeroPhoto('sp116').flight, true);
assert.equal(guideHeroPhoto('sp116').sex, undefined);
assert.match(guideHeroPhoto('sp118').alt, /Mannetje in winterkleed/);
assert.doesNotMatch(guideHeroPhoto('sp118').alt, /broedkleed/);
assert.equal(GUIDE_PLUMAGE.sp117.adult_f.sex, 'female');
assert.equal(GUIDE_PLUMAGE.sp118.adult_f.sex, 'female');
assert.match(media.retired.sp118[0].flightReview, /^archief/);
assert.doesNotMatch(render('sp118'), /sp118-flight\.webp/);

function pairsFor(first, second) {
  return GUIDE_COMPARISONS.filter(pair => pair.birds.length === 2 &&
    [first, second].every(id => pair.birds.some(bird => bird.id === id)));
}

const [swallows] = pairsFor('sp116', 'sp115');
assert.ok(swallows.flight && swallows.reciprocalText);
assert.deepEqual(swallows.birds.map(bird => comparisonPhoto(bird, true)?.image),
  ['/assets/species/plumage/sp116-flight.webp', '/assets/species/plumage/sp115-flight.webp']);
assert.ok(swallows.birds.every(bird => comparisonPhoto(bird, false) === null));
assert.match(swallows.rows[0].values[1], /jonge vogels soms vaag grijs/);
assert.deepEqual(conflicts.pairs.find(pair => pair.id === 'LK-062').focus, ['sp115', 'sp116']);

const buntings = pairsFor('sp117', 'sp118');
assert.deepEqual(buntings.map(pair => pair.birds.map(bird => bird.plumage)),
  [['adult_m', 'adult_m'], ['adult_f', 'adult_f']]);
assert.deepEqual(buntings.map(pair => pair.birds.map(bird => comparisonPhoto(bird, false)?.image)), [
  ['/assets/species/sp117.webp', '/assets/species/sp118.webp'],
  ['/assets/species/plumage/sp117-adult_f.webp', '/assets/species/plumage/sp118-adult_f.webp'],
]);
assert.match(buntings[0].rows[0].values[1], /winterkleed/);
assert.deepEqual(conflicts.pairs.find(pair => pair.id === 'LK-063').birds, ['sp117', 'sp118']);

for (const [first, second] of [['sp115', 'sp116'], ['sp117', 'sp118']]) {
  for (const [own, other] of [[first, second], [second, first]]) {
    assert.ok(render(own).includes('data-compare-species="' + other + '"'), own + ' loses paired navigation');
  }
}

console.log('F3-R32: 10 active WebPs, Oeverzwaluw flight hero, correct Rietgors winter label, 3 sourced photo panels, no archived flight or audio claim.');
