/**
 * Waarneming toevoegen — bottom sheet (Stap 5)
 *
 * Formuliervelden:
 *   - Soort (verplicht, via speciesPicker)
 *   - Datum (verplicht, default vandaag)
 *   - Locatie: naam (vrij) + GPS-coördinaten (optioneel)
 *   - Notitie
 *   - Foto's / video's (meerdere, opgeslagen als blob in IndexedDB)
 *
 * Na opslaan:
 *   - sighting → localStorage via addSighting()
 *   - mediabestanden → IndexedDB via savePhoto()
 *   - soort → gemarkeerd als gezien via toggleSeen()
 *   - onSaved(sighting) callback
 */

import { SPECIES, toggleSeen }      from '../../data/species.js';
import { addSighting }              from '../../data/sightings.js';
import { savePhoto, getPhoto }      from '../../data/db.js';
import { openSpeciesPicker }   from './speciesPicker.js';
import { escHtml }             from '../../utils/html.js';
import { showToast }           from '../../app.js';

// ── State ──────────────────────────────────────────────────
let _state = null;

function freshState() {
  return {
    speciesId:    null,
    speciesName:  '',
    date:         isoToday(),
    locationName: '',
    lat:          null,
    lon:          null,
    notes:        '',
    mediaFiles:   [],   // Array van { tempId, file, objectUrl }
  };
}

// ── Publieke functie ───────────────────────────────────────
/**
 * @param {{ onSaved?: function(sighting): void }} options
 */
export function openAddSheet({ onSaved } = {}) {
  _state = freshState();

  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.id = 'addSightingSheet';

  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Nieuwe waarneming">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <span class="sheet__title">Nieuwe waarneming</span>
        <button class="btn-close" id="addSheetCancel">Annuleer</button>
      </div>
      <div class="sheet__content" id="addSheetContent">
        ${renderFormBody()}
      </div>
      <div class="sheet__footer">
        <button class="btn-primary" id="addSheetSubmit">Opslaan</button>
      </div>
    </div>`;

  // Verborgen file-input (buiten sheet zodat hij niet meegescrold wordt)
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'sightingMediaInput';
  fileInput.accept = 'image/*,video/*';
  fileInput.multiple = true;
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.querySelector('.sheet').classList.add('open'));

  const close = () => {
    ov.querySelector('.sheet').classList.remove('open');
    setTimeout(() => { ov.remove(); fileInput.remove(); }, 300);
    _releaseObjectUrls();
  };

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('.sheet__handle').addEventListener('click', close);
  ov.querySelector('#addSheetCancel').addEventListener('click', close);

  bindFormEvents(ov, fileInput, close, onSaved);
}

// ── Form body HTML ─────────────────────────────────────────
function renderFormBody() {
  const sp = _state.speciesId ? SPECIES.find(x => x.id === _state.speciesId) : null;

  return `
    <!-- Soort -->
    <div class="form-field">
      <label class="form-label">Soort <span style="color:var(--danger)">*</span></label>
      <button class="species-picker-btn" id="speciesPickerBtn" type="button">
        <div class="species-picker-btn__icon">${sp ? sp.icon : svgBird()}</div>
        <div class="species-picker-btn__text">
          ${sp
            ? `<span class="species-picker-btn__name">${escHtml(sp.nameNL)}</span>
               <span class="species-picker-btn__sci">${escHtml(sp.nameSci)}</span>`
            : `<span class="species-picker-btn__placeholder">Kies een soort…</span>`}
        </div>
        ${svgChevronRight()}
      </button>
    </div>

    <!-- Datum -->
    <div class="form-field">
      <label class="form-label" for="sightDate">Datum <span style="color:var(--danger)">*</span></label>
      <div class="form-row">
        <input type="date" id="sightDate" class="form-input"
          value="${escHtml(_state.date)}" max="${isoToday()}">
        <button class="form-btn-secondary" id="sightDateToday" type="button">Vandaag</button>
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
          ${svgGps()}GPS
        </button>
      </div>
      <div class="form-hint" id="coordsHint">
        ${_state.lat ? `📍 ${_state.lat.toFixed(5)}, ${_state.lon.toFixed(5)}` : ''}
      </div>
    </div>

    <!-- Notitie -->
    <div class="form-field">
      <label class="form-label" for="sightNotes">Notitie</label>
      <textarea id="sightNotes" class="form-textarea"
        placeholder="Gedrag, aantal, bijzonderheden…">${escHtml(_state.notes)}</textarea>
    </div>

    <!-- Media -->
    <div class="form-field" style="padding-bottom:var(--space-8)">
      <label class="form-label">Foto's &amp; video's</label>
      <div class="media-attach-row" id="mediaAttachRow">
        ${_state.mediaFiles.map(m => renderMediaThumb(m)).join('')}
        <button class="media-add-btn" id="mediaAddBtn" type="button" aria-label="Bestand toevoegen">
          ${svgPlus()}
        </button>
      </div>
    </div>`;
}

function renderMediaThumb(m) {
  const isVideo = m.file.type.startsWith('video/');
  return `
    <div class="media-thumb" data-tempid="${m.tempId}">
      ${isVideo
        ? `<video src="${escHtml(m.objectUrl)}" class="media-thumb__img" muted playsinline></video>
           <div class="media-thumb__badge">▶</div>`
        : `<img src="${escHtml(m.objectUrl)}" class="media-thumb__img" alt="">`}
      <button class="media-thumb__del" data-tempid="${m.tempId}" aria-label="Verwijder">
        ${svgClose()}
      </button>
    </div>`;
}

// ── Events ─────────────────────────────────────────────────
function bindFormEvents(ov, fileInput, close, onSaved) {
  const content = () => ov.querySelector('#addSheetContent');

  const refresh = () => {
    const el = content();
    if (el) { el.innerHTML = renderFormBody(); bindFormEvents(ov, fileInput, close, onSaved); }
  };

  // Soort
  content()?.querySelector('#speciesPickerBtn')?.addEventListener('click', () => {
    openSpeciesPicker(sp => {
      _state.speciesId   = sp.id;
      _state.speciesName = sp.nameNL;
      refresh();
    });
  });

  // Datum
  content()?.querySelector('#sightDate')?.addEventListener('change', e => {
    _state.date = e.target.value;
  });
  content()?.querySelector('#sightDateToday')?.addEventListener('click', () => {
    _state.date = isoToday();
    const inp = content()?.querySelector('#sightDate');
    if (inp) inp.value = _state.date;
  });

  // Locatie tekst
  content()?.querySelector('#sightLocation')?.addEventListener('input', e => {
    _state.locationName = e.target.value;
  });

  // GPS
  content()?.querySelector('#sightGpsBtn')?.addEventListener('click', () => requestGPS(ov));

  // Notitie
  content()?.querySelector('#sightNotes')?.addEventListener('input', e => {
    _state.notes = e.target.value;
  });

  // Media: open file picker
  content()?.querySelector('#mediaAddBtn')?.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });
  fileInput.addEventListener('change', async () => {
    for (const file of fileInput.files) {
      const tempId    = uid();
      const objectUrl = URL.createObjectURL(file);
      _state.mediaFiles.push({ tempId, file, objectUrl });
    }
    refresh();
  }, { once: true }); // new listener each time via once

  // Media: verwijder
  content()?.querySelector('#mediaAttachRow')?.addEventListener('click', e => {
    const delBtn = e.target.closest('.media-thumb__del');
    if (!delBtn) return;
    const id = delBtn.dataset.tempid;
    const m  = _state.mediaFiles.find(x => x.tempId === id);
    if (m) URL.revokeObjectURL(m.objectUrl);
    _state.mediaFiles = _state.mediaFiles.filter(x => x.tempId !== id);
    refresh();
  });

  // Submit
  ov.querySelector('#addSheetSubmit')?.addEventListener('click', () => submitForm(ov, close, onSaved));
}

// ── Opslaan ────────────────────────────────────────────────
async function submitForm(ov, close, onSaved) {
  if (!_state.speciesId) { showToast('Kies eerst een soort'); return; }
  if (!_state.date)      { showToast('Vul een datum in');    return; }

  const btn = ov.querySelector('#addSheetSubmit');
  btn.disabled = true;
  btn.textContent = 'Opslaan…';

  try {
    // 1. Media opslaan in IndexedDB
    const photoIds = [];
    for (const m of _state.mediaFiles) {
      const buf = await m.file.arrayBuffer();
      const id  = uid();
      await savePhoto({
        id,
        dataUrl:     null,            // blob-first: geen dataUrl nodig
        blob:        new Blob([buf], { type: m.file.type }),
        type:        m.file.type,
        filename:    m.file.name,
        speciesId:   _state.speciesId,
        speciesName: _state.speciesName,
        sightingId:  null,            // wordt hieronder ingevuld
        addedAt:     new Date().toISOString(),
      });
      photoIds.push(id);
    }

    // 2. Waarneming aanmaken
    const now = new Date().toISOString();
    const sighting = {
      id:           uid(),
      speciesId:    _state.speciesId,
      speciesName:  _state.speciesName,
      date:         _state.date,
      lat:          _state.lat,
      lon:          _state.lon,
      locationName: _state.locationName || null,
      notes:        _state.notes        || null,
      photoIds,
      createdAt:    now,
      updatedAt:    now,
    };
    await addSighting(sighting);

    // 3. Koppel sightingId terug aan opgeslagen foto's
    for (const id of photoIds) {
      try {
        const existing = await getPhoto(id);
        if (existing) {
          await savePhoto({ ...existing, sightingId: sighting.id });
        }
      } catch (patchErr) {
        console.warn('[addSheet] sightingId patch mislukt voor foto', id, patchErr);
      }
    }

    // 4. Soort als gezien markeren
    toggleSeen(_state.speciesId);

    // 5. Afsluiten
    close();
    showToast(`${sighting.speciesName} opgeslagen`);
    onSaved?.(sighting);

  } catch (err) {
    console.error('[addSheet] save error', err);
    btn.disabled    = false;
    btn.textContent = 'Opslaan';
    showToast('Opslaan mislukt — probeer opnieuw');
  }
}

// ── GPS ────────────────────────────────────────────────────
function requestGPS(ov) {
  if (!navigator.geolocation) { showToast('GPS niet beschikbaar'); return; }
  const btn  = ov.querySelector('#sightGpsBtn');
  const hint = ov.querySelector('#coordsHint');
  if (!btn) return;
  btn.classList.add('gps-btn--loading');
  btn.innerHTML = svgSpinner() + ' GPS';

  navigator.geolocation.getCurrentPosition(
    pos => {
      _state.lat = pos.coords.latitude;
      _state.lon = pos.coords.longitude;
      btn.classList.remove('gps-btn--loading');
      btn.classList.add('gps-btn--active');
      btn.innerHTML = svgGps() + ' GPS';
      if (hint) hint.textContent = `📍 ${_state.lat.toFixed(5)}, ${_state.lon.toFixed(5)}`;
    },
    () => {
      btn.classList.remove('gps-btn--loading');
      btn.innerHTML = svgGps() + ' GPS';
      showToast('GPS niet beschikbaar — vul locatie handmatig in');
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ── Cleanup ────────────────────────────────────────────────
function _releaseObjectUrls() {
  _state?.mediaFiles.forEach(m => { try { URL.revokeObjectURL(m.objectUrl); } catch (_) {} });
}

// ── Helpers ────────────────────────────────────────────────
function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// SVG micro-helpers
function svgBird() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    style="width:20px;height:20px;color:var(--muted)">
    <path d="M4 20 Q8 12 14 13 Q18 10 22 7 Q20 15 14 16 Q10 17 8 22Z"/>
  </svg>`;
}
function svgChevronRight() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:18px;height:18px;color:var(--muted);flex-shrink:0">
    <polyline points="9 18 15 12 9 6"/>
  </svg>`;
}
function svgGps() {
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
function svgPlus() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:22px;height:22px">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`;
}
function svgClose() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
    style="width:11px;height:11px">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
}
function svgSpinner() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:14px;height:14px;animation:spin .8s linear infinite">
    <circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10"/>
  </svg>`;
}
