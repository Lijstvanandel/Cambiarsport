import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Check, 
  Sparkles, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { MembershipPlan, MemberSubscription } from '../types';

interface StripeCheckoutModalProps {
  plan: MembershipPlan;
  onClose: () => void;
  onSubscriptionSuccess: (newSub: MemberSubscription) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  plan,
  onClose,
  onSubscriptionSuccess,
  defaultEmail = '',
  defaultName = '',
}) => {
  const [customerName, setCustomerName] = useState(defaultName);
  const [customerEmail, setCustomerEmail] = useState(defaultEmail);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'ideal' | 'card' | 'sepa' | 'bancontact'>('ideal');
  const [selectedBank, setSelectedBank] = useState('ing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dutchBanks = [
    { id: 'ing', name: 'ING' },
    { id: 'rabobank', name: 'Rabobank' },
    { id: 'abn_amro', name: 'ABN AMRO' },
    { id: 'bunq', name: 'bunq' },
    { id: 'sns', name: 'SNS Bank' },
    { id: 'asn', name: 'ASN Bank' },
    { id: 'revolut', name: 'Revolut' },
  ];

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg('Vul je naam en e-mailadres in.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim(),
          paymentMethod: selectedPaymentMethod,
          bank: selectedBank,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden bij het starten van de betaling.');
      }

      const hours = typeof plan.monthlyHours === 'number' ? plan.monthlyHours : 'onbeperkt';

      const newSub: MemberSubscription = {
        id: `sub_${Date.now()}`,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        monthlyHours: hours,
        remainingHoursThisMonth: hours === 'onbeperkt' ? 999 : hours,
        status: 'active',
        startedAt: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
        paymentMethod: selectedPaymentMethod === 'ideal' ? 'iDEAL' : selectedPaymentMethod === 'card' ? 'Creditcard' : 'SEPA Incasso',
        memberName: customerName.trim(),
        memberEmail: customerEmail.trim(),
        isMonthlyCancellable: true,
        invoices: [
          {
            id: `inv_cb_${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toLocaleDateString('nl-NL'),
            amount: plan.price,
            status: 'paid',
            description: `Cambiar Studio - ${plan.name} (Eerste maand)`,
          }
        ],
      };

      onSubscriptionSuccess(newSub);
    } catch (err: any) {
      setErrorMsg(err.message || 'Betaling kon niet worden verwerkt.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                Beveiligde Stripe Betaling
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                100% Maandelijks Opzegbaar
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

        <form onSubmit={handleStripeCheckout} className="p-6 space-y-5">
          
          {/* Plan Summary Card */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400">Gekozen Formule</span>
              <h4 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                {plan.name}
              </h4>
              <span className="text-xs text-zinc-400">
                {plan.monthlyHours === 'onbeperkt' ? 'Onbeperkt uren per maand' : `${plan.monthlyHours} privé-uren per maand`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-white font-mono">
                €{plan.price.toFixed(0)}
              </span>
              <span className="text-[11px] text-zinc-400 block font-mono">/ maand</span>
            </div>
          </div>

          {/* Cancellation guarantee notice */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Maandelijks opzegbaar:</strong> Geen lange contracten. Opzeggen of pauzeren kan met 1 klik.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Naam van het lid
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Voor- en achternaam"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                E-mailadres voor facturen & bevestiging
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-900">
            <label className="block text-xs font-medium text-zinc-400">
              Betaalmethode
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('ideal')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition ${
                  selectedPaymentMethod === 'ideal'
                    ? 'bg-zinc-900 border-zinc-600 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>iDEAL</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition ${
                  selectedPaymentMethod === 'card'
                    ? 'bg-zinc-900 border-zinc-600 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Creditcard / Apple Pay</span>
              </button>
            </div>

            {selectedPaymentMethod === 'ideal' && (
              <div className="pt-2">
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                >
                  {dutchBanks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Betaling verwerken via Stripe...</span>
              ) : (
                <>
                  <span>Activeer {plan.name} (€{plan.price.toFixed(0)}/mnd)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
