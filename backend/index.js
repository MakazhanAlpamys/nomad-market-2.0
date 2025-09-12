import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Pool } from 'pg';
import { randomBytes } from 'crypto';

dotenv.config();

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nomad_market'
});

async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nickname TEXT UNIQUE NOT NULL,
        wallet_address TEXT UNIQUE NOT NULL,
        balance NUMERIC(18,6) NOT NULL DEFAULT 100.000000,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC(18,6) NOT NULL,
        image BYTEA,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        minted_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        token_id INTEGER REFERENCES tokens(id) ON DELETE SET NULL,
        seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amount NUMERIC(18,6) NOT NULL,
        tx_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Schema init error', e);
    throw e;
  } finally {
    client.release();
  }
}

async function ensureDefaultAdmin() {
  const email = 'admin@nomad-market.local';
  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length) return;
  const password = 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 10);
  const wallet = generateWalletAddress();
  await pool.query(
    'INSERT INTO users (email, password_hash, nickname, wallet_address, is_admin) VALUES ($1,$2,$3,$4,$5)',
    [email, passwordHash, 'Admin', wallet, true]
  );
  console.log('Default admin user created:', email);
}

function generateWalletAddress() {
  return 'So' + randomBytes(16).toString('hex');
}

function generateTxHash() {
  return randomBytes(32).toString('hex');
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admins only' });
  next();
}

// Validation helpers
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) return res.status(400).json({ error: 'Missing fields' });
    if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Weak password' });

    const client = await pool.connect();
    try {
      const hash = await bcrypt.hash(password, 10);
      const wallet = generateWalletAddress();
      const isAdmin = (process.env.ADMIN_EMAIL || '').toLowerCase() === String(email).toLowerCase();
      const result = await client.query(
        `INSERT INTO users (email, password_hash, nickname, wallet_address, is_admin) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, nickname, wallet_address, balance, is_admin`,
        [email, hash, nickname, wallet, isAdmin]
      );
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, nickname: user.nickname, is_admin: user.is_admin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ token, user });
    } finally {
      client.release();
    }
  } catch (e) {
    if (e?.code === '23505') return res.status(409).json({ error: 'Email or nickname already exists' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, nickname: user.nickname, is_admin: user.is_admin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, wallet_address: user.wallet_address, balance: user.balance, is_admin: user.is_admin } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile updates (nickname/email/password)
app.put('/profile', authMiddleware, async (req, res) => {
  const { email, nickname, password } = req.body;
  try {
    let passwordHashField = '';
    const params = [];
    let idx = 1;
    if (email) { params.push(email); passwordHashField += ` email=$${idx++},`; }
    if (nickname) { params.push(nickname); passwordHashField += ` nickname=$${idx++},`; }
    if (password) {
      if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Weak password' });
      const hash = await bcrypt.hash(password, 10);
      params.push(hash); passwordHashField += ` password_hash=$${idx++},`;
    }
    if (!passwordHashField) return res.json({ ok: true });
    const finalSet = passwordHashField.replace(/,$/, '');
    params.push(req.user.id);
    const q = `UPDATE users SET${finalSet} WHERE id=$${idx} RETURNING id, email, nickname, wallet_address, balance`;
    const r = await pool.query(q, params);
    res.json({ user: r.rows[0] });
  } catch (e) {
    if (e?.code === '23505') return res.status(409).json({ error: 'Email or nickname already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Listings
app.get('/listings', async (req, res) => {
  const { q, minPrice, maxPrice, owner } = req.query;
  const clauses = [];
  const params = [];
  let i = 1;
  if (q) { clauses.push(`(title ILIKE $${i} OR description ILIKE $${i})`); params.push(`%${q}%`); i++; }
  if (minPrice) { clauses.push(`price >= $${i}`); params.push(minPrice); i++; }
  if (maxPrice) { clauses.push(`price <= $${i}`); params.push(maxPrice); i++; }
  if (owner) { clauses.push(`user_id = $${i}`); params.push(owner); i++; }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await pool.query(
    `SELECT l.*, u.nickname, u.email FROM listings l JOIN users u ON u.id=l.user_id ${where} ORDER BY l.created_at DESC`,
    params
  );
  res.json(rows.rows);
});

app.post('/listings', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'Missing fields' });
    const image = req.file ? req.file.buffer : null;
    const r = await pool.query(
      'INSERT INTO listings (user_id, title, description, price, image) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, description || '', price, image]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update own listing
app.put('/listings/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, price } = req.body;
  const image = req.file ? req.file.buffer : undefined;
  const owner = await pool.query('SELECT user_id FROM listings WHERE id=$1', [id]);
  if (!owner.rows[0]) return res.status(404).json({ error: 'Not found' });
  if (owner.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const fields = [];
  const params = [];
  let i = 1;
  if (title !== undefined) { fields.push(`title=$${i++}`); params.push(title); }
  if (description !== undefined) { fields.push(`description=$${i++}`); params.push(description); }
  if (price !== undefined) { fields.push(`price=$${i++}`); params.push(price); }
  if (image !== undefined) { fields.push(`image=$${i++}`); params.push(image); }
  if (!fields.length) return res.json({ ok: true });
  params.push(id);
  const q = `UPDATE listings SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`;
  const r = await pool.query(q, params);
  res.json(r.rows[0]);
});

// Delete own listing
app.delete('/listings/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const owner = await pool.query('SELECT user_id FROM listings WHERE id=$1', [id]);
  if (!owner.rows[0]) return res.status(404).json({ error: 'Not found' });
  if (owner.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('DELETE FROM listings WHERE id=$1', [id]);
  res.json({ ok: true });
});

// Mint token
app.post('/listings/:id/mint', authMiddleware, async (req, res) => {
  const listingId = Number(req.params.id);
  try {
    const listing = await pool.query('SELECT * FROM listings WHERE id=$1', [listingId]);
    if (!listing.rows[0]) return res.status(404).json({ error: 'Listing not found' });
    const exists = await pool.query('SELECT * FROM tokens WHERE listing_id=$1', [listingId]);
    if (exists.rows[0]) return res.status(400).json({ error: 'Already minted' });
    const token = await pool.query('INSERT INTO tokens (listing_id, owner_id) VALUES ($1,$2) RETURNING *', [listingId, req.user.id]);
    res.json(token.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Purchase
app.post('/purchase', authMiddleware, async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ error: 'Missing listingId' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const listingRes = await client.query('SELECT * FROM listings WHERE id=$1', [listingId]);
    const listing = listingRes.rows[0];
    if (!listing) throw new Error('Listing not found');

    // Ensure token exists and has an owner (seller)
    let tokenRes = await client.query('SELECT * FROM tokens WHERE listing_id=$1', [listingId]);
    let token = tokenRes.rows[0];
    if (!token) {
      tokenRes = await client.query('INSERT INTO tokens (listing_id, owner_id) VALUES ($1,$2) RETURNING *', [listingId, listing.user_id]);
      token = tokenRes.rows[0];
    }

    const sellerId = token.owner_id || listing.user_id;
    if (sellerId === req.user.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot buy your own listing' });
    }

    const buyerRes = await client.query('SELECT id, balance FROM users WHERE id=$1 FOR UPDATE', [req.user.id]);
    const sellerRes = await client.query('SELECT id, balance FROM users WHERE id=$1 FOR UPDATE', [sellerId]);
    const buyer = buyerRes.rows[0];
    const seller = sellerRes.rows[0];
    const price = Number(listing.price);
    if (Number(buyer.balance) < price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await client.query('UPDATE users SET balance = balance - $1 WHERE id=$2', [price, buyer.id]);
    await client.query('UPDATE users SET balance = balance + $1 WHERE id=$2', [price, seller.id]);
    const txHash = generateTxHash();
    const tx = await client.query('INSERT INTO transactions (token_id, seller_id, buyer_id, amount, tx_hash) VALUES ($1,$2,$3,$4,$5) RETURNING *', [token.id, seller.id, buyer.id, price, txHash]);
    await client.query('UPDATE tokens SET owner_id=$1 WHERE id=$2', [buyer.id, token.id]);
    await client.query('INSERT INTO notifications (user_id, message) VALUES ($1,$2)', [seller.id, `Ваш товар куплен на сумму ${price} SOL`]);
    await client.query('COMMIT');
    res.json({ transaction: tx.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Wallet info
app.get('/wallet/:id', authMiddleware, async (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id !== userId) return res.status(403).json({ error: 'Forbidden' });
  try {
    const userRes = await pool.query('SELECT id, email, nickname, wallet_address, balance FROM users WHERE id=$1', [userId]);
    const tokensRes = await pool.query(`
      SELECT t.*, l.title, l.price FROM tokens t
      JOIN listings l ON l.id=t.listing_id
      WHERE t.owner_id=$1
      ORDER BY t.minted_at DESC
    `, [userId]);
    const txRes = await pool.query(`
      SELECT * FROM transactions WHERE buyer_id=$1 OR seller_id=$1 ORDER BY created_at DESC
    `, [userId]);
    const notificationsRes = await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
    res.json({ user: userRes.rows[0], tokens: tokensRes.rows, transactions: txRes.rows, notifications: notificationsRes.rows });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin APIs
app.get('/admin/listings', authMiddleware, adminMiddleware, async (req, res) => {
  const rows = await pool.query(`SELECT l.*, u.nickname, u.email FROM listings l JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC`);
  res.json(rows.rows);
});

app.delete('/admin/listings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { reason } = req.query;
  try {
    const listingRes = await pool.query('SELECT * FROM listings WHERE id=$1', [id]);
    const listing = listingRes.rows[0];
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await pool.query('DELETE FROM listings WHERE id=$1', [id]);
    await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1,$2)', [listing.user_id, `Ваше объявление удалено администратором. Причина: ${reason || 'не указана'}`]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const rows = await pool.query('SELECT id, email, nickname, wallet_address, balance, is_admin, created_at FROM users ORDER BY created_at DESC');
  res.json(rows.rows);
});

app.get('/admin/users/:id/transactions', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id);
  const tx = await pool.query('SELECT * FROM transactions WHERE buyer_id=$1 OR seller_id=$1 ORDER BY created_at DESC', [userId]);
  res.json(tx.rows);
});

app.delete('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id);
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Image fetch (basic)
app.get('/listings/:id/image', async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query('SELECT image FROM listings WHERE id=$1', [id]);
  const row = r.rows[0];
  if (!row || !row.image) return res.status(404).end();
  res.setHeader('Content-Type', 'image/png');
  res.send(row.image);
});

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Nomad-Market API' });
});

const PORT = Number(process.env.PORT || 4000);
initSchema().then(async () => {
  await ensureDefaultAdmin();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}).catch((e) => {
  console.error('Failed to init schema', e);
  process.exit(1);
});


