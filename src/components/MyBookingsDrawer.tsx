import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  QrCode, 
  Lock, 
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { SlotBooking } from '../types';
import { formatDutchDate } from '../data/gymData';

interface MyBookingsDrawerProps {
  bookings: SlotBooking[];
  isOpen: boolean;
  onClose: () => void;
  onCancelBooking: (bookingId: string) => void;
  onExploreSlots: () => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  bookings,
  isOpen,
  onClose,
  onCancelBooking,
  onExploreSlots,
}) => {
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<SlotBooking | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled');

  const copyPinToClipboard = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl text-zinc-100 pt-safe pb-safe">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                Mijn Privé Uren & PIN
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {activeBookings.length} actieve {activeBookings.length === 1 ? 'reservering' : 'reserveringen'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookings List Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {activeBookings.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 rounded-2xl border border-zinc-850 space-y-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-200 font-['Cabinet_Grotesk']">
                Geen gereserveerde uren
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Je hebt momenteel geen tijdsloten geboekt. Kies een datum en reserveer direct je privéstudio.
              </p>
              <button
                onClick={() => { onClose(); onExploreSlots(); }}
                className="mt-2 py-2 px-4 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs shadow-sm hover:bg-white transition"
              >
                Kies een Tijdslot
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Aankomende Uren & Deursloten
              </div>

              {activeBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Privé Gym Sessie (60 min)
                      </span>
                      <h4 className="font-bold text-sm text-white font-mono mt-0.5">
                        {b.startTime} - {b.endTime}
                      </h4>
                    </div>

                    <span className="text-xs text-zinc-400 font-mono">
                      {formatDutchDate(b.date)}
                    </span>
                  </div>

                  {/* Smart PIN Display */}
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                        Smart Lock PIN:
                      </span>
                      <span className="text-lg font-mono font-black text-white tracking-widest">
                        {b.accessPin}
                      </span>
                    </div>

                    <button
                      onClick={() => copyPinToClipboard(b.accessPin, b.id)}
                      className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1 transition"
                      title="Kopieer PIN"
                    >
                      {copiedPinId === b.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Actions for this booking */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedBookingForQr(b)}
                      className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Toon QR</span>
                    </button>

                    <button
                      onClick={() => onCancelBooking(b.id)}
                      className="py-1 px-2.5 rounded-lg bg-transparent hover:bg-rose-950/30 text-zinc-400 hover:text-rose-300 text-xs transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Annuleren</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past / Cancelled */}
          {pastBookings.length > 0 && (
            <div className="pt-4 border-t border-zinc-900 space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-400">
                Geannuleerde Uren
              </div>
              {pastBookings.map((pb) => (
                <div key={pb.id} className="p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-900 text-xs opacity-50 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-zinc-400">{pb.startTime} - {pb.endTime} &bull; {pb.date}</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400">Geannuleerd</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Bottom CTA */}
        <div className="p-5 border-t border-zinc-900 bg-zinc-950">
          <button
            onClick={() => { onClose(); onExploreSlots(); }}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nieuw Uur Reserveren</span>
          </button>
        </div>

      </div>

      {/* QR Code Popup */}
      {selectedBookingForQr && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="font-mono text-xs text-zinc-300">{selectedBookingForQr.startTime} - {selectedBookingForQr.endTime}</span>
              <button onClick={() => setSelectedBookingForQr(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl mx-auto w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#09090b" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#09090b" />
                <rect x="65" y="10" width="25" height="25" fill="#09090b" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#09090b" />
                <rect x="10" y="65" width="25" height="25" fill="#09090b" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#09090b" />
                <rect x="45" y="45" width="10" height="10" fill="#09090b" />
                <rect x="40" y="20" width="8" height="8" fill="#09090b" />
                <rect x="25" y="45" width="8" height="8" fill="#09090b" />
                <rect x="70" y="45" width="8" height="8" fill="#09090b" />
                <rect x="45" y="70" width="8" height="8" fill="#09090b" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-xl font-black text-white">
                {selectedBookingForQr.accessPin}
              </div>
              <p className="text-[11px] text-zinc-400">
                Of scan deze code bij de scanner aan de studio-ingang.
              </p>
            </div>

            <button
              onClick={() => setSelectedBookingForQr(null)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
