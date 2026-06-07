import { useEffect, useRef } from 'react';
import GlassCard from './GlassCard';

interface LandingProps {
  onShowConnect: () => void;
}

// Custom 2D Canvas ambient networking visualizer
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialise 45 floating coordinates
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.5 + 0.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Edge bouncing
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
        ctx.fill();
      });

      // Draw connection vectors
      particles.forEach((a, idx) => {
        particles.slice(idx + 1).forEach(b => {
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
}

export default function Landing({ onShowConnect }: LandingProps) {
  const features = [
    { icon: '◆', title: 'Karma Index', desc: 'A verified 0–100 reputation score built directly from 5 core behavioral indices across your entire transaction history.' },
    { icon: '◉', title: 'Archetype Model', desc: 'Let our on-chain engine classify your wallet into 8 distinct personality profiles based on holding longevity & trade spacing.' },
    { icon: '⬡', title: 'Aura System', desc: 'Advance through six custom aesthetic aura tiers. Elevate your presence from silent Initiate to glowing Ascendant.' },
    { icon: '⊕', title: 'Daily AI Readings', desc: 'Secure smart-profile readings customized to your stats. Receive objective on-chain wisdom powered by Gemini 3.5.' },
    { icon: '💳', title: 'Lending Synergy (Beta)', desc: 'Checking your score and claiming your username builds sovereign reputation karma. Elite profiles may qualify for uncollateralized loan offers from autonomous lenders who evaluate raw credit karma. (Please note that Karma AI does not directly issue debt or guarantee third-party loans).' },
    { icon: '⊛', title: 'Global Directory', desc: 'Compare your behavioral ranking globally. See how your patience matches other decentralized nodes.' },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between overflow-x-hidden">
      
      {/* Hero Visual Space Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">
        
        {/* Dynamic network vector background canvas */}
        <ParticleField />

        {/* Ambient neon orbs floating */}
        <div className="absolute top-[20%] left-[25%] w-[450px] h-[450px] rounded-full pointer-events-none opacity-40 blur-[130px] animate-orb-float" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', animation: 'orbFloat 8s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full pointer-events-none opacity-40 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animation: 'orbFloat 10s ease-in-out infinite reverse' }} />

        {/* Inner layout bounds */}
        <div className="relative z-10 text-center max-w-[800px] mx-auto animate-fade-in flex flex-col items-center">
          
          {/* Top release tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] inline-block animate-pulse" />
            <span 
              className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] font-bold text-center leading-none"
              style={{ letterSpacing: '0.14em' }}
            >
              🔒 Active Live Beta & Sandbox Testing · Go-Live August 2026
            </span>
          </div>

          {/* Heading with Syne Display font */}
          <h1 
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#f8fafc] leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.04em' }}
          >
            The Reputation <br />
            <span className="bg-gradient-to-r from-[#a78bfa] via-[#06b6d4] to-[#10b981] bg-clip-text text-transparent">
              Layer of Crypto
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mb-8 text-center px-2">
            Blockchain networks log numbers, balances, and public addresses.<br />
            <strong className="text-slate-200">KARMA AI logs verifiable human behavior.</strong><br />
            Onboard in seconds, evaluate your karma score, and prove your on-chain conviction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 w-full sm:w-auto px-4">
            <button
              onClick={onShowConnect}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-none text-white font-extrabold text-sm transition-all shadow-[0_0_35px_rgba(167,139,250,0.3)] hover:shadow-[0_0_45px_rgba(167,139,250,0.5)] transform hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                fontFamily: "'Syne', sans-serif"
              }}
            >
              Discover My Karma →
            </button>
            <button
              onClick={onShowConnect}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-all cursor-pointer"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              View Global Index
            </button>
          </div>

          {/* App Store / Google Play badges */}
          <div className="flex flex-wrap gap-3.5 justify-center items-center mb-16 select-none max-w-full px-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/40 border border-white/[0.06] text-left transition-all hover:border-purple-500/30">
              <span className="text-lg">🍏</span>
              <div>
                <div className="text-[7px] text-slate-500 font-mono uppercase tracking-widest leading-none">Coming soon on</div>
                <div className="text-[11px] text-slate-100 font-extrabold font-sans leading-tight mt-0.5">App Store</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/40 border border-white/[0.06] text-left transition-all hover:border-emerald-500/30">
              <span className="text-lg">🤖</span>
              <div>
                <div className="text-[7px] text-slate-500 font-mono uppercase tracking-widest leading-none">Coming soon on</div>
                <div className="text-[11px] text-slate-100 font-extrabold font-sans leading-tight mt-0.5">Google Play</div>
              </div>
            </div>
          </div>

          {/* Multi-chain networks launch info */}
          <div className="flex flex-col items-center gap-4 mb-10 w-full max-w-lg px-4">
            <div 
              className="text-[9px] font-mono uppercase tracking-widest text-slate-500 text-center"
              style={{ letterSpacing: '0.16em' }}
            >
              SUPPORTS METAMASK · COINBASE · RABBY · TRUST · WALLETCONNECT · RAINBOW
            </div>
            
            <div className="w-full h-px bg-white/[0.05]" />
            
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#a78bfa] font-bold flex items-center gap-1.5">
              <span>✦</span> Future Expansion Class (Live Beta August 2026) <span>✦</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 w-full">
              {[
                { name: 'Solana', symbol: 'SOL', icon: '◎', color: 'text-[#14F195] border-[#14F195]/20 bg-[#14F195]/5' },
                { name: 'Base', symbol: 'BASE', icon: '◈', color: 'text-[#0052FF] border-[#0052FF]/20 bg-[#0052FF]/5' },
                { name: 'Ethereum', symbol: 'ETH', icon: '◆', color: 'text-[#627EEA] border-[#627EEA]/20 bg-[#627EEA]/5' },
                { name: 'BNB Chain', symbol: 'BNB', icon: '⬡', color: 'text-[#F3BA2F] border-[#F3BA2F]/20 bg-[#F3BA2F]/5' },
              ].map(net => (
                <div 
                  key={net.name}
                  className={`flex flex-col items-center p-2 rounded-xl border ${net.color} transition-all hover:scale-[1.02]`}
                >
                  <span className="text-sm font-bold">{net.icon}</span>
                  <span className="text-[10px] font-bold mt-1 text-slate-200">{net.name}</span>
                  <span className="text-[8px] font-mono text-slate-500 mt-0.5">{net.symbol}</span>
                </div>
              ))}
            </div>
            
            <p className="text-[11px] text-slate-400 font-medium">
              Explore the sandbox right now with simulated live credentials. Operations go fully live across these 4 networks in August.
            </p>
          </div>
        </div>

        {/* Score indicator tags */}
        <div className="flex flex-wrap gap-4 relative z-10 justify-center">
          {[
            { score: 94, name: 'OraclePath', aura: 'Purple', color: '#a78bfa' },
            { score: 87, name: 'SatoshiPatience', aura: 'Gold', color: '#67e8f9' },
            { score: 79, name: 'ChainExplorer', aura: 'Blue', color: '#10b981' },
          ].map(p => (
            <div 
              key={p.name}
              className="px-6 py-4 rounded-xl bg-slate-950/60 border border-white/[0.06] backdrop-blur-md text-center min-w-[120px]"
            >
              <div 
                className="text-3xl font-extrabold mb-1" 
                style={{ color: p.color, fontFamily: "'Syne', sans-serif", textShadow: `0 0 15px ${p.color}40` }}
              >
                {p.score}
              </div>
              <div className="text-[11px] font-bold text-slate-200">@{p.name}</div>
              <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">{p.aura} Aura</div>
            </div>
          ))}
        </div>

      </div>

      {/* Structured Core Features Deck */}
      <div className="max-w-[1080px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Verifiable On-Chain Reputation
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
            Our engine translates raw transactional activity into five behavioral criteria dimensions, rewarding discipline over speculation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title}>
              <GlassCard hover style={{ padding: 28, height: '100%' }}>
                <div className="text-[#a78bfa] text-2xl mb-4 font-mono select-none">{f.icon}</div>
                <h4 className="text-white font-bold text-base mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer section */}
      <div className="py-24 px-6 text-center bg-slate-950/30 border-t border-white/[0.03]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">The New Standard for Web3 Identity</div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-200 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          Ready to verify your score?
        </h3>
        <button
          onClick={onShowConnect}
          className="px-8 py-4 rounded-xl border-none text-white font-extrabold text-sm transition-all shadow-[0_0_35px_rgba(167,139,250,0.25)] hover:shadow-[0_0_45px_rgba(167,139,250,0.45)] cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            fontFamily: "'Syne', sans-serif"
          }}
        >
          Initialize Sandbox Connection →
        </button>
      </div>

    </div>
  );
}
