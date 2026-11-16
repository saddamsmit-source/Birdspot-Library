/** Birdspot F3-R10 (Putter, Sijs, Kneu): structural lookalike and knowledge guard.
 * Not a source/rights, ornithological or real-device certification. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { KNOWLEDGE, KNOWLEDGE_SOURCES } from '../src/data/speciesKnowledge.js';
import { comparisonPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const registry = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const f3 = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const byId = new Map(SPECIES.map(s => [s.id, s]));
const R10 = ['sp037', 'sp038', 'sp039'];

// 1. Scope: exactly the three next species, appended after the R09 focus.
assert.deepEqual(registry.focusSpecies.slice(3, 6), R10);
assert.deepEqual(f3.records.filter(r => r.F3.recheckBatch === 'F3-R10').map(r => r.id), R10);

// 2. Every R10 focus species has at least one registered lookalike pair; all pairs keep max three traits.
const pairs = Object.fromEntries(registry.pairs.map(p => [p.id, p]));
for (const id of R10) assert.ok(registry.pairs.some(p => p.focus.includes(id)), 'No lookalike pair for ' + id);
for (const id of ['LK-008', 'LK-009', 'LK-010', 'LK-011', 'LK-012']) {
  const p = pairs[id];
  assert.ok(p, 'Missing ' + id);
  assert.ok(p.criticalMarks.length >= 2 && p.criticalMarks.length <= 3);
  assert.equal(p.textState, 'PARTIALLY TESTED');
}
assert.deepEqual(pairs['LK-009'].birds, ['sp039', 'sp295']);
assert.deepEqual(pairs['LK-010'].birds, ['sp038', 'sp300']);
assert.deepEqual(pairs['LK-011'].birds, ['sp039', 'sp296']);
for (const id of ['LK-009', 'LK-010', 'LK-011']) assert.equal(pairs[id].photoState, 'MISSING_VERIFIED_PAIR', id + ' has no verified photo pair');

// 3. Missing photo pairs never render: no comparison panel with Frater, barmsijzen or Europese kanarie.
for (const missing of ['sp295', 'sp296', 'sp297', 'sp300']) {
  const shown = GUIDE_COMPARISONS.filter(c => c.birds.some(b => b.id === missing) &&
    c.birds.every(b => comparisonPhoto(b, Boolean(c.flight))));
  assert.equal(shown.length, 0, 'Incomplete pair rendered for ' + missing);
}

// 4. Existing complete photo pairs remain visible in both directions.
for (const [a, b] of [['sp037', 'sp038'], ['sp039', 'sp042']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
const juv = GUIDE_COMPARISONS.find(c => c.label === 'Putter en Sijs · juvenielen in rust');
assert.ok(juv && juv.rows.length === 3 && juv.birds.every(b => b.plumage === 'juv'));

// 5. Knowledge: new Kneu profile, visible caution text, symmetric references and sourced claims.
const kneu = KNOWLEDGE.sp039;
assert.ok(kneu, 'Kneu needs a knowledge profile');
assert.match(kneu.caution.text, /Frater/);
assert.match(kneu.caution.text, /barmsij(s|zen)/i);
assert.ok(['sp295', 'sp296', 'sp297', 'sp042'].every(id => kneu.similar.some(s => s.id === id)));
assert.ok(kneu.keyMarks.length >= 3 && kneu.keyMarks.every(m => m.reliability !== 'doorslaggevend'));
assert.ok(kneu.open.length > 0, 'Open points must stay visible in the source profile');
assert.match(KNOWLEDGE.sp038.caution.text, /Europese kanarie/);
assert.ok(KNOWLEDGE.sp038.similar.some(s => s.id === 'sp037'), 'Sijs must refer back to Putter');
assert.ok(KNOWLEDGE.sp037.similar.some(s => s.id === 'sp038'), 'Putter must refer to Sijs');
for (const key of ['VB_KNEU', 'VB_FRATER', 'VB_GROTE_BARMSIJS', 'VB_EUROKANARIE', 'VB_ROODMUS'])
  assert.ok(KNOWLEDGE_SOURCES[key]?.url?.startsWith('https://'), 'Missing source ' + key);

// 6. Status discrepancy: species.js is generated from docs/data/vogellijst-nederland.json and stays unchanged;
//    the conflict with Vogelbescherming (Dutch breeders winter in SW Europe) must be registered, not hidden.
assert.match(byId.get('sp039').status, /Standvogel/, 'species.js must stay equal to the canonical list');
assert.ok(kneu.discrepancies.some(x => /Standvogel/.test(x.app) && /Zuidwest-Europa/.test(x.source)), 'Status conflict must be registered');
assert.ok(kneu.open.some(x => /vogellijst-nederland/.test(x)), 'Status review must stay an open point');

// 7. No audio invented for the three species.
const audio = JSON.parse(readFileSync(new URL('../assets/species/field-guide-media.json', import.meta.url), 'utf8')).audio;
for (const id of R10) assert.ok(!audio[id] || audio[id].length === 0, 'Unexpected audio for ' + id);

console.log('LOOKALIKE R10 PASS: Putter, Sijs, Kneu; 5 new pairs (2 photo pairs, 3 text-only with hidden photos); Kneu profile and status discrepancy registered; no audio invented');
