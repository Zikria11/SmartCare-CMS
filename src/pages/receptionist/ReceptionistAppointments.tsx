import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReceptionistAppointments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Receptionist — Appointments</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View and manage patient appointments.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistAppointments;
