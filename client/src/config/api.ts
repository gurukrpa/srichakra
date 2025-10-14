/**
 * API configuration for different environments
 */

// Determine the base API URL based on environment
const getBaseApiUrl = (): string => {
  // For production on Vercel
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Use relative URL in production to ensure it works on the same domain
    return '';
  }
  
  // For local development
  return 'http://localhost:5000';
};

// Base URL for API requests
export const API_BASE_URL = getBaseApiUrl();

// Helper function to build a full API URL
export const buildApiUrl = (path: string): string => {
  // If path already starts with /api, don't add it again
  const apiPath = path.startsWith('/api') ? path : `/api${path}`;
  
  // If we have a base URL, join them, otherwise just return the path
  return API_BASE_URL ? `${API_BASE_URL}${apiPath}` : apiPath;
};

// Admin API endpoints
export const ADMIN_API = {
  login: '/api/admin/login',
  logout: '/api/admin/logout',
  profile: '/api/admin/profile',
  loginStatus: '/api/admin/login-status',
  onlineUsers: '/api/admin/online-users',
  changePassword: '/api/admin/change-password'
};

// Public API endpoints
export const PUBLIC_API = {
  contact: '/api/contact',
  programs: '/api/programs',
  enrollment: '/api/enrollment'
};
