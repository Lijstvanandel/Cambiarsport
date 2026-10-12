import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Repeat,
  CalendarDays,
  Check,
  AlertCircle
} from 'lucide-react';
import { TimeSlot, SlotBooking, MemberSubscription } from '../types';
import { formatDutchDate, getLocalDateString } from '../data/gymData';

interface BookingModalProps {
  slot: TimeSlot;
  onClose: () => void;
  onBookingConfirmed: (newBooking: SlotBooking) => void;
  onMultipleBookingsConfirmed?: (newBookings: SlotBooking[]) => void;
  subscription: MemberSubscription | null;
  defaultEmail?: string;
  defaultName?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  slot,
  onClose,
  onBookingConfirmed,
  onMultipleBookingsConfirmed,
  subscription,
  defaultEmail = '',
  defaultName = '',
}) => {
  const [userName, setUserName] = useState(defaultName);
  const [userEmail, setUserEmail] = useState(defaultEmail);
  const [userPhone, setUserPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState<'membership' | 'stripe'>(
    subscription && subscription.status === 'active' ? 'membership' : 'stripe'
  );

  // Multi-week repeat options
  const [includeWeek2, setIncludeWeek2] = useState<boolean>(false);
  const [includeWeek3, setIncludeWeek3] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingsList, setConfirmedBookingsList] = useState<SlotBooking[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasActiveSub = subscription && subscription.status === 'active';

  // Calculate upcoming 2 weeks dates
  const { week2DateStr, week3DateStr, week2Display, week3Display } = useMemo(() => {
    const parts = slot.date.split('-');
    const baseDate = parts.length === 3
      ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      : new Date(slot.date);

    const w2 = new Date(baseDate);
    w2.setDate(w2.getDate() + 7);
    const w2Str = getLocalDateString(w2);

    const w3 = new Date(baseDate);
    w3.setDate(w3.getDate() + 14);
    const w3Str = getLocalDateString(w3);

    return {
      week2DateStr: w2Str,
      week3DateStr: w3Str,
      week2Display: formatDutchDate(w2Str),
      week3Display: formatDutchDate(w3Str),
    };
  }, [slot.date]);

  // Total slots to book
  const slotsToBookList = useMemo(() => {
    const list = [
      {
        slotId: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: `Deze week (${formatDutchDate(slot.date)})`,
      },
    ];

    if (includeWeek2) {
      list.push({
        slotId: `slot_${week2DateStr}_${slot.startTime.replace(':', '')}`,
        date: week2DateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: `Volgende week (${week2Display})`,
      });
    }

    if (includeWeek3) {
      list.push({
        slotId: `slot_${week3DateStr}_${slot.startTime.replace(':', '')}`,
        date: week3DateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: `Over 2 weken (${week3Display})`,
      });
    }

    return list;
  }, [slot, includeWeek2, includeWeek3, week2DateStr, week3DateStr, week2Display, week3Display]);

  const totalSlotsCount = slotsToBookList.length;
  const totalPrice = totalSlotsCount * slot.price;

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setErrorMsg('Vul alsjeblieft je naam en e-mailadres in.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/bookings/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotsToBook: slotsToBookList.map((s) => ({
            slotId: s.slotId,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
          userName: userName.trim(),
          userEmail: userEmail.trim(),
          userPhone: userPhone.trim() || undefined,
          notes: notes.trim() || undefined,
          paidVia: paymentOption === 'membership' ? 'Lidmaatschap' : 'iDEAL',
          amountPaidPerSlot: paymentOption === 'membership' ? 0 : slot.price,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Reservering mislukt');
      }

      const resData = await response.json();
      const createdBookings: SlotBooking[] = resData.bookings;

      setConfirmedBookingsList(createdBookings);

      // Notify parent app
      if (createdBookings.length > 0) {
        onBookingConfirmed(createdBookings[0]);
        if (onMultipleBookingsConfirmed && createdBookings.length > 1) {
          onMultipleBookingsConfirmed(createdBookings);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Er is een fout opgetreden bij het vastleggen van je uren.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-6 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-900 bg-zinc-950">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Privé Gym Studio Cambiar</span>
            </span>
            <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
              {confirmedBookingsList ? 'Reservering Bevestigd!' : 'Tijdslot Reserveren'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!confirmedBookingsList ? (
          <form onSubmit={handleConfirmReservation} className="p-5 sm:p-6 space-y-5">
            
            {/* Slot Summary Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-850 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>{slot.startTime} - {slot.endTime} (60 min)</span>
                </div>
                <span className="text-xs text-zinc-300 font-mono">
                  {formatDutchDate(slot.date)}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>100% Privé: de studio is gedurende dit hele uur exclusief voor jou.</span>
              </div>
            </div>

            {/* MULTI-WEEK RECURRING BOOKING PROPOSAL BOX */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-sky-500/30 space-y-3.5 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Vast wekelijks uur reserveren?
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Boek direct hetzelfde tijdstip voor de komende 2 weken
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[9px] font-mono uppercase font-bold border border-sky-500/30">
                  Aanbevolen
                </span>
              </div>

              {/* Repeat options checkboxes */}
              <div className="space-y-2 pt-1 text-xs font-mono">
                {/* Week 1 (Always checked) */}
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Week 1 (Gekozen): <strong>{formatDutchDate(slot.date)}</strong></span>
                  </div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Vast</span>
                </div>

                {/* Week 2 (+7 Days) */}
                <label className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900/80 border border-zinc-800 hover:border-sky-500/40 flex items-center justify-between transition cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeWeek2}
                      onChange={(e) => setIncludeWeek2(e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-sky-500 focus:ring-0 cursor-pointer accent-sky-500"
                    />
                    <span className={includeWeek2 ? 'text-white font-bold' : 'text-zinc-400'}>
                      Week 2 (+7 dgn): <strong>{week2Display}</strong> ({slot.startTime})
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono">
                    {includeWeek2 ? 'Geselecteerd' : '+ Toevoegen'}
                  </span>
                </label>

                {/* Week 3 (+14 Days) */}
                <label className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900/80 border border-zinc-800 hover:border-sky-500/40 flex items-center justify-between transition cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeWeek3}
                      onChange={(e) => setIncludeWeek3(e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-sky-500 focus:ring-0 cursor-pointer accent-sky-500"
                    />
                    <span className={includeWeek3 ? 'text-white font-bold' : 'text-zinc-400'}>
                      Week 3 (+14 dgn): <strong>{week3Display}</strong> ({slot.startTime})
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono">
                    {includeWeek3 ? 'Geselecteerd' : '+ Toevoegen'}
                  </span>
                </label>
              </div>

              {totalSlotsCount > 1 && (
                <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/50 text-[11px] font-mono text-sky-300 flex items-center justify-between">
                  <span>Totaal geselecteerd:</span>
                  <span className="font-bold">{totalSlotsCount} uur op vast tijdstip ({slot.startTime} - {slot.endTime})</span>
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* User Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Volledige Naam
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Bijv. Mark de Jong"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  E-mailadres (voor toegangscode & PIN)
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="mark@domein.nl"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Telefoonnummer (optioneel voor SMS-sleutel)
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="06 12345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Payment / Credit Selection */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-xs font-mono uppercase text-zinc-400">
                Betalingswijze
              </label>

              {hasActiveSub ? (
                <div
                  onClick={() => setPaymentOption('membership')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentOption === 'membership'
                      ? 'bg-zinc-900 border-zinc-600 text-white'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-semibold block">Verzilver Maandtegoed</span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {subscription.planName} &bull; {totalSlotsCount} {totalSlotsCount === 1 ? 'uur' : 'uren'} afboeken
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">€0,00</span>
                </div>
              ) : (
                <div
                  onClick={() => setPaymentOption('stripe')}
                  className="p-3.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-4 h-4 text-zinc-300" />
                    <div>
                      <span className="font-semibold block">
                        {totalSlotsCount === 1 ? 'Los Uur Boeken (iDEAL / Card)' : `${totalSlotsCount} Wekelijkse Uren Boeken`}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {totalSlotsCount} x €{slot.price.toFixed(2).replace('.', ',')} &bull; Stripe Checkout
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">
                    €{totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-zinc-950 font-black text-xs font-mono uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Reservering verwerken in SQLite...</span>
                ) : (
                  <>
                    <span>
                      {paymentOption === 'membership'
                        ? totalSlotsCount === 1
                          ? 'Bevestig 1 Privé-Uur'
                          : `Bevestig ${totalSlotsCount} Wekelijkse Uren (${totalSlotsCount} credits)`
                        : totalSlotsCount === 1
                        ? `Betaal €${slot.price.toFixed(2).replace('.', ',')} & Ontvang PIN`
                        : `Betaal €${totalPrice.toFixed(2).replace('.', ',')} voor ${totalSlotsCount} Weken`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Confirmation State with Smart Door PINs */
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                {confirmedBookingsList.length > 1
                  ? `${confirmedBookingsList.length} Wekelijkse Uren Vastgelegd!`
                  : 'Je Privé Gym Uur Staat Vast'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                De gehele studio is exclusief voor jou gereserveerd. Je Smart Door PIN-codes zijn direct geactiveerd.
              </p>
            </div>

            {/* List of Bookings & PINs */}
            <div className="space-y-3">
              {confirmedBookingsList.map((b, idx) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-sky-400">
                      Week {idx + 1}
                    </span>
                    <div className="text-xs font-bold text-white font-mono">
                      {formatDutchDate(b.date)} &bull; {b.startTime} - {b.endTime}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-zinc-500 block">Deurslot PIN</span>
                    <span className="text-lg font-black font-mono text-amber-400 tracking-wider">
                      {b.accessPin}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-400 font-mono">
              Toets de 4 cijfers + # in op het slot bij de studio-ingang tijdens jouw gereserveerde tijdslot.
            </p>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-mono uppercase transition cursor-pointer"
              >
                Sluiten
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
