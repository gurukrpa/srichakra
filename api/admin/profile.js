// api/admin/profile.js - Serverless function for Vercel
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
      // Add admin user info to request
      req.adminUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@srichakra.com',
        role: 'super_admin'
      };
      return next();
    }
    
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Handler for the profile endpoint
const profileHandler = async (req, res) => {
  try {
    // Check token first
    return checkToken(req, res, () => {
      // Return user profile info
      res.status(200).json({
        success: true,
        user: req.adminUser
      });
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(profileHandler);
