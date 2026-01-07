using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCareCMS.API.Models
{
    public class MedicalHistory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [BsonElement("doctorId")]
        public string? DoctorId { get; set; }

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("diagnosis")]
        public string? Diagnosis { get; set; }

        [BsonElement("treatment")]
        public string? Treatment { get; set; }

        [BsonElement("medications")]
        public List<string> Medications { get; set; } = new List<string>();

        [BsonElement("allergies")]
        public List<string> Allergies { get; set; } = new List<string>();

        [BsonElement("symptoms")]
        public List<string> Symptoms { get; set; } = new List<string>();

        [BsonElement("vitalSigns")]
        public VitalSigns? VitalSigns { get; set; }

        [BsonElement("visitDate")]
        public DateTime VisitDate { get; set; } = DateTime.UtcNow;

        [BsonElement("nextAppointmentDate")]
        public DateTime? NextAppointmentDate { get; set; }

        [BsonElement("isShared")]
        public bool IsShared { get; set; } = false;

        [BsonElement("sharedWith")]
        public List<string> SharedWith { get; set; } = new List<string>();

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class VitalSigns
    {
        [BsonElement("bloodPressure")]
        public string? BloodPressure { get; set; }

        [BsonElement("heartRate")]
        public int? HeartRate { get; set; }

        [BsonElement("temperature")]
        public double? Temperature { get; set; }

        [BsonElement("respiratoryRate")]
        public int? RespiratoryRate { get; set; }

        [BsonElement("oxygenSaturation")]
        public int? OxygenSaturation { get; set; }

        [BsonElement("weight")]
        public double? Weight { get; set; }

        [BsonElement("height")]
        public double? Height { get; set; }
    }
}