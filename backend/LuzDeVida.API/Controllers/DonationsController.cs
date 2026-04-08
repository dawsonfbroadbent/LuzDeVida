using LuzDeVida.API.Data;
using LuzDeVida.API.Models;
using LuzDeVida.API.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/donations")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;

    public DonationsController(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDonation([FromBody] CreateDonationDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest(new { message = "Donation amount must be greater than zero." });

        // Try both claim types — .NET 8+ doesn't remap sub, but earlier versions do
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid session. Please log in again." });

        var appUser = await _context.app_users.FindAsync(userId);
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
