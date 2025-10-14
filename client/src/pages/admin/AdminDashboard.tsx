import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Users, School, Calendar, Settings, BarChart, FileText, 
  LogOut, Menu, X, Home, User, Bell, UserCheck
} from 'lucide-react';
import SrichakraText from '@/components/custom/SrichakraText';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ADMIN_API } from '@/config/api';
import sriYantraLogo from '../../assets/images/logo/sri-yantra.png';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser, logout, token } = useAdminAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Fetch online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        // Skip if no token is available yet
        if (!token) {
          console.log('No token available, skipping online users fetch');
          return;
        }
        
        console.log('Fetching online users...');
        const response = await fetch(ADMIN_API.onlineUsers, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOnlineUsers(data.onlineUsers || []);
          console.log('Online users fetched:', data.onlineUsers?.length || 0);
        } else {
          console.warn('Failed to fetch online users:', response.status);
          // Don't throw an error for non-critical features
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
        // Silently handle the error for this non-critical feature
      }
    };
    
    fetchOnlineUsers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    
    return () => clearInterval(interval);
  }, [token]);
  
  // Handle logout
  const handleLogout = () => {
    console.log('Logging out...');
    try {
      // Execute logout function from context
      logout();
      
      // Redirect with absolute URL to ensure it works correctly
      const baseUrl = window.location.origin;
      console.log('Redirecting to login page...');
      window.location.href = `${baseUrl}/admin/login`;
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect even if logout fails
      window.location.href = '/admin/login';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for larger screens and overlay for mobile */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:relative z-30 
          transition-transform duration-300 ease-in-out 
          w-64 bg-[#006D77] h-full
        `}
      >
        {/* Logo and close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-[#005964]">
          <div className="flex items-center gap-2">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-10 w-10 object-cover rounded-full"
            />
            <SrichakraText size="xl" color="text-[#FFDDD2]" decorative={true} withBorder={false}>
              Srichakra
            </SrichakraText>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Admin info */}
        <div className="p-4 border-b border-[#005964]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#FFDDD2] flex items-center justify-center text-[#006D77] font-bold" aria-label={`${adminUser.name} profile`}>
              {adminUser.name.charAt(0)}
            </div>
            <div>
              <div className="text-white font-medium">{adminUser.name}</div>
              <div className="text-xs text-gray-300">{adminUser.email}</div>
            </div>
          </div>
        </div>
        
        {/* Menu items */}
        <nav className="p-4">
          <div className="space-y-1">
            <Link href="/admin/dashboard">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md bg-[#005964]">
                <Home size={18} />
                <span>Dashboard</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/students">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <Users size={18} />
                <span>Students</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/schools">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <School size={18} />
                <span>Schools</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/appointments">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <Calendar size={18} />
                <span>Appointments</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/reports">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <FileText size={18} />
                <span>Reports</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/analytics">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <BarChart size={18} />
                <span>Analytics</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/team-members">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <Users size={18} />
                <span>Team Members</span>
              </a>
            </Link>
            
            <Link href="/admin/dashboard/settings">
              <a className="flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]">
                <Settings size={18} />
                <span>Settings</span>
              </a>
            </Link>
          </div>
          
          {/* Logout button at bottom */}
          <div className="absolute bottom-4 w-full left-0 px-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-white rounded-md hover:bg-[#005964]"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Online users indicator */}
            <Link href="/admin/dashboard/team-members">
              <a className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">
                <span className="relative">
                  <UserCheck size={18} className="text-green-600" />
                  {onlineUsers.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {onlineUsers.length}
                    </span>
                  )}
                </span>
                <span>Online</span>
              </a>
            </Link>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100" aria-label="User profile">
              <User size={20} />
            </button>
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-bold text-gray-800">1,245</p>
              <div className="mt-1 text-xs text-green-500">↑ 12% from last month</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">New Registrations</h3>
              <p className="text-2xl font-bold text-gray-800">42</p>
              <div className="mt-1 text-xs text-green-500">↑ 8% from last week</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Appointments</h3>
              <p className="text-2xl font-bold text-gray-800">24</p>
              <div className="mt-1 text-xs text-gray-500">Today</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
              <p className="text-2xl font-bold text-gray-800">{onlineUsers.length}</p>
              <div className="mt-1 text-xs text-green-500">Online Now</div>
            </div>
          </div>
          
          {/* Recent Activities and Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Students */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Recent Students</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap">Aditya Sharma</td>
                        <td className="px-4 py-3 whitespace-nowrap">Delhi Public School</td>
                        <td className="px-4 py-3 whitespace-nowrap">14</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap">Priya Singh</td>
                        <td className="px-4 py-3 whitespace-nowrap">St. Mary's High School</td>
                        <td className="px-4 py-3 whitespace-nowrap">16</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap">Rahul Kumar</td>
                        <td className="px-4 py-3 whitespace-nowrap">Kendriya Vidyalaya</td>
                        <td className="px-4 py-3 whitespace-nowrap">15</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap">Sneha Patel</td>
                        <td className="px-4 py-3 whitespace-nowrap">City Montessori School</td>
                        <td className="px-4 py-3 whitespace-nowrap">12</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap">Arjun Reddy</td>
                        <td className="px-4 py-3 whitespace-nowrap">The International School</td>
                        <td className="px-4 py-3 whitespace-nowrap">17</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Assessment Reports</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">DMIT Reports</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[65%]"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Career Counseling</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-[42%]"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overseas Admissions</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-[28%]"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bridging Courses</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-[15%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
