import { hashSeed, rng } from '../lib/utils';

/* All colour comes from CSS variables (see index.css): strokes use --draw,
   fills use --ic1 / --ic2 (palette hue), --leafc (foliage) and --gold. */
const HUES = ['lavender', 'rose', 'ivory', 'terracotta', 'moss', 'gold', 'blue'];
const Leaf = ({ x, y, rot = 0, s = 1 }) => (
  <path d="M0 0C8-11 24-11 30 0C24 11 8 11 0 0Z" className="draw fl" fillOpacity=".75" transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} />
);

function Flower({ r, roots }) {
  const n = 5 + Math.floor(r() * 4);
  const petals = (len, w, cls, op, off) => [...Array(n)].map((_, i) => (
    <ellipse key={cls + i} cx="100" cy={112 - len / 2} rx={w} ry={len / 2} transform={`rotate(${(i * 360) / n + off} 100 112)`} className={`draw ${cls}`} fillOpacity={op} strokeWidth="1" />
  ));
  const rootPaths = roots ? [...Array(7)].map((_, i) => {
    const dx = (r() - 0.5) * 90;
    return <path key={i} className="draw" strokeWidth=".9" d={`M100 226 Q${100 + dx * 0.3} 246 ${100 + dx} ${262 + r() * 12}`} />;
  }) : null;
  return (
    <g>
      <path className="draw" strokeWidth="1.6" d="M100 120C98 160 104 196 100 230" />
      <path d="M100 176C74 160 54 168 46 184C70 190 90 186 100 176Z" className="draw fl" fillOpacity=".75" />
      <path d="M100 196C126 180 146 188 154 204C130 210 110 206 100 196Z" className="draw fl" fillOpacity=".75" />
      {rootPaths}
      {petals(66, 14, 'f1', 0.72, 0)}
      {petals(42, 9, 'f2', 0.85, 180 / n)}
      <circle cx="100" cy="112" r="7" className="draw fg" />
      {[...Array(6)].map((_, i) => <line key={i} className="draw" strokeWidth=".8" x1="100" y1="112" x2={100 + Math.cos(i) * 18} y2={112 + Math.sin(i) * 18} />)}
    </g>
  );
}

function Bell() {
  const bell = (x, y, k) => (
    <path key={k} className={`draw ${k % 2 ? 'f2' : 'f1'}`} fillOpacity=".8" d={`M${x - 8} ${y}C${x - 11} ${y + 20} ${x - 15} ${y + 28} ${x - 18} ${y + 34}L${x + 18} ${y + 34}C${x + 15} ${y + 28} ${x + 11} ${y + 20} ${x + 8} ${y}Z`} />
  );
  return (
    <g>
      <path className="draw" strokeWidth="1.6" d="M100 268C100 190 55 130 70 60" />
      <path className="draw" d="M85 181Q105 178 112 196M70 121Q52 122 38 150M67 81Q86 78 96 104" />
      {bell(112, 196, 0)}{bell(38, 150, 1)}{bell(96, 104, 2)}
      <Leaf x="100" y="240" rot="-30" /><Leaf x="100" y="225" rot="200" s=".9" />
    </g>
  );
}

function Fern({ r }) {
  return (
    <g>
      <path className="draw" strokeWidth="1.6" d="M100 268Q94 150 100 36" />
      {[...Array(14)].map((_, i) => {
        const t = i / 13, y = 252 - t * 208, len = 36 * (1 - t * 0.78) + 6;
        return [-1, 1].map((s) => (
          <ellipse key={i + '' + s} cx={100 + (s * len) / 2} cy={y - 5} rx={len / 2} ry={4.5 + r()} transform={`rotate(${s * -22} 100 ${y})`} className="draw fl" fillOpacity=".7" strokeWidth=".9" />
        ));
      })}
    </g>
  );
}

function Mushroom() {
  const one = (t, k) => (
    <g key={k} transform={t}>
      <path className="draw f2" fillOpacity=".85" d="M88 136C84 190 80 226 76 252L124 252C120 226 116 190 112 136Z" />
      <path className="draw f1" fillOpacity=".85" d="M36 134C34 70 166 70 164 134Q100 152 36 134Z" />
      {[...Array(9)].map((_, i) => <line key={i} className="draw" strokeWidth=".7" x1="100" y1="140" x2={44 + i * 14} y2="136" />)}
      {[[70, 106], [108, 94], [134, 116], [92, 122]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 + (i % 2) * 2} className="f2" fillOpacity=".9" />)}
    </g>
  );
  return <g>{one('translate(-10 14)', 0)}{one('translate(116 160) scale(.38)', 1)}<path className="draw" d="M30 268Q100 258 172 268" /></g>;
}

function Vine() {
  return (
    <g>
      <path className="draw" strokeWidth="1.6" d="M100 270C40 240 160 210 100 180S40 120 100 90S150 50 110 30" />
      <path className="draw" d="M112 190C140 180 142 164 128 158M70 142C44 138 40 120 54 114" />
      <Leaf x="76" y="236" rot="-150" /><Leaf x="128" y="206" rot="-20" s="1.1" /><Leaf x="72" y="150" rot="170" /><Leaf x="118" y="110" rot="-30" /><Leaf x="84" y="70" rot="200" s=".9" />
      {[[128, 156], [54, 112], [136, 168]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className="draw f1" />)}
    </g>
  );
}

export default function BotanicalIllustration({ kind = 'flower', palette = 'lavender', seed = 'x', className = '', label }) {
  const r = rng(hashSeed(seed + kind));
  const hue = HUES.includes(palette) ? palette : 'lavender';
  const body = { flower: <Flower r={r} />, root: <Flower r={r} roots />, bell: <Bell />, fern: <Fern r={r} />, mushroom: <Mushroom />, vine: <Vine /> }[kind] || <Flower r={r} />;
  return (
    <svg viewBox="0 0 200 280" className={`botanical pal-${hue} ${className}`} role={label === '' ? undefined : 'img'} aria-label={label || `Botanical illustration of a ${kind}`} aria-hidden={label === '' ? true : undefined}>
      {body}
    </svg>
  );
}
