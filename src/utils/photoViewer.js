import { escHtml } from './html.js';
import { closePhotoInfo } from './photoInfo.js';

const SWIPE_MIN_PX = 48;     // horizontale afstand voor een fotowissel
const SWIPE_MAX_MS = 900;    // langzaam slepen telt niet als swipe

/** Open the same zoomable viewer for guide images and personal photos.
 *
 * FOT-01 (24-11-2026): met `items` (2 of meer) wordt dezelfde kijker een galerij:
 * vorige/volgende-knoppen, rol + teller ("Vrouwtje · 2 van 3"), pijltoetsen en swipen.
 * Swipen wisselt alleen bij 1× zoom; ingezoomd blijft een horizontaal gebaar verschuiven.
 * Zonder `items` werkt de kijker exact als voorheen.
 * items: [{url, alt, label, photoInfo, trigger}]
 */
export function openPhotoViewer({
  url, alt, trigger, photoInfo, onClose, label = 'Vogelfoto bekijken', closeLabel = 'Sluit foto',
  items = null, index = 0,
}) {
  const gallery = Array.isArray(items) && items.length > 1 ? items : null;
  let current = gallery ? Math.max(0, Math.min(gallery.length - 1, Number(index) || 0)) : 0;
  const itemAt = i => gallery ? gallery[i] : {url, alt, photoInfo, trigger};

  const dialog = document.createElement('div');
  dialog.className = 'signature-lightbox sd-photo-viewer' + (gallery ? ' is-gallery' : '');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', label);
  dialog.innerHTML = `
    <button type="button" class="signature-lightbox-close" aria-label="${escHtml(closeLabel)}">×</button>
    <div class="sd-photo-viewport" tabindex="0" aria-label="Vogelfoto, verschuif na het inzoomen">
      <div class="sd-photo-stage"><div class="sd-photo-frame"><img alt="" draggable="false"></div></div>
    </div>
    ${gallery ? `
    <button type="button" class="sd-photo-step" data-step="-1" aria-label="Vorige foto">‹</button>
    <button type="button" class="sd-photo-step" data-step="1" aria-label="Volgende foto">›</button>
    <p class="sd-photo-caption" aria-live="polite"><strong></strong><span></span></p>` : ''}
    <div class="sd-photo-zoom" role="group" aria-label="Fotobediening">
      <button type="button" data-turn="-1" aria-label="Draai linksom">↶</button>
      <button type="button" data-zoom="out" aria-label="Uitzoomen">−</button>
      <button type="button" data-zoom="reset" aria-label="Zoom herstellen">1×</button>
      <button type="button" data-zoom="in" aria-label="Inzoomen">+</button>
      <button type="button" data-turn="1" aria-label="Draai rechtsom">↷</button>
    </div>`;
  document.body.appendChild(dialog);
  const viewport = dialog.querySelector('.sd-photo-viewport');
  const stage = dialog.querySelector('.sd-photo-stage');
  const frame = dialog.querySelector('.sd-photo-frame');
  let image = dialog.querySelector('img');
  const zoomIn = dialog.querySelector('[data-zoom="in"]');
  const zoomOut = dialog.querySelector('[data-zoom="out"]');
  const resetZoom = dialog.querySelector('[data-zoom="reset"]');
  const rotateButtons = [...dialog.querySelectorAll('[data-turn]')];
  const stepButtons = [...dialog.querySelectorAll('[data-step]')];
  const caption = dialog.querySelector('.sd-photo-caption');
  let zoom = 1;
  let turns = 0;
  let drag = null;
  let swipe = null;
  let suppressClick = false;

  function setZoom(next, center = false) {
    if (!image.naturalWidth || !viewport.clientWidth || !viewport.clientHeight) return;
    const sideways = turns % 2 !== 0;
    const naturalWidth = sideways ? image.naturalHeight : image.naturalWidth;
    const naturalHeight = sideways ? image.naturalWidth : image.naturalHeight;
    const ratio = Math.min(viewport.clientWidth / naturalWidth, viewport.clientHeight / naturalHeight, 1);
    const centerX = center ? 0.5 : (viewport.scrollLeft + viewport.clientWidth / 2) / stage.offsetWidth;
    const centerY = center ? 0.5 : (viewport.scrollTop + viewport.clientHeight / 2) / stage.offsetHeight;
    zoom = Math.max(1, Math.min(4, next));
    const scale = ratio * zoom;
    frame.style.width = `${Math.round(naturalWidth * scale)}px`;
    frame.style.height = `${Math.round(naturalHeight * scale)}px`;
    image.style.width = `${Math.round(image.naturalWidth * scale)}px`;
    image.style.transform = `translate(-50%, -50%) rotate(${turns * 90}deg)`;
    viewport.scrollLeft = centerX * stage.offsetWidth - viewport.clientWidth / 2;
    viewport.scrollTop = centerY * stage.offsetHeight - viewport.clientHeight / 2;
    viewport.classList.toggle('is-zoomed', zoom > 1);
    zoomIn.disabled = zoom === 4;
    zoomOut.disabled = zoom === 1;
    resetZoom.textContent = `${zoom}×`;
  }

  /** Laad foto i in dezelfde kijker: zoom en draaiing terug naar begin, credits van deze foto. */
  function show(i) {
    current = i;
    const item = itemAt(i);
    zoom = 1;
    turns = 0;
    viewport.classList.remove('is-zoomed');
    for (const button of [zoomOut, zoomIn, resetZoom, ...rotateButtons]) button.disabled = true;
    resetZoom.textContent = '1×';
    frame.removeAttribute('style');
    const fresh = document.createElement('img');
    fresh.alt = item.alt || '';
    fresh.draggable = false;
    dialog.querySelector('.sd-photo-error')?.remove();
    (image.isConnected ? image : frame.querySelector('img'))?.remove();
    frame.appendChild(fresh);
    image = fresh;
    image.addEventListener('load', () => {
      if (image !== fresh) return;
      for (const button of [resetZoom, ...rotateButtons]) button.disabled = false;
      setZoom(1, true);
    }, {once: true});
    image.addEventListener('error', () => {
      if (image !== fresh) return;
      const message = document.createElement('p');
      message.className = 'sd-photo-error';
      message.setAttribute('role', 'status');
      message.textContent = 'Deze foto is nu niet beschikbaar.';
      frame.appendChild(message);
      fresh.hidden = true;
    }, {once: true});
    image.src = item.url;
    // Fotocredits horen altijd bij de foto die in beeld is.
    dialog.querySelector(':scope > .photo-info')?.remove();
    if (item.photoInfo) {
      const copy = item.photoInfo.cloneNode(true);
      copy.open = false;
      dialog.appendChild(copy);
    }
    if (gallery) {
      const role = item.label || 'Foto';
      caption.querySelector('strong').textContent = role;
      caption.querySelector('span').textContent = `${i + 1} van ${gallery.length}`;
      stepButtons[0].disabled = i === 0;
      stepButtons[1].disabled = i === gallery.length - 1;
      stepButtons[0].setAttribute('aria-label', i === 0 ? 'Vorige foto (dit is de eerste)' : `Vorige foto: ${gallery[i - 1].label || 'foto'}`);
      stepButtons[1].setAttribute('aria-label', i === gallery.length - 1 ? 'Volgende foto (dit is de laatste)' : `Volgende foto: ${gallery[i + 1].label || 'foto'}`);
      dialog.setAttribute('aria-label', `${label}: ${role}, ${i + 1} van ${gallery.length}`);
    }
  }

  function step(delta) {
    if (!gallery) return false;
    const next = current + delta;
    if (next < 0 || next >= gallery.length) return false;
    const hadFocus = document.activeElement;
    show(next);
    // Focus blijft op een bruikbare knop als de vorige uitgeschakeld raakt.
    if (hadFocus?.disabled) (stepButtons.find(button => !button.disabled) || viewport).focus({preventScroll: true});
    return true;
  }

  viewport.addEventListener('pointerdown', event => {
    suppressClick = false;
    swipe = null;
    if (gallery && zoom === 1 && event.isPrimary && (event.pointerType !== 'mouse' || event.button === 0)) {
      swipe = {id: event.pointerId, x: event.clientX, y: event.clientY, t: performance.now()};
    }
    if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop};
  });
  viewport.addEventListener('pointermove', event => {
    if (swipe?.id === event.pointerId && Math.abs(event.clientX - swipe.x) > 8) suppressClick = true;
    if (drag?.id !== event.pointerId || !event.buttons) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!suppressClick && Math.hypot(dx, dy) < 5) return;
    if (!suppressClick) viewport.setPointerCapture(event.pointerId);
    suppressClick = true;
    viewport.scrollLeft = drag.left - dx;
    viewport.scrollTop = drag.top - dy;
  });
  function endDrag(event) {
    drag = null;
    const start = swipe;
    swipe = null;
    // Alleen bij 1× zoom: een duidelijke horizontale veeg wisselt van foto.
    if (!start || start.id !== event.pointerId || event.type !== 'pointerup' || zoom !== 1) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5 && performance.now() - start.t <= SWIPE_MAX_MS) {
      suppressClick = true;
      step(dx < 0 ? 1 : -1);
    }
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  show(current);
  const resize = new ResizeObserver(() => setZoom(zoom));
  resize.observe(viewport);
  function close(restoreFocus = true) {
    if (!dialog.isConnected) return;
    resize.disconnect();
    window.removeEventListener('keydown', onKey, true);
    dialog.remove();
    // Terug naar de foto die het laatst in beeld was, zonder de soortkaart te verschuiven.
    const back = itemAt(current).trigger?.isConnected ? itemAt(current).trigger : trigger;
    if (restoreFocus) back?.focus({preventScroll:true});
    onClose?.();
  }
  function onKey(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (!closePhotoInfo(dialog)) close();
    }
    // Pijltoetsen wisselen bij 1×; ingezoomd blijven ze de foto verschuiven (standaard scrollen).
    if (gallery && zoom === 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        !event.target.closest?.('.photo-info')) {
      event.stopPropagation();
      if (step(event.key === 'ArrowRight' ? 1 : -1)) event.preventDefault();
    }
    if (event.key !== 'Tab') return;
    // Keep keyboard focus inside the viewer, including when a map sheet is behind it.
    event.stopPropagation();
    const controls = [...dialog.querySelectorAll('button:not(:disabled), [tabindex="0"], summary, a[href]')]
      .filter(control => control.getClientRects().length);
    const boundary = event.shiftKey ? controls[0] : controls.at(-1);
    if (document.activeElement === boundary || !controls.includes(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? controls.at(-1) : controls[0]).focus();
    }
  }
  window.addEventListener('keydown', onKey, true);
  dialog.querySelector('.signature-lightbox-close').focus();
  dialog.addEventListener('click',event=>{
    if (suppressClick && viewport.contains(event.target)) {
      suppressClick = false;
      return;
    }
    const turn = event.target.dataset.turn;
    const stepButton = event.target.closest('[data-step]');
    if (stepButton) step(Number(stepButton.dataset.step));
    else if (turn) {
      turns = (turns + Number(turn) + 4) % 4;
      setZoom(zoom, true);
    } else if (event.target === dialog || event.target === stage || event.target === viewport ||
        event.target.closest('.signature-lightbox-close')) close();
    else if (event.target === zoomIn) setZoom(zoom * 2);
    else if (event.target === zoomOut) setZoom(zoom / 2);
    else if (event.target === resetZoom) setZoom(1);
    else if (event.target === image) setZoom(zoom === 1 ? 2 : 1);
  });
  return close;
}
