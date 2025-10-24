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
  const checkAuth = async () => {
      try {
        // Try Bearer token from sessionStorage first (fallback if cookie not sent)
        const storedToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('adm_token') : null;
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

        // Strategy: try cookie first, then Bearer fallback if provided
        let authed = false;
        try {
          const resp = await fetch(ADMIN_API.profile, { credentials: 'include' });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.success && data?.user) {
              setAdminUser(data.user);
              setIsAuthenticated(true);
              setToken('cookie');
              authed = true;
            }
          }
        } catch {}

        if (!authed && storedToken) {
          try {
            const resp2 = await fetch(ADMIN_API.profile, {
              headers: { Authorization: `Bearer ${storedToken}` },
              credentials: 'include',
            });
            if (resp2.ok) {
              const data2 = await resp2.json();
              if (data2?.success && data2?.user) {
                setAdminUser(data2.user);
                setIsAuthenticated(true);
                setToken(storedToken);
                authed = true;
              }
            }
          } catch {}
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login
  const login = (_newToken: string, user: AdminUser) => {
    try {
      // Update state
      setToken(_newToken);
      setAdminUser(user);
      setIsAuthenticated(true);
      // Persist token only for this session as a Bearer fallback
      if (typeof window !== 'undefined' && _newToken) {
        window.sessionStorage.setItem('adm_token', _newToken);
      }
      
      console.log('Login successful, authentication state updated', { user });
    } catch (error) {
      console.error('Error during login process:', error);
    }
  };

  // Logout
  const logout = async () => {
    try {
  await fetch(ADMIN_API.logout, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setAdminUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('adm_token');
      }
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
    const didRedirectRef = React.useRef(false);
    
    useEffect(() => {
      // Always require authentication - no bypass
      // If not loading and not authenticated, redirect
      if (!loading && !isAuthenticated && !didRedirectRef.current) {
        didRedirectRef.current = true;
        console.log('User not authenticated, redirecting to login...');
        setRedirecting(true);
        // use replace to avoid back-button loops
        const baseUrl = window.location.origin;
        window.location.replace(`${baseUrl}/admin/login`);
      } else if (!loading && isAuthenticated) {
        // Log when authenticated to help with debugging
        console.log('User is authenticated, rendering protected component');
      }
    }, [loading, isAuthenticated]);
    
    // Show loading when checking auth
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#83C5BE]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }
    // If redirecting, render nothing to avoid flicker
    if (redirecting) return null;
    
    return isAuthenticated ? <Component {...props} /> : null;
  };
  
  return ProtectedRoute;
};
