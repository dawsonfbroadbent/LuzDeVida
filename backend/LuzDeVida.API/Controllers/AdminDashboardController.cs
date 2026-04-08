using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Data;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminDashboardController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;

    public AdminDashboardController(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<AdminDashboardMetrics>> GetDashboardMetrics()
    {
        try
        {
            // Count active residents by safehouse
            var residentsByShell = await _context.residents
                .Where(r => r.case_status == "Active")
                .GroupBy(r => r.safehouse_id)
                .Select(g => new ResidentBySafehouseDto
                {
                    safehouse_id = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            // Get safehouse info for resident counts
            var safehouses = await _context.safehouses.ToListAsync();
            var residentsWithSafehouse = new List<ResidentBySafehouseWithNameDto>();
            
            foreach (var shell in residentsByShell)
            {
                var safehouse = safehouses.FirstOrDefault(s => s.safehouse_id == shell.safehouse_id);
                residentsWithSafehouse.Add(new ResidentBySafehouseWithNameDto
                {
                    safehouse_id = shell.safehouse_id,
                    safehouse_name = safehouse?.name ?? "Unknown",
                    active_resident_count = shell.count
                });
            }

            // Total active residents
            var totalActiveResidents = residentsWithSafehouse.Sum(r => r.active_resident_count);

            // Recent donations (last 30 days)
            var thirtyDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
            var recentDonations = await _context.donations
                .Where(d => d.donation_date.HasValue && d.donation_date >= thirtyDaysAgo)
                .OrderByDescending(d => d.donation_date)
                .Take(10)
                .Select(d => new DonationSummaryDto
                {
                    donation_id = d.donation_id,
                    donation_date = d.donation_date,
                    amount = d.amount,
                    donation_type = d.donation_type,
                    currency_code = d.currency_code
                })
                .ToListAsync();

            // Calculate total recent donations
            var totalRecentDonations = recentDonations.Sum(d => d.amount ?? 0);
            var recentDonationCount = recentDonations.Count;

            // Upcoming case conferences (next 14 days)
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var twoWeeksFromNow = today.AddDays(14);
            var upcomingConferences = await _context.intervention_plans
                .Where(ip => ip.case_conference_date.HasValue && 
                       ip.case_conference_date >= today && 
                       ip.case_conference_date <= twoWeeksFromNow)
                .OrderBy(ip => ip.case_conference_date)
                .Select(ip => new CaseConferenceSummaryDto
                {
                    plan_id = ip.plan_id,
                    case_conference_date = ip.case_conference_date,
                    resident_id = ip.resident_id,
                    plan_category = ip.plan_category,
                    status = ip.status
                })
                .ToListAsync();

            // Progress data - average health scores from recent records (last 30 days)
            var recentHealthRecords = await _context.health_wellbeing_records
                .Where(h => h.record_date.HasValue && h.record_date >= thirtyDaysAgo)
                .ToListAsync();

            var progressData = new ProgressDataDto
            {
                avg_nutrition_score = recentHealthRecords.Any(h => h.nutrition_score.HasValue)
                    ? recentHealthRecords.Where(h => h.nutrition_score.HasValue).Average(h => h.nutrition_score.Value)
                    : 0,
                avg_sleep_score = recentHealthRecords.Any(h => h.sleep_score.HasValue)
                    ? recentHealthRecords.Where(h => h.sleep_score.HasValue).Average(h => h.sleep_score.Value)
                    : 0,
                avg_energy_score = recentHealthRecords.Any(h => h.energy_score.HasValue)
                    ? recentHealthRecords.Where(h => h.energy_score.HasValue).Average(h => h.energy_score.Value)
                    : 0,
                avg_general_health_score = recentHealthRecords.Any(h => h.general_health_score.HasValue)
                    ? recentHealthRecords.Where(h => h.general_health_score.HasValue).Average(h => h.general_health_score.Value)
                    : 0,
                health_records_count = recentHealthRecords.Count,
                medical_checkups_completed = recentHealthRecords.Count(h => h.medical_checkup_done == true),
                psychological_checkups_completed = recentHealthRecords.Count(h => h.psychological_checkup_done == true)
            };

            var metrics = new AdminDashboardMetrics
            {
                active_residents_total = totalActiveResidents,
                residents_by_safehouse = residentsWithSafehouse,
                recent_donations_total = totalRecentDonations,
                recent_donations_count = recentDonationCount,
                recent_donations = recentDonations,
                upcoming_case_conferences_count = upcomingConferences.Count,
                upcoming_case_conferences = upcomingConferences,
                progress_data = progressData,
                safehouses_total = safehouses.Count,
                timestamp = DateTime.UtcNow
            };

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving dashboard metrics", error = ex.Message });
        }
    }
}

public class AdminDashboardMetrics
{
    public int active_residents_total { get; set; }
    public List<ResidentBySafehouseWithNameDto> residents_by_safehouse { get; set; } = new();
    public decimal recent_donations_total { get; set; }
    public int recent_donations_count { get; set; }
    public List<DonationSummaryDto> recent_donations { get; set; } = new();
    public int upcoming_case_conferences_count { get; set; }
    public List<CaseConferenceSummaryDto> upcoming_case_conferences { get; set; } = new();
    public ProgressDataDto progress_data { get; set; } = new();
    public int safehouses_total { get; set; }
    public decimal? healing_index { get; set; }
    public 

public class ResidentBySafehouseDto
{
    public int? safehouse_id { get; set; }
    public int count { get; set; }
}

public class ResidentBySafehouseWithNameDto
{
    public int? safehouse_id { get; set; }
    public string safehouse_name { get; set; } = "";
    public int active_resident_count { get; set; }
}

public class DonationSummaryDto
{
    public int donation_id { get; set; }
    public DateOnly? donation_date { get; set; }
    public decimal? amount { get; set; }
    public string? donation_type { get; set; }
    public string? currency_code { get; set; }
}

public class CaseConferenceSummaryDto
{
    public int plan_id { get; set; }
    public DateOnly? case_conference_date { get; set; }
    public int resident_id { get; set; }
    public string? plan_category { get; set; }
    public string? status { get; set; }
}

public class ProgressDataDto
{
    public decimal? avg_nutrition_score { get; set; }
    public decimal? avg_sleep_score { get; set; }
    public decimal? avg_energy_score { get; set; }
    public decimal? avg_general_health_score { get; set; }
    public int health_records_count { get; set; }
    public int medical_checkups_completed { get; set; }
    public int psychological_checkups_completed { get; set; }
}
