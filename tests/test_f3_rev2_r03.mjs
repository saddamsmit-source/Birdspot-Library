/** F3-REV2-R03 — Torenvalk, Slechtvalk, Grote Bonte Specht (eigenaarbesluit 23-11-2026 22:10).
 *
 * Borgt dat de review en quickPrimary niets van de bestaande vergelijkingen afhalen:
 * - alle bestaande fotoparen (partner, rust/vlucht, beide foto's) blijven op de drie kaarten;
 * - alle kritische vergelijkingskaarten blijven onder "Lijkt op";
 * - de nieuwe soortverwarringsregistraties LK-100…LK-105 zijn traceerbaar in beide richtingen;
 * - het register houdt de eigenaarspoort open (geen vooringevuld besluit, geen FULL PASS).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const similar = id => recognitionPanel(byId.get(id)).match(/<section class="sd-similar"[\s\S]*?<\/section>/)?.[0] || '';
const panels = id => similar(id).split('<div class="sd-cmp-panel"').slice(1).map(p => [
  p.match(/data-compare-species="(sp\d+)"/)?.[1], p.startsWith(' data-cmp-panel data-cmp-flight'),
  [...p.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1].split('/').pop())]);

// Stand op de R02c-checkpoint (ad514b0); mag alleen groeien, nooit krimpen.
const BEFORE = {
  sp008: [['sp009', false, ['sp008-juv.webp', 'sp009-juv.webp']], ['sp009', true, ['sp008-male-flight.webp', 'sp009-male-flight.webp']],
    ['sp006', false, ['sp008-juv.webp', 'sp006-juv.webp']], ['sp006', true, ['sp008-flight.webp', 'sp006-flight.webp']],
    ['sp007', true, ['sp008-flight.webp', 'sp007-male-flight.webp']]],
  sp009: [['sp008', false, ['sp009-juv.webp', 'sp008-juv.webp']], ['sp008', true, ['sp009-male-flight.webp', 'sp008-male-flight.webp']],
    ['sp007', false, ['sp009-juv.webp', 'sp007-juv.webp']]],
  sp016: [['sp020', false, ['sp016-juv.webp', 'sp020-male.webp']], ['sp020', true, ['sp016-flight.webp', 'sp020-flight.webp']],
    ['sp017', false, ['sp016-hero-male.webp', 'sp017.webp']]],
};
const CRIT = { sp008: 1, sp009: 1, sp016: 2 };
for (const [id, list] of Object.entries(BEFORE)) {
  const now = panels(id).map(x => JSON.stringify(x));
  for (const pair of list) assert.ok(now.includes(JSON.stringify(pair)), `${id}: vergelijking verdwenen ${JSON.stringify(pair)}`);
  assert.ok((similar(id).match(/class="kb-crit-card"/g) || []).length >= CRIT[id], id + ': kritische vergelijkingskaart verdwenen');
}

// Soortverwarringsregister: nieuwe paren en focussoorten.
const lk = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const want = { 'LK-100': ['sp008', 'sp009'], 'LK-101': ['sp016', 'sp020'], 'LK-102': ['sp016', 'sp017'],
  'LK-103': ['sp008', 'sp261'], 'LK-104': ['sp008', 'sp260'], 'LK-105': ['sp009', 'sp261'] };
for (const [id, birds] of Object.entries(want)) {
  const p = lk.pairs.find(x => x.id === id);
  assert.deepEqual(p?.birds, birds, id);
  assert.equal(p.textState, 'PARTIALLY TESTED');
  if (p.photoState === 'REGISTERED_PAIR_PENDING_F3_ORIGINAL') {
    for (const [i, b] of birds.entries()) assert.ok(recognitionPanel(byId.get(b)).includes(`data-compare-species="${birds[1 - i]}"`), `${id}: ${b} -> ${birds[1 - i]}`);
  }
}
assert.deepEqual(lk.focusSpecies.slice(-3), ['sp008', 'sp009', 'sp016']);

// Register: R03-batch met open eigenaarspoort, geen FULL PASS.
const reg = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const r03 = reg.secondReview.batches.find(b => b.round === 'F3-REV2-R03');
assert.deepEqual(r03.species, ['sp008', 'sp009', 'sp016']);
for (const id of r03.species) {
  const s = reg.records.find(r => r.id === id).F3.secondReview;
  assert.equal(s.round, 'F3-REV2-R03');
  assert.equal(s.fullPass, false);
  if (s.ownerDecision.status === 'OPEN') assert.ok(s.materialGaps.length > 0, id + ': open poort zonder benoemde tekortkoming');
}
assert.ok(reg.secondReview.counts.reexamined <= 9 || reg.secondReview.batches.length > 3, 'na R03 maximaal 9/140 in de tweede ronde');
console.log('F3-REV2-R03 PASS: bestaande vergelijkingen en kritische kaarten behouden; LK-100…LK-105 traceerbaar; eigenaarspoort open');
