namespace SmartCareCMS.API.DTOs
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


    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDto User { get; set; } = new UserDto();
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; }
        public string? City { get; set; }
        public string? Qualifications { get; set; }
        public double? ExperienceYears { get; set; }
        public double? SatisfactionRate { get; set; }
        public double? AvgTimePerPatient { get; set; }
        public double? WaitTime { get; set; }
        public string? HospitalAddress { get; set; }
        public string? DoctorLink { get; set; }
        public double? Fee { get; set; }
    }


}