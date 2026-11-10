// Soortaudit (eigenaarseis 10-11-2026) — voegt de visuele beoordeling per foto (docs/fotokwaliteit/soortaudit/*.json)
// samen met wat de app werkelijk toont (tools/fotobaseline/audit.mjs-logica via recognitionPanel), de vluchtcontrole,
// het bronbewijs (bronaudit 09-11, geverifieerde hoofdfoto-import), de kennisprofielen en de browseruitslag.
//
// Pure functie `checkSpecies` zodat tests ook gemuteerde invoer kunnen toetsen. Geen enkele status wordt hier
// verzonnen: ontbreekt bewijs, dan is de uitkomst NOT TESTED of PARTIALLY TESTED.
//
// Gebruik: node tools/fotokwaliteit/soortaudit.mjs <audit.json uit tools/fotobaseline/audit.mjs> [--sha <commit>] [--write]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(new URL('../..', import.meta.url).pathname);
const J = p => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
export const OWN_SECTIONS = new Set(['Hoofdfoto', 'Verenkleed', 'In vlucht', "Overige herkenningsfoto's"]);
export const FLIGHT_OK = new Set(['goedgekeurd', 'voorwaardelijk']);
export const VERDICTS = new Set(['goedgekeurd', 'voorwaardelijk', 'uit-rol', 'review']);

export function loadBatches(dir = resolve(ROOT, 'docs/fotokwaliteit/soortaudit')) {
  const out = {};
  for (const f of readdirSync(dir).filter(f => /^M\d+\.json$/.test(f)).sort()) {
    const b = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
    for (const [id, s] of Object.entries(b.species)) out[id] = { ...s, batch: b._meta.batch, date: b._meta.date };
  }
  return out;
}

/** Fouten voor één gecontroleerde soort: beoordeling ↔ werkelijk getoonde kaart. Leeg = consistent. */
export function checkSpecies(row, entry, flightReview) {
  const errors = [];
  const own = row.rendered.filter(r => OWN_SECTIONS.has(r.section) && r.image);
  const shown = new Set(own.map(r => r.image));
  const judged = new Set(Object.keys(entry.assets || {}));
  for (const img of shown) if (!judged.has(img)) errors.push(`${row.id} ${img}: getoond maar niet visueel beoordeeld`);
  for (const img of judged) if (!shown.has(img)) errors.push(`${row.id} ${img}: beoordeeld maar niet (meer) op de kaart`);
  for (const [img, a] of Object.entries(entry.assets || {})) {
    if (!VERDICTS.has(a.verdict)) errors.push(`${row.id} ${img}: ongeldige uitslag ${a.verdict}`);
    for (const f of ['role', 'content', 'sexAge', 'quality']) if (!String(a[f] || '').trim()) errors.push(`${row.id} ${img}: veld ${f} leeg`);
    const sections = own.filter(r => r.image === img).map(r => r.section);
    if (sections.includes('In vlucht')) {
      const fr = flightReview[img];
      if (!fr || !FLIGHT_OK.has(fr.decision)) errors.push(`${row.id} ${img}: staat in "In vlucht" zonder goedgekeurde vluchtbeoordeling`);
      if (a.verdict === 'uit-rol') errors.push(`${row.id} ${img}: uit-rol beoordeeld maar nog in "In vlucht"`);
    }
    if (/^Hoofdfoto/.test(a.role) && !sections.includes('Hoofdfoto')) errors.push(`${row.id} ${img}: rol Hoofdfoto maar niet als hoofdfoto getoond`);
    if (a.verdict === 'uit-rol' && /In vlucht/.test(a.role.split('(')[0])) errors.push(`${row.id} ${img}: uit-rol maar rol nog "In vlucht"`);
  }
  if (row.orderIssues?.length) errors.push(`${row.id}: volgordeproblemen ${row.orderIssues.join('; ')}`);
  if (row.exactDuplicatesRendered?.length) errors.push(`${row.id}: dubbele opname op de kaart`);
  return errors;
}

function rightsFor(img, evidence, heroes) {
  const e = evidence.get(img);
  if (e?.sameShot) return { status: 'VERIFIED', note: `bronaudit 09-11: zelfde opname (${e.method}), ${e.sourceLicense} · ${e.sourceAuthor}`, annotations: e.annotations || [] };
  const h = heroes.get(img);
  if (h?.sha1) return { status: 'VERIFIED', note: `geverifieerde import 09-11 (SHA-1 ${h.sha1.slice(0, 10)}…), ${h.license} · ${h.author}`, annotations: [] };
  return { status: 'NOT TESTED', note: 'niet in bronaudit of geverifieerde import', annotations: [] };
}

const worst = list => (list.includes('BLOCKED') ? 'BLOCKED' : list.includes('NOT TESTED') ? (list.every(x => x === 'NOT TESTED') ? 'NOT TESTED' : 'PARTIALLY TESTED') : list.includes('PARTIALLY TESTED') ? 'PARTIALLY TESTED' : 'VERIFIED');

export function build(auditJson, { sha = null } = {}) {
  const batches = loadBatches();
  const flight = J('docs/fotokwaliteit/vluchtcontrole.json').assets;
  const evidence = new Map(J('docs/evidence/GUIDE_SOURCE_AUDIT_2026-11-09.json').map(e => [e.image, e]));
  const heroes = new Map(J('tools/species/verified_heroes_2026-11-09.json').map(h => [h.target, h]));
  const know = J('tools/kennisbaseline/knowledge.json');
  const browserPath = resolve(ROOT, 'docs/fotokwaliteit/soortaudit/browser.json');
  const browser = existsSync(browserPath) ? JSON.parse(readFileSync(browserPath, 'utf8')) : { species: {} };
  const rows = auditJson.rows.filter(r => r.media?.length || r.rendered?.some(x => x.image && OWN_SECTIONS.has(x.section)));
  const result = [];
  const allErrors = [];
  for (const row of rows) {
    const entry = batches[row.id];
    const k = know[row.id];
    if (!entry) {
      result.push({ id: row.id, nameNL: row.nameNL, family: row.family, audited: false, verdict: 'NOT TESTED',
        next: 'Aangescherpte soortaudit (foto per foto + kennisprofiel)' });
      continue;
    }
    const errors = checkSpecies(row, entry, flight);
    allErrors.push(...errors);
    const assets = Object.entries(entry.assets).map(([img, a]) => ({ image: img, ...a, rights: rightsFor(img, evidence, heroes), flight: flight[img] || null }));
    const b = browser.species[row.id] || null;
    const st = {
      technical: errors.length ? 'BLOCKED' : (row.media.every(m => m.exists && m.offline) ? 'VERIFIED' : 'PARTIALLY TESTED'),
      visual: (assets.some(a => a.verdict === 'review') || entry.uncertain.some(u => /REVIEW REQUIRED/.test(u))) ? 'PARTIALLY TESTED' : 'VERIFIED',
      rights: worst(assets.map(a => a.rights.status)),
      knowledge: k ? (k.open?.length ? 'PARTIALLY TESTED' : 'VERIFIED') : 'NOT TESTED',
      browser: b ? (b.ok ? 'VERIFIED' : 'BLOCKED') : 'NOT TESTED',
      independent: 'NOT TESTED',
    };
    const photoComplete = !entry.missing.length && !assets.some(a => a.verdict === 'voorwaardelijk');
    const criticalWeak = k ? k.critical.filter(c => c.reliability !== 'doorslaggevend').map(c => c.feature) : [];
    // Eindoordeel van Claude (zonder onafhankelijke review): VERIFIED alleen als alle lagen VERIFIED zijn én
    // de foto-set compleet is; anders PARTIALLY TESTED. De onafhankelijke review staat apart.
    const layers = [st.technical, st.visual, st.rights, st.knowledge, st.browser];
    let verdict = worst(layers);
    if (verdict === 'VERIFIED' && !photoComplete) verdict = 'PARTIALLY TESTED';
    result.push({
      id: row.id, nameNL: row.nameNL, family: row.family, audited: true, batch: entry.batch, date: entry.date, sha,
      assets, corrections: entry.corrections, missing: entry.missing, uncertain: entry.uncertain, sexPolicy: entry.sexPolicy,
      previous: entry.previous || null, status: st, photoComplete,
      knowledge: k ? { profile: true, critical: k.critical.length, decisive: k.critical.length - criticalWeak.length, notDecisive: criticalWeak, open: k.open || [], discrepancies: (k.discrepancies || []).length } : { profile: false },
      browser: b, errors, verdict,
      next: errors.length ? 'Fouten herstellen' : photoComplete ? 'Onafhankelijke review (ChatGPT)' : 'Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen',
    });
  }
  return { result, errors: allErrors };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const [auditPath, ...rest] = process.argv.slice(2);
  const sha = rest.includes('--sha') ? rest[rest.indexOf('--sha') + 1] : null;
  const { result, errors } = build(JSON.parse(readFileSync(auditPath, 'utf8')), { sha });
  if (rest.includes('--write')) {
    writeFileSync(resolve(ROOT, 'docs/fotokwaliteit/soortaudit-status.json'), JSON.stringify({ sha, generated: '2026-11-10', species: result }, null, 1) + '\n');
  }
  const audited = result.filter(r => r.audited);
  console.log(JSON.stringify({ photoSpecies: result.length, audited: audited.length, errors: errors.length,
    verdicts: audited.reduce((m, r) => ({ ...m, [r.verdict]: (m[r.verdict] || 0) + 1 }), {}) }));
  if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
}
