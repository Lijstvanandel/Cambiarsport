import React from 'react';

interface CambiarLogoProps {
  variant?: 'minimal' | 'full' | 'globe' | 'emblem';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CambiarLogo: React.FC<CambiarLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
}) => {
  if (variant === 'globe') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-8 h-8 rounded-full border border-sky-400/40 bg-sky-950/30 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-5 h-5 text-sky-400 stroke-current fill-none stroke-[2.5]" strokeLinecap="round">
            <circle cx="50" cy="50" r="44" />
            <path d="M 20,40 C 35,25 65,30 80,42 C 60,60 40,75 25,60 C 20,50 35,45 50,45" />
            <path d="M 45,15 C 60,20 70,40 65,70 C 50,85 30,70 35,55" />
            <path d="M 12,52 Q 50,68 88,48" strokeDasharray="3,2" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-['Playfair_Display'] italic text-sky-300 leading-tight">
            Stichting
          </span>
          <span className="text-xs font-black tracking-[0.25em] uppercase text-white font-mono">
            CAMBIAR
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'emblem') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 stroke-current fill-none stroke-2">
            <path d="M6 18h12M6 6h12M9 6v12M15 6v12M3 12h18" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-[0.2em] uppercase text-white font-['Cabinet_Grotesk']">
            CAMBIAR
          </span>
          <span className="text-[9px] tracking-widest uppercase text-zinc-400 font-mono">
            Personal Training
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Icon Badge */}
      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-center relative overflow-hidden shadow-inner flex-shrink-0 group-hover:border-zinc-500 transition">
        {/* Subtle LED glow effect matching studio */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-amber-500/10 opacity-70" />
        <span className="relative font-black text-sm text-white tracking-tighter font-['Cabinet_Grotesk']">
          CB
        </span>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-sm sm:text-base font-black tracking-[0.18em] uppercase text-white font-['Cabinet_Grotesk']">
            CAMBIAR
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40 font-mono uppercase">
            Studio
          </span>
        </div>
        <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-mono">
          Private Gym &bull; Afhuur per Uur
        </span>
      </div>
    </div>
  );
};
