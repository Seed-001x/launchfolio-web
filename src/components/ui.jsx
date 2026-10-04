import { useRef } from 'react';
import { MASCOTS } from '../mascots.js';

/** Pointer-tracked 3D tilt + holographic glare. Pure CSS vars, no libraries. */
export function Tilt({ children, className = '', max = 4, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </div>
  );
}

export function Mascot({ id, tag }) {
  const m = MASCOTS[id];
  if (!m) return null;
  return (
    <div className="mascot-frame">
      <img src={m.src} alt={m.name} loading="lazy" />
      <span className="who">{tag || `${m.name} · ${m.owns}`}</span>
    </div>
  );
}

export function Empty({ kicker, title, body, mascot }) {
  return (
    <div className="empty">
      {mascot && <img className="mascot-mini" src={MASCOTS[mascot].src} alt="" loading="lazy" />}
      <span className="kicker">{kicker}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function SourceTag({ source }) {
  const label = source === 'verified' ? 'VERIFIED · INDEXED' : source === 'rpc-live' ? 'LIVE · RPC' : source === 'dexscreener' ? 'DISPLAY ONLY · DEXSCREENER' : (source || '').toUpperCase();
  return <span className="badge plain" title="Data provenance">{label}</span>;
}

export function CopyBtn({ value, label = 'COPY' }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch { /* clipboard unavailable */ }
  };
  if (!value) return null;
  return <button className="btn-sm btn" style={{ minHeight: 32 }} onClick={copy}>{label}</button>;
}

export function Stamp({ children, lime }) {
  return <span className={`stamp${lime ? ' lime' : ''}`}>{children}</span>;
}
