import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import {
  User,
  Calendar,
  Stethoscope,
  Pill,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  Video,
  ArrowLeft,
  Search
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

interface MedicalHistory {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications: string[];
  allergies: string[];
  symptoms: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  visitDate: string;
  nextAppointmentDate?: string;
  isShared: boolean;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

interface PatientRecord {
  patientId: string;
  patientName: string;
  lastVisitDate: string;
  appointmentCount: number;
  recentAppointments: Appointment[];
  medicalHistories: MedicalHistory[];
}

const DoctorPatientRecords = () => {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { patientId } = useParams<{ patientId?: string }>();
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  useEffect(() => {
    const fetchPatientRecords = async () => {
      if (!profile?.id) return;

      try {
        // Fetch all appointments for the doctor
        const appointmentsResponse = await apiService.getAppointments();
        const doctorAppointments = appointmentsResponse.filter(
          (apt: Appointment) => apt.doctorId === profile.id
        );

        // Fetch all medical histories for the doctor
        const medicalHistoriesResponse = await apiService.getMedicalHistories();
        const doctorMedicalHistories = medicalHistoriesResponse.filter(
          (record: MedicalHistory) => record.doctorId === profile.id
        );

        // Group appointments and medical histories by patient
        const patientMap: { [key: string]: PatientRecord } = {};

        // Process appointments
        doctorAppointments.forEach((apt: Appointment) => {
          if (!patientMap[apt.patientId]) {
            patientMap[apt.patientId] = {
              patientId: apt.patientId,
              patientName: apt.patientName,
              lastVisitDate: apt.appointmentDate,
              appointmentCount: 0,
              recentAppointments: [],
              medicalHistories: []
            };
          }

          // Update last visit date if this appointment is more recent
          if (new Date(apt.appointmentDate) > new Date(patientMap[apt.patientId].lastVisitDate)) {
            patientMap[apt.patientId].lastVisitDate = apt.appointmentDate;
          }

          patientMap[apt.patientId].appointmentCount += 1;
          patientMap[apt.patientId].recentAppointments.push(apt);
        });

        // Process medical histories
        doctorMedicalHistories.forEach((record: MedicalHistory) => {
          if (patientMap[record.patientId]) {
            patientMap[record.patientId].medicalHistories.push(record);
          }
        });

        // Convert to array and sort by last visit date (most recent first)
        const patientRecords = Object.values(patientMap).sort(
          (a, b) => new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime()
        );

        setPatients(patientRecords);
      } catch (error) {
        console.error('Error fetching patient records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientRecords();
  }, [profile?.id]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patient: PatientRecord) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  if (selectedPatient) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={handleBackToList} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patient List
          </Button>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{selectedPatient.patientName}</h1>
                <p className="text-muted-foreground">Patient medical records and appointment history</p>
              </div>
            </div>

            {/* Patient Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Patient ID</span>
                    </div>
                    <p className="text-foreground font-mono">{selectedPatient.patientId}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Last Visit</span>
                    </div>
                    <p className="text-foreground">
                      {format(new Date(selectedPatient.lastVisitDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Appointments</span>
                    </div>
                    <p className="text-foreground">{selectedPatient.appointmentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient.recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPatient.recentAppointments
                      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                      .map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{appointment.reason}</h3>
                                <Badge className="text-xs">
                                  {appointment.isOnline ? 'Online' : 'In-Person'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')} • {appointment.startTime} - {appointment.endTime}
                              </p>
                              {appointment.notes && (
                                <p className="mt-2 text-foreground">
                                  <span className="font-medium">Notes:</span> {appointment.notes}
                                </p>
                              )}
                            </div>
                            <Badge>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No appointment history available</p>
                )}
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient.medicalHistories.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPatient.medicalHistories
                      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                      .map((record) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{record.title}</h3>
                                {record.isShared && (
                                  <Badge variant="outline" className="text-xs">
                                    Shared
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(record.visitDate), 'MMM d, yyyy')}
                              </p>
                              <p className="mt-2 text-foreground">{record.description}</p>

                              {record.diagnosis && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Stethoscope className="w-4 h-4" />
                                    <span>Diagnosis</span>
                                  </div>
                                  <p className="text-foreground">{record.diagnosis}</p>
                                </div>
                              )}

                              {record.treatment && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Pill className="w-4 h-4" />
                                    <span>Treatment</span>
                                  </div>
                                  <p className="text-foreground">{record.treatment}</p>
                                </div>
                              )}

                              {record.medications.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Pill className="w-4 h-4" />
                                    <span>Medications ({record.medications.length})</span>
                                  </div>
                                  <p className="text-foreground">{record.medications.join(', ')}</p>
                                </div>
                              )}

                              {record.symptoms.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Symptoms ({record.symptoms.length})</span>
                                  </div>
                                  <p className="text-foreground">{record.symptoms.join(', ')}</p>
                                </div>
                              )}

                              {record.allergies.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-sm text-destructive">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Allergies</span>
                                  </div>
                                  <p className="text-destructive">{record.allergies.join(', ')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No medical history available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Records</h1>
            <p className="text-muted-foreground">All patients who have had appointments with you</p>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <Card 
                  key={patient.patientId} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{patient.patientName}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>Patient ID</span>
                            </div>
                            <p className="text-foreground font-mono">{patient.patientId}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Last Visit</span>
                            </div>
                            <p className="text-foreground">
                              {format(new Date(patient.lastVisitDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Appointments</span>
                            </div>
                            <p className="text-foreground">{patient.appointmentCount}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `No patients match your search for "${searchTerm}"`
                      : "You don't have any patient records yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatientRecords;