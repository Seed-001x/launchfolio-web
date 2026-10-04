import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { shortAddr, fmtTime } from '../lib/format.js';
import { Mascot, Empty, SourceTag, CopyBtn } from '../components/ui.jsx';
import GenArt from '../components/GenArt.jsx';
import { Tilt } from '../components/ui.jsx';

export default function Creator({ wallet }) {
  const { data, error, loading } = useFetch(() => api.creator(wallet), [wallet]);
  const launches = data?.data?.launches || [];

  return (
    <div className="wrap page">
      <a href="#/" className="mono" style={{ fontSize: 11, color: 'var(--lime)', letterSpacing: '.1em' }}>← BACK TO DISCOVER</a>
      <div className="page-head" style={{ marginTop: 20 }}>
        <span className="kicker blue">CREATOR PROFILE · VERIFIED LAUNCHES</span>
        <h1 className="display" style={{ fontSize: 'clamp(24px,3.4vw,40px)', wordBreak: 'break-all' }}>
          {shortAddr(wallet, 8)}
        </h1>
        <div className="addr" style={{ marginTop: 10 }}>
          <CopyBtn value={wallet} />
          <SourceTag source="verified" />
        </div>
        <p className="sub" style={{ marginTop: 12 }}>
          Every token this wallet created that the indexer has verified. Launchfolio-origin
          status requires a verified launch record — it is never inferred from Pump presence.
        </p>
      </div>

      {loading && <div className="skel" style={{ height: 240 }} />}
      {error && <Empty kicker="PROFILE UNREACHABLE" title="Couldn't load this creator" body={error.message} />}
      {!loading && !error && launches.length === 0 && (
        <Empty
          kicker="NO LAUNCHES"
          title="No indexed launches for this wallet"
          body="The indexer has no verified tokens created by this wallet. Absence here means not indexed — not that nothing was launched."
          mascot="pepe"
        />
      )}
      {!loading && !error && launches.length > 0 && (
        <div className="token-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {launches.map((t) => (
            <Tilt className="card-frame hoverable" key={t.mint}>
              <a href={`#/token/${t.mint}`} style={{ display: 'block' }}>
                <div className="card-art">
                  <GenArt mint={t.mint} />
                  <div className="card-top">
                    {t.is_launchfolio_origin
                      ? <span className="badge official">LAUNCHFOLIO</span>
                      : <span className="badge plain">EXTERNAL</span>}
                  </div>
                </div>
                <div className="card-body">
                  <h3>{t.name || 'Unnamed'}</h3>
                  <div className="tick">${t.ticker || '???'}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', marginTop: 8 }}>
                    {t.created_at ? fmtTime(t.created_at) : '—'}
                  </div>
                </div>
              </a>
            </Tilt>
          ))}
        </div>
      )}
    </div>
  );
}
