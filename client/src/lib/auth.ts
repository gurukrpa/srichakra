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
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
