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
  Users,
  Clock,
  ArrowRight,
  Video,
  MapPin,
  CheckCircle2,
  ClipboardList,
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

const DoctorDashboard = () => {
  const { profile } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    monthlyPatients: 0,
    completedToday: 0,
    pendingQueue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch all appointments
        const response = await apiService.getAppointments();
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = response.filter((apt: any) => apt.appointmentDate.split('T')[0] === today);

        // Fetch global dashboard stats
        const statsResponse = await apiService.getDashboardStats();

        setTodayAppointments(todayAppointments);
        setStats({
          todayAppointments: todayAppointments.length,
          monthlyPatients: statsResponse.totalAppointments || 0,
          completedToday: todayAppointments.filter((apt: any) => String(apt.status).toLowerCase() === 'completed').length,
          pendingQueue: todayAppointments.filter((apt: any) => String(apt.status).toLowerCase() === 'confirmed' || String(apt.status).toLowerCase() === 'pending').length,
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

  const handleComplete = async (appointmentId: string) => {
    if (!appointmentId) {
      console.error('Invalid appointment ID');
      return;
    }
    
    try {
      await apiService.completeAppointment(appointmentId);

      setTodayAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'Completed' } : apt
        )
      );
      setStats(prev => ({
        ...prev,
        completedToday: prev.completedToday + 1,
        pendingQueue: prev.pendingQueue - 1,
      }));
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, Dr. {profile?.fullName?.split(' ').pop()}!
          </h1>
          <p className="text-muted-foreground">
            Here's your schedule for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Monthly Patients"
            value={stats.monthlyPatients}
            icon={Users}
            iconClassName="bg-accent/10 text-accent"
          />
          <StatsCard
            title="Completed Today"
            value={stats.completedToday}
            icon={CheckCircle2}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title="In Queue"
            value={stats.pendingQueue}
            icon={Clock}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
            </div>
            <Link to="/DoctorDashboard/queue">
              <Button variant="outline" size="sm">
                View Queue
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
            ) : todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
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
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.startTime.slice(0, 5)} • {appointment.reason}
                    </p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  {appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        if (appointment.id) {
                          handleComplete(appointment.id);
                        } else {
                          console.error('No appointment ID available');
                        }
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
