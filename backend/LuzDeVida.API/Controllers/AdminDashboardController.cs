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

            // Active intervention plans
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

            // Home visitations this week (7 days)
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
            
            // Get all residents (active and closed) for calculations
            var allResidents = await _context.residents.ToListAsync();
            var activeResidents = allResidents.Where(r => r.case_status == "Active").ToList();
            
            // Average length of stay (days)
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

            // Resident transition rate (% aging out - residents 18+)
            var residentsAging18Plus = activeResidents.Count(r => 
                r.date_of_birth.HasValue && 
                r.date_of_birth.Value.ToDateTime(TimeOnly.MinValue).AddYears(18) <= DateTime.UtcNow);
            var residentTransitionRate = activeResidents.Count > 0 
                ? (decimal)residentsAging18Plus / activeResidents.Count 
                : 0;

            // Family reunification rate (residents with "Family Reunified" status)
            var reunifiedCount = allResidents.Count(r => r.reintegration_status == "Family Reunified");
            var closedResidentsCount = allResidents.Count(r => r.case_status == "Closed");
            var familyReunificationRate = closedResidentsCount > 0 
                ? (decimal)reunifiedCount / closedResidentsCount 
                : 0;

            // Case closure rate (% of intervention plans completed/closed)
            var allPlans = await _context.intervention_plans.ToListAsync();
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

            // Average days to complete
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

            // Completion rate
            var planCompletionRate = allPlans.Count > 0 
                ? (decimal)completedPlans / allPlans.Count 
                : 0;

            // Most common category
            var mostCommonCategory = allPlans
                .GroupBy(p => p.plan_category)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()
                ?.Key ?? "N/A";

            // Success rate by type (category)
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

            // Partner engagement frequency (active assignments per month)
            var allPartnerAssignments = await _context.partner_assignments.ToListAsync();
            var activeAssignments = allPartnerAssignments
                .Where(pa => pa.assignment_start.HasValue && 
                       (pa.assignment_end == null || pa.assignment_end >= today))
                .ToList();
            
            var partnerEngagementFreq = activeAssignments.Count > 0 
                ? (decimal)activeAssignments.Count / (DateTime.UtcNow.Month == 1 ? 1 : DateTime.UtcNow.Month) 
                : 0;

            // In-kind donation trend (this month vs last month %)
            var thisMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var lastMonthStart = thisMonth.AddMonths(-1);
            var lastMonthEnd = thisMonth.AddDays(-1);

            var thisMonthInKind = await _context.donations
                .Where(d => d.donation_date >= thisMonth && 
                       d.donation_type == "In-Kind" &&
                       d.donation_date.HasValue)
                .CountAsync();

            var lastMonthInKind = await _context.donations
                .Where(d => d.donation_date >= lastMonthStart && 
                       d.donation_date <= lastMonthEnd && 
                       d.donation_type == "In-Kind" &&
                       d.donation_date.HasValue)
                .CountAsync();

            var inKindTrend = lastMonthInKind > 0 
                ? ((decimal)(thisMonthInKind - lastMonthInKind) / lastMonthInKind) * 100 
                : (thisMonthInKind > 0 ? 100 : 0);

            // Donor retention rate (supporters with multiple donations)
            var allDonors = await _context.supporters
                .Include(s => s.donations)
                .ToListAsync();

            var repeatDonors = allDonors.Count(s => s.donations.Count > 1);
            var donorRetentionRate = allDonors.Count > 0 
                ? (decimal)repeatDonors / allDonors.Count 
                : 0;

            // Average volunteer hours per month (estimated from home visitations)
            // Assuming ~2 hours per visit for now
            var thisMonthVisitations = homeVisitationsThisWeek.Count;
            // Get all visitations for this month for a better estimate
            var monthlyVisitations = await _context.home_visitations
                .Where(hv => hv.visit_date >= thisMonth && hv.visit_date.HasValue)
                .CountAsync();
            
            var avgVolunteerHours = monthlyVisitations > 0 
                ? (decimal)monthlyVisitations * 2  // 2 hours per visit estimate
                : 0;

            var engagementSupport = new EngagementSupportDto
            {
                partner_engagement_frequency_avg = partnerEngagementFreq,
                in_kind_donation_trend = inKindTrend,
                donor_retention_rate = donorRetentionRate,
                avg_volunteer_hours_per_month = avgVolunteerHours
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
                safehouses_total = safehouses.Count,
                case_management_progress = caseManagementProgress,
                intervention_plan_metrics = interventionPlanMetrics,
                engagement_support = engagementSupport,
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


