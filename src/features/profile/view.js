/**
 * Profiel & instellingen — Stap 7 (Fase F)
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

export async function renderProfile(el) {
  const sightings   = await getSightings();
  const backupStatus = getBackupStatus();
  const safetyCopy  = hasSafetyCopy();

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
          <p class="profile-header__sub">${sightings.length} ${sightings.length === 1 ? 'waarneming' : 'waarnemingen'}</p>
        </div>
      </div>

      <!-- Back-up sectie -->
      <section class="profile-section" aria-labelledby="backupHeading">
        <h2 class="profile-section__title" id="backupHeading">Back-up & herstel</h2>

        <!-- Status -->
        <div class="backup-status" id="backupStatus" aria-live="polite">
          ${renderBackupStatus(backupStatus)}
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

  // Versie ophalen
  try {
    const sw = await navigator.serviceWorker?.getRegistration?.();
    const v  = sw ? 'met service worker' : 'zonder service worker';
    el.querySelector('#appVersion').textContent = `Birdspot Library · ${v}`;
  } catch (_) {
    el.querySelector('#appVersion').textContent = 'Birdspot Library';
  }

  attachEvents(el);
}

// ── Event handlers ─────────────────────────────────────────────────────────

function attachEvents(el) {
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
}

// ── Export ─────────────────────────────────────────────────────────────────

async function handleExport(el) {
  const btn = el.querySelector('#btnExport');
  btn.disabled = true;
  btn.textContent = 'Bezig…';

  try {
    const result = await exportBackup();
    updateStatus(el, getBackupStatus());
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
    if (restoreCard) restoreCard.classList.remove('profile-card--hidden');

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

// ── Back-upstatus bijwerken ────────────────────────────────────────────────

function updateStatus(el, status) {
  const statusEl = el.querySelector('#backupStatus');
  if (statusEl) statusEl.innerHTML = renderBackupStatus(status);
}

function renderBackupStatus(status) {
  if (!status?.lastBackup) {
    return `<p class="backup-status__none">Nog geen back-up gemaakt.</p>`;
  }

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
    </div>`;
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
