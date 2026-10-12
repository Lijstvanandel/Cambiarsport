import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  CalendarDays,
  RotateCcw
} from 'lucide-react';
import { TimeSlot, MemberSubscription } from '../types';
import { useAuth } from '../context/AuthContext';
import { SINGLE_HOUR_PRICE, formatDutchDate, getLocalDateString } from '../data/gymData';

interface SlotBookingCalendarProps {
  slots: TimeSlot[];
  onSelectSlotToBook: (slot: TimeSlot) => void;
  userBookedSlotIds: string[];
  subscription: MemberSubscription | null;
  onOpenBookings: () => void;
  onOpenAdmin?: () => void;
}

export const SlotBookingCalendar: React.FC<SlotBookingCalendarProps> = ({
  slots,
  onSelectSlotToBook,
  userBookedSlotIds,
  subscription,
  onOpenBookings,
  onOpenAdmin,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getLocalDateString(today), [today]);

  // Date navigation offset (number of days from today)
  const [startDateOffset, setStartDateOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDayPart, setSelectedDayPart] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Number of visible days in horizontal strip
  const VISIBLE_DAYS_COUNT = 7;
  const MAX_DAYS_IN_FUTURE = 90;

  // Generate the currently visible window of dates based on startDateOffset
  const visibleDates = useMemo(() => {
    return Array.from({ length: VISIBLE_DAYS_COUNT }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + startDateOffset + i);
      const dateStr = getLocalDateString(d);
      const totalOffsetFromToday = startDateOffset + i;

      let dayName = d.toLocaleDateString('nl-NL', { weekday: 'short' });
      if (totalOffsetFromToday === 0) dayName = 'Vandaag';
      else if (totalOffsetFromToday === 1) dayName = 'Morgen';

      return {
        dateStr,
        dayName,
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('nl-NL', { month: 'short' }),
        fullDateDutch: d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }),
      };
    });
  }, [today, startDateOffset]);

  // Navigation handlers
  const handlePrevDays = () => {
    setStartDateOffset((prev) => Math.max(0, prev - VISIBLE_DAYS_COUNT));
  };

  const handleNextDays = () => {
    setStartDateOffset((prev) => Math.min(MAX_DAYS_IN_FUTURE - VISIBLE_DAYS_COUNT, prev + VISIBLE_DAYS_COUNT));
  };

  const handleResetToToday = () => {
    setStartDateOffset(0);
    setSelectedDate(todayStr);
  };

  const handleDirectDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedDate = e.target.value;
    if (!pickedDate) return;

    const pickedTime = new Date(pickedDate + 'T00:00:00').getTime();
    const todayTime = new Date(todayStr + 'T00:00:00').getTime();
    const diffDays = Math.max(0, Math.floor((pickedTime - todayTime) / (1000 * 60 * 60 * 24)));

    setStartDateOffset(diffDays);
    setSelectedDate(pickedDate);
  };

  // Helper to dynamically generate fallback hourly slots for any future date if not in master list
  const getSlotsForDate = (dateString: string): TimeSlot[] => {
    const existing = slots.filter((s) => s.date === dateString);
    if (existing.length > 0) return existing;

    // Dynamically generate standard slots 06:00 to 22:00
    const hours = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00',
    ];

    return hours.map((startHour) => {
      const endHourNum = parseInt(startHour.split(':')[0], 10) + 1;
      const endHour = `${endHourNum.toString().padStart(2, '0')}:00`;

      return {
        id: `slot_${dateString}_${startHour.replace(':', '')}`,
        date: dateString,
        startTime: startHour,
        endTime: endHour,
        durationMinutes: 60,
        isAvailable: true,
        price: SINGLE_HOUR_PRICE,
      };
    });
  };

  // Filter slots for currently selected date and day part
  const activeDateSlots = useMemo(() => {
    const dateSlots = getSlotsForDate(selectedDate);

    return dateSlots.filter((slot) => {
      const hourNum = parseInt(slot.startTime.split(':')[0], 10);
      if (selectedDayPart === 'morning') return hourNum >= 6 && hourNum < 12;
      if (selectedDayPart === 'afternoon') return hourNum >= 12 && hourNum < 17;
      if (selectedDayPart === 'evening') return hourNum >= 17 && hourNum <= 23;
      return true;
    });
  }, [slots, selectedDate, selectedDayPart]);

  const availableCount = activeDateSlots.filter(
    (s) => s.isAvailable && !userBookedSlotIds.includes(s.id)
  ).length;

  const isTodayActive = selectedDate === todayStr;

  return (
    <section id="slots" className="py-16 sm:py-24 bg-zinc-950 border-b border-zinc-900 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              01 &bull; Reserveringen
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              Kies Jouw 1-Uurs Tijdslot
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Selecteer een gewenste datum en een vrij uur. Elk slot betreft 60 minuten exclusieve toegang tot de gehele studio.
            </p>
          </div>

          {subscription && subscription.status === 'active' && (
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-3 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-semibold text-white block">{subscription.planName}</span>
                <span className="text-zinc-400 block text-[11px] font-mono">
                  {subscription.monthlyHours === 'onbeperkt' 
                    ? 'Onbeperkt credits beschikbaar' 
                    : `${subscription.remainingHoursThisMonth} uur tegoed over deze maand`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Date Selector Header & Future Date Controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase tracking-wider text-zinc-300 font-bold">
                Selecteer een dag
              </span>
              {!isTodayActive && (
                <button
                  onClick={handleResetToToday}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-sky-400 text-[11px] font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Vandaag</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">
                {availableCount} vrije uren beschikbaar
              </span>

              {/* Direct Calendar Date Picker input */}
              <div className="relative flex items-center">
                <label 
                  htmlFor="calendar-picker"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                  title="Kies een specifieke datum in de toekomst"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kies datum</span>
                </label>
                <input
                  id="calendar-picker"
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={handleDirectDateChange}
                  className="sr-only"
                />
              </div>
            </div>
          </div>

          {/* Horizontal Date Strip with Left & Right Arrows */}
          <div className="relative flex items-center gap-1.5 sm:gap-2">
            
            {/* Left Chevron Button */}
            <button
              onClick={handlePrevDays}
              disabled={startDateOffset <= 0}
              className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center transition flex-shrink-0 cursor-pointer min-h-[44px] min-w-[40px] sm:min-w-[44px] ${
                startDateOffset <= 0
                  ? 'bg-zinc-900/30 border-zinc-900 text-zinc-700 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200 hover:border-zinc-700 shadow-md'
              }`}
              title="Vorige dagen"
              aria-label="Vorige dagen"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Date items strip */}
            <div className="flex-1 grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
              {visibleDates.map((item) => {
                const isSelected = item.dateStr === selectedDate;
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer select-none min-h-[48px] flex flex-col justify-center items-center ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 border-white shadow-lg font-bold scale-[1.02]'
                        : 'bg-zinc-900/70 border-zinc-850 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] uppercase block tracking-wider font-mono truncate max-w-full">
                      {item.dayName}
                    </span>
                    <span className={`text-base sm:text-xl font-black block font-['Cabinet_Grotesk'] my-0.5 leading-none ${isSelected ? 'text-zinc-950' : 'text-zinc-100'}`}>
                      {item.dayNumber}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] block font-mono ${isSelected ? 'text-zinc-700 font-bold' : 'text-zinc-500'}`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Chevron Button */}
            <button
              onClick={handleNextDays}
              disabled={startDateOffset >= MAX_DAYS_IN_FUTURE}
              className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center transition flex-shrink-0 cursor-pointer min-h-[44px] min-w-[40px] sm:min-w-[44px] ${
                startDateOffset >= MAX_DAYS_IN_FUTURE
                  ? 'bg-zinc-900/30 border-zinc-900 text-zinc-700 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200 hover:border-zinc-700 shadow-md'
              }`}
              title="Volgende dagen in de toekomst (+7 dagen)"
              aria-label="Volgende dagen"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Daypart Filter Pills & Selected Date Label */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedDayPart('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                selectedDayPart === 'all'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850'
              }`}
            >
              Alle Uren (06:00 - 23:00)
            </button>
            <button
              onClick={() => setSelectedDayPart('morning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                selectedDayPart === 'morning'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850'
              }`}
            >
              Ochtend (06:00 - 12:00)
            </button>
            <button
              onClick={() => setSelectedDayPart('afternoon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                selectedDayPart === 'afternoon'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850'
              }`}
            >
              Middag (12:00 - 17:00)
            </button>
            <button
              onClick={() => setSelectedDayPart('evening')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                selectedDayPart === 'evening'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850'
              }`}
            >
              Avond (17:00 - 23:00)
            </button>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            {formatDutchDate(selectedDate)}
          </span>
        </div>

        {/* Hourly Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeDateSlots.map((slot) => {
            const isUserBooked = userBookedSlotIds.includes(slot.id);
            const isBooked = !slot.isAvailable || isUserBooked;

            if (isUserBooked) {
              return (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-mono">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Jouw Uur
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">
                      60 min. exclusief gereserveerd
                    </span>
                  </div>

                  <button
                    onClick={onOpenBookings}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold hover:bg-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Toon PIN</span>
                  </button>
                </div>
              );
            }

            if (isBooked) {
              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl flex items-center justify-between transition ${
                    isAdmin
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-zinc-900/30 border border-zinc-900/80 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold font-mono ${isAdmin ? 'text-amber-200' : 'text-zinc-500'}`}>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          Geboekt door lid
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] block mt-0.5 ${isAdmin ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {isAdmin ? 'Bekijk details in Beheerder Portaal' : 'Niet beschikbaar (Exclusief bezet)'}
                    </span>
                  </div>

                  {isAdmin ? (
                    <button
                      onClick={onOpenAdmin}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono transition flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-600 font-medium px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-900 font-mono">
                      Bezet
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-zinc-100 font-mono group-hover:text-white">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      Vrij
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">
                    {subscription && subscription.status === 'active' 
                      ? 'Inbegrepen in lidmaatschap' 
                      : `Los uur: €${slot.price.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>

                <button
                  onClick={() => onSelectSlotToBook(slot)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-mono transition shadow-sm cursor-pointer"
                >
                  Reserveer
                </button>
              </div>
            );
          })}
        </div>

        {/* Studio Rules Micro-Notice */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>
              <strong>100% Privacy Garantie:</strong> Na reservering werkt het smart lock uitsluitend voor jou gedurende dit tijdslot.
            </span>
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">
            Tot 2 uur van tevoren kosteloos annuleren
          </span>
        </div>

      </div>
    </section>
  );
};
