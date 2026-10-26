/**
 * Waarneming detail — bottom sheet (Stap 5)
 * Toont alle velden van een opgeslagen waarneming.
 * Media: objectURLs worden gemaakt vanuit IndexedDB blobs.
 * Acties: Verwijder.
 */

import { deleteSighting }     from '../../data/sightings.js';
import { getPhotosBySighting, deletePhoto } from '../../data/db.js';
import { escHtml }            from '../../utils/html.js';
import { showToast }          from '../../app.js';

/**
 * @param {object}   sighting
 * @param {function} onDeleted  — callback na verwijderen
 */
export async function openDetailSheet(sighting, { onDeleted } = {}) {
  // Laad media uit IndexedDB
  const photos   = await getPhotosBySighting(sighting.id).catch(() => []);
  // Fallback: foto's gekoppeld via speciesId zonder sightingId (addSheet koppelt nog niet terug)
  // → gebruik photoIds array uit sighting als backup
  const mediaMap = new Map(photos.map(p => [p.id, p]));

  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${escHtml(sighting.speciesName)}">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <span class="sheet__title">${escHtml(sighting.speciesName)}</span>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-danger" id="detailDelete">Verwijder</button>
          <button class="btn-close"  id="detailClose">Sluiten</button>
        </div>
      </div>
      <div class="sheet__content">
        <div class="detail-sight">
          ${renderDetailBody(sighting, photos)}
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.querySelector('.sheet').classList.add('open'));

  const close = () => {
    ov.querySelector('.sheet').classList.remove('open');
    setTimeout(() => { ov.remove(); _releaseUrls(); }, 300);
  };

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('.sheet__handle').addEventListener('click', close);
  ov.querySelector('#detailClose').addEventListener('click', close);

  // Verwijder
  ov.querySelector('#detailDelete').addEventListener('click', async () => {
    // Verwijder media uit IndexedDB
    for (const id of (sighting.photoIds || [])) {
      await deletePhoto(id).catch(() => {});
    }
    await deleteSighting(sighting.id);
    close();
    showToast('Waarneming verwijderd');
    onDeleted?.(sighting);
  });

  // Lightbox op mediabestanden
  ov.querySelectorAll('.detail-media__item[data-url]').forEach(el => {
    el.addEventListener('click', () => openLightbox(el.dataset.url, el.dataset.type));
  });

  // Object-URL cleanup bijhouden
  _activeUrls.push(...photos.map(p => _blobToUrl(p)).filter(Boolean));
}

// ── Render ─────────────────────────────────────────────────
function renderDetailBody(s, photos) {
  return `
    <div class="detail-field-group">
      <div class="detail-field">
        <div class="detail-field__label">Datum</div>
        <div class="detail-field__value">${escHtml(fmtDate(s.date))}</div>
      </div>
      ${s.locationName || s.lat ? `
      <div class="detail-field">
        <div class="detail-field__label">Locatie</div>
        <div class="detail-field__value">
          ${s.locationName ? escHtml(s.locationName) : ''}
          ${s.lat ? `<div class="detail-field__hint">📍 ${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}</div>` : ''}
        </div>
      </div>` : ''}
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
            : `<img src="${escHtml(url)}" class="detail-media__img" alt="">`}
        </div>`;
      }).join('')}
    </div>` : ''}`;
}

// ── Lightbox ───────────────────────────────────────────────
function openLightbox(url, type) {
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

// ── Object URL helpers ─────────────────────────────────────
const _activeUrls = [];
function _blobToUrl(photo) {
  if (!photo?.blob) return null;
  const url = URL.createObjectURL(photo.blob);
  _activeUrls.push(url);
  return url;
}
function _releaseUrls() {
  _activeUrls.splice(0).forEach(u => { try { URL.revokeObjectURL(u); } catch (_) {} });
}

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}
