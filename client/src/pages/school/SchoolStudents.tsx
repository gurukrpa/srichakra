import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Eye, 
  Download,
  Calendar,
  School,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SchoolStudent {
  id: string;
  studentName: string;
  parentName: string;
  className: string;
  phone: string;
  schoolId: string;
  createdAt: string;
  registrationStatus: 'pending' | 'registered' | 'completed';
  assessmentStatus: 'not_started' | 'in_progress' | 'completed';
}

const SchoolStudents = () => {
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    parentName: '',
    className: '',
    phone: ''
  });

  useEffect(() => {
    // Check if school is authenticated
    const schoolAuth = localStorage.getItem('schoolAuth');
    if (!schoolAuth) {
      window.location.href = '/school/login';
      return;
    }

    const school = JSON.parse(schoolAuth);
    setSchoolInfo(school);

    // Load school-created students
    const schoolStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
    const myStudents = schoolStudents.filter((s: any) => s.schoolEmail === school.email);
    setStudents(myStudents.filter((s: any) => s.createdBy === 'school'));

    // Load registered students who used this school's email
    const allRegistered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const myRegistered = allRegistered.filter((s: any) => s.schoolEmail === school.email);
    setRegisteredStudents(myRegistered);
  }, []);

  // Save students to localStorage
  const saveStudents = (updatedStudents: SchoolStudent[]) => {
    const allSchoolStudents = JSON.parse(localStorage.getItem('schoolStudents') || '[]');
    const otherStudents = allSchoolStudents.filter((s: any) => s.schoolEmail !== schoolInfo?.email || s.createdBy !== 'school');
    const newAllStudents = [...otherStudents, ...updatedStudents.map(s => ({ ...s, schoolEmail: schoolInfo.email, createdBy: 'school' }))];
    localStorage.setItem('schoolStudents', JSON.stringify(newAllStudents));
    setStudents(updatedStudents);
  };

  // Generate school ID
  const generateSchoolId = (studentName: string) => {
    if (!schoolInfo) return '';
    
    // Get school code from email (abc@school.com -> ABC)
    const schoolCode = schoolInfo.email.split('@')[0].toUpperCase().substring(0, 3);
    
    // Get next number
    const nextNumber = (students.length + 1).toString().padStart(3, '0');
    
    return `${schoolCode}${nextNumber}`;
  };

  // Add new student
  const addStudent = () => {
    if (!newStudent.studentName || !newStudent.parentName || !newStudent.className) {
      alert('Please fill all required fields');
      return;
    }

    const student: SchoolStudent = {
      id: Date.now().toString(),
      studentName: newStudent.studentName,
      parentName: newStudent.parentName,
      className: newStudent.className,
      phone: newStudent.phone,
      schoolId: generateSchoolId(newStudent.studentName),
      createdAt: new Date().toISOString(),
      registrationStatus: 'pending',
      assessmentStatus: 'not_started'
    };

    const updatedStudents = [...students, student];
    saveStudents(updatedStudents);
    
    // Show popup with generated ID
    alert(`Student created successfully!\n\nStudent ID: ${student.schoolId}\n\nPlease share this ID with ${newStudent.studentName} for registration.`);
    
    setNewStudent({ studentName: '', parentName: '', className: '', phone: '' });
    setShowAddForm(false);
  };

  // View student details
  const viewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  // Download student report
  const downloadReport = (student: any) => {
    const report = `
STUDENT REPORT
Generated: ${new Date().toLocaleDateString()}

Student Information:
Name: ${student.studentName || student.name}
Parent: ${student.parentName}
School: ${schoolInfo?.schoolName}
Class: ${student.className || 'N/A'}
Phone: ${student.phone}
School ID: ${student.schoolId}

Registration Status: ${student.registrationStatus || 'Registered'}
Assessment Status: ${student.assessmentStatus || 'Not Started'}
Registration Date: ${new Date(student.registeredAt || student.createdAt).toLocaleDateString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.studentName || student.name}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!schoolInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Students
          </h1>
          <p className="text-gray-600 mt-2">{schoolInfo.schoolName} - Student Management</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registered Students</p>
              <p className="text-2xl font-bold text-gray-900">{registeredStudents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assessments Done</p>
              <p className="text-2xl font-bold text-gray-900">
                {registeredStudents.filter(s => s.assessmentStatus === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <School className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Registration</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.registrationStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Student</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Student Name *</Label>
              <Input
                value={newStudent.studentName}
                onChange={(e) => setNewStudent(prev => ({ ...prev, studentName: e.target.value }))}
                placeholder="e.g. John Doe"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Parent Name *</Label>
              <Input
                value={newStudent.parentName}
                onChange={(e) => setNewStudent(prev => ({ ...prev, parentName: e.target.value }))}
                placeholder="e.g. Jane Doe"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Class/Section *</Label>
              <Input
                value={newStudent.className}
                onChange={(e) => setNewStudent(prev => ({ ...prev, className: e.target.value }))}
                placeholder="e.g. Grade 10-A"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
              <Input
                value={newStudent.phone}
                onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +1234567890"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={addStudent} className="bg-green-600 hover:bg-green-700 text-white">
              Create Student & Generate ID
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false);
                setNewStudent({ studentName: '', parentName: '', className: '', phone: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Students Tabs */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <div className="py-4 px-1 border-b-2 border-blue-500 font-medium text-blue-600 text-sm">
              Created Students ({students.length})
            </div>
            <div className="py-4 px-1 font-medium text-gray-500 text-sm">
              Registered Students ({registeredStudents.length})
            </div>
          </nav>
        </div>

        {/* Created Students Table */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Students Created by School</h4>
          
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students created yet</p>
              <p className="text-sm text-gray-400">Click "Add Student" to create the first one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.parentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.className}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {student.schoolId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.registrationStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : student.registrationStatus === 'registered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.registrationStatus === 'pending' ? 'Pending Registration' : 
                           student.registrationStatus === 'registered' ? 'Registered' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <Button 
                          onClick={() => viewStudent(student)}
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button 
                          onClick={() => downloadReport(student)}
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
            </div>
          )}
        </div>

        {/* Registered Students Section */}
        {registeredStudents.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Students Who Registered</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registeredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.parentName}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {student.schoolId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.assessmentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : student.assessmentStatus === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.assessmentStatus === 'completed' ? 'Completed' : 
                           student.assessmentStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <Button 
                          onClick={() => viewStudent(student)}
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button 
                          onClick={() => downloadReport(student)}
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Download className="w-3 h-3" />
                          Report
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Name:</strong> {selectedStudent.studentName || selectedStudent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Parent:</strong> {selectedStudent.parentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Class:</strong> {selectedStudent.className || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>School ID:</strong> {selectedStudent.schoolId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Email:</strong> {selectedStudent.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm"><strong>Created:</strong> {new Date(selectedStudent.createdAt || selectedStudent.registeredAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  onClick={() => downloadReport(selectedStudent)}
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

export default SchoolStudents;
