/**
 * Waarneming detail — bottom sheet (Fase D)
 * Toont alle velden van een opgeslagen waarneming (v2 schema).
 * Media: objectURLs worden gemaakt vanuit IndexedDB blobs.
 * Acties: Bewerken (opent editSheet) · Verwijder (met confirmatie).
 *
 * @param {object}   sighting
 * @param {{ onDeleted?: function, onUpdated?: function, isActive?: function }} options
 */

import { deleteSighting }                   from '../../data/sightings.js';
import { getPhotosBySighting, getPhoto, deletePhoto } from '../../data/db.js';
import { methodLabel, sourceLabel } from './evidence.js';
import { escHtml }                          from '../../utils/html.js';
import { showToast }                        from '../../app.js';
import { openEditSheet }                    from './addSheet.js';

const CERTAINTY_NL = {
  certain:  'Zeker',
  probable: 'Waarschijnlijk',
  possible: 'Mogelijk',
};

export async function openDetailSheet(sighting, { onDeleted, onUpdated, isActive = () => true } = {}) {
  // Laad media uit IndexedDB
  const photos = await getPhotosBySighting(sighting.id).catch(() => []);
  // Fallback for legacy photos linked through sighting.photoIds only.
  const ids = new Set(photos.map(p=>p.id));
  for (const id of (sighting.photoIds || [])) {
    if(ids.has(id))continue;
    const photo = await getPhoto(id).catch(()=>null);
    if(photo){photos.push(photo);ids.add(id);}
  }

  if (!isActive()) return;
  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.id = 'detailSightingSheet';

  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true"
      aria-label="${escHtml(sighting.speciesName)}">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <span class="sheet__title">${escHtml(sighting.speciesName)}</span>
        <div class="detail-header-actions">
          <button class="btn-secondary detail-edit-btn" id="detailEdit" type="button">
            Bewerken
          </button>
          <button class="btn-close" id="detailClose" type="button">Sluiten</button>
        </div>
      </div>
      <div class="sheet__content" id="detailSheetContent">
        ${_renderDetailBody(sighting, photos)}
      </div>
      <div class="sheet__footer detail-footer">
        <button class="btn-danger" id="detailDelete" type="button">
          Waarneming verwijderen
        </button>
      </div>
    </div>`;

  const previousFocus = document.activeElement;
  let closed = false;
  document.body.appendChild(ov);
  requestAnimationFrame(() => { if (!closed) ov.classList.add('open'); });

  const onKey = e => {
    if (e.key === 'Escape' && !document.querySelector('.confirm-overlay, .lightbox')) close();
  };
  const close = () => {
    if (closed) return;
    closed = true;
    ov.classList.remove('open');
    document.removeEventListener('keydown',onKey);
    setTimeout(() => { ov.remove(); _releaseUrls(); previousFocus?.focus?.(); }, 300);
  };
  document.addEventListener('keydown',onKey);
  ov.querySelector('#detailClose')?.focus();

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('.sheet__handle').addEventListener('click', close);
  ov.querySelector('#detailClose').addEventListener('click', close);

  // ── Bewerken ─────────────────────────────────────────────
  ov.querySelector('#detailEdit').addEventListener('click', () => {
    // Sluit dit detail-sheet, open editSheet
    close();
    openEditSheet(sighting, {
      onSaved: updated => {
        onUpdated?.(updated);
      },
    });
  });

  // ── Verwijder (met bevestiging) ───────────────────────────
  ov.querySelector('#detailDelete').addEventListener('click', async () => {
    const confirmed = await _confirm(
      'Waarneming verwijderen?',
      'Deze actie kan niet ongedaan gemaakt worden.',
    );
    if (!confirmed) return;

    // Eerst het persistente record bijwerken. Bij opslagfout blijven foto's intact.
    try {
      await deleteSighting(sighting.id);
    } catch (_) {
      showToast('Verwijderen mislukt. De waarneming en foto’s zijn behouden.');
      return;
    }
    // Pas na succesvolle recordopslag verwijderbare media opruimen.
    for (const id of (sighting.photoIds || [])) {
      await deletePhoto(id).catch(() => {});
    }
    close();
    showToast('Waarneming verwijderd');
    onDeleted?.(sighting);
  });

  // ── Lightbox op mediabestanden ────────────────────────────
  _bindLightbox(ov);
}

// ── Detail body HTML ───────────────────────────────────────
function _renderDetailBody(s, photos) {
  const dateStr = fmtDate(s.date) + (s.time ? ` · ${s.time}` : '');

  return `
    <div class="detail-field-group">

      <!-- Datum + tijd -->
      <div class="detail-field">
        <div class="detail-field__label">Datum</div>
        <div class="detail-field__value">${escHtml(dateStr)}</div>
      </div>

      <!-- Aantal + zekerheid naast elkaar -->
      <div class="detail-field detail-field--row">
        <div class="detail-field detail-field--half">
          <div class="detail-field__label">Aantal</div>
          <div class="detail-field__value">${s.count ?? 1}</div>
        </div>
        <div class="detail-field detail-field--half">
          <div class="detail-field__label">Zekerheid</div>
          <div class="detail-field__value">
            <span class="certainty-badge certainty-badge--${escHtml(s.certainty || 'certain')}">
              ${escHtml(CERTAINTY_NL[s.certainty] || 'Zeker')}
            </span>
          </div>
        </div>
      </div>

      <!-- Waarnemingswijze en identificatiebron -->
      <div class="detail-field">
        <div class="detail-field__label">Waargenomen via</div>
        <div class="detail-field__value"><span class="sighting-evidence-detail">${escHtml(methodLabel(s))}</span></div>
      </div>
      ${s.identificationSource === 'merlin' ? `
        <div class="detail-field"><div class="detail-field__label">Herkenning</div>
          <div class="detail-field__value"><span class="sighting-merlin-detail">${escHtml(sourceLabel(s))}</span></div>
          ${s.merlinVerification !== 'checked' ? '<p class="detail-field__hint">Dit is een Merlin-suggestie; eigen controle is nog niet vastgelegd.</p>' : ''}
        </div>` : ''}

      <!-- Locatie -->
      ${s.locationName || (s.lat != null && s.lon != null) ? `
      <div class="detail-field">
        <div class="detail-field__label">Locatie</div>
        <div class="detail-field__value">
          ${s.locationName ? escHtml(s.locationName) : ''}
          ${s.lat != null && s.lon != null ? `<div class="detail-field__hint">📍 ${Number(s.lat).toFixed(5)}, ${Number(s.lon).toFixed(5)}</div>` : ''}
        </div>
      </div>` : ''}

      <!-- Habitat, gedrag, weer als chips (alleen tonen als ingevuld) -->
      ${(s.habitat || s.behavior || s.weather) ? `
      <div class="detail-field">
        <div class="detail-field__label">Context</div>
        <div class="detail-field__value">
          <div class="detail-chip-row">
            ${s.habitat  ? `<span class="detail-chip detail-chip--habitat">${escHtml(_capFirst(s.habitat))}</span>`  : ''}
            ${s.behavior ? `<span class="detail-chip detail-chip--behavior">${escHtml(_capFirst(s.behavior))}</span>` : ''}
            ${s.weather  ? `<span class="detail-chip detail-chip--weather">${escHtml(_capFirst(s.weather))}</span>`   : ''}
          </div>
        </div>
      </div>` : ''}

      <!-- Notitie -->
      ${s.notes ? `
      <div class="detail-field">
        <div class="detail-field__label">Notitie</div>
        <div class="detail-field__value detail-field__value--notes">${escHtml(s.notes)}</div>
      </div>` : ''}

    </div>

    ${photos.length ? `
    <div class="detail-field__label" style="margin-top:var(--space-16)">
      Foto's &amp; video's (${photos.length})
    </div>
    <div class="detail-media-grid">
      ${photos.map(p => {
        const url = _blobToUrl(p);
        if (!url) return '';
        const isVideo = p.type?.startsWith('video/');
        return `<div class="detail-media__item" data-url="${escHtml(url)}"
          data-type="${escHtml(p.type || '')}">
          ${isVideo
            ? `<video src="${escHtml(url)}" class="detail-media__img" muted playsinline></video>
               <div class="detail-media__badge">▶</div>`
            : `<img src="${escHtml(url)}" class="detail-media__img"
                 alt="${escHtml(p.filename || '')}">`}
        </div>`;
      }).join('')}
    </div>` : ''}`;
}

// ── Lightbox ───────────────────────────────────────────────
function _bindLightbox(ov) {
  ov.querySelectorAll('.detail-media__item[data-url]').forEach(el => {
    el.addEventListener('click', () => _openLightbox(el.dataset.url, el.dataset.type));
  });
}

function _openLightbox(url, type) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  const isVideo = type?.startsWith('video/');
  lb.innerHTML = `
    ${isVideo
      ? `<video src="${escHtml(url)}" controls autoplay playsinline
           style="max-width:100%;max-height:90vh;border-radius:8px"></video>`
      : `<img src="${escHtml(url)}" alt=""
           style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:8px">`}
    <button class="lightbox__close" aria-label="Sluiten">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        style="width:20px;height:20px">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;
  document.body.appendChild(lb);
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.closest('.lightbox__close')) lb.remove();
  });
}

// ── Async bevestiging (geen browser confirm/alert) ─────────
function _confirm(title, message) {
  return new Promise(resolve => {
    const dlg = document.createElement('div');
    dlg.className = 'confirm-overlay';
    dlg.innerHTML = `
      <div class="confirm-dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="confirmTitle" aria-describedby="confirmMsg">
        <div class="confirm-dialog__title" id="confirmTitle">${escHtml(title)}</div>
        <div class="confirm-dialog__body"  id="confirmMsg">${escHtml(message)}</div>
        <div class="confirm-dialog__actions">
          <button class="btn-secondary confirm-cancel" type="button">Annuleer</button>
          <button class="btn-danger   confirm-ok"     type="button">Verwijderen</button>
        </div>
      </div>`;
    document.body.appendChild(dlg);
    const finish = (result) => { dlg.remove(); resolve(result); };
    dlg.querySelector('.confirm-cancel').addEventListener('click', () => finish(false));
    dlg.querySelector('.confirm-ok').addEventListener('click',     () => finish(true));
    dlg.addEventListener('click', e => { if (e.target === dlg) finish(false); });
  });
}

// ── Object URL helpers ─────────────────────────────────────
const _activeUrls = [];
function _blobToUrl(photo) {
  if (!photo?.blob) return null;
  const blob = photo.blob instanceof Blob ? photo.blob
             : new Blob([photo.blob], { type: photo.type });
  const url = URL.createObjectURL(blob);
  _activeUrls.push(url);
  return url;
}
function _releaseUrls() {
  _activeUrls.splice(0).forEach(u => {
    try { URL.revokeObjectURL(u); } catch (_) {}
  });
}

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function _capFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
