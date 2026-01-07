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
  FlaskConical,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  Plus,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  labTechnicianId?: string;
  labTechnicianName?: string;
  reportTitle: string;
  reportType: string;
  reportDate: string;
  results: any;
  status: string;
  notes?: string;
  fileUrl?: string;
  isShared: boolean;
  sharedWith: string[];
  billingInfo?: {
    amount: number;
    currency: string;
    isPaid: boolean;
    paymentMethod?: string;
    paymentDate?: string;
    invoiceNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const LabDashboard = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    inProgressReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiService.getLabReports(undefined, profile.id);
        const allReports = response;
        
        // Calculate stats
        const pendingReports = allReports.filter((report: any) => String(report.status).toLowerCase() === 'pending').length;
        const completedReports = allReports.filter((report: any) => String(report.status).toLowerCase() === 'completed').length;
        const inProgressReports = allReports.filter((report: any) => String(report.status).toLowerCase() === 'inprogress').length;
        
        setReports(allReports);
        setStats({
          totalReports: allReports.length,
          pendingReports,
          completedReports,
          inProgressReports,
        });
      } catch (error) {
        console.error('Error fetching lab dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  const getStatusColor = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'inprogress': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Lab Technician Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage lab reports and test results
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Reports"
            value={stats.totalReports}
            icon={FlaskConical}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Pending Reports"
            value={stats.pendingReports}
            icon={Clock}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatsCard
            title="Completed Reports"
            value={stats.completedReports}
            icon={CheckCircle2}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressReports}
            icon={FlaskConical}
            iconClassName="bg-accent/10 text-accent"
          />
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest lab test results
              </p>
            </div>
            <Link to="/lab/reports">
              <Button variant="outline" size="sm">
                View All
                <Plus className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : reports.length > 0 ? (
              reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {report.reportTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {report.patientName} • {report.reportType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(report.reportDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {report.doctorName || 'N/A'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reports available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LabDashboard;