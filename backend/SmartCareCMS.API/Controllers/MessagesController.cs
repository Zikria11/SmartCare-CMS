using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using SmartCareCMS.API.Services;
using System.Security.Claims;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly DatabaseContext _context;
    private readonly IRealTimeService _realTimeService;

        public MessagesController(DatabaseContext context, IRealTimeService realTimeService)
        {
            _context = context;
            _realTimeService = realTimeService;
        }

        // GET: api/messages/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<MessageDto>>> GetMessagesByUser(string userId)
        {
            try
            {
                // Find all conversations that include the user
                var conversations = await _context.Conversations
                    .Find(c => true) // For now, we'll get all conversations for the user
                    .ToListAsync();

                // Find all messages in conversations that include the user
                var messageFilter = Builders<Message>.Filter.AnyEq(m => m.ConversationId, 
                    conversations.Where(c => c.Messages.Any(m => m.SenderId == userId || m.ReceiverId == userId))
                                 .Select(c => c.Id));
                
                var messages = await _context.Messages
                    .Find(messageFilter)
                    .SortByDescending(m => m.Timestamp)
                    .ToListAsync();

                // Get user details for sender/receiver names and roles
                var userIds = messages.SelectMany(m => new[] { m.SenderId, m.ReceiverId }).Distinct().ToList();
                var users = await _context.Users
                    .Find(u => userIds.Contains(u.Id))
                    .ToListAsync();

                var userDict = users.ToDictionary(u => u.Id, u => u);

                var messageDtos = messages.Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderName = userDict.ContainsKey(m.SenderId) ? userDict[m.SenderId].FullName : "Unknown",
                    SenderRole = userDict.ContainsKey(m.SenderId) ? userDict[m.SenderId].Role.ToString() : "Unknown",
                    ReceiverId = m.ReceiverId,
                    ReceiverName = userDict.ContainsKey(m.ReceiverId) ? userDict[m.ReceiverId].FullName : "Unknown",
                    ReceiverRole = userDict.ContainsKey(m.ReceiverId) ? userDict[m.ReceiverId].Role.ToString() : "Unknown",
                    Content = m.Content,
                    Timestamp = m.Timestamp,
                    Read = m.Read,
                    ConversationId = m.ConversationId
                }).ToList();

                return Ok(messageDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving messages", error = ex.Message });
            }
        }

        // GET: api/conversations/user/{userId}
        [HttpGet("conversations/user/{userId}")]
        public async Task<ActionResult<List<ConversationDto>>> GetConversationsByUser(string userId)
        {
            try
            {
                // Find all conversations that include the user
                var conversationFilter = Builders<Conversation>.Filter.AnyEq(c => c.Id, 
                    await _context.Messages
                        .Find(m => m.SenderId == userId || m.ReceiverId == userId)
                        .Project(m => m.ConversationId)
                        .ToListAsync());

                var conversations = await _context.Conversations
                    .Find(conversationFilter)
                    .SortByDescending(c => c.LastMessageAt)
                    .ToListAsync();

                var conversationDtos = new List<ConversationDto>();

                foreach (var conversation in conversations)
                {
                    // Get messages for this conversation to determine participants
                    var messages = await _context.Messages
                        .Find(m => m.ConversationId == conversation.Id)
                        .ToListAsync();

                    var participants = messages
                        .SelectMany(m => new[] { m.SenderId, m.ReceiverId })
                        .Distinct()
                        .ToList();

                    // Get user details for participant names and roles
                    var users = await _context.Users
                        .Find(u => participants.Contains(u.Id))
                        .ToListAsync();

                    var participantDetails = users.Select(u => new ParticipantDetailDto
                    {
                        Id = u.Id,
                        Name = u.FullName,
                        Role = u.Role.ToString()
                    }).ToList();

                    // Count unread messages for this user
                    var unreadCount = messages.Count(m => 
                        m.ReceiverId == userId && !m.Read);

                    var conversationDto = new ConversationDto
                    {
                        Id = conversation.Id,
                        Participants = participants,
                        ParticipantDetails = participantDetails,
                        LastMessage = conversation.LastMessage,
                        LastMessageTime = conversation.LastMessageAt,
                        UnreadCount = unreadCount
                    };

                    conversationDtos.Add(conversationDto);
                }

                return Ok(conversationDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving conversations", error = ex.Message });
            }
        }

        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage([FromBody] CreateMessageDto createDto)
        {
            try
            {
                // Find or create conversation
                var conversationFilter = Builders<Conversation>.Filter.AnyEq(
                    c => c.Id,
                    await _context.Messages
                        .Find(m => (m.SenderId == createDto.SenderId && m.ReceiverId == createDto.ReceiverId) ||
                                   (m.SenderId == createDto.ReceiverId && m.ReceiverId == createDto.SenderId))
                        .Project(m => m.ConversationId)
                        .ToListAsync());

                var conversation = await _context.Conversations
                    .Find(conversationFilter)
                    .FirstOrDefaultAsync();

                Guid conversationId;
                if (conversation == null)
                {
                    // Create new conversation
                    var newConversation = new Conversation
                    {
                        CreatedAt = DateTime.UtcNow,
                        LastMessageAt = DateTime.UtcNow,
                        LastMessage = createDto.Content
                    };

                    await _context.Conversations.InsertOneAsync(newConversation);
                    conversationId = newConversation.Id;
                }
                else
                {
                    conversationId = conversation.Id;
                    
                    // Update conversation's last message
                    var updateConversationFilter = Builders<Conversation>.Filter.Eq(c => c.Id, conversationId);
                    var updateConversation = Builders<Conversation>.Update
                        .Set(c => c.LastMessageAt, DateTime.UtcNow)
                        .Set(c => c.LastMessage, createDto.Content);

                    await _context.Conversations.UpdateOneAsync(updateConversationFilter, updateConversation);
                }

                // Create the message
                var message = new Message
                {
                    SenderId = createDto.SenderId,
                    ReceiverId = createDto.ReceiverId,
                    Content = createDto.Content,
                    ConversationId = conversationId
                };

                await _context.Messages.InsertOneAsync(message);

                // Get sender details
                var sender = await _context.Users
                    .Find(u => u.Id == createDto.SenderId)
                    .FirstOrDefaultAsync();

                // Get receiver details
                var receiver = await _context.Users
                    .Find(u => u.Id == createDto.ReceiverId)
                    .FirstOrDefaultAsync();

                var messageDto = new MessageDto
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    SenderName = sender?.FullName ?? "Unknown",
                    SenderRole = sender?.Role.ToString() ?? "Unknown",
                    ReceiverId = message.ReceiverId,
                    ReceiverName = receiver?.FullName ?? "Unknown",
                    ReceiverRole = receiver?.Role.ToString() ?? "Unknown",
                    Content = message.Content,
                    Timestamp = message.Timestamp,
                    Read = message.Read,
                    ConversationId = message.ConversationId
                };

                return CreatedAtAction(nameof(GetMessagesByUser), new { userId = createDto.SenderId }, messageDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating message", error = ex.Message });
            }
        }

        // PUT: api/messages/{conversationId}/read/{messageId?}
        [HttpPut("{conversationId}/read/{messageId?}")]
        public async Task<IActionResult> MarkAsRead(string conversationId, string? messageId = null)
        {
            try
            {
                var filterBuilder = Builders<Message>.Filter;
                var filter = filterBuilder.Eq(m => m.ConversationId, Guid.Parse(conversationId));

                if (!string.IsNullOrEmpty(messageId))
                {
                    filter = filterBuilder.And(
                        filterBuilder.Eq(m => m.ConversationId, Guid.Parse(conversationId)),
                        filterBuilder.Eq(m => m.Id, Guid.Parse(messageId))
                    );
                }

                var update = Builders<Message>.Update.Set(m => m.Read, true);

                var result = await _context.Messages.UpdateManyAsync(filter, update);

                return Ok(new { message = $"{result.ModifiedCount} message(s) marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating messages", error = ex.Message });
            }
        }

        // GET: api/messages/connect/{userId} - Server-Sent Events endpoint
        [HttpGet("connect/{userId}")]
        public async Task ConnectToMessages(string userId, [FromServices] IRealTimeService realTimeService, CancellationToken cancellationToken)
        {
            Response.Headers.Append("Content-Type", "text/event-stream");
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");
            Response.Headers.Append("Access-Control-Allow-Origin", "*");

            var proxy = new ServerSentEventsProxy(Response, cancellationToken);
            
            // Subscribe to real-time updates
            realTimeService.Subscribe(userId, proxy);
            
            try
            {
                // Keep the connection alive
                while (!cancellationToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, cancellationToken); // Send a heartbeat every second
                     
                     // Send a heartbeat to keep the connection alive
                    await Response.WriteAsync(": heartbeat\n\n");
                    await Response.Body.FlushAsync();
                }
            }
            catch (OperationCanceledException)
            {
                // Client disconnected
            }
            finally
            {
                realTimeService.Unsubscribe(userId);
            }
        }
    }
}