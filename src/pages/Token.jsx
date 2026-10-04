import { useState } from 'react';
import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { fmtUsd, fmtPrice, fmtNum, fmtAge, fmtTime, shortAddr, solscanTx, pumpUrl, EM_DASH } from '../lib/format.js';
import { Mascot, Empty, SourceTag, CopyBtn, Stamp } from '../components/ui.jsx';
import GenArt from '../components/GenArt.jsx';
import CandleChart from '../components/CandleChart.jsx';
import TradesFeed from '../components/TradesFeed.jsx';

const TFS = ['5m', '15m', '1h', '4h', '1d'];

function Health({ token, trades }) {
  // FACTS, NOT A SAFETY SCORE — only what we can verify.
  const facts = [
    ['Launch provider', (token.launch_provider || EM_DASH).toUpperCase()],
    ['Launch origin', (token.launch_origin || EM_DASH).replace('_', ' ')],
    ['Creator', token.creator_wallet ? shortAddr(token.creator_wallet) : EM_DASH],
    ['Indexed trades', trades ? String(trades.length) : EM_DASH],
    ['Graduation', token.graduated_at ? fmtTime(token.graduated_at) : 'Not graduated'],
    ['Data freshness', token.stale ? 'STALE — indexer catching up' : 'Fresh'],
  ];
  return (
    <div className="panel">
      <span className="kicker">TOKEN HEALTH</span>
      <p className="mono" style={{ fontSize: 10, color: 'var(--faint)', marginBottom: 12 }}>FACTS, NOT A SAFETY SCORE</p>
      <table className="data">
        <tbody>
          {facts.map(([k, v]) => (
            <tr key={k}>
              <td data-label="Fact" style={{ color: 'var(--faint)' }}>{k}</td>
              <td data-label="Value" style={{ textAlign: 'right' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Token({ mint }) {
  const [tf, setTf] = useState('15m');
  const tokenQ = useFetch(() => api.token(mint), [mint]);
  const tradesQ = useFetch(() => api.trades(mint, 50), [mint]);
  const candlesQ = useFetch(() => api.candles(mint, tf), [mint, tf]);
  const holdersQ = useFetch(() => api.holders(mint), [mint]);

  const token = tokenQ.data?.data;
  const trades = tradesQ.data?.data || [];
  const candles = candlesQ.data?.data || [];
  const holders = holdersQ.data?.data;

  if (tokenQ.loading) {
    return (
      <div className="wrap page">
        <div className="skel" style={{ height: 200, marginBottom: 20 }} />
        <div className="skel" style={{ height: 430 }} />
      </div>
    );
  }

  if (tokenQ.error) {
    return (
      <div className="wrap page">
        <a href="#/" className="mono" style={{ fontSize: 11, color: 'var(--lime)' }}>← BACK TO DISCOVER</a>
        <div style={{ marginTop: 20 }}>
          <Empty
            kicker="NOT INDEXED"
            title="This token isn't in the index"
            body={tokenQ.error.status === 404 ? 'The indexer has no record of this mint. Nothing to show — we don\'t invent token pages.' : `Couldn't load it: ${tokenQ.error.message}`}
            mascot="pepe"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page" style={{ maxWidth: 1540 }}>
      <a href="#/" className="mono" style={{ fontSize: 11, color: 'var(--lime)', letterSpacing: '.1em' }}>← BACK TO DISCOVER</a>

      <div className="mascot-side" style={{ marginTop: 20, marginBottom: 8 }}>
        <Mascot id="pepe" tag="PEPE · TOKEN INSPECTOR" />
        <div>
          <div className="token-head">
            <div className="token-thumb"><GenArt mint={token.mint} /></div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span className="kicker">{(token.launch_state || 'UNKNOWN').toUpperCase()} · {(token.launch_origin || '').replace('_', ' ')}</span>
              <h1 className="display" style={{ fontSize: 'clamp(28px,4vw,44px)', margin: '6px 0' }}>
                {token.name || 'Unnamed'} <span style={{ color: 'var(--muted)', fontSize: '.6em' }}>${token.ticker || '???'}</span>
              </h1>
              <div className="addr">
                <span>{shortAddr(token.mint, 8)}</span>
                <CopyBtn value={token.mint} />
                <SourceTag source="verified" />
              </div>
              <div className="ext-links">
                <a href={pumpUrl(token.mint)} target="_blank" rel="noreferrer">PUMP.FUN ↗</a>
                <a href={solscanTx(token.mint)} target="_blank" rel="noreferrer">SOLSCAN ↗</a>
                {token.creator_wallet && <a href={`#/creator/${token.creator_wallet}`}>CREATOR ↗</a>}
              </div>
            </div>
          </div>

          <div className="mkt-strip">
            <div className="mkt"><div className="k">Price</div><div className="v">{fmtPrice(token.price)}</div></div>
            <div className="mkt"><div className="k">Market Cap</div><div className="v">{fmtUsd(token.mcap)}</div></div>
            <div className="mkt"><div className="k">24h Volume</div><div className="v">{fmtUsd(token.volume_24h)}</div></div>
            <div className="mkt"><div className="k">Liquidity</div><div className="v">{fmtUsd(token.liquidity)}</div></div>
            <div className="mkt"><div className="k">Holders</div><div className="v">{token.holder_count != null ? fmtNum(token.holder_count, 0) : '—'}</div></div>
            <div className="mkt"><div className="k">Age</div><div className="v">{fmtAge(token.created_at)}</div></div>
          </div>
        </div>
      </div>

      <div className="term-grid">
        <div>
          <div className="panel chart-wrap">
            <span className="kicker">PRICE · INDEXED TRADES ONLY</span>
            {candlesQ.loading ? (
              <div className="skel" style={{ height: 430 }} />
            ) : candles.length > 0 ? (
              <CandleChart candles={candles} />
            ) : (
              <Empty
                kicker="NO CANDLES"
                title="No trades indexed yet"
                body="The chart draws only from verified on-chain trades. Buckets with no trades are omitted — never interpolated. It appears here the moment the indexer records activity."
              />
            )}
            <div className="timeframes">
              {TFS.map((t) => (
                <button key={t} className={`tf${tf === t ? ' active' : ''}`} onClick={() => setTf(t)}>{t}</button>
              ))}
            </div>
            <div className="honest-note">READ-ONLY TERMINAL · TRADE EXECUTION IS NOT WIRED IN THIS BUILD. NOTHING HERE MOVES FUNDS.</div>
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="kicker">TRANSACTIONS · LATEST {trades.length}</span>
            {tradesQ.loading ? <div className="skel" style={{ height: 200 }} /> :
              trades.length > 0 ? <TradesFeed trades={trades} /> :
              <Empty kicker="NO TRADES" title="No trades indexed" body="When this token trades on-chain and the indexer records it, the feed fills in here." />}
          </div>
        </div>

        <div>
          <div className="panel">
            <span className="kicker">HOLDERS</span>
            {holdersQ.loading ? <div className="skel" style={{ height: 160 }} /> :
              holdersQ.error ? (
                <Empty
                  kicker="HOLDER DATA DELAYED"
                  title="Holders unavailable right now"
                  body={holdersQ.error.detail || holdersQ.error.message || 'The RPC read failed. Holder counts are delayed — not zero.'}
                />
              ) : (
                <>
                  <p className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
                    SUPPLY {holders.total_supply != null ? fmtNum(holders.total_supply, 0) : '—'} · <SourceTag source="rpc-live" />
                  </p>
                  <table className="data">
                    <thead><tr><th>Wallet</th><th>Amount</th><th>Share</th></tr></thead>
                    <tbody>
                      {(holders.holders || []).map((h) => (
                        <tr key={h.address}>
                          <td data-label="Wallet">{shortAddr(h.address)}</td>
                          <td data-label="Amount">{fmtNum(h.amount, 0)}</td>
                          <td data-label="Share">{h.pct != null ? `${h.pct.toFixed(2)}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
          </div>

          <div style={{ marginTop: 20 }}>
            <Health token={token} trades={trades.length ? trades : null} />
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="kicker">SUPPLY</span>
            <table className="data">
              <tbody>
                <tr><td data-label="Fact" style={{ color: 'var(--faint)' }}>Decimals</td><td data-label="Value" style={{ textAlign: 'right' }}>{token.decimals ?? '—'}</td></tr>
                <tr><td data-label="Fact" style={{ color: 'var(--faint)' }}>Pair asset</td><td data-label="Value" style={{ textAlign: 'right' }}>{token.pair_asset || '—'}</td></tr>
                <tr><td data-label="Fact" style={{ color: 'var(--faint)' }}>Decoder</td><td data-label="Value" style={{ textAlign: 'right' }}>{token.decoder_version || '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
