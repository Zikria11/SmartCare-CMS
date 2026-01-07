namespace SmartCareCMS.API.DTOs
{
    public enum AppointmentStatus
    {
        Scheduled,
        Confirmed,
        Completed,
        Cancelled,
        NoShow
    }


    public class CreateAppointmentRequest
    {
        public string PatientId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsOnline { get; set; } = false;
    }

    public class UpdateAppointmentRequest
    {
        public string? PatientId { get; set; }
        public string? DoctorId { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public AppointmentStatus? Status { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public bool? IsOnline { get; set; }
        public string? ZoomMeetingUrl { get; set; }
    }

    public class AppointmentDto
    {
        public string? Id { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsOnline { get; set; }
        public string? ZoomMeetingUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }


}