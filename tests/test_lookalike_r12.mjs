/** Birdspot F3-R12 (Huismus, Ringmus, Merel): media, audio-gate and lookalike guard.
 * Not an ornithological, human-listening or real-device certification. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { comparisonPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const registry = read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const media = read('../assets/species/field-guide-media.json');
const review = read('../docs/fotokwaliteit/vluchtcontrole.json').assets;
const orig = read('../docs/media-intake/2026-11-16/origcheck-r12/origcheck.json');
const ac = read('../docs/media-intake/2026-11-16/audiocheck-r12/audiocheck.json');
const byId = new Map(SPECIES.map(s => [s.id, s]));

assert.deepEqual(registry.focusSpecies.slice(9, 12), ['sp043', 'sp044', 'sp045']);
for (const id of ['LK-016', 'LK-017', 'LK-018']) assert.ok(registry.pairs.some(p => p.id === id), id);

// 1. Origcheck: every R12 photo has a result; all but the cropped iNaturalist juvenile pass the correlation rule.
assert.equal(orig.items.length, 14);
assert.deepEqual(orig.items.filter(i => !i.sameShot).map(i => i.image), ['/assets/species/plumage/sp044-juv.webp']);
assert.ok(orig.items.every(i => !i.error));

// 2. Ringmus: aerial fight out of the flight role, new free-flight photo approved, flight pair uses the new photo.
assert.equal(review['/assets/species/plumage/sp044-flight.webp'].decision, 'uit-rol');
assert.equal(review['/assets/species/plumage/sp044-flight-free.webp'].decision, 'goedgekeurd');
const fly = GUIDE_POSES.sp044.filter(p => p.flight).map(p => p.image);
assert.deepEqual(fly, ['/assets/species/plumage/sp044-flight-free.webp']);
const pair = GUIDE_COMPARISONS.find(c => c.label === 'Huismus en Ringmus · in vlucht');
assert.equal(comparisonPhoto(pair.birds.find(b => b.id === 'sp044'), true).image, '/assets/species/plumage/sp044-flight-free.webp');
const html = recognitionPanel(byId.get('sp044'));
assert.ok(html.includes('Twee Ringmussen in een luchtgevecht'), 'retired flight photo keeps a visible, honest label');
assert.match(media.poses.sp044.find(p => p.image.endsWith('sp044-flight-free.webp')).modifications, /^Uitsnede/);

// 3. Audio gate: published clips only with a consistent audiocheck on the same file; failed ones not marked verified.
const judged = Object.fromEntries(ac.judgements.map(j => [j.id, j]));
const hs = media.audio.sp043;
assert.equal(hs.length, 1);
assert.equal(hs[0].label, 'Roep');
assert.ok(judged.sp043_call_cand_1.consistent);
assert.match(hs[0].verification, /^NOT TESTED \(kandidaat\)/);
assert.ok(existsSync(new URL('..' + hs[0].audio, import.meta.url)));
assert.ok(!media.audio.sp044 || media.audio.sp044.length === 0, 'No Ringmus sound without conclusive audiocheck');
const [song, call] = media.audio.sp045;
assert.ok(/^NOT TESTED/.test(song.verification), 'strengthened audiocheck: song only source-labelled');
const r12b = read('../docs/media-intake/2026-11-16/audiocheck-r12b/audiocheck.json');
assert.ok(r12b.judgements.every(j => !j.consistent), 'no published clip passes the validated rule');
assert.ok(!judged.sp045_call_live.consistent && /^NOT TESTED/.test(call.verification), 'Failed audiocheck never shown as verified');

console.log('F3-R12 PASS: 14 photos checked against sources, Ringmus flight role corrected, audio published only after consistent audiocheck');
