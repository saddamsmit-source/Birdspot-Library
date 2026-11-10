import { escHtml } from './html.js';
import { closePhotoInfo } from './photoInfo.js';

/** Open the same zoomable viewer for guide images and personal photos. */
export function openPhotoViewer({
  url, alt, trigger, photoInfo, onClose, label = 'Vogelfoto bekijken', closeLabel = 'Sluit foto',
}) {
  const dialog = document.createElement('div');
  dialog.className = 'signature-lightbox sd-photo-viewer';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', label);
  dialog.innerHTML = `
    <button type="button" class="signature-lightbox-close" aria-label="${escHtml(closeLabel)}">×</button>
    <div class="sd-photo-viewport" tabindex="0" aria-label="Vogelfoto, verschuif na het inzoomen">
      <div class="sd-photo-stage"><div class="sd-photo-frame"><img alt="${escHtml(alt)}" draggable="false"></div></div>
    </div>
    <div class="sd-photo-zoom" role="group" aria-label="Fotobediening">
      <button type="button" data-turn="-1" aria-label="Draai linksom">↶</button>
      <button type="button" data-zoom="out" aria-label="Uitzoomen">−</button>
      <button type="button" data-zoom="reset" aria-label="Zoom herstellen">1×</button>
      <button type="button" data-zoom="in" aria-label="Inzoomen">+</button>
      <button type="button" data-turn="1" aria-label="Draai rechtsom">↷</button>
    </div>`;
  if (photoInfo) {
    const copy = photoInfo.cloneNode(true);
    copy.open = false;
    dialog.appendChild(copy);
  }
  document.body.appendChild(dialog);
  const viewport = dialog.querySelector('.sd-photo-viewport');
  const stage = dialog.querySelector('.sd-photo-stage');
  const frame = dialog.querySelector('.sd-photo-frame');
  const image = dialog.querySelector('img');
  const zoomIn = dialog.querySelector('[data-zoom="in"]');
  const zoomOut = dialog.querySelector('[data-zoom="out"]');
  const resetZoom = dialog.querySelector('[data-zoom="reset"]');
  const rotateButtons = [...dialog.querySelectorAll('[data-turn]')];
  let zoom = 1;
  let turns = 0;
  let drag = null;
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

  viewport.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop};
  });
  viewport.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId || !event.buttons) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!suppressClick && Math.hypot(dx, dy) < 5) return;
    if (!suppressClick) viewport.setPointerCapture(event.pointerId);
    suppressClick = true;
    viewport.scrollLeft = drag.left - dx;
    viewport.scrollTop = drag.top - dy;
  });
  function endDrag() { drag = null; }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  for (const button of [zoomOut, zoomIn, resetZoom, ...rotateButtons]) button.disabled = true;
  image.addEventListener('load', () => {
    for (const button of [resetZoom, ...rotateButtons]) button.disabled = false;
    setZoom(1, true);
  }, {once: true});
  image.addEventListener('error', () => {
    const message = document.createElement('p');
    message.className = 'sd-photo-error';
    message.setAttribute('role', 'status');
    message.textContent = 'Deze foto is nu niet beschikbaar.';
    image.replaceWith(message);
  }, {once: true});
  image.src = url;
  const resize = new ResizeObserver(() => setZoom(zoom));
  resize.observe(viewport);
  function close(restoreFocus = true) {
    if (!dialog.isConnected) return;
    resize.disconnect();
    window.removeEventListener('keydown', onKey, true);
    dialog.remove();
    if (restoreFocus) trigger?.focus({preventScroll:true});
    onClose?.();
  }
  function onKey(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (!closePhotoInfo(dialog)) close();
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
    if (turn) {
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
