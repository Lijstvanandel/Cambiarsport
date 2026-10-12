import React, { useState, useMemo } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Eye,
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CambiarLogo } from './CambiarLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('plan_8h');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumberOrSymbol = /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password);

    let score = 0;
    if (password.length >= 6) score += 1;
    if (hasMinLength) score += 1;
    if (hasUpperLower) score += 1;
    if (hasNumberOrSymbol) score += 1;

    let label = 'Nog te kort';
    let color = 'bg-zinc-700';
    let textColor = 'text-zinc-400';

    if (score === 1) {
      label = 'Zwak';
      color = 'bg-rose-500';
      textColor = 'text-rose-400';
    } else if (score === 2) {
      label = 'Matig';
      color = 'bg-amber-500';
      textColor = 'text-amber-400';
    } else if (score === 3) {
      label = 'Goed';
      color = 'bg-sky-400';
      textColor = 'text-sky-400';
    } else if (score >= 4) {
      label = 'Sterk & Veilig';
      color = 'bg-emerald-400';
      textColor = 'text-emerald-400';
    }

    return {
      score,
      label,
      color,
      textColor,
      hasMinLength,
      hasUpperLower,
      hasNumberOrSymbol,
    };
  }, [password]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Het wachtwoord moet minimaal 6 tekens bevatten.');
        return;
      }
      if (password !== confirmPassword) {
        setError('De ingevoerde wachtwoorden komen niet overeen.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password, rememberMe);
        if (!res.success) {
          setError(res.error || 'Inloggen mislukt. Controleer je gegevens.');
          setIsLoading(false);
          return;
        }
      } else {
        const res = await register(
          {
            name,
            email,
            password,
            phone,
            planId: selectedPlan,
          },
          rememberMe
        );
        if (!res.success) {
          setError(res.error || 'Registreren mislukt.');
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Er is een onverwachte fout opgetreden.');
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setIsLoading(true);
    await quickDemoLogin(demoEmail);
    setIsLoading(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CambiarLogo variant="globe" />
            <div>
              <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                {mode === 'login' ? 'Inloggen bij Cambiar' : 'Word Cambiar Lid'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Privé Gym Klantendashboard & Reserveringen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-5 sm:mx-6 mt-4 rounded-xl bg-zinc-900/80 border border-zinc-850">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 text-xs font-mono rounded-lg transition font-medium cursor-pointer ${
              mode === 'login'
                ? 'bg-zinc-800 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 text-xs font-mono rounded-lg transition font-medium cursor-pointer ${
              mode === 'register'
                ? 'bg-zinc-800 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Registreren
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                  Volledige Naam
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="bijv. Alex de Vries"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                  Telefoonnummer (voor Smart PIN SMS backup)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12345678"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                  Kies een abonnement (100% Maandelijks Opzegbaar)
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-sky-500 transition font-mono"
                >
                  <option value="plan_4h">Cambiar Flex 4 (4 uur/mnd - €69/mnd)</option>
                  <option value="plan_8h">Cambiar Flex 8 (8 uur/mnd - €119/mnd)</option>
                  <option value="plan_unlimited">Cambiar Unlimited (Onbeperkt - €199/mnd)</option>
                </select>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase text-zinc-400">
                Wachtwoord
              </label>
              {mode === 'register' && password.length > 0 && (
                <span className={`text-[10px] font-mono font-bold ${passwordCriteria.textColor}`}>
                  Sterkte: {passwordCriteria.label}
                </span>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-sky-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Registration: Password Strength Bar & Checklist */}
            {mode === 'register' && password.length > 0 && (
              <div className="mt-2 space-y-2 animate-fadeIn">
                {/* 4 Segment Progress Bar */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 1 ? passwordCriteria.color : 'bg-zinc-800'}`} />
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 2 ? passwordCriteria.color : 'bg-zinc-800'}`} />
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 3 ? passwordCriteria.color : 'bg-zinc-800'}`} />
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 4 ? passwordCriteria.color : 'bg-zinc-800'}`} />
                </div>

                {/* Password Criteria Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono text-zinc-400 pt-1">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Minimaal 8 tekens</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpperLower ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Hoofd- & kleine letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumberOrSymbol ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Cijfer of symbool</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration: Confirm Password */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase text-zinc-400">
                  Wachtwoord Bevestigen
                </label>
                {passwordsMatch && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Wachtwoorden komen overeen</span>
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[10px] font-mono text-rose-400">
                    Wachtwoorden komen niet overeen
                  </span>
                )}
              </div>

              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${passwordsMatch ? 'text-emerald-400' : passwordsMismatch ? 'text-rose-400' : 'text-zinc-500'}`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal je wachtwoord"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border text-white text-xs focus:outline-none transition ${
                    passwordsMatch
                      ? 'border-emerald-500/60 focus:border-emerald-400'
                      : passwordsMismatch
                      ? 'border-rose-500/60 focus:border-rose-400'
                      : 'border-zinc-800 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* "Inlog Onthouden" / Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-sky-500 focus:ring-0 focus:ring-offset-0 transition cursor-pointer accent-sky-500"
              />
              <span className="text-xs text-zinc-300 font-mono">
                Inlog onthouden op dit apparaat
              </span>
            </label>

            {mode === 'login' && (
              <span className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer transition">
                Wachtwoord vergeten?
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (mode === 'register' && passwordsMismatch)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-zinc-950 font-black text-xs font-mono uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Bezig met laden...</span>
            ) : mode === 'login' ? (
              <>
                <span>Inloggen in Klantendashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Account Aanmaken & Lid Worden</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Accounts Bar */}
        <div className="p-4 sm:p-5 bg-zinc-900/60 border-t border-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
              1-Klik Demo Test Accounts:
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Geen wachtwoord nodig
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. Beheerder / Admin */}
            <button
              type="button"
              onClick={() => handleQuickDemo('beheerder@cambiar.nl')}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-bold block font-mono">Beheerder</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                Admin Portaal & Agenda
              </span>
            </button>

            {/* 2. Tester Unlimited (Endless bookings) */}
            <button
              type="button"
              onClick={() => handleQuickDemo('unlimited@cambiar.nl')}
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-bold block font-mono">Unlimited Test</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                Onbeperkt Uren Boeken
              </span>
            </button>

            {/* 3. Alex (Flex 8) */}
            <button
              type="button"
              onClick={() => handleQuickDemo('alex@cambiar.nl')}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left transition cursor-pointer"
            >
              <span className="text-xs font-bold text-white block font-mono">Alex de Vries</span>
              <span className="text-[10px] font-mono text-sky-400 block mt-0.5">
                Flex 8 Lid (7 credits)
              </span>
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};
