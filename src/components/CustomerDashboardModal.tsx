import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  LogOut, 
  Layers, 
  Download, 
  PauseCircle, 
  RefreshCw,
  Trash2,
  Lock,
  PlusCircle,
  ChevronRight,
  User,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SlotBooking, TimeSlot } from '../types';
import { CambiarLogo } from './CambiarLogo';
import { formatDutchDate, generateHourlySlotsForDateRange, getLocalDateString } from '../data/gymData';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendar: () => void;
  onOpenCheckout: (planId?: string) => void;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenCalendar,
  onOpenCheckout,
}) => {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'book_slot' | 'subscription' | 'invoices'>('overview');
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick slot booking states
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [isBookingInProgress, setIsBookingInProgress] = useState<boolean>(false);

  // Dates for next 7 days using local date string to avoid UTC offset issues
  const datesList = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return getLocalDateString(d);
    });
  }, []);

  const selectedDate = datesList[selectedDateIdx];

  // Fetch bookings for current user
  useEffect(() => {
    if (isOpen && user?.email) {
      fetchUserBookings();
      // Generate slots for quick booking
      const generated = generateHourlySlotsForDateRange(new Date(), 7);
      setAvailableSlots(generated);
    }
  }, [isOpen, user?.email]);

  const fetchUserBookings = async () => {
    if (!user?.email) return;
    setIsLoadingBookings(true);
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.warn('Error fetching user bookings:', e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  if (!isOpen || !user) return null;

  const subscription = user.subscription;
  const isUnlimited = subscription?.monthlyHours === 'onbeperkt';
  const remainingHours = subscription?.remainingHoursThisMonth ?? 0;
  const maxHours = typeof subscription?.monthlyHours === 'number' ? subscription.monthlyHours : 8;
  const progressPercent = isUnlimited ? 100 : Math.min(100, Math.max(0, (remainingHours / maxHours) * 100));

  const activeBookings = bookings.filter(b => b.status === 'confirmed');

  // Book slot with membership credits
  const handleBookWithCredits = async (slot: TimeSlot) => {
    if (!user?.email) return;
    setIsBookingInProgress(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/customer/book-with-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          userEmail: user.email,
          userName: user.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Boeken mislukt' });
        setIsBookingInProgress(false);
        return;
      }

      setActionMessage({
        type: 'success',
        text: `Gereserveerd! Tijdslot ${slot.date} ${slot.startTime} - ${slot.endTime}. Deur PIN: ${data.booking.accessPin}`,
      });

      // Update local slots & refresh bookings & user
      setAvailableSlots(prev => prev.map(s => s.id === slot.id ? { ...s, isAvailable: false } : s));
      await fetchUserBookings();
      await refreshUser();
      setActiveTab('overview');
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Verbindingsfout' });
    } finally {
      setIsBookingInProgress(false);
    }
  };

  // Cancel booking & restore credit
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: 'Tijdslot succesvol geannuleerd. Jouw uurtegoed is direct hersteld.',
        });
        await fetchUserBookings();
        await refreshUser();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Kon niet annuleren' });
    }
  };

  // Subscription management actions
  const handlePauseSubscription = async () => {
    if (!subscription?.id) return;
    try {
      const res = await fetch('/api/subscriptions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: 'Lidmaatschap is succesvol voor 30 dagen gepauzeerd.',
        });
        await refreshUser();
      }
    } catch (e) {}
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    if (!window.confirm('Weet je zeker dat je je lidmaatschap wilt beëindigen? (100% Maandelijks Opzegbaar)')) return;

    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: 'Lidmaatschap is per direct kosteloos beëindigd.',
        });
        await refreshUser();
      }
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40">
          <div className="flex items-center gap-3.5">
            <CambiarLogo variant="globe" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Cabinet_Grotesk']">
                  Klantendashboard • {user.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-[10px] font-mono">
                  {user.role === 'member' ? 'Actief Lid' : 'Klant'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {user.email} &bull; Lid sinds {user.memberSince}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { logout(); onClose(); }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
              title="Uitloggen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Uitloggen</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-900 bg-zinc-950 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('overview'); setActionMessage(null); }}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-sky-400 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overzicht & Smart PIN ({activeBookings.length})
          </button>
          <button
            onClick={() => { setActiveTab('book_slot'); setActionMessage(null); }}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'book_slot'
                ? 'border-sky-400 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Uur Boeken met Tegoed</span>
          </button>
          <button
            onClick={() => { setActiveTab('subscription'); setActionMessage(null); }}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-sky-400 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Abonnement & Beheer
          </button>
        </div>

        {/* Toast / Action Message */}
        {actionMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* TAB 1: OVERVIEW & SMART PIN CODES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Membership Credit Widget */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider block">
                      Actief Lidmaatschap
                    </span>
                    <h3 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                      {subscription?.planName || 'Geen actief abonnement'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>100% Maandelijks Opzegbaar</span>
                    </span>
                  </div>
                </div>

                {/* Credit Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Resterend tegoed deze maand:</span>
                    <span className="font-bold text-white">
                      {isUnlimited ? 'Onbeperkt toegang' : `${remainingHours} van ${maxHours} uren`}
                    </span>
                  </div>
                  
                  <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-sky-500 to-amber-300 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-zinc-400 border-t border-zinc-800/80">
                  <span>Volgende facturatie: <strong className="text-zinc-200">{subscription?.nextBillingDate || '1 van de maand'}</strong></span>
                  <button
                    onClick={() => setActiveTab('book_slot')}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs font-mono transition flex items-center gap-1"
                  >
                    <span>Direct Uur Reserveren</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Active Bookings & Smart Lock PIN Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                    Jouw Gereserveerde Uren & Smart Lock PIN Toegang
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {activeBookings.length} actief gereserveerd
                  </span>
                </div>

                {activeBookings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-850 text-center space-y-3">
                    <Key className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">
                      Je hebt op dit moment geen actieve reserveringen gepland staan.
                    </p>
                    <button
                      onClick={() => setActiveTab('book_slot')}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono transition"
                    >
                      Plan direct een uur in
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-750 shadow-xl space-y-4 relative overflow-hidden"
                      >
                        {/* Top info */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest block">
                              Privé Gym Toegang
                            </span>
                            <div className="flex items-center gap-2 text-sm font-bold text-white font-['Cabinet_Grotesk']">
                              <Calendar className="w-4 h-4 text-sky-400" />
                              <span>{formatDutchDate(b.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{b.startTime} - {b.endTime} (60 min)</span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-mono">
                            Bevestigd
                          </span>
                        </div>

                        {/* Glowing Smart Lock PIN Code Box */}
                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
                            Elektronisch Deurslot PIN Code
                          </span>
                          <div className="text-2xl sm:text-3xl font-black font-mono text-sky-400 tracking-widest drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                            {b.accessPin}
                          </div>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            Toets cijfers in op het keypad en sluit af met de <strong className="text-zinc-200">#</strong> toets
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[11px] font-mono text-zinc-400">
                            100% Exclusieve studio
                          </span>
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 text-[11px] font-mono transition"
                          >
                            Annuleren & Uur Terug
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: BOOK SLOT WITH MEMBERSHIP CREDITS */}
          {activeTab === 'book_slot' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider block">
                    1-Klik Tegoed Boeking
                  </span>
                  <h4 className="text-sm font-bold text-white font-['Cabinet_Grotesk']">
                    Kies een datum & uur in de Cambiar Studio
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {isUnlimited 
                      ? 'Je hebt onbeperkte uren. Reserveren kost €0,00 extra.' 
                      : `Je hebt nog ${remainingHours} uurtegoed over voor deze maand.`}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 text-xs font-mono font-bold whitespace-nowrap">
                  €0,00 (Inbegrepen)
                </span>
              </div>

              {/* Date selector pills */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {datesList.map((dStr, idx) => {
                  const d = new Date(dStr);
                  const isSelected = selectedDateIdx === idx;
                  const dayName = d.toLocaleDateString('nl-NL', { weekday: 'short' });
                  const dayNum = d.getDate();

                  return (
                    <button
                      key={dStr}
                      onClick={() => setSelectedDateIdx(idx)}
                      className={`p-3 rounded-xl border text-center transition ${
                        isSelected
                          ? 'bg-zinc-800 border-sky-400 text-white ring-2 ring-sky-400/30 shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-mono block">{dayName}</span>
                      <span className="text-base font-black font-['Cabinet_Grotesk'] block mt-0.5">{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slots for selected date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    Beschikbare uren op {formatDutchDate(selectedDate)}:
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {availableSlots
                    .filter(s => s.date === selectedDate)
                    .map((slot) => {
                      const isBooked = !slot.isAvailable;
                      return (
                        <button
                          key={slot.id}
                          disabled={isBooked || isBookingInProgress || (!isUnlimited && remainingHours <= 0)}
                          onClick={() => handleBookWithCredits(slot)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                            isBooked
                              ? 'bg-zinc-950/40 border-zinc-900 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-sky-500/50 text-zinc-200 hover:text-white cursor-pointer group shadow-sm'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold font-mono block">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {isBooked ? 'Bezet' : '1 Uur Studio'}
                            </span>
                          </div>

                          {!isBooked && (
                            <span className="text-[10px] font-mono text-sky-400 group-hover:translate-x-0.5 transition">
                              Boek →
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & BILLING MANAGEMENT */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider block">
                      Abonnementsgegevens
                    </span>
                    <h3 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                      {subscription?.planName}
                    </h3>
                  </div>

                  <span className="text-lg font-mono font-bold text-white">
                    €{subscription?.price.toFixed(2)} <span className="text-xs font-normal text-zinc-400">/ maand</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-300">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px]">Betaalmethode</span>
                    <span className="font-semibold">{subscription?.paymentMethod || 'iDEAL (Stripe)'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px]">Verlenging</span>
                    <span className="font-semibold">{subscription?.nextBillingDate}</span>
                  </div>
                </div>

                {/* 100% Monthly Cancellation Promise */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>100% Maandelijks Opzegbaar Garantie</span>
                  </div>
                  <p>
                    Bij Cambiar zit je nergens aan vast. Je kunt op elk moment kosteloos pauzeren voor vakantie of je abonnement direct beëindigen met één klik.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handlePauseSubscription}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition flex items-center gap-1.5"
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span>Lidmaatschap 30 dagen pauzeren</span>
                  </button>

                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/60 text-rose-300 text-xs font-mono transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Lidmaatschap stopzetten</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Stichting Cambiar • Private Gym & PT Studio</span>
          <span>PWA Versie 1.0 (Standaard ingelogd)</span>
        </div>

      </div>
    </div>
  );
};
