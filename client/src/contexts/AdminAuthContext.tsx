import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

// Create context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Provider component
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');
        
        if (token && userData) {
          const user = JSON.parse(userData) as AdminUser;
          
          // Verify user has admin role
          if (user.role === 'admin') {
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
  const login = (token: string, user: AdminUser) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminUser(user);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminUser, loading, login, logout }}>
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
    
    useEffect(() => {
      // If not loading and not authenticated, redirect
      if (!loading && !isAuthenticated) {
        window.location.href = '/admin/login';
      }
    }, [loading, isAuthenticated]);
    
    // Show loading or render protected component
    if (loading) {
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
