import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/ApiService';
import {
    ArrowLeft,
    User,
    Calendar,
    Clock,
    Stethoscope,
    Pill,
    AlertTriangle,
    FileText,
    Printer,
    History,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
    createdAt: string;
}

const RecordDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<MedicalHistory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            if (!id) return;
            try {
                const response = await apiService.getMedicalHistory(id);
                setRecord(response);
            } catch (error) {
                console.error('Error fetching record:', error);
                toast.error('Failed to load record details');
            } finally {
                setLoading(false);
            }
        };

        fetchRecord();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!record) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">Record not found</h3>
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Records
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Records
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Record
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-secondary/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">{record.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(record.visitDate), 'PPPP')}
                                        </CardDescription>
                                    </div>
                                    {record.isShared && <Badge variant="secondary">Shared Record</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <section className="space-y-3">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Clinical Summary
                                    </h3>
                                    <p className="text-foreground leading-relaxed">
                                        {record.description}
                                    </p>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <section className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <h3 className="font-semibold flex items-center gap-2 text-primary">
                                            <Stethoscope className="w-4 h-4" />
                                            Diagnosis
                                        </h3>
                                        <p className="font-medium text-foreground">
                                            {record.diagnosis || 'No formal diagnosis recorded'}
                                        </p>
                                    </section>

                                    <section className="space-y-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                                        <h3 className="font-semibold flex items-center gap-2 text-accent">
                                            <Activity className="w-4 h-4" />
                                            Treatment Plan
                                        </h3>
                                        <p className="font-medium text-foreground">
                                            {record.treatment || 'No treatment recorded'}
                                        </p>
                                    </section>
                                </div>

                                <section className="space-y-4 pt-4">
                                    <h3 className="font-semibold text-lg">Details</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <History className="w-4 h-4" />
                                                Symptoms Reported
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {record.symptoms.length > 0 ? (
                                                    record.symptoms.map((s, i) => (
                                                        <Badge key={i} variant="secondary">{s}</Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm italic">None reported</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Pill className="w-4 h-4" />
                                                Prescribed Medications
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {record.medications.length > 0 ? (
                                                    record.medications.map((m, i) => (
                                                        <Badge key={i} className="bg-success text-success-foreground">{m}</Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm italic">None prescribed</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Known Allergies
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {record.allergies.length > 0 ? (
                                                    record.allergies.map((a, i) => (
                                                        <Badge key={i} variant="destructive">{a}</Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm italic">None known</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Follow-up</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-warning/10">
                                        <Clock className="w-5 h-5 text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Next Appointment</p>
                                        <p className="text-sm text-muted-foreground">
                                            {record.nextAppointmentDate
                                                ? format(new Date(record.nextAppointmentDate), 'MMM d, yyyy')
                                                : 'Not scheduled'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Patient Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="w-5 h-5 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{record.patientName}</p>
                                        <p className="text-xs text-muted-foreground">ID: {record.patientId}</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Attending Physician</p>
                                    <p className="text-sm font-medium">Dr. {record.doctorName || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {record.vitalSigns && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Vital Signs</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Blood Pressure', value: record.vitalSigns.bloodPressure },
                                        { label: 'Heart Rate', value: record.vitalSigns.heartRate, unit: 'bpm' },
                                        { label: 'Temperature', value: record.vitalSigns.temperature, unit: '°C' },
                                        { label: 'Weight', value: record.vitalSigns.weight, unit: 'kg' },
                                    ].map((vital, i) => (
                                        <div key={i} className="text-center p-3 rounded-lg bg-secondary/30">
                                            <p className="text-[10px] text-muted-foreground uppercase">{vital.label}</p>
                                            <p className="text-sm font-bold">{vital.value || '-'}{vital.unit && vital.value ? ` ${vital.unit}` : ''}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RecordDetails;
