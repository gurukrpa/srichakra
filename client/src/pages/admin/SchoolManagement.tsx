import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  School, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit2,
  Save,
  X,
  Users,
  Key,
  Mail,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SchoolCredential {
  id: string;
  email: string;
  password: string;
  schoolName: string;
  createdAt: string;
  lastLogin?: string;
}

const SchoolManagement = () => {
  const [schools, setSchools] = useState<SchoolCredential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [newSchool, setNewSchool] = useState({
    email: '',
    password: '',
    schoolName: ''
  });

  // Load schools from localStorage
  useEffect(() => {
    const savedSchools = localStorage.getItem('schoolCredentials');
    if (savedSchools) {
      setSchools(JSON.parse(savedSchools));
    }
  }, []);

  // Save schools to localStorage
  const saveSchools = (updatedSchools: SchoolCredential[]) => {
    localStorage.setItem('schoolCredentials', JSON.stringify(updatedSchools));
    setSchools(updatedSchools);
  };

  // Add new school
  const addSchool = () => {
    if (!newSchool.schoolName || !newSchool.email || !newSchool.password) {
      alert('Please fill all fields');
      return;
    }

    const school: SchoolCredential = {
      id: Date.now().toString(),
      email: newSchool.email,
      password: newSchool.password,
      schoolName: newSchool.schoolName,
      createdAt: new Date().toISOString()
    };

    const updatedSchools = [...schools, school];
    saveSchools(updatedSchools);
    
    setNewSchool({ email: '', password: '', schoolName: '' });
    setShowAddForm(false);
  };

  // Delete school
  const deleteSchool = (id: string) => {
    if (confirm('Are you sure you want to delete this school access?')) {
      const updatedSchools = schools.filter(school => school.id !== id);
      saveSchools(updatedSchools);
    }
  };

  // Update school
  const updateSchool = (id: string, updatedData: Partial<SchoolCredential>) => {
    const updatedSchools = schools.map(school => 
      school.id === id ? { ...school, ...updatedData } : school
    );
    saveSchools(updatedSchools);
    setEditingId(null);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy credentials to clipboard
  const copyCredentials = (school: SchoolCredential) => {
    const credentials = `
School Login: ${window.location.origin}/school/login
Email: ${school.email}
Password: ${school.password}
School: ${school.schoolName}
    `.trim();
    
    navigator.clipboard.writeText(credentials);
    alert('School credentials copied to clipboard!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <School className="w-6 h-6" />
            School Access Management
          </h2>
          <p className="text-gray-600">Create and manage school login credentials</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      {/* Add School Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New School</h3>
          <div className="space-y-4">
            <div>
              <Label>School Name *</Label>
              <Input
                value={newSchool.schoolName}
                onChange={(e) => setNewSchool(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="Enter school name"
              />
            </div>
            <div>
              <Label>Login Email *</Label>
              <Input
                type="email"
                value={newSchool.email}
                onChange={(e) => setNewSchool(prev => ({ ...prev, email: e.target.value }))}
                placeholder="school@example.com"
              />
            </div>
            <div>
              <Label>Login Password *</Label>
              <Input
                type="password"
                value={newSchool.password}
                onChange={(e) => setNewSchool(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={addSchool}>
              <Save className="w-4 h-4 mr-2" />
              Create School Access
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Schools List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">School Access List ({schools.length})</h3>
        </div>
        
        {schools.length === 0 ? (
          <div className="text-center py-8">
            <School className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No school access created yet</p>
            <p className="text-sm text-gray-400">Click "Add School" to create the first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    School Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Credentials
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{school.schoolName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-500">{school.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {school.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {showPasswords[school.id] ? school.password : '••••••••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(school.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showPasswords[school.id] ? 
                              <EyeOff className="w-3 h-3" /> : 
                              <Eye className="w-3 h-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCredentials(school)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Copy Credentials
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSchool(school.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How to Share with Schools:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Click "Add School" to create new school access</li>
          <li>2. Fill in school name, login email, and password</li>
          <li>3. Click "Copy Credentials" to get login details</li>
          <li>4. Share the email and password with the school</li>
          <li>5. School can login at: <strong>{window.location.origin}/school/login</strong></li>
        </ol>
      </div>
    </div>
  );
};

export default SchoolManagement;
