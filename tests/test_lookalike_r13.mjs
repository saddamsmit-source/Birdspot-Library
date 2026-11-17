/** Birdspot F3-R13 (Zanglijster, Kramsvogel, Koperwiek): source-image, credit and lookalike guard. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-16/origcheck-r13/origcheck.json');
const flight = read('../docs/fotokwaliteit/vluchtcontrole.json').assets;
const byId = new Map(SPECIES.map(s => [s.id, s]));
assert.deepEqual(registry.focusSpecies.slice(12, 15), ['sp046', 'sp047', 'sp048']);
assert.equal(orig.items.length, 9);
assert.ok(orig.items.every(i => !i.error));
assert.deepEqual(orig.items.filter(i => !i.sameShot).map(i => i.image).sort(),
  ['/assets/species/plumage/sp047-flight.webp', '/assets/species/plumage/sp048-flight.webp'], 'only the two deep crops need the visual same-scene check');
// credits equal Commons after alignment
assert.equal(GUIDE_PLUMAGE.sp046.juv.author, 'Frank Vassen from Brussels, Belgium');
assert.equal(GUIDE_PLUMAGE.sp047.juv.author, 'hedera.baltica from Wrocław, Poland');
// Koperwiek: no free-flight photo invented; take-off photo stays out of the flight role
assert.equal(flight['/assets/species/plumage/sp048-flight.webp'].decision, 'uit-rol');
assert.ok(!(GUIDE_POSES.sp048 || []).some(p => p.flight), 'No Koperwiek photo marked as flight');
// lookalike pairs render in both directions
for (const [a, b] of [['sp046', 'sp049'], ['sp048', 'sp046'], ['sp047', 'sp048'], ['sp046', 'sp047']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R13 PASS: 9 photos checked against sources, 2 credits aligned, no invented Koperwiek flight photo, 4 lookalike pairs both directions');
