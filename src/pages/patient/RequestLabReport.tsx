import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { FlaskConical, ArrowLeft, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const RequestLabReport = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        reportTitle: '',
        reportType: '',
        notes: '',
    });

    const reportTypes = [
        'Blood Test',
        'Urine Analysis',
        'X-Ray',
        'MRI Scan',
        'CT Scan',
        'Biopsy',
        'Other'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id || !formData.reportTitle || !formData.reportType) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const reportData = {
                patientId: profile.id,
                reportTitle: formData.reportTitle,
                reportType: formData.reportType,
                results: {}, // Initial empty results
                status: 'Pending',
                notes: formData.notes,
                isShared: false,
                sharedWith: [],
            };

            await apiService.createLabReport(reportData);
            toast.success('Lab report request submitted!');
            navigate('/patient/lab-reports');
        } catch (error) {
            console.error('Error requesting lab report:', error);
            toast.error('Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-warning/10">
                                <FlaskConical className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <CardTitle>Request Lab Test</CardTitle>
                                <CardDescription>Order a new diagnostic test or laboratory report</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Test Title</Label>
                                <div className="relative">
                                    <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="title"
                                        placeholder="e.g., Complete Blood Count, COVID-19 Test"
                                        className="pl-9"
                                        value={formData.reportTitle}
                                        onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Test Type</Label>
                                <Select onValueChange={(value) => setFormData({ ...formData, reportType: value })}>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select test type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Clinical Notes / Reason</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Describe your symptoms or why you're requesting this test"
                                    className="min-h-[120px]"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Submitting Request..." : "Submit Lab Test Request"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default RequestLabReport;
