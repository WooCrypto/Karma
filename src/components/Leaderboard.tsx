import { useState } from 'react';
import { User, LeaderboardRow } from '../types';
import { AURAS, PERSONALITIES, BASE_LEADERBOARD } from '../constants';
import GlassCard from './GlassCard';

interface LeaderboardProps {
  user: User;
}

export default function Leaderboard({ user }: LeaderboardProps) {
  const [filter, setFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All Time'>('All Time');
  const [tab, setTab] = useState<'Top Karma' | 'Rising Fast' | 'Longest Streak' | 'Top Aura'>('Top Karma');
  const filters: Array<'Daily' | 'Weekly' | 'Monthly' | 'All Time'> = ['Daily', 'Weekly', 'Monthly', 'All Time'];
  const tabs: Array<'Top Karma' | 'Rising Fast' | 'Longest Streak' | 'Top Aura'> = ['Top Karma', 'Rising Fast', 'Longest Streak', 'Top Aura'];

  // Dynamically inject user inside the leaderboard to simulate live competition
  const userRow: LeaderboardRow = {
    rank: 4,
    wallet: user.address,
    username: user.username,
    hideWallet: user.hideWallet,
    personality: (user.personality || 'Visionary') as any,
    score: user.karmaScore,
    aura: 'Purple Aura',
    streak: user.streak,
    isMe: true,
  };

  // Merge lists and preserve correct ordering
  const rows = [...BASE_LEADERBOARD.slice(0, 3), userRow, ...BASE_LEADERBOARD.slice(3)].sort((a, b) => {
    if (tab === 'Top Karma') return b.score - a.score;
    if (tab === 'Longest Streak') return b.streak - a.streak;
    // fallback rank sorting
    return a.rank - b.rank;
  });

  // Re-adjust rank based on sorting choice or preserve index
  const rankedRows = rows.map((r, idx) => ({ ...r, displayRank: idx + 1 }));

  return (
    <div className="max-w-[900px] mx-auto pt-24 px-6 pb-16 animate-fade-in text-slate-100">
      <div className="mb-10">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-2">Global Reputation Index</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Leaderboard
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          The on-chain elite. Ranked by verifiable smart contract behavior, holding history, and ecosystem goodwill.
        </p>
      </div>

      {/* Tabs and Filters Toggle rail */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-xs transition-all duration-200 px-4 py-2.5 rounded-xl border font-medium cursor-pointer"
              style={{
                background: tab === t ? 'rgba(167, 139, 250, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: tab === t ? 'rgba(167, 139, 250, 0.35)' : 'rgba(255, 255, 255, 0.07)',
                color: tab === t ? '#c084fc' : 'rgba(248, 250, 252, 0.45)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[10px] uppercase font-mono tracking-wider transition-all px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{
                background: filter === f ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: filter === f ? '#f8fafc' : 'rgba(248, 250, 252, 0.3)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking Deck */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table Head */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] bg-slate-950/40 text-[10px] font-mono tracking-widest text-slate-400 uppercase select-none">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Identity</div>
          <div className="col-span-3">Personality</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Streak</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {rankedRows.map((row) => {
            const auraDef = AURAS.find(a => row.score >= a.min && row.score <= a.max) || AURAS[4];
            const personalityDef = PERSONALITIES[row.personality] || PERSONALITIES.Visionary;
            const isMe = !!row.isMe;

            return (
              <div
                key={row.username}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all bg-white/[0.005] hover:bg-white/[0.02]"
                style={{
                  background: isMe ? 'rgba(167, 139, 250, 0.06)' : 'transparent',
                  borderLeft: isMe ? '3px solid rgba(167, 139, 250, 0.65)' : '3px solid transparent',
                }}
              >
                {/* Ranking Emblem */}
                <div className="col-span-1 text-sm font-mono font-bold">
                  {row.displayRank === 1 ? (
                    <span className="text-amber-400 font-extrabold text-base">🥇</span>
                  ) : row.displayRank === 2 ? (
                    <span className="text-slate-300 font-extrabold text-base">🥈</span>
                  ) : row.displayRank === 3 ? (
                    <span className="text-amber-600 font-extrabold text-base">🥉</span>
                  ) : (
                    <span className="text-slate-500 font-normal">#{row.displayRank}</span>
                  )}
                </div>

                {/* Username and Address info */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-bold text-slate-100 text-sm hover:text-purple-300 transition-colors"
                    >
                      @{row.username}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-mono tracking-wider font-extrabold bg-[#a78bfa]/20 text-[#c084fc] px-1.5 py-0.5 rounded uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1 select-all">
                    {row.hideWallet ? '••••••••••••' : (isMe ? user.address : row.wallet)}
                  </div>
                </div>

                {/* Archetype badge */}
                <div className="col-span-3 flex items-center gap-2.5">
                  <span 
                    className="text-lg leading-none" 
                    style={{ color: personalityDef.color, textShadow: `0 0 10px ${personalityDef.color}50` }}
                  >
                    {personalityDef.icon}
                  </span>
                  <span className="text-slate-300 text-xs font-medium md:inline hidden">{personalityDef.name}</span>
                </div>

                {/* Score */}
                <div className="col-span-2 text-right">
                  <span 
                    className="text-lg font-bold" 
                    style={{ 
                      color: auraDef.color, 
                      fontFamily: "'Syne', sans-serif",
                      textShadow: `0 0 12px ${auraDef.color}88` 
                    }}
                  >
                    {row.score}
                  </span>
                  <span className="text-[9px] uppercase font-mono block text-slate-500 tracking-wider">
                    {auraDef.badge}
                  </span>
                </div>

                {/* Streak count */}
                <div className="col-span-2 text-right text-xs font-semibold font-mono text-amber-500">
                  {row.streak}d 🔥
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Global disclaimer on anonymity */}
      <div className="mt-6 flex items-center gap-3 bg-slate-950/40 px-5 py-3.5 rounded-xl border border-white/[0.04]">
        <span className="text-sm">🔒</span>
        <span className="text-[11px] text-slate-400 font-sans leading-relaxed">
          Ledger records are public, but your identity profile details are synced locally to your current session. You can activate "Hide wallet address" inside your profile dropdown to enforce complete global pseudonymity.
        </span>
      </div>
    </div>
  );
}
