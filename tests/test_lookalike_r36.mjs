/** Birdspot F3-R36: exact 140-cohort bookkeeping and no false photo/audio PASS. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const reg = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url)));
const ids = ['sp146','sp147','sp148'];
const rows = reg.records.filter(row => row.F3.recheckBatch === 'F3-R36');
const byId = new Map(SPECIES.map(species => [species.id, species]));
assert.deepEqual(rows.map(row => row.id), ids, 'Only the next three F3 rows may join R36');
assert.equal(reg.records.length, 140);
assert.equal(reg.counts.contentInspected, 108);
assert.equal(reg.counts.nextNotStarted, 32);
assert.equal(reg.counts.F3FullPass, 0);
assert.equal(reg.counts.thirtySixthBatchStarted, 3);

let imageCount = 0, soundCount = 0;
for (const row of rows) {
  const {id, F3, currentAssets} = row;
  const s = byId.get(id);
  assert.ok(s);
  assert.equal(F3.status, 'IN CONTENT REVIEW / OPEN POINTS');
  assert.equal(F3.reviewedThisRound, true);
  assert.equal(F3.fullPass, false);
  assert.equal(F3.independence.startsWith('NOT VERIFIED'), true);
  assert.match(F3.checks.independentSecondReview, /^NOT TESTED/);
  assert.match(F3.checks.audioRecordingsAuthenticity, /^(NOT TESTED|BLOCKED)/);
  assert.equal(F3.photoFilesInspected, 0, 'Metadata inspection is not image inspection');
  assert.equal(F3.reviewedOriginalAudio, 0, 'No Xeno-canto source was independently decoded in R36');

  const hero = guideHeroPhoto(id);
  assert.ok(hero, id + ': missing existing guide hero');
  assert.equal(currentAssets.imageSlots[0].path, hero.image);
  const expected = id === 'sp148' ? [hero.image] :
    [hero.image, GUIDE_PLUMAGE[id].juv.image, GUIDE_PLUMAGE[id].winter.image, GUIDE_POSES[id][0].image];
  assert.deepEqual(currentAssets.imageSlots.map(x => x.path), expected);
  const html = recognitionPanel(s);
  for (const path of expected) {
    const file = new URL('..' + path, import.meta.url);
    assert.ok(existsSync(file), id + ': missing asset ' + path);
    assert.ok(statSync(file).size > 1000, id + ': tiny asset ' + path);
  }
  imageCount += expected.length;
  const sounds = GUIDE_AUDIO[id] || [];
  assert.equal(currentAssets.existingAudioCount, sounds.length);
  assert.deepEqual(currentAssets.existingAudioPaths, sounds.map(x => x.audio));
  for (const audio of sounds) {
    const file = new URL('..' + audio.audio, import.meta.url);
    assert.ok(existsSync(file), id + ': audio missing ' + audio.audio);
    assert.ok(statSync(file).size > 1000, id + ': tiny audio');
    assert.ok(audio.author && audio.license && audio.source.startsWith('https://xeno-canto.org/'));
  }
  soundCount += sounds.length;
  assert.equal((html.match(/<audio /g) || []).length, sounds.length, id + ': audio element count');
}
assert.equal(imageCount, 9);
assert.equal(soundCount, 4);
const pair = GUIDE_COMPARISONS.filter(p => p.birds.length===2 &&
  p.birds.some(b => b.id==='sp146') && p.birds.some(b => b.id==='sp147'));
assert.ok(pair.some(p => p.birds.every(b => b.plumage==='breeding')));
assert.ok(pair.some(p => p.birds.every(b => b.plumage==='juv')));
const whimbrel = GUIDE_COMPARISONS.find(p => p.birds.some(b => b.id==='sp100') && p.birds.some(b => b.id==='sp148'));
assert.ok(whimbrel);
for(const [a,b] of [['sp146','sp147'],['sp147','sp146'],['sp100','sp148'],['sp148','sp100']]){
  const html=recognitionPanel(byId.get(a));
  assert.match(html,new RegExp('data-compare-species="'+b+'"'));
}
const ringed = byId.get('sp146');
assert.equal(ringed.months, 'mrt-okt', 'Open documented seasonal discrepancy; requires separate deliberate correction');
assert.ok(rows[0].F3.findings.some(f=>/jaarrond/.test(f)));
console.log('R36 data/Node PASS: 3 reviewed rows, 9 registered local photos, 4 audio files, reciprocal comparison paths. No source/audio/real-device PASS.');
