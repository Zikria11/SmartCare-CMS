using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCareCMS.API.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("role")]
        public UserRole Role { get; set; }

        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("phone")]
        public string? Phone { get; set; }

        [BsonElement("dateOfBirth")]
        public DateTime? DateOfBirth { get; set; }

        [BsonElement("address")]
        public string? Address { get; set; }

        [BsonElement("specialization")]
        public string? Specialization { get; set; }

        [BsonElement("licenseNumber")]
        public string? LicenseNumber { get; set; }

        [BsonElement("approvalStatus")]
        public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;

        [BsonElement("city")]
        public string? City { get; set; }

        [BsonElement("qualifications")]
        public string? Qualifications { get; set; }

        [BsonElement("experienceYears")]
        public double? ExperienceYears { get; set; }

        [BsonElement("satisfactionRate")]
        public double? SatisfactionRate { get; set; }

        [BsonElement("avgTimePerPatient")]
        public double? AvgTimePerPatient { get; set; }

        [BsonElement("waitTime")]
        public double? WaitTime { get; set; }

        [BsonElement("hospitalAddress")]
        public string? HospitalAddress { get; set; }

        [BsonElement("doctorLink")]
        public string? DoctorLink { get; set; }

        [BsonElement("fee")]
        public double? Fee { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("isDeleted")]
        public bool IsDeleted { get; set; } = false;
    }


}