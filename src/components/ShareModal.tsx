import { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { getAura, PERSONALITIES, truncateWallet } from '../constants';
import GlassCard from './GlassCard';

interface ShareModalProps {
  user: User;
  onClose: () => void;
}

export default function ShareModal({ user, onClose }: ShareModalProps) {
  const [copyingStats, setCopyingStats] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aura = getAura(user.karmaScore);
  const personality = PERSONALITIES[user.personality || 'Visionary'] || PERSONALITIES.Visionary;

  // Clear share status after 3 seconds
  useEffect(() => {
    if (shareStatus) {
      const timer = setTimeout(() => {
        setShareStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shareStatus]);

  // Format text representation for quick copy to clipboard (X, Telegram, Discord, etc.)
  function handleCopyText() {
    setCopyingStats(true);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const textToCopy = `✧ MY KARMA REPUTATION PASSPORT ✧
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Identity: @${user.username}
🔮 Archetype: ${personality.name} ${personality.icon}
🔥 Holding Streak: ${user.streak} Days 🔥
📊 Reputation Score: ${user.karmaScore}/100 [${aura.name} ${aura.badge}]

🎨 Pillars Bio:
${(user.categories || []).map(c => `${c.icon} ${c.label}: ${c.value}/100 [${'█'.repeat(Math.round(c.value / 12)).padEnd(8, '░')}]`).join('\n')}

🔒 Verified On-Chain Reputation Index
🚀 Next-Gen Multi-Chain Protocol
⏳ Mainnet Phase Operations Go-Live in August 2026.
#Web3Karma #ReputationPassport #Solana #Base #ETH`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShareStatus('Text summary copied to clipbaord!');
      })
      .catch((err) => {
        console.error('Failed to copy text:', err);
        setShareStatus('Copy failed. Please manually select the summary.');
      })
      .finally(() => {
        setCopyingStats(false);
      });
  }

  // Draw majestic high-res vector passport card to HTML Canvas element
  function drawPassport(canvas: HTMLCanvasElement): Promise<void> {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve();

      // Clear rect & render dimensions
      const width = 600;
      const height = 900;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Void Deep Theme Background
      const radialGradient = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width);
      radialGradient.addColorStop(0, '#110b24'); // Center cosmic dark purple
      radialGradient.addColorStop(0.5, '#070511'); // Secondary matrix dark
      radialGradient.addColorStop(1, '#020106'); // Outer deep void
      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Cyber grid patterns (abstract design dots)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSpacing = 30;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Highlighted Ambient Aura Glows (Ellipses on left & bottom right)
      ctx.fillStyle = aura.color + '0d'; // Translucent color glow (9% opacity)
      ctx.beginPath();
      ctx.arc(80, 150, 200, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = personality.color + '0a'; 
      ctx.beginPath();
      ctx.arc(520, 750, 250, 0, Math.PI * 2);
      ctx.fill();

      // 4. Double Hex Outer Bounds Borders
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = aura.color + '40'; // Semi-translucent border
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 25, width - 50, height - 50);

      // Cyber corners notches
      ctx.fillStyle = aura.color;
      // Top left
      ctx.fillRect(18, 18, 12, 4);
      ctx.fillRect(18, 18, 4, 12);
      // Top right
      ctx.fillRect(width - 30, 18, 12, 4);
      ctx.fillRect(width - 22, 18, 4, 12);
      // Bottom left
      ctx.fillRect(18, height - 22, 12, 4);
      ctx.fillRect(18, height - 30, 4, 12);
      // Bottom right
      ctx.fillRect(width - 30, height - 22, 12, 4);
      ctx.fillRect(width - 22, height - 30, 4, 12);

      // 5. Header Metadata Header
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 10px monospace';
      ctx.letterSpacing = '5px';
      ctx.textAlign = 'center';
      ctx.fillText('✧ KARMA REPUTATION PASSPORT ✧', width / 2, 60);

      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.letterSpacing = '3px';
      ctx.fillText('VERIFIED BLOCKCHAIN CREDENTIAL INDEX // v0.8', width / 2, 75);

      // Thin separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(40, 95);
      ctx.lineTo(width - 40, 95);
      ctx.stroke();

      // 6. User Identity Avatar Area
      const avatarY = 165;
      // Drawing avatar circle border
      ctx.strokeStyle = aura.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, avatarY, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent avatar bg
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.arc(width / 2, avatarY, 44, 0, Math.PI * 2);
      ctx.fill();

      // Avatar typography code
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(user.username[0].toUpperCase(), width / 2, avatarY - 2);
      ctx.textBaseline = 'alphabetic'; // reset

      // Identity label and address tag
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`@${user.username}`, width / 2, avatarY + 75);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      const userAddrStr = user.hideWallet ? `@${user.username}` : truncateWallet(user.address);
      ctx.fillText(`${userAddrStr} · ${user.wallet.name}`, width / 2, avatarY + 95);

      // Separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.moveTo(100, avatarY + 115);
      ctx.lineTo(width - 100, avatarY + 115);
      ctx.stroke();

      // 7. Core Reputation Score Circle & Badge
      const scoreY = 390;
      
      // Background disc for score
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      ctx.arc(width / 2, scoreY, 65, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(width / 2, scoreY, 65, 0, Math.PI * 2);
      ctx.stroke();

      // Score perimeter fill ring based on reputation percentage
      ctx.strokeStyle = aura.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      // start at -Math.PI/2 (top) and map 0..100 onto 0..2PI
      const endAngle = -Math.PI / 2 + (user.karmaScore / 100) * Math.PI * 2;
      ctx.arc(width / 2, scoreY, 65, -Math.PI / 2, endAngle, false);
      ctx.stroke();

      // Central Score characters
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(user.karmaScore.toString(), width / 2, scoreY + 4);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('REPUTATION', width / 2, scoreY - 26);

      ctx.fillStyle = aura.color;
      ctx.font = 'bold 9px monospace';
      ctx.letterSpacing = '1px';
      ctx.fillText('QUOTIENT', width / 2, scoreY + 22);

      // Badge name under the metric circle
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${aura.name} (${aura.badge})`, width / 2, scoreY + 95);

      // Archetype Badge Label below
      ctx.fillStyle = personality.color;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${personality.icon} ARCHETYPE: ${personality.name} PROFILE`, width / 2, scoreY + 115);

      // Streak record text label
      ctx.fillStyle = '#ea580c'; // Warm orange streak focus
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`🔥 STREAK: ${user.streak}-DAY CONVICTION RECORD`, width / 2, scoreY + 135);

      // Separator before category metrics
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(60, scoreY + 160);
      ctx.lineTo(width - 60, scoreY + 160);
      ctx.stroke();

      // 8. Behavioral Pillars Grid
      const pillarsY = scoreY + 190;
      const cats = user.categories || [
        { label: 'Patience', value: 91, color: '#a78bfa', icon: '◈' },
        { label: 'Loyalty', value: 88, color: '#60a5fa', icon: '◆' },
        { label: 'Wisdom', value: 85, color: '#fbbf24', icon: '⊕' },
        { label: 'Generosity', value: 79, color: '#34d399', icon: '⬡' },
        { label: 'Energy', value: 72, color: '#f472b6', icon: '◉' },
      ];

      // Render 5 metrics sequentially
      cats.forEach((cat, index) => {
        const itemY = pillarsY + index * 42;

        // Label on left
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${cat.icon}  ${cat.label}`, 60, itemY);

        // Value on right
        ctx.fillStyle = cat.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${cat.value}/100`, width - 60, itemY);

        // Bar Track
        const barStartX = 180;
        const barWidth = width - 180 - 60;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(barStartX, itemY - 9, barWidth, 6);

        // Actual score filled bar
        ctx.fillStyle = cat.color;
        ctx.fillRect(barStartX, itemY - 9, barWidth * (cat.value / 100), 6);
      });

      // 9. QR code simulation overlay on bottom-right corner for aesthetic authenticity
      const qrSize = 50;
      const qrX = width - 60 - qrSize;
      const qrY = height - 60 - qrSize;
      
      // Drawing QR outline border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#64748b';
      // Draw simulated matrix cubes
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (
            (r === 0 || r === 7 || c === 0 || c === 7) || // Border edges
            (r === 2 && c === 2) || (r === 2 && c === 5) || 
            (r === 5 && c === 2) || (r === 4 && c === 4) ||
            (Math.random() > 0.4 && r > 1 && r < 6 && c > 1 && c < 6)
          ) {
            ctx.fillRect(qrX + r * 6 + 2, qrY + c * 6 + 2, 4, 4);
          }
        }
      }

      // 10. Footer Launch details
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.letterSpacing = '1px';
      ctx.fillText('NETWORK DEPLOYMENT TYPE: SANDBOX STAGE', 60, height - 90);

      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('MULTI-CHAIN PHASE CHRONOLOGY: AUGUST 2026', 60, height - 73);

      ctx.fillStyle = '#475569';
      ctx.font = '8px sans-serif';
      ctx.fillText('Validated securely on the KARMA Artificial Intelligence decentralized ledger platform.', 60, height - 58);

      // Finished drawing
      resolve();
    });
  }

  // Trigger browser PNG save
  async function handleDownloadImage() {
    if (!canvasRef.current || downloadingImage) return;
    setDownloadingImage(true);
    try {
      await drawPassport(canvasRef.current);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `karma_passport_${user.username}.png`;
      link.href = dataUrl;
      link.click();
      setShareStatus('Karma passport downloaded successfully!');
    } catch (err) {
      console.warn('Canvas creation or file download failed:', err);
      setShareStatus('Download failed. Try copying summary text instead.');
    } finally {
      setDownloadingImage(false);
    }
  }

  // Copy PNG image to clipboard for instantaneous paste support in conversations
  async function handleCopyImage() {
    if (!canvasRef.current || copyingImage) return;
    setCopyingImage(true);
    try {
      await drawPassport(canvasRef.current);
      
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setShareStatus('Could not render passport blob.');
          setCopyingImage(false);
          return;
        }

        try {
          if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            setShareStatus('Passport image copied directly to clipboard! Paste anywhere.');
          } else {
            setShareStatus('Direct image copy is blocked by frame sandbox. Free download instead.');
          }
        } catch (clipErr) {
          console.warn('ClipboardItem api write failed:', clipErr);
          setShareStatus('Copy action restricted by browser security policies. Try "Download Passport Card".');
        } finally {
          setCopyingImage(false);
        }
      }, 'image/png');

    } catch (err) {
      console.warn('Image rendering failed:', err);
      setShareStatus('Copy failed. Please download the PNG instead.');
      setCopyingImage(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020206e0] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-fade-in" id="share-modal-root">
      <div className="relative w-full max-w-lg bg-[#0a0a14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header decoration streak */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

        {/* Header content section */}
        <div className="p-6 pb-4 border-b border-white/[0.05] flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-[#f8fafc] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
              Share My Karma
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5 font-mono uppercase tracking-wider text-purple-400">
              ✦ Diplomatic Reputation Passport ✦
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer text-xs"
            id="close-share-modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Interior */}
        <div className="p-6 space-y-6">
          
          {/* Status logs confirmation toast */}
          {shareStatus && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center text-[#c084fc] text-xs font-mono animate-pulse">
              {shareStatus}
            </div>
          )}

          {/* Interactive cyber receipt passport presentation mockup */}
          <GlassCard style={{ padding: '24px 20px', borderRadius: 16 }}>
            <div className="flex justify-between items-start text-[8px] font-mono text-slate-500 tracking-widest uppercase mb-4">
              <span>LEDGER SYSTEM // AUGUST 2026</span>
              <span className="text-[#a78bfa] font-bold">ALPHA CREDENTIAL</span>
            </div>

            <div className="flex items-center gap-4 border-b border-white/[0.04] pb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${aura.color}, #21153b)`,
                }}
              >
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-[#f8fafc] font-bold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                  @{user.username}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs">{user.wallet.icon}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user.hideWallet ? `@${user.username}` : truncateWallet(user.address)}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle statistics items */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/[0.04]">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Reputation quotient</span>
                <span className="text-lg font-black text-slate-200 mt-1 flex items-center gap-1">
                  <span style={{ color: aura.color }}>✧</span> {user.karmaScore} <span className="text-[10px] text-slate-500">/ 100</span>
                </span>
                <span className="text-[10px] font-mono block mt-0.5 uppercase tracking-wide" style={{ color: aura.color }}>
                  {aura.name}
                </span>
              </div>
              
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Holding Streak</span>
                <span className="text-lg font-black text-amber-500 mt-1 block">
                  🔥 {user.streak} Days
                </span>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                  {personality.icon} {personality.name}
                </span>
              </div>
            </div>

            {/* High-level status checklist summary mock */}
            <div className="pt-4 space-y-1.5">
              {(user.categories || []).slice(0, 3).map((c) => (
                <div key={c.label} className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span style={{ color: c.color }}>{c.icon}</span> {c.label}
                  </span>
                  <span style={{ color: c.color }} className="font-bold">{c.value}/100</span>
                </div>
              ))}
              <div className="text-[9px] text-slate-500 font-mono italic text-center pt-1.5">
                + additional pillars tracked silently in metadata
              </div>
            </div>
          </GlassCard>

          {/* Action trigger arrays */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Copy image button */}
              <button
                onClick={handleCopyImage}
                disabled={copyingImage || downloadingImage}
                className="py-3 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-slate-200 font-semibold text-xs leading-none transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <span>{copyingImage ? 'Generating...' : '📋 Copy Passport Image'}</span>
              </button>

              {/* Download image button */}
              <button
                onClick={handleDownloadImage}
                disabled={copyingImage || downloadingImage}
                className="py-3 px-4 rounded-xl text-white font-black text-xs leading-none transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border-none disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${aura.color}, #3b1c6e)`,
                }}
              >
                <span>{downloadingImage ? 'Rendering...' : '⬇ Download Passport Card'}</span>
              </button>
            </div>

            {/* Quick text copy option */}
            <button
              onClick={handleCopyText}
              disabled={copyingStats}
              className="w-full py-3.5 px-4 rounded-xl border border-purple-500/10 bg-purple-500/5 hover:bg-purple-500/10 text-[#c084fc] font-bold text-xs leading-none transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>{copyingStats ? 'Copying...' : '✧ Copy Raw Profile Markdown Summary'}</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center font-mono leading-relaxed px-4">
            Images generated instantly in your browser via responsive virtual vector canvases. Securely cryptographic. Launching August 2026.
          </p>

        </div>

        {/* Invisible canvas utilized strictly for background graphic draws */}
        <div className="hidden">
          <canvas ref={canvasRef} style={{ width: 600, height: 900 }} />
        </div>

      </div>
    </div>
  );
}
