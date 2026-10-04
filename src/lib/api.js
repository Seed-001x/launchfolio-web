// Launchfolio backend API client. Everything here reads live data;
// unknown values stay null and are rendered as "—", never fabricated.

const BASE = 'https://launchfolio-backend.onrender.com';

async function get(path, { signal } = {}) {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `request failed (${res.status})`);
    err.status = res.status;
    err.detail = body.detail;
    throw err;
  }
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `request failed (${res.status})`);
    err.status = res.status;
    err.detail = data.detail;
    throw err;
  }
  return data;
}

export const api = {
  tokens: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/tokens${q ? `?${q}` : ''}`);
  },
  token: (mint) => get(`/tokens/${mint}`),
  trades: (mint, limit = 100) => get(`/tokens/${mint}/trades?limit=${limit}`),
  holders: (mint) => get(`/tokens/${mint}/holders`),
  candles: (mint, interval = '15m') => get(`/tokens/${mint}/candles?interval=${interval}`),
  portfolio: (pubkey) => get(`/wallets/${pubkey}/portfolio`),
  positions: (pubkey) => get(`/wallets/${pubkey}/positions`),
  cards: (userId) => get(`/users/${userId}/cards`),
  leaderboard: () => get('/leaderboard?board=verified'),
  creator: (wallet) => get(`/creators/${wallet}`),
  fees: () => get('/economy/fees'),
  health: () => get('/health'),

  // Sign-in with wallet (real): nonce -> signMessage -> verify -> JWT.
  nonce: (pubkey) => post('/auth/nonce', { pubkey }),
  verify: (pubkey, nonce, signature) => post('/auth/verify', { pubkey, nonce, signature }),
  setHandle: (userId, handle, token) =>
    fetch(`${BASE}/users/${userId}/handle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ handle }),
    }).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'handle update failed');
      return d;
    }),
};

export function useApi(signal) {
  return api;
}

export { BASE as API_BASE };
