import { useAuth, WalletControls } from '../wallet.jsx';
import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { fmtNum, fmtUsd, fmtTime, shortAddr } from '../lib/format.js';
import { Mascot, Empty, SourceTag, Stamp, Tilt } from '../components/ui.jsx';

function Sleeve({ card, index }) {
  if (!card) {
    return (
      <div className="sleeve empty">
        <span className="slot-label">SLOT {String(index + 1).padStart(2, '0')} · EMPTY</span>
      </div>
    );
  }
  return (
    <div className="sleeve">
      <div className="mini">
        <Tilt className="mini-card" max={8}>
          <div className="mk">{(card.rarity || 'COMMON').toUpperCase()}</div>
          <div className="mt">{card.token_ticker ? `$${card.token_ticker}` : shortAddr(card.token_mint, 4)}</div>
          <div className="mk">{card.created_at ? fmtTime(card.created_at) : ''}</div>
        </Tilt>
      </div>
    </div>
  );
}

function BinderBook({ cards }) {
  const slots = Array.from({ length: 9 }, (_, i) => cards[i] || null);
  return (
    <div className="binder-book">
      <div className="binder-spine">
        {[0, 1, 2, 3].map((i) => <div className="ring" key={i} />)}
      </div>
      <p className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.14em', textAlign: 'center', marginBottom: 16 }}>
        PAGE 01 · PERSONAL HISTORY · {cards.length} CARD{cards.length === 1 ? '' : 'S'}
      </p>
      <div className="sleeve-grid">
        {slots.map((c, i) => <Sleeve key={i} card={c} index={i} />)}
      </div>
      <div className="honest-note">
        CARDS ARE MINTED FROM YOUR VERIFIED ON-CHAIN POSITIONS. EMPTY SLEEVES AREN'T MISSING DATA — THEY'RE WAITING.
      </div>
    </div>
  );
}

function Portfolio({ pubkey }) {
  const pf = useFetch(() => api.portfolio(pubkey), [pubkey]);
  const pos = useFetch(() => api.positions(pubkey), [pubkey]);

  return (
    <div>
      <div className="panel">
        <span className="kicker">PORTFOLIO · {shortAddr(pubkey)}</span>
        {pf.loading ? <div className="skel" style={{ height: 140 }} /> :
          pf.error ? (
            <Empty kicker="PORTFOLIO DELAYED" title="Couldn't read this wallet" body={pf.error.detail || pf.error.message || 'The RPC read failed. Balances are delayed — not zero.'} />
          ) : (
            <>
              <div className="mkt-strip" style={{ gridTemplateColumns: 'repeat(2,1fr)', margin: '0 0 16px' }}>
                <div className="mkt"><div className="k">SOL balance</div><div className="v">{pf.data.data.sol_balance != null ? `${fmtNum(pf.data.data.sol_balance, 4)} SOL` : '—'}</div></div>
                <div className="mkt"><div className="k">Token holdings</div><div className="v">{(pf.data.data.holdings || []).length}</div></div>
              </div>
              {(pf.data.data.holdings || []).length > 0 ? (
                <table className="data">
                  <thead><tr><th>Token</th><th>Balance</th><th></th></tr></thead>
                  <tbody>
                    {pf.data.data.holdings.map((h) => (
                      <tr key={h.mint}>
                        <td data-label="Token">{h.token ? `$${h.token.ticker}` : shortAddr(h.mint)}</td>
                        <td data-label="Balance">{fmtNum(h.balance, 2)}</td>
                        <td data-label="Link"><a href={`#/token/${h.mint}`} style={{ color: 'var(--lime)' }}>VIEW ↗</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>No token holdings in this wallet. Balances are live — empty means empty, not missing.</p>
              )}
              <div style={{ marginTop: 10 }}><SourceTag source="rpc-live" /></div>
            </>
          )}
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <span className="kicker">POSITIONS · INDEXED</span>
        {pos.loading ? <div className="skel" style={{ height: 120 }} /> :
          (pos.data?.data || []).length > 0 ? (
            <table className="data">
              <thead><tr><th>Token</th><th>Entry</th><th>Size</th><th>Status</th></tr></thead>
              <tbody>
                {pos.data.data.map((p, i) => (
                  <tr key={i}>
                    <td data-label="Token">{p.token_ticker ? `$${p.token_ticker}` : shortAddr(p.mint)}</td>
                    <td data-label="Entry">{p.entry_price != null ? `$${fmtNum(p.entry_price, 6)}` : '—'}</td>
                    <td data-label="Size">{p.size != null ? fmtNum(p.size, 0) : '—'}</td>
                    <td data-label="Status">{(p.status || 'open').toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>No indexed positions for this wallet yet. <SourceTag source="verified" /></p>
          )}
      </div>
    </div>
  );
}

export default function Launchfolio() {
  const { session, connected, walletPubkey, signIn, signing } = useAuth();
  const lb = useFetch(() => api.leaderboard(), []);
  const myRow = session && (lb.data?.data || []).find((r) => String(r.user_id) === String(session.user.id));
  const cardsQ = useFetch(() => (session ? api.cards(session.user.id) : Promise.resolve({ data: [] })), [session?.user.id]);

  return (
    <div className="wrap page" style={{ maxWidth: 1420 }}>
      <div className="mascot-side">
        <Mascot id="doge" tag="DOGE · MY LAUNCHFOLIO" />
        <div>
          <span className="kicker">PERSONAL COLLECTION</span>
          <h1 className="display">My Launchfolio</h1>
          <p className="sub" style={{ marginTop: 12 }}>
            Your wallet, your positions, your cards — read live. Nothing here is
            simulated and nothing here can move your funds.
          </p>
          <div style={{ marginTop: 16 }}>
            <WalletControls />
          </div>
        </div>
      </div>

      {!connected && (
        <div style={{ marginTop: 28 }}>
          <Empty
            kicker="WALLET REQUIRED"
            title="Connect to see your Launchfolio"
            body="Connect a Solana wallet (Phantom) to read your portfolio and positions. Connection is read-only — signing in is a separate, explicit step and only ever signs a human-readable login message."
            mascot="doge"
          />
        </div>
      )}

      {connected && (
        <div style={{ marginTop: 28 }}>
          <div className="profile-head">
            <div className="avatar">{(session?.user.handle || walletPubkey || '?').slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                {session?.user.handle ? `@${session.user.handle}` : shortAddr(walletPubkey, 6)}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                {session ? `SIGNED IN · USER #${session.user.id}` : 'CONNECTED · NOT SIGNED IN'}
              </div>
            </div>
            {myRow && <div className="level-badge">LV. — · {myRow.xp} XP</div>}
            {!session && (
              <button className="btn btn-lime" onClick={signIn} disabled={signing}>
                {signing ? 'AWAITING SIGNATURE…' : 'SIGN IN TO LAUNCHFOLIO'}
              </button>
            )}
          </div>

          {!session && (
            <div style={{ marginBottom: 20 }}>
              <Stamp>CONNECT ≠ SIGN-IN</Stamp>
              <p className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                Your portfolio below is public on-chain data. Your card binder unlocks with sign-in —
                one signature on a human-readable message, single-use, expires in 10 minutes. No transactions, no funds move.
              </p>
            </div>
          )}

          <Portfolio pubkey={walletPubkey} />

          <h2 className="section" style={{ margin: '32px 0 16px' }}>Card binder</h2>
          {!session ? (
            <Empty
              kicker="SIGN-IN REQUIRED"
              title="Your binder is behind sign-in"
              body="Cards are tied to your Launchfolio identity, not just the wallet address. Sign in above to open your binder."
            />
          ) : cardsQ.loading ? (
            <div className="skel" style={{ height: 420 }} />
          ) : (
            <BinderBook cards={cardsQ.data?.data || []} />
          )}
        </div>
      )}

      <div className="honest-note">
        NO XP→$ CONVERSION ANYWHERE · PROGRESSION IS SUBORDINATE TO TRADING AND COLLECTION · DEMO DATA NEVER APPEARS HERE.
      </div>
    </div>
  );
}
