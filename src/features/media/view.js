/**
 * Birdspot Signature · Media Studio
 * Read-only gallery built from the existing IndexedDB photo store.
 * Media source is always the user's own observations — never stock imagery.
 * Blob URLs belong to this screen and are released on route cleanup.
 */
import { getDB } from '../../data/db.js';
import { getSightings } from '../../data/sightings.js';
import { getPhotoUrl, revokePhotoUrl } from '../../utils/photoUrl.js';
import { escHtml } from '../../utils/html.js';

export function renderMedia(el) {
  let destroyed = false;
  let all = [];
  let currentFilter = 'all';
  let visibleCount = 18;
  const urls = new Map();
  let dialog = null;

  el.classList.add('signature-screen', 'signature-media');
  el.innerHTML =
    '<header class="signature-page-hero signature-page-hero--media">' +
      '<span class="signature-kicker">BIRDSPOT / YOUR ARCHIVE</span>' +
      '<h1>Wildlife Media Studio</h1>' +
      '<p>Jouw vogelfoto’s en -video’s, verzameld op één bijzondere plek.</p>' +
      '<div class="signature-orbit" aria-hidden="true"></div>' +
    '</header>' +
    '<div class="signature-content">' +
      '<div class="signature-section-head"><div><span class="signature-eyebrow">VERZAMELING</span><h2>Mijn vogelmomenten</h2></div>' +
        '<span id="mediaCount" class="signature-count">Laden…</span></div>' +
      '<div class="signature-filterbar" role="group" aria-label="Filter media">' +
        '<button class="signature-filter is-selected" data-media-filter="all" aria-pressed="true">Alles</button>' +
        '<button class="signature-filter" data-media-filter="photo" aria-pressed="false">Foto’s</button>' +
        '<button class="signature-filter" data-media-filter="video" aria-pressed="false">Video’s</button>' +
      '</div>' +
      '<div id="mediaGallery" class="signature-media-grid" aria-live="polite"><p class="signature-empty">Je verzameling wordt geladen…</p></div>' +
      '<button id="mediaMore" class="signature-more" hidden>Meer media bekijken</button>' +
      '<div class="signature-future"><span class="signature-eyebrow">VOLGENDE STAP</span>' +
        '<h3>Van momenten naar een film</h3><p>Een toekomstige Film Studio kan jouw geselecteerde beelden samenbrengen in een persoonlijk vogelverhaal. Videomontage en export zijn in deze fase nog niet beschikbaar.</p></div>' +
    '</div>';

  const gallery = el.querySelector('#mediaGallery');
  const count = el.querySelector('#mediaCount');
  const more = el.querySelector('#mediaMore');

  function releaseGalleryUrls() {
    for (const url of urls.values()) revokePhotoUrl(url);
    urls.clear();
  }

  function draw() {
    if (destroyed) return;
    releaseGalleryUrls();
    const filtered = all.filter(item => currentFilter === 'all' || item.kind === currentFilter);
    count.textContent = filtered.length + (filtered.length === 1 ? ' bestand' : ' bestanden');
    const shown = filtered.slice(0, visibleCount);
    if (!shown.length) {
      gallery.innerHTML = '<div class="signature-empty"><span aria-hidden="true">✧</span><h3>Nog geen media</h3><p>Foto’s en video’s die je aan vogelwaarnemingen toevoegt verschijnen hier automatisch.</p></div>';
    } else {
      gallery.innerHTML = shown.map(item => {
        const url = getPhotoUrl(item.photo);
        if (!url) return '';
        urls.set(item.photo.id, url);
        const name = escHtml(item.name || 'Vogelwaarneming');
        const where = escHtml(item.where || 'Mijn collectie');
        const date = escHtml(item.date || '');
        const frame = item.kind === 'video'
          ? '<video controls playsinline preload="none" src="' + url + '" aria-label="Video: ' + name + '"></video>'
          : '<button class="signature-media-open" data-media-open="' + escHtml(item.photo.id) + '" aria-label="Vergroot foto: ' + name + '"><img src="' + url + '" alt="' + name + '" loading="lazy" decoding="async"></button>';
        return '<article class="signature-media-tile"><div class="signature-media-frame">' + frame +
          '<span class="signature-media-type">' + (item.kind === 'video' ? 'VIDEO' : 'FOTO') + '</span></div>' +
          '<div class="signature-media-meta"><strong>' + name + '</strong><span>' + where + (date ? ' · ' + date : '') + '</span></div></article>';
      }).join('');
    }
    more.hidden = filtered.length <= visibleCount;
  }

  const onClick = event => {
    const filter = event.target.closest('[data-media-filter]');
    if (filter) {
      currentFilter = filter.dataset.mediaFilter;
      visibleCount = 18;
      el.querySelectorAll('[data-media-filter]').forEach(btn => {
        const selected = btn.dataset.mediaFilter === currentFilter;
        btn.classList.toggle('is-selected', selected);
        btn.setAttribute('aria-pressed', String(selected));
      });
      draw();
      return;
    }
    if (event.target.closest('#mediaMore')) {
      visibleCount += 18;
      draw();
      return;
    }
    const open = event.target.closest('[data-media-open]');
    if (!open) return;
    const url = urls.get(open.dataset.mediaOpen);
    if (!url) return;
    const item = all.find(x => x.photo.id === open.dataset.mediaOpen);
    dialog = document.createElement('div');
    dialog.className = 'signature-lightbox';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Foto bekijken');
    dialog.innerHTML = '<button class="signature-lightbox-close" aria-label="Sluiten">×</button>' +
      '<img src="' + url + '" alt="' + escHtml(item?.name || 'Vogelfoto') + '">';
    document.body.appendChild(dialog);
    dialog.querySelector('button').focus();
    dialog.addEventListener('click', e => {
      if (e.target === dialog || e.target.closest('.signature-lightbox-close')) closeLightbox();
    });
  };

  function closeLightbox() { if (dialog) { dialog.remove(); dialog = null; } }
  const onKey = e => { if (e.key === 'Escape') closeLightbox(); };
  el.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);

  (async () => {
    try {
      const [sightings, db] = await Promise.all([getSightings(), getDB()]);
      const photos = await new Promise((resolve, reject) => {
        const req = db.transaction('photos', 'readonly').objectStore('photos').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
      if (destroyed) return;
      const byId = new Map(sightings.map(s => [s.id, s]));
      const byPhoto = new Map();
      sightings.forEach(s => (s.photoIds || []).forEach(id => byPhoto.set(id, s)));
      all = photos.filter(p => p.blob instanceof Blob && /^(image|video)\//.test(p.blob.type || p.type || ''))
        .map(photo => {
          const sighting = byId.get(photo.sightingId) || byPhoto.get(photo.id);
          const kind = (photo.blob.type || photo.type || '').startsWith('video/') ? 'video' : 'photo';
          return { photo, kind, name: sighting?.speciesName || photo.speciesName || '',
            date: sighting?.date || '', where: sighting?.locationName || '' };
        }).sort((a, b) => b.date.localeCompare(a.date));
      draw();
    } catch (_) {
      if (!destroyed) gallery.innerHTML = '<div class="signature-empty"><h3>Media niet beschikbaar</h3><p>Controleer of lokale opslag toegankelijk is en open de Studio opnieuw.</p></div>';
    }
  })();

  return () => {
    destroyed = true;
    el.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    closeLightbox();
    releaseGalleryUrls();
  };
}
