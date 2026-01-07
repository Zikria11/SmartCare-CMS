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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Video, MapPin, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Doctor {
    id: string;
    fullName: string;
    specialization?: string;
}

const BookAppointment = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingDoctors, setFetchingDoctors] = useState(true);
    const [cityFilter, setCityFilter] = useState('');
    const [specFilter, setSpecFilter] = useState('');

    const [formData, setFormData] = useState({
        doctorId: '',
        date: undefined as Date | undefined,
        startTime: '',
        reason: '',
        isOnline: false,
    });

    useEffect(() => {
        const fetchDoctors = async () => {
            setFetchingDoctors(true);
            try {
                const city = cityFilter === 'All' ? undefined : (cityFilter || undefined);
                const response = await apiService.getDoctors(city, specFilter || undefined);
                setDoctors(response || []); // Ensure response is an array
            } catch (error) {
                console.error('Error fetching doctors:', error);
                setDoctors([]); // Set to empty array on error
                toast.error('Failed to load doctors');
            } finally {
                setFetchingDoctors(false);
            }
        };

        fetchDoctors();
    }, [cityFilter, specFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id || !formData.date || !formData.doctorId || !formData.startTime || !formData.reason) {
            const missingFields = [];
            if (!profile?.id) missingFields.push('user authentication');
            if (!formData.date) missingFields.push('date');
            if (!formData.doctorId) missingFields.push('doctor');
            if (!formData.startTime) missingFields.push('time');
            if (!formData.reason) missingFields.push('reason');
            
            toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            // Create endTime (1 hour after startTime for simplicity)
            const [hours, minutes] = formData.startTime.split(':');
            const startDateTime = new Date(formData.date);
            startDateTime.setHours(parseInt(hours), parseInt(minutes));

            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(startDateTime.getHours() + 1);

            const appointmentData = {
                patientId: profile.id,
                doctorId: formData.doctorId,
                appointmentDate: format(formData.date, 'yyyy-MM-dd'),
                startTime: formData.startTime + ':00',
                endTime: format(endDateTime, 'HH:mm') + ':00',
                reason: formData.reason,
                isOnline: formData.isOnline,
            };

            await apiService.createAppointment(appointmentData);
            toast.success('Appointment booked successfully!');
            navigate('/PatientDashboard/appointments');
        } catch (error) {
            console.error('Error booking appointment:', error);
            toast.error('Failed to book appointment');
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
                        <CardTitle>Book an Appointment</CardTitle>
                        <CardDescription>Schedule a new visit with one of our specialists</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                    <div className="space-y-2">
                                        <Label>Filter by City</Label>
                                        <Select value={cityFilter} onValueChange={setCityFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Cities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Cities</SelectItem>
                                                <SelectItem value="Islamabad">Islamabad</SelectItem>
                                                <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                                                <SelectItem value="Karachi">Karachi</SelectItem>
                                                <SelectItem value="Lahore">Lahore</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Filter by Specialization</Label>
                                        <Input
                                            placeholder="e.g. Dermatologist"
                                            value={specFilter}
                                            onChange={(e) => setSpecFilter(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="doctor">Select Doctor</Label>
                                    <Select
                                        onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                                        disabled={fetchingDoctors}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={fetchingDoctors ? "Loading doctors..." : "Select a doctor"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors && doctors.length > 0 ? (
                                                doctors
                                                    .filter(doctor => doctor.id && doctor.id.trim() !== '')
                                                    .map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id}>
                                                            Dr. {doctor.fullName} {doctor.specialization ? `(${doctor.specialization})` : ''}
                                                        </SelectItem>
                                                    ))
                                            ) : (
                                                <SelectItem value="no-doctors" disabled>
                                                    No doctors available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !formData.date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.date}
                                                    onSelect={(date) => setFormData({ ...formData, date })}
                                                    initialFocus
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time">Start Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="time"
                                                type="time"
                                                className="pl-9"
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Visit</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Briefly describe your symptoms or reason for the visit"
                                        className="min-h-[100px]"
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label>Appointment Type</Label>
                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant={!formData.isOnline ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => setFormData({ ...formData, isOnline: false })}
                                        >
                                            <MapPin className="w-4 h-4 mr-2" />
                                            In-Person
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.isOnline ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => setFormData({ ...formData, isOnline: true })}
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            Online (Zoom)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Booking..." : "Confirm Appointment"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default BookAppointment;
