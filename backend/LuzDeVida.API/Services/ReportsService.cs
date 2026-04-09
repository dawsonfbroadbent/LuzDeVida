using LuzDeVida.API.Controllers;
using LuzDeVida.API.Data;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Services;

public class ReportsService
{
    private readonly LuzDeVidaDbContext _context;

    public ReportsService(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    public async Task<ReportsOverviewDto> GetOverviewAsync(int year)
    {
        var yearStart = new DateOnly(year, 1, 1);
        var yearEnd   = new DateOnly(year, 12, 31);
        var cutoff24  = DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-23);
        cutoff24 = new DateOnly(cutoff24.Year, cutoff24.Month, 1); // start of that month

        // ── Load slices needed for in-memory grouping ────────────────────────
        var donationsRaw = await _context.donations
            .Where(d => d.donation_date.HasValue && d.donation_date >= cutoff24)
            .Select(d => new { d.donation_date, d.donation_type, d.amount, d.estimated_value, d.supporter_id, d.is_recurring })
            .ToListAsync();

        var donationsYear = await _context.donations
            .Where(d => d.donation_date.HasValue
                     && d.donation_date >= yearStart
                     && d.donation_date <= yearEnd)
            .Select(d => new { d.donation_type, d.amount, d.estimated_value, d.supporter_id, d.is_recurring })
            .ToListAsync();

        var educationRaw = await _context.education_records
            .Where(e => e.record_date.HasValue
                     && e.record_date >= yearStart
                     && e.record_date <= yearEnd)
            .Select(e => new { e.record_date, e.progress_percent, e.attendance_rate, e.enrollment_status, e.completion_status })
            .ToListAsync();

        var healthRaw = await _context.health_wellbeing_records
            .Where(h => h.record_date.HasValue
                     && h.record_date >= yearStart
                     && h.record_date <= yearEnd)
            .Select(h => new { h.record_date, h.general_health_score, h.nutrition_score, h.medical_checkup_done, h.dental_checkup_done, h.psychological_checkup_done })
            .ToListAsync();

        var residentsAll = await _context.residents
            .Select(r => new { r.resident_id, r.safehouse_id, r.case_status, r.date_of_admission, r.date_closed, r.reintegration_type })
            .ToListAsync();

        var safehousesAll = await _context.safehouses
            .Select(s => new { s.safehouse_id, s.name, s.region, s.safehouse_code, s.capacity_girls })
            .ToListAsync();

        var monthlyMetricsYear = await _context.safehouse_monthly_metrics
            .Where(m => m.month_start.HasValue
                     && m.month_start >= yearStart
                     && m.month_start <= yearEnd)
            .Select(m => new { m.safehouse_id, m.month_start, m.active_residents, m.avg_education_progress, m.avg_health_score, m.process_recording_count, m.home_visitation_count })
            .ToListAsync();

        // ── AAR parallel server-side aggregations ───────────────────────────
        var t_newAdmissions    = _context.residents.CountAsync(r => r.date_of_admission.HasValue && r.date_of_admission >= yearStart && r.date_of_admission <= yearEnd);
        var t_closedCases      = _context.residents.CountAsync(r => r.date_closed.HasValue && r.date_closed >= yearStart && r.date_closed <= yearEnd);
        var t_activeEndOfYear  = _context.residents.CountAsync(r => r.case_status == "Active");
        var t_medicalCheckups  = _context.health_wellbeing_records.CountAsync(h => h.record_date.HasValue && h.record_date >= yearStart && h.record_date <= yearEnd && h.medical_checkup_done == true);
        var t_dentalCheckups   = _context.health_wellbeing_records.CountAsync(h => h.record_date.HasValue && h.record_date >= yearStart && h.record_date <= yearEnd && h.dental_checkup_done == true);
        var t_psychCheckups    = _context.health_wellbeing_records.CountAsync(h => h.record_date.HasValue && h.record_date >= yearStart && h.record_date <= yearEnd && h.psychological_checkup_done == true);
        var t_totalHealthRecs  = _context.health_wellbeing_records.CountAsync(h => h.record_date.HasValue && h.record_date >= yearStart && h.record_date <= yearEnd);
        var t_studentsEnrolled = _context.education_records.CountAsync(e => e.record_date.HasValue && e.record_date >= yearStart && e.record_date <= yearEnd && e.enrollment_status == "Enrolled");
        var t_studentsComplete = _context.education_records.CountAsync(e => e.record_date.HasValue && e.record_date >= yearStart && e.record_date <= yearEnd && e.completion_status == "Completed");
        var t_counselingSess   = _context.process_recordings.CountAsync(p => p.session_date.HasValue && p.session_date >= yearStart && p.session_date <= yearEnd);
        var t_sessionMinutes   = _context.process_recordings.Where(p => p.session_date.HasValue && p.session_date >= yearStart && p.session_date <= yearEnd).SumAsync(p => (int)(p.session_duration_minutes ?? 0));
        var t_progressNoted    = _context.process_recordings.CountAsync(p => p.session_date.HasValue && p.session_date >= yearStart && p.session_date <= yearEnd && p.progress_noted == true);
        var t_concernsFlagged  = _context.process_recordings.CountAsync(p => p.session_date.HasValue && p.session_date >= yearStart && p.session_date <= yearEnd && p.concerns_flagged == true);
        var t_homeVisits       = _context.home_visitations.CountAsync(v => v.visit_date.HasValue && v.visit_date >= yearStart && v.visit_date <= yearEnd);
        var t_homeVisitSafety  = _context.home_visitations.CountAsync(v => v.visit_date.HasValue && v.visit_date >= yearStart && v.visit_date <= yearEnd && v.safety_concerns_noted == true);
        var t_incidents        = _context.incident_reports.CountAsync(i => i.incident_date.HasValue && i.incident_date >= yearStart && i.incident_date <= yearEnd);
        var t_incidentsRes     = _context.incident_reports.CountAsync(i => i.incident_date.HasValue && i.incident_date >= yearStart && i.incident_date <= yearEnd && i.resolved == true);
        var t_monetaryTotal    = _context.donations.Where(d => d.donation_date.HasValue && d.donation_date >= yearStart && d.donation_date <= yearEnd && d.donation_type == "Monetary").SumAsync(d => d.amount ?? 0);
        var t_inKindTotal      = _context.donations.Where(d => d.donation_date.HasValue && d.donation_date >= yearStart && d.donation_date <= yearEnd && d.donation_type == "In-Kind").SumAsync(d => d.estimated_value ?? 0);

        await Task.WhenAll(t_newAdmissions, t_closedCases, t_activeEndOfYear,
            t_medicalCheckups, t_dentalCheckups, t_psychCheckups, t_totalHealthRecs,
            t_studentsEnrolled, t_studentsComplete,
            t_counselingSess, t_sessionMinutes, t_progressNoted, t_concernsFlagged,
            t_homeVisits, t_homeVisitSafety,
            t_incidents, t_incidentsRes,
            t_monetaryTotal, t_inKindTotal);

        // ── Donation trend (24 months rolling) ──────────────────────────────
        var donationTrend = donationsRaw
            .GroupBy(d => new { d.donation_date!.Value.Year, d.donation_date.Value.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var dt = new DateTime(g.Key.Year, g.Key.Month, 1);
                return new ReportsMonthlyDonationDto
                {
                    month_label    = dt.ToString("MMM yyyy"),
                    month_key      = $"{g.Key.Year:D4}-{g.Key.Month:D2}",
                    monetary_total = g.Where(d => d.donation_type == "Monetary").Sum(d => d.amount ?? 0),
                    monetary_count = g.Count(d => d.donation_type == "Monetary"),
                    in_kind_total  = g.Where(d => d.donation_type == "In-Kind").Sum(d => d.estimated_value ?? 0),
                    in_kind_count  = g.Count(d => d.donation_type == "In-Kind"),
                };
            })
            .ToList();

        // ── Donation summary (year-scoped) ───────────────────────────────────
        var donationSummary = new ReportsDonationSummaryDto
        {
            total_monetary         = donationsYear.Where(d => d.donation_type == "Monetary").Sum(d => d.amount ?? 0),
            monetary_count         = donationsYear.Count(d => d.donation_type == "Monetary"),
            total_in_kind_estimated = donationsYear.Where(d => d.donation_type == "In-Kind").Sum(d => d.estimated_value ?? 0),
            in_kind_count          = donationsYear.Count(d => d.donation_type == "In-Kind"),
            unique_donor_count     = donationsYear.Select(d => d.supporter_id).Distinct().Count(),
            recurring_donor_count  = donationsYear.Where(d => d.is_recurring == true).Select(d => d.supporter_id).Distinct().Count(),
        };

        // ── Quarterly outcomes ───────────────────────────────────────────────
        static int QuarterOf(DateOnly d) => (d.Month - 1) / 3 + 1;

        var quarterlyOutcomes = Enumerable.Range(1, 4).Select(q =>
        {
            var qStart = new DateOnly(year, (q - 1) * 3 + 1, 1);
            var qEnd   = qStart.AddMonths(3).AddDays(-1);

            var activeCount = residentsAll.Count(r =>
                r.date_of_admission.HasValue &&
                r.date_of_admission.Value <= qEnd &&
                (r.date_closed == null || r.date_closed.Value >= qStart));

            var edQ  = educationRaw.Where(e => QuarterOf(e.record_date!.Value) == q).ToList();
            var hwQ  = healthRaw.Where(h => QuarterOf(h.record_date!.Value) == q).ToList();

            decimal? avgEd  = edQ.Count > 0 && edQ.Any(e => e.progress_percent.HasValue)
                ? (decimal)edQ.Where(e => e.progress_percent.HasValue).Average(e => (double)e.progress_percent!.Value)
                : null;
            decimal? avgAtt = edQ.Count > 0 && edQ.Any(e => e.attendance_rate.HasValue)
                ? (decimal)edQ.Where(e => e.attendance_rate.HasValue).Average(e => (double)e.attendance_rate!.Value)
                : null;
            decimal? avgHw  = hwQ.Count > 0 && hwQ.Any(h => h.general_health_score.HasValue)
                ? (decimal)hwQ.Where(h => h.general_health_score.HasValue).Average(h => (double)h.general_health_score!.Value)
                : null;
            decimal? avgNut = hwQ.Count > 0 && hwQ.Any(h => h.nutrition_score.HasValue)
                ? (decimal)hwQ.Where(h => h.nutrition_score.HasValue).Average(h => (double)h.nutrition_score!.Value)
                : null;

            return new ReportsQuarterlyOutcomeDto
            {
                quarter                  = $"Q{q} {year}",
                active_residents         = activeCount,
                avg_education_progress   = avgEd.HasValue ? Math.Round(avgEd.Value, 1) : null,
                avg_attendance_rate      = avgAtt.HasValue ? Math.Round(avgAtt.Value, 1) : null,
                avg_health_score         = avgHw.HasValue ? Math.Round(avgHw.Value, 1) : null,
                avg_nutrition_score      = avgNut.HasValue ? Math.Round(avgNut.Value, 1) : null,
                education_record_count   = edQ.Count,
                health_record_count      = hwQ.Count,
            };
        }).ToList();

        // ── Safehouse comparisons ────────────────────────────────────────────
        // Intervention plans joined through residents
        var interventionsByResident = await _context.intervention_plans
            .Where(ip => ip.created_at.HasValue && ip.created_at.Value.Year == year)
            .Select(ip => new { ip.resident_id, ip.status })
            .ToListAsync();

        var residentSafehouseMap = residentsAll
            .Where(r => r.safehouse_id.HasValue)
            .ToDictionary(r => r.resident_id, r => r.safehouse_id!.Value);

        // Home visitations per safehouse (through resident)
        var visitsByResident = await _context.home_visitations
            .Where(v => v.visit_date.HasValue && v.visit_date >= yearStart && v.visit_date <= yearEnd && v.resident_id > 0)
            .Select(v => new { v.resident_id })
            .ToListAsync();

        // Process recordings per safehouse (through resident)
        var recordingsByResident = await _context.process_recordings
            .Where(p => p.session_date.HasValue && p.session_date >= yearStart && p.session_date <= yearEnd)
            .Select(p => new { p.resident_id })
            .ToListAsync();

        // Incident reports per safehouse (direct safehouse_id)
        var incidentsBySafehouse = await _context.incident_reports
            .Where(i => i.incident_date.HasValue && i.incident_date >= yearStart && i.incident_date <= yearEnd)
            .Select(i => new { i.safehouse_id })
            .ToListAsync();

        var activeResidentsBySafehouse = residentsAll
            .Where(r => r.case_status == "Active" && r.safehouse_id.HasValue)
            .GroupBy(r => r.safehouse_id!.Value)
            .ToDictionary(g => g.Key, g => g.Count());

        var safehouseComparisons = safehousesAll.Select(s =>
        {
            var metrics = monthlyMetricsYear.Where(m => m.safehouse_id == s.safehouse_id).ToList();

            decimal? avgEd = null, avgHw = null;
            if (metrics.Any(m => m.avg_education_progress.HasValue))
            {
                var edRows = metrics.Where(m => m.avg_education_progress.HasValue).ToList();
                var totalWeight = edRows.Sum(m => m.active_residents ?? 1);
                avgEd = totalWeight > 0
                    ? Math.Round(edRows.Sum(m => m.avg_education_progress!.Value * (m.active_residents ?? 1)) / totalWeight, 1)
                    : edRows.Average(m => m.avg_education_progress!.Value);
            }
            if (metrics.Any(m => m.avg_health_score.HasValue))
            {
                var hwRows = metrics.Where(m => m.avg_health_score.HasValue).ToList();
                var totalWeight = hwRows.Sum(m => m.active_residents ?? 1);
                avgHw = totalWeight > 0
                    ? Math.Round(hwRows.Sum(m => m.avg_health_score!.Value * (m.active_residents ?? 1)) / totalWeight, 1)
                    : hwRows.Average(m => m.avg_health_score!.Value);
            }

            var activeCount = activeResidentsBySafehouse.TryGetValue(s.safehouse_id, out var ac) ? ac : 0;
            var capacity = s.capacity_girls;
            var occupancy = capacity.HasValue && capacity.Value > 0
                ? Math.Round((decimal)activeCount / capacity.Value, 3)
                : 0m;

            var safeResidentIds = residentsAll
                .Where(r => r.safehouse_id == s.safehouse_id)
                .Select(r => r.resident_id)
                .ToHashSet();

            var processCount = recordingsByResident.Count(p => safeResidentIds.Contains(p.resident_id));
            var visitCount   = visitsByResident.Count(v => safeResidentIds.Contains(v.resident_id));
            var incidentCount = incidentsBySafehouse.Count(i => i.safehouse_id == s.safehouse_id);

            var plansForSafehouse = interventionsByResident
                .Where(ip => safeResidentIds.Contains(ip.resident_id))
                .ToList();
            var plansActive    = plansForSafehouse.Count(ip => ip.status != "Completed" && ip.status != "Closed");
            var plansCompleted = plansForSafehouse.Count(ip => ip.status == "Completed" || ip.status == "Closed");

            var labelCode = !string.IsNullOrWhiteSpace(s.safehouse_code) ? s.safehouse_code
                          : s.name.Length > 14 ? s.name[..13] + "…"
                          : s.name;

            return new ReportsSafehouseComparisonDto
            {
                safehouse_id              = s.safehouse_id,
                safehouse_name            = s.name,
                safehouse_code            = labelCode,
                region                    = s.region,
                active_residents          = activeCount,
                capacity                  = capacity,
                occupancy_rate            = occupancy,
                avg_education_progress    = avgEd,
                avg_health_score          = avgHw,
                process_recording_count   = processCount,
                home_visitation_count     = visitCount,
                incident_count            = incidentCount,
                intervention_plans_active    = plansActive,
                intervention_plans_completed = plansCompleted,
            };
        }).ToList();

        // ── Reintegration ────────────────────────────────────────────────────
        var closedThisYear = residentsAll
            .Where(r => r.case_status == "Closed"
                     && r.date_closed.HasValue
                     && r.date_closed.Value >= yearStart
                     && r.date_closed.Value <= yearEnd)
            .ToList();

        var reintegratedCount = closedThisYear.Count(r => !string.IsNullOrWhiteSpace(r.reintegration_type));
        var reintegrationRate = closedThisYear.Count > 0
            ? Math.Round((decimal)reintegratedCount / closedThisYear.Count, 3)
            : 0m;

        var avgDaysToClose = 0m;
        var residentsWithDuration = closedThisYear
            .Where(r => r.date_of_admission.HasValue && r.date_closed.HasValue)
            .ToList();
        if (residentsWithDuration.Count > 0)
        {
            var totalDays = residentsWithDuration
                .Sum(r => (r.date_closed!.Value.ToDateTime(TimeOnly.MinValue)
                         - r.date_of_admission!.Value.ToDateTime(TimeOnly.MinValue)).TotalDays);
            avgDaysToClose = Math.Round((decimal)(totalDays / residentsWithDuration.Count), 0);
        }

        var byType = closedThisYear
            .GroupBy(r => string.IsNullOrWhiteSpace(r.reintegration_type) ? "Not Specified" : r.reintegration_type)
            .Select(g => new ReintegrationByTypeDto
            {
                reintegration_type = g.Key,
                count = g.Count(),
                rate  = closedThisYear.Count > 0
                    ? Math.Round((decimal)g.Count() / closedThisYear.Count, 3)
                    : 0m,
            })
            .OrderByDescending(x => x.count)
            .ToList();

        var reintegration = new ReportsReintegrationDto
        {
            total_closed       = closedThisYear.Count,
            total_reintegrated = reintegratedCount,
            reintegration_rate = reintegrationRate,
            by_type            = byType,
            avg_days_to_close  = avgDaysToClose,
        };

        // ── AAR totals (residents served = active at any point in year) ──────
        var totalResidentsServed = residentsAll.Count(r =>
            r.date_of_admission.HasValue &&
            r.date_of_admission.Value <= yearEnd &&
            (r.date_closed == null || r.date_closed.Value >= yearStart));

        var avgAttendanceRate = educationRaw.Count > 0 && educationRaw.Any(e => e.attendance_rate.HasValue)
            ? Math.Round((decimal)educationRaw.Where(e => e.attendance_rate.HasValue).Average(e => (double)e.attendance_rate!.Value), 1)
            : 0m;

        var aar = new ReportsAarDto
        {
            total_residents_served           = totalResidentsServed,
            new_admissions_in_year           = t_newAdmissions.Result,
            closed_cases_in_year             = t_closedCases.Result,
            active_residents_end_of_year     = t_activeEndOfYear.Result,
            medical_checkups_done            = t_medicalCheckups.Result,
            dental_checkups_done             = t_dentalCheckups.Result,
            psychological_checkups_done      = t_psychCheckups.Result,
            total_health_records             = t_totalHealthRecs.Result,
            students_enrolled                = t_studentsEnrolled.Result,
            students_completed               = t_studentsComplete.Result,
            avg_attendance_rate              = avgAttendanceRate,
            counseling_sessions_total        = t_counselingSess.Result,
            total_session_minutes            = t_sessionMinutes.Result,
            sessions_with_progress_noted     = t_progressNoted.Result,
            sessions_with_concerns_flagged   = t_concernsFlagged.Result,
            home_visitations_total           = t_homeVisits.Result,
            home_visitations_with_safety_concerns = t_homeVisitSafety.Result,
            incidents_total                  = t_incidents.Result,
            incidents_resolved               = t_incidentsRes.Result,
            total_monetary_received          = t_monetaryTotal.Result,
            total_in_kind_estimated          = t_inKindTotal.Result,
        };

        return new ReportsOverviewDto
        {
            year                   = year,
            donation_summary       = donationSummary,
            donation_trend         = donationTrend,
            quarterly_outcomes     = quarterlyOutcomes,
            safehouse_comparisons  = safehouseComparisons,
            reintegration          = reintegration,
            aar                    = aar,
            generated_at           = DateTime.UtcNow,
        };
    }
}
