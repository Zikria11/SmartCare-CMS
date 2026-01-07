import React, { useEffect, useState } from 'react';
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
import { apiService } from '@/services/ApiService';
import { FlaskConical, ArrowLeft, User, FileUp, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

interface LabReport {
    id: string;
    patientName: string;
    reportTitle: string;
    status: string;
}

const UploadReport = () => {
    const navigate = useNavigate();
    const [pendingReports, setPendingReports] = useState<LabReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        reportId: '',
        results: '',
        notes: '',
        fileUrl: '',
    });

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await apiService.getLabReports();
                // Filter for reports that don't have results yet
                setPendingReports(response.filter((r: any) => r.status === 'Pending'));
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setFetching(false);
            }
        };

        fetchPending();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reportId || !formData.results) {
            toast.error('Please select a report and enter results');
            return;
        }

        setLoading(true);
        try {
            const reportData = {
                results: { text: formData.results },
                status: 'Completed',
                notes: formData.notes,
                fileUrl: formData.fileUrl || undefined,
            };

            await apiService.updateLabReport(formData.reportId, reportData);
            toast.success('Report updated successfully!');
            navigate('/lab');
        } catch (error) {
            console.error('Error uploading report:', error);
            toast.error('Failed to upload report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-warning/10">
                                <FileUp className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <CardTitle>Upload Lab Results</CardTitle>
                                <CardDescription>Enter findings for requested laboratory tests</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="report">Select Pending Request</Label>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, reportId: value })}
                                    disabled={fetching}
                                >
                                    <SelectTrigger id="report">
                                        <SelectValue placeholder={fetching ? "Loading requests..." : "Select a test request"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pendingReports
                                            .filter(report => report.id && report.id.trim() !== '')
                                            .map((report) => (
                                                <SelectItem key={report.id} value={report.id}>
                                                    {report.patientName} - {report.reportTitle}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="results">Test Results / Findings</Label>
                                <div className="relative">
                                    <Clipboard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Textarea
                                        id="results"
                                        placeholder="Enter detailed test results here..."
                                        className="pl-9 min-h-[150px]"
                                        value={formData.results}
                                        onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fileUrl">Report File URL (Optional)</Label>
                                <Input
                                    id="fileUrl"
                                    placeholder="https://storage.example.com/report.pdf"
                                    value={formData.fileUrl}
                                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Upload the document to a secure storage and provide the link here.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Internal Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional observations for the doctor"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Uploading..." : "Publish Results"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default UploadReport;
