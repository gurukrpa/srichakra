import { isDevBypassEnabled } from "../config/featureFlags";

export interface UserSession {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

// Server-backed: fetch user from whoami (cookie-based)
export const getUserSession = (): UserSession | null => {
  // Keep a synchronous dev bypass only
  if (isDevBypassEnabled()) {
    return { id: "dev-user", email: "dev@example.com", name: "Developer" };
  }
  // No synchronous session available without localStorage; callers should use getUserSessionAsync
  return null;
};

export const getUserSessionAsync = async (): Promise<UserSession | null> => {
  try {
    const res = await fetch('/api/user/whoami', { credentials: 'include' });
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
};

export const setUserSession = (_session: UserSession | null) => {
  // No-op: session is managed by server cookie now
};

export const logout = async () => {
  try {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  } catch {}
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
  // Without local state, this is indeterminate synchronously; prefer calling verifySession
  return false;
};

export const verifySession = async (): Promise<boolean> => {
  // In dev bypass, always valid
  if (isDevBypassEnabled()) return true;
  const u = await getUserSessionAsync();
  return !!u;
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
