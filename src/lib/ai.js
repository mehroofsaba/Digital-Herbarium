import { buildMessages } from './prompts';
import { fillFallbacks } from './fallbacks';
import { RARITIES, KIND_FOR, MOOD_PALETTE, hashSeed, newId, specimenNo, isEmpty } from './utils';

let worker, reqId = 0, loadedId = null, device = null, progressCb = null;
const pending = new Map();
const files = {};

function failAll(message) { pending.forEach((p) => p.rej(new Error(message))); pending.clear(); worker = null; loadedId = null; }

function friendly(msg = '') {
  if (/fetch|network|ERR_|CORS|Load failed/i.test(msg)) return 'The model could not be downloaded. Check your internet connection, and that huggingface.co is not blocked on your network. Then press Try again.';
  if (/memory|OOM|allocation|out of/i.test(msg)) return 'This device ran out of memory for that model. Pick the smaller 360M or 0.5B model and try again.';
  return msg || 'Something went wrong while running the model.';
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./ai.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data: m }) => {
      if (m.type === 'progress') {
        const p = m.progress;
        if (p?.file && p.total) {
          files[p.file] = { loaded: p.loaded || 0, total: p.total };
          const vals = Object.values(files);
          const total = vals.reduce((a, f) => a + f.total, 0);
          progressCb?.(Math.min(100, (vals.reduce((a, f) => a + f.loaded, 0) / total) * 100));
        }
      } else if (m.type === 'token') pending.get(m.id)?.onToken?.(m.token);
      else {
        const p = pending.get(m.id);
        if (!p) return;
        pending.delete(m.id);
        m.type === 'error' ? p.rej(new Error(friendly(m.message))) : p.res(m);
      }
    };
    worker.onerror = (e) => failAll(friendly(e.message || 'The AI worker crashed.'));
  }
  return worker;
}
const call = (msg, onToken) => new Promise((res, rej) => { const id = ++reqId; pending.set(id, { res, rej, onToken }); getWorker().postMessage({ ...msg, id }); });

export const hasWebGPU = () => typeof navigator !== 'undefined' && !!navigator.gpu;

export async function loadModel(modelId, onProgress) {
  if (loadedId === modelId) return device;
  progressCb = onProgress;
  Object.keys(files).forEach((k) => delete files[k]);
  const r = await call({ type: 'load', modelId, webgpu: hasWebGPU() });
  loadedId = modelId; device = r.device;
  return device;
}

/* ---------- forgiving parser: labelled lines, not JSON ---------- */
const LABELS = {
  scientific: ['latin name', 'scientific name', 'botanical name', 'name'],
  common: ['common name', 'common'],
  description: ['description', 'summary'],
  habitat: ['habitat', 'home'],
  appearance: ['appearance', 'looks'],
  bloomCycle: ['bloom cycle', 'bloom', 'blooming', 'blooming cycle'],
  properties: ['properties', 'property', 'traits'],
  folklore: ['folklore', 'legend', 'lore', 'origin story', 'story'],
  rarity: ['rarity'],
};
const clean = (s = '') => {
  let t = s.replace(/\*\*|__/g, '').replace(/^["'`]+|["'`]+$/g, '').trim();
  if (/^\(.*\)$/.test(t) || t.length < 3) return '';
  return t.slice(0, 700);
};

export function parseLines(text) {
  const out = {}; let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^[\s>*#\-\d.)]+/, '').replace(/\*\*/g, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z ]{3,24})\s*[:：]\s*(.*)$/);
    const key = m && Object.keys(LABELS).find((k) => LABELS[k].includes(m[1].trim().toLowerCase()));
    if (key) {
      if (out[key] !== undefined) { cur = null; continue; }
      cur = key; out[key] = m[2].trim();
    } else if (cur) out[cur] = (out[cur] + ' ' + line).trim();
  }
  const rec = {};
  for (const k of Object.keys(LABELS)) if (out[k] !== undefined) rec[k] = clean(out[k]);
  if (rec.properties) {
    let parts = rec.properties.split(/\s*[;•|]\s*/);
    if (parts.length < 2) parts = rec.properties.split(/\s*,\s*/);
    rec.properties = parts.map((s) => s.replace(/[.\s]+$/, '').trim()).filter((s) => s.length > 2).slice(0, 5);
  }
  rec.rarity = RARITIES.find((r) => r.toLowerCase() === (rec.rarity || '').toLowerCase()) || null;
  return rec;
}

const FIELDS = ['scientific', 'common', 'description', 'habitat', 'appearance', 'bloomCycle', 'properties', 'folklore'];

export async function generatePlant(params, { onToken } = {}) {
  let r;
  try { r = await call({ type: 'generate', messages: buildMessages(params) }, onToken); }
  catch (e) { loadedId = null; throw e; }
  const parsed = parseLines(r.text || '');
  const wrote = FIELDS.filter((k) => !isEmpty(parsed[k]));
  if (wrote.length < 3) {
    const e = new Error('The model replied, but not in a usable form (fewer than 3 of the 8 fields). Press Try again, or choose the 1.5B model.');
    e.raw = r.text || '(empty reply)';
    throw e;
  }
  const h0 = hashSeed((parsed.scientific || '') + Date.now());
  const palettes = Object.values(MOOD_PALETTE);
  const palette = MOOD_PALETTE[params.mood] || palettes[h0 % palettes.length];
  const { rec, filled } = fillFallbacks(parsed, params, palette);
  const id = newId();
  return {
    ...rec, id, no: specimenNo(id), fictional: true, createdAt: Date.now(),
    rarity: rec.rarity || params.rarity || 'Uncommon',
    category: params.type || 'Flower',
    kind: KIND_FOR[params.type] || ['flower', 'bell', 'fern', 'root', 'vine', 'mushroom'][h0 % 6],
    palette,
    tags: [params.seed, params.mood, params.habitat].filter(Boolean).map((t) => t.toLowerCase()),
    seedWord: params.seed || '',
    filled, aiWrote: wrote.length, source: 'ai',
  };
}
