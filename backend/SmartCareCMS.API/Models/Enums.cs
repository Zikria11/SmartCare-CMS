namespace SmartCareCMS.API.Models
{
    public enum UserRole
    {
        Patient,
        Doctor,
        Receptionist,
        LabTechnician,
        Admin
    }

    public enum ApprovalStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public enum AppointmentStatus
    {
        Scheduled,
        Confirmed,
        Completed,
        Cancelled,
        NoShow
    }

    public enum LabReportStatus
    {
        Pending,
        InProgress,
        Completed,
        Rejected
    }

    public enum BillingStatus
    {
        Pending,
        Paid,
        Partial,
        Overdue,
        Cancelled
    }

    public enum ServiceType
    {
        Appointment,
        LabTest,
        Consultation,
        Procedure,
        Other
    }
}