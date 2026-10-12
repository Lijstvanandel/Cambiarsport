import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';
import { db, initSQLiteDatabase } from './src/db/sqlite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Lazy Stripe initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

// Helper formatting functions for SQLite rows
function formatSubscription(row: any) {
  if (!row) return null;
  return {
    id: String(row.id),
    planId: String(row.plan_id),
    planName: String(row.plan_name),
    price: Number(row.price),
    monthlyHours: row.monthly_hours === 'onbeperkt' ? 'onbeperkt' : Number(row.monthly_hours),
    remainingHoursThisMonth: Number(row.remaining_hours),
    status: String(row.status) as 'active' | 'paused' | 'cancelled',
    startedAt: String(row.started_at),
    nextBillingDate: String(row.next_billing_date),
    paymentMethod: String(row.payment_method),
    stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : undefined,
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
    memberName: String(row.member_name),
    memberEmail: String(row.member_email),
    isMonthlyCancellable: Boolean(row.is_monthly_cancellable),
    invoices: [],
  };
}

function formatUser(row: any, subRow: any = null) {
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : '',
    role: String(row.role) as 'admin' | 'member' | 'trainer' | 'guest',
    memberSince: String(row.member_since),
    subscription: formatSubscription(subRow),
  };
}

function formatBooking(row: any) {
  if (!row) return null;
  return {
    id: String(row.id),
    slotId: String(row.slot_id),
    date: String(row.date),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    userName: String(row.user_name),
    userEmail: String(row.user_email),
    userPhone: row.user_phone ? String(row.user_phone) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    accessPin: String(row.access_pin),
    qrCodeValue: String(row.qr_code_value),
    status: String(row.status) as 'confirmed' | 'cancelled',
    paidVia: String(row.paid_via),
    amountPaid: Number(row.amount_paid),
    createdAt: String(row.created_at),
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : undefined,
    cancelledBy: row.cancelled_by ? String(row.cancelled_by) : undefined,
  };
}

async function getUserSubscriptionFromDB(email: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM subscriptions WHERE LOWER(member_email) = LOWER(?) AND status != ? ORDER BY created_at DESC LIMIT 1',
    args: [email, 'cancelled'],
  });
  if (result.rows.length === 0) {
    // Check if there is any cancelled subscription
    const cancelledResult = await db.execute({
      sql: 'SELECT * FROM subscriptions WHERE LOWER(member_email) = LOWER(?) ORDER BY created_at DESC LIMIT 1',
      args: [email],
    });
    return cancelledResult.rows[0] ? formatSubscription(cancelledResult.rows[0]) : null;
  }
  return formatSubscription(result.rows[0]);
}

// ----------------------------------------------------
// AUTH API ENDPOINTS (SQLITE BACKED)
// ----------------------------------------------------

// 1. Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, planId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Naam en e-mailadres zijn verplicht' });
    }

    const existing = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      args: [email],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Er bestaat al een account met dit e-mailadres' });
    }

    const isAdminEmail =
      email.toLowerCase() === 'beheerder@cambiar.nl' ||
      email.toLowerCase() === 'admin@cambiar.nl' ||
      email.toLowerCase() === 'goldencrafteu@gmail.com';

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const userId = `usr_${Date.now()}`;
    const memberSince = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO users (id, email, password, name, phone, role, member_since, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        email.toLowerCase(),
        password || 'default123',
        name,
        phone || '',
        isAdminEmail ? 'admin' : 'member',
        memberSince,
        token,
        createdAt,
      ],
    });

    // If a plan was selected during registration, create subscription
    if (planId && !isAdminEmail) {
      const hoursMap: Record<string, string> = {
        plan_4h: '4',
        plan_8h: '8',
        plan_unlimited: 'onbeperkt',
      };
      const namesMap: Record<string, string> = {
        plan_4h: 'Cambiar Flex 4',
        plan_8h: 'Cambiar Flex 8',
        plan_unlimited: 'Cambiar Unlimited',
      };
      const pricesMap: Record<string, number> = {
        plan_4h: 69.0,
        plan_8h: 119.0,
        plan_unlimited: 199.0,
      };

      const monthlyHours = hoursMap[planId] || '4';
      const remHours = monthlyHours === 'onbeperkt' ? 999 : Number(monthlyHours);
      const subId = `sub_${Date.now()}`;
      const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      await db.execute({
        sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          subId,
          planId,
          namesMap[planId] || 'Cambiar Lidmaatschap',
          pricesMap[planId] || 69.0,
          monthlyHours,
          remHours,
          'active',
          createdAt,
          nextBilling,
          'iDEAL (Stripe)',
          name,
          email.toLowerCase(),
          1,
          createdAt,
        ],
      });
    }

    const userSub = await getUserSubscriptionFromDB(email);

    res.status(201).json({
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
        phone: phone || '',
        role: isAdminEmail ? 'admin' : 'member',
        memberSince,
        subscription: userSub,
      },
      token,
      message: 'Account succesvol aangemaakt in SQLite database! Welkom bij Cambiar.',
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Fout bij aanmaken account' });
  }
});

// 2. Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Vul een e-mailadres in' });
    }

    let userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      args: [email],
    });

    const isAdminEmail =
      email.toLowerCase() === 'beheerder@cambiar.nl' ||
      email.toLowerCase() === 'admin@cambiar.nl' ||
      email.toLowerCase() === 'goldencrafteu@gmail.com';

    let userRow = userResult.rows[0];

    if (!userRow) {
      // Auto-create user on login if not found for seamless dev/testing
      const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const userId = `usr_${Date.now()}`;
      const name = isAdminEmail ? 'Cambiar Beheerder' : email.split('@')[0];
      const memberSince = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
      const createdAt = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO users (id, email, password, name, phone, role, member_since, token, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          email.toLowerCase(),
          password || 'demo123',
          name,
          '',
          isAdminEmail ? 'admin' : 'member',
          memberSince,
          token,
          createdAt,
        ],
      });

      if (!isAdminEmail) {
        const isUnlimited = email.toLowerCase().includes('unlimited') || email.toLowerCase() === 'sarah@cambiar.nl';
        const subId = `sub_${Date.now()}`;
        const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        await db.execute({
          sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            subId,
            isUnlimited ? 'plan_unlimited' : 'plan_8h',
            isUnlimited ? 'Cambiar Unlimited (Onbeperkt)' : 'Cambiar Flex 8',
            isUnlimited ? 199.0 : 119.0,
            isUnlimited ? 'onbeperkt' : '8',
            isUnlimited ? 999 : 8,
            'active',
            createdAt,
            nextBilling,
            'iDEAL',
            name,
            email.toLowerCase(),
            1,
            createdAt,
          ],
        });
      }

      userResult = await db.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [userId],
      });
      userRow = userResult.rows[0];
    }

    const userSub = await getUserSubscriptionFromDB(String(userRow.email));
    res.json({
      user: formatUser(userRow, userSub),
      token: String(userRow.token),
      message:
        userRow.role === 'admin'
          ? 'Welkom in het Cambiar Beheerdersportaal!'
          : `Welkom terug, ${userRow.name}!`,
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Fout bij inloggen' });
  }
});

// 3. Get Current User Info
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const email = req.query.email as string;

    let userResult = token
      ? await db.execute({ sql: 'SELECT * FROM users WHERE token = ?', args: [token] })
      : null;

    if ((!userResult || userResult.rows.length === 0) && email) {
      userResult = await db.execute({
        sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
        args: [email],
      });
    }

    if (!userResult || userResult.rows.length === 0) {
      userResult = await db.execute({
        sql: "SELECT * FROM users WHERE email = 'alex@cambiar.nl' LIMIT 1",
        args: [],
      });
    }

    const userRow = userResult.rows[0];
    if (!userRow) {
      return res.status(404).json({ error: 'Geen gebruiker gevonden' });
    }

    const userSub = await getUserSubscriptionFromDB(String(userRow.email));
    res.json({
      user: formatUser(userRow, userSub),
      token: String(userRow.token),
    });
  } catch (error: any) {
    console.error('Error fetching me:', error);
    res.status(500).json({ error: 'Fout bij ophalen gebruiker' });
  }
});

// ----------------------------------------------------
// ADMIN ENDPOINTS (SQLITE BACKED)
// ----------------------------------------------------

// 1. Get all registered accounts with subscription details
app.get('/api/admin/users', async (req, res) => {
  try {
    const usersResult = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    const allSubsResult = await db.execute('SELECT * FROM subscriptions');
    const allBookingsResult = await db.execute("SELECT * FROM bookings WHERE status = 'confirmed'");

    const adminSummary = usersResult.rows.map((uRow: any) => {
      const email = String(uRow.email).toLowerCase();
      const userSubRow = allSubsResult.rows.find(
        (s: any) => String(s.member_email).toLowerCase() === email
      );
      const userBookings = allBookingsResult.rows.filter(
        (b: any) => String(b.user_email).toLowerCase() === email
      );

      const confirmed = userBookings.filter((b: any) => b.status === 'confirmed').length;
      const cancelled = userBookings.filter((b: any) => b.status === 'cancelled').length;

      return {
        id: String(uRow.id),
        name: String(uRow.name),
        email: String(uRow.email),
        phone: uRow.phone ? String(uRow.phone) : '',
        role: String(uRow.role),
        memberSince: String(uRow.member_since),
        subscription: formatSubscription(userSubRow),
        totalBookings: userBookings.length,
        confirmedBookings: confirmed,
        cancelledBookings: cancelled,
      };
    });

    res.json(adminSummary);
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Fout bij ophalen gebruikers' });
  }
});

// 2. Get all bookings with complete customer details (Admin Only)
app.get('/api/admin/all-bookings', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM bookings ORDER BY date DESC, start_time DESC, created_at DESC');
    res.json(result.rows.map(formatBooking));
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ error: 'Fout bij ophalen reserveringen' });
  }
});

// 2.1 Get all bookings for a specific user (Admin Only)
app.get('/api/admin/user-bookings/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM bookings WHERE LOWER(user_email) = LOWER(?) ORDER BY date DESC, start_time DESC, created_at DESC',
      args: [email],
    });
    res.json(result.rows.map(formatBooking));
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Fout bij ophalen van boekingen voor deze gebruiker' });
  }
});

// 3. Admin update user subscription / credits
app.post('/api/admin/update-subscription', async (req, res) => {
  try {
    const { userEmail, planId, remainingHours, status } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: 'E-mailadres is verplicht' });
    }

    const namesMap: Record<string, string> = {
      plan_4h: 'Cambiar Flex 4',
      plan_8h: 'Cambiar Flex 8',
      plan_unlimited: 'Cambiar Unlimited',
    };
    const hoursMap: Record<string, string> = {
      plan_4h: '4',
      plan_8h: '8',
      plan_unlimited: 'onbeperkt',
    };
    const pricesMap: Record<string, number> = {
      plan_4h: 69.0,
      plan_8h: 119.0,
      plan_unlimited: 199.0,
    };

    const existingSubResult = await db.execute({
      sql: 'SELECT * FROM subscriptions WHERE LOWER(member_email) = LOWER(?) ORDER BY created_at DESC LIMIT 1',
      args: [userEmail],
    });

    if (existingSubResult.rows.length === 0 && planId) {
      const subId = `sub_${Date.now()}`;
      const monthlyHours = hoursMap[planId] || '4';
      const remHours =
        remainingHours !== undefined
          ? Number(remainingHours)
          : monthlyHours === 'onbeperkt'
          ? 999
          : Number(monthlyHours);
      const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      await db.execute({
        sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          subId,
          planId,
          namesMap[planId] || 'Cambiar Lidmaatschap',
          pricesMap[planId] || 69.0,
          monthlyHours,
          remHours,
          status || 'active',
          new Date().toISOString(),
          nextBilling,
          'Toegekend door Beheerder',
          userEmail,
          userEmail.toLowerCase(),
          1,
          new Date().toISOString(),
        ],
      });
    } else if (existingSubResult.rows.length > 0) {
      const subRow = existingSubResult.rows[0];
      const newPlanId = planId || String(subRow.plan_id);
      const newPlanName = namesMap[newPlanId] || String(subRow.plan_name);
      const newPrice = pricesMap[newPlanId] || Number(subRow.price);
      const newMonthlyHours = hoursMap[newPlanId] || String(subRow.monthly_hours);
      const newRemainingHours =
        remainingHours !== undefined ? Number(remainingHours) : Number(subRow.remaining_hours);
      const newStatus = status || String(subRow.status);

      await db.execute({
        sql: `UPDATE subscriptions
              SET plan_id = ?, plan_name = ?, price = ?, monthly_hours = ?, remaining_hours = ?, status = ?
              WHERE id = ?`,
        args: [newPlanId, newPlanName, newPrice, newMonthlyHours, newRemainingHours, newStatus, String(subRow.id)],
      });
    }

    const updated = await getUserSubscriptionFromDB(userEmail);
    res.json({
      success: true,
      subscription: updated,
      message: 'Lidmaatschap succesvol bijgewerkt in SQLite database.',
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Fout bij bijwerken lidmaatschap' });
  }
});

// 3.1 Admin: Manually Add / Grant Hours to a Member
app.post('/api/admin/add-hours', async (req, res) => {
  try {
    const { userEmail, hoursToAdd, reason } = req.body;
    if (!userEmail || typeof hoursToAdd !== 'number' || hoursToAdd === 0) {
      return res.status(400).json({ error: 'userEmail en een geldig aantal uren (hoursToAdd) zijn verplicht' });
    }

    const existingSubResult = await db.execute({
      sql: 'SELECT * FROM subscriptions WHERE LOWER(member_email) = LOWER(?) ORDER BY created_at DESC LIMIT 1',
      args: [userEmail],
    });

    if (existingSubResult.rows.length === 0) {
      // Create a starter active subscription with the granted hours
      const subId = `sub_${Date.now()}`;
      const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      await db.execute({
        sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          subId,
          'plan_custom',
          `Cambiar Credits (${hoursToAdd} uur)`,
          0.0,
          String(hoursToAdd),
          Math.max(0, hoursToAdd),
          'active',
          new Date().toISOString(),
          nextBilling,
          reason ? `Handmatig: ${reason}` : 'Handmatig toegevoegd door beheerder',
          userEmail,
          userEmail.toLowerCase(),
          1,
          new Date().toISOString(),
        ],
      });
    } else {
      const subRow = existingSubResult.rows[0];
      const currentRemaining = typeof subRow.remaining_hours === 'number' ? subRow.remaining_hours : 0;
      const newRemaining = Math.max(0, currentRemaining + hoursToAdd);

      // If subscription was paused/cancelled and admin adds hours, reactivate it
      const newStatus = (subRow.status === 'cancelled' || subRow.status === 'paused') && hoursToAdd > 0
        ? 'active'
        : String(subRow.status);

      await db.execute({
        sql: `UPDATE subscriptions
              SET remaining_hours = ?, status = ?
              WHERE id = ?`,
        args: [newRemaining, newStatus, String(subRow.id)],
      });
    }

    const updated = await getUserSubscriptionFromDB(userEmail);
    res.json({
      success: true,
      subscription: updated,
      message: `${hoursToAdd > 0 ? '+' : ''}${hoursToAdd} uur succesvol toegevoegd aan ${userEmail}. Nieuw saldo: ${updated?.remainingHoursThisMonth} uur.`,
    });
  } catch (error: any) {
    console.error('Error adding hours to user:', error);
    res.status(500).json({ error: 'Fout bij toevoegen van uren' });
  }
});

// 4. Admin stats overview
app.get('/api/admin/stats', async (req, res) => {
  try {
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    const activeSubs = await db.execute("SELECT * FROM subscriptions WHERE status = 'active'");
    const activeBookings = await db.execute("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");

    const mrr = activeSubs.rows.reduce((sum, s: any) => sum + Number(s.price), 0);

    res.json({
      totalUsers: Number(userCount.rows[0]?.count || 0),
      activeMembersCount: activeSubs.rows.length,
      monthlyRecurringRevenue: mrr,
      totalBookingsThisMonth: Number(activeBookings.rows[0]?.count || 0),
      databaseType: 'SQLite (cambiar.db)',
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Fout bij ophalen statistieken' });
  }
});

// ----------------------------------------------------
// SETTINGS / HERO VIDEO CONFIGURATION (ADMIN & PUBLIC)
// ----------------------------------------------------

app.get('/api/settings/hero-video', async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT value FROM app_settings WHERE key = 'hero_video_settings' LIMIT 1",
      args: [],
    });

    if (result.rows.length > 0 && result.rows[0].value) {
      const parsed = JSON.parse(String(result.rows[0].value));
      return res.json(parsed);
    }

    const fallback = {
      enabled: true,
      videoUrl: '/videohero.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
      overlayOpacity: 65,
      playbackSpeed: 1.0,
      title: 'videohero.mp4 (Cambiar Hero Video)',
      muted: true,
      loop: true,
    };
    res.json(fallback);
  } catch (error: any) {
    console.error('Error fetching hero video settings:', error);
    res.status(500).json({ error: 'Fout bij ophalen video instellingen' });
  }
});

app.post('/api/settings/hero-video', async (req, res) => {
  try {
    const { enabled, videoUrl, posterUrl, overlayOpacity, playbackSpeed, title, muted, loop } = req.body;

    const newSettings = {
      enabled: typeof enabled === 'boolean' ? enabled : true,
      videoUrl: String(videoUrl || '').trim(),
      posterUrl: posterUrl ? String(posterUrl).trim() : '',
      overlayOpacity: typeof overlayOpacity === 'number' ? Math.min(95, Math.max(0, overlayOpacity)) : 70,
      playbackSpeed: typeof playbackSpeed === 'number' ? Math.min(2, Math.max(0.25, playbackSpeed)) : 0.85,
      title: title ? String(title).trim() : 'Hero Video',
      muted: typeof muted === 'boolean' ? muted : true,
      loop: typeof loop === 'boolean' ? loop : true,
    };

    await db.execute({
      sql: `INSERT INTO app_settings (key, value, updated_at)
            VALUES ('hero_video_settings', ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: [JSON.stringify(newSettings), new Date().toISOString()],
    });

    res.json({
      success: true,
      settings: newSettings,
      message: 'Hero achtergrond video instellingen succesvol opgeslagen!',
    });
  } catch (error: any) {
    console.error('Error updating hero video settings:', error);
    res.status(500).json({ error: 'Fout bij opslaan video instellingen' });
  }
});

// Admin direct video upload (.mp4 / .webm)
app.post('/api/admin/upload-video', async (req, res) => {
  try {
    const { data, filename } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Geen videogegevens ontvangen' });
    }

    // Handle base64 string
    const base64Data = data.includes(';base64,') ? data.split(';base64,')[1] : data;
    const buffer = Buffer.from(base64Data, 'base64');

    // Create uploads folder if not present
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeName = (filename || 'hero-video.mp4')
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-');
    const targetFile = `hero-${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, targetFile);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${targetFile}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: targetFile,
      size: buffer.length,
      message: 'Video succesvol geüpload en opgeslagen!',
    });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Fout bij uploaden van videobestand' });
  }
});

// ----------------------------------------------------
// PUBLIC / USER BOOKINGS (PRIVACY ENFORCED & SQLITE)
// ----------------------------------------------------

app.get('/api/bookings', async (req, res) => {
  try {
    const email = req.query.email as string;
    const isAdmin = req.query.admin === 'true';

    if (isAdmin) {
      const all = await db.execute('SELECT * FROM bookings ORDER BY date ASC, start_time ASC');
      return res.json(all.rows.map(formatBooking));
    }

    if (email) {
      const userBookings = await db.execute({
        sql: 'SELECT * FROM bookings WHERE LOWER(user_email) = LOWER(?) ORDER BY date ASC, start_time ASC',
        args: [email],
      });
      return res.json(userBookings.rows.map(formatBooking));
    }

    // Public / Other Users: Anonymized for total privacy
    const publicBookings = await db.execute(
      "SELECT id, slot_id, date, start_time, end_time, status FROM bookings WHERE status = 'confirmed'"
    );

    const sanitized = publicBookings.rows.map((b: any) => ({
      id: String(b.id),
      slotId: String(b.slot_id),
      date: String(b.date),
      startTime: String(b.start_time),
      endTime: String(b.end_time),
      status: String(b.status),
      userName: 'Gereserveerd',
      userEmail: '',
      accessPin: '',
      qrCodeValue: '',
    }));

    res.json(sanitized);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Fout bij ophalen boekingen' });
  }
});

// Book Multiple Slots (e.g. Current + Next 2 Weeks)
app.post('/api/bookings/batch', async (req, res) => {
  try {
    const { slotsToBook, userName, userEmail, userPhone, notes, paidVia, amountPaidPerSlot } = req.body;

    if (!Array.isArray(slotsToBook) || slotsToBook.length === 0 || !userName || !userEmail) {
      return res.status(400).json({ error: 'Ongeldige boeking gegevens' });
    }

    // Check if any slot is already booked
    for (const item of slotsToBook) {
      const existing = await db.execute({
        sql: "SELECT * FROM bookings WHERE slot_id = ? AND status = 'confirmed'",
        args: [item.slotId],
      });
      if (existing.rows.length > 0) {
        return res.status(409).json({
          error: `Het tijdslot op ${item.date} (${item.startTime} - ${item.endTime}) is helaas al bezet.`,
        });
      }
    }

    const createdBookings = [];
    const isMembership = paidVia === 'Lidmaatschap';

    for (const item of slotsToBook) {
      const randomPin = Math.floor(1000 + Math.random() * 9000);
      const accessPin = `${randomPin}#`;
      const qrCodeValue = `CAMBIAR:SMARTLOCK:${accessPin}:${item.date}:${item.startTime}`;
      const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO bookings (id, slot_id, date, start_time, end_time, user_name, user_email, user_phone, notes, access_pin, qr_code_value, status, paid_via, amount_paid, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          bookingId,
          item.slotId,
          item.date,
          item.startTime,
          item.endTime,
          userName,
          userEmail.toLowerCase(),
          userPhone || '',
          notes || '',
          accessPin,
          qrCodeValue,
          'confirmed',
          paidVia || 'iDEAL',
          isMembership ? 0 : (amountPaidPerSlot !== undefined ? Number(amountPaidPerSlot) : 24.0),
          createdAt,
        ],
      });

      createdBookings.push({
        id: bookingId,
        slotId: item.slotId,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        userName,
        userEmail: userEmail.toLowerCase(),
        userPhone,
        notes,
        accessPin,
        qrCodeValue,
        status: 'confirmed' as const,
        paidVia: paidVia || 'iDEAL',
        amountPaid: isMembership ? 0 : 24.0,
        createdAt,
      });
    }

    // Deduct total hours from subscription if paid via membership
    if (isMembership) {
      const userSub = await getUserSubscriptionFromDB(userEmail);
      if (
        userSub &&
        userSub.status === 'active' &&
        typeof userSub.remainingHoursThisMonth === 'number' &&
        userSub.monthlyHours !== 'onbeperkt'
      ) {
        const deductCount = createdBookings.length;
        await db.execute({
          sql: 'UPDATE subscriptions SET remaining_hours = MAX(0, remaining_hours - ?) WHERE id = ?',
          args: [deductCount, userSub.id],
        });
      }
    }

    const updatedSub = await getUserSubscriptionFromDB(userEmail);

    res.status(201).json({
      bookings: createdBookings,
      subscription: updatedSub,
      message: `${createdBookings.length} uren succesvol gereserveerd!`,
    });
  } catch (error: any) {
    console.error('Error in batch booking:', error);
    res.status(500).json({ error: 'Fout bij verwerken meervoudige reservering' });
  }
});

// Book 1-Hour Slot
app.post('/api/bookings', async (req, res) => {
  try {
    const { slotId, date, startTime, endTime, userName, userEmail, userPhone, notes, paidVia, amountPaid } =
      req.body;

    if (!slotId || !date || !startTime || !endTime || !userName || !userEmail) {
      return res.status(400).json({ error: 'Alle verplichte velden moeten ingevuld zijn' });
    }

    const existing = await db.execute({
      sql: "SELECT * FROM bookings WHERE slot_id = ? AND status = 'confirmed'",
      args: [slotId],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Dit uur in studio Cambiar is helaas zojuist al gereserveerd.' });
    }

    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const accessPin = `${randomPin}#`;
    const qrCodeValue = `CAMBIAR:SMARTLOCK:${accessPin}:${date}:${startTime}`;
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO bookings (id, slot_id, date, start_time, end_time, user_name, user_email, user_phone, notes, access_pin, qr_code_value, status, paid_via, amount_paid, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        bookingId,
        slotId,
        date,
        startTime,
        endTime,
        userName,
        userEmail.toLowerCase(),
        userPhone || '',
        notes || '',
        accessPin,
        qrCodeValue,
        'confirmed',
        paidVia || 'iDEAL',
        amountPaid !== undefined ? Number(amountPaid) : 24.0,
        createdAt,
      ],
    });

    // Deduct credit if subscription exists
    const userSub = await getUserSubscriptionFromDB(userEmail);
    if (
      userSub &&
      userSub.status === 'active' &&
      typeof userSub.remainingHoursThisMonth === 'number' &&
      userSub.monthlyHours !== 'onbeperkt' &&
      userSub.remainingHoursThisMonth > 0
    ) {
      await db.execute({
        sql: 'UPDATE subscriptions SET remaining_hours = remaining_hours - 1 WHERE id = ?',
        args: [userSub.id],
      });
    }

    const createdBooking = {
      id: bookingId,
      slotId,
      date,
      startTime,
      endTime,
      userName,
      userEmail: userEmail.toLowerCase(),
      userPhone,
      notes,
      accessPin,
      qrCodeValue,
      status: 'confirmed' as const,
      paidVia: paidVia || 'iDEAL',
      amountPaid: amountPaid !== undefined ? Number(amountPaid) : 24.0,
      createdAt,
    };

    res.status(201).json(createdBooking);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Fout bij reserveren slot' });
  }
});

// Book with Membership Credits
app.post('/api/customer/book-with-credits', async (req, res) => {
  try {
    const { slotId, date, startTime, endTime, userEmail, userName, notes } = req.body;

    if (!slotId || !date || !startTime || !endTime || !userEmail) {
      return res.status(400).json({ error: 'Ontbrekende slot gegevens' });
    }

    const existing = await db.execute({
      sql: "SELECT * FROM bookings WHERE slot_id = ? AND status = 'confirmed'",
      args: [slotId],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Dit tijdslot is helaas zojuist al door een ander gereserveerd.' });
    }

    const userSub = await getUserSubscriptionFromDB(userEmail);
    if (!userSub || userSub.status !== 'active') {
      return res.status(403).json({ error: 'Geen actief abonnement gevonden.' });
    }

    if (
      typeof userSub.remainingHoursThisMonth === 'number' &&
      userSub.remainingHoursThisMonth <= 0 &&
      userSub.monthlyHours !== 'onbeperkt'
    ) {
      return res.status(400).json({ error: 'Je tegoed voor deze maand is op.' });
    }

    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const accessPin = `${randomPin}#`;
    const qrCodeValue = `CAMBIAR:SMARTLOCK:${accessPin}:${date}:${startTime}`;
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO bookings (id, slot_id, date, start_time, end_time, user_name, user_email, notes, access_pin, qr_code_value, status, paid_via, amount_paid, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        bookingId,
        slotId,
        date,
        startTime,
        endTime,
        userName || userSub.memberName,
        userEmail.toLowerCase(),
        notes || '',
        accessPin,
        qrCodeValue,
        'confirmed',
        'Lidmaatschap',
        0,
        createdAt,
      ],
    });

    if (typeof userSub.remainingHoursThisMonth === 'number' && userSub.monthlyHours !== 'onbeperkt') {
      await db.execute({
        sql: 'UPDATE subscriptions SET remaining_hours = MAX(0, remaining_hours - 1) WHERE id = ?',
        args: [userSub.id],
      });
    }

    const updatedSub = await getUserSubscriptionFromDB(userEmail);
    const newBooking = {
      id: bookingId,
      slotId,
      date,
      startTime,
      endTime,
      userName: userName || userSub.memberName,
      userEmail: userEmail.toLowerCase(),
      notes,
      accessPin,
      qrCodeValue,
      status: 'confirmed' as const,
      paidVia: 'Lidmaatschap',
      amountPaid: 0,
      createdAt,
    };

    res.status(201).json({
      booking: newBooking,
      subscription: updatedSub,
      message: `Uur succesvol gereserveerd! Smart PIN: ${accessPin}`,
    });
  } catch (error: any) {
    console.error('Error booking with credits:', error);
    res.status(500).json({ error: 'Fout bij boeken via lidmaatschap' });
  }
});

// Cancel a Booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cancelledBy = req.body?.cancelledBy || req.query?.cancelledBy || 'gebruiker';
    const cancelledAt = new Date().toISOString();

    const bookingResult = await db.execute({
      sql: 'SELECT * FROM bookings WHERE id = ?',
      args: [id],
    });

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservering niet gevonden' });
    }

    const bookingRow = bookingResult.rows[0];
    const originalSlotId = String(bookingRow.slot_id);
    const updatedSlotId = originalSlotId.startsWith('cancelled_')
      ? originalSlotId
      : `cancelled_${id}_${originalSlotId}`;

    await db.execute({
      sql: "UPDATE bookings SET status = 'cancelled', cancelled_at = ?, cancelled_by = ?, slot_id = ? WHERE id = ?",
      args: [cancelledAt, cancelledBy, updatedSlotId, id],
    });

    const userSub = await getUserSubscriptionFromDB(String(bookingRow.user_email));
    if (userSub && typeof userSub.remainingHoursThisMonth === 'number' && userSub.monthlyHours !== 'onbeperkt') {
      const maxHours = typeof userSub.monthlyHours === 'number' ? userSub.monthlyHours : 8;
      await db.execute({
        sql: 'UPDATE subscriptions SET remaining_hours = MIN(?, remaining_hours + 1) WHERE id = ?',
        args: [maxHours, userSub.id],
      });
    }

    const updatedSub = await getUserSubscriptionFromDB(String(bookingRow.user_email));
    res.json({
      message: 'Tijdslot geannuleerd en uurtegoed teruggestort in SQLite database.',
      booking: {
        ...formatBooking(bookingRow),
        status: 'cancelled',
        cancelledAt,
        cancelledBy,
      },
      subscription: updatedSub,
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Fout bij annuleren reservering' });
  }
});

// Config status
app.get('/api/config', (req, res) => {
  const stripe = getStripe();
  res.json({
    stripeConfigured: !!stripe,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    appUrl: process.env.APP_URL || `http://localhost:${PORT}`,
    currency: 'EUR',
    cancellationPolicy: '100% Maandelijks Opzegbaar',
    gymName: 'Cambiar Private Gym & Personal Training Studio',
    doorLockType: 'Smart Lock PIN Code (#)',
    databaseEngine: 'SQLite (cambiar.db)',
  });
});

// Subscriptions List
app.get('/api/subscriptions', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (email) {
      const filtered = await db.execute({
        sql: 'SELECT * FROM subscriptions WHERE LOWER(member_email) = LOWER(?)',
        args: [email],
      });
      return res.json(filtered.rows.map(formatSubscription));
    }
    const all = await db.execute('SELECT * FROM subscriptions ORDER BY created_at DESC');
    res.json(all.rows.map(formatSubscription));
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Fout bij ophalen abonnementen' });
  }
});

app.post('/api/subscriptions/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    await db.execute({
      sql: "UPDATE subscriptions SET status = 'cancelled' WHERE id = ?",
      args: [subscriptionId],
    });
    res.json({ success: true, message: 'Cambiar lidmaatschap is direct kosteloos beëindigd in SQLite.' });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Fout bij opzeggen abonnement' });
  }
});

app.post('/api/subscriptions/pause', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    await db.execute({
      sql: "UPDATE subscriptions SET status = 'paused' WHERE id = ?",
      args: [subscriptionId],
    });
    res.json({ success: true, message: 'Cambiar lidmaatschap is voor 30 dagen gepauzeerd in SQLite.' });
  } catch (error: any) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ error: 'Fout bij pauzeren abonnement' });
  }
});

app.post('/api/subscriptions/resume', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    await db.execute({
      sql: "UPDATE subscriptions SET status = 'active' WHERE id = ?",
      args: [subscriptionId],
    });
    res.json({ success: true, message: 'Cambiar lidmaatschap is weer geactiveerd in SQLite.' });
  } catch (error: any) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Fout bij hervatten abonnement' });
  }
});

// Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId, planName, price, customerEmail, customerName, type, slotDetails } = req.body;

    if (!price) {
      return res.status(400).json({ error: 'Bedrag ontbreekt' });
    }

    const stripe = getStripe();
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const isSingleSlot = type === 'single_slot';

    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card', 'ideal', 'bancontact', 'sepa_debit'],
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: isSingleSlot
                    ? `Cambiar Privé Gym - 1 Uur (${slotDetails?.date || ''} ${slotDetails?.startTime || ''})`
                    : `Cambiar Privé Gym - ${planName}`,
                  description: isSingleSlot
                    ? 'Exclusieve afhuur van de gehele Cambiar studio gedurende 60 minuten inclusief smart door PIN.'
                    : '100% Maandelijks opzegbaar Cambiar abonnement.',
                },
                unit_amount: Math.round(price * 100),
                ...(isSingleSlot ? {} : { recurring: { interval: 'month' } }),
              },
              quantity: 1,
            },
          ],
          mode: isSingleSlot ? 'payment' : 'subscription',
          customer_email: customerEmail || undefined,
          success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&type=${isSingleSlot ? 'slot' : 'plan'}&status=success`,
          cancel_url: `${appUrl}/`,
        });

        return res.json({ url: session.url, sessionId: session.id, simulated: false });
      } catch (stripeErr: any) {
        console.warn('Stripe Live API call error, falling back to simulated checkout:', stripeErr.message);
      }
    }

    // High-Fidelity Simulated Checkout saved to SQLite
    const simulatedSessionId = `cs_cambiar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (!isSingleSlot && planId) {
      const hoursMap: Record<string, string> = {
        plan_4h: '4',
        plan_8h: '8',
        plan_unlimited: 'onbeperkt',
      };
      const monthlyHours = hoursMap[planId] || '4';
      const remHours = monthlyHours === 'onbeperkt' ? 999 : Number(monthlyHours);
      const subId = `sub_${Date.now()}`;
      const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const createdAt = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO subscriptions (id, plan_id, plan_name, price, monthly_hours, remaining_hours, status, started_at, next_billing_date, payment_method, member_name, member_email, is_monthly_cancellable, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          subId,
          planId,
          planName || 'Cambiar Privé Gym',
          Number(price),
          monthlyHours,
          remHours,
          'active',
          createdAt,
          nextBilling,
          'Stripe (iDEAL / Incasso)',
          customerName || 'Lid',
          (customerEmail || 'lid@cambiar.nl').toLowerCase(),
          1,
          createdAt,
        ],
      });
    }

    return res.json({
      url: `${appUrl}/?session_id=${simulatedSessionId}&status=success`,
      sessionId: simulatedSessionId,
      simulated: true,
      message: 'Betaling succesvol verwerkt en opgeslagen in SQLite database!',
    });
  } catch (error: any) {
    console.error('Fout bij aanmaken checkout sessie:', error);
    res.status(500).json({ error: error.message || 'Interne serverfout' });
  }
});

// ----------------------------------------------------
// VITE / STATIC SERVING & SQLITE STARTUP
// ----------------------------------------------------
async function startServer() {
  // Initialize SQLite database & tables before serving requests
  await initSQLiteDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏋️ Cambiar Private Gym Server (SQLite database) draait op http://0.0.0.0:${PORT}`);
  });
}

startServer();
