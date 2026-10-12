export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:00 (e.g. '07:00')
  endTime: string; // HH:00 (e.g. '08:00')
  durationMinutes: number; // 60
  isAvailable: boolean;
  price: number; // Single hour rental price in EUR
  bookedBy?: string;
}

export interface SlotBooking {
  id: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  notes?: string;
  accessPin: string; // e.g. "8492#" for the smart door lock
  qrCodeValue: string;
  status: 'confirmed' | 'cancelled';
  paidVia: 'Lidmaatschap' | 'iDEAL' | 'Creditcard' | 'Apple Pay' | 'Bancontact' | string;
  amountPaid: number;
  createdAt: string;
  cancelledAt?: string;
  cancelledBy?: 'gebruiker' | 'beheerder' | string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  monthlyHours: number | 'onbeperkt';
  price: number;
  interval: 'maand';
  description: string;
  tag?: string;
  popular?: boolean;
  features: string[];
  stripePriceId?: string;
  cancellationNotice: string;
}

export interface MemberSubscription {
  id: string;
  planId: string;
  planName: string;
  price: number;
  monthlyHours: number | 'onbeperkt';
  remainingHoursThisMonth: number;
  status: 'active' | 'paused' | 'cancelled';
  startedAt: string;
  nextBillingDate: string;
  paymentMethod: 'iDEAL' | 'Creditcard' | 'SEPA Incasso' | 'Apple Pay' | 'Bancontact';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  memberName: string;
  memberEmail: string;
  isMonthlyCancellable: boolean;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl?: string;
  description: string;
}

export interface StudioFeature {
  id: string;
  category: string;
  title: string;
  specs: string[];
  description: string;
  image: string;
}

export interface GymReview {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  memberSince: string;
  subscription?: MemberSubscription | null;
  role: 'admin' | 'member' | 'trainer' | 'guest';
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'member' | 'trainer' | 'guest';
  memberSince: string;
  subscription: MemberSubscription | null;
  totalBookings: number;
  confirmedBookings?: number;
  cancelledBookings?: number;
}

export interface HeroVideoSettings {
  enabled: boolean;
  videoUrl: string;
  posterUrl?: string;
  overlayOpacity: number; // 0 to 95 (%)
  playbackSpeed: number; // 0.5 to 1.5
  title?: string;
  muted: boolean;
  loop: boolean;
}
