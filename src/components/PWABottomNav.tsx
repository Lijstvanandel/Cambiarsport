import React from 'react';
import { Calendar, KeyRound, CreditCard, Sparkles, User, ShieldCheck, Dumbbell, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MemberSubscription } from '../types';

interface PWABottomNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  bookingsCount: number;
  onOpenBookings: () => void;
  onOpenPortal: () => void;
  subscription: MemberSubscription | null;
}

export const PWABottomNav: React.FC<PWABottomNavProps> = ({
  activeSection,
  onNavigate,
  bookingsCount,
  onOpenBookings,
  onOpenPortal,
  subscription,
}) => {
  const { user } = useAuth();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <div className="grid grid-cols-5 items-center justify-around text-center max-w-md mx-auto">
        
        {/* 1. Uur Reserveren */}
        <button
          onClick={() => onNavigate('slots')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer min-h-[44px] ${
            activeSection === 'slots' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${activeSection === 'slots' ? 'bg-sky-500/20 text-sky-400' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight truncate max-w-full">
            Boek Uur
          </span>
        </button>

        {/* 2. Mijn PINs */}
        <button
          onClick={onOpenBookings}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer min-h-[44px] text-zinc-400 hover:text-zinc-200"
        >
          <div className="p-1 rounded-lg relative">
            <KeyRound className="w-5 h-5" />
            {bookingsCount > 0 && (
              <span className="absolute -top-0.5 -right-1 w-4 h-4 rounded-full bg-sky-400 text-zinc-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {bookingsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
            Mijn PIN
          </span>
        </button>

        {/* 3. Studio Foto's */}
        <button
          onClick={() => onNavigate('studio')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer min-h-[44px] ${
            activeSection === 'studio' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${activeSection === 'studio' ? 'bg-sky-500/20 text-sky-400' : ''}`}>
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
            Studio
          </span>
        </button>

        {/* 4. Tarieven */}
        <button
          onClick={() => onNavigate('tarieven')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer min-h-[44px] ${
            activeSection === 'tarieven' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${activeSection === 'tarieven' ? 'bg-sky-500/20 text-sky-400' : ''}`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
            Tarieven
          </span>
        </button>

        {/* 5. Account / Portaal */}
        <button
          onClick={onOpenPortal}
          className="flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer min-h-[44px] text-zinc-400 hover:text-white"
        >
          <div className={`p-1 rounded-lg transition ${
            user?.role === 'admin'
              ? 'bg-amber-500/20 text-amber-300'
              : user
              ? 'bg-sky-500/20 text-sky-300'
              : ''
          }`}>
            {user?.role === 'admin' ? (
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight truncate max-w-full">
            {user ? (user.role === 'admin' ? 'Beheer' : user.name.split(' ')[0]) : 'Inloggen'}
          </span>
        </button>

      </div>
    </div>
  );
};
