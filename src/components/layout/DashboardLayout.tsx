import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Calendar,
  FileText,
  Activity,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  FlaskConical,
  Receipt,
  UserCheck,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalSearch from '@/components/search/GlobalSearch';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const getNavItems = (role: string): NavItem[] => {
  switch (role) {
    case 'Patient':
      return [
        { label: 'Dashboard', href: '/PatientDashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Appointments', href: '/PatientDashboard/appointments', icon: <Calendar className="w-5 h-5" /> },
        { label: 'Calendar', href: '/PatientDashboard/calendar', icon: <Calendar className="w-5 h-5" /> },
        { label: 'Medical History', href: '/PatientDashboard/history', icon: <FileText className="w-5 h-5" /> },
        { label: 'Medical Timeline', href: '/PatientDashboard/timeline', icon: <Activity className="w-5 h-5" /> },
        { label: 'Lab Reports', href: '/PatientDashboard/lab-reports', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Documents', href: '/PatientDashboard/documents', icon: <FileText className="w-5 h-5" /> },
        { label: 'Vaccinations', href: '/PatientDashboard/vaccinations', icon: <Activity className="w-5 h-5" /> },
        { label: 'Emergency Info', href: '/PatientDashboard/emergency', icon: <Activity className="w-5 h-5" /> },
        { label: 'Messages', href: '/PatientDashboard/messages', icon: <Activity className="w-5 h-5" /> },
      ];
    case 'Doctor':
      return [
        { label: 'Dashboard', href: '/DoctorDashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Appointments', href: '/DoctorDashboard/appointments', icon: <Calendar className="w-5 h-5" /> },
        { label: 'Calendar', href: '/DoctorDashboard/calendar', icon: <Calendar className="w-5 h-5" /> },
        { label: 'Patient Queue', href: '/DoctorDashboard/queue', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Patient Records', href: '/DoctorDashboard/records', icon: <FileText className="w-5 h-5" /> },
        { label: 'Statistics', href: '/DoctorDashboard/stats', icon: <BarChart3 className="w-5 h-5" /> },
        { label: 'Documents', href: '/DoctorDashboard/documents', icon: <FileText className="w-5 h-5" /> },
        { label: 'Reviews', href: '/DoctorDashboard/reviews', icon: <Activity className="w-5 h-5" /> },
        { label: 'Lab Templates', href: '/DoctorDashboard/lab-templates', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Prescription Templates', href: '/DoctorDashboard/prescription-templates', icon: <Activity className="w-5 h-5" /> },
        { label: 'Vaccinations', href: '/DoctorDashboard/vaccinations', icon: <Activity className="w-5 h-5" /> },
        { label: 'Messages', href: '/DoctorDashboard/messages', icon: <Activity className="w-5 h-5" /> },
      ];
    case 'Receptionist':
      return [
        { label: 'Dashboard', href: '/ReceptionistDashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Appointments', href: '/ReceptionistDashboard/appointments', icon: <Calendar className="w-5 h-5" /> },
        { label: 'Queue Management', href: '/ReceptionistDashboard/queue', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Doctor Availability', href: '/ReceptionistDashboard/availability', icon: <Stethoscope className="w-5 h-5" /> },
        { label: 'Billing', href: '/ReceptionistDashboard/billing', icon: <Receipt className="w-5 h-5" /> },
        { label: 'Statistics', href: '/ReceptionistDashboard/stats', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    case 'LabTechnician':
      return [
        { label: 'Dashboard', href: '/LabDashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Lab Reports', href: '/LabDashboard/reports', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Pending Requests', href: '/LabDashboard/requests', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Lab Templates', href: '/LabDashboard/lab-templates', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Billing', href: '/LabDashboard/billing', icon: <Receipt className="w-5 h-5" /> },
        { label: 'Statistics', href: '/LabDashboard/stats', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    case 'Admin':
      return [
      { label: 'Dashboard', href: '/AdminDashboard', icon: <Home className="w-5 h-5" /> },
      { label: 'User Approvals', href: '/AdminDashboard/approvals', icon: <UserCheck className="w-5 h-5" /> },
      { label: 'All Users', href: '/AdminDashboard/users', icon: <Users className="w-5 h-5" /> },
      { label: 'Duplicate Doctors', href: '/AdminDashboard/duplicates', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'All Appointments', href: '/AdminDashboard/appointments', icon: <Calendar className="w-5 h-5" /> },
        { label: 'All Records', href: '/AdminDashboard/records', icon: <FileText className="w-5 h-5" /> },
        { label: 'Reports', href: '/AdminDashboard/reports', icon: <BarChart3 className="w-5 h-5" /> },
        { label: 'Statistics', href: '/AdminDashboard/stats', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    default:
      return [];
  }
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItems(profile?.role || '');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      Patient: 'Patient',
      Doctor: 'Doctor',
      Receptionist: 'Receptionist',
      LabTechnician: 'Lab Technician',
      Admin: 'Administrator',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Patient: 'bg-accent',
      Doctor: 'bg-primary',
      Receptionist: 'bg-warning',
      LabTechnician: 'bg-success',
      Admin: 'bg-destructive',
    };
    return colors[role] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SmartCare</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="gradient-primary text-primary-foreground">
                  {profile?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.fullName}
                </p>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground",
                  getRoleColor(profile?.role || '')
                )}>
                  {getRoleLabel(profile?.role || '')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Settings & Logout */}
          <div className="p-4 border-t border-border space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/${profile?.role}Dashboard/settings`)}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <GlobalSearch />
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="gradient-primary text-primary-foreground">
                      {profile?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">
                    {profile?.fullName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/${profile?.role}Dashboard/settings`)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
