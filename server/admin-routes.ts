import { Express, Request, Response } from 'express';
import { db } from './db';
import { adminUsers, adminSessions } from '../shared/admin-schema';
import { schools } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, verifyPassword, generateToken } from './utils/auth';

// Authentication middleware
export const adminAuthMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Find active session with token
    const session = await db.query.adminSessions.findFirst({
      where: and(
        eq(adminSessions.token, token),
        eq(adminSessions.isActive, true)
      ),
      with: {
        admin: true
      }
    });
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Attach admin user to request for further use
    (req as any).adminUser = session.admin;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Super admin middleware - only allows super_admin role
export const superAdminMiddleware = async (req: Request, res: Response, next: any) => {
  const adminUser = (req as any).adminUser;
  
  if (!adminUser || adminUser.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Requires super admin privileges' });
  }
  
  next();
};

export function registerAdminRoutes(app: Express) {
  // Change password endpoint
  app.post('/api/admin/change-password', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      const { currentPassword, newPassword } = req.body;
      
      // Basic validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }
      
      // For development, simple comparison
      if (adminUser.password !== currentPassword) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      
      // In production, we would use verifyPassword and hashPassword:
      // const passwordMatches = await verifyPassword(currentPassword, adminUser.password);
      // if (!passwordMatches) {
      //   return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      // }
      // const hashedNewPassword = await hashPassword(newPassword);
      
      // Update password
      await db.update(adminUsers)
        .set({ 
          password: newPassword, // In production, use hashedNewPassword
          updatedAt: new Date()
        })
        .where(eq(adminUsers.id, adminUser.id));
      
      res.status(200).json({ success: true, message: 'Password updated successfully' });
      
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin login status check endpoint
  app.get('/api/admin/login-status', async (req, res) => {
    try {
      // Check DB connection by querying for any admin users
      const adminCount = await db.query.adminUsers.findMany({
        limit: 5
      });
      
      res.status(200).json({ 
        success: true, 
        message: 'Admin login system is operational',
        adminCount: adminCount.length,
        testMode: true
      });
    } catch (error) {
      console.error('Login status check error:', error);
      res.status(500).json({ success: false, message: 'Database connection error' });
    }
  });

  // Admin login endpoint
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email }); // Log login attempts
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing email or password' });
      }
      
      // DEVELOPMENT MODE: Allow hardcoded credentials for testing
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev && email === 'admin@srichakra.com' && password === 'admin123') {
        console.log('Using development mode login with hardcoded credentials');
        return res.status(200).json({
          success: true,
          message: 'Login successful (development mode)',
          token: 'dev-token-' + Date.now(),
          user: {
            id: 1,
            name: 'Admin User',
            email: email,
            role: 'super_admin'
          }
        });
      }
      
      // Find admin user by email
      const admin = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.email, email)
      });
      
      // Check if user exists
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Check if password matches - for now using direct comparison, but in production use verifyPassword
      // const passwordMatches = await verifyPassword(password, admin.password);
      const passwordMatches = admin.password === password; // Simple comparison for development
      
      if (!passwordMatches) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (!admin.isActive) {
        return res.status(403).json({ success: false, message: 'Account is disabled' });
      }
      
      // Generate session token
      const token = generateToken();
      
      // Create session
      await db.insert(adminSessions).values({
        adminId: admin.id,
        token,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        isActive: true
      });
      
      // Update last login time and login status
      await db.update(adminUsers)
        .set({ 
          lastLogin: new Date(),
          currentlyLoggedIn: true
        })
        .where(eq(adminUsers.id, admin.id));
      
      // Return success with token and user info
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
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
  
  // Admin logout endpoint
  app.post('/api/admin/logout', adminAuthMiddleware, async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const adminUser = (req as any).adminUser;
      
      // Update session to inactive
      await db.update(adminSessions)
        .set({ 
          isActive: false,
          logoutTime: new Date()
        })
        .where(and(
          eq(adminSessions.token, token as string),
          eq(adminSessions.adminId, adminUser.id)
        ));
      
      // Update user login status
      await db.update(adminUsers)
        .set({ currentlyLoggedIn: false })
        .where(eq(adminUsers.id, adminUser.id));
      
      res.status(200).json({ success: true, message: 'Logout successful' });
      
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Get all team members (admin users)
  app.get('/api/admin/team-members', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      
      // Only super_admin and admin can view all members
      if (adminUser.role !== 'super_admin' && adminUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      
      // Get all team members excluding passwords
      const teamMembers = await db.select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        designation: adminUsers.designation,
        department: adminUsers.department,
        isActive: adminUsers.isActive,
        lastLogin: adminUsers.lastLogin,
        currentlyLoggedIn: adminUsers.currentlyLoggedIn,
        createdAt: adminUsers.createdAt
      }).from(adminUsers);
      
      res.status(200).json({ success: true, teamMembers });
      
    } catch (error) {
      console.error('Get team members error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Create new team member (admin user)
  app.post('/api/admin/team-members', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      const { name, email, password, role, phone, designation, department } = req.body;
      
      // Only super_admin can create other super_admins
      if (role === 'super_admin' && adminUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super admins can create other super admins' });
      }
      
      // Admin can only create staff/teachers
      if (adminUser.role === 'admin' && (role === 'super_admin' || role === 'admin')) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions for this role' });
      }
      
      // Staff/teachers cannot create new users
      if (adminUser.role === 'teacher' || adminUser.role === 'staff') {
        return res.status(403).json({ success: false, message: 'You do not have permission to create users' });
      }
      
      // Check for existing email
      const existingUser = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.email, email)
      });
      
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      
      // In production, hash the password
      // const hashedPassword = await hashPassword(password);
      const hashedPassword = password; // Simple for development
      
      // Create new team member
      const newMember = await db.insert(adminUsers).values({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        designation,
        department,
        isActive: true,
        createdBy: adminUser.id
      }).returning();
      
      res.status(201).json({ 
        success: true, 
        message: 'Team member created successfully',
        member: {
          id: newMember[0].id,
          name: newMember[0].name,
          email: newMember[0].email,
          role: newMember[0].role
        }
      });
      
    } catch (error) {
      console.error('Create team member error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Update team member (admin user)
  app.put('/api/admin/team-members/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      const memberId = parseInt(req.params.id);
      const { name, email, role, phone, designation, department, isActive } = req.body;
      
      // Get the user to be updated
      const memberToUpdate = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, memberId)
      });
      
      if (!memberToUpdate) {
        return res.status(404).json({ success: false, message: 'Team member not found' });
      }
      
      // Only super_admin can modify other super_admins
      if (memberToUpdate.role === 'super_admin' && adminUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super admins can modify other super admins' });
      }
      
      // Admin cannot modify other admins or super admins
      if (adminUser.role === 'admin' && (memberToUpdate.role === 'super_admin' || memberToUpdate.role === 'admin')) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      
      // Staff/teachers can only update their own profiles and limited fields
      if (adminUser.role === 'teacher' || adminUser.role === 'staff') {
        if (adminUser.id !== memberId) {
          return res.status(403).json({ success: false, message: 'You can only update your own profile' });
        }
      }
      
      // Update team member
      const updatedMember = await db.update(adminUsers)
        .set({
          name,
          email,
          role: adminUser.role === 'super_admin' ? role : memberToUpdate.role, // Only super admin can change roles
          phone,
          designation,
          department,
          isActive: adminUser.role === 'super_admin' || adminUser.role === 'admin' ? isActive : memberToUpdate.isActive,
          updatedAt: new Date()
        })
        .where(eq(adminUsers.id, memberId))
        .returning();
      
      res.status(200).json({
        success: true,
        message: 'Team member updated successfully',
        member: {
          id: updatedMember[0].id,
          name: updatedMember[0].name,
          email: updatedMember[0].email,
          role: updatedMember[0].role,
          isActive: updatedMember[0].isActive
        }
      });
      
    } catch (error) {
      console.error('Update team member error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Delete team member (admin user)
  app.delete('/api/admin/team-members/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      const memberId = parseInt(req.params.id);
      
      // Only super_admin and admin can delete users
      if (adminUser.role !== 'super_admin' && adminUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      
      // Get the user to be deleted
      const memberToDelete = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, memberId)
      });
      
      if (!memberToDelete) {
        return res.status(404).json({ success: false, message: 'Team member not found' });
      }
      
      // Only super_admin can delete other super_admins
      if (memberToDelete.role === 'super_admin' && adminUser.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super admins can delete other super admins' });
      }
      
      // Admin cannot delete other admins or super admins
      if (adminUser.role === 'admin' && (memberToDelete.role === 'super_admin' || memberToDelete.role === 'admin')) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      
      // Delete user (soft delete by setting isActive to false)
      await db.update(adminUsers)
        .set({ isActive: false })
        .where(eq(adminUsers.id, memberId));
      
      res.status(200).json({
        success: true,
        message: 'Team member deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete team member error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Get online users
  app.get('/api/admin/online-users', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      
      // All admin levels can see who's online
      const onlineUsers = await db.select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        lastLogin: adminUsers.lastLogin
      })
      .from(adminUsers)
      .where(eq(adminUsers.currentlyLoggedIn, true));
      
      res.status(200).json({ success: true, onlineUsers });
      
    } catch (error) {
      console.error('Get online users error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin user profile endpoint - protected by authentication
  app.get('/api/admin/profile', adminAuthMiddleware, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser;
      
      // Return the admin profile data
      res.json({
        success: true,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email, 
          role: adminUser.role,
          isActive: adminUser.isActive,
          lastLogin: adminUser.lastLogin
        }
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Get online users - protected endpoint
  app.get('/api/admin/online-users', adminAuthMiddleware, async (req, res) => {
    try {
      // Only super admins and regular admins can see this info
      const adminUser = (req as any).adminUser;
      if (!['super_admin', 'admin'].includes(adminUser.role)) {
        return res.status(403).json({ 
          success: false,
          message: 'Insufficient permissions to view online users'
        });
      }
      
      // Get online users (those with currentlyLoggedIn=true)
      const onlineUsers = await db.query.adminUsers.findMany({
        where: eq(adminUsers.currentlyLoggedIn, true),
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLogin: true
        }
      });
      
      res.json({
        success: true,
        onlineUsers
      });
    } catch (error) {
      console.error('Error fetching online users:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // School Management Endpoints
  // In-memory storage for development mode
  let schoolsStorage: any[] = [];

  // Get all schools
  app.get('/api/admin/schools', adminAuthMiddleware, async (req, res) => {
    try {
      // For development mode, use in-memory storage
      res.status(200).json({ success: true, schools: schoolsStorage });
      
    } catch (error) {
      console.error('Get schools error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Create new school
  app.post('/api/admin/schools', adminAuthMiddleware, async (req, res) => {
    try {
      const { schoolName, email, password } = req.body;
      
      // Basic validation
      if (!schoolName || !email || !password) {
        return res.status(400).json({ success: false, message: 'School name, email, and password are required' });
      }
      
      // Check for existing email in memory storage
      const existingSchool = schoolsStorage.find(school => school.email === email);
      
      if (existingSchool) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      
      // Generate school code
      const schoolCode = schoolName.replace(/\s+/g, '').toLowerCase().substring(0, 8) + Date.now().toString().slice(-4);
      
      // Create new school in memory
      const newSchool = {
        id: Date.now(),
        name: schoolName,
        email,
        password, // In production, this should be hashed
        code: schoolCode,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      schoolsStorage.push(newSchool);
      
      res.status(201).json({ 
        success: true, 
        message: 'School created successfully',
        school: {
          id: newSchool.id,
          name: newSchool.name,
          email: newSchool.email,
          code: newSchool.code,
          createdAt: newSchool.createdAt
        }
      });
      
    } catch (error) {
      console.error('Create school error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Delete school
  app.delete('/api/admin/schools/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const schoolId = parseInt(req.params.id);
      
      // Remove from memory storage
      schoolsStorage = schoolsStorage.filter(school => school.id !== schoolId);
      
      res.status(200).json({ success: true, message: 'School deleted successfully' });
      
    } catch (error) {
      console.error('Delete school error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}
