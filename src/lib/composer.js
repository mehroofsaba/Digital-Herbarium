import { HABITATS, RARITIES, CATEGORIES, MOODS, KIND_FOR, MOOD_PALETTE, hashSeed, rng, newId, specimenNo } from './utils';

/* The herbarium's own generator: no model, no download, always works.
   Everything it writes is built from the person's seed word and choices. */
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const an = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');

const MOOD = {
  Wistful: { adj: ['pale', 'faded', 'longing'], ep: ['nostalgica', 'lacrimosa', 'remota'], props: ['Turns toward whatever is missed most', 'Petals keep the shape of old letters', 'Hums an old lullaby at twilight'] },
  Serene: { adj: ['still', 'quiet', 'gentle'], ep: ['placida', 'quieta', 'serena'], props: ['Calms the air around it', 'Never wilts in still water', 'Slows the sound of footsteps nearby'] },
  Eerie: { adj: ['hollow', 'ashen', 'whispering'], ep: ['umbrata', 'spectralis', 'nocturna'], props: ['Casts a shadow with no light source', 'Whispers when no one is near', 'Cold to the touch even at noon'] },
  Tender: { adj: ['soft', 'small', 'kind'], ep: ['tenera', 'mollis', 'dulcis'], props: ['Warms the hands that hold it', 'Leans toward anyone who is tired', 'Smells of bread and rain'] },
  Restless: { adj: ['wild', 'drifting', 'restless'], ep: ['inquieta', 'volans', 'errans'], props: ['Shifts its position overnight', 'Seeds travel against the wind', 'Rustles without a breeze'] },
  Luminous: { adj: ['bright', 'gleaming', 'dawn'], ep: ['lucida', 'aurea', 'radians'], props: ['Glows softly after dark', 'Scatters small points of light', 'Brightens when someone sings'] },
};
const TYPE = {
  Flower: { noun: ['Lily', 'Bloom', 'Star', 'Rose'], form: ['a single nodding bloom', 'a crown of layered petals', 'a loose spray of starlike flowers'] },
  Bellflower: { noun: ['Bell', 'Chime', 'Lantern-bell'], form: ['a curved stem hung with small bells', 'three nodding bells on a wiry stalk', 'a cascade of narrow bells'] },
  Fern: { noun: ['Fern', 'Frond', 'Plume'], form: ['arching fronds of paired leaflets', 'a tall plume of finely cut leaves', 'a spiral of unfurling fronds'] },
  Fungus: { noun: ['Cap', 'Lanternstool', 'Puffball'], form: ['a domed cap on a pale, slender stem', 'a cluster of small caps on one root', 'a broad cap freckled with tiny spots'] },
  Vine: { noun: ['Creeper', 'Ivy', 'Tendril'], form: ['a climbing vine with small heart-shaped leaves', 'long tendrils hung with pearl-like berries', 'a twisting vine that follows light'] },
  Root: { noun: ['Root', 'Tuber', 'Knot'], form: ['a knotted root crowned with one pale flower', 'a lace of fine roots beneath a single bloom', 'a thick tuber sending up slender shoots'] },
};
const LOOK = { lavender: ['violet', 'lilac', 'heather-purple'], rose: ['blush', 'rose-pink', 'dusky pink'], ivory: ['ivory', 'cream', 'bone-white'], terracotta: ['rust-red', 'terracotta', 'ember-orange'], moss: ['mossy green', 'olive', 'lichen-green'], gold: ['golden', 'amber', 'honey-coloured'], blue: ['pale blue', 'slate-blue', 'frost-blue'] };
const DETAIL = ['a faint silver sheen', 'darker veins that branch like handwriting', 'tiny beads of dew that never dry', 'edges that curl inward after dusk', 'a soft, felted texture'];
const BLOOM = {
  Common: ['Blooms steadily from spring to autumn.', 'Flowers in waves, a few days after every rain.'],
  Uncommon: ['Opens at dusk for a single week each season.', 'Blooms twice a year, once in warm weather and once in frost.'],
  Rare: ['Opens only on the first clear night after rain.', 'Flowers once a year, on the night of the longest dusk.'],
  'Very Rare': ['Opens once every few years, and only when no one is watching.', 'Blooms for a single night when the moon is full.'],
  Legendary: ['Said to bloom once in a lifetime, and never twice in the same place.', 'Has never been seen to flower, only found already open.'],
};
const GENERA = ['Umbra', 'Lumen', 'Silva', 'Nebula', 'Vespera', 'Aura', 'Quies'];
const COMMON_PROPS = ['Petals never fully wilt', 'Cools the air around it', 'Smells of rain before a storm', 'Leaves curl toward whoever is watching', 'Scatters seed in a soft puff of light'];
const AFTER = ['Those who find it tend to speak more quietly afterwards.', 'Gardeners keep it near doorways and never quite explain why.', 'Its presence changes how a room sounds.'];

export function composePlant(params, { reason } = {}) {
  const id = newId();
  const r = rng(hashSeed((params.seed || '') + id));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const mood = params.mood || pick(MOODS);
  const type = params.type || pick(CATEGORIES);
  const habitat = params.habitat || pick(HABITATS);
  const rarity = params.rarity || pick(RARITIES);
  const M = MOOD[mood], T = TYPE[type], palette = MOOD_PALETTE[mood];
  const word = (params.seed || '').trim();
  const stem = word.toLowerCase().replace(/[^a-z]/g, '').slice(0, 9);
  const look = pick(LOOK[palette]);
  const common = `${word ? cap(word) : cap(pick(M.adj))} ${pick(T.noun)}`;
  const hab = habitat.toLowerCase();
  const props = [...new Set([...M.props, ...COMMON_PROPS].sort(() => r() - 0.5))].slice(0, 3);
  const origin = word
    ? `Old stories of the ${hab} say the ${common} first grew where someone spoke the word "${word}" and was not answered.`
    : `Old stories of the ${hab} say the ${common} first grew where a promise was kept in silence.`;
  return {
    id, no: specimenNo(id), fictional: true, createdAt: Date.now(),
    scientific: `${stem ? cap(stem) : pick(GENERA)}${pick(['ia', 'aria', 'ella', 'ula'])} ${pick(M.ep)}`,
    common,
    description: `${cap(an(look))} ${look} ${type.toLowerCase()} of the ${hab}, ${pick(M.adj)} in every season. ${word ? `It is said to carry the feeling of "${word}". ` : ''}${pick(AFTER)}`,
    habitat,
    appearance: `${cap(pick(T.form))}, ${look} with ${pick(DETAIL)}.`,
    bloomCycle: pick(BLOOM[rarity]),
    properties: props,
    folklore: `${origin} Those who pass it leave a small gift: a coin, a ribbon, or a quiet thought. It is never picked, only visited.`,
    rarity, category: type, kind: KIND_FOR[type], palette,
    tags: [word, mood, habitat].filter(Boolean).map((t) => t.toLowerCase()),
    seedWord: word, filled: [], aiWrote: 0, source: 'composer', fallbackReason: reason || null,
  };
}
