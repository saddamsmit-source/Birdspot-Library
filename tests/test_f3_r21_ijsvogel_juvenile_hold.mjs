/** Birdspot R21 QA: an ambiguous age label may not be published, provenance may not be deleted. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { recognitionPanel, guidePlumageGroups } from '../src/features/species/detailSections.js';

const read = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const media = read('../assets/species/field-guide-media.json');
const historic = read('../docs/fotokwaliteit/soortaudit-status.json');
const f3 = read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const path = '/assets/species/plumage/sp075-juv-review.webp';
const retired = media.retired.sp075?.find(x => x.image === path);
assert.ok(retired, 'the original source and image must be retained');
assert.equal(retired.file, 'Common Kingfisher 2025 08 30 01.jpg');
assert.equal(retired.author, 'Alexis Lours');
assert.equal(retired.license, 'CC BY 4.0');
assert.ok(retired.source.includes('commons.wikimedia.org'));
assert.match(retired.retiredReason, /female.*juvenile|juvenile.*female/i);
assert.equal(retired.retiredFrom, 'poses.sp075.Juveniel');
assert.ok(existsSync(new URL('..' + path, import.meta.url)), 'original local image must survive');

assert.ok(!media.poses.sp075?.some(x => x.image === path), 'live registry must not show ambiguous juvenile');
assert.ok(!GUIDE_POSES.sp075?.some(x => x.image === path), 'generated guide must match registry');
const bird = SPECIES.find(s => s.id === 'sp075');
assert.ok(bird);
assert.ok(!recognitionPanel(bird).includes('sp075-juv-review.webp'), 'real UI render must not expose withdrawn image');
assert.ok(!guidePlumageGroups(bird).some(g => g.photos.some(p => p.image === path)));
const previous = historic.species.find(x => x.id === 'sp075').assets.find(x => x.image === path);
assert.equal(previous.retiredIn, 'F3-R21-QA', 'the audit retains the previous claim and records withdrawal');
const current = f3.records.find(x => x.id === 'sp075');
assert.ok(!current.currentAssets.imageSlots.some(x => x.path === path));
assert.equal(current.F3.fullPass, false, 'no automatic F3 sign-off');
assert.equal(f3.records.length, 140);
assert.deepEqual(f3.records.filter(x => ['sp072','sp075','sp077'].includes(x.id)).map(x=>x.id), ['sp072','sp075','sp077']);
assert.ok(!f3.records.some(x=>x.id==='sp071'||x.id==='sp073'), 'do not extend the locked 140 cohort');
console.log('F3-R21 QA PASS: IJsvogel ambiguous juvenile withheld, original preserved; cohort unchanged.');
