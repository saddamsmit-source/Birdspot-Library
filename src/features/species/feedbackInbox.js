import { SPECIES } from '../../data/species.js';
import { assetUrl } from '../../utils/assetUrl.js';

const names = new Map(SPECIES.map(s => [s.id, s.nameNL]));
const roles = {
  hero: 'Hoofdfoto', adult: 'Volwassen', adult_m: 'Mannetje', adult_f: 'Vrouwtje',
  juv: 'Juveniel', breeding: 'Broedkleed', winter: 'Winterkleed', eclipse: 'Eclipskleed',
  jaarling: 'Jaarling', neutral: 'In vlucht',
};

function slotLabel(slot) {
  const flight = slot.startsWith('flight-');
  const key = flight ? slot.slice(7) : slot;
  if (!Object.hasOwn(roles, key)) return null;
  const label = roles[key];
  return flight && label !== 'In vlucht' ? `${label} · in vlucht` : label;
}

function renderEntry(target, entry) {
  if (!names.has(entry?.speciesId) || typeof entry.slot !== 'string' || !slotLabel(entry.slot) ||
    entry.consent !== true || typeof entry.photo !== 'string' || entry.photo.length > 2100000 ||
    !/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+={0,2}$/.test(entry.photo)) {
    throw new Error('Dit bestand is geen geldig Aviandra-fotovoorstel.');
  }
  const card = document.createElement('article');
  const title = document.createElement('h2');
  title.textContent = names.get(entry.speciesId);
  const slot = document.createElement('p');
  slot.textContent = slotLabel(entry.slot);
  const image = document.createElement('img');
  image.src = entry.photo;
  image.alt = `${title.textContent} · ${slot.textContent}`;
  const comment = document.createElement('p');
  comment.textContent = typeof entry.comment === 'string' ? entry.comment.slice(0, 500) : '';
  card.append(title, slot, image);
  if (comment.textContent) card.append(comment);
  target.replaceChildren(card);
}

const form = document.querySelector('#inboxLogin');
const status = document.querySelector('#inboxStatus');
const items = document.querySelector('#inboxItems');
let session;

form.addEventListener('submit', async event => {
  event.preventDefault();
  session?.abort();
  session = new AbortController();
  const active = session;
  const {signal} = active;
  let key = form.querySelector('input').value;
  items.replaceChildren();
  form.querySelector('input').value = '';
  status.textContent = 'Inbox laden…';
  const read = async (suffix = '') => {
    const response = await fetch(assetUrl('/api/photo-feedback' + suffix), {
      headers: {Authorization: `Bearer ${key}`}, signal, cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  };
  try {
    const {items: entries} = await read();
    status.textContent = entries.length ? `${entries.length} ontvangen` : 'Nog geen fotovoorstellen.';
    for (const entry of entries) {
      const article = document.createElement('article');
      const button = document.createElement('button');
      const date = new Date(entry.receivedAt).toLocaleString('nl-NL');
      button.textContent = `Bekijk voorstel · ${date}`;
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const result = await read('?id=' + encodeURIComponent(entry.id));
          renderEntry(article, result);
        } catch (error) {
          if (!signal.aborted) status.textContent = error.message;
          button.disabled = false;
        }
      });
      article.append(button);
      items.append(article);
    }
  } catch (error) {
    key = '';
    if (!signal.aborted) status.textContent = error instanceof SyntaxError ? 'De inbox is nog niet verbonden.' : error.message;
  }
});

document.querySelector('#feedbackFile').addEventListener('change', async event => {
  const [file] = event.target.files;
  if (!file) return;
  const status = document.querySelector('#fileStatus');
  try {
    if (file.size > 2100000) throw new Error('Dit fotovoorstel is te groot.');
    const entry = JSON.parse(await file.text());
    if (entry.format !== 'birdspot-photo-feedback') throw new Error('Kies een Aviandra-fotovoorstel.');
    renderEntry(document.querySelector('#manualItems'), entry);
    status.textContent = '';
  } catch {
    status.textContent = 'Dit fotovoorstel kon niet worden geopend.';
  } finally {
    event.target.value = '';
  }
});
