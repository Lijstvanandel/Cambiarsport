import React, { useState } from 'react';
import { 
  Sparkles, 
  Dumbbell, 
  Layers, 
  Volume2, 
  Eye, 
  ShieldCheck, 
  Check, 
  Maximize2,
  Lock,
  Flame,
  Camera
} from 'lucide-react';
import { CambiarLogo } from './CambiarLogo';
import { RenderPhotoSVG } from './StudioPhotos';

export const Facilities: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<number>(0);

  const zones = [
    {
      id: 'photo_mirrors_corridor',
      tag: 'Foto 3 • Gang & Vrije Gewichten',
      title: 'Ovaal Backlit Spiegelwand & Trap Bar Zone',
      subtitle: 'Warm verlichte designgang met de iconische Cambiar mural',
      badge: 'Sfeervolle Verlichting',
      specs: [
        '3x Grote gouden ovale spiegels met warm-witte halo LED-achtergrondverlichting',
        'Zwarte VirtuFit halterschijvenrek met rubberen grip plates',
        'Hex Trap Bar voor veilige deadlifts en shrugs',
        'EZ-curl stang & losse compacte dumbbells',
        'Concept2 luchtweerstand roeitrainer (RowErg)',
        'Mooie lichte parketvloer & akoestisch houten lattenplafond',
        'Muurschildering: "CAMBIAR personal training" met fitness silhouet',
      ],
      ambiance: 'Warm amber indirect licht & premium houtlook',
      highlights: ['Backlit Mirrors', 'Trap Bar', 'VirtuFit Plates', 'RowErg', 'Mural Wall'],
      photoId: 'photo_mirrors_corridor',
    },
    {
      id: 'photo_cable_smith',
      tag: 'Foto 1 • Multifunctioneel Krachtstation',
      title: 'Smith Machine & Dual Adjustable Cable Pulley',
      subtitle: 'Maximale spierisolatie en veilige zware presses',
      badge: 'Dual Cable & Smith',
      specs: [
        'Geïntegreerd Smith Machine systeem met geleidestangen & rode stang',
        'Dual Cable Pulleys in hoogte verstelbaar met soepele gewichtstapels',
        'Multi-grip pull-up bar (brede, smalle en neutrale grepen)',
        'Verstelbare luxe incline/flat trainingsbank met dichte padding',
        'Bovenliggende diepblauwe neon LED-koofverlichting',
        'Volledige kabelaccessoires: triceps touw, single handles, rechte stang',
        'Achterwand in natuurlijke OSB-houtstructuur met hangplanten',
      ],
      ambiance: 'Diepblauw neon LED & gerichte trainingsspots',
      highlights: ['Smith Machine', 'Dual Cable Cross', 'Multi Pull-Up', 'Incline Bank'],
      photoId: 'photo_cable_smith',
    },
    {
      id: 'photo_power_rack',
      tag: 'Foto 2 • Zware Krachttraining & Drop Zone',
      title: 'Heavy-Duty Power Rack & Schokdempende Vloer',
      subtitle: 'Squats, bench press, deadlifts en core stabiliteit',
      badge: 'Drop Zone & Rack',
      specs: [
        'Vrijstaand heavy-duty stalen Power Rack met verstelbare J-cups & spotters',
        'Olympische halterstang 50mm met gekalibreerde gewichtsschijven',
        'Dikke heavy-duty rubberen vloermatten voor veilige drops en geluiddemping',
        'Bosu balance ball & core stabiliteitsapparatuur',
        'OSB-hout achterwand met decoratieve verlichte natuurstenen sierstrook',
        'Plafond ventilator & actieve luchtcirculatie voor frisse lucht',
      ],
      ambiance: 'Professionele heavy lifting vibe met LED-accenten',
      highlights: ['Power Rack', 'Olympic Barbell', 'Rubber Drop Matten', 'Bosu Ball'],
      photoId: 'photo_power_rack',
    },
    {
      id: 'photo_smart_access',
      tag: 'Foto 4 • Stichting Cambiar & Faciliteiten',
      title: 'Stichting Cambiar & Smart Studio Comfort',
      subtitle: 'Toegankelijke topkwaliteit zonder personele belemmering',
      badge: 'Smart & Keyless',
      specs: [
        'Keyless Smart Door Lock: betreed de studio direct met je 4-cijferige PIN (#)',
        'Stichting Cambiar: focus op gezonde leefstijl en doelgerichte personal training',
        'High-fidelity Bluetooth audiosysteem: verbind direct met je eigen telefoon',
        'Privé kleedruimte & verfrissing',
        'Dagelijkse hygiëne en desinfectiematerialen aanwezig',
        'Totale exclusiviteit: 0 andere sporters tijdens jouw sessie',
      ],
      ambiance: 'Totale rust, privacy en professionele focus',
      highlights: ['Smart Lock PIN', 'Eigen Muziek', '100% Privé', 'Stichting Cambiar'],
      photoId: 'photo_smart_access',
    },
  ];

  const currentZone = zones[selectedZone];

  return (
    <section id="studio" className="py-16 sm:py-24 bg-zinc-950 border-b border-zinc-900 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
              03 &bull; De Cambiar Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              Foto's & Apparatuur Overzicht
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Bekijk de verschillende zones van studio Cambiar. Alles is met zorg samengesteld voor een complete, hoogwaardige training in een sfeervolle setting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CambiarLogo variant="globe" />
          </div>
        </div>

        {/* Zone Selector Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {zones.map((z, idx) => {
            const isSelected = selectedZone === idx;
            return (
              <button
                key={z.id}
                onClick={() => setSelectedZone(idx)}
                className={`p-3.5 rounded-xl border text-left transition relative overflow-hidden ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-600 text-white shadow-lg ring-1 ring-zinc-500'
                    : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Zone 0{idx + 1}
                </span>
                <span className="text-xs font-bold text-zinc-100 block mt-1 line-clamp-1 font-['Cabinet_Grotesk']">
                  {z.title.split('&')[0]}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 line-clamp-1">
                  {z.badge}
                </span>

                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 via-amber-300 to-sky-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Zone Showcase Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Visual Photographic Header */}
          <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full bg-zinc-950 border-b border-zinc-850 overflow-hidden">
            <RenderPhotoSVG photoId={currentZone.photoId} className="w-full h-full" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sky-400 text-xs font-mono backdrop-blur-md flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>{currentZone.tag}</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white font-['Cabinet_Grotesk']">
                  {currentZone.title}
                </h3>
                <p className="text-xs text-zinc-300">
                  {currentZone.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {currentZone.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-750 text-zinc-300 text-[10px] font-mono"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Specs List & Features */}
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider block">
                Aanwezige apparatuur & specificaties in deze zone:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentZone.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-start gap-3 hover:border-zinc-750 transition"
                  >
                    <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-750 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambiance Bar */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>Sfeer & Verlichting: <strong className="text-zinc-200 font-normal">{currentZone.ambiance}</strong></span>
              </div>
              <span className="text-zinc-400">
                100% Exclusief voor jouw reservering
              </span>
            </div>

          </div>

        </div>

        {/* Cambiar Studio Key Rules & Privacy Promise */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2">
            <h4 className="text-xs font-bold text-white font-['Cabinet_Grotesk'] uppercase tracking-wider">
              Eigen Muziek & Spotify
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verbind direct via Bluetooth met het ingebouwde surround sound systeem en train met jouw favoriete tracks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2">
            <h4 className="text-xs font-bold text-white font-['Cabinet_Grotesk'] uppercase tracking-wider">
              Gast of PT'er Toegestaan
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Elke boeking geldt voor de gehele studio. Neem kosteloos een trainingspartner of jouw eigen personal trainer mee.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-2">
            <h4 className="text-xs font-bold text-white font-['Cabinet_Grotesk'] uppercase tracking-wider">
              Smart Lock Entry
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Geen receptie of wachttijden. Toets je 4-cijferige pincode (#) in op het deurslot en begin direct aan je sessie.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
