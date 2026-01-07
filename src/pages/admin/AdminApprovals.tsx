import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  approvalStatus: string;
}

const AdminApprovals = () => {
  const { profile } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await apiService.getPendingApprovals();
        setPendingUsers(response);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await apiService.approveUser(userId);
      // Remove the user from the pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await apiService.rejectUser(userId);
      // Remove the user from the pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'bg-blue-500 text-blue-50';
      case 'receptionist': return 'bg-green-500 text-green-50';
      case 'labtechnician': return 'bg-purple-500 text-purple-50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve new registrations</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{user.fullName}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>Username</span>
                            </div>
                            <p className="text-foreground">{user.username}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertCircle className="w-4 h-4" />
                              <span>Role</span>
                            </div>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </div>
                          
                          {user.specialization && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="w-4 h-4" />
                                <span>Specialization</span>
                              </div>
                              <p className="text-foreground">{user.specialization}</p>
                            </div>
                          )}
                          
                          {user.licenseNumber && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="w-4 h-4" />
                                <span>License</span>
                              </div>
                              <p className="text-foreground">{user.licenseNumber}</p>
                            </div>
                          )}
                          
                          {user.phone && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>Phone</span>
                              </div>
                              <p className="text-foreground">{user.phone}</p>
                            </div>
                          )}
                          
                          {user.dateOfBirth && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Date of Birth</span>
                              </div>
                              <p className="text-foreground">{user.dateOfBirth}</p>
                            </div>
                          )}
                          
                          {user.address && (
                            <div className="md:col-span-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>Address</span>
                              </div>
                              <p className="text-foreground">{user.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleApprove(user.id)}
                          className="flex-1"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleReject(user.id)}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground">
                    There are no new registrations waiting for approval.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminApprovals;