/**
 * Birdspot Library — weergave van kennisprofielen (contract v0.1, proef 10-11-2026).
 * Niveau 1 "Snel herkennen": samenvatting, het belangrijkste kritische kenmerk, 3–5 veldkenmerken met
 * betrouwbaarheid en een waarschuwing. Gelijkende soorten staan op één plek: onder "Lijkt op" (similarExtra).
 * Niveau 2: uitklapbare secties.
 * Pure render-functies; soorten zonder profiel krijgen niets (de bestaande kaart blijft ongewijzigd).
 * Iedere getoonde bewering draagt haar eigen bronvermelding; ontbrekende inhoud staat onder "Nog open".
 */
import { KNOWLEDGE, KNOWLEDGE_SOURCES } from '../../data/speciesKnowledge.js';
import { SPECIES } from '../../data/species.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = new Map(SPECIES.map(s => [s.id, s]));
const REL = {
  'doorslaggevend': ['Doorslaggevend', 'strong'],
  'ondersteunend': ['Helpt', 'support'],
  'onbetrouwbaar-alleen': ['Niet alleen op vertrouwen', 'weak'],
};
const short = key => (KNOWLEDGE_SOURCES[key]?.label || key).split(' — ')[0];

export const knowledgeFor = id => KNOWLEDGE[id] || null;

function srcLine(refs) {
  const list = [...new Set(refs || [])];
  if (!list.length) return '<small class="kb-src">Bestaande Birdspot-inhoud, niet opnieuw gecontroleerd</small>';
  return `<small class="kb-src">Bron: ${list.map(short).map(esc).join(' · ')}</small>`;
}

function relPill(rel) {
  const [label, kind] = REL[rel] || [rel, 'support'];
  return `<span class="kb-rel kb-rel--${kind}">${esc(label)}</span>`;
}

function name(id) {
  return byId.get(id)?.nameNL || id;
}

/**
 * Gelijkende soorten uit het kennisprofiel die nog géén eigen vergelijkingskaart hebben (UX-besluit
 * 10-11-2026: één vergelijkingsplek onder "Lijkt op", geen dubbele kaarten of chips). Soorten die al een
 * vergelijkingskaart of vluchtvergelijking hebben worden hier overgeslagen; die kaart heeft zelf de
 * knop "Open …". Zelfde knopstijl als de bestaande vergelijkingskaarten.
 */
export function similarExtra(s, covered = new Set()) {
  const k = knowledgeFor(s.id);
  const list = (k?.similar || []).filter(x => !covered.has(x.id));
  if (!list.length) return '';
  return `<div class="kb-similar" data-kb-similar>${list.map(x => `<div class="kb-similar__item">
      <div><strong>${esc(name(x.id))}</strong><p>${esc(x.why)}</p>${srcLine(x.sources)}</div>
      <button type="button" class="sd-compare-open" data-compare-species="${esc(x.id)}">Open ${esc(name(x.id))}<span aria-hidden="true"> →</span></button>
    </div>`).join('')}</div>`;
}

function topCritical(k) {
  const list = k.critical || [];
  return list.find(c => c.reliability === 'doorslaggevend' && c.vs?.length) ||
    list.find(c => c.reliability === 'doorslaggevend') || list[0] || null;
}

// Tekst over de vergelijkingssoort. Begint die al met een eigen aanduiding ("Tjiftjaf: …",
// "Jonge Havik: …") dan wordt de soortnaam niet nog eens voorgezet.
const hasLead = text => /^[^.:]{2,40}: /.test(text);
// In de kaart staat de soortnaam al in <dt>; een gelijke voorloop in de tekst valt dan weg.
function dropName(c) {
  const lead = c.vs?.length ? `${name(c.vs[0])}: ` : null;
  return lead && c.other.startsWith(lead) ? c.other.slice(lead.length) : c.other;
}
function otherLine(c) {
  return hasLead(c.other) || !c.vs?.length ? c.other : `${c.vs.map(name).join(', ')}: ${c.other}`;
}

/** Niveau 1 — staat direct onder de maten, vóór de fotosecties. Volgorde: samenvatting →
 * kritisch kenmerk → veldkenmerken → let op (kritisch kenmerk eerst, zodat
 * het op 390 px binnen het eerste scherm van de tab valt). */
export function quickPanel(s) {
  const k = knowledgeFor(s.id);
  if (!k) return '';
  const crit = topCritical(k);
  const marks = (k.keyMarks || []).map(m =>
    `<li class="kb-mark">${relPill(m.reliability)}<span>${esc(m.text)}</span></li>`).join('');
  const critical = crit ? `<div class="kb-critical" data-kb-critical>
      <strong>Kritisch kenmerk · ${esc(crit.feature)}</strong>
      <p>${esc(crit.this)}</p>
      ${crit.vs?.length && crit.other !== '—' ? `<p class="kb-vs">${esc(otherLine(crit))}</p>` : ''}
      ${relPill(crit.reliability)}
    </div>` : '';
  const caution = k.caution ? `<p class="kb-caution"><strong>Let op</strong> ${esc(k.caution.text)}</p>` : '';
  return `<section class="kb-quick" aria-label="Snel herkennen" data-kb="${esc(s.id)}">
    <h3 class="sd-h">Snel herkennen</h3>
    <p class="kb-summary">${esc(k.summary.text)}</p>
    ${critical}
    <ul class="kb-marks">${marks}</ul>
    ${caution}
  </section>`;
}

function acc(id, title, body, count) {
  if (!body) return '';
  return `<details class="kb-acc" data-kb-section="${esc(id)}"><summary><span>${esc(title)}</span>${count ? `<span class="kb-count">${count}</span>` : ''}</summary><div class="kb-acc__body">${body}</div></details>`;
}

function items(list, labels = {}) {
  if (!list?.length) return '';
  return '<ul class="kb-list">' + list.map(it =>
    `<li>${labels[it.kind || it.topic] ? `<b>${esc(labels[it.kind || it.topic])}</b> ` : ''}${esc(it.text)}${srcLine(it.sources)}</li>`).join('') + '</ul>';
}

function criticalCards(k) {
  const list = k.critical || [];
  if (!list.length) return '';
  return list.map(c => `<article class="kb-crit-card">
    <header><strong>${esc(c.feature)}</strong>${relPill(c.reliability)}</header>
    <dl>
      <dt>Waar kijken</dt><dd>${esc(c.where)}</dd>
      <dt>Deze soort</dt><dd>${esc(c.this)}</dd>
      ${c.other !== '—' ? `<dt>${c.vs?.length ? esc(c.vs.map(name).join(', ')) : 'Andere soorten'}</dt><dd>${esc(dropName(c))}</dd>` : ''}
      <dt>Bruikbaar als</dt><dd>${esc(c.conditions)}</dd>
      <dt>Uitzonderingen</dt><dd>${esc(c.exceptions)}</dd>
      <dt>Maakt sterker</dt><dd>${esc(c.supporting)}</dd>
    </dl>
    ${srcLine(c.sources)}
  </article>`).join('');
}

const pick = (list, topics) => (list || []).filter(it => topics.includes(it.topic));

/** Niveau 2, tab Herkenning — onder de vergelijkingen, vóór zang en roep. */
export function recognitionDetails(s) {
  const k = knowledgeFor(s.id);
  if (!k) return '';
  const parts = [
    acc('kritisch', 'Alle kritische kenmerken', criticalCards(k), (k.critical || []).length),
    acc('herkenning', 'Uitgebreide herkenning', items(pick(k.detail, ['bouw', 'kleed', 'gedrag', 'variatie']),
      { bouw: 'Bouw', kleed: 'Kleed', gedrag: 'Gedrag', variatie: 'Variatie' })),
    acc('geslacht-leeftijd', 'Mannetje, vrouwtje en juveniel', items(pick(k.detail, ['geslacht', 'leeftijd']),
      { geslacht: 'Geslacht', leeftijd: 'Leeftijd' })),
    acc('vlucht', 'Vluchtkenmerken', items(pick(k.detail, ['vlucht']))),
  ].join('');
  return `<section class="kb-more" aria-label="Determinatie in detail"><h3 class="sd-h">Determinatie in detail</h3>${parts}</section>`;
}

/** Zang en roep met bron, getoond in de bestaande sectie "Zang en roep" (één kop, geen dubbele tekst):
 * vervangt daar alleen de ongebronde veldgidsregel; de opnames blijven ongewijzigd. */
export function voiceDetails(s) {
  const k = knowledgeFor(s.id);
  if (!k?.voice?.length) return '';
  return `<div class="kb-voice" data-kb-voice>${items(k.voice, { zang: 'Zang', roep: 'Roep', alarm: 'Alarm', vlucht: 'Vluchtroep' })}</div>`;
}

/** Niveau 2, tab Leefwijze — status, leefwijze en de bronverantwoording. */
export function lifeDetails(s) {
  const k = knowledgeFor(s.id);
  if (!k) return '';
  const used = new Set();
  const collect = x => (x?.sources || []).forEach(r => used.add(r));
  [k.summary, k.caution, k.basis?.size, ...(k.keyMarks || []), ...(k.critical || []), ...(k.similar || []),
    ...(k.detail || []), ...(k.voice || []), ...(k.habitat || []), ...(k.status || []), ...(k.life || [])].forEach(collect);
  const sources = [...used].map(key => {
    const src = KNOWLEDGE_SOURCES[key];
    return `<li><a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.label)}</a>
      <small>${esc(src.edition)} · ${esc(src.scope)} · bevestigt: ${esc(src.confirms)} · zekerheid ${esc(src.certainty)}</small></li>`;
  }).join('');
  const disc = (k.discrepancies || []).map(d =>
    `<li><b>${esc(d.field)}</b> Birdspot: ${esc(d.app)} · bron: ${esc(d.source)}${srcLine(d.sources)}</li>`).join('');
  const open = (k.open || []).map(o => `<li>${esc(o)}</li>`).join('');
  const size = k.basis?.size ? `<p class="kb-basis">${esc(k.basis.size.text)}${srcLine(k.basis.size.sources)}</p>` : '';
  const accountability = `${size}<h4 class="kb-sub">Gebruikte bronnen</h4><ol class="kb-sources">${sources}</ol>` +
    (disc ? `<h4 class="kb-sub">Verschillen met bestaande gegevens</h4><ul class="kb-list">${disc}</ul>` : '') +
    (open ? `<h4 class="kb-sub">Nog open</h4><ul class="kb-list kb-list--open">${open}</ul>` : '') +
    '<p class="kb-review">Kennisprofiel v0.1 · proef · broncontrole door Claude op 10-11-2026 · onafhankelijke controle nog open.</p>';
  const parts = [
    acc('status', 'Status en trend', items(k.status, { voorkomen: 'Voorkomen', aantal: 'Aantal', trend: 'Trend', rodelijst: 'Rode Lijst', bescherming: 'Bescherming' })),
    acc('leefwijze', 'Voedsel, broeden en trek', items(k.life, { voedsel: 'Voedsel', broeden: 'Broeden', nest: 'Nest', trek: 'Trek' })),
    acc('bronnen', 'Bronnen en controle', accountability, used.size),
  ].join('');
  return `<section class="kb-more" aria-label="Kennisprofiel"><h3 class="sd-h">Kennisprofiel</h3>${parts}</section>`;
}

/** Niveau 2, tab Waar — leefgebied uit het profiel, indien onderbouwd aanwezig. */
export function whereDetails(s) {
  const k = knowledgeFor(s.id);
  if (!k?.habitat?.length) return '';
  return `<section class="kb-more" aria-label="Leefgebied in detail">${acc('leefgebied', 'Leefgebied in detail',
    items(k.habitat, { voorkeur: 'Voorkeur', nederland: 'In Nederland', jacht: 'Jacht' }))}</section>`;
}
