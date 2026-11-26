/**
 * AVIANDRA — App bootstrap & router
 * src/app.js
 *
 * Verantwoordelijk voor:
 * - Routes registreren
 * - Navigatie aansturen
 * - FAB zichtbaarheid
 * - Schermen lazy-laden
 */

import { installNavigation, recordRoute } from './services/navigation.js';
import './services/gestures.js';

import { renderHome }       from './features/home/view.js';
import { renderSpecies }    from './features/species/view.js';
import { renderSightings }  from './features/sightings/view.js';
import { renderMap, getMapView }        from './features/map/view.js';
import { renderProfile }    from './features/profile/view.js';
import { renderMedia }      from './features/media/view.js';
import { renderJournal }    from './features/journal/view.js';
import { renderInsights }   from './features/insights/view.js';
import { renderFilmStudio } from './features/film/view.js';
import { openAddSheet }     from './features/sightings/addSheet.js';
import { openQuickAdd }      from './features/sightings/quickAdd.js';
import { holdTabPresence, withDataLock } from './data/dataLock.js';
import { recoverOperations, hasPendingMarker } from './data/opJournal.js';
import { initPlaces }        from './data/places.js';

// Herstel 2B (import met oude tabbladstand): elk open Aviandra-tabblad meldt zich aan.
holdTabPresence();

// ── Routes ────────────────────────────────────────────────
const ROUTES = {
  home:      { render: renderHome,      fab: true  },
  species:   { render: renderSpecies,   fab: true  },
  sightings: { render: renderSightings, fab: true  },
  map:       { render: renderMap,       fab: true  },
  profile:   { render: renderProfile,   fab: true  },
  media:     { render: renderMedia,     fab: true  },
  journal:   { render: renderJournal,   fab: true  },
  insights:  { render: renderInsights,  fab: true  },
  film:      { render: renderFilmStudio, fab: true  },
};

let currentRoute  = null;
let currentEntry;
const routeViews = new Map();
let currentCleanup = null; // cleanup-functie van het huidige scherm (bijv. renderHome)

// ── Navigeer naar een route (force=true herlaadt ook het huidige scherm) ──────
export function navigate(route, { force = false, history: addHistory = true, target = {} } = {}) {
  if (!ROUTES[route]) return;
  if (route === currentRoute && !force) return;
  const main = document.getElementById('main-view');
  const previousRoute = currentRoute;
  if (currentEntry) {
    routeViews.set(currentEntry, {
      scrollTop: main.scrollTop,
      mapView: previousRoute === 'map' ? getMapView(main) : undefined,
    });
  }
  if (addHistory && previousRoute && route !== previousRoute) recordRoute(route);
  currentEntry = history.state?.birdspotEntry;
  const saved = routeViews.get(currentEntry);
  const direct = Object.keys(target).length > 0;
  if (saved?.mapView && route === 'map' && !direct) target = { mapView: saved.mapView };
  currentRoute = route;

  // Roep cleanup van het vorige scherm aan vóór we de DOM wissen.
  // Dit stopt timers, geeft blob-URL's vrij en zet destroyed=true zodat
  // lopende async-callbacks stil stoppen zonder het nieuwe scherm te raken.
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Scherm wisselen
  main.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen active';
  screen.id = `screen-${route}`;
  main.appendChild(screen);
  let result;
  try { result = ROUTES[route].render(screen, { ...target, onSearchSelect: selectSearchResult }); }
  catch (error) {
    console.error('[Aviandra] Scherm openen mislukt:', route, error);
    screen.innerHTML = '<section class="route-recovery"><h1>Dit scherm kon niet worden geopend</h1><p>Je gegevens zijn niet verwijderd. Probeer het scherm opnieuw te openen.</p><button type="button">Opnieuw proberen</button></section>';
    screen.querySelector('button').addEventListener('click',()=>navigate(route,{force:true,history:false}));
  }
  // Sla cleanup-functie op als de render er één retourneert (bijv. renderHome)
  if (typeof result === 'function') currentCleanup = result;

  // Navigatie-state
  document.querySelectorAll('.nav-item').forEach(btn => {
    const active = btn.dataset.route === route;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });

  // FAB
  const fab = document.getElementById('fab');
  if (fab) fab.hidden = !ROUTES[route].fab;

  // Scroll naar top
  const restoreTop = direct || route === 'species' ? 0 : saved?.scrollTop || 0;
  main.scrollTo({ top: restoreTop, behavior: 'instant' });
  // UX-02B: schermen die asynchroon opbouwen (Mijn waarnemingen) krijgen de bewaarde scrollpositie
  // pas terug als de inhoud er staat; anders zou de browser hem op 0 afkappen.
  if (restoreTop > 0 && result && typeof result.then === 'function') {
    result.then(() => {
      if (screen.isConnected && currentRoute === route && main.scrollTop < restoreTop) main.scrollTo({ top: restoreTop, behavior: 'instant' });
    }).catch(() => {});
  }
  if (target.section && route !== 'map') {
    Promise.resolve(result).then(() => {
      if (screen.isConnected) focusSection(screen, target.section);
    }).catch(() => showToast('Dit onderdeel kon niet worden geopend.', 'error'));
  }
}

function focusSection(screen, id) {
  const section = screen.querySelector('#' + id);
  if (!section) return;
  if (!section.matches('button, input, a[href], select')) section.tabIndex = -1;
  section.scrollIntoView({ block: 'center' });
  section.focus({ preventScroll: true });
}

function selectSearchResult({ route, ...target }) {
  if (route === 'add') {
    // Dedicated shortcuts open the existing form directly; only the central + offers a choice.
    openObservationForm();
    return;
  }
  navigate(route, { force: Object.keys(target).some(key => target[key] !== undefined), target });
}

// ── Navigatie-klikken ─────────────────────────────────────
document.getElementById('app-nav').addEventListener('click', e => {
  const btn = e.target.closest('.nav-item');
  if (!btn) return;
  navigate(btn.dataset.route);
});

// ── Centrale formule: een opslagroute, ongeacht gekozen ingang ─────
function openObservationForm(initial = {}) {
  openAddSheet({
    initial,
    onSaved: () => {
      if (currentRoute === 'home') navigate('home', { force: true });
      else navigate('sightings', { force: true });
    },
  });
}

// ── De centrale + biedt de twee herkenbare keuzes ──────────
document.getElementById('fab').addEventListener('click', () => {
  openQuickAdd({
    onChoose: openObservationForm,
    onSoundSaved: sightings => {
      if (!sightings.length) {
        navigate('species', { force: true });
        showToast('Eigen opname bij Mijn soortgeluiden bewaard', 'success');
        return;
      }
      navigate('map', { force: true, target: { sightingId: sightings[0].id } });
      const count = sightings.length;
      showToast(count === 1 ? 'Waarneming gepind' : `${count} waarnemingen gepind`, 'success');
    },
  });
});

// ── Toast utility ─────────────────────────────────────────
// UX-03C: één meldingslaag met een toon. Kleur is nooit het enige signaal: elke toon heeft
// een eigen teken en een fout wordt als 'alert' voorgelezen. Succesgroen alleen na een bewezen geslaagde actie.
// showToast(msg) · showToast(msg, 6000) · showToast(msg, 'error') · showToast(msg, 'warn', 6000)
let toastTimer = null;
const TOAST_TONES = { info: 2800, success: 2800, warn: 5000, error: 6000 };
export function showToast(msg, opt, maybeDuration) {
  const tone = typeof opt === 'string' && opt in TOAST_TONES ? opt : 'info';
  const duration = typeof opt === 'number' ? opt : (maybeDuration || TOAST_TONES[tone]);
  let toast = document.querySelector('.toast:not(.app-update)');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  toast.dataset.tone = tone;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}
// Profiel en kaart riepen window.__birdspot.toast aan, maar die bestond niet: een mislukte plekhernoeming
// op de kaart bleef daardoor stil. Nu één gedeelde laag.
window.__birdspot = Object.assign(window.__birdspot || {}, { toast: showToast });

// ── Start ─────────────────────────────────────────────────
const initialRoute = installNavigation({navigate,current:()=>currentRoute,currentEntry:()=>currentEntry,toast:showToast});
// Ronde 2B-afronding: plekken uit IndexedDB laden (en migreren) vóór de eerste weergave.
// Hangt de database (bijv. een oudere versie in een ander tabblad blokkeert de upgrade), dan na
// 1,5 s toch starten; schrijven wacht dan op IndexedDB en verliest niets.
addEventListener('birdspot-db-blocked', () => showToast('Sluit andere Aviandra-tabbladen om de update af te ronden', 'warn', 6000));
// Herstelronde 2B (P1): een import of Terugzetten die door een weggevallen tabblad niet afkwam, eerst
// afronden (terug- of doorrollen) onder de datalock — dus na een lopende bewerking in een ander tabblad.
// Staat de markering, dan wacht de app daar volledig op vóór hij gegevens gebruikt of wijzigt.
const recovery = withDataLock(() => recoverOperations()).catch(error => {
  console.error('[journaal] herstel', error);
  showToast('Een onderbroken herstelactie kon niet worden afgerond. Herlaad Aviandra.', 'error', 8000);
});
// Een schrijver die op een halve herstelstand stuitte (favorieten e.d.): melden en het herstel afronden.
let recoveryNotice = null;
addEventListener('birdspot-recovery-pending', () => {
  showToast('Een onderbroken herstelactie wordt eerst afgerond. Er is niets gewijzigd; probeer het zo opnieuw.', 'warn', 6000);
  recoveryNotice ??= withDataLock(() => recoverOperations()).catch(error => console.error('[journaal] herstel', error)).finally(() => { recoveryNotice = null; });
});
if (hasPendingMarker()) await recovery;
else await Promise.race([recovery, new Promise(resolve => setTimeout(resolve, 1500))]);
await Promise.race([initPlaces().catch(error => console.error('[places] init', error)), new Promise(resolve => setTimeout(resolve, 1500))]);
navigate(ROUTES[initialRoute] ? initialRoute : 'home',{history:false});
// Splash waits until the application home route is actually initialized.
window.dispatchEvent(new Event('birdspot:ready'));

