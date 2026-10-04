import { useAuth } from '../wallet.jsx';
import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { Mascot, Empty, SourceTag } from '../components/ui.jsx';

export default function Leaderboard() {
  const { session } = useAuth();
  const { data, error, loading } = useFetch(() => api.leaderboard(), []);
  const rows = data?.data || [];

  return (
    <div className="wrap-narrow page">
      <div className="mascot-side">
        <Mascot id="trollface" tag="TROLLFACE · LEADERBOARD" />
        <div>
          <span className="kicker">SEASON 01 · VERIFIED BOARD</span>
          <h1 className="display">Leaderboard</h1>
          <p className="sub" style={{ marginTop: 12 }}>
            Ranked by verified XP from real on-chain activity. No demo users, no
            mock entries — the verified and demo boards are never mixed.
          </p>
          <div style={{ marginTop: 16 }}><SourceTag source="verified" /></div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        {loading && <div className="skel" style={{ height: 300 }} />}

        {error && (
          <Empty kicker="BOARD UNREACHABLE" title="Couldn't load the board" body={error.message} />
        )}

        {!loading && !error && rows.length === 0 && (
          <Empty
            kicker="EMPTY BOARD"
            title="No verified XP on the board yet"
            body="Nobody has earned verified XP yet. The board fills as real activity gets indexed — we don't seed it with placeholders."
            mascot="trollface"
          />
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="panel" style={{ padding: 0 }}>
            <table className="data">
              <thead><tr><th>#</th><th>User</th><th>XP</th><th>Events</th></tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const isYou = session && String(r.user_id) === String(session.user.id);
                  return (
                    <tr key={r.user_id} className={isYou ? 'you-row' : ''}>
                      <td data-label="Rank" className="rank">{i + 1}</td>
                      <td data-label="User">
                        {r.handle ? `@${r.handle}` : `USER #${r.user_id}`}
                        {isYou && <span className="badge new" style={{ marginLeft: 8 }}>YOU</span>}
                      </td>
                      <td data-label="XP">{r.xp}</td>
                      <td data-label="Events">{r.xp_events}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="honest-note">
        XP IS NOT MONEY · NO XP→$ CONVERSION · LAUNCHING TOKENS EARNS NO AUTOMATIC LARGE XP — SPAM-LAUNCHING IS NOT REWARDED.
      </div>
    </div>
  );
}
