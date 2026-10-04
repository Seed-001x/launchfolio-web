// Null-safe formatting. Unknown = "—", never zero, never fabricated.

export const EM_DASH = '—';

export function isKnown(v) {
  return v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));
}

export function fmtNum(v, digits = 2) {
  if (!isKnown(v)) return EM_DASH;
  const n = Number(v);
  if (!isFinite(n)) return EM_DASH;
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function fmtPrice(v) {
  if (!isKnown(v)) return EM_DASH;
  const n = Number(v);
  if (!isFinite(n) || n <= 0) return EM_DASH;
  if (n < 0.000001) return n.toExponential(2);
  if (n < 0.01) return n.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
  if (n < 1) return n.toFixed(5).replace(/0+$/, '').replace(/\.$/, '');
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: n < 100 ? 4 : 2 });
}

export function fmtUsd(v) {
  if (!isKnown(v)) return EM_DASH;
  const n = Number(v);
  if (!isFinite(n)) return EM_DASH;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function fmtPct(v) {
  if (!isKnown(v)) return EM_DASH;
  const n = Number(v);
  if (!isFinite(n)) return EM_DASH;
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function fmtTime(iso) {
  if (!iso) return EM_DASH;
  const d = new Date(iso);
  if (isNaN(d)) return EM_DASH;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function fmtAge(iso) {
  if (!iso) return EM_DASH;
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return EM_DASH;
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function shortAddr(a, n = 4) {
  if (!a) return EM_DASH;
  return `${a.slice(0, n)}…${a.slice(-n)}`;
}

export function solscanTx(sig) {
  return `https://solscan.io/tx/${sig}`;
}

export function solscanAddr(a) {
  return `https://solscan.io/account/${a}`;
}

export function pumpUrl(mint) {
  return `https://pump.fun/coin/${mint}`;
}
