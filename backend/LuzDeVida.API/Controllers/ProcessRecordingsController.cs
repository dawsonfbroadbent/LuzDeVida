using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Data;
using LuzDeVida.API.Models;

namespace LuzDeVida.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ProcessRecordingsController : ControllerBase
    {
        private readonly LuzDeVidaDbContext _context;

        public ProcessRecordingsController(LuzDeVidaDbContext context)
        {
            _context = context;
        }

        // GET: api/process-recordings
        // Optional query parameter: ?residentId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<process_recording>>> GetProcessRecordings([FromQuery] int? residentId)
        {
            IQueryable<process_recording> query = _context.process_recordings;

            if (residentId.HasValue)
            {
                query = query.Where(pr => pr.resident_id == residentId.Value);
            }

            var recordings = await query
                .OrderByDescending(pr => pr.session_date)
                .ToListAsync();

            return Ok(recordings);
        }

        // GET: api/process-recordings/resident/5
        [HttpGet("resident/{residentId}")]
        public async Task<ActionResult<IEnumerable<process_recording>>> GetProcessRecordingsByResident(int residentId)
        {
            var recordings = await _context.process_recordings
                .Where(pr => pr.resident_id == residentId)
                .OrderByDescending(pr => pr.session_date)
                .ToListAsync();

            return Ok(recordings);
        }

        // GET: api/process-recordings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<process_recording>> GetProcessRecording(int id)
        {
            var recording = await _context.process_recordings.FindAsync(id);

            if (recording == null)
            {
                return NotFound();
            }

            return Ok(recording);
        }

        // POST: api/process-recordings
        [HttpPost]
        public async Task<ActionResult<process_recording>> PostProcessRecording(process_recording recording)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            try
            {
                // Verify resident exists
                var resident = await _context.residents.FindAsync(recording.resident_id);

                if (resident == null)
                {
                    return BadRequest("Resident not found");
                }

                // Generate next recording ID
                var maxId = await _context.process_recordings
                    .AsNoTracking()
                    .Select(pr => (int?)pr.recording_id)
                    .MaxAsync() ?? 0;

                recording.recording_id = maxId + 1;

                _context.process_recordings.Add(recording);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(
                    nameof(GetProcessRecording),
                    new { id = recording.recording_id },
                    recording
                );
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Failed to create process recording: {ex.Message}");
            }
        }

        // PUT: api/process-recordings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProcessRecording(int id, process_recording recording)
        {
            if (id != recording.recording_id)
            {
                return BadRequest();
            }

            _context.Entry(recording).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.process_recordings.Any(e => e.recording_id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/process-recordings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProcessRecording(int id)
        {
            var recording = await _context.process_recordings.FindAsync(id);

            if (recording == null)
            {
                return NotFound();
            }

            _context.process_recordings.Remove(recording);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
