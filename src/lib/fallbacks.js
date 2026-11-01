import { HABITATS, hashSeed } from './utils';

const pick = (arr, h, o = 0) => arr[(h + o) % arr.length];
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const BLOOMS = ['Opens at dusk for a single week each season.', 'Blooms once a year, on the first clear night after rain.', 'Flowers slowly through the cold months and closes at dawn.', 'Opens only when the moon is full.', 'Opens in pulses, one bloom each night.'];
const PROPS = ['Glows faintly in the dark', 'Hums when the wind changes', 'Petals never fully wilt', 'Cools the air around it', 'Leaves curl toward whoever is watching', 'Smells of rain before a storm', 'Scatters seed in a soft puff of light', 'Grows toward the quietest corner'];
const NOUN = { Flower: 'Bloom', Bellflower: 'Bell', Fern: 'Fern', Fungus: 'Cap', Vine: 'Vine', Root: 'Root' };
const EPITHET = ['umbrata', 'lucida', 'tenera', 'silens', 'memoria', 'pallida'];
const LOOK = { lavender: 'violet', rose: 'blush-pink', ivory: 'ivory', terracotta: 'rust-red', moss: 'mossy green', gold: 'golden', blue: 'pale blue' };

/* Fills only what the model left empty, using the person's own choices.
   Returns the completed record plus the list of fields that were filled locally. */
export function fillFallbacks(rec, params, palette) {
  const h = hashSeed((params.seed || '') + (rec.scientific || '') + (params.mood || ''));
  const look = LOOK[palette] || 'pale';
  const type = (params.type || 'plant').toLowerCase();
  const word = (params.seed || params.mood || 'Quiet').trim();
  const filled = [];
  const set = (k, v) => { if (!rec[k] || (Array.isArray(rec[k]) && !rec[k].length)) { rec[k] = v; filled.push(k); } };
  const stem = word.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8) || 'quiet';
  set('scientific', `${cap(stem)}ia ${pick(EPITHET, h)}`);
  set('common', `${cap(word)} ${NOUN[params.type] || 'Bloom'}`);
  set('habitat', params.habitat || pick(HABITATS, h));
  set('description', `A ${look} ${type} that grows in the ${rec.habitat.toLowerCase()}. Gardeners say it keeps its own quiet company.`);
  set('appearance', `${cap(look)} and delicate, with slender stems and softly folded leaves.`);
  set('bloomCycle', pick(BLOOMS, h));
  set('properties', [pick(PROPS, h), pick(PROPS, h, 3), pick(PROPS, h, 5)]);
  set('folklore', params.seed
    ? `Locals say the ${rec.common} first appeared on the night someone spoke the word "${params.seed}" aloud. It is left undisturbed, and visitors are asked to say nothing.`
    : `Locals say the ${rec.common} appears only to those who are not looking for it. It is left undisturbed.`);
  return { rec, filled };
}
