import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Plus, X, Stethoscope, Pill, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NewMedicalHistory = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
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
        if (!profile?.id || !formData.title || !formData.description) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const historyData = {
                patientId: profile.id,
                title: formData.title,
                description: formData.description,
                diagnosis: formData.diagnosis || undefined,
                treatment: formData.treatment || undefined,
                medications: formData.medications,
                allergies: formData.allergies,
                symptoms: formData.symptoms,
                visitDate: format(formData.visitDate, "yyyy-MM-dd'T'HH:mm:ss"),
                nextAppointmentDate: formData.nextAppointmentDate ? format(formData.nextAppointmentDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
                isShared: false,
                sharedWith: [],
            };

            await apiService.createMedicalHistory(historyData);
            toast.success('Medical record added successfully!');
            navigate('/patient/history');
        } catch (error) {
            console.error('Error adding medical record:', error);
            toast.error('Failed to add medical record');
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
                        <CardTitle>Add Medical Record</CardTitle>
                        <CardDescription>Document a new medical visit or update your history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 md:col-span-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Record Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Annual Checkup, Dental Visit"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Brief Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Summary of why you visited the doctor"
                                            className="min-h-[80px]"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

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
                                    <Label>Next Follow-up (Optional)</Label>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
                                    <Input
                                        id="diagnosis"
                                        placeholder="Doctor's diagnosis"
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="treatment">Treatment (Optional)</Label>
                                    <Input
                                        id="treatment"
                                        placeholder="Prescribed treatment"
                                        value={formData.treatment}
                                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Lists */}
                            <div className="space-y-6">
                                {/* Symptoms */}
                                <div className="space-y-4">
                                    <Label>Symptoms</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Add a symptom"
                                                className="pl-9"
                                                value={formData.currentSymptom}
                                                onChange={(e) => setFormData({ ...formData, currentSymptom: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('symptoms', 'currentSymptom'))}
                                            />
                                        </div>
                                        <Button type="button" variant="secondary" onClick={() => handleAddItem('symptoms', 'currentSymptom')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.symptoms.map((symptom, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 gap-2">
                                                {symptom}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('symptoms', i)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Medications */}
                                <div className="space-y-4">
                                    <Label>Medications</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Add a medication"
                                                className="pl-9"
                                                value={formData.currentMedication}
                                                onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('medications', 'currentMedication'))}
                                            />
                                        </div>
                                        <Button type="button" variant="secondary" onClick={() => handleAddItem('medications', 'currentMedication')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.medications.map((med, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 gap-2 bg-primary/10 text-primary border-primary/20">
                                                {med}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('medications', i)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Allergies */}
                                <div className="space-y-4">
                                    <Label>Allergies</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Add an allergy"
                                                className="pl-9"
                                                value={formData.currentAllergy}
                                                onChange={(e) => setFormData({ ...formData, currentAllergy: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('allergies', 'currentAllergy'))}
                                            />
                                        </div>
                                        <Button type="button" variant="secondary" onClick={() => handleAddItem('allergies', 'currentAllergy')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.allergies.map((allergy, i) => (
                                            <Badge key={i} variant="destructive" className="px-3 py-1 gap-2">
                                                {allergy}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('allergies', i)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Saving Record..." : "Save Medical Record"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default NewMedicalHistory;
