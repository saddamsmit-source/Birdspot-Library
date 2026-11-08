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
      <div class="sd-photo-stage"><img alt="${escHtml(alt)}"></div>
    </div>
    <div class="sd-photo-zoom" role="group" aria-label="Fotozoom">
      <button type="button" data-zoom="out" aria-label="Uitzoomen">−</button>
      <button type="button" data-zoom="reset" aria-label="Zoom herstellen">1×</button>
      <button type="button" data-zoom="in" aria-label="Inzoomen">+</button>
    </div>`;
  if (photoInfo) {
    const copy = photoInfo.cloneNode(true);
    copy.open = false;
    dialog.appendChild(copy);
  }
  document.body.appendChild(dialog);
  const viewport = dialog.querySelector('.sd-photo-viewport');
  const stage = dialog.querySelector('.sd-photo-stage');
  const image = dialog.querySelector('img');
  const zoomIn = dialog.querySelector('[data-zoom="in"]');
  const zoomOut = dialog.querySelector('[data-zoom="out"]');
  const resetZoom = dialog.querySelector('[data-zoom="reset"]');
  let zoom = 1;
  function setZoom(next) {
    if (!image.naturalWidth || !viewport.clientWidth || !viewport.clientHeight) return;
    const ratio = Math.min(viewport.clientWidth / image.naturalWidth, viewport.clientHeight / image.naturalHeight, 1);
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / stage.offsetWidth;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / stage.offsetHeight;
    zoom = Math.max(1, Math.min(4, next));
    const width = Math.round(image.naturalWidth * ratio * zoom);
    stage.style.width = `${Math.max(width, viewport.clientWidth)}px`;
    image.style.width = `${width}px`;
    image.style.minWidth = `${width}px`;
    viewport.scrollLeft = centerX * stage.offsetWidth - viewport.clientWidth / 2;
    viewport.scrollTop = centerY * stage.offsetHeight - viewport.clientHeight / 2;
    image.style.cursor = zoom === 1 ? 'zoom-in' : 'zoom-out';
    zoomIn.disabled = zoom === 4;
    zoomOut.disabled = zoom === 1;
    resetZoom.textContent = `${zoom}×`;
  }
  zoomOut.disabled = true;
  zoomIn.disabled = true;
  resetZoom.disabled = true;
  image.addEventListener('load', () => {
    resetZoom.disabled = false;
    setZoom(1);
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
    if (event.target === dialog || event.target === stage || event.target === viewport ||
        event.target.closest('.signature-lightbox-close')) close();
    else if (event.target === zoomIn) setZoom(zoom * 2);
    else if (event.target === zoomOut) setZoom(zoom / 2);
    else if (event.target === resetZoom) setZoom(1);
    else if (event.target === image) setZoom(zoom === 1 ? 2 : 1);
  });
  return close;
}
