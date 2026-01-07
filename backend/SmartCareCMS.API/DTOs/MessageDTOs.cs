using System.ComponentModel.DataAnnotations;

namespace SmartCareCMS.API.DTOs
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool Read { get; set; }
        public Guid ConversationId { get; set; }
    }

    public class ConversationDto
    {
        public Guid Id { get; set; }
        public List<string> Participants { get; set; } = new List<string>();
        public List<ParticipantDetailDto> ParticipantDetails { get; set; } = new List<ParticipantDetailDto>();
        public string? LastMessage { get; set; }
        public DateTime? LastMessageTime { get; set; }
        public int UnreadCount { get; set; }
    }

    public class ParticipantDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class CreateMessageDto
    {
        [Required]
        public string ReceiverId { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        public string SenderId { get; set; } = string.Empty;
    }

    public class CreateConversationDto
    {
        [Required]
        public List<string> ParticipantIds { get; set; } = new List<string>();
    }
}