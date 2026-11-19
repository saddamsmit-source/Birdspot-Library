/** R21: genuine gaps remain open; reverse text comparison survives missing photos. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE, KNOWLEDGE_SOURCES } from '../src/data/speciesKnowledge.js';
import { GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { comparisonPhoto, recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const audit = read('../docs/media-intake/2026-11-19/origcheck-r21/origcheck.json');
const visual = read('../docs/media-intake/2026-11-19/origcheck-r21/visual-review.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const birds = new Map(SPECIES.map(s => [s.id, s]));
const panel = id => recognitionPanel(birds.get(id));
const photos = audit.items.filter(i => i.image);
assert.equal(photos.length, 11, '10 live photos plus the retained, withheld age-role');
assert.ok(photos.every(i => i.rightsMatch === true));
const flight = photos.find(i => i.image.endsWith('sp072-flight.webp'));
assert.equal(flight.sameShot, false, 'the automatic crop mismatch must remain recorded');
assert.ok(flight.r < audit.rule.sameMinR);
for (const p of visual.photos) {
  const bytes = readFileSync(new URL('..' + p.path, import.meta.url));
  assert.equal(p.localSha256, createHash('sha256').update(bytes).digest('hex'));
  assert.equal(p.automatedSameShot, photos.find(x => x.image === p.path).sameShot);
  assert.ok(existsSync(new URL('../docs/media-intake/2026-11-19/origcheck-r21/' + p.sideBySide, import.meta.url)));
}
// A copyright symbol in the displayed credit does not change the named holder.
const audio = audit.items.find(i => i.kind === 'audio');
assert.equal(audio.rightsMatch, false, 'preserve the strict original machine outcome');
assert.equal(visual.audioAttributionReview.rightsMatch, true);
assert.equal(visual.audioAttributionReview.authorRule, 'recordist+copyright-holder');
assert.ok(!('sameShot' in audio) && !('sameShot' in visual.audioAttributionReview));
assert.match(visual.audioAttributionReview.evidenceCeiling, /geen soortverificatie/);
for (const [a,b] of [['sp072','sp073'], ['sp077','sp195']]) {
  for (const [own, other] of [[a,b],[b,a]]) {
    const html = panel(own);
    assert.ok(html.includes('data-compare-species="' + other + '"'), own + ': missing reverse recognition link');
    const pairs = GUIDE_COMPARISONS.filter(c => c.birds.some(b => b.id === own) && c.birds.some(b => b.id === other));
    assert.ok(!pairs.some(c => c.birds.every(b => comparisonPhoto(b, Boolean(c.flight)))), own + ': incomplete photo pair');
    if (KNOWLEDGE[own]) assert.ok(KNOWLEDGE[own].critical.some(x => x.vs.includes(other)));
    else assert.ok(html.includes('data-text-similar'), own + ': reciprocal text without full knowledge profile');
  }
}
for (const [a,b] of [['sp072','sp070'], ['sp075','sp257']]) {
  assert.ok(panel(a).includes('data-compare-species="' + b + '"'));
  assert.ok(panel(b).includes('data-compare-species="' + a + '"'));
}
assert.equal(KNOWLEDGE.sp073, undefined, 'respect photo-first scope for knowledge profiles');
assert.equal(KNOWLEDGE.sp195, undefined, 'a reverse text link does not create a full profile');
assert.ok(!panel('sp075').includes('sp075-juv-review.webp'));
assert.ok(!GUIDE_POSES.sp077?.some(p => p.flight));
const fuut = f3.records.find(r => r.id === 'sp077');
assert.ok(!fuut.F3.findings.some(x => x === 'Geverifieerde vrije-vluchtfoto'));
assert.ok(fuut.F3.findings.some(x => /vluchtfoto ontbreekt/.test(x)));
assert.equal(KNOWLEDGE_SOURCES.SOV_FUUT.url, 'https://stats.sovon.nl/stats/soort/90');
assert.ok(KNOWLEDGE.sp077.status.some(x => x.sources.includes('SOV_FUUT')));
assert.ok(KNOWLEDGE.sp072.status.some(x => x.kind === 'trend'));
for (const r of f3.records.filter(r => r.F3.recheckBatch === 'F3-R21')) {
  assert.equal(r.F3.fullPass, false);
  assert.equal(r.F3.reviewedOriginalAudio, 0);
}
console.log('F3-R21 PASS: reciprocal recognition text, missing photo pairs hidden, ambiguous IJsvogel age withheld, source/machine/visual/audio evidence kept separate.');
