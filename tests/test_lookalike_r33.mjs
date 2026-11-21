import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_AUDIO, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = path => readFileSync(new URL(path, import.meta.url));
const load = path => JSON.parse(read(path));
const register = load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const ledger = load('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const conflicts = load('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const birds = new Map(SPECIES.map(bird => [bird.id, bird]));
const render = id => recognitionPanel(birds.get(id));
const rows = register.records.filter(row => row.F3.recheckBatch === 'F3-R33');
const ids = ['sp126', 'sp128', 'sp129'];
assert.deepEqual(rows.map(row => row.id), ids);
assert.deepEqual(rows.map(row => row.historic.oldAssetCount), [5, 0, 5]);
assert.deepEqual(rows.map(row => row.currentAssets.imageSlots.length), [5, 5, 5]);
assert.deepEqual(rows.map(row => row.currentAssets.existingAudioCount), [1, 2, 1]);
assert.equal(register.counts.thirtyThirdBatchStarted, 3);
assert.ok(register.counts.contentInspected >= 99);
assert.ok(register.counts.nextNotStarted <= 41);

for (const { id, currentAssets, F3 } of rows) {
  const html = render(id);
  const gallery = html.split('<section class="sd-similar"')[0];
  const paths = [guideHeroPhoto(id).image,
    ...Array.from(gallery.matchAll(/data-guide-image="([^"]+)"/g), item => item[1])];
  assert.equal(paths.length, new Set(paths).size, id + ' duplicates an own guide image');
  assert.deepEqual(paths, currentAssets.imageSlots.map(slot => slot.path));
  assert.equal(F3.photoFilesInspected, paths.length);
  assert.deepEqual(paths.map(path => {
    const bytes = read('..' + path);
    return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  }), F3.photoBlobSHAs);
  assert.equal(F3.fullPass, false);
  const clips = GUIDE_AUDIO[id];
  assert.deepEqual(clips.map(clip => clip.audio), currentAssets.existingAudioPaths);
  assert.equal(F3.reviewedOriginalAudio, clips.length);
  assert.match(html, /nog niet onafhankelijk bevestigd/);
  assert.doesNotMatch(html, /Status: Bevestigd/);
  const entry = ledger.species.find(row => row.id === id);
  assert.equal(entry.status, 'PARTIALLY TESTED');
  assert.deepEqual(entry.clips.map(clip => clip.reference), clips.map(clip => clip.source));
  for (const [i, clip] of clips.entries()) {
    const match = F3.audioSourceMatches[i];
    assert.equal(match.path, clip.audio);
    assert.equal(match.source, clip.source);
    assert.equal(match.sourceLicense, clip.license);
    assert.match(match.sourceSha1, /^[0-9a-f]{40}$/);
    assert.ok(match.matchedSeconds > 10 && match.normalizedCorrelation > 0.99);
    assert.equal(createHash('sha256').update(read('..' + clip.audio)).digest('hex'), match.localSha256);
    assert.equal(entry.clips[i].roleAudition, 'NOT TESTED');
    assert.match(clip.verification, /^PARTIALLY TESTED/);
    assert.ok(html.includes(clip.audio) && html.includes(clip.licenseUrl));
  }
}

const swanSound = GUIDE_AUDIO.sp126[0];
assert.equal(swanSound.license, 'CC BY-SA 3.0');
assert.equal(swanSound.licenseUrl, 'https://creativecommons.org/licenses/by-sa/3.0/');
assert.match(swanSound.source, /Cygnus_olor_-_Mute_Swan_XC307509\.mp3$/);
assert.match(GUIDE_AUDIO.sp128[0].label, /Zang · bronlabel/);
assert.match(GUIDE_AUDIO.sp129[0].note, /niet gezien/);

const shelduck = GUIDE_POSES.sp128;
const neutralFlight = shelduck.find(photo => photo.image.endsWith('/sp128-flight.webp'));
assert.equal(neutralFlight.flight, true);
assert.equal(neutralFlight.sex, undefined);
assert.doesNotMatch(neutralFlight.note, /\bman(?:netje)?\b/);
assert.equal(shelduck.find(photo => photo.age === 'chick').flight, false);
assert.equal(shelduck.find(photo => photo.age === 'juvenile').flight, false);
assert.match(render('sp128'), /roodachtig/);

const photoPairs = [
  ['sp126', 'sp187', '/assets/species/sp126.webp', '/assets/species/sp187.webp'],
  ['sp089', 'sp129', '/assets/species/plumage/sp089-adult_f.webp', '/assets/species/plumage/sp129-adult_f.webp'],
  ['sp130', 'sp129', '/assets/species/plumage/sp130-adult-f.webp', '/assets/species/plumage/sp129-adult_f.webp'],
];
const entries = (a, b) => GUIDE_COMPARISONS.filter(pair => pair.birds.length === 2 &&
  [a, b].every(id => pair.birds.some(bird => bird.id === id)));
for (const [a, b, first, second] of photoPairs) {
  const [pair] = entries(a, b);
  assert.deepEqual(pair.birds.map(bird => comparisonPhoto(bird, false)?.image), [first, second]);
  assert.ok(pair.birds.every(bird => comparisonPhoto(bird, true) === null));
  assert.equal(pair.rows.length, 2);
  for (const [own, other] of [[a, b], [b, a]]) {
    assert.ok(render(own).includes('data-compare-species="' + other + '"'));
  }
}
assert.match(entries('sp089', 'sp129')[0].tip, /kunnen overlappen/);
assert.match(entries('sp130', 'sp129')[0].tip, /steen/);
for (const [a, b, key] of [['sp126', 'sp127', 'LK-065'], ['sp128', 'sp327', 'LK-066']]) {
  const [pair] = entries(a, b);
  assert.ok(pair.reciprocalText && pair.birds.every(bird => bird.photoMissing));
  assert.ok(pair.birds.every(bird => comparisonPhoto(bird, false) === null));
  assert.equal(conflicts.pairs.find(entry => entry.id === key).photoState, 'MISSING_VERIFIED_PAIR');
  for (const [own, other] of [[a, b], [b, a]]) {
    assert.ok(render(own).includes('data-compare-species="' + other + '"'));
  }
}

console.log('F3-R33: 15 active WebPs, 4 matched source clips, swan license credit, separate shelduck stages and flight roles, paired and fallback routes; no full pass.');
