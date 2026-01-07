using MailKit.Net.Smtp;
using MimeKit;

namespace SmartCareCMS.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendApprovalNotificationAsync(string toEmail, string username, string password, string role);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration["EmailSettings:FromEmail"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart("html") { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"], 
                int.Parse(_configuration["EmailSettings:Port"] ?? "587"), 
                MailKit.Security.SecureSocketOptions.StartTls
            );
            
            await smtp.AuthenticateAsync(
                _configuration["EmailSettings:Username"], 
                _configuration["EmailSettings:Password"]
            );
            
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        public async Task SendApprovalNotificationAsync(string toEmail, string username, string password, string role)
        {
            var subject = "Account Approved - SmartCare CMS";
            var body = $@"
            <html>
            <body>
                <h2>Your Account Has Been Approved!</h2>
                <p>Dear {username},</p>
                <p>Your account as a <strong>{role}</strong> has been approved by the administrator.</p>
                <p>You can now login to the SmartCare CMS system using the following credentials:</p>
                <ul>
                    <li><strong>Username:</strong> {username}</li>
                    <li><strong>Password:</strong> {password}</li>
                </ul>
                <p>Please login and change your password immediately for security reasons.</p>
                <p>Best regards,<br/>SmartCare CMS Team</p>
            </body>
            </html>";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}