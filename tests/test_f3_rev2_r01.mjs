/** F3-REV2: second verification round.
 *
 * Bewaakt (Kwaliteitsnorm v1.10 §2.3, eigenaarbesluiten 23-11-2026):
 * - de eerste F3-ronde blijft byte-gelijk (digest over alle records[].F3 zonder secondReview);
 * - de tweede-rondeteller staat los van `counts` en klopt met de records;
 * - geen status zonder bewijs. Toekomstig echt bewijs wordt NIET automatisch afgekeurd:
 *   ANWB mag VERIFIED zijn met boek, auteurs, editie, ISBN, pagina en leesdatum; geluid mag aanwezig zijn met
 *   bestand, bron, maker, licentie en een menselijke luistercontrole; FULL PASS mag alleen als iedere
 *   bewijslaag VERIFIED is, de review onafhankelijk is, er geen open materiële tekortkoming is en de eigenaar
 *   een besluit heeft vastgelegd. Een eigenaarbesluit (ook C) maakt nooit zelf iets VERIFIED.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const j = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const STATUS = /^(?:NOT TESTED|BLOCKED|PARTIALLY TESTED|VERIFIED|NOT VERIFIED|OPEN|N\/A)\b/;
const OPEN_LIKE = /^(?:NOT TESTED|BLOCKED|OPEN)\b/;
const blob = path => {
  const b = readFileSync(new URL('..' + path, import.meta.url));
  return createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
};
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
  : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
  : JSON.stringify(v);
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isbn13 = s => {
  const d = String(s || '').replace(/[-\s]/g, '');
  if (!/^97[89]\d{10}$/.test(d)) return false;
  const sum = [...d.slice(0, 12)].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(d[12]);
};

// ── Eerste ronde onaangetast ───────────────────────────────────────────────
const sr = j.secondReview;
assert.ok(sr, 'secondReview block missing');
const firstRound = j.records.map(r => { const { secondReview, ...rest } = r.F3; return [r.id, rest]; });
const digest = createHash('sha256').update(canon(firstRound)).digest('hex');
assert.equal(digest, sr.firstRoundDigest, 'Eerste F3-ronde gewijzigd: alleen met expliciet eigenaarbesluit en bijgewerkte digest');
assert.equal(j.records.length, 140);
assert.ok(j.records.every(r => r.F3.reviewedThisRound === true && /^F3-R\d{2}/.test(r.F3.recheckBatch)), 'first-round labels kept');
for (const k of ['reexamined', 'ownerDecisions', 'secondReviewClosed', 'ownerGateOpen']) assert.ok(!(k in j.counts), 'second-round tally mixed into first-round counts: ' + k);

// ── Batches, volgorde, teller ──────────────────────────────────────────────
const reviewed = j.records.filter(r => r.F3.secondReview);
const batchIds = sr.batches.flatMap(b => b.species);
assert.deepEqual(reviewed.map(r => r.id), batchIds, 'every second-review record belongs to exactly one registered batch, in order');
assert.deepEqual(batchIds, j.records.slice(0, batchIds.length).map(r => r.id), 'second round follows the existing record order');
for (const b of sr.batches) {
  assert.ok(b.species.length >= 1 && b.species.length <= sr.batchSizeLimit, b.round + ' exceeds batch limit');
  assert.match(b.round, /^F3-REV2-R\d{2}$/);
}
assert.equal(sr.batches[0].round, 'F3-REV2-R01');
assert.deepEqual(sr.batches[0].species, ['sp002', 'sp003', 'sp004']);
const c = sr.counts;
assert.equal(c.total, 140);
assert.equal(c.reexamined, reviewed.length);
assert.equal(c.fullF3Pass, reviewed.filter(r => r.F3.secondReview.fullPass).length);
assert.equal(c.ownerDecisions, reviewed.filter(r => r.F3.secondReview.ownerDecision.decision).length);
assert.equal(c.ownerGateOpen, reviewed.filter(r => r.F3.secondReview.ownerDecision.status === 'OPEN').length);
assert.equal(c.secondReviewClosed, reviewed.filter(r => r.F3.secondReview.closed === true).length);

// ── Per soort: alleen bewezen statussen ────────────────────────────────────
const statusOf = v => typeof v === 'string' ? v : v?.status;
function anwbOk(a) {
  const s = statusOf(a);
  assert.match(s, STATUS);
  if (typeof a === 'string') return assert.ok(OPEN_LIKE.test(a), 'ANWB als tekst mag alleen NOT TESTED/BLOCKED/OPEN zijn');
  if (/^(VERIFIED|PARTIALLY TESTED)/.test(s)) {
    assert.ok(a.title && a.authors && a.edition && isbn13(a.isbn) && a.pages && isDate(a.readDate) && a.findings,
      'ANWB-lezing vereist titel, auteurs, editie, geldig ISBN, pagina, leesdatum en bevindingen');
  }
}
function audioOk(a, existing) {
  const s = statusOf(a);
  assert.match(s, STATUS);
  if (!existing) return assert.ok(OPEN_LIKE.test(s), 'zonder lokaal geluid blijft audio open');
  assert.ok(typeof a === 'object' && Array.isArray(a.files) && a.files.length === existing, 'elk lokaal geluid apart beoordeeld');
  for (const f of a.files) {
    assert.ok(f.path && f.source?.startsWith('https://') && f.author && f.license, 'geluid zonder bron/maker/licentie');
    if (/^VERIFIED/.test(f.status)) assert.ok(f.listenedBy && f.listenedBy.human === true, 'automatische audiocontrole is nooit VERIFIED (eigenaar 16-11-2026)');
  }
}
function fullPassOk(s) {
  const all = [...s.photos.flatMap(p => [p.identity, p.quality, p.roleCheck, p.rightsREV2]),
    statusOf(s.sources.vogelbescherming), statusOf(s.sources.anwb), statusOf(s.audio),
    ...Object.values(s.text).filter(v => typeof v === 'string' && STATUS.test(v)),
    ...s.lookalikes.flatMap(l => [l.bothDirections, l.photoEquivalence, l.diagnosticText]).filter(v => !/^N\/A/.test(v))];
  assert.ok(all.every(v => /^VERIFIED/.test(v)), 'FULL PASS vereist dat iedere bewijslaag VERIFIED is');
  assert.ok(/^VERIFIED/.test(s.sources.independence) && s.independentReview?.reviewer && s.independentReview.reviewer !== s.reviewer && s.independentReview.sha,
    'FULL PASS vereist een vastgelegde onafhankelijke review op een SHA');
  assert.equal(s.materialGaps.length, 0, 'FULL PASS met open materiële tekortkoming');
  assert.ok(s.ownerDecision.decision && s.ownerDecision.status !== 'OPEN', 'FULL PASS vereist een vastgelegd eigenaarbesluit');
}

for (const r of reviewed) {
  const s = r.F3.secondReview;
  assert.match(s.round, /^F3-REV2-R\d{2}/);
  assert.ok(isDate(s.date) && /^[0-9a-f]{40}$/.test(s.base));
  // Foto's: dezelfde slots en bytes als beoordeeld; elk oordeel heeft een toegestane status.
  assert.deepEqual(s.photos.map(p => p.path), r.currentAssets.imageSlots.map(x => x.path), r.id + ' photo slot drift: herbeoordeel na fotowijziging');
  for (const p of s.photos) {
    assert.equal(p.blobSha, blob(p.path), r.id + ' ' + p.path + ' changed after second review');
    for (const k of ['identity', 'quality', 'roleCheck', 'rightsREV2']) assert.match(p[k], STATUS, r.id + ' ' + k);
    assert.ok(p.author && p.license && p.source.startsWith('https://'), r.id + ' credit data incomplete');
    if (/^VERIFIED/.test(p.rightsREV2)) assert.ok(/^[0-9a-f]{40}$/.test(p.sourceSha1 || '') && p.rightsEvidence, r.id + ' rights VERIFIED zonder origineel-SHA-1 en bewijsbestand');
  }
  assert.match(statusOf(s.sources.vogelbescherming), STATUS);
  anwbOk(s.sources.anwb);
  audioOk(s.audio, r.currentAssets.existingAudioCount);
  assert.match(s.sources.independence, /^(NOT VERIFIED|VERIFIED)/);
  for (const l of s.lookalikes) for (const k of ['bothDirections', 'photoEquivalence', 'diagnosticText']) assert.match(l[k], STATUS, r.id + ' ' + l.pair);
  // Eigenaarbesluit: open = leeg; vastgelegd = geldige keuze met datum en verwijzing.
  const d = s.ownerDecision;
  if (d.status === 'OPEN') assert.equal(d.decision, null, 'no pre-filled owner decision');
  else {
    assert.match(d.decision, /^[ABC]\b/);
    assert.ok(isDate(d.date) && d.reference && Array.isArray(d.remainingOpen), r.id + ' besluit zonder datum/verwijzing/resterende punten');
  }
  if (s.fullPass) fullPassOk(s);
}
// Eigenaarbesluit C (23-11-2026 16:56): quickPrimary alleen bij soorten uit een daadwerkelijk gecontroleerde F3-REV2-batch.
const knowledge = JSON.parse(readFileSync(new URL('../tools/kennisbaseline/knowledge.json', import.meta.url), 'utf8'));
const withQuick = Object.keys(knowledge).filter(id => !id.startsWith('_') && knowledge[id].quickPrimary);
assert.ok(withQuick.every(id => batchIds.includes(id)), 'quickPrimary buiten een gecontroleerde batch: ' + withQuick.filter(id => !batchIds.includes(id)).join(', '));
for (const id of withQuick) assert.match(j.records.find(r => r.id === id).F3.secondReview.quickPrimary || 'VERIFIED (R01b)', /^VERIFIED/);
console.log('F3-REV2: ' + reviewed.length + ' records re-examined; first round digest intact; no status without evidence');
