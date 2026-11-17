/** Birdspot F3-R14 (Grote Lijster, Roodborst, Zwarte Roodstaart): source-image, credit and lookalike guard. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-16/origcheck-r14/origcheck.json');
const byId = new Map(SPECIES.map(s => [s.id, s]));
assert.deepEqual(registry.focusSpecies.slice(15, 18), ['sp049', 'sp050', 'sp051']);
assert.equal(orig.items.length, 8);
assert.ok(orig.items.every(i => !i.error && i.sameShot), 'all 8 shown photos match their source image');
assert.equal(GUIDE_PLUMAGE.sp049.juv.author, 'Jim Champion from Southampton, UK');
assert.equal(GUIDE_PLUMAGE.sp051.adult_m.author, 'Luiz Lapa from Oeiras, Portugal');
assert.equal(GUIDE_POSES.sp050.find(p => p.image.endsWith('sp050-flight.webp')).author, 'Joe Dyer from Buckhurst Hill, England');
for (const id of ['sp049', 'sp050', 'sp051']) assert.ok(!(GUIDE_POSES[id] || []).some(p => p.flight), id + ': no flight photo invented');
for (const [a, b] of [['sp049', 'sp046'], ['sp050', 'sp053'], ['sp051', 'sp178']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R14 PASS: 8 photos match sources, 3 credits aligned with Commons, no invented flight photos, 3 lookalike pairs both directions');
