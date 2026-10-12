import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  User, 
  Calendar, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  PauseCircle, 
  Trash2, 
  Receipt,
  RotateCcw
} from 'lucide-react';
import { MemberSubscription } from '../types';

interface MemberPortalModalProps {
  subscription: MemberSubscription;
  onClose: () => void;
  onSubscriptionUpdated: (updated: MemberSubscription) => void;
  onExplorePlans: () => void;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({
  subscription,
  onClose,
  onSubscriptionUpdated,
  onExplorePlans,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices'>('overview');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      const data = await response.json();
      
      const updatedSub: MemberSubscription = {
        ...subscription,
        status: 'cancelled',
      };
      onSubscriptionUpdated(updatedSub);
      setActionNotice('Je lidmaatschap is succesvol beëindigd. Je behoudt je resterende uren tot het einde van de factuurmaand.');
      setShowCancelConfirm(false);
    } catch (err: any) {
      setActionNotice('Er ging iets mis bij het opzeggen.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/subscriptions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      const data = await response.json();

      const updatedSub: MemberSubscription = {
        ...subscription,
        status: 'paused',
      };
      onSubscriptionUpdated(updatedSub);
      setActionNotice('Je lidmaatschap is voor 30 dagen gepauzeerd.');
    } catch (err: any) {
      setActionNotice('Er ging iets mis bij het pauzeren.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSubscription = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/subscriptions/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      const updatedSub: MemberSubscription = {
        ...subscription,
        status: 'active',
      };
      onSubscriptionUpdated(updatedSub);
      setActionNotice('Je lidmaatschap is weer geactiveerd!');
    } catch (err) {
      setActionNotice('Er ging iets mis bij het hervatten.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                  Cambiar Ledenportaal
                </h3>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  subscription.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : subscription.status === 'paused'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {subscription.status === 'active' ? 'Actief' : subscription.status === 'paused' ? 'Gepauzeerd' : 'Geannuleerd'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {subscription.memberName} &bull; {subscription.memberEmail}
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-zinc-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'text-white border-white font-bold'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            Abonnement & Urentegoed
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'invoices'
                ? 'text-white border-white font-bold'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            Facturen & Betaalbewijzen
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="m-6 mb-0 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Active Plan Card */}
              <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      Actief Lidmaatschap
                    </span>
                    <h4 className="text-xl font-black text-white font-['Cabinet_Grotesk'] mt-0.5">
                      {subscription.planName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white font-mono">
                      €{subscription.price.toFixed(0)}
                    </span>
                    <span className="text-[11px] text-zinc-400 block font-mono">/ maand</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300 font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Resterend tegoed</span>
                    <span className="font-bold text-white mt-0.5 block">
                      {subscription.monthlyHours === 'onbeperkt'
                        ? 'Onbeperkt aantal uren'
                        : `${subscription.remainingHoursThisMonth} uur over deze factuurmaand`}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Volgende verlenging</span>
                    <span className="font-bold text-zinc-200 mt-0.5 block">
                      {subscription.nextBillingDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Cancellation Policy Micro-Notice */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-200 block">100% Maandelijks Opzegbaar:</span>
                <p className="text-[11px] leading-relaxed">
                  Je zit nergens aan vast. Zeg op vóór je volgende factuurdatum en er worden geen verdere bedragen afgeschreven.
                </p>
              </div>

              {/* Management Controls */}
              {subscription.status === 'active' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handlePauseSubscription}
                    disabled={isProcessing}
                    className="py-2.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Pauzeer 30 Dagen (Vakantie)</span>
                  </button>

                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="py-2.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-800 text-zinc-400 hover:text-rose-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Abonnement Opzeggen</span>
                  </button>
                </div>
              )}

              {subscription.status === 'paused' && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-zinc-300">
                    Je abonnement staat momenteel op pauze.
                  </p>
                  <button
                    onClick={handleResumeSubscription}
                    className="py-2 px-4 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs"
                  >
                    Hervat Lidmaatschap
                  </button>
                </div>
              )}

              {/* Cancellation Confirmation Dialog */}
              {showCancelConfirm && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-rose-800/80 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <h5 className="font-bold text-rose-200">
                        Weet je zeker dat je wilt opzeggen?
                      </h5>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">
                        Omdat je een maandelijks opzegbaar abonnement hebt, stopt de automatische incasso direct na deze maandtermijn.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
                    >
                      Blijf Lid
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold transition"
                    >
                      {isProcessing ? 'Verwerken...' : 'Ja, Zeg Kosteloos Op'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                Overzicht van officiële betaalbewijzen en maandfacturen via Stripe.
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'inv_fc_9921',
                    date: new Date().toLocaleDateString('nl-NL'),
                    amount: subscription.price,
                    description: `FitCore Studio - ${subscription.planName}`,
                  }
                ].map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-850 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-200">
                        {inv.description}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Factuurnr: {inv.id.toUpperCase()} &bull; {inv.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-white">
                        €{inv.amount.toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => alert(`Factuur ${inv.id} gedownload als PDF.`)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
