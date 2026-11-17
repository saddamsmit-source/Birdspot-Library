/** Birdspot F3-R20 (Witte Kwikstaart, Gele Kwikstaart, Veldleeuwerik) + R19-QA author evidence. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
import { GUIDE_PLUMAGE } from '../src/features/species/guideMedia.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const orig = read('../docs/media-intake/2026-11-17/origcheck-r20/origcheck.json');
const bl = read('../docs/media-intake/2026-11-17/origcheck-r20c/origcheck.json').items[0];
const media = read('../assets/species/field-guide-media.json');
const reg = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const byId = new Map(SPECIES.map(s => [s.id, s]));
const r20 = orig.items.filter(i => ['sp068', 'sp069', 'sp070'].includes(i.speciesId));
assert.equal(r20.length, 8); assert.ok(r20.every(i => i.sameShot === true));
assert.ok(r20.filter(i => i.commons).every(i => i.rightsMatch === true && i.authorRule === 'exact'));
assert.ok(r20.filter(i => !i.commons).every(i => i.rightsMatch === null), 'iNaturalist rights stay register-only');
// R19-QA: only traceable author forms; British Library call via explicit page fields.
const rule = img => orig.items.find(i => (i.image || '').endsWith(img)).authorRule;
assert.equal(rule('sp065-head-down.webp'), 'flickr-location-suffix'); assert.equal(rule('sp065-flight.webp'), 'account-suffix');
assert.equal(bl.authorRule, 'recordist+copyright-holder'); assert.equal(bl.rightsMatch, true);
assert.deepEqual(bl.commons.creditFields, { recordist: 'Aubrey John Williams', copyrightHolder: 'The British Library Board' });
assert.equal(bl.commons.author, ''); assert.ok(!('sameShot' in bl), 'audio never gets a species/same-shot verdict');
// Withheld juvenile kept with provenance, never live.
assert.equal(GUIDE_PLUMAGE.sp069.juv, undefined);
const w = media.retired.sp069.find(p => p.image.endsWith('sp069-juv.webp'));
assert.ok(w && w.source.endsWith('/219611553') && /Niet-vrijgegeven kandidaat/.test(w.retiredReason));
for (const id of ['sp068', 'sp069']) assert.ok(!recognitionPanel(byId.get(id)).includes('sp069-juv.webp'));
assert.ok(KNOWLEDGE.sp069.discrepancies.some(d => d.field === 'trend'));
assert.ok(KNOWLEDGE.sp070.status.some(s => /gevoelig/.test(s.text)));
for (const id of ['LK-042', 'LK-043']) assert.ok(reg.pairs.find(p => p.id === id).criticalMarks.every(m => m.values[0] !== m.values[1]));
for (const [a, b] of [['sp068', 'sp069'], ['sp070', 'sp072']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R20 PASS: 8 photos same shot, iNaturalist rights partial, Gele Kwikstaart juvenile withheld, LK-042/043 both directions; R19-QA author rule evidence');
