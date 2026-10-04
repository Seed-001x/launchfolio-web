import { fmtPrice, fmtNum, fmtTime, shortAddr, solscanTx, EM_DASH } from '../lib/format.js';

export default function TradesFeed({ trades }) {
  if (!trades || !trades.length) return null;
  return (
    <table className="data">
      <thead>
        <tr>
          <th>Side</th><th>Price</th><th>Tokens</th><th>SOL</th><th>Wallet</th><th>Time</th><th></th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => {
          const buy = t.side === 'buy';
          return (
            <tr key={`${t.signature}:${t.event_index}`}>
              <td data-label="Side" className={buy ? 'up' : 'down'}>{buy ? 'BUY' : 'SELL'}</td>
              <td data-label="Price">{fmtPrice(t.execution_price)}</td>
              <td data-label="Tokens">{t.token_amount != null ? fmtNum(t.token_amount, 0) : EM_DASH}</td>
              <td data-label="SOL">{t.pair_amount != null ? fmtNum(t.pair_amount, 4) : EM_DASH}</td>
              <td data-label="Wallet">{shortAddr(t.wallet)}</td>
              <td data-label="Time">{fmtTime(t.block_time)}</td>
              <td data-label="Tx">
                <a href={solscanTx(t.signature)} target="_blank" rel="noreferrer" style={{ color: 'var(--lime)' }}>↗</a>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
