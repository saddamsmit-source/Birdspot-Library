/** Five cases for the F3 plumage/flight role rule (QA request 17-11-2026), plus no full-pass promotion. */
import assert from 'node:assert/strict';
import { plumageRoleProblems } from './f3_plumage_rule.mjs';
const base = (roles, checks = {}, exemptions) => ({
  currentAssets: { imageSlots: roles.map(role => ({ role, path: '/x.webp' })) },
  F3: { fullPass: false, independence: 'PARTIAL', checks: { plumageAndTrueFlight: 'VERIFIED (shown roles)', photoOriginalIdentity: 'VERIFIED', ...checks }, ...(exemptions ? { exemptions } : {}) },
});
const REASON = { plumageAndTrueFlight: { reason: 'Kleine zangvogel: geen bruikbare echte vrije-vluchtfoto; positie open.' } };
const cases = [
  ['1 complete verified roles, no exemption', base(['Hoofdfoto (Mannetje)', 'Verenkleed (Vrouwtje)', 'Verenkleed (Juveniel)', 'In vlucht']), true],
  ['2 optional role missing, documented exemption', base(['Hoofdfoto (Volwassen)'], {}, REASON), true],
  ['3 required main photo missing', base(['Verenkleed (Vrouwtje)', 'Verenkleed (Juveniel)', 'In vlucht']), false],
  ['4 exemption used without valid reason', base(['Hoofdfoto (Volwassen)'], {}, { plumageAndTrueFlight: { reason: 'te kort' } }), false],
  ['5 shown photo not source-verified', base(['Hoofdfoto', 'Verenkleed (Juveniel)', 'In vlucht'], { photoOriginalIdentity: 'PARTIALLY TESTED' }), false],
];
for (const [name, rec, ok] of cases) {
  const before = JSON.stringify(rec);
  const problems = plumageRoleProblems(rec);
  assert.equal(problems.length === 0, ok, name + ': ' + problems.join('; '));
  assert.equal(JSON.stringify(rec), before, name + ': rule must not mutate the record');
  assert.equal(rec.F3.fullPass, false, name + ': rule never promotes fullPass');
}
// A fluttering photo outside the flight role does not count as a flight photo.
assert.ok(plumageRoleProblems(base(['Hoofdfoto', 'Verenkleed (Juveniel)', "Overige herkenningsfoto's (fladderend bij blad; niet echte vrije vlucht)"])).length === 1);
// The rule is silent when the check is not VERIFIED (no false obligation).
assert.deepEqual(plumageRoleProblems(base(['Hoofdfoto'], { plumageAndTrueFlight: 'PARTIALLY TESTED (flight missing)' })), []);
console.log('F3 PLUMAGE RULE PASS: 2 positive, 3 negative, flutter-not-flight, silent when not VERIFIED, never mutates or promotes fullPass');
