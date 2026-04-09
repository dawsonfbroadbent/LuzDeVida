using LuzDeVida.API.Data;
using LuzDeVida.API.Models;
using LuzDeVida.API.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/donations")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public DonationsController(LuzDeVidaDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDonation([FromBody] CreateDonationDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest(new { message = "Donation amount must be greater than zero." });

        var identityUser = await _userManager.GetUserAsync(User);
        if (identityUser?.Email == null)
            return Unauthorized(new { message = "Invalid session. Please log in again." });

        var appUser = await _context.app_users
            .FirstOrDefaultAsync(u => u.email.ToLower() == identityUser.Email.ToLower());

        if (appUser == null || !appUser.is_active)
            return Unauthorized(new { message = "Account not found or inactive." });

        if (appUser.supporter_id == null)
            return BadRequest(new { message = "This account is not registered as a supporter." });

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var maxId = await _context.donations
                .AsNoTracking()
                .MaxAsync(d => (int?)d.donation_id) ?? 0;

            var newDonation = new donation
            {
                donation_id    = maxId + 1,
                supporter_id   = appUser.supporter_id.Value,
                donation_type  = "monetary",
                donation_date  = DateOnly.FromDateTime(DateTime.UtcNow),
                channel_source = "website",
                currency_code  = "USD",
                amount         = dto.Amount,
                is_recurring   = dto.IsRecurring,
                campaign_name  = dto.CampaignName,
                notes          = dto.Notes,
            };

            _context.donations.Add(newDonation);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { donation_id = newDonation.donation_id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = $"Failed to save donation: {ex.Message}" });
        }
    }
}
