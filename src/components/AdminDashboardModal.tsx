import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Calendar,
  KeyRound,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Edit2,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  PlayCircle,
  Lock,
  Eye,
  Mail,
  Phone,
  Euro,
  Layers,
  ChevronRight,
  LogOut,
  History,
  RotateCcw,
  FileText,
  XCircle,
  Check,
  CalendarCheck,
  CalendarX,
  UserCheck,
  Filter,
  ArrowUpRight,
  Film
} from 'lucide-react';
import { CambiarLogo } from './CambiarLogo';
import { useAuth } from '../context/AuthContext';
import { AdminUserSummary, SlotBooking, HeroVideoSettings } from '../types';
import { formatDutchDate } from '../data/gymData';
import { HeroVideoAdminTab } from './HeroVideoAdminTab';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendar: () => void;
  onHeroVideoSettingsChange?: (newSettings: HeroVideoSettings) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenCalendar,
  onHeroVideoSettingsChange,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'stats' | 'hero_video'>('users');
  const [usersList, setUsersList] = useState<AdminUserSummary[]>([]);
  const [allBookings, setAllBookings] = useState<SlotBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit user modal/drawer inside admin
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [editPlanId, setEditPlanId] = useState<string>('plan_8h');
  const [editHours, setEditHours] = useState<number>(8);
  const [editStatus, setEditStatus] = useState<'active' | 'paused' | 'cancelled'>('active');

  // Dedicated Add Hours modal state
  const [addingHoursUser, setAddingHoursUser] = useState<AdminUserSummary | null>(null);
  const [customHoursToAdd, setCustomHoursToAdd] = useState<number>(2);
  const [hoursReason, setHoursReason] = useState<string>('');
  const [isSubmittingHours, setIsSubmittingHours] = useState<boolean>(false);

  // Dedicated User Booking & Hours History modal state
  const [viewingUserHistory, setViewingUserHistory] = useState<AdminUserSummary | null>(null);
  const [userHistoryFilter, setUserHistoryFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  // Global Bookings Log Filter states
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    'all' | 'upcoming' | 'past' | 'cancelled' | 'cancelled_user' | 'cancelled_admin'
  >('all');
  const [bookingUserFilter, setBookingUserFilter] = useState<string>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/all-bookings'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setAllBookings(bookingsData);
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Helper for booking status classification
  const getBookingMeta = (b: SlotBooking) => {
    const isCancelled = b.status === 'cancelled';
    const cleanEndTime = b.endTime.length === 5 ? b.endTime : `0${b.endTime}`;
    const slotDateTime = new Date(`${b.date}T${cleanEndTime}:00`);
    const isPast = !isCancelled && slotDateTime.getTime() < Date.now();
    const isUpcoming = !isCancelled && !isPast;
    const cancelledBy = b.cancelledBy || 'gebruiker';

    return {
      isCancelled,
      isPast,
      isUpcoming,
      cancelledBy,
      cancelledAt: b.cancelledAt,
    };
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterPlan === 'all') return true;
    if (filterPlan === 'none') return !u.subscription || u.subscription.status === 'cancelled';
    if (filterPlan === 'active') return u.subscription && u.subscription.status === 'active';
    if (filterPlan === 'plan_4h') return u.subscription?.planId === 'plan_4h';
    if (filterPlan === 'plan_8h') return u.subscription?.planId === 'plan_8h';
    if (filterPlan === 'plan_unlimited') return u.subscription?.planId === 'plan_unlimited';

    return true;
  });

  // Filtered global bookings
  const filteredBookings = allBookings.filter((b) => {
    const meta = getBookingMeta(b);

    // User email filter
    if (bookingUserFilter !== 'all' && b.userEmail.toLowerCase() !== bookingUserFilter.toLowerCase()) {
      return false;
    }

    // Search query filter (name, email, pin, date, notes)
    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      const matches =
        b.userName.toLowerCase().includes(q) ||
        b.userEmail.toLowerCase().includes(q) ||
        b.accessPin.toLowerCase().includes(q) ||
        b.date.includes(q) ||
        (b.userPhone && b.userPhone.includes(q)) ||
        (b.notes && b.notes.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Status filter
    if (bookingStatusFilter === 'upcoming') return meta.isUpcoming;
    if (bookingStatusFilter === 'past') return meta.isPast;
    if (bookingStatusFilter === 'cancelled') return meta.isCancelled;
    if (bookingStatusFilter === 'cancelled_user') return meta.isCancelled && meta.cancelledBy === 'gebruiker';
    if (bookingStatusFilter === 'cancelled_admin') return meta.isCancelled && meta.cancelledBy === 'beheerder';

    return true;
  });

  // Calculate totals
  const totalRegistered = usersList.length;
  const activeSubsCount = usersList.filter(u => u.subscription?.status === 'active').length;
  const totalMRR = usersList
    .filter(u => u.subscription?.status === 'active')
    .reduce((sum, u) => sum + (u.subscription?.price || 0), 0);

  const upcomingBookingsCount = allBookings.filter(b => getBookingMeta(b).isUpcoming).length;
  const pastBookingsCount = allBookings.filter(b => getBookingMeta(b).isPast).length;
  const cancelledBookingsCount = allBookings.filter(b => getBookingMeta(b).isCancelled).length;
  const userCancelledCount = allBookings.filter(b => {
    const m = getBookingMeta(b);
    return m.isCancelled && m.cancelledBy === 'gebruiker';
  }).length;

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: editingUser.email,
          planId: editPlanId,
          remainingHours: editHours,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setActionNotice({
          type: 'success',
          message: `Lidmaatschap van ${editingUser.name} is succesvol bijgewerkt!`,
        });
        setEditingUser(null);
        await loadAdminData();
      }
    } catch (e: any) {
      setActionNotice({ type: 'error', message: 'Fout bij opslaan' });
    }
  };

  const handleAddHoursQuick = async (userEmail: string, userName: string, hoursToAdd: number, reason?: string) => {
    try {
      const res = await fetch('/api/admin/add-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          hoursToAdd,
          reason: reason || 'Handmatige toevoeging door beheerder',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionNotice({
          type: 'success',
          message: `✅ +${hoursToAdd} uur succesvol toegekend aan ${userName}! Nieuw tegoed: ${data.subscription?.remainingHoursThisMonth}u`,
        });
        await loadAdminData();
      } else {
        const err = await res.json();
        setActionNotice({ type: 'error', message: err.error || 'Fout bij toevoegen van uren' });
      }
    } catch (e: any) {
      setActionNotice({ type: 'error', message: 'Fout bij verbinden met server' });
    }
  };

  const handleSubmitCustomHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingHoursUser) return;
    setIsSubmittingHours(true);
    try {
      const res = await fetch('/api/admin/add-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: addingHoursUser.email,
          hoursToAdd: customHoursToAdd,
          reason: hoursReason || 'Handmatig toegekend door beheerder',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionNotice({
          type: 'success',
          message: `✅ ${customHoursToAdd > 0 ? '+' : ''}${customHoursToAdd} uur toegekend aan ${addingHoursUser.name}. Nieuw saldo: ${data.subscription?.remainingHoursThisMonth} uur.`,
        });
        setAddingHoursUser(null);
        setHoursReason('');
        await loadAdminData();
      } else {
        const err = await res.json();
        setActionNotice({ type: 'error', message: err.error || 'Fout bij toevoegen' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: 'Fout bij opslaan van uren' });
    } finally {
      setIsSubmittingHours(false);
    }
  };

  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Weet je zeker dat je deze reservering als beheerder wilt annuleren? Het tijdslot wordt vrijgegeven en het urentegoed wordt teruggestort.')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelledBy: 'beheerder' }),
      });
      if (res.ok) {
        setActionNotice({
          type: 'success',
          message: 'Tijdslot succesvol geannuleerd en direct weer vrijgegeven in de agenda.',
        });
        await loadAdminData();
      }
    } catch (e) {
      setActionNotice({ type: 'error', message: 'Fout bij annuleren van boeking' });
    }
  };

  // User bookings for drilling down
  const userSpecificBookings = viewingUserHistory
    ? allBookings.filter(
        b => b.userEmail.toLowerCase() === viewingUserHistory.email.toLowerCase()
      )
    : [];

  const filteredUserSpecificBookings = userSpecificBookings.filter((b) => {
    const meta = getBookingMeta(b);
    if (userHistoryFilter === 'upcoming') return meta.isUpcoming;
    if (userHistoryFilter === 'past') return meta.isPast;
    if (userHistoryFilter === 'cancelled') return meta.isCancelled;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-zinc-950 border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Admin Header Bar */}
        <div className="p-5 sm:p-6 border-b border-zinc-900 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Cabinet_Grotesk']">
                  Cambiar Beheerdersportaal
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono uppercase font-bold">
                  Admin Toegang
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Overzicht van alle accounts, actieve abonnementen, urenbeheer & historisch boekingenlogboek
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition cursor-pointer"
              title="Vernieuwen"
            >
              Vernieuwen
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
              title="Uitloggen als beheerder"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Uitloggen</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-6 bg-zinc-900/40 border-b border-zinc-900">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Geregistreerde Accounts</span>
            <div className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] mt-0.5">
              {totalRegistered}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">In SQLite database</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-sky-400 block">Actieve Abonnementen</span>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-['Cabinet_Grotesk'] mt-0.5">
              {activeSubsCount}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Maandelijks opzegbaar</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block">Maandelijkse Omzet (MRR)</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-['Cabinet_Grotesk'] mt-0.5">
              €{totalMRR.toFixed(2)}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Terugkerende contributie</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-amber-400 block">Aankomende Uren</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-['Cabinet_Grotesk'] mt-0.5">
              {upcomingBookingsCount}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {cancelledBookingsCount} ingetrokken / {pastBookingsCount} verleden
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-900 bg-zinc-950 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Accounts & Abonnementen ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Geboekte Uren & Historisch Logboek ({allBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Beveiliging & Smart Lock</span>
          </button>

          <button
            onClick={() => setActiveTab('hero_video')}
            className={`pb-3 px-3 text-xs font-mono transition border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'hero_video'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Hero Achtergrond Video (.mp4)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              Media
            </span>
          </button>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: USERS & SUBSCRIPTION LIST */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Zoek gebruiker op naam, e-mail of telefoon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="all">Alle Accounts</option>
                    <option value="active">Alleen Actieve Leden</option>
                    <option value="plan_4h">Cambiar Flex 4 (€69)</option>
                    <option value="plan_8h">Cambiar Flex 8 (€119)</option>
                    <option value="plan_unlimited">Cambiar Unlimited (€199)</option>
                    <option value="none">Geen Abonnement</option>
                  </select>
                </div>
              </div>

              {/* Users Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((u) => {
                  const sub = u.subscription;
                  const hasActiveSub = sub && sub.status === 'active';
                  const isUnlimited = sub?.monthlyHours === 'onbeperkt';

                  // Calculate user specific booking numbers
                  const userBookings = allBookings.filter(
                    b => b.userEmail.toLowerCase() === u.email.toLowerCase()
                  );
                  const activeUpcoming = userBookings.filter(b => getBookingMeta(b).isUpcoming).length;
                  const pastBookings = userBookings.filter(b => getBookingMeta(b).isPast).length;
                  const cancelledBookings = userBookings.filter(b => getBookingMeta(b).isCancelled).length;

                  return (
                    <div
                      key={u.id}
                      className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition space-y-4"
                    >
                      {/* Top user row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                              {u.name}
                            </h4>
                            {u.role === 'admin' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono">
                                Beheerder
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                                Klant
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5 text-xs text-zinc-400 font-mono mt-1">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-zinc-500" />
                              {u.email}
                            </span>
                            {u.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-zinc-500" />
                                {u.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-zinc-500">
                          Sinds {u.memberSince}
                        </span>
                      </div>

                      {/* Subscription Status Box */}
                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-zinc-400">
                            Abonnement
                          </span>
                          {hasActiveSub ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
                              Actief Lid
                            </span>
                          ) : sub?.status === 'paused' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold">
                              Gepauzeerd
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono">
                              Geen actief lidmaatschap
                            </span>
                          )}
                        </div>

                        {sub ? (
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white flex items-center justify-between">
                              <span>{sub.planName}</span>
                              <span className="text-zinc-300 font-mono text-xs">€{sub.price}/mnd</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                              <span>Resterend tegoed:</span>
                              <span className="text-amber-300 font-bold">
                                {isUnlimited ? 'Onbeperkt' : `${sub.remainingHoursThisMonth} / ${sub.monthlyHours} uur`}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500 pt-1">
                              Volgende facturatie: {sub.nextBillingDate}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">
                            Deze gebruiker boekt per los uur of heeft nog geen lidmaatschap gekozen.
                          </p>
                        )}
                      </div>

                      {/* Quick Hours Actions Strip */}
                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] font-mono font-bold text-zinc-300">
                            Uren toevoegen:
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          <button
                            onClick={() => handleAddHoursQuick(u.email, u.name, 1, 'Quick +1 uur beheerder')}
                            className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition flex items-center gap-0.5 cursor-pointer"
                            title="Direct 1 uur bijschrijven"
                          >
                            <Plus className="w-3 h-3" />
                            <span>1u</span>
                          </button>
                          <button
                            onClick={() => handleAddHoursQuick(u.email, u.name, 2, 'Quick +2 uur beheerder')}
                            className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition flex items-center gap-0.5 cursor-pointer"
                            title="Direct 2 uur bijschrijven"
                          >
                            <Plus className="w-3 h-3" />
                            <span>2u</span>
                          </button>
                          <button
                            onClick={() => handleAddHoursQuick(u.email, u.name, 4, 'Quick +4 uur beheerder')}
                            className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition flex items-center gap-0.5 cursor-pointer"
                            title="Direct 4 uur bijschrijven"
                          >
                            <Plus className="w-3 h-3" />
                            <span>4u</span>
                          </button>
                          <button
                            onClick={() => {
                              setAddingHoursUser(u);
                              setCustomHoursToAdd(2);
                              setHoursReason('Compensatie / Cadeau beheerder');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-mono font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Aangepast aantal uren toevoegen"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Aangepast...</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Footer Actions & User Drill-down Button */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 border-t border-zinc-850 gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                          <span className="text-sky-300 font-bold">{activeUpcoming} actief</span>
                          <span>&bull;</span>
                          <span className="text-zinc-500">{pastBookings} verleden</span>
                          {cancelledBookings > 0 && (
                            <>
                              <span>&bull;</span>
                              <span className="text-rose-400 font-bold">{cancelledBookings} ingetrokken</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setViewingUserHistory(u);
                              setUserHistoryFilter('all');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 text-sky-300 text-xs font-mono transition flex items-center gap-1 cursor-pointer"
                            title="Bekijk alle geboekte en ingetrokken uren van deze gebruiker"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Boekingshistorie</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditPlanId(u.subscription?.planId || 'plan_8h');
                              setEditHours(
                                typeof u.subscription?.remainingHoursThisMonth === 'number'
                                  ? u.subscription.remainingHoursThisMonth
                                  : 8
                              );
                              setEditStatus(u.subscription?.status || 'active');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-mono transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-amber-400" />
                            <span>Abonnement</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: STUDIO BOOKINGS & COMPLETE HISTORICAL AUDIT LOG */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                    <span>Volledig Boekingen- & Intrekkingen Logboek</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold">
                      {filteredBookings.length} / {allBookings.length} tijdsloten
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Bekijk actuele, historische en door gebruikers of beheerder ingetrokken uren, inclusief tijdstip van annulering en Smart PIN.
                  </p>
                </div>

                <button
                  onClick={onOpenCalendar}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bekijk Studio Kalender</span>
                </button>
              </div>

              {/* Advanced Filter Toolbar */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setBookingStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      bookingStatusFilter === 'all'
                        ? 'bg-amber-400 text-zinc-950 shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    Alle Uren ({allBookings.length})
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter('upcoming')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bookingStatusFilter === 'upcoming'
                        ? 'bg-emerald-400 text-zinc-950 shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-emerald-300 border border-zinc-800'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Aankomend / Actief ({upcomingBookingsCount})</span>
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter('past')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bookingStatusFilter === 'past'
                        ? 'bg-zinc-200 text-zinc-950 shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Historie (Verleden) ({pastBookingsCount})</span>
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter('cancelled')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      bookingStatusFilter === 'cancelled'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-rose-300 border border-zinc-800'
                    }`}
                  >
                    <CalendarX className="w-3.5 h-3.5" />
                    <span>Ingetrokken / Geannuleerd ({cancelledBookingsCount})</span>
                  </button>

                  {cancelledBookingsCount > 0 && (
                    <>
                      <button
                        onClick={() => setBookingStatusFilter('cancelled_user')}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition cursor-pointer ${
                          bookingStatusFilter === 'cancelled_user'
                            ? 'bg-rose-950 border border-rose-600 text-rose-200 font-bold'
                            : 'bg-zinc-900/60 text-zinc-400 hover:text-rose-300 border border-zinc-800'
                        }`}
                      >
                        Ingetrokken door Klant ({userCancelledCount})
                      </button>

                      <button
                        onClick={() => setBookingStatusFilter('cancelled_admin')}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition cursor-pointer ${
                          bookingStatusFilter === 'cancelled_admin'
                            ? 'bg-amber-950 border border-amber-600 text-amber-200 font-bold'
                            : 'bg-zinc-900/60 text-zinc-400 hover:text-amber-300 border border-zinc-800'
                        }`}
                      >
                        Geannuleerd door Beheerder ({cancelledBookingsCount - userCancelledCount})
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter op klantnaam, e-mail, PIN-code of datum (JJJJ-MM-DD)..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={bookingUserFilter}
                      onChange={(e) => setBookingUserFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    >
                      <option value="all">Alle Gebruikers</option>
                      {usersList.map((u) => (
                        <option key={u.email} value={u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-12 rounded-2xl bg-zinc-900/30 border border-zinc-850 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-white">Geen boekingen gevonden</p>
                  <p className="text-xs text-zinc-400">
                    Er zijn geen boekingen die overeenkomen met het huidige filter of zoekopdracht.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => {
                    const meta = getBookingMeta(b);

                    return (
                      <div
                        key={b.id}
                        className={`p-5 rounded-2xl border transition space-y-3.5 relative ${
                          meta.isCancelled
                            ? 'bg-zinc-950/80 border-rose-900/40 opacity-80'
                            : meta.isPast
                            ? 'bg-zinc-900/50 border-zinc-800'
                            : 'bg-zinc-900/80 border-zinc-750 shadow-md'
                        }`}
                      >
                        {/* Booking slot header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider block">
                              Gereserveerd Tijdslot
                            </span>
                            <div className="text-base font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                              <Clock className="w-4 h-4 text-sky-400" />
                              <span>{formatDutchDate(b.date)} &bull; {b.startTime} - {b.endTime}</span>
                            </div>
                          </div>

                          {/* Dynamic Badge */}
                          {meta.isCancelled ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/90 border border-rose-800 text-rose-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Ingetrokken ({meta.cancelledBy})</span>
                            </span>
                          ) : meta.isPast ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center gap-1">
                              <History className="w-3 h-3" />
                              <span>Voltooid (Verleden)</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/90 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Aankomend</span>
                            </span>
                          )}
                        </div>

                        {/* Customer Details Box (Visible to Admin Only) */}
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-mono text-[10px] uppercase">Geboekt door:</span>
                            <span className="font-mono text-zinc-400 text-[10px]">Via: {b.paidVia}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-bold text-white block font-['Cabinet_Grotesk']">
                                {b.userName || 'Klant'}
                              </span>
                              <span className="text-xs text-zinc-400 font-mono block">
                                {b.userEmail}
                              </span>
                              {b.userPhone && (
                                <span className="text-xs text-zinc-400 font-mono block">
                                  Tel: {b.userPhone}
                                </span>
                              )}
                            </div>

                            {/* Smart Door PIN code */}
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-zinc-500 block">Deurslot PIN</span>
                              <span className={`text-lg font-black font-mono ${
                                meta.isCancelled ? 'text-zinc-600 line-through' : 'text-amber-400'
                              }`}>
                                {b.accessPin}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cancellation Info Banner if cancelled */}
                        {meta.isCancelled && (
                          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-[11px] font-mono text-rose-300 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">❌ Ingetrokken door: {meta.cancelledBy === 'gebruiker' ? 'Klant / Gebruiker' : 'Beheerder'}</span>
                              <span>Tegoed teruggestort</span>
                            </div>
                            {meta.cancelledAt && (
                              <div className="text-zinc-400 text-[10px]">
                                Geannuleerd op: {new Date(meta.cancelledAt).toLocaleString('nl-NL')}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Admin action buttons */}
                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-500 border-t border-zinc-850/60">
                          <span>
                            Gereserveerd op: {new Date(b.createdAt).toLocaleDateString('nl-NL')} {new Date(b.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {meta.isUpcoming && (
                            <button
                              onClick={() => handleAdminCancelBooking(b.id)}
                              className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 text-xs font-mono transition cursor-pointer"
                            >
                              Annuleren & Vrijgeven
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PRIVACY & SYSTEM SPECS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                    Privacy Beveiliging Tussen Klanten Actief
                  </h3>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Het platform waarborgt 100% privacy tussen bezoekers en leden:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                    <span className="text-amber-400 font-bold block">Voor Reguliere Bezoekers & Leden:</span>
                    <p className="text-zinc-400">
                      Zij zien in de agenda uitsluitend de status <strong className="text-zinc-200">"Bezet"</strong>. Namen, e-mails, telefoonnummers en PIN-codes van andere leden zijn volledig afgeschermd.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                    <span className="text-sky-400 font-bold block">Voor Jou Als Beheerder:</span>
                    <p className="text-zinc-400">
                      Jij hebt als enige beheerderstoegang om alle klantgegevens, actieve PIN-codes, geregistreerde accounts, abonnementen en historisch ingetrokken uren in realtime in te zien en te beheren.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: HERO BACKGROUND VIDEO SETTINGS (.mp4) */}
          {activeTab === 'hero_video' && (
            <HeroVideoAdminTab
              onSaved={(newSettings) => {
                setActionNotice({
                  type: 'success',
                  message: 'Achtergrondvideo instellingen succesvol opgeslagen! De homepage is direct bijgewerkt.',
                });
                if (onHeroVideoSettingsChange) {
                  onHeroVideoSettingsChange(newSettings);
                }
              }}
            />
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Stichting Cambiar • Beheerdersinterface v1.0 (SQLite)</span>
          <span>Ingelogd als: {user?.email}</span>
        </div>

      </div>

      {/* SUB-MODAL: PER-USER DRILL-DOWN BOOKINGS & HOUR HISTORY */}
      {viewingUserHistory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl bg-zinc-950 border border-sky-500/40 p-6 space-y-5 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                      Geboekte Uren & Historie van {viewingUserHistory.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {viewingUserHistory.email} {viewingUserHistory.phone && `• ${viewingUserHistory.phone}`}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingUserHistory(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats strip for this user */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 uppercase block">Abonnement</span>
                <span className="font-bold text-white block truncate">
                  {viewingUserHistory.subscription?.planName || 'Geen abonnement'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-850">
                <span className="text-[10px] text-amber-400 uppercase block">Resterend Urentegoed</span>
                <span className="font-bold text-amber-300 block">
                  {viewingUserHistory.subscription?.monthlyHours === 'onbeperkt'
                    ? 'Onbeperkt'
                    : `${viewingUserHistory.subscription?.remainingHoursThisMonth ?? 0} uur`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-850">
                <span className="text-[10px] text-emerald-400 uppercase block">Aankomende Uren</span>
                <span className="font-bold text-emerald-300 block">
                  {userSpecificBookings.filter(b => getBookingMeta(b).isUpcoming).length} uur
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-850">
                <span className="text-[10px] text-rose-400 uppercase block">Ingetrokken Uren</span>
                <span className="font-bold text-rose-300 block">
                  {userSpecificBookings.filter(b => getBookingMeta(b).isCancelled).length} uur
                </span>
              </div>
            </div>

            {/* Sub Filter buttons */}
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <button
                onClick={() => setUserHistoryFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  userHistoryFilter === 'all'
                    ? 'bg-sky-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Alles ({userSpecificBookings.length})
              </button>
              <button
                onClick={() => setUserHistoryFilter('upcoming')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  userHistoryFilter === 'upcoming'
                    ? 'bg-emerald-400 text-zinc-950'
                    : 'bg-zinc-900 text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                Aankomend ({userSpecificBookings.filter(b => getBookingMeta(b).isUpcoming).length})
              </button>
              <button
                onClick={() => setUserHistoryFilter('past')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  userHistoryFilter === 'past'
                    ? 'bg-zinc-200 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Historie ({userSpecificBookings.filter(b => getBookingMeta(b).isPast).length})
              </button>
              <button
                onClick={() => setUserHistoryFilter('cancelled')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  userHistoryFilter === 'cancelled'
                    ? 'bg-rose-500 text-white'
                    : 'bg-zinc-900 text-rose-400/80 hover:text-rose-300'
                }`}
              >
                Ingetrokken ({userSpecificBookings.filter(b => getBookingMeta(b).isCancelled).length})
              </button>
            </div>

            {/* List of user bookings */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredUserSpecificBookings.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-850">
                  <p className="text-xs text-zinc-400">Geen reserveringen gevonden in deze categorie.</p>
                </div>
              ) : (
                filteredUserSpecificBookings.map((b) => {
                  const meta = getBookingMeta(b);

                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border space-y-2.5 transition ${
                        meta.isCancelled
                          ? 'bg-zinc-950 border-rose-900/40'
                          : meta.isPast
                          ? 'bg-zinc-900/40 border-zinc-800'
                          : 'bg-zinc-900/80 border-sky-800/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-400" />
                          <span className="text-sm font-bold text-white font-['Cabinet_Grotesk']">
                            {formatDutchDate(b.date)} &bull; {b.startTime} - {b.endTime}
                          </span>
                        </div>

                        {meta.isCancelled ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
                            Ingetrokken door {meta.cancelledBy}
                          </span>
                        ) : meta.isPast ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400">
                            Voltooid (Verleden)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                            Aankomend Actief
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                        <div>
                          <span>PIN-code: </span>
                          <span className={`font-bold ${meta.isCancelled ? 'line-through text-zinc-600' : 'text-amber-300'}`}>
                            {b.accessPin}
                          </span>
                          <span className="ml-3 text-zinc-500">Via: {b.paidVia}</span>
                        </div>

                        <div className="text-[10px] text-zinc-500">
                          Geboekt: {new Date(b.createdAt).toLocaleDateString('nl-NL')} {new Date(b.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {meta.isCancelled && meta.cancelledAt && (
                        <div className="text-[10px] font-mono text-rose-400 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                          ❌ Ingetrokken op: {new Date(meta.cancelledAt).toLocaleString('nl-NL')} &bull; Uurtegoed hersteld
                        </div>
                      )}

                      {meta.isUpcoming && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleAdminCancelBooking(b.id)}
                            className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 text-xs font-mono transition cursor-pointer"
                          >
                            Annuleren & Tegoed Herstellen
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Close footer */}
            <div className="flex items-center justify-end pt-2 border-t border-zinc-900">
              <button
                onClick={() => setViewingUserHistory(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs cursor-pointer"
              >
                Sluiten
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUB-MODAL: EDIT USER SUBSCRIPTION */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                  Abonnement Aanpassen
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Voor: {editingUser.name} ({editingUser.email})
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Abonnement Type:</label>
                <select
                  value={editPlanId}
                  onChange={(e) => setEditPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="plan_4h">Cambiar Flex 4 (4 uur - €69/mnd)</option>
                  <option value="plan_8h">Cambiar Flex 8 (8 uur - €119/mnd)</option>
                  <option value="plan_unlimited">Cambiar Unlimited (Onbeperkt - €199/mnd)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Resterend Urentegoed deze maand:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={editHours}
                    onChange={(e) => setEditHours(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditHours((prev) => Math.max(0, prev - 1))}
                      className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold cursor-pointer"
                      title="1 uur aftrekken"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditHours((prev) => prev + 1)}
                      className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 font-bold cursor-pointer"
                      title="1 uur toevoegen"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditHours((prev) => prev + 2)}
                      className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 font-bold cursor-pointer"
                      title="2 uur toevoegen"
                    >
                      +2
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="active">Actief</option>
                  <option value="paused">Gepauzeerd</option>
                  <option value="cancelled">Beëindigd</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold cursor-pointer"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADD CUSTOM HOURS TO USER */}
      {addingHoursUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-amber-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                    Uren Toevoegen aan Lid
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {addingHoursUser.name} &bull; {addingHoursUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddingHoursUser(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Huidig saldo tegoed:</span>
              <span className="text-amber-300 font-bold text-sm">
                {addingHoursUser.subscription?.monthlyHours === 'onbeperkt'
                  ? 'Onbeperkt'
                  : `${addingHoursUser.subscription?.remainingHoursThisMonth ?? 0} uur`}
              </span>
            </div>

            <form onSubmit={handleSubmitCustomHours} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-2">
                  Kies of typ het aantal toe te voegen uren:
                </label>
                
                {/* Preset Pills */}
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCustomHoursToAdd(num)}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        customHoursToAdd === num
                          ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                          : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      +{num}u
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={customHoursToAdd}
                    onChange={(e) => setCustomHoursToAdd(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm font-bold focus:outline-none focus:border-amber-400"
                    placeholder="Aantal uren (bijv. 2)"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono">
                    uren
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Reden / Notitie (optioneel):
                </label>
                <input
                  type="text"
                  value={hoursReason}
                  onChange={(e) => setHoursReason(e.target.value)}
                  placeholder="Bijv. Compensatie storing, cadeautegoed, proefles..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-400 placeholder-zinc-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                💡 De uren worden direct bijgeschreven op het account in de SQLite database. De klant kan deze meteen gebruiken voor gratis boekingen in de agenda.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setAddingHoursUser(null)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHours || customHoursToAdd <= 0}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>+{customHoursToAdd} Uur Toevoegen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
