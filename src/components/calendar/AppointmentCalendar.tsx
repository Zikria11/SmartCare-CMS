import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin,
  AlertCircle
} from 'lucide-react';

// Set up localizer for moment
const localizer = momentLocalizer(moment);

// Define types
interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  patientName: string;
  doctorName: string;
  location?: string;
  notes?: string;
  type: 'in-person' | 'video' | 'follow-up';
}

interface AppointmentCalendarProps {
  fetchAppointments?: () => Promise<Appointment[]>;
  appointments?: Appointment[];
  onAppointmentSelect?: (appointment: Appointment) => void;
  onAddAppointment?: () => void;
  view?: 'month' | 'week' | 'day';
  showAddButton?: boolean;
}

interface AppointmentCalendarHandle {
  refreshAppointments: () => Promise<void>;
}

const AppointmentCalendar = React.forwardRef<AppointmentCalendarHandle, AppointmentCalendarProps>(({
  fetchAppointments,
  appointments: propAppointments,
  onAppointmentSelect,
  onAddAppointment,
  view = 'week',
  showAddButton = true
}, ref) => {
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>(view);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const refreshAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      
      let appointmentData: Appointment[] = [];
      
      if (propAppointments) {
        // Use provided appointments array
        appointmentData = propAppointments;
      } else if (fetchAppointments) {
        // Use provided function to fetch appointments
        appointmentData = await fetchAppointments();
      } else {
        // For now, we'll initialize with empty array
        appointmentData = [];
      }
      
      setAppointments(appointmentData);
      
      const convertedEvents = appointmentData.map(appointment => ({
        id: appointment.id,
        title: `${appointment.title} - ${appointment.patientName}`,
        start: new Date(appointment.start),
        end: new Date(appointment.end),
        resource: appointment,
        allDay: false
      }));
      setEvents(convertedEvents);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAppointments, propAppointments]);
  
  React.useImperativeHandle(ref, () => ({
    refreshAppointments
  }));

  // Fetch appointments from backend
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        
        let appointmentData: Appointment[] = [];
        
        if (propAppointments) {
          // Use provided appointments array
          appointmentData = propAppointments;
        } else if (fetchAppointments) {
          // Use provided function to fetch appointments
          appointmentData = await fetchAppointments();
        } else {
          // In a real app, this would make an API call to fetch appointments
          // const response = await api.get('/appointments');
          // appointmentData = response.data;
          
          // For now, we'll initialize with empty array
          appointmentData = [];
        }
        
        setAppointments(appointmentData);
        
        const convertedEvents = appointmentData.map(appointment => ({
          id: appointment.id,
          title: `${appointment.title} - ${appointment.patientName}`,
          start: new Date(appointment.start),
          end: new Date(appointment.end),
          resource: appointment,
          allDay: false
        }));
        setEvents(convertedEvents);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, [fetchAppointments, propAppointments]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-destructive';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'follow-up':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const eventStyleGetter = (event: any) => {
    const statusColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor: statusColor.includes('green') ? '#10b981' : 
                        statusColor.includes('destructive') ? '#ef4444' : 
                        statusColor.includes('yellow') ? '#f59e0b' : '#3b82f6',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    };
  };

  const handleSelectEvent = (event: any) => {
    if (onAppointmentSelect) {
      onAppointmentSelect(event.resource);
    }
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: 'month' | 'week' | 'day') => {
    setCurrentView(view);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Appointment Calendar
        </CardTitle>
        {showAddButton && (
          <Button onClick={onAddAppointment}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            eventPropGetter={eventStyleGetter}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            view={currentView}
            selectable
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day']}
            components={{
              event: (props) => (
                <div className="p-1">
                  <div className="font-medium truncate">{props.event.title}</div>
                  <div className="text-xs opacity-75 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {moment(props.event.start).format('h:mm A')}
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {props.event.resource.patientName}
                  </div>
                  <Badge className={`mt-1 text-xs ${getEventTypeColor(props.event.resource.type)}`}>
                    {props.event.resource.type}
                  </Badge>
                </div>
              )
            }}
          />
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive"></div>
            <span className="text-sm">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 text-xs">In-person</Badge>
            <span className="text-sm">Appointment</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800 text-xs">Video</Badge>
            <span className="text-sm">Consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800 text-xs">Follow-up</Badge>
            <span className="text-sm">Visit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AppointmentCalendar.displayName = 'AppointmentCalendar';

export default AppointmentCalendar;