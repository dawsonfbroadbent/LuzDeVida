using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Data;
using LuzDeVida.API.Models;

namespace LuzDeVida.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // All resident endpoints require authentication
    public class ResidentsController : ControllerBase
    {
        private readonly LuzDeVidaDbContext _context;

        public ResidentsController(LuzDeVidaDbContext context)
        {
            _context = context;
        }

        // GET: api/residents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<resident>>> GetResidents()
        {
            var residents = await _context.residents
                .OrderBy(r => r.case_control_no)
                .ToListAsync();

            return Ok(residents);
        }

        // GET: api/residents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<resident>> GetResident(int id)
        {
            var resident = await _context.residents.FindAsync(id);

            if (resident == null)
            {
                return NotFound();
            }

            return Ok(resident);
        }

        // POST: api/residents
        [HttpPost]
        public async Task<ActionResult<resident>> PostResident(resident resident)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            try
            {
                var maxId = await _context.residents
                    .AsNoTracking()
                    .Select(r => (int?)r.resident_id)
                    .MaxAsync() ?? 0;

                resident.resident_id = maxId + 1;

                _context.residents.Add(resident);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetResident), new { id = resident.resident_id }, resident);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Failed to create resident: {ex.Message}");
            }
        }

        // PUT: api/residents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResident(int id, resident resident)
        {
            if (id != resident.resident_id)
            {
                return BadRequest();
            }

            _context.Entry(resident).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.residents.Any(e => e.resident_id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/residents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResident(int id)
        {
            var resident = await _context.residents.FindAsync(id);

            if (resident == null)
            {
                return NotFound();
            }

            _context.residents.Remove(resident);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}