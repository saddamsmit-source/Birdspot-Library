/**
 * Waarnemingen-overzicht — Stap 5
 *
 * - Lijst gesorteerd nieuwste eerst
 * - Kaartje met soort, datum, locatie, notitie-preview, media-teller
 * - Tik → detail sheet
 * - Lege state
 * - Thumbnail uit IndexedDB (eerste foto/video van de waarneming)
 */

import { getSightings }     from '../../data/sightings.js';
import { SPECIES }          from '../../data/species.js';
import { getPhoto }         from '../../data/db.js';
import { getPhotoUrl, revokePhotoUrl } from '../../utils/photoUrl.js';
import { openDetailSheet }  from './detailSheet.js';
import { methodLabel, sourceLabel } from './evidence.js';
import { escHtml }          from '../../utils/html.js';

// ── Entry point ────────────────────────────────────────────
export async function renderSightings(el, { sightingId } = {}) {
  const sightings = await getSightings();

  el.innerHTML = `
    <div class="page-header">
      <div class="page-header__title">Waarnemingen</div>
      <div class="page-header__sub" id="sightingsCount">${countLabel(sightings.length)}</div>
    </div>
    <div id="sightingsList"></div>`;

  await renderList(el, sightings);
  const selected = sightings.find(sighting => sighting?.id === sightingId);
  if (selected && el.isConnected) await openSighting(el, selected);
}

// ── Lijst renderen ─────────────────────────────────────────
async function renderList(screenEl, sightings) {
  const wrap = screenEl.querySelector('#sightingsList');
  if (!wrap) return;

  // Update teller
  const countEl = screenEl.querySelector('#sightingsCount');
  if (countEl) countEl.textContent = countLabel(sightings.length);

  if (!sightings.length) {
    wrap.innerHTML = `
      <div class="empty-state" style="margin-top:64px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"
          style="width:40px;height:40px;opacity:.4">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <p>Nog geen waarnemingen.<br>Tik <strong>+</strong> om te beginnen.</p>
      </div>`;
    return;
  }

  // Sorted: nieuwste eerst (op datum, dan createdAt)
  const sorted = sightings.filter(sighting => sighting?.id).sort((a, b) => {
    const d = (b.date || '').localeCompare(a.date || '');
    return d !== 0 ? d : (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  wrap.innerHTML = `<div class="sight-list" id="sightingCards"></div>`;
  const list = wrap.querySelector('#sightingCards');

  // Render kaartjes zonder thumbnails (snel)
  for (const s of sorted) {
    const card = buildCard(s, null);
    list.appendChild(card);
  }

  // Laad thumbnails async
  loadThumbnails(list, sorted);

  // Delegate click
  list.addEventListener('click', async e => {
    const card = e.target.closest('.sight-card');
    if (!card) return;
    const s = sorted.find(x => x.id === card.dataset.id);
    if (!s) return;
    await openSighting(screenEl, s);
  });
}

function openSighting(screenEl, sighting) {
  const refresh = async () => renderList(screenEl, await getSightings());
  return openDetailSheet(sighting, { onDeleted: refresh, onUpdated: refresh, isActive: () => screenEl.isConnected });
}

// ── Kaart bouwen ───────────────────────────────────────────
function buildCard(s, thumbUrl) {
  const sp      = SPECIES.find(x => x.id === s.speciesId);
  const icon    = sp?.icon || '🐦';
  const hasMedia = s.photoIds?.length > 0;
  const method = s.observationMethod ? methodLabel(s) : null;
  const merlin = s.identificationSource === 'merlin';

  const card = document.createElement('div');
  card.className = 'sight-card';
  card.dataset.id = s.id;
  card.innerHTML = `
    <div class="sight-card__thumb" data-thumb="${s.id}">
      ${thumbUrl
        ? `<img src="${escHtml(thumbUrl)}" alt="">`
        : `<span aria-hidden="true">${icon}</span>`}
    </div>
    <div class="sight-card__body">
      <div class="sight-card__name">${escHtml(s.speciesName)}</div>
      <div class="sight-card__meta">
        ${svgCalendar()} ${escHtml(fmtDate(s.date))}
        ${s.locationName
          ? `<span class="sight-card__sep">·</span>${svgPin()} ${escHtml(s.locationName)}`
          : ''}
        ${method ? `<span class="sighting-observed-pill ${s.observationMethod === 'heard' ? 'is-heard' : ''}">${s.observationMethod === 'heard' ? '♪' : '◈'} ${escHtml(method)}</span>` : ''}
        ${merlin ? `<span class="sighting-merlin-pill">♪ Merlin${s.merlinVerification !== 'checked' ? ' · suggestie' : ''}</span>` : ''}
        ${hasMedia
          ? `<span class="sight-card__sep">·</span>
             ${svgPhoto()}
             <span class="sight-count-chip">${s.photoIds.length}</span>`
          : ''}
      </div>
      ${s.notes
        ? `<div class="sight-card__note">${escHtml(s.notes)}</div>`
        : ''}
    </div>`;
  return card;
}

// ── Thumbnails async inladen ───────────────────────────────
async function loadThumbnails(listEl, sightings) {
  for (const s of sightings) {
    if (!s.photoIds?.length) continue;
    try {
      const photo = await getPhoto(s.photoIds[0]);
      if (!photo?.blob) continue;
      const url = getPhotoUrl(photo);
      if (!url) continue;
      const thumbEl = listEl.isConnected
        ? listEl.querySelector(`.sight-card__thumb[data-thumb="${s.id}"]`)
        : null;
      if (!thumbEl) { revokePhotoUrl(url); continue; }
      // Attach events before assigning src; no fragile inline onload handler.
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
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function svgCalendar() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:13px;height:13px;flex-shrink:0">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`;
}
function svgPin() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:13px;height:13px;flex-shrink:0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`;
}
function svgPhoto() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    style="width:13px;height:13px;flex-shrink:0">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <circle cx="12" cy="14" r="3"/>
  </svg>`;
}
