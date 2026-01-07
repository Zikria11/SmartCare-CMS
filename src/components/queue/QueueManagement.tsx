import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  Stethoscope, 
  MapPin, 
  Plus, 
  Play, 
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle,
  UserPlus
} from 'lucide-react';

interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  appointmentTime: Date;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  queueNumber: number;
  estimatedWait: number; // in minutes
  priority: 'low' | 'normal' | 'high';
  reason: string;
  checkInTime: Date;
  notes?: string;
}

interface QueueManagementProps {
  doctorId?: string;
  role?: 'receptionist' | 'doctor';
}

const QueueManagement: React.FC<QueueManagementProps> = ({ doctorId, role = 'receptionist' }) => {
  const [queue, setQueue] = useState<QueueEntry[]>([
    {
      id: '1',
      patientId: 'pat1',
      patientName: 'John Smith',
      patientPhone: '+1 (555) 123-4567',
      doctorId: 'doc1',
      doctorName: 'Dr. Sarah Johnson',
      appointmentTime: new Date('2024-12-20T10:00:00'),
      status: 'in-progress',
      queueNumber: 1,
      estimatedWait: 0,
      priority: 'normal',
      reason: 'Regular checkup',
      checkInTime: new Date('2024-12-20T09:45:00')
    },
    {
      id: '2',
      patientId: 'pat2',
      patientName: 'Jane Doe',
      patientPhone: '+1 (555) 987-6543',
      doctorId: 'doc1',
      doctorName: 'Dr. Sarah Johnson',
      appointmentTime: new Date('2024-12-20T10:30:00'),
      status: 'waiting',
      queueNumber: 2,
      estimatedWait: 15,
      priority: 'high',
      reason: 'Urgent consultation',
      checkInTime: new Date('2024-12-20T10:15:00'),
      notes: 'Chest pain'
    },
    {
      id: '3',
      patientId: 'pat3',
      patientName: 'Robert Brown',
      doctorId: 'doc1',
      doctorName: 'Dr. Sarah Johnson',
      appointmentTime: new Date('2024-12-20T11:00:00'),
      status: 'waiting',
      queueNumber: 3,
      estimatedWait: 30,
      priority: 'normal',
      reason: 'Follow-up appointment',
      checkInTime: new Date('2024-12-20T10:20:00')
    },
    {
      id: '4',
      patientId: 'pat4',
      patientName: 'Emily Davis',
      doctorId: 'doc1',
      doctorName: 'Dr. Sarah Johnson',
      appointmentTime: new Date('2024-12-20T11:30:00'),
      status: 'waiting',
      queueNumber: 4,
      estimatedWait: 45,
      priority: 'low',
      reason: 'Prescription refill',
      checkInTime: new Date('2024-12-20T10:30:00')
    }
  ]);
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    reason: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });

  // Filter queue based on role and doctor
  const filteredQueue = doctorId 
    ? queue.filter(entry => entry.doctorId === doctorId)
    : queue;

  const waitingPatients = filteredQueue.filter(entry => entry.status === 'waiting');
  const inProgressPatient = filteredQueue.find(entry => entry.status === 'in-progress');
  const nextPatient = waitingPatients.length > 0 
    ? waitingPatients.reduce((next, patient) => 
        patient.priority === 'high' && next.priority !== 'high' 
          ? patient 
          : next
      ) 
    : null;

  const handleCheckIn = () => {
    if (!newPatient.name || !newPatient.reason) return;

    const newEntry: QueueEntry = {
      id: `entry_${Date.now()}`,
      patientId: `pat_${Date.now()}`,
      patientName: newPatient.name,
      patientPhone: newPatient.phone || undefined,
      doctorId: doctorId || 'doc1',
      doctorName: 'Dr. Sarah Johnson', // Would be fetched based on doctorId
      appointmentTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      status: 'waiting',
      queueNumber: filteredQueue.length + 1,
      estimatedWait: 15, // Default wait time
      priority: newPatient.priority,
      reason: newPatient.reason,
      checkInTime: new Date(),
      notes: newPatient.priority === 'high' ? 'Priority patient' : undefined
    };

    setQueue([...queue, newEntry]);
    setNewPatient({ name: '', phone: '', reason: '', priority: 'normal' });
  };

  const handleStartVisit = (id: string) => {
    setQueue(queue.map(entry => 
      entry.id === id 
        ? { ...entry, status: 'in-progress' } 
        : entry.status === 'in-progress' 
          ? { ...entry, status: 'waiting' } // Reset any other in-progress to waiting
          : entry
    ));
  };

  const handleCompleteVisit = (id: string) => {
    setQueue(queue.map(entry => 
      entry.id === id 
        ? { ...entry, status: 'completed' } 
        : entry
    ));
  };

  const handleCancelPatient = (id: string) => {
    setQueue(queue.filter(entry => entry.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Queue Management
          </CardTitle>
          <CardDescription>
            Real-time patient queue for {doctorId ? `Dr. ${queue.find(q => q.doctorId === doctorId)?.doctorName || 'Doctor'}` : 'the clinic'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">{waitingPatients.length}</div>
              <div className="text-sm text-muted-foreground">Waiting</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">{inProgressPatient ? 1 : 0}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">{nextPatient?.patientName || 'None'}</div>
              <div className="text-sm text-muted-foreground">Next Patient</div>
            </div>
          </div>

          {/* Add New Patient */}
          {role === 'receptionist' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Check In New Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block mb-1 text-sm">Patient Name</label>
                    <input
                      type="text"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                      placeholder="Full name"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Phone (Optional)</label>
                    <input
                      type="text"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Reason for Visit</label>
                    <input
                      type="text"
                      value={newPatient.reason}
                      onChange={(e) => setNewPatient({...newPatient, reason: e.target.value})}
                      placeholder="Brief reason"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Priority</label>
                    <select
                      value={newPatient.priority}
                      onChange={(e) => setNewPatient({...newPatient, priority: e.target.value as any})}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <Button 
                  className="mt-3" 
                  onClick={handleCheckIn}
                  disabled={!newPatient.name || !newPatient.reason}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Check In Patient
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Patient in Progress */}
          {inProgressPatient && (
            <Card className="mb-6 border-blue-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-500" />
                  Currently Serving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{inProgressPatient.patientName}</h3>
                      <Badge className={getPriorityColor(inProgressPatient.priority)}>
                        {inProgressPatient.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Queue #{inProgressPatient.queueNumber} • {inProgressPatient.reason}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Check-in: {formatTime(inProgressPatient.checkInTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleCompleteVisit(inProgressPatient.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Visit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Waiting Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Waiting Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waitingPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No patients in queue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingPatients.map(patient => (
                    <div 
                      key={patient.id} 
                      className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{patient.patientName}</h3>
                          <Badge className={getPriorityColor(patient.priority)}>
                            {patient.priority}
                          </Badge>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Queue #{patient.queueNumber} • {patient.reason}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Wait: ~{patient.estimatedWait} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatTime(patient.appointmentTime)}</span>
                          </div>
                          {patient.patientPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{patient.patientPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleStartVisit(patient.id)}
                          disabled={patient.status === 'in-progress'}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Visit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancelPatient(patient.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueManagement;