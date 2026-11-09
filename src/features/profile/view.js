/**
 * Profiel & instellingen — Stap 7 (Fase F)
 *
 * K7: lijsten (soortenlijst, jaarlijst, nieuwe soorten, topplekken), CSV-export en snelinstellingen.
 *
 * Back-up & herstel UI:
 *   - "Alles bewaren" → ZIP export
 *   - "Herstellen" → ZIP import met samenvoegen
 *   - "Terugzetten" → herstel naar veiligheidskopie
 *   - Back-upstatus zichtbaar (wanneer, hoeveel)
 */

import {
  exportBackup,
  importBackup,
  validateBackupFile,
  getBackupStatus,
  hasSafetyCopy,
  restoreFromSafetyCopy,
} from '../../storage/backup.js';
import { getSightings } from '../../data/sightings.js';
import { SPECIES } from '../../data/species.js';
import { loadPlaces } from '../../data/places.js';
import { loadSettings, saveSetting, BACKUP_REMINDER_OPTIONS } from '../../data/settings.js';
import { LAYERS, savedLayer, saveLayer } from '../map/centerPin.js';
import { profileLists } from './stats.js';
import { downloadCsv } from './exportCsv.js';

const SPECIES_BY_ID = new Map(SPECIES.map(s => [s.id, s]));
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayLabel = d => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ''));
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
};

export async function renderProfile(el) {
  const sightings   = (await getSightings()).filter(Boolean);
  const backupStatus = getBackupStatus();
  const safetyCopy  = hasSafetyCopy();
  const places      = loadPlaces();
  const settings    = loadSettings();
  const lists       = profileLists(sightings, { places, speciesById: SPECIES_BY_ID });

  el.innerHTML = `
    <div class="profile-screen">
      <div class="profile-header">
        <div class="profile-header__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="3"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div>
          <h1 class="profile-header__title">Bibliotheek</h1>
          <p class="profile-header__sub">Jouw waarnemingen, foto's en back-up</p>
        </div>
      </div>

      ${renderOverview(sightings)}

      ${renderLists(lists)}

      <!-- Back-up sectie -->
      <section class="profile-section" aria-labelledby="backupHeading">
        <h2 class="profile-section__title" id="backupHeading">Back-up & herstel</h2>

        <!-- Status -->
        <div class="backup-status" id="backupStatus" aria-live="polite">
          ${renderBackupStatus(backupStatus, sightings.length, settings.backupReminderDays)}
        </div>

        <!-- Alles bewaren -->
        <div class="profile-card">
          <div class="profile-card__info">
            <div class="profile-card__label">Alles bewaren</div>
            <div class="profile-card__desc">ZIP met alle waarnemingen en foto's</div>
          </div>
          <button class="btn btn--primary" id="btnExport" aria-label="Back-up maken">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 3v13M8 12l4 4 4-4"/>
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
            </svg>
            Bewaren
          </button>
        </div>

        <!-- Herstellen -->
        <div class="profile-card">
          <div class="profile-card__info">
            <div class="profile-card__label">Herstellen</div>
            <div class="profile-card__desc">Samenvoegen met een eerder gemaakte back-up</div>
          </div>
          <button class="btn btn--secondary" id="btnImport" aria-label="Back-up herstellen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 21V8M8 12l4-4 4 4"/>
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
            </svg>
            Herstellen
          </button>
          <input type="file" id="importFile" accept=".zip" class="visually-hidden" aria-label="Kies een back-upbestand">
        </div>

        <!-- Terugzetten (alleen zichtbaar als er een veiligheidskopie is) -->
        <div class="profile-card profile-card--warn ${safetyCopy ? '' : 'profile-card--hidden'}" id="restoreCard">
          <div class="profile-card__info">
            <div class="profile-card__label">Terugzetten</div>
            <div class="profile-card__desc">Herstel de toestand van vóór de laatste import</div>
          </div>
          <button class="btn btn--danger" id="btnRestore" aria-label="Terug naar vorige toestand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 12a9 9 0 019-9 9 9 0 016.36 2.64L21 9"/>
              <path d="M21 3v6h-6"/>
            </svg>
            Terugzetten
          </button>
        </div>
      </section>

      <!-- Exporteren (K7) -->
      <section class="profile-section" aria-labelledby="exportHeading">
        <h2 class="profile-section__title" id="exportHeading">Exporteren</h2>
        <div class="profile-card">
          <div class="profile-card__info">
            <div class="profile-card__label">Waarnemingen als CSV</div>
            <div class="profile-card__desc">Alle waarnemingen met datum, soort, aantal, coördinaten en plek. Voor waarneming.nl of een spreadsheet.</div>
          </div>
          <button class="btn btn--secondary" id="btnCsv" ${sightings.length ? '' : 'disabled'}>CSV</button>
        </div>
      </section>

      <!-- Instellingen (K7) -->
      <section class="profile-section" aria-labelledby="settingsHeading">
        <h2 class="profile-section__title" id="settingsHeading">Instellingen</h2>
        <div class="profile-setting">
          <div class="profile-card__label" id="layerLabel">Standaard kaartlaag</div>
          <div class="profile-segment" role="radiogroup" aria-labelledby="layerLabel">
            ${Object.entries(LAYERS).map(([key, l]) => `<button type="button" role="radio" data-layer="${key}" aria-checked="${savedLayer() === key}">${esc(l.label)}</button>`).join('')}
          </div>
        </div>
        <div class="profile-setting">
          <div class="profile-card__label" id="reminderLabel">Back-upherinnering</div>
          <div class="profile-segment" role="radiogroup" aria-labelledby="reminderLabel">
            ${BACKUP_REMINDER_OPTIONS.map(d => `<button type="button" role="radio" data-reminder="${d}" aria-checked="${settings.backupReminderDays === d}">${d ? `Na ${d} dagen` : 'Uit'}</button>`).join('')}
          </div>
        </div>
      </section>

      <!-- App-info -->
      <section class="profile-section" aria-labelledby="infoHeading">
        <h2 class="profile-section__title" id="infoHeading">Over de app</h2>
        <div class="profile-card profile-card--info">
          <div class="profile-card__info">
            <div class="profile-card__label">Birdspot Library</div>
            <div class="profile-card__desc" id="appVersion">versie ophalen…</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Bevestig-dialoog (import) -->
    <div class="confirm-overlay" id="confirmOverlay" role="dialog" aria-modal="true"
         aria-labelledby="confirmTitle" hidden>
      <div class="confirm-dialog">
        <h3 class="confirm-dialog__title" id="confirmTitle">Back-up herstellen</h3>
        <div class="confirm-dialog__body" id="confirmBody"></div>
        <div class="confirm-dialog__actions">
          <button class="btn btn--secondary" id="confirmCancel">Annuleren</button>
          <button class="btn btn--primary" id="confirmOk">Samenvoegen</button>
        </div>
      </div>
    </div>
  `;

  attachEvents(el, sightings, places, lists);

  // Versie ophalen bij de service worker (enige versiebron, L-027)
  const versionEl = el.querySelector('#appVersion');
  const info = await askVersion();
  if (!info) {
    versionEl.textContent = 'Versie onbekend · offline-modus nog niet actief';
    return;
  }
  const offlineStatus = info.offlineReady === true ? 'basis offline beschikbaar'
    : info.offlineReady === false ? 'offlinebasis onvolledig' : 'offlinebasis onbevestigd';
  versionEl.textContent = `Versie ${info.version} · ${offlineStatus}`;
}

// ── Event handlers ─────────────────────────────────────────────────────────

function attachEvents(el, sightings = [], places = [], lists = null) {
  // Export
  el.querySelector('#btnExport').addEventListener('click', () => handleExport(el));

  // Import — trigger file picker
  const importBtn  = el.querySelector('#btnImport');
  const importFile = el.querySelector('#importFile');
  importBtn.addEventListener('click',  () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files?.[0]) handleImport(el, e.target.files[0]);
  });

  // Terugzetten
  el.querySelector('#btnRestore').addEventListener('click', () => handleRestore(el));

  // K7: CSV-export
  el.querySelector('#btnCsv')?.addEventListener('click', () => {
    try {
      const r = downloadCsv(sightings, { speciesById: SPECIES_BY_ID, places });
      showToast(`CSV opgeslagen: ${r.count} ${r.count === 1 ? 'waarneming' : 'waarnemingen'}`);
    } catch (e) {
      showToast(`CSV maken mislukt: ${e.message}`, 'error');
    }
  });

  // K7: instellingen (direct opgeslagen)
  el.querySelectorAll('[data-layer]').forEach(btn => btn.addEventListener('click', () => {
    saveLayer(btn.dataset.layer);
    el.querySelectorAll('[data-layer]').forEach(b => b.setAttribute('aria-checked', String(b === btn)));
    showToast(`Kaart opent voortaan met ${btn.textContent.toLowerCase()}`);
  }));
  el.querySelectorAll('[data-reminder]').forEach(btn => btn.addEventListener('click', () => {
    const days = Number(btn.dataset.reminder);
    saveSetting('backupReminderDays', days);
    el.querySelectorAll('[data-reminder]').forEach(b => b.setAttribute('aria-checked', String(b === btn)));
    updateStatus(el, getBackupStatus(), sightings.length);
  }));

  el.querySelector('[data-insights]')?.addEventListener('click', () =>
    import('../../app.js').then(({ navigate }) => navigate('insights')));

  // K7: van lijst naar soort of plek
  el.addEventListener('click', e => {
    const sp = e.target.closest('[data-open-species]');
    const pl = e.target.closest('[data-open-place]');
    if (!sp && !pl) return;
    try {
      if (sp) sessionStorage.setItem('birdspot-open-species', sp.dataset.openSpecies);
      if (pl) sessionStorage.setItem('birdspot-map-place', pl.dataset.openPlace);
    } catch (_) { /* zonder sessionStorage opent alleen het scherm */ }
    import('../../app.js').then(({ navigate }) => navigate(sp ? 'species' : 'map', { force: true }));
  });

  // K7: volledige soortenlijst pas opbouwen bij openen (L-053)
  const all = el.querySelector('#profileAllSpecies');
  all?.addEventListener('toggle', () => {
    if (!all.open || all.dataset.built) return;
    all.dataset.built = '1';
    all.querySelector('.profile-list').innerHTML = speciesRows(lists?.list || []);
  });
}

// ── Export ─────────────────────────────────────────────────────────────────

async function handleExport(el) {
  const btn = el.querySelector('#btnExport');
  btn.disabled = true;
  btn.textContent = 'Bezig…';

  try {
    const result = await exportBackup();
    updateStatus(el, getBackupStatus(), getBackupStatus()?.sightingCount ?? 0);
    showToast(`Back-up opgeslagen: ${result.sightingCount} waarnemingen, ${result.photoCount} foto's`);
  } catch (e) {
    showToast(`Back-up mislukt: ${e.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 3v13M8 12l4 4 4-4"/>
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
      </svg>
      Bewaren`;
  }
}

// ── Import ─────────────────────────────────────────────────────────────────

async function handleImport(el, file) {
  const btn = el.querySelector('#btnImport');
  btn.disabled = true;

  try {
    // Valideer eerst zonder te importeren
    const check = await validateBackupFile(file);
    if (!check.valid) {
      showToast(check.error || 'Ongeldig back-upbestand', 'error');
      return;
    }

    // Vraag bevestiging
    const confirmed = await showConfirm(el,
      `<strong>${check.sightingCount}</strong> waarnemingen${check.photoCount ? ` en <strong>${check.photoCount}</strong> foto's` : ''} worden samengevoegd met je huidige data.<br><br>
      Bestaande waarnemingen worden bijgewerkt waar de back-up nieuwer is. Je huidige data blijft bewaard.`
    );
    if (!confirmed) return;

    // Import uitvoeren
    const result = await importBackup(file);
    updateStatus(el, getBackupStatus());

    // Terugzetten-knop tonen (er is nu een veiligheidskopie)
    const restoreCard = el.querySelector('#restoreCard');
    restoreCard?.classList.toggle('profile-card--hidden', !hasSafetyCopy());

    showToast(`Hersteld: ${result.merged} waarnemingen in je bibliotheek`);

    // Herlaad data na korte vertraging zodat toast zichtbaar is
    setTimeout(() => {
      import('../../app.js').then(({ navigate }) => navigate('profile', { force: true }));
    }, 1500);

  } catch (e) {
    showToast(`Herstel mislukt: ${e.message}`, 'error');
  } finally {
    btn.disabled = false;
    // Reset file input zodat hetzelfde bestand opnieuw gekozen kan worden
    const input = el.querySelector('#importFile');
    if (input) input.value = '';
  }
}

// ── Terugzetten ────────────────────────────────────────────────────────────

async function handleRestore(el) {
  const confirmed = await showConfirm(el,
    'Dit zet je bibliotheek terug naar de toestand van vóór de laatste import. Alle wijzigingen daarna gaan verloren.'
  );
  if (!confirmed) return;

  try {
    await restoreFromSafetyCopy();
    showToast('Teruggezet naar vorige toestand');

    // Terugzetten-knop verbergen
    const restoreCard = el.querySelector('#restoreCard');
    if (restoreCard) restoreCard.classList.add('profile-card--hidden');

    setTimeout(() => {
      import('../../app.js').then(({ navigate }) => navigate('profile', { force: true }));
    }, 1200);
  } catch (e) {
    showToast(`Terugzetten mislukt: ${e.message}`, 'error');
  }
}

// ── Bevestig-dialoog ───────────────────────────────────────────────────────

function showConfirm(el, html) {
  return new Promise(resolve => {
    const overlay = el.querySelector('#confirmOverlay');
    const body    = el.querySelector('#confirmBody');
    const okBtn   = el.querySelector('#confirmOk');
    const cancelBtn = el.querySelector('#confirmCancel');

    body.innerHTML = html;
    overlay.hidden = false;
    okBtn.focus();

    function cleanup(result) {
      overlay.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    }

    const onOk     = () => cleanup(true);
    const onCancel = () => cleanup(false);

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// ── Versie via MessageChannel; null als er (nog) geen service worker is ──────
async function askVersion() {
  try {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return null;
    return await new Promise(resolve => {
      const ch = new MessageChannel();
      const finish = info => {
        clearTimeout(timer);
        ch.port1.close();
        resolve(info);
      };
      const timer = setTimeout(() => finish(null), 1500);
      ch.port1.onmessage = e => finish(e.data?.version ? e.data : null);
      sw.postMessage({ type: 'get-version' }, [ch.port2]);
    });
  } catch (_) { return null; }
}

// ── Overzicht: tegels met aantallen; 0-tegels krijgen uitleg (D11) ─────────
export function overviewStats(sightings) {
  const species = new Set(sightings.map(s => s.speciesId).filter(Boolean));
  // Vaste plek (K4) telt op id; zonder vaste plek telt de vrije plaatsnaam (zelfde regel als Topplekken)
  const places = new Set(sightings.map(s => s.placeId ? `id:${s.placeId}` : (s.locationName || '').trim().toLowerCase()).filter(Boolean));
  const photos = sightings.reduce((n, s) => n + (Array.isArray(s.photoIds) ? s.photoIds.length : 0), 0);
  return { sightings: sightings.length, species: species.size, places: places.size, photos };
}

function renderOverview(sightings) {
  const st = overviewStats(sightings);
  if (!st.sightings) {
    return `<section class="profile-section" aria-labelledby="overviewHeading">
      <h2 class="profile-section__title" id="overviewHeading">Overzicht</h2>
      <p class="profile-empty">Nog geen waarnemingen. Tik op <b>+ Waarnemen</b> om je eerste vogel vast te leggen.</p>
    </section>`;
  }
  const tile = (n, label) => `<div class="profile-stat"><strong>${n}</strong><span>${label}</span></div>`;
  return `<section class="profile-section" aria-labelledby="overviewHeading">
    <h2 class="profile-section__title" id="overviewHeading">Overzicht</h2>
    <div class="profile-stats">
      ${tile(st.sightings, st.sightings === 1 ? 'waarneming' : 'waarnemingen')}
      ${tile(st.species, st.species === 1 ? 'soort' : 'soorten')}
      ${st.places ? tile(st.places, st.places === 1 ? 'plek' : 'plekken') : ''}
      ${st.photos ? tile(st.photos, st.photos === 1 ? 'foto' : "foto's") : ''}
    </div>
  </section>`;
}

// ── K7: lijsten ─────────────────────────────────────────────────────────────
function speciesRows(rows) {
  return rows.map(r => `<li><button type="button" class="profile-row" data-open-species="${esc(r.speciesId)}">
      <span class="profile-row__name">${esc(r.name)}</span>
      <span class="profile-row__meta">${r.count}× · sinds ${esc(dayLabel(r.first))}</span>
    </button></li>`).join('');
}

function renderLists(l) {
  if (!l.list.length) {
    return l.skipped
      ? `<section class="profile-section" aria-labelledby="listsHeading">
          <h2 class="profile-section__title" id="listsHeading">Mijn lijsten</h2>
          <p class="profile-empty">${l.skipped} ${l.skipped === 1 ? 'waarneming is' : 'waarnemingen zijn'} nog onzeker (mogelijk of een niet-gecontroleerde Merlin-suggestie) en ${l.skipped === 1 ? 'telt' : 'tellen'} niet mee.</p>
        </section>` : '';
  }
  const tile = (n, label) => `<div class="profile-stat"><strong>${n}</strong><span>${label}</span></div>`;
  const newRows = l.newThisYear.slice(0, 5);
  return `<section class="profile-section" aria-labelledby="listsHeading">
    <h2 class="profile-section__title" id="listsHeading">Mijn lijsten</h2>
    <div class="profile-stats profile-stats--lists">
      ${tile(l.list.length, l.list.length === 1 ? 'soort op je lijst' : 'soorten op je lijst')}
      ${l.yearSpecies ? tile(l.yearSpecies, `jaarlijst ${l.year}`) : ''}
      ${l.newThisYear.length ? tile(l.newThisYear.length, `nieuw in ${l.year}`) : ''}
    </div>
    ${newRows.length ? `<h3 class="profile-subtitle">Nieuwe soorten in ${l.year}</h3>
      <ul class="profile-list">${speciesRows(newRows)}</ul>` : ''}
    ${l.top.length ? `<h3 class="profile-subtitle">Topplekken</h3>
      <ol class="profile-list profile-list--places">${l.top.map(t => {
        const meta = `${t.sightings} ${t.sightings === 1 ? 'waarneming' : 'waarnemingen'} · ${t.species} ${t.species === 1 ? 'soort' : 'soorten'}`;
        return t.placeId
          ? `<li><button type="button" class="profile-row" data-open-place="${esc(t.placeId)}"><span class="profile-row__name">${esc(t.name)}</span><span class="profile-row__meta">${meta}</span></button></li>`
          : `<li><div class="profile-row"><span class="profile-row__name">${esc(t.name)}</span><span class="profile-row__meta">${meta}</span></div></li>`;
      }).join('')}</ol>` : ''}
    ${l.years.length > 1 ? `<h3 class="profile-subtitle">Jaarlijsten</h3>
      <table class="profile-years"><thead><tr><th scope="col">Jaar</th><th scope="col">Soorten</th></tr></thead>
        <tbody>${l.years.map(y => `<tr><td>${y.year}</td><td>${y.species}</td></tr>`).join('')}</tbody></table>` : ''}
    <details class="profile-all" id="profileAllSpecies">
      <summary>Alle soorten <span>(${l.list.length})</span></summary>
      <ul class="profile-list"></ul>
    </details>
    ${l.skipped ? `<p class="profile-note">${l.skipped} onzekere ${l.skipped === 1 ? 'waarneming telt' : 'waarnemingen tellen'} niet mee (mogelijk, of Merlin-suggestie zonder eigen controle).</p>` : ''}
    <button type="button" class="profile-link" data-insights>Meer per jaar in Mijn Inzichten ↗</button>
  </section>`;
}

// ── Back-upstatus bijwerken ────────────────────────────────────────────────

function updateStatus(el, status, currentCount = status?.sightingCount ?? 0) {
  const statusEl = el.querySelector('#backupStatus');
  if (statusEl) statusEl.innerHTML = renderBackupStatus(status, currentCount, loadSettings().backupReminderDays);
}

function renderBackupStatus(status, currentCount = 0, reminderDays = 30) {
  if (!status?.lastBackup) {
    return currentCount
      ? `<p class="backup-status__warn">Nog geen back-up. Bewaar je ${currentCount} ${currentCount === 1 ? 'waarneming' : 'waarnemingen'} met "Bewaren".</p>`
      : `<p class="backup-status__none">Nog geen back-up nodig: er zijn nog geen waarnemingen.</p>`;
  }
  const ageDays = Math.floor((Date.now() - new Date(status.lastBackup).getTime()) / 86400000);
  const newSince = Math.max(0, currentCount - (status.sightingCount ?? currentCount));
  const reminder = newSince
    ? `<p class="backup-status__warn">${newSince} ${newSince === 1 ? 'nieuwe waarneming' : 'nieuwe waarnemingen'} sinds de laatste back-up.</p>`
    : reminderDays && ageDays > reminderDays
      ? `<p class="backup-status__warn">Laatste back-up is ${ageDays} dagen oud.</p>` : '';

  const date = new Date(status.lastBackup).toLocaleString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return `
    <div class="backup-status__row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
           class="backup-status__icon backup-status__icon--ok">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <div>
        <div class="backup-status__label">Laatste back-up</div>
        <div class="backup-status__value">${date} · ${status.sightingCount ?? '?'} waarnemingen</div>
      </div>
    </div>${reminder}`;
}

// ── Toast helper ───────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
  // Gebruik de feedbacklaag als die beschikbaar is
  if (window.__birdspot?.toast) {
    window.__birdspot.toast(msg, type);
    return;
  }

  // Fallback interne toast voor de profielpagina
  let toast = document.getElementById('profileToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'profileToast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.className = `profile-toast profile-toast--${type}`;
  toast.textContent = msg;
  toast.hidden = false;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.hidden = true; }, 4000);
}
