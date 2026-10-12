import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Check, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Eye,
  Zap,
  Info,
  Upload,
  Repeat,
  FileVideo
} from 'lucide-react';
import { HeroVideoSettings } from '../types';

interface PresetOption {
  id: string;
  name: string;
  category: string;
  videoUrl: string;
  posterUrl: string;
  recommendedOpacity: number;
  recommendedSpeed: number;
}

const PRESET_VIDEOS: PresetOption[] = [
  {
    id: 'videohero',
    name: 'Cambiar Hero Video (videohero.mp4)',
    category: 'Eigen Studio Video ⭐',
    videoUrl: '/videohero.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
    recommendedOpacity: 65,
    recommendedSpeed: 1.0,
  },
  {
    id: 'heavy-ropes',
    name: 'Heavy Battle Ropes & Donkere Studio',
    category: 'High Energy & Focus',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-heavy-ropes-in-a-gym-42636-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
    recommendedOpacity: 70,
    recommendedSpeed: 0.85,
  },
  {
    id: 'bodybuilder-smith',
    name: 'Krachttraining & Smith Machine',
    category: 'Heavy Duty Kracht',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bodybuilder-working-out-in-a-dark-gym-42637-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
    recommendedOpacity: 65,
    recommendedSpeed: 0.85,
  },
  {
    id: 'silhouette-lighting',
    name: 'Gym Silhouet & Accentverlichting',
    category: 'Exclusieve Studio Sfeer',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-man-working-out-in-a-gym-42635-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=80',
    recommendedOpacity: 60,
    recommendedSpeed: 0.75,
  },
  {
    id: 'dumbbell-focus',
    name: 'Dumbbell Solo Training',
    category: '100% Privé Gym',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fit-man-training-arms-in-gym-42638-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80',
    recommendedOpacity: 70,
    recommendedSpeed: 0.85,
  },
];

interface HeroVideoAdminTabProps {
  onSaved?: (newSettings: HeroVideoSettings) => void;
}

export const HeroVideoAdminTab: React.FC<HeroVideoAdminTabProps> = ({ onSaved }) => {
  const [settings, setSettings] = useState<HeroVideoSettings>({
    enabled: true,
    videoUrl: PRESET_VIDEOS[0].videoUrl,
    posterUrl: PRESET_VIDEOS[0].posterUrl,
    overlayOpacity: 65,
    playbackSpeed: 1.0,
    title: 'videohero.mp4 (Cambiar Hero Video)',
    muted: true,
    loop: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Live preview video state
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/hero-video');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          enabled: data.enabled ?? true,
          videoUrl: data.videoUrl || PRESET_VIDEOS[0].videoUrl,
          posterUrl: data.posterUrl || PRESET_VIDEOS[0].posterUrl,
          overlayOpacity: data.overlayOpacity ?? 70,
          playbackSpeed: data.playbackSpeed ?? 0.85,
          title: data.title || 'Hero Video',
          muted: data.muted ?? true,
          loop: data.loop ?? true,
        });
      }
    } catch (e) {
      console.warn('Could not load hero video settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (previewVideoRef.current && settings.playbackSpeed) {
      previewVideoRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed, settings.videoUrl]);

  const handleSelectPreset = (preset: PresetOption) => {
    setSettings((prev) => ({
      ...prev,
      videoUrl: preset.videoUrl,
      posterUrl: preset.posterUrl,
      overlayOpacity: preset.recommendedOpacity,
      playbackSpeed: preset.recommendedSpeed,
      title: preset.name,
      loop: true,
    }));
    setVideoError(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('mp4') && !file.type.includes('webm') && !file.name.endsWith('.mp4')) {
      setErrorMessage('Selecteer een geldig .mp4 of .webm videobestand.');
      return;
    }

    if (file.size > 45 * 1024 * 1024) {
      setErrorMessage('Videobestand is groter dan 45MB. Comprimeer het bestand of gebruik een externe URL.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Bestand verwerken...');
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setUploadProgress('Uploaden naar server...');

        const res = await fetch('/api/admin/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            data: base64Data,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setSettings((prev) => ({
            ...prev,
            videoUrl: json.url,
            title: file.name.replace(/\.[^/.]+$/, ''),
            loop: true,
          }));
          setVideoError(false);
          setSaveSuccess(`Videobestand "${file.name}" succesvol geüpload en ingesteld! Klik op opslaan om toe te passen.`);
          setTimeout(() => setSaveSuccess(null), 5000);
        } else {
          const err = await res.json();
          setErrorMessage(err.error || 'Uploaden mislukt');
        }
        setIsUploading(false);
        setUploadProgress(null);
      };
      reader.onerror = () => {
        setErrorMessage('Kon het bestand niet lezen vanaf je computer.');
        setIsUploading(false);
        setUploadProgress(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Fout bij uploaden van videobestand.');
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/settings/hero-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveSuccess('Achtergrondvideo instellingen succesvol opgeslagen! De video speelt continu op repeat.');
        if (onSaved) {
          onSaved(data.settings);
        }
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Fout bij opslaan video instellingen');
      }
    } catch (e: any) {
      setErrorMessage('Fout bij verbinden met de server');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
        <span>Instellingen laden...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
              Hero Achtergrond Video (.mp4) Beheer
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin Configuratie
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Stel een sfeervolle, cinematic `.mp4` video in als fullscreen achtergrond voor de homepage hero sectie. 
            De video speelt automatisch af en herhaalt oneindig op repeat.
          </p>
        </div>

        {/* Enable / Disable Toggle Switch */}
        <div className="flex items-center gap-3 self-start sm:self-center bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800">
          <span className="text-xs font-mono text-zinc-300">
            Video Actief:
          </span>
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              settings.enabled ? 'bg-amber-400 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition ${
                settings.enabled ? 'bg-zinc-950' : 'bg-zinc-400'
              }`}
            />
          </button>
          <span className={`text-xs font-mono font-bold ${settings.enabled ? 'text-amber-400' : 'text-zinc-500'}`}>
            {settings.enabled ? 'AAN' : 'UIT'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Row 1: Studio Presets Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Kies een Studio MP4 Preset (Direct 1-Klik)</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              Royalty-free cinematic fitness video's
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_VIDEOS.map((preset) => {
              const isSelected = settings.videoUrl === preset.videoUrl;

              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden group cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/90 font-bold">
                        {preset.category}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white font-['Cabinet_Grotesk'] leading-tight">
                      {preset.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{preset.recommendedOpacity}% tint</span>
                    <span>{preset.recommendedSpeed}x snelheid</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Upload Own MP4 or Provide Custom URL */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Eigen .MP4 Video Uploaden of Externe URL Invoeren</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              Flexibel: lokaal bestand of directe link
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Direct File Upload Button */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-dashed border-zinc-700 hover:border-amber-400/70 transition flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <FileVideo className="w-4 h-4 text-amber-400" />
                  <span>Upload .MP4 van Computer</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Kies een .mp4 videobestand vanaf je apparaat. Wordt direct opgeslagen in de studio assets.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{uploadProgress || 'Uploaden...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Selecteer .MP4 Videobestand</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Video URL Input */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 font-bold block">
                  Of plak een directe MP4 URL:
                </label>
                <input
                  type="url"
                  required
                  value={settings.videoUrl}
                  onChange={(e) => {
                    setSettings((s) => ({ ...s, videoUrl: e.target.value }));
                    setVideoError(false);
                  }}
                  placeholder="https://domein.nl/video.mp4"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 block">
                  Poster Afbeelding (Fallback tijdens laden):
                </label>
                <input
                  type="url"
                  value={settings.posterUrl || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, posterUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-[11px] font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Row 3: Sliders, Playback Speed & Continuous Repeat Controls */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Overlay Opacity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-zinc-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Donkere Overlay (Contrast):</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {settings.overlayOpacity}% donker
              </span>
            </div>
            
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={settings.overlayOpacity}
              onChange={(e) => setSettings((s) => ({ ...s, overlayOpacity: parseInt(e.target.value, 10) }))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-zinc-950 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>10% (Licht)</span>
              <span>70% (Aanbevolen)</span>
              <span>95% (Donker)</span>
            </div>
          </div>

          {/* Playback Speed Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 font-bold block">
              Afspeelsnelheid (Slow-Motion):
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[
                { speed: 0.5, label: '0.5x' },
                { speed: 0.75, label: '0.75x' },
                { speed: 0.85, label: '0.85x' },
                { speed: 1.0, label: '1.0x' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.speed}
                  onClick={() => setSettings((s) => ({ ...s, playbackSpeed: item.speed }))}
                  className={`py-2 rounded-xl text-xs font-mono transition cursor-pointer text-center border ${
                    settings.playbackSpeed === item.speed
                      ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500">
              💡 0.85x geeft een rustige, exclusieve esthetiek.
            </p>
          </div>

          {/* Continuous Repeat (Loop) Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 font-bold flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              <span>Herhaal Video (Repeat / Loop):</span>
            </label>

            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, loop: s.loop === false ? true : false }))}
              className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                settings.loop !== false
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Repeat className={`w-4 h-4 ${settings.loop !== false ? 'text-emerald-400 animate-spin-slow' : 'text-zinc-500'}`} />
                <span className="text-xs font-bold font-mono">
                  {settings.loop !== false ? 'Oneindige Repeat (Aan)' : 'Eenmalig Spelen (Uit)'}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                settings.loop !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {settings.loop !== false ? 'LOOP ACTIEF' : 'GEEN LOOP'}
              </span>
            </button>

            <p className="text-[11px] text-zinc-500">
              Herhaalt de video direct wanneer deze afloopt, zonder hapering.
            </p>
          </div>

        </div>

        {/* Row 4: Live Interactive Preview Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Live Voorvertoning van de Hero Sectie</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              Inclusief herhaallus, overlay en contrast
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 h-64 sm:h-72 flex items-center justify-center text-center p-6 shadow-2xl">
            
            {/* Background Video inside preview */}
            {settings.enabled && settings.videoUrl ? (
              <>
                <video
                  ref={previewVideoRef}
                  src={settings.videoUrl}
                  poster={settings.posterUrl}
                  autoPlay
                  loop={settings.loop !== false}
                  muted={isPreviewMuted}
                  playsInline
                  preload="auto"
                  onEnded={() => {
                    if (previewVideoRef.current && settings.loop !== false) {
                      previewVideoRef.current.currentTime = 0;
                      previewVideoRef.current.play().catch(() => {});
                    }
                  }}
                  onError={() => setVideoError(true)}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />

                {/* Darkness Overlay matching slider */}
                <div
                  className="absolute inset-0 bg-zinc-950 transition-opacity duration-200"
                  style={{ opacity: settings.overlayOpacity / 100 }}
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/80" />
              </>
            ) : (
              <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center text-zinc-600 font-mono text-xs">
                Achtergrond video staat uitgeschakeld.
              </div>
            )}

            {/* Simulated Hero Text */}
            <div className="relative z-10 max-w-lg space-y-2 select-none pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-300 font-mono uppercase tracking-wider backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>Cambiar &bull; Privé Gym Studio</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk'] leading-tight drop-shadow-sm">
                Studio Cambiar.<br />
                <span className="text-zinc-300 font-normal text-lg sm:text-xl">60 minuten voor jou alleen.</span>
              </h3>
              <p className="text-xs text-zinc-300 line-clamp-2 max-w-sm mx-auto">
                Ervaar ultieme focus met smart door PIN toegang & sfeervolle verlichting.
              </p>
            </div>

            {/* Video status tag */}
            {videoError && (
              <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-800 text-rose-300 text-[10px] font-mono">
                ⚠️ Kon video URL niet direct inladen. Controleer de link of upload een .mp4.
              </div>
            )}

            {/* Repeat Indicator Tag */}
            {settings.enabled && settings.loop !== false && (
              <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-md">
                <Repeat className="w-3 h-3" />
                <span>Repeat Actief</span>
              </div>
            )}

            {/* Floating Live Controls on Preview */}
            {settings.enabled && (
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (previewVideoRef.current) {
                      if (isPreviewPlaying) {
                        previewVideoRef.current.pause();
                        setIsPreviewPlaying(false);
                      } else {
                        previewVideoRef.current.play();
                        setIsPreviewPlaying(true);
                      }
                    }
                  }}
                  className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                  title={isPreviewPlaying ? 'Pauzeer preview' : 'Speel preview'}
                >
                  {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (previewVideoRef.current) {
                      previewVideoRef.current.muted = !isPreviewMuted;
                      setIsPreviewMuted(!isPreviewMuted);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                  title={isPreviewMuted ? 'Geluid aanzetten' : 'Geluid dempen'}
                >
                  {isPreviewMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Save Button Bar */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Wijzigingen worden direct actief voor alle bezoekers en opgeslagen in SQLite.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold font-mono text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Opslaan in database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Hero Video Opslaan & Toepassen</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
