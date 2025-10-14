// api/admin/login-status.js - Serverless function for Vercel
import { createServerlessHandler } from '../../server/serverless-handler';

// Create a simple login status handler
const loginStatusHandler = async (req, res) => {
  try {
    // For Vercel deployment, we don't have direct DB access in the serverless function
    // So we'll return a simplified status response
    res.status(200).json({ 
      success: true, 
      message: 'Admin login system is operational',
      environment: process.env.NODE_ENV || 'development',
      serverType: 'vercel-serverless'
    });
  } catch (error) {
    console.error('Login status check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(loginStatusHandler);
