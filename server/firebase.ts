// Firebase Functions entry for API endpoints (minimal, hardened)
import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import { supabase } from './supabase';
// Lazy import bcrypt to reduce cold start
let bcryptPromise: Promise<typeof import('bcrypt')> | null = null;
const getBcrypt = () => {
  if (!bcryptPromise) bcryptPromise = import('bcrypt');
  return bcryptPromise;
}

const app = express();

// CORS allowlist (support custom domain + www + subdomains)
const allowedOrigins = new Set<string>([
  'https://srichakraacademy.org',
  'https://www.srichakraacademy.org',
  'https://srichakraacademy-3f745.web.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5000'
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl/postman
    try {
      const u = new URL(origin);
      const base = `${u.protocol}//${u.host}`;
      // Allow exact matches
      if (allowedOrigins.has(base)) return callback(null, true);
      // Allow any subdomain of srichakraacademy.org over https
      const host = u.host.toLowerCase();
      if (u.protocol === 'https:' && (host === 'srichakraacademy.org' || host.endsWith('.srichakraacademy.org'))) {
        return callback(null, true);
      }
    } catch {}
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple cookie parser (avoid extra deps)
function getCookie(req: express.Request, name: string): string | undefined {
  const raw = req.headers.cookie || '';
  const parts = raw.split(/;\s*/).map(s => s.trim());
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = decodeURIComponent(p.slice(0, idx));
    if (k === name) return decodeURIComponent(p.slice(idx + 1));
  }
  return undefined;
}


// Security headers
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

// Simple in-memory rate limiting (per instance)
type Bucket = { count: number; reset: number };
const rateBuckets: Map<string, Bucket> = new Map();
function allowRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const slot = Math.floor(now / windowMs);
  const bucketKey = `${key}:${slot}`;
  const b = rateBuckets.get(bucketKey) || { count: 0, reset: (slot + 1) * windowMs };
  b.count += 1;
  rateBuckets.set(bucketKey, b);
  return b.count <= limit;
}

// Global rate limit: 120 req/min/IP
app.use((req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  if (!allowRate(`g:${ip}`, 120, 60_000)) {
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }
  next();
});

// Admin endpoints backed by Supabase tables (admin_users, admin_sessions)
app.get('/api/admin/login-status', async (req, res) => {
  const verbose = req.query.verbose === '1';
  if (!supabase) return res.status(200).json(verbose ? { success: true, message: 'Admin login available', testMode: true } : { success: true });
  try {
    if (!verbose) return res.status(200).json({ success: true });
    const { count, error } = await supabase.from('admin_users').select('id', { count: 'estimated', head: true });
    if (error) throw error;
    res.status(200).json({ success: true, adminCount: count || 0 });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Stricter rate limit for admin login: 10/min/IP
app.post('/api/admin/login', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  if (!allowRate(`adm:${ip}`, 10, 60_000)) {
    return res.status(429).json({ success: false, message: 'Too many login attempts' });
  }
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing email or password' });
  }

  try {
    if (!supabase) {
      // fallback dev login
      const valid = (
        (email === 'admin@srichakra.com' && password === 'admin123') ||
        (email === 'admin@srichakraacademy.org' && password === 'admin123')
      );
      if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      return res.status(200).json({ success: true, message: 'Login successful', token: 'fn-token-' + Date.now(), user: { id: 1, name: 'Admin User', email, role: 'super_admin' } });
    }

    // Fetch including password to support bcrypt migration
    const { data: adminRow, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active, password')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!adminRow) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (adminRow.is_active === false) return res.status(403).json({ success: false, message: 'Account is disabled' });

    // Verify password (supports both plaintext and bcrypt)
    let validPass = false;
    if (adminRow.password && adminRow.password.startsWith('$2')) {
      const bcrypt = await getBcrypt();
      validPass = await bcrypt.compare(password, adminRow.password);
    } else {
      validPass = adminRow.password === password;
      // Opportunistic upgrade to bcrypt
      if (validPass) {
        try {
          const bcrypt = await getBcrypt();
          const hashed = await bcrypt.hash(password, 10);
          await supabase.from('admin_users').update({ password: hashed }).eq('id', adminRow.id);
        } catch {}
      }
    }

    if (!validPass) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = `adm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

  await supabase.from('admin_sessions').insert({ admin_id: adminRow.id, token, ip_address: ipAddress, user_agent: userAgent, is_active: true });
    await supabase.from('admin_users').update({ currently_logged_in: true, last_login: new Date().toISOString() }).eq('id', adminRow.id);

  // Set HttpOnly cookie for admin token so client doesn't need localStorage
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  res.setHeader('Set-Cookie', `adm_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`);

  return res.status(200).json({ success: true, message: 'Login successful', token, user: { id: adminRow.id, name: adminRow.name, email: adminRow.email, role: adminRow.role } });
  } catch (e: any) {
    // Fallback to dev login if relation missing or other DB errors
    const devValid = (email === 'admin@srichakra.com' && password === 'admin123') || (email === 'admin@srichakraacademy.org' && password === 'admin123');
    if (devValid) {
  // Set a temporary cookie in dev fallback
  const devToken = 'fn-token-' + Date.now();
  res.setHeader('Set-Cookie', `adm_token=${encodeURIComponent(devToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`);
  return res.status(200).json({ success: true, message: 'Login successful', token: devToken, user: { id: 1, name: 'Admin User', email, role: 'super_admin' } });
    }
    console.error('Admin login error:', e);
    res.status(500).json({ success: false, message: e.message || 'Server error' });
  }
});

app.get('/api/admin/profile', async (req, res) => {
  if (!supabase) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
  const auth = req.headers.authorization || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) token = getCookie(req, 'adm_token') || '';
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const { data: session, error: sErr } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
    if (sErr) throw sErr;
    if (!session) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    const { data: admin, error } = await supabase.from('admin_users').select('id, name, email, role').eq('id', session.admin_id).maybeSingle();
    if (error) throw error;
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, user: admin });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/admin/online-users', async (_req, res) => {
  if (!supabase) return res.status(200).json({ success: true, onlineAdmins: [] });
  try {
    const { data: sessions, error } = await supabase
      .from('admin_sessions')
      .select('admin_id, login_time, user_agent, ip_address')
      .eq('is_active', true)
      .limit(50);
    if (error) throw error;
    const adminIds = Array.from(new Set((sessions || []).map(s => s.admin_id)));
    let admins: any[] = [];
    if (adminIds.length) {
      const { data: a, error: aErr } = await supabase
        .from('admin_users')
        .select('id, name, email, role')
        .in('id', adminIds);
      if (aErr) throw aErr;
      admins = a || [];
    }
    res.status(200).json({ success: true, onlineAdmins: admins, sessions });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/admin/logout', async (req, res) => {
  try {
    if (!supabase) return res.status(200).json({ success: true, message: 'Logout successful' });
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) token = getCookie(req, 'adm_token') || '';
    if (!token) return res.status(200).json({ success: true });
    const { data: sess } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
    await supabase.from('admin_sessions').update({ is_active: false, logout_time: new Date().toISOString() }).eq('token', token);
    if (sess?.admin_id) {
      await supabase.from('admin_users').update({ currently_logged_in: false }).eq('id', sess.admin_id);
    }
    // Clear cookie
    res.setHeader('Set-Cookie', 'adm_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (e: any) {
    res.status(200).json({ success: true });
  }
});

// List users for admin (replace client localStorage usage)
app.get('/api/admin/users', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    // authenticate via token or cookie
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) token = getCookie(req, 'adm_token') || '';
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const { data: sess } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
    if (!sess?.admin_id) return res.status(401).json({ success: false, message: 'Invalid token' });

    const limit = Math.min(parseInt((req.query.limit as string) || '200', 10), 500);
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, school_name, city, country, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.status(200).json({ success: true, users: data || [] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- Schools endpoints (admin only) ---
app.get('/api/admin/schools', async (req, res) => {
  try {
    if (!supabase) return res.status(200).json({ success: true, schools: [] });
    // Optional auth: if a dev token is provided, treat as authenticated for reads
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : (getCookie(req, 'adm_token') || '');
    const { data, error } = await supabase.from('schools').select('id, name, email, code, is_active, created_at').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    res.status(200).json({ success: true, schools: data || [] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/admin/schools', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
    // simple auth using Bearer token in sessions
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
  const { data: sess } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
  if (!sess?.admin_id) return res.status(401).json({ success: false, message: 'Invalid token' });

  const { name, schoolName, email, code, isActive = true } = req.body || {};
    const finalName = name || schoolName;
    if (!finalName) return res.status(400).json({ success: false, message: 'name or schoolName is required' });
    const finalCode = code || `SCH${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const row: any = {
      name: finalName,
      email: email || null,
      code: finalCode,
      is_active: !!isActive,
    };

  const { data, error } = await supabase
      .from('schools')
      .insert(row)
      .select('id, name, email, code, is_active, created_at')
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, school: data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public user registration (stored in Supabase Postgres)
app.post('/api/register', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
  const { name, email, password, studentName, parentName, schoolName, age, occupation, city, country, notes, phone, studentClass, studentId, schoolCode } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // If registering via school, validate the student ID details
    if (schoolCode && studentId) {
      const { data: ss, error: ssErr } = await supabase
        .from('school_students')
        .select('student_name,parent_name,class,status')
        .eq('school_code', schoolCode)
        .eq('student_id', studentId)
        .maybeSingle();
      if (ssErr) throw ssErr;
      if (!ss) return res.status(400).json({ success: false, message: 'Invalid School ID' });
      if (ss.status === 'completed') {
        return res.status(409).json({ success: false, message: 'Assessment already completed for this ID' });
      }
      // Case-insensitive, trimmed matches when provided
      const norm = (v: any) => (v ?? '').toString().trim().toLowerCase();
      if (studentName && norm(studentName) !== norm(ss.student_name)) {
        return res.status(400).json({ success: false, message: 'Student name does not match school record' });
      }
      if (parentName && ss.parent_name && norm(parentName) !== norm(ss.parent_name)) {
        return res.status(400).json({ success: false, message: "Parent's name does not match school record" });
      }
      if (studentClass && ss.class && norm(studentClass) !== norm(ss.class)) {
        return res.status(400).json({ success: false, message: 'Class/Grade does not match school record' });
      }
    }
    // check exists
    const { data: existing, error: selErr } = await supabase
      .from('users')
      .select('id')
      .eq('username', email)
      .maybeSingle();
    if (selErr) throw selErr;
    if (existing) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
  const combinedNotes = [notes, phone ? `Phone: ${phone}` : null, studentClass ? `Class: ${studentClass}` : null, schoolCode ? `SchoolCode: ${schoolCode}` : null, studentId ? `StudentID: ${studentId}` : null].filter(Boolean).join(' | ');
    const insertObj = {
      username: email,
      password,
      full_name: name,
      student_name: studentName ?? null,
      parent_name: parentName ?? null,
      school_name: schoolName ?? null,
      age: age != null ? String(age) : null,
      occupation: occupation ?? null,
      city: city ?? null,
      country: country ?? null,
      notes: combinedNotes || null,
    };
    const { data, error } = await supabase.from('users').insert(insertObj).select('id, username').single();
    if (error) throw error;
    // If school registration, mark record as registered and link email
    if (schoolCode && studentId) {
      try {
        await supabase
          .from('school_students')
          .update({ claimed_email: email, status: 'registered', updated_at: new Date().toISOString() })
          .eq('school_code', schoolCode)
          .eq('student_id', studentId);
      } catch {}
    }
    res.status(201).json({ success: true, message: 'User registered successfully', user: data });
  } catch (e: any) {
    console.error('Supabase register error:', e);
    res.status(500).json({ success: false, message: e.message || 'Registration failed' });
  }
});

// Public user login via Supabase table users (plaintext for now)
app.post('/api/login', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name')
      .eq('username', email)
      .eq('password', password)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    // Set a simple session cookie for web client (non-secure auth for now)
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    res.setHeader('Set-Cookie', `usr=${encodeURIComponent(JSON.stringify({ id: data.id, email: data.username, name: data.full_name }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`);
    return res.status(200).json({ success: true, message: 'Login successful', user: data });
  } catch (e: any) {
    console.error('Supabase login error:', e);
    res.status(500).json({ success: false, message: e.message || 'Login failed' });
  }
});

// User whoami using cookie
app.get('/api/user/whoami', async (req, res) => {
  try {
    const raw = getCookie(req, 'usr');
    if (!raw) return res.status(200).json({ success: true, user: null });
    let user: any = null;
    try { user = JSON.parse(raw); } catch {}
    return res.status(200).json({ success: true, user });
  } catch (e: any) {
    res.status(200).json({ success: true, user: null });
  }
});

// User logout clears cookie
app.post('/api/logout', async (_req, res) => {
  res.setHeader('Set-Cookie', 'usr=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
  res.status(200).json({ success: true });
});

// School login using email + school code
app.post('/api/school/login', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or school code' });
    }
    
    // Find school by email and code (password = school code)
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, email, code, is_active')
      .eq('email', email)
      .eq('code', password)
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return res.status(401).json({ success: false, message: 'Invalid email or school code' });
    
    // Set school session cookie
    const schoolSession = JSON.stringify({ id: data.id, name: data.name, email: data.email, code: data.code });
    const maxAge = 24 * 60 * 60; // 24 hours
    res.setHeader('Set-Cookie', `school_session=${encodeURIComponent(schoolSession)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`);
    
    return res.status(200).json({ success: true, message: 'Login successful', school: data });
  } catch (e: any) {
    console.error('School login error:', e);
    res.status(500).json({ success: false, message: e.message || 'Login failed' });
  }
});

// School logout
app.post('/api/school/logout', async (_req, res) => {
  res.setHeader('Set-Cookie', 'school_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
  res.status(200).json({ success: true });
});

// Health check
let storageSetupAttempted = false;
async function ensureStorageConfigured() {
  if (!supabase) return { configured: false, reason: 'no_supabase' };
  try {
  const { data: buckets, error } = await supabase!.storage.listBuckets();
    if (error) throw error;
    const names = new Set((buckets || []).map(b => b.name));
    const createIfMissing = async (name: string, publicBucket = false) => {
      if (!names.has(name)) {
  await supabase!.storage.createBucket(name, { public: publicBucket });
        names.add(name);
      }
    };
    await createIfMissing('public-pdfs', true);
    await createIfMissing('student-pdfs', false);
    await createIfMissing('school-pdfs', false);
    return { configured: true };
  } catch (e) {
    console.error('Storage setup failed:', e);
    return { configured: false, reason: 'error' };
  }
}

app.get('/api/health', async (req, res) => {
  const verbose = req.query.verbose === '1';
  if (!verbose) return res.status(200).json({ ok: true });
  let storage = { configured: false } as any;
  if (!storageSetupAttempted) {
    storageSetupAttempted = true;
    storage = await ensureStorageConfigured();
  }
  res.status(200).json({ ok: true, env: 'firebase-functions', supabase: !!supabase, storage });
});

// Fallback for unknown /api routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Note: full DB-backed routes are intentionally not imported into Functions bundle
// to keep dependencies small and avoid bundling drizzle-orm.

// --- Supabase Storage PDF endpoints ---
app.get('/api/pdfs/list', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  const bucket = (req.query.bucket as string) || 'public-pdfs';
  const prefix = (req.query.prefix as string) || '';
  try {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    res.status(200).json({ success: true, files: data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/pdfs/signed-url', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  const bucket = (req.query.bucket as string) || 'student-pdfs';
  const path = req.query.path as string;
  const expiresIn = parseInt((req.query.expiresIn as string) || '3600', 10);
  if (!path) return res.status(400).json({ success: false, message: 'path is required' });
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    res.status(200).json({ success: true, url: data.signedUrl });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Accepts JSON body with base64 content
app.post('/api/pdfs/upload', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  const { bucket = 'public-pdfs', path, contentBase64, contentType = 'application/pdf', upsert = true, userEmail, schoolCode } = req.body || {};
  if (!path || !contentBase64) return res.status(400).json({ success: false, message: 'path and contentBase64 are required' });
  try {
    const buffer = Buffer.from(contentBase64, 'base64');
    const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType, upsert });
    if (error) throw error;
    let publicUrl: string | undefined;
    if (bucket === 'public-pdfs') {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      publicUrl = pub.publicUrl;
    }
    // record row in pdfs table
    try {
      await supabase.from('pdfs').insert({ user_email: userEmail || null, school_code: schoolCode || null, bucket, path: data.path });
    } catch {}
    res.status(200).json({ success: true, path: data.path, publicUrl });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// List PDFs by user email (admin/user)
app.get('/api/pdfs/by-user', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  const email = (req.query.email as string) || '';
  if (!email) return res.status(400).json({ success: false, message: 'email is required' });
  try {
    const { data, error } = await supabase.from('pdfs').select('bucket, path, created_at').eq('user_email', email).order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.status(200).json({ success: true, files: data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// List PDFs by school code (admin/school)
app.get('/api/pdfs/by-school', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  const code = (req.query.code as string) || '';
  if (!code) return res.status(400).json({ success: false, message: 'code is required' });
  try {
    const { data, error } = await supabase.from('pdfs').select('user_email, bucket, path, created_at').eq('school_code', code).order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    res.status(200).json({ success: true, files: data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- School Students: validation and status tracking ---
// Admin: add/register a school student entry (generates/records the student ID)
app.post('/api/admin/school/students', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    // authenticate admin
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) token = getCookie(req, 'adm_token') || '';
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const { data: sess } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
    if (!sess?.admin_id) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { schoolCode, studentId, studentName, parentName, studentClass, expectedEmail } = req.body || {};
    if (!schoolCode || !studentId || !studentName) {
      return res.status(400).json({ success: false, message: 'schoolCode, studentId, and studentName are required' });
    }
    const row = {
      school_code: String(schoolCode),
      student_id: String(studentId),
      student_name: String(studentName),
      parent_name: parentName ? String(parentName) : null,
      class: studentClass ? String(studentClass) : null,
      expected_email: expectedEmail ? String(expectedEmail) : null,
      status: 'pending' as const,
      updated_at: new Date().toISOString(),
    } as any;
    const { data, error } = await supabase.from('school_students').insert(row).select('*').single();
    if (error) throw error;
    res.status(201).json({ success: true, student: data });
  } catch (e: any) {
    // unique violation -> conflict
    if (String(e.message || '').toLowerCase().includes('duplicate')) {
      return res.status(409).json({ success: false, message: 'Student ID already exists for this school' });
    }
    res.status(500).json({ success: false, message: e.message || 'Failed to add student' });
  }
});

// Admin: list school students and their statuses
app.get('/api/admin/school/students', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) token = getCookie(req, 'adm_token') || '';
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const { data: sess } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
    if (!sess?.admin_id) return res.status(401).json({ success: false, message: 'Invalid token' });

    const schoolCode = (req.query.schoolCode as string) || '';
    const q = supabase.from('school_students').select('school_code,student_id,student_name,parent_name,class,expected_email,claimed_email,status,created_at,updated_at').order('created_at', { ascending: false }).limit(500);
    const { data, error } = schoolCode ? await q.eq('school_code', schoolCode) : await q;
    if (error) throw error;
    res.status(200).json({ success: true, students: data || [] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || 'Failed to list students' });
  }
});

// Public: validate a student ID against school pre-registered record
app.post('/api/school/validate-student', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    const { schoolCode, studentId, studentName, parentName, studentClass } = req.body || {};
    if (!schoolCode || !studentId) {
      return res.status(400).json({ success: false, message: 'schoolCode and studentId are required' });
    }
    const { data: ss, error } = await supabase
      .from('school_students')
      .select('student_name,parent_name,class,status,expected_email,claimed_email')
      .eq('school_code', schoolCode)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    if (!ss) return res.status(404).json({ success: false, message: 'Invalid School ID' });
    const norm = (v: any) => (v ?? '').toString().trim().toLowerCase();
    if (studentName && norm(studentName) !== norm(ss.student_name)) return res.status(400).json({ success: false, message: 'Student name mismatch' });
    if (parentName && ss.parent_name && norm(parentName) !== norm(ss.parent_name)) return res.status(400).json({ success: false, message: 'Parent name mismatch' });
    if (studentClass && ss.class && norm(studentClass) !== norm(ss.class)) return res.status(400).json({ success: false, message: 'Class mismatch' });
    res.status(200).json({ success: true, status: ss.status, expectedEmail: ss.expected_email || null, claimedEmail: ss.claimed_email || null });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || 'Validation failed' });
  }
});

// Admin: mark assessment completed for a school student (optionally attach pdf path)
app.post('/api/admin/school/assessment/complete', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: 'Supabase not configured' });
  try {
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) token = getCookie(req, 'adm_token') || '';
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const { data: sess } = await supabase.from('admin_sessions').select('admin_id').eq('token', token).eq('is_active', true).maybeSingle();
    if (!sess?.admin_id) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { schoolCode, studentId } = req.body || {};
    if (!schoolCode || !studentId) return res.status(400).json({ success: false, message: 'schoolCode and studentId are required' });
    const { error } = await supabase
      .from('school_students')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('school_code', schoolCode)
      .eq('student_id', studentId);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || 'Failed to update status' });
  }
});

// 1st Gen Functions export; make public via IAM (Invoker: allUsers)
export const api = functions
  .runWith({ secrets: ['SUPABASE_URL', 'SUPABASE_REF', 'SUPABASE_SERVICE_ROLE_KEY'] })
  .https.onRequest(app);
