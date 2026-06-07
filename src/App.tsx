import { useState, useEffect } from 'react';
import { User, Wallet } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import AIReading from './components/AIReading';
import { WalletModal, DisconnectModal, EditProfileModal } from './components/ProfileModal';
import { generateUserProfile } from './utils/generator';

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
  const tabs = ['Home', 'Dashboard', 'Leaderboard', 'AI Reading'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between border-b border-white/[0.05] bg-[#06060c]/80 backdrop-blur-xl">
      {/* Brand Identity logo */}
      <button 
        onClick={() => setPage('Home')} 
        className="flex items-center gap-2 border-none bg-transparent cursor-pointer outline-none font-extrabold"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#a78bfa] to-[#818cf8] flex items-center justify-center font-black text-slate-100 text-sm">
          K
        </div>
        <span 
          className="text-[#f8fafc] tracking-tight font-extrabold text-sm"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          KARMA <span className="text-[#a78bfa]">AI</span>
        </span>
      </button>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-white/[0.03]">
        {tabs.filter(t => t === 'Home' || connected).map(tabName => (
          <button
            key={tabName}
            onClick={() => setPage(tabName)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border-none"
            style={{
              backgroundColor: page === tabName ? 'rgba(167, 139, 250, 0.12)' : 'transparent',
              color: page === tabName ? '#c084fc' : 'rgba(248, 250, 252, 0.45)',
            }}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* Profile session details / connection trigger */}
      <div>
        {connected && user ? (
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-3.5 pr-2 py-1.5 animate-fade-in relative group">
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
            className="px-5 py-2.5 rounded-xl border-none text-white font-extrabold text-xs transition-transform hover:scale-103 cursor-pointer select-none"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
              fontFamily: "'Syne', sans-serif"
            }}
          >
            Connect Wallet
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
    if (!user && ['Dashboard', 'Leaderboard', 'AI Reading'].includes(page)) {
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
        
        {page === 'Dashboard' && user && <Dashboard user={user} onDisconnect={() => setShowDisconnect(true)} />}
        
        {page === 'Leaderboard' && user && <Leaderboard user={user} />}
        
        {page === 'AI Reading' && user && <AIReading user={user} />}
      </main>

      {/* Security Modals layers */}
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
