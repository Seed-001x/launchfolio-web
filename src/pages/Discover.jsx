import { useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { fmtUsd, fmtAge, fmtNum } from '../lib/format.js';
import { Tilt, Mascot, Empty, SourceTag } from '../components/ui.jsx';
import GenArt from '../components/GenArt.jsx';

function stateBadge(t) {
  if (t.launch_state === 'graduated') return <span className="badge official">GRADUATED</span>;
  if (t.launch_state === 'bonding') return <span className="badge new">BONDING</span>;
  return <span className="badge plain">{(t.launch_state || 'UNKNOWN').toUpperCase()}</span>;
}

function TokenCard({ t }) {
  return (
    <Tilt className="card-frame hoverable">
      <a href={`#/token/${t.mint}`} style={{ display: 'block' }}>
        <div className="card-art">
          <GenArt mint={t.mint} />
          <div className="card-top">
            {stateBadge(t)}
            {t.stale && <span className="badge plain">STALE</span>}
          </div>
        </div>
        <div className="card-body">
          <h3>{t.name || 'Unnamed'}</h3>
          <div className="tick">${t.ticker || '???'} · {t.mint.slice(0, 6)}…{t.mint.slice(-4)}</div>
          <div className="stat-grid">
            <div className="stat"><div className="k">Market Cap</div><div className="v">{fmtUsd(t.mcap)}</div></div>
            <div className="stat"><div className="k">24h Volume</div><div className="v">{fmtUsd(t.volume_24h)}</div></div>
            <div className="stat"><div className="k">Holders</div><div className="v">{t.holder_count != null ? fmtNum(t.holder_count, 0) : '—'}</div></div>
            <div className="stat"><div className="k">Age</div><div className="v">{fmtAge(t.created_at)}</div></div>
          </div>
        </div>
      </a>
    </Tilt>
  );
}

export default function Discover() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [state, setState] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const debounceT = useRef(null);

  const onSearch = (v) => {
    setQ(v);
    clearTimeout(debounceT.current);
    debounceT.current = setTimeout(() => setDebouncedQ(v.trim()), 350);
  };

  const { data, error, loading } = useFetch(
    () => api.tokens({ sort, ...(debouncedQ ? { q: debouncedQ } : {}), ...(state ? { state } : {}) }),
    [sort, debouncedQ, state]
  );
  const tokens = data?.data || [];

  return (
    <div className="wrap page">
      <div className="hero">
        <div>
          <span className="kicker">DROP 001 · INDEXED ON-CHAIN</span>
          <h1 className="display">Discover</h1>
          <p className="sub" style={{ marginTop: 12 }}>
            Every launch. Every position. One market. Tokens below are indexed
            directly from Solana — what the chain hasn't told us yet shows as{' '}
            <span className="mono">—</span>, never as a guess.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <SourceTag source="verified" />
          </div>
        </div>
        <div className="hero-mascot">
          <Mascot id="nubcat" />
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search name, ticker, or mint…"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search tokens"
        />
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
        </select>
        <div className="pills">
          {[
            ['', 'All'],
            ['bonding', 'Bonding'],
            ['graduated', 'Graduated'],
          ].map(([v, label]) => (
            <button key={label} className={`pill${state === v ? ' active' : ''}`} onClick={() => setState(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="token-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="skel" key={i} />
          ))}
        </div>
      )}

      {error && (
        <Empty
          kicker="INDEXER UNREACHABLE"
          title="Can't reach the index right now"
          body={`The backend didn't answer (${error.message}). Your funds are never involved — this is a read view. Try again in a bit.`}
        />
      )}

      {!loading && !error && tokens.length === 0 && (
        <Empty
          kicker="NOTHING INDEXED"
          title="No tokens indexed yet"
          body="The indexer hasn't recorded any launches. When the first launch hits the chain and gets indexed, it appears here — we don't invent listings."
          mascot="nubcat"
        />
      )}

      {!loading && !error && tokens.length > 0 && (
        <>
          <p className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 16 }}>
            {tokens.length} TOKEN{tokens.length === 1 ? '' : 'S'} INDEXED · TAP A CARD TO INSPECT
          </p>
          <div className="token-grid">
            {tokens.map((t) => (
              <TokenCard key={t.mint} t={t} />
            ))}
          </div>
        </>
      )}

      <div className="honest-note">
        UNKNOWN = — · PRICES, MARKET CAPS AND VOLUMES APPEAR ONLY WHEN THE INDEXER HAS VERIFIED DATA. NOTHING HERE IS SIMULATED.
      </div>
    </div>
  );
}
