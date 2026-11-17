/** F3 plumage/flight role rule (F3-R18, 17-11-2026). Pure check, never mutates or promotes a record.
 * Applies only when plumageAndTrueFlight claims VERIFIED for the shown roles:
 *  - a main photo (Hoofdfoto) is required;
 *  - every shown photo must be source-verified (photoOriginalIdentity VERIFIED);
 *  - a missing optional role (true flight, juvenile) needs a documented exemption reason (> 20 chars);
 *  - when all relevant roles are present, no exemption is required;
 *  - an exemption that is present must carry a valid reason.
 * Statuses stay VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED (+ existing 'N/A - documented'); no DEFERRED. */
export function plumageRoleProblems(record) {
  const f3 = record.F3, check = f3.checks.plumageAndTrueFlight || '';
  const ex = f3.exemptions?.plumageAndTrueFlight;
  const problems = [];
  if (ex && !(typeof ex.reason === 'string' && ex.reason.trim().length > 20)) problems.push('exemption without valid reason');
  if (!check.startsWith('VERIFIED')) return problems;
  const roles = record.currentAssets.imageSlots.map(s => s.role || '');
  if (!roles.some(r => r.startsWith('Hoofdfoto'))) problems.push('required main photo missing');
  if (!String(f3.checks.photoOriginalIdentity || '').startsWith('VERIFIED')) problems.push('shown photo not source-verified');
  const hasFlight = roles.some(r => /In vlucht/i.test(r) && !/niet echte vrije vlucht/i.test(r));
  const hasJuv = roles.some(r => /Juveniel/i.test(r));
  if ((!hasFlight || !hasJuv) && !ex) problems.push('missing optional role without documented exemption');
  return problems;
}
