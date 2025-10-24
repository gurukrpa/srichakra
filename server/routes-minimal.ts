import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { registerAdminRoutes } from "./admin-routes-supabase";
import { createClient } from '@supabase/supabase-js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Lightweight Supabase client for dev API routes
  const SUPABASE_URL = process.env.SUPABASE_URL || (process.env.SUPABASE_REF ? `https://${process.env.SUPABASE_REF}.supabase.co` : undefined);
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : undefined;

  // Simple health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // Register admin routes (which work with Supabase)
  registerAdminRoutes(app);

  // Simple contact endpoint (mock for now)
  app.post('/api/contact', (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Message received (mock response)' 
    });
  });

  // Temporary registration endpoint (returns success but doesn't save)
  app.post('/api/register', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Mock successful registration
    res.status(200).json({ 
      success: true, 
      message: 'Registration successful (mock)',
      user: { email, id: Date.now() }
    });
  });

  // Temporary login endpoint (returns success for any credentials)
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Mock successful login
    res.status(200).json({ 
      success: true, 
      message: 'Login successful (mock)',
      token: 'mock-token-' + Date.now(),
      user: { email, id: Date.now() }
    });
  });

  // --- School auth endpoints (mirror of firebase functions minimal) ---
  // Login using school email + code (password)
  app.post('/api/school/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing email or school code' });
      }

      if (!supabase) {
        // Dev fallback: accept known test pair
        const allow = email === 'admin@srichakra.com' && typeof password === 'string' && password.startsWith('SCH');
        if (!allow) return res.status(501).json({ success: false, message: 'Supabase not configured in dev' });
        const school = { id: 1, name: 'maya', email, code: password, is_active: true } as const;
        res.setHeader('Set-Cookie', `school_session=${encodeURIComponent(JSON.stringify({ id: school.id, name: school.name, email: school.email, code: school.code }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        return res.status(200).json({ success: true, message: 'Login successful (dev)', school });
      }

      const { data, error } = await supabase
        .from('schools')
        .select('id, name, email, code, is_active')
        .eq('email', email)
        .eq('code', password)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(401).json({ success: false, message: 'Invalid email or school code' });

      const schoolSession = JSON.stringify({ id: data.id, name: data.name, email: data.email, code: data.code });
      const maxAge = 24 * 60 * 60; // 24h
      res.setHeader('Set-Cookie', `school_session=${encodeURIComponent(schoolSession)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
      return res.status(200).json({ success: true, message: 'Login successful', school: data });
    } catch (e: any) {
      console.error('School login error (dev):', e);
      return res.status(500).json({ success: false, message: e?.message || 'Login failed' });
    }
  });

  // Logout clears cookie
  app.post('/api/school/logout', async (_req: Request, res: Response) => {
    res.setHeader('Set-Cookie', 'school_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.status(200).json({ success: true });
  });

  return createServer(app);
}
