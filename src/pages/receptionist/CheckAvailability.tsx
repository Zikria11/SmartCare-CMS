import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/ApiService';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Search, Calendar as CalendarIcon, Clock, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Doctor {
    id: string;
    fullName: string;
    specialization?: string;
}

interface Appointment {
    id: string;
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
}

const CheckAvailability = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);

    // Time slots from 9 AM to 5 PM
    const timeSlots = Array.from({ length: 9 }, (_, i) => {
        const hour = i + 9;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await apiService.getUsers('Doctor', 'Approved');
                setDoctors(response);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                toast.error('Failed to load doctors');
            }
        };

        fetchDoctors();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!selectedDoctor) return;

            setLoading(true);
            try {
                const response = await apiService.getAppointments(selectedDoctor, 'Doctor');
                setAppointments(response);
            } catch (error) {
                console.error('Error fetching appointments:', error);
                toast.error('Failed to load availability');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [selectedDoctor]);

    const isSlotBooked = (time: string, date: Date) => {
        return appointments.some(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return isSameDay(aptDate, date) && apt.startTime.startsWith(time) && apt.status !== 'Cancelled';
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Doctor Availability</h1>
                        <p className="text-muted-foreground">Check schedule and find available time slots</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Selection</CardTitle>
                            <CardDescription>Select doctor and date to view schedule</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Select Doctor</Label>
                                <Select onValueChange={setSelectedDoctor}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Date</Label>
                                <div className="border rounded-md p-1">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        className="rounded-md"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Schedule for {format(selectedDate, 'MMMM d, yyyy')}</span>
                                <Badge variant="outline" className="font-normal">
                                    {loading ? 'Refreshing...' : 'Live view'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedDoctor ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Please select a doctor to see their availability</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {timeSlots.map((time) => {
                                        const booked = isSlotBooked(time, selectedDate);
                                        return (
                                            <div
                                                key={time}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                                                    booked
                                                        ? "bg-destructive/5 border-destructive/20 opacity-75"
                                                        : "bg-success/5 border-success/20 hover:border-success/50 cursor-pointer"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock className={cn("w-5 h-5", booked ? "text-destructive" : "text-success")} />
                                                    <div>
                                                        <p className="font-semibold text-foreground">{time}</p>
                                                        <p className="text-sm text-muted-foreground">1 hour slot</p>
                                                    </div>
                                                </div>
                                                <Badge variant={booked ? "destructive" : "default"} className="rounded-full px-4">
                                                    {booked ? "Booked" : "Available"}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Helper for Label if needed (it was used but might react-label might be imported differently)
const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
        {children}
    </label>
);

export default CheckAvailability;
