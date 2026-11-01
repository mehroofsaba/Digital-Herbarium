export const SYSTEM = `You are a fictional botanist cataloguing imaginary plants from an invented world. Everything you write is fiction: no real species, no real medicine. Answer in plain text using exactly the labelled lines requested, one per line, with no extra commentary.`;

const EXAMPLE = `Latin name: Vesperia lucida
Common name: Lantern Thistle
Description: A tall thistle whose spiked heads glow softly after sunset. Travellers once used it to mark safe paths across the moor.
Habitat: Windswept moorland
Appearance: Silver-green stalks topped with amber, lantern-shaped blooms.
Bloom cycle: Opens at dusk and closes before dawn, from late summer to first frost.
Properties: Glows at night; Hums in strong wind; Seeds drift like embers
Folklore: Shepherds say the thistle is a star that lost its way and took root. They leave a pinch of salt beside it each autumn so it can find its way home.`;

export function buildMessages({ seed, habitat, mood, rarity, type }) {
  const hints = [
    seed && `Inspired by the word: ${seed}`,
    habitat && `Habitat: ${habitat}`,
    mood && `Mood: ${mood}`,
    rarity && `Rarity: ${rarity}`,
    type && `Plant type: ${type}`,
  ].filter(Boolean).join('\n');
  const user = `Here is an example of the format, for a different plant:

${EXAMPLE}

Now invent a NEW fictional plant, completely different from the example.
${hints}

Write the same 8 labelled lines (Latin name, Common name, Description, Habitat, Appearance, Bloom cycle, Properties, Folklore) and nothing else.`;
  return [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }];
}
