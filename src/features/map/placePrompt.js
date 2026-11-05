/**
 * K4: "Je bent bij <plek> (30 m). Deze plek gebruiken?"
 * Eigen async dialoog (geen browserdialoog, §3.8). De gebruiker beslist; nooit automatisch samenvoegen.
 * Resultaat: { placeId } bij hergebruik, { placeId: null } bij nieuwe plek, of null bij sluiten.
 */
import { loadPlaces, nearestPlace, REUSE_RADIUS_M } from '../../data/places.js';
import { escHtml } from '../../utils/html.js';

export function askPlaceReuse(lat, lon, { places = loadPlaces(), maxM = REUSE_RADIUS_M } = {}) {
  const near = nearestPlace(places, Number(lat), Number(lon), maxM);
  if (!near) return Promise.resolve({ placeId: null, nearest: null });
  return new Promise(resolve => {
    const host = document.createElement('div');
    host.className = 'place-prompt';
    host.innerHTML =
      '<div class="place-prompt__backdrop"></div>' +
      '<div class="place-prompt__card" role="dialog" aria-modal="true" aria-labelledby="placePromptTitle">' +
        '<svg class="place-prompt__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>' +
        `<h3 id="placePromptTitle">Je bent bij ${escHtml(near.place.name)}</h3>` +
        `<p>Deze plek ligt op <b>${near.distanceM} m</b> van je pin. Gebruik je dezelfde plek, dan blijft je kaart overzichtelijk. Je eigen pin blijft bewaard.</p>` +
        '<div class="place-prompt__actions">' +
          '<button type="button" class="place-prompt__new" id="placePromptNew">Nieuwe plek</button>' +
          '<button type="button" class="place-prompt__use" id="placePromptUse">Deze plek gebruiken</button>' +
        '</div></div>';
    document.body.appendChild(host);
    const done = result => { document.removeEventListener('keydown', onKey); host.remove(); resolve(result); };
    const onKey = e => { if (e.key === 'Escape') done({ placeId: null, nearest: near }); };
    document.addEventListener('keydown', onKey);
    host.querySelector('#placePromptUse').addEventListener('click', () => done({ placeId: near.place.id, nearest: near }));
    host.querySelector('#placePromptNew').addEventListener('click', () => done({ placeId: null, nearest: near }));
    host.querySelector('.place-prompt__backdrop').addEventListener('click', () => done({ placeId: null, nearest: near }));
    host.querySelector('#placePromptUse').focus();
  });
}
