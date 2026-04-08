using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Data;
using LuzDeVida.API.Models;

namespace LuzDeVida.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterventionPlansController : ControllerBase
    {
        private readonly LuzDeVidaDbContext _context;

        public InterventionPlansController(LuzDeVidaDbContext context)
        {
            _context = context;
        }

        // GET: api/interventionplans?residentId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<intervention_plan>>> GetInterventionPlans([FromQuery] int? residentId)
        {
            var query = _context.intervention_plans.AsQueryable();

            if (residentId.HasValue)
            {
                query = query.Where(p => p.resident_id == residentId.Value);
            }

            var plans = await query
                .OrderByDescending(p => p.case_conference_date)
                .ThenByDescending(p => p.updated_at)
                .ToListAsync();

            return Ok(plans);
        }

        // GET: api/interventionplans/5
        [HttpGet("{id}")]
        public async Task<ActionResult<intervention_plan>> GetInterventionPlan(int id)
        {
            var plan = await _context.intervention_plans.FindAsync(id);

            if (plan == null)
            {
                return NotFound();
            }

            return Ok(plan);
        }

        // POST: api/interventionplans
        [HttpPost]
        public async Task<IActionResult> PostInterventionPlan([FromBody] intervention_plan plan)
        {
            try
            {
                var maxId = await _context.intervention_plans
                    .MaxAsync(p => (int?)p.plan_id) ?? 0;

                plan.plan_id = maxId + 1;

                _context.intervention_plans.Add(plan);
                await _context.SaveChangesAsync();

                return Ok(plan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }

        // PUT: api/interventionplans/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInterventionPlan(int id, intervention_plan plan)
        {
            if (id != plan.plan_id)
            {
                return BadRequest();
            }

            _context.Entry(plan).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.intervention_plans.Any(e => e.plan_id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/interventionplans/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterventionPlan(int id)
        {
            var plan = await _context.intervention_plans.FindAsync(id);

            if (plan == null)
            {
                return NotFound();
            }

            _context.intervention_plans.Remove(plan);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}