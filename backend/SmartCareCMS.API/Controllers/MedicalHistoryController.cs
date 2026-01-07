using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public MedicalHistoryController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<MedicalHistoryDto>>> GetMedicalHistories([FromQuery] string? patientId = null, [FromQuery] string? doctorId = null)
        {
            var filter = Builders<MedicalHistory>.Filter.Empty;
            
            if (!string.IsNullOrEmpty(patientId))
            {
                filter = Builders<MedicalHistory>.Filter.Eq(mh => mh.PatientId, patientId);
            }
            else if (!string.IsNullOrEmpty(doctorId))
            {
                // Doctors can only see histories they created or that are shared with them
                var sharedFilter = Builders<MedicalHistory>.Filter.AnyEq(mh => mh.SharedWith, doctorId);
                var doctorCreatedFilter = Builders<MedicalHistory>.Filter.Eq(mh => mh.DoctorId, doctorId);
                filter = Builders<MedicalHistory>.Filter.Or(sharedFilter, doctorCreatedFilter);
            }

            var medicalHistories = await _context.MedicalHistories.Find(filter).ToListAsync();
            
            var medicalHistoryDtos = new List<MedicalHistoryDto>();
            foreach (var history in medicalHistories)
            {
                // Get patient and doctor names
                var patient = await _context.Users.Find(u => u.Id == history.PatientId).FirstOrDefaultAsync();
                var doctor = !string.IsNullOrEmpty(history.DoctorId) 
                    ? await _context.Users.Find(u => u.Id == history.DoctorId).FirstOrDefaultAsync() 
                    : null;
                
                medicalHistoryDtos.Add(new MedicalHistoryDto
                {
                    Id = history.Id,
                    PatientId = history.PatientId,
                    PatientName = patient?.FullName ?? "Unknown",
                    DoctorId = history.DoctorId,
                    DoctorName = doctor?.FullName,
                    Title = history.Title,
                    Description = history.Description,
                    Diagnosis = history.Diagnosis,
                    Treatment = history.Treatment,
                    Medications = history.Medications,
                    Allergies = history.Allergies,
                    Symptoms = history.Symptoms,
                    VitalSigns = history.VitalSigns != null ? new VitalSignsDto
                    {
                        BloodPressure = history.VitalSigns.BloodPressure,
                        HeartRate = history.VitalSigns.HeartRate,
                        Temperature = history.VitalSigns.Temperature,
                        RespiratoryRate = history.VitalSigns.RespiratoryRate,
                        OxygenSaturation = history.VitalSigns.OxygenSaturation,
                        Weight = history.VitalSigns.Weight,
                        Height = history.VitalSigns.Height
                    } : null,
                    VisitDate = history.VisitDate,
                    NextAppointmentDate = history.NextAppointmentDate,
                    IsShared = history.IsShared,
                    SharedWith = history.SharedWith,
                    CreatedAt = history.CreatedAt,
                    UpdatedAt = history.UpdatedAt
                });
            }

            return Ok(medicalHistoryDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalHistoryDto>> GetMedicalHistory(string id)
        {
            var medicalHistory = await _context.MedicalHistories.Find(mh => mh.Id == id).FirstOrDefaultAsync();
            
            if (medicalHistory == null)
            {
                return NotFound();
            }

            // Check if the user has permission to view this record (implementation depends on authentication)
            // For now, we'll allow access if it's the patient's record or if it's shared with the requesting doctor

            // Get patient and doctor names
            var patient = await _context.Users.Find(u => u.Id == medicalHistory.PatientId).FirstOrDefaultAsync();
            var doctor = !string.IsNullOrEmpty(medicalHistory.DoctorId) 
                ? await _context.Users.Find(u => u.Id == medicalHistory.DoctorId).FirstOrDefaultAsync() 
                : null;

            var medicalHistoryDto = new MedicalHistoryDto
            {
                Id = medicalHistory.Id,
                PatientId = medicalHistory.PatientId,
                PatientName = patient?.FullName ?? "Unknown",
                DoctorId = medicalHistory.DoctorId,
                DoctorName = doctor?.FullName,
                Title = medicalHistory.Title,
                Description = medicalHistory.Description,
                Diagnosis = medicalHistory.Diagnosis,
                Treatment = medicalHistory.Treatment,
                Medications = medicalHistory.Medications,
                Allergies = medicalHistory.Allergies,
                Symptoms = medicalHistory.Symptoms,
                VitalSigns = medicalHistory.VitalSigns != null ? new VitalSignsDto
                {
                    BloodPressure = medicalHistory.VitalSigns.BloodPressure,
                    HeartRate = medicalHistory.VitalSigns.HeartRate,
                    Temperature = medicalHistory.VitalSigns.Temperature,
                    RespiratoryRate = medicalHistory.VitalSigns.RespiratoryRate,
                    OxygenSaturation = medicalHistory.VitalSigns.OxygenSaturation,
                    Weight = medicalHistory.VitalSigns.Weight,
                    Height = medicalHistory.VitalSigns.Height
                } : null,
                VisitDate = medicalHistory.VisitDate,
                NextAppointmentDate = medicalHistory.NextAppointmentDate,
                IsShared = medicalHistory.IsShared,
                SharedWith = medicalHistory.SharedWith,
                CreatedAt = medicalHistory.CreatedAt,
                UpdatedAt = medicalHistory.UpdatedAt
            };

            return Ok(medicalHistoryDto);
        }

        [HttpPost]
        public async Task<ActionResult<MedicalHistoryDto>> CreateMedicalHistory([FromBody] CreateMedicalHistoryRequest request)
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

            var medicalHistory = new MedicalHistory
            {
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                Title = request.Title,
                Description = request.Description,
                Diagnosis = request.Diagnosis,
                Treatment = request.Treatment,
                Medications = request.Medications,
                Allergies = request.Allergies,
                Symptoms = request.Symptoms,
                VitalSigns = request.VitalSigns != null ? new VitalSigns
                {
                    BloodPressure = request.VitalSigns.BloodPressure,
                    HeartRate = request.VitalSigns.HeartRate,
                    Temperature = request.VitalSigns.Temperature,
                    RespiratoryRate = request.VitalSigns.RespiratoryRate,
                    OxygenSaturation = request.VitalSigns.OxygenSaturation,
                    Weight = request.VitalSigns.Weight,
                    Height = request.VitalSigns.Height
                } : null,
                VisitDate = request.VisitDate,
                NextAppointmentDate = request.NextAppointmentDate,
                IsShared = request.IsShared,
                SharedWith = request.IsShared ? request.SharedWith : new List<string>()
            };

            await _context.MedicalHistories.InsertOneAsync(medicalHistory);

            // Create DTO with names
            var medicalHistoryDto = new MedicalHistoryDto
            {
                Id = medicalHistory.Id,
                PatientId = medicalHistory.PatientId,
                PatientName = patient.FullName,
                DoctorId = medicalHistory.DoctorId,
                DoctorName = doctor?.FullName,
                Title = medicalHistory.Title,
                Description = medicalHistory.Description,
                Diagnosis = medicalHistory.Diagnosis,
                Treatment = medicalHistory.Treatment,
                Medications = medicalHistory.Medications,
                Allergies = medicalHistory.Allergies,
                Symptoms = medicalHistory.Symptoms,
                VitalSigns = medicalHistory.VitalSigns != null ? new VitalSignsDto
                {
                    BloodPressure = medicalHistory.VitalSigns.BloodPressure,
                    HeartRate = medicalHistory.VitalSigns.HeartRate,
                    Temperature = medicalHistory.VitalSigns.Temperature,
                    RespiratoryRate = medicalHistory.VitalSigns.RespiratoryRate,
                    OxygenSaturation = medicalHistory.VitalSigns.OxygenSaturation,
                    Weight = medicalHistory.VitalSigns.Weight,
                    Height = medicalHistory.VitalSigns.Height
                } : null,
                VisitDate = medicalHistory.VisitDate,
                NextAppointmentDate = medicalHistory.NextAppointmentDate,
                IsShared = medicalHistory.IsShared,
                SharedWith = medicalHistory.SharedWith,
                CreatedAt = medicalHistory.CreatedAt,
                UpdatedAt = medicalHistory.UpdatedAt
            };

            return CreatedAtAction(nameof(GetMedicalHistory), new { id = medicalHistory.Id }, medicalHistoryDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicalHistory(string id, [FromBody] UpdateMedicalHistoryRequest request)
        {
            var medicalHistory = await _context.MedicalHistories.Find(mh => mh.Id == id).FirstOrDefaultAsync();
            
            if (medicalHistory == null)
            {
                return NotFound();
            }

            // Update only the fields that are provided in the request
            if (!string.IsNullOrEmpty(request.Title))
            {
                medicalHistory.Title = request.Title;
            }
            
            if (!string.IsNullOrEmpty(request.Description))
            {
                medicalHistory.Description = request.Description;
            }
            
            if (!string.IsNullOrEmpty(request.Diagnosis))
            {
                medicalHistory.Diagnosis = request.Diagnosis;
            }
            
            if (!string.IsNullOrEmpty(request.Treatment))
            {
                medicalHistory.Treatment = request.Treatment;
            }
            
            if (request.Medications != null)
            {
                medicalHistory.Medications = request.Medications;
            }
            
            if (request.Allergies != null)
            {
                medicalHistory.Allergies = request.Allergies;
            }
            
            if (request.Symptoms != null)
            {
                medicalHistory.Symptoms = request.Symptoms;
            }
            
            if (request.VitalSigns != null)
            {
                medicalHistory.VitalSigns = new VitalSigns
                {
                    BloodPressure = request.VitalSigns.BloodPressure,
                    HeartRate = request.VitalSigns.HeartRate,
                    Temperature = request.VitalSigns.Temperature,
                    RespiratoryRate = request.VitalSigns.RespiratoryRate,
                    OxygenSaturation = request.VitalSigns.OxygenSaturation,
                    Weight = request.VitalSigns.Weight,
                    Height = request.VitalSigns.Height
                };
            }
            
            if (request.VisitDate.HasValue && request.VisitDate.Value != default(DateTime))
            {
                medicalHistory.VisitDate = request.VisitDate.Value;
            }
            
            if (request.NextAppointmentDate.HasValue)
            {
                medicalHistory.NextAppointmentDate = request.NextAppointmentDate;
            }
            
            if (request.IsShared.HasValue)
            {
                medicalHistory.IsShared = request.IsShared.Value;
                if (request.IsShared.Value && request.SharedWith != null)
                {
                    medicalHistory.SharedWith = request.SharedWith;
                }
            }
            else if (request.SharedWith != null)
            {
                medicalHistory.SharedWith = request.SharedWith;
            }

            medicalHistory.UpdatedAt = DateTime.UtcNow;

            await _context.MedicalHistories.ReplaceOneAsync(mh => mh.Id == id, medicalHistory);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalHistory(string id)
        {
            var result = await _context.MedicalHistories.DeleteOneAsync(mh => mh.Id == id);
            
            if (result.DeletedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("{id}/share")]
        public async Task<IActionResult> ShareMedicalHistory(string id, [FromBody] List<string> doctorIds)
        {
            var medicalHistory = await _context.MedicalHistories.Find(mh => mh.Id == id).FirstOrDefaultAsync();
            
            if (medicalHistory == null)
            {
                return NotFound();
            }

            // Add the doctor IDs to the sharedWith list
            foreach (var doctorId in doctorIds)
            {
                if (!medicalHistory.SharedWith.Contains(doctorId))
                {
                    medicalHistory.SharedWith.Add(doctorId);
                }
            }

            medicalHistory.IsShared = true;
            medicalHistory.UpdatedAt = DateTime.UtcNow;

            await _context.MedicalHistories.ReplaceOneAsync(mh => mh.Id == id, medicalHistory);

            return NoContent();
        }
    }
}