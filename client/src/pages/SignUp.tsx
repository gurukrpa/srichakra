import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Eye, EyeOff, School, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

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
  const [phone, setPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  
  // School/Public registration states
  const [registrationType, setRegistrationType] = useState<'school' | 'public'>('public');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [availableSchools, setAvailableSchools] = useState<any[]>([]);

  // Load available schools
  useEffect(() => {
    const schools = JSON.parse(localStorage.getItem('schoolCredentials') || '[]');
    setAvailableSchools(schools);
  }, []);

  // Generate school ID when school is selected
  const generateSchoolId = (schoolEmail: string, studentName: string) => {
    const school = availableSchools.find(s => s.email === schoolEmail);
    if (!school) return '';
    
    // Get school code from email (abc@school.com -> ABC)
    const schoolCode = schoolEmail.split('@')[0].toUpperCase().substring(0, 3);
    
    // Get existing students for this school to determine next number
    const existingStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
    const schoolStudents = existingStudents.filter((s: any) => s.schoolEmail === schoolEmail);
    const nextNumber = (schoolStudents.length + 1).toString().padStart(3, '0');
    
    return `${schoolCode}${nextNumber}`;
  };

  // Auto-generate school ID when school email changes
  useEffect(() => {
    if (registrationType === 'school' && schoolEmail && studentName) {
      const generatedId = generateSchoolId(schoolEmail, studentName);
      setSchoolId(generatedId);
    }
  }, [schoolEmail, studentName, registrationType]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!name || !email || !phone || !password || !confirmPassword || !studentName || !parentName) {
      setError('Please fill in all required fields');
      return;
    }
    
    // School registration validation
    if (registrationType === 'school') {
      if (!schoolEmail || !schoolId) {
        setError('Please select a school and ensure student ID is generated');
        return;
      }
      
      // Validate school ID doesn't already exist
      const existingStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
      if (existingStudents.some((s: any) => s.schoolId === schoolId)) {
        setError('Student ID already exists. Please try again.');
        return;
      }
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number');
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
      const userData = {
        id: `user_${Date.now()}`,
        name,
        email, 
        phone,
        password,
        studentName,
        parentName,
        schoolName,
        age,
        occupation,
        city,
        country,
        notes,
        registrationDate: new Date().toISOString(),
        lastLogin: null,
        registrationType,
        schoolEmail: registrationType === 'school' ? schoolEmail : null,
        schoolId: registrationType === 'school' ? schoolId : null,
        assessmentStatus: 'not_started',
        assessmentData: null
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Also save to a list of all registered users for admin dashboard
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      existingUsers.push(userData);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      // If school registration, also store in school-specific storage
      if (registrationType === 'school') {
        const schoolStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
        schoolStudents.push({
          ...userData,
          schoolEmail,
          schoolId,
          createdBy: 'public_signup'
        });
        localStorage.setItem('schoolStudents', JSON.stringify(schoolStudents));
      }
      
      // Show success message with school ID if applicable
      if (registrationType === 'school') {
        alert(`Registration successful! Your School ID is: ${schoolId}\nPlease remember this ID for assessment access.`);
      }
      
      // Successful signup would redirect to login or home
      window.location.href = '/login';
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed social sign-up providers

  return (
    <div className="min-h-screen bg-[#83C5BE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="h-14 w-14 mb-1">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <SrichakraText size="2xl" color="text-[#800000]" decorative={true} withBorder={true}>
            Srichakra
          </SrichakraText>
          <p className="text-gray-600 text-sm mt-1">Create your account</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              {/* Registration Type Selection */}
              <h3 className="font-medium text-gray-700 mb-3 border-b">Registration Type</h3>
              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="registrationType"
                    value="public"
                    checked={registrationType === 'public'}
                    onChange={(e) => setRegistrationType(e.target.value as 'public' | 'school')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Public Registration</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="registrationType"
                    value="school"
                    checked={registrationType === 'school'}
                    onChange={(e) => setRegistrationType(e.target.value as 'public' | 'school')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <School className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">From School</span>
                </label>
              </div>
              
              {/* Account Details Section Title */}
              <h3 className="font-medium text-gray-700 mb-2 border-b">Account Details</h3>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm">Personal Email</Label>
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
            
            {/* School Email Field - Only for school registration */}
            {registrationType === 'school' && (
              <div>
                <Label htmlFor="schoolEmail" className="text-sm">School Email *</Label>
                <select
                  id="schoolEmail"
                  title="Select School Email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your school</option>
                  {availableSchools.map((school) => (
                    <option key={school.id} value={school.email}>
                      {school.schoolName} ({school.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* School ID Field - Auto-generated for school registration */}
            {registrationType === 'school' && schoolId && (
              <div>
                <Label htmlFor="schoolId" className="text-sm">School ID (Auto-generated)</Label>
                <Input
                  id="schoolId"
                  type="text"
                  value={schoolId}
                  readOnly
                  className="h-9 bg-gray-100 font-mono font-semibold text-blue-600"
                  placeholder="Will be generated automatically"
                />
              </div>
            )}
            <div>
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
            <div>
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-9"
              />
            </div>
            
            <div>
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="md:col-span-3 mt-2">
              {/* Student Information Section Title */}
              <h3 className="font-medium text-gray-700 mb-2 border-b">Student Information</h3>
            </div>
            
            <div>
              <Label htmlFor="parentName" className="text-sm">Parent's Name</Label>
              <Input id="parentName" type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} required className="h-9" />
            </div>
            
            <div>
              <Label htmlFor="occupation" className="text-sm">Parent's Occupation</Label>
              <Input id="occupation" type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="h-9" />
            </div>
            
            <div>
              <Label htmlFor="schoolName" className="text-sm">School Name</Label>
              <Input id="schoolName" type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="h-9" />
            </div>
            
            <div>
              <Label htmlFor="age" className="text-sm">Student's Age</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" />
            </div>
            
            <div>
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="h-9" />
            </div>
            
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="h-9" />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="notes" className="text-sm">What are you looking for?</Label>
                  <textarea
                    id="notes"
                    className="w-full border border-gray-300 rounded px-3 py-2 h-9"
                    rows={1}
                    placeholder="Tell us why you're signing up"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex items-center">
              <Checkbox 
                id="terms" 
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                required
              />
              <label
                htmlFor="terms"
                className="text-sm ml-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the <Link href="/terms" className="text-[#006D77] hover:underline">terms and conditions</Link>
              </label>
            </div>
            
            <div>
              <Button 
                type="submit" 
                className="w-full bg-[#006D77] hover:bg-[#005964]"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create account'}
              </Button>
            </div>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#006D77] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;