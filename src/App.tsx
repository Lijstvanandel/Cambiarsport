import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StudioPhotos } from './components/StudioPhotos';
import { SlotBookingCalendar } from './components/SlotBookingCalendar';
import { MembershipPlans } from './components/MembershipPlans';
import { Facilities } from './components/Facilities';
import { Reviews } from './components/Reviews';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AuthModal } from './components/AuthModal';
import { MyBookingsDrawer } from './components/MyBookingsDrawer';
import { PWABottomNav } from './components/PWABottomNav';
import { OfflineNotice } from './components/OfflineNotice';
import { generateHourlySlotsForDateRange, MEMBERSHIP_PLANS } from './data/gymData';
import { TimeSlot, SlotBooking, MemberSubscription, MembershipPlan, HeroVideoSettings } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, refreshUser, updateUserSubscription } = useAuth();
  const [heroVideoSettings, setHeroVideoSettings] = useState<HeroVideoSettings | null>(null);

  // Master hourly slots for next 14 days
  const [slots, setSlots] = useState<TimeSlot[]>(() => generateHourlySlotsForDateRange(new Date(), 14));
  
  // User's active 1-hour slot bookings
  const [bookings, setBookings] = useState<SlotBooking[]>([]);

  // Modals & Drawers state
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<TimeSlot | null>(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<MembershipPlan | null>(null);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('concept');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [heroVideoKey, setHeroVideoKey] = useState<number>(0);

  // Fetch initial bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const isAdmin = user?.role === 'admin';
        const url = isAdmin 
          ? '/api/bookings?admin=true' 
          : user?.email 
          ? `/api/bookings?email=${encodeURIComponent(user.email)}` 
          : '/api/bookings';

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setBookings(data);
          }
        }
      } catch (err) {
        console.warn('Could not load bookings:', err);
      }
    };

    fetchBookings();
  }, [user?.email, user?.role]);

  // Handle URL params from Stripe checkout redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const status = urlParams.get('status');
    if (sessionId && status === 'success') {
      setToastMessage({
        type: 'success',
        text: 'Welkom bij Cambiar! Je betaling is verwerkt en je smart lock PIN is geactiveerd.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      refreshUser();
    }
  }, [refreshUser]);

  // Handle navigation
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'home' || sectionId === 'concept') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetId = sectionId === 'studio' ? 'studio-photos' : sectionId;
    const element = document.getElementById(targetId) || document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle slot reservation completion
  const handleBookingConfirmed = (newBooking: SlotBooking) => {
    handleMultipleBookingsConfirmed([newBooking]);
  };

  // Handle multiple slot reservations completion (recurring multi-week)
  const handleMultipleBookingsConfirmed = (newBookings: SlotBooking[]) => {
    const newIds = newBookings.map(b => b.id);
    const newSlotIds = newBookings.map(b => b.slotId);

    setBookings(prev => [...newBookings, ...prev.filter(b => !newIds.includes(b.id))]);
    
    // Mark all slots as booked locally
    setSlots(prev => prev.map(s => {
      if (newSlotIds.includes(s.id)) {
        return { ...s, isAvailable: false };
      }
      return s;
    }));

    refreshUser();

    setToastMessage({
      type: 'success',
      text: `${newBookings.length} wekelijkse tijdsloten succesvol gereserveerd! PIN-codes zijn geactiveerd.`,
    });
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelledBy: user?.role === 'admin' ? 'beheerder' : 'gebruiker',
        }),
      });
      if (res.ok) {
        const cancelled = bookings.find(b => b.id === bookingId);
        if (cancelled) {
          setSlots(prev => prev.map(s => {
            if (s.id === cancelled.slotId) {
              return { ...s, isAvailable: true };
            }
            return s;
          }));
        }

        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        refreshUser();
        setToastMessage({
          type: 'info',
          text: 'Reservering geannuleerd. Tijdslot is direct weer vrijgegeven en het tegoed is hersteld.',
        });
      }
    } catch (e) {
      console.error('Fout bij annuleren reservering:', e);
    }
  };

  // Handle subscription creation / upgrade via Stripe
  const handleSubscriptionSuccess = (newSub: MemberSubscription) => {
    updateUserSubscription(newSub);
    setSelectedPlanForCheckout(null);
    setToastMessage({
      type: 'success',
      text: `Gefeliciteerd met je ${newSub.planName}! 100% Maandelijks opzegbaar.`,
    });
    setIsCustomerDashboardOpen(true);
  };

  const activeSubscription = user?.subscription || null;
  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const userBookedSlotIds = bookings.filter(b => b.status === 'confirmed').map(b => b.slotId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-200 selection:text-zinc-950 pb-20 sm:pb-0">
      
      {/* PWA Offline Network Banner */}
      <OfflineNotice />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs text-zinc-200">
            {toastMessage.text}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Minimal Sticky Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        subscription={activeSubscription}
        bookingsCount={activeBookingsCount}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        onOpenPortal={() => {
          if (!user) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          } else if (user.role === 'admin') {
            setIsAdminDashboardOpen(true);
          } else {
            setIsCustomerDashboardOpen(true);
          }
        }}
        onOpenCheckout={(planId) => {
          const plan = planId ? MEMBERSHIP_PLANS.find(p => p.id === planId) : MEMBERSHIP_PLANS[1];
          setSelectedPlanForCheckout(plan || MEMBERSHIP_PLANS[1]);
        }}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        
        {/* 1. Minimalist Hero Section */}
        <Hero
          key={heroVideoKey}
          videoSettings={heroVideoSettings}
          onExploreSlots={() => handleNavigate('slots')}
          onExplorePlans={() => handleNavigate('tarieven')}
          onExploreStudio={() => handleNavigate('studio-photos')}
        />

        {/* 2. Interactive Studio Photo Tour & Hotspots */}
        <StudioPhotos />

        {/* 3. Minimalist 1-Hour Slot Booking Calendar */}
        <SlotBookingCalendar
          slots={slots}
          onSelectSlotToBook={(slot) => setSelectedSlotForBooking(slot)}
          userBookedSlotIds={userBookedSlotIds}
          subscription={activeSubscription}
          onOpenBookings={() => setIsBookingsDrawerOpen(true)}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        />

        {/* 4. Membership Plans with 100% Monthly Cancellation Guarantee */}
        <MembershipPlans
          onSelectPlan={(plan) => setSelectedPlanForCheckout(plan)}
          onSelectSingleHour={() => handleNavigate('slots')}
          activePlanId={activeSubscription?.status === 'active' ? activeSubscription.planId : undefined}
        />

        {/* 5. Studio Equipment & Specifications */}
        <Facilities />

        {/* 6. Minimalist Reviews & FAQ */}
        <Reviews />

      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenCheckout={(planId) => {
          const plan = planId ? MEMBERSHIP_PLANS.find(p => p.id === planId) : MEMBERSHIP_PLANS[1];
          setSelectedPlanForCheckout(plan || MEMBERSHIP_PLANS[1]);
        }}
      />

      {/* MODAL 1: 1-Hour Slot Booking Modal with PIN code generation */}
      {selectedSlotForBooking && (
        <BookingModal
          slot={selectedSlotForBooking}
          onClose={() => setSelectedSlotForBooking(null)}
          onBookingConfirmed={handleBookingConfirmed}
          onMultipleBookingsConfirmed={handleMultipleBookingsConfirmed}
          subscription={activeSubscription}
          defaultEmail={user?.email || activeSubscription?.memberEmail || ''}
          defaultName={user?.name || activeSubscription?.memberName || ''}
        />
      )}

      {/* MODAL 2: Stripe Checkout Subscription Modal */}
      {selectedPlanForCheckout && (
        <StripeCheckoutModal
          plan={selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSubscriptionSuccess={handleSubscriptionSuccess}
          defaultEmail={user?.email || activeSubscription?.memberEmail || ''}
          defaultName={user?.name || activeSubscription?.memberName || ''}
        />
      )}

      {/* MODAL 3: Klantendashboard with credits & smart lock PIN management */}
      {isCustomerDashboardOpen && user && user.role !== 'admin' && (
        <CustomerDashboardModal
          isOpen={isCustomerDashboardOpen}
          onClose={() => setIsCustomerDashboardOpen(false)}
          onOpenCalendar={() => {
            setIsCustomerDashboardOpen(false);
            handleNavigate('slots');
          }}
          onOpenCheckout={(planId) => {
            setIsCustomerDashboardOpen(false);
            const plan = planId ? MEMBERSHIP_PLANS.find(p => p.id === planId) : MEMBERSHIP_PLANS[1];
            setSelectedPlanForCheckout(plan || MEMBERSHIP_PLANS[1]);
          }}
        />
      )}

      {/* MODAL 4: Admin Beheerdersportaal (Accounts, Subscriptions, Bookings Details) */}
      {isAdminDashboardOpen && user && user.role === 'admin' && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => {
            setIsAdminDashboardOpen(false);
            setHeroVideoKey(k => k + 1);
          }}
          onOpenCalendar={() => {
            setIsAdminDashboardOpen(false);
            handleNavigate('slots');
          }}
          onHeroVideoSettingsChange={(newSettings) => {
            setHeroVideoSettings(newSettings);
            setHeroVideoKey(k => k + 1);
          }}
        />
      )}

      {/* MODAL 5: User Authentication (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        onSuccess={() => {
          if (user?.role === 'admin') {
            setIsAdminDashboardOpen(true);
          } else {
            setIsCustomerDashboardOpen(true);
          }
        }}
      />

      {/* DRAWER: My Bookings & Smart Lock PIN codes */}
      <MyBookingsDrawer
        bookings={bookings}
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        onCancelBooking={handleCancelBooking}
        onExploreSlots={() => handleNavigate('slots')}
      />

      {/* PWA Mobile Bottom Navigation Bar with Safe Area support */}
      <PWABottomNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        bookingsCount={activeBookingsCount}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        onOpenPortal={() => {
          if (!user) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          } else if (user.role === 'admin') {
            setIsAdminDashboardOpen(true);
          } else {
            setIsCustomerDashboardOpen(true);
          }
        }}
        subscription={activeSubscription}
      />

    </div>
  );
}
