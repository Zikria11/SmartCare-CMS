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
import { Receipt, ArrowLeft, User, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Patient {
    id: string;
    fullName: string;
}

const GenerateBill = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingPatients, setFetchingPatients] = useState(true);

    const [formData, setFormData] = useState({
        patientId: '',
        serviceType: '',
        amount: '',
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
    });

    const serviceTypes = [
        'Consultation',
        'Lab Test',
        'Surgery',
        'Pharmacy',
        'Follow-up',
        'Emergency',
        'Other'
    ];

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patientId || !formData.serviceType || !formData.amount || !formData.description) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const billingData = {
                patientId: formData.patientId,
                serviceType: formData.serviceType,
                amount: parseFloat(formData.amount),
                currency: 'USD',
                description: formData.description,
                dueDate: new Date(formData.dueDate).toISOString(),
                notes: formData.notes,
                status: 'Unpaid',
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            };

            await apiService.createBilling(billingData);
            toast.success('Invoice generated successfully!');
            navigate('/receptionist');
        } catch (error) {
            console.error('Error creating bill:', error);
            toast.error('Failed to generate invoice');
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
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Receipt className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Generate Invoice</CardTitle>
                                <CardDescription>Create a new billing record for a patient</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patient">Patient</Label>
                                    <Select
                                        onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                                        disabled={fetchingPatients}
                                    >
                                        <SelectTrigger id="patient">
                                            <SelectValue placeholder={fetchingPatients ? "Loading patients..." : "Select patient"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="service">Service Type</Label>
                                        <Select onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                                            <SelectTrigger id="service">
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviceTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (USD)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-9"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Service Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="e.g., General consultation with Dr. Smith"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            className="pl-9"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any extra info for the patient"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Generating..." : "Create Invoice"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default GenerateBill;
