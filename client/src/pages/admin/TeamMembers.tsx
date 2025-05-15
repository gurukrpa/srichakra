import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Loader2,
  Circle,
  AlertCircle,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Team member interface
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  designation: string;
  department: string;
  isActive: boolean;
  lastLogin: string | null;
  currentlyLoggedIn: boolean;
  createdAt: string;
}

// Form data interface for adding/editing members
interface MemberFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  designation: string;
  department: string;
}

const TeamMembers = () => {
  const { adminUser, token, isSuperAdmin, canManageUsers } = useAdminAuth();
  
  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    designation: '',
    department: '',
  });
  
  // Fetch team members on mount
  useEffect(() => {
    fetchTeamMembers();
    fetchOnlineUsers();
    
    // Poll for online users every minute
    const interval = setInterval(() => {
      fetchOnlineUsers();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/team-members', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data = await response.json();
      setMembers(data.teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch currently online users
  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/online-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch online users');
      }
      
      const data = await response.json();
      setOnlineUsers(data.onlineUsers);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
      designation: '',
      department: '',
    });
    setShowPassword(false);
    setIsEditing(false);
    setCurrentMember(null);
  };
  
  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const openEditDialog = (member: TeamMember) => {
    setIsEditing(true);
    setCurrentMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      confirmPassword: '',
      role: member.role,
      designation: member.designation || '',
      department: member.department || '',
    });
    setDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.name || !formData.email) {
        toast({
          title: "Error",
          description: "Name and email are required",
          variant: "destructive"
        });
        return;
      }
      
      // Password validation for new members
      if (!isEditing && formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }
      
      if (!isEditing && formData.password.length < 8) {
        toast({
          title: "Error",
          description: "Password must be at least 8 characters",
          variant: "destructive"
        });
        return;
      }
      
      // Create or update member
      const url = isEditing 
        ? `http://localhost:5000/api/admin/team-members/${currentMember?.id}` 
        : 'http://localhost:5000/api/admin/team-members';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Prepare data - only include password for new users
      const requestData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        designation: formData.designation,
        department: formData.department,
        ...(isEditing ? {} : { password: formData.password })
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      
      // Success
      toast({
        title: "Success",
        description: isEditing 
          ? "Team member updated successfully" 
          : "Team member added successfully",
      });
      
      // Refresh the list
      fetchTeamMembers();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
    }
  };
  
  // Handle member deletion
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/team-members/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete operation failed');
      }
      
      // Success
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
      
      // Refresh the list
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
    }
  };
  
  // Filter members by search query
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.designation && member.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Check if user is currently online
  const isOnline = (id: number): boolean => {
    return onlineUsers.some(user => user.id === id);
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get human-readable role name
  const getRoleName = (role: string): string => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'teacher': return 'Teacher';
      case 'staff': return 'Staff';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  // Format date 
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Determine if current user can edit a member
  const canEdit = (member: TeamMember): boolean => {
    if (!adminUser || !canManageUsers()) return false;
    
    // Super admin can edit anyone
    if (isSuperAdmin()) return true;
    
    // Regular admin can't edit super admins or other admins
    if (adminUser.role === 'admin' && (member.role === 'super_admin' || member.role === 'admin')) {
      return false;
    }
    
    return true;
  };
  
  // Determine if current user can delete a member
  const canDelete = (member: TeamMember): boolean => {
    if (!adminUser || !canManageUsers()) return false;
    
    // Super admin can delete anyone
    if (isSuperAdmin()) return true;
    
    // Regular admin can't delete super admins or other admins
    if (adminUser.role === 'admin' && (member.role === 'super_admin' || member.role === 'admin')) {
      return false;
    }
    
    return true;
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Team Members</h1>
          <p className="text-gray-600">Manage admin staff, teachers and team members</p>
        </div>
        
        {canManageUsers() && (
          <Button 
            onClick={openAddDialog}
            className="bg-[#006D77] hover:bg-[#005964]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search and filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              className="pl-10 w-full md:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Online users bar */}
        {onlineUsers.length > 0 && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Currently Online</h3>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map(user => (
                <Badge key={user.id} variant="outline" className="flex items-center gap-1.5 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  {user.name} ({getRoleName(user.role)})
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Members table */}
        <div className="overflow-x-auto">
          {error && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center text-red-600 mb-2">
                <AlertCircle className="mr-2" />
                <span>Error loading data</span>
              </div>
              <Button onClick={fetchTeamMembers} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          )}
          
          {loading && !error ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
              <span className="text-gray-500">Loading team members...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchQuery 
                        ? "No members found matching your search." 
                        : "No team members found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-gray-50">
                      <TableCell>
                        {isOnline(member.id) ? (
                          <div className="flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                            <span className="text-xs text-green-600">Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-gray-300 mr-2"></span>
                            <span className="text-xs text-gray-500">Offline</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.name}
                          {!member.isActive && (
                            <Badge variant="outline" className="text-xs bg-gray-100 border-gray-200">Inactive</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {getRoleName(member.role)}
                        </span>
                      </TableCell>
                      <TableCell>{member.designation || '—'}</TableCell>
                      <TableCell>{member.department || '—'}</TableCell>
                      <TableCell>{formatDate(member.lastLogin)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit(member) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(member)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {canDelete(member) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(member.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {/* Add/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit Member: ${currentMember?.name}` : 'Add New Team Member'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the team member information below.' 
                : 'Create a new team member by filling out the information below.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              
              {!isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        required={!isEditing}
                        minLength={8}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required={!isEditing}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    name="role"
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange('role', value)}
                    disabled={!isSuperAdmin() || (isEditing && currentMember?.id === adminUser?.id)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {isSuperAdmin() && <SelectItem value="super_admin">Super Admin</SelectItem>}
                      {isSuperAdmin() && <SelectItem value="admin">Admin</SelectItem>}
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Teacher"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Science Department"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#006D77] hover:bg-[#005964]">
                {isEditing ? 'Update Member' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMembers;
