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

import { appIcon, observationIcon } from '../../utils/icons.js';
import { SPECIES } from '../../data/species.js';
import { openPinPicker } from './pinPicker.js';
import { normalizeEvidence, validPin, OBSERVATION_METHODS, BREEDING_BEHAVIORS } from './evidence.js';
import { addSighting, updateSighting, getSightingsSnapshot } from '../../data/sightings.js';
import { draftKey, draftFields, sameFields, loadDraft, saveDraft, deleteDraft, draftIsStale } from './sightingDraft.js';
import { choiceDialog } from './choiceDialog.js';
import { loadPlaces, placeDecision, reuseRadiusM, resolvePlaceForSave, removeCreatedPlace } from '../../data/places.js';
import { changePhotos, getPhoto, SIGHTING_AUDIO_KIND, sightingAudioType } from '../../data/db.js';
import { openMediaPreview } from '../../utils/validateMedia.js';
import { audioBytesProblem, releaseSightingAudio, resolveSightingAudio } from '../../data/sightingAudio.js';
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
    pinAccuracyExactM: null, // herstel 2B (P3): ongeronde waarde, alleen voor de plekbeslissing
    autoLocationName: null,  // herstel 2B (P4): naam die automatisch uit een gekozen plek kwam
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
    // Ronde 3 (R08): eigen geluidsopnamen, los van foto's/video's
    audioFiles:       [],   // { tempId, file, type, objectUrl }
    existingAudioIds: [],
    deletedAudioIds:  [],
    ...override,
  };
}

const ctx_audioInputs = new WeakMap();   // fileInput → audioInput (ronde 3)

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
    existingAudioIds: Array.isArray(sighting.audioIds) ? [...sighting.audioIds] : [],
  }), { onSaved, editId: sighting.id, baseUpdatedAt: sighting.updatedAt || null });
}

// ── Interne implementatie ─────────────────────────────────
function _openSightingForm(mode, initialState, { onSaved, editId, baseUpdatedAt = null } = {}) {
  // An already closed sheet lingers for 300ms for its exit animation.
  // Allow immediate reopening; never let a stale overlay silently drop the new route.
  const previous = document.getElementById('addSightingSheet');
  if (previous) {
    if (!previous.inert) return;
    previous.remove();
    document.getElementById('sightingMediaInput')?.remove();
    document.getElementById('sightingAudioInput')?.remove();
  }
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
  // Ronde 3: aparte kiezer voor geluidsbestanden (bv. geëxporteerde Merlin-WAV)
  const audioInput = document.createElement('input');
  audioInput.type = 'file';
  audioInput.id = 'sightingAudioInput';
  audioInput.accept = 'audio/*,.wav,.mp3,.m4a,.aac,.ogg,.oga';
  audioInput.multiple = true;
  audioInput.hidden = true;
  document.body.appendChild(audioInput);
  ctx_audioInputs.set(fileInput, audioInput);

  document.body.appendChild(ov);
  requestAnimationFrame(() => { if (ov.isConnected) ov.classList.add('open'); });

  const ctx = { destroyed: false, cancelPinPicker: null, locationRevision: 0, mediaChecking: false, detailsOpen: isEdit,
    // Vervolgcorrectie R08: de opnamen zoals ze waren toen het formulier opende (conflictdetectie).
    loadedAudioIds: [...(initialState.existingAudioIds || [])],
    // UX-01A: concept. Wijzigingen tellen pas na een handeling van de gebruiker (automatische GPS niet).
    draftKey: draftKey(mode, editId), baseUpdatedAt, initialFields: draftFields(initialState),
    touched: false, resumed: false, draftWritten: false, draftBlocked: false, draftTimer: 0, leaving: false };
  const submit = ov.querySelector('#addSheetSubmit');
  ov.querySelector('#addSightingTitle').focus({ preventScroll: true });

  const close = () => {
    if (ctx.destroyed || ctx.saving) return;
    ctx.destroyed = true;
    clearTimeout(ctx.draftTimer);
    document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('pagehide', onPageHide);
    document.getElementById('sightingLeaveDialog')?.remove();
    ctx.cancelPinPicker?.();
    ov.classList.remove('open');
    ov.inert = true;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    document.removeEventListener('keydown', onEscape);
    setTimeout(() => { ov.remove(); fileInput.remove(); audioInput.remove(); }, 300);
    _releaseObjectUrls();
    releaseExistingPreviews(ov);
  };

  // ── UX-01A: concept bewaren, bewust afsluiten, hervatten ──────────────────
  const hasPendingMedia = () => _state.mediaFiles.length > 0 || _state.audioFiles.length > 0;
  const isDirty = () => ctx.touched && (ctx.resumed || hasPendingMedia() || !sameFields(_state, ctx.initialFields));
  const persistDraft = () => {
    clearTimeout(ctx.draftTimer);
    ctx.draftTimer = 0;
    if (ctx.destroyed || ctx.saving || ctx.draftBlocked) return true;
    if (!isDirty()) {
      if (ctx.draftWritten) { deleteDraft(ctx.draftKey); ctx.draftWritten = false; }
      return true;
    }
    const ok = saveDraft(ctx.draftKey, { fields: _state, baseUpdatedAt: ctx.baseUpdatedAt,
      pendingPhotos: _state.mediaFiles.length, pendingAudio: _state.audioFiles.length });
    if (ok) ctx.draftWritten = true;
    return ok;
  };
  const scheduleSave = () => {
    if (!ctx.touched || ctx.destroyed) return;
    clearTimeout(ctx.draftTimer);
    ctx.draftTimer = setTimeout(persistDraft, 400);
  };
  ctx.markTouched = () => { ctx.touched = true; scheduleSave(); };
  ctx.scheduleSave = scheduleSave;
  ctx.persistDraft = persistDraft;
  const onHidden = () => { if (document.visibilityState === 'hidden' && ctx.touched) persistDraft(); };
  const onPageHide = () => { if (ctx.touched) persistDraft(); };
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', onPageHide);
  // Elke gebruikersinvoer in het formulier telt; programmatische waarden (automatische GPS) vuren geen events.
  const formContent = ov.querySelector('#addSheetContent');
  formContent.addEventListener('input', () => ctx.markTouched(), true);
  formContent.addEventListener('change', () => ctx.markTouched(), true);
  formContent.addEventListener('click', event => {
    if (event.target.closest('button, label, input, select, textarea, summary')) setTimeout(() => ctx.markTouched(), 0);
  }, true);

  const pendingNote = () => {
    const parts = [];
    if (_state.mediaFiles.length) parts.push(`${_state.mediaFiles.length} foto/video`);
    if (_state.audioFiles.length) parts.push(`${_state.audioFiles.length} opname${_state.audioFiles.length === 1 ? '' : 'n'}`);
    return parts.length ? `Let op: nieuw gekozen media (${parts.join(' en ')}) gaan niet mee in een concept; die kies je later opnieuw.` : '';
  };
  /** Alle sluitroutes (Annuleer, tik ernaast, greep, Escape, browser-/Android-terug) komen hier. */
  const requestClose = async () => {
    if (ctx.destroyed || ctx.saving || ctx.leaving || ctx.draftBlocked) return;
    if (!isDirty()) {
      if (ctx.draftWritten) { deleteDraft(ctx.draftKey); ctx.draftWritten = false; }
      close();
      return;
    }
    ctx.leaving = true;
    const choice = await choiceDialog({
      id: 'sightingLeaveDialog',
      title: 'Nog niet opgeslagen',
      body: isEdit ? 'Je wijzigingen aan deze waarneming zijn nog niet opgeslagen.' : 'Deze waarneming is nog niet opgeslagen.',
      note: pendingNote(),
      choices: [
        { value: 'keep', label: 'Verder bewerken', kind: 'primary', cancel: true },
        { value: 'draft', label: 'Concept bewaren en sluiten', kind: 'secondary' },
        { value: 'discard', label: 'Wijzigingen verwerpen', kind: 'danger' },
      ],
    });
    ctx.leaving = false;
    if (ctx.destroyed) return;
    if (choice === 'draft') {
      if (!persistDraft()) { showToast('Concept kon niet worden bewaard — je invoer staat nog klaar'); return; }
      close();
      showToast(hasPendingMedia() ? 'Concept bewaard — zonder de nieuw gekozen media' : 'Concept bewaard');
    } else if (choice === 'discard') {
      deleteDraft(ctx.draftKey);
      ctx.draftWritten = false;
      close();
    } else {
      ov.querySelector('#addSightingTitle')?.focus({ preventScroll: true });
    }
  };
  ctx.requestClose = requestClose;
  // Een gekozen foto of opname is een wijziging, ook als het bestand buiten de knop om binnenkomt.
  fileInput.addEventListener('change', () => ctx.markTouched());
  audioInput.addEventListener('change', () => ctx.markTouched());

  const onEscape = event => {
    if (event.key !== 'Escape' || ov.inert || !ov.contains(document.activeElement)) return;
    event.preventDefault();
    requestClose();
  };
  document.addEventListener('keydown', onEscape);
  submit.addEventListener('click', () => _submitForm(ov, close, onSaved, { isEdit, editId, ctx }));
  ov.addEventListener('click', e => { if (e.target === ov) requestClose(); });
  ov.querySelector('.sheet__handle').addEventListener('click', requestClose);
  ov.querySelector('#addSheetCancel').addEventListener('click', requestClose);

  _bindFormEvents(ov, fileInput, close, onSaved, { isEdit, editId, ctx });
  if (!isEdit) _decidePlace(ov);
  _offerDraft(ov, ctx, isEdit, close);
}

/** UX-01A (C): bestaand concept voor dit doel? Eerst bewust kiezen; een concept wordt nooit stil overschreven. */
async function _offerDraft(ov, ctx, isEdit, close) {
  const draft = loadDraft(ctx.draftKey);
  if (!draft) return;
  ctx.draftBlocked = true;
  const when = new Date(draft.savedAt || '');
  const stamp = Number.isNaN(when.getTime()) ? '' : when.toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const label = [draft.fields.speciesName || 'Nog geen soort', draft.fields.date || ''].filter(Boolean).join(' · ');
  const stale = isEdit && draftIsStale(draft, { updatedAt: ctx.baseUpdatedAt });
  const choice = stale
    ? await choiceDialog({
      id: 'sightingDraftDialog', title: 'Verouderd concept',
      body: `Deze waarneming is gewijzigd nadat het concept${stamp ? ` (${stamp})` : ''} werd bewaard. Het concept wordt daarom niet toegepast.`,
      choices: [
        { value: 'delete', label: 'Concept verwijderen en bewerken', kind: 'primary' },
        { value: 'later', label: 'Sluiten, concept bewaren', kind: 'secondary', cancel: true },
      ],
    })
    : await choiceDialog({
      id: 'sightingDraftDialog', title: 'Onbewaard concept',
      body: `${label}${stamp ? ` — bewaard ${stamp}` : ''}.`,
      note: draft.pendingPhotos || draft.pendingAudio
        ? 'Foto’s, video’s en opnamen die je toen koos, zitten niet in het concept.' : '',
      choices: [
        { value: 'resume', label: 'Concept hervatten', kind: 'primary' },
        { value: 'delete', label: isEdit ? 'Concept verwijderen' : 'Concept verwijderen, nieuw beginnen', kind: 'danger' },
        { value: 'later', label: 'Sluiten, concept bewaren', kind: 'secondary', cancel: true },
      ],
    });
  ctx.draftBlocked = false;
  if (ctx.destroyed) return;
  if (choice === 'later') {
    // Er is nog niets nieuws ingevuld; het concept blijft ongewijzigd bewaard.
    ctx.touched = false;
    close();
    return;
  }
  if (choice === 'delete') {
    deleteDraft(ctx.draftKey);
    ctx.scheduleSave?.();   // wat er intussen al is ingevuld, wordt het nieuwe concept
    return;
  }
  // Hervatten: alleen gegevensvelden; een lopende automatische GPS mag de bewaarde plek niet meer wijzigen.
  ctx.locationRevision++;
  ctx.autoGpsStarted = true;
  _resetGPSButton(ov);
  const fields = draft.fields;
  const list = (value, fallback) => (Array.isArray(value) ? value.filter(id => typeof id === 'string') : fallback);
  _releaseObjectUrls();
  _state = freshState({ ...fields,
    existingPhotoIds: list(fields.existingPhotoIds, _state.existingPhotoIds),
    deletedPhotoIds: list(fields.deletedPhotoIds, []),
    existingAudioIds: list(fields.existingAudioIds, _state.existingAudioIds),
    deletedAudioIds: list(fields.deletedAudioIds, []),
    mediaFiles: [], audioFiles: [], placeOffer: null });
  if (isEdit) ctx.detailsOpen = true;
  ctx.resumed = true;
  ctx.touched = true;
  ctx.draftWritten = true;
  if (draft.pendingPhotos || draft.pendingAudio) {
    ctx.mediaMessage = 'Concept hervat. Kies de foto’s, video’s of opnamen van toen opnieuw; die zaten niet in het concept.';
  }
  ctx.refresh?.();
  ov.querySelector('#addSightingTitle')?.focus({ preventScroll: true });
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
            ${observationIcon(value)}<strong>${label}</strong>
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

    <!-- Ronde 3: eigen geluidsopnamen (privé op dit toestel) -->
    <div class="form-field sighting-audio-field">
      <label class="form-label">Geluidsopnamen</label>
      <div class="sighting-audio-list" id="audioAttachList">
        ${_renderAudioItems()}
      </div>
      <p class="form-hint" id="sightingAudioStatus" role="status"></p>
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
          <strong>${appIcon('soundwave')} Merlin Sound ID</strong>
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

function _renderAudioItems() {
  return `
        ${_state.existingAudioIds.map(id => `
          <div class="sighting-audio-item" data-audioid="${escHtml(id)}">
            <span class="sighting-audio-item__name" data-lazy-audio="${escHtml(id)}">Opname laden…</span>
            <button class="sighting-audio-item__del" type="button" data-audioid="${escHtml(id)}" aria-label="Verwijder opname">${_svgClose()}</button>
          </div>`).join('')}
        ${_state.audioFiles.map(a => `
          <div class="sighting-audio-item" data-audiotemp="${escHtml(a.tempId)}">
            <span class="sighting-audio-item__name">${escHtml(a.file.name || 'Opname')}</span>
            <audio class="sighting-audio-item__player" controls preload="metadata" src="${escHtml(a.objectUrl)}"></audio>
            <button class="sighting-audio-item__del" type="button" data-audiotemp="${escHtml(a.tempId)}" aria-label="Verwijder opname">${_svgClose()}</button>
          </div>`).join('')}
        <button class="media-add-btn sighting-audio-add" id="audioAddBtn" type="button" aria-label="Geluidsopname toevoegen">
          ${_svgPlus()} <span>Geluidsopname</span>
        </button>
  `;
}

async function _loadExistingAudio(containerEl) {
  for (const label of containerEl.querySelectorAll('[data-lazy-audio]')) {
    try {
      const record = await getPhoto(label.dataset.lazyAudio);
      if (!label.isConnected) continue;
      if (!(record?.blob instanceof Blob)) { label.textContent = 'Opname ontbreekt op dit toestel'; continue; }
      label.textContent = record.filename || 'Opname';
      const player = document.createElement('audio');
      player.className = 'sighting-audio-item__player';
      player.controls = true;
      player.preload = 'metadata';
      const url = URL.createObjectURL(record.blob);
      player.dataset.previewUrl = url;
      player.src = url;
      label.after(player);
    } catch (_) {
      label.textContent = 'Opname kan niet worden geladen';
    }
  }
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
  const coords = `📍 ${Number(_state.lat).toFixed(5)}, ${Number(_state.lon).toFixed(5)}${acc}`;
  const place = _state.placeId ? loadPlaces().find(p => p.id === _state.placeId) : null;
  const offer = _currentOffer();
  const dist = id => { const c = offer?.candidates.find(x => x.id === id); return c ? ` (${c.distanceM} m)` : ''; };
  if (place) {
    const undo = offer && offer.mode !== 'new'
      ? ` <button type="button" class="link-btn" data-place-separate>Aparte spot</button>` +
        (offer.mode === 'choose' ? ` <button type="button" class="link-btn" data-place-change>Andere plek</button>` : '')
      : '';
    return `${coords} · <span data-place-state="linked">Bekende plek: ${escHtml(place.name)}${dist(place.id)}</span>${undo}`;
  }
  if (!offer || offer.mode === 'new') return `${coords} · <span data-place-state="new">Nieuwe plek</span>`;
  if (offer.separate) {
    return `${coords} · <span data-place-state="separate">Aparte spot (nieuwe plek)</span>` +
      ` <button type="button" class="link-btn" data-place-change>Toch bekende plek kiezen</button>`;
  }
  const why = offer.accurate ? '' : (Number.isFinite(_exactAccuracy())
    ? ` Niet automatisch gekoppeld: positie ±${_exactAccuracy().toLocaleString('nl-NL', { maximumFractionDigits: 1 })} m (grens 50 m).`
    : ' Niet automatisch gekoppeld: nauwkeurigheid onbekend.');
  const title = offer.mode === 'single'
    ? `Bekende plek binnen ${offer.radiusM} m.${why}`
    : `${offer.candidates.length} bekende plekken binnen ${offer.radiusM} m. Kies er één of een aparte spot.`;
  return `${coords} · <span data-place-state="offer">Nieuwe plek</span>` +
    `<div class="place-offer" role="group" aria-label="Bekende plekken in de buurt"><p class="place-offer__title">${escHtml(title)}</p>` +
    offer.candidates.map(c => `<button type="button" class="place-offer__choice" data-place-choice="${escHtml(c.id)}">${escHtml(c.name)} · ${c.distanceM} m</button>`).join('') +
    `<button type="button" class="place-offer__choice place-offer__choice--separate" data-place-separate>Aparte spot</button></div>`;
}

/** Het aanbod hoort alleen bij exact de huidige pin; een oud aanbod wordt nooit toegepast. */
function _currentOffer() {
  const o = _state.placeOffer;
  return o && o.lat === _state.lat && o.lon === _state.lon ? o : null;
}

/**
 * Ronde 2B: beslis inline (geen venster) over een bekende vogelspot binnen de ingestelde straal.
 * Eén kandidaat + nauwkeurige positie → vooraf gekozen (afmeldbaar). Anders alleen een aanbod.
 */
function _exactAccuracy() {
  return Number.isFinite(_state.pinAccuracyExactM) ? _state.pinAccuracyExactM : _state.pinAccuracyM;
}

/** Een automatisch ingevulde plaatsnaam volgt de plek; een zelf getypte naam blijft altijd staan. */
function _setAutoName(ov, name) {
  if (String(_state.locationName || '').trim() && _state.locationName !== _state.autoLocationName) return;
  _state.locationName = name;
  _state.autoLocationName = name;
  const inp = ov.querySelector('#sightLocation');
  if (inp) inp.value = name;
}
function _clearAutoName(ov) {
  if (_state.autoLocationName && _state.locationName === _state.autoLocationName) {
    _state.locationName = '';
    const inp = ov.querySelector('#sightLocation');
    if (inp) inp.value = '';
  }
  _state.autoLocationName = null;
}

function _decidePlace(ov) {
  _state.placeOffer = null;
  if (!_state.placeId) _clearAutoName(ov); // nieuwe pin: oude automatische naam hoort er niet meer bij
  if (!validPin(_state.lat, _state.lon) || _state.placeId) { _renderHint(ov); return; }
  const d = placeDecision({ places: loadPlaces(), lat: _state.lat, lon: _state.lon,
    accuracyM: _exactAccuracy(), radiusM: reuseRadiusM() });
  _state.placeOffer = { lat: _state.lat, lon: _state.lon, mode: d.mode, auto: d.auto, accurate: d.accurate,
    radiusM: d.radiusM, separate: false,
    candidates: d.candidates.slice(0, 5).map(c => ({ id: c.place.id, name: c.place.name, distanceM: Math.round(c.distanceM) })) };
  if (d.auto) _linkPlace(ov, d.candidates[0].place.id);
  else _renderHint(ov);
}

function _linkPlace(ov, id) {
  const offer = _currentOffer();
  const place = loadPlaces().find(p => p.id === id);
  if (!offer || !place || !offer.candidates.some(c => c.id === id)) { _renderHint(ov); return; }
  _state.placeId = place.id;
  offer.separate = false;
  _setAutoName(ov, place.name);
  _renderHint(ov);
}

function _renderHint(ov) {
  const hint = ov.querySelector('#coordsHint');
  if (hint) hint.innerHTML = _coordsHintText();
}

function _bindPlaceHint(ov) {
  const hint = ov.querySelector('#coordsHint');
  if (!hint) return;
  hint.addEventListener('click', event => {
    const btn = event.target.closest('button');
    if (!btn || !hint.contains(btn)) return;
    const offer = _currentOffer();
    if (!offer) { _renderHint(ov); return; }
    if (btn.hasAttribute('data-place-choice')) _linkPlace(ov, btn.dataset.placeChoice);
    else if (btn.hasAttribute('data-place-separate')) {
      _clearAutoName(ov);
      _state.placeId = null; offer.separate = true; _renderHint(ov);
    } else if (btn.hasAttribute('data-place-change')) {
      _clearAutoName(ov);
      _state.placeId = null; offer.separate = false; _renderHint(ov);
    }
  });
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
    ctx.scheduleSave?.();   // UX-01A: state-wijziging buiten een invoerveld (soort, pin, media) gaat mee in het concept
  };
  ctx.refresh = refresh;

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
      ctx.touched = true;
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
    if (_state.locationName !== _state.autoLocationName) _state.autoLocationName = null; // zelf getypt
  });

  // Pin on map, or enter coordinates offline in the map picker.
  el.querySelector('#sightPinBtn')?.addEventListener('click',()=>{
    ctx.locationRevision++;
    _resetGPSButton(ov);
    ctx.cancelPinPicker?.();
    ctx.cancelPinPicker=openPinPicker({
      lat:_state.lat,lon:_state.lon,
      onClose:()=>{ ctx.cancelPinPicker=null; }, // Escape/sluiten/bevestigen: verwijzing altijd opgeruimd
      onConfirm:coords=>{
        if(ctx.destroyed)return;
        ctx.locationRevision++; // handmatige pin wint van elke nog lopende GPS-callback
        _state.lat=coords.lat;_state.lon=coords.lon;
        _state.pinAccuracyM=Number.isFinite(coords.accuracyM)?coords.accuracyM:null;
        _state.pinAccuracyExactM=_state.pinAccuracyM;
        _state.placeId=null;
        ctx.cancelPinPicker=null;refresh();_decidePlace(ov);
      },
    });
  });
  el.querySelector('#sightClearPin')?.addEventListener('click',()=>{
    ctx.locationRevision++;
    _state.lat=null;_state.lon=null;_state.pinAccuracyM=null;_state.pinAccuracyExactM=null;_state.placeId=null;_state.placeOffer=null;
    _clearAutoName(ov);refresh();
  });
  // GPS
  el.querySelector('#sightGpsBtn')?.addEventListener('click', () => _requestGPS(ov,ctx));
  // R05 (eigenaarbesluit 17-11): nieuwe waarneming vult GPS automatisch in als locatietoestemming al gegeven is.
  // Geen toestemmingsvraag, geen blokkade; een gekozen pin of 'wis' wint (locationRevision).
  if (!isEdit && !ctx.autoGpsStarted && _state.lat == null) { ctx.autoGpsStarted = true; _autoGPS(ov, ctx); }
  _bindPlaceHint(ov);

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

  // ── Ronde 3 (R08): eigen geluidsopnamen ──────────────────
  const audioInput = ctx_audioInputs.get(fileInput);
  const audioList = el.querySelector('#audioAttachList');
  el.querySelector('#sightingAudioStatus').textContent = ctx.audioMessage || '';
  _loadExistingAudio(audioList);
  const onAudioChange = async () => {
    if (ctx.destroyed || ctx.saving || ctx.mediaChecking || !audioInput.files.length) return;
    const files = [...audioInput.files];
    ctx.mediaChecking = true;
    ctx.audioMessage = 'Geluidsbestand controleren…';
    content().querySelector('#sightingAudioStatus').textContent = ctx.audioMessage;
    const submit = ov.querySelector('#addSheetSubmit');
    submit.disabled = true;
    const rejected = [];
    for (const file of files) {
      try {
        const type = sightingAudioType(file);
        if (!type) throw new Error('Geen ondersteund geluidsformaat');
        // Zelfde inhoudscontrole als de ZIP-voorcontrole en import (correctie R08, P2).
        const problem = audioBytesProblem(new Uint8Array(await file.slice(0, 1 << 20).arrayBuffer()), type, { totalLength: file.size });
        if (problem) throw new Error(problem);
        // Originele bytes ongewijzigd; alleen het type wordt vastgelegd als de kiezer het niet gaf.
        const blob = file.type === type ? file : new Blob([file], { type });
        const objectUrl = await openMediaPreview(blob, 'audio');   // moet hier echt afspeelbaar zijn
        if (ctx.destroyed) { URL.revokeObjectURL(objectUrl); return; }
        _state.audioFiles.push({ tempId: 'au_' + _uid(), file, blob, type, objectUrl });
      } catch (error) {
        // Inhoudsreden (bijv. 'WAV is afgebroken…') tonen; anders de algemene uitleg.
        const reason = /WAV|MP3|M4A|AAC|OGG|leeg/.test(error?.message || '') ? ` (${error.message})` : '';
        rejected.push((file.name || 'bestand') + reason);
      }
      if (ctx.destroyed) return;
    }
    ctx.mediaChecking = false;
    submit.disabled = false;
    ctx.audioMessage = rejected.length
      ? 'Niet toegevoegd (geen afspeelbaar WAV-, MP3-, M4A-, AAC- of OGG-bestand): ' + rejected.join(', ')
      : '';
    const current = content();
    const list = current.querySelector('#audioAttachList');
    releaseExistingPreviews(list);
    list.innerHTML = _renderAudioItems();
    current.querySelector('#sightingAudioStatus').textContent = ctx.audioMessage;
    _loadExistingAudio(list);
  };
  if (!ctx.audioInputBound) {
    ctx.audioInputBound = true;
    audioInput.addEventListener('change', onAudioChange);
  }
  audioList?.addEventListener('click', e => {
    if (e.target.closest('#audioAddBtn')) {
      if (!ctx.mediaChecking && !ctx.saving) { audioInput.value = ''; audioInput.click(); }
      return;
    }
    const del = e.target.closest('.sighting-audio-item__del');
    if (!del || ctx.saving || ctx.mediaChecking) return;
    if (del.dataset.audiotemp) {
      const item = _state.audioFiles.find(a => a.tempId === del.dataset.audiotemp);
      if (item) URL.revokeObjectURL(item.objectUrl);
      _state.audioFiles = _state.audioFiles.filter(a => a.tempId !== del.dataset.audiotemp);
    } else if (del.dataset.audioid) {
      // Bestaande opname: pas na bevestigde opslag verwijderen (Annuleren laat alles intact).
      _state.existingAudioIds = _state.existingAudioIds.filter(id => id !== del.dataset.audioid);
      _state.deletedAudioIds.push(del.dataset.audioid);
    }
    refresh();
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

  // UX-01A (D): een hervat bewerkconcept mag een intussen gewijzigde waarneming nooit overschrijven.
  if (isEdit && ctx.resumed) {
    const current = getSightingsSnapshot().find(item => item.id === editId);
    if (!current || (current.updatedAt || null) !== ctx.baseUpdatedAt) {
      ctx.persistDraft?.();
      showToast('Waarneming intussen gewijzigd — concept niet opgeslagen. Sluit en open de waarneming opnieuw.');
      return;
    }
  }
  const btn = ov.querySelector('#addSheetSubmit');
  if (!btn || btn.disabled || ctx.mediaChecking || ctx.saving) return;   // guard: voorkomt dubbele submit
  btn.disabled = true;
  btn.textContent = 'Opslaan…';

  ctx.saving = true;
  // Opslagrace (#293 QA): de locatie ligt vast op het moment van Opslaan; een GPS-antwoord dat
  // tijdens het wegschrijven binnenkomt (revisie verhoogd) kan het record niet meer wijzigen.
  ctx.locationRevision++;
  const loc = { lat: _state.lat, lon: _state.lon, acc: _state.pinAccuracyM, placeId: _state.placeId, name: _state.locationName };
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
  // Ronde 3: originele geluidsbestanden; zelfde transactie als de foto's, dus samen wel of niet.
  const newAudio = _state.audioFiles.map(({ tempId, file, blob, type }) => ({
    id: tempId, kind: SIGHTING_AUDIO_KIND, blob, type,
    filename: file.name || tempId + '.' + (type.split('/')[1] || 'audio'), size: file.size,
    sightingId, addedAt: now,
  }));
  let mediaWritten = false;
  let newPlace = null;
  let savedSighting;
  try {
    await changePhotos({ put: [...newPhotos, ...newAudio] });
    mediaWritten = true;
    const allPhotoIds = [..._state.existingPhotoIds, ...newPhotos.map(photo => photo.id)];
    const allAudioIds = [..._state.existingAudioIds, ...newAudio.map(audio => audio.id)];
    let placeId = validPin(loc.lat, loc.lon) ? loc.placeId : null;
    if (validPin(loc.lat, loc.lon)) {
      // IndexedDB leidend: bestaande plek alleen als die nu nog bestaat, anders een nieuwe (één transactie).
      const resolved = await resolvePlaceForSave({ placeId, name: loc.name, lat: loc.lat, lon: loc.lon });
      placeId = resolved.place.id;
      if (resolved.created) newPlace = resolved.place;
    }

    const sightingData = {
      speciesId:    _state.speciesId,
      speciesName:  _state.speciesName,
      date:         _state.date,
      time:         _state.time   || null,
      count:        _state.count  ?? 1,
      certainty:    _state.certainty || 'certain',
      lat:          loc.lat,
      lon:          loc.lon,
      pinAccuracyM: validPin(loc.lat,loc.lon) && Number.isFinite(loc.acc) ? loc.acc : null,
      placeId,
      locationName: loc.name || null,
      habitat:      _state.habitat      || null,
      behavior:     _state.behavior     || null,
      weather:      _state.weather      || null,
      notes:        _state.notes        || null,
      photoIds:     allPhotoIds,
      audioIds:     allAudioIds,
      ...evidence,
    };

    savedSighting = isEdit
      ? await updateSighting(sightingId, sightingData, {
        // Audiokoppelingen pas onder het herstelslot bepalen, uit de actuele waarneming (P1).
        resolve: async current => {
          const { audioIds, dropped } = await resolveSightingAudio(current, {
            loaded: ctx.loadedAudioIds, removed: _state.deletedAudioIds, added: newAudio.map(audio => audio.id),
          });
          if (dropped.length) console.warn('[sightingForm] koppeling naar ontbrekende opname niet opnieuw opgeslagen', dropped);
          return { audioIds };
        },
      })
      : await addSighting({ id: sightingId, ...sightingData, createdAt: now, updatedAt: now });
  } catch (error) {
    if (mediaWritten) {
      try { await changePhotos({ remove: [...newPhotos, ...newAudio].map(item => item.id) }); }
      catch (cleanupError) { console.error('[sightingForm] media rollback', cleanupError); }
    }
    if (newPlace) {
      try { await removeCreatedPlace(newPlace.id); }
      catch (cleanupError) { console.error('[sightingForm] place rollback', cleanupError); }
    }
    console.error('[sightingForm] save error', error);
    ctx.saving = false;
    content.inert = false;
    cancel.disabled = false;
    btn.disabled = false;
    btn.textContent = 'Opslaan';
    ctx.touched = true;
    ctx.persistDraft?.();   // UX-01A: na een opslagfout staat de invoer ook na herladen nog klaar
    if (error?.name === 'AudioChangedError') {
      // Formulier bijwerken naar de actuele opnamen; nieuwe opnamen en andere invoer blijven staan.
      const currentIds = error.currentIds || [];
      _state.deletedAudioIds = _state.deletedAudioIds.filter(id => currentIds.includes(id));
      _state.existingAudioIds = currentIds.filter(id => !_state.deletedAudioIds.includes(id));
      ctx.loadedAudioIds = [...currentIds];
      ctx.audioMessage = error.message;
      const list = ov.querySelector('#audioAttachList');
      if (list) {
        releaseExistingPreviews(list);
        list.innerHTML = _renderAudioItems();
        _loadExistingAudio(list);
      }
      const status = ov.querySelector('#sightingAudioStatus');
      if (status) status.textContent = error.message;
      showToast('Opnamen intussen gewijzigd — controleer en sla opnieuw op');
      return;
    }
    if (error?.name === 'AudioReadError') {
      // Restcorrectie R08 (P1): leesfout — niets opgeslagen, alleen media van deze poging opgeruimd.
      ctx.audioMessage = error.message;
      const status = ov.querySelector('#sightingAudioStatus');
      if (status) status.textContent = error.message;
      showToast('Opnamen konden niet worden gelezen — niets opgeslagen, probeer opnieuw');
      return;
    }
    showToast('Opslaan mislukt — je invoer staat nog klaar');
    return;
  }

  // Bestaande media worden pas verwijderd na bevestigde opslag van de waarneming.
  try { await changePhotos({ remove: _state.deletedPhotoIds }); }
  catch (error) { console.error('[sightingForm] detached media cleanup', error); }
  // Correctie R08 (P2): een losgekoppelde opname blijft bewaard zolang de veiligheidskopie haar
  // nodig heeft voor Terugzetten; pas daarna wordt ze echt verwijderd.
  try { await releaseSightingAudio(_state.deletedAudioIds); }
  catch (error) { console.error('[sightingForm] detached audio cleanup', error); }
  ctx.saving = false;
  clearTimeout(ctx.draftTimer);
  deleteDraft(ctx.draftKey);   // UX-01A: opgeslagen = geen concept meer
  ctx.draftWritten = false;
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

async function _autoGPS(ov, ctx) {
  // Intent-token: elke handmatige locatiehandeling (pin-picker openen/bevestigen, wissen, GPS-knop)
  // verhoogt locationRevision; een automatische meting die daarna binnenkomt wordt genegeerd.
  const intent = ctx.locationRevision;
  try {
    const status = await navigator.permissions?.query?.({ name: 'geolocation' });
    if (status?.state !== 'granted' || ctx.destroyed || ctx.cancelPinPicker || _state.lat != null || ctx.locationRevision !== intent) return;
    _requestGPS(ov, ctx, { silent: true, intent });
  } catch (_) { /* geen Permissions API: handmatige GPS-knop blijft werken */ }
}

function _requestGPS(ov,ctx,{ silent = false, intent = null } = {}) {
  if (!navigator.geolocation) { if (!silent) showToast('GPS niet beschikbaar'); return; }
  const btn  = ov.querySelector('#sightGpsBtn');
  if (!btn) return;
  // Automatisch: blijf op het intent-token (verhoog niet), zodat iedere handmatige handeling wint.
  const revision = silent ? intent : ++ctx.locationRevision;
  btn.classList.add('gps-btn--loading');
  btn.innerHTML = _svgSpinner() + ' GPS';

  navigator.geolocation.getCurrentPosition(
    pos => {
      if (ctx.destroyed || ctx.saving || revision !== ctx.locationRevision) return;
      if (silent && (ctx.cancelPinPicker || _state.lat != null)) { _resetGPSButton(ov); return; }
      const before = silent ? draftFields(_state) : null;
      _state.lat = pos.coords.latitude;
      _state.lon = pos.coords.longitude;
      _state.pinAccuracyM = Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : null;
      _state.pinAccuracyExactM = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null;
      _state.placeId = null;
      _resetGPSButton(ov)?.classList.add('gps-btn--active');
      // R05 + ronde 2B: nooit een venster; een bekende plek binnen de straal wordt inline aangeboden.
      _decidePlace(ov);
      // UX-01A: een automatisch gevulde locatie is geen wijziging van de gebruiker (geen sluitvraag).
      // Alleen velden die de gebruiker zelf nog niet had aangepast, schuiven mee in de beginstand.
      if (before && ctx.initialFields) {
        for (const key of ['lat', 'lon', 'pinAccuracyM', 'pinAccuracyExactM', 'placeId', 'locationName', 'autoLocationName']) {
          if (before[key] === ctx.initialFields[key]) ctx.initialFields[key] = _state[key] ?? null;
        }
      }
      ctx.scheduleSave?.();
    },
    () => {
      if (ctx.destroyed || revision !== ctx.locationRevision) return;
      _resetGPSButton(ov);
      if (!silent) showToast('GPS niet beschikbaar — vul locatie handmatig in');
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ── Cleanup ────────────────────────────────────────────────
function _releaseObjectUrls() {
  [...(_state?.mediaFiles || []), ...(_state?.audioFiles || [])].forEach(m => {
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
