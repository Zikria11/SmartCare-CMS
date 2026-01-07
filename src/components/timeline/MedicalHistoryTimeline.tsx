import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  Pill, 
  AlertTriangle, 
  Activity,
  User,
  MapPin,
  Clock
} from 'lucide-react';

interface MedicalEvent {
  id: string;
  date: Date;
  type: 'appointment' | 'prescription' | 'lab-report' | 'diagnosis' | 'procedure' | 'vaccination';
  title: string;
  description: string;
  doctor?: string;
  location?: string;
  status?: string;
  medications?: string[];
  allergies?: string[];
  notes?: string;
}

interface MedicalHistoryTimelineProps {
  patientId?: string;
  events?: MedicalEvent[];
}

const MedicalHistoryTimeline: React.FC<MedicalHistoryTimelineProps> = ({ 
  patientId, 
  events: initialEvents = [] 
}) => {
  const [events, setEvents] = useState<MedicalEvent[]>(initialEvents);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Initialize with sample data
  useEffect(() => {
    if (initialEvents.length === 0 && patientId) {
      // In a real app, this would fetch from the backend
      const sampleEvents: MedicalEvent[] = [
        {
          id: '1',
          date: new Date('2024-12-15'),
          type: 'appointment',
          title: 'Annual Checkup',
          description: 'Routine physical examination with Dr. Smith',
          doctor: 'Dr. Smith',
          location: 'Main Clinic',
          status: 'completed',
          notes: 'Patient in good health, no concerns noted'
        },
        {
          id: '2',
          date: new Date('2024-11-20'),
          type: 'prescription',
          title: 'Blood Pressure Medication',
          description: 'Prescribed Lisinopril 10mg daily',
          doctor: 'Dr. Johnson',
          medications: ['Lisinopril 10mg'],
          notes: 'Monitor blood pressure weekly'
        },
        {
          id: '3',
          date: new Date('2024-10-05'),
          type: 'lab-report',
          title: 'Blood Test Results',
          description: 'Comprehensive metabolic panel',
          doctor: 'Dr. Williams',
          notes: 'Slight elevation in cholesterol levels'
        },
        {
          id: '4',
          date: new Date('2024-09-10'),
          type: 'diagnosis',
          title: 'Hypertension',
          description: 'Diagnosed with high blood pressure',
          doctor: 'Dr. Johnson',
          allergies: ['Penicillin'],
          notes: 'Lifestyle changes recommended'
        },
        {
          id: '5',
          date: new Date('2024-08-22'),
          type: 'vaccination',
          title: 'Flu Shot',
          description: 'Seasonal influenza vaccination',
          doctor: 'Dr. Smith',
          status: 'completed'
        }
      ];
      setEvents(sampleEvents);
    }
  }, [initialEvents, patientId]);

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'prescription':
        return <Pill className="w-5 h-5 text-green-500" />;
      case 'lab-report':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'diagnosis':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'procedure':
        return <Activity className="w-5 h-5 text-orange-500" />;
      case 'vaccination':
        return <Activity className="w-5 h-5 text-teal-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800';
      case 'prescription':
        return 'bg-green-100 text-green-800';
      case 'lab-report':
        return 'bg-purple-100 text-purple-800';
      case 'diagnosis':
        return 'bg-red-100 text-red-800';
      case 'procedure':
        return 'bg-orange-100 text-orange-800';
      case 'vaccination':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSortedEvents = () => {
    return [...filteredEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Medical History Timeline
            </CardTitle>
            <CardDescription>
              Chronological view of your medical events
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Events</option>
              <option value="appointment">Appointments</option>
              <option value="prescription">Prescriptions</option>
              <option value="lab-report">Lab Reports</option>
              <option value="diagnosis">Diagnoses</option>
              <option value="procedure">Procedures</option>
              <option value="vaccination">Vaccinations</option>
            </select>
            
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {getSortedEvents().length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No medical events found</p>
            <p className="text-sm">Try changing your filters or search term</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 -translate-x-1/2 transform"></div>
            
            <div className="space-y-6 pl-10">
              {getSortedEvents().map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-3 w-8 h-8 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center">
                    {getEventTypeIcon(event.type)}
                  </div>
                  
                  <Card className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        
                        {event.doctor && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{event.doctor}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.status && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">{event.status}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.medications && event.medications.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-1">Medications:</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.medications.map((med, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {event.allergies && event.allergies.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-1">Allergies:</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.allergies.map((allergy, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {event.notes && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-1">Notes:</h4>
                          <p className="text-sm">{event.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalHistoryTimeline;