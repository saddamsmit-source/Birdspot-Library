/** Birdspot F3-R19 (Boomklever, Boomkruiper, Taigaboomkruiper): originals, rights, withheld juvenile, lookalikes both ways. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
import { GUIDE_PLUMAGE } from '../src/features/species/guideMedia.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const reg = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-17/origcheck-r19/origcheck.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media = read('../assets/species/field-guide-media.json');
const byId = new Map(SPECIES.map(s => [s.id, s])), rec = id => f3.records.find(x => x.id === id).F3;
const photos = orig.items.filter(i => i.kind !== 'audio'), audio = orig.items.filter(i => i.kind === 'audio');
assert.equal(photos.length, 8); assert.ok(photos.every(i => i.sameShot === true && i.commons.license === i.license));
assert.equal(audio.length, 6); assert.ok(audio.every(a => a.commons.license === a.license && /geen soortverificatie/.test(a.evidenceCeiling)));
assert.equal(audio.find(a => a.audio.endsWith('sp067-call.mp3')).commons.author, '', 'empty Commons author recorded, not papered over');
// Unproven Boomkruiper juvenile withheld, provenance kept, never live.
assert.equal(GUIDE_PLUMAGE.sp066.juv, undefined);
const withheld = media.retired.sp066.find(p => p.image.endsWith('sp066-juv-fed.webp'));
assert.ok(withheld && withheld.source && withheld.license && /Niet-vrijgegeven kandidaat/.test(withheld.retiredReason));
readFileSync(new URL('..' + withheld.image, import.meta.url));
for (const id of ['sp065', 'sp066', 'sp067']) assert.ok(!recognitionPanel(byId.get(id)).includes('sp066-juv-fed.webp'));
assert.match(rec('sp066').checks.plumageAndTrueFlight, /NOT RELEASED/);
for (const id of ['sp065', 'sp066', 'sp067']) assert.ok(rec(id).checks.audioRecordingsAuthenticity.startsWith('NOT TESTED'));
assert.ok(KNOWLEDGE.sp067.status.some(s => /onvoldoende gegevens/.test(s.text)));
assert.ok(KNOWLEDGE.sp065.status.some(s => /toename/.test(s.text)));
const lk040 = reg.pairs.find(p => p.id === 'LK-040');
assert.ok(lk040.criticalMarks.every(m => m.values[0] !== m.values[1]));
assert.ok(!lk040.criticalMarks.some(m => /snavel|nagel/i.test(m.label)), 'weak overlapping marks (bill/claw length) not decisive');
for (const [a, b] of [['sp066', 'sp067'], ['sp065', 'sp066']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R19 PASS: 8 photos same shot, 6 recordings rights/metadata only, Boomkruiper juvenile withheld, LK-040/041 both directions');
