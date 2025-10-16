import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isDevBypassEnabled } from '@/config/featureFlags';
import { ADMIN_API } from '@/config/api';

interface AdminUser {
  id?: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'teacher' | 'staff';
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  token: string | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isRegularAdmin: () => boolean;
  canManageUsers: () => boolean;
}

// Create context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Provider component
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        // In development, auto-login with a mock admin user
        if (isDevBypassEnabled()) {
          const devUser: AdminUser = {
            id: 1,
            name: 'Dev Admin',
            email: 'dev-admin@example.com',
            role: 'super_admin'
          };
          setToken('dev-admin-token');
          setAdminUser(devUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        const storedToken = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');
        
        if (storedToken && userData) {
          const user = JSON.parse(userData) as AdminUser;
          
          // Verify user has a valid role
          if (['super_admin', 'admin', 'teacher', 'staff'].includes(user.role)) {
            setToken(storedToken);
            setAdminUser(user);
            setIsAuthenticated(true);
          } else {
            // Clear invalid data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login
  const login = (newToken: string, user: AdminUser) => {
    try {
      // Store authentication data in localStorage
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      // Update state
      setToken(newToken);
      setAdminUser(user);
      setIsAuthenticated(true);
      
      console.log('Login successful, authentication state updated', { user });
    } catch (error) {
      console.error('Error during login process:', error);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call the logout endpoint if we have a token
      if (token) {
        await fetch(ADMIN_API.logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API success
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setToken(null);
      setAdminUser(null);
      setIsAuthenticated(false);
    }
  };
  
  // Helper functions to check user roles and permissions
  const isSuperAdmin = () => {
    return adminUser?.role === 'super_admin';
  };
  
  const isRegularAdmin = () => {
    return adminUser?.role === 'admin';
  };
  
  const canManageUsers = () => {
    return adminUser?.role === 'super_admin' || adminUser?.role === 'admin';
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAuthenticated, 
      adminUser, 
      loading, 
      token,
      login, 
      logout,
      isSuperAdmin,
      isRegularAdmin,
      canManageUsers
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Higher-order component to protect admin routes
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  const ProtectedRoute: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAdminAuth();
    const [redirecting, setRedirecting] = useState(false);
    
    useEffect(() => {
      // Always require authentication - no bypass
      // If not loading and not authenticated, redirect
      if (!loading && !isAuthenticated) {
        console.log('User not authenticated, redirecting to login...');
        setRedirecting(true);
        // Add small delay to prevent immediate redirection that might interfere with auth process
        setTimeout(() => {
          const baseUrl = window.location.origin;
          window.location.href = `${baseUrl}/admin/login`;
          console.log(`Redirecting to login: ${baseUrl}/admin/login`);
        }, 200);
      } else if (!loading && isAuthenticated) {
        // Log when authenticated to help with debugging
        console.log('User is authenticated, rendering protected component');
      }
    }, [loading, isAuthenticated]);
    
    // Show loading or render protected component
    if (loading || redirecting) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#83C5BE]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }
    
    return isAuthenticated ? <Component {...props} /> : null;
  };
  
  return ProtectedRoute;
};
