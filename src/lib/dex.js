// Majors strip via the CoinGecko free public API (no key, CORS open).
// Canonical spot prices — no mint-address ambiguity. Display-only market
// data, clearly separated from Launchfolio's indexed on-chain data.

const URL =
  'https://api.coingecko.com/api/v3/simple/price' +
  '?ids=solana,bitcoin,ethereum,dogecoin' +
  '&vs_currencies=usd&include_24hr_change=true';

const ORDER = [
  ['solana', 'SOL'],
  ['bitcoin', 'BTC'],
  ['ethereum', 'ETH'],
  ['dogecoin', 'DOGE'],
];

/** Returns [{symbol, priceUsd|null, change24h|null}] — never throws. */
export async function fetchMajors() {
  try {
    const res = await fetch(URL);
    if (!res.ok) return [];
    const data = await res.json();
    const out = [];
    for (const [id, symbol] of ORDER) {
      const row = data[id];
      if (!row || row.usd == null) continue;
      out.push({
        symbol,
        priceUsd: Number(row.usd),
        change24h: row.usd_24h_change != null ? Number(row.usd_24h_change) : null,
      });
    }
    return out;
  } catch {
    return [];
  }
}
