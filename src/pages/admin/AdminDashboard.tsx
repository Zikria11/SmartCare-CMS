import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { 
  Users,
  Calendar,
  FileText,
  FlaskConical,
  DollarSign,
  UserPlus,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalAppointments: number;
  totalMedicalHistories: number;
  totalLabReports: number;
  totalBillings: number;
  patientCount: number;
  doctorCount: number;
  receptionistCount: number;
  labTechnicianCount: number;
  adminCount: number;
  upcomingAppointments: number;
  todayAppointments: number;
  pendingLabReports: number;
  completedLabReports: number;
  pendingBillings: number;
  paidBillings: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getDashboardStats();
        setStats(response);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of the entire system
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              iconClassName="bg-primary/10 text-primary"
            />
            <StatsCard
              title="Total Appointments"
              value={stats.totalAppointments}
              icon={Calendar}
              iconClassName="bg-accent/10 text-accent"
            />
            <StatsCard
              title="Total Records"
              value={stats.totalMedicalHistories}
              icon={FileText}
              iconClassName="bg-success/10 text-success"
            />
            <StatsCard
              title="Lab Reports"
              value={stats.totalLabReports}
              icon={FlaskConical}
              iconClassName="bg-warning/10 text-warning"
            />
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Failed to load dashboard stats</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* User Role Distribution */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-500">{stats.patientCount}</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-500">{stats.doctorCount}</div>
                <div className="text-sm text-muted-foreground">Doctors</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-500">{stats.receptionistCount}</div>
                <div className="text-sm text-muted-foreground">Receptionists</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-500">{stats.labTechnicianCount}</div>
                <div className="text-sm text-muted-foreground">Lab Techs</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-red-500">{stats.adminCount}</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">New doctor registration</p>
                  <p className="text-sm text-muted-foreground">Dr. John Smith registered and is pending approval</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Appointment completed</p>
                  <p className="text-sm text-muted-foreground">Appointment with Jane Doe completed successfully</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Lab report submitted</p>
                  <p className="text-sm text-muted-foreground">Blood test results for Michael Brown submitted</p>
                </div>
                <Badge variant="outline">In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;