using System.ComponentModel.DataAnnotations;

namespace SmartCareCMS.API.Models
{
    public class Notification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "info"; // info, success, warning, error

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool Read { get; set; } = false;

        [Required]
        public string UserId { get; set; } = string.Empty;

        public string? RelatedId { get; set; } // ID of related entity (appointment, report, etc.)
    }
}