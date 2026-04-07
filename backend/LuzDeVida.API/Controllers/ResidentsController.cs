using LuzDeVida.API.Data;
using LuzDeVida.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResidentsController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;

    public ResidentsController(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all residents with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? caseStatus = null,
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? caseCategory = null,
        [FromQuery] string? search = null)
    {
        var query = _context.residents.AsQueryable();

        if (!string.IsNullOrEmpty(caseStatus))
            query = query.Where(r => r.case_status == caseStatus);

        if (safehouseId.HasValue)
            query = query.Where(r => r.safehouse_id == safehouseId);

        if (!string.IsNullOrEmpty(caseCategory))
            query = query.Where(r => r.case_category == caseCategory);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(r =>
                (r.internal_code != null && r.internal_code.Contains(search)) ||
                (r.case_control_no != null && r.case_control_no.Contains(search)));

        var residents = await query.OrderByDescending(r => r.resident_id).ToListAsync();
        return Ok(residents);
    }

    /// <summary>
    /// Get a single resident by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var resident = await _context.residents.FindAsync(id);
        if (resident == null)
            return NotFound(new { message = "Resident not found" });

        return Ok(resident);
    }

    /// <summary>
    /// Create a new resident
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] resident model)
    {
        if (model == null)
            return BadRequest(new { message = "Invalid resident data" });

        _context.residents.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = model.resident_id }, model);
    }

    /// <summary>
    /// Update an existing resident
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] resident model)
    {
        var resident = await _context.residents.FindAsync(id);
        if (resident == null)
            return NotFound(new { message = "Resident not found" });

        // Update fields
        if (model.case_status != null) resident.case_status = model.case_status;
        if (model.case_category != null) resident.case_category = model.case_category;
        if (model.assigned_social_worker != null) resident.assigned_social_worker = model.assigned_social_worker;
        if (model.initial_risk_level != null) resident.initial_risk_level = model.initial_risk_level;
        if (model.current_risk_level != null) resident.current_risk_level = model.current_risk_level;
        if (model.reintegration_type != null) resident.reintegration_type = model.reintegration_type;
        if (model.reintegration_status != null) resident.reintegration_status = model.reintegration_status;

        await _context.SaveChangesAsync();
        return Ok(resident);
    }
}
