using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCareCMS.API.Models
{
    public class LabReport
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [BsonElement("doctorId")]
        public string? DoctorId { get; set; }

        [BsonElement("labTechnicianId")]
        public string? LabTechnicianId { get; set; }

        [BsonElement("reportTitle")]
        public string ReportTitle { get; set; } = string.Empty;

        [BsonElement("reportType")]
        public string ReportType { get; set; } = string.Empty;

        [BsonElement("reportDate")]
        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        [BsonElement("results")]
        public Dictionary<string, object> Results { get; set; } = new Dictionary<string, object>();

        [BsonElement("status")]
        public LabReportStatus Status { get; set; } = LabReportStatus.Pending;

        [BsonElement("notes")]
        public string? Notes { get; set; }

        [BsonElement("fileUrl")]
        public string? FileUrl { get; set; }

        [BsonElement("isShared")]
        public bool IsShared { get; set; } = false;

        [BsonElement("sharedWith")]
        public List<string> SharedWith { get; set; } = new List<string>();

        [BsonElement("billingInfo")]
        public BillingInfo? BillingInfo { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }



    public class BillingInfo
    {
        [BsonElement("amount")]
        public decimal Amount { get; set; }

        [BsonElement("currency")]
        public string Currency { get; set; } = "USD";

        [BsonElement("isPaid")]
        public bool IsPaid { get; set; } = false;

        [BsonElement("paymentMethod")]
        public string? PaymentMethod { get; set; }

        [BsonElement("paymentDate")]
        public DateTime? PaymentDate { get; set; }

        [BsonElement("invoiceNumber")]
        public string? InvoiceNumber { get; set; }
    }
}