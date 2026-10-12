import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineNotice: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
      <WifiOff className="w-4 h-4 text-zinc-950 flex-shrink-0" />
      <span>
        <strong>Offline Modus:</strong> Geen actieve internetverbinding. Opgeslagen PIN-codes en studio gegevens blijven lokaal beschikbaar in je PWA.
      </span>
    </div>
  );
};
