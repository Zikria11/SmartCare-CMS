using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCareCMS.API.Models
{
    public class Appointment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [BsonElement("doctorId")]
        public string DoctorId { get; set; } = string.Empty;

        [BsonElement("appointmentDate")]
        public DateTime AppointmentDate { get; set; }

        [BsonElement("startTime")]
        public TimeSpan StartTime { get; set; }

        [BsonElement("endTime")]
        public TimeSpan EndTime { get; set; }

        [BsonElement("status")]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        [BsonElement("reason")]
        public string Reason { get; set; } = string.Empty;

        [BsonElement("notes")]
        public string? Notes { get; set; }

        [BsonElement("isOnline")]
        public bool IsOnline { get; set; } = false;

        [BsonElement("zoomMeetingUrl")]
        public string? ZoomMeetingUrl { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }


}