/**
 * Mijn waarnemingen — lijst met zoeken en filters (UX-02, 25-11-2026)
 *
 * - Zoeken op soort (NL/EN/wetenschappelijk), plek, plaatsnaam, datum en periodewoorden
 * - Filters: plek, soort, periode, seizoen, waarneming, media, zekerheid en herkenning
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
import { methodLabel, verificationStatus } from './evidence.js';
import { escHtml }          from '../../utils/html.js';
import { SIGHTING_PERIODS, SEASONS, SEASON_ORDER } from '../../data/seasons.js';
import {
  FILTER_GROUPS, filterSightings, cleanFilters, emptyFilters, activeFilterCount, placeOf, periodFromQuery,
  sightingPlaceChoice, sightingSpeciesKey,
} from './sightingQuery.js';

const VIEW_KEY = 'birdspot-sightings-view';
const SPECIES_BY_ID = new Map(SPECIES.map(sp => [sp.id, sp]));
const CERTAINTY_NL = { certain: 'Zeker', probable: 'Waarschijnlijk', possible: 'Mogelijk' };
const PRIMARY_FILTERS = [
  { key: 'place', label: 'Plek', options: [['', 'Alle plekken']] },
  { key: 'speciesId', label: 'Vogelsoort', options: [['', 'Alle soorten']] },
  { key: 'period', label: 'Periode', options: [['', 'Alles'], ...SIGHTING_PERIODS.slice(1)] },
  { key: 'season', label: 'Seizoen', options: [['', 'Alle seizoenen'], ...SEASON_ORDER.map(key => [key, SEASONS[key].label])] },
];
const emptyView = () => ({ query: '', filters: emptyFilters(), place: '', speciesId: '', period: '', season: '', panelOpen: false });

// ── Weergavestand (alleen deze sessie; geen waarnemingsdata) ──────────
function loadView() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}');
    return {
      query: typeof raw.query === 'string' ? raw.query.slice(0, 120) : '',
      filters: cleanFilters(raw.filters),
      place: typeof raw.place === 'string' ? raw.place : '',
      speciesId: typeof raw.speciesId === 'string' ? raw.speciesId : '',
      period: SIGHTING_PERIODS.some(([key]) => key === raw.period && key !== 'all') ? raw.period : '',
      season: SEASON_ORDER.includes(raw.season) ? raw.season : '',
      panelOpen: raw.panelOpen === true,
    };
  } catch (_) {
    return emptyView();
  }
}
function saveView(view) {
  try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch (_) { /* weergave is niet leidend */ }
}

// ── Entry point ────────────────────────────────────────────
export async function renderSightings(el, { sightingId, speciesId, linkedDetail, rememberTarget, onSearchSelect } = {}) {
  const view = loadView();
  // UX-02C: vanaf een soortkaart opent de lijst met alleen die soort (andere filters leeg, niets verborgen).
  if (typeof speciesId === 'string' && SPECIES_BY_ID.has(speciesId)) {
    Object.assign(view, emptyView(), { speciesId });
    saveView(view);
  }
  const sightings = await getSightings();
  const ctx = { el, view, sightings, rememberTarget, onSearchSelect, generation: 0, timer: 0 };

  el.innerHTML = `
    <div class="page-header">
      <div class="page-header__title">Mijn waarnemingen</div>
      <div class="page-header__sub" id="sightingsCount"></div>
    </div>
    <div class="sightings-tools" id="sightingsTools">
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
      <p class="sightings-result" id="sightingsResult" role="status" aria-live="polite"></p>
      <div class="sightings-filter-panel" id="sightingsFilterPanel" ${view.panelOpen ? '' : 'hidden'}>
        <div class="sightings-primary-filters">
          ${PRIMARY_FILTERS.map(({ key, label, options }) => `
            <div class="sightings-primary-filter">
              <label for="sightingsFilter-${key}">${label}</label>
              <select id="sightingsFilter-${key}" data-primary-filter="${key}">${options.map(([value, text]) =>
                `<option value="${value}">${text}</option>`).join('')}</select>
            </div>`).join('')}
        </div>
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
    </div>
    <div id="sightingsList"></div>`;

  bindTools(ctx);
  await renderList(ctx);
  const selected = sightings.find(sighting => sighting?.id === sightingId);
  if (selected && el.isConnected) await openSighting(ctx, selected, linkedDetail===true);
}

// ── Zoekbalk, filterknop en chips ──────────────────────────
function bindTools(ctx) {
  const { el, view } = ctx;
  const input = el.querySelector('#sightingsSearch');
  const panel = el.querySelector('#sightingsFilterPanel');
  const toggle = el.querySelector('#sightingsFilterBtn');
  const apply = () => {
    saveView(view);
    ctx.rememberTarget?.({ speciesId: view.speciesId || null });
    renderList(ctx, { keepScroll: false });
  };

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
  panel.addEventListener('change', e => {
    const key = e.target.dataset.primaryFilter;
    if (!key) return;
    view[key] = e.target.value;
    apply();
  });
  el.querySelector('#sightingsChips').addEventListener('click', e => {
    const chip = e.target.closest('[data-chip]');
    if (!chip) return;
    const [kind, value] = chip.dataset.chip.split(':');
    if (kind === 'query') { view.query = ''; input.value = ''; }
    else if (kind === 'species') view.speciesId = '';
    else if (value === undefined) view[kind] = '';
    else view.filters[kind] = view.filters[kind].filter(v => v !== value);
    apply();
    el.querySelector('#sightingsSearch')?.focus({ preventScroll: true });
  });
  el.addEventListener('click', e => {
    if (!e.target.closest('#sightingsClearAll')) return;
    Object.assign(view, emptyView(), { panelOpen: view.panelOpen });
    input.value = '';
    apply();
    input.focus({ preventScroll: true });
  });
}

function refreshChoices(select, options, selected, missingLabel) {
  const current = select.selectedOptions[0];
  if (selected && !options.has(selected)) {
    options.set(selected, current?.value === selected ? current.textContent : missingLabel);
  }
  const choices = [...options].sort((a, b) => a[1].localeCompare(b[1], 'nl'));
  select.replaceChildren(select.options[0], ...choices.map(([value, label]) => new Option(label, value)));
}

function renderToolsState(ctx, shown, sightings, placesById) {
  const { el, view } = ctx;
  const total = sightings.length;
  const select = key => el.querySelector(`[data-primary-filter="${key}"]`);
  const places = new Map();
  const species = new Map();
  for (const sighting of sightings) {
    const [placeKey, placeLabel] = sightingPlaceChoice(sighting, placesById);
    const speciesKey = sightingSpeciesKey(sighting);
    places.set(placeKey, placeLabel || 'Naamloze plek');
    if (speciesKey) species.set(speciesKey, SPECIES_BY_ID.get(speciesKey)?.nameNL || sighting.speciesName || 'Onbekende vogelsoort');
  }
  refreshChoices(select('place'), places, view.place, 'Onbekende plek');
  refreshChoices(select('speciesId'), species, view.speciesId, SPECIES_BY_ID.get(view.speciesId)?.nameNL || 'Onbekende vogelsoort');
  for (const { key } of PRIMARY_FILTERS) select(key).value = view[key];

  el.querySelector('#sightingsCount').textContent = countLabel(total);
  const countEl = el.querySelector('#sightingsFilterCount');
  const active = activeFilterCount(view.filters) + PRIMARY_FILTERS.filter(({ key }) => view[key]).length;
  countEl.hidden = !active;
  countEl.textContent = active ? String(active) : '';
  el.querySelector('#sightingsFilterBtn').setAttribute('aria-label', active ? `Filters, ${active} actief` : 'Filters');
  el.querySelectorAll('.sightings-filter-option').forEach(btn => {
    btn.setAttribute('aria-pressed', String(view.filters[btn.dataset.group].includes(btn.dataset.value)));
  });
  const chips = [];
  const query = view.query.trim();
  if (query) {
    const period = periodFromQuery(query);
    chips.push(['query', `“${query}”${period.range ? ` · ${fmtRange(period.range)}` : ''}`]);
  }
  for (const { key, label } of PRIMARY_FILTERS) {
    if (!view[key]) continue;
    const selectedLabel = select(key).selectedOptions[0].textContent;
    chips.push(key === 'speciesId' ? ['species', `Soort: ${selectedLabel}`] : [key, `${label}: ${selectedLabel}`]);
  }
  for (const group of FILTER_GROUPS) {
    for (const value of view.filters[group.key]) {
      chips.push([`${group.key}:${value}`, group.options.find(([v]) => v === value)?.[1] || value]);
    }
  }
  el.querySelector('#sightingsChips').innerHTML = chips.map(([key, label]) =>
    `<button type="button" class="sightings-chip" data-chip="${escHtml(key)}" aria-label="${escHtml(label)} verwijderen">
      <span>${escHtml(label)}</span><span aria-hidden="true">×</span></button>`).join('')
    + (chips.length > 1 && (shown || !total) ? '<button type="button" class="sightings-chip sightings-chip--clear" id="sightingsClearAll">Wis filters</button>' : '');
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
  renderToolsState(ctx, shown.length, all, placesById);

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

function openSighting(ctx, sighting, linkedDetail = false) {
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
    onPlaceRenamed: refresh,
    isActive: () => ctx.el.isConnected,
    linkedDetail,
    onClose: () => ctx.rememberTarget?.({ sightingId: null, linkedDetail: false }),
    onNavigate: target => {
      ctx.rememberTarget?.({ sightingId: sighting.id, linkedDetail });
      ctx.onSearchSelect?.(target);
    },
  });
}

// ── Kaart bouwen ───────────────────────────────────────────
function buildCard(s, placesById) {
  const photos = Array.isArray(s.photoIds) ? s.photoIds.length : 0;
  const audio = Array.isArray(s.audioIds) ? s.audioIds.length : 0;
  const method = s.observationMethod ? methodLabel(s) : null;
  // UX-03B: één statusbron. Kaartje toont een statuslabel alleen als er iets te melden is
  // (suggestie, zelf gecontroleerd of controle onbekend); gewone eigen herkenning blijft rustig.
  const status = verificationStatus(s);
  const showStatus = status.key !== 'self' && status.key !== 'unrecorded';
  const unchecked = status.tone === 'warn';
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
        ${showStatus ? `<span class="sighting-status-pill sighting-merlin-pill${status.key.startsWith('birdnet') || status.key === 'check-unknown' ? ' sighting-birdnet-pill' : ''}${unchecked ? ' is-unchecked' : ''}" data-status="${status.key}">${appIcon('shield')} ${escHtml(status.label)}</span>` : ''}
        ${certainty && !unchecked ? `<span class="sight-certainty sight-certainty--${escHtml(s.certainty)}">${escHtml(certainty)}</span>` : ''}
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
