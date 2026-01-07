using Microsoft.IdentityModel.Tokens;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace SmartCareCMS.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> RegisterAsync(RegisterRequest request);
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<bool> IsEmailUniqueAsync(string email);
        Task<bool> IsUsernameUniqueAsync(string username);
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }

    public class AuthService : IAuthService
    {
        private readonly DatabaseContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(DatabaseContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if email or username already exists
            var existingUser = await _context.Users
                .Find(u => u.Email.ToLower() == request.Email.ToLower() || 
                          u.Username.ToLower() == request.Username.ToLower())
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                throw new InvalidOperationException("Email or username already exists");
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Determine approval status based on role
            var approvalStatus = request.Role == (DTOs.UserRole)Models.UserRole.Patient ? (DTOs.ApprovalStatus)Models.ApprovalStatus.Approved : (DTOs.ApprovalStatus)Models.ApprovalStatus.Pending;

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = (Models.UserRole)request.Role,
                FullName = request.FullName,
                Phone = request.Phone,
                DateOfBirth = request.DateOfBirth,
                Address = request.Address,
                Specialization = request.Specialization,
                LicenseNumber = request.LicenseNumber,
                ApprovalStatus = (Models.ApprovalStatus)approvalStatus
            };

            await _context.Users.InsertOneAsync(user);

            // Generate JWT token
            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            var userDto = new UserDto
            {
                Id = user.Id!,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = (DTOs.UserRole)user.Role,
                Phone = user.Phone,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address,
                Specialization = user.Specialization,
                LicenseNumber = user.LicenseNumber,
                ApprovalStatus = (DTOs.ApprovalStatus)user.ApprovalStatus
            };

            return new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                User = userDto
            };
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .Find(u => u.Email.ToLower() == request.Email.ToLower())
                .FirstOrDefaultAsync();

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            if (user.ApprovalStatus != Models.ApprovalStatus.Approved && user.Role != Models.UserRole.Patient)
            {
                throw new UnauthorizedAccessException("Account not approved yet. Please wait for admin approval.");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            var userDto = new UserDto
            {
                Id = user.Id!,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = (DTOs.UserRole)user.Role,
                Phone = user.Phone,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address,
                Specialization = user.Specialization,
                LicenseNumber = user.LicenseNumber,
                ApprovalStatus = (DTOs.ApprovalStatus)user.ApprovalStatus
            };

            return new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                User = userDto
            };
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            var existingUser = await _context.Users
                .Find(u => u.Email.ToLower() == email.ToLower())
                .FirstOrDefaultAsync();

            return existingUser == null;
        }

        public async Task<bool> IsUsernameUniqueAsync(string username)
        {
            var existingUser = await _context.Users
                .Find(u => u.Username.ToLower() == username.ToLower())
                .FirstOrDefaultAsync();

            return existingUser == null;
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"] ?? throw new ArgumentNullException("JwtSettings:Secret");
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, ((DTOs.UserRole)user.Role).ToString()),
                new Claim("UserId", user.Id!),
                new Claim("UserRole", ((DTOs.UserRole)user.Role).ToString()),
                new Claim("Username", user.Username)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"] ?? throw new ArgumentNullException("JwtSettings:Secret");

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
                ClockSkew = TimeSpan.Zero
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }
    }
}