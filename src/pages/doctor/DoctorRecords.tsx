import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import {
  FileText,
  User,
  Calendar,
  Clock,
  Stethoscope,
  Pill,
  AlertTriangle,
  Plus,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

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

const DoctorRecords = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      if (!profile?.id) return;

      try {
        // Fetch all medical histories
        const response = await apiService.getMedicalHistories();
        setRecords(response);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [profile?.id]);

  // Filter records based on search term
  const filteredRecords = records.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRecordSummary = (record: MedicalHistory) => {
    const parts = [];
    if (record.diagnosis) parts.push(record.diagnosis);
    if (record.treatment) parts.push(record.treatment);
    if (record.symptoms.length > 0) parts.push(`${record.symptoms.length} symptoms`);
    return parts.length > 0 ? parts.join(' • ') : 'No details provided';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Records</h1>
            <p className="text-muted-foreground">Manage and view patient medical histories</p>
          </div>
          <Button asChild>
            <Link to="/DoctorDashboard/patients">
              <Plus className="w-4 h-4 mr-2" />
              View Patients
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients or records..."
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
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{record.title}</h3>
                          {record.isShared && (
                            <Badge variant="outline" className="text-xs">
                              Shared
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <User className="w-4 h-4" />
                          <span>Patient: {record.patientName}</span>
                        </div>

                        <p className="text-foreground mb-3">
                          {getRecordSummary(record)}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Visit Date</span>
                            </div>
                            <p className="text-foreground">
                              {format(new Date(record.visitDate), 'MMM d, yyyy')}
                            </p>
                          </div>

                          {record.nextAppointmentDate && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Next Appointment</span>
                              </div>
                              <p className="text-foreground">
                                {format(new Date(record.nextAppointmentDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          )}

                          {record.diagnosis && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Stethoscope className="w-4 h-4" />
                                <span>Diagnosis</span>
                              </div>
                              <p className="text-foreground">{record.diagnosis}</p>
                            </div>
                          )}

                          {record.medications.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Pill className="w-4 h-4" />
                                <span>Medications ({record.medications.length})</span>
                              </div>
                              <p className="text-foreground">{record.medications.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/DoctorDashboard/records/${record.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                          <FileText className="w-4 h-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </div>

                    {record.allergies.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Allergies</span>
                        </div>
                        <p className="text-destructive">{record.allergies.join(', ')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No records found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `No records match your search for "${searchTerm}"`
                      : "You don't have any patient records yet."
                    }
                  </p>
                  <Button asChild>
                    <Link to="/DoctorDashboard/patients">View All Patients</Link>
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

export default DoctorRecords;