// api/admin/user-activity.js - Serverless function for tracking user activity
import { createServerlessHandler } from '../../server/serverless-handler';

// Simple middleware to check admin token
const checkAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // For demo purposes, any token starting with 'demo-token-' is valid
    if (token.startsWith('demo-token-')) {
      return next();
    }
    
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Handler for user activity tracking
const userActivityHandler = async (req, res) => {
  try {
    return checkAdminToken(req, res, () => {
      if (req.method === 'GET') {
        // Get user activity data
        const mockUserActivity = [
          {
            id: 1,
            userId: 1,
            username: 'student1@example.com',
            fullName: 'John Smith',
            sessionType: 'web',
            loginTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            isActive: true,
            currentPage: 'Career Assessment',
            activityStatus: 'Taking Assessment'
          },
          {
            id: 2,
            userId: null, // Guest user
            username: 'guest@srichakra.com',
            fullName: 'Guest User',
            sessionType: 'guest',
            loginTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            lastActivity: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
            ipAddress: '203.45.67.89',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            isActive: true,
            currentPage: 'Career Assessment',
            activityStatus: 'Taking Assessment'
          },
          {
            id: 3,
            userId: 2,
            username: 'parent@example.com',
            fullName: 'Sarah Johnson',
            sessionType: 'web',
            loginTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            lastActivity: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
            ipAddress: '10.0.0.15',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
            isActive: false,
            currentPage: 'Dashboard',
            activityStatus: 'Logged Out'
          },
          {
            id: 4,
            userId: 3,
            username: 'teacher@school.edu',
            fullName: 'Mike Wilson',
            sessionType: 'web',
            loginTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
            lastActivity: new Date().toISOString(), // Just now
            ipAddress: '172.16.0.5',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            isActive: true,
            currentPage: 'Student Reports',
            activityStatus: 'Viewing Reports'
          }
        ];

        const stats = {
          totalActiveUsers: mockUserActivity.filter(u => u.isActive).length,
          totalGuestUsers: mockUserActivity.filter(u => u.sessionType === 'guest').length,
          totalRegisteredUsers: mockUserActivity.filter(u => u.userId !== null).length,
          averageSessionTime: '25 minutes',
          mostActivePages: [
            { page: 'Career Assessment', users: 2 },
            { page: 'Student Reports', users: 1 },
            { page: 'Dashboard', users: 1 }
          ]
        };

        return res.status(200).json({
          success: true,
          userActivity: mockUserActivity,
          stats: stats
        });
      }

      if (req.method === 'POST') {
        // Track new user session
        const { userId, sessionToken, ipAddress, userAgent, sessionType = 'web' } = req.body;

        // In a real implementation, you would save this to the database
        const newSession = {
          id: Date.now(),
          userId: userId || null,
          sessionToken,
          ipAddress,
          userAgent,
          sessionType,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isActive: true
        };

        return res.status(201).json({
          success: true,
          message: 'User session tracked successfully',
          session: newSession
        });
      }

      return res.status(405).json({ success: false, message: 'Method not allowed' });
    });
  } catch (error) {
    console.error('User activity tracking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(userActivityHandler);
