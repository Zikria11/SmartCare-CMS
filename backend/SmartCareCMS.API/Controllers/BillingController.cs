using Microsoft.AspNetCore.Mvc;
using SmartCareCMS.API.Data;
using SmartCareCMS.API.DTOs;
using SmartCareCMS.API.Models;
using MongoDB.Driver;

namespace SmartCareCMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillingController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public BillingController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<BillingDto>>> GetBillings([FromQuery] string? patientId = null, [FromQuery] string? serviceType = null)
        {
            var filterBuilder = Builders<Billing>.Filter;
            var filters = new List<FilterDefinition<Billing>>();

            if (!string.IsNullOrEmpty(patientId))
            {
                filters.Add(filterBuilder.Eq(b => b.PatientId, patientId));
            }

            if (!string.IsNullOrEmpty(serviceType))
            {
                if (Enum.TryParse<SmartCareCMS.API.Models.ServiceType>(serviceType, true, out var serviceTypeEnum))
                {
                    filters.Add(filterBuilder.Eq(b => b.ServiceType, serviceTypeEnum));
                }
            }

            var filter = filters.Count > 0 
                ? filterBuilder.And(filters) 
                : filterBuilder.Empty;

            var billings = await _context.Billings.Find(filter).ToListAsync();
            
            var billingDtos = new List<BillingDto>();
            foreach (var billing in billings)
            {
                // Get patient name
                var patient = await _context.Users.Find(u => u.Id == billing.PatientId).FirstOrDefaultAsync();
                
                billingDtos.Add(new BillingDto
                {
                    Id = billing.Id,
                    PatientId = billing.PatientId,
                    PatientName = patient?.FullName ?? "Unknown",
                    AppointmentId = billing.AppointmentId,
                    LabReportId = billing.LabReportId,
                    ServiceType = (SmartCareCMS.API.DTOs.ServiceType)billing.ServiceType,
                    Description = billing.Description,
                    Amount = billing.Amount,
                    Currency = billing.Currency,
                    Status = (SmartCareCMS.API.DTOs.BillingStatus)billing.Status,
                    DueDate = billing.DueDate,
                    PaidDate = billing.PaidDate,
                    PaymentMethod = billing.PaymentMethod,
                    InvoiceNumber = billing.InvoiceNumber,
                    Notes = billing.Notes,
                    CreatedAt = billing.CreatedAt,
                    UpdatedAt = billing.UpdatedAt
                });
            }

            return Ok(billingDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BillingDto>> GetBilling(string id)
        {
            var billing = await _context.Billings.Find(b => b.Id == id).FirstOrDefaultAsync();
            
            if (billing == null)
            {
                return NotFound();
            }

            // Get patient name
            var patient = await _context.Users.Find(u => u.Id == billing.PatientId).FirstOrDefaultAsync();

            var billingDto = new BillingDto
            {
                Id = billing.Id,
                PatientId = billing.PatientId,
                PatientName = patient?.FullName ?? "Unknown",
                AppointmentId = billing.AppointmentId,
                LabReportId = billing.LabReportId,
                ServiceType = (SmartCareCMS.API.DTOs.ServiceType)billing.ServiceType,
                Description = billing.Description,
                Amount = billing.Amount,
                Currency = billing.Currency,
                Status = (SmartCareCMS.API.DTOs.BillingStatus)billing.Status,
                DueDate = billing.DueDate,
                PaidDate = billing.PaidDate,
                PaymentMethod = billing.PaymentMethod,
                InvoiceNumber = billing.InvoiceNumber,
                Notes = billing.Notes,
                CreatedAt = billing.CreatedAt,
                UpdatedAt = billing.UpdatedAt
            };

            return Ok(billingDto);
        }

        [HttpPost]
        public async Task<ActionResult<BillingDto>> CreateBilling([FromBody] CreateBillingRequest request)
        {
            // Verify patient exists
            var patient = await _context.Users.Find(u => u.Id == request.PatientId).FirstOrDefaultAsync();
            if (patient == null)
            {
                return BadRequest("Patient not found");
            }

            // Generate invoice number if not provided
            var invoiceNumber = string.IsNullOrEmpty(request.InvoiceNumber) 
                ? $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}"
                : request.InvoiceNumber;

            var billing = new Billing
            {
                PatientId = request.PatientId,
                AppointmentId = request.AppointmentId,
                LabReportId = request.LabReportId,
                ServiceType = (SmartCareCMS.API.Models.ServiceType)request.ServiceType,
                Description = request.Description,
                Amount = request.Amount,
                Currency = request.Currency,
                Status = SmartCareCMS.API.Models.BillingStatus.Pending,
                DueDate = request.DueDate,
                InvoiceNumber = invoiceNumber,
                Notes = request.Notes
            };

            await _context.Billings.InsertOneAsync(billing);

            // Create DTO with patient name
            var billingDto = new BillingDto
            {
                Id = billing.Id,
                PatientId = billing.PatientId,
                PatientName = patient.FullName,
                AppointmentId = billing.AppointmentId,
                LabReportId = billing.LabReportId,
                ServiceType = (SmartCareCMS.API.DTOs.ServiceType)billing.ServiceType,
                Description = billing.Description,
                Amount = billing.Amount,
                Currency = billing.Currency,
                Status = (SmartCareCMS.API.DTOs.BillingStatus)billing.Status,
                DueDate = billing.DueDate,
                PaidDate = billing.PaidDate,
                PaymentMethod = billing.PaymentMethod,
                InvoiceNumber = billing.InvoiceNumber,
                Notes = billing.Notes,
                CreatedAt = billing.CreatedAt,
                UpdatedAt = billing.UpdatedAt
            };

            return CreatedAtAction(nameof(GetBilling), new { id = billing.Id }, billingDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBilling(string id, [FromBody] UpdateBillingRequest request)
        {
            var billing = await _context.Billings.Find(b => b.Id == id).FirstOrDefaultAsync();
            
            if (billing == null)
            {
                return NotFound();
            }

            // Update only the fields that are provided in the request
            if (request.Status.HasValue)
            {
                billing.Status = (SmartCareCMS.API.Models.BillingStatus)request.Status.Value;
                
                // If status is paid, update the paid date
                if (request.Status.Value == SmartCareCMS.API.DTOs.BillingStatus.Paid && billing.Status == SmartCareCMS.API.Models.BillingStatus.Paid && !billing.PaidDate.HasValue)
                {
                    billing.PaidDate = DateTime.UtcNow;
                }
            }
            
            if (request.DueDate.HasValue && request.DueDate.Value != default(DateTime))
            {
                billing.DueDate = request.DueDate.Value;
            }
            
            if (!string.IsNullOrEmpty(request.PaymentMethod))
            {
                billing.PaymentMethod = request.PaymentMethod;
            }
            
            if (!string.IsNullOrEmpty(request.Notes))
            {
                billing.Notes = request.Notes;
            }

            billing.UpdatedAt = DateTime.UtcNow;

            await _context.Billings.ReplaceOneAsync(b => b.Id == id, billing);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBilling(string id)
        {
            var result = await _context.Billings.DeleteOneAsync(b => b.Id == id);
            
            if (result.DeletedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("{id}/payment")]
        public async Task<IActionResult> RecordPayment(string id, [FromBody] RecordPaymentRequest request)
        {
            var billing = await _context.Billings.Find(b => b.Id == id).FirstOrDefaultAsync();
            
            if (billing == null)
            {
                return NotFound();
            }

            // Update payment information
            billing.PaymentMethod = request.PaymentMethod;
            billing.PaidDate = DateTime.UtcNow;
            billing.Status = SmartCareCMS.API.Models.BillingStatus.Paid;

            billing.UpdatedAt = DateTime.UtcNow;

            await _context.Billings.ReplaceOneAsync(b => b.Id == id, billing);

            return NoContent();
        }

        [HttpGet("stats")]
        public async Task<ActionResult<BillingStatsDto>> GetBillingStats([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var filterBuilder = Builders<Billing>.Filter;
            var filters = new List<FilterDefinition<Billing>>();

            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;

            filters.Add(filterBuilder.Gte(b => b.CreatedAt, start));
            filters.Add(filterBuilder.Lte(b => b.CreatedAt, end));

            var filter = filterBuilder.And(filters);

            var billings = await _context.Billings.Find(filter).ToListAsync();

            var totalAmount = billings.Sum(b => b.Amount);
            var paidAmount = billings.Where(b => b.Status == SmartCareCMS.API.Models.BillingStatus.Paid).Sum(b => b.Amount);
            var pendingAmount = billings.Where(b => b.Status == SmartCareCMS.API.Models.BillingStatus.Pending).Sum(b => b.Amount);
            var overdueAmount = billings.Where(b => b.Status == SmartCareCMS.API.Models.BillingStatus.Overdue).Sum(b => b.Amount);

            var stats = new BillingStatsDto
            {
                TotalAmount = totalAmount,
                PaidAmount = paidAmount,
                PendingAmount = pendingAmount,
                OverdueAmount = overdueAmount,
                TotalBillings = billings.Count,
                PaidBillings = billings.Count(b => b.Status == SmartCareCMS.API.Models.BillingStatus.Paid),
                PendingBillings = billings.Count(b => b.Status == SmartCareCMS.API.Models.BillingStatus.Pending),
                OverdueBillings = billings.Count(b => b.Status == SmartCareCMS.API.Models.BillingStatus.Overdue),
                StartDate = start,
                EndDate = end
            };

            return Ok(stats);
        }
    }

    public class RecordPaymentRequest
    {
        public string PaymentMethod { get; set; } = string.Empty;
    }

    public class BillingStatsDto
    {
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal OverdueAmount { get; set; }
        public int TotalBillings { get; set; }
        public int PaidBillings { get; set; }
        public int PendingBillings { get; set; }
        public int OverdueBillings { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}