import { useEffect, useRef } from 'react';

// Canvas candlestick chart from VERIFIED indexed trades. Buckets with no
// trades are omitted by the API — we never invent candles.
export default function CandleChart({ candles }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !candles || !candles.length) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const padL = 8, padR = 64, padT = 12, padB = 22;
    const cw = W - padL - padR;
    const ch = H - padT - padB;

    let hi = -Infinity, lo = Infinity, vmax = 0;
    for (const c of candles) {
      hi = Math.max(hi, Number(c.high));
      lo = Math.min(lo, Number(c.low));
      vmax = Math.max(vmax, Number(c.volume) || 0);
    }
    if (!isFinite(hi) || !isFinite(lo) || hi <= lo) return;
    const span = hi - lo || 1;
    const y = (p) => padT + ch - ((Number(p) - lo) / span) * ch;

    // gridlines
    ctx.strokeStyle = '#1c2229';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#5d666e';
    ctx.font = '10px "Azeret Mono", monospace';
    for (let i = 0; i <= 4; i++) {
      const p = lo + (span * i) / 4;
      const yy = y(p);
      ctx.beginPath();
      ctx.moveTo(padL, yy);
      ctx.lineTo(W - padR, yy);
      ctx.stroke();
      ctx.fillText(p < 0.01 ? p.toExponential(1) : p.toPrecision(4), W - padR + 6, yy + 3);
    }

    // volume bars (bottom fifth)
    const vh = ch * 0.18;
    const n = candles.length;
    const bw = Math.max(2, (cw / n) * 0.62);
    candles.forEach((c, i) => {
      const x = padL + (cw * (i + 0.5)) / n;
      if (vmax > 0) {
        const vhh = (Number(c.volume) / vmax) * vh;
        ctx.fillStyle = 'rgba(201,255,71,.18)';
        ctx.fillRect(x - bw / 2, padT + ch - vhh, bw, vhh);
      }
      const up = Number(c.close) >= Number(c.open);
      const col = up ? '#9de54f' : '#ff6c68';
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y(c.high));
      ctx.lineTo(x, y(c.low));
      ctx.stroke();
      const yo = y(c.open), yc = y(c.close);
      const top = Math.min(yo, yc);
      const hh = Math.max(2, Math.abs(yc - yo));
      ctx.fillRect(x - bw / 2, top, bw, hh);
    });

    // time labels
    ctx.fillStyle = '#5d666e';
    const step = Math.max(1, Math.floor(n / 6));
    for (let i = 0; i < n; i += step) {
      const x = padL + (cw * (i + 0.5)) / n;
      const d = new Date(candles[i].time * 1000);
      const lbl = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      ctx.fillText(lbl, x - 30, H - 6);
    }
  }, [candles]);

  return <canvas ref={ref} className="chart" aria-label="Price chart from indexed trades" />;
}
