import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { trackUserActivity } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-login for returning users
  useEffect(() => {
    const checkAutoLogin = () => {
      const rememberLogin = localStorage.getItem('rememberLogin');
      const savedCredentials = localStorage.getItem('userCredentials');
      const existingSession = localStorage.getItem('userSession');
      
      if (rememberLogin === 'true' && savedCredentials && !existingSession) {
        try {
          const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        } catch (error) {
          console.log('Auto-login failed:', error);
        }
      }
      
      // If user already has a session, redirect to assessment
      if (existingSession) {
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        window.location.href = returnUrl || '/career-assessment';
      }
    };
    
    checkAutoLogin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check against stored user data from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}'); 
 
      if (!storedUser.email) { 
        setError('Account not found. Please sign up first.'); 
        setIsLoading(false); 
        return; 
      } 
      
      if (email !== storedUser.email || password !== storedUser.password) { 
        setError(' Don\'t have an account? Sign up below.'); 
        setIsLoading(false); 
        return; 
      }
      
      // Update last login time
      storedUser.lastLogin = new Date().toISOString();
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      // Update in registered users list
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = registeredUsers.findIndex((u: any) => u.email === storedUser.email);
      if (userIndex !== -1) {
        registeredUsers[userIndex] = storedUser;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }
      
      // Successful login - create user session
      const userSession = {
        id: storedUser.id || `user_${Date.now()}`,
        email: storedUser.email,
        name: storedUser.name || storedUser.email.split('@')[0],
        phone: storedUser.phone,
        role: 'user'
      };
      
      // Save session to localStorage (browser will remember)
      localStorage.setItem('userSession', JSON.stringify(userSession));
      
      // If "Remember me" is checked, also save to browser's persistent storage
      if (rememberMe) {
        // This makes the session persist across browser restarts
        localStorage.setItem('rememberLogin', 'true');
        localStorage.setItem('userCredentials', JSON.stringify({ email, password }));
      }
      
      // Track login activity
      if (typeof trackUserActivity === 'function') {
        trackUserActivity('login', userSession);
      }
      
      // Simulate a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to career assessment or previous page
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      window.location.href = returnUrl || '/career-assessment';
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Login error:', err);
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
          <p className="text-gray-600 text-sm mt-1">The School To identify Your Child's Divine Gift!!</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
            {error.includes('Sign up') && (
              <div className="mt-2">
                <Link href="/signup" className="text-[#006D77] underline">
                  Click here to create an account
                </Link>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-[#006D77] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#006D77] hover:bg-[#005964]"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#006D77] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;