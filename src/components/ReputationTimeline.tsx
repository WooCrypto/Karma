import { useState } from 'react';
import { User, ActivityEvent } from '../types';
import { getAura, PERSONALITIES, truncateWallet } from '../constants';
import GlassCard from './GlassCard';

interface ReputationTimelineProps {
  user: User;
}

interface TimelineItem {
  id: string;
  timestamp: string;
  type: 'milestone' | 'onchain';
  title: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  badgeText?: string;
  icon: string;
  color: string;
  metadata?: {
    blockHeight?: string;
    network?: string;
    consensusHash?: string;
    gasSaved?: string;
    influenceImpact?: string;
  };
}

export default function ReputationTimeline({ user }: ReputationTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'milestones' | 'onchain'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const aura = getAura(user.karmaScore);
  const personality = PERSONALITIES[user.personality || 'Visionary'] || PERSONALITIES.Visionary;

  // Dynamically generate milestones and events calibrated to user's parameters
  const items: TimelineItem[] = [
    {
      id: 'ms-transcend',
      timestamp: 'Just Now',
      type: 'milestone',
      title: `Ascended to ${aura.name} Status`,
      description: `Your Reputation Quotient calibrated at ${user.karmaScore}/100. Ranked as a ${aura.badge} user within the network registry.`,
      status: 'completed',
      badgeText: '✧ ASCENSION',
      icon: '✨',
      color: aura.color,
      metadata: {
        blockHeight: '19,842,912',
        network: user.wallet.name,
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: `+${(user.karmaScore * 0.15).toFixed(1)}% Governance Weight`
      }
    },
    {
      id: 'on-governance',
      timestamp: '2 hours ago',
      type: 'onchain',
      title: 'DAO Ballot Decrypted',
      description: 'Participation in multi-chain governance verified. Your vote contributed to decentralized infrastructure allocation guidelines.',
      status: 'completed',
      badgeText: '⚡ GOVERNANCE',
      icon: '🗳️',
      color: '#fbbf24', // Wisdom Orange
      metadata: {
        blockHeight: '19,842,401',
        network: 'Base',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        gasSaved: '4.8 Gwei saved via L2 bundling',
        influenceImpact: '+4 Wisdom Quotient'
      }
    },
    {
      id: 'ms-streak',
      timestamp: '1 day ago',
      type: 'milestone',
      title: `Holding Conviction: ${user.streak}-Day Milestone`,
      description: `Sustained consecutive hold parameters verified. Completed ${user.streak} distinct diurnal reputation cycles without exit operations.`,
      status: 'completed',
      badgeText: '🔥 STREAK',
      icon: '🔥',
      color: '#f97316',
      metadata: {
        blockHeight: '19,831,042',
        network: 'Solana',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: '+3.5x Multiplier to Loyalty Pillar'
      }
    },
    {
      id: 'on-rebalance',
      timestamp: '3 days ago',
      type: 'onchain',
      title: 'Synergistic Position Calibrated',
      description: 'Zero-friction balance re-allocation identified across verified digital asset holding entities.',
      status: 'completed',
      badgeText: '⚡ ASSET MATRIX',
      icon: '📊',
      color: '#34d399', // Generosity Green
      metadata: {
        blockHeight: '19,812,093',
        network: 'Ethereum',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        gasSaved: '11.2 Gwei optimized via gas-token dynamic indexing',
        influenceImpact: '+2 Energy Quotient'
      }
    },
    {
      id: 'ms-archetype',
      timestamp: '5 days ago',
      type: 'milestone',
      title: `Aligned with ${personality.name} Archetype`,
      description: `Advanced algorithmic pattern analysis completed. Your historical multi-chain signature matches the ${personality.name} profile characteristics.`,
      status: 'completed',
      badgeText: '☯ ALIGNMENT',
      icon: personality.icon,
      color: personality.color,
      metadata: {
        blockHeight: '19,794,841',
        network: 'Multi-Chain Validator Node',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: `Unlocked unique custom display vector: ${personality.name}`
      }
    },
    {
      id: 'on-staking',
      timestamp: '1 week ago',
      type: 'onchain',
      title: 'Longevity Smart Contract Activated',
      description: 'Sovereign digital assets locked into long-term commitment vault. Signals supreme patience paradigm behavior.',
      status: 'completed',
      badgeText: '⚡ DEEP YIELD',
      icon: '🔒',
      color: '#60a5fa', // Loyalty Blue
      metadata: {
        blockHeight: '19,701,234',
        network: 'BNB Chain',
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        gasSaved: 'Zero-slippage pool allocation active',
        influenceImpact: '+6 Patience Factor'
      }
    },
    {
      id: 'ms-genesis',
      timestamp: 'Genesis Connection',
      type: 'milestone',
      title: 'Karma Passport Protocol Connected',
      description: `Cryptographic index initialized from ${truncateWallet(user.address)} using ${user.wallet.name} Client. Secure reputation pipeline authorized.`,
      status: 'completed',
      badgeText: '⚙ GENESIS',
      icon: '🌐',
      color: '#818cf8',
      metadata: {
        blockHeight: '19,650,119',
        network: user.wallet.name,
        consensusHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        influenceImpact: 'Reputation profile synchronized permanently inside decentralized local ledger.'
      }
    }
  ];

  const filteredItems = items.filter(item => {
    if (filter === 'milestones') return item.type === 'milestone';
    if (filter === 'onchain') return item.type === 'onchain';
    return true;
  });

  return (
    <div className="w-full mt-10" id="karma-reputation-timeline">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-extrabold text-[#f8fafc] text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            Reputation Timeline & Milestones
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Browse complete chronological archives of verified on-chain blocks and diplomatic reputation credentials.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl self-stretch md:self-auto justify-between">
          {[
            { key: 'all', label: 'All Chronicles' },
            { key: 'milestones', label: '✧ Milestones' },
            { key: 'onchain', label: '⚡ On-Chain blocks' }
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key as any)}
              className="text-[10px] font-mono tracking-wide uppercase px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all duration-200"
              style={{
                background: filter === opt.key ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                color: filter === opt.key ? '#c084fc' : '#94a3b8',
                fontWeight: filter === opt.key ? 'bold' : 'normal'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <GlassCard style={{ padding: '32px 24px', borderRadius: 16 }}>
        <div className="relative border-l-2 border-white/[0.04] ml-3.5 md:ml-6 space-y-8 py-2">
          {filteredItems.map((item, idx) => {
            const isSelected = selectedId === item.id;
            return (
              <div key={item.id} className="relative pl-6 md:pl-10 group">
                
                {/* Node Dot marker */}
                <div 
                  className="absolute left-0 top-1.5 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer bg-[#05050b]"
                  style={{
                    borderColor: isSelected ? item.color : 'rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? `0 0 12px ${item.color}40` : 'none'
                  }}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  title="Toggle cryptographic details"
                >
                  <span className="text-xs">{item.icon}</span>
                </div>

                {/* Left/Time display panel */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-[10px] font-mono font-black italic tracking-widest px-2 py-0.5 rounded"
                      style={{
                        background: `${item.color}15`,
                        color: item.color
                      }}
                    >
                      {item.badgeText}
                    </span>
                    <h4 
                      className="text-white text-sm font-bold group-hover:text-purple-300 transition-colors cursor-pointer"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                      onClick={() => setSelectedId(isSelected ? null : item.id)}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mb-2">
                  {item.description}
                </p>

                {/* Expand toggled details button */}
                <button
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className="text-[10px] text-slate-500 font-mono hover:text-purple-400 border-none bg-none cursor-pointer flex items-center gap-1.5 p-0"
                >
                  <span>{isSelected ? '▼ Hide Metadata' : '▶ Show Cryptographic Metadata'}</span>
                </button>

                {/* Metadata container card if block selected */}
                {isSelected && item.metadata && (
                  <div className="mt-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] space-y-2.5 animate-fade-in max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 uppercase block tracking-wider">Indexed Network</span>
                        <span className="text-slate-300 font-bold block mt-0.5">{item.metadata.network || 'Multi-Chain Validator'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block tracking-wider">Block Number Height</span>
                        <span className="text-slate-300 font-bold block mt-0.5">#{item.metadata.blockHeight || 'N/A'}</span>
                      </div>
                    </div>

                    {item.metadata.consensusHash && (
                      <div className="text-[10px] font-mono border-t border-white/[0.03] pt-2">
                        <span className="text-slate-500 uppercase block tracking-wider">Consensus Hash Registry</span>
                        <span className="text-slate-400 block mt-0.5 break-all select-all">{item.metadata.consensusHash}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono border-t border-white/[0.03] pt-2">
                      {item.metadata.gasSaved && (
                        <div>
                          <span className="text-slate-500 uppercase block tracking-wider font-medium">Optimization Log</span>
                          <span className="text-[#a78bfa] block mt-0.5 font-bold">✨ {item.metadata.gasSaved}</span>
                        </div>
                      )}
                      {item.metadata.influenceImpact && (
                        <div>
                          <span className="text-slate-500 uppercase block tracking-wider font-medium">Diplomacy Contribution</span>
                          <span className="text-emerald-400 block mt-0.5 font-bold">{item.metadata.influenceImpact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
