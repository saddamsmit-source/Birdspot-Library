/** Birdspot F3-R15 (Roodborsttapuit, Heggenmus, Winterkoning): source-image, biometry, new juvenile and lookalike guard. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const orig = read('../docs/media-intake/2026-11-16/origcheck-r15/origcheck.json');
const intake = read('../tools/media/intake_selection_2026-11-16_r15_result.json');
const byId = new Map(SPECIES.map(s => [s.id, s]));

// 1. Every shown photo checked against its source; the one sub-threshold crop is recorded, not hidden.
assert.deepEqual(registry.focusSpecies.slice(18, 21), ['sp053', 'sp054', 'sp055']);
assert.equal(orig.items.length, 7);
assert.ok(orig.items.every(i => !i.error));
const weak = orig.items.filter(i => !i.sameShot);
assert.deepEqual(weak.map(i => i.image), ['/assets/species/plumage/sp055-juv.webp'], 'only the cropped Winterkoning juvenile needs visual confirmation');
const localSha1 = createHash('sha1').update(readFileSync(new URL('..' + weak[0].image, import.meta.url))).digest('hex');
assert.equal(GUIDE_PLUMAGE.sp055.juv.sha1, localSha1, 'plumage sha1 is the local file hash and still matches');

// 2. New Heggenmus juvenile: pinned import, juvenile role, credits complete, no invented flight photo.
assert.equal(intake.length, 1);
assert.equal(intake[0].sourceSha1, 'b04f9c421f7ca93c86c585f36a565a914571d73d');
const juv = GUIDE_PLUMAGE.sp054.juv;
assert.equal(juv.image, '/assets/species/plumage/sp054-juv.webp');
assert.equal(juv.age, 'juvenile');
assert.ok(juv.author && juv.license === 'CC BY 2.0' && juv.source.startsWith('https://commons.wikimedia.org/'));
for (const id of ['sp053', 'sp054', 'sp055']) assert.ok(!(GUIDE_POSES[id] || []).some(p => p.flight), id + ': no flight photo invented');

// 3. Biometry follows norm §1.1 with two publishers.
assert.equal(byId.get('sp054').size.length, 'ca. 13–15 cm', 'Heggenmus: (13+13)/2=13, (14.5+15)/2=14.75 -> 15');
assert.equal(byId.get('sp053').size.length, 'ca. 12–14 cm');
assert.equal(byId.get('sp055').size.length, 'ca. 9–10 cm');
for (const id of ['sp053', 'sp054', 'sp055']) {
  const bio = KNOWLEDGE[id].basis.biometrics.find(b => b.field === 'length');
  assert.ok(bio && bio.values.length >= 2, id + ': two publishers');
}
assert.equal(byId.get('sp054').family, 'Heggenmussen');

// 4. Source conflicts are recorded, not silently resolved.
assert.ok(KNOWLEDGE.sp053.discrepancies.some(d => d.field === 'status'));
assert.ok(KNOWLEDGE.sp054.discrepancies.some(d => d.field === 'trend'));
assert.ok(KNOWLEDGE.sp055.discrepancies.some(d => d.field === 'trend'));

// 5. Lookalikes: register entries, rows for the strengthened pairs, both directions where both photos are verified.
const lk = new Map(registry.pairs.map(p => [p.id, p]));
for (const id of ['LK-025', 'LK-026', 'LK-027', 'LK-028', 'LK-029']) {
  const p = lk.get(id); assert.ok(p, id);
  assert.ok(p.criticalMarks.length >= 2 && p.criticalMarks.length <= 3, id + ' 2-3 marks');
  assert.ok(p.sources.length >= 2, id + ' sources');
}
assert.equal(lk.get('LK-025').photoState, 'MISSING_VERIFIED_PAIR');
const entry = label => GUIDE_COMPARISONS.find(c => c.label === label);
assert.equal(entry('Winterkoning en Boomkruiper · veldkenmerken').rows.length, 3);
assert.equal(entry('Heggenmus en Ringmus · volwassen in rust').rows.length, 2);
for (const [a, b] of [['sp053', 'sp050'], ['sp054', 'sp043'], ['sp054', 'sp044'], ['sp055', 'sp054']]) {
  assert.ok(recognitionPanel(byId.get(a)).includes('data-compare-species="' + b + '"'), a + ' -> ' + b);
  assert.ok(recognitionPanel(byId.get(b)).includes('data-compare-species="' + a + '"'), b + ' -> ' + a);
}
// Paapje has no photo: no panel, but the caution text stays on the Roodborsttapuit card.
assert.ok(!GUIDE_COMPARISONS.some(c => c.birds.some(b => b.id === 'sp286')), 'no Paapje photo comparison without a Paapje photo');
assert.match(KNOWLEDGE.sp053.caution.text, /Paapje/);
// The juvenile Heggenmus must not leak into adult comparisons.
const hegPanel = recognitionPanel(byId.get('sp043'));
assert.ok(!hegPanel.includes('sp054-juv.webp'), 'adult comparison keeps the adult Heggenmus photo');
console.log('F3-R15 PASS: 7 photos vs source (1 crop visually confirmed, local hash intact), Heggenmus juvenile pinned, 3 biometrics with two publishers, 3 source conflicts recorded, 5 new lookalike entries, pairs both directions');
