import { useState, useEffect } from 'react';
import { User, Wallet } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import AIReading from './components/AIReading';
import Lenders from './components/Lenders';
import { WalletModal, DisconnectModal, EditProfileModal } from './components/ProfileModal';
import { generateUserProfile } from './utils/generator';
import { Twitter, Github, Send } from 'lucide-react';
import KarmaLogo from './components/KarmaLogo';
import { useLanguage } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import WhitepaperModal from './components/WhitepaperModal';

// Link Syne display typography and dm sans sans-serif
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap';
if (!document.head.querySelector('link[href*="Syne"]')) {
  document.head.appendChild(fontLink);
}

// Nav Header component
interface NavProps {
  page: string;
  setPage: (p: string) => void;
  user: User | null;
  onShowConnect: () => void;
  onShowDisconnect: () => void;
  onShowEdit: () => void;
}

function Nav({ page, setPage, user, onShowConnect, onShowDisconnect, onShowEdit }: NavProps) {
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-3 sm:px-6 flex items-center justify-between border-b border-white/[0.05] bg-[#06060c]/80 backdrop-blur-xl">
      {/* Brand Identity logo */}
      <button 
        onClick={() => setPage('Home')} 
        className="flex items-center gap-1.5 sm:gap-2 border-none bg-transparent cursor-pointer outline-none font-extrabold shrink-0"
      >
        <KarmaLogo size={32} className="shrink-0 animate-pulse-slow" />
        <span 
          className="text-[#f8fafc] tracking-tight font-extrabold text-sm hidden xs:inline"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          KARMA <span className="text-[#a78bfa]">AI</span>
        </span>
      </button>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-white/[0.03] overflow-x-auto scrollbar-none max-w-[32vw] xs:max-w-[45vw] sm:max-w-none">
        {tabs.filter(t => t.id === 'Home' || t.id === 'Leaderboard' || connected).map(tab => (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className="px-2 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold cursor-pointer transition-all border-none whitespace-nowrap"
            style={{
              backgroundColor: page === tab.id ? 'rgba(167, 139, 250, 0.12)' : 'transparent',
              color: page === tab.id ? '#c084fc' : 'rgba(248, 250, 252, 0.45)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile details / Language switcher trigger group */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <LanguageSwitcher />

        {connected && user ? (
          <div className="flex items-center gap-1.5 sm:gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-2 sm:pl-3.5 pr-1.5 sm:pr-2 py-1 sm:py-1.5 animate-fade-in relative group">
            <div className="text-left select-none max-w-[120px] md:inline hidden">
              <div className="text-xs font-bold text-slate-200 truncate">@{user.username}</div>
              <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5" title={user.hideWallet ? `@${user.username}` : user.address}>
                {user.hideWallet ? `@${user.username}` : (user.address.length > 12 ? user.address.slice(0, 6) + '...' + user.address.slice(-4) : user.address)}
              </div>
            </div>

            {/* Avatar block with quick edit / sign out controls */}
            <button
              onClick={onShowEdit}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-extrabold text-slate-100 text-xs cursor-pointer border-none transition-transform hover:scale-105"
            >
              {user.username[0].toUpperCase()}
            </button>

            {/* Sign Out Trigger pin */}
            <button
              onClick={onShowDisconnect}
              className="px-2 py-1 border-none bg-transparent hover:text-rose-400 text-slate-500 transition-colors text-xs cursor-pointer ml-1"
              title="Sign Out Reputation Workspace"
            >
              ⏻
            </button>
          </div>
        ) : (
          <button
            onClick={onShowConnect}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border-none text-white font-extrabold text-[11px] sm:text-xs transition-transform hover:scale-103 cursor-pointer select-none whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
              fontFamily: "'Syne', sans-serif"
            }}
          >
            {t('nav.connect')}
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

  // Load session persistence securely from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('karma_user_session');
      if (cached) {
        setUser(JSON.parse(cached));
        setPage('Dashboard');
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
      />

      {/* Pages Router container */}
      <main className="flex-1 w-full relative">
        {page === 'Home' && <Landing onShowConnect={() => setShowConnect(true)} />}
        
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
      <Footer setPage={setPage} user={user} onShowWhitepaper={() => setShowWhitepaper(true)} />

      {/* Security Modals layers */}
      {showWhitepaper && (
        <WhitepaperModal onClose={() => setShowWhitepaper(false)} />
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
    </div>
  );
}

interface FooterProps {
  setPage: (p: string) => void;
  user: User | null;
  onShowWhitepaper: () => void;
}

function Footer({ setPage, user, onShowWhitepaper }: FooterProps) {
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
