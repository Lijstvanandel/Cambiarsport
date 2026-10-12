import { createClient, Client } from '@libsql/client';
import path from 'path';

// Initialize SQLite database file in the workspace
const dbPath = path.resolve(process.cwd(), 'cambiar.db');
export const db: Client = createClient({
  url: `file:${dbPath}`,
});

export interface DBUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  role: 'admin' | 'member' | 'trainer' | 'guest';
  member_since: string;
  token: string;
  created_at: string;
}

export interface DBSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  monthly_hours: string; // '4', '8', 'onbeperkt'
  remaining_hours: number;
  status: 'active' | 'paused' | 'cancelled';
  started_at: string;
  next_billing_date: string;
  payment_method: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  member_name: string;
  member_email: string;
  is_monthly_cancellable: number; // 1 = true, 0 = false
  created_at: string;
}

export interface DBBooking {
  id: string;
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  notes?: string;
  access_pin: string;
  qr_code_value: string;
  status: 'confirmed' | 'cancelled';
  paid_via: string;
  amount_paid: number;
  created_at: string;
}

export async function initSQLiteDatabase() {
  console.log('📦 Initializing SQLite Database at:', dbPath);

  // 1. Create tables if they do not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      member_since TEXT NOT NULL,
      token TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      price REAL NOT NULL,
      monthly_hours TEXT NOT NULL,
      remaining_hours REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      started_at TEXT NOT NULL,
      next_billing_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      stripe_subscription_id TEXT,
      stripe_customer_id TEXT,
      member_name TEXT NOT NULL,
      member_email TEXT NOT NULL,
      is_monthly_cancellable INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      slot_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT,
      notes TEXT,
      access_pin TEXT NOT NULL,
      qr_code_value TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      paid_via TEXT NOT NULL,
      amount_paid REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      cancelled_at TEXT,
      cancelled_by TEXT
    );
  `);

  // Migration helper for existing databases
  try {
    await db.execute('ALTER TABLE bookings ADD COLUMN cancelled_at TEXT');
  } catch (e) {
    // Column already exists
  }
  try {
    await db.execute('ALTER TABLE bookings ADD COLUMN cancelled_by TEXT');
  } catch (e) {
    // Column already exists
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Default Hero Video Setting
  const defaultHeroVideo = {
    enabled: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-heavy-ropes-in-a-gym-42636-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
    overlayOpacity: 70,
    playbackSpeed: 0.85,
    title: 'Cinematic Gym Atmosphere',
    muted: true,
    loop: true,
  };

  await db.execute({
    sql: `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
    args: ['hero_video_settings', JSON.stringify(defaultHeroVideo), new Date().toISOString()],
  });

  // Create SQLite performance indexes
  await db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_subs_member_email ON subscriptions(member_email);');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings(user_email);');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);');

  // 2. Check if users are seeded, if not seed default users
  const userCountResult = await db.execute('SELECT COUNT(*) as count FROM users');
  const count = Number(userCountResult.rows[0]?.count || 0);

  if (count === 0) {
    console.log('🌱 Seeding default Cambiar users and subscriptions in SQLite...');

    // Seed Admin
    await db.execute({
      sql: `INSERT INTO users (id, email, password, name, phone, role, member_since, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_admin_cambiar',
        'beheerder@cambiar.nl',
        'admin',
        'Cambiar Beheerder (Admin)',
        '06 55550000',
        'admin',
        'Januari 2026',
        'token_cambiar_admin_master_001',
        new Date().toISOString(),
      ],
    });

    await db.execute({
      sql: `INSERT INTO users (id, email, password, name, phone, role, member_since, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_admin_cambiar_alt',
        'admin@cambiar.nl',
        'admin',
        'Studio Manager',
        '06 55550001',
        'admin',
        'Januari 2026',
        'token_cambiar_admin_master_002',
        new Date().toISOString(),
      ],
    });

    // Seed Alex de Vries
    await db.execute({
      sql: `INSERT INTO users (id, email, password, name, phone, role, member_since, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_alex_1',
        'alex@cambiar.nl',
        'password123',
        'Alex de Vries',
        '06 12345678',
        'member',
        'Februari 2026',
        'token_cambiar_alex_demo_987',
        new Date().toISOString(),
      ],
    });

    // Seed Tester Unlimited Account (Endless bookings)
    await db.execute({
      sql: `INSERT OR IGNORE INTO users (id, email, password, name, phone, role, member_since, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_unlimited_tester',
        'unlimited@cambiar.nl',
        'demo123',
        'Tester Unlimited (Onbeperkt)',
        '06 99991111',
        'member',
        'Januari 2026',
        'token_cambiar_unlimited_tester',
        new Date().toISOString(),
      ],
    });

    await db.execute({
      sql: `INSERT OR IGNORE INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'sub_unlimited_tester',
        'plan_unlimited',
        'Cambiar Unlimited (Onbeperkt)',
        199.00,
        'onbeperkt',
        999,
        'active',
        new Date().toISOString(),
        '1 van volgende maand',
        'Demo Unlimited',
        'Tester Unlimited (Onbeperkt)',
        'unlimited@cambiar.nl',
        1,
        new Date().toISOString(),
      ],
    });


    // Seed Subscriptions for Alex and Sarah
    await db.execute({
      sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'sub_cambiar_1',
        'plan_8h',
        'Cambiar Flex 8',
        119.00,
        '8',
        7,
        'active',
        new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
        'iDEAL (via Stripe)',
        'Alex de Vries',
        'alex@cambiar.nl',
        1,
        new Date().toISOString(),
      ],
    });

    await db.execute({
      sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'sub_cambiar_2',
        'plan_unlimited',
        'Cambiar Unlimited',
        199.00,
        'onbeperkt',
        999,
        'active',
        new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
        'Creditcard',
        'Sarah van den Berg',
        'sarah@cambiar.nl',
        1,
        new Date().toISOString(),
      ],
    });

    // Seed a sample booking
    const todayStr = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: `INSERT INTO bookings (id, slot_id, date, start_time, end_time, user_name, user_email, user_phone, access_pin, qr_code_value, status, paid_via, amount_paid, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'bk_cambiar_1',
        `slot_${todayStr}_1800`,
        todayStr,
        '18:00',
        '19:00',
        'Alex de Vries',
        'alex@cambiar.nl',
        '06 12345678',
        '4829#',
        `CAMBIAR:DOOR:4829:${todayStr}:18:00`,
        'confirmed',
        'Lidmaatschap',
        0,
        new Date().toISOString(),
      ],
    });

    console.log('✅ SQLite seeding complete!');
  }
}
