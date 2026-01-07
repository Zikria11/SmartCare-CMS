using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Services;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;

        public AuthController(IAuthService authService, IEmailService emailService)
        {
            _authService = authService;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email) || 
                    string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.FullName))
                {
                    return BadRequest(new { message = "All required fields must be provided" });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new { message = "Password must be at least 6 characters long" });
                }

                // Check if email or username is unique
                var isEmailUnique = await _authService.IsEmailUniqueAsync(request.Email);
                if (!isEmailUnique)
                {
                    return BadRequest(new { message = "Email already exists" });
                }

                var isUsernameUnique = await _authService.IsUsernameUniqueAsync(request.Username);
                if (!isUsernameUnique)
                {
                    return BadRequest(new { message = "Username already exists" });
                }

                // Register the user
                var result = await _authService.RegisterAsync(request);

                // If the user is not a patient, send approval notification
                if ((SmartCareCMS.API.Models.UserRole)request.Role != SmartCareCMS.API.Models.UserRole.Patient)
                {
                    // For demonstration, we'll send a notification to the user
                    // In a real system, this would be sent when admin approves
                    await _emailService.SendEmailAsync(
                        request.Email,
                        "Registration Pending Approval",
                        $"<p>Hello {request.FullName},</p>" +
                        $"<p>Your registration as a {request.Role} is pending admin approval.</p>" +
                        $"<p>You will receive an email once your account is approved.</p>"
                    );
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _authService.LoginAsync(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}