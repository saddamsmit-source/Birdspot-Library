/** Birdspot F3-R11 (Goudvink, Appelvink, Roodmus): structural lookalike and knowledge guard.
 * Not a source/rights, ornithological or real-device certification. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { KNOWLEDGE, KNOWLEDGE_SOURCES } from '../src/data/speciesKnowledge.js';
import { comparisonPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media = read('../assets/species/field-guide-media.json');
const review = read('../docs/fotokwaliteit/vluchtcontrole.json').assets;
const byId = new Map(SPECIES.map(s => [s.id, s]));
const R11 = ['sp040', 'sp041', 'sp042'];

// 1. Scope: exactly the three next species, appended after the R10 focus.
assert.deepEqual(registry.focusSpecies.slice(6, 9), R11);
assert.deepEqual(f3.records.filter(r => r.F3.recheckBatch === 'F3-R11').map(r => r.id), R11);

// 2. Every focus species has a lookalike pair; new pairs carry 2-3 traits and stay PARTIALLY TESTED.
const pairs = Object.fromEntries(registry.pairs.map(p => [p.id, p]));
for (const id of R11) assert.ok(registry.pairs.some(p => p.focus.includes(id)), 'No lookalike pair for ' + id);
assert.deepEqual(pairs['LK-013'].birds, ['sp040', 'sp035']);
assert.deepEqual(pairs['LK-014'].birds, ['sp041', 'sp035']);
assert.deepEqual(pairs['LK-015'].birds, ['sp042', 'sp119']);
assert.ok(pairs['LK-012'].focus.includes('sp042'));
assert.equal(pairs['LK-015'].photoState, 'MISSING_VERIFIED_PAIR');

// 3. §3.4: only complete photo pairs render; Grauwe Gors (no photo) never as a photo pair.
const shownWith = id => GUIDE_COMPARISONS.filter(c => c.birds.some(b => b.id === id) && c.birds.every(b => comparisonPhoto(b, Boolean(c.flight))));
assert.equal(shownWith('sp119').length, 0, 'Incomplete pair rendered for Grauwe Gors');
for (const [a, b] of [['sp040', 'sp035'], ['sp041', 'sp035'], ['sp042', 'sp039']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
for (const label of ['Goudvink en Vink · mannetje', 'Goudvink en Vink · vrouwtjes in rust', 'Appelvink en Vink · mannetje',
  'Appelvink en Vink · vrouwtjes in rust', 'Appelvink en Vink · juvenielen in rust', 'Kneu en Roodmus · mannetjes in rust']) {
  const c = GUIDE_COMPARISONS.find(x => x.label === label);
  assert.ok(c && c.birds.every(b => comparisonPhoto(b, false)?.image), 'Photo pair incomplete: ' + label);
}

// 4. Flight roles: Goudvink approved free flight; Appelvink provisional (visible as such); Roodmus archive stays archived.
assert.equal(review['/assets/species/plumage/sp040-flight.webp'].decision, 'goedgekeurd');
assert.equal(review['/assets/species/plumage/sp041-flight.webp'].decision, 'voorwaardelijk');
assert.match(recognitionPanel(byId.get('sp041')), /Voorlopige foto/);
assert.equal(review['/assets/species/plumage/sp042-flight.webp'].decision, 'archief');
assert.ok(!recognitionPanel(byId.get('sp042')).includes('sp042-flight.webp'), 'Archived Roodmus photo must not be shown');
assert.ok(media.retired.sp042.some(p => p.image.endsWith('sp042-flight.webp')), 'Archived file and provenance kept');
assert.ok(!GUIDE_PLUMAGE.sp042 && !(GUIDE_POSES.sp042 || []).length, 'No invented Roodmus female/juvenile/flight photo');

// 5. Knowledge: new Roodmus profile with sources, caution and symmetric Kneu reference.
const rood = KNOWLEDGE.sp042;
assert.ok(rood, 'Roodmus needs a knowledge profile');
assert.match(rood.caution.text, /Grauwe Gors/);
assert.ok(['sp039', 'sp119'].every(id => rood.similar.some(s => s.id === id)));
assert.ok(KNOWLEDGE.sp039.similar.some(s => s.id === 'sp042'), 'Kneu must refer to Roodmus');
assert.ok(rood.keyMarks.every(m => m.reliability !== 'doorslaggevend'), 'No decisive claim without two publishers and conditions');
assert.ok(rood.open.length >= 2, 'Open points stay visible');
for (const key of ['VB_ROODMUS', 'VB_ROODMUS_ZELDZAAM', 'VB_MUSSEN', 'RSPB_ROODMUS'])
  assert.ok(KNOWLEDGE_SOURCES[key]?.url?.startsWith('https://'), 'Missing source ' + key);
assert.equal(byId.get('sp042').category, 'zomergast', 'species.js stays equal to the canonical list');

// 6. No audio invented.
for (const id of R11) assert.ok(!media.audio[id] || media.audio[id].length === 0, 'Unexpected audio for ' + id);

console.log('LOOKALIKE R11 PASS: Goudvink, Appelvink, Roodmus; 3 new pairs (2 photo pairs, 1 text-only hidden); Roodmus profile sourced; flight roles kept; no audio invented');
