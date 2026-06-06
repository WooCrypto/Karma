import { useEffect, useState } from 'react';
import { Aura } from '../types';

interface KarmaRingProps {
  score: number;
  aura: Aura;
  size?: number;
}

export default function KarmaRing({ score, aura, size = 180 }: KarmaRingProps) {
  const [val, setVal] = useState(0);
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    // Animate the numeric score
    let startVal = 0;
    const duration = 1200; // ms
    const step = score / (duration / 16);
    const id = setInterval(() => {
      startVal += step;
      if (startVal >= score) {
        setVal(score);
        clearInterval(id);
      } else {
        setVal(Math.floor(startVal));
      }
    }, 16);

    return () => clearInterval(id);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={aura.color} />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Gray Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#grad-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={targetOffset}
          style={{
            filter: `drop-shadow(0 0 12px ${aura.color}dd)`,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)',
          }}
        />
      </svg>

      {/* Internal Value Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span 
          className="text-white text-5xl font-extrabold tracking-tight select-none"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {val}
        </span>
        <span 
          className="text-xs uppercase tracking-widest font-mono mt-1 text-slate-400"
          style={{ letterSpacing: '0.2em' }}
        >
          Karma
        </span>
      </div>
    </div>
  );
}
