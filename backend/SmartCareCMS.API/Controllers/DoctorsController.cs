using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using MongoDB.Driver;
using CsvHelper;
using System.Globalization;
using CsvHelper.Configuration;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public DoctorsController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpPost("import-csv")]
        public async Task<IActionResult> ImportDoctorsFromCsv()
        {
            string[] possiblePaths = {
                Path.Combine(Directory.GetCurrentDirectory(), "doctors.csv"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "doctors.csv"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "doctors.csv"),
                "D:\\New folder (5)\\smartcare-health-hub-main\\doctors.csv"
            };

            string? filePath = possiblePaths.FirstOrDefault(System.IO.File.Exists);

            if (filePath == null)
            {
                return NotFound("doctors.csv not found in any expected directory.");
            }

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                HeaderValidated = null,
                PrepareHeaderForMatch = args => args.Header.Trim()
            };

            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, config))
            {
                var records = csv.GetRecords<dynamic>().ToList();
                int importedCount = 0;
                int skippedCount = 0;

                foreach (var record in records)
                {
                    var dict = (IDictionary<string, object>)record;
                    string city = dict.ContainsKey("City") ? dict["City"]?.ToString() ?? "" : "";
                    
                    if (city.Equals("Islamabad", StringComparison.OrdinalIgnoreCase) || 
                        city.Equals("Rawalpindi", StringComparison.OrdinalIgnoreCase))
                    {
                        string fullName = dict.ContainsKey("Doctor Name") ? dict["Doctor Name"]?.ToString() ?? "" : "Unknown Doctor";
                        string email = fullName.Replace(" ", ".").ToLower() + "@smartcare.com";
                        
                        // Check if doctor already exists by email
                        var existingDoctor = await _context.Users
                            .Find(u => u.Email == email)
                            .FirstOrDefaultAsync();

                        if (existingDoctor == null)
                        {
                            var doctor = new User
                            {
                                FullName = fullName,
                                Username = fullName.Replace(" ", "").ToLower(),
                                Email = email,
                                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), // Default password
                                Role = Models.UserRole.Doctor,
                                ApprovalStatus = Models.ApprovalStatus.Approved,
                                City = city,
                                Specialization = dict.ContainsKey("Specialization") ? dict["Specialization"]?.ToString() : null,
                                Qualifications = dict.ContainsKey("Doctor Qualification") ? dict["Doctor Qualification"]?.ToString() : null,
                                ExperienceYears = dict.ContainsKey("Experience(Years)") && double.TryParse(dict["Experience(Years)"]?.ToString(), out var exp) ? exp : 0,
                                SatisfactionRate = dict.ContainsKey("Patient Satisfaction Rate(%age)") && double.TryParse(dict["Patient Satisfaction Rate(%age)"]?.ToString(), out var sat) ? sat : 0,
                                AvgTimePerPatient = dict.ContainsKey("Avg Time to Patients(mins)") && double.TryParse(dict["Avg Time to Patients(mins)"]?.ToString(), out var avg) ? avg : 0,
                                WaitTime = dict.ContainsKey("Wait Time(mins)") && double.TryParse(dict["Wait Time(mins)"]?.ToString(), out var wait) ? wait : 0,
                                HospitalAddress = dict.ContainsKey("Hospital Address") ? dict["Hospital Address"]?.ToString() : null,
                                DoctorLink = dict.ContainsKey("Doctors Link") ? dict["Doctors Link"]?.ToString() : null,
                                Fee = dict.ContainsKey("Fee(PKR)") && double.TryParse(dict["Fee(PKR)"]?.ToString(), out var fee) ? fee : 0,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                IsDeleted = false
                            };

                            await _context.Users.InsertOneAsync(doctor);
                            importedCount++;
                        }
                        else
                        {
                            skippedCount++;
                        }
                    }
                }

                return Ok(new { Message = $"Import completed. Imported: {importedCount}, Skipped: {skippedCount}" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetDoctors([FromQuery] string? city, [FromQuery] string? specialization)
        {
            var filterBuilder = Builders<User>.Filter;
            var filters = new List<FilterDefinition<User>>();

            filters.Add(filterBuilder.Eq(u => u.Role, Models.UserRole.Doctor));
            filters.Add(filterBuilder.Eq(u => u.IsDeleted, false));

            if (!string.IsNullOrEmpty(city))
            {
                filters.Add(filterBuilder.Regex(u => u.City, new MongoDB.Bson.BsonRegularExpression(city, "i")));
            }

            if (!string.IsNullOrEmpty(specialization))
            {
                filters.Add(filterBuilder.Regex(u => u.Specialization, new MongoDB.Bson.BsonRegularExpression(specialization, "i")));
            }

            var filter = filterBuilder.And(filters);
            var doctors = await _context.Users.Find(filter).ToListAsync();

            var doctorDtos = doctors.Select(u => new UserDto
            {
                Id = u.Id!,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = (DTOs.UserRole)u.Role,
                Phone = u.Phone,
                DateOfBirth = u.DateOfBirth,
                Address = u.Address,
                Specialization = u.Specialization,
                LicenseNumber = u.LicenseNumber,
                City = u.City,
                ExperienceYears = u.ExperienceYears,
                Qualifications = u.Qualifications,
                SatisfactionRate = u.SatisfactionRate,
                AvgTimePerPatient = u.AvgTimePerPatient,
                WaitTime = u.WaitTime,
                HospitalAddress = u.HospitalAddress,
                DoctorLink = u.DoctorLink,
                Fee = u.Fee,
                ApprovalStatus = (DTOs.ApprovalStatus)u.ApprovalStatus
            }).ToList();

            return Ok(doctorDtos);
        }

        [HttpPost("dedupe")]
        public async Task<IActionResult> DedupeDoctors()
        {
            var filterBuilder = Builders<User>.Filter;
            var doctorFilter = filterBuilder.Eq(u => u.Role, Models.UserRole.Doctor);

            var doctors = await _context.Users.Find(doctorFilter).ToListAsync();

            var groups = new Dictionary<string, List<User>>(StringComparer.OrdinalIgnoreCase);

            foreach (var d in doctors)
            {
                string key = !string.IsNullOrWhiteSpace(d.Email) ? d.Email.Trim().ToLowerInvariant() : d.FullName.Trim().ToLowerInvariant();
                if (!groups.ContainsKey(key)) groups[key] = new List<User>();
                groups[key].Add(d);
            }

            int totalRemoved = 0;
            var idsToRemove = new List<string>();

            foreach (var kv in groups)
            {
                var list = kv.Value.OrderBy(u => u.CreatedAt).ToList();
                if (list.Count <= 1) continue;

                // Keep the earliest created document, remove the rest
                var keep = list.First();
                var duplicates = list.Skip(1).Select(u => u.Id).Where(id => id != null).ToList()!;
                if (duplicates.Count > 0)
                {
                    idsToRemove.AddRange(duplicates!);
                    totalRemoved += duplicates.Count;
                }
            }

            if (idsToRemove.Count > 0)
            {
                var deleteFilter = Builders<User>.Filter.In(u => u.Id, idsToRemove);
                await _context.Users.DeleteManyAsync(deleteFilter);
            }

            return Ok(new { Message = "Dedupe completed.", Removed = totalRemoved, RemainingDoctorCount = (await _context.Users.CountDocumentsAsync(doctorFilter)) });
        }

        [HttpGet("duplicates-preview")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PreviewDuplicateDoctors()
        {
            var filterBuilder = Builders<User>.Filter;
            var doctorFilter = filterBuilder.Eq(u => u.Role, Models.UserRole.Doctor);

            var doctors = await _context.Users.Find(doctorFilter).ToListAsync();

            var groups = doctors
                .GroupBy(d => !string.IsNullOrWhiteSpace(d.Email) ? d.Email.Trim().ToLowerInvariant() : d.FullName.Trim().ToLowerInvariant())
                .Where(g => g.Count() > 1)
                .Select(g => new
                {
                    Key = g.Key,
                    Count = g.Count(),
                    Docs = g.OrderBy(u => u.CreatedAt).Select(u => new {
                        Id = u.Id,
                        u.FullName,
                        u.Email,
                        u.Username,
                        u.City,
                        u.CreatedAt
                    }).ToList()
                })
                .ToList();

            return Ok(groups);
        }

        [HttpPost("delete-duplicates")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSelectedDuplicates([FromBody] List<string> ids)
        {
            if (ids == null || ids.Count == 0) return BadRequest("No ids provided.");

            // Archive documents before deletion
            var filter = Builders<User>.Filter.In(u => u.Id, ids);
            var docs = await _context.Users.Find(filter).ToListAsync();
            if (docs.Count == 0) return NotFound("No matching documents found.");

            var archiveColl = _context.Appointments.Database.GetCollection<User>("archivedUsers");
            try
            {
                if (docs.Count > 0)
                {
                    await archiveColl.InsertManyAsync(docs);
                }
            }
            catch
            {
                // ignore archive failures, proceed to delete
            }

            var deleteResult = await _context.Users.DeleteManyAsync(filter);

            return Ok(new { Deleted = deleteResult.DeletedCount });
        }
    }
}
