import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  School, 
  Trash2,
  Mail,
  Building,
  Users,
  Eye,
  EyeOff,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface School {
  id: string;
  schoolName: string;
  email: string;
  password: string;
  createdAt: string;
}

interface StudentStats {
  totalStudents: number;
  schoolCreated: number;
  publicRegistered: number;
  assessmentCompleted: number;
  assessmentPending: number;
  assessmentInProgress: number;
}

interface StudentDetail {
  id: string;
  studentName: string;
  parentName?: string;
  className?: string;
  phone?: string;
  email?: string;
  schoolId?: string;
  registrationStatus: 'pending' | 'registered' | 'completed';
  assessmentStatus: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  source: 'school_created' | 'public_registration';
}

const Schools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolStats, setSchoolStats] = useState<{[key: string]: StudentStats}>({});
  const [schoolStudents, setSchoolStudents] = useState<StudentDetail[]>([]);
  const [newSchool, setNewSchool] = useState({
    schoolName: '',
    email: '',
    password: ''
  });

  // Load schools from localStorage and calculate stats
  useEffect(() => {
    const savedSchools = localStorage.getItem('schoolCredentials');
    if (savedSchools) {
      const schoolList = JSON.parse(savedSchools);
      setSchools(schoolList);
      calculateSchoolStats(schoolList);
    }
  }, []);

  // Calculate student statistics for each school
  const calculateSchoolStats = (schoolList: School[]) => {
    const stats: {[key: string]: StudentStats} = {};

    schoolList.forEach(school => {
      // Get school-created students
      const schoolStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
      const schoolCreatedStudents = schoolStudents.filter((s: any) => 
        s.schoolEmail === school.email && s.createdBy === 'school'
      );

      // Get publicly registered students
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const publicStudents = registeredUsers.filter((s: any) => 
        s.schoolEmail === school.email
      );

      const allStudents = [...schoolCreatedStudents, ...publicStudents];

      stats[school.email] = {
        totalStudents: allStudents.length,
        schoolCreated: schoolCreatedStudents.length,
        publicRegistered: publicStudents.length,
        assessmentCompleted: allStudents.filter(s => 
          s.assessmentStatus === 'completed' || s.hasAssessment === true
        ).length,
        assessmentPending: allStudents.filter(s => 
          s.assessmentStatus === 'not_started' || s.hasAssessment === false
        ).length,
        assessmentInProgress: allStudents.filter(s => 
          s.assessmentStatus === 'in_progress'
        ).length
      };
    });

    setSchoolStats(stats);
  };

  // Save schools to localStorage
  const saveSchools = (updatedSchools: School[]) => {
    localStorage.setItem('schoolCredentials', JSON.stringify(updatedSchools));
    setSchools(updatedSchools);
  };

  // Add new school
  const addSchool = () => {
    if (!newSchool.schoolName || !newSchool.email || !newSchool.password) {
      alert('Please fill all fields');
      return;
    }

    const school: School = {
      id: Date.now().toString(),
      schoolName: newSchool.schoolName,
      email: newSchool.email,
      password: newSchool.password,
      createdAt: new Date().toISOString()
    };

    const updatedSchools = [...schools, school];
    saveSchools(updatedSchools);
    
    setNewSchool({ schoolName: '', email: '', password: '' });
    setShowAddForm(false);
    setShowPassword(false);
  };

  // Delete school
  const deleteSchool = (id: string) => {
    if (confirm('Are you sure you want to delete this school?')) {
      const updatedSchools = schools.filter(school => school.id !== id);
      saveSchools(updatedSchools);
    }
  };

  // Show students for a school
  const showStudents = (school: School) => {
    setSelectedSchool(school);
    
    // Get school-created students
    const schoolStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
    const schoolCreatedStudents = schoolStudents
      .filter((s: any) => s.schoolEmail === school.email && s.createdBy === 'school')
      .map((s: any) => ({
        ...s,
        source: 'school_created' as const,
        registrationStatus: s.registrationStatus || 'pending',
        assessmentStatus: s.assessmentStatus || 'not_started'
      }));

    // Get publicly registered students
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const publicStudents = registeredUsers
      .filter((s: any) => s.schoolEmail === school.email)
      .map((s: any) => ({
        id: s.email || Date.now().toString(),
        studentName: s.studentName || s.name || 'Unknown',
        parentName: s.parentName || '',
        email: s.email,
        phone: s.phone,
        registrationStatus: 'registered' as const,
        assessmentStatus: s.hasAssessment ? 'completed' : 'not_started',
        createdAt: s.registeredAt || new Date().toISOString(),
        source: 'public_registration' as const
      }));

    const allStudents = [...schoolCreatedStudents, ...publicStudents];
    setSchoolStudents(allStudents);
    setShowStudentsModal(true);
  };

  // Copy credentials
  const copyCredentials = (school: School) => {
    const credentials = `School Login: ${window.location.origin}/school/login
Email: ${school.email}
Password: ${school.password}
School: ${school.schoolName}`;
    
    navigator.clipboard.writeText(credentials);
    alert('School credentials copied! Share with the school.');
  };

  // Generate PDF for student
  const generateStudentPDF = (student: StudentDetail) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB');
    const formattedTime = currentDate.toLocaleTimeString('en-GB');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Report - ${student.studentName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #006D77; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #006D77; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 5px 0; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #006D77; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { margin-bottom: 8px; }
        .label { font-weight: bold; display: inline-block; width: 140px; }
        .status { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status.completed { background: #d4edda; color: #155724; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.in-progress { background: #d1ecf1; color: #0c5460; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        .school-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SRICHAKRA STUDENT REPORT</h1>
        <p>Comprehensive Student Assessment & Registration Report</p>
        <p>Generated on: ${formattedDate} at ${formattedTime}</p>
    </div>

    <div class="school-info">
        <h2>School Information</h2>
        <div class="info-row"><span class="label">School Name:</span> ${selectedSchool?.schoolName || 'N/A'}</div>
        <div class="info-row"><span class="label">School Email:</span> ${selectedSchool?.email || 'N/A'}</div>
    </div>

    <div class="section">
        <h2>Student Information</h2>
        <div class="info-row"><span class="label">Student Name:</span> ${student.studentName}</div>
        <div class="info-row"><span class="label">Parent Name:</span> ${student.parentName || 'Not provided'}</div>
        <div class="info-row"><span class="label">Class:</span> ${student.className || 'Not specified'}</div>
        <div class="info-row"><span class="label">Student ID:</span> ${student.schoolId || 'Not assigned'}</div>
    </div>

    <div class="section">
        <h2>Contact Details</h2>
        <div class="info-row"><span class="label">Phone Number:</span> ${student.phone || 'Not provided'}</div>
        <div class="info-row"><span class="label">Email Address:</span> ${student.email || 'Not provided'}</div>
    </div>

    <div class="section">
        <h2>Registration Details</h2>
        <div class="info-row"><span class="label">Registration Source:</span> ${student.source === 'school_created' ? 'Created by School' : 'Public Registration'}</div>
        <div class="info-row"><span class="label">Registration Status:</span> 
            <span class="status ${student.registrationStatus === 'completed' ? 'completed' : student.registrationStatus === 'registered' ? 'in-progress' : 'pending'}">
                ${student.registrationStatus === 'completed' ? 'Completed' : 
                  student.registrationStatus === 'registered' ? 'Registered' : 'Pending'}
            </span>
        </div>
        <div class="info-row"><span class="label">Registration Date:</span> ${new Date(student.createdAt).toLocaleDateString('en-GB')}</div>
    </div>

    <div class="section">
        <h2>Assessment Status</h2>
        <div class="info-row"><span class="label">Current Status:</span> 
            <span class="status ${student.assessmentStatus === 'completed' ? 'completed' : student.assessmentStatus === 'in_progress' ? 'in-progress' : 'pending'}">
                ${student.assessmentStatus === 'completed' ? 'Assessment Completed' : 
                  student.assessmentStatus === 'in_progress' ? 'Assessment In Progress' : 
                  'Assessment Not Started'}
            </span>
        </div>
        <div class="info-row"><span class="label">Assessment Type:</span> DMIT (Dermatoglyphics Multiple Intelligence Test)</div>
    </div>

    <div class="footer">
        <p>This report was generated by the Srichakra Admin Dashboard</p>
        <p>For more information, visit: ${window.location.origin}</p>
        <p>© ${new Date().getFullYear()} Srichakra. All rights reserved.</p>
    </div>
</body>
</html>
    `;

    // Create a blob with HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Open in new window for viewing/printing
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.document.title = `Student Report - ${student.studentName}`;
      
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        if (newWindow) {
          newWindow.print();
        }
      }, 1000);
    }
    
    // Also create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.studentName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    // Show confirmation
    alert(`Student report opened in new window and downloaded for ${student.studentName}`);
  };

  // Generate assessment results PDF for completed students
  const generateAssessmentPDF = (student: StudentDetail) => {
    // Get assessment results for this student
    const assessmentResults = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
    const studentResult = assessmentResults.find((r: any) => 
      r.userId === student.email || 
      (r.studentName === student.studentName && student.source === 'school_created')
    );

    if (!studentResult) {
      alert('No assessment results found for this student.');
      return;
    }

    // Use the same PDF generation logic from CareerAssessment
    generateCareerAssessmentPDF(studentResult, student);
  };

  const generateCareerAssessmentPDF = (assessmentResult: any, student: StudentDetail) => {
    const { results, completedAt, answers } = assessmentResult;
    const { finalScores, totalAnswered } = results;
    
    // Generate bar chart data
    const barChartSVG = finalScores.map((score: any, index: number) => {
      const percentage = (score.score / 5) * 100;
      const colors = ['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9', '#7209B7', '#F72585', '#4CC9F0'];
      return `
        <g>
          <rect x="50" y="${index * 40 + 20}" width="${percentage * 3}" height="30" fill="${colors[index % colors.length]}" rx="5"/>
          <text x="60" y="${index * 40 + 40}" fill="white" font-size="14" font-weight="bold">${score.domain}</text>
          <text x="${percentage * 3 + 60}" y="${index * 40 + 40}" fill="#333" font-size="12">${score.score.toFixed(1)}</text>
        </g>
      `;
    }).join('');

    // Brain hemisphere analysis
    const leftBrainDomains = ['Analytical', 'Verbal', 'General'];
    const rightBrainDomains = ['Creative', 'Musical', 'Naturalistic'];
    
    const leftBrainScore = finalScores
      .filter((s: any) => leftBrainDomains.includes(s.domain))
      .reduce((sum: number, s: any) => sum + s.score, 0) / leftBrainDomains.length;
    const rightBrainScore = finalScores
      .filter((s: any) => rightBrainDomains.includes(s.domain))
      .reduce((sum: number, s: any) => sum + s.score, 0) / rightBrainDomains.length;
    
    const dominantHemisphere = leftBrainScore > rightBrainScore ? 'Left' : rightBrainScore > leftBrainScore ? 'Right' : 'Balanced';

    // Career recommendations
    const careerSuggestions = {
      'Analytical': ['Data Scientist', 'Financial Analyst', 'Research Scientist', 'Engineer'],
      'Verbal': ['Writer', 'Journalist', 'Teacher', 'Lawyer', 'Public Relations'],
      'Creative': ['Graphic Designer', 'Artist', 'Architect', 'Marketing Creative'],
      'Technical': ['Software Developer', 'IT Specialist', 'Engineer', 'Technician'],
      'Social': ['Counselor', 'Human Resources', 'Social Worker', 'Sales'],
      'Musical': ['Musician', 'Music Teacher', 'Sound Engineer', 'Music Therapist'],
      'Naturalistic': ['Environmental Scientist', 'Biologist', 'Park Ranger', 'Veterinarian'],
      'General': ['Project Manager', 'Administrator', 'Consultant', 'Coordinator']
    };

    const w = window.open("", "_blank");
    if (!w) return;
    
    w.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Srichakra Career Assessment Report - ${student.studentName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; padding: 0; 
              background: linear-gradient(135deg, #83C5BE 0%, #006D77 100%);
              color: #333;
            }
            .page { 
              min-height: 100vh; 
              padding: 40px; 
              background: white; 
              margin: 20px; 
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #006D77; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .logo { 
              width: 80px; 
              height: 80px; 
              border-radius: 50%; 
              background: linear-gradient(45deg, #006D77, #83C5BE); 
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            h1 { color: #006D77; font-size: 2.5em; margin: 10px 0; }
            h2 { color: #006D77; border-left: 5px solid #83C5BE; padding-left: 15px; }
            .student-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .chart-container { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0;
              text-align: center;
            }
            .career-suggestions {
              background: #e8f5e8;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .brain-analysis {
              background: #fff3e0;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="logo">S</div>
              <h1>SRICHAKRA</h1>
              <h2>Career Assessment Report</h2>
              <p style="color: #666; margin: 10px 0;">
                Comprehensive Career Guidance & Assessment Analysis
              </p>
            </div>

            <div class="student-info">
              <h2>Student Information</h2>
              <p><strong>Name:</strong> ${student.studentName}</p>
              <p><strong>Parent:</strong> ${student.parentName || 'N/A'}</p>
              <p><strong>School:</strong> ${selectedSchool?.schoolName || 'N/A'}</p>
              <p><strong>Assessment Completed:</strong> ${new Date(completedAt).toLocaleDateString()}</p>
              <p><strong>Total Questions Answered:</strong> ${totalAnswered}</p>
            </div>

            <div class="chart-container">
              <h2>Skill Domain Analysis</h2>
              <svg width="500" height="${finalScores.length * 40 + 40}" viewBox="0 0 500 ${finalScores.length * 40 + 40}">
                ${barChartSVG}
              </svg>
            </div>

            <div class="brain-analysis">
              <h2>Brain Hemisphere Analysis</h2>
              <p><strong>Dominant Hemisphere:</strong> ${dominantHemisphere} Brain</p>
              <p><strong>Left Brain Score:</strong> ${leftBrainScore.toFixed(2)} (Analytical, Logical)</p>
              <p><strong>Right Brain Score:</strong> ${rightBrainScore.toFixed(2)} (Creative, Intuitive)</p>
            </div>

            <div class="career-suggestions">
              <h2>Recommended Career Paths</h2>
              ${finalScores.slice(0, 3).map((score: any) => `
                <div style="margin-bottom: 15px;">
                  <h3>${score.domain} (Score: ${score.score.toFixed(1)})</h3>
                  <p>${careerSuggestions[score.domain as keyof typeof careerSuggestions]?.join(', ') || 'Various opportunities available'}</p>
                </div>
              `).join('')}
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
              <p>Generated by Srichakra Career Assessment System</p>
              <p>For more information, visit: ${window.location.origin}</p>
              <p>© ${new Date().getFullYear()} Srichakra. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);

    w.document.close();
    setTimeout(() => {
      w.print();
    }, 1000);

    alert(`Assessment results PDF opened for ${student.studentName}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <School className="w-8 h-8 text-blue-600" />
            Schools
          </h1>
          <p className="text-gray-600 mt-2">Register schools and create login credentials</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      {/* Add School Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Register New School</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">School Name *</Label>
              <Input
                value={newSchool.schoolName}
                onChange={(e) => setNewSchool(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="e.g. ABC High School"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Login Email *</Label>
              <Input
                type="email"
                value={newSchool.email}
                onChange={(e) => setNewSchool(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. school@abc.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Login Password *</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newSchool.password}
                  onChange={(e) => setNewSchool(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={addSchool} className="bg-green-600 hover:bg-green-700 text-white">
              Register School
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false);
                setNewSchool({ schoolName: '', email: '', password: '' });
                setShowPassword(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Schools List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Registered Schools</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {schools.length} Schools
            </span>
          </div>
        </div>
        
        {schools.length === 0 ? (
          <div className="text-center py-12">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No Schools Registered</h4>
            <p className="text-gray-400 mb-4">Click "Add School" to register your first school</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First School
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {schools.map((school) => (
              <div key={school.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <h4 className="text-lg font-semibold text-gray-900">{school.schoolName}</h4>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email: {school.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Password: {'•'.repeat(school.password.length)}</span>
                      </div>
                      <div>
                        Registered: {new Date(school.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Student Statistics */}
                    {schoolStats[school.email] && (
                      <div className="bg-white border rounded-lg p-4 mb-3">
                        <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Student Statistics
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-600">Total</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {schoolStats[school.email].totalStudents}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <School className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-600">Created</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {schoolStats[school.email].schoolCreated}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-purple-600">Registered</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {schoolStats[school.email].publicRegistered}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-600">Completed</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {schoolStats[school.email].assessmentCompleted}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="font-semibold text-orange-600">Pending</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {schoolStats[school.email].assessmentPending}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={() => showStudents(school)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Students
                    </Button>
                    <Button
                      onClick={() => copyCredentials(school)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Copy Login Details
                    </Button>
                    <Button
                      onClick={() => deleteSchool(school.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      {schools.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How to Share School Access:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Click "Copy Login Details" for any school</li>
            <li>2. Share the copied text with the school contact</li>
            <li>3. School uses the email and password to login</li>
            <li>4. School can view students but cannot delete them</li>
          </ol>
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Students - {selectedSchool.schoolName}
                </h2>
                <p className="text-gray-600 mt-1">
                  Total Students: {schoolStudents.length}
                </p>
              </div>
              <Button
                onClick={() => setShowStudentsModal(false)}
                variant="outline"
                size="sm"
              >
                ✕ Close
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {schoolStudents.filter(s => s.source === 'school_created').length}
                </div>
                <div className="text-sm text-blue-600">School Created</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {schoolStudents.filter(s => s.source === 'public_registration').length}
                </div>
                <div className="text-sm text-green-600">Public Registered</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {schoolStudents.filter(s => s.assessmentStatus === 'completed').length}
                </div>
                <div className="text-sm text-green-600">Completed Tests</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {schoolStudents.filter(s => s.assessmentStatus === 'not_started').length}
                </div>
                <div className="text-sm text-orange-600">Pending Tests</div>
              </div>
            </div>

            {/* Students Table */}
            {schoolStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Click on any student name to download their detailed report
                  </p>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Student Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Parent Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Contact
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Source
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Registration
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Assessment
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolStudents.map((student, index) => (
                      <tr key={student.id || index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm">
                          <button
                            onClick={() => generateStudentPDF(student)}
                            className="text-left w-full hover:bg-blue-50 rounded p-1 transition-colors group"
                            title="Click to download student report"
                          >
                            <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-2">
                              {student.studentName}
                              <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {student.className && (
                              <div className="text-xs text-gray-500">Class: {student.className}</div>
                            )}
                            {student.schoolId && (
                              <div className="text-xs text-blue-600">ID: {student.schoolId}</div>
                            )}
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                          {student.parentName || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                          <div>{student.phone || '-'}</div>
                          {student.email && (
                            <div className="text-xs text-gray-500">{student.email}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.source === 'school_created' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {student.source === 'school_created' ? 'School' : 'Public'}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.registrationStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : student.registrationStatus === 'registered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.registrationStatus === 'completed' ? 'Completed' : 
                             student.registrationStatus === 'registered' ? 'Registered' : 'Pending'}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.assessmentStatus === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : student.assessmentStatus === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {student.assessmentStatus === 'completed' ? 'Completed' : 
                               student.assessmentStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                            </span>
                            {student.assessmentStatus === 'completed' && (
                              <button
                                onClick={() => generateAssessmentPDF(student)}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                title="View Assessment Results PDF"
                              >
                                <FileText className="w-3 h-3" />
                                Results PDF
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 text-center">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-500 mb-2">No Students Found</h4>
                <p className="text-gray-400">This school has no students yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools;
