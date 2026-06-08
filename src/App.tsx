import { useState, useEffect } from 'react';
import { User, Wallet } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import AIReading from './components/AIReading';
import Lenders from './components/Lenders';
import { WalletModal, DisconnectModal, EditProfileModal } from './components/ProfileModal';
import { generateUserProfile } from './utils/generator';
import { Twitter, Github, Send, Smartphone } from 'lucide-react';
import KarmaLogo from './components/KarmaLogo';
import { useLanguage } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import WhitepaperModal from './components/WhitepaperModal';
import KarmaManifestoModal from './components/KarmaManifestoModal';
import InstallPromptHelper from './components/InstallPromptHelper';

// Standard typography imports are now natively declared in index.html for high-efficiency loading.

// Nav Header component
interface NavProps {
  page: string;
  setPage: (p: string) => void;
  user: User | null;
  onShowConnect: () => void;
  onShowDisconnect: () => void;
  onShowEdit: () => void;
  onShowInstall: () => void;
}

function Nav({ page, setPage, user, onShowConnect, onShowDisconnect, onShowEdit, onShowInstall }: NavProps) {
  const connected = !!user;
  const { t } = useLanguage();

  const tabs = [
    { id: 'Home', label: t('nav.home') },
    { id: 'Dashboard', label: t('nav.dashboard') },
    { id: 'Lenders', label: t('nav.lenders') },
    { id: 'Leaderboard', label: t('nav.leaderboard') },
    { id: 'AI Reading', label: t('nav.aiReading') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-3 sm:px-6 flex items-center justify-between border-b border-white/[0.04] bg-[#05050a]/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Dynamic horizontal glow accent divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 via-emerald-500/30 via-cyan-500/25 to-transparent pointer-events-none" />
      
      {/* Brand Identity logo */}
      <button 
        onClick={() => setPage('Home')} 
        className="flex items-center gap-2 border-none bg-transparent cursor-pointer outline-none font-black shrink-0 relative group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[#a78bfa]/15 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <KarmaLogo size={34} className="shrink-0 animate-pulse-slow relative z-10" />
        </div>
        <span 
          className="text-white tracking-tight font-extrabold text-sm hidden xs:inline uppercase"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '0.05em' }}
        >
          KARMA <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-black">AI</span>
        </span>
      </button>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-white/[0.04] overflow-x-auto scrollbar-none max-w-[42vw] xs:max-w-[50vw] sm:max-w-none">
        {tabs.filter(t => t.id === 'Home' || t.id === 'Leaderboard' || connected).map(tab => {
          const isActive = page === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className="px-2.5 xs:px-3 py-1.5 rounded-lg text-[9px] xs:text-[10px] sm:text-xs font-bold cursor-pointer transition-all border-none whitespace-nowrap uppercase tracking-wider font-sans select-none"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)' : 'transparent',
                color: isActive ? '#d8b4fe' : 'rgba(241, 245, 249, 0.5)',
                border: isActive ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid transparent',
                textShadow: isActive ? '0 0 8px rgba(167, 139, 250, 0.2)' : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile details / Language switcher trigger group */}
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0 relative z-10">
        
        {/* Install Mobile Web App trigger badge */}
        <button
          onClick={onShowInstall}
          className="flex items-center gap-1 px-1.5 xs:px-2 py-1 xs:py-1.5 rounded-lg xs:rounded-xl bg-purple-500/10 hover:bg-[#14F195]/15 border border-purple-500/25 hover:border-[#14F195]/40 text-[#c084fc] hover:text-[#14F195] text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold cursor-pointer transition-all active:scale-95 select-none"
          title="Save app to mobile Home Screen"
        >
          <Smartphone size={11} className="shrink-0 sm:w-3 sm:h-3" />
          <span className="hidden sm:inline">Add to Home Screen</span>
          <span className="inline sm:hidden">App</span>
        </button>

        <LanguageSwitcher />

        {connected && user ? (
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg xs:rounded-xl pl-1.5 xs:pl-2 sm:pl-3.5 pr-1 xs:pr-1.5 sm:pr-2 py-1 sm:py-1.5 animate-fade-in relative group hover:border-[#14F195]/20 hover:bg-white/[0.04] transition-all">
            
            {/* Green active status indicator */}
            <div className="absolute -top-1 -left-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195]/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#14F195]"></span>
            </div>

            <div className="text-left select-none max-w-[80px] xs:max-w-[120px] md:inline hidden">
              <div className="text-xs font-extrabold text-slate-200 truncate flex items-center gap-1">
                @{user.username}
              </div>
              <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5" title={user.hideWallet ? `@${user.username}` : user.address}>
                {user.hideWallet ? 'SANDBOX SECURE' : (user.address.length > 12 ? user.address.slice(0, 6) + '...' + user.address.slice(-4) : user.address)}
              </div>
            </div>

            {/* Avatar block with quick edit / sign out controls */}
            <button
              onClick={onShowEdit}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm sm:rounded-lg bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center font-black text-slate-950 text-[10px] sm:text-xs cursor-pointer border-none transition-all hover:scale-105 shadow"
            >
              {user.username[0].toUpperCase()}
            </button>

            {/* Sign Out Trigger pin */}
            <button
              onClick={onShowDisconnect}
              className="px-1 xs:px-1.5 py-1 border-none bg-transparent hover:text-rose-400 text-slate-500 transition-colors text-xs cursor-pointer ml-0.5"
              title="Sign Out Reputation Workspace"
            >
              ⏻
            </button>
          </div>
        ) : (
          <button
            onClick={onShowConnect}
            className="px-2 xs:px-3 sm:px-5 py-1 xs:py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-none text-slate-950 font-black text-[9.5px] xs:text-[10px] sm:text-xs transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer select-none whitespace-nowrap uppercase tracking-wider shadow-[0_0_20px_rgba(167,139,250,0.15)] hover:shadow-[0_0_25px_rgba(167,139,250,0.35)]"
            style={{
              background: 'linear-gradient(135deg, #14F195, #a78bfa)',
              fontFamily: "'Syne', sans-serif"
            }}
          >
            <span className="hidden xs:inline">{t('nav.connect')}</span>
            <span className="inline xs:hidden">{t('nav.connect').split(' ')[0]}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState<string>('Home');
  const [user, setUser] = useState<User | null>(null);

  const [showConnect, setShowConnect] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [showInstallHelper, setShowInstallHelper] = useState(false);

  // Load session persistence securely from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('karma_user_session');
      if (cached) {
        setUser(JSON.parse(cached));
        setPage('Dashboard');
      }

      // Check if manifesto has been shown/dismissed before in this browsing session
      const seenThisSession = sessionStorage.getItem('karma_manifesto_session_seen_v2');
      if (!seenThisSession) {
        setShowManifesto(true);
      }
    } catch (err) {
      console.warn('Sandbox localStorage permissions denied, operating with in-memory session rules:', err);
    }
  }, []);

  function handleConnect(data: { wallet: Wallet; username: string; hideWallet: boolean; address: string }) {
    let profile: User;
    
    try {
      const registryRaw = localStorage.getItem('karma_profiles_registry');
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        if (registry[data.wallet.id] && registry[data.wallet.id].username === data.username) {
          // Returning user: maintain their exact state!
          profile = {
            ...registry[data.wallet.id],
            address: data.address,
            hideWallet: data.hideWallet,
          };
        } else {
          profile = generateUserProfile(data.wallet, data.username, data.address, data.hideWallet);
        }
      } else {
        profile = generateUserProfile(data.wallet, data.username, data.address, data.hideWallet);
      }
    } catch (e) {
      profile = generateUserProfile(data.wallet, data.username, data.address, data.hideWallet);
    }

    setUser(profile);
    setShowConnect(false);
    setPage('Dashboard');
    
    try {
      localStorage.setItem('karma_user_session', JSON.stringify(profile));
      
      // Save/update this profile in the persistent registry
      const registryRaw = localStorage.getItem('karma_profiles_registry') || '{}';
      const registry = JSON.parse(registryRaw);
      registry[data.wallet.id] = profile;
      localStorage.setItem('karma_profiles_registry', JSON.stringify(registry));
    } catch (err) {
      console.warn('Sandbox storage failed:', err);
    }
  }

  function handleDisconnect() {
    setUser(null);
    setShowDisconnect(false);
    setPage('Home');
    
    try {
      localStorage.removeItem('karma_user_session');
    } catch (err) {
      console.warn('Sandbox storage failed:', err);
    }
  }

  function handleProfileSave(updated: User) {
    setUser(updated);
    setShowEdit(false);
    
    try {
      localStorage.setItem('karma_user_session', JSON.stringify(updated));
      
      // Sync into the persistent registry
      const registryRaw = localStorage.getItem('karma_profiles_registry') || '{}';
      const registry = JSON.parse(registryRaw);
      if (updated.wallet && updated.wallet.id) {
        registry[updated.wallet.id] = updated;
        localStorage.setItem('karma_profiles_registry', JSON.stringify(registry));
      }
    } catch (err) {
      console.warn('Sandbox storage failed:', err);
    }
  }

  // Redirect guard: protect dashboards
  useEffect(() => {
    if (!user && ['Dashboard', 'Lenders', 'AI Reading'].includes(page)) {
      setPage('Home');
    }
  }, [user, page]);

  return (
    <div className="min-h-screen bg-[#04040a] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      
      {/* Universal Navigation bar */}
      <Nav
        page={page}
        setPage={setPage}
        user={user}
        onShowConnect={() => setShowConnect(true)}
        onShowDisconnect={() => setShowDisconnect(true)}
        onShowEdit={() => setShowEdit(true)}
        onShowInstall={() => setShowInstallHelper(true)}
      />

      {/* Pages Router container */}
      <main className="flex-1 w-full relative">
        {page === 'Home' && (
          <Landing 
            onShowConnect={() => setShowConnect(true)} 
            onShowManifesto={() => setShowManifesto(true)} 
          />
        )}
        
        {page === 'Dashboard' && user && (
          <Dashboard 
            user={user} 
            onDisconnect={() => setShowDisconnect(true)} 
            onUpdateUser={handleProfileSave}
          />
        )}
        
        {page === 'Lenders' && user && <Lenders user={user} />}
        
        {page === 'Leaderboard' && <Leaderboard user={user} />}
        
        {page === 'AI Reading' && user && <AIReading user={user} />}
      </main>

      {/* Modern Global Web3 Footer */}
      <Footer 
        setPage={setPage} 
        user={user} 
        onShowWhitepaper={() => setShowWhitepaper(true)} 
        onShowManifesto={() => setShowManifesto(true)}
        onShowInstall={() => setShowInstallHelper(true)}
      />

      {/* Security Modals layers */}
      {showWhitepaper && (
        <WhitepaperModal onClose={() => setShowWhitepaper(false)} />
      )}
      {showManifesto && (
        <KarmaManifestoModal 
          isOpen={showManifesto} 
          onClose={() => {
            setShowManifesto(false);
            try {
              sessionStorage.setItem('karma_manifesto_session_seen_v2', 'true');
              localStorage.setItem('karma_manifesto_seen_v1', 'true');
            } catch (err) {
              console.warn('Could not save seen status in local sandbox:', err);
            }
          }} 
        />
      )}

      {showConnect && (
        <WalletModal
          onConnect={handleConnect}
          onClose={() => setShowConnect(false)}
        />
      )}

      {showDisconnect && user && (
        <DisconnectModal
          user={user}
          onDisconnect={handleDisconnect}
          onClose={() => setShowDisconnect(false)}
        />
      )}

      {showEdit && user && (
        <EditProfileModal
          user={user}
          onSave={handleProfileSave}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showInstallHelper && (
        <InstallPromptHelper
          isOpen={showInstallHelper}
          onClose={() => setShowInstallHelper(false)}
        />
      )}
    </div>
  );
}

interface FooterProps {
  setPage: (p: string) => void;
  user: User | null;
  onShowWhitepaper: () => void;
  onShowManifesto: () => void;
  onShowInstall: () => void;
}

function Footer({ setPage, user, onShowWhitepaper, onShowManifesto, onShowInstall }: FooterProps) {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/[0.05] bg-[#05050b] text-slate-400 py-12 px-6 sm:px-12 mt-auto select-none" id="global-footer-system">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Column 1: Brand & Bio */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <KarmaLogo size={24} className="shrink-0" />
            <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-sm tracking-tight">
              KARMA <span className="text-[#a78bfa]">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {t('footer.brand')}
          </p>
          <div className="text-[10px] font-mono text-slate-600 mt-2">
            © 2026 - present KARMA AI, Protocol Inc. All rights reserved. Registered Sandbox Stage Ledger environment.
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-slate-200 text-xs font-mono font-bold uppercase tracking-wider">{t('footer.ecosystem')}</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button 
                onClick={() => setPage('Home')} 
                className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ {t('nav.home')}
              </button>
            </li>
            {user && (
              <>
                <li>
                  <button 
                    onClick={() => setPage('Dashboard')} 
                    className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
                  >
                    ✦ {t('nav.dashboard')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setPage('Lenders')} 
                    className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
                  >
                    ✦ {t('nav.lenders')}
                  </button>
                </li>
              </>
            )}
            <li>
              <button 
                onClick={() => setPage('Leaderboard')} 
                className="hover:text-[#a78bfa] transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ {t('nav.leaderboard')}
              </button>
            </li>
            <li>
              <button 
                onClick={onShowManifesto} 
                className="hover:text-[#a78bfa] text-purple-400 font-extrabold tracking-wide transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ Creed Manifesto Code
              </button>
            </li>
            <li>
              <button 
                onClick={onShowInstall} 
                className="hover:text-[#14F195] text-emerald-400 font-extrabold tracking-wide transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ 📱 Save App to Phone / Home Screen
              </button>
            </li>
            <li className="pt-1 mt-1 border-t border-white/[0.04]">
              <button 
                onClick={onShowWhitepaper} 
                className="hover:text-[#14F195] text-emerald-400 font-extrabold tracking-wide transition-colors border-none bg-transparent p-0 cursor-pointer outline-none text-left"
              >
                ✦ Whitepaper & Roadmap
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Tech parameters */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-slate-200 text-xs font-mono font-bold uppercase tracking-wider">{t('footer.infrastructure')}</h4>
          <ul className="flex flex-col gap-2 text-xs text-slate-500 font-mono">
            <li>FICO Sandbox Core</li>
            <li>Sybil Shield SDK</li>
            <li>Zero-Data Passport</li>
            <li>Optimism Attestations</li>
          </ul>
        </div>

        {/* Column 4: Community Resources */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-slate-200 text-xs font-mono font-bold uppercase tracking-wider text-left md:text-right">{t('footer.socialVectors')}</h4>
          <div className="flex gap-3 justify-start md:justify-end items-center flex-wrap">
            <a 
              href="https://x.com/karmaaiscore" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-[#a78bfa]/10 border border-white/[0.05] hover:border-[#a78bfa]/30 flex items-center justify-center text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
              title="Follow on X"
            >
              <Twitter size={15} />
            </a>
            <a 
              href="https://t.me/karmascore" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-xl bg-[#05050b] hover:bg-[#a78bfa]/10 border border-white/[0.05] hover:border-[#a78bfa]/30 flex items-center justify-center text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
              title="Telegram Channel"
            >
              <Send size={15} />
            </a>
            <a 
              href="https://github.com/WooCrypto/Karma" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-xl bg-[#05050b] hover:bg-[#a78bfa]/10 border border-white/[0.05] hover:border-[#a78bfa]/30 flex items-center justify-center text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
              title="GitHub Repository"
            >
              <Github size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
