/** F3-REV2-R01: second verification round keeps first-round data and never fakes a PASS. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const j = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const STATUS = /^(?:NOT TESTED|BLOCKED|PARTIALLY TESTED|VERIFIED|N\/A)/;
const blob = path => {
  const b = readFileSync(new URL('..' + path, import.meta.url));
  return createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
};

// Second-round summary is separate from the first-round counts.
const sr = j.secondReview;
assert.ok(sr, 'secondReview block missing');
assert.equal(sr.batchSizeLimit, 3);
assert.match(sr.firstRoundPreserved, /140\/140/);
assert.equal(j.counts.contentInspected, 140, 'first round must stay 140/140 inspected');
assert.equal(j.counts.F3FullPass, 0, 'first round full pass count must not change');
assert.equal(j.counts.audioMissing, 75, 'audio checkpoint 75/140 stays open');
assert.ok(!('reexamined' in j.counts), 'second-round tally must not be mixed into first-round counts');

const reviewed = j.records.filter(r => r.F3.secondReview);
const ids = reviewed.map(r => r.id);
const batchIds = sr.batches.flatMap(b => b.species);
assert.deepEqual(ids, batchIds, 'every second-review record belongs to a registered batch');
assert.deepEqual(ids, j.records.slice(0, ids.length).map(r => r.id), 'second round follows the existing record order');
for (const b of sr.batches) assert.ok(b.species.length <= sr.batchSizeLimit, b.round + ' exceeds batch limit');
assert.deepEqual(sr.batches[0].species, ['sp002', 'sp003', 'sp004']);
assert.equal(sr.batches[0].round, 'F3-REV2-R01');

const c = sr.counts;
assert.equal(c.reexamined, reviewed.length);
assert.equal(c.fullF3Pass, reviewed.filter(r => r.F3.secondReview.fullPass).length);
assert.equal(c.ownerDecisions, reviewed.filter(r => r.F3.secondReview.ownerDecision.decision).length);
assert.equal(c.ownerGateOpen, reviewed.filter(r => r.F3.secondReview.ownerDecision.status === 'OPEN').length);

for (const r of reviewed) {
  const s = r.F3.secondReview;
  // First-round fields stay intact.
  assert.equal(r.F3.reviewedThisRound, true, r.id + ' first-round flag lost');
  assert.match(r.F3.recheckBatch, /^F3-R\d{2}$/, r.id + ' first-round batch label overwritten');
  assert.equal(r.F3.fullPass, false);
  // No fake pass.
  assert.equal(s.fullPass, false, r.id + ' second review cannot be FULL PASS while gates are open');
  assert.match(s.sources.anwb, /^NOT TESTED/, r.id + ' ANWB may only be marked read with book, edition, ISBN and page');
  assert.match(s.sources.independence, /^NOT VERIFIED/, r.id + ' own re-inspection is not independent');
  assert.match(s.audio, /^BLOCKED/, r.id + ' missing audio stays open');
  assert.ok(s.materialGaps.length > 0 || s.ownerDecision.status !== 'OPEN');
  if (s.ownerDecision.status === 'OPEN') assert.equal(s.ownerDecision.decision, null, 'no pre-filled owner decision');
  // Photos: same slots, same bytes as reviewed, every check uses an allowed status.
  assert.deepEqual(s.photos.map(p => p.path), r.currentAssets.imageSlots.map(x => x.path), r.id + ' photo slot drift');
  for (const p of s.photos) {
    assert.equal(p.blobSha, blob(p.path), r.id + ' ' + p.path + ' changed after second review');
    for (const k of ['identity', 'quality', 'roleCheck', 'rightsREV2']) assert.match(p[k], STATUS, r.id + ' ' + k);
    assert.ok(p.author && p.license && p.source.startsWith('https://'), r.id + ' credit data incomplete');
  }
  for (const v of Object.values(s.text)) if (/^[A-Z]/.test(v) && !v.startsWith('Lengte') && !v.startsWith('Spanwijdte')) assert.match(v, STATUS);
  for (const l of s.lookalikes) for (const k of ['bothDirections', 'photoEquivalence', 'diagnosticText']) assert.match(l[k], STATUS, r.id + ' ' + l.pair);
}
console.log('F3-REV2: ' + reviewed.length + ' records re-examined, first round preserved, no fake PASS');
