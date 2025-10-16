import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  School,
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentName: string;
  parentName: string;
  schoolName: string;
  age: string;
  occupation: string;
  city: string;
  country: string;
  registrationDate: string;
  lastLogin: string | null;
  notes: string;
}

interface UserStats {
  totalRegistered: number;
  activeUsers: number;
  newRegistrationsToday: number;
  averageAge: number;
  topCities: { city: string; count: number; }[];
}

const RegisteredUsersPage = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<RegisteredUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Try to get from API first
      try {
        const response = await fetch('/api/admin/registered-users', {
          headers: {
            'Authorization': `Bearer demo-token-admin`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setStats(data.stats);
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        setUsers(localUsers);
        
        // Calculate local stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        setStats({
          totalRegistered: localUsers.length,
          activeUsers: localUsers.filter((u: any) => u.lastLogin && 
            new Date(u.lastLogin) > oneDayAgo).length,
          newRegistrationsToday: localUsers.filter((u: any) => 
            new Date(u.registrationDate) > oneDayAgo).length,
          averageAge: Math.round(localUsers.reduce((sum: number, u: any) => 
            sum + parseInt(u.age || '0'), 0) / (localUsers.length || 1)),
          topCities: []
        });
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  const deleteUser = async (userToDelete: RegisteredUser) => {
    try {
      setIsDeleting(true);
      
      // Get current users from localStorage
      const currentUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Filter out the user to delete
      const updatedUsers = currentUsers.filter((user: any) => user.id !== userToDelete.id);
      
      // Update localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Also check if this is the currently logged in user and remove from 'user' storage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id === userToDelete.id) {
        localStorage.removeItem('user');
      }
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalRegistered: stats.totalRegistered - 1,
          activeUsers: userToDelete.lastLogin ? stats.activeUsers - 1 : stats.activeUsers
        });
      }
      
      // Close modals
      setUserToDelete(null);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Student Name', 'Parent Name', 'School', 'Age', 'City', 'Registration Date', 'Last Login'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.phone,
        user.studentName || '',
        user.parentName || '',
        user.schoolName || '',
        user.age || '',
        user.city || '',
        new Date(user.registrationDate).toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registered_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading registered users...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registered Users</h1>
        <div className="flex gap-2">
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchUsers} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalRegistered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active (24h)</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Today</p>
                  <p className="text-2xl font-bold">{stats.newRegistrationsToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <School className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Age</p>
                  <p className="text-2xl font-bold">{stats.averageAge || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, school, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Contact Information</th>
                  <th className="text-left p-3">Student Details</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Registration</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{user.studentName || user.name}</p>
                          <p className="text-gray-500 text-sm">Parent: {user.parentName || 'N/A'}</p>
                          <p className="text-gray-500 text-sm">Age: {user.age || 'N/A'}</p>
                          <div className="flex items-center text-gray-500 text-sm">
                            <School className="h-3 w-3 mr-1" />
                            {user.schoolName || 'Not specified'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {user.city && user.country ? `${user.city}, ${user.country}` : 'Not specified'}
                        </div>
                        {user.occupation && (
                          <p className="text-gray-500 text-sm mt-1">Occupation: {user.occupation}</p>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {formatDate(user.registrationDate)}
                      </td>
                      <td className="p-3">
                        <div>
                          <Badge 
                            variant={user.lastLogin ? "default" : "secondary"}
                            className={user.lastLogin ? "bg-green-100 text-green-800" : ""}
                          >
                            {user.lastLogin ? "Active" : "Registered"}
                          </Badge>
                          {user.lastLogin && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last: {formatDate(user.lastLogin)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserToDelete(user)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>User Details: {selectedUser.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Student Information</h4>
                  <p><strong>Student:</strong> {selectedUser.studentName || selectedUser.name}</p>
                  <p><strong>Parent:</strong> {selectedUser.parentName || 'N/A'}</p>
                  <p><strong>Age:</strong> {selectedUser.age || 'N/A'}</p>
                  <p><strong>School:</strong> {selectedUser.schoolName || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Location & Occupation</h4>
                  <p><strong>City:</strong> {selectedUser.city || 'N/A'}</p>
                  <p><strong>Country:</strong> {selectedUser.country || 'N/A'}</p>
                  <p><strong>Occupation:</strong> {selectedUser.occupation || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Activity</h4>
                  <p><strong>Registered:</strong> {formatDate(selectedUser.registrationDate)}</p>
                  <p><strong>Last Login:</strong> {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                </div>
              </div>
              {selectedUser.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedUser.notes}</p>
                </div>
              )}
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setUserToDelete(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
                <Button onClick={() => setSelectedUser(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded border">
                  <p><strong>Name:</strong> {userToDelete.name}</p>
                  <p><strong>Email:</strong> {userToDelete.email}</p>
                  <p><strong>Phone:</strong> {userToDelete.phone}</p>
                  {userToDelete.studentName && (
                    <p><strong>Student:</strong> {userToDelete.studentName}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  This will permanently delete all user data including registration information, 
                  assessment results, and activity history.
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteUser(userToDelete)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegisteredUsersPage;
