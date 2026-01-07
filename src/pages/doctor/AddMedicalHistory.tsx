import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Plus, X, Stethoscope, Pill, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Patient {
    id: string;
    fullName: string;
}

const AddMedicalHistory = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialPatientId = queryParams.get('patientId') || '';

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingPatients, setFetchingPatients] = useState(true);

    const [formData, setFormData] = useState({
        patientId: initialPatientId,
        title: '',
        description: '',
        diagnosis: '',
        treatment: '',
        visitDate: new Date(),
        nextAppointmentDate: undefined as Date | undefined,
        medications: [] as string[],
        allergies: [] as string[],
        symptoms: [] as string[],
        currentMedication: '',
        currentAllergy: '',
        currentSymptom: '',
    });

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await apiService.getUsers('Patient', 'Approved');
                setPatients(response);
            } catch (error) {
                console.error('Error fetching patients:', error);
                toast.error('Failed to load patients');
            } finally {
                setFetchingPatients(false);
            }
        };

        fetchPatients();
    }, []);

    const handleAddItem = (field: 'medications' | 'allergies' | 'symptoms', valueKey: 'currentMedication' | 'currentAllergy' | 'currentSymptom') => {
        if (!formData[valueKey]) return;
        setFormData({
            ...formData,
            [field]: [...formData[field], formData[valueKey]],
            [valueKey]: ''
        });
    };

    const removeItem = (field: 'medications' | 'allergies' | 'symptoms', index: number) => {
        const newList = [...formData[field]];
        newList.splice(index, 1);
        setFormData({ ...formData, [field]: newList });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id || !formData.patientId || !formData.title || !formData.description) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const historyData = {
                patientId: formData.patientId,
                doctorId: profile.id,
                title: formData.title,
                description: formData.description,
                diagnosis: formData.diagnosis || undefined,
                treatment: formData.treatment || undefined,
                medications: formData.medications,
                allergies: formData.allergies,
                symptoms: formData.symptoms,
                visitDate: format(formData.visitDate, "yyyy-MM-dd'T'HH:mm:ss"),
                nextAppointmentDate: formData.nextAppointmentDate ? format(formData.nextAppointmentDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
                isShared: true, // Auto-shared if doctor creates it
                sharedWith: [profile.id],
            };

            await apiService.createMedicalHistory(historyData);
            toast.success('Medical record created successfully!');
            navigate('/doctor/records');
        } catch (error) {
            console.error('Error creating medical record:', error);
            toast.error('Failed to create medical record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Patient Record</CardTitle>
                        <CardDescription>Enter clinical details for a patient visit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patient">Select Patient</Label>
                                    <Select
                                        value={formData.patientId}
                                        onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                                        disabled={fetchingPatients}
                                    >
                                        <SelectTrigger id="patient">
                                            <SelectValue placeholder={fetchingPatients ? "Loading patients..." : "Choose patient"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients
                                                .filter(p => p.id && p.id.trim() !== '')
                                                .map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.fullName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Record Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., General Consultation, Follow-up"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Visit Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.visitDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.visitDate ? format(formData.visitDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.visitDate}
                                                onSelect={(date) => date && setFormData({ ...formData, visitDate: date })}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Next Appointment (Optional)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.nextAppointmentDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.nextAppointmentDate ? format(formData.nextAppointmentDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.nextAppointmentDate}
                                                onSelect={(date) => setFormData({ ...formData, nextAppointmentDate: date })}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Clinical Summary</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Detailed summary of the session"
                                    className="min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis">Diagnosis</Label>
                                    <Input
                                        id="diagnosis"
                                        placeholder="ICD-10 or clinical diagnosis"
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="treatment">Treatment Prescribed</Label>
                                    <Input
                                        id="treatment"
                                        placeholder="Treatment plan or procedure"
                                        value={formData.treatment}
                                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label>Symptoms</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add symptom"
                                            value={formData.currentSymptom}
                                            onChange={(e) => setFormData({ ...formData, currentSymptom: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('symptoms', 'currentSymptom'))}
                                        />
                                        <Button type="button" variant="secondary" onClick={() => handleAddItem('symptoms', 'currentSymptom')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.symptoms.map((s, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 gap-2">
                                                {s}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('symptoms', i)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Medications</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add medication"
                                            value={formData.currentMedication}
                                            onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('medications', 'currentMedication'))}
                                        />
                                        <Button type="button" variant="secondary" onClick={() => handleAddItem('medications', 'currentMedication')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.medications.map((m, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 gap-2 bg-primary/10 text-primary border-primary/20">
                                                {m}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('medications', i)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Creating Record..." : "Confirm & Save Record"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AddMedicalHistory;
