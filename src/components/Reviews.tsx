import React from 'react';
import { ChevronDown, Lock, Star } from 'lucide-react';
import { REVIEWS } from '../data/gymData';

export const Reviews: React.FC = () => {
  const faqs = [
    {
      q: 'Hoe werkt het deurslot en toegang tot de privéstudio?',
      a: 'Zodra je een uur reserveert, ontvang je direct een unieke 4-cijferige PIN-code (bijvoorbeeld 4829#). Deze code wordt precies op het aanvangstijdstip actief op het smart lock bij de voordeur en vervalt automatisch aan het einde van jouw gereserveerde 60 minuten.',
    },
    {
      q: 'Mag ik een trainingspartner of personal trainer meenemen?',
      a: 'Ja! Bij al onze abonnementen en losse uurboekingen mag je kosteloos 1 tot 2 trainingspartners of jouw eigen personal trainer meenemen. De studio blijft tijdens dat uur 100% exclusief voor jullie gereserveerd.',
    },
    {
      q: 'Hoe zit het met de maandelijks opzegbare voorwaarden?',
      a: 'Al onze lidmaatschappen zijn 100% maandelijks opzegbaar. Er zijn geen verborgen inschrijfkosten of opzegtermijnen van een jaar. Je kunt in je online ledenportaal op ieder moment met 1 klik opzeggen of tijdelijk pauzeren.',
    },
    {
      q: 'Kan ik een geboekt uur annuleren of verzetten?',
      a: 'Tot 2 uur voor aanvang van je tijdslot kun je via "Mijn Uren & PIN" je reservering kosteloos annuleren. Je tegoeduur wordt direct teruggestort op je account en het tijdslot komt weer vrij.',
    },
    {
      q: 'Hoe is de hygiëne geregeld?',
      a: 'De studio wordt dagelijks professioneel gereinigd en geventileerd. Daarnaast zijn er in de studio desinfectiedoekjes en sprays aanwezig om bankjes en handgrepen na gebruik even af te nemen.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-zinc-950 border-b border-zinc-900 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Testimonials */}
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              04 &bull; Ervaringen
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              Wat Sporters Zeggen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-850 flex flex-col justify-between space-y-4"
              >
                <p className="text-xs text-zinc-300 leading-relaxed">
                  "{r.comment}"
                </p>

                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{r.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{r.role}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-zinc-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-zinc-300 text-zinc-300" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6 pt-6 border-t border-zinc-900">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              05 &bull; Veelgestelde Vragen
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              Alles Over Afhuur & Smart Lock
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-zinc-900/40 border border-zinc-850 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-200 group-open:text-white transition">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="text-xs text-zinc-400 mt-2.5 pt-2.5 border-t border-zinc-850 leading-relaxed font-normal">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
