import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { fmtUsd, fmtNum, fmtAge } from '../lib/format.js';
import { Mascot, Empty, SourceTag, Tilt } from '../components/ui.jsx';
import GenArt from '../components/GenArt.jsx';

// Genesis qualification criteria, evaluated against real indexed data.
// Anything the index doesn't know renders as "—" (insufficient data).
const CRITERIA = [
  { key: 'holders', label: 'Holders', get: (t) => t.holder_count, pass: (v) => v != null && v >= 100, target: '≥ 100' },
  { key: 'traders', label: 'Unique traders', get: (t) => t._uniqueTraders, pass: (v) => v != null && v >= 25, target: '≥ 25' },
  { key: 'volume', label: 'Volume', get: (t) => t.volume_24h, pass: (v) => v != null && v >= 10000, target: '≥ $10K' },
  { key: 'liquidity', label: 'Liquidity', get: (t) => t.liquidity, pass: (v) => v != null && v >= 5000, target: '≥ $5K' },
  { key: 'age', label: 'Age', get: (t) => t.created_at, pass: (v) => !!v && Date.now() - new Date(v).getTime() > 24 * 3600 * 1000, target: '> 24H' },
  { key: 'sustained', label: 'Sustained activity', get: (t) => t._trades, pass: (v) => v != null && v >= 10, target: '≥ 10 TRADES' },
];

function CandidateCard({ t }) {
  const met = CRITERIA.filter((c) => c.pass(c.get(t))).length;
  const pct = Math.round((met / CRITERIA.length) * 100);
  return (
    <div className="panel">
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <Tilt max={5} style={{ width: 72, flexShrink: 0 }}>
          <div className="card-frame">
            <div className="card-art"><GenArt mint={t.mint} /></div>
          </div>
        </Tilt>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t.name || 'Unnamed'}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>${t.ticker || '???'}</div>
          <a href={`#/token/${t.mint}`} className="mono" style={{ fontSize: 10, color: 'var(--lime)' }}>VIEW TOKEN ↗</a>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="kicker blue">QUALIFICATION</span>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div className="progress" style={{ margin: '0 0 12px' }}><i style={{ width: `${pct}%` }} /></div>
      <table className="data">
        <tbody>
          {CRITERIA.map((c) => {
            const v = c.get(t);
            const known = v !== null && v !== undefined;
            const ok = known && c.pass(v);
            return (
              <tr key={c.key}>
                <td data-label="Criterion" style={{ color: 'var(--faint)' }}>{c.label}</td>
                <td data-label="Value" style={{ textAlign: 'right' }}>
                  {c.key === 'volume' || c.key === 'liquidity' ? fmtUsd(v)
                    : c.key === 'age' ? fmtAge(v)
                    : c.key === 'holders' || c.key === 'traders' || c.key === 'sustained'
                      ? (v != null ? fmtNum(v, 0) : '—')
                      : (v ?? '—')}
                </td>
                <td data-label="Target" style={{ textAlign: 'right' }} className={ok ? 'up' : ''}>
                  {ok ? '✓' : known ? `· ${c.target}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function OfficialBinder() {
  const { data, error, loading } = useFetch(async () => {
    const { data: tokens } = await api.tokens({ sort: 'newest' });
    // Enrich with real trade counts for the sustained-activity criterion.
    const enriched = await Promise.all(
      (tokens || []).map(async (t) => {
        try {
          const { data: trades } = await api.trades(t.mint, 500);
          const wallets = new Set((trades || []).map((x) => x.wallet));
          return { ...t, _trades: (trades || []).length, _uniqueTraders: wallets.size };
        } catch {
          return { ...t, _trades: null, _uniqueTraders: null };
        }
      })
    );
    return { data: enriched };
  }, []);

  const tokens = data?.data || [];
  const qualified = tokens.filter((t) => CRITERIA.every((c) => c.pass(c.get(t))));

  return (
    <div className="wrap page">
      <div className="mascot-side">
        <Mascot id="grumpy" tag="GRUMPY · OFFICIAL BINDER" />
        <div>
          <span className="kicker amber">LAUNCHFOLIO GENESIS COLLECTION</span>
          <h1 className="display">Official Binder</h1>
          <p className="sub" style={{ marginTop: 12 }}>
            The permanent archive. 150 genesis slots — a token claims one only
            when all six qualification criteria are met on verified data.
            Genesis closes permanently when all 150 positions are claimed.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge official">{qualified.length} / 150 QUALIFIED</span>
            <SourceTag source="verified" />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        {loading && <div className="skel" style={{ height: 300 }} />}
        {error && <Empty kicker="ARCHIVE UNREACHABLE" title="Couldn't load the archive" body={error.message} />}
        {!loading && !error && tokens.length === 0 && (
          <Empty
            kicker="NO CANDIDATES"
            title="No tokens under review"
            body="The index hasn't recorded any launches yet, so there is nothing to qualify. The archive opens with the first indexed launch."
            mascot="grumpy"
          />
        )}
        {!loading && !error && tokens.length > 0 && (
          <>
            <h2 className="section" style={{ marginBottom: 16 }}>
              <span className="kicker blue">CANDIDATES · {tokens.length}</span>
            </h2>
            <div className="token-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {tokens.map((t) => <CandidateCard key={t.mint} t={t} />)}
            </div>
          </>
        )}
      </div>

      <div className="honest-note">
        CRITERIA EVALUATED ON VERIFIED INDEX DATA ONLY · UNKNOWN FIELDS RENDER AS — AND NEVER COUNT AS MET · NO MANUAL OVERRIDES.
      </div>
    </div>
  );
}
