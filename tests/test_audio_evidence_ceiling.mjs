/** F3-R13b: one consistent evidence ceiling for automatic audio checks across protocol, tools, data and UI.
 * An automatic audiocheck never yields VERIFIED; the three published clips stay NOT TESTED; the app never claims confirmation. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
const txt = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const proto = txt('../docs/media-intake/AUDIOCHECK_PROTOCOL.md');
const [current] = proto.split('## Historie');
// 1. Current norm text: no route from automatic check to VERIFIED; history kept and marked as no longer valid.
assert.match(current, /nooit\*\* een soortverificatie/);
assert.ok(!/→\s*`VERIFIED/.test(current), 'current protocol must not map any outcome to VERIFIED');
assert.match(proto, /## Historie — oorspronkelijke tekst v0\.1 \(vervangen, niet meer geldig\)/);
assert.match(proto.split('## Historie')[1], /geldt \*\*niet\*\* meer/);
// 2. Tools: evidence ceiling in code.
const ac = txt('../tools/media/audio_check.py'), ci = txt('../tools/media/commons_intake.py');
assert.ok(!/"evidenceLevel":\s*"VERIFIED/.test(ac) && /PARTIALLY TESTED \(akoestische aanwijzing/.test(ac));
assert.match(ci, /Audiocheck is geen soortverificatie/);
// 3. Data: no audio clip promoted; the three re-audited clips stay NOT TESTED with history.
const media = JSON.parse(txt('../assets/species/field-guide-media.json'));
const all = Object.values(media.audio).flat();
assert.ok(all.every(c => !String(c.verification || '').startsWith('VERIFIED')), 'no clip may be VERIFIED without independent control');
for (const c of [media.audio.sp043[0], ...media.audio.sp045]) {
  assert.match(c.verification, /^NOT TESTED/); assert.ok(c.verificationHistory?.length >= 1, 'history kept');
}
const reg = JSON.parse(txt('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json'));
for (const s of reg.species.filter(x => ['sp043', 'sp045'].includes(x.id))) assert.ok(s.clips.every(c => c.sourceSpecies === 'NOT TESTED'));
// 4. UI: every species with audio shows the uncertainty line and never 'Status: Bevestigd'.
let shown = 0;
for (const sp of SPECIES) {
  if (!(media.audio[sp.id] || []).length) continue;
  const html = recognitionPanel(sp);
  if (!html.includes('sd-audio')) continue;
  shown++;
  assert.match(html, /nog niet onafhankelijk bevestigd/, sp.id + ' must show the uncertainty line');
  assert.ok(!html.includes('Status: Bevestigd'), sp.id + ' must not claim confirmation');
}
assert.ok(shown >= 60, 'audio panels checked: ' + shown);
console.log('AUDIO EVIDENCE CEILING PASS: protocol, tools, data and UI agree; ' + shown + ' species panels show the uncertainty line; no clip VERIFIED');
