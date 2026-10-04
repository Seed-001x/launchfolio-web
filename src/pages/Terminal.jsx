import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { fmtAge, fmtUsd } from '../lib/format.js';
import { Mascot, Empty, Stamp } from '../components/ui.jsx';

// Terminal index: pick an indexed token to open the read-only terminal.
export default function Terminal() {
  const { data, error, loading } = useFetch(() => api.tokens({ sort: 'newest' }), []);
  const tokens = data?.data || [];

  return (
    <div className="wrap page">
      <div className="mascot-side">
        <Mascot id="wojak" tag="WOJAK · TERMINAL DESK" />
        <div>
          <span className="kicker">READ-ONLY TERMINAL</span>
          <h1 className="display">Terminal</h1>
          <p className="sub" style={{ marginTop: 12 }}>
            Live charts and trade feeds from the index. Execution is not wired in
            this build — the terminal reads, it never trades.
          </p>
          <div style={{ marginTop: 16 }}>
            <Stamp>READ-ONLY · NO TRADE EXECUTION · NOTHING HERE MOVES FUNDS</Stamp>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        {loading && <div className="skel" style={{ height: 200 }} />}
        {error && <Empty kicker="TERMINAL OFFLINE" title="Couldn't reach the index" body={error.message} />}
        {!loading && !error && tokens.length === 0 && (
          <Empty
            kicker="NO FEED"
            title="No indexed tokens to chart"
            body="The terminal opens per token from real indexed data. Nothing indexed yet — it comes alive with the first launch."
            mascot="wojak"
          />
        )}
        {!loading && !error && tokens.length > 0 && (
          <div className="panel" style={{ padding: 0 }}>
            <table className="data">
              <thead><tr><th>Token</th><th>State</th><th>MCap</th><th>Age</th><th></th></tr></thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.mint}>
                    <td data-label="Token" style={{ fontWeight: 700 }}>{t.name || 'Unnamed'} <span style={{ color: 'var(--muted)' }}>${t.ticker}</span></td>
                    <td data-label="State">{(t.launch_state || '—').toUpperCase()}</td>
                    <td data-label="MCap">{fmtUsd(t.mcap)}</td>
                    <td data-label="Age">{fmtAge(t.created_at)}</td>
                    <td data-label="Open"><a href={`#/token/${t.mint}`} className="btn btn-sm btn-lime">OPEN TERMINAL</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
