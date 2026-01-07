using System.ComponentModel.DataAnnotations;

namespace SmartCareCMS.API.DTOs
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info"; // info, success, warning, error
        public DateTime CreatedAt { get; set; }
        public bool Read { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? RelatedId { get; set; }
    }

    public class CreateNotificationDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "info"; // info, success, warning, error

        [Required]
        public string UserId { get; set; } = string.Empty;

        public string? RelatedId { get; set; }
    }

    public class UpdateNotificationDto
    {
        public bool Read { get; set; }
    }
}