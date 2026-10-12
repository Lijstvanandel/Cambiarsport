import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Lock, KeyRound, ShieldCheck, Dumbbell, Sparkles, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { HeroVideoSettings } from '../types';

interface HeroProps {
  onExploreSlots: () => void;
  onExplorePlans: () => void;
  onExploreStudio: () => void;
  videoSettings?: HeroVideoSettings | null;
}

const DEFAULT_HERO_VIDEO: HeroVideoSettings = {
  enabled: true,
  videoUrl: '/videohero.mp4',
  posterUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
  overlayOpacity: 65,
  playbackSpeed: 1.0,
  title: 'videohero.mp4 (Cambiar Hero Video)',
  muted: true,
  loop: true,
};

export const Hero: React.FC<HeroProps> = ({
  onExploreSlots,
  onExplorePlans,
  onExploreStudio,
  videoSettings: initialSettings,
}) => {
  const [settings, setSettings] = useState<HeroVideoSettings>(initialSettings || DEFAULT_HERO_VIDEO);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync settings when initialSettings prop changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setIsMuted(initialSettings.muted ?? true);
    }
  }, [initialSettings]);

  // Fetch settings from server on mount if not passed via props
  useEffect(() => {
    if (!initialSettings) {
      fetch('/api/settings/hero-video')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.videoUrl) {
            setSettings(data);
            setIsMuted(data.muted ?? true);
          }
        })
        .catch(() => {});
    }
  }, [initialSettings]);

  // Adjust playback speed & ensure reliable looping playback
  useEffect(() => {
    if (videoRef.current) {
      if (settings?.playbackSpeed) {
        videoRef.current.playbackRate = settings.playbackSpeed;
      }
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [settings?.playbackSpeed, settings?.videoUrl, isVideoLoaded, isMuted]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const isVideoActive = settings?.enabled && settings?.videoUrl;
  const overlayOpacity = settings?.overlayOpacity !== undefined ? settings.overlayOpacity : 70;

  return (
    <section id="concept" className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 border-b border-zinc-900 overflow-hidden bg-zinc-950">
      
      {/* 1. Background Video Layer (.mp4) with Continuous Repeat (Loop) */}
      {isVideoActive && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <video
            ref={videoRef}
            src={settings.videoUrl}
            poster={settings.posterUrl || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80'}
            autoPlay
            loop={settings.loop !== false}
            muted={isMuted}
            playsInline
            preload="auto"
            onEnded={() => {
              // Guaranteed infinite loop repeat across all desktop & mobile browsers
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => {});
              }
            }}
            onLoadedData={() => {
              setIsVideoLoaded(true);
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
          
          {/* Configurable Darkness Overlay */}
          <div 
            className="absolute inset-0 bg-zinc-950 transition-opacity duration-300"
            style={{ opacity: overlayOpacity / 100 }}
          />

          {/* Cinematic Vignette & Gradient Edges to ensure 100% Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,#09090b_90%]" />
        </div>
      )}

      {/* 2. Ambient Studio Backlight Atmosphere Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-[1]" />

      {/* 3. Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        
        {/* Foundation & Brand Tag */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-200">
            Cambiar &bull; Exclusieve Privé Gym & Personal Training Studio
          </span>
        </div>

        {/* Minimalist Bold Typography */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-['Cabinet_Grotesk'] drop-shadow-sm">
            Studio Cambiar.<br />
            <span className="text-zinc-300 font-normal">Jouw privégym, 60 minuten voor jou alleen.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-sm">
            Ervaar de ultieme focus in onze sfeervolle privéstudio met verlichte designspiegels, heavy-duty power rack, multifunctionele Smith & cable station en Bluetooth audio. Toegang zonder balie met je persoonlijke smart lock PIN.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onExploreSlots}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-bold tracking-tight transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>Kies een 1-Uurs Tijdslot</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreStudio}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <Dumbbell className="w-4 h-4 text-zinc-400" />
            <span>Bekijk Studio & Foto's</span>
          </button>
        </div>

        {/* Optional Discreet Video Controls in Hero */}
        {isVideoActive && isVideoLoaded && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={togglePlay}
              className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
              title={isPlaying ? 'Pauzeer achtergrond video' : 'Speel achtergrond video af'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Pauzeer video' : 'Speel video'}</span>
            </button>

            <button
              onClick={toggleSound}
              className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
              title={isMuted ? 'Geluid aan' : 'Geluid dempen'}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-sky-400" />}
              <span>{isMuted ? 'Geluid uit' : 'Geluid aan'}</span>
            </button>
          </div>
        )}

        {/* 3 Pillars matching Cambiar's real setup */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-850 space-y-2.5 relative overflow-hidden group hover:border-zinc-700 transition backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-sky-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-['Cabinet_Grotesk']">
              100% Exclusieve Studio
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tijdens jouw geboekte 60 minuten is niemand anders aanwezig in Cambiar. Neem gerust kosteloos je trainingspartner of PT'er mee.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-850 space-y-2.5 relative overflow-hidden group hover:border-zinc-700 transition backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-['Cabinet_Grotesk']">
              Smart Keyless PIN Lock
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct na reservering ontvang je jouw persoonlijke 4-cijferige pincode. Het elektronische deurslot ontgrendelt exact tijdens jouw slot.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-850 space-y-2.5 relative overflow-hidden group hover:border-zinc-700 transition backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-['Cabinet_Grotesk']">
              100% Maandelijks Opzegbaar
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Boek losse uren (€24,-) of kies een flexibel maandabonnement. Zonder inschrijfkosten en maandelijks met 1 klik opzegbaar.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
