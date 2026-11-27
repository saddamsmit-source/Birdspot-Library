/** Controleer automatisch op updates. De gebruiker kiest wanneer de app herlaadt. */

const UPDATE_INTERVAL_MS = 60_000;
const UPDATE_COOLDOWN_MS = 30_000;
const ACTIVATION_TIMEOUT_MS = 15_000;
const AVAILABLE_MESSAGE = 'Nieuwe versie beschikbaar';

function hasActiveInput() {
  return Boolean(document.querySelector(
    '#addSightingSheet, .manual-pin-dialog, ' +
    '#mapPinPanel:not([hidden]), #mapDetailSheet.open, #confirmOverlay:not([hidden]), ' +
    '#btnImport:disabled, #btnExport:disabled, #filmEditor:not([hidden])'
  ));
}

if ('serviceWorker' in navigator) {
  const serviceWorker = navigator.serviceWorker;
  // Relatief (i.p.v. vast "/sw.js") zodat registratie en scope ook onder een
  // subpad kloppen (bv. een GitHub Pages-projectpagina) — zie sw.js SCOPE_PATH.
  serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
    let controller = serviceWorker.controller;
    let activationTimer;
    let reloadAvailable = false;
    let checkingUpdate = false;
    let lastUpdateCheck = -Infinity;
    const popup = document.createElement('aside');
    popup.id = 'appUpdatePopup';
    popup.className = 'toast show app-update';
    popup.setAttribute('aria-label', 'App-update');
    popup.hidden = true;
    const message = document.createElement('strong');
    message.id = 'appUpdateMessage';
    message.textContent = AVAILABLE_MESSAGE;
    const button = document.createElement('button');
    button.id = 'appUpdate';
    button.type = 'button';
    button.textContent = 'Nu bijwerken';
    button.setAttribute('aria-describedby', message.id);
    popup.append(message, button);
    const announcement = document.createElement('span');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    document.body.append(announcement, popup);

    function showMessage(text) {
      if (message.textContent !== text) message.textContent = text;
      if (announcement.textContent !== text) announcement.textContent = text;
    }

    function showAvailableUpdate() {
      const available = Boolean(reloadAvailable || (controller && reg.waiting));
      if (available && popup.hidden) showMessage(AVAILABLE_MESSAGE);
      popup.hidden = !available && !activationTimer;
    }

    button.addEventListener('click', () => {
      if (hasActiveInput()) {
        showMessage('Sla je invoer op of sluit het formulier en tik daarna opnieuw.');
        return;
      }
      if (reloadAvailable) {
        location.reload();
      } else if (reg.waiting) {
        const waiting = reg.waiting;
        button.disabled = true;
        showMessage('Aviandra wordt bijgewerkt…');
        activationTimer = window.setTimeout(() => {
          activationTimer = undefined;
          button.disabled = false;
          showAvailableUpdate();
          if (!popup.hidden) showMessage('Bijwerken duurde te lang. Probeer opnieuw.');
        }, ACTIVATION_TIMEOUT_MS);
        waiting.postMessage({ type: 'apply-update' });
      }
    });

    serviceWorker.addEventListener('controllerchange', () => {
      const previousController = controller;
      controller = serviceWorker.controller;
      if (previousController && controller && previousController !== controller) {
        const reloadRequested = Boolean(activationTimer);
        window.clearTimeout(activationTimer);
        activationTimer = undefined;
        reloadAvailable = true;
        button.disabled = false;
        if (reloadRequested && !hasActiveInput()) {
          location.reload();
          return;
        }
        showAvailableUpdate();
        showMessage(hasActiveInput()
          ? 'Sla je invoer op of sluit het formulier en tik daarna opnieuw.'
          : AVAILABLE_MESSAGE);
      }
    });

    function watchInstalling() {
      reg.installing?.addEventListener('statechange', showAvailableUpdate);
    }

    async function checkForUpdate(reconnected = false) {
      showAvailableUpdate();
      const now = performance.now();
      if (!reg.active || reg.installing || reg.waiting || reloadAvailable || checkingUpdate ||
          !navigator.onLine || document.visibilityState !== 'visible' ||
          (!reconnected && now - lastUpdateCheck < UPDATE_COOLDOWN_MS)) return;

      checkingUpdate = true;
      lastUpdateCheck = now;
      try {
        await reg.update();
      } catch {
        // Een verbroken verbinding of verlopen sessie laat de huidige versie gewoon werken.
      } finally {
        checkingUpdate = false;
        showAvailableUpdate();
      }
    }

    reg.addEventListener('updatefound', watchInstalling);
    watchInstalling();
    window.addEventListener('online', () => checkForUpdate(true));
    window.addEventListener('focus', () => checkForUpdate());
    document.addEventListener('visibilitychange', () => checkForUpdate());
    window.setInterval(() => checkForUpdate(), UPDATE_INTERVAL_MS);
    checkForUpdate();
  }).catch(err => {
    console.warn('[SW] Registratie mislukt:', err.message);
  });
}
