using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.Models;
using SmartCareCMS.API.DTOs;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public DashboardController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats([FromQuery] string? userId = null, [FromQuery] string? role = null)
        {
            var stats = new DashboardStatsDto();

            // Get total counts
            stats.TotalUsers = (int)await _context.Users.CountDocumentsAsync(_ => true);
            stats.TotalAppointments = (int)await _context.Appointments.CountDocumentsAsync(_ => true);
            stats.TotalMedicalHistories = (int)await _context.MedicalHistories.CountDocumentsAsync(_ => true);
            stats.TotalLabReports = (int)await _context.LabReports.CountDocumentsAsync(_ => true);
            stats.TotalBillings = (int)await _context.Billings.CountDocumentsAsync(_ => true);

            // Get counts by role
            stats.PatientCount = (int)await _context.Users.CountDocumentsAsync(u => u.Role == Models.UserRole.Patient);
            stats.DoctorCount = (int)await _context.Users.CountDocumentsAsync(u => u.Role == Models.UserRole.Doctor);
            stats.ReceptionistCount = (int)await _context.Users.CountDocumentsAsync(u => u.Role == Models.UserRole.Receptionist);
            stats.LabTechnicianCount = (int)await _context.Users.CountDocumentsAsync(u => u.Role == Models.UserRole.LabTechnician);
            stats.AdminCount = (int)await _context.Users.CountDocumentsAsync(u => u.Role == Models.UserRole.Admin);

            // Get appointment stats
            var upcomingAppointmentsFilter = Builders<Appointment>.Filter.Gte(a => a.AppointmentDate, DateTime.UtcNow.Date);
            stats.UpcomingAppointments = (int)await _context.Appointments.CountDocumentsAsync(upcomingAppointmentsFilter);

            var todayAppointmentsFilter = Builders<Appointment>.Filter.And(
                Builders<Appointment>.Filter.Gte(a => a.AppointmentDate, DateTime.UtcNow.Date),
                Builders<Appointment>.Filter.Lt(a => a.AppointmentDate, DateTime.UtcNow.Date.AddDays(1))
            );
            stats.TodayAppointments = (int)await _context.Appointments.CountDocumentsAsync(todayAppointmentsFilter);

            // Get lab report stats
            var pendingLabReportsFilter = Builders<LabReport>.Filter.Eq(lr => lr.Status, Models.LabReportStatus.Pending);
            stats.PendingLabReports = (int)await _context.LabReports.CountDocumentsAsync(pendingLabReportsFilter);

            var completedLabReportsFilter = Builders<LabReport>.Filter.Eq(lr => lr.Status, Models.LabReportStatus.Completed);
            stats.CompletedLabReports = (int)await _context.LabReports.CountDocumentsAsync(completedLabReportsFilter);

            // Get billing stats
            var pendingBillingsFilter = Builders<Billing>.Filter.Eq(b => b.Status, Models.BillingStatus.Pending);
            var paidBillingsFilter = Builders<Billing>.Filter.Eq(b => b.Status, Models.BillingStatus.Paid);
            
            stats.PendingBillings = (int)await _context.Billings.CountDocumentsAsync(pendingBillingsFilter);
            stats.PaidBillings = (int)await _context.Billings.CountDocumentsAsync(paidBillingsFilter);

            // Calculate total revenue
            var allBillings = await _context.Billings.Find(_ => true).ToListAsync();
            stats.TotalRevenue = allBillings.Where(b => b.Status == Models.BillingStatus.Paid).Sum(b => b.Amount);

            // Role-specific stats if userId and role are provided
            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(role))
            {
                switch (role.ToLower())
                {
                    case "doctor":
                        stats.DoctorStats = await GetDoctorStats(userId);
                        break;
                    case "receptionist":
                        stats.ReceptionistStats = await GetReceptionistStats(userId);
                        break;
                    case "labtechnician":
                    case "lab_technician":
                        stats.LabTechStats = await GetLabTechStats(userId);
                        break;
                }
            }

            return Ok(stats);
        }

        private async Task<DoctorStatsDto> GetDoctorStats(string doctorId)
        {
            var stats = new DoctorStatsDto();

            // Get appointments for this doctor
            var doctorAppointmentsFilter = Builders<Appointment>.Filter.Eq(a => a.DoctorId, doctorId);
            var doctorAppointments = await _context.Appointments.Find(doctorAppointmentsFilter).ToListAsync();

            stats.TotalAppointments = doctorAppointments.Count;
            stats.CompletedAppointments = doctorAppointments.Count(a => a.Status == Models.AppointmentStatus.Completed);
            stats.TodayAppointments = doctorAppointments.Count(a => a.AppointmentDate.Date == DateTime.UtcNow.Date);

            // Get medical histories created by this doctor
            var medicalHistoriesFilter = Builders<MedicalHistory>.Filter.Eq(mh => mh.DoctorId, doctorId);
            stats.TotalMedicalHistories = (int)await _context.MedicalHistories.CountDocumentsAsync(medicalHistoriesFilter);

            return stats;
        }

        private async Task<ReceptionistStatsDto> GetReceptionistStats(string receptionistId)
        {
            var stats = new ReceptionistStatsDto();

            // Receptionist stats would typically involve appointments they've handled
            // For now, we'll just return a basic structure
            var appointmentsFilter = Builders<Appointment>.Filter.Empty; // In a real system, you might track who created appointments
            stats.TotalAppointmentsHandled = (int)await _context.Appointments.CountDocumentsAsync(appointmentsFilter);

            return stats;
        }

        private async Task<LabTechStatsDto> GetLabTechStats(string labTechId)
        {
            var stats = new LabTechStatsDto();

            // Get lab reports assigned to this lab tech
            var labReportsFilter = Builders<LabReport>.Filter.Eq(lr => lr.LabTechnicianId, labTechId);
            var labReports = await _context.LabReports.Find(labReportsFilter).ToListAsync();

            stats.TotalLabReports = labReports.Count;
            stats.PendingLabReports = labReports.Count(lr => lr.Status == Models.LabReportStatus.Pending);
            stats.CompletedLabReports = labReports.Count(lr => lr.Status == Models.LabReportStatus.Completed);

            return stats;
        }
    }

    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalMedicalHistories { get; set; }
        public int TotalLabReports { get; set; }
        public int TotalBillings { get; set; }
        public int PatientCount { get; set; }
        public int DoctorCount { get; set; }
        public int ReceptionistCount { get; set; }
        public int LabTechnicianCount { get; set; }
        public int AdminCount { get; set; }
        public int UpcomingAppointments { get; set; }
        public int TodayAppointments { get; set; }
        public int PendingLabReports { get; set; }
        public int CompletedLabReports { get; set; }
        public int PendingBillings { get; set; }
        public int PaidBillings { get; set; }
        public decimal TotalRevenue { get; set; }
        public DoctorStatsDto? DoctorStats { get; set; }
        public ReceptionistStatsDto? ReceptionistStats { get; set; }
        public LabTechStatsDto? LabTechStats { get; set; }
    }

    public class DoctorStatsDto
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int TodayAppointments { get; set; }
        public int TotalMedicalHistories { get; set; }
    }

    public class ReceptionistStatsDto
    {
        public int TotalAppointmentsHandled { get; set; }
    }

    public class LabTechStatsDto
    {
        public int TotalLabReports { get; set; }
        public int PendingLabReports { get; set; }
        public int CompletedLabReports { get; set; }
    }
}