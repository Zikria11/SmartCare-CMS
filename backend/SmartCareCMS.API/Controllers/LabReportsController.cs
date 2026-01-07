using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LabReportsController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public LabReportsController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<LabReportDto>>> GetLabReports([FromQuery] string? patientId = null, [FromQuery] string? labTechnicianId = null)
        {
            var filter = Builders<LabReport>.Filter.Empty;
            
            if (!string.IsNullOrEmpty(patientId))
            {
                filter = Builders<LabReport>.Filter.Eq(lr => lr.PatientId, patientId);
            }
            else if (!string.IsNullOrEmpty(labTechnicianId))
            {
                // Lab technicians can see reports they created or are assigned to
                filter = Builders<LabReport>.Filter.Or(
                    Builders<LabReport>.Filter.Eq(lr => lr.LabTechnicianId, labTechnicianId),
                    Builders<LabReport>.Filter.Eq(lr => lr.DoctorId, labTechnicianId) // In case they're also a doctor
                );
            }

            var labReports = await _context.LabReports.Find(filter).ToListAsync();
            
            var labReportDtos = new List<LabReportDto>();
            foreach (var report in labReports)
            {
                // Get patient, doctor, and lab technician names
                var patient = await _context.Users.Find(u => u.Id == report.PatientId).FirstOrDefaultAsync();
                var doctor = !string.IsNullOrEmpty(report.DoctorId) 
                    ? await _context.Users.Find(u => u.Id == report.DoctorId).FirstOrDefaultAsync() 
                    : null;
                var labTech = !string.IsNullOrEmpty(report.LabTechnicianId) 
                    ? await _context.Users.Find(u => u.Id == report.LabTechnicianId).FirstOrDefaultAsync() 
                    : null;
                
                labReportDtos.Add(new LabReportDto
                {
                    Id = report.Id,
                    PatientId = report.PatientId,
                    PatientName = patient?.FullName ?? "Unknown",
                    DoctorId = report.DoctorId,
                    DoctorName = doctor?.FullName,
                    LabTechnicianId = report.LabTechnicianId,
                    LabTechnicianName = labTech?.FullName,
                    ReportTitle = report.ReportTitle,
                    ReportType = report.ReportType,
                    ReportDate = report.ReportDate,
                    Results = report.Results,
                    Status = (SmartCareCMS.API.DTOs.LabReportStatus)report.Status,
                    Notes = report.Notes,
                    FileUrl = report.FileUrl,
                    IsShared = report.IsShared,
                    SharedWith = report.SharedWith,
                    BillingInfo = report.BillingInfo != null ? new BillingInfoDto
                    {
                        Amount = report.BillingInfo.Amount,
                        Currency = report.BillingInfo.Currency,
                        IsPaid = report.BillingInfo.IsPaid,
                        PaymentMethod = report.BillingInfo.PaymentMethod,
                        PaymentDate = report.BillingInfo.PaymentDate,
                        InvoiceNumber = report.BillingInfo.InvoiceNumber
                    } : null,
                    CreatedAt = report.CreatedAt,
                    UpdatedAt = report.UpdatedAt
                });
            }

            return Ok(labReportDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LabReportDto>> GetLabReport(string id)
        {
            var labReport = await _context.LabReports.Find(lr => lr.Id == id).FirstOrDefaultAsync();
            
            if (labReport == null)
            {
                return NotFound();
            }

            // Get patient, doctor, and lab technician names
            var patient = await _context.Users.Find(u => u.Id == labReport.PatientId).FirstOrDefaultAsync();
            var doctor = !string.IsNullOrEmpty(labReport.DoctorId) 
                ? await _context.Users.Find(u => u.Id == labReport.DoctorId).FirstOrDefaultAsync() 
                : null;
            var labTech = !string.IsNullOrEmpty(labReport.LabTechnicianId) 
                ? await _context.Users.Find(u => u.Id == labReport.LabTechnicianId).FirstOrDefaultAsync() 
                : null;

            var labReportDto = new LabReportDto
            {
                Id = labReport.Id,
                PatientId = labReport.PatientId,
                PatientName = patient?.FullName ?? "Unknown",
                DoctorId = labReport.DoctorId,
                DoctorName = doctor?.FullName,
                LabTechnicianId = labReport.LabTechnicianId,
                LabTechnicianName = labTech?.FullName,
                ReportTitle = labReport.ReportTitle,
                ReportType = labReport.ReportType,
                ReportDate = labReport.ReportDate,
                Results = labReport.Results,
                Status = (SmartCareCMS.API.DTOs.LabReportStatus)labReport.Status,
                Notes = labReport.Notes,
                FileUrl = labReport.FileUrl,
                IsShared = labReport.IsShared,
                SharedWith = labReport.SharedWith,
                BillingInfo = labReport.BillingInfo != null ? new BillingInfoDto
                {
                    Amount = labReport.BillingInfo.Amount,
                    Currency = labReport.BillingInfo.Currency,
                    IsPaid = labReport.BillingInfo.IsPaid,
                    PaymentMethod = labReport.BillingInfo.PaymentMethod,
                    PaymentDate = labReport.BillingInfo.PaymentDate,
                    InvoiceNumber = labReport.BillingInfo.InvoiceNumber
                } : null,
                CreatedAt = labReport.CreatedAt,
                UpdatedAt = labReport.UpdatedAt
            };

            return Ok(labReportDto);
        }

        [HttpPost]
        public async Task<ActionResult<LabReportDto>> CreateLabReport([FromBody] CreateLabReportRequest request)
        {
            // Verify patient exists
            var patient = await _context.Users.Find(u => u.Id == request.PatientId).FirstOrDefaultAsync();
            if (patient == null)
            {
                return BadRequest("Patient not found");
            }

            // Verify doctor exists if provided
            User? doctor = null;
            if (!string.IsNullOrEmpty(request.DoctorId))
            {
                doctor = await _context.Users.Find(u => u.Id == request.DoctorId).FirstOrDefaultAsync();
                if (doctor == null)
                {
                    return BadRequest("Doctor not found");
                }
            }

            // Verify lab technician exists if provided
            User? labTechnician = null;
            if (!string.IsNullOrEmpty(request.LabTechnicianId))
            {
                labTechnician = await _context.Users.Find(u => u.Id == request.LabTechnicianId).FirstOrDefaultAsync();
                if (labTechnician == null)
                {
                    return BadRequest("Lab technician not found");
                }
            }

            var labReport = new LabReport
            {
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                LabTechnicianId = request.LabTechnicianId,
                ReportTitle = request.ReportTitle,
                ReportType = request.ReportType,
                ReportDate = DateTime.UtcNow,
                Results = request.Results,
                Notes = request.Notes,
                FileUrl = request.FileUrl,
                Status = SmartCareCMS.API.Models.LabReportStatus.Pending, // Default to pending
                IsShared = request.IsShared,
                SharedWith = request.IsShared ? request.SharedWith : new List<string>(),
                BillingInfo = request.BillingInfo != null ? new BillingInfo
                {
                    Amount = request.BillingInfo.Amount,
                    Currency = request.BillingInfo.Currency,
                    IsPaid = request.BillingInfo.IsPaid,
                    PaymentMethod = request.BillingInfo.PaymentMethod,
                    PaymentDate = request.BillingInfo.PaymentDate,
                    InvoiceNumber = request.BillingInfo.InvoiceNumber
                } : null
            };

            await _context.LabReports.InsertOneAsync(labReport);

            // Create DTO with names
            var labReportDto = new LabReportDto
            {
                Id = labReport.Id,
                PatientId = labReport.PatientId,
                PatientName = patient.FullName,
                DoctorId = labReport.DoctorId,
                DoctorName = doctor?.FullName,
                LabTechnicianId = labReport.LabTechnicianId,
                LabTechnicianName = labTechnician?.FullName,
                ReportTitle = labReport.ReportTitle,
                ReportType = labReport.ReportType,
                ReportDate = labReport.ReportDate,
                Results = labReport.Results,
                Status = (SmartCareCMS.API.DTOs.LabReportStatus)labReport.Status,
                Notes = labReport.Notes,
                FileUrl = labReport.FileUrl,
                IsShared = labReport.IsShared,
                SharedWith = labReport.SharedWith,
                BillingInfo = labReport.BillingInfo != null ? new BillingInfoDto
                {
                    Amount = labReport.BillingInfo.Amount,
                    Currency = labReport.BillingInfo.Currency,
                    IsPaid = labReport.BillingInfo.IsPaid,
                    PaymentMethod = labReport.BillingInfo.PaymentMethod,
                    PaymentDate = labReport.BillingInfo.PaymentDate,
                    InvoiceNumber = labReport.BillingInfo.InvoiceNumber
                } : null,
                CreatedAt = labReport.CreatedAt,
                UpdatedAt = labReport.UpdatedAt
            };

            return CreatedAtAction(nameof(GetLabReport), new { id = labReport.Id }, labReportDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLabReport(string id, [FromBody] UpdateLabReportRequest request)
        {
            var labReport = await _context.LabReports.Find(lr => lr.Id == id).FirstOrDefaultAsync();
            
            if (labReport == null)
            {
                return NotFound();
            }

            // Update only the fields that are provided in the request
            if (!string.IsNullOrEmpty(request.ReportTitle))
            {
                labReport.ReportTitle = request.ReportTitle;
            }
            
            if (!string.IsNullOrEmpty(request.ReportType))
            {
                labReport.ReportType = request.ReportType;
            }
            
            if (request.Results != null)
            {
                labReport.Results = request.Results;
            }
            
            if (!string.IsNullOrEmpty(request.Notes))
            {
                labReport.Notes = request.Notes;
            }
            
            if (!string.IsNullOrEmpty(request.FileUrl))
            {
                labReport.FileUrl = request.FileUrl;
            }
            
            if (request.Status.HasValue)
            {
                labReport.Status = (SmartCareCMS.API.Models.LabReportStatus)request.Status.Value;
            }
            
            if (request.IsShared.HasValue)
            {
                labReport.IsShared = request.IsShared.Value;
                if (request.IsShared.Value && request.SharedWith != null)
                {
                    labReport.SharedWith = request.SharedWith;
                }
            }
            else if (request.SharedWith != null)
            {
                labReport.SharedWith = request.SharedWith;
            }
            
            if (request.BillingInfo != null)
            {
                labReport.BillingInfo = new BillingInfo
                {
                    Amount = request.BillingInfo.Amount,
                    Currency = request.BillingInfo.Currency,
                    IsPaid = request.BillingInfo.IsPaid,
                    PaymentMethod = request.BillingInfo.PaymentMethod,
                    PaymentDate = request.BillingInfo.PaymentDate,
                    InvoiceNumber = request.BillingInfo.InvoiceNumber
                };
            }

            labReport.UpdatedAt = DateTime.UtcNow;

            await _context.LabReports.ReplaceOneAsync(lr => lr.Id == id, labReport);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLabReport(string id)
        {
            var result = await _context.LabReports.DeleteOneAsync(lr => lr.Id == id);
            
            if (result.DeletedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("{id}/status")]
        public async Task<IActionResult> UpdateLabReportStatus(string id, [FromBody] SmartCareCMS.API.Models.LabReportStatus status)
        {
            var labReport = await _context.LabReports.Find(lr => lr.Id == id).FirstOrDefaultAsync();
            
            if (labReport == null)
            {
                return NotFound();
            }

            labReport.Status = status;
            labReport.UpdatedAt = DateTime.UtcNow;

            await _context.LabReports.ReplaceOneAsync(lr => lr.Id == id, labReport);

            return NoContent();
        }

        [HttpPost("{id}/share")]
        public async Task<IActionResult> ShareLabReport(string id, [FromBody] List<string> userIds)
        {
            var labReport = await _context.LabReports.Find(lr => lr.Id == id).FirstOrDefaultAsync();
            
            if (labReport == null)
            {
                return NotFound();
            }

            // Add the user IDs to the sharedWith list
            foreach (var userId in userIds)
            {
                if (!labReport.SharedWith.Contains(userId))
                {
                    labReport.SharedWith.Add(userId);
                }
            }

            labReport.IsShared = true;
            labReport.UpdatedAt = DateTime.UtcNow;

            await _context.LabReports.ReplaceOneAsync(lr => lr.Id == id, labReport);

            return NoContent();
        }
    }
}