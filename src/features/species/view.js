/**
 * Soortenoverzicht — Stap 3 (UI-redesign)
 * Zoek + filter op categorie + gebied, gezien-toggle, soortdetail
 * Nieuw: foto-thumbnails, zeldzaamheid-badges, "Recent bekeken" scroll
 */

import { SPECIES, CATEGORY_LABELS, REGIONS, getSeenIds, toggleSeen, searchSpecies, activeCategories, CATEGORY_BADGES } from '../../data/species.js';
import { tabBar, recognitionPanel, statusPanel, wherePanel, minePanel, sightingStats } from './detailSections.js';
import { SEASONS, SEASON_ORDER, toggleSeason, seasonPeriod, presentIn, periodMonthsText, isYearRound } from '../../data/seasons.js';
import { getDB, getPhotosBySpecies, getPhoto } from '../../data/db.js';
import { getSightings }                 from '../../data/sightings.js';
import { getPhotoUrl, revokePhotoUrl }  from '../../utils/photoUrl.js';
import { getCollectionIds, toggleCollectionItem } from '../../storage/collections.js';

let _currentCategory = 'standvogel';
let _seasons = [];
let _hideYearRound = false;  // optie bij seizoensfilter: (bijna) jaarrondvogels verbergen            // max. twee aangrenzende seizoenen (zie data/seasons.js)
const ALL = 'alle';           // categorie-tab voor alle soorten
let _searchQuery     = '';
let _currentRegion   = null;
let _detailSpeciesId = null;
let _onlyFavorites = false;
let _speciesCtx = null;

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
  try {
    // The species IDB index covers recent records.
    const photos = await getPhotosBySpecies(speciesId);
    let photo = photos.find(p => p?.blob instanceof Blob && (p.blob.type || p.type || '').startsWith('image/'));
    if (photo) return getPhotoUrl(photo);
    // Legacy records may have only photoIds on sightings, without by_species.
    const sightings = await getSightings();
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
  ctx?.urls?.add(url);
  const release = () => { revokePhotoUrl(url); ctx?.urls?.delete(url); };
  img.addEventListener('load',release,{once:true});
  img.addEventListener('error',release,{once:true});
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
export function renderSpecies(el) {
  if (_speciesCtx?.cleanup) _speciesCtx.cleanup();
  const ctx = { destroyed:false, urls:new Set(), detailCleanup:null, listGeneration:0, cleanup:null };
  _speciesCtx = ctx;
  const seenIds = getSeenIds();
  const total   = SPECIES.filter(s => s.category === 'standvogel').length;
  const seen    = SPECIES.filter(s => s.category === 'standvogel' && seenIds.has(s.id)).length;

  const recentIds = getRecentSpeciesIds();

  el.innerHTML = `
    <header class="species-header">
      <div class="species-header__title">Soorten</div>
      <div class="species-header__sub" id="speciesSub">Benelux · ${seen}/${total} standvogels gezien</div>
    </header>
    <section class="signature-species-hero" aria-label="Soortenbibliotheek">
      <span class="signature-kicker">BIRDSPOT / SPECIES COLLECTION</span>
      <h1>Ontdek elke vogel opnieuw.</h1>
      <p>Herken vogelsoorten, bewaar je favorieten en herbeleef je eigen fotomomenten.</p>
      <div class="signature-species-hero-actions">
        <button id="speciesOpenMedia" type="button">Mijn fotocollectie <span aria-hidden="true">↗</span></button>
        <span id="speciesFavoriteCount">★ ${getCollectionIds("species").size} favorieten</span>
      </div>
    </section>

    <div class="species-toolbar">
      <div class="species-search-wrap">
        <svg class="species-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="speciesSearch" class="species-search" type="search"
          placeholder="Zoek soort, familie, gebied…" autocomplete="off"
          value="${escHtml(_searchQuery)}">
      </div>
      <div class="species-filters" id="speciesFilters" role="tablist">
        ${[[ALL, 'Alle'], ...activeCategories().map(key => [key, CATEGORY_LABELS[key]])].map(([key, lbl]) => `
          <button class="filter-chip${_currentCategory === key ? ' active' : ''}"
            data-cat="${key}" role="tab"
            aria-selected="${_currentCategory === key}">
            ${lbl}
          </button>`).join('')}
      </div>
      <div class="signature-species-favorites-filter">
        <button id="speciesOnlyFavorites" type="button" aria-pressed="${_onlyFavorites}" class="${_onlyFavorites ? "is-selected" : ""}">★ Alleen mijn favorieten</button>
      </div>
      <div class="species-filters species-filters--gebied" id="gebiedFilters" role="group" aria-label="Filter op gebied">
        <span class="filter-label">Gebied</span>
        ${Object.entries(REGIONS).map(([key, r]) => `
          <button class="filter-chip filter-chip--gebied${_currentRegion === key ? ' active' : ''}"
            data-region="${key}"
            aria-pressed="${_currentRegion === key}">
            ${r.label}
          </button>`).join('')}
      </div>
      <div class="species-filters species-filters--seizoen" id="seizoenFilters" role="group" aria-label="Filter op seizoen">
        <span class="filter-label">Seizoen</span>
        ${SEASON_ORDER.map(key => `
          <button class="filter-chip filter-chip--seizoen${_seasons.includes(key) ? ' active' : ''}"
            data-season="${key}" aria-pressed="${_seasons.includes(key)}">
            ${SEASONS[key].label}
          </button>`).join('')}
        <button class="filter-chip filter-chip--seizoen filter-chip--jaarrond${_hideYearRound ? ' active' : ''}"
          id="seasonHideYearRound" aria-pressed="${_hideYearRound}" ${_seasons.length ? '' : 'hidden'}>
          Zonder jaarrondvogels
        </button>
      </div>
      <p class="species-season-hint" id="seasonHint" aria-live="polite"></p>
    </div>

    ${recentIds.length > 0 ? `
    <div class="species-recent-section" id="recentSection">
      <div class="section-head" style="padding-top:var(--space-12)">
        <span class="section-head__title">Recent waargenomen</span>
      </div>
      <div class="species-recent-scroll" id="recentScroll">
        ${recentIds.map(id => {
          const s = SPECIES.find(x => x.id === id);
          if (!s) return '';
          return `<div class="species-recent-chip" data-id="${s.id}">
            <div class="species-recent-chip__thumb" id="rthumb-${s.id}">
              <span aria-hidden="true">${s.icon}</span>
            </div>
            <div class="species-recent-chip__name">${escHtml(s.nameNL)}</div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <div id="speciesList" class="species-list" role="list"></div>
  `;

  renderList(el, seenIds, ctx);
  bindEvents(el, ctx);

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
    ctx.detailCleanup?.(false);
    ctx.urls.forEach(revokePhotoUrl);
    ctx.urls.clear();
    if (_speciesCtx === ctx) _speciesCtx = null;
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
  seenIds = seenIds || getSeenIds();
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

  return `
    <div class="species-row${seen ? ' seen' : ''}" data-id="${s.id}" role="listitem">
      <div class="species-row__thumb" aria-hidden="true">
        <span>${s.icon}</span>
      </div>
      <div class="species-row__body">
        <div class="species-row__name">${escHtml(s.nameNL)}</div>
        <div class="species-row__sci">${escHtml(s.nameSci)}</div>
      </div>
      <span class="species-row__rarity ${rm?.cls || "signature-species-category"}">${rm?.label || CATEGORY_BADGES[s.category] || "Soort"}</span>
      <button class="signature-species-star ${favorites.has(s.id) ? "is-on" : ""}"
        type="button" data-species-fav="${s.id}" aria-pressed="${favorites.has(s.id)}"
        aria-label="${favorites.has(s.id) ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}: ${escHtml(s.nameNL)}">
        ${favorites.has(s.id) ? "★" : "☆"}
      </button>
      <button class="seen-toggle${seen ? ' seen' : ''}"
        data-id="${s.id}" aria-label="${seen ? 'Markeer als niet gezien' : 'Markeer als gezien'}"
        aria-pressed="${seen}">
        ${seen ? checkIcon() : circleIcon()}
      </button>
    </div>`;
}

// ── Events ─────────────────────────────────────────────────────
function bindEvents(el, ctx = _speciesCtx) {
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
      b.setAttribute('aria-selected', b.dataset.cat === _currentCategory);
    });
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
        toggleCollectionItem('species',favoriteBtn.dataset.speciesFav);
        const totalFavorites = getCollectionIds('species').size;
        const label = el.querySelector('#speciesFavoriteCount');
        if (label) label.textContent = '★ ' + totalFavorites + ' favorieten';
        renderList(el,undefined,ctx);
      } catch (_) {
        const label = el.querySelector('#speciesFavoriteCount');
        if (label) label.textContent = 'Favoriet opslaan mislukt';
      }
      return;
    }
    const toggleBtn = e.target.closest('.seen-toggle');
    if (toggleBtn) {
      e.stopPropagation();
      const id  = toggleBtn.dataset.id;
      const now = toggleSeen(id);
      const row = el.querySelector(`.species-row[data-id="${id}"]`);
      if (row) {
        row.classList.toggle('seen', now);
        toggleBtn.classList.toggle('seen', now);
        toggleBtn.innerHTML = now ? checkIcon() : circleIcon();
        toggleBtn.setAttribute('aria-pressed', now);
        toggleBtn.setAttribute('aria-label', now ? 'Markeer als niet gezien' : 'Markeer als gezien');
      }
      updateCounter(el);
      return;
    }

    const row = e.target.closest('.species-row');
    if (row) openDetail(row.dataset.id, el);
  });
}

function counterText(seenIds) {
  const pool  = _currentCategory === ALL ? SPECIES : SPECIES.filter(s => s.category === _currentCategory);
  const seen  = pool.filter(s => seenIds.has(s.id)).length;
  const label = _currentCategory === ALL ? 'soorten' : (CATEGORY_LABELS[_currentCategory]?.toLowerCase() || '');
  return `Benelux · ${seen}/${pool.length} ${label} gezien`;
}

function updateCounter(el) {
  const sub = el.querySelector('#speciesSub');
  if (sub) sub.textContent = counterText(getSeenIds());
}

// ── Detail sheet ───────────────────────────────────────────────
function openDetail(speciesId, screenEl) {
  const s = SPECIES.find(x => x.id === speciesId);
  if (!s) return;
  const ctx = _speciesCtx;
  if (ctx?.destroyed) return;
  ctx?.detailCleanup?.();
  _detailSpeciesId = speciesId;

  const photosUrls = new Set();
  const photoList = [];
  let closed = false;
  let viewer = null;
  let previousFocus = document.activeElement;

  const sheet = document.createElement('div');
  sheet.className = 'sheet-overlay signature-species-detail-overlay';
  sheet.innerHTML =
    '<div class="sheet signature-species-detail-sheet" role="dialog" aria-modal="true" aria-label="' + escHtml(s.nameNL) + '">' +
      '<div class="sheet__handle" aria-hidden="true"></div>' +
      '<div class="signature-species-detail-top">' +
        '<span class="signature-kicker">BIRDSPOT / FIELD GUIDE</span>' +
        '<button type="button" class="signature-species-detail-close" aria-label="Sluit soortdetail">×</button>' +
      '</div>' +
      '<div class="sheet__content">' +
        '<div class="signature-species-detail-hero">' +
          '<div id="detailThumb-' + escHtml(s.id) + '" class="signature-species-detail-image">' +
            '<span aria-hidden="true">' + escHtml(s.icon) + '</span></div>' +
          '<div class="signature-species-detail-intro"><span class="signature-eyebrow">' + escHtml(s.family) + '</span>' +
            '<h2>' + escHtml(s.nameNL) + '</h2>' +
            '<p><em>' + escHtml(s.nameSci) + '</em></p>' +
            '<p>' + escHtml(s.nameEN || '') + '</p></div>' +
        '</div>' +
        '<div class="signature-species-detail-actions">' +
          '<button type="button" class="signature-species-seen" id="speciesDetailSeen"></button>' +
          '<button type="button" class="signature-species-fav" id="speciesDetailFavorite"></button>' +
        '</div>' +
        '<section class="signature-species-log" aria-label="Nieuwe waarneming van deze vogel vastleggen">' +
          '<strong>Leg je ontmoeting vast</strong>' +
          '<p>Kies hoe je deze soort hebt waargenomen. Je kunt daarna een eigen pin, notitie, foto of video toevoegen.</p>' +
          '<div class="signature-species-methods">' +
            '<button type="button" data-species-observe="seen">◉ Gezien</button>' +
            '<button type="button" data-species-observe="heard">♪ Alleen gehoord</button>' +
            '<button type="button" data-species-observe="both">◉♪ Gezien én gehoord</button>' +
            '<button type="button" data-species-observe="merlin">♫ Merlin Sound ID</button>' +
          '</div>' +
        '</section>' +
        '<div class="detail-section sd-photos"><div class="detail-section__label">Eigen vogelfoto’s</div>' +
          '<div class="signature-species-photo-grid" id="speciesDetailPhotos">' +
            '<div class="detail-photos-loading"><span class="spinner" aria-hidden="true"></span></div></div>' +
          '<button type="button" class="signature-species-media-link" id="speciesDetailMedia">Open Media Studio ↗</button>' +
        '</div>' +
        tabBar('herkenning') +
        '<div class="sd-panel" id="sdPanel-herkenning" role="tabpanel" aria-labelledby="sdTab-herkenning">' + recognitionPanel(s) + '</div>' +
        '<div class="sd-panel" id="sdPanel-status" role="tabpanel" aria-labelledby="sdTab-status" hidden>' + statusPanel(s) + '</div>' +
        '<div class="sd-panel" id="sdPanel-waar" role="tabpanel" aria-labelledby="sdTab-waar" hidden>' + wherePanel(s, []) + '</div>' +
        '<div class="sd-panel" id="sdPanel-mijn" role="tabpanel" aria-labelledby="sdTab-mijn" hidden>' +
          '<div id="sdMineStats"></div>' +
          '<div id="speciesDetailSightings" class="detail-sightings-list">' +
            '<div class="detail-photos-loading"><span class="spinner" aria-hidden="true"></span></div></div>' +
        '</div>' +
      '</div></div>';

  document.body.appendChild(sheet);
  const panel = sheet.querySelector('.sheet');
  requestAnimationFrame(() => { if (!closed) sheet.classList.add('open'); });
  const seenBtn = sheet.querySelector('#speciesDetailSeen');
  sheet.querySelector('.sd-tabs')?.addEventListener('click', e => {
    const tab = e.target.closest('[data-sd-tab]');
    if (!tab) return;
    sheet.querySelectorAll('[data-sd-tab]').forEach(b => {
      const on = b === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
      sheet.querySelector('#sdPanel-' + b.dataset.sdTab).hidden = !on;
    });
  });
  const favBtn = sheet.querySelector('#speciesDetailFavorite');

  function updateActions() {
    const seen = getSeenIds().has(speciesId);
    const favorite = getCollectionIds('species').has(speciesId);
    seenBtn.textContent = seen ? '✓ Gezien' : '○ Markeer als gezien';
    seenBtn.setAttribute('aria-pressed',String(seen));
    favBtn.textContent = favorite ? '★ Favoriet' : '☆ Favoriet';
    favBtn.setAttribute('aria-pressed',String(favorite));
    favBtn.classList.toggle('is-on',favorite);
  }
  updateActions();

  function closeViewer() {
    if (viewer) { viewer.remove(); viewer = null; }
  }
  function close(animate = true) {
    if (closed) return;
    closed = true;
    closeViewer();
    document.removeEventListener('keydown',keyHandler);
    sheet.classList.remove('open');
    const cleanup = () => {
      sheet.remove();
      for (const url of photosUrls) revokePhotoUrl(url);
      photosUrls.clear();
      if (ctx?.detailCleanup === close) ctx.detailCleanup = null;
      previousFocus?.focus?.();
    };
    if (animate && sheet.isConnected) setTimeout(cleanup,250);
    else cleanup();
  }
  if (ctx) ctx.detailCleanup = close;

  function keyHandler(e) {
    if (e.key === 'Escape') {
      if (viewer) closeViewer(); else close();
    }
  }
  document.addEventListener('keydown',keyHandler);
  sheet.addEventListener('click',e => {
    if (e.target===sheet || e.target.closest('.signature-species-detail-close')) close();
  });

  // Species detail shares the same fully featured observation form as the FAB.
  // A quick action records a new sighting, not an unsupported "seen" assertion.
  sheet.querySelector('.signature-species-methods')?.addEventListener('click',event=>{
    const button=event.target.closest('[data-species-observe]');
    if(!button)return;
    const choice=button.dataset.speciesObserve;
    const initial={
      speciesId:s.id,
      speciesName:s.nameNL,
      observationMethod:choice==='merlin'?'heard':choice,
      identificationSource:choice==='merlin'?'merlin':'self',
    };
    close(false);
    import('../sightings/addSheet.js').then(({openAddSheet})=>{
      openAddSheet({
        initial,
        onSaved:()=>import('../../app.js').then(({navigate})=>navigate('species',{force:true})),
      });
    });
  });

  seenBtn.addEventListener('click',() => {
    try {
      toggleSeen(speciesId);
      updateActions();
      const row = screenEl.querySelector('.species-row[data-id="' + speciesId + '"]');
      const btn = row?.querySelector('.seen-toggle');
      if (row) row.classList.toggle('seen',getSeenIds().has(speciesId));
      if (btn) {
        const now = getSeenIds().has(speciesId);
        btn.classList.toggle('seen',now);
        btn.setAttribute('aria-pressed',String(now));
        btn.setAttribute('aria-label',now?'Markeer als niet gezien':'Markeer als gezien');
        btn.innerHTML=now?checkIcon():circleIcon();
      }
      updateCounter(screenEl);
    } catch (_) { seenBtn.textContent = 'Opslaan niet gelukt'; }
  });
  favBtn.addEventListener('click',() => {
    try {
      toggleCollectionItem('species',speciesId);
      updateActions();
      const count = screenEl.querySelector('#speciesFavoriteCount');
      if (count) count.textContent = '★ ' + getCollectionIds('species').size + ' favorieten';
      // Only re-render when a removed item must disappear from favorite-only filter.
      if (_onlyFavorites) renderList(screenEl,undefined,ctx);
      else {
        const rowBtn = screenEl.querySelector('.species-row[data-id="' + speciesId + '"] [data-species-fav]');
        if (rowBtn) {
          const selected = getCollectionIds('species').has(speciesId);
          rowBtn.classList.toggle('is-on',selected);
          rowBtn.setAttribute('aria-pressed',String(selected));
          rowBtn.textContent=selected?'★':'☆';
        }
      }
    } catch (_) { favBtn.textContent = 'Favoriet opslaan mislukt'; }
  });
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
    closeViewer();
    viewer=document.createElement('div');
    viewer.className='signature-lightbox';
    viewer.setAttribute('role','dialog');
    viewer.setAttribute('aria-modal','true');
    viewer.setAttribute('aria-label','Vogelfoto bekijken');
    viewer.innerHTML='<button type="button" class="signature-lightbox-close" aria-label="Sluit foto">×</button>'+
      '<img src="'+item.url+'" alt="'+escHtml(s.nameNL)+'">';
    document.body.appendChild(viewer);
    viewer.querySelector('button').focus();
    viewer.addEventListener('click',event=>{
      if(event.target===viewer||event.target.closest('button')) closeViewer();
    });
  });

  (async()=>{
    try {
      const [indexed, sightings] = await Promise.all([getPhotosBySpecies(speciesId),getSightings()]);
      if (closed || ctx?.destroyed) return;
      const matches = sightings.filter(item=>item.speciesId===speciesId)
        .sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      const photosById = new Map(indexed.map(p=>[p.id,p]));
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
        imagePhotos.slice(0,12).forEach(photo=>{
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
        if(hero && photoList[0]) {
          const img=document.createElement('img');
          img.alt='';
          img.src=photoList[0].url;
          hero.replaceChildren(img);
        }
      }
      const stats=sightingStats(matches);
      sheet.querySelector('#sdMineStats').innerHTML=minePanel(stats,fmtDate);
      const where=sheet.querySelector('#sdPanel-waar');
      where.innerHTML=wherePanel(s,stats.places);
      where.querySelector('#sdShowOnMap')?.addEventListener('click',()=>{
        try { sessionStorage.setItem('birdspot-map-species', s.nameNL); } catch (_) {}
        close(false);
        import('../../app.js').then(({navigate})=>navigate('map'));
      });
      const rows=sheet.querySelector('#speciesDetailSightings');
      if(!matches.length) rows.innerHTML='<div class="signature-species-empty-photo">Nog geen waarnemingen vastgelegd voor deze soort.</div>';
      else {
        rows.innerHTML=matches.slice(0,12).map(item=>
          '<button type="button" class="signature-species-sighting" data-sighting-id="'+escHtml(item.id)+'">' +
          '<span><strong>'+escHtml(fmtDate(item.date))+'</strong><small>'+escHtml(item.locationName||'Locatie niet vastgelegd')+'</small></span>' +
          '<span aria-hidden="true">↗</span></button>').join('');
        rows.addEventListener('click',e=>{
          const btn=e.target.closest('[data-sighting-id]');
          const record=matches.find(item=>item.id===btn?.dataset.sightingId);
          if (!record) return;
          close(false);
          import('../sightings/detailSheet.js').then(({openDetailSheet})=>openDetailSheet(record));
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
function checkIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
    <path d="M20 6L9 17l-5-5"/>
  </svg>`;
}
function circleIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
  </svg>`;
}
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
