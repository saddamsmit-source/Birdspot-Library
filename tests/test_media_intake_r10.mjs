/** Birdspot F3-R10-media: the two new Kneu photos are byte-pinned, licence-clean and visible on the card.
 * Structural/legal-metadata guard only; not an ornithological or real-device certification. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_PLUMAGE } from '../src/features/species/guideMedia.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';

const read = f => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const selection = read('tools/media/intake_selection_2026-11-16.json');
const result = read('tools/media/intake_selection_2026-11-16_result.json');
const inventory = read('docs/fotokwaliteit/beeldinventaris.json');
const FREE = /^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)$/;
const card = recognitionPanel(SPECIES.find(s => s.id === 'sp039'));

assert.equal(selection.items.length, 2, 'Smallest media addition: exactly two Kneu photos');
for (const item of selection.items) {
  const { role, asset } = item;
  const entry = GUIDE_PLUMAGE.sp039[role];
  assert.ok(entry, 'Missing registry entry ' + role);
  assert.match(entry.license, FREE, 'Only free licences that allow commercial reuse');
  assert.doesNotMatch(entry.license, /\bN[CD]\b/);
  assert.equal(entry.license, item.license);
  assert.equal(entry.sourceSha1, item.sha1, 'Original Commons SHA-1 pinned');
  assert.ok(entry.source.startsWith('https://commons.wikimedia.org/wiki/File:') && entry.author && entry.licenseUrl);
  assert.equal(entry.image, asset);
  const bytes = readFileSync(new URL('..' + asset, import.meta.url));
  const log = result.find(r => r.asset === asset);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), log.sha256, 'Converted file changed after import');
  assert.ok(!bytes.includes(Buffer.from('EXIF')) && !bytes.includes(Buffer.from('GPSInfo')), 'Metadata must be stripped');
  const sha1 = createHash('sha1').update(bytes).digest('hex');
  assert.equal(inventory.images[asset]?.sha1, sha1, 'Visual assessment registered for current bytes');
  assert.equal(inventory.images[asset].airborne, false);
  assert.ok(card.includes(asset), 'New photo visible on the Kneu card: ' + asset);
}
assert.equal(GUIDE_PLUMAGE.sp039.adult_f.sex, 'female');
assert.equal(GUIDE_PLUMAGE.sp039.juv.age, 'juvenile');
console.log('MEDIA INTAKE R10 PASS: Kneu female + juvenile byte-pinned, free licence, credits, metadata stripped, visible on card');
