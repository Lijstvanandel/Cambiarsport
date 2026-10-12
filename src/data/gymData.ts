import { TimeSlot, MembershipPlan, StudioFeature, GymReview } from '../types';

export const SINGLE_HOUR_PRICE = 24.00; // Single 1-hour private booking price in EUR

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan_4h',
    name: 'Cambiar Flex 4',
    monthlyHours: 4,
    price: 69.00,
    interval: 'maand',
    description: 'Voor wie 1x per week in alle rust en privacy wil trainen in studio Cambiar.',
    features: [
      '4 exclusieve privé-uren per maand',
      'Kosteloos 1 trainingspartner meenemen',
      '100% Maandelijks opzegbaar met 1 klik',
      'Smart Lock PIN toegangscode per gereserveerd uur',
      'Toegang tot Power Rack, Smith Machine & Cable zone',
      'Tot 14 dagen vooraf uren inplannen',
      'Eigen Spotify/muziek via surround sound',
    ],
    cancellationNotice: '100% Maandelijks opzegbaar. Geen vaste contractperiode.',
  },
  {
    id: 'plan_8h',
    name: 'Cambiar Flex 8',
    monthlyHours: 8,
    price: 119.00,
    interval: 'maand',
    popular: true,
    tag: 'Meest Gekozen',
    description: 'Ideaal voor 2 gerichte trainingssessies per week in je eigen privégym.',
    features: [
      '8 exclusieve privé-uren per maand',
      'Tot 2 trainingspartners of personal trainer meenemen',
      '100% Maandelijks opzegbaar met 1 klik',
      'Smart Lock PIN toegangscode per gereserveerd uur',
      'Volledige studio: Power Rack, Cable Station, Hex Bar & RowErg',
      'Tot 21 dagen vooraf uren inplannen',
      'Instelbare LED-sfeerverlichting & eigen Bluetooth audio',
      'Gratis Nespresso & handdoekenservice',
    ],
    cancellationNotice: '100% Maandelijks opzegbaar. Direct stopzetten in je ledenportaal.',
  },
  {
    id: 'plan_unlimited',
    name: 'Cambiar Unlimited Privé',
    monthlyHours: 'onbeperkt',
    price: 199.00,
    interval: 'maand',
    description: 'Ultieme flexibiliteit. Train wanneer je wilt in jouw privéstudio.',
    features: [
      'Onbeperkt aantal 1-uurs slots per maand (max 1 tegelijk actief)',
      'Tot 3 personen of personal trainer per sessie toegestaan',
      '100% Maandelijks opzegbaar of kosteloos pauzeren',
      'Smart Lock PIN toegangscode per gereserveerd uur',
      'Tot 30 dagen vooraf reserveren',
      'Luxe spiegelwand met warm ambient backlight & blue LEDs',
      'Gratis Nespresso, mineraalwater & handdoekenservice',
    ],
    cancellationNotice: 'Maandelijks opzegbaar & kosteloos pauzeren tijdens vakantie',
  },
];

export const STUDIO_FEATURES: StudioFeature[] = [
  {
    id: 'feat_mirrors',
    category: 'Sfeer & Vrije Gewichten',
    title: 'Backlit Ovaal Spiegelwand & Trap Bar Zone',
    description: 'Luxe trainingsgang met verlichte ovale spiegels in warm goud, VirtuFit halterschijven rek, EZ-curl bar, Hex Trap Bar voor deadlifts en de iconische Cambiar wand.',
    specs: [
      'Warm LED backlit ovale designspiegels',
      'Hex Trap Bar voor ergonomische deadlifts',
      'VirtuFit gewichtsschijvenrek & EZ-bar',
      'Sfeervolle houten vloer & ambient lighting'
    ],
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'feat_cable_smith',
    category: 'Krachttraining & Isolatie',
    title: 'Multi-Functional Smith & Dual Cable Station',
    description: 'Compleet multifunctioneel station met soepele kabel pulleys, Smith bar geleider, lat pull-downs, cable crossovers en verstelbare trainingsbank onder neon-blauwe sfeerverlichting.',
    specs: [
      'Dual Adjustable Cable Pulley System',
      'Smith Machine met veiligheidsstops',
      'Multi-grip pull-up handles & lat bar',
      'Verstelbare incline/flat bench'
    ],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'feat_power_rack',
    category: 'Heavy Strength & Core',
    title: 'Heavy-Duty Power Rack & Schokdempende Vloer',
    description: 'Robuust squat rack met Olympische halterstang, zware rubberen dempingsmatten voor drops, Bosu balance ball en natuurlijke OSB houten accentwand met verlichte steenrand.',
    specs: [
      'Heavy-duty Squat & Power Rack',
      'Olympische Barbell & gewichtsschijven',
      'Dikke rubberen gymtegel geluiddemping',
      'Bosu ball, core trainers & weerstandsbanden'
    ],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'feat_cardio_sound',
    category: 'Cardio & Smart Tech',
    title: 'RowErg, Smart PIN Lock & Bluetooth Sound',
    description: 'Conditioneer met de professionele luchtweerstand roeitrainer en bedien je eigen muziek en verlichting in totale afzondering.',
    specs: [
      'Concept2 luchtweerstand RowErg',
      'Keyless Smart Door Lock PIN-systeem',
      'High-fidelity Bluetooth surround sound',
      'Privé kleedruimte & Nespresso bar'
    ],
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
  },
];

export const REVIEWS: GymReview[] = [
  {
    id: 'rev_1',
    name: 'Sander van Leeuwen',
    role: 'Cambiar Flex 8 Lid',
    rating: 5,
    comment: 'Cambiar is exact wat ik zocht. Geen wachttijden, een geweldig power rack en de sfeer met de verlichte ovale spiegels en blauwe LED verlichting maakt elke workout intens.',
    date: '1 week geleden',
  },
  {
    id: 'rev_2',
    name: 'Eline Meijer',
    role: 'Personal Trainer',
    rating: 5,
    comment: 'Ik huur de studio regelmatig af voor 1-op-1 personal training. Mijn cliënten zijn dol op de privacy, het gemak van de pincode bij de deur en de professionele Smith- en kabelmachine.',
    date: '3 weken geleden',
  },
  {
    id: 'rev_3',
    name: 'Rick Donkers',
    role: 'Cambiar Flex 4 Lid',
    rating: 5,
    comment: 'Binnenkomen met de PIN werkt supersnel. Geen personeel of gedoe, eigen playlist op de speakers en 60 minuten keihard trainen. Fijn dat het maandelijks opzegbaar is.',
    date: '1 maand geleden',
  },
];

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to generate 1-hour slots (06:00 to 23:00) for a given date range
export function generateHourlySlotsForDateRange(startDate: Date = new Date(), days: number = 14): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  for (let d = 0; d < days; d++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + d);
    const dateStr = getLocalDateString(current);

    hours.forEach((startHour) => {
      const endHourNum = parseInt(startHour.split(':')[0], 10) + 1;
      const endHour = `${endHourNum.toString().padStart(2, '0')}:00`;

      slots.push({
        id: `slot_${dateStr}_${startHour.replace(':', '')}`,
        date: dateStr,
        startTime: startHour,
        endTime: endHour,
        durationMinutes: 60,
        isAvailable: true,
        price: SINGLE_HOUR_PRICE,
      });
    });
  }

  return slots;
}

export function formatDutchDate(dateStr: string): string {
  try {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('nl-NL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return dateStr;
  }
}
