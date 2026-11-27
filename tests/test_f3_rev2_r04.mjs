/** F3-REV2-R04 — Kleine Bonte Specht, Zwarte Specht, Groene Specht (eigenaarbesluit 24-11-2026 12:16).
 *
 * Borgt: bestaande fotoparen en kritische kaarten blijven; quickPrimary laat alle kenmerken staan;
 * LK-109…LK-111 met gelabelde kenmerken in beide richtingen; eigenaarbesluit B met open bewijs, geen FULL PASS;
 * besluiten en records van R01–R03 onaangetast; tweede ronde 12/140.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const similar = id => recognitionPanel(byId.get(id)).match(/<section class="sd-similar"[\s\S]*?<\/section>/)?.[0] || '';
const panels = id => similar(id).split('<div class="sd-cmp-panel"').slice(1).map(p => JSON.stringify([
  p.match(/data-compare-species="(sp\d+)"/)?.[1], p.startsWith(' data-cmp-panel data-cmp-flight'),
  [...p.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1].split('/').pop())]));

// Stand op het R03d-checkpoint (4a430e6); mag groeien, nooit krimpen.
const BEFORE = {
  sp017: [['sp016', false, ['sp017.webp', 'sp016-hero-male.webp']], ['sp016', false, ['sp017-female.webp', 'sp016.webp']], ['sp020', false, ['sp017.webp', 'sp020-male.webp']]],
  sp018: [['sp019', false, ['sp018.webp', 'sp019-hero-male.webp']], ['sp019', true, ['sp018-flight.webp', 'sp019-flight.webp']]],
  sp019: [['sp018', false, ['sp019-hero-male.webp', 'sp018.webp']], ['sp018', true, ['sp019-flight.webp', 'sp018-flight.webp']]],
};
const CRIT_VS = { sp017: ['sp016', 'sp020'], sp018: ['sp019'], sp019: ['sp018'] };
for (const [id, list] of Object.entries(BEFORE)) {
  const now = panels(id);
  for (const pair of list) assert.ok(now.includes(JSON.stringify(pair)), `${id}: vergelijking verdwenen ${JSON.stringify(pair)}`);
  const k = KNOWLEDGE[id];
  for (const b of CRIT_VS[id]) assert.ok(k.critical.some(c => c.vs.includes(b)), `${id}: kritische kaart vs ${b} verdwenen`);
  assert.ok(Array.isArray(k.quickPrimary) && k.quickPrimary.length <= 2 && k.keyMarks.length >= 4, `${id}: quickPrimary compact, alle kenmerken behouden`);
}
assert.deepEqual([KNOWLEDGE.sp017.quickPrimary, KNOWLEDGE.sp018.quickPrimary, KNOWLEDGE.sp019.quickPrimary], [[2, 3], [0, 2], [0, 1]]);

const lk = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json', import.meta.url), 'utf8'));
for (const [id, birds] of Object.entries({ 'LK-109': ['sp017', 'sp020'], 'LK-110': ['sp018', 'sp019'], 'LK-111': ['sp018', 'sp019'] })) {
  const p = lk.pairs.find(x => x.id === id);
  assert.deepEqual(p?.birds, birds, id);
  for (const [i, b] of birds.entries()) assert.ok(recognitionPanel(byId.get(b)).includes(`data-compare-species="${birds[1 - i]}"`), `${id}: ${b} -> ${birds[1 - i]}`);
}
for (let n = 1; n <= 111; n++) assert.ok(lk.pairs.find(p => p.id === `LK-${String(n).padStart(3, '0')}`), `LK-${n} behouden`);

const reg = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const b = reg.secondReview.batches.find(x => x.round === 'F3-REV2-R04');
assert.deepEqual(b.species, ['sp017', 'sp018', 'sp019']);
for (const id of b.species) {
  const s = reg.records.find(r => r.id === id).F3.secondReview;
  assert.equal(s.round, 'F3-REV2-R04'); assert.equal(s.fullPass, false);
  assert.equal(s.ownerDecision.status, 'DECIDED');
  assert.match(s.ownerDecision.decision, /^B\b/);
  assert.match(s.ownerDecision.reference, /issuecomment-7134854859$/);
  assert.ok(s.materialGaps.length > 0);
  assert.equal(s.sources.vogelbescherming.status, 'PARTIALLY TESTED');
  assert.match(s.sources.vogelbescherming.url, /^https:\/\/www\.vogelbescherming\.nl\//);
  assert.ok(s.sources.vogelbescherming.readDate && s.sources.vogelbescherming.findings);
  assert.match(s.sources.anwb, /^NOT TESTED/);
  for (const a of s.audio.files) assert.equal(a.listenedBy, null);
}
for (const id of ['sp002', 'sp003', 'sp004', 'sp005', 'sp006', 'sp007', 'sp008', 'sp009', 'sp016'])
  assert.equal(reg.records.find(r => r.id === id).F3.secondReview.ownerDecision.status, 'DECIDED', `${id}: eerder besluit behouden`);
const roundsThroughR04 = reg.secondReview.batches.slice(0, 4);
assert.equal(roundsThroughR04.at(-1).round, 'F3-REV2-R04');
const idsThroughR04 = roundsThroughR04.flatMap(round => round.species);
assert.equal(idsThroughR04.length, 12);
assert.deepEqual(idsThroughR04, reg.records.slice(0, 12).map(record => record.id));
for (const record of reg.records.slice(0, 12)) {
  const review = record.F3.secondReview;
  assert.equal(review.ownerDecision.status, 'DECIDED', record.id);
  assert.equal(review.fullPass, false, record.id);
  assert.notEqual(review.closed, true, record.id);
}
const tuscany = reg.records.find(r => r.id === 'sp009').F3.secondReview.candidatesR03c.proposalR03d;
assert.equal(tuscany.ownerDecisionR04b.decision, 'NEE');
assert.match(tuscany.status, /^AFGEWEZEN/);
assert.match(recognitionPanel(byId.get('sp019')), /kb-caution[^]*?<strong>Let op<\/strong>/);
console.log('F3-REV2-R04 PASS: bestaande paren en kritische kaarten behouden; quickPrimary compact; LK-109…LK-111 wederkerig; eigenaarbesluit B verwerkt; bewijsgrenzen en eerdere besluiten blijven');
