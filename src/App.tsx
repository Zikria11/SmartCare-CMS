import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { MessagingProvider } from "@/components/messaging/MessagingProvider";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientLabReports from "./pages/patient/PatientLabReports";

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorQueue from "./pages/doctor/DoctorQueue";
import DoctorRecords from "./pages/doctor/DoctorRecords";
import RecordDetails from "./pages/doctor/RecordDetails";
import AddMedicalHistory from "./pages/doctor/AddMedicalHistory";
import DoctorPatientRecords from "./pages/doctor/DoctorPatientRecords";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDuplicates from "./pages/admin/AdminDuplicates";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminRecords from "./pages/admin/AdminRecords";
import AdminStats from "./pages/admin/AdminStats";
import AdminSettings from "./pages/admin/AdminSettings";

// Receptionist pages
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import CheckAvailability from "./pages/receptionist/CheckAvailability";
import GenerateBill from "./pages/receptionist/GenerateBill";
import ReceptionistAppointments from "./pages/receptionist/ReceptionistAppointments";
import ReceptionistStats from "./pages/receptionist/ReceptionistStats";

// Lab pages
import LabDashboard from "./pages/lab/LabDashboard";
import UploadReport from "./pages/lab/UploadReport";
import LabReports from "./pages/lab/LabReports";
import LabRequests from "./pages/lab/LabRequests";
import LabBilling from "./pages/lab/LabBilling";
import BookAppointment from "./pages/patient/BookAppointment";
import NewMedicalHistory from "./pages/patient/NewMedicalHistory";
import RequestLabReport from "./pages/patient/RequestLabReport";
import MessagingInterface from "@/components/messaging/MessagingInterface";
import DocumentUpload from "@/components/documents/DocumentUpload";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import EmergencyContacts from "@/components/emergency/EmergencyContacts";
import MedicalHistoryTimeline from "@/components/timeline/MedicalHistoryTimeline";
import DoctorReviews from "@/components/ratings/DoctorReviews";
import LabTestTemplates from "@/components/templates/LabTestTemplates";
import PrescriptionTemplates from "@/components/templates/PrescriptionTemplates";
import GlobalSearch from "@/components/search/GlobalSearch";
import QueueManagement from "@/components/queue/QueueManagement";
import VaccinationRecords from "@/components/vaccinations/VaccinationRecords";
import ReportsExport from "@/components/reports/ReportsExport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <NotificationsProvider>
            <MessagingProvider>
              <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Patient routes */}
            <Route path="/PatientDashboard" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/appointments" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientAppointments />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/history" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientHistory />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/history/:id" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientHistory />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/lab-reports" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientLabReports />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/lab-reports/:id" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientLabReports />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/settings" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/appointments/book" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/history/new" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <NewMedicalHistory />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/lab-reports/request" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <RequestLabReport />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/messages" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <MessagingInterface />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/documents" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <DocumentUpload />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/calendar" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <AppointmentCalendar />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/emergency" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <EmergencyContacts />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/timeline" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <MedicalHistoryTimeline />
              </ProtectedRoute>
            } />
            <Route path="/PatientDashboard/vaccinations" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <VaccinationRecords />
              </ProtectedRoute>
            } />

            {/* Doctor routes */}
            <Route path="/DoctorDashboard" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/appointments" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorAppointments />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/queue" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorQueue />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/records" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorRecords />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/records/new" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <AddMedicalHistory />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/records/:id" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <RecordDetails />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/patients" element={
              <ProtectedRoute allowedRoles={['Doctor']}>                
                <DoctorPatientRecords />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/patients/:patientId" element={
              <ProtectedRoute allowedRoles={['Doctor']}>                
                <DoctorPatientRecords />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/stats" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/settings" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/messages" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <MessagingInterface />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/documents" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DocumentUpload />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/calendar" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <AppointmentCalendar />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/reviews" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorReviews />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/lab-templates" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <LabTestTemplates />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/prescription-templates" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <PrescriptionTemplates />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/vaccinations" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <VaccinationRecords />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard/queue" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <QueueManagement role="doctor" />
              </ProtectedRoute>
            } />

            {/* Receptionist routes */}
            <Route path="/ReceptionistDashboard" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/ReceptionistDashboard/appointments" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistAppointments />
              </ProtectedRoute>
            } />
            <Route path="/ReceptionistDashboard/availability" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <CheckAvailability />
              </ProtectedRoute>
            } />
            <Route path="/ReceptionistDashboard/billing" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <GenerateBill />
              </ProtectedRoute>
            } />
            <Route path="/ReceptionistDashboard/queue" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <QueueManagement role="receptionist" />
              </ProtectedRoute>
            } />
            <Route path="/ReceptionistDashboard/stats" element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <ReceptionistStats />
              </ProtectedRoute>
            } />

            {/* Lab routes */}
            <Route path="/LabDashboard" element={
              <ProtectedRoute allowedRoles={['LabTechnician']}>
                <LabDashboard />
              </ProtectedRoute>
            } />
            <Route path="/LabDashboard/reports" element={
              <ProtectedRoute allowedRoles={['LabTechnician']}>
                <LabReports />
              </ProtectedRoute>
            } />
            <Route path="/LabDashboard/upload" element={
              <ProtectedRoute allowedRoles={['LabTechnician']}>
                <UploadReport />
              </ProtectedRoute>
            } />
            <Route path="/LabDashboard/requests" element={
              <ProtectedRoute allowedRoles={['LabTechnician']}>
                <LabRequests />
              </ProtectedRoute>
            } />
            <Route path="/LabDashboard/billing" element={
              <ProtectedRoute allowedRoles={['LabTechnician']}>
                <LabBilling />
              </ProtectedRoute>
            } />
            <Route path="/LabDashboard/stats" element={
              <ProtectedRoute allowedRoles={['LabTechnician']}>
                <LabDashboard />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/AdminDashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/approvals" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminApprovals />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/users" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/duplicates" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDuplicates />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/appointments" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAppointments />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/records" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminRecords />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/stats" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminStats />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/settings" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/AdminDashboard/reports" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ReportsExport />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MessagingProvider>
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>
</TooltipProvider>
</QueryClientProvider>
);

export default App;
