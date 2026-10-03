# Launchfolio — production web frontend

Vite + React SPA (hash routing, no server rewrites needed). Deploy `dist/` to Netlify as a static site.

## Data sources (all live, nothing mocked)

| UI | Source |
|---|---|
| Discover token list, search, sort | `GET /tokens` (verified) |
| Token terminal: header, stats | `GET /tokens/:mint` (verified) |
| Candlestick chart | `GET /tokens/:mint/candles?interval=` (verified; empty buckets omitted) |
| Trades feed | `GET /tokens/:mint/trades` (verified) |
| Holders | `GET /tokens/:mint/holders` (rpc-live; 503 → honest "delayed" state) |
| My Launchfolio: portfolio | `GET /wallets/:pubkey/portfolio` (rpc-live) |
| My Launchfolio: positions | `GET /wallets/:pubkey/positions` (verified) |
| My Launchfolio: card binder | `GET /users/:id/cards` after sign-in (verified) |
| Leaderboard | `GET /leaderboard?board=verified` (verified; demo board never mixed) |
| Official Binder candidates | `GET /tokens` + per-token `GET /tokens/:mint/trades` for the 6 criteria |
| Creator pages | `GET /creators/:wallet` (verified) |
| Majors strip (display only) | CoinGecko free API: SOL/BTC/ETH/DOGE spot + 24h change |

Unknown = `—`, never zero. Empty states are honest ("No trades indexed yet").

## Wallet & sign-in (real)

- Connect: Solana wallet adapter, Phantom only.
- Sign-in: `POST /auth/nonce` → Phantom `signMessage` on the human-readable
  message → `POST /auth/verify` → JWT in localStorage (7d). No funds move.
- The backend never holds keys and never signs; neither does this frontend.

## Out of scope this pass (stated honestly in-UI)

- Trade execution: terminal is read-only ("READ-ONLY · NO TRADE EXECUTION").
- Token launching: no Launch screen (requires signing).
- Rewards/economy page: not built (fee data exists at `/economy/fees` if wanted later).
- No demo simulation controls, no XP for launching, no XP→$ anywhere.

## Design

Carried from the Demo Mode prototype: Manrope + Azeret Mono, lime `#c9ff47`
accent, squared UI with corner-cut clip-paths, 36px grid, pointer-tracked 3D
tilt + holographic glare on cards, physical ring-binder personal collection,
honesty stamps as load-bearing elements. Mascots (pure flavor, no mechanics):
nub cat (Discover), wojak (Terminal), pepe (Token), grumpy (Official Binder),
trollface (Leaderboard), doge (My Launchfolio).

## Build / deploy

```
npm install
npm run build   # → dist/
```

Deploy `dist/` to Netlify (static, no build command needed). No env vars.
Hash routing (`#/...`) — no `_redirects` required.
