using LuzDeVida.API.Data;
using LuzDeVida.API.Models;
using LuzDeVida.API.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/supporters")]
[Authorize]
public class SupportersController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;

    public SupportersController(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    // Declared before {id:int} routes to avoid routing conflicts
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var totalSupporters = await _context.supporters.AsNoTracking().CountAsync();

            var activeSupporters = await _context.supporters
                .AsNoTracking()
                .CountAsync(s => s.status != null && s.status.ToLower() == "active");

            var totalMonetary = await _context.donations
                .AsNoTracking()
                .Where(d => d.donation_type == "monetary" && d.amount != null)
                .SumAsync(d => (decimal?)d.amount) ?? 0m;

            var recurringDonors = await _context.donations
                .AsNoTracking()
                .Where(d => d.is_recurring == true)
                .Select(d => d.supporter_id)
                .Distinct()
                .CountAsync();

            var inKindDonors = await _context.supporters
                .AsNoTracking()
                .CountAsync(s => s.supporter_type == "InKindDonor");

            var avgDonation = await _context.donations
                .AsNoTracking()
                .Where(d => d.donation_type == "monetary" && d.amount != null)
                .AverageAsync(d => (decimal?)d.amount) ?? 0m;

            return Ok(new SupporterStatsDto
            {
                TotalSupporters = totalSupporters,
                ActiveSupporters = activeSupporters,
                TotalMonetaryDonated = totalMonetary,
                RecurringDonorsCount = recurringDonors,
                InKindDonorsCount = inKindDonors,
                AvgDonation = Math.Round(avgDonation, 2),
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to load stats: {ex.Message}" });
        }
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetSupporterTypes()
    {
        try
        {
            var types = await _context.supporters
                .AsNoTracking()
                .Where(s => s.supporter_type != null)
                .Select(s => s.supporter_type!)
                .Distinct()
                .OrderBy(t => t)
                .ToListAsync();
            return Ok(types);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to load types: {ex.Message}" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetSupporters(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? supporter_type = null,
        [FromQuery] string? contribution_type = null,
        [FromQuery] string? region = null,
        [FromQuery] string? sortBy = "total_given",
        [FromQuery] string? sortDir = "desc")
    {
        try
        {
            var query = _context.supporters.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(x =>
                    (x.display_name != null && x.display_name.ToLower().Contains(s)) ||
                    (x.first_name != null && x.first_name.ToLower().Contains(s)) ||
                    (x.last_name != null && x.last_name.ToLower().Contains(s)) ||
                    (x.email != null && x.email.ToLower().Contains(s)));
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
                query = query.Where(x => x.status != null && x.status.ToLower() == status.ToLower());

            if (!string.IsNullOrWhiteSpace(supporter_type) && supporter_type != "All")
                query = query.Where(x => x.supporter_type != null && x.supporter_type.ToLower() == supporter_type.ToLower());

            if (!string.IsNullOrWhiteSpace(region) && region != "All")
                query = query.Where(x => x.region == region);

            if (!string.IsNullOrWhiteSpace(contribution_type) && contribution_type != "All")
                query = query.Where(x => x.donations.Any(d => d.donation_type == contribution_type));

            var totalCount = await query.CountAsync();

            bool desc = !string.Equals(sortDir, "asc", StringComparison.OrdinalIgnoreCase);

            IQueryable<supporter> sorted = (sortBy?.ToLower()) switch
            {
                "name" => desc
                    ? query.OrderByDescending(s => s.display_name).ThenByDescending(s => s.last_name)
                    : query.OrderBy(s => s.display_name).ThenBy(s => s.last_name),
                "type" => desc
                    ? query.OrderByDescending(s => s.supporter_type)
                    : query.OrderBy(s => s.supporter_type),
                "status" => desc
                    ? query.OrderByDescending(s => s.status)
                    : query.OrderBy(s => s.status),
                "total_given" => desc
                    ? query.OrderByDescending(s => s.donations
                        .Where(d => d.donation_type == "monetary")
                        .Sum(d => (decimal?)d.amount))
                    : query.OrderBy(s => s.donations
                        .Where(d => d.donation_type == "monetary")
                        .Sum(d => (decimal?)d.amount)),
                "last_donation" => desc
                    ? query.OrderByDescending(s => s.donations.Max(d => (DateOnly?)d.donation_date))
                    : query.OrderBy(s => s.donations.Max(d => (DateOnly?)d.donation_date)),
                "region" => desc
                    ? query.OrderByDescending(s => s.region)
                    : query.OrderBy(s => s.region),
                _ => desc
                    ? query.OrderByDescending(s => s.created_at)
                    : query.OrderBy(s => s.created_at),
            };

            var safePageSize = Math.Min(Math.Max(pageSize, 1), 9999);

            var items = await sorted
                .Skip((page - 1) * safePageSize)
                .Take(safePageSize)
                .Select(s => new SupporterListItemDto
                {
                    SupporterId = s.supporter_id,
                    DisplayName = s.display_name ?? ((s.first_name ?? "") + " " + (s.last_name ?? "")).Trim(),
                    SupporterType = s.supporter_type,
                    Status = s.status,
                    Region = s.region,
                    TotalGiven = s.donations
                        .Where(d => d.donation_type == "monetary")
                        .Sum(d => (decimal?)d.amount) ?? 0m,
                    InKindEstimatedValue = s.donations
                        .Sum(d => (decimal?)d.estimated_value) ?? 0m,
                    LastDonationDate = s.donations
                        .Max(d => (DateOnly?)d.donation_date),
                    ContributionTypes = s.donations
                        .Where(d => d.donation_type != null)
                        .Select(d => d.donation_type!)
                        .Distinct()
                        .ToList(),
                })
                .ToListAsync();

            return Ok(new SupporterPagedResultDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = safePageSize,
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to load supporters: {ex.Message}" });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSupporterById(int id)
    {
        var supporter = await _context.supporters
            .AsNoTracking()
            .Include(s => s.donations)
                .ThenInclude(d => d.donation_allocations)
            .Include(s => s.donations)
                .ThenInclude(d => d.in_kind_donation_items)
            .FirstOrDefaultAsync(s => s.supporter_id == id);

        if (supporter == null)
            return NotFound(new { message = "Supporter not found." });

        var dto = new SupporterDetailDto
        {
            SupporterId = supporter.supporter_id,
            SupporterType = supporter.supporter_type,
            DisplayName = supporter.display_name,
            OrganizationName = supporter.organization_name,
            FirstName = supporter.first_name,
            LastName = supporter.last_name,
            RelationshipType = supporter.relationship_type,
            Region = supporter.region,
            Country = supporter.country,
            Email = supporter.email,
            Phone = supporter.phone,
            Status = supporter.status,
            FirstDonationDate = supporter.first_donation_date,
            AcquisitionChannel = supporter.acquisition_channel,
            CreatedAt = supporter.created_at,
            Donations = supporter.donations.Select(d => new DonationDetailDto
            {
                DonationId = d.donation_id,
                DonationType = d.donation_type,
                DonationDate = d.donation_date,
                ChannelSource = d.channel_source,
                CurrencyCode = d.currency_code,
                Amount = d.amount,
                EstimatedValue = d.estimated_value,
                ImpactUnit = d.impact_unit,
                IsRecurring = d.is_recurring,
                CampaignName = d.campaign_name,
                Notes = d.notes,
                Allocations = d.donation_allocations.Select(a => new AllocationDto
                {
                    AllocationId = a.allocation_id,
                    SafehouseId = a.safehouse_id,
                    ProgramArea = a.program_area,
                    AmountAllocated = a.amount_allocated,
                    AllocationDate = a.allocation_date,
                    AllocationNotes = a.allocation_notes,
                }).ToList(),
                InKindItems = d.in_kind_donation_items.Select(i => new InKindItemDto
                {
                    ItemId = i.item_id,
                    ItemName = i.item_name,
                    ItemCategory = i.item_category,
                    Quantity = i.quantity,
                    UnitOfMeasure = i.unit_of_measure,
                    EstimatedUnitValue = i.estimated_unit_value,
                    IntendedUse = i.intended_use,
                    ReceivedCondition = i.received_condition,
                }).ToList(),
            }).OrderByDescending(d => d.DonationDate).ToList(),
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupporter([FromBody] CreateSupporterDto dto)
    {
        var resolvedName = dto.DisplayName ?? $"{dto.FirstName} {dto.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(resolvedName))
            return BadRequest(new { message = "A display name or first/last name is required." });

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var maxId = await _context.supporters
                .AsNoTracking()
                .MaxAsync(s => (int?)s.supporter_id) ?? 0;

            var newSupporter = new supporter
            {
                supporter_id = maxId + 1,
                supporter_type = dto.SupporterType,
                display_name = dto.DisplayName,
                organization_name = dto.OrganizationName,
                first_name = dto.FirstName,
                last_name = dto.LastName,
                relationship_type = dto.RelationshipType,
                region = dto.Region,
                country = dto.Country,
                email = dto.Email,
                phone = dto.Phone,
                status = dto.Status ?? "active",
                acquisition_channel = dto.AcquisitionChannel,
                created_at = DateTime.UtcNow,
            };

            _context.supporters.Add(newSupporter);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var result = new SupporterDetailDto
            {
                SupporterId = newSupporter.supporter_id,
                SupporterType = newSupporter.supporter_type,
                DisplayName = newSupporter.display_name,
                OrganizationName = newSupporter.organization_name,
                FirstName = newSupporter.first_name,
                LastName = newSupporter.last_name,
                RelationshipType = newSupporter.relationship_type,
                Region = newSupporter.region,
                Country = newSupporter.country,
                Email = newSupporter.email,
                Phone = newSupporter.phone,
                Status = newSupporter.status,
                AcquisitionChannel = newSupporter.acquisition_channel,
                CreatedAt = newSupporter.created_at,
            };

            return CreatedAtAction(nameof(GetSupporterById), new { id = newSupporter.supporter_id }, result);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = $"Failed to create supporter: {ex.Message}" });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSupporter(int id, [FromBody] UpdateSupporterDto dto)
    {
        var supporter = await _context.supporters.FindAsync(id);
        if (supporter == null)
            return NotFound(new { message = "Supporter not found." });

        supporter.supporter_type = dto.SupporterType;
        supporter.display_name = dto.DisplayName;
        supporter.organization_name = dto.OrganizationName;
        supporter.first_name = dto.FirstName;
        supporter.last_name = dto.LastName;
        supporter.relationship_type = dto.RelationshipType;
        supporter.region = dto.Region;
        supporter.country = dto.Country;
        supporter.email = dto.Email;
        supporter.phone = dto.Phone;
        supporter.status = dto.Status;
        supporter.acquisition_channel = dto.AcquisitionChannel;

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to update supporter: {ex.Message}" });
        }
    }
}
