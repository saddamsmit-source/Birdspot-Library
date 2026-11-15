const STORE = 'sessions';
const KEY = 'current';
let database;
let writes = Promise.resolve();

function openDraftDatabase() {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    const request = indexedDB.open('birdspot-sound-drafts', 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        database = undefined;
      };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  }).catch(error => {
    database = undefined;
    throw error;
  });
  return database;
}

export async function loadSoundDraft() {
  await writes.catch(() => {});
  const db = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function commitDraft(id, draft) {
  const operation = writes.catch(() => {}).then(async () => {
    const db = await openDraftDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      const store = transaction.objectStore(STORE);
      const request = store.get(KEY);
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error ?? new Error('Conceptopslag afgebroken'));
      request.onsuccess = () => {
        if (request.result && request.result.id !== id) {
          transaction.abort();
          return;
        }
        if (draft) store.put(draft, KEY);
        else store.delete(KEY);
      };
    });
  });
  writes = operation;
  return operation;
}

export function saveSoundDraft(draft) {
  return commitDraft(draft.id, draft);
}

export function deleteSoundDraft(id) {
  return commitDraft(id, null);
}
