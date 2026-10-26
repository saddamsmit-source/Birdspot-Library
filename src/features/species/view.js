/**
 * Soortenoverzicht — Stap 3 (UI-redesign)
 * Zoek + filter op categorie + gebied, gezien-toggle, soortdetail
 * Nieuw: foto-thumbnails, zeldzaamheid-badges, "Recent bekeken" scroll
 */

import { SPECIES, CATEGORY_LABELS, REGIONS, getSeenIds, toggleSeen, searchSpecies } from '../../data/species.js';
import { getDB } from '../../data/db.js';

let _currentCategory = 'standvogel';
let _searchQuery     = '';
let _currentRegion   = null;
let _detailSpeciesId = null;

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
  if (species.rarity) return species.rarity; // gebruik veld als aanwezig
  switch (species.category) {
    case 'standvogel':  return 'algemeen';
    case 'zomervogel':  return 'vrij-algemeen';
    case 'wintergast':  return 'schaars';
    case 'doortrekker': return 'vrij-algemeen';
    case 'dwaalgast':   return 'toevallig';
    default:            return 'algemeen';
  }
}

// ── IndexedDB helper ───────────────────────────────────────────
function txGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// Laad de eerste foto-blob voor een soort-id uit waarnemingen
async function loadSpeciesThumb(speciesId) {
  try {
    const sightings = JSON.parse(localStorage.getItem('birdspot_sightings') || '[]');
    const match = sightings.find(s => s.speciesId === speciesId && s.photoIds?.length);
    if (!match) return null;
    const db = await getDB();
    const tx = db.transaction('photos', 'readonly');
    const photo = await txGet(tx.objectStore('photos'), match.photoIds[0]);
    return photo?.dataUrl || null;
  } catch {
    return null;
  }
}

// ── "Recent bekeken" — soorten met recente waarneming ─────────
function getRecentSpeciesIds(limit = 8) {
  try {
    const sightings = JSON.parse(localStorage.getItem('birdspot_sightings') || '[]');
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
  const seenIds = getSeenIds();
  const total   = SPECIES.filter(s => s.category === 'standvogel').length;
  const seen    = SPECIES.filter(s => s.category === 'standvogel' && seenIds.has(s.id)).length;

  const recentIds = getRecentSpeciesIds();

  el.innerHTML = `
    <header class="species-header">
      <div class="species-header__title">Soorten</div>
      <div class="species-header__sub" id="speciesSub">Benelux · ${seen}/${total} standvogels gezien</div>
    </header>

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
        ${Object.entries(CATEGORY_LABELS).map(([key, lbl]) => `
          <button class="filter-chip${_currentCategory === key ? ' active' : ''}"
            data-cat="${key}" role="tab"
            aria-selected="${_currentCategory === key}">
            ${lbl}
          </button>`).join('')}
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
    </div>

    ${recentIds.length > 0 ? `
    <div class="species-recent-section" id="recentSection">
      <div class="section-head" style="padding-top:var(--space-12)">
        <span class="section-head__title">Recent bekeken</span>
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

  renderList(el, seenIds);
  bindEvents(el);

  // Laad async thumbnails voor "Recent bekeken"
  if (recentIds.length > 0) {
    recentIds.forEach(async id => {
      const dataUrl = await loadSpeciesThumb(id);
      if (!dataUrl) return;
      const thumb = el.querySelector(`#rthumb-${id}`);
      if (thumb) thumb.innerHTML = `<img src="${dataUrl}" alt="" loading="lazy">`;
    });
  }
}

// ── Render lijst ───────────────────────────────────────────────
function renderList(el, seenIds) {
  seenIds = seenIds || getSeenIds();
  const results = searchSpecies(_searchQuery, _currentCategory, _currentRegion);
  const list    = el.querySelector('#speciesList');
  if (!list) return;

  // Update sub-header teller
  const total = SPECIES.filter(s => s.category === _currentCategory).length;
  const seen  = SPECIES.filter(s => s.category === _currentCategory && seenIds.has(s.id)).length;
  const sub   = el.querySelector('#speciesSub');
  if (sub) sub.textContent = `Benelux · ${seen}/${total} ${CATEGORY_LABELS[_currentCategory]?.toLowerCase() || ''} gezien`;

  if (results.length === 0) {
    const emptyMsg = _currentRegion
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
  const byFamily = {};
  results.forEach(s => {
    if (!byFamily[s.family]) byFamily[s.family] = [];
    byFamily[s.family].push(s);
  });

  list.innerHTML = Object.entries(byFamily).map(([family, birds]) => `
    <div class="species-group">
      <div class="species-group__label">${escHtml(family)}</div>
      ${birds.map(s => speciesRow(s, seenIds)).join('')}
    </div>`).join('');

  // Laad async thumbnails per rij
  results.forEach(async s => {
    const dataUrl = await loadSpeciesThumb(s.id);
    if (!dataUrl) return;
    const thumb = list.querySelector(`.species-row[data-id="${s.id}"] .species-row__thumb`);
    if (thumb) thumb.innerHTML = `<img src="${dataUrl}" alt="" loading="lazy">`;
  });
}

function speciesRow(s, seenIds) {
  const seen   = seenIds.has(s.id);
  const rarity = getRarity(s);
  const rm     = RARITY_MAP[rarity] || RARITY_MAP.algemeen;

  return `
    <div class="species-row${seen ? ' seen' : ''}" data-id="${s.id}" role="listitem">
      <div class="species-row__thumb" aria-hidden="true">
        <span>${s.icon}</span>
      </div>
      <div class="species-row__body">
        <div class="species-row__name">${escHtml(s.nameNL)}</div>
        <div class="species-row__sci">${escHtml(s.nameSci)}</div>
      </div>
      <span class="species-row__rarity ${rm.cls}">${rm.label}</span>
      <button class="seen-toggle${seen ? ' seen' : ''}"
        data-id="${s.id}" aria-label="${seen ? 'Markeer als niet gezien' : 'Markeer als gezien'}"
        aria-pressed="${seen}">
        ${seen ? checkIcon() : circleIcon()}
      </button>
    </div>`;
}

// ── Events ─────────────────────────────────────────────────────
function bindEvents(el) {
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

  // Recent bekeken chips → open detail
  el.querySelector('#recentScroll')?.addEventListener('click', e => {
    const chip = e.target.closest('.species-recent-chip');
    if (chip) openDetail(chip.dataset.id, el);
  });

  // Lijst — delegate voor rij-klik (detail) en gezien-toggle
  el.querySelector('#speciesList')?.addEventListener('click', e => {
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

function updateCounter(el) {
  const seenIds = getSeenIds();
  const total   = SPECIES.filter(s => s.category === _currentCategory).length;
  const seen    = SPECIES.filter(s => s.category === _currentCategory && seenIds.has(s.id)).length;
  const sub     = el.querySelector('#speciesSub');
  if (sub) sub.textContent = `Benelux · ${seen}/${total} ${CATEGORY_LABELS[_currentCategory]?.toLowerCase() || ''} gezien`;
}

// ── Detail sheet ───────────────────────────────────────────────
function openDetail(speciesId, screenEl) {
  const s = SPECIES.find(x => x.id === speciesId);
  if (!s) return;
  _detailSpeciesId = speciesId;

  const seen   = getSeenIds().has(speciesId);
  const rarity = getRarity(s);
  const rm     = RARITY_MAP[rarity] || RARITY_MAP.algemeen;

  const sheet = document.createElement('div');
  sheet.className = 'sheet-overlay';
  sheet.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${escHtml(s.nameNL)}">
      <div class="sheet__handle" role="button" aria-label="Sluiten" tabindex="0"></div>
      <div class="sheet__content">
        <div class="detail-hero">
          <div class="detail-thumb" id="detailThumb-${s.id}" aria-hidden="true">
            <span>${s.icon}</span>
          </div>
          <div class="detail-names">
            <div class="detail-name">${escHtml(s.nameNL)}</div>
            <div class="detail-sci">${escHtml(s.nameSci)}</div>
            <div class="detail-en">${escHtml(s.nameEN)}</div>
            <span class="species-row__rarity ${rm.cls}" style="margin-top:6px;display:inline-flex">${rm.label}</span>
          </div>
          <button class="seen-toggle-large${seen ? ' seen' : ''}" data-id="${s.id}"
            aria-label="${seen ? 'Markeer als niet gezien' : 'Markeer als gezien'}"
            aria-pressed="${seen}">
            ${seen ? checkIcon() : circleIcon()}
            <span>${seen ? 'Gezien' : 'Markeer'}</span>
          </button>
        </div>

        <div class="detail-meta">
          <div class="detail-meta__item">
            <span class="detail-meta__label">Familie</span>
            <span>${escHtml(s.family)}</span>
          </div>
          <div class="detail-meta__item">
            <span class="detail-meta__label">Categorie</span>
            <span>${CATEGORY_LABELS[s.category] || s.category}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__label">Leefgebied</div>
          <div class="detail-regions">
            ${(s.regions || []).map(r => `<span class="region-tag">${escHtml(regionTagLabel(r))}</span>`).join('')}
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__label">Veldkenmerken</div>
          <p class="detail-fieldmarks">${escHtml(s.fieldmarks)}</p>
        </div>

        <div class="detail-section">
          <div class="detail-section__label">Eigen foto's</div>
          <div class="detail-photos-empty empty-state" style="padding:var(--space-16) 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="width:32px;height:32px">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <p>Foto's koppelen aan soorten komt in Stap 4</p>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__label">Waarnemingen</div>
          <div class="empty-state" style="padding:var(--space-16) 0">
            <p style="font-size:var(--fs-meta)">Koppelen aan waarnemingen komt in Stap 5</p>
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  requestAnimationFrame(() => sheet.querySelector('.sheet').classList.add('open'));

  // Laad detail-thumb async
  loadSpeciesThumb(speciesId).then(dataUrl => {
    if (!dataUrl) return;
    const dt = sheet.querySelector(`#detailThumb-${speciesId}`);
    if (dt) dt.innerHTML = `<img src="${dataUrl}" alt="">`;
  });

  // Sluit bij klik op overlay of handle
  const close = () => {
    sheet.querySelector('.sheet').classList.remove('open');
    setTimeout(() => sheet.remove(), 300);
  };
  sheet.addEventListener('click', e => { if (e.target === sheet) close(); });
  sheet.querySelector('.sheet__handle').addEventListener('click', close);
  sheet.querySelector('.sheet__handle').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') close();
  });

  // Gezien-toggle in sheet
  sheet.querySelector('.seen-toggle-large')?.addEventListener('click', e => {
    const id  = e.currentTarget.dataset.id;
    const now = toggleSeen(id);
    e.currentTarget.classList.toggle('seen', now);
    e.currentTarget.innerHTML = (now ? checkIcon() : circleIcon()) + `<span>${now ? 'Gezien' : 'Markeer'}</span>`;
    e.currentTarget.setAttribute('aria-pressed', now);
    // Sync rij in lijst
    const row    = screenEl.querySelector(`.species-row[data-id="${id}"]`);
    const rowBtn = screenEl.querySelector(`.seen-toggle[data-id="${id}"]`);
    if (row) row.classList.toggle('seen', now);
    if (rowBtn) {
      rowBtn.classList.toggle('seen', now);
      rowBtn.innerHTML = now ? checkIcon() : circleIcon();
      rowBtn.setAttribute('aria-pressed', now);
    }
    updateCounter(screenEl);
  });
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

const REGION_TAG_LABELS = {
  stedelijk:'Stedelijk', agrarisch:'Agrarisch', bos:'Bos',
  heide:'Heide', duinen:'Duinen', kust:'Kust', wad:'Wad',
  polder:'Polder', rivierengebied:'Rivierengebied',
  moeras:'Moeras', rietland:'Rietland', zee:'Zee', struweel:'Struweel',
};
function regionTagLabel(tag) {
  return REGION_TAG_LABELS[tag] || tag;
}
