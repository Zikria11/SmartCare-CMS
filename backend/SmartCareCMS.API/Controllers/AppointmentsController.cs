using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public AppointmentsController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<AppointmentDto>>> GetAppointments([FromQuery] string? userId = null, [FromQuery] string? role = null)
        {
            var filter = Builders<Appointment>.Filter.Empty;
            
            if (!string.IsNullOrEmpty(userId))
            {
                if (role == "Patient")
                {
                    filter = Builders<Appointment>.Filter.Eq(a => a.PatientId, userId);
                }
                else if (role == "Doctor")
                {
                    filter = Builders<Appointment>.Filter.Eq(a => a.DoctorId, userId);
                }
            }

            var appointments = await _context.Appointments.Find(filter).ToListAsync();
            
            var appointmentDtos = new List<AppointmentDto>();
            foreach (var appointment in appointments)
            {
                // Get patient and doctor names
                var patient = await _context.Users.Find(u => u.Id == appointment.PatientId).FirstOrDefaultAsync();
                var doctor = await _context.Users.Find(u => u.Id == appointment.DoctorId).FirstOrDefaultAsync();
                
                appointmentDtos.Add(new AppointmentDto
                {
                    Id = appointment.Id,
                    PatientId = appointment.PatientId,
                    PatientName = patient?.FullName ?? "Unknown",
                    DoctorId = appointment.DoctorId,
                    DoctorName = doctor?.FullName ?? "Unknown",
                    AppointmentDate = appointment.AppointmentDate,
                    StartTime = appointment.StartTime,
                    EndTime = appointment.EndTime,
                    Status = (SmartCareCMS.API.DTOs.AppointmentStatus)appointment.Status,
                    Reason = appointment.Reason,
                    Notes = appointment.Notes,
                    IsOnline = appointment.IsOnline,
                    ZoomMeetingUrl = appointment.ZoomMeetingUrl,
                    CreatedAt = appointment.CreatedAt,
                    UpdatedAt = appointment.UpdatedAt
                });
            }

            return Ok(appointmentDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(string id)
        {
            var appointment = await _context.Appointments.Find(a => a.Id == id).FirstOrDefaultAsync();
            
            if (appointment == null)
            {
                return NotFound();
            }

            // Get patient and doctor names
            var patient = await _context.Users.Find(u => u.Id == appointment.PatientId).FirstOrDefaultAsync();
            var doctor = await _context.Users.Find(u => u.Id == appointment.DoctorId).FirstOrDefaultAsync();

            var appointmentDto = new AppointmentDto
            {
                Id = appointment.Id,
                PatientId = appointment.PatientId,
                PatientName = patient?.FullName ?? "Unknown",
                DoctorId = appointment.DoctorId,
                DoctorName = doctor?.FullName ?? "Unknown",
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = (SmartCareCMS.API.DTOs.AppointmentStatus)appointment.Status,
                Reason = appointment.Reason,
                Notes = appointment.Notes,
                IsOnline = appointment.IsOnline,
                ZoomMeetingUrl = appointment.ZoomMeetingUrl,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };

            return Ok(appointmentDto);
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            // Verify patient and doctor exist
            var patient = await _context.Users.Find(u => u.Id == request.PatientId).FirstOrDefaultAsync();
            var doctor = await _context.Users.Find(u => u.Id == request.DoctorId).FirstOrDefaultAsync();

            if (patient == null || doctor == null)
            {
                return BadRequest("Patient or doctor not found");
            }

            // Check for scheduling conflicts
            var existingAppointment = await _context.Appointments
                .Find(a => a.DoctorId == request.DoctorId && 
                          a.AppointmentDate == request.AppointmentDate &&
                          ((a.StartTime < request.EndTime && a.EndTime > request.StartTime)))
                .FirstOrDefaultAsync();

            if (existingAppointment != null)
            {
                return BadRequest("Doctor is not available at the requested time");
            }

            var appointment = new Appointment
            {
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Reason = request.Reason,
                Notes = request.Notes,
                IsOnline = request.IsOnline
            };

            await _context.Appointments.InsertOneAsync(appointment);

            // Create appointment DTO with names
            var appointmentDto = new AppointmentDto
            {
                Id = appointment.Id,
                PatientId = appointment.PatientId,
                PatientName = patient.FullName,
                DoctorId = appointment.DoctorId,
                DoctorName = doctor.FullName,
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = (SmartCareCMS.API.DTOs.AppointmentStatus)appointment.Status,
                Reason = appointment.Reason,
                Notes = appointment.Notes,
                IsOnline = appointment.IsOnline,
                ZoomMeetingUrl = appointment.ZoomMeetingUrl,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };

            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointmentDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(string id, [FromBody] UpdateAppointmentRequest request)
        {
            var appointment = await _context.Appointments.Find(a => a.Id == id).FirstOrDefaultAsync();
            
            if (appointment == null)
            {
                return NotFound();
            }

            // Update only the fields that are provided in the request
            if (!string.IsNullOrEmpty(request.PatientId))
            {
                appointment.PatientId = request.PatientId;
            }
            
            if (!string.IsNullOrEmpty(request.DoctorId))
            {
                appointment.DoctorId = request.DoctorId;
            }
            
            if (request.AppointmentDate.HasValue)
            {
                appointment.AppointmentDate = request.AppointmentDate.Value;
            }
            
            if (request.StartTime.HasValue)
            {
                appointment.StartTime = request.StartTime.Value;
            }
            
            if (request.EndTime.HasValue)
            {
                appointment.EndTime = request.EndTime.Value;
            }
            
            if (request.Status.HasValue)
            {
                appointment.Status = (SmartCareCMS.API.Models.AppointmentStatus)request.Status.Value;
            }
            
            if (!string.IsNullOrEmpty(request.Reason))
            {
                appointment.Reason = request.Reason;
            }
            
            if (!string.IsNullOrEmpty(request.Notes))
            {
                appointment.Notes = request.Notes;
            }
            
            if (request.IsOnline.HasValue)
            {
                appointment.IsOnline = request.IsOnline.Value;
            }
            
            if (!string.IsNullOrEmpty(request.ZoomMeetingUrl))
            {
                appointment.ZoomMeetingUrl = request.ZoomMeetingUrl;
            }

            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.Appointments.ReplaceOneAsync(a => a.Id == id, appointment);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(string id)
        {
            var result = await _context.Appointments.DeleteOneAsync(a => a.Id == id);
            
            if (result.DeletedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("doctor/{doctorId}/availability")]
        public async Task<ActionResult<List<DateTime>>> GetDoctorAvailability(string doctorId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Get all appointments for the doctor in the specified date range
            var appointments = await _context.Appointments
                .Find(a => a.DoctorId == doctorId && 
                          a.AppointmentDate >= startDate && 
                          a.AppointmentDate <= endDate)
                .ToListAsync();

            // This is a simplified approach - in a real system you would have more sophisticated availability logic
            var availableSlots = new List<DateTime>();
            
            // For demonstration, return dates that don't have appointments
            var currentDate = startDate.Date;
            while (currentDate <= endDate.Date)
            {
                var dayAppointments = appointments.Where(a => a.AppointmentDate.Date == currentDate).ToList();
                if (dayAppointments.Count == 0)
                {
                    availableSlots.Add(currentDate);
                }
                currentDate = currentDate.AddDays(1);
            }

            return Ok(availableSlots);
        }
    }
}