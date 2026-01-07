using System.ComponentModel.DataAnnotations;

namespace SmartCareCMS.API.Models
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string SenderId { get; set; } = string.Empty;

        [Required]
        public string ReceiverId { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool Read { get; set; } = false;

        [Required]
        public Guid ConversationId { get; set; }

        // Navigation property
        public virtual Conversation? Conversation { get; set; }
    }

    public class Conversation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastMessageAt { get; set; }

        public string? LastMessage { get; set; }

        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}