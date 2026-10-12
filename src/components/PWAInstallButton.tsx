import React, { useState } from 'react';
import { Download, Smartphone, X, Check, ShieldCheck, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CambiarLogo } from './CambiarLogo';

export const PWAInstallButton: React.FC<{ variant?: 'navbar' | 'floating' | 'banner' }> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running as an installed PWA or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // Variant: Navbar compact button
  if (variant === 'navbar') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-mono transition shadow-sm cursor-pointer"
          title="Installeer Cambiar als App op je telefoon of desktop"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Installeer App</span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-mono transition shadow-sm cursor-pointer"
            title="Installeer op iPhone / iPad"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">App op iPhone</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-700 p-5 sm:p-6 shadow-2xl text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CambiarLogo variant="globe" />
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Cabinet_Grotesk']">
                        Cambiar App op iOS
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Blijf standaard ingelogd
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 text-zinc-400 hover:text-white transition"
                    aria-label="Sluiten"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Tik onderaan in Safari op het <strong>Deel-icoon</strong> (vierkant met pijl omhoog).
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Scroll naar beneden en tik op <strong>"Zet op beginscherm"</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Tik rechtsboven op <strong>"Voeg toe"</strong>. Cambiar opent nu supersnel in fullscreen modus!
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs font-mono transition shadow-lg cursor-pointer"
                >
                  Begrepen
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
  }

  return null;
};
