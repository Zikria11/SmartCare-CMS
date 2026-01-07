import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { 
  Clock,
  User,
  Calendar,
  MapPin,
  Video,
  Phone,
  CheckCircle2,
  XCircle,
  Play,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface QueueItem {
  appointmentId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  isOnline: boolean;
}

const DoctorQueue = () => {
  const { profile } = useAuth();
  const [queue, setQueue] = useState<any>(null); // Using any for now
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiService.getDoctorQueue(profile.id);
        setQueue(response);
      } catch (error) {
        console.error('Error fetching queue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [profile?.id]);

  const handleCallNext = async () => {
    if (!profile?.id) return;
    
    try {
      const response = await apiService.callNextPatient(profile.id);
      // Update the queue state with the new data
      if (queue) {
        setQueue({
          ...queue,
          nextPatient: response,
          queueItems: queue.queueItems.filter((item: any) => item.appointmentId !== response.appointmentId),
          totalPatients: queue.totalPatients - 1
        });
      }
    } catch (error) {
      console.error('Error calling next patient:', error);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (!appointmentId) {
      console.error('Invalid appointment ID');
      return;
    }
    
    try {
      await apiService.completeAppointment(appointmentId);
      // Update the queue after completing appointment
      if (queue) {
        setQueue({
          ...queue,
          queueItems: queue.queueItems.filter((item: any) => item.appointmentId !== appointmentId)
        });
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await apiService.cancelAppointment(appointmentId);
      // Update the queue after cancelling appointment
      if (queue) {
        setQueue({
          ...queue,
          queueItems: queue.queueItems.filter((item: any) => item.appointmentId !== appointmentId)
        });
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusColor = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'confirmed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'noshow': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Queue</h1>
            <p className="text-muted-foreground">Manage your patient queue for today</p>
          </div>
          <Button onClick={handleCallNext} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Call Next Patient
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : queue ? (
          <div className="grid gap-6">
            {/* Next Patient Card */}
            {queue.nextPatient && (
              <Card className="border-2 border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Next Patient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {queue.nextPatient.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(queue.nextPatient.appointmentDate), 'MMM d, yyyy')} • {queue.nextPatient.startTime.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(queue.nextPatient.status)}>
                        {queue.nextPatient.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            if (queue.nextPatient?.appointmentId) {
                              handleComplete(queue.nextPatient.appointmentId);
                            } else {
                              console.error('No appointment ID available');
                            }
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (queue.nextPatient?.appointmentId) {
                              handleCancel(queue.nextPatient.appointmentId);
                            } else {
                              console.error('No appointment ID available');
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Queue List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  <Users className="w-5 h-5 inline mr-2" />
                  Queue ({queue.queueItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {queue.queueItems.length > 0 ? (
                  <div className="space-y-4">
                    {queue.queueItems.map((item: any, index: number) => (
                      <div
                        key={item.appointmentId}
                        className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {item.patientName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(item.appointmentDate), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.isOnline ? (
                              <Video className="w-5 h-5 text-blue-500" />
                            ) : (
                              <MapPin className="w-5 h-5 text-green-500" />
                            )}
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No patients in queue</p>
                    <p className="text-sm mt-1">Call the next patient when ready</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No queue data available</h3>
              <p className="text-muted-foreground mb-4">
                There was an issue loading your queue information.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorQueue;