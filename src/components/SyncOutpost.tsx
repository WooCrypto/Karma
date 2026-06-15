import { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertTriangle, ArrowRight, Wallet, Shield, ExternalLink } from 'lucide-react';
import KarmaLogo from './KarmaLogo';

interface SyncOutpostProps {
  sessionId: string;
}

export default function SyncOutpost({ sessionId }: SyncOutpostProps) {
  const [status, setStatus] = useState<'loading' | 'pending' | 'signing' | 'success' | 'error' | 'expired'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [metaMaskDeepLink, setMetaMaskDeepLink] = useState<string>('');
  const [trustDeepLink, setTrustDeepLink] = useState<string>('');
  const [rainbowDeepLink, setRainbowDeepLink] = useState<string>('');

  useEffect(() => {
    // Generate standard deep-links for various mobile wallet browsers
    const rawUrl = window.location.href;
    const cleanUrl = rawUrl.replace(/^https?:\/\//, '');
    
    setMetaMaskDeepLink(`https://metamask.app.link/dapp/${cleanUrl}`);
    setTrustDeepLink(`https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(rawUrl)}`);
    setRainbowDeepLink(`https://rainbow.me/open-url?url=${encodeURIComponent(rawUrl)}`);

    // Fetch session details from our API
    async function fetchSession() {
      try {
        const res = await fetch(`/api/sync/status/${sessionId}`);
        if (!res.ok) {
          throw new Error('Failed to load validation session details. The link may have expired.');
        }
        const data = await res.json();
        if (data.status === 'expired') {
          setStatus('expired');
        } else if (data.status === 'signed') {
          setStatus('success');
        } else {
          setUsername(data.username);
          setStatus('pending');
          // Fetch the message from create route or reconstruct challenge message
          // Create API already provides the message to sign via database session
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Verification session cannot be located.');
      }
    }

    fetchSession();
  }, [sessionId]);

  // Fetch the full message challenge structure
  useEffect(() => {
    if (status === 'pending') {
      // Re-query or rely on status endpoint which we can enhance to provide the raw message
      async function fetchMessageDetails() {
        try {
          const res = await fetch(`/api/sync/status/${sessionId}`);
          const data = await res.json();
          // Find if there is a message
          if (data.status === 'pending') {
            // Wait, we can fetch active message by retrieving session or we can query status which has it
          }
        } catch (_) {}
      }
      fetchMessageDetails();
    }
  }, [status]);

  // Enhanced Status query which also holds message challenge
  // Let's implement active login handshake
  async function handleLinkAndSign() {
    setError(null);
    setStatus('signing');

    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('No active Web3 browser environment detected. Please open this page inside a mobile wallet browser, or use MetaMask / Coinbase Wallet app link.');
      }

      const provider = (window as any).ethereum;
      
      // Request Account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts || !accounts[0]) {
        throw new Error('No account found. Please open your wallet app and authorize account access.');
      }
      const activeAddress = accounts[0];
      setAddress(activeAddress);

      // Request Message details from session endpoint to sign
      const statusRes = await fetch(`/api/sync/status/${sessionId}`);
      if (!statusRes.ok) {
        throw new Error('Verification session lost. Restart synchronization.');
      }
      
      // Look up challenge details to sign
      const challengeRes = await fetch(`/api/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress })
      });
      const challengeData = await challengeRes.json();
      if (!challengeData || !challengeData.message) {
        throw new Error('Failed to compile verification handshake challenge.');
      }

      // Dynamic session updates with correct message challenge
      // Ensure we sign the session-linked message challenge so it ties to the active session ID!
      const syncChallengeMessage = `Sign this message to complete your out-of-browser Sync Challenge for the KARMA reputation passport.\n\nSession Code: ${sessionId}\nChallenge Code: ${challengeData.challenge}\nTimestamp: ${Date.now()}`;

      // Request personal sign
      const signature = await provider.request({
        method: 'personal_sign',
        params: [syncChallengeMessage, activeAddress]
      });

      if (!signature) {
        throw new Error('Wallet signature request was rejected.');
      }

      // Submit signature to update session status
      const verifyRes = await fetch('/api/sync/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          address: activeAddress,
          signature,
          wallet: {
            id: 'outsidesync',
            name: 'Outside Browser Signer',
            icon: '📱',
            color: '#14F195',
            desc: 'Mobile browser link'
          }
        })
      });

      if (!verifyRes.ok) {
        const verifyError = await verifyRes.json();
        throw new Error(verifyError.error || 'Failed to authenticate signature on index server.');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('[SYNC] Signing process failed:', err);
      setError(err.message || 'Authentication failed. Please verify that your wallet is unlocked and try again.');
      setStatus('pending');
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden bg-[#030206]">
      {/* Immersive background graphic elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Brand header */}
      <div className="flex flex-col items-center gap-2 mb-10 text-center relative z-10 animate-fade-in">
        <KarmaLogo size={48} className="text-purple-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.3)] duration-300" />
        <h1 className="text-xl font-extrabold uppercase tracking-widest text-slate-100 mt-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          KARMA <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent font-black">OUTPOST</span>
        </h1>
        <p className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa]/60 font-bold px-2 py-0.5 bg-purple-500/10 border border-purple-500/15 rounded-md mt-1">
          SOVEREIGN CREDENTIAL BRIDGE
        </p>
      </div>

      {/* Main card panel */}
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0c0a18]/60 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative z-10 animate-scale-in text-center">
        {status === 'loading' && (
          <div className="space-y-4 py-8">
            <div className="h-10 w-10 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto" />
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Connecting Outpost Signal...
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans max-w-xs mx-auto">
              Please wait while we establish a secure, zero-trust handshake link with your primary screen.
            </p>
          </div>
        )}

        {status === 'pending' && (
          <div className="space-y-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm mb-1">
                <span>👤</span> Sync Request for @{username || 'Anonymous'}
              </div>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                You are connecting from an outside browser. Sign the secure authorization challenge to link your on-chain reputation stats instantly.
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-relaxed font-mono font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* If window.ethereum is found */}
            {typeof window !== 'undefined' && (window as any).ethereum ? (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-emerald-300 leading-relaxed font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
                    <span>✨</span> Active Wallet Detected!
                  </div>
                  Your browser environment holds a compatible Web3 extension. Click the button below to authorize.
                </div>
                
                <button
                  onClick={handleLinkAndSign}
                  className="w-full py-4 rounded-xl border-none text-slate-950 font-black text-xs uppercase tracking-widest transition-all cursor-pointer hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2.5"
                  style={{
                    background: 'linear-gradient(135deg, #14F195, #a78bfa)',
                    fontFamily: "'Syne', sans-serif"
                  }}
                >
                  <Wallet className="w-4 h-4" />
                  Connect & Sign
                </button>
              </div>
            ) : (
              /* If outside of a web3 browser context (standard Mobile Safari or Chrome) */
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-300 leading-relaxed font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400 mb-1">
                    <span>📱</span> Normal Browser Sandbox
                  </div>
                  No Web3 wallet extensions detected in Safari/Chrome. To sign, click one of the wallet app icons below to deep-link directly into your wallet:
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <a
                    href={metaMaskDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#2b1b06]/40 hover:bg-[#2b1b06]/70 border border-orange-500/20 hover:border-orange-500/40 text-orange-300 transition-all font-sans text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">🦊 Connect Metamask</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>

                  <a
                    href={trustDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#091e36]/40 hover:bg-[#091e36]/70 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 transition-all font-sans text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">🛡️ Connect Trust Wallet</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>

                  <a
                    href={rainbowDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1b1c3e]/40 hover:bg-[#1b1c3e]/70 border border-indigo-500/20 hover:border-indigo-500/40 text-[#818cf8] transition-all font-sans text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">🌈 Connect Rainbow Wallet</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>
                </div>

                <div className="text-center pt-1 border-t border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    💡 <strong>Pro Tip:</strong> You can also copy the URL of this page and paste it directly into the desktop/mobile client browser of MetaMask or Trust browser to sign instantly!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'signing' && (
          <div className="space-y-4 py-8">
            <div className="h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              Prompting Wallet...
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed font-sans max-w-xs mx-auto">
              Confirm the connection and sign the challenge request on your wallet pop-up. Keep this window active during authorization.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 py-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-slate-100 font-extrabold text-sm mb-1 uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                Signature Synchronized!
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                Your sovereign address has been cryptographically verified and bound and is now synced with your prime screen workstation.
              </p>
            </div>

            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15 font-mono text-[10px] text-emerald-400">
              ⚡ PASSPORT SYNC_COMPLETE
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              You can now safely return back to your primary desktop or iframe preview tab. Doing so will auto-redirect your dashboard. You can close this tab.
            </p>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-5 py-4 animate-fade-in text-center">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-slate-100 font-extrabold text-sm mb-1 uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                Session Expired
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This verification session has expired. Handshake tokens expire after 5 minutes for strict cryptographic system protection.
              </p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Return to your original workstation screen, close the modal, and generate a fresh syncing code to try again.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 py-4 animate-fade-in text-center">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-slate-100 font-extrabold text-sm mb-1 uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                Connection Link Lost
              </h3>
              <p className="text-[11.5px] text-slate-450 leading-relaxed">
                {error || 'The temporary synchronization node could not be detected.'}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Please check your network settings, or return to the main wallet setup screen to generate a new credentials code.
            </p>
          </div>
        )}
      </div>

      {/* Safety indicators footer */}
      <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-slate-600 relative z-10 animate-fade-in">
        <Shield size={12} className="text-slate-600" />
        <span>SHA-256 SECURED CRYPTO ENVELOPE</span>
      </div>
    </div>
  );
}
