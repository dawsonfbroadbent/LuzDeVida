using LuzDeVida.API.Data;
using LuzDeVida.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcessRecordingsController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;

    public ProcessRecordingsController(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all process recordings for a resident
    /// </summary>
    [HttpGet("resident/{residentId}")]
    public async Task<IActionResult> GetByResident(int residentId)
    {
        var recordings = await _context.process_recordings
            .Where(r => r.resident_id == residentId)
            .OrderByDescending(r => r.session_date)
            .ToListAsync();

        return Ok(recordings);
    }

    /// <summary>
    /// Get a single process recording by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var recording = await _context.process_recordings.FindAsync(id);
        if (recording == null)
            return NotFound(new { message = "Process recording not found" });

        return Ok(recording);
    }

    /// <summary>
    /// Create a new process recording
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] process_recording model)
    {
        if (model == null)
            return BadRequest(new { message = "Invalid process recording data" });

        _context.process_recordings.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = model.recording_id }, model);
    }

    /// <summary>
    /// Update an existing process recording
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] process_recording model)
    {
        var recording = await _context.process_recordings.FindAsync(id);
        if (recording == null)
            return NotFound(new { message = "Process recording not found" });

        if (model.session_narrative != null) recording.session_narrative = model.session_narrative;
        if (model.interventions_applied != null) recording.interventions_applied = model.interventions_applied;
        if (model.follow_up_actions != null) recording.follow_up_actions = model.follow_up_actions;
        if (model.emotional_state_end != null) recording.emotional_state_end = model.emotional_state_end;

        await _context.SaveChangesAsync();
        return Ok(recording);
    }
}
