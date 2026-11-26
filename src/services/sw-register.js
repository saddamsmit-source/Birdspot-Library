/** Controleer automatisch op updates. De gebruiker kiest wanneer de app herlaadt. */

const UPDATE_INTERVAL_MS = 5 * 60_000;
const UPDATE_COOLDOWN_MS = 30_000;

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
  serviceWorker.register('./sw.js').then(reg => {
    let controller = serviceWorker.controller;
    let reloadRequested = false;
    let reloadAvailable = false;
    let checkingUpdate = false;
    let lastUpdateCheck = -Infinity;
    const button = document.createElement('button');
    button.id = 'appUpdate';
    button.type = 'button';
    button.className = 'toast show app-update';
    button.textContent = 'Nieuwe versie · Nu laden';
    button.hidden = true;
    document.body.appendChild(button);

    function showAvailableUpdate() {
      button.hidden = !reg.waiting && !reloadAvailable;
    }

    button.addEventListener('click', () => {
      if (hasActiveInput()) {
        button.textContent = 'Rond je invoer af · Probeer opnieuw';
        return;
      }
      if (reloadAvailable) {
        location.reload();
      } else if (reg.waiting) {
        reloadRequested = true;
        button.disabled = true;
        reg.waiting.postMessage({ type: 'apply-update' });
      }
    });

    serviceWorker.addEventListener('controllerchange', () => {
      if (controller) {
        reloadAvailable = true;
        button.disabled = false;
        if (reloadRequested && !hasActiveInput()) {
          location.reload();
          return;
        }
        button.textContent = 'Nieuwe versie · Nu laden';
        showAvailableUpdate();
      }
      reloadRequested = false;
      controller = serviceWorker.controller;
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
