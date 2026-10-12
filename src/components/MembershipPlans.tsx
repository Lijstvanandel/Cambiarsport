import React from 'react';
import { Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { MEMBERSHIP_PLANS, SINGLE_HOUR_PRICE } from '../data/gymData';
import { MembershipPlan } from '../types';

interface MembershipPlansProps {
  onSelectPlan: (plan: MembershipPlan) => void;
  onSelectSingleHour: () => void;
  activePlanId?: string;
}

export const MembershipPlans: React.FC<MembershipPlansProps> = ({
  onSelectPlan,
  onSelectSingleHour,
  activePlanId,
}) => {
  return (
    <section id="tarieven" className="py-16 sm:py-24 bg-zinc-950 border-b border-zinc-900 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            02 &bull; Tarieven & Lidmaatschap
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
            100% Maandelijks Opzegbaar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Geen inschrijfkosten, geen wurgcontracten. Kies een maandelijks tegoed of boek een enkel los uur wanneer het jou uitkomt.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MEMBERSHIP_PLANS.map((plan) => {
            const isCurrent = activePlanId === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition border ${
                  isPopular
                    ? 'bg-zinc-900 border-zinc-700 shadow-xl ring-1 ring-zinc-600'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-750'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-100 text-zinc-950 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {plan.tag || 'Meest Gekozen'}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white font-['Cabinet_Grotesk']">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white font-mono">
                        €{plan.price.toFixed(0)}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">/ maand</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-1">
                      {plan.monthlyHours === 'onbeperkt' 
                        ? 'Onbeperkt aantal uren per maand' 
                        : `Slechts €${(plan.price / (typeof plan.monthlyHours === 'number' ? plan.monthlyHours : 1)).toFixed(2)} per uur`}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 pt-4 border-t border-zinc-850 text-xs text-zinc-300">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-850 space-y-2">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : isPopular
                        ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800'
                    }`}
                  >
                    {isCurrent ? (
                      <span>Huidig Actief Abonnement</span>
                    ) : (
                      <>
                        <span>Kies {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center font-mono">
                    100% Maandelijks opzegbaar via Stripe
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Single Hour Banner */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
              Liever eerst uitproberen?
            </span>
            <h4 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
              Boek een Los Uur Privé Gym voor €{SINGLE_HOUR_PRICE.toFixed(2).replace('.', ',')}
            </h4>
            <p className="text-xs text-zinc-400">
              Betaal per sessie zonder vast te zitten aan een maandabonnement. Inclusief alle faciliteiten & smart lock PIN.
            </p>
          </div>

          <button
            onClick={onSelectSingleHour}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition"
          >
            Kies een Tijdslot
          </button>
        </div>

      </div>
    </section>
  );
};
