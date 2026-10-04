import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { api } from './lib/api.js';
import '@solana/wallet-adapter-react-ui/styles.css';

const RPC = 'https://solana-rpc.publicnode.com';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function AuthInner({ children }) {
  const { publicKey, signMessage, connected } = useWallet();
  const [session, setSession] = useState(() => {
    try {
      const t = localStorage.getItem('lf_token');
      const u = localStorage.getItem('lf_user');
      const p = localStorage.getItem('lf_pubkey');
      return t && u ? { token: t, user: JSON.parse(u), pubkey: p } : null;
    } catch {
      return null;
    }
  });
  const [signing, setSigning] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Drop session if the wallet changed underneath it.
  useEffect(() => {
    if (session && publicKey && session.pubkey !== publicKey.toBase58()) {
      signOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey?.toBase58()]);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setAuthError('Connect a wallet first.');
      return;
    }
    setSigning(true);
    setAuthError(null);
    try {
      const pubkey = publicKey.toBase58();
      const { nonce, message } = await api.nonce(pubkey);
      // The signed payload is a human-readable sign-in message. No funds move.
      const sig = await signMessage(new TextEncoder().encode(message));
      const { token, user } = await api.verify(pubkey, nonce, b64(sig));
      const sess = { token, user, pubkey };
      localStorage.setItem('lf_token', token);
      localStorage.setItem('lf_user', JSON.stringify(user));
      localStorage.setItem('lf_pubkey', pubkey);
      setSession(sess);
    } catch (e) {
      setAuthError(e.message || 'Sign-in failed.');
    } finally {
      setSigning(false);
    }
  }, [publicKey, signMessage]);

  const signOut = useCallback(() => {
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user');
    localStorage.removeItem('lf_pubkey');
    setSession(null);
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({ session, signing, authError, signIn, signOut, walletPubkey: publicKey?.toBase58() || null, connected }),
    [session, signing, authError, signIn, signOut, publicKey, connected]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function SolanaProviders({ children }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthInner>{children}</AuthInner>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function WalletControls() {
  const { session, signing, authError, signIn, signOut, connected } = useAuth();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <WalletMultiButton />
      {connected && !session && (
        <button className="btn btn-sm btn-lime" onClick={signIn} disabled={signing}>
          {signing ? 'SIGNING…' : 'SIGN IN'}
        </button>
      )}
      {session && (
        <button className="btn btn-sm" onClick={signOut} title="End session">
          @{session.user.handle || session.pubkey.slice(0, 4)} · OUT
        </button>
      )}
      {authError && (
        <span className="mono" style={{ fontSize: 10, color: 'var(--red)' }}>{authError}</span>
      )}
    </div>
  );
}
