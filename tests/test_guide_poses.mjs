/** Contract checks for the optional posture panel; browser behaviour is tested separately. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { recognitionPanel, wherePanel } from '../src/features/species/detailSections.js';

const registry = JSON.parse(readFileSync(new URL('../assets/species/field-guide-media.json', import.meta.url)));
assert.deepEqual(GUIDE_POSES, registry.poses, 'Generated poses must match the source registry');
const species = new Map(SPECIES.map(s => [s.id, s]));
for (const [id, poses] of Object.entries(GUIDE_POSES)) {
  const html = recognitionPanel(species.get(id));
  assert.match(html, /aria-label="Zittend en in vlucht"/);
  assert.ok(poses.length >= 1 && poses.length <= 2);
  for (const pose of poses) {
    assert.ok(existsSync(new URL('..' + pose.image, import.meta.url)), pose.image);
    assert.ok(html.includes(`data-guide-image="${pose.image}"`), 'Pose must use the existing accessible viewer');
    assert.ok(html.includes(pose.licenseUrl), 'License must remain available with the photo');
  }
}
const withoutPoses = SPECIES.find(s => !GUIDE_POSES[s.id]);
assert.ok(!recognitionPanel(withoutPoses).includes('class="sd-poses"'), 'Absent poses must not render an empty section');
for (const id of ['sp008', 'sp009']) {
  const s = species.get(id);
  assert.ok(wherePanel(s).includes(s.photoTip), 'Photography advice must be in the actual rendered Where panel');
  assert.ok(GUIDE_PLUMAGE[id].juv && GUIDE_AUDIO[id].length);
}
assert.ok(recognitionPanel(species.get('sp009')).includes('Man en vrouw lijken op elkaar'), 'A shared adult photo must not silently imply male');
console.log('VERIFIED optional posture rendering, media wiring, shared adult label and photography advice');
