// Deterministic generative art per token mint — decorative only, derived from
// the mint hash. NOT data; the same mint always renders the same artwork.
import { useMemo } from 'react';

const PALETTES = [
  ['#c9ff47', '#1a2b12', '#5a7a2a'],
  ['#63b8ff', '#0e1a2b', '#2a5a8a'],
  ['#f3bd54', '#2b1e0e', '#8a5f2a'],
  ['#ff6c68', '#2b1214', '#8a3a3a'],
  ['#b48cff', '#1c1230', '#5a3a8a'],
  ['#9de54f', '#14230e', '#4a7a2a'],
];

const MOTIFS = ['orbit', 'volt', 'drip', 'rune', 'echo', 'blink'];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function GenArt({ mint, seedExtra = '' }) {
  const art = useMemo(() => {
    const h = hash(`${mint}${seedExtra}`);
    const pal = PALETTES[h % PALETTES.length];
    const motif = MOTIFS[Math.floor(h / 7) % MOTIFS.length];
    const rot = h % 360;
    const cx = 200 + ((h >> 3) % 120) - 60;
    const cy = 200 + ((h >> 5) % 120) - 60;
    return { pal, motif, rot, cx, cy, h };
  }, [mint, seedExtra]);

  const [a, b, c] = art.pal;
  const gid = `g${art.h % 100000}`;

  return (
    <svg className="genart" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={b} />
          <stop offset="55%" stopColor={c} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <filter id={`${gid}n`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0" />
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect width="400" height="400" fill={`url(#${gid})`} />
      <g transform={`rotate(${art.rot} 200 200)`} stroke={a} strokeWidth="10" fill="none" opacity="0.9">
        {art.motif === 'orbit' && (<><circle cx="200" cy="200" r="90" /><circle cx="200" cy="200" r="140" strokeDasharray="24 18" /><circle cx={art.cx} cy={art.cy} r="22" fill={a} /></>)}
        {art.motif === 'volt' && <polyline points="120,260 170,140 210,220 250,100 290,240" />}
        {art.motif === 'drip' && (<><rect x="150" y="90" width="100" height="150" /><line x1="170" y1="240" x2="170" y2="300" /><line x1="210" y1="240" x2="210" y2="280" /><line x1="250" y1="240" x2="250" y2="310" /></>)}
        {art.motif === 'rune' && (<><polygon points="200,80 300,200 200,320 100,200" /><polygon points="200,140 250,200 200,260 150,200" fill={a} stroke="none" /></>)}
        {art.motif === 'echo' && (<><circle cx="200" cy="200" r="50" /><circle cx="200" cy="200" r="95" strokeDasharray="8 14" /><circle cx="200" cy="200" r="140" strokeDasharray="4 20" /></>)}
        {art.motif === 'blink' && (<><rect x="120" y="120" width="160" height="160" /><line x1="120" y1="120" x2="280" y2="280" /><line x1="280" y1="120" x2="120" y2="280" /></>)}
      </g>
      <polygon points="0,400 400,400 400,330" fill="#000" opacity="0.35" />
      <circle cx="330" cy="70" r="44" fill={a} opacity="0.85" />
      <rect width="400" height="400" fill="transparent" filter={`url(#${gid}n)`} />
    </svg>
  );
}
