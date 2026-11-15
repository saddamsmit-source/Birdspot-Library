import { deletePhoto, getPhotosBySpecies, savePhoto } from '../../data/db.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { escHtml } from '../../utils/html.js';

const MAX_UPLOAD = 15 * 1024 * 1024;
const MAX_JPEG = 1500000;
const MAX_SIDE = 1600;

export function personalGuideSlot(slot, label, stock = '') {
  return `<div class="sd-guide-personal" data-guide-slot="${escHtml(slot)}" data-slot-label="${escHtml(label)}">
    <div class="sd-guide-stock">${stock}</div>
    <div class="sd-guide-own" hidden></div>
    <button type="button" class="sd-guide-action">+ Eigen foto<span class="sr-only"> · ${escHtml(label)}</span></button>
  </div>`;
}

function recordId(speciesId, slot) {
  return `guide-${speciesId}-${slot}`;
}

async function cleanPhoto(file) {
  if (!file.size || file.size > MAX_UPLOAD || !/^image\/(?:jpeg|png|webp|gif|avif|heic|heif)$/.test(file.type)) {
    throw new Error('Kies een foto van maximaal 15 MB, bijvoorbeeld JPG, PNG of WebP.');
  }
  let image;
  try {
    image = await createImageBitmap(file);
  } catch {
    throw new Error('Deze foto kan op dit toestel niet worden geopend.');
  }
  try {
    if (!image.width || !image.height || image.width * image.height > 48000000) {
      throw new Error('Deze foto is te groot. Kies een kleinere versie.');
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d', {alpha: false});
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.84));
    if (!blob || blob.size > MAX_JPEG) throw new Error('De foto kon niet worden verkleind.');
    return blob;
  } finally {
    image.close();
  }
}

function readAsDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function mountPersonalGuide(sheet, species) {
  const scopes = new Map([...sheet.querySelectorAll('[data-guide-slot]')].map(el => [el.dataset.guideSlot, el]));
  const photos = new Map();
  const urls = new Map();
  const dialog = document.createElement('dialog');
  dialog.className = 'sd-guide-editor';
  dialog.setAttribute('aria-labelledby', 'guidePhotoTitle');
  dialog.innerHTML = `<form>
    <div class="sd-guide-editor-head"><h2 id="guidePhotoTitle"></h2><button type="button" class="sd-guide-close" aria-label="Sluit fotovenster">×</button></div>
    <label for="guidePhotoFile">Kies een foto die je zelf hebt gemaakt</label>
    <input id="guidePhotoFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif">
    <p class="sd-guide-hint">‘Gebruik in mijn gids’ slaat de foto op dit toestel op. Insturen doe je apart.</p>
    <button type="submit" class="sd-guide-save">Gebruik in mijn gids</button>
    <button type="button" class="sd-guide-reset" hidden>Herstel standaardfoto</button>
    <details class="sd-guide-feedback">
      <summary>Foto voorstellen aan de beheerder</summary>
      <label for="guidePhotoComment">Toelichting (optioneel)</label>
      <textarea id="guidePhotoComment" maxlength="500" rows="2"></textarea>
      <label class="sd-guide-consent"><input type="checkbox"> Ik heb deze foto gemaakt en geef toestemming om die voor de gids te beoordelen.</label>
      <button type="button" class="sd-guide-submit">Stuur foto ter beoordeling</button>
      <button type="button" class="sd-guide-download" hidden>Download fotovoorstel</button>
    </details>
    <p class="sd-guide-status" role="status"></p>
  </form>`;
  sheet.append(dialog);
  const fileInput = dialog.querySelector('input[type="file"]');
  const save = dialog.querySelector('.sd-guide-save');
  const reset = dialog.querySelector('.sd-guide-reset');
  const send = dialog.querySelector('.sd-guide-submit');
  const download = dialog.querySelector('.sd-guide-download');
  const status = dialog.querySelector('.sd-guide-status');
  const consent = dialog.querySelector('input[type="checkbox"]');
  const feedback = dialog.querySelector('.sd-guide-feedback');
  const comment = dialog.querySelector('textarea');
  let slot, busy = false, closed = false, draft;

  function redraw(key) {
    const el = scopes.get(key);
    const own = el.querySelector('.sd-guide-own');
    const stock = el.querySelector('.sd-guide-stock');
    const record = photos.get(key);
    const oldUrl = urls.get(key);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    urls.delete(key);
    own.replaceChildren();
    stock.hidden = Boolean(record);
    own.hidden = !record;
    const label = el.dataset.slotLabel;
    el.querySelector('.sd-guide-action').innerHTML = (record ? 'Eigen foto wijzigen' : '+ Eigen foto') +
      `<span class="sr-only"> · ${escHtml(label)}</span>`;
    if (!record) return;
    const url = URL.createObjectURL(record.blob);
    urls.set(key, url);
    const button = document.createElement('button');
    button.className = 'sd-field-photo';
    button.type = 'button';
    button.dataset.guideImage = url;
    const img = document.createElement('img');
    img.alt = `${species.nameNL} · eigen foto · ${label}`;
    img.src = url;
    button.append(img);
    const caption = document.createElement('small');
    caption.textContent = 'Eigen foto';
    own.append(button, caption);
  }

  const loaded = getPhotosBySpecies(species.id).then(records => {
    if (closed) return;
    for (const [key] of scopes) {
      const record = records.find(r => r.id === recordId(species.id, key) && r.blob instanceof Blob && r.blob.type === 'image/jpeg' && !r.sightingId);
      if (!record) continue;
      photos.set(key, record);
      redraw(key);
    }
  }).catch(() => {});

  function toggleBusy(value) {
    busy = value;
    for (const button of [save, reset, send, download]) button.disabled = value;
    fileInput.disabled = value;
  }

  function closeEditor() {
    if (!busy) dialog.close();
  }

  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    closeEditor();
  });
  dialog.addEventListener('cancel', event => {
    if (busy) event.preventDefault();
  });
  dialog.querySelector('.sd-guide-close').addEventListener('click', closeEditor);
  dialog.addEventListener('input', () => {
    draft = undefined;
    download.hidden = true;
  });
  sheet.addEventListener('click', event => {
    const el = event.target.closest('.sd-guide-action')?.closest('[data-guide-slot]');
    if (!el || dialog.open) return;
    slot = el.dataset.guideSlot;
    dialog.querySelector('form').reset();
    dialog.querySelector('h2').textContent = el.dataset.slotLabel;
    status.textContent = '';
    download.hidden = true;
    draft = undefined;
    feedback.open = false;
    reset.hidden = !photos.has(slot);
    dialog.showModal();
    loaded.then(() => { if (dialog.open) reset.hidden = !photos.has(slot); });
  });

  async function operate(task) {
    if (busy) return;
    toggleBusy(true);
    status.textContent = '';
    try {
      await loaded;
      if (!closed) await task();
    } catch (error) {
      if (!closed) status.textContent = error instanceof Error ? error.message : 'De foto kon niet worden verwerkt.';
    } finally {
      if (!closed) toggleBusy(false);
    }
  }

  dialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    operate(async () => {
      const file = fileInput.files[0];
      if (!file) throw new Error('Kies eerst een foto.');
      const blob = await cleanPhoto(file);
      if (closed) return;
      const record = {
        id: recordId(species.id, slot), speciesId: species.id, blob, type: blob.type,
        filename: `${species.id}-${slot}.jpg`, addedAt: new Date().toISOString(),
      };
      await savePhoto(record);
      if (closed) return;
      photos.set(slot, record);
      redraw(slot);
      dialog.close();
    });
  });

  reset.addEventListener('click', () => operate(async () => {
    await deletePhoto(recordId(species.id, slot));
    if (closed) return;
    photos.delete(slot);
    redraw(slot);
    dialog.close();
  }));

  send.addEventListener('click', () => operate(async () => {
    download.hidden = true;
    if (!consent.checked) throw new Error('Bevestig eerst dat je de fotograaf bent.');
    if (!draft) {
      const file = fileInput.files[0];
      const blob = file ? await cleanPhoto(file) : photos.get(slot)?.blob;
      if (!blob) throw new Error('Kies eerst een foto.');
      if (closed) return;
      draft = {
        format: 'birdspot-photo-feedback', id: crypto.randomUUID(), speciesId: species.id,
        slot, consent: true, comment: comment.value.trim(), photo: await readAsDataURL(blob),
      };
    }
    try {
      const response = await fetch(assetUrl('/api/photo-feedback'), {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(draft),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok || (await response.json()).id !== draft.id) throw new Error();
    } catch {
      status.textContent = 'Ontvangst is niet bevestigd. Probeer opnieuw of download het voorstel om het zelf te delen.';
      download.hidden = false;
      return;
    }
    status.textContent = 'Foto ontvangen voor beoordeling.';
    draft = undefined;
  }));

  download.addEventListener('click', () => {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `birdspot-fotovoorstel-${species.id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  return () => {
    closed = true;
    dialog.close();
    for (const url of urls.values()) URL.revokeObjectURL(url);
  };
}
