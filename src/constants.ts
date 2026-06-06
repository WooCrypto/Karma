import { Wallet, Aura, Personality, LeaderboardRow } from './types';

export const PERSONALITIES: Record<string, Personality> = {
  Visionary: {
    name: 'Visionary',
    icon: '◈',
    color: '#a78bfa',
    desc: 'You discover opportunities before the crowd. You prefer conviction over hype. You build long-term positions and focus on future potential.',
  },
  Diamond: {
    name: 'Diamond',
    icon: '◆',
    color: '#67e8f9',
    desc: 'Unbreakable. You hold through storms others flee. Your hands are forged from pressure, your strategy from patience.',
  },
  Builder: {
    name: 'Builder',
    icon: '⬡',
    color: '#6ee7b7',
    desc: 'You construct ecosystems, not portfolios. Every position is a brick in something larger. You think in decades, not days.',
  },
  Sage: {
    name: 'Sage',
    icon: '⊕',
    color: '#fbbf24',
    desc: "Ancient knowledge, modern tools. You've seen cycles come and go. Wisdom earned through losses, strategy refined by time.",
  },
  Guardian: {
    name: 'Guardian',
    icon: '⬟',
    color: '#f472b6',
    desc: 'You protect. Capital. Community. Principles. You move with deliberate care and exit with surgical precision.',
  },
  Explorer: {
    name: 'Explorer',
    icon: '◉',
    color: '#fb923c',
    desc: 'The frontier is your comfort zone. Early, bold, and undeterred—you map territory others fear to enter.',
  },
  Phoenix: {
    name: 'Phoenix',
    icon: '⊛',
    color: '#f87171',
    desc: "You've burned. You've risen. Each cycle makes you stronger. Loss is your teacher, resilience your superpower.",
  },
  Pioneer: {
    name: 'Pioneer',
    icon: '⬢',
    color: '#818cf8',
    desc: 'First mover. Trend setter. While others wait for confirmation, you\'ve already moved on to the next horizon.',
  },
};

export const AURAS: Aura[] = [
  { name: 'Gray Aura', min: 0, max: 19, color: '#6b7280', glow: 'rgba(107,114,128,0.4)', badge: 'Initiate' },
  { name: 'Blue Aura', min: 20, max: 39, color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', badge: 'Awakened' },
  { name: 'Green Aura', min: 40, max: 59, color: '#34d399', glow: 'rgba(52,211,153,0.4)', badge: 'Flourishing' },
  { name: 'Gold Aura', min: 60, max: 74, color: '#fbbf24', glow: 'rgba(251,191,36,0.4)', badge: 'Luminous' },
  { name: 'Purple Aura', min: 75, max: 89, color: '#a78bfa', glow: 'rgba(167,139,250,0.4)', badge: 'Ascendant' },
  { name: 'White Aura', min: 90, max: 100, color: '#f8fafc', glow: 'rgba(248,250,252,0.6)', badge: 'Transcendent' },
];

export const WALLETS: Wallet[] = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#f6851b', desc: 'Browser extension' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052ff', desc: 'Mobile & extension' },
  { id: 'trust', name: 'Trust Wallet', icon: '🛡️', color: '#3375BB', desc: 'Mobile wallet' },
  { id: 'rabby', name: 'Rabby Wallet', icon: '🐰', color: '#8697FF', desc: 'Multi-chain DeFi' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '◈', color: '#3b99fc', desc: 'Any mobile wallet' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', color: '#FF6B6B', desc: 'Ethereum & Base' },
];

export const BASE_LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, wallet: '0x7f3a...9c21', username: 'CryptoSage', hideWallet: true, personality: 'Diamond', score: 98, aura: 'White Aura', streak: 142 },
  { rank: 2, wallet: '0x2b8e...4d17', username: 'VisionaryX', hideWallet: false, personality: 'Visionary', score: 96, aura: 'White Aura', streak: 89 },
  { rank: 3, wallet: '0x9a1f...7e44', username: 'OraclePath', hideWallet: true, personality: 'Sage', score: 94, aura: 'Purple Aura', streak: 201 },
  { rank: 5, wallet: '0x1e2f...8a33', username: 'IronGuardian', hideWallet: false, personality: 'Guardian', score: 88, aura: 'Purple Aura', streak: 55 },
  { rank: 6, wallet: '0x6d9b...1c78', username: 'ChainPioneer', hideWallet: true, personality: 'Pioneer', score: 85, aura: 'Gold Aura', streak: 44 },
  { rank: 7, wallet: '0x3f7c...5e29', username: 'DeepExplorer', hideWallet: false, personality: 'Explorer', score: 82, aura: 'Gold Aura', streak: 33 },
  { rank: 8, wallet: '0x8a4e...0d61', username: 'RisingPhoenix', hideWallet: true, personality: 'Phoenix', score: 79, aura: 'Gold Aura', streak: 22 },
];

export function getAura(score: number): Aura {
  return AURAS.find(a => score >= a.min && score <= a.max) || AURAS[0];
}

export function truncateWallet(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
