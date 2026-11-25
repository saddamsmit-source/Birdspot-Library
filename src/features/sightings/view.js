/**
 * Mijn waarnemingen — lijst met zoeken en filters (UX-02, 25-11-2026)
 *
 * - Zoeken op soort (NL/EN/wetenschappelijk), plek, plaatsnaam, datum en periodewoorden
 * - Filters: waarneming, media, zekerheid, herkenning (binnen een groep OF, tussen groepen EN)
 * - Zoekopdracht, filters en scrollpositie blijven bewaard (sessie) bij bekijken, bewerken en terugkeren
 * - Zoek- en filterlogica staat in sightingQuery.js (gedeeld met de globale zoekfunctie)
 * - Kaartje: soort, datum, plek, methode, zekerheid of suggestiestatus, media; neutraal vogelicoon zonder foto
 */

import { appIcon, observationIcon } from '../../utils/icons.js';
import { getSightings }     from '../../data/sightings.js';
import { SPECIES }          from '../../data/species.js';
import { loadPlaces }       from '../../data/places.js';
import { getPhoto }         from '../../data/db.js';
import { getPhotoUrl, revokePhotoUrl } from '../../utils/photoUrl.js';
import { openDetailSheet }  from './detailSheet.js';
import { methodLabel, sourceBadge, uncheckedSuggestion, legacyBirdnetSuggestion } from './evidence.js';
import { escHtml }          from '../../utils/html.js';
import {
  FILTER_GROUPS, filterSightings, cleanFilters, emptyFilters, activeFilterCount, placeOf, periodFromQuery,
} from './sightingQuery.js';

const VIEW_KEY = 'birdspot-sightings-view';
const SPECIES_BY_ID = new Map(SPECIES.map(sp => [sp.id, sp]));
const CERTAINTY_NL = { certain: 'Zeker', probable: 'Waarschijnlijk', possible: 'Mogelijk' };

// ── Weergavestand (alleen deze sessie; geen waarnemingsdata) ──────────
function loadView() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}');
    return {
      query: typeof raw.query === 'string' ? raw.query.slice(0, 120) : '',
      filters: cleanFilters(raw.filters),
      speciesId: typeof raw.speciesId === 'string' && SPECIES_BY_ID.has(raw.speciesId) ? raw.speciesId : null,
      panelOpen: raw.panelOpen === true,
    };
  } catch (_) {
    return { query: '', filters: emptyFilters(), speciesId: null, panelOpen: false };
  }
}
function saveView(view) {
  try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch (_) { /* weergave is niet leidend */ }
}

// ── Entry point ────────────────────────────────────────────
export async function renderSightings(el, { sightingId, speciesId } = {}) {
  const view = loadView();
  // UX-02C: vanaf een soortkaart opent de lijst met alleen die soort (andere filters leeg, niets verborgen).
  if (typeof speciesId === 'string' && SPECIES_BY_ID.has(speciesId)) {
    Object.assign(view, { query: '', filters: emptyFilters(), speciesId, panelOpen: false });
    saveView(view);
  }
  const sightings = await getSightings();
  const ctx = { el, view, sightings, generation: 0, timer: 0 };

  el.innerHTML = `
    <div class="page-header">
      <div class="page-header__title">Mijn waarnemingen</div>
      <div class="page-header__sub" id="sightingsCount"></div>
    </div>
    <div class="sightings-tools" id="sightingsTools" hidden>
      <form class="sightings-search" role="search" id="sightingsSearchForm">
        <label class="visually-hidden" for="sightingsSearch">Zoek in je waarnemingen</label>
        <svg class="sightings-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
        <input type="search" id="sightingsSearch" placeholder="Soort, plek of datum" autocomplete="off"
          enterkeyhint="search" maxlength="120" value="${escHtml(view.query)}">
      </form>
      <div class="sightings-filterbar">
        <button type="button" class="sightings-filter-btn" id="sightingsFilterBtn"
          aria-expanded="${view.panelOpen}" aria-controls="sightingsFilterPanel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          Filters <span class="sightings-filter-btn__count" id="sightingsFilterCount" hidden></span>
        </button>
        <div class="sightings-chips" id="sightingsChips"></div>
      </div>
      <div class="sightings-filter-panel" id="sightingsFilterPanel" ${view.panelOpen ? '' : 'hidden'}>
        ${FILTER_GROUPS.map(group => `
          <fieldset class="sightings-filter-group">
            <legend>${escHtml(group.label)}</legend>
            <div class="sightings-filter-options">
              ${group.options.map(([value, label]) => `
                <button type="button" class="sightings-filter-option" data-group="${group.key}" data-value="${value}"
                  aria-pressed="false">${escHtml(label)}</button>`).join('')}
            </div>
          </fieldset>`).join('')}
        <p class="sightings-filter-note">‘Zeker’ toont geen ongecontroleerde suggesties van BirdNET of Merlin.</p>
      </div>
      <p class="sightings-result" id="sightingsResult" role="status" aria-live="polite"></p>
    </div>
    <div id="sightingsList"></div>`;

  bindTools(ctx);
  await renderList(ctx);
  const selected = sightings.find(sighting => sighting?.id === sightingId);
  if (selected && el.isConnected) await openSighting(ctx, selected);
}

// ── Zoekbalk, filterknop en chips ──────────────────────────
function bindTools(ctx) {
  const { el, view } = ctx;
  const input = el.querySelector('#sightingsSearch');
  const panel = el.querySelector('#sightingsFilterPanel');
  const toggle = el.querySelector('#sightingsFilterBtn');
  const apply = () => { saveView(view); renderList(ctx, { keepScroll: false }); };

  el.querySelector('#sightingsSearchForm').addEventListener('submit', e => { e.preventDefault(); input.blur(); });
  input.addEventListener('input', () => {
    view.query = input.value;
    clearTimeout(ctx.timer);
    ctx.timer = setTimeout(apply, 120);
  });
  toggle.addEventListener('click', () => {
    view.panelOpen = panel.hidden;
    panel.hidden = !view.panelOpen;
    toggle.setAttribute('aria-expanded', String(view.panelOpen));
    saveView(view);
  });
  panel.addEventListener('click', e => {
    const option = e.target.closest('.sightings-filter-option');
    if (!option) return;
    const list = view.filters[option.dataset.group];
    const at = list.indexOf(option.dataset.value);
    if (at >= 0) list.splice(at, 1);
    else list.push(option.dataset.value);
    apply();
  });
  el.querySelector('#sightingsChips').addEventListener('click', e => {
    const chip = e.target.closest('[data-chip]');
    if (!chip) return;
    const [kind, value] = chip.dataset.chip.split(':');
    if (kind === 'query') { view.query = ''; input.value = ''; }
    else if (kind === 'species') view.speciesId = null;
    else view.filters[kind] = view.filters[kind].filter(v => v !== value);
    apply();
    el.querySelector('#sightingsSearch')?.focus({ preventScroll: true });
  });
  el.addEventListener('click', e => {
    if (!e.target.closest('#sightingsClearAll')) return;
    Object.assign(view, { query: '', filters: emptyFilters(), speciesId: null });
    input.value = '';
    apply();
    input.focus({ preventScroll: true });
  });
}

function renderToolsState(ctx, shown, total) {
  const { el, view } = ctx;
  const tools = el.querySelector('#sightingsTools');
  tools.hidden = total === 0;
  el.querySelector('#sightingsCount').textContent = countLabel(total);
  const active = activeFilterCount(view.filters) + (view.speciesId ? 1 : 0);
  const countEl = el.querySelector('#sightingsFilterCount');
  const filterOnly = activeFilterCount(view.filters);
  countEl.hidden = !filterOnly;
  countEl.textContent = filterOnly ? String(filterOnly) : '';
  el.querySelector('#sightingsFilterBtn').setAttribute('aria-label', filterOnly ? `Filters, ${filterOnly} actief` : 'Filters');
  el.querySelectorAll('.sightings-filter-option').forEach(btn => {
    btn.setAttribute('aria-pressed', String(view.filters[btn.dataset.group].includes(btn.dataset.value)));
  });
  const chips = [];
  const query = view.query.trim();
  if (query) {
    const period = periodFromQuery(query);
    chips.push(['query', `“${query}”${period.range ? ` · ${fmtRange(period.range)}` : ''}`]);
  }
  if (view.speciesId) chips.push(['species', `Soort: ${SPECIES_BY_ID.get(view.speciesId)?.nameNL || 'onbekend'}`]);
  for (const group of FILTER_GROUPS) {
    for (const value of view.filters[group.key]) {
      chips.push([`${group.key}:${value}`, group.options.find(([v]) => v === value)?.[1] || value]);
    }
  }
  el.querySelector('#sightingsChips').innerHTML = chips.map(([key, label]) =>
    `<button type="button" class="sightings-chip" data-chip="${escHtml(key)}" aria-label="${escHtml(label)} verwijderen">
      <span>${escHtml(label)}</span><span aria-hidden="true">×</span></button>`).join('')
    + (chips.length > 1 ? '<button type="button" class="sightings-chip sightings-chip--clear" id="sightingsClearAll">Wis filters</button>' : '');
  el.querySelector('#sightingsResult').textContent = !total ? ''
    : (query || active) ? `${shown} van ${total} ${total === 1 ? 'waarneming' : 'waarnemingen'}`
      : `${total} ${total === 1 ? 'waarneming' : 'waarnemingen'}`;
}

// ── Lijst renderen ─────────────────────────────────────────
async function renderList(ctx, { keepScroll = true } = {}) {
  const { el, view } = ctx;
  const wrap = el.querySelector('#sightingsList');
  if (!wrap) return;
  const main = document.getElementById('main-view');
  const scrollTop = main?.scrollTop || 0;
  const generation = ++ctx.generation;

  const all = (ctx.sightings || []).filter(s => s && typeof s.id === 'string');
  const placesById = new Map(loadPlaces().filter(p => p?.id).map(p => [p.id, p]));
  const shown = filterSightings(all, view, { speciesById: SPECIES_BY_ID, placesById }).sort((a, b) => {
    const d = (b.date || '').localeCompare(a.date || '');
    return d !== 0 ? d : (b.createdAt || '').localeCompare(a.createdAt || '');
  });
  renderToolsState(ctx, shown.length, all.length);

  if (!all.length) {
    wrap.innerHTML = `
      <div class="empty-state sightings-empty" style="margin-top:64px">
        ${appIcon('observations', 'ui-icon sightings-empty__icon')}
        <p>Nog geen waarnemingen.<br>Tik <strong>+</strong> om te beginnen.</p>
      </div>`;
    return;
  }
  if (!shown.length) {
    wrap.innerHTML = `
      <div class="empty-state sightings-noresult" role="status">
        <p class="sightings-noresult__title">Geen waarnemingen gevonden</p>
        <p>Pas je zoekwoord of filters aan.</p>
        <button type="button" class="btn-secondary" id="sightingsClearAll">Wis filters</button>
      </div>`;
    return;
  }

  wrap.innerHTML = `<div class="sight-list" id="sightingCards"></div>`;
  const list = wrap.querySelector('#sightingCards');
  const frag = document.createDocumentFragment();
  for (const s of shown) frag.appendChild(buildCard(s, placesById));
  list.appendChild(frag);
  if (keepScroll && main) main.scrollTo({ top: scrollTop, behavior: 'instant' });   // geen zachte scroll: blijf staan

  loadThumbnails(list, shown, () => generation === ctx.generation);

  const open = async card => {
    const s = shown.find(x => x.id === card.dataset.id);
    if (s) await openSighting(ctx, s);
  };
  list.addEventListener('click', e => {
    const card = e.target.closest('.sight-card');
    if (card) open(card);
  });
  list.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.sight-card');
    if (!card) return;
    e.preventDefault();
    open(card);
  });
}

function openSighting(ctx, sighting) {
  const refresh = async () => {
    if (!ctx.el.isConnected) return;
    ctx.sightings = await getSightings();
    await renderList(ctx, { keepScroll: true });
  };
  return openDetailSheet(sighting, {
    onDeleted: refresh,
    onUpdated: async () => {
      await refresh();
      // Terug op dezelfde plek in de lijst: focus op het bewerkte kaartje (als het nog in de selectie zit).
      ctx.el.querySelector(`.sight-card[data-id="${CSS.escape(sighting.id)}"]`)?.focus({ preventScroll: true });
    },
    isActive: () => ctx.el.isConnected,
  });
}

// ── Kaart bouwen ───────────────────────────────────────────
function buildCard(s, placesById) {
  const photos = Array.isArray(s.photoIds) ? s.photoIds.length : 0;
  const audio = Array.isArray(s.audioIds) ? s.audioIds.length : 0;
  const method = s.observationMethod ? methodLabel(s) : null;
  const suggestion = s.identificationSource === 'merlin' || s.identificationSource === 'birdnet';
  const unchecked = uncheckedSuggestion(s);
  const legacy = !suggestion && legacyBirdnetSuggestion(s);   // oude BirdNET-suggestie, controle niet vastgelegd
  const where = placeOf(s, placesById);
  const certainty = CERTAINTY_NL[s.certainty] || null;
  const name = s.speciesName || SPECIES_BY_ID.get(s.speciesId)?.nameNL || 'Onbekende soort';

  const card = document.createElement('div');
  card.className = 'sight-card';
  card.dataset.id = s.id;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', [name, fmtDate(s.date), where.name].filter(Boolean).join(', '));
  card.innerHTML = `
    <div class="sight-card__thumb" data-thumb="${escHtml(s.id)}">
      <span class="sight-card__placeholder" aria-hidden="true" title="Geen foto">${appIcon('bird')}</span>
    </div>
    <div class="sight-card__body">
      <div class="sight-card__name">${escHtml(name)}${Number(s.count) > 1 ? ` <span class="sight-card__count">×${Number(s.count)}</span>` : ''}</div>
      <div class="sight-card__meta">
        <span class="sight-card__date">${appIcon('calendar')} ${escHtml(fmtDate(s.date))}</span>
        ${where.kind !== 'none' ? `<span class="sight-card__place sight-card__place--${where.kind}">${appIcon('pin')}<span class="sight-card__place-name">${where.kind === 'gps' ? 'Alleen GPS' : escHtml(where.name)}</span></span>` : ''}
      </div>
      <div class="sight-card__tags">
        ${method ? `<span class="sighting-observed-pill ${s.observationMethod === 'heard' ? 'is-heard' : ''}">${observationIcon(s.observationMethod)} ${escHtml(method)}</span>` : ''}
        ${suggestion ? `<span class="sighting-merlin-pill${s.identificationSource === 'birdnet' ? ' sighting-birdnet-pill' : ''}${unchecked ? ' is-unchecked' : ''}">${appIcon('soundwave')} ${escHtml(s.identificationSource === 'birdnet' && !unchecked ? 'BirdNET · zelf gecontroleerd' : sourceBadge(s))}</span>` : ''}
        ${legacy ? `<span class="sighting-merlin-pill sighting-birdnet-pill is-unchecked">${appIcon('soundwave')} BirdNET · controle onbekend</span>` : ''}
        ${certainty && !unchecked && !legacy ? `<span class="sight-certainty sight-certainty--${escHtml(s.certainty)}">${escHtml(certainty)}</span>` : ''}
        ${photos ? `<span class="sight-media" aria-label="${photos} ${photos === 1 ? 'foto of video' : 'foto’s of video’s'}">${appIcon('camera')} ${photos}</span>` : ''}
        ${audio ? `<span class="sight-media" aria-label="${audio} ${audio === 1 ? 'geluidsopname' : 'geluidsopnamen'}">${appIcon('note')} ${audio}</span>` : ''}
      </div>
    </div>`;
  return card;
}

// ── Thumbnails async inladen (alleen de huidige selectie) ──
async function loadThumbnails(listEl, sightings, current) {
  for (const s of sightings) {
    if (!current() || !listEl.isConnected) return;
    if (!s.photoIds?.length) continue;
    try {
      const photo = await getPhoto(s.photoIds[0]);
      if (!photo?.blob || photo.type?.startsWith('video/')) continue;
      const url = getPhotoUrl(photo);
      if (!url) continue;
      const thumbEl = current() && listEl.isConnected
        ? listEl.querySelector(`.sight-card__thumb[data-thumb="${CSS.escape(s.id)}"]`)
        : null;
      if (!thumbEl) { revokePhotoUrl(url); continue; }
      const img = document.createElement('img');
      img.alt = '';
      const release = () => revokePhotoUrl(url);
      img.addEventListener('load', release, { once: true });
      img.addEventListener('error', release, { once: true });
      img.src = url;
      thumbEl.replaceChildren(img);
    } catch (_) {}
  }
}

// ── Helpers ────────────────────────────────────────────────
function countLabel(n) {
  return `${n} ${n === 1 ? 'waarneming' : 'waarnemingen'} opgeslagen`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtRange([from, to]) {
  return from === to ? fmtDate(from) : `${fmtDate(from)} – ${fmtDate(to)}`;
}
