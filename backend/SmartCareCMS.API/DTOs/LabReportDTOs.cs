namespace SmartCareCMS.API.DTOs
{
    public enum LabReportStatus
    {
        Pending,
        InProgress,
        Completed,
        Rejected
    }


    public class CreateLabReportRequest
    {
        public string PatientId { get; set; } = string.Empty;
        public string? DoctorId { get; set; }
        public string? LabTechnicianId { get; set; }
        public string ReportTitle { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public Dictionary<string, object> Results { get; set; } = new Dictionary<string, object>();
        public string? Notes { get; set; }
        public string? FileUrl { get; set; }
        public bool IsShared { get; set; } = false;
        public List<string> SharedWith { get; set; } = new List<string>();
        public BillingInfoDto? BillingInfo { get; set; }
    }

    public class UpdateLabReportRequest
    {
        public string? ReportTitle { get; set; }
        public string? ReportType { get; set; }
        public Dictionary<string, object>? Results { get; set; }
        public string? Notes { get; set; }
        public string? FileUrl { get; set; }
        public LabReportStatus? Status { get; set; }
        public bool? IsShared { get; set; }
        public List<string>? SharedWith { get; set; }
        public BillingInfoDto? BillingInfo { get; set; }
    }

    public class LabReportDto
    {
        public string? Id { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string? DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string? LabTechnicianId { get; set; }
        public string? LabTechnicianName { get; set; }
        public string ReportTitle { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public Dictionary<string, object> Results { get; set; } = new Dictionary<string, object>();
        public LabReportStatus Status { get; set; }
        public string? Notes { get; set; }
        public string? FileUrl { get; set; }
        public bool IsShared { get; set; }
        public List<string> SharedWith { get; set; } = new List<string>();
        public BillingInfoDto? BillingInfo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class BillingInfoDto
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsPaid { get; set; } = false;
        public string? PaymentMethod { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? InvoiceNumber { get; set; }
    }


}