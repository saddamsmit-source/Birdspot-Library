import { escHtml } from './html.js';

function licenseHref(photo) {
  if (photo.licenseUrl) return photo.licenseUrl;
  const cc = /^CC (BY(?:-SA)?) (\d\.\d)(?: ([A-Z]{2}))?$/.exec(photo.license);
  if (cc) return `https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${cc[2]}/${cc[3] ? cc[3].toLowerCase() + '/' : ''}`;
  if (/^CC0(?: 1\.0)?$/.test(photo.license)) return 'https://creativecommons.org/publicdomain/zero/1.0/';
  return '';
}

function link(url, label) {
  return /^https:\/\//i.test(url) ?
    `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${escHtml(label)}</a>` :
    escHtml(label);
}

export function photoInfoMarkup(photo) {
  if (!photo?.author || !photo.license) return '';
  const changes = photo.modifications?.startsWith('Resized to max') ?
    (photo.modifications.includes('no crop') ? 'Verkleind en omgezet naar WebP zonder uitsnede' :
      'Verkleind en omgezet naar WebP') : photo.modifications;
  return `<details class="photo-info">
    <summary title="Foto-informatie" aria-label="Foto-informatie"><span aria-hidden="true">i</span></summary>
    <div class="photo-info__panel">
      <span class="photo-info__title">Foto-informatie</span>
      ${photo.file ? `<span>${escHtml(photo.file)}</span>` : ''}
      <span>Maker: ${escHtml(photo.author)}</span>
      <span>Licentie: ${link(licenseHref(photo), photo.license)}</span>
      ${photo.source ? `<span>${link(photo.source, 'Open fotobron')}</span>` : ''}
      ${changes ? `<span>Bewerking: ${escHtml(changes)}</span>` : ''}
    </div>
  </details>`;
}

export function closePhotoInfo(root) {
  const info = root.querySelector('.photo-info[open]:focus-within') ??
    [...root.querySelectorAll('.photo-info[open]')].find(item => item.getClientRects().length);
  if (!info) return false;
  info.open = false;
  info.querySelector('summary').focus({ preventScroll: true });
  return true;
}
