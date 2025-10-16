import { isDevBypassEnabled } from "../config/featureFlags";

export interface UserSession {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

const SESSION_KEY = "userSession";

export const getUserSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  if (isDevBypassEnabled()) {
    return { id: "dev-user", email: "dev@example.com", name: "Developer" };
  }
  return null;
};

export const setUserSession = (session: UserSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    // Track logout activity
    trackUserActivity('logout');
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Track login activity
  trackUserActivity('login', session);
};

export const logout = () => {
  // Clear session
  localStorage.removeItem(SESSION_KEY);
  
  // Clear saved credentials if user wants to logout completely
  localStorage.removeItem('rememberLogin');
  localStorage.removeItem('userCredentials');
  
  // Track logout
  trackUserActivity('logout');
  
  // Redirect to login
  window.location.href = '/login';
};

// Track user activity for admin monitoring
export const trackUserActivity = async (action: 'login' | 'logout' | 'activity', session?: UserSession | null) => {
  try {
    const userSession = session || getUserSession();
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user agent and IP info (IP will be handled by server)
    const userAgent = navigator.userAgent;
    
    const activityData = {
      userId: userSession?.id || null,
      sessionToken,
      ipAddress: null, // Will be set by server
      userAgent,
      sessionType: userSession?.id ? 'web' : 'guest',
      action,
      timestamp: new Date().toISOString()
    };

    // Send activity data to admin tracking (non-blocking)
    fetch('/api/admin/user-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData)
    }).catch(error => {
      // Silently fail - don't interrupt user experience
      console.log('Activity tracking failed:', error);
    });
    
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.log('Activity tracking error:', error);
  }
};

export const isAuthenticated = (): boolean => {
  if (isDevBypassEnabled()) return true;
  return !!getUserSession();
};

export const verifySession = async (): Promise<boolean> => {
  // In dev bypass, always valid
  if (isDevBypassEnabled()) return true;
  return Promise.resolve(!!getUserSession());
};

export const initializeAuth = () => {
  // No-op for now
};

// Small helper for development to force set a mock user
export const ensureDevUser = () => {
  if (!isDevBypassEnabled()) return;
  const existing = getUserSession();
  if (!existing) {
    setUserSession({ id: "dev-user", email: "dev@example.com", name: "Developer" });
  }
};
