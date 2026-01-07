import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireApproval?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApproval = true,
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if user needs approval
  if (requireApproval && profile.approvalStatus === 'Pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (profile.approvalStatus === 'Rejected') {
    return <Navigate to="/auth" replace />;
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to their appropriate dashboard
    const roleRoutes: Record<string, string> = {
      Patient: '/PatientDashboard',
      Doctor: '/DoctorDashboard',
      Receptionist: '/ReceptionistDashboard',
      LabTechnician: '/LabDashboard',
      Admin: '/AdminDashboard',
    };
    return <Navigate to={roleRoutes[profile.role] || '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
