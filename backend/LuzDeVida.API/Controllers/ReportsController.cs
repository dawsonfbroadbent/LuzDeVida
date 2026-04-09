using LuzDeVida.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public class ReportsOverviewDto
{
    public int year { get; set; }
    public ReportsDonationSummaryDto donation_summary { get; set; } = new();
    public List<ReportsMonthlyDonationDto> donation_trend { get; set; } = new();
    public List<ReportsQuarterlyOutcomeDto> quarterly_outcomes { get; set; } = new();
    public List<ReportsSafehouseComparisonDto> safehouse_comparisons { get; set; } = new();
    public ReportsReintegrationDto reintegration { get; set; } = new();
    public ReportsAarDto aar { get; set; } = new();
    public DateTime generated_at { get; set; }
}

public class ReportsDonationSummaryDto
{
    public decimal total_monetary { get; set; }
    public int monetary_count { get; set; }
    public decimal total_in_kind_estimated { get; set; }
    public int in_kind_count { get; set; }
    public int unique_donor_count { get; set; }
    public int recurring_donor_count { get; set; }
}

public class ReportsMonthlyDonationDto
{
    public string month_label { get; set; } = "";    // "Jan 2024"
    public string month_key { get; set; } = "";      // "2024-01"
    public decimal monetary_total { get; set; }
    public int monetary_count { get; set; }
    public decimal in_kind_total { get; set; }
    public int in_kind_count { get; set; }
}

public class ReportsQuarterlyOutcomeDto
{
    public string quarter { get; set; } = "";        // "Q1 2025"
    public int active_residents { get; set; }
    public decimal? avg_education_progress { get; set; }
    public decimal? avg_attendance_rate { get; set; }
    public decimal? avg_health_score { get; set; }
    public decimal? avg_nutrition_score { get; set; }
    public int education_record_count { get; set; }
    public int health_record_count { get; set; }
}

public class ReportsSafehouseComparisonDto
{
    public int safehouse_id { get; set; }
    public string safehouse_name { get; set; } = "";
    public string? safehouse_code { get; set; }
    public string? region { get; set; }
    public int active_residents { get; set; }
    public int? capacity { get; set; }
    public decimal occupancy_rate { get; set; }
    public decimal? avg_education_progress { get; set; }
    public decimal? avg_health_score { get; set; }
    public int process_recording_count { get; set; }
    public int home_visitation_count { get; set; }
    public int incident_count { get; set; }
    public int intervention_plans_active { get; set; }
    public int intervention_plans_completed { get; set; }
}

public class ReportsReintegrationDto
{
    public int total_closed { get; set; }
    public int total_reintegrated { get; set; }
    public decimal reintegration_rate { get; set; }
    public List<ReintegrationByTypeDto> by_type { get; set; } = new();
    public decimal avg_days_to_close { get; set; }
}

public class ReintegrationByTypeDto
{
    public string reintegration_type { get; set; } = "";
    public int count { get; set; }
    public decimal rate { get; set; }
}

public class ReportsAarDto
{
    // Caring — Pagmamahal
    public int total_residents_served { get; set; }
    public int new_admissions_in_year { get; set; }
    public int closed_cases_in_year { get; set; }
    public int active_residents_end_of_year { get; set; }

    // Healing — Paggagamot
    public int medical_checkups_done { get; set; }
    public int dental_checkups_done { get; set; }
    public int psychological_checkups_done { get; set; }
    public int total_health_records { get; set; }

    // Teaching — Pagtuturo
    public int students_enrolled { get; set; }
    public int students_completed { get; set; }
    public decimal avg_attendance_rate { get; set; }

    // Counseling / Process Recordings
    public int counseling_sessions_total { get; set; }
    public int total_session_minutes { get; set; }
    public int sessions_with_progress_noted { get; set; }
    public int sessions_with_concerns_flagged { get; set; }

    // Home Visitations
    public int home_visitations_total { get; set; }
    public int home_visitations_with_safety_concerns { get; set; }

    // Incidents
    public int incidents_total { get; set; }
    public int incidents_resolved { get; set; }

    // Funding
    public decimal total_monetary_received { get; set; }
    public decimal total_in_kind_estimated { get; set; }
}

// ── Controller ───────────────────────────────────────────────────────────────

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ReportsService _service;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(ReportsService service, ILogger<ReportsController> logger)
    {
        _service = service;
        _logger  = logger;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview([FromQuery] int? year)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        try
        {
            var data = await _service.GetOverviewAsync(targetYear);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating reports overview for year {Year}", targetYear);
            return StatusCode(500, new { message = "Error generating report", error = ex.Message });
        }
    }
}
