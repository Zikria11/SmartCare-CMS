namespace SmartCareCMS.API.DTOs
{
    public class CreateMedicalHistoryRequest
    {
        public string PatientId { get; set; } = string.Empty;
        public string? DoctorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public List<string> Medications { get; set; } = new List<string>();
        public List<string> Allergies { get; set; } = new List<string>();
        public List<string> Symptoms { get; set; } = new List<string>();
        public VitalSignsDto? VitalSigns { get; set; }
        public DateTime VisitDate { get; set; }
        public DateTime? NextAppointmentDate { get; set; }
        public bool IsShared { get; set; } = false;
        public List<string> SharedWith { get; set; } = new List<string>();
    }

    public class UpdateMedicalHistoryRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public List<string>? Medications { get; set; }
        public List<string>? Allergies { get; set; }
        public List<string>? Symptoms { get; set; }
        public VitalSignsDto? VitalSigns { get; set; }
        public DateTime? VisitDate { get; set; }
        public DateTime? NextAppointmentDate { get; set; }
        public bool? IsShared { get; set; }
        public List<string>? SharedWith { get; set; }
    }

    public class MedicalHistoryDto
    {
        public string? Id { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string? DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public List<string> Medications { get; set; } = new List<string>();
        public List<string> Allergies { get; set; } = new List<string>();
        public List<string> Symptoms { get; set; } = new List<string>();
        public VitalSignsDto? VitalSigns { get; set; }
        public DateTime VisitDate { get; set; }
        public DateTime? NextAppointmentDate { get; set; }
        public bool IsShared { get; set; }
        public List<string> SharedWith { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class VitalSignsDto
    {
        public string? BloodPressure { get; set; }
        public int? HeartRate { get; set; }
        public double? Temperature { get; set; }
        public int? RespiratoryRate { get; set; }
        public int? OxygenSaturation { get; set; }
        public double? Weight { get; set; }
        public double? Height { get; set; }
    }
}