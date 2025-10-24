import React, { useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminLanding = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    if (loading) return;

    const baseUrl = window.location.origin;
    if (isAuthenticated) {
      // Replace to avoid back/forward loops
      window.location.replace(`${baseUrl}/admin/dashboard`);
    } else {
      window.location.replace(`${baseUrl}/admin/login`);
    }
  }, [loading, isAuthenticated]);

  // Render nothing while redirecting to avoid any flicker
  return null;
};

export default AdminLanding;
