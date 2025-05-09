import React from 'react';
import { useState } from 'react';
import { Link } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // New state hooks for additional fields
  const [parentName, setParentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Terms agreement validation
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    try {
      setIsLoading(true);
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a signup with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage before redirecting
      localStorage.setItem('user', JSON.stringify({ 
        name,
        password,
        confirmPassword,
        parentName,
        schoolName,
        age,
        occupation,
        city,
        country,
        email,
        notes
      }));
      
      // Successful signup would redirect to login or home
      window.location.href = '/login';
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#83C5BE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="h-12 w-12 mb-1">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <SrichakraText size="2xl" color="text-[#800000]" decorative={true} withBorder={true}>
            Srichakra
          </SrichakraText>
          <p className="text-gray-600 text-xs mt-1">Create your account</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="parentName" className="text-sm">Parent's Name</Label>
                <Input 
                  id="parentName" 
                  type="text" 
                  value={parentName} 
                  onChange={(e) => setParentName(e.target.value)} 
                  required 
                  className="h-9"
                />
              </div>
            </div>
            
            {/* Second column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Min 8 characters</p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="occupation" className="text-sm">Parent's Occupation</Label>
                <Input 
                  id="occupation" 
                  type="text" 
                  value={occupation} 
                  onChange={(e) => setOccupation(e.target.value)} 
                  className="h-9"
                />
              </div>
            </div>
            
            {/* Third column */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="schoolName" className="text-sm">School Name</Label>
                <Input 
                  id="schoolName" 
                  type="text" 
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="age" className="text-sm">Student's Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  className="h-9"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-sm">City</Label>
                  <Input 
                    id="city" 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    className="h-9"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input 
                    id="country" 
                    type="text" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    className="h-9"
                  />
                </div>
              </div>
            </div>
            
            {/* Notes field - spans all columns */}
            <div className="space-y-1 col-span-full">
              <Label htmlFor="notes" className="text-sm">What are you looking for?</Label>
              <textarea
                id="notes"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Tell us why you're signing up (e.g., career guidance, overseas admission...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            {/* Terms and submit button */}
            <div className="col-span-full space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the 
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-[#006D77] hover:underline ml-1">
                        terms and conditions
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-[#800000]">Terms and Conditions – Srichakra Services</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 text-sm">
                        <p className="font-medium mb-4">Welcome to Srichakra – The School to Identify Your Child's Divine Gift!</p>
                        
                        <p className="mb-4">By accessing our platform or signing up for our services, you agree to the following terms and conditions. Please read them carefully.</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">1. Services We Offer</h3>
                        <p className="mb-2">At Srichakra, we are committed to nurturing every child's potential through the following services:</p>
                        
                        <p className="font-medium mt-4 mb-1">DMIT (Dermatoglyphics Multiple Intelligence Test):</p>
                        <p className="mb-4">A scientific study of fingerprints to understand a child's inborn potential, learning styles, and multiple intelligences. It helps parents make informed decisions about their child's education and career direction.</p>
                        
                        <p className="font-medium mt-4 mb-1">Career Counseling:</p>
                        <p className="mb-4">We provide personalized guidance to help students and parents explore academic and career paths that match their natural talents, skills, and interests.</p>
                        
                        <p className="font-medium mt-4 mb-1">Overseas Admissions:</p>
                        <p className="mb-4">Our expert team supports students in selecting the right courses and universities abroad, assists with documentation, application processes, and provides complete visa guidance.</p>
                        
                        <p className="font-medium mt-4 mb-1">Bridging Courses:</p>
                        <p className="mb-4">Short-term preparatory programs that fill academic or skill gaps, helping students transition smoothly into higher education or specific career fields.</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">2. Information Collection and Use</h3>
                        <p className="mb-2">We collect personal information such as student and parent names, contact details, school information, and interests solely for educational guidance purposes.</p>
                        <p className="mb-2">Your data is stored securely and is not shared with any third party without your explicit consent.</p>
                        <p className="mb-4">You have the right to request access, correction, or deletion of your data at any time.</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">3. Eligibility and Responsibility</h3>
                        <p className="mb-2">By signing up, you confirm that:</p>
                        <p className="mb-1">The information provided is accurate and truthful.</p>
                        <p className="mb-1">You are the legal guardian of the student or are authorized to submit the information on their behalf.</p>
                        <p className="mb-4">You agree to receive updates and communication related to our services.</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">4. Communication Policy</h3>
                        <p className="mb-2">By creating an account, you consent to receive:</p>
                        <p className="mb-1">Emails or phone messages about your registration, upcoming events, or personalized recommendations.</p>
                        <p className="mb-4">Occasional promotional updates or feedback surveys (you may opt out anytime).</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">5. Intellectual Property</h3>
                        <p className="mb-4">All content on the Srichakra platform—including logos, graphics, educational material, and service names—is the intellectual property of Srichakra and may not be used or reproduced without permission.</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">6. Changes to These Terms</h3>
                        <p className="mb-4">Srichakra reserves the right to update or modify these terms and conditions as needed. You will be notified of any significant changes via the website or your registered email address.</p>
                        
                        <h3 className="font-semibold text-[#006D77] mt-6 mb-2">7. Contact Us</h3>
                        <p className="mb-1">For any questions about our Terms and Conditions or services, feel free to contact us at:</p>
                        <p className="mb-1">📧 Email: support@srichakra.yoga</p>
                        <p className="mb-4">📞 Phone: +91-98430-30697</p>
                        
                        <p className="mt-6 font-medium">Thank you for choosing Srichakra. We're honored to be part of your child's journey of self-discovery and success!</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="bg-[#006D77] hover:bg-[#005964] w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#006D77] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;