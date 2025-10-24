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
import { buildApiUrl } from '@/config/api';

const SignUp = () => {
  const buildTag = 'signup-paused-2025-10-24';

  // Temporarily pause all sign-ups (Public and School)
  const SIGNUPS_PAUSED = true;
  if (SIGNUPS_PAUSED) {
    return (
      <div className="min-h-screen bg-[#83C5BE] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex flex-col items-center mb-4">
            <div className="h-14 w-14 mb-1">
              <img src={sriYantraLogo} alt="Sri Yantra Symbol" className="h-full w-full object-cover rounded-full" />
            </div>
            <SrichakraText size="2xl" color="text-[#800000]" decorative={true} withBorder={true}>
              Srichakra
            </SrichakraText>
            <p className="text-gray-600 text-sm mt-1">Career Assessment</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrations temporarily paused</h2>
          <p className="text-gray-600 mb-6">
            Sign-ups for Career Assessment are currently paused for both Public and School registrations.
            Please check back soon or contact us if you need assistance.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Need help? <a className="text-blue-600 underline" href="mailto:admin@srichakra.com">admin@srichakra.com</a>
          </div>
        </div>
      </div>
    );
  }
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
  const [studentClass, setStudentClass] = useState('');
  
  // School/Public registration states
  const [registrationType, setRegistrationType] = useState<'school' | 'public'>('public');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [availableSchools, setAvailableSchools] = useState<any[]>([]);

  // Load available schools (disabled: we no longer use local storage)
  useEffect(() => {
    setAvailableSchools([]);

    // Allow URL to force school mode: /signup?type=school or ?school=1
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get('type');
    const urlSchool = params.get('school');
    if (urlType === 'school' || urlSchool === '1') {
      setRegistrationType('school');
    }
  }, []);

  // Generate school ID when school is selected
  const generateSchoolId = (schoolEmail: string, studentName: string) => {
    if (!schoolEmail) return '';
    const schoolCode = schoolEmail.split('@')[0].toUpperCase().substring(0, 3);
    const nextNumber = '001';
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
    
    const effectiveStudentName = studentName || name;
    // Basic validation (keep it minimal to avoid blocking valid submissions)
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    // School registration validation
    if (registrationType === 'school') {
      if (!schoolEmail || !schoolId) {
        setError('Please enter your School Email and Student ID');
        return;
      }
      // TODO: validate school ID uniqueness via server when school endpoints are ready
    }
    
    // Phone validation (optional; only validate if provided)
    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[0-9][0-9\s()-]{6,}$/;
      const normalized = phone.trim();
      if (!phoneRegex.test(normalized)) {
        setError('Please enter a valid phone number');
        return;
      }
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

      // Optionally validate school details and include schoolCode/studentId if valid
      let schoolCodeToSend: string | undefined;
      let includeSchoolLink = false;
      if (registrationType === 'school' && schoolEmail && schoolId) {
        const codeCandidate = schoolEmail.includes('@')
          ? schoolEmail.split('@')[0].toUpperCase()
          : schoolEmail.toUpperCase();
        try {
          const vRes = await fetch(buildApiUrl('/school/validate-student'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schoolCode: codeCandidate,
              studentId: schoolId,
              studentName: effectiveStudentName,
              parentName,
              studentClass,
            }),
          });
          if (vRes.ok) {
            includeSchoolLink = true;
            schoolCodeToSend = codeCandidate;
          } else {
            // Non-blocking: proceed without school link
            includeSchoolLink = false;
          }
        } catch (e) {
          // Validation unreachable; proceed without linking
          includeSchoolLink = false;
        }
      }

      // Combine notes with phone and schoolId for storage if schema lacks columns
      const combinedNotes = [
        notes || '',
        phone ? `Phone: ${phone}` : '',
        effectiveStudentName ? `StudentName: ${effectiveStudentName}` : '',
        parentName ? `Parent: ${parentName}` : '',
        studentClass ? `Class: ${studentClass}` : '',
        registrationType === 'school' && schoolId ? `SchoolID: ${schoolId}` : ''
      ].filter(Boolean).join(' | ');

      const payload: any = {
        name,
        email,
        password,
        studentName: effectiveStudentName,
        parentName,
        schoolName,
        age,
        occupation,
        city,
        country,
        notes: combinedNotes,
        phone,
        studentClass,
      };
      if (includeSchoolLink && schoolCodeToSend && schoolId) {
        payload.schoolCode = schoolCodeToSend;
        payload.studentId = schoolId;
      }

      const response = await fetch(buildApiUrl('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (registrationType === 'school' && schoolId) {
        alert(`Registration successful! Your School ID is: ${schoolId}\nPlease remember this ID for assessment access.`);
      }

      // Redirect to login after success
      window.location.href = '/login';
    } catch (err: any) {
      const msg = (err && (err.message || err.toString())) || 'An error occurred. Please try again later.';
      setError(msg);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed social sign-up providers

  return (
    <div className="min-h-screen bg-[#83C5BE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8">
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
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              {/* Registration Type Selection */}
              <h3 className="font-bold text-xl text-gray-800 mb-6 text-center">Choose Your Registration Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <label className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 ${
                  registrationType === 'public' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}>
                  <input
                    type="radio"
                    name="registrationType"
                    value="public"
                    checked={registrationType === 'public'}
                    onChange={(e) => setRegistrationType(e.target.value as 'public' | 'school')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      registrationType === 'public' ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <User className={`w-8 h-8 ${registrationType === 'public' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <h4 className={`text-lg font-bold mb-2 ${registrationType === 'public' ? 'text-blue-700' : 'text-gray-700'}`}>
                      Public Registration
                    </h4>
                    <p className="text-sm text-gray-600">
                      Individual students and parents can register directly
                    </p>
                    {registrationType === 'public' && (
                      <div className="mt-3 text-blue-600 font-semibold text-sm">✓ Selected</div>
                    )}
                  </div>
                </label>
                
                <label className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 ${
                  registrationType === 'school' 
                    ? 'border-green-500 bg-green-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                }`}>
                  <input
                    type="radio"
                    name="registrationType"
                    value="school"
                    checked={registrationType === 'school'}
                    onChange={(e) => setRegistrationType(e.target.value as 'public' | 'school')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      registrationType === 'school' ? 'bg-green-500' : 'bg-gray-100'
                    }`}>
                      <School className={`w-8 h-8 ${registrationType === 'school' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <h4 className={`text-lg font-bold mb-2 ${registrationType === 'school' ? 'text-green-700' : 'text-gray-700'}`}>
                      From School
                    </h4>
                    <p className="text-sm text-gray-600">
                      Students registering through their school with a Student ID
                    </p>
                    {registrationType === 'school' && (
                      <div className="mt-3 text-green-600 font-semibold text-sm">✓ Selected</div>
                    )}
                  </div>
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
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                className="h-9"
              />
            </div>
            
            {/* School Email Field - Only for school registration */}
            {registrationType === 'school' && (
              <div>
                <Label htmlFor="schoolEmail" className="text-sm">School Email *</Label>
                <Input
                  id="schoolEmail"
                  type="email"
                  placeholder="school@example.com"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="h-9"
                />
              </div>
            )}
            
            {/* School ID Field - Required for school registration */}
            {registrationType === 'school' && (
              <div>
                <Label htmlFor="schoolId" className="text-sm">Student ID (from your School) *</Label>
                <Input
                  id="schoolId"
                  type="text"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  required
                  className="h-9 font-mono"
                  placeholder="Enter the ID your school gave you"
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the Student ID provided by your school</p>
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
                autoComplete="name"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="studentName" className="text-sm">Student Name</Label>
              <Input
                id="studentName"
                type="text"
                placeholder="Student full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                autoComplete="name"
                className="h-9"
              />
              <p className="text-xs text-gray-500 mt-1">If left empty, we'll use the Full Name as Student Name.</p>
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9"
                autoComplete="tel"
                inputMode="tel"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
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
              <Input id="parentName" type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} className="h-9" autoComplete="off" />
            </div>
            
            <div>
              <Label htmlFor="occupation" className="text-sm">Parent's Occupation</Label>
              <Input id="occupation" type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="h-9" autoComplete="organization-title" />
            </div>
            
            <div>
              <Label htmlFor="schoolName" className="text-sm">School Name</Label>
              <Input id="schoolName" type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="h-9" autoComplete="organization" />
            </div>
            
            <div>
              <Label htmlFor="age" className="text-sm">Student's Age</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" inputMode="numeric" autoComplete="bday" />
            </div>
            
            <div>
              <Label htmlFor="studentClass" className="text-sm">Class / Grade</Label>
              <Input id="studentClass" type="text" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="h-9" autoComplete="off" />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="h-9" autoComplete="address-level2" />
            </div>
            
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="h-9" autoComplete="country" />
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
                    autoComplete="off"
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
          <div className="text-[10px] text-gray-400 mt-1">Build: {buildTag}</div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;