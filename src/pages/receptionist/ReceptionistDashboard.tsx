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
  Calendar,
  Users,
  FileText,
  DollarSign,
  Clock,
  Search,
  Plus,
  MapPin,
  Video
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
  isOnline: boolean;
  createdAt: string;
}

const ReceptionistDashboard = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      try {
        // Fetch appointments for today
        const today = new Date().toISOString().split('T')[0];
        const response = await apiService.getAppointments();
        const allAppointments = response;
        
        // Filter appointments for today
        const todayAppointments = allAppointments.filter((apt: any) => 
          apt.appointmentDate.split('T')[0] === today
        );
        
        // Calculate stats
        const todayCompleted = todayAppointments.filter((apt: any) => String(apt.status).toLowerCase() === 'completed').length;
        
        setAppointments(todayAppointments);
        setStats({
          totalAppointments: allAppointments.length,
          todayAppointments: todayAppointments.length,
          upcomingAppointments: allAppointments.filter((apt: any) => 
            new Date(apt.appointmentDate) > new Date(today)
          ).length,
          completedToday: todayCompleted,
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {profile?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening today.
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
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Clock}
            iconClassName="bg-accent/10 text-accent"
          />
          <StatsCard
            title="Completed Today"
            value={stats.completedToday}
            icon={Users}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            icon={Calendar}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <Link to="/receptionist/appointments">
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
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with Dr. {appointment.doctorName.split(' ').pop()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {appointment.startTime.slice(0, 5)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.reason}
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
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;