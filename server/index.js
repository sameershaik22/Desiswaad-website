const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET || 'desiswad_jwt_secret_change_in_prod';
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// ===== POSTGRESQL POOL =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ===== NODEMAILER SETUP =====
let transporter;
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  console.log(`✅ Gmail SMTP configured for: ${process.env.GMAIL_USER}`);
} else {
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'florian.hansen@ethereal.email',
      pass: 'f3qTxbDudw4tYxJqKs',
    },
  });
  console.log('⚠️  Gmail not configured. Using Ethereal test SMTP. Add GMAIL_USER + GMAIL_PASS to .env.local');
}

// ===== RAZORPAY SETUP =====
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
  });
} catch(e) {
  console.log('Razorpay init skipped (add real keys to .env.local)');
}

// ===== JWT MIDDLEWARE =====
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); } catch(_) {}
  }
  next();
}

// ===== EMAIL TEMPLATES =====
const STATUS_LABELS = {
  placed:     'Order Placed',
  confirmed:  'Order Confirmed',
  processing: 'Being Prepared',
  shipped:    'Out for Delivery',
  delivered:  'Delivered',
};

const EMAIL_SUBJECTS = {
  placed:     '🎉 Your DesiSwad Order is Confirmed!',
  confirmed:  '✅ DesiSwad: Payment Received & Order Accepted',
  processing: '👨‍🍳 DesiSwad: Your snacks are being prepared!',
  shipped:    '🚚 DesiSwad: Your order is Out for Delivery!',
  delivered:  '🎊 DesiSwad: Order Delivered! Enjoy your snacks!',
};

const buildEmailHTML = (order, status, extras = {}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusMessages = {
    placed:     `Your order has been successfully placed and we've received your request.`,
    confirmed:  `Great news! Your payment has been received and your order is confirmed. We'll start preparing it soon.`,
    processing: `Our team has started preparing your authentic Telangana snacks fresh for you! 🍱`,
    shipped:    `Your order is on its way! ${extras.delivery_partner ? `Shipped via <strong>${extras.delivery_partner}</strong>.` : ''} ${extras.tracking_number ? `Tracking ID: <strong>${extras.tracking_number}</strong>.` : ''} ${extras.expected_delivery_date ? `Expected delivery: <strong>${extras.expected_delivery_date}</strong>` : ''}`,
    delivered:  `Your DesiSwad order has been delivered. We hope you enjoy every bite! 🙏 Please leave a review.`,
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1E5B3A 0%,#2d7a4f 100%);padding:32px 32px 24px;text-align:center;">
      <h1 style="color:#D4AF37;margin:0;font-size:1.8rem;letter-spacing:1px;">🌿 DesiSwad Foods</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:0.9rem;">Pure Taste • Pure Trust</p>
    </div>
    <div style="background:#fdfaf4;padding:20px 32px;border-bottom:2px solid #D4AF37;text-align:center;">
      <p style="font-size:1.3rem;font-weight:700;color:#1E5B3A;margin:0;">${statusLabel}</p>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:1rem;color:#333;margin:0 0 16px;">Hi <strong>${order.customer_name}</strong>,</p>
      <p style="font-size:0.95rem;color:#555;line-height:1.6;margin:0 0 24px;">${statusMessages[status] || `Your order status has been updated to ${statusLabel}.`}</p>
      <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #eee;">
        <table style="width:100%;font-size:0.9rem;color:#333;">
          <tr><td style="padding:6px 0;color:#888;">Order ID</td><td style="font-weight:700;color:#B22222;text-align:right;">${order.id}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Total</td><td style="font-weight:700;text-align:right;">₹${order.total}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Payment</td><td style="text-align:right;">${order.payment_mode} (${order.payment_status === 'paid' ? '✔ Paid' : 'Pending'})</td></tr>
          ${order.city ? `<tr><td style="padding:6px 0;color:#888;">Delivery To</td><td style="text-align:right;">${order.city}, ${order.state}</td></tr>` : ''}
        </table>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${siteUrl}/track?id=${order.id}" style="display:inline-block;background:#D4AF37;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">📦 Track Your Order</a>
      </div>
      <div style="background:#e8f5e9;border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:0.9rem;color:#555;">Need help? Chat with us on WhatsApp</p>
        <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I need help with Order ID: ${order.id}" style="color:#1E5B3A;font-weight:700;text-decoration:none;">💬 WhatsApp: +91 96404 97340</a>
      </div>
    </div>
    <div style="background:#f5f5f5;padding:20px 32px;text-align:center;font-size:0.8rem;color:#999;">
      <p style="margin:0;">© 2024 DesiSwad Foods • Authentic Telangana Snacks</p>
      <p style="margin:8px 0 0;">This is an automated email. Please don't reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
};

const sendStatusEmail = async (order, status, extras = {}) => {
  const subject = EMAIL_SUBJECTS[status] || `DesiSwad: Order ${order.id} Updated`;
  try {
    await transporter.sendMail({
      from: `"DesiSwad Foods" <${process.env.GMAIL_USER || 'no-reply@desiswadfoods.com'}>`,
      to: order.email,
      subject,
      html: buildEmailHTML(order, status, extras),
    });
    console.log(`[Email Sent] ${subject} → ${order.email}`);
    await pool.query(
      `INSERT INTO notifications (order_id, type, recipient, subject, status) VALUES ($1,$2,$3,$4,$5)`,
      [order.id, 'email', order.email, subject, 'sent']
    );
  } catch (err) {
    console.error(`[Email Failed] ${subject}:`, err.message);
    await pool.query(
      `INSERT INTO notifications (order_id, type, recipient, subject, status) VALUES ($1,$2,$3,$4,$5)`,
      [order.id, 'email', order.email, subject, 'failed']
    ).catch(() => {});
  }
};

// ===== DATABASE INIT =====
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tagline TEXT,
      description TEXT,
      ingredients TEXT,
      category TEXT,
      image TEXT,
      prices TEXT,
      rating REAL DEFAULT 4.5,
      reviews INTEGER DEFAULT 0,
      bestseller INTEGER DEFAULT 0,
      spice_level TEXT,
      shelf_life TEXT,
      stock INTEGER DEFAULT 100
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      country TEXT DEFAULT 'India',
      subtotal REAL,
      shipping REAL,
      cod_charge REAL DEFAULT 0,
      total REAL,
      payment_mode TEXT,
      payment_status TEXT DEFAULT 'pending',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      order_status TEXT DEFAULT 'placed',
      notes TEXT,
      delivery_partner TEXT,
      tracking_number TEXT,
      expected_delivery_date TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_slug TEXT NOT NULL,
      name TEXT NOT NULL,
      weight TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracking (
      id SERIAL PRIMARY KEY,
      order_id TEXT,
      status TEXT,
      message TEXT,
      timestamp TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_slug TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(order_id, product_slug)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT,
      status TEXT,
      timestamp TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT,
      auth_provider TEXT DEFAULT 'email',
      google_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      user_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      reason TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'Pending',
      admin_note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Seed products (INSERT ... ON CONFLICT DO NOTHING = safe to run repeatedly)
  const seedProducts = [
    { name:'Chekodi', slug:'chekodi', tagline:'Crispy Telangana Classic', description:'Handmade rice flour spirals, perfectly seasoned with cumin and carom seeds. Crunchy with every bite — a beloved Telangana tradition made fresh in our home kitchen.', ingredients:'Rice flour, urad dal, cumin seeds, carom seeds, sesame seeds, red chilli, salt, refined oil', category:'Namkeen', image:'/product_chekodi.png', prices:JSON.stringify({'250g':99,'500g':180,'1kg':340}), rating:4.8, reviews:124, bestseller:1, spice_level:'Medium', shelf_life:'45 days' },
    { name:'Khara Mixture', slug:'khara-mixture', tagline:'Spicy Namkeen Medley', description:'A bold mix of fried sev, roasted peanuts, crispy dal, curry leaves and spices. The perfect tea-time companion with authentic Telangana flavours.', ingredients:'Besan sev, fried peanuts, roasted chana dal, poha, curry leaves, green chillies, mustard oil, spices', category:'Namkeen', image:'/product_khara_mixture.png', prices:JSON.stringify({'250g':89,'500g':160,'1kg':300}), rating:4.9, reviews:210, bestseller:1, spice_level:'Spicy', shelf_life:'30 days' },
    { name:'Achappam', slug:'achappam', tagline:'Flower-Shaped Rice Crackers', description:'Delicate flower-shaped crackers made from rice flour and coconut milk. Light, airy and mildly sweet — a timeless festive snack loved across generations.', ingredients:'Rice flour, coconut milk, eggs, sugar, sesame seeds, cardamom, refined oil', category:'Sweet Snacks', image:'/product_achappam.png', prices:JSON.stringify({'250g':110,'500g':200,'1kg':380}), rating:4.7, reviews:98, bestseller:0, spice_level:'Mild', shelf_life:'21 days' },
    { name:'Janthikalu', slug:'janthikalu', tagline:'Traditional Andhra Chakli', description:'Traditional Andhra-style murukku made from urad dal and rice flour. Perfectly twisted, golden fried and seasoned with sesame seeds and butter.', ingredients:'Rice flour, urad dal flour, butter, sesame seeds, cumin, salt, refined oil', category:'Namkeen', image:'/product_janthikalu.png', prices:JSON.stringify({'250g':95,'500g':170,'1kg':320}), rating:4.8, reviews:156, bestseller:0, spice_level:'Mild', shelf_life:'45 days' },
    { name:'Murukku', slug:'murukku', tagline:'Golden Spiral Delight', description:'Classic South Indian murukku made from rice flour and black gram. Perfectly crispy spirals seasoned with cumin and pepper.', ingredients:'Rice flour, black gram flour, cumin seeds, pepper, asafoetida, salt, sesame seeds, oil', category:'Namkeen', image:'/product_murukku.png', prices:JSON.stringify({'250g':85,'500g':150,'1kg':280}), rating:4.6, reviews:187, bestseller:0, spice_level:'Mild', shelf_life:'45 days' },
    { name:'Masala Boondi', slug:'masala-boondi', tagline:'Spicy Golden Pearls', description:'Tiny golden chickpea flour pearls tossed with chaat masala, roasted cumin and tangy amchur. Addictively crunchy.', ingredients:'Besan, chaat masala, cumin, amchur, red chilli, black pepper, salt, oil', category:'Namkeen', image:'/product_boondi.png', prices:JSON.stringify({'250g':70,'500g':130,'1kg':240}), rating:4.5, reviews:143, bestseller:0, spice_level:'Spicy', shelf_life:'30 days' },
  ];

  for (const p of seedProducts) {
    await pool.query(
      `INSERT INTO products (name,slug,tagline,description,ingredients,category,image,prices,rating,reviews,bestseller,spice_level,shelf_life)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (slug) DO NOTHING`,
      [p.name,p.slug,p.tagline,p.description,p.ingredients,p.category,p.image,p.prices,p.rating,p.reviews,p.bestseller,p.spice_level,p.shelf_life]
    );
  }

  console.log('✅ Database tables ready');
}

// ===== AUTH ROUTES =====

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'An account with this email already exists' });
    const id = crypto.randomUUID();
    const password_hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (id, name, email, phone, password_hash, auth_provider) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, name, email, phone || null, password_hash, 'email']
    );
    const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id, name, email, phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'No account found with this email' });
    if (!user.password_hash) return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    if (!googleId || !email) return res.status(400).json({ error: 'Google ID and email required' });
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];
    if (!user) {
      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO users (id, name, email, google_id, auth_provider) VALUES ($1,$2,$3,$4,$5)',
        [id, name, email, googleId, 'google']
      );
      result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      user = result.rows[0];
    } else if (!user.google_id) {
      await pool.query('UPDATE users SET google_id=$1, auth_provider=$2 WHERE id=$3', [googleId, 'google', user.id]);
    }
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, auth_provider, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MY ORDERS ROUTES =====

app.get('/api/my-orders', authMiddleware, async (req, res) => {
  try {
    // Link past guest orders by email
    await pool.query(
      `UPDATE orders SET user_id=$1 WHERE email=$2 AND (user_id IS NULL OR user_id = '')`,
      [req.user.id, req.user.email]
    );
    const result = await pool.query(`
      SELECT o.*, string_agg(oi.name || '|' || oi.weight || '|' || oi.qty || '|' || oi.price, ';;') AS items_raw
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = $1 OR o.email = $2
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id, req.user.email]);

    const formatted = result.rows.map(o => ({
      ...o,
      items: (o.items_raw || '').split(';;').filter(Boolean).map(r => {
        const [name, weight, qty, price] = r.split('|');
        return { name, weight, qty: parseInt(qty), price: parseFloat(price) };
      }),
    }));
    res.json({ orders: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/my-orders/:id', authMiddleware, async (req, res) => {
  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id=$1 AND (user_id=$2 OR email=$3)',
      [req.params.id, req.user.id, req.user.email]
    );
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = (await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order.id])).rows;
    const tracking = (await pool.query('SELECT * FROM tracking WHERE order_id=$1 ORDER BY timestamp ASC', [order.id])).rows;
    const returnResult = await pool.query('SELECT * FROM returns WHERE order_id=$1', [order.id]);
    res.json({ order: { ...order, items }, tracking, returnRequest: returnResult.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== RETURNS ROUTES =====

app.post('/api/returns', optionalAuth, async (req, res) => {
  try {
    const { order_id, reason, description, image_url, customer_name, customer_email } = req.body;
    if (!order_id || !reason) return res.status(400).json({ error: 'Order ID and reason are required' });

    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [order_id]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const existingReturn = await pool.query('SELECT id FROM returns WHERE order_id=$1', [order_id]);
    if (existingReturn.rows.length > 0) return res.status(409).json({ error: 'A return request is already submitted for this order' });

    const deliveryResult = await pool.query(
      `SELECT timestamp FROM tracking WHERE order_id=$1 AND status='delivered'`,
      [order_id]
    );
    if (deliveryResult.rows.length > 0) {
      const deliveredAt = new Date(deliveryResult.rows[0].timestamp);
      const diffDays = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return res.status(400).json({ error: 'Return window has closed. Requests must be submitted within 7 days of delivery.' });
    }

    const id = crypto.randomUUID();
    const user_id = req.user?.id || null;
    await pool.query(
      'INSERT INTO returns (id,order_id,user_id,customer_name,customer_email,reason,description,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, order_id, user_id, customer_name || order.customer_name, customer_email || order.email, reason, description || null, image_url || null]
    );
    res.json({ id, message: 'Return request submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/returns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, o.total, o.order_status, o.customer_name AS order_customer
      FROM returns r
      LEFT JOIN orders o ON o.id = r.order_id
      ORDER BY r.created_at DESC
    `);
    res.json({ returns: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/returns/:id', async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    const allowed = ['Pending', 'Approved', 'Rejected', 'Replaced', 'Refunded'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await pool.query('UPDATE returns SET status=$1, admin_note=$2 WHERE id=$3', [status, admin_note || null, req.params.id]);
    res.json({ message: 'Return updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PRODUCT ROUTES =====

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category && category !== 'All') {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (sort === 'price_asc')  query += ` ORDER BY (prices::json->>'500g')::REAL ASC`;
    else if (sort === 'price_desc') query += ` ORDER BY (prices::json->>'500g')::REAL DESC`;
    else if (sort === 'rating')     query += ` ORDER BY rating DESC`;
    else                            query += ` ORDER BY bestseller DESC, id ASC`;

    const result = await pool.query(query, params);
    const products = result.rows.map(p => ({ ...p, prices: JSON.parse(p.prices) }));
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE slug=$1', [req.params.slug]);
    const product = result.rows[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: { ...product, prices: JSON.parse(product.prices) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ORDER ROUTES =====

app.post('/api/orders', async (req, res) => {
  const { customer_name, email, phone, address, city, state, pincode, country, items, subtotal, shipping, cod_charge, total, payment_mode, notes } = req.body;
  const id = 'DS' + Date.now().toString().slice(-8).toUpperCase();

  const client = await pool.connect();
  try {
    // Check stock before starting transaction
    for (const item of items) {
      const stockResult = await client.query('SELECT stock, name FROM products WHERE slug=$1', [item.id]);
      const product = stockResult.rows[0];
      if (!product || product.stock < item.qty) {
        client.release();
        return res.status(400).json({ error: `Out of stock: ${product ? product.name : item.name} (Only ${product ? product.stock : 0} left in inventory)` });
      }
    }

    await client.query('BEGIN');

    for (const item of items) {
      await client.query('UPDATE products SET stock = stock - $1 WHERE slug=$2', [item.qty, item.id]);
      await client.query(
        `INSERT INTO order_items (order_id,product_slug,name,weight,qty,price) VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, item.id, item.name, item.weight, item.qty, item.price]
      );
    }

    await client.query(`
      INSERT INTO orders (id,customer_name,email,phone,address,city,state,pincode,country,subtotal,shipping,cod_charge,total,payment_mode,notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    `, [id, customer_name, email, phone, address, city, state, pincode, country || 'India', subtotal, shipping, cod_charge || 0, total, payment_mode, notes || '']);

    await client.query(
      `INSERT INTO tracking (order_id,status,message) VALUES ($1,$2,$3)`,
      [id, 'placed', 'Your order has been placed successfully!']
    );

    await client.query('COMMIT');

    console.log(`[SMS] DesiSwad: Order ${id} placed. Total: ₹${total}`);
    const orderForEmail = { id, customer_name, email, phone, total, payment_mode, payment_status: 'pending', city, state };
    await sendStatusEmail(orderForEmail, 'placed');

    res.json({ success: true, orderId: id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to process order. ' + err.message });
  } finally {
    client.release();
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = (await pool.query('SELECT * FROM order_items WHERE order_id=$1', [req.params.id])).rows;
    const tracking = (await pool.query('SELECT * FROM tracking WHERE order_id=$1 ORDER BY id ASC', [req.params.id])).rows;
    res.json({ order: { ...order, items }, tracking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/phone/:phone', async (req, res) => {
  try {
    const phone = req.params.phone.replace(/\D/g, '');
    const result = await pool.query(
      `SELECT * FROM orders WHERE replace(phone, ' ', '') LIKE $1 ORDER BY created_at DESC`,
      [`%${phone}%`]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No orders found for this phone number' });

    const orders = await Promise.all(result.rows.map(async o => ({
      ...o,
      items: (await pool.query('SELECT * FROM order_items WHERE order_id=$1', [o.id])).rows,
      tracking: (await pool.query('SELECT * FROM tracking WHERE order_id=$1 ORDER BY id ASC', [o.id])).rows,
    })));
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PAYMENT ROUTES =====

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!razorpay) return res.status(500).json({ error: 'Razorpay not configured. Add API keys to .env.local' });
    const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder').update(body).digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ success: false, error: 'Invalid signature' });

    await pool.query(
      `UPDATE orders SET payment_status=$1, razorpay_order_id=$2, razorpay_payment_id=$3, order_status=$4 WHERE id=$5`,
      ['paid', razorpay_order_id, razorpay_payment_id, 'confirmed', order_id]
    );
    await pool.query(
      `INSERT INTO tracking (order_id,status,message) VALUES ($1,$2,$3)`,
      [order_id, 'confirmed', 'Payment received! Your order is confirmed and will be prepared soon.']
    );

    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [order_id]);
    const order = orderResult.rows[0];
    if (order) {
      console.log(`[SMS] DesiSwad: Payment confirmed for ${order_id}. ₹${order.total} received.`);
      await sendStatusEmail(order, 'confirmed');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ADMIN ROUTES =====

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, message, delivery_partner, tracking_number, expected_delivery_date } = req.body;
    const orderId = req.params.id;

    if (delivery_partner !== undefined) {
      await pool.query(
        'UPDATE orders SET order_status=$1, delivery_partner=$2, tracking_number=$3, expected_delivery_date=$4 WHERE id=$5',
        [status, delivery_partner, tracking_number || null, expected_delivery_date || null, orderId]
      );
    } else {
      await pool.query('UPDATE orders SET order_status=$1 WHERE id=$2', [status, orderId]);
    }

    const trackingMessage = message || {
      placed:     'Order has been placed successfully.',
      confirmed:  'Payment confirmed. Your order is accepted!',
      processing: 'Your snacks are being freshly prepared. 🍱',
      shipped:    `Order shipped via ${delivery_partner || 'courier'}. Tracking: ${tracking_number || 'N/A'}`,
      delivered:  'Order delivered! Enjoy your DesiSwad snacks! 🎉',
      cancelled:  'Order has been cancelled.',
    }[status] || `Order status updated to ${status}`;

    await pool.query(
      'INSERT INTO tracking (order_id,status,message) VALUES ($1,$2,$3)',
      [orderId, status, trackingMessage]
    );

    const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [orderId]);
    const order = orderResult.rows[0];
    if (order) {
      const extras = { delivery_partner, tracking_number, expected_delivery_date };
      const phoneMsg = {
        confirmed:  `DesiSwad: Order ${orderId} confirmed! Payment received.`,
        processing: `DesiSwad: Your order ${orderId} is being prepared now! 🍱`,
        shipped:    `DesiSwad: Order ${orderId} shipped via ${delivery_partner || 'courier'}. Trk: ${tracking_number || 'NA'}`,
        delivered:  `DesiSwad: Order ${orderId} delivered! Enjoy your snacks! 🎉`,
      }[status];
      if (phoneMsg) console.log(`[SMS] To: ${order.phone} - "${phoneMsg}"`);
      if (['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
        await sendStatusEmail(order, status, extras);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE product_slug=$1 ORDER BY created_at DESC',
      [req.params.slug]
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { order_id, product_slug, rating, review_text } = req.body;
    const orderResult = await pool.query('SELECT order_status, customer_name FROM orders WHERE id=$1', [order_id]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.order_status !== 'delivered') return res.status(400).json({ error: 'Can only review delivered orders' });
    await pool.query(
      `INSERT INTO reviews (order_id,product_slug,customer_name,rating,review_text) VALUES ($1,$2,$3,$4,$5)`,
      [order_id, product_slug, order.customer_name, rating, review_text]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'You have already reviewed this product in this order' });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) AS count FROM orders');
    const totalOrders = parseInt(countResult.rows[0].count);
    const allOrders = (await pool.query('SELECT total, payment_status, payment_mode, order_status, created_at FROM orders')).rows;

    const totalRevenue = allOrders
      .filter(o => o.payment_status === 'paid' || o.payment_mode === 'COD')
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const pendingOrders = allOrders.filter(o => ['placed', 'confirmed', 'processing'].includes(o.order_status)).length;
    const deliveredOrders = allOrders.filter(o => o.order_status === 'delivered').length;
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = allOrders.filter(o => o.created_at && new Date(o.created_at).toISOString().slice(0, 10) === today).length;
    const onlineRevenue = allOrders
      .filter(o => o.payment_mode === 'Online' && o.payment_status === 'paid')
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    res.json({ totalOrders, totalRevenue, pendingOrders, deliveredOrders, todayOrders, onlineRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = (await pool.query('SELECT * FROM orders ORDER BY created_at DESC')).rows;
    const formattedOrders = await Promise.all(orders.map(async o => ({
      ...o,
      items: (await pool.query('SELECT name, qty, price, weight, product_slug FROM order_items WHERE order_id=$1', [o.id])).rows,
      notifications: (await pool.query('SELECT type, subject, status, timestamp FROM notifications WHERE order_id=$1 ORDER BY timestamp DESC', [o.id])).rows,
      tracking: (await pool.query('SELECT status, message, timestamp FROM tracking WHERE order_id=$1 ORDER BY id ASC', [o.id])).rows,
    })));
    res.json({ orders: formattedOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ DesiSwad API running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  });
