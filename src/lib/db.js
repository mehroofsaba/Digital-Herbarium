const NAME = 'digital-herbarium';
let opening;
function open() {
  if (!opening) {
    opening = new Promise((res, rej) => {
      if (!('indexedDB' in window)) return rej(new Error('IndexedDB is not available in this browser.'));
      const r = indexedDB.open(NAME, 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('plants')) d.createObjectStore('plants', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('marks')) d.createObjectStore('marks', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('settings')) d.createObjectStore('settings', { keyPath: 'key' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return opening;
}
async function run(store, mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}
export const put = (store, v) => run(store, 'readwrite', (s) => s.put(v));
export const del = (store, id) => run(store, 'readwrite', (s) => s.delete(id));
export const all = (store) => run(store, 'readonly', (s) => s.getAll());
export async function loadAll() {
  const [plants, marks, settings] = await Promise.all([all('plants'), all('marks'), all('settings')]);
  return { plants, marks, settings: settings.find((s) => s.key === 'app') };
}
export async function exportAll() {
  const { plants, marks, settings } = await loadAll();
  return { app: 'digital-herbarium', version: 1, exportedAt: new Date().toISOString(), plants, marks, settings: settings || null };
}
export async function importAll(data) {
  if (!data || data.app !== 'digital-herbarium' || !Array.isArray(data.plants) || !Array.isArray(data.marks))
    throw new Error('This file is not a Digital Herbarium backup.');
  for (const p of data.plants) if (p?.id) await put('plants', p);
  for (const m of data.marks) if (m?.id) await put('marks', m);
  if (data.settings?.key === 'app') await put('settings', data.settings);
}
