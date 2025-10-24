import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Simple authentication middleware
export const adminAuthMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // For development, accept any token that starts with 'dev-token-'
    if (token.startsWith('dev-token-')) {
      (req as any).adminUser = {
        id: 1,
        name: 'Super Admin',
        email: 'admin@srichakra.com',
        role: 'super_admin'
      };
      return next();
    }
    
    // Find active session with token using Supabase
    const { data: sessions, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admin_users(*)
      `)
      .eq('token', token)
      .eq('is_active', true)
      .limit(1);
    
    if (error || !sessions || sessions.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Attach admin user to request
    (req as any).adminUser = sessions[0].admin_users;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export function registerAdminRoutes(app: Express) {
  // Admin login status check endpoint
  app.get('/api/admin/login-status', async (req, res) => {
    try {
      res.status(200).json({ 
        success: true, 
        message: 'Admin login system is operational',
        testMode: true
      });
    } catch (error) {
      console.error('Login status check error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin profile endpoint (used by client to verify session)
  app.get('/api/admin/profile', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      if (!adminUser) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      return res.status(200).json({ success: true, user: adminUser });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin login endpoint
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email });
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing email or password' });
      }
      
      // Development mode: Allow hardcoded credentials
      if (email === 'admin@srichakra.com' && password === 'admin123') {
        console.log('Using development mode login with hardcoded credentials');
        return res.status(200).json({
          success: true,
          message: 'Login successful (development mode)',
          token: 'dev-token-' + Date.now(),
          user: {
            id: 1,
            name: 'Super Admin',
            email: email,
            role: 'super_admin'
          }
        });
      }
      
      // Try to find admin user in Supabase
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .limit(1);
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!admins || admins.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const admin = admins[0];
      
      // Simple password check (in production, use proper hashing)
      if (admin.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Generate session token
      const token = 'session-token-' + Date.now() + '-' + Math.random().toString(36);
      
      // Create session in database
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          admin_id: admin.id,
          token: token,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          is_active: true
        });
      
      if (sessionError) {
        console.error('Session creation error:', sessionError);
        // Continue anyway, just log the error
      }
      
      // Update last login
      await supabase
        .from('admin_users')
        .update({ 
          last_login: new Date().toISOString(),
          currently_logged_in: true 
        })
        .eq('id', admin.id);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
      
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin logout endpoint (no strict auth required; best-effort invalidate)
  app.post('/api/admin/logout', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token && !token.startsWith('dev-token-')) {
        // Deactivate session
        await supabase
          .from('admin_sessions')
          .update({ 
            is_active: false,
            logout_time: new Date().toISOString()
          })
          .eq('token', token);
      }
      
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Online admins
  app.get('/api/admin/online-users', adminAuthMiddleware, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, name, email, role')
        .eq('currently_logged_in', true);

      if (error) {
        console.error('Error fetching online admins:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      res.status(200).json({ success: true, onlineUsers: data || [] });
    } catch (error) {
      console.error('Online users error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Recently registered users (limited)
  app.get('/api/admin/users', adminAuthMiddleware, async (req, res) => {
    try {
      const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 200);
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, school_name, city, country, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.error('Fetch users error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.status(200).json({ success: true, users: data || [] });
    } catch (error) {
      console.error('Users list error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Change password
  app.post('/api/admin/change-password', adminAuthMiddleware, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body || {};
      const adminUser = (req as any).adminUser;
      if (!adminUser) return res.status(401).json({ success: false, message: 'Not authenticated' });
      if (!newPassword) return res.status(400).json({ success: false, message: 'New password required' });
      // If in dev mode, accept without verifying old password
      if (!oldPassword || (adminUser?.password && adminUser.password !== oldPassword)) {
        // In real impl, verify oldPassword with hash
      }
      const { error } = await supabase
        .from('admin_users')
        .update({ password: newPassword })
        .eq('id', adminUser.id);
      if (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // School management endpoints
  app.get('/api/admin/schools', adminAuthMiddleware, async (req, res) => {
    try {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching schools:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      
      res.status(200).json({ success: true, schools: schools || [] });
    } catch (error) {
      console.error('Error fetching schools:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/admin/schools', adminAuthMiddleware, async (req, res) => {
    try {
      const { name, email, password, code } = req.body;
      // Allow clients that send `schoolName` instead of `name`
      const finalName = name || req.body?.schoolName;
      // Auto-generate a code if not provided
      const finalCode = code || `SCH${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      if (!finalName || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: name/schoolName, email, password' 
        });
      }
      
      // Insert new school
      const { data: school, error } = await supabase
        .from('schools')
        .insert({
          name: finalName,
          email,
          password,
          code: finalCode,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating school:', error);
        if (error.code === '23505') {
          return res.status(400).json({ 
            success: false, 
            message: 'School with this email or code already exists' 
          });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'School created successfully',
        school 
      });
    } catch (error) {
      console.error('Error creating school:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.delete('/api/admin/schools/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting school:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      
      res.status(200).json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
      console.error('Error deleting school:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}
