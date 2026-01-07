using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using SmartCareCMS.API.Services;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DatabaseContext _context;
        private readonly IEmailService _emailService;

        public UsersController(DatabaseContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetUsers([FromQuery] string? role = null, [FromQuery] string? approvalStatus = null)
        {
            var filterBuilder = Builders<User>.Filter;
            var filters = new List<FilterDefinition<User>>();

            if (!string.IsNullOrEmpty(role) && Enum.TryParse<SmartCareCMS.API.Models.UserRole>(role, true, out var roleEnum))
            {
                filters.Add(filterBuilder.Eq(u => u.Role, roleEnum));
            }

            if (!string.IsNullOrEmpty(approvalStatus) && Enum.TryParse<SmartCareCMS.API.Models.ApprovalStatus>(approvalStatus, true, out var statusEnum))
            {
                filters.Add(filterBuilder.Eq(u => u.ApprovalStatus, statusEnum));
            }

            // Exclude deleted users
            filters.Add(filterBuilder.Eq(u => u.IsDeleted, false));

            var filter = filters.Count > 0 
                ? filterBuilder.And(filters) 
                : filterBuilder.And(filterBuilder.Eq(u => u.IsDeleted, false));

            var users = await _context.Users.Find(filter).ToListAsync();
            
            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id!,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = (SmartCareCMS.API.DTOs.UserRole)u.Role,
                Phone = u.Phone,
                DateOfBirth = u.DateOfBirth,
                Address = u.Address,
                Specialization = u.Specialization,
                LicenseNumber = u.LicenseNumber,
                ApprovalStatus = (SmartCareCMS.API.DTOs.ApprovalStatus)u.ApprovalStatus,
                City = u.City,
                Qualifications = u.Qualifications,
                ExperienceYears = u.ExperienceYears,
                SatisfactionRate = u.SatisfactionRate,
                AvgTimePerPatient = u.AvgTimePerPatient,
                WaitTime = u.WaitTime,
                HospitalAddress = u.HospitalAddress,
                DoctorLink = u.DoctorLink,
                Fee = u.Fee
            }).ToList();

            return Ok(userDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var user = await _context.Users.Find(u => u.Id == id && !u.IsDeleted).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                Id = user.Id!,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = (SmartCareCMS.API.DTOs.UserRole)user.Role,
                Phone = user.Phone,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address,
                Specialization = user.Specialization,
                LicenseNumber = user.LicenseNumber,
                ApprovalStatus = (SmartCareCMS.API.DTOs.ApprovalStatus)user.ApprovalStatus,
            };

            return Ok(userDto);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveUser(string id, [FromBody] ApproveUserRequest request)
        {
            var user = await _context.Users.Find(u => u.Id == id && !u.IsDeleted).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return NotFound();
            }

            if (user.Role == SmartCareCMS.API.Models.UserRole.Patient)
            {
                return BadRequest("Patients do not require approval");
            }

            user.ApprovalStatus = SmartCareCMS.API.Models.ApprovalStatus.Approved;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.Users.ReplaceOneAsync(u => u.Id == id, user);

            // Send approval notification email
            await _emailService.SendApprovalNotificationAsync(
                user.Email, 
                user.Username, 
                request.TemporaryPassword ?? GenerateTemporaryPassword(), 
                user.Role.ToString()
            );

            return NoContent();
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectUser(string id)
        {
            var user = await _context.Users.Find(u => u.Id == id && !u.IsDeleted).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return NotFound();
            }

            if (user.Role == SmartCareCMS.API.Models.UserRole.Patient)
            {
                return BadRequest("Patients cannot be rejected as they don't require approval");
            }

            user.ApprovalStatus = SmartCareCMS.API.Models.ApprovalStatus.Rejected;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.Users.ReplaceOneAsync(u => u.Id == id, user);

            // Send rejection notification
            await _emailService.SendEmailAsync(
                user.Email,
                "Account Registration Rejected",
                $"<p>Hello {user.FullName},</p>" +
                $"<p>Your registration as a {user.Role} has been rejected by the administrator.</p>" +
                $"<p>If you believe this is an error, please contact the support team.</p>"
            );

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.Find(u => u.Id == id && !u.IsDeleted).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return NotFound();
            }

            // Soft delete - mark as deleted instead of removing from database
            user.IsDeleted = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.Users.ReplaceOneAsync(u => u.Id == id, user);

            return NoContent();
        }

        [HttpGet("pending-approvals")]
        public async Task<ActionResult<List<UserDto>>> GetPendingApprovals()
        {
            var users = await _context.Users
                .Find(u => u.ApprovalStatus == SmartCareCMS.API.Models.ApprovalStatus.Pending && u.Role != SmartCareCMS.API.Models.UserRole.Patient && !u.IsDeleted)
                .ToListAsync();
            
            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id!,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = (SmartCareCMS.API.DTOs.UserRole)u.Role,
                Phone = u.Phone,
                DateOfBirth = u.DateOfBirth,
                Address = u.Address,
                Specialization = u.Specialization,
                LicenseNumber = u.LicenseNumber,
                ApprovalStatus = (SmartCareCMS.API.DTOs.ApprovalStatus)u.ApprovalStatus
            }).ToList();

            return Ok(userDtos);
        }

        private string GenerateTemporaryPassword()
        {
            // Generate a random temporary password
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
            var stringChars = new char[10];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            return new String(stringChars);
        }
    }

    public class ApproveUserRequest
    {
        public string? TemporaryPassword { get; set; }
    }
}