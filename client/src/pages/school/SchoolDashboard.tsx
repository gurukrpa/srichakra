import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  School, 
  LogOut, 
  Download,
  Eye,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SrichakraText from '@/components/custom/SrichakraText';

interface RegisteredUser {
  email: string;
  phone: string;
  studentName: string;
  parentName: string;
  school: string;
  location: string;
  registeredAt: string;
  lastActivity: string;
  hasAssessment: boolean;
}

const SchoolDashboard = () => {
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [students, setStudents] = useState<RegisteredUser[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<RegisteredUser | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    // Check if school is authenticated
    const schoolAuth = localStorage.getItem('schoolAuth');
    if (!schoolAuth) {
      window.location.href = '/school/login';
      return;
    }

    const school = JSON.parse(schoolAuth);
    setSchoolInfo(school);

    // Load registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setStudents(registeredUsers);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('schoolAuth');
    window.location.href = '/school/login';
  };

  const downloadStudentReport = (student: RegisteredUser) => {
    // Create a simple CSV report
    const csvContent = `
Student Report for ${student.studentName}
Generated on: ${new Date().toLocaleDateString()}
School: ${schoolInfo?.schoolName || 'N/A'}

Student Information:
Name: ${student.studentName}
Parent: ${student.parentName}
Email: ${student.email}
Phone: ${student.phone}
School: ${student.school}
Location: ${student.location}
Registered: ${new Date(student.registeredAt).toLocaleDateString()}
Last Activity: ${new Date(student.lastActivity).toLocaleDateString()}
Assessment Status: ${student.hasAssessment ? 'Completed' : 'Pending'}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.studentName}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const viewStudentDetails = (student: RegisteredUser) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const viewAssessmentPDF = (student: RegisteredUser) => {
    // Get assessment results for this student
    const assessmentResults = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
    const studentResult = assessmentResults.find((r: any) => r.userId === student.email);

    if (!studentResult) {
      alert('No assessment results found for this student.');
      return;
    }

    // Generate and open assessment PDF
    generateAssessmentPDF(studentResult, student);
  };

  const generateAssessmentPDF = (assessmentResult: any, student: RegisteredUser) => {
    const { results, completedAt } = assessmentResult;
    const { finalScores, totalAnswered } = results;
    
    const w = window.open("", "_blank");
    if (!w) return;
    
    w.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Assessment Results - ${student.studentName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #006D77; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #006D77; margin: 0; font-size: 24px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #006D77; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .score-item { background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
            .student-info { background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SRICHAKRA CAREER ASSESSMENT RESULTS</h1>
            <p>School: ${schoolInfo?.schoolName}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="student-info">
            <h2>Student Information</h2>
            <p><strong>Name:</strong> ${student.studentName}</p>
            <p><strong>Parent:</strong> ${student.parentName}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Assessment Completed:</strong> ${new Date(completedAt).toLocaleDateString()}</p>
            <p><strong>Total Questions:</strong> ${totalAnswered}</p>
          </div>

          <div class="section">
            <h2>Skill Domain Scores</h2>
            ${finalScores.map((score: any) => `
              <div class="score-item">
                <strong>${score.domain}:</strong> ${score.score.toFixed(1)}/5.0
                <div style="background: #ddd; height: 10px; border-radius: 5px; margin-top: 5px;">
                  <div style="background: #006D77; height: 100%; width: ${(score.score/5)*100}%; border-radius: 5px;"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Generated by Srichakra Career Assessment System</p>
            <p>© ${new Date().getFullYear()} Srichakra. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);

    w.document.close();
    setTimeout(() => {
      w.print();
    }, 1000);
  };

  if (!schoolInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <School className="w-8 h-8 text-blue-600" />
              <div>
                <SrichakraText className="text-xl font-bold text-gray-900" />
                <p className="text-sm text-gray-500">{schoolInfo.schoolName} Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => window.location.href = '/school/students'}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Students
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assessments Done</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.hasAssessment).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(s.registeredAt) > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Registered Students</h3>
            <p className="text-sm text-gray-500">View student information and download reports</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                      <div className="text-sm text-gray-500">{student.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.parentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.school}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.hasAssessment 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.hasAssessment ? 'Completed' : 'Pending'}
                        </span>
                        {student.hasAssessment && (
                          <Button
                            onClick={() => viewAssessmentPDF(student)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            View PDF
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        onClick={() => viewStudentDetails(student)}
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button 
                        onClick={() => downloadStudentReport(student)}
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-3 h-3" />
                        Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No students registered yet</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
                <Button 
                  onClick={() => setShowStudentModal(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Name:</strong> {selectedStudent.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Parent:</strong> {selectedStudent.parentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>School:</strong> {selectedStudent.school}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Location:</strong> {selectedStudent.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Email:</strong> {selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Phone:</strong> {selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Registered:</strong> {new Date(selectedStudent.registeredAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Assessment:</strong> {selectedStudent.hasAssessment ? 'Completed' : 'Not done yet'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  onClick={() => downloadStudentReport(selectedStudent)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button 
                  onClick={() => setShowStudentModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDashboard;
