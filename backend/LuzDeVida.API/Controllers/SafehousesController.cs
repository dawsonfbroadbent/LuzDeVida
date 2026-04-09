using LuzDeVida.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // All safehouse endpoints require authentication
public class SafehousesController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;

    public SafehousesController(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _context.safehouses.ToListAsync();
        return Ok(data);
    }
}