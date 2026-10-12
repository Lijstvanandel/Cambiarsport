import React from 'react';
import { ArrowUp, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { CambiarLogo } from './CambiarLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenCheckout: (planId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <CambiarLogo />
            <p className="text-zinc-400 leading-relaxed text-[11px] max-w-xs">
              Exclusieve privégym studio & personal training. Afhuur per 60 minuten met smart lock PIN-toegang en 100% maandelijks opzegbare abonnementen.
            </p>
            <div className="pt-1">
              <CambiarLogo variant="globe" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
              Navigatie
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => onNavigate('concept')} className="hover:text-white transition">
                  Over Cambiar & Privacy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('studio')} className="hover:text-white transition">
                  Foto's & Apparatuur
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('slots')} className="hover:text-white transition">
                  1-Uurs Tijdslot Reserveren
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tarieven')} className="hover:text-white transition">
                  Maandabonnementen
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition">
                  Veelgestelde Vragen
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
              Toegang & Boekingen
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Studio Cambiar<br />
              Smart Lock Entry 06:00 - 23:00<br />
              Toegang met 4-cijferige pincode (#)
            </p>
            <span className="text-[10px] text-zinc-400 block pt-1 font-mono">
              Beveiligde online betalingen via Stripe (iDEAL & Creditcard)
            </span>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 font-mono">
          <p>
            &copy; {new Date().getFullYear()} Studio Cambiar &bull; 100% Maandelijks Opzegbaar
          </p>

          <button
            onClick={scrollToTop}
            className="text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Naar boven</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
