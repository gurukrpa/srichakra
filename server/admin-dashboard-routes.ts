import { Express, Request, Response } from 'express';
import { db } from './db';
import { adminUsers, adminSessions } from '../shared/admin-schema';
import { users } from '../shared/schema';
import { eq, and, count } from 'drizzle-orm';
import { adminAuthMiddleware } from './admin-routes';

// Stats interface
interface DashboardStats {
  totalStudents: number;
  newRegistrations: number;
  totalAppointments: number;
  totalRevenue: number;
  recentStudents: any[];
  onlineAdmins: any[];
}

export function registerAdminDashboardRoutes(app: Express) {
  // Get dashboard overview stats
  app.get('/api/admin/dashboard/stats', adminAuthMiddleware, async (req, res) => {
    try {
      // For now, returning placeholder data
      // In a real implementation, you would query the database for actual statistics
      
      const stats: DashboardStats = {
        totalStudents: 1245,
        newRegistrations: 42,
        totalAppointments: 24,
        totalRevenue: 48250,
        recentStudents: [
          {
            id: 1,
            name: "Aditya Sharma",
            school: "Delhi Public School",
            age: 14,
            status: "active"
          },
          {
            id: 2,
            name: "Priya Singh",
            school: "St. Mary's High School",
            age: 16,
            status: "active"
          },
          {
            id: 3,
            name: "Rahul Kumar",
            school: "Kendriya Vidyalaya",
            age: 15,
            status: "pending"
          },
          {
            id: 4,
            name: "Sneha Patel",
            school: "City Montessori School",
            age: 12,
            status: "active"
          },
          {
            id: 5,
            name: "Arjun Reddy",
            school: "The International School",
            age: 17,
            status: "inactive"
          }
        ],
        onlineAdmins: []
      };
      
      // Get currently online admins
      const onlineAdmins = await db.select({
        id: adminUsers.id,
        name: adminUsers.name,
        role: adminUsers.role,
      })
      .from(adminUsers)
      .where(eq(adminUsers.currentlyLoggedIn, true));
      
      stats.onlineAdmins = onlineAdmins;
      
      res.status(200).json({ success: true, stats });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  // Get active sessions
  app.get('/api/admin/active-sessions', adminAuthMiddleware, async (req, res) => {
    try {
      const activeSessions = await db.select({
        id: adminSessions.id,
        adminId: adminSessions.adminId,
        ipAddress: adminSessions.ipAddress,
        userAgent: adminSessions.userAgent,
        loginTime: adminSessions.loginTime,
        admin: {
          id: adminUsers.id,
          name: adminUsers.name,
          email: adminUsers.email,
          role: adminUsers.role
        }
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
      .where(eq(adminSessions.isActive, true));
      
      res.status(200).json({ success: true, activeSessions });
      
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
}
