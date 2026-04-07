using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Data;
using LuzDeVida.API.Models;

namespace LuzDeVida.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeVisitationsController : ControllerBase
    {
        private readonly LuzDeVidaDbContext _context;

        public HomeVisitationsController(LuzDeVidaDbContext context)
        {
            _context = context;
        }

        // GET: api/homevisitations?residentId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<home_visitation>>> GetHomeVisitations([FromQuery] int? residentId)
        {
            var query = _context.home_visitations.AsQueryable();

            if (residentId.HasValue)
            {
                query = query.Where(h => h.resident_id == residentId.Value);
            }

            var visits = await query
                .OrderByDescending(h => h.visit_date)
                .ToListAsync();

            return Ok(visits);
        }

        // GET: api/homevisitations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<home_visitation>> GetHomeVisitation(int id)
        {
            var visit = await _context.home_visitations.FindAsync(id);

            if (visit == null)
            {
                return NotFound();
            }

            return Ok(visit);
        }

        // POST: api/homevisitations
        [HttpPost]
        public async Task<ActionResult<home_visitation>> PostHomeVisitation(home_visitation visit)
        {
            _context.home_visitations.Add(visit);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHomeVisitation), new { id = visit.visitation_id }, visit);
        }

        // PUT: api/homevisitations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHomeVisitation(int id, home_visitation visit)
        {
            if (id != visit.visitation_id)
            {
                return BadRequest();
            }

            _context.Entry(visit).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.home_visitations.Any(e => e.visitation_id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/homevisitations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHomeVisitation(int id)
        {
            var visit = await _context.home_visitations.FindAsync(id);

            if (visit == null)
            {
                return NotFound();
            }

            _context.home_visitations.Remove(visit);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}