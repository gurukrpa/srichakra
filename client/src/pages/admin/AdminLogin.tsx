import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import sriYantraLogo from '../../assets/images/logo/sri-yantra.png';
import SrichakraText from '@/components/custom/SrichakraText';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { isAuthenticated, login } = useAdminAuth();
  
  // Redirect to dashboard or specified redirect location if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || 'dashboard';
      
      console.log(`Already authenticated, preparing redirect to ${redirectTo}...`);
      
      // Use setTimeout to ensure this happens after render and all state updates
      setTimeout(() => {
        const baseUrl = window.location.origin;
        const targetUrl = `${baseUrl}/admin/${redirectTo}`;
        console.log(`Redirecting to: ${targetUrl}`);
        
        // Use the window.location.replace method instead of href for a cleaner navigation
        window.location.replace(targetUrl);
      }, 100);
    }
  }, [isAuthenticated]);
  
  // Check for saved email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Starting login attempt');
    
    // Email validation
    if (!email) {
      setError('Please enter your email');
      return;
    }

    // Password validation
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check login system status first
      console.log('Checking login system status');
      try {
        const statusCheck = await fetch('http://localhost:5000/api/admin/login-status');
        const statusData = await statusCheck.json();
        console.log('Login system status:', statusData);
      } catch (error) {
        console.error('Cannot reach login status endpoint', error);
      }
      
      // Try with the correct API URL format - adjust this to match your backend API structure
      console.log('Making login request to server');
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. API endpoint may be incorrect.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      // Save email to localStorage if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      // Use the login function from context with the token and user data from response
      login(data.token, {
        id: data.user.id,
        email,
        role: data.user.role,
        name: data.user.name
      });
      
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || 'dashboard';
      
      console.log(`Login successful, redirecting to admin/${redirectTo}...`);
      
      // Add a small delay before redirect to ensure localStorage is properly set
      setTimeout(() => {
        // Redirect to admin dashboard - use an absolute URL to ensure proper redirection
        const baseUrl = window.location.origin;
        const redirectUrl = `${baseUrl}/admin/${redirectTo}`;
        
        // Log the redirect URL for debugging
        console.log(`Redirecting to: ${redirectUrl}`);
        
        // Use replace instead of href assignment for cleaner navigation
        // This replaces the current history entry instead of adding a new one
        window.location.replace(redirectUrl);
      }, 800);
      
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err instanceof Error) {
        setError(err.message || 'Invalid email or password. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      
      // Additional error details for debugging
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.error('Network error - server might be down or CORS issues');
        setError('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      // Provide demo login credentials when in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode - adding demo credentials hint');
        setError((prevError) => `${prevError}\n\nTry using: admin@srichakra.com / admin123`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#83C5BE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
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
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@srichakra.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="text-sm cursor-pointer">Remember my email</Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#006D77] hover:bg-[#005964] flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign in to Admin</span>
                </>
              )}
            </Button>
            
            <div className="text-sm text-center space-y-2">
              <a href="/admin/forgot-password" className="text-[#006D77] hover:underline block">
                Forgot password?
              </a>
              <button 
                type="button"
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  localStorage.removeItem('adminEmail');
                  setError('Authentication data cleared. You can try logging in again.');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline block mx-auto mt-2"
              >
                Clear saved authentication data
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-white">
          Not an admin? <a href="/" className="underline">Go to home page</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
