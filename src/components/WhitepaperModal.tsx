import { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Compass, 
  Coins, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Target,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';

interface WhitepaperModalProps {
  onClose: () => void;
}

interface Milestone {
  phase: string;
  title: string;
  target: string;
  description: string;
  status: 'Funding Goal' | 'In Progress' | 'Completed';
  percentage: number;
  allocations: string[];
}

export default function WhitepaperModal({ onClose }: WhitepaperModalProps) {
  const [activeSection, setActiveSection] = useState<'paper' | 'roadmap'>('paper');

  const milestones: Milestone[] = [
    {
      phase: 'Phase 1',
      title: 'Decentralized Oracle Integration & KAST Sync',
      target: '$25,000',
      description: 'Engineering the robust API and indexer connectors with our partner KAST. This links real-world stablecoin Visa transaction velocity onto our testbed indexers.',
      status: 'Completed',
      percentage: 100,
      allocations: [
        'Off-chain indexers tuning',
        'KAST referral & sign-up automation scripts',
        'ZKP proof-of-transaction models client mock-ups'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Solana/EVM Multi-Chain Attestation Contracts',
      target: '$35,000',
      description: 'Building the core settlement contract library. Allows dApps to query a user’s Karma Score off-chain and mint a non-transferable EAS (Ethereum Attestation Service) stamp or Solana Metaplex badge.',
      status: 'In Progress',
      percentage: 35,
      allocations: [
        'Smart contract audit coverage',
        'Gas relay subsidy pools setup',
        'EAS Integration wrappers'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'ZK-SNARK Scoring Privacy Shields (Zero-Data Passport)',
      target: '$45,000',
      description: 'True sovereign reputation. We are coding zero-knowledge proofs so third-party underwriters can verify your credit status (>700 points) without scanning your raw wallets, assets, or KAST spending categories.',
      status: 'Funding Goal',
      percentage: 10,
      allocations: [
        'ZKP circom proof generation optimization',
        'Edge device execution library',
        'Multi-party computation (MPC) testing framework'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Underwriter Yield & Real-World Credit Pool Match',
      target: '$60,000',
      description: 'Kickstarting first-party micro-liquidity vaults. Selected institutional underwriters lock USD assets to offer real, instant, low-collateral micro-loans directly inside the App with custom smart underwrite terms.',
      status: 'Funding Goal',
      percentage: 0,
      allocations: [
        'Liquidity pools liquidity guarantee safety nets',
        'Collateralized protocol insurance layers',
        'Institutional credit connector compliance'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-6 md:py-12 bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-fade-in" id="whitepaper-modal-overlay">
      <div className="relative w-full max-w-4xl bg-[#090911] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        
        {/* Absolute Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#14F195]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between relative z-10 bg-[#07070d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14F195]/10 border border-[#14F195]/20 flex items-center justify-center text-[#14F195]">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                <span>KARMA PROTOCOL</span>
                <span className="text-xs bg-[#14F195]/10 text-[#14F195] px-2 py-0.5 rounded-full font-mono font-medium tracking-normal border border-[#14F195]/20">
                  Whitepaper & Roadmap
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">VERSION 1.4 · SOVEREIGN TRUST MATRIX</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Toggle Sections */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/[0.05] mr-2">
              <button
                onClick={() => setActiveSection('paper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  activeSection === 'paper' 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Whitepaper
              </button>
              <button
                onClick={() => setActiveSection('roadmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  activeSection === 'roadmap' 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Funding Roadmap
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/[0.05] hover:border-white/10 text-slate-400 hover:text-white transition-all bg-slate-950/40 cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 relative z-10 custom-scrollbar space-y-8">
          
          {activeSection === 'paper' ? (
            <div className="space-y-8 text-left max-w-3xl mx-auto">
              
              {/* Abstract */}
              <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/20 border border-indigo-500/10 space-y-3">
                <h3 className="text-xs font-mono font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Abstract & Paradigm Shift
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Traditional consumer lending systems rely on predatory credit card models designed to monetize perpetual debt. Web3 protocols repeat this flaw of inefficiency by relying exclusively on 150%+ over-collateralization. 
                  <strong className="text-white"> Karma AI</strong> breaks this cycle by validating real-world consumer transaction velocity. 
                  By integrating with <strong className="text-[#14F195]">KAST Stablecoin Debit Visa Card</strong>, Karma AI maps real retail spend behavior to compute a private, non-custodial decentralized FICO alternative. Reputation becomes liquid equity.
                </p>
              </div>

              {/* Section 1: Core Mechanics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
                  <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                    I. Real-World Velocity as Credit Score Validity
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.04] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
                      <Coins className="w-4 h-4 text-[#ecc452]" />
                      Liquid Asset Velocity
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Static wallets display funds, but tell nothing of operational financial discipline. Continuous card-loading actions, micro-investments, and everyday retail card purchases signal constant active demand and liquidity—the primary metric of creditworthiness.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.04] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      Zero-Knowledge Privacy
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Protocols must not scrape your grocery transactions or retail habits. Karma AI models ingest structured off-chain aggregates from KAST platform APIs to output zero-knowledge score proofs. Nobody discovers what you bought, only that your credit velocity is sovereign.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: KAST Synergy Loop */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
                  <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                    II. The KAST Platform Synergy Engine
                  </h3>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Through the integration of KAST, users load stablecoins onto virtual or physical Visa debit cards. When users utilize their card locally, the Karma scoring oracle intercepts transaction validation signatures:
                </p>

                <div className="relative p-5 rounded-2xl bg-[#06060c] border border-[#14F195]/15 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">💳 REVOLUTIONARY CARD PARTNERSHIP</span>
                    <h4 className="text-sm font-bold text-slate-200">Leverage the KAST Ambassador Link</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      By signing up on KAST with our official ambassador tracking parameters, users gain immediate access to high-tier stablecoin staking rewards, instantaneous card load-times, and a premium **+80 Rep Score boost** on Karma’s reputation suite.
                    </p>
                    
                    <div className="pt-2">
                      <a 
                        href="https://app.kast.xyz/referral/O7A99Y65" 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-white transition-colors"
                      >
                        Visit app.kast.xyz <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-950 border border-white/[0.04] rounded-xl text-center w-full md:w-48 shrink-0 flex flex-col justify-center items-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Karmascore Boost</span>
                    <span className="text-3xl font-black text-white my-1" style={{ fontFamily: "'Syne', sans-serif" }}>+80 PTS</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">2.5x Speed Multiplier</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Tokenomics & Governance */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
                  <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                    III. KARMA Token Utility Ecosystem
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The KARMA Utility Token is scheduled for testbed distribution in mid-2026. The token serves 3 primary sovereign functions inside the reputation core:
                </p>
                
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <li className="p-3.5 bg-slate-950/40 border border-white/[0.03] rounded-xl list-none">
                    <strong className="text-white block mb-0.5">1. Score Staking Security</strong>
                    <span className="text-[11px] text-slate-400">Underwriters lock KARMA to guarantee debt coverage and capture protocol underwrite fee-yields.</span>
                  </li>
                  <li className="p-3.5 bg-slate-950/40 border border-white/[0.03] rounded-xl list-none">
                    <strong className="text-white block mb-0.5">2. Sybil Resistance Stamps</strong>
                    <span className="text-[11px] text-slate-400">Users pay micro-amounts of KARMA to settle Zero-Knowledge proofs on EVM/Solana attestations.</span>
                  </li>
                  <li className="p-3.5 bg-slate-950/40 border border-white/[0.03] rounded-xl list-none">
                    <strong className="text-white block mb-0.5">3. Multiplier Fuel Ups</strong>
                    <span className="text-[11px] text-slate-400">Holders of Karma NFT artifacts earn passive score speed extensions to recover slashed reputation.</span>
                  </li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="pt-4 border-t border-white/[0.06] text-[10.5px] font-mono text-slate-500 leading-tight">
                ⚠️ DISCLAIMER: Karmascore.xyz operates as a decentralized sandbox testbed for reputation scoring. Scores do not index traditional banking FICO records directly until localized underwrite agreements are formalized. Participate responsibly in the test network environment.
              </div>

            </div>
          ) : (
            <div className="space-y-8 text-left max-w-3xl mx-auto">
              
              {/* Pitch Banner for Funding */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-[#14F195]/5 border border-[#14F195]/15 space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#14F195] font-bold uppercase tracking-wider bg-[#14F195]/15 border border-[#14F195]/30 px-2 py-0.5 rounded-full">
                    🚀 Sovereign Funding Plan
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">Catalyzing Private Sovereign Credit</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Karma Protocol avoids predatory venture capitalism by focusing on community-centered micro-grants and strategic liquidity pairing. See below the specific engineering scopes we are raising capital to deploy:
                  </p>
                </div>
                
                <div className="bg-slate-950 border border-white/[0.05] rounded-xl p-4 text-center w-full md:w-56 shrink-0 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Total Raising Scope</span>
                  <span className="text-2xl font-black text-[#14F195] block" style={{ fontFamily: "'Syne', sans-serif" }}>$165,000 USD</span>
                  <span className="text-[9.5px] text-slate-500 font-mono block">Across 4 target phases</span>
                </div>
              </div>

              {/* Milestones grid layout */}
              <div className="space-y-6">
                {milestones.map((milestone, idx) => (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl border transition-all ${
                      milestone.status === 'Completed'
                        ? 'bg-slate-950/30 border-emerald-500/15'
                        : milestone.status === 'In Progress'
                        ? 'bg-slate-950/70 border-purple-500/20'
                        : 'bg-slate-950/20 border-white/[0.04]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] font-black uppercase border select-none ${
                          milestone.status === 'Completed'
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                            : milestone.status === 'In Progress'
                            ? 'bg-purple-500/15 border-purple-500/35 text-purple-400'
                            : 'bg-slate-500/10 border-white/5 text-slate-400'
                        }`}>
                          {milestone.phase}
                        </span>
                        <h4 className="text-sm font-extrabold text-white leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {milestone.title}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#14F195] block">{milestone.target} Goal</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">{milestone.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {milestone.description}
                    </p>

                    {/* Funding progress track */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Funding Progress Target:</span>
                        <span className={milestone.status === 'Completed' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                          {milestone.percentage}% Funded
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${milestone.percentage}%`,
                            background: milestone.status === 'Completed' 
                              ? 'linear-gradient(90deg, #10b981, #14f195)' 
                              : 'linear-gradient(90deg, #9945ff, #818cf8)'
                          }}
                        />
                      </div>
                    </div>

                    {/* List Allocations */}
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-white/[0.02]">
                      <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">Scope allocation focuses:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {milestone.allocations.map((alloc, aidx) => (
                          <div key={aidx} className="flex gap-1.5 text-[10.5px] text-slate-400 leading-tight">
                            <span className="text-[#14F195] select-none">✦</span>
                            <span>{alloc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Multiplier CTA card */}
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-2.5">
                  <span className="text-lg">📢</span>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Pitch to the Community</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This roadmap outlines the core primitives of Sovereign Financial Attestations. Participate on the KAST platform to directly contribute transaction metrics onto our live testbeds!
                    </p>
                  </div>
                </div>

                <a 
                  href="https://app.kast.xyz/referral/O7A99Y65"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-[#14F195] text-slate-950 font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.03] shrink-0 text-center select-none shadow"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  💳 Join KAST Debit Card Program
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-white/[0.06] bg-[#07070d] flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10 text-[11px] font-mono text-slate-500 select-none">
          <span>Sovereign Proof Attestations © 2026</span>
          <div className="flex gap-4 items-center">
            <a 
              href="https://app.kast.xyz/referral/O7A99Y65" 
              target="_blank" 
              referrerPolicy="no-referrer" 
              className="hover:text-emerald-400 transition-colors"
            >
              [KAST Platform Provider link]
            </a>
            <span>•</span>
            <button 
              onClick={onClose} 
              className="text-purple-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer font-bold uppercase"
            >
              [Close Window]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
