/** Birdspot F3-R16 (Tjiftjaf, Fitis, Fluiter): source images, audio rights ceiling, new Fluiter profile, lookalikes. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_PLUMAGE, GUIDE_POSES, GUIDE_AUDIO } from '../src/features/species/guideMedia.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-16/origcheck-r16/origcheck.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const byId = new Map(SPECIES.map(s => [s.id, s]));

// 1. Five photos against source; the one sub-threshold crop is recorded, not hidden.
assert.deepEqual(registry.focusSpecies.slice(21, 24), ['sp056', 'sp057', 'sp058']);
const photos = orig.items.filter(i => i.kind !== 'audio'), audio = orig.items.filter(i => i.kind === 'audio');
assert.equal(photos.length, 5); assert.equal(audio.length, 4);
assert.ok(orig.items.every(i => !i.error && i.rightsMatch === true), 'all 9 items: Commons author and licence match');
assert.deepEqual(photos.filter(i => !i.sameShot).map(i => i.image), ['/assets/species/plumage/sp058-flight.webp']);
// 2. Audio: metadata only, never a species verification (protocol v0.2).
for (const a of audio) { assert.ok(!('sameShot' in a)); assert.match(a.evidenceCeiling, /geen soortverificatie/); }
for (const id of ['sp056', 'sp057']) {
  const c = f3.records.find(x => x.id === id).F3.checks;
  assert.ok(c.audioLicenseAndAttribution.startsWith('VERIFIED'));
  assert.ok(c.audioRecordingsAuthenticity.startsWith('NOT TESTED'), id + ': recordings stay source-label only');
  assert.ok(c.soundRolesSongCall.startsWith('NOT TESTED'));
}
assert.ok(!(GUIDE_AUDIO?.sp058 || []).length, 'no Fluiter recording invented');
// 3. No invented media: no flight photo, no juvenile for the three warblers.
for (const id of ['sp056', 'sp057', 'sp058']) {
  assert.ok(!(GUIDE_POSES[id] || []).some(p => p.flight), id + ': no flight photo');
  assert.ok(!GUIDE_PLUMAGE[id]?.juv, id + ': no juvenile placed');
}
// 4. New Fluiter profile: sourced, nothing decisive, discrepancies kept open.
const fl = KNOWLEDGE.sp058;
assert.ok(fl && fl.keyMarks.length >= 3 && fl.keyMarks.every(m => m.reliability === 'ondersteunend'));
assert.deepEqual(fl.discrepancies.map(d => d.field).sort(), ['lengte', 'maanden', 'verspreiding']);
assert.ok(fl.open.length >= 3);
assert.equal(byId.get('sp058').size.length, '11–13 cm', 'single publisher: existing band stays (norm §1.1)');
// 5. Lookalike pairs both directions.
for (const id of ['LK-030', 'LK-031', 'LK-032']) assert.ok(registry.pairs.some(p => p.id === id), id);
for (const [a, b] of [['sp056', 'sp057'], ['sp057', 'sp058'], ['sp056', 'sp058']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
console.log('F3-R16 PASS: 5 photos + 4 recordings rights-matched, 1 crop visually confirmed, audio stays source-label only, no invented media, Fluiter profile with 3 open discrepancies, 3 pairs both directions');
