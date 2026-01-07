import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import {
  Calendar,
  FileText,
  FlaskConical,
  Clock,
  ArrowRight,
  Video,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes?: string;
  isOnline: boolean;
  zoomMeetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

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

const PatientDashboard = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    medicalRecords: 0,
    labReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch all appointments
        const appointmentsResponse = await apiService.getAppointments();
        const today = new Date().toISOString().split('T')[0];
        const upcomingAppointments = appointmentsResponse.filter((apt: any) => new Date(apt.appointmentDate) >= new Date(today));

        // Fetch all lab reports
        const labReportsResponse = await apiService.getLabReports();

        // Fetch all medical histories
        const medicalHistoriesResponse = await apiService.getMedicalHistories();

        // Fetch global dashboard stats
        const statsResponse = await apiService.getDashboardStats();

        setAppointments(upcomingAppointments.slice(0, 5)); // Limit to 5
        setLabReports(labReportsResponse.slice(0, 5)); // Limit to 5
        setStats({
          totalAppointments: statsResponse.totalAppointments || 0,
          upcomingAppointments: upcomingAppointments.length,
          medicalRecords: medicalHistoriesResponse.length,
          labReports: statsResponse.totalLabReports || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  const getStatusColor = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'confirmed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your health dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon={Calendar}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            icon={Clock}
            iconClassName="bg-accent/10 text-accent"
          />
          <StatsCard
            title="Medical Records"
            value={stats.medicalRecords}
            icon={FileText}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title="Lab Reports"
            value={stats.labReports}
            icon={FlaskConical}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Link to="/PatientDashboard/appointments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {appointment.isOnline ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Dr. {appointment.doctorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.startTime.slice(0, 5)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming appointments</p>
                  <Link to="/PatientDashboard/appointments/book">
                    <Button variant="link" className="mt-2">
                      Book your first appointment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Lab Reports */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Lab Reports</CardTitle>
                <CardDescription>Your test results</CardDescription>
              </div>
              <Link to="/PatientDashboard/lab-reports">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : labReports.length > 0 ? (
                labReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {report.reportTitle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.reportDate), 'MMM d, yyyy')}
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
                  <p>No lab reports yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
