/** Birdspot F3-R18 (Braamsluiper, Goudhaantje, Vuurgoudhaan): sources, roles, open reviews, lookalikes both ways. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const reg = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-17/origcheck-r18/origcheck.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const byId = new Map(SPECIES.map(s => [s.id, s])), rec = id => f3.records.find(x => x.id === id).F3;
const photos = orig.items.filter(i => i.kind !== 'audio'), audio = orig.items.filter(i => i.kind === 'audio');
assert.equal(photos.length, 8); assert.ok(photos.every(i => i.sameShot === true));
assert.ok(photos.filter(i => i.commons).every(i => i.rightsMatch === true));
assert.equal(audio.length, 3); assert.ok(audio.every(a => a.rightsMatch === true && /geen soortverificatie/.test(a.evidenceCeiling)));
assert.ok(rec('sp064').checks.photoIndividualRights.startsWith('PARTIALLY TESTED'), 'iNaturalist juvenile rights stay partial');
assert.match(rec('sp063').checks.plumageAndTrueFlight, /'Vrouwtje' label NOT proven/);
assert.match(rec('sp064').checks.plumageAndTrueFlight, /juvenile REVIEW REQUIRED/);
for (const id of ['sp063', 'sp064']) assert.ok(rec(id).checks.audioRecordingsAuthenticity.startsWith('NOT TESTED'));
const k = KNOWLEDGE.sp062;
assert.ok(k && k.keyMarks.every(m => m.reliability === 'ondersteunend') && k.detail.some(d => d.topic === 'geslacht'));
assert.ok(KNOWLEDGE.sp063.discrepancies.some(d => d.field === 'trend'));
assert.ok(reg.pairs.find(p => p.id === 'LK-036').mediaOpen[0].startsWith('Both sides source-matched'));
assert.match(reg.pairs.find(p => p.id === 'LK-039').mediaOpen[0], /^REVIEW REQUIRED/);
for (const [a, b] of [['sp062', 'sp061'], ['sp062', 'sp060'], ['sp063', 'sp064']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R18 PASS: 8 photos same shot, 3 recordings rights only, 2 label/identity reviews kept open, Braamsluiper profile, LK-036 re-checked, pairs both directions');
