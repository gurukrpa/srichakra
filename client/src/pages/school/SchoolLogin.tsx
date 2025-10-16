import React, { useState } from 'react';
import { Eye, EyeOff, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import sriYantraLogo from '../../assets/images/logo/sri-yantra.png';
import SrichakraText from '@/components/custom/SrichakraText';

// Get school credentials from localStorage (managed by admin)
const getSchoolCredentials = () => {
  const savedSchools = localStorage.getItem('schoolCredentials');
  if (savedSchools) {
    return JSON.parse(savedSchools);
  }
  // Fallback demo credential if no schools created yet
  return [
    {
      email: 'demo@school.com',
      password: 'demo123',
      schoolName: 'Demo School'
    }
  ];
};

const SchoolLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Get current school credentials from admin
    const schoolCredentials = getSchoolCredentials();
    
    // Find school with matching credentials
    const school = schoolCredentials.find(
      (s: any) => s.email === email && s.password === password
    );

    if (school) {
      // Save school session
      localStorage.setItem('schoolAuth', JSON.stringify({
        isAuthenticated: true,
        email: school.email,
        schoolName: school.schoolName,
        loginTime: new Date().toISOString()
      }));
      
      // Redirect to school dashboard
      window.location.href = '/school/dashboard';
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={sriYantraLogo} 
                alt="Sri Yantra Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <SrichakraText className="text-2xl font-bold text-gray-800 mb-2" />
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <School className="w-5 h-5" />
              <span className="font-semibold">School Access Portal</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              View student results and assessments
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <School className="w-4 h-4" />
                  Access School Portal
                </span>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Contact admin for school code and password
            </p>
          </div>

          {/* Demo Credentials for Testing */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">Demo Access:</p>
            <p className="text-xs text-gray-500">Email: demo@school.com</p>
            <p className="text-xs text-gray-500">Password: demo123</p>
            <p className="text-xs text-gray-400 mt-1">Ask admin for your school's login credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolLogin;
