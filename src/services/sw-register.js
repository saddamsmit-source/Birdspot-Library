/**
 * BIRDSPOT LIBRARY — Service Worker registratie (Fase G)
 *
 * Registreert de service worker en toont een update-melding (L-011)
 * wanneer een nieuwe versie beschikbaar is.
 */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => {
      // Luister naar een nieuwe worker die aan het installeren is
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          // Nieuwe versie klaar én er is al een actieve controller (niet eerste install)
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });
    })
    .catch(err => {
      console.warn('[SW] Registratie mislukt:', err.message);
    });

  // Luister ook naar berichten van de SW (bijv. na activate bij terugkerende bezoeker)
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'new-version') {
      showUpdateToast();
    }
  });
}

/**
 * Toont de "Nieuwe versie · Nu laden"-toast via de centrale showToast-functie.
 * Bij klikken herlaadt de pagina zodat de nieuwe SW actief wordt.
 */
function showUpdateToast() {
  import('/src/app.js').then(({ showToast }) => {
    showToast('Nieuwe versie · Nu laden', 8000);
  }).catch(() => {
    // Fallback: inline toast als app.js niet beschikbaar is
    console.info('[SW] Nieuwe versie beschikbaar — herlaad de pagina om bij te werken.');
  });
}
