/** Birdspot F3-R18 (Braamsluiper, Goudhaantje, Vuurgoudhaan): sources, roles, open reviews, lookalikes both ways. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
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
// QA-fix F3-R18: doubtful juvenile withheld (file + provenance kept), neutral label for unproven female.
const media = read('../assets/species/field-guide-media.json');
assert.equal(GUIDE_PLUMAGE.sp064.juv, undefined, 'withheld Vuurgoudhaan juvenile must not be in the live guide');
const withheld = media.retired.sp064.find(p => p.image === '/assets/species/plumage/sp064-juv.webp');
assert.ok(withheld && withheld.source.endsWith('/298756944') && withheld.license && withheld.author !== '' && /Niet-vrijgegeven kandidaat/.test(withheld.retiredReason));
readFileSync(new URL('..' + withheld.image, import.meta.url));
assert.match(rec('sp064').checks.plumageAndTrueFlight, /NOT RELEASED/);
assert.ok(!rec('sp064').checks.plumageAndTrueFlight.startsWith('VERIFIED'));
assert.equal(GUIDE_PLUMAGE.sp063.adult_f, undefined, 'unproven female no longer in a sex slot');
const neutral = GUIDE_POSES.sp063.find(p => p.image.endsWith('sp063-adult-f.webp'));
assert.ok(neutral && neutral.label === 'Volwassen' && !neutral.sex && neutral.sourceSexClaim === 'female' && /bronclaim/.test(neutral.sexNote));
assert.ok(!/Vrouwtje/.test(neutral.alt + neutral.label + neutral.note));
const lk039 = GUIDE_COMPARISONS.find(c => c.label === 'Goudhaantje en Vuurgoudhaan · juvenielen');
assert.ok(lk039.birds.every(b => b.photoMissing === true), 'LK-039 photo panel hidden');
for (const id of ['sp063', 'sp064']) assert.ok(!recognitionPanel(byId.get(id)).includes('sp064-juv.webp'));
for (const id of ['sp063', 'sp064']) assert.ok(rec(id).checks.audioRecordingsAuthenticity.startsWith('NOT TESTED'));
const k = KNOWLEDGE.sp062;
assert.ok(k && k.keyMarks.every(m => m.reliability === 'ondersteunend') && k.detail.some(d => d.topic === 'geslacht'));
assert.ok(KNOWLEDGE.sp063.discrepancies.some(d => d.field === 'trend'));
assert.ok(reg.pairs.find(p => p.id === 'LK-036').mediaOpen[0].startsWith('Both sides source-matched'));
assert.equal(reg.pairs.find(p => p.id === 'LK-039').photoState, 'MISSING_VERIFIED_PAIR');
for (const [a, b] of [['sp062', 'sp061'], ['sp062', 'sp060'], ['sp063', 'sp064']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R18 PASS: 8 photos same shot, 3 recordings rights only, juvenile withheld, neutral label, LK-039 hidden, Braamsluiper profile, LK-036 re-checked, pairs both directions');
