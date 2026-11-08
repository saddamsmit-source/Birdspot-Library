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

import { SPECIES } from '../../data/species.js';
import { openPinPicker } from './pinPicker.js';
import { normalizeEvidence, validPin, OBSERVATION_METHODS, BREEDING_BEHAVIORS } from './evidence.js';
import { addSighting, updateSighting } from '../../data/sightings.js';
import { loadPlaces, addPlace, savePlaces } from '../../data/places.js';
import { askPlaceReuse } from '../map/placePrompt.js';
import { changePhotos, getPhoto } from '../../data/db.js';
import { openMediaPreview } from '../../utils/validateMedia.js';
import { openSpeciesPicker }     from './speciesPicker.js';
import { escHtml }               from '../../utils/html.js';
import { showToast }             from '../../app.js';

// ── Constants ──────────────────────────────────────────────
const HABITATS  = ['bos', 'water', 'wei', 'stad', 'kust', 'anders'];
const BEHAVIORS = ['zingend', 'foeragerend', 'vliegend', 'rustend', ...BREEDING_BEHAVIORS, 'anders'];
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
    observationMethod:'seen',
    identificationSource:'self',
    merlinVerification:null,
    locationName: '',
    lat:          null,
    lon:          null,
    placeId:      null,   // K4: vaste plek; null = bij opslaan nieuwe plek als er een pin is
    pinAccuracyM: null,   // K2: nauwkeurigheid van de pin in meters (kaartzoom of GPS); null = onbekend
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
export function openAddSheet({ onSaved, initial = {} } = {}) {
  const hasPin = validPin(initial.lat,initial.lon);
  const species = typeof initial.speciesId === 'string'
    ? SPECIES.find(x=>x.id===initial.speciesId) : null;
  const selectedMethod = ['seen','heard','both'].includes(initial.observationMethod)
    ? initial.observationMethod : 'seen';
  const source = initial.identificationSource==='merlin' && selectedMethod!=='seen'
    ? 'merlin' : 'self';
  _openSightingForm('add', freshState({
    speciesId: species?.id ?? null,
    speciesName: species?.nameNL ?? '',
    observationMethod:selectedMethod,
    identificationSource:source,
    merlinVerification:source==='merlin'?'suggested':null,
    certainty:source==='merlin'?'possible':'certain',
    lat: hasPin ? Number(initial.lat) : null,
    lon: hasPin ? Number(initial.lon) : null,
    placeId: hasPin && typeof initial.placeId === 'string' ? initial.placeId : null,
    pinAccuracyM: hasPin && Number.isFinite(initial.pinAccuracyM) ? Number(initial.pinAccuracyM) : null,
    locationName: typeof initial.locationName === 'string' ? initial.locationName : '',
  }), { onSaved });
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
    observationMethod: sighting.observationMethod || null,
    identificationSource: sighting.identificationSource || null,
    merlinVerification: sighting.merlinVerification || null,
    locationName:     sighting.locationName || '',
    lat:              sighting.lat          ?? null,
    lon:              sighting.lon          ?? null,
    placeId:          sighting.placeId      || null,
    pinAccuracyM:     Number.isFinite(sighting.pinAccuracyM) ? sighting.pinAccuracyM : null,
    habitat:          sighting.habitat      || null,
    behavior:         sighting.behavior     || null,
    weather:          sighting.weather      || null,
    notes:            sighting.notes        || '',
    existingPhotoIds: Array.isArray(sighting.photoIds) ? [...sighting.photoIds] : [],
  }), { onSaved, editId: sighting.id });
}

// ── Interne implementatie ─────────────────────────────────
function _openSightingForm(mode, initialState, { onSaved, editId } = {}) {
  if (document.getElementById('addSightingSheet')) return;
  const trigger = document.activeElement;
  _state = initialState;

  const isEdit  = mode === 'edit';
  const title   = isEdit ? 'Waarneming bewerken' : 'Nieuwe waarneming';

  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.id = 'addSightingSheet';

  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${escHtml(title)}">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <span class="sheet__title" id="addSightingTitle" tabindex="-1">${escHtml(title)}</span>
        <button class="btn-close" id="addSheetCancel" type="button">Annuleer</button>
      </div>
      <div class="sheet__content" id="addSheetContent">
        ${_renderFormBody()}
      </div>
      <div class="sheet__footer">
        <p class="sighting-local-note">Bewaart op dit apparaat</p>
        <button class="btn-primary" id="addSheetSubmit" type="button">Opslaan</button>
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
  requestAnimationFrame(() => { if (ov.isConnected) ov.classList.add('open'); });

  const ctx = { destroyed: false, cancelPinPicker: null, locationRevision: 0, mediaChecking: false, detailsOpen: isEdit };
  const submit = ov.querySelector('#addSheetSubmit');
  ov.querySelector('#addSightingTitle').focus({ preventScroll: true });

  const close = () => {
    if (ctx.destroyed || ctx.saving) return;
    ctx.destroyed = true;
    ctx.cancelPinPicker?.();
    ov.classList.remove('open');
    ov.inert = true;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    document.removeEventListener('keydown', onEscape);
    setTimeout(() => { ov.remove(); fileInput.remove(); }, 300);
    _releaseObjectUrls();
    releaseExistingPreviews(ov);
  };

  const onEscape = event => {
    if (event.key !== 'Escape' || ov.inert || !ov.contains(document.activeElement)) return;
    event.preventDefault();
    close();
  };
  document.addEventListener('keydown', onEscape);
  submit.addEventListener('click', () => _submitForm(ov, close, onSaved, { isEdit, editId, ctx }));
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('.sheet__handle').addEventListener('click', close);
  ov.querySelector('#addSheetCancel').addEventListener('click', close);

  _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx });
  if (!isEdit) _offerPlace(ov, ctx);
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

    <!-- Manier van waarnemen -->
    <section class="form-field sighting-evidence-field" aria-label="Hoe heb je de vogel waargenomen?">
      <div class="form-label">Hoe waargenomen?</div>
      <div class="sighting-method-options" id="sightMethodGroup" role="group" aria-label="Gezien of gehoord">
        ${Object.entries(OBSERVATION_METHODS).map(([value,label]) =>
          `<label class="sighting-method-choice${_state.observationMethod === value ? ' is-selected' : ''}">
            <input type="radio" name="observationMethod" value="${value}" ${_state.observationMethod === value ? 'checked' : ''}>
            <span>${value === 'heard' ? '♪' : (value === 'both' ? '◉' : '◈')}</span><strong>${label}</strong>
          </label>`).join('')}
      </div>
      ${!_state.observationMethod ? '<p class="form-hint">Bij deze oudere waarneming is de manier van waarnemen niet vastgelegd. Selecteer die als je hem weet.</p>' : ''}
    </section>

    <!-- Datum + Tijd -->
    <div class="form-field">
      <label class="form-label" for="sightDate">Datum &amp; tijd <span class="form-required">*</span></label>
      <div class="form-row">
        <input type="date" id="sightDate" class="form-input"
          value="${escHtml(_state.date)}" max="${isoToday()}" required>
        <button class="form-btn-secondary" id="sightDateToday" type="button">Vandaag</button>
      </div>
      <div class="form-row form-row--narrow" style="margin-top:var(--space-2)">
        <input type="time" id="sightTime" class="form-input form-input--time" aria-label="Tijd (optioneel)"
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
        <button class="form-btn-secondary gps-btn${validPin(_state.lat,_state.lon) ? ' gps-btn--active' : ''}"
          id="sightGpsBtn" type="button">
          ${_svgGps()}GPS
        </button>
      </div>
      <div class="form-row sighting-pin-actions">
        <button class="form-btn-secondary sighting-pin-btn" id="sightPinBtn" type="button">⌖ Kies pin op kaart</button>
        ${validPin(_state.lat,_state.lon) ? '<button class="form-btn-secondary" id="sightClearPin" type="button">Verwijder pin</button>' : ''}
      </div>
      <div class="form-hint" id="coordsHint">
        ${_coordsHintText()}
      </div>
    </div>

    <!-- Media -->
    <div class="form-field sighting-media-field">
      <label class="form-label">Foto's &amp; video's</label>
      <div class="media-attach-row" id="mediaAttachRow">
        ${_renderMediaItems()}
      </div>
      <p class="form-hint" id="sightingMediaStatus" role="status"></p>
    </div>
    <details class="sighting-more" id="sightingMore">
      <summary>Meer details</summary>
    <!-- Bron van herkenning -->
    <section class="form-field sighting-source-field" aria-label="Hoe heb je de soort herkend?">
      <div class="form-label">Herkenning</div>
      <div class="sighting-source-options" id="sightSourceGroup" role="group" aria-label="Herkenningsbron">
        <label class="sighting-source-choice${_state.identificationSource === 'self' ? ' is-selected' : ''}">
          <input type="radio" name="identificationSource" value="self" ${_state.identificationSource === 'self' ? 'checked' : ''}>
          Eigen herkenning</label>
        <label class="sighting-source-choice${_state.identificationSource === 'merlin' ? ' is-selected' : ''}">
          <input type="radio" name="identificationSource" value="merlin" ${_state.identificationSource === 'merlin' ? 'checked' : ''}>
          Merlin Sound ID</label>
      </div>
      ${_state.identificationSource === 'merlin' ? `
        <div class="sighting-merlin-panel">
          <strong>♪ Merlin Sound ID</strong>
          <p>Een suggestie van Merlin is niet automatisch een bevestigde soort. Controleer de vogel zelf via het geluid, de omgeving of de soortbeschrijving.</p>
          <label class="sighting-merlin-reviewed">
            <input id="sightMerlinChecked" type="checkbox" ${_state.merlinVerification === 'checked' ? 'checked' : ''}>
            Ik heb de soort zelf gecontroleerd
          </label>
        </div>` : ''}
    </section>
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
            data-group="habitat" data-value="${h}" aria-pressed="${_state.habitat === h}">
            ${escHtml(h.charAt(0).toUpperCase() + h.slice(1))}
          </button>`).join('')}
      </div>
    </div>

    <!-- Gedrag -->
    <div class="form-field">
      <label class="form-label">Gedrag <small>optioneel</small></label>
      <div class="chip-row" id="behaviorChips">
        ${BEHAVIORS.map(b => `
          <button type="button" class="chip${_state.behavior === b ? ' chip--active' : ''}"
            data-group="behavior" data-value="${b}" aria-pressed="${_state.behavior === b}">
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
            data-group="weather" data-value="${w}" aria-pressed="${_state.weather === w}">
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

    </details>`;
}

function _renderMediaItems() {
  return `
        ${_state.existingPhotoIds.map(id => _renderExistingThumb(id)).join('')}
        ${_state.mediaFiles.map(m => _renderNewThumb(m)).join('')}
        <button class="media-add-btn" id="mediaAddBtn" type="button" aria-label="Bestand toevoegen">
          ${_svgPlus()} <span>Bestand toevoegen</span>
        </button>
  `;
}

function _renderExistingThumb(photoId) {
  return `
    <div class="media-thumb media-thumb--existing" data-photoid="${escHtml(photoId)}">
      <span class="media-thumb__placeholder" data-lazy-idb="${escHtml(photoId)}">Media laden…</span>
      <button class="media-thumb__del" data-photoid="${escHtml(photoId)}"
        aria-label="Verwijder bestand">
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

function _coordsHintText() {
  if (!validPin(_state.lat,_state.lon)) return 'Nog geen pin gekozen. Alleen een plaatsnaam opslaan mag ook.';
  const acc = Number.isFinite(_state.pinAccuracyM) ? ` · ±${_state.pinAccuracyM} m` : '';
  const place = _state.placeId ? loadPlaces().find(p => p.id === _state.placeId) : null;
  return `📍 ${Number(_state.lat).toFixed(5)}, ${Number(_state.lon).toFixed(5)}${acc}` +
    (place ? ` · Plek: ${escHtml(place.name)}` : ' · Nieuwe plek');
}

/** K4: na een nieuwe pin vragen of een bestaande plek binnen 50 m gebruikt wordt. */
async function _offerPlace(ov, ctx) {
  if (ctx.destroyed || !validPin(_state.lat,_state.lon) || _state.placeId) return;
  const revision = ctx.locationRevision;
  const res = await askPlaceReuse(_state.lat, _state.lon);
  if (ctx.destroyed || revision !== ctx.locationRevision || !res) return;
  _state.placeId = res.placeId || null;
  if (_state.placeId && !_state.locationName) {
    const place = loadPlaces().find(p => p.id === _state.placeId);
    if (place) { _state.locationName = place.name; const inp = ov.querySelector('#sightLocation'); if (inp) inp.value = place.name; }
  }
  const hint = ov.querySelector('#coordsHint');
  if (hint) hint.innerHTML = _coordsHintText();
}

// ── Events ─────────────────────────────────────────────────
function _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx }) {
  const content = () => ov.querySelector('#addSheetContent');

  const refresh = () => {
    const el = content();
    if (!el || ctx.destroyed) return;
    const active = document.activeElement;
    const activeId = el.contains(active) ? active.id : null;
    const top = el.scrollTop;
    releaseExistingPreviews(el);
    el.innerHTML = _renderFormBody();
    _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx });
    el.scrollTop = top;
    if (activeId) el.querySelector('#' + CSS.escape(activeId))?.focus({ preventScroll: true });
  };

  const el = content();
  if (!el) return;

  const details = el.querySelector('#sightingMore');
  details.open = ctx.detailsOpen || _state.identificationSource === 'merlin';
  details.addEventListener('toggle', () => { if (details.isConnected) ctx.detailsOpen = details.open; });
  const mediaStatus = el.querySelector('#sightingMediaStatus');
  mediaStatus.textContent = ctx.mediaMessage || '';

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

  // Seen / heard / both and optional Merlin Sound ID evidence.
  el.querySelector('#sightMethodGroup')?.addEventListener('change', e => {
    if(e.target.name!=='observationMethod')return;
    _state.observationMethod=e.target.value;
    // Merlin Sound ID only makes sense for an audible encounter.
    if(_state.identificationSource==='merlin'&&e.target.value==='seen'){
      _state.identificationSource='self';_state.merlinVerification=null;
    }
    refresh();
  });
  el.querySelector('#sightSourceGroup')?.addEventListener('change', e => {
    if(e.target.name!=='identificationSource')return;
    _state.identificationSource=e.target.value;
    if(e.target.value==='merlin'){
      if(_state.observationMethod==='seen'||!_state.observationMethod)_state.observationMethod='heard';
      _state.merlinVerification='suggested';
      if(_state.certainty==='certain')_state.certainty='possible';
    } else _state.merlinVerification=null;
    refresh();
  });
  el.querySelector('#sightMerlinChecked')?.addEventListener('change',e => {
    _state.merlinVerification=e.target.checked?'checked':'suggested';
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

  // Pin on map, or enter coordinates offline in the map picker.
  el.querySelector('#sightPinBtn')?.addEventListener('click',()=>{
    ctx.locationRevision++;
    _resetGPSButton(ov);
    ctx.cancelPinPicker?.();
    ctx.cancelPinPicker=openPinPicker({
      lat:_state.lat,lon:_state.lon,
      onConfirm:coords=>{
        if(ctx.destroyed)return;
        _state.lat=coords.lat;_state.lon=coords.lon;
        _state.pinAccuracyM=Number.isFinite(coords.accuracyM)?coords.accuracyM:null;
        _state.placeId=null;
        ctx.cancelPinPicker=null;refresh();_offerPlace(ov,ctx);
      },
    });
  });
  el.querySelector('#sightClearPin')?.addEventListener('click',()=>{
    ctx.locationRevision++;
    _state.lat=null;_state.lon=null;_state.pinAccuracyM=null;_state.placeId=null;refresh();
  });
  // GPS
  el.querySelector('#sightGpsBtn')?.addEventListener('click', () => _requestGPS(ov,ctx));

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
        btn.setAttribute('aria-pressed', 'false');
      } else {
        // Deactiveer andere chips in deze groep
        const groupEl = btn.closest('.chip-row');
        groupEl?.querySelectorAll('.chip').forEach(c => { c.classList.remove('chip--active'); c.setAttribute('aria-pressed', 'false'); });
        _state[group] = val;
        btn.classList.add('chip--active');
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  });

  // Notitie
  el.querySelector('#sightNotes')?.addEventListener('input', e => {
    _state.notes = e.target.value;
  });

  // Media: open file picker
  const onFileChange = async () => {
    if (ctx.destroyed || ctx.saving || ctx.mediaChecking || !fileInput.files.length) return;
    const files = [...fileInput.files];
    ctx.mediaChecking = true;
    ctx.mediaMessage = 'Bestanden controleren…';
    content().querySelector('#sightingMediaStatus').textContent = ctx.mediaMessage;
    const submit = ov.querySelector('#addSheetSubmit');
    submit.disabled = true;
    const rejected = [];
    for (const file of files) {
      const kind = file.type.split('/')[0];
      try {
        if (!['image', 'video'].includes(kind)) throw new Error('Onbekend bestandstype');
        const objectUrl = await openMediaPreview(file, kind);
        if (ctx.destroyed) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        _state.mediaFiles.push({ tempId: _uid(), file, objectUrl });
      } catch (_) {
        rejected.push(file.name);
      }
      if (ctx.destroyed) return;
    }
    ctx.mediaChecking = false;
    submit.disabled = false;
    ctx.mediaMessage = rejected.length ? 'Kan niet worden geopend: ' + rejected.join(', ') : '';
    // Gebruik de huidige DOM. De gebruiker kan tussentijds een ander veld hebben gewijzigd.
    const current = content();
    const row = current.querySelector('#mediaAttachRow');
    const restoreFocus = row.contains(document.activeElement);
    releaseExistingPreviews(row);
    row.innerHTML = _renderMediaItems();
    if (restoreFocus) row.querySelector('#mediaAddBtn').focus({ preventScroll: true });
    current.querySelector('#sightingMediaStatus').textContent = ctx.mediaMessage;
    _loadExistingThumbs(current);
  };
  // Bind once per form lifecycle. Re-rendering evidence/pin fields must not
  // attach another file handler and duplicate photo/video IDs.
  if (!ctx.fileInputBound) {
    ctx.fileInputBound = true;
    fileInput.addEventListener('change', onFileChange);
  }

  // Media: verwijder nieuw bestand
  el.querySelector('#mediaAttachRow')?.addEventListener('click', e => {
    if (e.target.closest('#mediaAddBtn')) {
      if (!ctx.mediaChecking && !ctx.saving) {
        fileInput.value = '';
        fileInput.click();
      }
      return;
    }
    const delBtn = e.target.closest('.media-thumb__del');
    if (!delBtn || ctx.saving || ctx.mediaChecking) return;

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


}

// ── Lazy-load IDB thumbnails ───────────────────────────────
function releaseExistingPreviews(container) {
  container.querySelectorAll('[data-preview-url]').forEach(thumb => URL.revokeObjectURL(thumb.dataset.previewUrl));
}

async function _loadExistingThumbs(containerEl) {
  for (const placeholder of containerEl.querySelectorAll('[data-lazy-idb]')) {
    try {
      const photo = await getPhoto(placeholder.dataset.lazyIdb);
      if (!placeholder.isConnected) continue;
      if (!photo?.blob) {
        placeholder.textContent = 'Bestand ontbreekt';
        continue;
      }
      const video = photo.type?.startsWith('video/');
      const thumb = document.createElement(video ? 'video' : 'img');
      thumb.className = 'media-thumb__img';
      if (video) {
        thumb.muted = thumb.playsInline = true;
        thumb.preload = 'metadata';
      } else thumb.alt = photo.filename || '';
      const url = URL.createObjectURL(photo.blob);
      thumb.addEventListener(video ? 'loadeddata' : 'load', () => URL.revokeObjectURL(url), { once: true });
      thumb.addEventListener('error', () => URL.revokeObjectURL(url), { once: true });
      thumb.dataset.previewUrl = url;
      thumb.src = url;
      placeholder.replaceWith(thumb);
    } catch (_) {
      placeholder.textContent = 'Bestand kan niet worden geladen';
    }
  }
}

// ── Opslaan ────────────────────────────────────────────────
async function _submitForm(ov, close, onSaved, { isEdit, editId, ctx }) {
  if (!_state.speciesId) { showToast('Kies eerst een soort'); return; }
  const dateInput = ov.querySelector('#sightDate');
  if (!dateInput.validity.valid) {
    dateInput.reportValidity();
    dateInput.focus();
    return;
  }
  let evidence;
  try { evidence=normalizeEvidence(_state); }
  catch(err){ showToast(err.message); return; }
  if ((_state.lat !== null || _state.lon !== null) && !validPin(_state.lat,_state.lon)) {
    showToast('Kies een geldige pin, of verwijder de coördinaten');return;
  }
  if(evidence.identificationSource==='merlin' && evidence.merlinVerification!=='checked' && _state.certainty==='certain') {
    showToast('Een Merlin-suggestie is niet automatisch zeker. Kies Mogelijk/Waarschijnlijk of controleer de soort zelf.');return;
  }

  const btn = ov.querySelector('#addSheetSubmit');
  if (!btn || btn.disabled || ctx.mediaChecking || ctx.saving) return;   // guard: voorkomt dubbele submit
  btn.disabled = true;
  btn.textContent = 'Opslaan…';

  ctx.saving = true;
  const content = ov.querySelector('#addSheetContent');
  const cancel = ov.querySelector('#addSheetCancel');
  content.inert = true;
  cancel.disabled = true;
  const now = new Date().toISOString();
  const sightingId = isEdit ? editId : _uid();
  const newPhotos = _state.mediaFiles.map(({ file, tempId }) => ({
    id: tempId,
    blob: file,
    type: file.type,
    filename: file.name,
    speciesId: _state.speciesId,
    speciesName: _state.speciesName,
    sightingId,
    addedAt: now,
  }));
  let mediaWritten = false;
  let newPlace = null;
  let savedSighting;
  try {
    await changePhotos({ put: newPhotos });
    mediaWritten = true;
    const allPhotoIds = [..._state.existingPhotoIds, ...newPhotos.map(photo => photo.id)];
    let placeId = validPin(_state.lat, _state.lon) ? _state.placeId : null;
    if (validPin(_state.lat, _state.lon) && (!placeId || !loadPlaces().some(place => place.id === placeId))) {
      newPlace = addPlace({ name: _state.locationName, lat: _state.lat, lon: _state.lon });
      placeId = newPlace.id;
    }

    const sightingData = {
      speciesId:    _state.speciesId,
      speciesName:  _state.speciesName,
      date:         _state.date,
      time:         _state.time   || null,
      count:        _state.count  ?? 1,
      certainty:    _state.certainty || 'certain',
      lat:          _state.lat,
      lon:          _state.lon,
      pinAccuracyM: validPin(_state.lat,_state.lon) && Number.isFinite(_state.pinAccuracyM) ? _state.pinAccuracyM : null,
      placeId,
      locationName: _state.locationName || null,
      habitat:      _state.habitat      || null,
      behavior:     _state.behavior     || null,
      weather:      _state.weather      || null,
      notes:        _state.notes        || null,
      photoIds:     allPhotoIds,
      ...evidence,
    };

    savedSighting = isEdit
      ? await updateSighting(sightingId, sightingData)
      : await addSighting({ id: sightingId, ...sightingData, createdAt: now, updatedAt: now });
  } catch (error) {
    if (mediaWritten) {
      try { await changePhotos({ remove: newPhotos.map(photo => photo.id) }); }
      catch (cleanupError) { console.error('[sightingForm] media rollback', cleanupError); }
    }
    if (newPlace) {
      try { savePlaces(loadPlaces().filter(place => place.id !== newPlace.id)); }
      catch (cleanupError) { console.error('[sightingForm] place rollback', cleanupError); }
    }
    console.error('[sightingForm] save error', error);
    ctx.saving = false;
    content.inert = false;
    cancel.disabled = false;
    btn.disabled = false;
    btn.textContent = 'Opslaan';
    showToast('Opslaan mislukt — je invoer staat nog klaar');
    return;
  }

  // Bestaande media worden pas verwijderd na bevestigde opslag van de waarneming.
  try { await changePhotos({ remove: _state.deletedPhotoIds }); }
  catch (error) { console.error('[sightingForm] detached media cleanup', error); }
  ctx.saving = false;
  close();
  showToast(isEdit ? 'Waarneming bijgewerkt' : `${savedSighting.speciesName} opgeslagen`);
  onSaved?.(savedSighting);
}

// ── GPS ────────────────────────────────────────────────────
function _resetGPSButton(ov) {
  const button = ov.querySelector('#sightGpsBtn');
  if (!button) return;
  button.classList.remove('gps-btn--loading');
  button.innerHTML = _svgGps() + ' GPS';
  return button;
}

function _requestGPS(ov,ctx) {
  if (!navigator.geolocation) { showToast('GPS niet beschikbaar'); return; }
  const btn  = ov.querySelector('#sightGpsBtn');
  if (!btn) return;
  const revision = ++ctx.locationRevision;
  btn.classList.add('gps-btn--loading');
  btn.innerHTML = _svgSpinner() + ' GPS';

  navigator.geolocation.getCurrentPosition(
    pos => {
      if (ctx.destroyed || revision !== ctx.locationRevision) return;
      _state.lat = pos.coords.latitude;
      _state.lon = pos.coords.longitude;
      _state.pinAccuracyM = Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : null;
      _state.placeId = null;
      _resetGPSButton(ov)?.classList.add('gps-btn--active');
      const hint = ov.querySelector('#coordsHint');
      if (hint) hint.innerHTML = _coordsHintText();
      _offerPlace(ov, ctx);
    },
    () => {
      if (ctx.destroyed || revision !== ctx.locationRevision) return;
      _resetGPSButton(ov);
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
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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
