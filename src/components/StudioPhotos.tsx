import React, { useState } from 'react';
import { 
  Sparkles, 
  Dumbbell, 
  ZoomIn, 
  Camera, 
  Check, 
  Maximize2, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Flame,
  Volume2
} from 'lucide-react';
import { CambiarLogo } from './CambiarLogo';

export interface PhotoData {
  id: string;
  title: string;
  subtitle: string;
  zone: string;
  badge: string;
  description: string;
  lighting: string;
  tags: string[];
  hotspots: {
    x: number; // percentage
    y: number; // percentage
    label: string;
    description: string;
  }[];
}

export const CAMBIAR_PHOTOS: PhotoData[] = [
  {
    id: 'photo_cable_smith',
    title: 'Smith Machine & Dual Adjustable Cable Pulley',
    subtitle: 'Multifunctioneel station met blauwe neon LED & OSB achterwand',
    zone: 'Foto 1 • Krachtstation',
    badge: 'Smith & Cable Crossover',
    lighting: 'Elektrisch blauw neon LED koof & gerichte warmwitte spots',
    description: 'Compleet zwart stalen multi-station met dubbele verstelbare kabel pulleys, geïntegreerde Smith machine met rode stang, multi-grip optrekstang en verstelbare trainingsbank tegen een OSB houten wand met hangplant.',
    tags: ['Smith Machine', 'Dual Cable Cross', 'Multi-Grip Pull-Up', 'Blue Neon LED', 'OSB Wand', 'Incline Bank'],
    hotspots: [
      { x: 50, y: 12, label: 'Blue Neon LED', description: 'Diepblauwe neon LED-koofverlichting voor maximale sfeer.' },
      { x: 22, y: 35, label: 'Dual Cable Pulley', description: 'Soepel in hoogte verstelbare pulleys voor isolatie- en kabeloefeningen.' },
      { x: 50, y: 40, label: 'Smith Bar', description: 'Geleide Smith stang met rode handgreep en veiligheidshaken.' },
      { x: 50, y: 75, label: 'Trainingsbank', description: 'Luxe verstelbare vlakke en schuine bank voor presses.' },
      { x: 80, y: 25, label: 'OSB & Hangplant', description: 'Natuurlijke OSB houtstructuur met frisse hangplanten.' },
    ]
  },
  {
    id: 'photo_power_rack',
    title: 'Heavy-Duty Power Rack & Drop Zone',
    subtitle: 'Squat cage, Olympische barbell, Bosu ball en stenen accentwand',
    zone: 'Foto 2 • Heavy Lifting',
    badge: 'Squat Rack & Droptegels',
    lighting: 'Bovenliggende koelblauwe wash & warme vloeruplights op natuursteen',
    description: 'Zwaar professioneel power rack met spotter arms, 50mm halterstang, Bosu balance trainer en schokdempende dikke rubberen fitnessvloer met verlichte natuurstenen sierrand.',
    tags: ['Heavy Power Rack', 'Olympic Barbell', 'Rubber Droptegels', 'Bosu Ball', 'Verlichte Steenwand'],
    hotspots: [
      { x: 50, y: 25, label: 'Stalen Power Rack', description: 'Robuuste squat cage met lasergesneden gaten voor J-cups en safety bars.' },
      { x: 50, y: 50, label: 'Olympic Barbell', description: '50mm professionele halterstang met gewichtsschijven.' },
      { x: 25, y: 80, label: 'Bosu Balance Ball', description: 'Voor core stability, balans en functionele training.' },
      { x: 75, y: 88, label: 'Rubberen Droptegels', description: 'Geluiddempende vloermatten voor veilige deadlifts en drops.' },
      { x: 50, y: 82, label: 'Verlichte Natuursteen', description: 'Sfeervolle LED-strip langs de natuurstenen onderwand.' },
    ]
  },
  {
    id: 'photo_mirrors_corridor',
    title: 'Ovaal Backlit Spiegelwand & Trap Bar Gang',
    subtitle: '3 Ovale halo spiegels, VirtuFit schijvenrek & Cambiar mural',
    zone: 'Foto 3 • Spiegelwand',
    badge: 'Backlit Spiegels & Trap Bar',
    lighting: 'Warme gouden amber halo LED-randen & houten parketvloer',
    description: 'Luxe doorgang met 3 grote verlichte ovale designspiegels, zwart VirtuFit schijvenrek met rubberen plates, Hex Trap Bar voor deadlifts, EZ-curl stang, Concept2 RowErg en de iconische Cambiar muurschildering.',
    tags: ['3x Backlit Spiegels', 'Hex Trap Bar', 'VirtuFit Plates', 'RowErg', 'Cambiar Wand', 'Parketvloer'],
    hotspots: [
      { x: 22, y: 40, label: 'Backlit Ovaal Spiegels', description: 'Drie grote ovale spiegels met warme gouden halo LED-verlichting.' },
      { x: 58, y: 62, label: 'VirtuFit Schijvenrek', description: 'Zwart A-frame rek vol rubberen halterschijven en EZ-curl bar.' },
      { x: 42, y: 78, label: 'Hex Trap Bar', description: 'Zeshoekige deadlift bar voor ergonomische en veilige rugtraining.' },
      { x: 80, y: 35, label: 'Cambiar Wand', description: 'Stijlvolle muurschildering: CAMBIAR personal training.' },
      { x: 82, y: 65, label: 'Concept2 RowErg', description: 'Luchtweerstand roeimachine voor warming-up en high intensity cardio.' },
    ]
  },
  {
    id: 'photo_smart_access',
    title: 'Stichting Cambiar & Smart PIN Lock',
    subtitle: 'Keyless deurslot met pincode (#), privacy & surround sound',
    zone: 'Foto 4 • Toegang & Missie',
    badge: 'Smart PIN & Privé Comfort',
    lighting: 'Verlicht digitaal keypad & sfeervolle studio privacy',
    description: 'De officiële Stichting Cambiar kwaliteitsgarantie: kom binnen met je 4-cijferige pincode (#), bedien je eigen muziek via Bluetooth surround sound en train in 100% rust.',
    tags: ['Smart Door Lock', 'PIN Code (#)', 'Stichting Cambiar', 'Bluetooth Audio', '100% Privé'],
    hotspots: [
      { x: 30, y: 50, label: 'Smart PIN Keypad', description: 'Toets je 4-cijferige pincode in op het deurslot (bijv. 4829#) voor directe toegang.' },
      { x: 70, y: 30, label: 'Stichting Cambiar', description: 'Toegankelijke topfaciliteiten met focus op gezondheid en leefstijl.' },
      { x: 70, y: 70, label: 'Bluetooth Surround', description: 'Koppel direct je telefoon en train met je eigen Spotify playlists.' },
    ]
  }
];

// Interactive SVG Photographic Renderings for each photo
export const RenderPhotoSVG: React.FC<{ photoId: string; className?: string }> = ({ photoId, className = 'w-full h-full' }) => {
  if (photoId === 'photo_cable_smith') {
    return (
      <svg viewBox="0 0 800 500" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* OSB wooden texture gradient */}
          <linearGradient id="osbBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c221b" />
            <stop offset="50%" stopColor="#3d2f23" />
            <stop offset="100%" stopColor="#251c16" />
          </linearGradient>

          {/* Electric blue neon glow */}
          <filter id="neonGlowBlue" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="steelBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#666" />
            <stop offset="50%" stopColor="#111" />
            <stop offset="100%" stopColor="#444" />
          </linearGradient>
          <linearGradient id="redBar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Studio Background - Dark OSB wood wall */}
        <rect width="800" height="500" fill="url(#osbBg)" />
        
        {/* OSB Texture Flakes */}
        <g opacity="0.15" fill="#fcd34d">
          <rect x="50" y="40" width="30" height="15" transform="rotate(12 50 40)" />
          <rect x="120" y="90" width="45" height="18" transform="rotate(-25 120 90)" />
          <rect x="240" y="50" width="35" height="12" transform="rotate(8 240 50)" />
          <rect x="650" y="80" width="50" height="20" transform="rotate(18 650 80)" />
          <rect x="710" y="140" width="40" height="15" transform="rotate(-15 710 140)" />
          <rect x="180" y="220" width="40" height="15" transform="rotate(30 180 220)" />
          <rect x="620" y="240" width="55" height="16" transform="rotate(-10 620 240)" />
        </g>

        {/* Floor - Dark rubber matting */}
        <polygon points="0,420 800,420 800,500 0,500" fill="#141416" />
        <line x1="0" y1="420" x2="800" y2="420" stroke="#27272a" strokeWidth="2" />

        {/* Top Electric Blue Neon LED Strip */}
        <rect x="80" y="18" width="640" height="8" rx="4" fill="#38bdf8" filter="url(#neonGlowBlue)" />
        <rect x="100" y="20" width="600" height="4" rx="2" fill="#ffffff" />
        {/* Blue ambient light wash over the machine */}
        <ellipse cx="400" cy="120" rx="340" ry="120" fill="#0284c7" opacity="0.18" />

        {/* Hanging Pothos Plant on Top Right */}
        <g transform="translate(680, 50)">
          <path d="M 0,0 L 0,40" stroke="#71717a" strokeWidth="2" />
          <ellipse cx="0" cy="45" rx="22" ry="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          {/* Leaves */}
          <path d="M -15,45 Q -25,75 -10,95 Q -5,75 -10,45" fill="#22c55e" opacity="0.9" />
          <path d="M 10,45 Q 25,80 15,110 Q 5,80 5,45" fill="#16a34a" opacity="0.85" />
          <path d="M -5,50 Q -10,105 0,130 Q 5,100 0,50" fill="#15803d" opacity="0.9" />
          <path d="M 5,50 Q 20,65 28,85 Q 15,70 5,50" fill="#4ade80" opacity="0.8" />
        </g>

        {/* Multi-Cable Smith Machine Structure */}
        {/* Main Vertical Uprights */}
        <g fill="#09090b" stroke="#27272a" strokeWidth="3">
          {/* Left Tower */}
          <rect x="160" y="50" width="45" height="370" rx="4" />
          {/* Right Tower */}
          <rect x="595" y="50" width="45" height="370" rx="4" />
          {/* Inner Smith Guide Posts */}
          <rect x="250" y="60" width="16" height="360" fill="url(#steelBar)" stroke="#3f3f46" strokeWidth="1" />
          <rect x="534" y="60" width="16" height="360" fill="url(#steelBar)" stroke="#3f3f46" strokeWidth="1" />
        </g>

        {/* Top Frame & Multi-Grip Pull-Up Bar */}
        <rect x="150" y="45" width="500" height="24" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
        {/* Multi-grip handles */}
        <path d="M 280,65 L 340,90 L 400,90 L 460,90 L 520,65" fill="none" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="340" cy="90" r="4" fill="#e4e4e7" />
        <circle cx="460" cy="90" r="4" fill="#e4e4e7" />

        {/* Dual Cable Pulley Sliders */}
        {/* Left Slider */}
        <rect x="152" y="160" width="60" height="40" rx="4" fill="#27272a" stroke="#52525b" strokeWidth="2" />
        <circle cx="215" cy="180" r="10" fill="#dc2626" />
        <line x1="215" y1="180" x2="260" y2="230" stroke="#a1a1aa" strokeWidth="3" />
        <circle cx="260" cy="230" r="6" fill="#18181b" stroke="#a1a1aa" strokeWidth="2" />

        {/* Right Slider */}
        <rect x="588" y="160" width="60" height="40" rx="4" fill="#27272a" stroke="#52525b" strokeWidth="2" />
        <circle cx="585" cy="180" r="10" fill="#dc2626" />
        <line x1="585" y1="180" x2="540" y2="230" stroke="#a1a1aa" strokeWidth="3" />
        <circle cx="540" cy="230" r="6" fill="#18181b" stroke="#a1a1aa" strokeWidth="2" />

        {/* Weight Stack Guides inside left & right */}
        <g fill="#18181b" stroke="#27272a">
          {/* Left Stack */}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={`l_${i}`} x="170" y={220 + i * 14} width="25" height="10" rx="1" />
          ))}
          {/* Right Stack */}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={`r_${i}`} x="605" y={220 + i * 14} width="25" height="10" rx="1" />
          ))}
        </g>

        {/* Smith Bar (Red Grip + Chromed Bar) */}
        <line x1="220" y1="210" x2="580" y2="210" stroke="#e4e4e7" strokeWidth="12" strokeLinecap="round" />
        <rect x="330" y="204" width="140" height="12" rx="3" fill="url(#redBar)" />
        {/* Weight Plates on Smith Bar Ends */}
        <rect x="228" y="165" width="14" height="90" rx="3" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
        <rect x="558" y="165" width="14" height="90" rx="3" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />

        {/* Center Adjustable Workout Bench (Incline) */}
        <g transform="translate(400, 370)">
          {/* Steel Frame Base */}
          <polygon points="-70,45 70,45 50,30 -50,30" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <line x1="0" y1="30" x2="0" y2="-40" stroke="#27272a" strokeWidth="14" strokeLinecap="round" />
          
          {/* Seat Cushion */}
          <rect x="-35" y="-30" width="70" height="18" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
          
          {/* Incline Backrest Pad */}
          <g transform="rotate(-30 0 -40)">
            <rect x="-32" y="-120" width="64" height="120" rx="6" fill="#09090b" stroke="#52525b" strokeWidth="3" />
            {/* Texture stitching */}
            <line x1="-20" y1="-110" x2="-20" y2="-10" stroke="#27272a" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="20" y1="-110" x2="20" y2="-10" stroke="#27272a" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="0" cy="-60" r="12" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
          </g>
        </g>

        {/* Studio Lighting Spec Text overlay in corner */}
        <text x="30" y="475" fill="#94a3b8" fontSize="12" fontFamily="monospace" letterSpacing="1.5">
          CAMBIAR • ZONE 1: SMITH & DUAL CABLE STATION
        </text>
      </svg>
    );
  }

  if (photoId === 'photo_power_rack') {
    return (
      <svg viewBox="0 0 800 500" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rackOsb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e231b" />
            <stop offset="70%" stopColor="#3d2f23" />
            <stop offset="100%" stopColor="#1c1612" />
          </linearGradient>

          {/* Warm stone wall uplight gradient */}
          <linearGradient id="stoneGlow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="bosuShine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>

        {/* OSB Backwall */}
        <rect width="800" height="420" fill="url(#rackOsb)" />

        {/* Natural Stone Border at Bottom Wall */}
        <rect x="0" y="340" width="800" height="80" fill="#2d2825" />
        {/* Stone texture bricks */}
        <g stroke="#1a1715" strokeWidth="2" fill="#3a332e">
          <rect x="20" y="345" width="80" height="22" rx="2" />
          <rect x="105" y="345" width="110" height="22" rx="2" />
          <rect x="220" y="345" width="95" height="22" rx="2" />
          <rect x="320" y="345" width="120" height="22" rx="2" />
          <rect x="445" y="345" width="90" height="22" rx="2" />
          <rect x="540" y="345" width="130" height="22" rx="2" />
          <rect x="675" y="345" width="105" height="22" rx="2" />

          <rect x="10" y="372" width="110" height="22" rx="2" />
          <rect x="125" y="372" width="90" height="22" rx="2" />
          <rect x="220" y="372" width="130" height="22" rx="2" />
          <rect x="355" y="372" width="100" height="22" rx="2" />
          <rect x="460" y="372" width="115" height="22" rx="2" />
          <rect x="580" y="372" width="95" height="22" rx="2" />
          <rect x="680" y="372" width="110" height="22" rx="2" />

          <rect x="25" y="398" width="95" height="20" rx="2" />
          <rect x="125" y="398" width="120" height="20" rx="2" />
          <rect x="250" y="398" width="85" height="20" rx="2" />
          <rect x="340" y="398" width="140" height="20" rx="2" />
          <rect x="485" y="398" width="105" height="20" rx="2" />
          <rect x="595" y="398" width="115" height="20" rx="2" />
          <rect x="715" y="398" width="75" height="20" rx="2" />
        </g>

        {/* Upward LED Glow on Stone Wall */}
        <rect x="0" y="300" width="800" height="120" fill="url(#stoneGlow)" />
        <line x1="0" y1="420" x2="800" y2="420" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />

        {/* Rubber Speckled Drop Floor */}
        <rect x="0" y="420" width="800" height="80" fill="#0d0d0f" />
        {/* Floor rubber flecks */}
        <g fill="#94a3b8" opacity="0.4">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={`fl_${i}`} cx={(i * 21) % 800} cy={425 + (i * 7) % 70} r={1.2} />
          ))}
        </g>

        {/* Heavy Duty Power Rack Cage */}
        {/* Back Uprights */}
        <rect x="250" y="60" width="30" height="360" fill="#18181b" stroke="#27272a" strokeWidth="2" />
        <rect x="520" y="60" width="30" height="360" fill="#18181b" stroke="#27272a" strokeWidth="2" />
        
        {/* Laser cut adjustment holes */}
        <g fill="#09090b">
          {Array.from({ length: 18 }).map((_, i) => (
            <React.Fragment key={`h_${i}`}>
              <circle cx="265" cy={100 + i * 16} r="3" />
              <circle cx="535" cy={100 + i * 16} r="3" />
            </React.Fragment>
          ))}
        </g>

        {/* Front Uprights */}
        <rect x="220" y="50" width="36" height="370" rx="3" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
        <rect x="544" y="50" width="36" height="370" rx="3" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
        
        {/* Front Holes */}
        <g fill="#27272a">
          {Array.from({ length: 18 }).map((_, i) => (
            <React.Fragment key={`fh_${i}`}>
              <circle cx="238" cy={90 + i * 17} r="3.5" />
              <circle cx="562" cy={90 + i * 17} r="3.5" />
            </React.Fragment>
          ))}
        </g>

        {/* Top Connecting Crossmembers & Pull-Up Bar */}
        <rect x="210" y="45" width="380" height="22" rx="3" fill="#18181b" stroke="#52525b" strokeWidth="2" />
        <line x1="250" y1="56" x2="550" y2="56" stroke="#71717a" strokeWidth="6" />

        {/* J-Hooks with Olympic Barbell */}
        {/* J-Hooks */}
        <polygon points="215,220 245,220 245,235 215,230" fill="#ef4444" />
        <polygon points="555,220 585,220 585,230 555,235" fill="#ef4444" />

        {/* Olympic Barbell */}
        <line x1="140" y1="218" x2="660" y2="218" stroke="#f4f4f5" strokeWidth="10" strokeLinecap="round" />
        {/* Knurling sections */}
        <line x1="320" y1="218" x2="380" y2="218" stroke="#a1a1aa" strokeWidth="10" strokeDasharray="2 1" />
        <line x1="420" y1="218" x2="480" y2="218" stroke="#a1a1aa" strokeWidth="10" strokeDasharray="2 1" />

        {/* Olympic Plates racked on Barbell */}
        {/* Left Plates (20kg + 10kg) */}
        <rect x="175" y="160" width="16" height="116" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
        <rect x="193" y="172" width="12" height="92" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
        <circle cx="183" cy="218" r="4" fill="#dc2626" />

        {/* Right Plates */}
        <rect x="609" y="160" width="16" height="116" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
        <rect x="595" y="172" width="12" height="92" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
        <circle cx="617" cy="218" r="4" fill="#dc2626" />

        {/* Bosu Balance Trainer Ball on Left Floor */}
        <g transform="translate(130, 440)">
          {/* Black platform base */}
          <ellipse cx="0" cy="18" rx="60" ry="12" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
          {/* Blue Dome */}
          <path d="M -52,14 C -52,-25 52,-25 52,14 Z" fill="url(#bosuShine)" stroke="#1d4ed8" strokeWidth="2" />
          {/* Bosu concentric grip rings */}
          <ellipse cx="0" cy="2" rx="35" ry="10" fill="none" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6" />
          <ellipse cx="0" cy="-6" rx="20" ry="6" fill="none" stroke="#93c5fd" strokeWidth="1.5" opacity="0.7" />
          <circle cx="0" cy="-10" r="3" fill="#ffffff" opacity="0.8" />
        </g>

        {/* Text overlay */}
        <text x="30" y="475" fill="#94a3b8" fontSize="12" fontFamily="monospace" letterSpacing="1.5">
          CAMBIAR • ZONE 2: HEAVY DUTY POWER RACK & DROP ZONE
        </text>
      </svg>
    );
  }

  if (photoId === 'photo_mirrors_corridor') {
    return (
      <svg viewBox="0 0 800 500" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Golden Amber Backlight Glow for the 3 Oval Mirrors */}
          <filter id="amberHalo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>

          {/* Wooden parquet floor perspective */}
          <linearGradient id="woodFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* Dark Hallway Walls */}
        <rect width="800" height="350" fill="#0f1115" />

        {/* Acoustic Slatted Ceiling */}
        <g stroke="#1e2025" strokeWidth="3">
          {Array.from({ length: 25 }).map((_, i) => (
            <line key={`ceil_${i}`} x1={i * 32} y1="0" x2={i * 32} y2="40" />
          ))}
        </g>
        <line x1="0" y1="40" x2="800" y2="40" stroke="#27272a" strokeWidth="2" />

        {/* Wooden Parquet Floor with Planks */}
        <polygon points="0,350 800,350 800,500 0,500" fill="url(#woodFloor)" />
        {/* Parquet Plank perspective lines */}
        <g stroke="#b45309" strokeWidth="1" opacity="0.3">
          <line x1="0" y1="350" x2="0" y2="500" />
          <line x1="120" y1="350" x2="80" y2="500" />
          <line x1="260" y1="350" x2="220" y2="500" />
          <line x1="400" y1="350" x2="380" y2="500" />
          <line x1="540" y1="350" x2="560" y2="500" />
          <line x1="680" y1="350" x2="720" y2="500" />
          <line x1="800" y1="350" x2="800" y2="500" />
        </g>

        {/* Mural on the Wall: "CAMBIAR personal training" with silhouette */}
        <g transform="translate(560, 90)">
          {/* Athlete silhouette */}
          <path d="M 120,40 Q 130,20 145,25 Q 155,30 150,45 Q 165,40 180,60 L 160,85 L 140,75 L 135,110 L 115,105 L 125,70 Z" fill="#ffffff" opacity="0.85" />
          <text x="0" y="60" fill="#ffffff" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="4">
            CAMBIAR
          </text>
          <text x="5" y="80" fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="sans-serif" letterSpacing="3">
            PERSONAL TRAINING
          </text>
        </g>

        {/* 3 Large Backlit Oval Mirrors with Golden Halo */}
        {/* Mirror 1 */}
        <g transform="translate(100, 70)">
          {/* Halo Glow */}
          <ellipse cx="45" cy="115" rx="42" ry="98" fill="#f59e0b" filter="url(#amberHalo)" opacity="0.4" />
          {/* Gold Rim */}
          <ellipse cx="45" cy="115" rx="40" ry="95" fill="url(#mirrorGlass)" stroke="#fbbf24" strokeWidth="3" />
          {/* Inner Mirror Reflection */}
          <ellipse cx="45" cy="115" rx="36" ry="90" fill="#1e1b18" opacity="0.6" />
          <line x1="25" y1="40" x2="65" y2="190" stroke="#fef08a" strokeWidth="2" opacity="0.3" strokeDasharray="30 20" />
        </g>

        {/* Mirror 2 */}
        <g transform="translate(220, 70)">
          {/* Halo Glow */}
          <ellipse cx="45" cy="115" rx="42" ry="98" fill="#f59e0b" filter="url(#amberHalo)" opacity="0.4" />
          {/* Gold Rim */}
          <ellipse cx="45" cy="115" rx="40" ry="95" fill="url(#mirrorGlass)" stroke="#fbbf24" strokeWidth="3" />
          {/* Inner Reflection */}
          <ellipse cx="45" cy="115" rx="36" ry="90" fill="#1e1b18" opacity="0.6" />
          <line x1="25" y1="40" x2="65" y2="190" stroke="#fef08a" strokeWidth="2" opacity="0.3" strokeDasharray="30 20" />
        </g>

        {/* Mirror 3 */}
        <g transform="translate(340, 70)">
          {/* Halo Glow */}
          <ellipse cx="45" cy="115" rx="42" ry="98" fill="#f59e0b" filter="url(#amberHalo)" opacity="0.4" />
          {/* Gold Rim */}
          <ellipse cx="45" cy="115" rx="40" ry="95" fill="url(#mirrorGlass)" stroke="#fbbf24" strokeWidth="3" />
          {/* Inner Reflection */}
          <ellipse cx="45" cy="115" rx="36" ry="90" fill="#1e1b18" opacity="0.6" />
          <line x1="25" y1="40" x2="65" y2="190" stroke="#fef08a" strokeWidth="2" opacity="0.3" strokeDasharray="30 20" />
        </g>

        {/* VirtuFit Weight Plate Tree loaded with bumper plates */}
        <g transform="translate(480, 240)">
          {/* Black Tree Frame */}
          <polygon points="25,0 45,0 55,140 15,140" fill="#09090b" stroke="#27272a" strokeWidth="2" />
          <rect x="0" y="135" width="70" height="12" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          
          {/* Weight plates branches */}
          {/* Top Peg with 5kg plates */}
          <line x1="-15" y1="35" x2="35" y2="35" stroke="#52525b" strokeWidth="6" />
          <rect x="-15" y="15" width="10" height="40" rx="2" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
          
          {/* Mid Peg with 10kg & 15kg plates */}
          <line x1="35" y1="75" x2="85" y2="75" stroke="#52525b" strokeWidth="8" />
          <rect x="55" y="45" width="14" height="60" rx="3" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
          <rect x="70" y="48" width="12" height="54" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />

          {/* Bottom Peg with 20kg plates */}
          <line x1="-30" y1="110" x2="35" y2="110" stroke="#52525b" strokeWidth="10" />
          <rect x="-30" y="70" width="16" height="80" rx="3" fill="#09090b" stroke="#52525b" strokeWidth="2" />
          <rect x="-12" y="75" width="14" height="70" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
        </g>

        {/* Hex Trap Bar (Deadlift Bar) lying on floor */}
        <g transform="translate(320, 390)">
          {/* Hexagon shape */}
          <polygon points="40,0 90,-20 150,-20 200,0 150,20 90,20" fill="none" stroke="#09090b" strokeWidth="8" strokeLinejoin="round" />
          <polygon points="40,0 90,-20 150,-20 200,0 150,20 90,20" fill="none" stroke="#71717a" strokeWidth="4" strokeLinejoin="round" />
          {/* Handles */}
          <line x1="85" y1="-18" x2="155" y2="-18" stroke="#f4f4f5" strokeWidth="5" />
          <line x1="85" y1="18" x2="155" y2="18" stroke="#f4f4f5" strokeWidth="5" />
          {/* Side Barbell Sleeves */}
          <line x1="0" y1="0" x2="40" y2="0" stroke="#e4e4e7" strokeWidth="8" />
          <line x1="200" y1="0" x2="240" y2="0" stroke="#e4e4e7" strokeWidth="8" />
        </g>

        {/* Concept2 RowErg in distance right */}
        <g transform="translate(670, 310)">
          {/* Flywheel */}
          <circle cx="25" cy="45" r="22" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
          <circle cx="25" cy="45" r="8" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
          {/* Monorail rail */}
          <line x1="35" y1="52" x2="110" y2="58" stroke="#52525b" strokeWidth="6" />
          {/* Seat & Legs */}
          <rect x="70" y="44" width="16" height="8" rx="2" fill="#09090b" />
          <line x1="110" y1="58" x2="115" y2="78" stroke="#27272a" strokeWidth="4" />
          <line x1="20" y1="65" x2="15" y2="82" stroke="#27272a" strokeWidth="4" />
        </g>

        {/* Text overlay */}
        <text x="30" y="475" fill="#94a3b8" fontSize="12" fontFamily="monospace" letterSpacing="1.5">
          CAMBIAR • ZONE 3: OVAL BACKLIT MIRRORS & TRAP BAR CORRIDOR
        </text>
      </svg>
    );
  }

  // Photo 4: Stichting Cambiar & Smart PIN Lock
  return (
    <svg viewBox="0 0 800 500" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dark background */}
      <rect width="800" height="500" fill="#09090b" />
      <circle cx="250" cy="250" r="220" fill="url(#pinGlow)" />

      {/* Digital Smart Door Lock Keypad Housing */}
      <g transform="translate(140, 70)">
        {/* Metal door lock plate */}
        <rect x="0" y="0" width="220" height="360" rx="24" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />
        
        {/* Status display */}
        <rect x="25" y="30" width="170" height="50" rx="8" fill="#09090b" stroke="#27272a" strokeWidth="2" />
        <text x="110" y="55" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
          CAMBIAR SMART LOCK
        </text>
        <text x="110" y="72" fill="#22c55e" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
          PIN: 4 8 2 9 #
        </text>

        {/* Glowing Touch Digits */}
        <g fill="#27272a" stroke="#52525b" strokeWidth="1.5">
          {/* Row 1 */}
          <circle cx="55" cy="120" r="20" />
          <circle cx="110" cy="120" r="20" />
          <circle cx="165" cy="120" r="20" />
          {/* Row 2 */}
          <circle cx="55" cy="175" r="20" />
          <circle cx="110" cy="175" r="20" />
          <circle cx="165" cy="175" r="20" />
          {/* Row 3 */}
          <circle cx="55" cy="230" r="20" />
          <circle cx="110" cy="230" r="20" />
          <circle cx="165" cy="230" r="20" />
          {/* Row 4 */}
          <circle cx="55" cy="285" r="20" />
          <circle cx="110" cy="285" r="20" />
          <circle cx="165" cy="285" r="20" fill="#0284c7" stroke="#38bdf8" />
        </g>

        {/* Keypad Labels */}
        <g fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
          <text x="55" y="120">1</text>
          <text x="110" y="120">2</text>
          <text x="165" y="120">3</text>
          <text x="55" y="175">4</text>
          <text x="110" y="175">5</text>
          <text x="165" y="175">6</text>
          <text x="55" y="230">7</text>
          <text x="110" y="230">8</text>
          <text x="165" y="230">9</text>
          <text x="55" y="285">*</text>
          <text x="110" y="285">0</text>
          <text x="165" y="285">#</text>
        </g>

        {/* Handle at bottom */}
        <rect x="75" y="325" width="70" height="14" rx="4" fill="#52525b" stroke="#71717a" strokeWidth="1" />
      </g>

      {/* Stichting Cambiar Mission & Badge Card */}
      <g transform="translate(420, 90)">
        <rect x="0" y="0" width="330" height="320" rx="16" fill="#121316" stroke="#27272a" strokeWidth="2" />
        
        {/* Header Globe Logo */}
        <circle cx="50" cy="50" r="26" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
        <path d="M 32,50 Q 50,65 68,50" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <path d="M 50,24 Q 65,50 50,76" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <ellipse cx="50" cy="50" rx="16" ry="24" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

        <text x="90" y="42" fill="#38bdf8" fontSize="13" fontFamily="serif" fontStyle="italic">
          Stichting
        </text>
        <text x="90" y="62" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" letterSpacing="3">
          CAMBIAR
        </text>

        <line x1="20" y1="90" x2="310" y2="90" stroke="#27272a" strokeWidth="1" />

        {/* Feature Points */}
        <g transform="translate(25, 115)" fontSize="12" fill="#d4d4d8" fontFamily="sans-serif">
          {/* Point 1 */}
          <circle cx="10" cy="10" r="8" fill="#0284c7" />
          <text x="10" y="14" fill="#ffffff" fontSize="10" textAnchor="middle">✓</text>
          <text x="28" y="14" fontWeight="bold" fill="#ffffff">100% Exclusieve Privé Gym</text>
          <text x="28" y="30" fontSize="11" fill="#a1a1aa">Geen personeel of meekijkende vreemden</text>

          {/* Point 2 */}
          <circle cx="10" cy="58" r="8" fill="#0284c7" />
          <text x="10" y="62" fill="#ffffff" fontSize="10" textAnchor="middle">✓</text>
          <text x="28" y="62" fontWeight="bold" fill="#ffffff">Smart PIN Deurtoegang</text>
          <text x="28" y="78" fontSize="11" fill="#a1a1aa">PIN code direct actief tijdens je tijdslot</text>

          {/* Point 3 */}
          <circle cx="10" cy="106" r="8" fill="#0284c7" />
          <text x="10" y="110" fill="#ffffff" fontSize="10" textAnchor="middle">✓</text>
          <text x="28" y="110" fontWeight="bold" fill="#ffffff">Eigen Bluetooth Audio</text>
          <text x="28" y="126" fontSize="11" fill="#a1a1aa">Verbind je eigen Spotify met surround sound</text>

          {/* Point 4 */}
          <circle cx="10" cy="154" r="8" fill="#0284c7" />
          <text x="10" y="158" fill="#ffffff" fontSize="10" textAnchor="middle">✓</text>
          <text x="28" y="158" fontWeight="bold" fill="#ffffff">Maandelijks Opzegbaar</text>
          <text x="28" y="174" fontSize="11" fill="#a1a1aa">100% flexibel zonder wurgcontracten</text>
        </g>
      </g>

      {/* Text overlay */}
      <text x="30" y="475" fill="#94a3b8" fontSize="12" fontFamily="monospace" letterSpacing="1.5">
        CAMBIAR • ZONE 4: STICHTING CAMBIAR & SMART PIN LOCK SYSTEM
      </text>
    </svg>
  );
};

export const StudioPhotos: React.FC = () => {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);

  const currentPhoto = CAMBIAR_PHOTOS[activePhotoIdx];

  return (
    <section id="studio-photos" className="py-16 sm:py-24 bg-zinc-950 border-b border-zinc-900 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Section Header with Cambiar Identity */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sky-400 text-[11px] font-mono">
              <Camera className="w-3.5 h-3.5" />
              <span>Studio Foto's & Interactieve Tour</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              Geïntegreerde Studio Foto's
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Bekijk de 4 officiële zones van studio Cambiar in detail: de verlichte ovaal spiegels, Smith & kabelstation, heavy power rack en smart PIN deurslot. Klik op de interactieve hotspots voor apparatuurspecificaties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CambiarLogo variant="globe" />
          </div>
        </div>

        {/* Main Photo Viewer Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Main Photo Canvas */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-zinc-950 overflow-hidden group">
            
            {/* Display our high-fidelity SVG render */}
            <RenderPhotoSVG photoId={currentPhoto.id} className="w-full h-full" />

            {/* Interactive Hotspots Overlaid on the Photo */}
            {currentPhoto.hotspots.map((spot, idx) => {
              const isSelected = selectedHotspot === idx;
              return (
                <div
                  key={idx}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => setSelectedHotspot(isSelected ? null : idx)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isSelected
                        ? 'bg-sky-400 text-zinc-950 scale-125 ring-4 ring-sky-400/40'
                        : 'bg-zinc-900/90 text-white hover:bg-sky-500 hover:text-white border border-white/40 ring-2 ring-black/60'
                    }`}
                    title={spot.label}
                  >
                    <span className="text-[11px] font-bold font-mono">{idx + 1}</span>
                  </button>

                  {/* Hotspot Popup Tooltip */}
                  {isSelected && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 p-3 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-md z-30 pointer-events-auto text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white font-['Cabinet_Grotesk']">
                          {spot.label}
                        </span>
                        <span className="text-[9px] font-mono text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                        {spot.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Top Bar on Photo */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="px-3 py-1 rounded-lg bg-zinc-950/85 border border-zinc-800 text-zinc-200 text-xs font-mono backdrop-blur-md flex items-center gap-2 pointer-events-auto shadow-md">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="font-semibold">{currentPhoto.zone}</span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-mono backdrop-blur-md transition flex items-center gap-1.5 shadow-md"
                  title="Volledig scherm openen"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Vergroten</span>
                </button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => {
                setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : CAMBIAR_PHOTOS.length - 1));
                setSelectedHotspot(null);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center backdrop-blur-sm transition opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setActivePhotoIdx((prev) => (prev < CAMBIAR_PHOTOS.length - 1 ? prev + 1 : 0));
                setSelectedHotspot(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center backdrop-blur-sm transition opacity-80 hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

          {/* Photo Details & Tag Bar */}
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-sky-400 font-bold">
                    {currentPhoto.badge}
                  </span>
                  <span className="text-zinc-600">&bull;</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {currentPhoto.lighting}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
                  {currentPhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                  {currentPhoto.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-850">
              <span className="text-xs font-mono text-zinc-400 mr-2">Aanwezig:</span>
              {currentPhoto.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>

        </div>

        {/* 4 Photo Thumbnails Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {CAMBIAR_PHOTOS.map((p, idx) => {
            const isSelected = activePhotoIdx === idx;

            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePhotoIdx(idx);
                  setSelectedHotspot(null);
                }}
                className={`p-3 rounded-2xl border text-left transition group overflow-hidden relative ${
                  isSelected
                    ? 'bg-zinc-900 border-sky-500/80 shadow-lg ring-2 ring-sky-500/30'
                    : 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                {/* Mini Preview Box */}
                <div className="aspect-[16/10] w-full rounded-xl bg-zinc-950 overflow-hidden mb-2.5 relative border border-zinc-800">
                  <RenderPhotoSVG photoId={p.id} className="w-full h-full" />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                    0{idx + 1}
                  </span>
                </div>

                <span className="text-xs font-bold text-zinc-100 block line-clamp-1 font-['Cabinet_Grotesk'] group-hover:text-sky-300 transition">
                  {p.title.split('&')[0]}
                </span>
                <span className="text-[10px] text-zinc-400 block line-clamp-1 font-mono mt-0.5">
                  {p.badge}
                </span>

                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-amber-300" />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-lg">
          <div className="w-full max-w-5xl flex items-center justify-between pb-3 text-zinc-300">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-sky-400 font-bold">
                {currentPhoto.zone}
              </span>
              <span className="text-sm font-bold text-white font-['Cabinet_Grotesk']">
                {currentPhoto.title}
              </span>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono"
            >
              Sluiten (ESC)
            </button>
          </div>

          <div className="relative w-full max-w-5xl aspect-[16/9] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <RenderPhotoSVG photoId={currentPhoto.id} className="w-full h-full" />
          </div>
        </div>
      )}
    </section>
  );
};
