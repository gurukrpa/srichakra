import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity, 
  Clock, 
  Monitor, 
  RefreshCw, 
  UserCheck, 
  UserX,
  Globe,
  Smartphone
} from 'lucide-react';

interface UserActivity {
  id: number;
  userId: number | null;
  username: string;
  fullName: string;
  sessionType: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  currentPage: string;
  activityStatus: string;
}

interface ActivityStats {
  totalActiveUsers: number;
  totalGuestUsers: number;
  totalRegisteredUsers: number;
  averageSessionTime: string;
  mostActivePages: { page: string; users: number; }[];
}

const UserActivityDashboard = () => {
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/user-activity', {
        headers: {
          'Authorization': `Bearer demo-token-admin`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }

      const data = await response.json();
      setUserActivity(data.userActivity);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivity();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUserActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  if (loading && userActivity.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading user activity...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Activity Dashboard</h1>
        <Button 
          onClick={fetchUserActivity} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{stats.totalActiveUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Guest Users</p>
                  <p className="text-2xl font-bold">{stats.totalGuestUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registered</p>
                  <p className="text-2xl font-bold">{stats.totalRegisteredUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                  <p className="text-2xl font-bold">{stats.averageSessionTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Current Page</th>
                  <th className="text-left p-2">Login Time</th>
                  <th className="text-left p-2">Last Activity</th>
                  <th className="text-left p-2">Device</th>
                  <th className="text-left p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {userActivity.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-gray-500 text-xs">{user.username}</p>
                        {user.sessionType === 'guest' && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Guest
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-600 text-sm">Online</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            <span className="text-gray-500 text-sm">Offline</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{user.activityStatus}</p>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{user.currentPage}</Badge>
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {formatTime(user.loginTime)}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {formatTime(user.lastActivity)}
                    </td>
                    <td className="p-2">
                      {getDeviceIcon(user.userAgent)}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {user.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Most Active Pages */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Most Active Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.mostActivePages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{page.page}</span>
                  <Badge>{page.users} users</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserActivityDashboard;
