import {createHash, timingSafeEqual} from 'node:crypto';
import {get, list, put} from '@vercel/blob';
import sharp from 'sharp';
import {SPECIES} from '../src/data/species.js';

const PREFIX = 'guide-review/';
const MAX_BYTES = 2100000;
const MAX_ENTRIES = 40;
const safeId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const speciesIds = new Set(SPECIES.map(s => s.id));
const slots = /^(?:hero|adult|adult_m|adult_f|juv|breeding|winter|eclipse|jaarling|flight-(?:adult|adult_m|adult_f|juv|breeding|winter|eclipse|jaarling|neutral))$/;
const hash = value => createHash('sha256').update(value).digest();

const storage = {
  async list() {
    const result = await list({prefix: PREFIX, limit: MAX_ENTRIES + 1});
    return result.blobs;
  },
  async read(id) {
    const item = await get(`${PREFIX}${id}.json`, {access: 'private', useCache: false});
    return item?.statusCode === 200 ? await new Response(item.stream).json() : null;
  },
  async save(entry) {
    try {
      await put(`${PREFIX}${entry.id}.json`, JSON.stringify(entry), {
        access: 'private', addRandomSuffix: false, allowOverwrite: false,
        contentType: 'application/json', cacheControlMaxAge: 60,
      });
    } catch (error) {
      const saved = await this.read(entry.id);
      const fields = ['speciesId', 'slot', 'comment', 'photo'];
      if (saved && fields.every(key => entry[key] === saved[key])) return;
      throw error;
    }
  },
};

async function readRequest(req) {
  const contentType = (req.headers.get('content-type') ?? '').split(';')[0];
  if (contentType !== 'application/json' || !req.body) throw Error('Gebruik een geldig fotovoorstel.');
  const reader = req.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const {value, done} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) throw Error('Dit fotovoorstel is te groot.');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks, length).toString('utf8'));
}

async function normalize(input) {
  if (!input || input.format !== 'birdspot-photo-feedback' || input.consent !== true ||
    typeof input.id !== 'string' || !safeId.test(input.id) || !speciesIds.has(input.speciesId) ||
    typeof input.slot !== 'string' || !slots.test(input.slot) ||
    typeof input.comment !== 'string' || input.comment.length > 500 ||
    typeof input.photo !== 'string' || !/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+={0,2}$/.test(input.photo)) {
    throw Error('Controleer de foto, soort en toestemming.');
  }
  const image = Buffer.from(input.photo.slice('data:image/jpeg;base64,'.length), 'base64');
  if (image.length > 1500000 || image[0] !== 255 || image[1] !== 216) throw Error('Kies een geldige JPEG-foto.');
  const jpg = await sharp(image, {limitInputPixels: 48000000, failOn: 'error'}).rotate()
    .resize(1600, 1600, {fit: 'inside', withoutEnlargement: true}).jpeg({quality: 83}).toBuffer();
  return {
    id: input.id.toLowerCase(), speciesId: input.speciesId, slot: input.slot,
    comment: input.comment.trim(), consent: true,
    photo: `data:image/jpeg;base64,${jpg.toString('base64')}`, receivedAt: new Date().toISOString(),
  };
}

export function createFeedbackHandler({store, ownerKey, enabled}) {
  const result = (body, status = 200) => Response.json(body, {
    status, headers: {'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff'},
  });
  return async function handle(req) {
    if (!enabled || !ownerKey) return result({error: 'De inbox is nog niet verbonden.'}, 503);
    const url = new URL(req.url);
    try {
      if (req.method === 'GET') {
        if (url.searchParams.get('health') === '1') {
          await store.list();
          return result({connected: true});
        }
        const actual = req.headers.get('authorization') ?? '';
        if (!timingSafeEqual(hash(actual), hash(`Bearer ${ownerKey}`))) {
          return result({error: 'Alleen de beheerder heeft toegang.'}, 401);
        }
        const id = url.searchParams.get('id');
        if (id !== null) {
          if (!safeId.test(id)) return result({error: 'Ongeldige melding.'}, 400);
          const item = await store.read(id.toLowerCase());
          return item ? result(item) : result({error: 'Melding bestaat niet.'}, 404);
        }
        const entries = await store.list();
        return result({items: entries.map(item => ({
          id: item.pathname.slice(PREFIX.length, -'.json'.length), receivedAt: item.uploadedAt,
        })).filter(item => safeId.test(item.id)).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))});
      }
      if (req.method !== 'POST') return result({error: 'Ongeldige handeling.'}, 405);
      if (req.headers.get('origin') !== url.origin) return result({error: 'Open Birdspot en probeer opnieuw.'}, 403);

      let entry;
      try {
        entry = await normalize(await readRequest(req));
      } catch {
        return result({error: 'Dit fotovoorstel is ongeldig of te groot.'}, 400);
      }
      if (await store.read(entry.id)) {
        await store.save(entry);
        return result({id: entry.id});
      }
      if ((await store.list()).length >= MAX_ENTRIES) return result({error: 'De testinbox is vol.'}, 503);
      await store.save(entry);
      return result({id: entry.id}, 201);
    } catch {
      return result({error: 'De inbox is tijdelijk onbereikbaar.'}, 503);
    }
  };
}

export default {
  fetch: createFeedbackHandler({
    store: storage,
    ownerKey: process.env.BIRDSPOT_FEEDBACK_OWNER_KEY,
    enabled: process.env.VERCEL_ENV === 'preview' && Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN),
  }),
};
