import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Video,
  Plus,
  Phone
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

const PatientAppointments = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.id) return;

      try {
        const response = await apiService.getAppointments(profile?.id, profile?.role);
        setAppointments(response);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [profile?.id]);

  const getStatusColor = (status: string | number) => {
    // Convert status to string and then to lowercase for comparison
    const statusString = String(status).toLowerCase();
    
    switch (statusString) {
      case 'confirmed':
      case '0': // Assuming 0 might map to 'confirmed'
        return 'bg-success text-success-foreground';
      case 'pending':
      case '1': // Assuming 1 might map to 'pending'
        return 'bg-warning text-warning-foreground';
      case 'completed':
      case '2': // Assuming 2 might map to 'completed'
        return 'bg-primary text-primary-foreground';
      case 'cancelled':
      case '3': // Assuming 3 might map to 'cancelled'
        return 'bg-destructive text-destructive-foreground';
      case 'noshow':
      case '4': // Assuming 4 might map to 'noshow'
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground">Manage your scheduled appointments</p>
          </div>
          <Button asChild>
            <Link to="/PatientDashboard/appointments/book">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>Doctor</span>
                          </div>
                          <p className="font-medium text-foreground">{appointment.doctorName}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {appointment.isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            <span>Type</span>
                          </div>
                          <p className="font-medium text-foreground">
                            {appointment.isOnline ? 'Online' : 'In-Person'}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Date & Time</span>
                          </div>
                          <p className="font-medium text-foreground">
                            {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')} • {appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>

                        {appointment.isOnline && appointment.zoomMeetingUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={appointment.zoomMeetingUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="w-4 h-4 mr-1" />
                              Join Meeting
                            </a>
                          </Button>
                        )}

                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="w-4 h-4" />
                        <span>Reason</span>
                      </div>
                      <p className="text-foreground">{appointment.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any scheduled appointments yet.
                  </p>
                  <Button asChild>
                    <Link to="/PatientDashboard/appointments/book">Book First Appointment</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;