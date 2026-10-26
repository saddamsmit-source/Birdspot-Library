/**
 * Waarneming toevoegen / bewerken — bottom sheet (Fase D)
 *
 * Exporteert:
 *   openAddSheet({ onSaved })         — nieuwe waarneming
 *   openEditSheet(sighting, { onSaved }) — bestaande waarneming bewerken
 *
 * Intern gedeeld via _openSightingForm(mode, initial, { onSaved })
 *
 * Formuliervelden (v2):
 *   - Soort          (verplicht, via speciesPicker)
 *   - Datum          (verplicht, default vandaag)
 *   - Tijd           (optioneel, HH:MM)
 *   - Locatie naam   (vrij tekst)
 *   - GPS-coördinaten (optioneel)
 *   - Aantal         (min 1, default 1)
 *   - Zekerheid      (zeker / waarschijnlijk / mogelijk)
 *   - Habitat        (chip-select: bos / water / wei / stad / kust / anders)
 *   - Gedrag         (chip-select: zingend / foeragerend / vliegend / rustend / anders)
 *   - Weer           (chip-select: zonnig / bewolkt / regen / wind / mist)
 *   - Notities       (vrije tekst)
 *   - Foto's & video's (meerdere, IDB blob)
 *
 * Data-integriteit:
 *   - Blob URLs worden uitsluitend in _state bijgehouden
 *   - _releaseObjectUrls() wordt aangeroepen bij sluiten (ook bij cancel)
 *   - IDB savePhoto() lifecycle: nieuw bij add, patch sightingId na save
 *   - Edit: bestaande photoIds behouden; nieuwe media toegevoegd via IDB
 *   - Stale-context guard: ctx.destroyed check na elke await
 */

import { SPECIES, toggleSeen }   from '../../data/species.js';
import { addSighting, updateSighting } from '../../data/sightings.js';
import { savePhoto, getPhoto, deletePhoto } from '../../data/db.js';
import { openSpeciesPicker }     from './speciesPicker.js';
import { escHtml }               from '../../utils/html.js';
import { showToast }             from '../../app.js';

// ── Constants ──────────────────────────────────────────────
const HABITATS  = ['bos', 'water', 'wei', 'stad', 'kust', 'anders'];
const BEHAVIORS = ['zingend', 'foeragerend', 'vliegend', 'rustend', 'anders'];
const WEATHERS  = ['zonnig', 'bewolkt', 'regen', 'wind', 'mist'];

const CERTAINTY_LABELS = {
  certain:  'Zeker',
  probable: 'Waarschijnlijk',
  possible: 'Mogelijk',
};

// ── State ──────────────────────────────────────────────────
let _state = null;

function freshState(override = {}) {
  return {
    speciesId:    null,
    speciesName:  '',
    date:         isoToday(),
    time:         '',
    count:        1,
    certainty:    'certain',
    locationName: '',
    lat:          null,
    lon:          null,
    habitat:      null,
    behavior:     null,
    weather:      null,
    notes:        '',
    // mediaFiles: nieuw toegevoegde bestanden (File objects + object URLs)
    mediaFiles:   [],   // { tempId, file, objectUrl }
    // existingPhotoIds: al opgeslagen foto-IDs (bij edit mode)
    existingPhotoIds: [],
    // deletedPhotoIds: IDs te verwijderen uit IDB bij save
    deletedPhotoIds: [],
    ...override,
  };
}

// ── Publieke API ───────────────────────────────────────────
/**
 * @param {{ onSaved?: function(sighting): void }} options
 */
export function openAddSheet({ onSaved } = {}) {
  _openSightingForm('add', freshState(), { onSaved });
}

/**
 * @param {Object} sighting  — bestaand sighting-object (v2)
 * @param {{ onSaved?: function(sighting): void }} options
 */
export function openEditSheet(sighting, { onSaved } = {}) {
  _openSightingForm('edit', freshState({
    speciesId:        sighting.speciesId,
    speciesName:      sighting.speciesName,
    date:             sighting.date         || isoToday(),
    time:             sighting.time         || '',
    count:            sighting.count        ?? 1,
    certainty:        sighting.certainty    || 'certain',
    locationName:     sighting.locationName || '',
    lat:              sighting.lat          ?? null,
    lon:              sighting.lon          ?? null,
    habitat:          sighting.habitat      || null,
    behavior:         sighting.behavior     || null,
    weather:          sighting.weather      || null,
    notes:            sighting.notes        || '',
    existingPhotoIds: Array.isArray(sighting.photoIds) ? [...sighting.photoIds] : [],
  }), { onSaved, editId: sighting.id });
}

// ── Interne implementatie ─────────────────────────────────
function _openSightingForm(mode, initialState, { onSaved, editId } = {}) {
  _state = initialState;

  const isEdit  = mode === 'edit';
  const title   = isEdit ? 'Waarneming bewerken' : 'Nieuwe waarneming';
  const saveLbl = isEdit ? 'Opslaan'             : 'Opslaan';

  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.id = 'addSightingSheet';

  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${escHtml(title)}">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <span class="sheet__title">${escHtml(title)}</span>
        <button class="btn-close" id="addSheetCancel" type="button">Annuleer</button>
      </div>
      <div class="sheet__content" id="addSheetContent">
        ${_renderFormBody()}
      </div>
      <div class="sheet__footer">
        <button class="btn-primary" id="addSheetSubmit" type="button">${escHtml(saveLbl)}</button>
      </div>
    </div>`;

  // Verborgen file-input buiten sheet (scrollt niet mee)
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'sightingMediaInput';
  fileInput.accept = 'image/*,video/*';
  fileInput.multiple = true;
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.querySelector('.sheet').classList.add('open'));

  const ctx = { destroyed: false };

  const close = () => {
    ctx.destroyed = true;
    ov.querySelector('.sheet').classList.remove('open');
    setTimeout(() => { ov.remove(); fileInput.remove(); }, 300);
    _releaseObjectUrls();
  };

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('.sheet__handle').addEventListener('click', close);
  ov.querySelector('#addSheetCancel').addEventListener('click', close);

  _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx });
}

// ── Form body HTML ─────────────────────────────────────────
function _renderFormBody() {
  const sp = _state.speciesId ? SPECIES.find(x => x.id === _state.speciesId) : null;

  return `
    <!-- Soort -->
    <div class="form-field">
      <label class="form-label">Soort <span class="form-required">*</span></label>
      <button class="species-picker-btn" id="speciesPickerBtn" type="button">
        <div class="species-picker-btn__icon">${sp ? sp.icon : _svgBird()}</div>
        <div class="species-picker-btn__text">
          ${sp
            ? `<span class="species-picker-btn__name">${escHtml(sp.nameNL)}</span>
               <span class="species-picker-btn__sci">${escHtml(sp.nameSci)}</span>`
            : `<span class="species-picker-btn__placeholder">Kies een soort…</span>`}
        </div>
        ${_svgChevronRight()}
      </button>
    </div>

    <!-- Datum + Tijd -->
    <div class="form-field">
      <label class="form-label">Datum &amp; tijd <span class="form-required">*</span></label>
      <div class="form-row">
        <input type="date" id="sightDate" class="form-input"
          value="${escHtml(_state.date)}" max="${isoToday()}">
        <button class="form-btn-secondary" id="sightDateToday" type="button">Vandaag</button>
      </div>
      <div class="form-row form-row--narrow" style="margin-top:var(--space-2)">
        <input type="time" id="sightTime" class="form-input form-input--time"
          value="${escHtml(_state.time || '')}" placeholder="--:--">
        <span class="form-hint-inline">optioneel</span>
      </div>
    </div>

    <!-- Locatie -->
    <div class="form-field">
      <label class="form-label" for="sightLocation">Locatie</label>
      <div class="form-row">
        <input type="text" id="sightLocation" class="form-input"
          placeholder="bijv. Nationaal Park De Hoge Veluwe"
          value="${escHtml(_state.locationName)}">
        <button class="form-btn-secondary gps-btn${_state.lat ? ' gps-btn--active' : ''}"
          id="sightGpsBtn" type="button">
          ${_svgGps()}GPS
        </button>
      </div>
      <div class="form-hint" id="coordsHint">
        ${_state.lat ? `📍 ${_state.lat.toFixed(5)}, ${_state.lon.toFixed(5)}` : ''}
      </div>
    </div>

    <!-- Aantal + Zekerheid (naast elkaar) -->
    <div class="form-row form-row--fields">
      <div class="form-field form-field--half">
        <label class="form-label" for="sightCount">Aantal</label>
        <input type="number" id="sightCount" class="form-input form-input--count"
          min="1" step="1" value="${_state.count ?? 1}">
      </div>
      <div class="form-field form-field--half">
        <label class="form-label">Zekerheid</label>
        <div class="certainty-group" id="certaintyGroup">
          ${['certain', 'probable', 'possible'].map(v => `
            <label class="certainty-option${_state.certainty === v ? ' certainty-option--active' : ''}">
              <input type="radio" name="certainty" value="${v}"
                ${_state.certainty === v ? 'checked' : ''}>
              ${escHtml(CERTAINTY_LABELS[v])}
            </label>`).join('')}
        </div>
      </div>
    </div>

    <!-- Habitat -->
    <div class="form-field">
      <label class="form-label">Habitat</label>
      <div class="chip-row" id="habitatChips">
        ${HABITATS.map(h => `
          <button type="button" class="chip${_state.habitat === h ? ' chip--active' : ''}"
            data-group="habitat" data-value="${h}">
            ${escHtml(h.charAt(0).toUpperCase() + h.slice(1))}
          </button>`).join('')}
      </div>
    </div>

    <!-- Gedrag -->
    <div class="form-field">
      <label class="form-label">Gedrag</label>
      <div class="chip-row" id="behaviorChips">
        ${BEHAVIORS.map(b => `
          <button type="button" class="chip${_state.behavior === b ? ' chip--active' : ''}"
            data-group="behavior" data-value="${b}">
            ${escHtml(b.charAt(0).toUpperCase() + b.slice(1))}
          </button>`).join('')}
      </div>
    </div>

    <!-- Weer -->
    <div class="form-field">
      <label class="form-label">Weer</label>
      <div class="chip-row" id="weatherChips">
        ${WEATHERS.map(w => `
          <button type="button" class="chip${_state.weather === w ? ' chip--active' : ''}"
            data-group="weather" data-value="${w}">
            ${escHtml(w.charAt(0).toUpperCase() + w.slice(1))}
          </button>`).join('')}
      </div>
    </div>

    <!-- Notitie -->
    <div class="form-field">
      <label class="form-label" for="sightNotes">Notitie</label>
      <textarea id="sightNotes" class="form-textarea"
        placeholder="Bijzonderheden, vluchtnummer, sociaal gedrag…">${escHtml(_state.notes)}</textarea>
    </div>

    <!-- Media -->
    <div class="form-field" style="padding-bottom:var(--space-8)">
      <label class="form-label">Foto's &amp; video's</label>
      <div class="media-attach-row" id="mediaAttachRow">
        ${_state.existingPhotoIds.map(id => _renderExistingThumb(id)).join('')}
        ${_state.mediaFiles.map(m => _renderNewThumb(m)).join('')}
        <button class="media-add-btn" id="mediaAddBtn" type="button" aria-label="Bestand toevoegen">
          ${_svgPlus()}
        </button>
      </div>
    </div>`;
}

function _renderExistingThumb(photoId) {
  return `
    <div class="media-thumb media-thumb--existing" data-photoid="${photoId}">
      <img class="media-thumb__img" data-lazy-idb="${photoId}" alt="">
      <button class="media-thumb__del" data-photoid="${photoId}"
        aria-label="Verwijder foto">
        ${_svgClose()}
      </button>
    </div>`;
}

function _renderNewThumb(m) {
  const isVideo = m.file.type.startsWith('video/');
  return `
    <div class="media-thumb" data-tempid="${m.tempId}">
      ${isVideo
        ? `<video src="${escHtml(m.objectUrl)}" class="media-thumb__img" muted playsinline></video>
           <div class="media-thumb__badge">▶</div>`
        : `<img src="${escHtml(m.objectUrl)}" class="media-thumb__img" alt="">`}
      <button class="media-thumb__del" data-tempid="${m.tempId}" aria-label="Verwijder">
        ${_svgClose()}
      </button>
    </div>`;
}

// ── Events ─────────────────────────────────────────────────
function _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx }) {
  const content = () => ov.querySelector('#addSheetContent');

  const refresh = () => {
    const el = content();
    if (!el || ctx.destroyed) return;
    el.innerHTML = _renderFormBody();
    _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx });
    // Laad bestaande thumbnails async (geen await op toplevel)
    _loadExistingThumbs(el);
  };

  const el = content();
  if (!el) return;

  // Laad bestaande thumbnails bij eerste render
  _loadExistingThumbs(el);

  // Soort
  el.querySelector('#speciesPickerBtn')?.addEventListener('click', () => {
    openSpeciesPicker(sp => {
      _state.speciesId   = sp.id;
      _state.speciesName = sp.nameNL;
      refresh();
    });
  });

  // Datum
  el.querySelector('#sightDate')?.addEventListener('change', e => {
    _state.date = e.target.value;
  });
  el.querySelector('#sightDateToday')?.addEventListener('click', () => {
    _state.date = isoToday();
    const inp = el.querySelector('#sightDate');
    if (inp) inp.value = _state.date;
  });

  // Tijd
  el.querySelector('#sightTime')?.addEventListener('change', e => {
    _state.time = e.target.value || null;
  });

  // Locatie tekst
  el.querySelector('#sightLocation')?.addEventListener('input', e => {
    _state.locationName = e.target.value;
  });

  // GPS
  el.querySelector('#sightGpsBtn')?.addEventListener('click', () => _requestGPS(ov));

  // Aantal
  el.querySelector('#sightCount')?.addEventListener('input', e => {
    const v = parseInt(e.target.value, 10);
    _state.count = isNaN(v) || v < 1 ? 1 : v;
  });

  // Zekerheid (radio)
  el.querySelector('#certaintyGroup')?.addEventListener('change', e => {
    if (e.target.name === 'certainty') {
      _state.certainty = e.target.value;
      // Update visueel actief zonder volledige re-render
      el.querySelectorAll('.certainty-option').forEach(lbl => {
        lbl.classList.toggle('certainty-option--active',
          lbl.querySelector('input')?.value === _state.certainty);
      });
    }
  });

  // Chips: habitat, gedrag, weer
  el.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const val   = btn.dataset.value;
      // Toggle: klikken op actieve chip de-selecteert
      if (_state[group] === val) {
        _state[group] = null;
        btn.classList.remove('chip--active');
      } else {
        // Deactiveer andere chips in deze groep
        const groupEl = btn.closest('.chip-row');
        groupEl?.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
        _state[group] = val;
        btn.classList.add('chip--active');
      }
    });
  });

  // Notitie
  el.querySelector('#sightNotes')?.addEventListener('input', e => {
    _state.notes = e.target.value;
  });

  // Media: open file picker
  el.querySelector('#mediaAddBtn')?.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  // Gebruik { once: true } om herhaalde bindings te voorkomen
  const onFileChange = async () => {
    if (ctx.destroyed) return;
    for (const file of fileInput.files) {
      const tempId    = _uid();
      const objectUrl = URL.createObjectURL(file);
      _state.mediaFiles.push({ tempId, file, objectUrl });
    }
    refresh();
  };
  fileInput.addEventListener('change', onFileChange, { once: true });

  // Media: verwijder nieuw bestand
  el.querySelector('#mediaAttachRow')?.addEventListener('click', e => {
    // Nieuw bestand verwijderen
    const delNew = e.target.closest('[data-tempid].media-thumb__del, .media-thumb__del[data-tempid]');
    const delBtn = e.target.closest('.media-thumb__del');
    if (!delBtn) return;

    const tempId  = delBtn.dataset.tempid;
    const photoId = delBtn.dataset.photoid;

    if (tempId) {
      // Nieuw toegevoegd bestand: revoke + uit state
      const m = _state.mediaFiles.find(x => x.tempId === tempId);
      if (m) URL.revokeObjectURL(m.objectUrl);
      _state.mediaFiles = _state.mediaFiles.filter(x => x.tempId !== tempId);
      refresh();
    } else if (photoId) {
      // Bestaand IDB-bestand: markeer voor verwijdering
      _state.existingPhotoIds  = _state.existingPhotoIds.filter(x => x !== photoId);
      _state.deletedPhotoIds.push(photoId);
      refresh();
    }
  });

  // Submit
  ov.querySelector('#addSheetSubmit')?.addEventListener('click', () => {
    _submitForm(ov, close, onSaved, { isEdit, editId, ctx });
  });
}

// ── Lazy-load IDB thumbnails ───────────────────────────────
async function _loadExistingThumbs(containerEl) {
  const imgs = containerEl.querySelectorAll('img[data-lazy-idb]');
  for (const img of imgs) {
    const id = img.dataset.lazyIdb;
    if (!id) continue;
    try {
      const record = await getPhoto(id);
      if (!record) continue;
      const blob    = record.blob instanceof Blob ? record.blob
                    : new Blob([record.blob], { type: record.type });
      const objUrl  = URL.createObjectURL(blob);
      img.src = objUrl;
      // Revoke na laden om geheugen vrij te geven
      img.onload  = () => URL.revokeObjectURL(objUrl);
      img.onerror = () => URL.revokeObjectURL(objUrl);
    } catch (_) { /* foto niet gevonden, laat thumbnail leeg */ }
  }
}

// ── Opslaan ────────────────────────────────────────────────
async function _submitForm(ov, close, onSaved, { isEdit, editId, ctx }) {
  if (!_state.speciesId) { showToast('Kies eerst een soort'); return; }
  if (!_state.date)      { showToast('Vul een datum in');    return; }

  const btn = ov.querySelector('#addSheetSubmit');
  if (!btn || btn.disabled) return;   // guard: voorkomt dubbele submit
  btn.disabled = true;
  btn.textContent = 'Opslaan…';

  try {
    // 1. Verwijder gemarkeerde IDB-foto's (alleen bij edit)
    if (isEdit && _state.deletedPhotoIds.length > 0) {
      for (const id of _state.deletedPhotoIds) {
        try { await deletePhoto(id); } catch (_) {}
      }
    }

    // 2. Nieuwe media opslaan in IndexedDB
    const newPhotoIds = [];
    for (const m of _state.mediaFiles) {
      if (ctx.destroyed) return;
      const buf = await m.file.arrayBuffer();
      const id  = _uid();
      await savePhoto({
        id,
        dataUrl:     null,
        blob:        new Blob([buf], { type: m.file.type }),
        type:        m.file.type,
        filename:    m.file.name,
        speciesId:   _state.speciesId,
        speciesName: _state.speciesName,
        sightingId:  null,      // wordt later gepatcht
        addedAt:     new Date().toISOString(),
      });
      newPhotoIds.push(id);
    }

    if (ctx.destroyed) return;

    // 3. Stel alle photoIds samen
    const allPhotoIds = [..._state.existingPhotoIds, ...newPhotoIds];

    // 4a. Maak nieuw sighting-object (add) of patch bestaand (edit)
    const now = new Date().toISOString();
    let savedSighting;

    const sightingData = {
      speciesId:    _state.speciesId,
      speciesName:  _state.speciesName,
      date:         _state.date,
      time:         _state.time   || null,
      count:        _state.count  ?? 1,
      certainty:    _state.certainty || 'certain',
      lat:          _state.lat,
      lon:          _state.lon,
      locationName: _state.locationName || null,
      habitat:      _state.habitat      || null,
      behavior:     _state.behavior     || null,
      weather:      _state.weather      || null,
      notes:        _state.notes        || null,
      photoIds:     allPhotoIds,
    };

    if (isEdit) {
      savedSighting = await updateSighting(editId, sightingData);
    } else {
      const full = {
        id:        _uid(),
        ...sightingData,
        createdAt: now,
        updatedAt: now,
      };
      savedSighting = await addSighting(full);
    }

    if (ctx.destroyed) return;

    // 4b. Patch sightingId terug in nieuwe IDB-foto's
    for (const id of newPhotoIds) {
      try {
        const existing = await getPhoto(id);
        if (existing) await savePhoto({ ...existing, sightingId: savedSighting.id });
      } catch (_) {}
    }

    // 5. Soort als gezien markeren (idempotent)
    toggleSeen(_state.speciesId);

    // 6. Afsluiten
    close();
    const label = isEdit ? 'Waarneming bijgewerkt' : `${savedSighting.speciesName} opgeslagen`;
    showToast(label);
    onSaved?.(savedSighting);

  } catch (err) {
    console.error('[sightingForm] save error', err);
    if (!ctx.destroyed) {
      btn.disabled    = false;
      btn.textContent = 'Opslaan';
      showToast('Opslaan mislukt — probeer opnieuw');
    }
  }
}

// ── GPS ────────────────────────────────────────────────────
function _requestGPS(ov) {
  if (!navigator.geolocation) { showToast('GPS niet beschikbaar'); return; }
  const btn  = ov.querySelector('#sightGpsBtn');
  const hint = ov.querySelector('#coordsHint');
  if (!btn) return;
  btn.classList.add('gps-btn--loading');
  btn.innerHTML = _svgSpinner() + ' GPS';

  navigator.geolocation.getCurrentPosition(
    pos => {
      _state.lat = pos.coords.latitude;
      _state.lon = pos.coords.longitude;
      btn.classList.remove('gps-btn--loading');
      btn.classList.add('gps-btn--active');
      btn.innerHTML = _svgGps() + ' GPS';
      if (hint) hint.textContent = `📍 ${_state.lat.toFixed(5)}, ${_state.lon.toFixed(5)}`;
    },
    () => {
      btn.classList.remove('gps-btn--loading');
      btn.innerHTML = _svgGps() + ' GPS';
      showToast('GPS niet beschikbaar — vul locatie handmatig in');
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ── Cleanup ────────────────────────────────────────────────
function _releaseObjectUrls() {
  _state?.mediaFiles.forEach(m => {
    try { URL.revokeObjectURL(m.objectUrl); } catch (_) {}
  });
}

// ── Helpers ────────────────────────────────────────────────
function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function _uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── SVG micro-helpers ──────────────────────────────────────
function _svgBird() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    style="width:20px;height:20px;color:var(--muted)">
    <path d="M4 20 Q8 12 14 13 Q18 10 22 7 Q20 15 14 16 Q10 17 8 22Z"/>
  </svg>`;
}
function _svgChevronRight() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:18px;height:18px;color:var(--muted);flex-shrink:0">
    <polyline points="9 18 15 12 9 6"/>
  </svg>`;
}
function _svgGps() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:14px;height:14px">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
  </svg>`;
}
function _svgPlus() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:22px;height:22px">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`;
}
function _svgClose() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
    style="width:11px;height:11px">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
}
function _svgSpinner() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:14px;height:14px;animation:spin .8s linear infinite">
    <circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10"/>
  </svg>`;
}
