namespace SmartCareCMS.API.DTOs
{
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


    public class CreateBillingRequest
    {
        public string PatientId { get; set; } = string.Empty;
        public string? AppointmentId { get; set; }
        public string? LabReportId { get; set; }
        public ServiceType ServiceType { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime DueDate { get; set; }
        public string? Notes { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
    }

    public class UpdateBillingRequest
    {
        public BillingStatus? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
    }

    public class BillingDto
    {
        public string? Id { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string? AppointmentId { get; set; }
        public string? LabReportId { get; set; }
        public ServiceType ServiceType { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public BillingStatus Status { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }


}