// api/admin/logout.js - Serverless function for Vercel
import { createServerlessHandler } from '../../server/serverless-handler';

const logoutHandler = async (req, res) => {
  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // In a real implementation with a database, we would invalidate the token
    // For our simplified version, just return success
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(logoutHandler);
