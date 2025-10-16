// api/admin/registered-users.js - Get all registered users for admin dashboard
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

// Handler for registered users endpoint
const registeredUsersHandler = async (req, res) => {
  try {
    return checkAdminToken(req, res, () => {
      if (req.method === 'GET') {
        // In a real app, this would come from a database
        // For demo, we'll return mock data that matches the structure
        const mockUsers = [
          {
            id: 'user_1234567890',
            name: 'Aditya Sharma',
            email: 'aditya.sharma@example.com',
            phone: '+91 98765 43210',
            studentName: 'Aditya Sharma',
            parentName: 'Mr. Rajesh Sharma',
            schoolName: 'Delhi Public School',
            age: '14',
            occupation: 'Business',
            city: 'New Delhi',
            country: 'India',
            registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            notes: 'Interested in career counseling'
          },
          {
            id: 'user_1234567891',
            name: 'Priya Singh',
            email: 'priya.singh@example.com',
            phone: '+91 87654 32109',
            studentName: 'Priya Singh',
            parentName: 'Mrs. Sunita Singh',
            schoolName: "St. Mary's High School",
            age: '16',
            occupation: 'Teacher',
            city: 'Mumbai',
            country: 'India',
            registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            notes: 'Looking for science stream guidance'
          },
          {
            id: 'user_1234567892',
            name: 'Rahul Kumar',
            email: 'rahul.kumar@example.com',
            phone: '+91 76543 21098',
            studentName: 'Rahul Kumar',
            parentName: 'Mr. Suresh Kumar',
            schoolName: 'Kendriya Vidyalaya',
            age: '15',
            occupation: 'Engineer',
            city: 'Bangalore',
            country: 'India',
            registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
            lastLogin: null, // Never logged in after registration
            notes: 'Needs DMIT assessment'
          },
          {
            id: 'user_1234567893',
            name: 'Sneha Patel',
            email: 'sneha.patel@example.com',
            phone: '+91 65432 10987',
            studentName: 'Sneha Patel',
            parentName: 'Mr. Kiran Patel',
            schoolName: 'Ahmedabad International School',
            age: '17',
            occupation: 'Doctor',
            city: 'Ahmedabad',
            country: 'India',
            registrationDate: new Date().toISOString(), // Just now
            lastLogin: new Date().toISOString(), // Just logged in
            notes: 'Interested in medical career path'
          }
        ];

        const stats = {
          totalRegistered: mockUsers.length,
          activeUsers: mockUsers.filter(u => u.lastLogin && 
            new Date().getTime() - new Date(u.lastLogin).getTime() < 24 * 60 * 60 * 1000).length,
          newRegistrationsToday: mockUsers.filter(u => 
            new Date().getTime() - new Date(u.registrationDate).getTime() < 24 * 60 * 60 * 1000).length,
          averageAge: Math.round(mockUsers.reduce((sum, u) => sum + parseInt(u.age || '0'), 0) / mockUsers.length),
          topCities: [
            { city: 'New Delhi', count: 1 },
            { city: 'Mumbai', count: 1 },
            { city: 'Bangalore', count: 1 },
            { city: 'Ahmedabad', count: 1 }
          ]
        };

        return res.status(200).json({
          success: true,
          users: mockUsers,
          stats: stats
        });
      }

      return res.status(405).json({ success: false, message: 'Method not allowed' });
    });
  } catch (error) {
    console.error('Registered users retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default createServerlessHandler(registeredUsersHandler);
