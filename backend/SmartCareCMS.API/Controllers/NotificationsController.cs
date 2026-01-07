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
    public class NotificationsController : ControllerBase
    {
        private readonly DatabaseContext _context;
    private readonly IRealTimeService _realTimeService;

        public NotificationsController(DatabaseContext context, IRealTimeService realTimeService)
        {
            _context = context;
            _realTimeService = realTimeService;
        }

        // GET: api/notifications/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<NotificationDto>>> GetNotificationsByUser(string userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Find(n => n.UserId == userId)
                    .SortByDescending(n => n.CreatedAt)
                    .ToListAsync();

                var notificationDtos = notifications.Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    CreatedAt = n.CreatedAt,
                    Read = n.Read,
                    UserId = n.UserId,
                    RelatedId = n.RelatedId
                }).ToList();

                return Ok(notificationDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving notifications", error = ex.Message });
            }
        }

        // POST: api/notifications
        [HttpPost]
        public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto createDto)
        {
            try
            {
                var notification = new Notification
                {
                    Title = createDto.Title,
                    Message = createDto.Message,
                    Type = createDto.Type,
                    UserId = createDto.UserId,
                    RelatedId = createDto.RelatedId
                };

                await _context.Notifications.InsertOneAsync(notification);

                var notificationDto = new NotificationDto
                {
                    Id = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    Type = notification.Type,
                    CreatedAt = notification.CreatedAt,
                    Read = notification.Read,
                    UserId = notification.UserId,
                    RelatedId = notification.RelatedId
                };

                return CreatedAtAction(nameof(GetNotificationsByUser), new { userId = notification.UserId }, notificationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating notification", error = ex.Message });
            }
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            try
            {
                var filter = Builders<Notification>.Filter.Eq(n => n.Id, Guid.Parse(id));
                var update = Builders<Notification>.Update.Set(n => n.Read, true);

                var result = await _context.Notifications.UpdateOneAsync(filter, update);

                if (result.MatchedCount == 0)
                {
                    return NotFound(new { message = "Notification not found" });
                }

                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating notification", error = ex.Message });
            }
        }

        // PUT: api/notifications/mark-all-read
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                // Get the user ID from the claims
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var filter = Builders<Notification>.Filter.And(
                    Builders<Notification>.Filter.Eq(n => n.UserId, userId),
                    Builders<Notification>.Filter.Eq(n => n.Read, false)
                );
                var update = Builders<Notification>.Update.Set(n => n.Read, true);

                var result = await _context.Notifications.UpdateManyAsync(filter, update);

                return Ok(new { message = $"{result.ModifiedCount} notifications marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating notifications", error = ex.Message });
            }
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            try
            {
                var filter = Builders<Notification>.Filter.Eq(n => n.Id, Guid.Parse(id));

                var result = await _context.Notifications.DeleteOneAsync(filter);

                if (result.DeletedCount == 0)
                {
                    return NotFound(new { message = "Notification not found" });
                }

                return Ok(new { message = "Notification deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting notification", error = ex.Message });
            }
        }

        // GET: api/notifications/connect/{userId} - Server-Sent Events endpoint
        [HttpGet("connect/{userId}")]
        public async Task ConnectToNotifications(string userId, [FromServices] IRealTimeService realTimeService, CancellationToken cancellationToken)
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