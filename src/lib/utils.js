export const cn = (...a) => a.filter(Boolean).join(' ');
export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
export const HABITATS = ['Moonlit marsh', 'Cloud forest', 'Salt cliffs', 'Glass meadow', 'Hollow orchard', 'Underground grotto', 'Drowned library', 'Ash dunes'];
export const CATEGORIES = ['Flower', 'Bellflower', 'Fern', 'Fungus', 'Vine', 'Root'];
export const MOODS = ['Wistful', 'Serene', 'Eerie', 'Tender', 'Restless', 'Luminous'];
export const KIND_FOR = { Flower: 'flower', Bellflower: 'bell', Fern: 'fern', Fungus: 'mushroom', Vine: 'vine', Root: 'root' };
export const MOOD_PALETTE = { Wistful: 'lavender', Serene: 'moss', Eerie: 'blue', Tender: 'rose', Restless: 'terracotta', Luminous: 'gold' };
export const REQUIRED = ['scientific', 'common', 'description', 'habitat', 'appearance', 'bloomCycle', 'properties', 'folklore'];
export const LABELS = { scientific: 'Botanical name', common: 'Common name', description: 'Description', habitat: 'Habitat', appearance: 'Appearance', bloomCycle: 'Bloom cycle', properties: 'Properties', folklore: 'Folklore' };

export const isEmpty = (v) => (Array.isArray(v) ? v.length === 0 : !v || !String(v).trim());
export const missingFields = (p) => REQUIRED.filter((k) => isEmpty(p[k]));
export const isIncomplete = (p) => !!p.unclassified && missingFields(p).length > 0;

export function hashSeed(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const newId = () => 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const specimenNo = (id) => 'HRB-' + (hashSeed(id) % 9000 + 1000);
export function downloadJson(name, obj) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
