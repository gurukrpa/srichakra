import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import sriYantraLogo from '../../assets/images/logo/sri-yantra.png';
import SrichakraText from '@/components/custom/SrichakraText';

const AdminLanding = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [message, setMessage] = useState('Checking authentication...');
  const [dots, setDots] = useState('');

  // Loading dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) {
      setMessage('Checking authentication');
      return;
    }

    if (isAuthenticated) {
      setMessage('Authenticated! Redirecting to dashboard');
      
      // Small delay for better UX
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
    } else {
      setMessage('Authentication required. Redirecting to login');
      
      // Immediate redirect to login for security
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1000);
    }
  }, [loading, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#83C5BE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 mb-2">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <SrichakraText size="3xl" color="text-[#800000]" decorative={true} withBorder={true}>
            Srichakra
          </SrichakraText>
          <p className="text-gray-600 text-sm mt-1">Admin Portal</p>
        </div>
        
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-2 bg-[#006D77] rounded-full"></div>
          </div>
          
          <p className="text-gray-700 text-lg">
            {message}{dots}
          </p>
          
          <div className="text-sm text-gray-500 mt-4">
            {loading ? 'Verifying credentials...' : 
             isAuthenticated ? 'Access granted' : 'Access denied'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
