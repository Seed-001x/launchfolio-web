import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SolanaProviders, WalletControls } from './wallet.jsx';
import MajorsStrip from './components/MajorsStrip.jsx';
import Discover from './pages/Discover.jsx';
import Token from './pages/Token.jsx';
import Terminal from './pages/Terminal.jsx';
import Launchfolio from './pages/Launchfolio.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import OfficialBinder from './pages/OfficialBinder.jsx';
import Creator from './pages/Creator.jsx';
import './style.css';

const NAV = [
  ['#/', 'Discover'],
  ['#/terminal', 'Terminal'],
  ['#/binder', 'Binder'],
  ['#/leaderboard', 'Leaderboard'],
  ['#/me', 'My Launchfolio'],
];

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function Route({ hash }) {
  if (hash.startsWith('#/token/')) return <Token mint={hash.slice('#/token/'.length)} />;
  if (hash === '#/terminal') return <Terminal />;
  if (hash.startsWith('#/creator/')) return <Creator wallet={hash.slice('#/creator/'.length)} />;
  if (hash === '#/binder') return <OfficialBinder />;
  if (hash === '#/leaderboard') return <Leaderboard />;
  if (hash === '#/me') return <Launchfolio />;
  return <Discover />;
}

function isActive(hash, href) {
  if (href === '#/') return hash === '#/' || hash === '';
  return hash.startsWith(href);
}

function App() {
  const hash = useHashRoute();
  return (
    <div>
      <header className="site">
        <div className="wrap header-in" style={{ maxWidth: 1460 }}>
          <a className="brand" href="#/">
            <span className="brand-mark">L/</span>
            <span>LAUNCHFOLIO<small>COLLECT THE LAUNCHES</small></span>
          </a>
          <nav className="main">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className={isActive(hash, href) ? 'active' : ''}>{label}</a>
            ))}
          </nav>
          <div className="header-right">
            <WalletControls />
          </div>
        </div>
      </header>

      <MajorsStrip />

      <main>
        <Route hash={hash} />
      </main>

      <footer className="site">
        <div className="wrap" style={{ maxWidth: 1460 }}>
          <p>
            LAUNCHFOLIO · REAL ON-CHAIN DATA, VERIFIED BY THE INDEXER.<br />
            UNKNOWN = — · NEVER ZERO, NEVER FABRICATED. NO DEMO DATA IN PRODUCTION.
          </p>
          <p style={{ textAlign: 'right' }}>
            BACKEND NEVER HOLDS KEYS · NEVER SIGNS.<br />
            MAJORS STRIP: DISPLAY ONLY · VIA COINGECKO.
          </p>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <SolanaProviders>
    <App />
  </SolanaProviders>
);
