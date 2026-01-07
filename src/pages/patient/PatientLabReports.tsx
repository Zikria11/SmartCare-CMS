import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import {
  FlaskConical,
  Calendar,
  User,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  labTechnicianId?: string;
  labTechnicianName?: string;
  reportTitle: string;
  reportType: string;
  reportDate: string;
  results: any;
  status: string;
  notes?: string;
  fileUrl?: string;
  isShared: boolean;
  sharedWith: string[];
  billingInfo?: {
    amount: number;
    currency: string;
    isPaid: boolean;
    paymentMethod?: string;
    paymentDate?: string;
    invoiceNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const PatientLabReports = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!profile?.id) return;

      try {
        const response = await apiService.getLabReports();
        setReports(response);
      } catch (error) {
        console.error('Error fetching lab reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [profile?.id]);

  const getStatusColor = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'inprogress': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string | number) => {
    const statusString = String(status).toLowerCase();
    switch (statusString) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'inprogress': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lab Reports</h1>
            <p className="text-muted-foreground">Your complete lab test reports</p>
          </div>
          <Button asChild>
            <Link to="/PatientDashboard/lab-reports/request">
              <FileText className="w-4 h-4 mr-2" />
              Request Report
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
            {reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{report.reportTitle}</h3>
                          {report.isShared && (
                            <Badge variant="outline" className="text-xs">
                              Shared
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FlaskConical className="w-4 h-4" />
                            <span>{report.reportType}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(report.reportDate), 'MMM d, yyyy')}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {report.doctorName && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>Doctor</span>
                              </div>
                              <p className="text-foreground">{report.doctorName}</p>
                            </div>
                          )}

                          {report.labTechnicianName && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>Lab Technician</span>
                              </div>
                              <p className="text-foreground">{report.labTechnicianName}</p>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(report.status)}
                              <span className="text-foreground">{report.status}</span>
                            </div>
                          </div>

                          {report.billingInfo && (
                            <div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                <span>Amount</span>
                              </div>
                              <p className="text-foreground">
                                {report.billingInfo.currency} {report.billingInfo.amount}
                                {report.billingInfo.isPaid ? ' (Paid)' : ' (Pending)'}
                              </p>
                            </div>
                          )}
                        </div>

                        {report.notes && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-foreground">{report.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/patient/lab-reports/${report.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                        </Button>

                        {report.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-1" />
                              Download Report
                            </a>
                          </Button>
                        )}

                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Request Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No lab reports found</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any lab reports yet.
                  </p>
                  <Button asChild>
                    <Link to="/PatientDashboard/lab-reports/request">Request First Report</Link>
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

export default PatientLabReports;