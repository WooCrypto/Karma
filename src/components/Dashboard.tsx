import { useEffect, useState } from 'react';
import { User } from '../types';
import { getAura, PERSONALITIES, truncateWallet } from '../constants';
import GlassCard from './GlassCard';
import KarmaRing from './KarmaRing';
import LiveAnalytics from './LiveAnalytics';
import Tag from './Tag';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  onDisconnect?: () => void;
}

interface Category {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const HISTORICAL_POINTS = [
  { time: 'May 31', reputation: 84 },
  { time: 'Jun 1', reputation: 84 },
  { time: 'Jun 2', reputation: 85 },
  { time: 'Jun 3', reputation: 85 },
  { time: 'Jun 4', reputation: 86 },
  { time: 'Jun 5', reputation: 86 },
  { time: 'Today', reputation: 87 },
];

export default function Dashboard({ user, onDisconnect }: DashboardProps) {
  const [subTab, setSubTab] = useState<'Reputation' | 'Activity'>('Reputation');
  const [cats, setCats] = useState<Category[]>(user.categories || [
    { label: 'Patience', value: 91, color: '#a78bfa', icon: '◈' },
    { label: 'Loyalty', value: 88, color: '#60a5fa', icon: '◆' },
    { label: 'Wisdom', value: 85, color: '#fbbf24', icon: '⊕' },
    { label: 'Generosity', value: 79, color: '#34d399', icon: '⬡' },
    { label: 'Energy', value: 72, color: '#f472b6', icon: '◉' },
  ]);
  const aura = getAura(user.karmaScore);
  const personality = PERSONALITIES[user.personality || 'Visionary'] || PERSONALITIES.Visionary;

  // Let indicators animate slightly on mount
  useEffect(() => {
    if (user.categories) {
      setCats(user.categories);
    }
  }, [user]);

  const completedStreakDays = (user.streak % 7) || 4;

  return (
    <div className="max-w-[1080px] mx-auto pt-24 px-6 pb-16 animate-fade-in text-slate-100">
      
      {/* Sub-navigation controls for the dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] mb-1">
            Reputation Portal
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Welcome Back, <span className="text-[#a78bfa]">@{user.username}</span>
          </h2>
          <div className="text-slate-400 text-xs font-mono mt-1 select-none">
            {user.hideWallet ? 'Wallet obscured' : truncateWallet(user.address)} · <span className="text-[10px]">{user.wallet.icon}</span> {user.wallet.name}
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab('Reputation')}
            className={`text-xs px-4 py-2 rounded-xl transition-all font-medium border cursor-pointer`}
            style={{
              background: subTab === 'Reputation' ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor: subTab === 'Reputation' ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)',
              color: subTab === 'Reputation' ? '#c084fc' : '#94a3b8',
            }}
          >
            📊 Reputation Metrics
          </button>
          <button
            onClick={() => setSubTab('Activity')}
            className={`text-xs px-4 py-2 rounded-xl transition-all font-medium border cursor-pointer`}
            style={{
              background: subTab === 'Activity' ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor: subTab === 'Activity' ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)',
              color: subTab === 'Activity' ? '#c084fc' : '#94a3b8',
            }}
          >
            ⚡ Live Activity & Analytics
          </button>
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="text-xs px-4 py-2 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 font-medium transition-all cursor-pointer"
            >
              ⏻ Disconnect
            </button>
          )}
        </div>
      </div>

      {subTab === 'Activity' ? (
        <LiveAnalytics user={user} />
      ) : (
        <>
          {/* Main Reputation Grid Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            
            {/* Karma Ring Metric card */}
            <div className="md:col-span-4 h-full">
              <GlassCard style={{ padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', hFull: '100%' }}>
                <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-4">Reputation Quotient</div>
                <KarmaRing score={user.karmaScore} aura={aura} size={170} />
                <div className="mt-6 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ backgroundColor: aura.color, boxShadow: `0 0 8px ${aura.color}` }} />
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: aura.color }}>{aura.name}</span>
                  </div>
                  <Tag color={aura.color}>Badge: {aura.badge}</Tag>
                </div>
              </GlassCard>
            </div>

            {/* Wallet Archetype Personality details */}
            <div className="md:col-span-8">
              <GlassCard style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-4">Archetype Profile</div>
                  <div className="flex items-start gap-4">
                    <span 
                      className="text-5xl font-mono leading-none" 
                      style={{ color: personality.color, textShadow: `0 0 20px ${personality.color}60` }}
                    >
                      {personality.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: '"Syne", sans-serif' }}>{personality.name} Archetype</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Assigned via deep learning on transfer frequency and token longevity ratios.</p>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        {personality.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score tags and performance indications */}
                <div className="mt-6 pt-6 border-t border-white/[0.05] flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2.5">
                    <Tag color={personality.color}>Top 8% Percentile</Tag>
                    <Tag color="#34d399">Consolidator Pillar</Tag>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Validated via {user.wallet.name}</span>
                </div>
              </GlassCard>
            </div>

          </div>

          {/* Interactive Categories Chart and Live Changes Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: 5 Behavioral Pillars */}
            <div className="lg:col-span-7">
              <GlassCard style={{ padding: 28 }}>
                <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-6">Behavioral Blueprint</div>
                
                <div className="space-y-5">
                  {cats.map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="flex items-center gap-2 text-slate-300 font-medium">
                          <span style={{ color: c.color }}>{c.icon}</span> {c.label}
                        </span>
                        <span className="font-mono font-bold" style={{ color: c.color }}>{c.value}/100</span>
                      </div>
                      
                      {/* Bar Track */}
                      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden relative border border-white/[0.01]">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ 
                            width: `${c.value}%`, 
                            background: `linear-gradient(90deg, ${c.color}20, ${c.color})`, 
                            boxShadow: `0 0 10px ${c.color}80` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Mini Trend Chart and Logs */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Daily Streak visual component */}
              <GlassCard style={{ padding: 24 }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono tracking-widest text-[#fbbf24] uppercase">Holding Streaks</span>
                  <span className="text-xs font-mono font-bold text-amber-500">47-day streak 🔥</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Consolidated hold limits. Maintain balances without token exits to complete additional cycles.
                </p>

                {/* 7 holding days bars */}
                <div className="flex gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 h-2 rounded-md transition-all duration-300"
                      style={{
                        background: i < 5 ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                        boxShadow: i < 5 ? '0 0 8px rgba(251, 191, 36, 0.45)' : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-mono uppercase">
                  <span>Day 1</span>
                  <span>5/7 completed to next score mult</span>
                  <span>Day 7</span>
                </div>
              </GlassCard>

              {/* Dynamic summary chart box */}
              <GlassCard style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-3">Reputation Over Time</div>
                  <div className="h-[90px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={HISTORICAL_POINTS} margin={{ top: 5, right: 5, left: -40, bottom: -10 }}>
                        <XAxis dataKey="time" hide />
                        <Tooltip
                          contentStyle={{
                            background: '#04040a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                          }}
                          labelClassName="text-slate-500 font-mono text-[9px]"
                          itemStyle={{ fontSize: 10, color: '#a78bfa' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="reputation" 
                          stroke="#a78bfa" 
                          strokeWidth={1.5} 
                          fill="rgba(167, 139, 250, 0.08)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.04] text-xs text-slate-400 leading-normal flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">↑ +3.5%</span> 
                  <span>Reputation velocity rising. Your trend matrix is steady.</span>
                </div>
              </GlassCard>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
