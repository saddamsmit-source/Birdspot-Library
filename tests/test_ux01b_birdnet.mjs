/**
 * UX-01B regressietest (25-11-2026): een gekozen BirdNET-suggestie is een suggestie, geen bevestiging.
 * Faalt op b0acce0 (geen bron 'birdnet': normalizeEvidence gaf null), slaagt vanaf UX-01B.
 */
import assert from 'node:assert/strict';
import {
  normalizeEvidence, sourceLabel, sourceBadge, uncheckedSuggestion, legacyBirdnetSuggestion,
  IDENTIFICATION_SOURCES, SELF_CHECK_NOTE,
} from '../src/features/sightings/evidence.js';
import { countsForList } from '../src/features/profile/stats.js';
import { sightingsToCsv } from '../src/features/profile/exportCsv.js';

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };

// 1. Bron en controle zijn aparte velden; standaard = suggestie.
const suggested = normalizeEvidence({ observationMethod: 'heard', identificationSource: 'birdnet' });
ok(IDENTIFICATION_SOURCES.birdnet === 'BirdNET', 'bron birdnet bestaat');
assert.deepEqual(suggested, { observationMethod: 'heard', identificationSource: 'birdnet', merlinVerification: null, birdnetVerification: 'suggested' }); n++;
const checked = normalizeEvidence({ observationMethod: 'both', identificationSource: 'birdnet', birdnetVerification: 'checked' });
ok(checked.birdnetVerification === 'checked' && checked.merlinVerification === null, 'zelf gecontroleerd');
// Alleen 'checked' telt als eigen controle; elke andere waarde blijft suggestie.
for (const v of [undefined, null, '', 'verified', true, 'CHECKED']) {
  ok(normalizeEvidence({ observationMethod: 'heard', identificationSource: 'birdnet', birdnetVerification: v }).birdnetVerification === 'suggested', `onbekende controlewaarde ${String(v)}`);
}
// Altijd een sleutel teruggeven, zodat updateSighting (samenvoegen) een oude controle wist.
ok(normalizeEvidence({ observationMethod: 'seen', identificationSource: 'self' }).birdnetVerification === null, 'self wist birdnetVerification');
ok(normalizeEvidence({ observationMethod: 'heard', identificationSource: 'merlin' }).birdnetVerification === null, 'merlin wist birdnetVerification');
assert.throws(() => normalizeEvidence({ observationMethod: 'seen', identificationSource: 'birdnet' }), /gehoorde/); n++;

// 2. Labels: nooit 'bevestigd' of een vinkje dat BirdNET/Merlin de soort bevestigde.
const rec = (o) => ({ speciesId: 'sp045', certainty: 'possible', observationMethod: 'heard', ...o });
const labels = {
  birdnetSuggested: sourceBadge(rec({ identificationSource: 'birdnet', birdnetVerification: 'suggested' })),
  birdnetChecked: sourceBadge(rec({ identificationSource: 'birdnet', birdnetVerification: 'checked' })),
  merlinSuggested: sourceBadge(rec({ identificationSource: 'merlin', merlinVerification: 'suggested' })),
  merlinChecked: sourceBadge(rec({ identificationSource: 'merlin', merlinVerification: 'checked' })),
  self: sourceBadge(rec({ identificationSource: 'self' })),
};
assert.deepEqual(labels, {
  birdnetSuggested: 'BirdNET · suggestie', birdnetChecked: 'Zelf gecontroleerd',
  merlinSuggested: 'Merlin · suggestie', merlinChecked: 'Merlin · zelf gecontroleerd', self: 'Eigen herkenning',
}); n++;
ok(sourceBadge({}) === null, 'geen bron = geen label');
for (const text of [...Object.values(labels), sourceLabel(rec({ identificationSource: 'birdnet', birdnetVerification: 'checked' })), SELF_CHECK_NOTE]) {
  ok(!/bevestigd|✓|✔/i.test(text), `geen bevestigingsclaim in "${text}"`);
}
ok(/geen onafhankelijke wetenschappelijke verificatie/.test(SELF_CHECK_NOTE), 'eigen controle ≠ wetenschappelijke verificatie');
ok(sourceLabel(rec({ identificationSource: 'merlin' })) === 'Merlin Sound ID · suggestie', 'bestaand Merlin-label ongewijzigd');

// 3. Telregel: alleen eigen controle telt; tegenstrijdig 'zeker' + niet gecontroleerd telt niet.
ok(!countsForList(rec({ identificationSource: 'birdnet', birdnetVerification: 'suggested' })), 'suggestie telt niet');
ok(!countsForList(rec({ identificationSource: 'birdnet', birdnetVerification: 'suggested', certainty: 'certain' })), 'tegenstrijdig: zeker + suggestie telt niet');
ok(countsForList(rec({ identificationSource: 'birdnet', birdnetVerification: 'checked', certainty: 'certain' })), 'zelf gecontroleerd + zeker telt');
ok(!countsForList(rec({ identificationSource: 'birdnet', birdnetVerification: 'checked', certainty: 'possible' })), 'gecontroleerd maar mogelijk telt niet');
ok(uncheckedSuggestion(rec({ identificationSource: 'birdnet' })) && !uncheckedSuggestion(rec({ identificationSource: 'self' })), 'uncheckedSuggestion');

// 4. Oude records: bron 'self' met BirdNET-suggestie wordt herkend, niet omgezet; telregel ongewijzigd.
const legacy = { id: 'old', speciesId: 'sp045', certainty: 'certain', observationMethod: 'heard', identificationSource: 'self',
  merlinVerification: null, soundSuggestion: { model: 'BirdNET+ V3.0', score: 0.8, second: 3 } };
const legacyCopy = structuredClone(legacy);
ok(legacyBirdnetSuggestion(legacy) && countsForList(legacy), 'oud record: herkend en telt zoals voorheen');
assert.deepEqual(legacy, legacyCopy); n++;
ok(!legacyBirdnetSuggestion({ identificationSource: 'birdnet', soundSuggestion: {} }), 'nieuw record is geen legacy');

// 5. CSV: bron en controle zichtbaar in de methodekolom.
const csv = sightingsToCsv([
  { ...rec({ identificationSource: 'birdnet', birdnetVerification: 'suggested' }), id: 'a', date: '2026-11-25', speciesName: 'Merel' },
  { ...rec({ identificationSource: 'birdnet', birdnetVerification: 'checked', certainty: 'certain' }), id: 'b', date: '2026-11-25', speciesName: 'Merel' },
]);
ok(csv.includes('(BirdNET, suggestie)') && csv.includes('(BirdNET, zelf gecontroleerd)'), 'CSV-methodekolom');

console.log(`UX-01B units: ${n} PASS`);
