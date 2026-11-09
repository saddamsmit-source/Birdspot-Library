/** Registratie en handmatig toepassen van een beschikbare Birdspot-update. */

function hasActiveInput() {
  return Boolean(document.querySelector(
    '#addSightingSheet, .manual-pin-dialog, .place-prompt, ' +
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
    reg.addEventListener('updatefound', watchInstalling);
    watchInstalling();
    showAvailableUpdate();
  }).catch(err => {
    console.warn('[SW] Registratie mislukt:', err.message);
  });
}
