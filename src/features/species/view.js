/**
 * Soortenoverzicht — Stap 3 (UI-redesign)
 * Zoek + filter op categorie + gebied, waarnemingsstatus, soortdetail
 * Nieuw: foto-thumbnails, zeldzaamheid-badges, "Recent bekeken" scroll
 */

import { SPECIES, CATEGORY_LABELS, REGIONS, searchSpecies, activeCategories, CATEGORY_BADGES, matchesSpeciesStatus } from '../../data/species.js';
import { tabBar, recognitionPanel, voicePanel, voiceText, statusPanel, wherePanel, wherePlaces, minePanel, sightingStats } from './detailSections.js';
import { SEASONS, SEASON_ORDER, toggleSeason, seasonPeriod, presentIn, periodMonthsText, isYearRound } from '../../data/seasons.js';
import { getDB, getPhotosBySpecies, getPhoto } from '../../data/db.js';
import { getSightings, getSightingsSnapshot }                 from '../../data/sightings.js';
import { loadPlaces }                   from '../../data/places.js';
import { getPhotoUrl, revokePhotoUrl }  from '../../utils/photoUrl.js';
import { getCollectionIds, toggleCollectionItem } from '../../storage/collections.js';

import { GUIDE_PHOTOS } from './guidePhotos.js';
import { closePhotoInfo, photoInfoMarkup } from '../../utils/photoInfo.js';
import { openPhotoViewer } from '../../utils/photoViewer.js';

import { BREEDING_BEHAVIORS, methodLabel, sourceLabel } from '../sightings/evidence.js';
function guideSightings() { return getSightingsSnapshot().filter(s=>s && typeof s === 'object' && typeof s.speciesId === 'string'); }
function getObservedIds() { return new Set(guideSightings().map(s=>s.speciesId)); }

const ALL = 'alle';
let _currentCategory = ALL;
let _seasons = [];
let _hideYearRound = false;  // optie bij seizoensfilter: (bijna) jaarrondvogels verbergen            // max. twee aangrenzende seizoenen (zie data/seasons.js)
const FILTER_CATEGORIES = [[ALL, 'Alle'], ...activeCategories().map(key => [key, CATEGORY_LABELS[key]])];
let _searchQuery     = '';
let _currentRegion   = null;
let _detailSpeciesId = null;
let _onlyFavorites = false;
let _speciesCtx = null;

function resetGuideFilters() {
  _searchQuery = '';
  _currentCategory = ALL;
  _currentRegion = null;
  _seasons = [];
  _hideYearRound = false;
  _onlyFavorites = false;
  _listLimit = LIST_PAGE;
  _listKey = '';
}

function restoreGuideDefaults(el, ctx) {
  const changed = _searchQuery || _currentCategory !== ALL || _currentRegion || _seasons.length ||
    _hideYearRound || _onlyFavorites || _listLimit !== LIST_PAGE;
  if (!changed) return false;
  resetGuideFilters();
  el.querySelector('#speciesSearch').value = '';
  el.querySelectorAll('.species-filter').forEach(menu => {
    menu.open = false;
    menu.querySelector('summary strong').textContent = filterLabel(menu.querySelector('.species-filters').id);
  });
  el.querySelectorAll('.species-filter .filter-chip').forEach(chip => {
    const selected = chip.dataset.cat === ALL;
    chip.classList.toggle('active', selected);
    chip.setAttribute('aria-pressed', String(selected));
  });
  el.querySelector('#seasonHideYearRound').hidden = true;
  const favorites = el.querySelector('#speciesOnlyFavorites');
  if (favorites) {
    favorites.classList.remove('is-selected');
    favorites.setAttribute('aria-pressed', 'false');
  }
  renderList(el, undefined, ctx);
  el.closest('#main-view')?.scrollTo({ top: 0, behavior: 'instant' });
  return true;
}

function filterLabel(id) {
  if (id === 'speciesFilters') return CATEGORY_LABELS[_currentCategory] || 'Alle vogels';
  if (id === 'gebiedFilters') return REGIONS[_currentRegion]?.label || 'Alle gebieden';
  return seasonPeriod(_seasons)?.label || 'Alle seizoenen';
}

function filterMenu(id, label, options, variant = '') {
  return `
    <details class="species-filter">
      <summary id="${id}Toggle" class="species-filter__toggle">
        <span>${label}</span>
        <strong>${escHtml(filterLabel(id))}</strong>
      </summary>
      <div class="species-filters ${variant}" id="${id}" role="group" aria-label="${label}">
        ${options}
      </div>
    </details>`;
}

// ── Zeldzaamheid mapping (id-prefix → rarity) ─────────────────
// Zonder dedicated veld in data: categoriseer op basis van species-id ranges
// Dit is een tijdelijke heuristiek totdat rarity aan species.js wordt toegevoegd
const RARITY_MAP = {
  algemeen:      { cls: 'rarity--algemeen',     label: 'Algemeen'     },
  'vrij-algemeen':{ cls: 'rarity--vrij-algemeen',label: 'Vrij algemeen'},
  zeldzaam:      { cls: 'rarity--zeldzaam',     label: 'Zeldzaam'     },
  schaars:       { cls: 'rarity--schaars',      label: 'Schaars'      },
  toevallig:     { cls: 'rarity--toevallig',    label: 'Toevallig'    },
};

// Standvogels zijn doorgaans algemeen; trek/winter schaarsder; dwaalgasten toevallig
function getRarity(species) {
  // Migratory category is not scientific evidence of rarity.
  // When there is no explicit rarity field, show the real category instead.
  return species.rarity && RARITY_MAP[species.rarity] ? species.rarity : null;
}

// ── IndexedDB helper ───────────────────────────────────────────
function txGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// Laad de eerste foto-blob voor een soort-id uit waarnemingen.
// Geeft een objectURL string terug (of null). De AANROEPER is verantwoordelijk
// voor het intrekken van de URL via revokePhotoUrl() na gebruik.
async function loadSpeciesThumb(speciesId) {
  if (GUIDE_PHOTOS[speciesId]) return GUIDE_PHOTOS[speciesId].image;
  try {
    // The species IDB index covers recent records.
    const sightings = guideSightings().filter(s => s.speciesId === speciesId);
    const recordIds = new Set(sightings.map(s => s.id));
    const linkedIds = new Set(sightings.flatMap(s => s.photoIds || []));
    const photos = (await getPhotosBySpecies(speciesId)).filter(p => recordIds.has(p.sightingId) || linkedIds.has(p.id));
    let photo = photos.find(p => p?.blob instanceof Blob && (p.blob.type || p.type || '').startsWith('image/'));
    if (photo) return getPhotoUrl(photo);
    // Legacy records may have only photoIds on sightings, without by_species.
    for (const sighting of sightings) {
      if (sighting.speciesId !== speciesId) continue;
      for (const id of (sighting.photoIds || [])) {
        photo = await getPhoto(id);
        if (photo?.blob instanceof Blob && (photo.blob.type || photo.type || '').startsWith('image/')) return getPhotoUrl(photo);
      }
    }
  } catch (_) {}
  return null;
}
/** Bind listeners before src to avoid the load-event race. */
function mountSpeciesThumb(container, url, ctx) {
  if (!url) return;
  if (!container?.isConnected || ctx?.destroyed) { revokePhotoUrl(url); return; }
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  if (url.startsWith('/assets/')) {
    container.classList.add('species-guide-thumb');
    img.classList.add('species-guide-photo');
  }
  ctx?.urls?.add(url);
  const release = () => { revokePhotoUrl(url); ctx?.urls?.delete(url); };
  img.addEventListener('load',release,{once:true});
  img.addEventListener('error',()=>{ release(); img.remove(); container.textContent='Foto niet beschikbaar'; },{once:true});
  img.src = url;
  container.replaceChildren(img);
}

// ── "Recent bekeken" — soorten met recente waarneming ─────────
function getRecentSpeciesIds(limit = 8) {
  try {
    const payload = JSON.parse(localStorage.getItem('birdspot-sightings') || '{"sightings":[]}');
    const sightings = Array.isArray(payload) ? payload : (Array.isArray(payload?.sightings) ? payload.sightings : []);
    const seen = new Map();
    // sorteer nieuwste eerst
    [...sightings]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .forEach(s => {
        if (s.speciesId && !seen.has(s.speciesId)) seen.set(s.speciesId, s);
      });
    return [...seen.keys()].slice(0, limit);
  } catch {
    return [];
  }
}

// ── Render entrypoint ──────────────────────────────────────────
export function renderSpecies(el, { speciesId } = {}) {
  if (_speciesCtx?.cleanup) _speciesCtx.cleanup();
  const ctx = { destroyed:false, urls:new Set(), detailCleanup:null, listGeneration:0, cleanup:null, filterEvents:new AbortController() };
  _speciesCtx = ctx;
  const seenIds = getObservedIds();

  const recentIds = getRecentSpeciesIds();

  el.innerHTML = `
    <header class="species-header signature-species-hero" aria-label="Soortenbibliotheek">
      <h1 tabindex="-1">Soortengids</h1>
      <p id="speciesSub">${counterText(seenIds)}</p>
    </header>

    <div class="species-toolbar">
      <div class="species-search-wrap">
        <svg class="species-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="speciesSearch" class="species-search" type="search"
          placeholder="Zoek soort, familie, gebied…" aria-label="Zoek soort, familie of gebied" autocomplete="off"
          value="${escHtml(_searchQuery)}">
      </div>
      <div class="species-filter-menus">
        ${filterMenu('speciesFilters', 'Status', FILTER_CATEGORIES.map(([key, lbl]) => `
          <button type="button" class="filter-chip${_currentCategory === key ? ' active' : ''}"
            data-cat="${key}" aria-pressed="${_currentCategory === key}">
            ${lbl}
          </button>`).join(''))}
        ${filterMenu('gebiedFilters', 'Gebied', Object.entries(REGIONS).map(([key, r]) => `
          <button type="button" class="filter-chip filter-chip--gebied${_currentRegion === key ? ' active' : ''}"
            data-region="${key}" aria-pressed="${_currentRegion === key}">
            ${r.label}
          </button>`).join(''), 'species-filters--gebied')}
        ${filterMenu('seizoenFilters', 'Seizoen', `
          ${SEASON_ORDER.map(key => `
            <button type="button" class="filter-chip filter-chip--seizoen${_seasons.includes(key) ? ' active' : ''}"
              data-season="${key}" aria-pressed="${_seasons.includes(key)}">
              ${SEASONS[key].label}
            </button>`).join('')}
          <button type="button" class="filter-chip filter-chip--seizoen filter-chip--jaarrond${_hideYearRound ? ' active' : ''}"
            id="seasonHideYearRound" aria-pressed="${_hideYearRound}" ${_seasons.length ? '' : 'hidden'}>
            Zonder jaarrondvogels
          </button>
        `, 'species-filters--seizoen')}
      </div>
      <p class="species-season-hint" id="seasonHint" aria-live="polite"></p>
    </div>

    <section class="species-saved" aria-label="Bewaarde vogels">
      <div class="signature-species-favorites-filter">
        <button id="speciesOnlyFavorites" type="button" aria-pressed="${_onlyFavorites}" class="${_onlyFavorites ? "is-selected" : ""}">★ Alleen mijn favorieten</button>
      </div>
      <div class="signature-species-hero-actions">
        <button id="speciesOpenMedia" type="button">Mijn fotocollectie <span aria-hidden="true">↗</span></button>
        <span id="speciesFavoriteCount">★ ${getCollectionIds("species").size} favorieten</span>
      </div>
    </section>

    ${recentIds.length > 0 ? `
    <div class="species-recent-section" id="recentSection">
      <div class="section-head" style="padding-top:var(--space-12)">
        <span class="section-head__title">Recent waargenomen</span>
      </div>
      <div class="species-recent-scroll" id="recentScroll">
        ${recentIds.map(id => {
          const s = SPECIES.find(x => x.id === id);
          if (!s) return '';
          return `<button type="button" class="species-recent-chip" data-id="${s.id}">
            <span class="species-recent-chip__thumb" id="rthumb-${s.id}" aria-hidden="true">
              <span>${s.icon}</span>
            </span>
            <span class="species-recent-chip__name">${escHtml(s.nameNL)}</span>
          </button>`;
        }).join('')}
      </div>
    </div>` : ''}

    <div id="speciesList" class="species-list" role="list"></div>
  `;

  renderList(el, seenIds, ctx);
  bindEvents(el, ctx);
  // K5: vanaf de kaart direct een soort openen
  let open = speciesId;
  try {
    open ||= sessionStorage.getItem('birdspot-open-species');
    sessionStorage.removeItem('birdspot-open-species');
  } catch (_) {}
  if (open) openDetail(open, el);

  // Laad async thumbnails voor "Recent bekeken"
  if (recentIds.length > 0) {
    recentIds.forEach(async id => {
      const url = await loadSpeciesThumb(id);
      if (!url) return;
      mountSpeciesThumb(el.querySelector(`#rthumb-${id}`),url,ctx);
    });
  }
  ctx.cleanup = () => {
    if (ctx.destroyed) return;
    ctx.destroyed = true;
    ctx.filterEvents.abort();
    ctx.detailCleanup?.(false);
    ctx.urls.forEach(revokePhotoUrl);
    ctx.urls.clear();
    if (_speciesCtx === ctx) {
      resetGuideFilters();
      _speciesCtx = null;
    }
  };
  return ctx.cleanup;
}

// ── Render lijst ───────────────────────────────────────────────
// Lange lijsten (bijv. 243 dwaalgasten) bouwen eerst LIST_PAGE rijen op;
// de rest pas na "Toon alle" (render wat nodig is, Handbook §3.9 / L-053).
const LIST_PAGE = 60;
let _listLimit = LIST_PAGE;
let _listKey = '';

function renderList(el, seenIds, ctx = _speciesCtx) {
  seenIds = seenIds || getObservedIds();
  const favorites = getCollectionIds("species");
  const period = seasonPeriod(_seasons);
  const results = searchSpecies(_searchQuery, _currentCategory === ALL ? null : _currentCategory, _currentRegion)
    .filter(species => !_onlyFavorites || favorites.has(species.id))
    .filter(species => presentIn(species, period))
    .filter(species => !(period && _hideYearRound && isYearRound(species)));
  const generation = ctx ? ++ctx.listGeneration : 0;
  const list    = el.querySelector('#speciesList');
  if (!list) return;
  const key = [_currentCategory, _searchQuery, _currentRegion, _onlyFavorites, _seasons.join('+'), _hideYearRound].join('|');
  if (key !== _listKey) { _listKey = key; _listLimit = LIST_PAGE; }

  // Update sub-header teller
  const sub   = el.querySelector('#speciesSub');
  if (sub) sub.textContent = counterText(seenIds);
  const hint  = el.querySelector('#seasonHint');
  if (hint) {
    hint.hidden = !period;
    hint.textContent = period
      ? `${period.label}: ${periodMonthsText(period)} · ${results.length} ${results.length === 1 ? 'soort' : 'soorten'}`
        + (_hideYearRound ? ' · zonder jaarrondvogels' : '')
        + (_seasons.length === 1 ? ' · tik een buurseizoen aan voor de overgang' : '')
      : '';
  }

  if (results.length === 0) {
    const emptyMsg = _onlyFavorites && !_searchQuery && !_currentRegion
      ? 'Nog geen favorieten in deze categorie. Gebruik de ster naast een vogelsoort.'
      : period && !_searchQuery
      ? `Geen soorten in deze categorie in de periode <strong>${escHtml(period.label.toLowerCase())}</strong>. Dwaalgasten zonder vaste periode tellen niet mee.`
      : _currentRegion
      ? `Geen soorten gevonden in <strong>${escHtml(REGIONS[_currentRegion]?.label)}</strong>${_searchQuery ? ` voor "${escHtml(_searchQuery)}"` : ''}`
      : `Geen soorten gevonden voor "<strong>${escHtml(_searchQuery)}</strong>"`;
    list.innerHTML = `
      <div class="empty-state" style="padding-top:48px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>${emptyMsg}</p>
      </div>`;
    return;
  }

  // Groepeer op familie
  const shown = results.slice(0, _listLimit);
  const hidden = results.length - shown.length;
  const byFamily = {};
  shown.forEach(s => {
    if (!byFamily[s.family]) byFamily[s.family] = [];
    byFamily[s.family].push(s);
  });

  list.innerHTML = Object.entries(byFamily).map(([family, birds]) => `
    <div class="species-group">
      <div class="species-group__label">${escHtml(family)}</div>
      ${birds.map(s => speciesRow(s, seenIds, favorites)).join('')}
    </div>`).join('') + (hidden > 0 ? `
    <button type="button" class="species-show-all" id="speciesShowAll">Toon alle ${results.length} soorten (+${hidden})</button>` : '');

  const more = list.querySelector('#speciesShowAll');
  if (more) more.addEventListener('click', () => { _listLimit = Infinity; renderList(el, seenIds, ctx); });

  // Laad async thumbnails per zichtbare rij
  shown.forEach(async s => {
    const url = await loadSpeciesThumb(s.id);
    if (!url) return;
    if (ctx?.destroyed || (ctx && generation !== ctx.listGeneration)) { revokePhotoUrl(url); return; }
    const thumb = list.querySelector(`.species-row[data-id="${s.id}"] .species-row__thumb`);
    mountSpeciesThumb(thumb,url,ctx);
  });
}

function speciesRow(s, seenIds, favorites = getCollectionIds("species")) {
  const seen   = seenIds.has(s.id);
  const rarity = getRarity(s);
  const rm     = rarity ? RARITY_MAP[rarity] : null;
  const secondary = s.category !== _currentCategory && s.statusExtra === _currentCategory;
  const badge = secondary ? `Ook ${CATEGORY_BADGES[s.statusExtra].toLowerCase()}`
    : rm?.label || CATEGORY_BADGES[s.category] || 'Soort';

  return `
    <div class="species-row${seen ? ' seen' : ''}" data-id="${s.id}" role="listitem">
      <div class="species-row__thumb" aria-hidden="true">
        <span>${s.icon}</span>
      </div>
      <div class="species-row__body">
        <button class="species-row__name" type="button">${escHtml(s.nameNL)}</button>
        <div class="species-row__sci">${escHtml(s.nameSci)}</div>
      </div>
      <span class="species-row__rarity ${secondary ? 'signature-species-category' : rm?.cls || 'signature-species-category'}">${escHtml(badge)}</span>
      <button class="signature-species-star ${favorites.has(s.id) ? "is-on" : ""}"
        type="button" data-species-fav="${s.id}" aria-pressed="${favorites.has(s.id)}"
        aria-label="${favorites.has(s.id) ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}: ${escHtml(s.nameNL)}">
        ${favorites.has(s.id) ? "★" : "☆"}
      </button>
      <span class="species-observation-status">${seen ? 'Waargenomen' : ''}</span>
    </div>`;
}

// ── Events ─────────────────────────────────────────────────────
function bindEvents(el, ctx = _speciesCtx) {
  const menus = el.querySelector('.species-filter-menus');
  const signal = ctx.filterEvents.signal;
  document.addEventListener('click', e => {
    for (const menu of menus.querySelectorAll('.species-filter[open]')) {
      if (!menu.contains(e.target)) menu.open = false;
    }
  }, {signal});
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const menu = menus.querySelector('.species-filter[open]');
    if (menu) {
      e.preventDefault();
      menu.open = false;
      menu.querySelector('summary').focus({preventScroll:true});
    }
  }, {signal});

  function updateFilterMenu(panel, close = false) {
    const menu = panel.closest('.species-filter');
    const summary = menu.querySelector('summary');
    summary.querySelector('strong').textContent = filterLabel(panel.id);
    if (close) {
      menu.open = false;
      summary.focus({preventScroll:true});
    }
  }

  el.querySelector('#speciesOpenMedia')?.addEventListener('click', () => {
    import('../../app.js').then(({navigate}) => navigate('media'));
  });
  el.querySelector('#speciesOnlyFavorites')?.addEventListener('click', e => {
    _onlyFavorites = !_onlyFavorites;
    e.currentTarget.classList.toggle("is-selected",_onlyFavorites);
    e.currentTarget.setAttribute("aria-pressed",String(_onlyFavorites));
    renderList(el,undefined,ctx);
  });
  // Zoekbalk
  el.querySelector('#speciesSearch')?.addEventListener('input', e => {
    _searchQuery = e.target.value;
    renderList(el);
  });

  // Categorie-chips
  el.querySelector('#speciesFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-chip[data-cat]');
    if (!btn) return;
    _currentCategory = btn.dataset.cat;
    el.querySelectorAll('.filter-chip[data-cat]').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === _currentCategory);
      b.setAttribute('aria-pressed', b.dataset.cat === _currentCategory);
    });
    updateFilterMenu(e.currentTarget, true);
    renderList(el);
  });

  // Gebied-chips (toggle: klik opnieuw = deselect)
  el.querySelector('#gebiedFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-chip--gebied');
    if (!btn) return;
    const key = btn.dataset.region;
    _currentRegion = (_currentRegion === key) ? null : key;
    el.querySelectorAll('.filter-chip--gebied').forEach(b => {
      b.classList.toggle('active', b.dataset.region === _currentRegion);
      b.setAttribute('aria-pressed', b.dataset.region === _currentRegion);
    });
    updateFilterMenu(e.currentTarget, true);
    renderList(el);
  });

  // Seizoen-chips: één seizoen, of twee aangrenzende voor de overgangsperiode
  el.querySelector('#seizoenFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-chip--seizoen');
    if (!btn) return;
    if (btn.id === 'seasonHideYearRound') {
      _hideYearRound = !_hideYearRound;
      btn.classList.toggle('active', _hideYearRound);
      btn.setAttribute('aria-pressed', String(_hideYearRound));
      renderList(el);
      return;
    }
    _seasons = toggleSeason(_seasons, btn.dataset.season);
    const yr = el.querySelector('#seasonHideYearRound');
    if (yr) yr.hidden = _seasons.length === 0;
    el.querySelectorAll('.filter-chip--seizoen[data-season]').forEach(b => {
      const on = _seasons.includes(b.dataset.season);
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    updateFilterMenu(e.currentTarget);
    renderList(el);
  });

  // Recent bekeken chips → open detail
  el.querySelector('#recentScroll')?.addEventListener('click', e => {
    const chip = e.target.closest('.species-recent-chip');
    if (chip) openDetail(chip.dataset.id, el);
  });

  // Lijst — favorieten, gezienstatus en detail zijn gescheiden acties.
  el.querySelector('#speciesList')?.addEventListener('click', e => {
    const favoriteBtn = e.target.closest('[data-species-fav]');
    if (favoriteBtn) {
      e.stopPropagation();
      try {
        const id = favoriteBtn.dataset.speciesFav;
        const restoreFocus = document.activeElement === favoriteBtn;
        toggleCollectionItem('species', id);
        const totalFavorites = getCollectionIds('species').size;
        const label = el.querySelector('#speciesFavoriteCount');
        if (label) label.textContent = '★ ' + totalFavorites + ' favorieten';
        renderList(el,undefined,ctx);
        if (restoreFocus) {
          const next = el.querySelector('[data-species-fav="' + CSS.escape(id) + '"]');
          (next || el.querySelector('#speciesOnlyFavorites'))?.focus({ preventScroll: true });
        }
      } catch (_) {
        const label = el.querySelector('#speciesFavoriteCount');
        if (label) label.textContent = 'Favoriet opslaan mislukt';
      }
      return;
    }
    const row = e.target.closest('.species-row');
    if (row) openDetail(row.dataset.id, el);
  });
}

function counterText(seenIds) {
  const pool  = SPECIES.filter(s => matchesSpeciesStatus(s, _currentCategory === ALL ? null : _currentCategory));
  const seen  = pool.filter(s => seenIds.has(s.id)).length;
  const label = _currentCategory === ALL ? 'soorten' : (CATEGORY_LABELS[_currentCategory]?.toLowerCase() || '');
  return `Nederland · ${seen}/${pool.length} ${label} waargenomen`;
}

// ── Detail sheet ───────────────────────────────────────────────
function openDetail(speciesId, screenEl, returnFocus = document.activeElement) {
  const s = SPECIES.find(x => x.id === speciesId);
  if (!s) return;
  const ctx = _speciesCtx;
  if (ctx?.destroyed) return;
  ctx?.detailCleanup?.(false);
  _detailSpeciesId = speciesId;

  const guidePhoto = GUIDE_PHOTOS[speciesId];
  const photosUrls = new Set();
  const photoList = [];
  let closed = false;
  let closeViewer;

  const sheet = document.createElement('div');
  sheet.className = 'sheet-overlay signature-species-detail-overlay';
  sheet.innerHTML =
    '<div class="sheet signature-species-detail-sheet" role="dialog" aria-modal="true" aria-label="' + escHtml(s.nameNL) + '">' +
      '<div class="sheet__handle" aria-hidden="true"></div>' +
      '<div class="signature-species-detail-top">' +
        '<span class="signature-kicker">Veldgids</span>' +
        '<button type="button" class="signature-species-detail-close" aria-label="Sluit soortdetail">×</button>' +
      '</div>' +
      '<div class="sheet__content">' +
        '<div class="signature-species-detail-hero' + (guidePhoto ? ' has-guide-photo' : '') + '">' +
          '<div id="detailThumb-' + escHtml(s.id) + '" class="signature-species-detail-image">' +
            (guidePhoto ? '<button type="button" class="sd-hero-photo" data-guide-image="' + escHtml(guidePhoto.image) + '" aria-label="Vergroot hoofdfoto">' +
              '<img class="species-guide-photo" data-src="' + escHtml(guidePhoto.image) + '" alt="' + escHtml(guidePhoto.alt) + '"></button>' + photoInfoMarkup(guidePhoto) :
              '<span aria-hidden="true">' + escHtml(s.icon) + '</span>') + '</div>' +
          '<div class="signature-species-detail-intro"><span class="signature-eyebrow">' + escHtml(s.family) + '</span>' +
            '<h2>' + escHtml(s.nameNL) + '</h2>' +
            '<p><em>' + escHtml(s.nameSci) + '</em></p>' +
            '<p>' + escHtml(s.nameEN || '') + '</p></div>' +
        '</div>' +
        '<div class="detail-section sd-photos"><div class="detail-section__label">Eigen vogelfoto’s</div>' +
          '<div class="signature-species-photo-grid" id="speciesDetailPhotos">' +
            '<div class="detail-photos-loading"><span class="spinner" aria-hidden="true"></span></div></div>' +
          '<button type="button" class="signature-species-media-link" id="speciesDetailMedia">Open Media Studio ↗</button>' +
        '</div>' +
        tabBar('herkenning') +
        '<div class="sd-panel" id="sdPanel-herkenning" role="tabpanel" aria-labelledby="sdTab-herkenning">' + recognitionPanel(s) + '</div>' +
        '<div class="sd-panel" id="sdPanel-status" role="tabpanel" aria-labelledby="sdTab-status" hidden>' + statusPanel(s) + '</div>' +
        '<div class="sd-panel" id="sdPanel-waar" role="tabpanel" aria-labelledby="sdTab-waar" hidden>' + wherePanel(s) + '</div>' +
        '<div class="sd-panel" id="sdPanel-mijn" role="tabpanel" aria-labelledby="sdTab-mijn" hidden>' +
          '<div id="sdMineStats"></div>' +
          '<div id="speciesDetailSightings" class="detail-sightings-list">' +
            '<div class="detail-photos-loading"><span class="spinner" aria-hidden="true"></span></div></div>' +
        '</div>' +
      '</div></div>';

  const guideImage = sheet.querySelector('img.species-guide-photo');
  if (guideImage) {
    guideImage.addEventListener('error', () => {
      guideImage.parentElement.textContent = 'Gidsfoto niet beschikbaar';
    }, {once:true});
    guideImage.src = guideImage.dataset.src;
  }
  document.body.appendChild(sheet);
  const panel = sheet.querySelector('.sheet');
  sheet.classList.add('open'); // Immediately interactive, also before the first animation frame.
  sheet.querySelector('.sd-tabs')?.addEventListener('click', e => {
    const tab = e.target.closest('[data-sd-tab]');
    if (!tab) return;
    if (tab.dataset.sdTab !== 'herkenning') sheet.querySelectorAll('.sd-audio audio').forEach(audio => audio.pause());
    sheet.querySelectorAll('[data-sd-tab]').forEach(b => {
      const on = b === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
      sheet.querySelector('#sdPanel-' + b.dataset.sdTab).hidden = !on;
    });
  });
  import('../../data/speciesLife.js').then(({ LIFE }) => {
    const life = LIFE[speciesId];
    if (!life || closed) return;
    const voice = sheet.querySelector('#sdVoice');
    const description = voice.querySelector('.sd-voice-text');
    if (description) {
      if (life.voice) description.innerHTML = voiceText(life.voice);
    } else {
      voice.innerHTML = voicePanel(s, life.voice);
    }
    sheet.querySelector('#sdPanel-status').innerHTML = statusPanel(s, life);
  }).catch(() => {});
  function close(animate = true) {
    if (closed) return;
    closed = true;
    sheet.querySelectorAll('.sd-audio audio').forEach(audio => audio.pause());
    closeViewer?.(false);
    document.removeEventListener('keydown',keyHandler);
    sheet.classList.remove('open');
    const cleanup = () => {
      sheet.remove();
      for (const url of photosUrls) revokePhotoUrl(url);
      photosUrls.clear();
      if (ctx?.detailCleanup === close) ctx.detailCleanup = null;
      if (animate && !ctx?.destroyed && !ctx?.detailCleanup && restoreGuideDefaults(screenEl, ctx)) {
        screenEl.querySelector('h1')?.focus({ preventScroll: true });
      } else if (!ctx?.destroyed && !ctx?.detailCleanup) {
        returnFocus?.focus?.();
      }
    };
    if (animate && sheet.isConnected && !matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(cleanup,250);
    else cleanup();
  }
  if (ctx) ctx.detailCleanup = close;

  function keyHandler(e) {
    if (e.key === 'Escape') {
      if (!closePhotoInfo(sheet)) close();
    }
  }
  document.addEventListener('keydown',keyHandler);
  sheet.addEventListener('click',e => {
    if (e.target===sheet || e.target.closest('.signature-species-detail-close')) close();
    const photo = e.target.closest('[data-guide-image]');
    if (photo) openViewer(photo.dataset.guideImage, photo.querySelector('img').alt, photo);
    const compare = e.target.closest('[data-compare-species]');
    if (compare) {
      close(false);
      openDetail(compare.dataset.compareSpecies, screenEl, returnFocus);
    }
  });
  sheet.addEventListener('play', e => {
    if (!e.target.matches('.sd-audio audio')) return;
    sheet.querySelectorAll('.sd-audio audio').forEach(audio => { if (audio !== e.target) audio.pause(); });
  }, true);
  sheet.addEventListener('error', e => {
    if (e.target.matches('.sd-audio audio')) e.target.nextElementSibling.hidden = false;
    if (e.target.matches('.sd-field-photo img')) {
      const fallback = document.createElement('small');
      fallback.className = 'sd-media-credit';
      fallback.textContent = 'Deze foto is nu niet beschikbaar.';
      e.target.closest('button').replaceWith(fallback);
    }
  }, true);

  sheet.querySelector('#speciesDetailMedia').addEventListener('click',() => {
    close(false);
    import('../../app.js').then(({navigate}) => navigate('media'));
  });

  sheet.querySelector('#speciesDetailPhotos').addEventListener('click',e => {
    const button=e.target.closest('[data-photo-index]');
    if (!button) return;
    const index=Number(button.dataset.photoIndex);
    const item=photoList[index];
    if (!item) return;
    openViewer(item.url, s.nameNL, button);
  });

  function openViewer(url, alt, trigger) {
    closeViewer?.(false);
    closeViewer = openPhotoViewer({
      url, alt, trigger,
      photoInfo: trigger.parentElement.querySelector('.photo-info'),
      onClose: () => { closeViewer = undefined; },
    });
  }

  (async()=>{
    try {
      const [indexed, sightings] = await Promise.all([getPhotosBySpecies(speciesId),getSightings()]);
      if (closed || ctx?.destroyed) return;
      const matches = sightings.filter(item=>item && item.speciesId===speciesId)
        .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
      const recordIds = new Set(matches.map(item=>item.id));
      const linkedIds = new Set(matches.flatMap(item=>item.photoIds||[]));
      const photosById = new Map(indexed.filter(p=>recordIds.has(p.sightingId)||linkedIds.has(p.id)).map(p=>[p.id,p]));
      // Legacy sightings may only contain photoIds, no by_species index.
      const ids = [...new Set(matches.flatMap(item=>item.photoIds||[]))];
      for(const id of ids) {
        if (photosById.has(id)) continue;
        const photo = await getPhoto(id);
        if (closed || ctx?.destroyed) return;
        if (photo) photosById.set(photo.id,photo);
      }
      const imagePhotos = [...photosById.values()].filter(p=>p.blob instanceof Blob &&
        (p.blob.type||p.type||'').startsWith('image/'));
      const gallery=sheet.querySelector('#speciesDetailPhotos');
      if(!imagePhotos.length) {
        gallery.innerHTML='<div class="signature-species-empty-photo">Nog geen eigen foto’s van deze soort. Voeg bij een waarneming een foto toe.</div>';
      } else {
        imagePhotos.forEach(photo=>{
          const url=getPhotoUrl(photo);
          if(!url) return;
          photosUrls.add(url);
          const index=photoList.push({photo,url})-1;
          const button=document.createElement('button');
          button.type='button';
          button.className='signature-species-photo-tile';
          button.dataset.photoIndex=String(index);
          button.setAttribute('aria-label','Bekijk foto ' + (index+1) + ' van ' + s.nameNL);
          const img=document.createElement('img');
          img.alt=s.nameNL;
          img.loading='lazy';
          img.src=url;
          button.appendChild(img);
          gallery.appendChild(button);
        });
        gallery.querySelector('.detail-photos-loading')?.remove();
        const hero=sheet.querySelector('#detailThumb-'+speciesId);
        if(hero && photoList[0] && !guidePhoto) {
          const img=document.createElement('img');
          img.alt=s.nameNL;
          img.src=photoList[0].url;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'sd-hero-photo';
          button.dataset.guideImage = photoList[0].url;
          button.setAttribute('aria-label', 'Vergroot hoofdfoto');
          button.appendChild(img);
          hero.closest('.signature-species-detail-hero').classList.add('has-guide-photo');
          hero.replaceChildren(button);
        }
      }
      const stats=sightingStats(matches, loadPlaces());
      sheet.querySelector('#sdMineStats').innerHTML=minePanel(stats,fmtDate);
      const where=sheet.querySelector('#sdWherePlaces');
      where.innerHTML=wherePlaces(stats.places);
      where.querySelectorAll('[data-place-id]').forEach(btn=>btn.addEventListener('click',()=>{
        try { sessionStorage.setItem('birdspot-map-place', btn.dataset.placeId); } catch (_) {}
        close(false);
        import('../../app.js').then(({navigate})=>navigate('map'));
      }));
      where.querySelector('#sdShowOnMap')?.addEventListener('click',()=>{
        try { sessionStorage.setItem('birdspot-map-species', s.nameNL); } catch (_) {}
        close(false);
        import('../../app.js').then(({navigate})=>navigate('map'));
      });
      const rows=sheet.querySelector('#speciesDetailSightings');
      if(!matches.length) rows.innerHTML='<div class="signature-species-empty-photo">Nog geen waarnemingen vastgelegd voor deze soort.</div>';
      else {
        rows.innerHTML=matches.map(item=>
          '<button type="button" class="signature-species-sighting" data-sighting-id="'+escHtml(item.id)+'">' +
          '<span><strong>'+escHtml(fmtDate(item.date))+'</strong><small>'+escHtml(loadPlaces().find(p=>p.id===item.placeId)?.name || item.locationName || (Number.isFinite(item.lat)&&Number.isFinite(item.lon)?item.lat.toFixed(5)+', '+item.lon.toFixed(5):'Locatie niet vastgelegd'))+'</small><small>'+escHtml(methodLabel(item))+' · '+escHtml(sourceLabel(item))+'</small>' +
          (BREEDING_BEHAVIORS.includes(item.behavior) ? '<small class="sd-breeding-observation">'+escHtml(item.behavior)+'</small>' : '') +
          '</span><span aria-hidden="true">↗</span></button>').join('');
        rows.addEventListener('click',e=>{
          const btn=e.target.closest('[data-sighting-id]');
          const record=matches.find(item=>item.id===btn?.dataset.sightingId);
          if (!record) return;
          close(false);
          import('../sightings/detailSheet.js').then(({openDetailSheet})=>openDetailSheet(record,{onUpdated:()=>import('../../app.js').then(({navigate})=>navigate('species',{force:true})),onDeleted:()=>import('../../app.js').then(({navigate})=>navigate('species',{force:true}))}));
        });
      }
    } catch (_) {
      if(closed) return;
      const gallery=sheet.querySelector('#speciesDetailPhotos');
      if(gallery) gallery.innerHTML='<div class="signature-species-empty-photo">De eigen foto’s konden niet worden geladen.</div>';
      const rows=sheet.querySelector('#speciesDetailSightings');
      if(rows) rows.innerHTML='<div class="signature-species-empty-photo">Waarnemingen tijdelijk niet beschikbaar.</div>';
    }
  })();
  sheet.querySelector('.signature-species-detail-close').focus();
}

// ── Iconen ─────────────────────────────────────────────────────
function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

const REGION_TAG_LABELS = {
  stedelijk:'Stedelijk', agrarisch:'Agrarisch', bos:'Bos',
  heide:'Heide', duinen:'Duinen', kust:'Kust', wad:'Wad',
  polder:'Polder', rivierengebied:'Rivierengebied',
  moeras:'Moeras', rietland:'Rietland', zee:'Zee', struweel:'Struweel',
};
function regionTagLabel(tag) {
  return REGION_TAG_LABELS[tag] || tag;
}
