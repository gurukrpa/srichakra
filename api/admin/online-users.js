// api/admin/online-users.js - Serverless function for Vercel
import { createServerlessHandler } from '../../server/serverless-handler';

// Simple middleware to check token in authorization header
const checkToken = (req, res, next) => {
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

// Handler for the online users endpoint
const onlineUsersHandler = async (req, res) => {
  try {
    // Check token first
    return checkToken(req, res, () => {
      // Return mock online users data for demo purposes
      const mockUsers = [
        { id: 1, name: 'Student 1', email: 'student1@example.com', lastActive: new Date().toISOString(), status: 'active' },
        { id: 2, name: 'Student 2', email: 'student2@example.com', lastActive: new Date().toISOString(), status: 'active' },
        { id: 3, name: 'Teacher 1', email: 'teacher1@example.com', lastActive: new Date().toISOString(), status: 'idle' },
        { id: 4, name: 'Admin User', email: 'admin@srichakra.com', lastActive: new Date().toISOString(), status: 'active' }
      ];
      
      res.status(200).json({
        success: true,
        onlineUsers: mockUsers
      });
    });
  } catch (error) {
    console.error('Online users retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(onlineUsersHandler);
