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
  Calendar,
  Stethoscope,
  Pill,
  AlertTriangle,
  Plus,
  Eye,
  Download,
  Share2
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

const PatientHistory = () => {
  const { profile } = useAuth();
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile?.id) return;

      try {
        const response = await apiService.getMedicalHistories();
        setHistory(response);
      } catch (error) {
        console.error('Error fetching medical history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [profile?.id]);

  const getHistorySummary = (record: MedicalHistory) => {
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
            <h1 className="text-3xl font-bold text-foreground">Medical History</h1>
            <p className="text-muted-foreground">Your complete medical history records</p>
          </div>
          <Button asChild>
            <Link to="/PatientDashboard/history/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {history.length > 0 ? (
              history.map((record) => (
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

                        <p className="text-foreground mb-3">
                          {getHistorySummary(record)}
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
                                <Calendar className="w-4 h-4" />
                                <span>Next Appointment</span>
                              </div>
                              <p className="text-foreground">
                                {format(new Date(record.nextAppointmentDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          )}

                          {record.doctorName && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Stethoscope className="w-4 h-4" />
                                <span>Doctor</span>
                              </div>
                              <p className="text-foreground">{record.doctorName}</p>
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
                          <Link to={`/PatientDashboard/history/${record.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          // Create a text file with the medical history data
                          const content = `Medical Record: ${record.title}\n\n` +
                            `Patient: ${record.patientName}\n` +
                            `Doctor: ${record.doctorName || 'N/A'}\n` +
                            `Visit Date: ${format(new Date(record.visitDate), 'MMM d, yyyy')}\n\n` +
                            `Description: ${record.description}\n\n` +
                            (record.diagnosis ? `Diagnosis: ${record.diagnosis}\n\n` : '') +
                            (record.treatment ? `Treatment: ${record.treatment}\n\n` : '') +
                            (record.medications.length > 0 ? `Medications: ${record.medications.join(', ')}\n\n` : '') +
                            (record.allergies.length > 0 ? `Allergies: ${record.allergies.join(', ')}\n\n` : '') +
                            (record.symptoms.length > 0 ? `Symptoms: ${record.symptoms.join(', ')}\n\n` : '') +
                            `Created: ${format(new Date(record.createdAt), 'MMM d, yyyy')}\n`;
                          
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `medical-record-${record.id}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        }}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Medical Record: ${record.title}`,
                              text: `View your medical record titled: ${record.title}`,
                            }).catch(console.error);
                          } else {
                            // Fallback: copy link to clipboard
                            const url = `${window.location.origin}/PatientDashboard/history/${record.id}`;
                            navigator.clipboard.writeText(url).then(() => {
                              alert('Link copied to clipboard!');
                            }).catch(console.error);
                          }
                        }}>
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
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
                  <h3 className="text-lg font-medium text-foreground mb-2">No medical history found</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any medical history records yet.
                  </p>
                  <Button asChild>
                    <Link to="/PatientDashboard/history/new">Add First Record</Link>
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

export default PatientHistory;