import React, { useState } from 'react';
import { 
  Users, School, Calendar, Settings, BarChart, FileText, 
  LogOut, Menu, X, Home, User
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../../assets/images/logo/sri-yantra.png';

type NavLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive = false, onClick }) => {
  return (
    <a 
      href={to} 
      className={`
        flex items-center text-white py-3 px-4 rounded-lg transition-colors 
        ${isActive ? 'bg-[#005E69] font-medium' : 'hover:bg-[#005E69]/60'}
      `}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </a>
  );
};

type AdminNavProps = {
  currentPath: string;
};

const AdminNav: React.FC<AdminNavProps> = ({ currentPath }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser, logout } = useAdminAuth();

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out...');
    try {
      logout();
      const baseUrl = window.location.origin;
      window.location.replace(`${baseUrl}/admin/login`);
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/admin/login';
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/admin/dashboard') {
      return currentPath === '/admin' || currentPath === '/admin/dashboard';
    }
    return currentPath === path;
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-[#006D77] rounded-md text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar / Nav */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:sticky top-0 left-0 z-30 
          transition-transform duration-300 ease-in-out 
          w-64 bg-[#006D77] h-screen overflow-y-auto
        `}
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center py-8 border-b border-[#05606D]">
          <div className="h-16 w-16 mb-2">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <SrichakraText size="2xl" color="text-white" decorative={true}>
            Srichakra
          </SrichakraText>
          <p className="text-gray-200 text-sm">Admin Portal</p>
        </div>
        
        {/* Close button for mobile */}
        <button 
          className="md:hidden absolute top-4 right-4 text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
        
        {/* Nav links */}
        <nav className="mt-6 px-3 py-2">
          <NavLink 
            to="/admin/dashboard" 
            icon={<Home size={20} />} 
            label="Dashboard" 
            isActive={isActive('/admin/dashboard')}
          />
          <NavLink 
            to="/admin/team-members" 
            icon={<Users size={20} />} 
            label="Team Members" 
            isActive={isActive('/admin/team-members')}
          />
          <NavLink 
            to="/admin/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={isActive('/admin/settings')}
          />
          <NavLink 
            to="#" 
            icon={<LogOut size={20} />} 
            label="Logout" 
            onClick={handleLogout}
          />
        </nav>
        
        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#05606D]">
          <div className="flex items-center">
            <div className="bg-[#005E69] text-white rounded-full h-10 w-10 flex items-center justify-center font-medium">
              {adminUser?.name?.charAt(0) || '?'}
            </div>
            <div className="ml-3">
              <p className="text-white text-sm font-medium truncate max-w-[160px]">
                {adminUser?.name || 'User'}
              </p>
              <p className="text-gray-300 text-xs">
                {adminUser?.role === 'super_admin' ? 'Super Admin' : 
                 adminUser?.role === 'admin' ? 'Administrator' : 
                 adminUser?.role === 'teacher' ? 'Teacher' : 'Staff'}
              </p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNav;
