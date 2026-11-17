/** Birdspot F3-R17 (Zwartkop, Tuinfluiter, Grasmus): source images, photo priority, Tuinfluiter profile, lookalikes. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-17/origcheck-r17/origcheck.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const byId = new Map(SPECIES.map(s => [s.id, s])), rec = id => f3.records.find(x => x.id === id).F3;

// 1. All 8 shown photos are the same shot as their source; Commons rights live, iNaturalist rights stay register-only.
assert.deepEqual(registry.focusSpecies.slice(24, 27), ['sp059', 'sp060', 'sp061']);
assert.equal(orig.items.length, 8);
assert.ok(orig.items.every(i => !i.error && i.sameShot === true));
assert.ok(orig.items.filter(i => i.commons).every(i => i.rightsMatch === true));
assert.ok(rec('sp061').checks.photoIndividualRights.startsWith('PARTIALLY TESTED'), 'iNaturalist rights not re-read: no VERIFIED');
// 2. Photo priority (owner 16/17-11): no flight search forced; missing optional role documented, never a fake photo.
for (const id of ['sp059', 'sp060', 'sp061']) assert.ok(!(GUIDE_POSES[id] || []).some(p => p.flight), id + ': no flight photo invented');
const tf = rec('sp060');
assert.ok(tf.checks.plumageAndTrueFlight.startsWith('VERIFIED (shown role only'));
assert.ok(tf.exemptions.plumageAndTrueFlight.reason.length > 20, 'missing optional roles documented');
assert.deepEqual(f3.records.find(x => x.id === 'sp060').currentAssets.imageSlots.map(s => s.path), ['/assets/species/sp060.webp']);
assert.equal(tf.fullPass, false); assert.notEqual(tf.independence, 'VERIFIED');
// Juveniles that rest partly on a photographer label stay open for independent review.
for (const id of ['sp059', 'sp061']) assert.match(rec(id).checks.plumageAndTrueFlight, /^PARTIALLY TESTED.*independent review/);
// 3. Tuinfluiter profile: sourced, nothing decisive, neutral sexes, discrepancies open.
const k = KNOWLEDGE.sp060;
assert.ok(k && k.keyMarks.every(m => m.reliability === 'ondersteunend') && k.critical.every(c => c.reliability === 'ondersteunend'));
assert.deepEqual(k.discrepancies.map(d => d.field).sort(), ['lengte', 'trend']);
assert.equal(byId.get('sp060').size.length, '13–15 cm', 'single publisher: existing band stays');
// 4. Lookalikes: registered, both directions where both photos are source-matched.
for (const id of ['LK-033', 'LK-034', 'LK-035', 'LK-036']) assert.ok(registry.pairs.some(p => p.id === id), id);
for (const [a, b] of [['sp059', 'sp060'], ['sp061', 'sp060'], ['sp061', 'sp062']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R17 PASS: 8 photos same shot, iNaturalist rights kept partial, photo priority without fake roles, Tuinfluiter profile, 4 pairs both directions');
