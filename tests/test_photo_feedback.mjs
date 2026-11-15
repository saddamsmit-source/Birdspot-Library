import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import sharp from 'sharp';
import { createFeedbackHandler } from '../api/photo-feedback.mjs';

const endpoint = 'https://birdspot.test/api/photo-feedback';
const origin = 'https://birdspot.test';
const ownerKey = 'test-key';
test('photo feedback separates upload, owner read and private metadata', async () => {
  const saved = new Map();
  const handler = createFeedbackHandler({ownerKey, enabled: true, store: {
    async read(id) { return saved.get(id) ?? null; },
    async list() {
      return [...saved.values()].map(entry => ({pathname: `guide-review/${entry.id}.json`, uploadedAt: entry.receivedAt}));
    },
    async save(entry) {
      if (!saved.has(entry.id)) saved.set(entry.id, entry);
    },
  }});
  const binary = await sharp({create: {width: 10, height: 10, channels: 3, background: 'green'}})
    .withMetadata().jpeg().toBuffer();
  assert.ok((await sharp(binary).metadata()).exif);
  const input = {
    format: 'birdspot-photo-feedback', consent: true, id: randomUUID(), speciesId: 'sp459', slot: 'flight-neutral',
    comment: 'Versie voor beoordeling', photo: `data:image/jpeg;base64,${binary.toString('base64')}`,
    coordinates: [10, 20],
  };
  const post = (body, website = origin) => handler(new Request(endpoint, {
    method: 'POST', headers: {Origin: website, 'Content-Type': 'application/json'}, body: JSON.stringify(body),
  }));
  assert.equal((await post({...input, consent: false})).status, 400);
  assert.equal((await post({...input, speciesId: 'niet-gevonden'})).status, 400);
  assert.equal((await post({...input, photo: 'data:image/jpeg;base64,AAAA'})).status, 400);
  assert.equal((await post(input, 'https://other.test')).status, 403);
  assert.equal(saved.size, 0);
  const submission = await post(input);
  assert.equal(submission.status, 201);
  assert.equal((await submission.json()).id, input.id);
  assert.equal((await post(input)).status, 200);
  assert.equal(saved.size, 1);
  assert.equal((await handler(new Request(endpoint))).status, 401);
  assert.equal((await handler(new Request(endpoint + '?id=' + input.id))).status, 401);
  const opts = {headers: {Authorization: `Bearer ${ownerKey}`}};
  assert.equal((await (await handler(new Request(endpoint, opts))).json()).items[0].id, input.id);
  const item = await handler(new Request(endpoint + '?id=' + input.id, opts));
  assert.equal(item.headers.get('cache-control'), 'private, no-store');
  const entry = await item.json();
  assert.equal(entry.speciesId, 'sp459');
  assert.equal(entry.slot, 'flight-neutral');
  assert.equal(entry.comment, input.comment);
  assert.equal(entry.coordinates, undefined);
  assert.equal((await sharp(Buffer.from(entry.photo.split(',')[1], 'base64')).metadata()).exif, undefined);
  assert.equal((await createFeedbackHandler({enabled: false})(new Request(endpoint))).status, 503);
});
