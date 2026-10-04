import { useEffect, useState } from 'react';
import { fetchMajors } from '../lib/dex.js';
import { fmtPct, isKnown } from '../lib/format.js';

function fmtMajorPrice(p) {
  if (p == null || !isFinite(p)) return '—';
  if (p < 0.01) return `$${p.toFixed(7).replace(/0+$/, '').replace(/\.$/, '')}`;
  return `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

// Slim ticker tape under the header. CoinGecko display-only data, clearly
// labeled — separate from Launchfolio's indexed on-chain data.
export default function MajorsStrip() {
  const [majors, setMajors] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchMajors().then((m) => {
      if (alive && m.length) setMajors(m);
    });
    const t = setInterval(() => {
      fetchMajors().then((m) => {
        if (alive && m.length) setMajors(m);
      });
    }, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!majors) return null;

  return (
    <div className="majors-tape" aria-label="Major crypto prices">
      <div className="majors-label">
        <span className="dot" />
        MAJORS · COINGECKO
      </div>
      <div className="majors-scroll">
        {majors.map((m) => {
          const dir = isKnown(m.change24h) ? (m.change24h >= 0 ? 'up' : 'down') : '';
          return (
            <div className="major" key={m.symbol}>
              <span className="sym">{m.symbol}</span>
              <span className="px">{fmtMajorPrice(m.priceUsd)}</span>
              <span className={`chg ${dir}`}>{fmtPct(m.change24h)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
