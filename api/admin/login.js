// api/admin/login.js - Serverless function for Vercel
import { createServerlessHandler } from '../../server/serverless-handler';

// Create a simplified login handler for Vercel that doesn't rely on database
const vercelAdminLoginHandler = async (req, res) => {
  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }
    
    // Allow hardcoded credentials for demonstration/testing
    if (email === 'admin@srichakra.com' && password === 'admin123') {
      console.log('Login successful with demo credentials');
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: 'demo-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Admin User',
          email: email,
          role: 'super_admin'
        }
      });
    }
    
    // If credentials don't match
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(vercelAdminLoginHandler);
