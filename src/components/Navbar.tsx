import React, { useState, useEffect } from 'react';
import { KeyRound, User, ArrowUpRight, Menu, X, LogIn, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import { MemberSubscription } from '../types';
import { CambiarLogo } from './CambiarLogo';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  subscription: MemberSubscription | null;
  bookingsCount: number;
  onOpenBookings: () => void;
  onOpenPortal: () => void;
  onOpenCheckout: (planId?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  subscription,
  bookingsCount,
  onOpenBookings,
  onOpenPortal,
  onOpenCheckout,
  onOpenAuth,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'concept', label: 'Over Cambiar' },
    { id: 'studio', label: 'Studio & Foto\'s' },
    { id: 'slots', label: 'Uur Reserveren' },
    { id: 'tarieven', label: 'Tarieven' },
    { id: 'faq', label: 'FAQ' },
  ];

  const activeSub = user?.subscription || subscription;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 shadow-md'
          : 'bg-zinc-950 border-b border-zinc-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Cambiar */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <CambiarLogo />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                activeSection === item.id
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2">
          
          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* My Booked Slots Drawer Trigger */}
          <button
            onClick={onOpenBookings}
            className="relative px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition flex items-center gap-2 cursor-pointer"
            title="Bekijk je actieve smart lock PIN codes"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>PIN Codes</span>
            {bookingsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* User Logged In: Customer Dashboard or Admin Portal Button + Logout */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenPortal}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-2 shadow-sm group cursor-pointer ${
                  user.role === 'admin'
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-200'
                    : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-750 hover:border-sky-500/50 text-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border text-[10px] font-bold font-mono flex items-center justify-center transition ${
                  user.role === 'admin'
                    ? 'bg-amber-400 text-zinc-950 border-amber-300'
                    : 'bg-sky-500/20 border-sky-400 text-sky-400 group-hover:bg-sky-500 group-hover:text-zinc-950'
                }`}>
                  {user.role === 'admin' ? '★' : user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-none">
                    {user.role === 'admin' ? 'Beheerder' : user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono leading-none">
                    {user.role === 'admin'
                      ? 'Admin Portaal'
                      : activeSub?.status === 'active'
                      ? activeSub.monthlyHours === 'onbeperkt'
                        ? 'Unlimited'
                        : `${activeSub.remainingHoursThisMonth}u over`
                      : 'Dashboard'}
                  </span>
                </div>
              </button>

              {/* Direct Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-300 transition cursor-pointer"
                title="Uitloggen"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Not Logged In: Inloggen & Registreren */}
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                <span>Inloggen</span>
              </button>

              <button
                onClick={() => onNavigate('tarieven')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold tracking-tight transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Abonnementen</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          {/* PWA Button mobile */}
          <PWAInstallButton variant="navbar" />

          <button
            onClick={onOpenBookings}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 relative"
          >
            <KeyRound className="w-4 h-4" />
            {bookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-sky-400 text-zinc-950 text-[9px] font-bold flex items-center justify-center">
                {bookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-zinc-850 bg-zinc-950 px-5 py-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm py-2 text-zinc-300 hover:text-white border-b border-zinc-900"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenPortal();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-2 ${
                    user.role === 'admin'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-zinc-900 border-zinc-700 text-white'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Beheerder Portaal</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-sky-400" />
                      <span>Klantendashboard ({user.name})</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-rose-800/60 text-rose-300 text-xs font-medium text-center flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Uitloggen ({user.email})</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium text-center"
                >
                  Inloggen
                </button>
                <button
                  onClick={() => {
                    onNavigate('tarieven');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-bold text-center"
                >
                  Abonnementen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
