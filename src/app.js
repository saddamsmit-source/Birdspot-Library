/**
 * BIRDSPOT LIBRARY — App bootstrap & router
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
import { renderMap }        from './features/map/view.js';
import { renderProfile }    from './features/profile/view.js';
import { renderMedia }      from './features/media/view.js';
import { renderJournal }    from './features/journal/view.js';
import { renderInsights }   from './features/insights/view.js';
import { renderFilmStudio } from './features/film/view.js';
import { openAddSheet }     from './features/sightings/addSheet.js';

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
let currentCleanup = null; // cleanup-functie van het huidige scherm (bijv. renderHome)

// ── Navigeer naar een route (force=true herlaadt ook het huidige scherm) ──────
export function navigate(route, { force = false, history: addHistory = true, target = {} } = {}) {
  if (!ROUTES[route]) return;
  if (route === currentRoute && !force) return;
  const previousRoute = currentRoute;
  currentRoute = route;

  // Roep cleanup van het vorige scherm aan vóór we de DOM wissen.
  // Dit stopt timers, geeft blob-URL's vrij en zet destroyed=true zodat
  // lopende async-callbacks stil stoppen zonder het nieuwe scherm te raken.
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Scherm wisselen
  const main = document.getElementById('main-view');
  main.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen active';
  screen.id = `screen-${route}`;
  main.appendChild(screen);
  let result;
  try { result = ROUTES[route].render(screen, { ...target, onSearchSelect: selectSearchResult }); }
  catch (error) {
    console.error('[Birdspot] Scherm openen mislukt:', route, error);
    screen.innerHTML = '<section class="route-recovery"><h1>Dit scherm kon niet worden geopend</h1><p>Je gegevens zijn niet verwijderd. Probeer het scherm opnieuw te openen.</p><button type="button">Opnieuw proberen</button></section>';
    screen.querySelector('button').addEventListener('click',()=>navigate(route,{force:true,history:false}));
  }
  if (addHistory && previousRoute && route !== previousRoute) recordRoute(route);
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
  main.scrollTo({ top: 0 });
  if (target.section && route !== 'map') {
    Promise.resolve(result).then(() => {
      if (screen.isConnected) focusSection(screen, target.section);
    }).catch(() => showToast('Dit onderdeel kon niet worden geopend.'));
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
    document.getElementById('fab').click();
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

// ── FAB-klik → waarneming toevoegen ───────────────────────
document.getElementById('fab').addEventListener('click', () => {
  openAddSheet({
    onSaved: () => {
      // Als we op home staan: herlaad home zodat recentSightings bijgewerkt is.
      // Als we op sightings staan (of ergens anders): navigeer naar sightings.
      if (currentRoute === 'home') {
        navigate('home', { force: true });
      } else {
        navigate('sightings', { force: true });
      }
    },
  });
});

// ── Toast utility ─────────────────────────────────────────
let toastTimer = null;
export function showToast(msg, duration = 2800) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Start ─────────────────────────────────────────────────
const initialRoute = installNavigation({navigate,current:()=>currentRoute,toast:showToast});
navigate(ROUTES[initialRoute] ? initialRoute : 'home',{history:false});
// Splash waits until the application home route is actually initialized.
window.dispatchEvent(new Event('birdspot:ready'));

