using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.Models;
using SmartCareCMS.API.DTOs;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QueueController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public QueueController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<QueueDto>> GetDoctorQueue(string doctorId)
        {
            // Get today's appointments for the doctor that are scheduled or confirmed
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var filter = Builders<Appointment>.Filter.And(
                Builders<Appointment>.Filter.Eq(a => a.DoctorId, doctorId),
                Builders<Appointment>.Filter.Gte(a => a.AppointmentDate, today),
                Builders<Appointment>.Filter.Lt(a => a.AppointmentDate, tomorrow),
                Builders<Appointment>.Filter.Or(
                    Builders<Appointment>.Filter.Eq(a => a.Status, Models.AppointmentStatus.Scheduled),
                    Builders<Appointment>.Filter.Eq(a => a.Status, Models.AppointmentStatus.Confirmed)
                )
            );

            var appointments = await _context.Appointments
                .Find(filter)
                .SortBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .ToListAsync();

            var queueItems = new List<QueueItemDto>();
            foreach (var appointment in appointments)
            {
                var patient = await _context.Users.Find(u => u.Id == appointment.PatientId).FirstOrDefaultAsync();
                
                queueItems.Add(new QueueItemDto
                {
                    AppointmentId = appointment.Id!,
                    PatientId = appointment.PatientId,
                    PatientName = patient?.FullName ?? "Unknown",
                    AppointmentDate = appointment.AppointmentDate,
                    StartTime = appointment.StartTime,
                    EndTime = appointment.EndTime,
                    Status = appointment.Status,
                    Reason = appointment.Reason,
                    IsOnline = appointment.IsOnline
                });
            }

            var queue = new QueueDto
            {
                DoctorId = doctorId,
                CurrentDateTime = DateTime.UtcNow,
                QueueItems = queueItems,
                TotalPatients = queueItems.Count,
                NextPatient = queueItems.FirstOrDefault()
            };

            return Ok(queue);
        }

        [HttpPost("doctor/{doctorId}/call-next")]
        public async Task<ActionResult<QueueItemDto>> CallNextPatient(string doctorId)
        {
            // Get today's appointments for the doctor that are scheduled or confirmed, ordered by time
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var filter = Builders<Appointment>.Filter.And(
                Builders<Appointment>.Filter.Eq(a => a.DoctorId, doctorId),
                Builders<Appointment>.Filter.Gte(a => a.AppointmentDate, today),
                Builders<Appointment>.Filter.Lt(a => a.AppointmentDate, tomorrow),
                Builders<Appointment>.Filter.Or(
                    Builders<Appointment>.Filter.Eq(a => a.Status, Models.AppointmentStatus.Scheduled),
                    Builders<Appointment>.Filter.Eq(a => a.Status, Models.AppointmentStatus.Confirmed)
                )
            );

            var appointment = await _context.Appointments
                .Find(filter)
                .SortBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .FirstOrDefaultAsync();

            if (appointment == null)
            {
                return Ok(new QueueItemDto()); // No patients in queue
            }

            // Update appointment status to indicate it's being called
            appointment.Status = Models.AppointmentStatus.Confirmed; // Or create a new status like "In Session"
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.Appointments.ReplaceOneAsync(a => a.Id == appointment.Id, appointment);

            var patient = await _context.Users.Find(u => u.Id == appointment.PatientId).FirstOrDefaultAsync();

            var queueItem = new QueueItemDto
            {
                AppointmentId = appointment.Id!,
                PatientId = appointment.PatientId,
                PatientName = patient?.FullName ?? "Unknown",
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                Reason = appointment.Reason,
                IsOnline = appointment.IsOnline
            };

            return Ok(queueItem);
        }

        [HttpPost("appointment/{appointmentId}/complete")]
        public async Task<IActionResult> CompleteAppointment(string appointmentId)
        {
            var appointment = await _context.Appointments.Find(a => a.Id == appointmentId).FirstOrDefaultAsync();
            
            if (appointment == null)
            {
                return NotFound();
            }

            appointment.Status = Models.AppointmentStatus.Completed;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.Appointments.ReplaceOneAsync(a => a.Id == appointmentId, appointment);

            return NoContent();
        }

        [HttpPost("appointment/{appointmentId}/cancel")]
        public async Task<IActionResult> CancelAppointment(string appointmentId)
        {
            var appointment = await _context.Appointments.Find(a => a.Id == appointmentId).FirstOrDefaultAsync();
            
            if (appointment == null)
            {
                return NotFound();
            }

            appointment.Status = Models.AppointmentStatus.Cancelled;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.Appointments.ReplaceOneAsync(a => a.Id == appointmentId, appointment);

            return NoContent();
        }
    }

    public class QueueDto
    {
        public string DoctorId { get; set; } = string.Empty;
        public DateTime CurrentDateTime { get; set; }
        public List<QueueItemDto> QueueItems { get; set; } = new List<QueueItemDto>();
        public int TotalPatients { get; set; }
        public QueueItemDto? NextPatient { get; set; }
    }

    public class QueueItemDto
    {
        public string? AppointmentId { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public SmartCareCMS.API.Models.AppointmentStatus Status { get; set; }
        public string Reason { get; set; } = string.Empty;
        public bool IsOnline { get; set; }
    }
}