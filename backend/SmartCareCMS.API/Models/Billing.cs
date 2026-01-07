using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCareCMS.API.Models
{
    public class Billing
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [BsonElement("appointmentId")]
        public string? AppointmentId { get; set; }

        [BsonElement("labReportId")]
        public string? LabReportId { get; set; }

        [BsonElement("serviceType")]
        public ServiceType ServiceType { get; set; }

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("amount")]
        public decimal Amount { get; set; }

        [BsonElement("currency")]
        public string Currency { get; set; } = "USD";

        [BsonElement("status")]
        public BillingStatus Status { get; set; } = BillingStatus.Pending;

        [BsonElement("dueDate")]
        public DateTime DueDate { get; set; }

        [BsonElement("paidDate")]
        public DateTime? PaidDate { get; set; }

        [BsonElement("paymentMethod")]
        public string? PaymentMethod { get; set; }

        [BsonElement("invoiceNumber")]
        public string InvoiceNumber { get; set; } = string.Empty;

        [BsonElement("notes")]
        public string? Notes { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }


}