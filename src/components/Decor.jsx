import { motion, useReducedMotion } from 'motion/react';
import { rng } from '../lib/utils';

const GREENS = [
  'var(--leafc)',
  'color-mix(in srgb, var(--leafc) 80%, var(--ink))',
  'color-mix(in srgb, var(--leafc) 60%, var(--sage))',
  'color-mix(in srgb, var(--leafc) 85%, var(--lav))',
  'color-mix(in srgb, var(--leafc) 70%, var(--moss))',
];
const LEAF = 'M0 0C12-15 38-17 58 0C38 17 12 15 0 0Z';
const PATH = [[90, -10], [210, 140], [105, 330], [220, 530]];
const bez = (p, t) => { const u = 1 - t; return [0, 1].map((i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]); };
const tan = (p, t) => { const u = 1 - t; const d = [0, 1].map((i) => 3 * u * u * (p[1][i] - p[0][i]) + 6 * u * t * (p[2][i] - p[1][i]) + 3 * t * t * (p[3][i] - p[2][i])); return (Math.atan2(d[1], d[0]) * 180) / Math.PI; };
const leafStyle = (fill, o = 0.94) => ({ fill, stroke: 'var(--draw)', strokeWidth: 0.8, opacity: o });

export function Foliage({ flip, seed = 1, className = '' }) {
  const r = rng(seed * 977);
  const leaves = []; let side = 1;
  for (let t = 0.07; t < 0.99; t += 0.06) {
    const [x, y] = bez(PATH, t);
    leaves.push({ x, y, a: tan(PATH, t) + side * (46 + r() * 34), s: (1.15 - t * 0.5) * (0.85 + r() * 0.4), c: GREENS[Math.floor(r() * GREENS.length)], d: -r() * 8 });
    side *= -1;
  }
  const [tx, ty] = bez(PATH, 1);
  leaves.push({ x: tx, y: ty, a: tan(PATH, 1), s: 0.7, c: GREENS[0], d: -2 });
  const blooms = [[0.27, 1], [0.5, -1], [0.76, 1]].map(([t, sd]) => { const [x, y] = bez(PATH, t); return { x: x + sd * 22, y: y + 10, sx: x, sy: y }; });
  return (
    <svg viewBox="0 0 320 560" className={`foliage ${flip ? 'flip' : ''} ${className}`} aria-hidden>
      <g className="branch-sway">
        <path d={`M${PATH[0]}C${PATH[1]} ${PATH[2]} ${PATH[3]}`} style={{ stroke: 'var(--brown)', fill: 'none' }} strokeWidth="2.6" strokeLinecap="round" />
        {leaves.map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.a})`}>
            <g className="leaf-sway" style={{ animationDelay: `${l.d}s` }}>
              <path d={LEAF} transform={`scale(${l.s})`} style={leafStyle(l.c)} />
              <path d="M0 0L50 0" transform={`scale(${l.s})`} style={{ stroke: 'var(--draw)', strokeWidth: 0.7, opacity: 0.5 }} />
            </g>
          </g>
        ))}
        {blooms.map((b, i) => (
          <g key={i}>
            <path d={`M${b.sx} ${b.sy}Q${(b.sx + b.x) / 2} ${b.sy - 6} ${b.x} ${b.y}`} style={{ stroke: 'var(--brown)', fill: 'none', strokeWidth: 1.2 }} />
            <g transform={`translate(${b.x} ${b.y})`} className="bloom-sway">
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-7" rx="4.2" ry="7.5" style={{ fill: 'var(--blossom)', stroke: 'var(--brown)', strokeWidth: 0.5 }} transform={`rotate(${a})`} />)}
              <circle r="2.6" style={{ fill: 'var(--gold)' }} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function LedgeLeaves({ className = '' }) {
  return (
    <svg viewBox="0 0 300 50" className={className} aria-hidden>
      {[[20, 34, -12, 0], [86, 30, 168, 2], [190, 36, -4, 1], [250, 26, 190, 3]].map(([x, y, a, c], i) => (
        <path key={i} d={LEAF} transform={`translate(${x} ${y}) rotate(${a}) scale(.62)`} style={leafStyle(GREENS[c], 0.9)} />
      ))}
      <ellipse cx="140" cy="40" rx="9" ry="4" style={{ fill: 'var(--lav)', opacity: 0.7 }} transform="rotate(-14 140 40)" />
    </svg>
  );
}

export function BookStack({ className = '' }) {
  const edge = { stroke: 'var(--line)', strokeWidth: 1 };
  return (
    <svg viewBox="0 0 320 170" className={className} aria-hidden>
      <rect x="10" y="100" width="250" height="34" rx="3" style={{ ...edge, fill: 'color-mix(in srgb, var(--terra) 70%, var(--ink))' }} />
      <rect x="10" y="100" width="250" height="6" style={{ fill: 'var(--gold)', opacity: 0.35 }} />
      <rect x="30" y="64" width="220" height="38" rx="3" style={{ ...edge, fill: 'var(--plate4)' }} />
      <rect x="40" y="76" width="200" height="4" style={{ fill: 'var(--gold)', opacity: 0.85 }} />
      <rect x="40" y="88" width="200" height="2" style={{ fill: 'var(--gold)', opacity: 0.6 }} />
      <circle cx="94" cy="52" r="34" style={{ fill: 'var(--card)', fillOpacity: 0.5, stroke: 'var(--gold)', strokeWidth: 6 }} />
      <path d="M62 70L8 96" style={{ stroke: 'var(--brown)', strokeWidth: 10, strokeLinecap: 'round' }} />
    </svg>
  );
}

export function Vase({ className = '' }) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden>
      {[[40, 30], [70, 18], [90, 50], [55, 62], [78, 84]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M60 190Q${x + 6} ${y + 80} ${x} ${y}`} style={{ stroke: 'var(--moss)', strokeWidth: 1.5, fill: 'none' }} />
          <circle cx={x} cy={y} r="8" style={{ fill: 'var(--blossom)', stroke: 'var(--draw)', strokeWidth: 0.6 }} />
          <circle cx={x} cy={y} r="2.5" style={{ fill: 'var(--gold)' }} />
        </g>
      ))}
      <path d="M38 120C30 150 34 190 44 206H76C86 190 90 150 82 120Z" style={{ fill: 'var(--sage)', fillOpacity: 0.22, stroke: 'var(--soft)', strokeWidth: 1.5 }} />
    </svg>
  );
}

export function Particles() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="particles" aria-hidden>
      {[...Array(14)].map((_, i) => (
        <motion.span key={i} style={{ left: `${(i * 71) % 100}%`, top: `${(i * 37) % 80}%` }} className={i % 4 === 0 ? 'petal' : 'mote'}
          animate={{ y: [0, -26, 0], x: [0, i % 2 ? 14 : -14, 0], rotate: [0, 40, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 7 + (i % 5) * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }} />
      ))}
    </div>
  );
}
