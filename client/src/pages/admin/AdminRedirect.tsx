import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// This component handles redirections between admin pages
export default function AdminRedirect() {
  const { isAuthenticated, loading } = useAdminAuth();
  const [message, setMessage] = useState('Checking authentication...');
  
  useEffect(() => {
    if (loading) {
      return; // Wait until auth check is complete
    }
    
    if (isAuthenticated) {
      setMessage('Authentication confirmed. Redirecting to dashboard...');
      
      // Get the intended destination from URL parameters or default to dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get('to') || 'dashboard';
      
      // Add a small delay for better UX
      setTimeout(() => {
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/admin/${destination}`;
      }, 300);
    } else {
      setMessage('Not authenticated. Redirecting to login...');
      
      // Save the current intended destination to redirect back after login
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get('to');
      
      setTimeout(() => {
        const baseUrl = window.location.origin;
        let loginUrl = `${baseUrl}/admin/login`;
        
        // Add destination as a parameter if provided
        if (destination) {
          loginUrl += `?redirect=${destination}`;
        }
        
        window.location.href = loginUrl;
      }, 300);
    }
  }, [loading, isAuthenticated]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#83C5BE]">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-[#006D77] mb-4">Srichakra Admin</h1>
        <p className="text-gray-600 mb-2">{message}</p>
        <div className="animate-pulse flex justify-center mt-4">
          <div className="w-3 h-3 bg-[#006D77] rounded-full mx-1"></div>
          <div className="w-3 h-3 bg-[#006D77] rounded-full mx-1 animation-delay-200"></div>
          <div className="w-3 h-3 bg-[#006D77] rounded-full mx-1 animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
}
