using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Data;
using LuzDeVida.API.Models.Dtos;
using Microsoft.Extensions.Configuration;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]  // Only admins can access dashboard metrics
public class AdminDashboardController : ControllerBase
{
    private readonly LuzDeVidaDbContext _context;
    private readonly IConfiguration _configuration;

    public AdminDashboardController(LuzDeVidaDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<AdminDashboardMetrics>> GetDashboardMetrics()
    {
        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var thisMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var lastMonthStart = thisMonth.AddMonths(-1);
            var lastMonthEnd = thisMonth.AddDays(-1);

            // ========== CRITICAL OPTIMIZATION: Load only required data once ==========
            
            // Single query: all residents (only needed fields)
            var allResidentsData = await _context.residents
                .Select(r => new
                {
                    r.resident_id,
                    r.safehouse_id,
                    r.case_status,
                    r.date_of_admission,
                    r.date_of_birth,
                    r.reintegration_status
                })
                .ToListAsync();

            // Single query: all intervention plans (only needed fields)
            var allPlansData = await _context.intervention_plans
                .Select(ip => new
                {
                    ip.plan_id,
                    ip.resident_id,
                    ip.plan_category,
                    ip.created_at,
                    ip.updated_at,
                    ip.target_date,
                    ip.status
                })
                .ToListAsync();

            // Single query: partner assignments (only needed fields)
            var partnerAssignmentsData = await _context.partner_assignments
                .Select(pa => new
                {
                    pa.partner_id,
                    pa.assignment_start,
                    pa.assignment_end
                })
                .ToListAsync();

            // Single query: safehouse names
            var safehousesMap = await _context.safehouses
                .Select(s => new { s.safehouse_id, s.name })
                .ToDictionaryAsync(s => s.safehouse_id);

            // ========== RESIDENTS OVERVIEW ==========
            
            var activeResidentsData = allResidentsData.Where(r => r.case_status == "Active").ToList();
            var totalActiveResidents = activeResidentsData.Count;

            // Residents by safehouse
            var residentsWithSafehouse = activeResidentsData
                .GroupBy(r => r.safehouse_id)
                .Select(g =>
                {
                    var safehouseName = g.Key.HasValue && safehousesMap.ContainsKey(g.Key.Value) 
                        ? safehousesMap[g.Key.Value].name 
                        : "Unknown";
                    return new ResidentBySafehouseWithNameDto
                    {
                        safehouse_id = g.Key ?? 0,
                        safehouse_name = safehouseName,
                        active_resident_count = g.Count()
                    };
                })
                .ToList();

            // ========== DONATIONS ==========
            
            var thirtyDaysAgo = today.AddDays(-30);
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

            var totalRecentDonations = recentDonations.Sum(d => d.amount ?? 0);
            var recentDonationCount = recentDonations.Count;

            // ========== CASE CONFERENCES ==========
            
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

            // ========== INTERVENTION PLANS ==========
            
            var activeInterventionPlans = await _context.intervention_plans
                .Where(ip => ip.status != "Completed" && ip.status != "Closed")
                .OrderBy(ip => ip.target_date)
                .Select(ip => new InterventionPlanSummaryDto
                {
                    plan_id = ip.plan_id,
                    resident_id = ip.resident_id,
                    plan_category = ip.plan_category,
                    start_date = ip.created_at != null ? DateOnly.FromDateTime(ip.created_at.Value) : null,
                    target_completion_date = ip.target_date,
                    status = ip.status
                })
                .ToListAsync();

            // ========== HOME VISITATIONS ==========
            
            var weekFromNow = today.AddDays(7);
            var homeVisitationsThisWeek = await _context.home_visitations
                .Where(hv => hv.visit_date.HasValue && 
                       hv.visit_date >= today && 
                       hv.visit_date <= weekFromNow)
                .OrderBy(hv => hv.visit_date)
                .Select(hv => new HomeVisitationSummaryDto
                {
                    visitation_id = hv.visitation_id,
                    resident_id = hv.resident_id,
                    visitation_date = hv.visit_date,
                    status = hv.visit_outcome,
                    notes = hv.observations
                })
                .ToListAsync();

            // ========== CASE MANAGEMENT PROGRESS METRICS ==========
            
            var activeResidents = activeResidentsData.ToList();
            var allResidents = allResidentsData.ToList();
            var allPlans = allPlansData.ToList();
            
            // Average length of stay
            var avgLengthOfStay = 0m;
            if (activeResidents.Count > 0)
            {
                var totalDays = activeResidents
                    .Where(r => r.date_of_admission.HasValue)
                    .Sum(r => (DateTime.UtcNow.Date - r.date_of_admission.Value.ToDateTime(TimeOnly.MinValue)).Days);
                
                var residentsWithAdmission = activeResidents.Count(r => r.date_of_admission.HasValue);
                if (residentsWithAdmission > 0)
                    avgLengthOfStay = (decimal)totalDays / residentsWithAdmission;
            }

            // Resident transition rate
            var residentsAging18Plus = activeResidents.Count(r => 
                r.date_of_birth.HasValue && 
                r.date_of_birth.Value.ToDateTime(TimeOnly.MinValue).AddYears(18) <= DateTime.UtcNow);
            var residentTransitionRate = activeResidents.Count > 0 
                ? (decimal)residentsAging18Plus / activeResidents.Count 
                : 0;

            // Family reunification rate
            var reunifiedCount = allResidents.Count(r => r.reintegration_status == "Family Reunified");
            var closedResidentsCount = allResidents.Count(r => r.case_status == "Closed");
            var familyReunificationRate = closedResidentsCount > 0 
                ? (decimal)reunifiedCount / closedResidentsCount 
                : 0;

            // Case closure rate
            var completedPlans = allPlans.Count(p => p.status == "Completed" || p.status == "Closed");
            var caseClosureRate = allPlans.Count > 0 
                ? (decimal)completedPlans / allPlans.Count 
                : 0;

            var caseManagementProgress = new CaseManagementProgressDto
            {
                avg_length_of_stay_days = avgLengthOfStay,
                resident_transition_rate = residentTransitionRate,
                family_reunification_rate = familyReunificationRate,
                case_closure_rate = caseClosureRate
            };

            // ========== INTERVENTION PLAN METRICS ==========
            
            var completedPlansList = allPlans
                .Where(p => p.status == "Completed" || p.status == "Closed")
                .ToList();

            var avgDaysToComplete = 0m;
            if (completedPlansList.Count > 0)
            {
                var totalCompletionDays = completedPlansList
                    .Where(p => p.created_at.HasValue && p.updated_at.HasValue)
                    .Sum(p => (p.updated_at.Value.Date - p.created_at.Value.Date).Days);
                
                var plansWithDates = completedPlansList.Count(p => p.created_at.HasValue && p.updated_at.HasValue);
                if (plansWithDates > 0)
                    avgDaysToComplete = (decimal)totalCompletionDays / plansWithDates;
            }

            var planCompletionRate = allPlans.Count > 0 
                ? (decimal)completedPlans / allPlans.Count 
                : 0;

            var mostCommonCategory = allPlans
                .GroupBy(p => p.plan_category)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()
                ?.Key ?? "N/A";

            var successRateByType = allPlans
                .GroupBy(p => p.plan_category)
                .Select(g => new PlanTypeSuccessDto
                {
                    category = g.Key ?? "Uncategorized",
                    success_rate = g.Count() > 0 
                        ? (decimal)g.Count(p => p.status == "Completed" || p.status == "Closed") / g.Count() 
                        : 0
                })
                .ToList();

            var interventionPlanMetrics = new InterventionPlanMetricsDto
            {
                avg_days_to_complete = avgDaysToComplete,
                completion_rate = planCompletionRate,
                most_common_category = mostCommonCategory,
                success_rate_by_type = successRateByType
            };

            // ========== ENGAGEMENT & SUPPORT METRICS ==========

            var activeAssignments = partnerAssignmentsData
                .Where(pa => pa.assignment_start.HasValue && 
                       (pa.assignment_end == null || pa.assignment_end >= today))
                .ToList();
            
            var partnerEngagementFreq = activeAssignments.Count > 0 
                ? (decimal)activeAssignments.Count / (DateTime.UtcNow.Month == 1 ? 1 : DateTime.UtcNow.Month) 
                : 0;

            // Single query: all donations (only needed fields)
            var allDonationsData = await _context.donations
                .Select(d => new
                {
                    d.donation_date,
                    d.donation_type,
                    d.supporter_id
                })
                .ToListAsync();

            var thisMonthInKind = allDonationsData
                .Count(d => d.donation_date >= thisMonth && 
                       d.donation_type == "In-Kind" &&
                       d.donation_date.HasValue);

            var lastMonthInKind = allDonationsData
                .Count(d => d.donation_date >= lastMonthStart && 
                       d.donation_date <= lastMonthEnd && 
                       d.donation_type == "In-Kind" &&
                       d.donation_date.HasValue);

            var inKindTrend = lastMonthInKind > 0 
                ? ((decimal)(thisMonthInKind - lastMonthInKind) / lastMonthInKind) * 100 
                : (thisMonthInKind > 0 ? 100 : 0);

            // Donor retention via aggregation query
            var donorRetentionData = await _context.supporters
                .GroupBy(s => s.supporter_id)
                .Select(g => new
                {
                    supporter_id = g.Key,
                    donation_count = g.SelectMany(s => s.donations).Count()
                })
                .ToListAsync();

            var totalSupporters = donorRetentionData.Count;
            var repeatDonors = donorRetentionData.Count(d => d.donation_count > 1);
            var donorRetentionRate = totalSupporters > 0 
                ? (decimal)repeatDonors / totalSupporters 
                : 0;

            // Average volunteer hours per month
            var monthlyVisitations = await _context.home_visitations
                .CountAsync(hv => hv.visit_date >= thisMonth && hv.visit_date.HasValue);
            
            var avgVolunteerHours = monthlyVisitations > 0 
                ? (decimal)monthlyVisitations * 2
                : 0;

            var engagementSupport = new EngagementSupportDto
            {
                partner_engagement_frequency_avg = partnerEngagementFreq,
                in_kind_donation_trend = inKindTrend,
                donor_retention_rate = donorRetentionRate,
                avg_volunteer_hours_per_month = avgVolunteerHours
            };

            // ========== GIRLS RE-INTEGRATION OKR ==========
            // Get total residents (denominator)
            var totalResidents = await _context.residents.CountAsync();

            // Get reintegrated girls (numerator): reintegration_status = "Completed" AND length_of_stay < 2 years
            // Load completed residents into memory, then parse length_of_stay (since SQL can't easily parse it)
            var completedResidents = await _context.residents
                .Where(r => r.reintegration_status == "Completed" && r.length_of_stay != null)
                .ToListAsync();

            var reintegratedGirls = completedResidents
                .Where(r =>
                {
                    var lengthStr = r.length_of_stay;
                    var spaceIndex = lengthStr.IndexOf(' ');
                    if (spaceIndex > 0 && int.TryParse(lengthStr.Substring(0, spaceIndex), out int years))
                    {
                        return years < 2;
                    }
                    return false;
                })
                .Count();

            var reintegrationPercent = totalResidents > 0 
                ? (decimal)reintegratedGirls / totalResidents * 100 
                : 0;

            var reintegrationOKRStatus = reintegrationPercent >= 100 ? "On Track" : 
                                        reintegrationPercent >= 75 ? "At Risk" : "Behind";
            
            var reintegrationStatusColor = reintegrationPercent >= 100 ? "var(--blue)" : 
                                          reintegrationPercent >= 75 ? "var(--sand-dark)" : "var(--text-light)";

            var reintegrationOKR = new ReintegrationOKRDto
            {
                total_girls_admitted_two_years = totalResidents,
                girls_reintegrated = reintegratedGirls,
                reintegration_percent = reintegrationPercent,
                okr_status = reintegrationOKRStatus,
                status_color = reintegrationStatusColor
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
                active_intervention_plans_count = activeInterventionPlans.Count,
                active_intervention_plans = activeInterventionPlans,
                home_visitations_this_week_count = homeVisitationsThisWeek.Count,
                home_visitations_this_week = homeVisitationsThisWeek,
                safehouses_total = safehousesMap.Count,
                case_management_progress = caseManagementProgress,
                intervention_plan_metrics = interventionPlanMetrics,
                engagement_support = engagementSupport,
                reintegration_okr = reintegrationOKR,
                recommendations = GenerateRecommendations(caseManagementProgress, interventionPlanMetrics, engagementSupport),
                timestamp = DateTime.UtcNow
            };

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving dashboard metrics", error = ex.Message });
        }
    }


    private List<RecommendationDto> GenerateRecommendations(
        CaseManagementProgressDto caseManagement,
        InterventionPlanMetricsDto interventionMetrics,
        EngagementSupportDto engagement)
    {
        var recommendations = new List<RecommendationDto>();

        // Family Reunification Rate < 40%
        if (caseManagement.family_reunification_rate < 0.4m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "low_reunification",
                severity = "critical",
                title = "Low Family Reunification",
                message = $"Family reunification rate is {(caseManagement.family_reunification_rate * 100):F1}% - prioritize family engagement and reintegration efforts",
                metric = "family_reunification_rate"
            });
        }

        // Case Closure Rate < 15%
        if (caseManagement.case_closure_rate < 0.15m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "slow_case_closure",
                severity = "warning",
                title = "Slow Case Completion",
                message = $"Case closure rate is {(caseManagement.case_closure_rate * 100):F1}% - review intervention plan effectiveness and resource allocation",
                metric = "case_closure_rate"
            });
        }

        // Avg Length of Stay > 730 days (2 years)
        if (caseManagement.avg_length_of_stay_days > 730)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "long_stay",
                severity = "warning",
                title = "Long Resident Tenure",
                message = $"Average stay is {caseManagement.avg_length_of_stay_days:F0} days - review ongoing support needs and transition planning",
                metric = "avg_length_of_stay_days"
            });
        }

        // Intervention Completion Rate < 25%
        if (interventionMetrics.completion_rate < 0.25m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "low_completion",
                severity = "warning",
                title = "Low Plan Completion",
                message = $"Intervention completion rate is {(interventionMetrics.completion_rate * 100):F1}% - investigate bottlenecks and adjust support strategies",
                metric = "intervention_completion_rate"
            });
        }

        // Partner Engagement < 5 per month
        if (engagement.partner_engagement_frequency_avg < 5m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "low_partner_engagement",
                severity = "warning",
                title = "Low Partner Engagement",
                message = $"Partner engagement is {engagement.partner_engagement_frequency_avg:F1}x/month - reconnect with key partners and strengthen relationships",
                metric = "partner_engagement_frequency_avg"
            });
        }

        // Donor Retention Rate < 60%
        if (engagement.donor_retention_rate < 0.6m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "low_donor_retention",
                severity = "warning",
                title = "Donor Attrition High",
                message = $"Donor retention rate is {(engagement.donor_retention_rate * 100):F1}% - develop retention strategy and re-engagement campaigns",
                metric = "donor_retention_rate"
            });
        }

        // In-Kind Donation Trend < -20%
        if (engagement.in_kind_donation_trend < -20m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "declining_in_kind",
                severity = "critical",
                title = "In-Kind Donations Declining",
                message = $"In-kind donations down {Math.Abs(engagement.in_kind_donation_trend):F1}% - activate donor communication and outreach",
                metric = "in_kind_donation_trend"
            });
        }

        // Volunteer Hours < 40 per month
        if (engagement.avg_volunteer_hours_per_month < 40m)
        {
            recommendations.Add(new RecommendationDto
            {
                id = "low_volunteer_hours",
                severity = "warning",
                title = "Low Volunteer Engagement",
                message = $"Volunteer engagement is {engagement.avg_volunteer_hours_per_month:F0} hours/month - recruit additional volunteers or re-engage existing ones",
                metric = "avg_volunteer_hours_per_month"
            });
        }

        return recommendations;
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
    public int active_intervention_plans_count { get; set; }
    public List<InterventionPlanSummaryDto> active_intervention_plans { get; set; } = new();
    public int home_visitations_this_week_count { get; set; }
    public List<HomeVisitationSummaryDto> home_visitations_this_week { get; set; } = new();
    public int safehouses_total { get; set; }
    public decimal? healing_index { get; set; }
    public CaseManagementProgressDto case_management_progress { get; set; } = new();
    public InterventionPlanMetricsDto intervention_plan_metrics { get; set; } = new();
    public EngagementSupportDto engagement_support { get; set; } = new();
    public ReintegrationOKRDto reintegration_okr { get; set; } = new();
    public List<RecommendationDto> recommendations { get; set; } = new();
    public DateTime timestamp { get; set; }
}

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

public class InterventionPlanSummaryDto
{
    public int plan_id { get; set; }
    public int resident_id { get; set; }
    public string? plan_category { get; set; }
    public DateOnly? start_date { get; set; }
    public DateOnly? target_completion_date { get; set; }
    public string? status { get; set; }
}

public class HomeVisitationSummaryDto
{
    public int visitation_id { get; set; }
    public int resident_id { get; set; }
    public DateOnly? visitation_date { get; set; }
    public string? status { get; set; }
    public string? notes { get; set; }
}

public class CaseManagementProgressDto
{
    public decimal avg_length_of_stay_days { get; set; }
    public decimal resident_transition_rate { get; set; }
    public decimal family_reunification_rate { get; set; }
    public decimal case_closure_rate { get; set; }
}

public class PlanTypeSuccessDto
{
    public string category { get; set; } = "";
    public decimal success_rate { get; set; }
}

public class InterventionPlanMetricsDto
{
    public decimal avg_days_to_complete { get; set; }
    public decimal completion_rate { get; set; }
    public string most_common_category { get; set; } = "";
    public List<PlanTypeSuccessDto> success_rate_by_type { get; set; } = new();
}

public class EngagementSupportDto
{
    public decimal partner_engagement_frequency_avg { get; set; }
    public decimal in_kind_donation_trend { get; set; }
    public decimal donor_retention_rate { get; set; }
    public decimal avg_volunteer_hours_per_month { get; set; }
}

public class RecommendationDto
{
    public string id { get; set; } = "";
    public string severity { get; set; } = ""; // "critical", "warning"
    public string title { get; set; } = "";
    public string message { get; set; } = "";
    public string metric { get; set; } = "";
}

